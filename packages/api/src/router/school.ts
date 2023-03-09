import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const schoolRouter = createTRPCRouter({
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.school.findFirst({ where: { slug: input.slug } });
    }),
  getFilesBySchoolId: publicProcedure
    .input(z.object({ schoolId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.file.findMany({
        where: { schoolId: input.schoolId },
      });
    }),
});
