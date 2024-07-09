import { z } from "zod";

import { sql } from "@acme/db";

import * as academicPeriodService from "../service/academicPeriod.service";
import { createTRPCRouter, isUserLoggedInAndAssignedToSchool } from "../trpc";

export const gradeRouter = createTRPCRouter({
  getStudentsGradesForClassOnCurrentAcademicPeriod:
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
          await academicPeriodService.getCurrentOrLastActiveAcademicPeriod();
        if (!academicPeriod) {
          return [];
        }

        const data = await ctx.prisma.$kysely
          .selectFrom("Student as s")
          .leftJoin("User as u", "s.id", "u.id")
          .leftJoin("StudentHasAssignment as sha", "s.id", "sha.studentId")
          .leftJoin("Assignment as a", "sha.assignmentId", "a.id")
          .leftJoin("TeacherHasClass as thc", "a.teacherHasClassId", "thc.id")
          .select([
            "s.id as studentId",
            "u.name as userName",
            "u.email as userEmail",
            sql<number>`SUM(sha.grade)`.as("studentTotalGrade"),
            sql<number>`SUM(a.grade)`.as("totalGrade"),
          ])
          .where("thc.classId", "=", input.classId)
          .where("thc.subjectId", "=", input.subjectId)
          .where("a.academicPeriodId", "=", academicPeriod.id)
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
  saveStudentsGradesForClassOnCurrentAcademicPeriod:
    isUserLoggedInAndAssignedToSchool
      .input(
        z.object({
          classId: z.string(),
          subjectId: z.string(),
          grades: z.array(
            z.object({
              studentId: z.string(),
              assignmentId: z.string(),
              grade: z.number().nullable().optional(),
            }),
          ),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const academicPeriod =
          await academicPeriodService.getCurrentOrLastActiveAcademicPeriod();
        if (!academicPeriod) {
          return;
        }
        await ctx.prisma.$transaction(async (tx) => {
          for (const grade of input.grades) {
            const existingStudentHasAssignment =
              await tx.studentHasAssignment.findFirst({
                where: {
                  Student: {
                    id: grade.studentId,
                  },
                  Assignment: {
                    id: grade.assignmentId,
                    academicPeriodId: academicPeriod.id,
                  },
                },
              });
            if (existingStudentHasAssignment) {
              await tx.studentHasAssignment.update({
                where: {
                  id: existingStudentHasAssignment.id,
                },
                data: {
                  grade: grade.grade,
                },
              });
            } else {
              await tx.studentHasAssignment.create({
                data: {
                  grade: grade.grade,
                  Student: {
                    connect: {
                      id: grade.studentId,
                    },
                  },
                  Assignment: {
                    connect: {
                      id: grade.assignmentId,
                      academicPeriodId: academicPeriod.id,
                    },
                  },
                },
              });
            }
          }
        });
      }),
});
