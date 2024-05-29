import { clerkClient } from "@clerk/clerk-sdk-node";
import slugify from "slugify";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const teacherRouter = createTRPCRouter({
  findBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.teacher.findFirst({
        where: { User: { slug: input.slug } },
        include: {
          User: true,
          TeacherAvailability: true,
          TeacherHasClasses: {
            where: {
              active: true,
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
  deleteById: publicProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const teacher = await ctx.prisma.teacher.findUnique({
        where: { id: input.userId },
      });
      if (!teacher) {
        throw new Error(`Professor com id ${input.userId} não encontrado`);
      }
      await ctx.prisma.$transaction([
        ctx.prisma.teacherHasClass.deleteMany({
          where: { teacherId: input.userId },
        }),
        ctx.prisma.teacher.delete({
          where: { id: input.userId },
        }),
      ]);
    }),
  getTeachersAvailableDays: publicProcedure
    .input(z.object({ schoolId: z.string() }))
    .query(async ({ ctx, input }) => {
      const teachersAvailabilities =
        await ctx.prisma.teacherAvailability.findMany({
          where: {
            Teacher: {
              User: {
                schoolId: input.schoolId,
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
    }),
  createTeacher: publicProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        schoolId: z.string(),
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
      console.log(ctx.session);
      try {
        const roleTeacher = await ctx.prisma.role.findFirst({
          where: { name: "TEACHER" },
        });
        if (!roleTeacher) throw new Error("Role not found");

        const [firstName, ...rest] = input.name.split(" ");
        const createdUserOnClerk = await clerkClient.users.createUser({
          firstName,
          lastName: rest.join(" "),
          emailAddress: [input.email],
        });
        const teacher = await ctx.prisma.teacher.create({
          data: {
            User: {
              create: {
                name: input.name,
                slug: slugify(input.name),
                email: input.email,
                roleId: roleTeacher.id,
                schoolId: input.schoolId,
                externalAuthId: createdUserOnClerk.id,
              },
            },
          },
        });
        await ctx.prisma.teacherAvailability.createMany({
          data: input.availabilities.map((availability) => ({
            teacherId: teacher.id,
            day: availability.day,
            startTime: availability.startTime,
            endTime: availability.endTime,
          })),
        });
      } catch (error) {
        console.log(error);
      }
    }),
  getSchoolTeachers: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        limit: z.number().optional().default(5),
        page: z.number().optional().default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.teacher.findMany({
        where: {
          User: {
            schoolId: input.schoolId,
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
          TeacherAvailability: true,
          TeacherHasSubject: {
            include: {
              Subject: true,
            },
          },
          TeacherHasClasses: {
            include: {
              Class: true,
            },
          },
        },
      });
    }),
  countSchoolTeachers: publicProcedure
    .input(z.object({ schoolId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.teacher.count({
        where: {
          User: {
            schoolId: input.schoolId,
            Role: {
              name: "TEACHER",
            },
            active: true,
          },
        },
      });
    }),
});
