import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const studentRouter = createTRPCRouter({
  studentsBySchoolId: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(5),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.student.findMany({
        where: {
          User: {
            schoolId: input.schoolId,
          },
        },
        take: input.limit,
        skip: (input.page - 1) * input.limit,
        include: {
          User: true,
        },
      });
    }),
});
