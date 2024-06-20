import { z } from "zod";

import { createTRPCRouter, isUserLoggedInAndAssignedToSchool } from "../trpc";

export const printRequestRouter = createTRPCRouter({
  countAllBySchoolId: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        orderBy: z
          .object({
            dueDate: z.union([z.literal("asc"), z.literal("desc")]),
          })
          .optional(),
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
          Teacher: {
            User: {
              schoolId: ctx.session.school.id,
            },
          },
          Subject: {
            schoolId: ctx.session.school.id,
          },
          Class: {
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
          Teacher: {
            User: {
              schoolId: ctx.session.school.id,
            },
          },
          Subject: {
            schoolId: ctx.session.school.id,
          },
          Class: {
            schoolId: ctx.session.school.id,
          },
          status: {
            in: input.statuses,
          },
        },
        include: {
          Class: true,
          Teacher: {
            include: {
              User: true,
            },
          },
          Subject: true,
        },
        take: input.limit,
        skip: (input.page - 1) * input.limit,
      });
    }),
  createRequest: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        name: z.string(),
        teacherId: z.string(),
        classId: z.string(),
        subjectId: z.string(),
        fileUrl: z.string().url(),
        quantity: z.number().min(1),
        dueDate: z.date(),
        frontAndBack: z.boolean().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const teacherHasClass = await ctx.prisma.teacherHasClass.findUnique({
        where: {
          teacherId_classId_subjectId: {
            teacherId: input.teacherId,
            classId: input.classId,
            subjectId: input.subjectId,
          },
        },
      });
      if (!teacherHasClass) {
        throw new Error(
          `Teacher with id ${input.teacherId} does not teach in the class with id ${input.classId} for the subject with id ${input.subjectId}`,
        );
      }
      await ctx.prisma.printRequest.create({
        data: {
          name: input.name,
          teacherId: input.teacherId,
          classId: input.classId,
          subjectId: input.subjectId,
          quantity: input.quantity,
          path: input.fileUrl,
          dueDate: input.dueDate,
          frontAndBack: input.frontAndBack,
          status: "REQUESTED",
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
  reviewRequest: isUserLoggedInAndAssignedToSchool
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
          status: "REVIEW",
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
});
