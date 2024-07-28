import { TRPCError } from "@trpc/server";
import { z } from "zod";

import type { Subject, Teacher, TeacherHasClass, User } from "@acme/db";

import * as academicPeriodService from "../service/academicPeriod.service";
import { createTRPCRouter, isUserLoggedInAndAssignedToSchool } from "../trpc";

export const attendanceRouter = createTRPCRouter({
  getClassAttendanceForCurrentAcademicPeriod: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        classId: z.string(),
        subjectId: z.string(),
        limit: z.number().optional().default(5),
        page: z.number().optional().default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Obter o período acadêmico atual ou o último ativo
      const academicPeriod =
        await academicPeriodService.getCurrentOrLastActiveAcademicPeriod(
          ctx.session.school.id,
        );

      if (!academicPeriod) {
        return {
          totalAttendanceQuantity: 0,
          studentsAttendance: [],
        };
      }

      // Consultar alunos matriculados no período acadêmico
      const students = await ctx.prisma.student.findMany({
        where: {
          StudentHasAcademicPeriod: {
            some: {
              academicPeriodId: academicPeriod.id,
            },
          },
        },
        include: {
          User: true,
          StudentHasAttendance: {
            include: {
              Student: {
                include: {
                  User: true,
                },
              },
              Attendance: {
                include: {
                  CalendarSlot: {
                    include: {
                      TeacherHasClass: {
                        where: {
                          classId: input.classId,
                          subjectId: input.subjectId,
                        },
                        include: {
                          Subject: true,
                          Teacher: {
                            include: {
                              User: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      });

      // Estrutura para armazenar os dados de presença
      const attendanceData: {
        Student: (typeof students)[0];
        totalAttendancePercentage: number;
        totalAttendanceNumber: number;
        attendancePerTeacherHasClass: {
          TeacherHasClass: TeacherHasClass & {
            Subject: Subject;
            Teacher: Teacher & {
              User: User;
            };
          };
          attendancePercentage: number;
          attendanceNumber: number;
        }[];
      }[] = [];

      const totalAttendances = await ctx.prisma.attendance.count({
        where: {
          CalendarSlot: {
            Calendar: {
              academicPeriodId: academicPeriod.id,
            },
          },
        },
      });

      // Processamento dos dados de presença para cada aluno
      for (const student of students) {
        const totalAttendanceMap = new Map<
          string,
          {
            TeacherHasClass: TeacherHasClass & {
              Subject: Subject;
              Teacher: Teacher & {
                User: User;
              };
            };
            attendanceNumber: number;
          }
        >();

        const totalStudentAttendanceNumber =
          await ctx.prisma.studentHasAttendance.count({
            where: {
              studentId: student.id,
              present: true,
              Attendance: {
                CalendarSlot: {
                  Calendar: {
                    academicPeriodId: academicPeriod.id,
                  },
                },
              },
            },
          });

        const calendarSlotsForCurrentAcademicPeriod =
          await ctx.prisma.calendarSlot.findMany({
            where: {
              Calendar: {
                academicPeriodId: academicPeriod.id,
              },
              teacherHasClassId: {
                not: null,
              },
            },
            include: {
              Calendar: true,
              TeacherHasClass: {
                include: {
                  Subject: true,
                  Teacher: {
                    include: {
                      User: true,
                    },
                  },
                },
              },
              Attendance: true,
            },
          });

        for (const calendarSlot of calendarSlotsForCurrentAcademicPeriod) {
          const { TeacherHasClass } = calendarSlot;

          if (TeacherHasClass) {
            const key = TeacherHasClass.id;

            if (!totalAttendanceMap.has(key)) {
              totalAttendanceMap.set(key, {
                TeacherHasClass: TeacherHasClass,
                attendanceNumber: calendarSlot.Attendance.length,
              });
            }
          }
        }

        const attendancePerTeacherHasClass = [];

        for (const [key, value] of totalAttendanceMap) {
          const calendarSlot = await ctx.prisma.calendarSlot.findFirst({
            where: {
              teacherHasClassId: value.TeacherHasClass.id,
              Calendar: {
                academicPeriodId: academicPeriod.id,
              },
            },
            include: {
              Calendar: true,
              TeacherHasClass: {
                include: {
                  Subject: true,
                  Teacher: {
                    include: {
                      User: true,
                    },
                  },
                },
              },
            },
          });

          if (!calendarSlot || !calendarSlot.TeacherHasClass) {
            continue;
          }

          const attendanceQuantityForThisCalendarSlot =
            await ctx.prisma.attendance.count({
              where: {
                calendarSlotId: calendarSlot.id,
              },
            });

          const studentAttendanceQuantityForThisCalendarSlot =
            await ctx.prisma.studentHasAttendance.count({
              where: {
                Attendance: {
                  calendarSlotId: calendarSlot.id,
                },
                present: true,
                studentId: student.id,
              },
            });

          const attendancePercentage =
            attendanceQuantityForThisCalendarSlot > 0
              ? (studentAttendanceQuantityForThisCalendarSlot /
                  attendanceQuantityForThisCalendarSlot) *
                100
              : 0;

          attendancePerTeacherHasClass.push({
            TeacherHasClass: calendarSlot.TeacherHasClass,
            attendancePercentage,
            attendanceNumber: studentAttendanceQuantityForThisCalendarSlot,
          });
        }

        const totalAttendancePercentage =
          totalAttendances > 0
            ? (totalStudentAttendanceNumber / totalAttendances) * 100
            : 0;

        attendanceData.push({
          Student: student,
          totalAttendancePercentage,
          totalAttendanceNumber: totalStudentAttendanceNumber,
          attendancePerTeacherHasClass,
        });
      }
      return {
        totalAttendanceQuantity: totalAttendances,
        studentsAttendance: attendanceData,
      };
    }),

  saveClassAttendance: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        classId: z.string(),
        subjectId: z.string(),
        date: z.date(),
        note: z.string().optional(),
        attendance: z.array(
          z.object({
            studentId: z.string(),
            attendance: z.boolean(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.$transaction(async (tx) => {
        const academicPeriod =
          await academicPeriodService.getCurrentOrLastActiveAcademicPeriod(
            ctx.session.school.id,
          );
        if (!academicPeriod) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Não há período letivo ativo",
          });
        }
        const teacherHasClass = await ctx.prisma.teacherHasClass.findFirst({
          where: {
            classId: input.classId,
            isActive: true,
            CalendarSlot: {
              some: {
                Calendar: {
                  academicPeriodId: academicPeriod.id,
                },
              },
            },
            Teacher: {
              User: {
                schoolId: ctx.session.school.id,
              },
            },
            Subject: {
              id: input.subjectId,
            },
          },
        });

        if (!teacherHasClass) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Teacher not found",
          });
        }

        const teacherHasClassCalendarSlot =
          await ctx.prisma.calendarSlot.findFirst({
            where: {
              teacherHasClassId: teacherHasClass.id,
              Calendar: {
                academicPeriodId: academicPeriod.id,
              },
            },
            include: {
              Calendar: true,
            },
          });

        if (!teacherHasClassCalendarSlot) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Calendar slot not found",
          });
        }

        await tx.attendance.create({
          data: {
            calendarSlotId: teacherHasClassCalendarSlot.id,
            date: input.date,
            note: "",
            StudentHasAttendance: {
              createMany: {
                data: input.attendance.map((attendance) => ({
                  studentId: attendance.studentId,
                  present: attendance.attendance,
                })),
              },
            },
          },
        });
      });
    }),
  getAttendances: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        classId: z.string(),
        subjectId: z.string(),
        limit: z.number().optional().default(5),
        page: z.number().optional().default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.attendance.findMany({
        where: {
          CalendarSlot: {
            Calendar: {
              classId: input.classId,
              isActive: true,
            },
            TeacherHasClass: {
              subjectId: input.subjectId,
            },
          },
          StudentHasAttendance: {
            some: {
              Student: {
                User: {
                  schoolId: ctx.session.school.id,
                },
              },
            },
          },
        },
        take: input.limit,
        skip: (input.page - 1) * input.limit,
      });
    }),
  countAttendances: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        classId: z.string(),
        subjectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.attendance.count({
        where: {
          CalendarSlot: {
            Calendar: {
              classId: input.classId,
              isActive: true,
            },
            TeacherHasClass: {
              subjectId: input.subjectId,
            },
          },
        },
      });
    }),
});
