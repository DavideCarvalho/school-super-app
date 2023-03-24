import clerk from "@clerk/clerk-sdk-node";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const roleRouter = createTRPCRouter({
  byName: publicProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.role.findFirst({
        where: { name: input.name },
      });
    }),
});
