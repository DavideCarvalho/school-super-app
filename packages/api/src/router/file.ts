import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const fileRouter = createTRPCRouter({
  allBySchoolId: publicProcedure
    .input(z.object({ schoolId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.file.findMany({
        where: { Class: { SchoolYear: { schoolId: input.schoolId } } },
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
      });
    }),
});
