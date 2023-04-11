import { z } from "zod";
import slugify from "slugify";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const schoolYearRouter = createTRPCRouter({
  allBySchoolId: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(5)
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.schoolYear.findMany({
        where: { schoolId: input.schoolId },
        take: input.limit,
        skip: (input.page - 1) * input.limit
      });
    }),
  countAllBySchoolId: publicProcedure
    .input(
      z.object({
        schoolId: z.string()
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.schoolYear.count({
        where: { schoolId: input.schoolId }
      });
    }),
  createBySchoolId: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        name: z.string()
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.schoolYear.create({
        data: {
          name: input.name,
          slug: slugify(input.name),
          School: { connect: { id: input.schoolId } }
        }
      });
    }),
  deleteById: publicProcedure
    .input(z.object({ schoolYearId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const schoolYear = await ctx.prisma.schoolYear.findUnique({
        where: { id: input.schoolYearId },
        include: { School: true, Classes: { include: { TeacherHasClass: true } }}
      });
      if (!schoolYear) {
        throw new Error(`Ano com id ${input.schoolYearId} não encontrado`);
      }
      await ctx.prisma.schoolYear.delete({
        where: { id: input.schoolYearId }
      });
    }),
  updateById: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        schoolYearId: z.string(),
        name: z.string()
      })
    ).mutation(async ({ ctx, input }) => {
      const schoolYear = await ctx.prisma.schoolYear.findUnique({
        where: { id: input.schoolYearId }
      });
      if (!schoolYear) {
        throw new Error(`Ano com id ${input.schoolYearId} não encontrado`);
      }
      return ctx.prisma.schoolYear.update({
        where: { id: input.schoolYearId },
        data: {
          name: input.name,
          slug: slugify(input.name)
        }
      });
    }),
});
