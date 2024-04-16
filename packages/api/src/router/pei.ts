import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const peiRouter = createTRPCRouter({
  allBySchoolId: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        page: z.number().default(1),
        limit: z.number().default(5),
      }),
    )
    .query(({ ctx }) => {
      return ctx.prisma.studentPei.findMany({
        where: {
          schoolId: input.schoolId,
        },
        take: input.limit,
        skip: (input.page - 1) * input.limit,
        include: {
          Student: true,
        },
      });
    }),
  countAllBySchoolId: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
      }),
    )
    .query(({ ctx }) => {
      return ctx.prisma.studentPei.count({
        where: {
          schoolId: input.schoolId,
        }
      });
    }),
});
