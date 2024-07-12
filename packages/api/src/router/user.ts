import { clerkClient } from "@clerk/clerk-sdk-node";
import slugify from "slugify";
import { z } from "zod";

import type { Prisma } from "@acme/db";

import {
  createTRPCRouter,
  isUserLoggedInAndAssignedToSchool,
  publicProcedure,
} from "../trpc";

export const userRouter = createTRPCRouter({
  countAllBySchoolId: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        roles: z.array(z.string()).min(1).optional(),
      }),
    )
    .query(({ ctx, input }) => {
      let where: Prisma.UserWhereInput = {
        schoolId: ctx.session.school.id,
        active: true,
        Role: {
          name: {
            notIn: [
              "STUDENT",
              "CONNECTAPROF_USER",
              "STUDENT_RESPONSIBLE",
              "ADMIN",
            ],
          },
        },
      };
      if (input.roles) {
        where = {
          ...where,
          Role: {
            name: {
              in: input.roles,
            },
          },
        };
      }
      return ctx.prisma.user.count({
        where,
      });
    }),
  allBySchoolId: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        page: z.number().optional().default(1),
        size: z.number().optional().default(10),
        roles: z.array(z.string()).min(1).optional(),
      }),
    )
    .query(({ ctx, input }) => {
      let where: Prisma.UserWhereInput = {
        schoolId: ctx.session.school.id,
        active: true,
        Role: {
          name: {
            notIn: [
              "STUDENT",
              "CONNECTAPROF_USER",
              "STUDENT_RESPONSIBLE",
              "ADMIN",
            ],
          },
        },
      };
      if (input.roles) {
        where = {
          ...where,
          Role: {
            name: {
              in: input.roles,
            },
          },
        };
      }
      return ctx.prisma.user.findMany({
        where,
        take: input.size,
        skip: (input.page - 1) * input.size,
        include: { Role: true },
      });
    }),
  findBySlug: isUserLoggedInAndAssignedToSchool
    .input(z.object({ slug: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.user.findFirst({
        where: {
          slug: input.slug,
          schoolId: ctx.session.school.id,
          active: true,
        },
        include: {
          Role: true,
        },
      });
    }),
  createWorker: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        roleId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const role = await ctx.prisma.role.findFirst({
        where: { id: input.roleId },
      });
      if (!role) throw new Error("Role not found");
      const [firstName, ...rest] = input.name.split(" ");
      return await ctx.prisma.$transaction(async (tx) => {
        const createdUserOnClerk = await clerkClient.users.createUser({
          firstName: firstName,
          lastName: rest.join(" "),
          emailAddress: [input.email],
        });
        const countUserWithSameName = await ctx.prisma.user.count({
          where: {
            name: input.name,
          },
        });
        const countSuffix =
          countUserWithSameName > 0 ? `-${String(countUserWithSameName)}` : "";
        const worker = await tx.user.create({
          data: {
            schoolId: ctx.session.school.id,
            name: input.name,
            slug: slugify(`${input.name}${countSuffix}`).toLowerCase(),
            email: input.email,
            roleId: role.id,
            externalAuthId: createdUserOnClerk.id,
          },
        });
        return worker;
      });
    }),
  editWorker: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        userId: z.string(),
        name: z.string(),
        email: z.string().email(),
        roleId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const role = await ctx.prisma.role.findFirst({
        where: { id: input.roleId },
      });
      if (!role) throw new Error("Role not found");
      const user = await ctx.prisma.user.findFirst({
        where: { id: input.userId, schoolId: ctx.session.school.id },
      });
      if (!user) throw new Error("User not found");
      if (!user.externalAuthId) throw new Error("User not found on Clerk");
      const userOnClerk = await clerkClient.users.getUser(user.externalAuthId);
      if (!userOnClerk) throw new Error("User not found on Clerk");
      let userExternalAuthId = user.externalAuthId;
      if (user.email !== input.email) {
        await clerkClient.users.deleteUser(userOnClerk.id);
        const createdUserOnClerk = await clerkClient.users.createUser({
          firstName: input.name.split(" ")[0],
          lastName: input.name.split(" ").slice(1).join(" "),
          emailAddress: [input.email],
        });
        userExternalAuthId = createdUserOnClerk.id;
      } else {
        await clerkClient.users.updateUser(userOnClerk.id, {
          firstName: input.name.split(" ")[0],
          lastName: input.name.split(" ").slice(1).join(" "),
        });
      }
      const countUserWithSameName = await ctx.prisma.user.count({
        where: {
          name: input.name,
        },
      });
      const countSuffix =
        countUserWithSameName > 0 ? `-${String(countUserWithSameName)}` : "";
      await ctx.prisma.user.update({
        where: { id: input.userId },
        data: {
          name: input.name,
          slug: slugify(`${input.name}${countSuffix}`).toLowerCase(),
          email: input.email,
          roleId: role.id,
          externalAuthId: userExternalAuthId,
        },
      });
    }),
  deleteById: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findFirst({
        where: { id: input.userId, schoolId: ctx.session.school.id },
      });
      if (!user) throw new Error("User not found");
      if (!user.externalAuthId) throw new Error("User not found on Clerk");
      const userOnClerk = await clerkClient.users.getUser(user.externalAuthId);
      if (!userOnClerk) throw new Error("User not found on Clerk");
      await clerkClient.users.deleteUser(userOnClerk.id);
      await ctx.prisma.user.update({
        where: { id: input.userId },
        data: {
          active: false,
        },
      });
    }),
  editConectaProfUser: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findFirst({
        where: { id: input.userId },
      });
      if (!user) throw new Error("User not found");
      if (!user.externalAuthId) throw new Error("User not found on Clerk");
      const userOnClerk = await clerkClient.users.getUser(user.externalAuthId);
      if (!userOnClerk) throw new Error("User not found on Clerk");
      await clerkClient.users.updateUser(userOnClerk.id, {
        firstName: input.name.split(" ")[0],
        lastName: input.name.split(" ").slice(1).join(" "),
        publicMetadata: {
          name: input.name,
        },
      });
      const countUsersWithSameName = await ctx.prisma.user.count({
        where: {
          name: input.name,
        },
      });
      const countSuffix =
        countUsersWithSameName > 0 ? `-${String(countUsersWithSameName)}` : "";
      await ctx.prisma.user.update({
        where: { id: input.userId },
        data: {
          name: input.name,
          slug: slugify(`${input.name}${countSuffix}`).toLowerCase(),
          imageUrl: userOnClerk.imageUrl,
        },
      });
    }),
  getUserById: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.user.findFirst({
        where: { id: input.userId },
      });
    }),
});
