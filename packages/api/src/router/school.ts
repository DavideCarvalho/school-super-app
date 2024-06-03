import { z } from "zod";

import type {
  Subject,
  Teacher,
  TeacherAvailability,
  TeacherHasSubject,
  User,
} from "@acme/db";
import { prisma } from "@acme/db";

import {
  createTRPCRouter,
  isUserLoggedInAndAssignedToSchool,
  publicProcedure,
} from "../trpc";

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
      }),
    )
    .query(async ({ ctx, input }) => {
      const schedule = generateSchoolSchedule(
        ctx.session.school.id,
        input.classId,
        input.fixedClasses,
        input.scheduleConfig,
      );
      return schedule;
    }),
  saveSchoolCalendar: publicProcedure
    .input(
      z.array(
        z.object({
          teacherId: z.string(),
          classId: z.string(),
          subjectId: z.string(),
          classWeekDay: z.string(),
          classTime: z.string(),
          startTime: z.string(),
          endTime: z.string(),
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.$transaction(async (tx) => {
        const classIds = input.map(({ classId }) => classId);
        await tx.teacherHasClass.updateMany({
          data: {
            active: false,
          },
          where: {
            classId: {
              in: classIds,
            },
          },
        });
        for (const classToCreate of input) {
          const teacherAvailability = await tx.teacherAvailability.findFirst({
            where: {
              teacherId: classToCreate.teacherId,
              day: classToCreate.classWeekDay,
            },
          });
          if (!teacherAvailability) continue;
          await tx.teacherHasClass.create({
            data: {
              teacherId: classToCreate.teacherId,
              classId: classToCreate.classId,
              subjectId: classToCreate.subjectId,
              classWeekDay: classToCreate.classWeekDay,
              classTime: classToCreate.classTime,
              startTime: classToCreate.startTime,
              endTime: classToCreate.endTime,
              teacherAvailabilityId: teacherAvailability.id,
            },
          });
        }
      });
    }),
  getClassSchedule: publicProcedure
    .input(z.object({ classId: z.string() }))
    .query(async ({ ctx, input }) => {
      const lessons = await ctx.prisma.teacherHasClass.findMany({
        where: {
          classId: input.classId,
          active: true,
        },
        include: {
          Teacher: {
            include: {
              TeacherAvailability: true,
              User: true,
            },
          },
          Subject: true,
        },
      });
      function getScheduleData(dayLessons: typeof lessons): ScheduleEntry[] {
        return dayLessons.map((lesson) => {
          const response: ScheduleEntry = {
            Teacher: {
              id: lesson.Teacher.id,
              TeacherAvailability: lesson.Teacher.TeacherAvailability.map(
                (availability) => {
                  return {
                    id: availability.id,
                    startTime: availability.startTime,
                    endTime: availability.endTime,
                    day: availability.day,
                    teacherId: availability.teacherId,
                    createdAt: availability.createdAt,
                    updatedAt: availability.updatedAt,
                  };
                },
              ),
              TeacherHasSubject: [],
              User: {
                id: lesson.Teacher.User.id,
                name: lesson.Teacher.User.name,
                email: lesson.Teacher.User.email,
                schoolId: lesson.Teacher.User.schoolId,
                roleId: lesson.Teacher.User.roleId,
                createdAt: lesson.Teacher.User.createdAt,
                updatedAt: lesson.Teacher.User.updatedAt,
                slug: lesson.Teacher.User.slug,
                teacherId: lesson.Teacher.id,
              },
            },
            Subject: lesson.Subject,
            startTime: lesson.startTime,
            endTime: lesson.endTime,
          };
          return response;
        });
      }
      const response: Schedule = {
        Monday: getScheduleData(
          lessons.filter(
            (lesson) => lesson.classWeekDay.toUpperCase() === "MONDAY",
          ),
        ),
        Tuesday: getScheduleData(
          lessons.filter(
            (lesson) => lesson.classWeekDay.toUpperCase() === "TUESDAY",
          ),
        ),
        Wednesday: getScheduleData(
          lessons.filter(
            (lesson) => lesson.classWeekDay.toUpperCase() === "WEDNESDAY",
          ),
        ),
        Thursday: getScheduleData(
          lessons.filter(
            (lesson) => lesson.classWeekDay.toUpperCase() === "THURSDAY",
          ),
        ),
        Friday: getScheduleData(
          lessons.filter(
            (lesson) => lesson.classWeekDay.toUpperCase() === "FRIDAY",
          ),
        ),
      };
      return response;
    }),
});

type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

// Definição dos tipos
interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface ScheduleEntry {
  Teacher:
    | (Teacher & {
        TeacherAvailability: TeacherAvailability[];
        TeacherHasSubject: TeacherHasSubject[];
        User: User;
      })
    | null;
  Subject: Subject | null;
  startTime: string;
  endTime: string;
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
): Promise<Schedule> {
  const teachers = await prisma.teacher.findMany({
    where: {
      User: {
        schoolId,
      },
      TeacherAvailability: {
        some: {
          Teacher: {
            TeacherHasSubject: {
              some: {
                classId,
              },
            },
          },
        },
      },
    },
    include: {
      TeacherAvailability: true,
      TeacherHasSubject: true,
      User: true,
    },
  });

  shuffleArray(teachers);

  const subjects = await prisma.subject.findMany({
    where: {
      schoolId,
    },
  });

  const subjectsWithLessons: SubjectWithRemainingLessons[] = subjects.map(
    (sub) => ({
      ...sub,
      remainingLessons: sub.quantityNeededScheduled,
    }),
  );

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
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
    const teacher = teachers.find((t) => t.id === teacherId);
    const subject = subjectsWithLessons.find((s) => s.id === subjectId);

    if (!teacher || !subject) continue;

    const existingEntryIndex = schedule[day as DayOfWeek].findIndex(
      (entry) => entry.startTime === startTime && entry.endTime === endTime,
    );

    if (existingEntryIndex !== -1) {
      schedule[day as DayOfWeek][existingEntryIndex] = {
        Teacher: teacher,
        Subject: subject,
        startTime: startTime,
        endTime: endTime,
      };
    } else {
      schedule[day as DayOfWeek].push({
        Teacher: teacher,
        Subject: subject,
        startTime: startTime,
        endTime: endTime,
      });
    }

    subject.remainingLessons--;
  }

  // Continuar a geração do calendário respeitando a configuração do horário
  for (const day of daysOfWeek) {
    const dayConfig = scheduleConfig[day as DayOfWeek];
    if (!dayConfig) continue; // Ignorar dias sem configuração

    const timeSlots = generateTimeSlots(
      dayConfig.start,
      dayConfig.numClasses,
      dayConfig.duration,
    );

    for (const timeSlot of timeSlots) {
      for (const teacher of teachers) {
        const existingEntryIndex = schedule[day as DayOfWeek].findIndex(
          (entry) =>
            entry.startTime === timeSlot.startTime &&
            entry.endTime === timeSlot.endTime,
        );

        const subject = findRandomSubjectForTeacher(
          teacher,
          subjectsWithLessons,
          day as DayOfWeek,
          timeSlot,
          schedule,
        );
        if (!subject) continue;

        if (existingEntryIndex !== -1) {
          if (schedule[day as DayOfWeek][existingEntryIndex]?.Teacher) {
            continue;
          }
          schedule[day as DayOfWeek][existingEntryIndex] = {
            Teacher: teacher,
            Subject: subject,
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime,
          };
        } else {
          schedule[day as DayOfWeek].push({
            Teacher: teacher,
            Subject: subject,
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime,
          });
        }

        subject.remainingLessons--;
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
  let startTime = new Date(`1970-01-01T${start}:00`);

  for (let i = 0; i < numClasses; i++) {
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
    timeSlots.push({
      startTime: startTime.toTimeString().substring(0, 5),
      endTime: endTime.toTimeString().substring(0, 5),
    });
    startTime = endTime;
  }

  return timeSlots;
}

function initializeSchedule(scheduleConfig: ScheduleConfig): Schedule {
  // @ts-expect-error
  const schedule: Schedule = {};
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
      Teacher: null,
      Subject: null,
    }));
  }

  return schedule;
}

function findRandomSubjectForTeacher(
  teacher: Teacher & {
    TeacherAvailability: TeacherAvailability[];
    TeacherHasSubject: TeacherHasSubject[];
  },
  subjects: SubjectWithRemainingLessons[],
  day: DayOfWeek,
  timeSlot: TimeSlot,
  schedule: Schedule,
): SubjectWithRemainingLessons | null | undefined {
  // Verificar se o professor está disponível no dia e horário
  const availabilityForDay = teacher.TeacherAvailability.some(
    (avail) =>
      avail.day === day &&
      avail.startTime <= timeSlot.startTime &&
      avail.endTime >= timeSlot.endTime,
  );

  if (!availabilityForDay) return null;

  // Obter a programação do professor para o dia atual
  const teacherSchedule =
    schedule[day]?.filter((entry) => entry?.Teacher?.id === teacher.id) || [];

  // Obter a última matéria agendada no dia
  const lastSubject = teacherSchedule.length
    ? teacherSchedule[teacherSchedule.length - 1]?.Subject
    : null;

  // Filtrar as matérias restantes do professor
  const eligibleSubjects = subjects.filter(
    (sub) =>
      teacher.TeacherHasSubject.some((ths) => ths.subjectId === sub.id) &&
      sub.remainingLessons > 0,
  );

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
