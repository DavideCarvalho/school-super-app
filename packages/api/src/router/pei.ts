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
      return [];
    }),
  countAllBySchoolId: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
      }),
    )
    .query(({ ctx }) => {
      return 0;
    }),
});
