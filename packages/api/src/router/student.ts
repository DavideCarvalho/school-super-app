import { clerkClient } from "@clerk/clerk-sdk-node";
import { TRPCError } from "@trpc/server";
import slugify from "slugify";
import { z } from "zod";

import * as academicPeriodService from "../service/academicPeriod.service";
import { createTRPCRouter, isUserLoggedInAndAssignedToSchool } from "../trpc";

export const studentRouter = createTRPCRouter({
  // TODO: Mudar isso daqui
  studentsWithCanteenLimitBySchoolId: isUserLoggedInAndAssignedToSchool.query(
    async ({ ctx }) => {
      // Essa query tenta achar
      // os usuários que podem comprar na cantina
      // a lógica é:
      // - Se o usuário não é um estudante, então pode comprar na cantina
      // - Se o usuário é um estudante, então pode comprar na cantina se ainda não passou
      //   do limite de compras mensal
      return ctx.prisma.$queryRaw<
        {
          id: string;
          userName: string;
        }[]
      >`
        SELECT U.id   as id,
              U.name as userName
        FROM User U
                INNER JOIN
            Role R
            ON
                U.roleId = R.id
                LEFT JOIN
            Student S
            ON
                S.id = U.id
        WHERE U.schoolId = ${ctx.session.school.id}
          AND (
            R.name != 'STUDENT'
                OR S.canteenLimit IS NULL
                OR (SELECT SUM(price) as month_total
                    FROM CanteenItemPurchased
                            INNER JOIN CanteenPurchase
                                        on CanteenItemPurchased.canteenPurchaseId = CanteenPurchase.id
                    WHERE MONTH(CanteenItemPurchased.createdAt) = MONTH(NOW())
                      AND YEAR(CanteenItemPurchased.createdAt) = YEAR(NOW())
                    GROUP BY CanteenPurchase.userId)
                < S.canteenLimit
            );
      `;
    },
  ),
  allBySchoolId: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        page: z.number().optional().default(1),
        size: z.number().optional().default(5),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.student.findMany({
        where: {
          User: {
            schoolId: ctx.session.school.id,
          },
        },
        take: input.size,
        skip: (input.page - 1) * input.size,
        include: {
          User: true,
          StudentHasResponsible: {
            include: {
              ResponsibleUser: true,
            },
          },
        },
      });
    }),
  countAllBySchoolId: isUserLoggedInAndAssignedToSchool.query(
    async ({ ctx }) => {
      return ctx.prisma.student.count({
        where: {
          User: {
            schoolId: ctx.session.school.id,
          },
        },
      });
    },
  ),
  studentById: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.student.findUnique({
        where: {
          id: input.id,
        },
        include: {
          User: true,
        },
      });
    }),
  createStudent: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        name: z.string(),
        email: z.string(),
        responsibles: z.array(
          z.object({
            name: z.string(),
            email: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const academicPeriod =
        await academicPeriodService.getCurrentOrLastActiveAcademicPeriod();
      if (!academicPeriod) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Não há período letivo ativo",
        });
      }
      const studentRole = await ctx.prisma.role.findFirst({
        where: {
          name: "STUDENT",
        },
      });
      if (!studentRole) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Função de estudante não encontrada",
        });
      }
      const responsibleRole = await ctx.prisma.role.findFirst({
        where: {
          name: "STUDENT_RESPONSIBLE",
        },
      });
      if (!responsibleRole) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Função de responsável não encontrada",
        });
      }
      const [firstName, ...rest] = input.name.split(" ");
      await clerkClient.users.createUser({
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
      const responsiblesToSave = [];
      for (const responsible of input.responsibles) {
        const [firstName, ...rest] = responsible.name.split(" ");
        await clerkClient.users.createUser({
          firstName: firstName,
          lastName: rest.join(" "),
          emailAddress: [responsible.email],
        });
        const countUserWithSameName = await ctx.prisma.user.count({
          where: {
            name: responsible.name,
          },
        });
        const countSuffix =
          countUserWithSameName > 0 ? `-${String(countUserWithSameName)}` : "";
        responsiblesToSave.push({
          name: responsible.name,
          email: responsible.email,
          schoolId: ctx.session.school.id,
          roleId: responsibleRole.id,
          slug: slugify(`${responsible.name}${countSuffix}`),
        });
      }
      const responsiblesSaved = await Promise.all(
        responsiblesToSave.map((responsible) =>
          ctx.prisma.user.create({ data: responsible }),
        ),
      );
      const student = await ctx.prisma.student.create({
        data: {
          User: {
            create: {
              name: input.name,
              email: input.email,
              schoolId: ctx.session.school.id,
              roleId: studentRole.id,
              slug: slugify(`${input.name}${countSuffix}`),
            },
          },
          StudentHasResponsible: {
            createMany: {
              data: responsiblesSaved.map((responsibleSaved) => ({
                responsibleId: responsibleSaved.id,
              })),
            },
          },
          StudentHasAcademicPeriod: {
            create: {
              academicPeriodId: academicPeriod.id,
            },
          },
        },
      });
      return student;
    }),
});
