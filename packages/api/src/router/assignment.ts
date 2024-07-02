import { z } from "zod";

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
});
