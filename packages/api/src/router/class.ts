import { TRPCError } from "@trpc/server";
import slugify from "slugify";
import { z } from "zod";

import type { TeacherHasClass } from "@acme/db";

import * as academicPeriodService from "../service/academicPeriod.service";
import { createTRPCRouter, isUserLoggedInAndAssignedToSchool } from "../trpc";

export const classRouter = createTRPCRouter({
  getStudentsForClassOnCurrentAcademicPeriod: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        classId: z.string(),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(5),
      }),
    )
    .query(async ({ ctx, input }) => {
      const academicPeriod =
        await academicPeriodService.getCurrentOrLastActiveAcademicPeriod(
          ctx.session.school.id,
        );
      if (!academicPeriod) {
        return [];
      }
      return ctx.prisma.student.findMany({
        where: {
          StudentHasAcademicPeriod: {
            every: {
              academicPeriodId: academicPeriod.id,
            },
          },
          User: {
            schoolId: ctx.session.school.id,
          },
        },
        take: input.limit,
        skip: (input.page - 1) * input.limit,
        include: {
          User: true,
          StudentHasResponsible: {
            include: {
              ResponsibleUser: true,
            },
          },
        },
      });
    }),
  countStudentsForClassOnCurrentAcademicPeriod:
    isUserLoggedInAndAssignedToSchool
      .input(
        z.object({
          classId: z.string(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const academicPeriod =
          await academicPeriodService.getCurrentOrLastActiveAcademicPeriod(
            ctx.session.school.id,
          );
        if (!academicPeriod) {
          return 0;
        }
        return ctx.prisma.student.count({
          where: {
            StudentHasAcademicPeriod: {
              every: {
                academicPeriodId: academicPeriod.id,
              },
            },
            User: {
              schoolId: ctx.session.school.id,
            },
          },
        });
      }),
  createAssignment: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        name: z.string(),
        dueDate: z.date(),
        grade: z.number().min(0),
        classId: z.string(),
        subjectId: z.string(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const latestAcademicPeriod = await ctx.prisma.academicPeriod.findFirst({
        where: {
          schoolId: ctx.session.school.id,
        },
        orderBy: {
          startDate: "desc",
        },
      });
      if (!latestAcademicPeriod) {
        return;
      }
      const teacherHasClass = await ctx.prisma.teacherHasClass.findFirst({
        where: {
          teacherId: ctx.session.user.id,
          classId: input.classId,
          subjectId: input.subjectId,
          isActive: true,
        },
      });
      if (!teacherHasClass) {
        throw new Error("Professor não está na turma");
      }
      return ctx.prisma.assignment.create({
        data: {
          name: input.name,
          dueDate: input.dueDate,
          grade: input.grade,
          teacherHasClassId: teacherHasClass.id,
          description: input.description,
          academicPeriodId: latestAcademicPeriod.id,
        },
      });
    }),
  findBySlug: isUserLoggedInAndAssignedToSchool
    .input(z.object({ slug: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.class.findFirst({
        where: { slug: input.slug, schoolId: ctx.session.school.id },
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
            where: {
              isActive: true,
            },
          },
        },
      });
    }),
  allBySchoolId: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        page: z.number().optional().default(1),
        limit: z.number().optional().default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.class.findMany({
        where: {
          schoolId: ctx.session.school.id,
        },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      });
    }),
  countAllBySchoolId: isUserLoggedInAndAssignedToSchool.query(
    async ({ ctx }) => {
      return ctx.prisma.class.count({
        where: {
          schoolId: ctx.session.school.id,
        },
      });
    },
  ),
  create: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        name: z.string(),
        subjectsWithTeachers: z.array(
          z.object({
            subjectId: z.string(),
            teacherId: z.string(),
            quantity: z.number().min(1),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.$transaction(async (tx) => {
        await tx.class.create({
          data: {
            name: input.name,
            slug: slugify(input.name).toLowerCase(),
            schoolId: ctx.session.school.id,
            TeacherHasClass: {
              createMany: {
                data: input.subjectsWithTeachers.map((newClass) => ({
                  teacherId: newClass.teacherId,
                  subjectId: newClass.subjectId,
                  subjectQuantity: newClass.quantity,
                })),
              },
            },
          },
        });
      });
    }),
  updateById: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        classId: z.string(),
        name: z.string(),
        subjectsWithTeachers: z.array(
          z.object({
            subjectId: z.string(),
            teacherId: z.string(),
            quantity: z.number().min(1),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.$transaction(async (tx) => {
        const foundClass = await tx.class.findUnique({
          where: { id: input.classId, schoolId: ctx.session.school.id },
          include: {
            TeacherHasClass: true,
          },
        });

        if (!foundClass) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Turma não encontrada",
          });
        }

        const existingTeacherHasClasses = [];
        for (const subjectWithTeacher of input.subjectsWithTeachers) {
          const existingTeacherHasClass = foundClass.TeacherHasClass.find(
            (thc) =>
              thc.teacherId === subjectWithTeacher.teacherId &&
              thc.subjectId === subjectWithTeacher.subjectId,
          );
          if (!existingTeacherHasClass) {
            const createdTeacherHasClass = await tx.teacherHasClass.create({
              data: {
                teacherId: subjectWithTeacher.teacherId,
                classId: input.classId,
                subjectId: subjectWithTeacher.subjectId,
                subjectQuantity: subjectWithTeacher.quantity,
              },
            });
            existingTeacherHasClasses.push(createdTeacherHasClass);
          } else {
            if (
              existingTeacherHasClass.subjectQuantity !==
                subjectWithTeacher.quantity ||
              existingTeacherHasClass.isActive !== true
            ) {
              const updatedTeacherHasClass =
                await ctx.prisma.teacherHasClass.update({
                  where: {
                    id: existingTeacherHasClass.id,
                  },
                  data: {
                    subjectQuantity: subjectWithTeacher.quantity,
                    isActive: true,
                  },
                });
              existingTeacherHasClasses.push(updatedTeacherHasClass);
            }
          }
        }

        await tx.teacherHasClass.updateMany({
          where: {
            id: {
              notIn: existingTeacherHasClasses.map((thc) => thc.id),
            },
            classId: input.classId,
          },
          data: {
            isActive: false,
          },
        });
      });
    }),
  deleteById: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        classId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.class.delete({
        where: { id: input.classId, schoolId: ctx.session.school.id },
      });
    }),
});
