import { addDays, endOfDay, startOfDay } from "date-fns";
import { z } from "zod";

import { StudentHasAssignment } from "@acme/db";

import * as academicPeriodService from "../service/academicPeriod.service";
import * as studentService from "../service/student.service";
import { createTRPCRouter, isUserLoggedInAndAssignedToSchool } from "../trpc";

export const inteligenceRouter = createTRPCRouter({
  getPrintRequestsNotApprovedCloseToDueDate:
    isUserLoggedInAndAssignedToSchool.query(({ ctx }) => {
      const today = new Date();
      return ctx.prisma.printRequest.findMany({
        where: {
          dueDate: {
            lte: endOfDay(addDays(new Date(), 3)),
            gte: startOfDay(today),
          },
          status: "REQUESTED",
          User: {
            schoolId: ctx.session.school.id,
          },
        },
      });
    }),
  getPrintRequestsToPrintToday: isUserLoggedInAndAssignedToSchool.query(
    ({ ctx }) => {
      const today = new Date();
      return ctx.prisma.printRequest.findMany({
        where: {
          dueDate: {
            lte: endOfDay(today),
            gte: startOfDay(today),
          },
          User: {
            schoolId: ctx.session.school.id,
          },
        },
      });
    },
  ),
  getPrintRequestsOwnerUserNeedToReview:
    isUserLoggedInAndAssignedToSchool.query(({ ctx }) => {
      return ctx.prisma.printRequest.findMany({
        where: {
          status: "REVIEW",
          userId: ctx.session.user.id,
          User: {
            schoolId: ctx.session.school.id,
          },
        },
      });
    }),
  getStudentsWithPossibilityOfReprovingByAvoidanceOnCurrentAcademicPeriod:
    isUserLoggedInAndAssignedToSchool
      .input(
        z.object({
          limit: z.number().optional().default(5),
          page: z.number().optional().default(1),
        }),
      )
      .query(async ({ ctx }) => {
        const academicPeriod =
          await academicPeriodService.getCurrentOrLastActiveAcademicPeriod(
            ctx.session.school.id,
          );

        if (!academicPeriod) {
          return [];
        }

        const teacherHasClasses = await ctx.prisma.teacherHasClass.findMany({
          where: {
            isActive: true,
            CalendarSlot: {
              some: {
                Calendar: {
                  academicPeriodId: academicPeriod.id,
                },
              },
            },
          },
          include: {
            Subject: true,
          },
        });

        if (!teacherHasClasses || teacherHasClasses.length === 0) {
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
          const classesToReprove = [];

          for (const teacherHasClass of teacherHasClasses) {
            // Calcular o número total de aulas que o aluno deveria ter assistido até hoje para essa matéria
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
                StudentHasAttendance: {
                  some: {
                    Attendance: {
                      CalendarSlot: {
                        Calendar: {
                          academicPeriodId: academicPeriod.id,
                        },
                        teacherHasClassId: teacherHasClass.id,
                      },
                    },
                  },
                },
              },
            });

            // Calcular o número total de presenças do aluno até hoje para essa matéria
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
                      teacherHasClassId: teacherHasClass.id,
                    },
                  },
                },
              });

            // Calcular a porcentagem de presença até hoje para essa matéria
            const attendancePercentageToDate =
              totalClassesToDate > 0
                ? (totalAttendancesToDate / totalClassesToDate) * 100
                : 0;

            // Estimar o número total de aulas até o final do período acadêmico para essa matéria
            const totalClassesForPeriod =
              await academicPeriodService.getTeacherHasClassAmmountOfClassesOverAcademicPeriod(
                teacherHasClass.id,
                academicPeriod.id,
              );

            // Estimar o número total de presenças projetadas para o aluno até o final do período acadêmico para essa matéria
            const estimatedTotalAttendances = Math.round(
              (attendancePercentageToDate / 100) * totalClassesForPeriod,
            );

            // Verificar se o aluno costuma faltar perto de feriados para essa matéria
            const isHolidaySkipper =
              await studentService.checkIfStudentSkipsAroundHolidays(
                student.id,
                academicPeriod.id,
                today,
              );

            // Ajustar a previsão de faltas se o aluno costuma faltar perto de feriados para essa matéria
            let adjustedEstimatedTotalAttendances = estimatedTotalAttendances;
            if (isHolidaySkipper) {
              const holidayClasses =
                await academicPeriodService.countHolidayClasses(
                  academicPeriod.id,
                  student.id,
                );
              adjustedEstimatedTotalAttendances -= holidayClasses;
            }

            // Calcular a porcentagem de presença projetada ajustada para essa matéria
            const projectedAttendancePercentage =
              totalClassesForPeriod > 0
                ? (adjustedEstimatedTotalAttendances / totalClassesForPeriod) *
                  100
                : 0;

            // Se a porcentagem projetada for inferior a 70%, adicionar a matéria à lista de possíveis reprovações
            if (projectedAttendancePercentage < 70) {
              classesToReprove.push({
                id: teacherHasClass.id,
                name: teacherHasClass.Subject.name,
              });
            }
          }

          if (classesToReprove.length > 0) {
            failingStudents.push({
              id: student.id,
              name: student.User.name,
              classesToReprove,
            });
          }
        }

        return failingStudents;
      }),
  getStudentsWithLessThanMinimumGrade: isUserLoggedInAndAssignedToSchool.query(
    async ({ ctx }) => {
      const academicPeriod =
        await academicPeriodService.getCurrentOrLastActiveAcademicPeriod(
          ctx.session.school.id,
        );
      if (!academicPeriod) {
        return [];
      }
      const school = ctx.session.school;
      const teacherHasClasses = await ctx.prisma.teacherHasClass.findMany({
        where: {
          isActive: true,
          Teacher: {
            User: {
              schoolId: ctx.session.school.id,
            },
          },
        },
        include: {
          Subject: true,
        },
      });
      if (!teacherHasClasses.length) {
        return [];
      }
      const students = await ctx.prisma.student.findMany({
        where: {
          StudentHasAcademicPeriod: {
            some: {
              academicPeriodId: academicPeriod.id,
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
          StudentHasAssignment: {
            include: {
              Assignment: true,
            },
          },
          User: true,
        },
      });
      const schoolGradeAlgorithm =
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
          const subjectsWithLowGrades = [];

          for (const teacherHasClass of teacherHasClasses) {
            const studentGrades = student.StudentHasAssignment.filter(
              ({ Assignment }) =>
                Assignment.teacherHasClassId === teacherHasClass.id,
            );

            const grade = schoolGradeAlgorithm(studentGrades);

            if (grade < school.minimumGrade) {
              subjectsWithLowGrades.push({
                id: teacherHasClass.Subject.id,
                name: teacherHasClass.Subject.name,
              });
            }
          }

          return {
            id: student.id,
            name: student.User.name,
            subjectsWithLowGrades,
          };
        })
        .filter((student) => student.subjectsWithLowGrades.length > 0);
    },
  ),
});
