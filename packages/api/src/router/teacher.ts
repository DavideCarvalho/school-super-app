import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const teacherRouter = createTRPCRouter({
  getClassesById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.teacherHasClass.findMany({
        where: { teacherId: input.id },
        include: {
          Class: true,
          Subject: true,
          Teacher: true,
          File: true,
        },
      });
    }),
});
