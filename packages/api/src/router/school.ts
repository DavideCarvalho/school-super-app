import {
  addMinutes,
  format,
  getHours,
  getMinutes,
  setHours,
  setMinutes,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { z } from "zod";

import type {
  Subject,
  Teacher,
  TeacherAvailability,
  TeacherHasClass,
  User,
} from "@acme/db";
import { prisma } from "@acme/db";

import {
  createTRPCRouter,
  isUserLoggedInAndAssignedToSchool,
  publicProcedure,
} from "../trpc";
import { getUTCDate } from "../utils/get-utc-date";
import { hoursToDate } from "../utils/hours-to-date";

const scheduleConfigSchema = z.object({
  start: z.string(),
  numClasses: z.number(),
  duration: z.number(),
});

export const schoolRouter = createTRPCRouter({
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.school.findFirst({ where: { slug: input.slug } });
    }),
  generateSchoolCalendar: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        classId: z.string(),
        fixedClasses: z.array(z.string()),
        scheduleConfig: z.object({
          Monday: scheduleConfigSchema,
          Tuesday: scheduleConfigSchema,
          Wednesday: scheduleConfigSchema,
          Thursday: scheduleConfigSchema,
          Friday: scheduleConfigSchema,
        }),
        generationRules: z.object({
          subjectsQuantities: z.record(z.number()),
          subjectsExclusions: z.record(z.array(z.string())),
        }),
      }),
    )
    .query(async ({ ctx, input }) => {
      const schedule = generateSchoolSchedule(
        ctx.session.school.id,
        input.classId,
        input.fixedClasses,
        input.scheduleConfig,
        input.generationRules,
      );
      return schedule;
    }),
  saveSchoolCalendar: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        classId: z.string(),
        scheduleName: z.string(),
        classes: z.array(
          z.object({
            teacherHasClassId: z.string().optional(),
            classWeekDay: z.number().positive().min(0).max(6),
            startTime: z.date(),
            endTime: z.date(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.$transaction(async (tx) => {
        // Definir isActive como false para todos os calendários atuais da turma
        await tx.calendar.updateMany({
          where: {
            classId: input.classId,
            isActive: true,
          },
          data: {
            isActive: false,
          },
        });

        await tx.calendar.create({
          data: {
            classId: input.classId,
            name: `Calendário ${format(new Date(), "dd-MM-yyyy", { locale: ptBR })}`,
            isActive: true,
            CalendarSlot: {
              createMany: {
                data: input.classes.map((classToCreate) => ({
                  startTime: classToCreate.startTime,
                  endTime: classToCreate.endTime,
                  teacherHasClassId: classToCreate.teacherHasClassId,
                  classWeekDay: classToCreate.classWeekDay,
                  minutes:
                    Math.ceil(
                      (classToCreate.startTime.getTime() -
                        classToCreate.endTime.getTime()) /
                        (1000 * 60),
                    ) * -1,
                })),
              },
            },
          },
        });
      });
    }),
  getClassSchedule: publicProcedure
    .input(z.object({ classId: z.string() }))
    .query(async ({ ctx, input }) => {
      const calendarSlots = await ctx.prisma.calendarSlot.findMany({
        where: {
          Calendar: {
            classId: input.classId,
            isActive: true,
          },
        },
        include: {
          Calendar: {
            include: {
              Class: true,
            },
          },
          TeacherHasClass: {
            include: {
              Teacher: {
                include: {
                  Availabilities: true,
                  User: true,
                },
              },
              Subject: true,
              Class: true,
            },
          },
        },
      });
      return {
        Monday: calendarSlots.filter((slot) => slot.classWeekDay === 1),
        Tuesday: calendarSlots.filter((slot) => slot.classWeekDay === 2),
        Wednesday: calendarSlots.filter((slot) => slot.classWeekDay === 3),
        Thursday: calendarSlots.filter((slot) => slot.classWeekDay === 4),
        Friday: calendarSlots.filter((slot) => slot.classWeekDay === 5),
      };
    }),
});

type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

type GenerationRules = {
  subjectsQuantities: Record<string, number>; // Quantidade de aulas por matéria
  subjectsExclusions: Record<string, string[]>; // Matérias que não podem estar no mesmo dia
};

// Definição dos tipos
interface TimeSlot {
  startTime: Date;
  endTime: Date;
}

interface ScheduleEntry {
  TeacherHasClass?: {
    id: string;
    Teacher: Teacher & {
      Availabilities: TeacherAvailability[];
      User: User;
    };
    Subject: Subject;
  } | null;
  startTime: Date;
  endTime: Date;
}

type Schedule = {
  [key in DayOfWeek]: ScheduleEntry[];
};

interface SubjectWithRemainingLessons extends Subject {
  remainingLessons: number;
}

type ScheduleConfig = {
  [key in DayOfWeek]: {
    start: string;
    numClasses: number;
    duration: number;
  };
};

async function generateSchoolSchedule(
  schoolId: string,
  classId: string,
  fixedClasses: string[],
  scheduleConfig: ScheduleConfig,
  generationRules: GenerationRules,
): Promise<Schedule> {
  const teachers = await prisma.teacher.findMany({
    where: {
      User: {
        schoolId: schoolId,
      },
      Classes: {
        some: {
          classId: classId,
        },
      },
    },
    include: {
      Availabilities: true,
      Classes: true,
      User: true,
    },
  });

  shuffleArray(teachers);

  const subjectsWithLessons: SubjectWithRemainingLessons[] =
    await prisma.teacherHasClass
      .findMany({
        where: {
          classId: classId,
        },
        include: {
          Subject: true,
        },
      })
      .then((teacherHasClasses) =>
        teacherHasClasses.map((thc) => ({
          ...thc.Subject,
          subjectQuantity:
            generationRules.subjectsQuantities[thc.subjectId] ?? 0,
          remainingLessons:
            generationRules.subjectsQuantities[thc.subjectId] ?? 0,
        })),
      );

  const schedule = initializeSchedule(scheduleConfig);

  // Respeitar as aulas fixas
  for (const classKey of fixedClasses) {
    const [day, timeSlot, teacherId, subjectId] = classKey.split("_") as [
      DayOfWeek,
      string,
      string,
      string,
    ];
    const [startTime, endTime] = timeSlot.split("-") as [string, string];
    const startTimeDate = hoursToDate(startTime);
    const endTimeDate = hoursToDate(endTime);
    const formattedStartTime = format(startTimeDate, "HH:mm");
    const formattedEndTime = format(endTimeDate, "HH:mm");
    const teacher = teachers.find((t) => t.id === teacherId);
    const subject = subjectsWithLessons.find((s) => s.id === subjectId);

    if (!teacher || !subject) continue;

    const existingEntryIndex = schedule[day as DayOfWeek].findIndex(
      (entry) =>
        format(entry.startTime, "HH:mm") === formattedStartTime &&
        format(entry.endTime, "HH:mm") === formattedEndTime,
    );

    const teacherHasClass = await prisma.teacherHasClass.findFirst({
      where: {
        teacherId: teacher.id,
        classId: classId,
        subjectId: subject.id,
        isActive: true,
      },
      include: {
        Teacher: {
          include: {
            Availabilities: true,
            User: true,
          },
        },
        TeacherAvailability: true,
        Subject: true,
      },
    });

    console.log("existingEntryIndex", existingEntryIndex);
    if (existingEntryIndex !== -1) {
      schedule[day as DayOfWeek][existingEntryIndex] = {
        TeacherHasClass: teacherHasClass,
        startTime: hoursToDate(startTime),
        endTime: hoursToDate(endTime),
      };
    } else {
      // schedule[day as DayOfWeek].push({
      //   TeacherHasClass: teacherHasClass,
      //   startTime: hoursToDate(startTime),
      //   endTime: hoursToDate(endTime),
      // });
    }

    subject.remainingLessons--;
  }

  // Continuar a geração do calendário respeitando a configuração do horário e regras de geração
  for (const day of Object.keys(schedule)) {
    const dayAvailableTimeSlots = schedule[day as DayOfWeek];
    for (const [index, timeSlot] of dayAvailableTimeSlots.entries()) {
      if (timeSlot.TeacherHasClass != null) continue;
      for (const teacher of teachers) {
        const subject = findRandomSubjectForTeacher(
          teacher,
          subjectsWithLessons,
          day as DayOfWeek,
          timeSlot,
          schedule,
          generationRules.subjectsExclusions,
        );
        if (!subject) continue;

        const teacherHasClass = await prisma.teacherHasClass.findFirst({
          where: {
            teacherId: teacher.id,
            classId: classId,
            subjectId: subject.id,
            isActive: true,
          },
          include: {
            Teacher: {
              include: {
                Availabilities: true,
                User: true,
              },
            },
            TeacherAvailability: true,
            Subject: true,
          },
        });

        schedule[day as DayOfWeek][index] = {
          TeacherHasClass: teacherHasClass,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
        };

        subject.remainingLessons--;

        if (
          schedule[day as DayOfWeek].length ===
          scheduleConfig[day as DayOfWeek].numClasses
        ) {
          break;
        }
      }
    }
  }
  return schedule;
}

function generateTimeSlots(
  start: string,
  numClasses: number,
  duration: number,
): TimeSlot[] {
  const timeSlots: TimeSlot[] = [];
  let startTime = hoursToDate(start);

  for (let i = 0; i < numClasses; i++) {
    const endTime = addMinutes(startTime, duration);
    timeSlots.push({
      startTime: startTime,
      endTime: endTime,
    });
    startTime = setMinutes(
      setHours(startTime, getHours(endTime)),
      getMinutes(endTime),
    );
  }

  return timeSlots;
}

function initializeSchedule(scheduleConfig: ScheduleConfig): Schedule {
  const schedule: Schedule = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
  };
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  for (const day of daysOfWeek) {
    const dayConfig = scheduleConfig[day as DayOfWeek];
    const timeSlots = generateTimeSlots(
      dayConfig.start,
      dayConfig.numClasses,
      dayConfig.duration,
    );
    schedule[day as DayOfWeek] = timeSlots.map((slot) => ({
      startTime: slot.startTime,
      endTime: slot.endTime,
    }));
  }
  return schedule;
}

function findRandomSubjectForTeacher(
  teacher: Teacher & {
    Availabilities: TeacherAvailability[];
    Classes: TeacherHasClass[];
  },
  subjects: SubjectWithRemainingLessons[],
  day: DayOfWeek,
  timeSlot: TimeSlot,
  schedule: Schedule,
  subjectExclusions: Record<string, string[]>,
): SubjectWithRemainingLessons | null | undefined {
  const timeSlotStartTimeFormatted = format(timeSlot.startTime, "HH:mm");
  const timeSlotEndTimeFormatted = format(timeSlot.endTime, "HH:mm");
  // Verificar se o professor está disponível no dia e horário
  const availabilityForDay = teacher.Availabilities.some((avail) => {
    const availabilityStartTimeFormatted = format(avail.startTime, "HH:mm");
    const availabilityEndTimeFormatted = format(avail.endTime, "HH:mm");
    return (
      avail.day === day &&
      availabilityStartTimeFormatted <= timeSlotStartTimeFormatted &&
      availabilityEndTimeFormatted >= timeSlotEndTimeFormatted
    );
  });

  if (!availabilityForDay) return null;

  //TODO: problema depois daqui

  // Obter a programação do professor para o dia atual
  const teacherSchedule =
    schedule[day]?.filter(
      (entry) => entry?.TeacherHasClass?.Teacher?.id === teacher.id,
    ) || [];

  // Obter a última matéria agendada no dia
  const lastSubject = teacherSchedule.length
    ? teacherSchedule[teacherSchedule.length - 1]?.TeacherHasClass?.Subject
    : null;

  // Filtrar as matérias restantes do professor
  let eligibleSubjects = subjects.filter(
    (sub) =>
      teacher.Classes.some((thc) => thc.subjectId === sub.id) &&
      sub.remainingLessons > 0,
  );

  // Verificar as exclusões de matérias
  const existingSubjects = schedule[day]?.map(
    (entry) => entry.TeacherHasClass?.Subject?.id,
  ) as unknown as string[];
  if (subjectExclusions && existingSubjects) {
    eligibleSubjects = eligibleSubjects.filter((sub) => {
      const exclusions = subjectExclusions[sub.id] || [];
      const isExcludedByExisting = existingSubjects.some((existingSubId) =>
        (subjectExclusions[existingSubId] || []).includes(sub.id),
      );
      return (
        !exclusions.some((excluded) => existingSubjects.includes(excluded)) &&
        !isExcludedByExisting
      );
    });
  }

  // Priorizar a mesma matéria se houver espaço
  if (lastSubject) {
    const sameSubject = eligibleSubjects.find(
      (sub) => sub.id === lastSubject.id,
    );
    if (sameSubject) return sameSubject;
  }

  // Escolher aleatoriamente a partir das matérias restantes
  return eligibleSubjects.length > 0
    ? eligibleSubjects[Math.floor(Math.random() * eligibleSubjects.length)]
    : null;
}

// biome-ignore lint/suspicious/noExplicitAny: We don't need to know the type, we just need to shuffle the array
function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
