import slugify from "slugify";
import { z } from "zod";

import {
  createTRPCRouter,
  isUserLoggedInAndAssignedToSchool,
  publicProcedure,
} from "../trpc";

export const classRouter = createTRPCRouter({
  findBySlug: isUserLoggedInAndAssignedToSchool
    .input(z.object({ slug: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.class.findFirst({
        where: { slug: input.slug, schoolId: ctx.session.school.id },
      });
    }),
  allBySchoolId: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        page: z.number().optional().default(1),
        limit: z.number().optional().default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.class.findMany({
        where: {
          schoolId: ctx.session.school.id,
        },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      });
    }),
  countAllBySchoolId: isUserLoggedInAndAssignedToSchool.query(
    async ({ ctx }) => {
      return ctx.prisma.class.count({
        where: {
          schoolId: ctx.session.school.id,
        },
      });
    },
  ),
  create: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.class.create({
        data: {
          name: input.name,
          slug: slugify(input.name),
          schoolId: ctx.session.school.id,
        },
      });
    }),
  updateById: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        //TODO: Tirar o schoolId do input
        schoolId: z.string(),
        classId: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const foundClass = await ctx.prisma.class.findUnique({
        where: { id: input.classId },
      });
      if (!foundClass || foundClass.schoolId !== ctx.session.school.id) {
        throw new Error("Turma não encontrada");
      }
      return ctx.prisma.class.update({
        where: { id: input.classId, schoolId: ctx.session.school.id },
        data: {
          name: input.name,
          slug: slugify(input.name),
        },
      });
    }),
  deleteById: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        classId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.class.delete({
        where: { id: input.classId, schoolId: ctx.session.school.id },
      });
    }),
});
