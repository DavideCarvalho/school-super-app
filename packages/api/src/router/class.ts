import slugify from "slugify";
import { z } from "zod";

import type { TeacherHasClass } from "@acme/db";
import { sql } from "@acme/db";

import { createTRPCRouter, isUserLoggedInAndAssignedToSchool } from "../trpc";

export const classRouter = createTRPCRouter({
  getClassAttendance: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        classId: z.string(),
        limit: z.number().optional().default(5),
        page: z.number().optional().default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      let academicYear = await ctx.prisma.academicYear.findFirst({
        where: {
          isActive: true,
        },
      });
      if (!academicYear) {
        academicYear = await ctx.prisma.academicYear.findFirst({
          orderBy: {
            endDate: "desc",
          },
        });
      }

      if (!academicYear) {
        return [];
      }

      const data = await ctx.prisma.$kysely
        .selectFrom("StudentAttendingClass as sac")
        .leftJoin(
          ctx.prisma.$kysely
            .selectFrom("StudentHasClassAttendance as shca")
            .select([
              "shca.studentId",
              sql<number>`COUNT(shca.id)`.as("attendedClasses"),
            ])
            .groupBy("shca.studentId")
            .as("attended"),
          "sac.studentId",
          "attended.studentId",
        )
        .leftJoin(
          ctx.prisma.$kysely
            .selectFrom("StudentAttendingClass as sac2")
            .select([
              "sac2.studentId",
              sql<number>`COUNT(sac2.classId)`.as("totalClasses"),
            ])
            .groupBy("sac2.studentId")
            .as("total"),
          "sac.studentId",
          "total.studentId",
        )
        .leftJoin("Student as s", "sac.studentId", "s.id")
        .leftJoin("User as u", "s.id", "u.id")
        .select([
          "sac.studentId as studentId",
          "u.name as userName",
          "u.email as userEmail",
          sql<number>`COALESCE(attended.attendedClasses, 0)`.as(
            "attendedClasses",
          ),
          sql<number>`COALESCE(total.totalClasses, 0)`.as("totalClasses"),
          sql<number>`(COALESCE(attended.attendedClasses, 0) / COALESCE(total.totalClasses, 1)) * 100`.as(
            "attendancePercentage",
          ),
        ])
        .where("sac.classId", "=", input.classId)
        .where("sac.academicYearId", "=", academicYear.id)
        .groupBy("sac.studentId")
        .offset((input.page - 1) * input.limit)
        .limit(input.limit)
        .execute();

      return data.map((item) => ({
        Student: {
          id: item.studentId,
          User: {
            name: item.userName,
            email: item.userEmail,
          },
        },
        attendedClasses: item.attendedClasses,
        totalClasses: item.totalClasses,
        attendancePercentage: item.attendancePercentage,
      }));
    }),
  countClassAttendance: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        classId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      let academicYear = await ctx.prisma.academicYear.findFirst({
        where: {
          isActive: true,
        },
      });
      if (!academicYear) {
        academicYear = await ctx.prisma.academicYear.findFirst({
          orderBy: {
            endDate: "desc",
          },
        });
      }

      if (!academicYear) {
        return 0;
      }

      return ctx.prisma.studentAttendingClass.count({
        where: {
          classId: input.classId,
          academicYearId: academicYear.id,
        },
      });
    }),
  getClassAssignments: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        classId: z.string(),
        limit: z.number().optional().default(5),
        page: z.number().optional().default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.assignment.findMany({
        where: {
          TeacherHasClass: {
            classId: input.classId,
            isActive: true,
          },
        },
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
              Class: {
                include: {
                  StudentAttendingClass: true,
                },
              },
            },
          },
          StudentHasAssignment: {
            include: {
              Student: {
                include: {
                  User: true,
                },
              },
            },
          },
        },
      });
    }),
  countAllClassAssignments: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        classId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.assignment.count({
        where: {
          TeacherHasClass: {
            classId: input.classId,
            isActive: true,
          },
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
            quantity: z.number().min(1),
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
            slug: slugify(input.name),
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
            quantity: z.number().min(1),
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
              current.teacherId === subjectWithTeacher.teacherId &&
              current.subjectQuantity === subjectWithTeacher.quantity,
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
