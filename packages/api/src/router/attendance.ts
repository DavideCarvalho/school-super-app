import { differenceInBusinessDays } from "date-fns";
import { z } from "zod";

import type { Subject, Teacher, TeacherHasClass, User } from "@acme/db";

import * as academicPeriodService from "../service/academicPeriod.service";
import { createTRPCRouter, isUserLoggedInAndAssignedToSchool } from "../trpc";

export const attendanceRouter = createTRPCRouter({
  getClassAttendanceForCurrentAcademicPeriod: isUserLoggedInAndAssignedToSchool
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

      const rawData = await ctx.prisma.student.findMany({
        where: {
          StudentHasAcademicPeriod: {
            some: {
              academicPeriodId: academicPeriod.id,
            },
          },
        },
        include: {
          User: true,
          StudentHasAttendance: {
            include: {
              Student: {
                include: {
                  User: true,
                },
              },
              Attendance: {
                include: {
                  CalendarSlot: {
                    include: {
                      TeacherHasClass: {
                        where: {
                          classId: input.classId,
                          subjectId: input.subjectId,
                        },
                        include: {
                          Subject: true,
                          Teacher: {
                            include: {
                              User: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      });

      const attendanceData = [];

      for (const student of rawData) {
        const totalAttendanceMap = new Map<
          string,
          {
            TeacherHasClass: TeacherHasClass & {
              Subject: Subject;
              Teacher: Teacher & {
                User: User;
              };
            };
            attendanceNumber: number;
          }
        >();

        for (const studentAttendance of student.StudentHasAttendance) {
          const { CalendarSlot } = studentAttendance.Attendance;
          const { TeacherHasClass } = CalendarSlot;

          if (TeacherHasClass) {
            const key = TeacherHasClass.id;

            if (!totalAttendanceMap.has(key)) {
              totalAttendanceMap.set(key, {
                TeacherHasClass: TeacherHasClass,
                attendanceNumber: 0,
              });
            }

            const attendanceData = totalAttendanceMap.get(key);
            if (attendanceData) {
              attendanceData.attendanceNumber++;
            }
          }
        }

        const attendancePerTeacherHasClass = [];
        let totalAttendanceNumber = 0;

        for (const [key, value] of totalAttendanceMap) {
          const totalClasses =
            await academicPeriodService.getTeacherHasClassAmmountOfClassesOverAcademicPeriod(
              key,
              academicPeriod.id,
            );
          const attendancePercentage =
            totalClasses > 0
              ? (value.attendanceNumber / totalClasses) * 100
              : 0;

          attendancePerTeacherHasClass.push({
            TeacherHasClass: value.TeacherHasClass,
            attendancePercentage,
            attendanceNumber: value.attendanceNumber,
          });

          totalAttendanceNumber += value.attendanceNumber;
        }

        const totalClassesOverall = attendancePerTeacherHasClass.reduce(
          (acc, curr) => acc + curr.TeacherHasClass.subjectQuantity,
          0,
        );
        const totalAttendancePercentage =
          totalClassesOverall > 0
            ? (totalAttendanceNumber / totalClassesOverall) * 100
            : 0;

        student;

        attendanceData.push({
          Student: student,
          totalAttendancePercentage,
          totalAttendanceNumber,
          attendancePerTeacherHasClass,
        });
      }
      return attendanceData;
    }),
});
