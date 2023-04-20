import { z } from "zod";
import slugify from "slugify";

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
  createBySchoolId: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.class.create({
        data: {
          id: `uuid`,
          name: input.name,
          slug: slugify(input.name),
          schoolId: input.schoolId,
        },
      });
    }),
  updateById: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        classId: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const foundClass = await ctx.prisma.class.findUnique({
        where: { id: input.classId },
      });
      if (!foundClass || foundClass.schoolId !== input.schoolId) {
        throw new Error(`Turma não encontrada`);
      }
      return ctx.prisma.class.update({
        where: { id: input.classId },
        data: {
          name: input.name,
          slug: slugify(input.name),
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
