import clerk from "@clerk/clerk-sdk-node";
import slugify from "slugify";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  countAllBySchoolId: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        role: z
          .union([
            z.literal("DIRECTOR"),
            z.literal("COORDINATOR"),
            z.literal("TEACHER"),
            z.literal("SCHOOL_WORKER"),
          ])
          .optional(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.user.count({
        where: { schoolId: input.schoolId, Role: { name: input.role } },
      });
    }),
  allBySchoolId: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(5),
        role: z
          .union([
            z.literal("DIRECTOR"),
            z.literal("COORDINATOR"),
            z.literal("TEACHER"),
            z.literal("SCHOOL_WORKER"),
          ])
          .optional(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.user.findMany({
        where: { schoolId: input.schoolId, Role: { name: input.role } },
        include: { Role: true },
        take: input.limit,
        skip: (input.page - 1) * input.limit,
      });
    }),
  createWorker: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        name: z.string(),
        email: z.string().email(),
        roleName: z.union([
          z.literal("DIRECTOR"),
          z.literal("COORDINATOR"),
          z.literal("TEACHER"),
          z.literal("SCHOOL_WORKER"),
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const role = await ctx.prisma.role.findFirst({
        where: { name: input.roleName },
      });
      if (!role) throw new Error("Role not found");
      const [firstName, ...rest] = input.name.split(" ");
      try {
      } catch (e) {}
      return await ctx.prisma.$transaction(async (tx) => {
        const worker = await tx.user.create({
          data: {
            schoolId: input.schoolId,
            name: input.name,
            slug: slugify(input.name),
            email: input.email,
            roleId: role.id,
          },
        });
        if (role.name === "TEACHER") {
          await tx.teacher.create({
            data: {
              User: {
                connect: {
                  id: worker.id,
                },
              },
            },
          });
        }
        await clerk.users.createUser({
          firstName: firstName,
          lastName: rest.join(" "),
          emailAddress: [input.email],
        });
        return worker;
      });
    }),
  editWorker: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        userId: z.string(),
        name: z.string(),
        email: z.string().email(),
        roleName: z.union([
          z.literal("DIRECTOR"),
          z.literal("COORDINATOR"),
          z.literal("TEACHER"),
          z.literal("SCHOOL_WORKER"),
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const role = await ctx.prisma.role.findFirst({
        where: { name: input.roleName },
      });
      if (!role) throw new Error("Role not found");
      const user = await ctx.prisma.user.findFirst({
        where: { id: input.userId, schoolId: input.schoolId },
      });
      if (!user) throw new Error("User not found");
      const users = await clerk.users.getUserList();
      const userOnClerk = users.find((u) =>
        u.emailAddresses.find((email) => email.emailAddress === user.email),
      );
      if (!userOnClerk) throw new Error("User not found on Clerk");
      if (user.email !== input.email) {
        await clerk.users.deleteUser(userOnClerk.id);
        await clerk.users.createUser({
          firstName: input.name.split(" ")[0],
          lastName: input.name.split(" ").slice(1).join(" "),
          emailAddress: [input.email],
        });
      } else {
        await clerk.users.updateUser(userOnClerk.id, {
          firstName: input.name.split(" ")[0],
          lastName: input.name.split(" ").slice(1).join(" "),
        });
      }
      await ctx.prisma.user.update({
        where: { id: input.userId },
        data: {
          name: input.name,
          slug: slugify(input.name),
          email: input.email,
          roleId: role.id,
        },
      });
    }),
  deleteById: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findFirst({
        where: { id: input.userId, schoolId: input.schoolId },
      });
      if (!user) throw new Error("User not found");
      const users = await clerk.users.getUserList();
      const userOnClerk = users.find((u) =>
        u.emailAddresses.find((email) => email.emailAddress === user.email),
      );
      if (!userOnClerk) throw new Error("User not found on Clerk");
      await clerk.users.deleteUser(userOnClerk.id);
      await ctx.prisma.user.delete({
        where: { id: input.userId },
      });
    }),
});
