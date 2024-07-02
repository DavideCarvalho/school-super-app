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
            sql<number>`SUM(a.grade)`.as("totalGrade"),
          ])
          .where("sac.classId", "=", input.classId)
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
});
