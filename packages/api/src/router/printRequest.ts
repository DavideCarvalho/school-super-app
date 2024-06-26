import { z } from "zod";

import { createTRPCRouter, isUserLoggedInAndAssignedToSchool } from "../trpc";

export const printRequestRouter = createTRPCRouter({
  findById: isUserLoggedInAndAssignedToSchool
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.printRequest.findUnique({
        where: { id: input.id, User: { schoolId: ctx.session.school.id } },
        include: {
          User: true,
        },
      });
    }),
  countAllBySchoolId: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        statuses: z
          .array(
            z.union([
              z.literal("REQUESTED"),
              z.literal("APPROVED"),
              z.literal("PRINTED"),
              z.literal("REVIEW"),
            ]),
          )
          .optional(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.printRequest.count({
        where: {
          User: {
            schoolId: ctx.session.school.id,
          },
          status: {
            in: input.statuses,
          },
        },
      });
    }),
  allBySchoolId: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        page: z.number().optional().default(1),
        limit: z.number().optional().default(5),
        statuses: z
          .array(
            z.union([
              z.literal("REQUESTED"),
              z.literal("APPROVED"),
              z.literal("PRINTED"),
              z.literal("REVIEW"),
            ]),
          )
          .optional(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.printRequest.findMany({
        where: {
          User: {
            schoolId: ctx.session.school.id,
          },
          status: {
            in: input.statuses,
          },
        },
        include: {
          User: true,
        },
        take: input.limit,
        skip: (input.page - 1) * input.limit,
      });
    }),
  reviewRequest: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        fileUrl: z.string().url(),
        quantity: z.number().min(1),
        dueDate: z.date(),
        frontAndBack: z.boolean().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.printRequest.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          path: input.fileUrl,
          quantity: input.quantity,
          dueDate: input.dueDate,
          frontAndBack: input.frontAndBack,
          status: "REQUESTED",
        },
      });
    }),
  createRequest: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        name: z.string(),
        fileUrl: z.string().url(),
        quantity: z.number().min(1),
        dueDate: z.date(),
        frontAndBack: z.boolean().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.printRequest.create({
        data: {
          name: input.name,
          quantity: input.quantity,
          path: input.fileUrl,
          dueDate: input.dueDate,
          frontAndBack: input.frontAndBack,
          status: "REQUESTED",
          userId: ctx.session.user.id,
        },
      });
    }),
  reviewed: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.printRequest.update({
        where: {
          id: input.id,
        },
        data: {
          status: "REQUESTED",
        },
      });
    }),
  rejectRequest: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        id: z.string(),
        reason: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.printRequest.update({
        where: {
          id: input.id,
          User: {
            schoolId: ctx.session.school.id,
          },
        },
        data: {
          status: "REJECTED",
          rejectedFeedback: input.reason,
        },
      });
    }),
  approveRequest: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.printRequest.update({
        where: {
          id: input.id,
        },
        data: {
          status: "APPROVED",
        },
      });
    }),
  printRequest: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.printRequest.update({
        where: {
          id: input.id,
        },
        data: {
          status: "PRINTED",
        },
      });
    }),
  deleteById: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.printRequest.delete({
        where: {
          id: input.id,
          User: {
            schoolId: ctx.session.school.id,
          },
        },
      });
    }),
});
