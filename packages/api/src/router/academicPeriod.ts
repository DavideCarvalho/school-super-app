import { z } from "zod";

import * as academicPeriodService from "../service/academicPeriod.service";
import { createTRPCRouter, isUserLoggedInAndAssignedToSchool } from "../trpc";

export const academicPeriodRouter = createTRPCRouter({
  allBySchoolId: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        page: z.number().optional().default(1),
        size: z.number().optional().default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.academicPeriod.findMany({
        where: {
          schoolId: ctx.session.school.id,
        },
        take: input.size,
        skip: (input.page - 1) * input.size,
      });
    }),
  countAllBySchoolId: isUserLoggedInAndAssignedToSchool.query(
    async ({ ctx }) => {
      return ctx.prisma.academicPeriod.count({
        where: {
          schoolId: ctx.session.school.id,
        },
      });
    },
  ),
  createPeriod: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        from: z.date(),
        to: z.date(),
        weekendDayWithClasses: z.array(z.date()),
        holidays: z.array(z.date()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.$transaction(async (tx) => {
        const lastAcademicPeriod =
          await academicPeriodService.getCurrentOrLastActiveAcademicPeriod();

        if (!lastAcademicPeriod) {
          return;
        }

        const newAcademicPeriod = await tx.academicPeriod.create({
          data: {
            startDate: input.from,
            endDate: input.to,
            isActive: true,
            schoolId: ctx.session.school.id,
            Holidays: {
              createMany: {
                data: input.holidays.map((holiday) => ({
                  date: holiday,
                })),
              },
            },
            WeekendClasses: {
              createMany: {
                data: input.weekendDayWithClasses.map(
                  (weekendDayWithClass) => ({
                    date: weekendDayWithClass,
                  }),
                ),
              },
            },
          },
        });

        const students = await ctx.prisma.student.findMany({
          where: {
            User: {
              schoolId: ctx.session.school.id,
              active: true,
            },
            StudentHasAcademicPeriod: {
              every: {
                academicPeriodId: lastAcademicPeriod.id,
              },
            },
          },
          include: {
            StudentHasAcademicPeriod: true,
          },
        });

        await ctx.prisma.studentHasAcademicPeriod.createMany({
          data: students.map((student) => ({
            studentId: student.id,
            academicPeriodId: newAcademicPeriod.id,
            classId: student.StudentHasAcademicPeriod.find(
              (s) => s.academicPeriodId === lastAcademicPeriod.id,
            )?.classId,
          })),
        });
      });
    }),
});
