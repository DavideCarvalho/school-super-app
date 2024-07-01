import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { z } from "zod";

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
        const classesCreatedWithinPeriod = await ctx.prisma.class.findMany({
          where: {
            createdAt: {
              gte: input.from,
              lte: input.to,
            },
          },
        });
        const subjectsCreatedWithinPeriod = await ctx.prisma.subject.findMany({
          where: {
            createdAt: {
              gte: input.from,
              lte: input.to,
            },
          },
        });
        const teachersCreatedWithinPeriod = await ctx.prisma.teacher.findMany({
          where: {
            User: {
              createdAt: {
                gte: input.from,
                lte: input.to,
              },
            },
          },
        });
        const teacherHasClassCreatedWithinPeriod =
          await ctx.prisma.teacherHasClass.findMany({
            where: {
              createdAt: {
                gte: input.from,
                lte: input.to,
              },
            },
          });
        const calendarsCreatedWithinPeriod = await ctx.prisma.calendar.findMany(
          {
            where: {
              createdAt: {
                gte: input.from,
                lte: input.to,
              },
            },
          },
        );
        const academicPeriod = await tx.academicPeriod.create({
          data: {
            startDate: input.from,
            endDate: input.to,
            isActive: true,
            schoolId: ctx.session.school.id,
          },
        });
        await tx.classHasAcademicPeriod.createMany({
          data: classesCreatedWithinPeriod.map((classCreatedWithinPeriod) => ({
            classId: classCreatedWithinPeriod.id,
            academicPeriodId: academicPeriod.id,
          })),
        });
        await tx.teacherHasClassAcademicPeriod.createMany({
          data: teacherHasClassCreatedWithinPeriod.map(
            (teacherHasClassCreatedWithinPeriod) => ({
              teacherHasClassId: teacherHasClassCreatedWithinPeriod.id,
              academicPeriodId: academicPeriod.id,
            }),
          ),
        });
        await tx.subjectHasAcademicPeriod.createMany({
          data: subjectsCreatedWithinPeriod.map(
            (subjectCreatedWithinPeriod) => ({
              subjectId: subjectCreatedWithinPeriod.id,
              academicPeriodId: academicPeriod.id,
            }),
          ),
        });
        await tx.teacherHasAcademicPeriod.createMany({
          data: teachersCreatedWithinPeriod.map(
            (teacherCreatedWithinPeriod) => ({
              teacherId: teacherCreatedWithinPeriod.id,
              academicPeriodId: academicPeriod.id,
            }),
          ),
        });
        await tx.classHasAcademicPeriod.createMany({
          data: classesCreatedWithinPeriod.map((classCreatedWithinPeriod) => ({
            classId: classCreatedWithinPeriod.id,
            academicPeriodId: academicPeriod.id,
          })),
        });
        await tx.calendar.createMany({
          data: calendarsCreatedWithinPeriod.map(
            (calendarCreatedWithinPeriod) => ({
              name: `Calendário ${format(input.from, "dd-MM-yyyy", { locale: ptBR })} - ${format(input.to, "dd-MM-yyyy", { locale: ptBR })}`,
              classId: calendarCreatedWithinPeriod.classId,
              academicPeriodId: academicPeriod.id,
            }),
          ),
        });

        const lastAcademicPeriod = await ctx.prisma.academicPeriod.findFirst({
          where: {
            schoolId: ctx.session.school.id,
          },
          orderBy: {
            createdAt: "desc",
          },
        });
        if (!lastAcademicPeriod) {
          return;
        }
        const classesFromLastAcademicPeriod = await ctx.prisma.class.findMany({
          where: {
            ClassHasAcademicPeriod: {
              every: {
                academicPeriodId: lastAcademicPeriod.id,
              },
            },
          },
        });
        const teacherHasClassFromLastAcademicPeriod =
          await ctx.prisma.teacherHasClass.findMany({
            where: {
              TeacherHasClassAcademicPeriod: {
                every: {
                  academicPeriodId: lastAcademicPeriod.id,
                },
              },
            },
          });
        await tx.teacherHasClassAcademicPeriod.createMany({
          data: teacherHasClassFromLastAcademicPeriod.map(
            (teacherHasClassFromLastAcademicPeriod) => ({
              teacherHasClassId: teacherHasClassFromLastAcademicPeriod.id,
              academicPeriodId: academicPeriod.id,
            }),
          ),
        });
        const subjectsFromLastAcademicPeriod =
          await ctx.prisma.subject.findMany({
            where: {
              SubjectHasAcademicPeriod: {
                every: {
                  academicPeriodId: lastAcademicPeriod.id,
                },
              },
            },
          });
        const teachersFromLastAcademicPeriod =
          await ctx.prisma.teacher.findMany({
            where: {
              TeacherHasAcademicPeriod: {
                every: {
                  academicPeriodId: lastAcademicPeriod.id,
                },
              },
            },
          });
        await tx.classHasAcademicPeriod.createMany({
          data: classesFromLastAcademicPeriod.map(
            (classFromLastAcademicPeriod) => ({
              classId: classFromLastAcademicPeriod.id,
              academicPeriodId: academicPeriod.id,
            }),
          ),
        });
        await tx.subjectHasAcademicPeriod.createMany({
          data: subjectsFromLastAcademicPeriod.map(
            (subjectFromLastAcademicPeriod) => ({
              subjectId: subjectFromLastAcademicPeriod.id,
              academicPeriodId: academicPeriod.id,
            }),
          ),
        });
        await tx.teacherHasAcademicPeriod.createMany({
          data: teachersFromLastAcademicPeriod.map(
            (teacherFromLastAcademicPeriod) => ({
              teacherId: teacherFromLastAcademicPeriod.id,
              academicPeriodId: academicPeriod.id,
            }),
          ),
        });
      });
    }),
});
