import clerk from "@clerk/clerk-sdk-node";
import slugify from "slugify";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const canteenRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        responsibleEmail: z.string(),
        responsibleName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const roleCanteenWorker = await ctx.prisma.role.findFirst({
        where: {
          name: "CANTEEN_WORKER",
        },
      });
      if (!roleCanteenWorker) throw new Error("Role not found");

      const [firstName, ...rest] = input.responsibleName.split(" ");
      await clerk.users.createUser({
        firstName,
        lastName: rest.join(" "),
        emailAddress: [input.responsibleEmail],
      });
      const canteenResponsibleUser = await ctx.prisma.user.create({
        data: {
          schoolId: input.schoolId,
          name: input.responsibleName,
          slug: slugify(input.responsibleName),
          email: input.responsibleEmail,
          roleId: roleCanteenWorker.id,
        },
      });
      await ctx.prisma.canteen.create({
        data: {
          schoolId: input.schoolId,
          responsibleUserId: canteenResponsibleUser.id,
        },
      });
    }),
  allBySchoolId: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(5),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.canteen.findMany({
        where: {
          schoolId: input.schoolId,
        },
        take: input.limit,
        skip: (input.page - 1) * input.limit,
        include: {
          ResponsibleUser: true,
        },
      });
    }),
  countAllBySchoolId: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.canteen.count({
        where: {
          schoolId: input.schoolId,
        },
      });
    }),
  addCanteenItem: publicProcedure
    .input(
      z.object({
        canteenId: z.string(),
        name: z.string(),
        price: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.canteenItem.create({
        data: {
          canteenId: input.canteenId,
          name: input.name,
          price: input.price,
        },
      });
    }),
  allCanteenItems: publicProcedure
    .input(
      z.object({
        canteenId: z.string(),
        limit: z.number().optional().default(5),
        page: z.number().optional().default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.canteenItem.findMany({
        where: {
          canteenId: input.canteenId,
        },
        take: input.limit,
        skip: (input.page - 1) * input.limit,
      });
    }),
  countAllCanteenItems: publicProcedure
    .input(
      z.object({
        canteenId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.canteenItem.count({
        where: {
          canteenId: input.canteenId,
        },
      });
    }),
  deleteById: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.canteen.delete({
        where: {
          id: input.id,
        },
      });
    }),
  sellItem: publicProcedure
    .input(
      z.object({
        canteenId: z.string(),
        itemId: z.string(),
        quantity: z.number(),
        studentId: z.string(),
        payed: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.prisma.canteenItem.findFirst({
        where: {
          id: input.itemId,
        },
      });
      if (!item) throw new Error("Item not found");
      const student = await ctx.prisma.student.findFirst({
        where: {
          id: input.studentId,
        },
      });
      if (!student) throw new Error("Student not found");
      await ctx.prisma.studentCanteenItemPurchase.create({
        data: {
          canteenItemId: item.id,
          studentId: student.id,
          quantity: input.quantity,
          price: item.price,
          payed: input.payed,
        },
      });
    }),
  allCanteenSells: publicProcedure
    .input(
      z.object({
        canteenId: z.string(),
        limit: z.number().optional().default(5),
        page: z.number().optional().default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.studentCanteenItemPurchase.findMany({
        where: {
          CanteenItem: {
            canteenId: input.canteenId,
          },
        },
        take: input.limit,
        skip: (input.page - 1) * input.limit,
        orderBy: {
          createdAt: "desc",
        },
      });
    }),
  countAllCanteenSells: publicProcedure
    .input(
      z.object({
        canteenId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.studentCanteenItemPurchase.count({
        where: {
          CanteenItem: {
            canteenId: input.canteenId,
          },
        },
      });
    }),
  canteenSellsByMonth: publicProcedure
    .input(
      z.object({
        canteenId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const data = await ctx.prisma.$queryRaw<
        {
          totalPrice: number;
          month: string;
          count: bigint;
          payed: 0 | 1;
        }[]
      >`
        SELECT SUM(quantity * price) as totalPrice,
              CONCAT(
                      UPPER(SUBSTR(MONTHNAME(createdAt), 1, 1)),
                      LOWER(SUBSTR(MONTHNAME(createdAt), 2))
              )                     as month,
              COUNT(*)              as count
        FROM StudentCanteenItemPurchase
        WHERE canteenItemId IN (SELECT id
                                FROM CanteenItem
                                WHERE canteenId = ${input.canteenId})
          AND createdAt > NOW() - INTERVAL 1 YEAR
        GROUP BY YEAR(createdAt), MONTH(createdAt), month;
      `;
      return data.map((d) => ({
        month: d.month,
        totalPrice: d.totalPrice,
        count: Number(d.count),
        payed: d.payed === 1,
      }));
    }),
});
