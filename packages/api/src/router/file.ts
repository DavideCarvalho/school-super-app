import { z } from "zod";

import { type File } from "@acme/db";

import { createTRPCRouter, publicProcedure } from "../trpc";

type teste = keyof File;

export const fileRouter = createTRPCRouter({
  allBySchoolId: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        orderBy: z
          .object({
            dueDate: z.union([z.literal("asc"), z.literal("desc")]),
          })
          .optional(),
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
      });
    }),
});
