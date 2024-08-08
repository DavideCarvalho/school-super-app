import { TRPCError } from "@trpc/server";
import slugify from "slugify";
import { z } from "zod";

import { StudentHasAssignment } from "@acme/db";

import * as academicPeriodService from "../service/academicPeriod.service";
import * as studentService from "../service/student.service";
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
          classId: input.classId,
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
            classId: input.classId,
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
  classesOnCalendarOnCurrentAcademicPeriod:
    isUserLoggedInAndAssignedToSchool.query(async ({ ctx, input }) => {
      const academicPeriod =
        await academicPeriodService.getCurrentOrLastActiveAcademicPeriod(
          ctx.session.school.id,
        );
      if (!academicPeriod) {
        return [];
      }
      return ctx.prisma.class.findMany({
        where: {
          schoolId: ctx.session.school.id,
          TeacherHasClass: {
            some: {
              CalendarSlot: {
                some: {
                  Calendar: {
                    academicPeriodId: academicPeriod.id,
                  },
                },
              },
            },
          },
        },
      });
    }),
  getStudentsWithPossibilityOfReprovingByAvoidanceForClassOnCurrentAcademicPeriod:
    isUserLoggedInAndAssignedToSchool
      .input(
        z.object({
          classId: z.string(),
          subjectId: z.string(),
          limit: z.number().optional().default(5),
          page: z.number().optional().default(1),
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

        const teacherHasClass = await ctx.prisma.teacherHasClass.findFirst({
          where: {
            classId: input.classId,
            isActive: true,
            Subject: {
              id: input.subjectId,
            },
            CalendarSlot: {
              some: {
                Calendar: {
                  academicPeriodId: academicPeriod.id,
                },
              },
            },
          },
        });

        if (!teacherHasClass) {
          return [];
        }

        const today = new Date();

        // Consultar todos os alunos matriculados no período acadêmico
        const students = await ctx.prisma.student.findMany({
          where: {
            StudentHasAcademicPeriod: {
              some: {
                academicPeriodId: academicPeriod.id,
              },
            },
          },
          include: {
            User: true,
          },
        });

        const failingStudents = [];

        for (const student of students) {
          // Calcular o número total de aulas que o aluno deveria ter assistido até hoje
          const totalClassesToDate = await ctx.prisma.attendance.count({
            where: {
              date: {
                lte: today,
              },
              CalendarSlot: {
                Calendar: {
                  academicPeriodId: academicPeriod.id,
                },
              },
            },
          });

          // Calcular o número total de presenças do aluno até hoje
          const totalAttendancesToDate =
            await ctx.prisma.studentHasAttendance.count({
              where: {
                studentId: student.id,
                present: true,
                Attendance: {
                  date: {
                    lte: today,
                  },
                  CalendarSlot: {
                    Calendar: {
                      academicPeriodId: academicPeriod.id,
                    },
                  },
                },
              },
            });

          // Calcular a porcentagem de presença até hoje
          const attendancePercentageToDate =
            totalClassesToDate > 0
              ? (totalAttendancesToDate / totalClassesToDate) * 100
              : 0;

          // Estimar o número total de aulas até o final do período acadêmico
          const totalClassesForPeriod =
            await academicPeriodService.getTeacherHasClassAmmountOfClassesOverAcademicPeriod(
              teacherHasClass.id,
              academicPeriod.id,
            );

          // Estimar o número total de presenças projetadas para o aluno até o final do período acadêmico
          const estimatedTotalAttendances = Math.round(
            (attendancePercentageToDate / 100) * totalClassesForPeriod,
          );

          // Verificar se o aluno costuma faltar perto de feriados
          const isHolidaySkipper =
            await studentService.checkIfStudentSkipsAroundHolidays(
              student.id,
              academicPeriod.id,
              today,
            );

          // Ajustar a previsão de faltas se o aluno costuma faltar perto de feriados
          let adjustedEstimatedTotalAttendances = estimatedTotalAttendances;
          if (isHolidaySkipper) {
            const holidayClasses =
              await academicPeriodService.countHolidayClasses(
                academicPeriod.id,
                student.id,
              );
            adjustedEstimatedTotalAttendances -= holidayClasses;
          }

          // Calcular a porcentagem de presença projetada ajustada
          const projectedAttendancePercentage =
            totalClassesForPeriod > 0
              ? (adjustedEstimatedTotalAttendances / totalClassesForPeriod) *
                100
              : 0;

          // Determinar se a porcentagem de presença projetada será inferior ao limite estabelecido
          if (projectedAttendancePercentage < 70) {
            failingStudents.push({
              student,
              projectedAttendancePercentage,
            });
          }
        }

        return failingStudents;
      }),
  getStudentsWithLessThanMinimumGrade: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        classId: z.string(),
        subjectId: z.string(),
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
      const school = ctx.session.school;
      const teacherHasClass = await ctx.prisma.teacherHasClass.findFirst({
        where: {
          classId: input.classId,
          isActive: true,
          Teacher: {
            User: {
              schoolId: ctx.session.school.id,
            },
          },
          Subject: {
            id: input.subjectId,
          },
        },
      });
      if (!teacherHasClass) {
        return [];
      }
      const students = await ctx.prisma.student.findMany({
        where: {
          StudentHasAcademicPeriod: {
            some: {
              academicPeriodId: academicPeriod.id,
              classId: input.classId,
            },
          },
          StudentHasAssignment: {
            some: {
              grade: {
                not: null,
              },
            },
          },
        },
        include: {
          StudentHasAssignment: true,
        },
      });
      const schoolGrandeAlgorithm =
        school.calculationAlgorithm === "AVERAGE"
          ? (studentGrades: StudentHasAssignment[]) => {
              const totalGrade = studentGrades.reduce(
                (acc, grade) => acc + grade.grade!,
                0,
              );
              return totalGrade / studentGrades.length;
            }
          : (studentGrades: StudentHasAssignment[]) => {
              const totalGrade = studentGrades.reduce(
                (acc, grade) => acc + grade.grade!,
                0,
              );
              return totalGrade;
            };
      return students
        .map((student) => {
          const studentGrades = student.StudentHasAssignment;
          return {
            student,
            grade: schoolGrandeAlgorithm(studentGrades),
          };
        })
        .filter(({ grade }) => grade < school.minimumGrade);
    }),
});
