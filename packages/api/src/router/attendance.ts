import { differenceInBusinessDays } from "date-fns";
import { z } from "zod";

import { sql } from "@acme/db";

import * as academicPeriodService from "../service/academicPeriod.service";
import { createTRPCRouter, isUserLoggedInAndAssignedToSchool } from "../trpc";

export const attendanceRouter = createTRPCRouter({
  getClassAttendanceForCurrentAcademicPeriod: isUserLoggedInAndAssignedToSchool
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
      const totalClasses = differenceInBusinessDays(
        new Date(academicPeriod.startDate),
        new Date(academicPeriod.endDate),
      );

      const data = await ctx.prisma.$kysely
        .selectFrom("StudentAttendingClass as sac")
        .leftJoin(
          ctx.prisma.$kysely
            .selectFrom("StudentHasClassAttendance as shca")
            .leftJoin("Attendance as a", "shca.attendanceId", "a.id")
            .leftJoin("CalendarSlot as cs", "a.calendarSlotId", "cs.id")
            .leftJoin("Calendar as c", "cs.calendarId", "c.id")
            .leftJoin(
              "CalendarHasAcademicPeriod as chap",
              "c.id",
              "chap.calendarId",
            )
            .select([
              "shca.studentId",
              sql<number>`COUNT(shca.id)`.as("attendedClasses"),
            ])
            .where("chap.academicPeriodId", "=", academicPeriod.id)
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
});
