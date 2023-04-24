import slugify from "slugify";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const purchaseRequestRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        name: z.string(),
        url: z.string().optional(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.purchaseRequest.create({
        data: {
          schoolId: input.schoolId,
          url: input.url,
          name: input.name,
          slug: slugify(input.name),
          status: "REQUESTED",
        },
      });
    }),
  allBySchoolId: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(5),
        status: z
          .union([
            z.literal("REQUESTED"),
            z.literal("APPROVED"),
            z.literal("REJECTED"),
            z.literal("BOUGHT"),
          ])
          .optional(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.purchaseRequest.findMany({
        where: { schoolId: input.schoolId, status: input.status },
        take: input.limit,
        skip: (input.page - 1) * input.limit,
      });
    }),
  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.union([
          z.literal("REQUESTED"),
          z.literal("APPROVED"),
          z.literal("REJECTED"),
          z.literal("BOUGHT"),
        ]),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.purchaseRequest.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),
});
