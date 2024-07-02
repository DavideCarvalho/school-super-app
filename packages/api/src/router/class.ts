import { differenceInBusinessDays, getYear, startOfYear } from "date-fns";
import slugify from "slugify";
import { z } from "zod";

import type { TeacherHasClass } from "@acme/db";
import { sql } from "@acme/db";

import { createTRPCRouter, isUserLoggedInAndAssignedToSchool } from "../trpc";

export const classRouter = createTRPCRouter({
  getStudentsGrades: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        classId: z.string(),
        limit: z.number().optional().default(5),
        page: z.number().optional().default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const defaultAcademicYearEndDate = new Date(
        new Date().getFullYear(),
        10,
        30,
      ); // 30 de novembro do ano corrente
      const defaultAcademicYearStartDate = new Date(
        new Date().getFullYear(),
        0,
        31,
      ); // 31 de janeiro do ano corrente
      const startOfCurrentYear = startOfYear(new Date());
      let firstDayOfClass = new Date(defaultAcademicYearStartDate);
      let lastDayOfClass = new Date(defaultAcademicYearEndDate);
      const latestAcademicPeriod = await ctx.prisma.academicPeriod.findFirst({
        where: {
          startDate: {
            gte: startOfCurrentYear,
          },
        },
        orderBy: {
          startDate: "desc",
        },
      });
      if (latestAcademicPeriod) {
        firstDayOfClass = new Date(latestAcademicPeriod.startDate);
        lastDayOfClass = new Date(latestAcademicPeriod.endDate);
      }
      if (!latestAcademicPeriod) {
        const firstClassDayOfCurrentYear = await ctx.prisma.classDay.findFirst({
          where: {
            date: {
              gte: startOfCurrentYear,
            },
          },
          orderBy: {
            date: "asc",
          },
        });
        if (firstClassDayOfCurrentYear) {
          firstDayOfClass = new Date(firstClassDayOfCurrentYear.date);
        }
      }

      const data = await ctx.prisma.$kysely
        .selectFrom("StudentAttendingClass as sac")
        .leftJoin("Student as s", "sac.studentId", "s.id")
        .leftJoin("User as u", "s.id", "u.id")
        .leftJoin("StudentHasAssignment as sha", "s.id", "sha.studentId")
        .leftJoin("Assignment as a", "sha.assignmentId", "a.id")
        .select([
          "s.id as studentId",
          "u.name as userName",
          "u.email as userEmail",
          sql<number>`SUM(sha.grade)`.as("studentTotalGrade"),
          sql<number>`SUM(a.value)`.as("totalGrade"),
        ])
        .where("sac.classId", "=", input.classId)
        .where("a.dueDate", ">=", firstDayOfClass)
        .where("a.dueDate", "<=", lastDayOfClass)
        .groupBy("s.id")
        .execute();

      return data.map((item) => ({
        Student: {
          id: item.studentId,
          User: {
            name: item.userName,
            email: item.userEmail,
          },
        },
        studentTotalGrade: item.studentTotalGrade,
        totalGrade: item.totalGrade,
      }));
    }),
  getClassAttendance: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        classId: z.string(),
        limit: z.number().optional().default(5),
        page: z.number().optional().default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const defaultAcademicYearEndDate = new Date(
        new Date().getFullYear(),
        10,
        30,
      ); // 30 de novembro do ano corrente
      const defaultAcademicYearStartDate = new Date(
        new Date().getFullYear(),
        0,
        31,
      ); // 31 de janeiro do ano corrente
      const startOfCurrentYear = startOfYear(new Date());
      let firstDayOfClass = new Date(defaultAcademicYearStartDate);
      let lastDayOfClass = new Date(defaultAcademicYearEndDate);
      const latestAcademicPeriod = await ctx.prisma.academicPeriod.findFirst({
        where: {
          startDate: {
            gte: startOfCurrentYear,
          },
        },
        orderBy: {
          startDate: "desc",
        },
      });
      if (latestAcademicPeriod) {
        firstDayOfClass = new Date(latestAcademicPeriod.startDate);
        lastDayOfClass = new Date(latestAcademicPeriod.endDate);
      }
      if (!latestAcademicPeriod) {
        const firstClassDayOfCurrentYear = await ctx.prisma.classDay.findFirst({
          where: {
            date: {
              gte: startOfCurrentYear,
            },
          },
          orderBy: {
            date: "asc",
          },
        });
        if (firstClassDayOfCurrentYear) {
          firstDayOfClass = new Date(firstClassDayOfCurrentYear.date);
        }
      }

      const totalClasses = differenceInBusinessDays(
        new Date(lastDayOfClass),
        new Date(firstDayOfClass),
      );

      const data = await ctx.prisma.$kysely
        .selectFrom("StudentAttendingClass as sac")
        .leftJoin(
          ctx.prisma.$kysely
            .selectFrom("StudentHasClassAttendance as shca")
            .leftJoin("Attendance as a", "shca.attendanceId", "a.id")
            .select([
              "shca.studentId",
              sql<number>`COUNT(shca.id)`.as("attendedClasses"),
            ])
            .where("a.createdAt", ">=", firstDayOfClass)
            .where("a.createdAt", "<=", lastDayOfClass)
            .groupBy("shca.studentId")
            .as("attended"),
          "sac.studentId",
          "attended.studentId",
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
          sql<number>`${totalClasses}`.as("totalClasses"),
          sql<number>`(COALESCE(attended.attendedClasses, 0) / ${totalClasses}) * 100`.as(
            "attendancePercentage",
          ),
        ])
        .where("sac.classId", "=", input.classId)
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
      const defaultAcademicYearStartDate = new Date(
        new Date().getFullYear(),
        0,
        31,
      ); // 31 de janeiro do ano corrente
      const startOfCurrentYear = startOfYear(new Date());
      let firstDayOfClass = new Date(defaultAcademicYearStartDate);
      const latestAcademicPeriod = await ctx.prisma.academicPeriod.findFirst({
        where: {
          startDate: {
            gte: startOfCurrentYear,
          },
        },
        orderBy: {
          startDate: "desc",
        },
      });
      if (latestAcademicPeriod) {
        firstDayOfClass = new Date(latestAcademicPeriod.startDate);
      }
      if (!latestAcademicPeriod) {
        const firstClassDayOfCurrentYear = await ctx.prisma.classDay.findFirst({
          where: {
            date: {
              gte: startOfCurrentYear,
            },
          },
          orderBy: {
            date: "asc",
          },
        });
        if (firstClassDayOfCurrentYear) {
          firstDayOfClass = new Date(firstClassDayOfCurrentYear.date);
        }
      }

      const response = await ctx.prisma.$kysely
        .selectFrom("StudentAttendingClass as sac")
        .select([sql<bigint>`COUNT(DISTINCT sac.studentId)`.as("totalCount")])
        .leftJoin("ClassDay as cd", "sac.classId", "cd.teacherHasClassId")
        .leftJoin("Attendance as a", "cd.id", "a.classDayId")
        .where("sac.classId", "=", input.classId)
        .where(sql`YEAR(a.createdAt)`, "=", getYear(firstDayOfClass))
        .execute();
      const totalCount = response[0]?.totalCount ?? 0n;
      return Number(totalCount);
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
          classId: input.classId,
          teacherHasClassId: teacherHasClass.id,
          description: input.description,
          academicPeriodId: latestAcademicPeriod.id,
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
      const latestAcademicPeriod = await ctx.prisma.academicPeriod.findFirst({
        where: {
          schoolId: ctx.session.school.id,
        },
        orderBy: {
          startDate: "desc",
        },
      });
      if (!latestAcademicPeriod) {
        return [];
      }
      return ctx.prisma.assignment.findMany({
        where: {
          TeacherHasClass: {
            teacherId: ctx.session.user.id,
            classId: input.classId,
            TeacherHasClassAcademicPeriod: {
              every: {
                academicPeriodId: latestAcademicPeriod.id,
              },
            },
            isActive: true,
          },
          academicPeriodId: latestAcademicPeriod.id,
        },
        take: input.limit,
        skip: (input.page - 1) * input.limit,
        include: {
          TeacherHasClass: {
            include: {
              Subject: true,
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
  countClassAssignments: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        classId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const latestAcademicPeriod = await ctx.prisma.academicPeriod.findFirst({
        where: {
          schoolId: ctx.session.school.id,
        },
        orderBy: {
          startDate: "desc",
        },
      });
      if (!latestAcademicPeriod) {
        return 0;
      }
      return ctx.prisma.assignment.count({
        where: {
          TeacherHasClass: {
            teacherId: ctx.session.user.id,
            classId: input.classId,
            TeacherHasClassAcademicPeriod: {
              every: {
                academicPeriodId: latestAcademicPeriod.id,
              },
            },
            isActive: true,
          },
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
