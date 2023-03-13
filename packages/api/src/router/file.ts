import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const fileRouter = createTRPCRouter({
  countAllBySchoolId: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        orderBy: z
          .object({
            dueDate: z.union([z.literal("asc"), z.literal("desc")]),
          })
          .optional(),
        status: z
          .union([
            z.literal("REQUESTED"),
            z.literal("APPROVED"),
            z.literal("PRINTED"),
            z.literal("REVIEW"),
          ])
          .optional(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.file.count({
        where: {
          TeacherHasClass: {
            Class: { SchoolYear: { schoolId: input.schoolId } },
          },
          status: input.status,
        },
        orderBy: { dueDate: input.orderBy?.dueDate },
      });
    }),
  allBySchoolId: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        orderBy: z
          .object({
            dueDate: z.union([z.literal("asc"), z.literal("desc")]),
          })
          .optional(),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(5),
        status: z
          .union([
            z.literal("REQUESTED"),
            z.literal("APPROVED"),
            z.literal("PRINTED"),
            z.literal("REVIEW"),
          ])
          .optional(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.file.findMany({
        where: {
          TeacherHasClass: {
            Class: { SchoolYear: { schoolId: input.schoolId } },
          },
          status: input.status,
        },
        include: {
          TeacherHasClass: {
            include: {
              Class: {
                include: {
                  SchoolYear: {
                    include: {
                      School: true,
                    },
                  },
                },
              },
              Teacher: {
                include: {
                  User: true,
                },
              },
              Subject: true,
            },
          },
        },
        orderBy: { dueDate: input.orderBy?.dueDate },
        take: input.limit,
        skip: (input.page - 1) * input.limit,
      });
    }),
  createRequest: publicProcedure
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
      console.log("teacherHasClass", teacherHasClass);
      console.log("Criando solicitação de impressão");
      await ctx.prisma.file.create({
        data: {
          name: input.name,
          TeacherHasClass: {
            connect: {
              teacherId_classId_subjectId: {
                teacherId: input.teacherId,
                classId: input.classId,
                subjectId: input.subjectId,
              },
            },
          },
          quantity: input.quantity,
          path: input.fileUrl,
          dueDate: input.dueDate,
          frontAndBack: input.frontAndBack,
          status: "REQUESTED",
        },
      });
    }),
});
