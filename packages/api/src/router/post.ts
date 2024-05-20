import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const postRouter = createTRPCRouter({
  getPosts: publicProcedure
    .input(
      z.object({
        page: z.number().optional().default(1),
        limit: z.number().optional().default(5),
        schoolId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.post.findMany({
        where: {
          schoolId: input.schoolId,
        },
        take: input.limit,
        skip: (input.page - 1) * input.limit,
      });
    }),
});
