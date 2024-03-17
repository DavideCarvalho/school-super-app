import { StatusBar } from "expo-status-bar";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const purchaseRequestRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        productName: z.string(),
        quantity: z.number(),
        value: z.number(),
        dueDate: z.date(),
        productUrl: z.string().optional(),
        description: z.string().optional(),
        requestingUserId: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.purchaseRequest.create({
        data: {
          schoolId: input.schoolId,
          productName: input.productName,
          quantity: input.quantity,
          productUrl: input.productUrl,
          dueDate: input.dueDate,
          requestingUserId: input.requestingUserId,
          value: input.value,
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
            z.literal("ARRIVED"),
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
  countAllBySchoolId: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
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
      return ctx.prisma.purchaseRequest.count({
        where: { schoolId: input.schoolId, status: input.status },
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
          z.literal("ARRIVED"),
        ]),
      }),
    )
    .query(async ({ ctx, input }) => {
      await ctx.prisma.purchaseRequest.update({
        where: { id: input.id },
        data: {
          status: input.status,
          arrivalDate: input.status === "ARRIVED" ? new Date() : undefined,
        },
      });
    }),
  deleteById: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const purchaseRequest = await ctx.prisma.purchaseRequest.findUnique({
        where: { id: input.id },
      });
      if (!purchaseRequest) {
        throw new Error("Purchase request not found");
      }
      if (purchaseRequest.status !== "REQUESTED") {
        throw new Error(
          "Cannot delete purchase request with status different than REQUESTED",
        );
      }
      return ctx.prisma.purchaseRequest.delete({ where: { id: input.id } });
    }),
});
