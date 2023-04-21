import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const teacherHasClassRouter = createTRPCRouter({
  countAllBySchoolId: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        teacherSlug: z.string().optional(),
        subjectSlug: z.string().optional(),
        classSlug: z.string().optional(),
        classWeekDay: z.string().optional(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.teacherHasClass.count({
        where: {
          Teacher: {
            User: {
              schoolId: input.schoolId,
              slug: input.teacherSlug,
            },
          },
          Class: {
            schoolId: input.schoolId,
            slug: input.classSlug,
          },
          Subject: {
            schoolId: input.schoolId,
            slug: input.subjectSlug,
          },
          classWeekDay: input.classWeekDay,
        },
      });
    }),
  allBySchoolId: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(5),
        teacherSlug: z.string().optional(),
        subjectSlug: z.string().optional(),
        classSlug: z.string().optional(),
        classWeekDay: z.string().optional(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.teacherHasClass.findMany({
        orderBy: {
          Class: {
            name: "asc",
          },
        },
        where: {
          Teacher: {
            User: {
              schoolId: input.schoolId,
              slug: input.teacherSlug,
            },
          },
          Class: {
            schoolId: input.schoolId,
            slug: input.classSlug,
          },
          Subject: {
            schoolId: input.schoolId,
            slug: input.subjectSlug,
          },
          classWeekDay: input.classWeekDay,
        },
        include: {
          Teacher: {
            include: {
              User: true,
            },
          },
          Class: true,
          Subject: true,
        },
        take: input.limit,
        skip: (input.page - 1) * input.limit,
      });
    }),
  createBySchoolId: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        teacherId: z.string(),
        classId: z.string(),
        subjectId: z.string(),
        classWeekDay: z.string(),
        classTime: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const teacher = await ctx.prisma.teacher.findFirst({
        where: {
          id: input.teacherId,
          User: {
            schoolId: input.schoolId,
          },
        },
      });

      if (!teacher) {
        throw new Error(`Professor com id ${input.teacherId} não encontrado`);
      }

      const schoolClass = await ctx.prisma.class.findFirst({
        where: {
          id: input.classId,
          schoolId: input.schoolId,
        },
      });

      if (!schoolClass) {
        throw new Error(`Turma com id ${input.classId} não encontrado`);
      }

      const subject = await ctx.prisma.subject.findFirst({
        where: {
          id: input.subjectId,
          schoolId: input.schoolId,
        },
      });

      if (!subject) {
        throw new Error(`Matéria com id ${input.subjectId} não encontrado`);
      }

      return ctx.prisma.teacherHasClass.create({
        data: {
          teacherId: input.teacherId,
          classId: input.classId,
          subjectId: input.subjectId,
          classWeekDay: input.classWeekDay,
          classTime: input.classTime,
        },
      });
    }),
  deleteById: publicProcedure
    .input(
      z.object({
        subjectId: z.string(),
        schoolId: z.string(),
        classId: z.string(),
        teacherId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const teacherHasClass = await ctx.prisma.teacherHasClass.findUnique({
        where: {
          teacherId_classId_subjectId: {
            teacherId: input.teacherId,
            classId: input.classId,
            subjectId: input.subjectId,
          },
        },
      });
      if (!teacherHasClass) {
        throw new Error(
          `Aula com subjectId ${input.subjectId} e classId ${input.classId} e teacherId ${input.teacherId} não encontrado`,
        );
      }
      await ctx.prisma.teacherHasClass.delete({
        where: {
          teacherId_classId_subjectId: {
            teacherId: input.teacherId,
            classId: input.classId,
            subjectId: input.subjectId,
          },
        },
      });
    }),
  update: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        teacherId: z.string(),
        classId: z.string(),
        subjectId: z.string(),
        classWeekDay: z.string().optional(),
        classTime: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const subject = await ctx.prisma.subject.findUnique({
        where: { id: input.subjectId },
      });
      if (!subject) {
        throw new Error(`Matéria com id ${input.subjectId} não encontrado`);
      }
      return ctx.prisma.teacherHasClass.update({
        where: {
          teacherId_classId_subjectId: {
            teacherId: input.teacherId,
            classId: input.classId,
            subjectId: input.subjectId,
          },
        },
        data: {
          classWeekDay: input.classWeekDay,
          classTime: input.classTime,
        },
      });
    }),
});
