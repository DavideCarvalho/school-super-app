import { z } from "zod";

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
            TeacherHasClassAcademicPeriod: {
              every: {
                academicPeriodId: latestAcademicPeriod.id,
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
            TeacherHasClassAcademicPeriod: {
              every: {
                academicPeriodId: latestAcademicPeriod.id,
              },
            },
            isActive: true,
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
        return ctx.prisma.assignment.findMany({
          where: {
            TeacherHasClass: {
              classId: input.classId,
              TeacherHasClassAcademicPeriod: {
                every: {
                  academicPeriodId: academicPeriod.id,
                },
              },
            },
          },
          include: {
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
          return;
        }
        const teacherHasClass = await ctx.prisma.teacherHasClass.findFirst({
          where: {
            teacherId: ctx.session.user.id,
            classId: input.classId,
            subjectId: input.subjectId,
            TeacherHasClassAcademicPeriod: {
              every: {
                academicPeriodId: academicPeriod.id,
              },
            },
          },
        });
        if (!teacherHasClass) {
          throw new Error("Professor não está na turma");
        }
        return ctx.prisma.assignment.create({
          data: {
            name: input.name,
            dueDate: input.dueDate,
            grade: input.grade,
            classId: input.classId,
            teacherHasClassId: teacherHasClass.id,
            description: input.description,
            academicPeriodId: academicPeriod.id,
          },
        });
      }),
});
