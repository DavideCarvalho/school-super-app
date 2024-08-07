import {
  addMinutes,
  addYears,
  endOfYear,
  format,
  getHours,
  getMinutes,
  isAfter,
  setHours,
  setMinutes,
  startOfYear,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import * as xlsx from "xlsx";
import { z } from "zod";

import type {
  CalendarSlot,
  Class,
  Subject,
  Teacher,
  TeacherAvailability,
  TeacherHasClass,
  User,
} from "@acme/db";
import { prisma } from "@acme/db";

import * as academicPeriodService from "../service/academicPeriod.service";
import {
  createTRPCRouter,
  isUserLoggedInAndAssignedToSchool,
  publicProcedure,
} from "../trpc";
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
          subjectsExclusions: z.record(z.array(z.string())),
        }),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { schedule, errors } = await generateSchoolSchedule(
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
        await tx.calendar.updateMany({
          where: {
            classId: input.classId,
            isActive: true,
          },
          data: {
            isActive: false,
          },
        });

        let academicPeriod =
          await academicPeriodService.getCurrentOrLastActiveAcademicPeriod(
            ctx.session.school.id,
          );

        if (!academicPeriod) {
          academicPeriod = await tx.academicPeriod.create({
            data: {
              startDate: new Date(),
              endDate: endOfYear(new Date()),
              isActive: true,
              schoolId: ctx.session.school.id,
            },
            include: {
              Holidays: true,
              WeekendClasses: true,
            },
          });
        }

        let newAcademicPeriod = academicPeriod ? { ...academicPeriod } : null;

        if (!newAcademicPeriod) {
          newAcademicPeriod = await tx.academicPeriod.create({
            data: {
              startDate: startOfYear(new Date()),
              endDate: endOfYear(new Date()),
              isActive: true,
              schoolId: ctx.session.school.id,
            },
            include: {
              Holidays: true,
              WeekendClasses: true,
            },
          });
        }

        if (isAfter(new Date(), academicPeriod.endDate)) {
          newAcademicPeriod = await tx.academicPeriod.create({
            data: {
              startDate: new Date(),
              endDate: addYears(new Date(), 1),
              isActive: true,
              schoolId: ctx.session.school.id,
            },
            include: {
              Holidays: true,
              WeekendClasses: true,
            },
          });
        }

        await tx.calendar.create({
          data: {
            classId: input.classId,
            name: `Calendário ${format(newAcademicPeriod.startDate, "dd-MM-yyyy", { locale: ptBR })} - ${format(newAcademicPeriod.endDate, "dd-MM-yyyy", { locale: ptBR })}`,
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
            academicPeriodId: newAcademicPeriod.id,
          },
        });

        // Se o período letivo for alterado
        // passar os alunos para o novo período letivo
        if (academicPeriod.id !== newAcademicPeriod.id) {
          const students = await tx.student.findMany({
            where: {
              User: {
                schoolId: ctx.session.school.id,
                active: true,
              },
              StudentHasAcademicPeriod: {
                every: {
                  academicPeriodId: academicPeriod.id,
                },
              },
            },
            include: {
              StudentHasAcademicPeriod: true,
            },
          });
          await tx.studentHasAcademicPeriod.createMany({
            data: students.map((student) => ({
              studentId: student.id,
              classId: academicPeriod
                ? student.StudentHasAcademicPeriod.find(
                    (s) => s.academicPeriodId === academicPeriod.id,
                  )?.classId
                : null,
              academicPeriodId: newAcademicPeriod.id,
            })),
          });
        }
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
  getXlsxWithAllTeachersClasses: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        classId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const academicPeriod =
        await academicPeriodService.getCurrentOrLastActiveAcademicPeriod(
          ctx.session.school.id,
        );
      if (!academicPeriod) {
        return;
      }
      function convertWeekDay(number: number) {
        const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
        return days[number - 1];
      }
      const teachers = await ctx.prisma.teacher.findMany({
        where: {
          Classes: {
            some: {
              CalendarSlot: {
                some: {
                  Calendar: {
                    academicPeriodId: academicPeriod.id,
                    classId: input.classId,
                  },
                },
              },
            },
          },
          User: {
            schoolId: ctx.session.school.id,
          },
        },
        include: {
          User: true,
        },
      });
      const dataByTeacher: Record<
        string,
        {
          name: string;
          slots: Record<string, { time: string; classAndSubject: string }[]>;
          classCount: Record<string, number>;
          totalClasses: number;
        }
      > = {};
      const dataByClass: Record<
        string,
        {
          name: string;
          slots: Record<string, { time: string; teacherAndSubject: string }[]>;
        }
      > = {};
      const calendarSlots = await ctx.prisma.calendarSlot.findMany({
        where: {
          Calendar: {
            academicPeriodId: academicPeriod.id,
            CalendarSlot: {
              some: {
                TeacherHasClass: {
                  classId: input.classId,
                },
              },
            },
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
                  User: true,
                },
              },
              Class: true,
              Subject: true,
            },
          },
        },
      });
      const slotsByWeekDay: Map<string, typeof calendarSlots> = new Map();
      for (const slot of calendarSlots) {
        const weekDay = convertWeekDay(slot.classWeekDay);
        if (!weekDay) continue;
        if (!slotsByWeekDay.has(weekDay)) {
          slotsByWeekDay.set(weekDay, []);
        }
        slotsByWeekDay.get(weekDay)?.push(slot);
      }
      for (const teacher of teachers) {
        for (const weekDay of slotsByWeekDay.keys()) {
          const slots = slotsByWeekDay.get(weekDay);
          if (!slots?.length) continue;
          for (const slot of slots) {
            const teacherId = teacher.id;
            const teacherName = teacher.User.name;
            const classId = slot.Calendar.classId;
            const className = slot.Calendar.Class.name;

            if (!dataByTeacher[teacherId]) {
              dataByTeacher[teacherId] = {
                name: teacherName,
                slots: {},
                classCount: {},
                totalClasses: 0,
              };
            }
            if (!dataByTeacher[teacherId].slots[weekDay]) {
              dataByTeacher[teacherId].slots[weekDay] = [];
            }
            if (!dataByTeacher[teacherId].classCount[className]) {
              dataByTeacher[teacherId].classCount[className] = 0;
            }

            if (!dataByClass[classId]) {
              dataByClass[classId] = {
                name: className,
                slots: {},
              };
            }
            if (!dataByClass[classId].slots[weekDay]) {
              dataByClass[classId].slots[weekDay] = [];
            }

            const startTime = format(slot.startTime, "HH:mm");
            const endTime = format(slot.endTime, "HH:mm");
            if (slot.TeacherHasClass?.Teacher?.id === teacher.id) {
              const subjectName = slot.TeacherHasClass.Subject.name;
              const className = slot.TeacherHasClass.Class.name;
              const classAndSubject = `${className} - ${subjectName}`;
              dataByTeacher[teacherId]?.slots[weekDay]?.push({
                time: `${startTime} - ${endTime}`,
                classAndSubject,
              });
              if (!dataByTeacher[teacherId].classCount[className]) {
                dataByTeacher[teacherId].classCount[className] = 0;
              }
              dataByTeacher[teacherId].classCount[className] += 1;
              dataByTeacher[teacherId].totalClasses += 1;
            } else {
              dataByTeacher[teacherId]?.slots[weekDay]?.push({
                time: `${startTime} - ${endTime}`,
                classAndSubject: "",
              });
            }

            if (slot.TeacherHasClass) {
              dataByClass[classId]?.slots[weekDay]?.push({
                time: `${startTime} - ${endTime}`,
                teacherAndSubject: `${teacherName} - ${slot.TeacherHasClass.Subject.name}`,
              });
            } else {
              dataByClass[classId]?.slots[weekDay]?.push({
                time: `${startTime} - ${endTime}`,
                teacherAndSubject: "",
              });
            }
          }
        }
      }

      const daysOfWeek = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
      const wb = xlsx.utils.book_new();

      for (const teacherId in dataByTeacher) {
        const teacher = dataByTeacher[teacherId];
        if (!teacher) continue;
        const allTimeSlots = new Set();
        const slots = teacher.slots;

        // Coletar todos os horários únicos
        for (const day of daysOfWeek) {
          if (slots[day]) {
            for (const slot of slots[day]) {
              allTimeSlots.add(slot.time);
            }
          }
        }

        const ws_data = [["Horário", ...daysOfWeek]];

        // Preencher as linhas com horários únicos e dados correspondentes
        for (const time of Array.from(allTimeSlots).sort() as string[]) {
          const row: string[] = [time];
          for (const day of daysOfWeek) {
            const slot = (slots[day] || []).find((s) => s.time === time);
            row.push(slot ? slot.classAndSubject : "");
          }
          ws_data.push(row);
        }

        const ws = xlsx.utils.aoa_to_sheet(ws_data);
        xlsx.utils.book_append_sheet(wb, ws, teacher.name);
      }

      for (const classId in dataByClass) {
        const clasz = dataByClass[classId];
        if (!clasz) continue;
        const allTimeSlots = new Set();
        const slots = clasz.slots;

        // Coletar todos os horários únicos
        for (const day of daysOfWeek) {
          if (slots[day]) {
            for (const slot of slots[day]) {
              allTimeSlots.add(slot.time);
            }
          }
        }

        const ws_data = [["Horário", ...daysOfWeek]];

        // Preencher as linhas com horários únicos e dados correspondentes
        for (const time of Array.from(allTimeSlots).sort() as string[]) {
          const row: string[] = [time];
          for (const day of daysOfWeek) {
            const slot = (slots[day] || []).find((s) => s.time === time);
            row.push(slot ? slot.teacherAndSubject : "");
          }
          ws_data.push(row);
        }

        const ws = xlsx.utils.aoa_to_sheet(ws_data);
        xlsx.utils.book_append_sheet(wb, ws, clasz.name);
      }

      const classNames = Object.values(dataByClass).map((c) => c.name);
      const teacherClassCountData = [["Sala", ...classNames, "Total de Aulas"]];
      const totalByClass: Record<string, number> = {};
      let totalOverall = 0;
      for (const teacherId in dataByTeacher) {
        const teacher = dataByTeacher[teacherId];
        if (!teacher) continue;
        const row = [teacher.name];
        for (const className of classNames) {
          const classCount = teacher.classCount[className] ?? 0;
          row.push(classCount.toString());
          totalByClass[className] = (totalByClass[className] || 0) + classCount;
        }
        row.push(teacher.totalClasses.toString());
        teacherClassCountData.push(row);
        totalOverall += teacher.totalClasses;
      }
      const totalRow = ["Total"];
      for (const className of classNames) {
        const classTotal = totalByClass[className] ?? 0;
        totalRow.push(classTotal.toString());
      }
      totalRow.push(totalOverall.toString());
      teacherClassCountData.push(totalRow);
      const ws_teacherClassCount = xlsx.utils.aoa_to_sheet(
        teacherClassCountData,
      );
      xlsx.utils.book_append_sheet(
        wb,
        ws_teacherClassCount,
        "Contagem de Aulas",
      );

      const buffer: Buffer = xlsx.write(wb, {
        type: "buffer",
        bookType: "xlsx",
      });
      return buffer.toString("base64");
    }),
});

type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

type GenerationRules = {
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
  subjectQuantity: number;
}

type ScheduleConfig = {
  [key in DayOfWeek]: {
    start: string;
    numClasses: number;
    duration: number;
  };
};

type ScheduleError = {
  message: string;
  subjectId?: string;
};

async function generateSchoolSchedule(
  schoolId: string,
  classId: string,
  fixedClasses: string[],
  scheduleConfig: ScheduleConfig,
  generationRules: GenerationRules,
): Promise<{ schedule: Schedule; errors: ScheduleError[] }> {
  let bestSchedule: Schedule | null = null;
  let fewestErrors: ScheduleError[] = [];

  const maxParallelAttempts = 3;
  const maxTotalAttempts = 3;
  let totalAttempts = 0;

  while (totalAttempts < maxTotalAttempts) {
    const schedulesWithErrors = await Promise.allSettled(
      Array.from({ length: maxParallelAttempts }).map(() =>
        tryGenerateSchoolSchedule(
          schoolId,
          classId,
          fixedClasses,
          scheduleConfig,
          generationRules,
        ),
      ),
    );

    for (const result of schedulesWithErrors) {
      if (result.status === "fulfilled") {
        const { schedule, errors } = result.value;

        if (errors.length === 0) {
          return { schedule, errors };
        }

        if (
          fewestErrors.length === 0 ||
          errors.length < fewestErrors.length ||
          (errors.length === fewestErrors.length &&
            getTotalRemainingLessons(errors) <
              getTotalRemainingLessons(fewestErrors))
        ) {
          bestSchedule = schedule;
          fewestErrors = errors;
        }
      }
    }

    totalAttempts++;
  }

  return { schedule: bestSchedule as Schedule, errors: fewestErrors };
}

async function tryGenerateSchoolSchedule(
  schoolId: string,
  classId: string,
  fixedClasses: string[],
  scheduleConfig: ScheduleConfig,
  generationRules: GenerationRules,
): Promise<{ schedule: Schedule; errors: ScheduleError[] }> {
  const errors: ScheduleError[] = [];

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
          subjectQuantity: thc.subjectQuantity,
          remainingLessons: thc.subjectQuantity,
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

    if (existingEntryIndex !== -1) {
      schedule[day as DayOfWeek][existingEntryIndex] = {
        TeacherHasClass: teacherHasClass,
        startTime: hoursToDate(startTime),
        endTime: hoursToDate(endTime),
      };
    }

    subject.remainingLessons--;
  }

  // Verificar os horários já ocupados pelos professores em outras turmas
  const occupiedSlots = await getOccupiedSlotsForTeachers(
    schoolId,
    teachers,
    classId,
  );

  // Continuar a geração do calendário respeitando a configuração do horário e regras de geração
  for (const day of Object.keys(schedule)) {
    const dayAvailableTimeSlots = schedule[day as DayOfWeek];
    for (const [index, timeSlot] of dayAvailableTimeSlots.entries()) {
      if (timeSlot.TeacherHasClass != null) continue;

      for (const teacher of teachers) {
        if (
          isSlotOccupied(occupiedSlots, teacher.id, day as DayOfWeek, timeSlot)
        )
          continue;

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

  // Verificar matérias ainda faltando e adicionar erros
  for (const subject of subjectsWithLessons) {
    if (subject.remainingLessons > 0) {
      errors.push({
        message: `A matéria ${subject.name} está faltando ${subject.remainingLessons} aulas porque o professor não tem mais horário disponível.`,
        subjectId: subject.id,
      });
    }
  }

  // Verificar se há mais matérias do que o possível para a grade
  const totalAvailableSlots = Object.values(scheduleConfig).reduce(
    (total, dayConfig) => total + dayConfig.numClasses,
    0,
  );
  const totalRequiredLessons = subjectsWithLessons.reduce(
    (total, subject) => total + subject.subjectQuantity,
    0,
  );

  if (totalRequiredLessons > totalAvailableSlots) {
    const notScheduledSubjects = subjectsWithLessons
      .filter((subject) => subject.remainingLessons > 0)
      .map((subject) => subject.name)
      .join(", ");
    errors.push({
      message: `Você colocou mais matérias (${totalRequiredLessons}) do que o possível para essa grade (${totalAvailableSlots}). As matérias que ficaram de fora ou não tiveram todas as aulas alocadas são: ${notScheduledSubjects}.`,
    });
  }

  return { schedule, errors };
}

async function getOccupiedSlotsForTeachers(
  schoolId: string,
  teachers: Array<Teacher & { Classes: TeacherHasClass[] }>,
  classId: string,
): Promise<Record<string, Record<DayOfWeek, TimeSlot[]>>> {
  const occupiedSlots: Record<string, Record<DayOfWeek, TimeSlot[]>> = {};

  for (const teacher of teachers) {
    const teacherId = teacher.id;
    occupiedSlots[teacherId] = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
    };

    const teacherHasClasses = await prisma.teacherHasClass.findMany({
      where: {
        teacherId,
        isActive: true,
        Class: {
          schoolId,
        },
      },
      include: {
        CalendarSlot: {
          include: {
            Calendar: true,
          },
        },
      },
    });

    for (const teacherHasClass of teacherHasClasses) {
      for (const slot of teacherHasClass.CalendarSlot) {
        if (slot.Calendar.classId === classId) continue;
        const day = dayOfWeekFromInt(slot.classWeekDay) as DayOfWeek;
        const timeSlot: TimeSlot = {
          startTime: slot.startTime,
          endTime: slot.endTime,
        };
        occupiedSlots[teacherId][day].push(timeSlot);
      }
    }
  }

  return occupiedSlots;
}

function dayOfWeekFromInt(dayInt: number): string {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[dayInt];
}

function isSlotOccupied(
  occupiedSlots: Record<string, Record<DayOfWeek, TimeSlot[]>>,
  teacherId: string,
  day: DayOfWeek,
  timeSlot: TimeSlot,
): boolean {
  const teacherSlots = occupiedSlots[teacherId]?.[day] || [];
  const formattedStartTime = format(timeSlot.startTime, "HH:mm");
  const formattedEndTime = format(timeSlot.endTime, "HH:mm");
  return teacherSlots.some(
    (slot) =>
      (formattedStartTime >= format(slot.startTime, "HH:mm") &&
        formattedStartTime < format(slot.endTime, "HH:mm")) ||
      (formattedEndTime > format(slot.startTime, "HH:mm") &&
        formattedEndTime <= format(slot.endTime, "HH:mm")) ||
      (formattedStartTime <= format(slot.startTime, "HH:mm") &&
        formattedEndTime >= format(slot.endTime, "HH:mm")),
  );
}

function getTotalRemainingLessons(errors: ScheduleError[]): number {
  return errors.reduce((total, error) => {
    const match = error.message.match(/faltando (\d+) aulas/);
    return match?.[1] ? total + Number.parseInt(match[1], 10) : total;
  }, 0);
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

  // Obter a programação do professor para o dia atual
  const teacherSchedule =
    schedule[day]?.filter(
      (entry) => entry?.TeacherHasClass?.Teacher?.id === teacher.id,
    ) || [];

  // Obter a última matéria agendada no dia
  const lastSubject = teacherSchedule.length
    ? teacherSchedule[teacherSchedule.length - 1]?.TeacherHasClass?.Subject
    : null;

  // Verificar se o professor já tem duas aulas consecutivas da mesma matéria
  const consecutiveClasses = teacherSchedule.reduce((count, entry) => {
    if (entry.TeacherHasClass?.Subject?.id === lastSubject?.id) {
      return count + 1;
    }
    return 0;
  }, 0);

  if (consecutiveClasses >= 2) {
    return null;
  }

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

  // Priorizar encaixar as matérias para evitar janelas
  eligibleSubjects.sort((a, b) => {
    const aClassIndex = teacher.Classes.findIndex(
      (thc) => thc.subjectId === a.id,
    );
    const bClassIndex = teacher.Classes.findIndex(
      (thc) => thc.subjectId === b.id,
    );
    const aHasAdjacent = teacherSchedule.some(
      (entry, index, array) =>
        entry.TeacherHasClass?.Subject?.id === a.id &&
        ((index > 0 &&
          array[index - 1]?.TeacherHasClass?.Subject?.id === a.id) ||
          (index < array.length - 1 &&
            array[index + 1]?.TeacherHasClass?.Subject?.id === a.id)),
    );
    const bHasAdjacent = teacherSchedule.some(
      (entry, index, array) =>
        entry.TeacherHasClass?.Subject?.id === b.id &&
        ((index > 0 &&
          array[index - 1]?.TeacherHasClass?.Subject?.id === b.id) ||
          (index < array.length - 1 &&
            array[index + 1]?.TeacherHasClass?.Subject?.id === b.id)),
    );
    if (aHasAdjacent && !bHasAdjacent) return -1;
    if (!aHasAdjacent && bHasAdjacent) return 1;
    return aClassIndex - bClassIndex;
  });

  return eligibleSubjects.length > 0 ? eligibleSubjects[0] : null;
}

// biome-ignore lint/suspicious/noExplicitAny: We don't need to know the type, we just need to shuffle the array
function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
