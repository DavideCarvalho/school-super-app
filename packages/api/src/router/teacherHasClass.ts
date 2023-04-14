import { z } from "zod";
import slugify from "slugify";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const teacherHasClassRouter = createTRPCRouter({
  countAllBySchoolId: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.teacherHasClass.count({
        where: {
          Teacher: {
            User: {
              schoolId: input.schoolId,
            }
          },
          Class: {
            schoolId: input.schoolId,
          },
          Subject: {
            schoolId: input.schoolId,
          }
        },
      });
    }),
  allBySchoolId: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(5),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.teacherHasClass.findMany({
        orderBy: {
          Class: {
            name: "asc",
          }
        },
        where: {
          Teacher: {
            User: {
              schoolId: input.schoolId,
            }
          },
          Class: {
            schoolId: input.schoolId,
          },
          Subject: {
            schoolId: input.schoolId,
          }
        },
        include: {
          Teacher: {
            include: {
              User: true,
            }
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
        name: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.subject.create({
        data: {
          name: input.name,
          slug: slugify(input.name),
          School: { connect: { id: input.schoolId } },
        },
      });
    }),
  deleteById: publicProcedure
    .input(z.object({ subjectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const subject = await ctx.prisma.subject.findUnique({
        where: { id: input.subjectId },
        include: {
          School: true,
        },
      });
      if (!subject) {
        throw new Error(`Matéria com id ${input.subjectId} não encontrado`);
      }
      await ctx.prisma.subject.delete({
        where: { id: input.subjectId },
      });
    }),
  updateById: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        subjectId: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const subject = await ctx.prisma.subject.findUnique({
        where: { id: input.subjectId },
      });
      if (!subject) {
        throw new Error(`Matéria com id ${input.subjectId} não encontrado`);
      }
      return ctx.prisma.subject.update({
        where: { id: input.subjectId },
        data: {
          name: input.name,
          slug: slugify(input.name),
        },
      });
    }),
});
