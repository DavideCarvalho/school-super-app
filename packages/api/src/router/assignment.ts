import { TRPCError } from "@trpc/server";
import { z } from "zod";

import type { Assignment, StudentHasAssignment } from "@acme/db";

import * as academicPeriodService from "../service/academicPeriod.service";
import { createTRPCRouter, isUserLoggedInAndAssignedToSchool } from "../trpc";

export const assignmentRouter = createTRPCRouter({
  getCurrentAcademicPeriodAssignments: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        classId: z.string(),
        limit: z.number().optional().default(5),
        page: z.number().optional().default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const latestAcademicPeriod = await ctx.prisma.academicPeriod.findFirst({
        where: {
          schoolId: ctx.session.school.id,
        },
        orderBy: {
          startDate: "desc",
        },
      });
      if (!latestAcademicPeriod) {
        return [];
      }
      return ctx.prisma.assignment.findMany({
        where: {
          TeacherHasClass: {
            classId: input.classId,
            CalendarSlot: {
              every: {
                Calendar: {
                  academicPeriodId: latestAcademicPeriod.id,
                  isActive: true,
                },
              },
            },
          },
          academicPeriodId: latestAcademicPeriod.id,
        },
        take: input.limit,
        skip: (input.page - 1) * input.limit,
        include: {
          TeacherHasClass: {
            include: {
              Subject: true,
            },
          },
          StudentHasAssignment: {
            include: {
              Student: {
                include: {
                  User: true,
                },
              },
            },
          },
        },
      });
    }),
  countCurrentAcademicPeriodAssignments: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        classId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const latestAcademicPeriod = await ctx.prisma.academicPeriod.findFirst({
        where: {
          schoolId: ctx.session.school.id,
        },
        orderBy: {
          startDate: "desc",
        },
      });
      if (!latestAcademicPeriod) {
        return 0;
      }
      return ctx.prisma.assignment.count({
        where: {
          TeacherHasClass: {
            teacherId: ctx.session.user.id,
            classId: input.classId,
            CalendarSlot: {
              every: {
                Calendar: {
                  academicPeriodId: latestAcademicPeriod.id,
                  isActive: true,
                },
              },
            },
          },
          academicPeriodId: latestAcademicPeriod.id,
        },
      });
    }),
  getStudentsAssignmentsGradesForClassOnCurrentAcademicPeriod:
    isUserLoggedInAndAssignedToSchool
      .input(
        z.object({
          classId: z.string(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const academicPeriod =
          await academicPeriodService.getCurrentOrLastActiveAcademicPeriod();
        if (!academicPeriod) {
          return [];
        }
        const students = await ctx.prisma.student.findMany({
          where: {
            User: {
              schoolId: ctx.session.school.id,
            },
            StudentHasAcademicPeriod: {
              every: {
                academicPeriodId: academicPeriod.id,
              },
            },
          },
          include: {
            User: true,
            StudentHasAssignment: {
              include: {
                Assignment: true,
              },
            },
          },
        });
        const assignments = await ctx.prisma.assignment.findMany({
          where: {
            TeacherHasClass: {
              classId: input.classId,
              CalendarSlot: {
                every: {
                  Calendar: {
                    academicPeriodId: academicPeriod.id,
                  },
                },
              },
            },
          },
        });
        return students.map((student) => {
          const grades: {
            Assignment: Assignment;
            StudentHasAssignment: StudentHasAssignment | null;
          }[] = [];
          for (const assignment of assignments) {
            const studentHasAssignment =
              student.StudentHasAssignment.find(
                (sha) => sha.Assignment.id === assignment.id,
              ) ?? null;
            grades.push({
              Assignment: assignment,
              StudentHasAssignment: studentHasAssignment,
            });
          }
          return {
            ...student,
            grades,
          };
        });
      }),
  createAssignmentForClassOnCurrentAcademicPeriod:
    isUserLoggedInAndAssignedToSchool
      .input(
        z.object({
          name: z.string(),
          dueDate: z.date(),
          grade: z.number().min(0),
          classId: z.string(),
          subjectId: z.string(),
          description: z.string().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const academicPeriod =
          await academicPeriodService.getCurrentOrLastActiveAcademicPeriod();
        if (!academicPeriod) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Não há período letivo ativo",
          });
        }
        if (academicPeriod.isClosed) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "O período letivo já está encerrado",
          });
        }
        const teacherHasClass = await ctx.prisma.teacherHasClass.findFirst({
          where: {
            teacherId: ctx.session.user.id,
            classId: input.classId,
            subjectId: input.subjectId,
            CalendarSlot: {
              every: {
                Calendar: {
                  academicPeriodId: academicPeriod.id,
                },
              },
            },
          },
          include: {
            CalendarSlot: {
              where: {
                TeacherHasClass: {
                  teacherId: ctx.session.user.id,
                  classId: input.classId,
                  subjectId: input.subjectId,
                },
                Calendar: {
                  academicPeriodId: academicPeriod.id,
                },
              },
              include: {
                Calendar: {
                  include: {
                    AcademicPeriod: true,
                  },
                },
              },
            },
          },
        });
        if (!teacherHasClass) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Professor não está na turma",
          });
        }
        if (teacherHasClass.CalendarSlot[0]) {
          if (
            teacherHasClass.CalendarSlot[0].Calendar.AcademicPeriod.isClosed
          ) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "O período letivo já está fechado",
            });
          }
        }
        return ctx.prisma.assignment.create({
          data: {
            name: input.name,
            dueDate: input.dueDate,
            grade: input.grade,
            teacherHasClassId: teacherHasClass.id,
            description: input.description,
            academicPeriodId: academicPeriod.id,
          },
        });
      }),
});
