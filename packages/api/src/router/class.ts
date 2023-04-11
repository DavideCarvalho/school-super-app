import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const classRouter = createTRPCRouter({
  getBySchoolId: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.class.findMany({
        where: {
          SchoolYear: {
            schoolId: input.schoolId,
          },
        },
      });
    }),
  create: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        schoolYearId: z.string(),
        subjectId: z.string(),
        name: z.string(),
        teacherId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const foundSchoolYear = await ctx.prisma.schoolYear.findUnique({
        where: { id: input.schoolYearId },
      });
      if (!foundSchoolYear || foundSchoolYear.schoolId !== input.schoolId) {
        throw new Error(`Ano letivo não encontrado`);
      }
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
          slug: 'slugify(input.name)',
          SchoolYear: { connect: { id: input.schoolYearId } },
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
  deleteBySchoolId: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        classId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const foundClass = await ctx.prisma.class.findUnique({
        where: { id: input.classId },
        include: { SchoolYear: true },
      });
      if (!foundClass || foundClass.SchoolYear.schoolId !== input.schoolId) {
        throw new Error(`Turma não encontrada`);
      }
      return ctx.prisma.class.delete({
        where: { id: input.classId },
      });
    }),
});
