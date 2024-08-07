import { clerkClient } from "@clerk/clerk-sdk-node";
import { TRPCError } from "@trpc/server";
import slugify from "slugify";
import { z } from "zod";

import * as academicPeriodService from "../service/academicPeriod.service";
import {
  createTRPCRouter,
  isUserLoggedInAndAssignedToSchool,
  publicProcedure,
} from "../trpc";
import { hoursToDate } from "../utils/hours-to-date";

export const teacherRouter = createTRPCRouter({
  getUniqueTeachers: isUserLoggedInAndAssignedToSchool.query(({ ctx }) => {
    return ctx.prisma.user.findMany({
      where: {
        active: true,
        schoolId: ctx.session.school.id,
        Role: {
          name: "TEACHER",
        },
      },
      distinct: ["name"],
    });
  }),
  findBySlug: isUserLoggedInAndAssignedToSchool
    .input(z.object({ slug: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.teacher.findFirst({
        where: { User: { slug: input.slug, schoolId: ctx.session.school.id } },
        include: {
          Classes: {
            include: {
              Subject: true,
              Class: true,
            },
            where: {
              isActive: true,
            },
          },
          User: true,
          Availabilities: true,
          Subjects: {
            include: {
              Subject: true,
            },
          },
        },
      });
    }),
  getClassesById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.teacherHasClass.findMany({
        where: { teacherId: input.id },
        include: {
          Class: true,
          Subject: true,
          Teacher: true,
        },
      });
    }),
  deleteById: isUserLoggedInAndAssignedToSchool
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const teacher = await ctx.prisma.teacher.findUnique({
        where: { id: input.userId, User: { schoolId: ctx.session.school.id } },
      });
      if (!teacher) {
        throw new Error(`Professor com id ${input.userId} não encontrado`);
      }
      await ctx.prisma.$transaction([
        ctx.prisma.teacherHasClass.deleteMany({
          where: {
            teacherId: input.userId,
            Teacher: { User: { schoolId: ctx.session.school.id } },
          },
        }),
        ctx.prisma.teacher.update({
          where: {
            id: input.userId,
            User: { schoolId: ctx.session.school.id },
          },
          data: {
            User: {
              update: {
                active: false,
              },
            },
          },
        }),
      ]);
    }),
  getTeachersAvailableDays: isUserLoggedInAndAssignedToSchool.query(
    async ({ ctx }) => {
      const teachersAvailabilities =
        await ctx.prisma.teacherAvailability.findMany({
          where: {
            Teacher: {
              User: {
                schoolId: ctx.session.school.id,
              },
            },
          },
          include: {
            Teacher: true,
          },
        });
      const teacherIds = teachersAvailabilities.map((t) => t.Teacher.id);
      const response: Record<string, typeof teachersAvailabilities> = {};
      for (const teacherId of teacherIds) {
        const currentTeacherAvailabilities = teachersAvailabilities.filter(
          (t) => t.teacherId === teacherId,
        );
        response[teacherId] = currentTeacherAvailabilities;
      }
      return response;
    },
  ),
  createTeacher: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        subjectIds: z.array(z.string()),
        availabilities: z.array(
          z.object({
            day: z.string(),
            startTime: z.string(),
            endTime: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const roleTeacher = await ctx.prisma.role.findFirst({
        where: { name: "TEACHER" },
      });
      if (!roleTeacher) throw new TRPCError({ code: "BAD_REQUEST" });

      const [firstName, ...rest] = input.name.split(" ");
      const createdUserOnClerk = await clerkClient.users.createUser({
        firstName,
        lastName: rest.join(" "),
        emailAddress: [input.email],
      });
      await ctx.prisma.teacher.create({
        data: {
          User: {
            create: {
              name: input.name,
              slug: slugify(input.name).toLowerCase(),
              email: input.email,
              roleId: roleTeacher.id,
              schoolId: ctx.session.school.id,
              externalAuthId: createdUserOnClerk.id,
            },
          },
          Availabilities: {
            createMany: {
              data: input.availabilities.map((availability) => ({
                day: availability.day,
                startTime: hoursToDate(availability.startTime),
                endTime: hoursToDate(availability.endTime),
              })),
            },
          },
          Subjects: {
            createMany: {
              data: input.subjectIds.map((subjectId) => ({
                subjectId,
              })),
            },
          },
        },
      });
    }),
  editTeacher: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
        availabilities: z.array(
          z.object({
            day: z.enum([
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
            ]),
            startTime: z.string(),
            endTime: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const teacher = await ctx.prisma.teacher.findFirst({
        where: { id: input.id, User: { schoolId: ctx.session.school.id } },
        include: {
          User: true,
        },
      });
      if (!teacher) throw new Error("Teacher not found");

      if (!teacher.User.externalAuthId)
        throw new Error("Teacher not found on Clerk");

      if (teacher.User.email !== input.email) {
        const userOnClerk = await clerkClient.users.getUser(
          teacher.User.externalAuthId,
        );

        if (!userOnClerk) throw new Error("Teacher not found on Clerk");

        await clerkClient.users.updateUser(teacher.User.externalAuthId, {
          primaryEmailAddressID: input.email,
        });
      }

      await ctx.prisma.teacher.update({
        where: { id: input.id },
        data: {
          User: {
            update: {
              name: input.name,
              slug: slugify(input.name).toLowerCase(),
              email: input.email,
            },
          },
        },
      });

      const availabilitiesIdsFound: string[] = [];
      for (const availability of input.availabilities) {
        const teacherAvailability =
          await ctx.prisma.teacherAvailability.findFirst({
            where: {
              teacherId: teacher.id,
              day: availability.day,
            },
          });
        if (!teacherAvailability) {
          const createdTeacherAvailability =
            await ctx.prisma.teacherAvailability.create({
              data: {
                teacherId: teacher.id,
                day: availability.day,
                startTime: availability.startTime,
                endTime: availability.endTime,
              },
            });
          availabilitiesIdsFound.push(createdTeacherAvailability.id);
        } else {
          const updatedTeacherAvailability =
            await ctx.prisma.teacherAvailability.update({
              where: {
                id: teacherAvailability.id,
              },
              data: {
                startTime: availability.startTime,
                endTime: availability.endTime,
              },
            });
          availabilitiesIdsFound.push(updatedTeacherAvailability.id);
        }
      }
    }),
  getSchoolTeachers: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        limit: z.number().optional().default(5),
        page: z.number().optional().default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.teacher.findMany({
        where: {
          User: {
            schoolId: ctx.session.school.id,
            Role: {
              name: "TEACHER",
            },
            active: true,
          },
        },
        take: input.limit,
        skip: (input.page - 1) * input.limit,
        include: {
          User: true,
          Availabilities: true,
          Classes: {
            include: {
              Class: true,
              Subject: true,
            },
          },
          Subjects: {
            include: {
              Subject: true,
            },
          },
        },
      });
    }),
  countSchoolTeachers: isUserLoggedInAndAssignedToSchool.query(
    async ({ ctx }) => {
      return ctx.prisma.teacher.count({
        where: {
          User: {
            schoolId: ctx.session.school.id,
            Role: {
              name: "TEACHER",
            },
            active: true,
          },
        },
      });
    },
  ),
  getTeacherSubjectsOnClassForCurrentAcademicPeriod:
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
          return [];
        }
        return ctx.prisma.subject.findMany({
          where: {
            TeacherHasClass: {
              some: {
                classId: input.classId,
                CalendarSlot: {
                  every: {
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
});
