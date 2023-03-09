import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const fileRouter = createTRPCRouter({
  countAllBySchoolId: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        orderBy: z
          .object({
            dueDate: z.union([z.literal("asc"), z.literal("desc")]),
          })
          .optional(),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(5),
        status: z
          .union([
            z.literal("REQUESTED"),
            z.literal("APPROVED"),
            z.literal("PRINTED"),
            z.literal("REVIEW"),
          ])
          .optional(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.file.count({
        where: {
          Class: { SchoolYear: { schoolId: input.schoolId } },
          status: input.status,
        },
        orderBy: { dueDate: input.orderBy?.dueDate },
        take: input.limit,
        skip: (input.page - 1) * input.limit,
      });
    }),
  allBySchoolId: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        orderBy: z
          .object({
            dueDate: z.union([z.literal("asc"), z.literal("desc")]),
          })
          .optional(),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(5),
        status: z
          .union([
            z.literal("REQUESTED"),
            z.literal("APPROVED"),
            z.literal("PRINTED"),
            z.literal("REVIEW"),
          ])
          .optional(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.file.findMany({
        where: {
          Class: { SchoolYear: { schoolId: input.schoolId } },
          status: input.status,
        },
        include: {
          Class: {
            include: {
              TeacherHasClass: {
                include: {
                  Teacher: true,
                  Subject: true,
                },
              },
              SchoolYear: {
                include: {
                  School: true,
                },
              },
            },
          },
        },
        orderBy: { dueDate: input.orderBy?.dueDate },
        take: input.limit,
        skip: (input.page - 1) * input.limit,
      });
    }),
});
