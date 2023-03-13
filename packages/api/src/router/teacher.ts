import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const teacherRouter = createTRPCRouter({
  getClassesById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.class.findMany({
        where: { TeacherHasClass: { every: { teacherId: input.id } } },
      });
    }),
});
