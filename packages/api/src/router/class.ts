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
        await academicPeriodService.getCurrentOrLastActiveAcademicPeriod();
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
          await academicPeriodService.getCurrentOrLastActiveAcademicPeriod();
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
            subjectIds: z.array(z.string()),
            teacherId: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existingClasses: TeacherHasClass[] = [];
      return ctx.prisma.$transaction(async (tx) => {
        for (const subjectWithTeacher of input.subjectsWithTeachers) {
          for (const subjectId of subjectWithTeacher.subjectIds) {
            const existingClass = await tx.teacherHasClass.findFirst({
              where: {
                teacherId: subjectWithTeacher.teacherId,
                subjectId,
              },
            });
            if (existingClass) {
              existingClasses.push(existingClass);
            }
          }
        }
        await tx.teacherHasClass.updateMany({
          where: {
            id: { in: existingClasses.map((c) => c.id) },
          },
          data: {
            isActive: true,
          },
        });
        const newClasses = input.subjectsWithTeachers.flatMap(
          (subjectWithTeacher) =>
            subjectWithTeacher.subjectIds
              .filter(
                (subjectId) =>
                  !existingClasses.some(
                    (existingClass) =>
                      existingClass.teacherId ===
                        subjectWithTeacher.teacherId &&
                      existingClass.subjectId === subjectId,
                  ),
              )
              .map((subjectId) => ({
                teacherId: subjectWithTeacher.teacherId,
                subjectId,
              })),
        );
        return tx.class.create({
          data: {
            name: input.name,
            slug: slugify(input.name).toLowerCase(),
            schoolId: ctx.session.school.id,
            TeacherHasClass: {
              createMany: {
                data: newClasses,
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
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const foundClass = await ctx.prisma.class.findUnique({
        where: { id: input.classId, schoolId: ctx.session.school.id },
      });

      if (!foundClass) {
        throw new Error("Turma não encontrada");
      }

      const currentTeacherHasClasses =
        await ctx.prisma.teacherHasClass.findMany({
          where: { classId: input.classId, isActive: true },
        });

      // Identificar as aulas que precisam ser removidas
      const subjectsToDelete = currentTeacherHasClasses.filter(
        (current) =>
          !input.subjectsWithTeachers.some(
            (subjectWithTeacher) =>
              subjectWithTeacher.subjectId === current.subjectId,
          ),
      );

      // Identificar as aulas que precisam ser adicionadas ou atualizadas
      const subjectsToAddOrUpdate = input.subjectsWithTeachers.filter(
        (subjectWithTeacher) =>
          !currentTeacherHasClasses.some(
            (current) =>
              current.subjectId === subjectWithTeacher.subjectId &&
              current.teacherId === subjectWithTeacher.teacherId,
          ),
      );

      // Iniciar a transação
      await ctx.prisma.$transaction(async (tx) => {
        // Remover aulas que não estão no input
        await tx.teacherHasClass.updateMany({
          where: {
            id: { in: subjectsToDelete.map((subject) => subject.id) },
          },
          data: {
            isActive: false,
          },
        });

        // Adicionar ou atualizar aulas
        for (const subjectWithTeacher of subjectsToAddOrUpdate) {
          const existingClass = currentTeacherHasClasses.find(
            (current) => current.subjectId === subjectWithTeacher.subjectId,
          );

          if (existingClass) {
            // Atualizar aula existente
            await tx.teacherHasClass.update({
              where: { id: existingClass.id },
              data: {
                teacherId: subjectWithTeacher.teacherId,
                subjectQuantity: subjectWithTeacher.quantity,
              },
            });
          } else {
            // Adicionar nova aula
            await tx.teacherHasClass.create({
              data: {
                classId: input.classId,
                teacherId: subjectWithTeacher.teacherId,
                subjectId: subjectWithTeacher.subjectId,
                subjectQuantity: subjectWithTeacher.quantity,
              },
            });
          }
        }

        // Atualizar o nome da turma, se necessário, dentro da transação
        if (foundClass.name !== input.name) {
          await tx.class.update({
            where: { id: input.classId },
            data: { name: input.name },
          });
        }
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
