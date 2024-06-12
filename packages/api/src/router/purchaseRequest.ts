import { z } from "zod";

import {
  createTRPCRouter,
  isUserLoggedInAndAssignedToSchool,
  publicProcedure,
} from "../trpc";
import { minioClient } from "../utils/minio";

export const purchaseRequestRouter = createTRPCRouter({
  findById: isUserLoggedInAndAssignedToSchool
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.purchaseRequest.findUnique({
        where: { id: input.id },
      });
    }),
  create: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        productName: z.string(),
        quantity: z.number(),
        unitValue: z.number(),
        value: z.number(),
        dueDate: z.date(),
        productUrl: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.purchaseRequest.create({
        data: {
          schoolId: ctx.session.school.id,
          productName: input.productName,
          quantity: input.quantity,
          productUrl: input.productUrl,
          dueDate: input.dueDate,
          requestingUserId: ctx.session.user.id,
          unitValue: input.unitValue,
          value: input.value,
          description: input.description,
          status: "REQUESTED",
        },
      });
    }),
  rejectPurchaseRequest: isUserLoggedInAndAssignedToSchool
    .input(z.object({ id: z.string(), reason: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.purchaseRequest.update({
        where: { id: input.id, schoolId: ctx.session.school.id },
        data: { status: "REJECTED", rejectionReason: input.reason },
      });
    }),
  getUniqueProductNames: isUserLoggedInAndAssignedToSchool.query(({ ctx }) => {
    return ctx.prisma.purchaseRequest.findMany({
      where: { schoolId: ctx.session.school.id },
      distinct: ["productName"],
    });
  }),
  editRequestedPurchaseRequest: publicProcedure
    .input(
      z.object({
        id: z.string(),
        productName: z.string(),
        quantity: z.number(),
        value: z.number(),
        dueDate: z.date(),
        productUrl: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.purchaseRequest.update({
        where: { id: input.id },
        data: {
          productName: input.productName,
          quantity: input.quantity,
          value: input.value,
          dueDate: input.dueDate,
          productUrl: input.productUrl,
          description: input.description,
          status: "REQUESTED",
        },
      });
    }),
  allBySchoolId: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        page: z.number().optional().default(1),
        size: z.number().optional().default(10),
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
        where: { schoolId: ctx.session.school.id, status: input.status },
        take: input.size,
        skip: (input.page - 1) * input.size,
      });
    }),
  countAllBySchoolId: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        status: z
          .union([
            z.literal("REQUESTED"),
            z.literal("APPROVED"),
            z.literal("REJECTED"),
            z.literal("BOUGHT"),
            z.literal("ARRIVED"),
            z.literal("REJECTED"),
          ])
          .optional(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.purchaseRequest.count({
        where: { schoolId: ctx.session.school.id, status: input.status },
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
  approvePurchaseRequest: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.purchaseRequest.update({
        where: { id: input.id },
        data: { status: "APPROVED" },
      });
    }),
  arrivedPurchaseRequest: publicProcedure
    .input(z.object({ id: z.string(), arrivalDate: z.date() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.purchaseRequest.update({
        where: { id: input.id },
        data: { status: "ARRIVED", arrivalDate: input.arrivalDate },
      });
    }),
  createBoughtPurchaseRequestFileSignedUrl: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        purchaseRequestId: z.string(),
        fileName: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const signedUrl = await minioClient.presignedPutObject(
        "anua",
        `/school/${input.schoolId}/purchase-request/${input.fileName}`,
        60 * 60,
      );
      return { signedUrl };
    }),
  boughtPurchaseRequest: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        id: z.string(),
        finalQuantity: z.number(),
        finalUnitValue: z.number(),
        finalValue: z.number(),
        estimatedArrivalDate: z.date(),
        receiptFileName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.purchaseRequest.update({
        where: { id: input.id },
        data: {
          status: "BOUGHT",
          finalQuantity: input.finalQuantity,
          finalUnitValue: input.finalUnitValue,
          finalValue: input.finalValue,
          estimatedArrivalDate: input.estimatedArrivalDate,
          receiptPath: `/school/${input.schoolId}/purchase-request/${input.receiptFileName}`,
        },
      });
    }),
  purchaseRequestsLast360DaysByMonth: publicProcedure
    .input(z.object({ schoolId: z.string() }))
    .query(async ({ ctx, input }) => {
      const data = await ctx.prisma.$queryRaw<
        { month: string; count: bigint }[]
      >`
        SELECT
          EXTRACT(MONTH FROM createdAt) as month,
          COUNT(*)                      as count
        FROM PurchaseRequest
        WHERE schoolId = ${input.schoolId}
          AND createdAt > NOW() - INTERVAL 1 YEAR
        GROUP BY YEAR(updatedAt), month
        ORDER BY YEAR(updatedAt), month;
      `;
      return data.map((d) => ({
        month: d.month,
        count: Number.parseInt(d.count.toString()),
      }));
    }),
  purchaseRequestsTimeToFinalStatusInLast360Days: publicProcedure
    .input(z.object({ schoolId: z.string() }))
    .query(async ({ ctx, input }) => {
      const data = await ctx.prisma.$queryRaw<
        {
          month: string;
          averageDaysToFinish: string;
        }[]
      >`
        SELECT EXTRACT(MONTH FROM createdAt)                  as month,
        AVG(DATEDIFF(updatedAt, createdAt)) as averageDaysToFinish
        FROM PurchaseRequest
        WHERE schoolId = ${input.schoolId}
          AND updatedAt > NOW() - INTERVAL 1 YEAR
          AND status = 'ARRIVED'
        GROUP BY YEAR(updatedAt), month
        ORDER BY YEAR(updatedAt), month
      `;
      return data.map((d) => ({
        month: d.month,
        averageDaysToFinish: Number.parseFloat(d.averageDaysToFinish),
      }));
    }),
  purchaseRequestsMonthlyValueInLast360Days: publicProcedure
    .input(z.object({ schoolId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.$queryRaw<{ month: string; value: number }[]>`
        SELECT
          EXTRACT(MONTH FROM createdAt) as month,
          SUM(finalValue)               as value
        FROM PurchaseRequest
        WHERE
          schoolId = ${input.schoolId}
          AND createdAt > NOW() - INTERVAL 1 YEAR
        GROUP BY month
        ORDER BY month
      `;
    }),
});
