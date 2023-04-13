import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const classRouter = createTRPCRouter({
  allBySchoolId: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.class.findMany({
        where: {
          schoolId: input.schoolId,
        },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      });
    }),
  countAllBySchoolId: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.class.count({
        where: {
          schoolId: input.schoolId,
        },
      });
    }),
  create: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        subjectId: z.string(),
        name: z.string(),
        teacherId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const foundTeacher = await ctx.prisma.teacher.findUnique({
        where: { id: input.teacherId },
        include: { User: true },
      });
      if (!foundTeacher || foundTeacher.User.schoolId !== input.schoolId) {
        throw new Error(`Professor não encontrado`);
      }
      return ctx.prisma.class.create({
        data: {
          id: `uuid`,
          name: input.name,
          slug: "slugify(input.name)",
          schoolId: input.schoolId,
          TeacherHasClass:
            input.teacherId && input.subjectId
              ? {
                  connect: {
                    teacherId_classId_subjectId: {
                      classId: `uuid`,
                      subjectId: input.subjectId,
                      teacherId: input.teacherId,
                    },
                  },
                }
              : undefined,
        },
      });
    }),
  deleteById: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        classId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const foundClass = await ctx.prisma.class.findUnique({
        where: { id: input.classId },
      });
      if (!foundClass || foundClass.schoolId !== input.schoolId) {
        throw new Error(`Turma não encontrada`);
      }
      return ctx.prisma.class.delete({
        where: { id: input.classId },
      });
    }),
});
