import slugify from "slugify";
import { z } from "zod";

import { createTRPCRouter, isUserLoggedInAndAssignedToSchool } from "../trpc";

export const subjectRouter = createTRPCRouter({
  findBySlug: isUserLoggedInAndAssignedToSchool
    .input(z.object({ slug: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.subject.findFirst({
        where: { slug: input.slug, schoolId: ctx.session.school.id },
      });
    }),
  allBySchoolId: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        page: z.number().optional().default(1),
        limit: z.number().optional().default(5),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.subject.findMany({
        where: { schoolId: ctx.session.school.id },
        take: input.limit,
        skip: (input.page - 1) * input.limit,
        include: {
          TeacherHasClass: {
            include: {
              Teacher: {
                include: {
                  User: true,
                },
              },
              Subject: true,
            },
          },
        },
      });
    }),
  countAllBySchoolId: isUserLoggedInAndAssignedToSchool.query(({ ctx }) => {
    return ctx.prisma.subject.count({
      where: { schoolId: ctx.session.school.id },
    });
  }),
  createSubject: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.subject.create({
        data: {
          name: input.name,
          slug: slugify(input.name).toLowerCase(),
          School: { connect: { id: ctx.session.school.id } },
        },
      });
    }),
  deleteById: isUserLoggedInAndAssignedToSchool
    .input(z.object({ subjectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const subject = await ctx.prisma.subject.findUnique({
        where: { id: input.subjectId },
        include: {
          School: true,
        },
      });
      if (!subject) {
        throw new Error(`Matéria com id ${input.subjectId} não encontrado`);
      }
      await ctx.prisma.subject.delete({
        where: { id: input.subjectId },
      });
    }),
  getAllSubjectsForClass: isUserLoggedInAndAssignedToSchool
    .input(z.object({ classId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.subject.findMany({
        where: {
          TeacherHasClass: {
            some: {
              classId: input.classId,
            },
          },
        },
      });
    }),
  updateById: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        subjectId: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const subject = await ctx.prisma.subject.findUnique({
        where: { id: input.subjectId, schoolId: ctx.session.school.id },
      });
      if (!subject) {
        throw new Error(`Matéria com id ${input.subjectId} não encontrado`);
      }
      return ctx.prisma.subject.update({
        where: { id: input.subjectId, schoolId: ctx.session.school.id },
        data: {
          name: input.name,
          slug: slugify(input.name).toLowerCase(),
        },
      });
    }),
});
