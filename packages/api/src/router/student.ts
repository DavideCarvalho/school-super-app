import { clerkClient } from "@clerk/clerk-sdk-node";
import { TRPCError } from "@trpc/server";
import slugify from "slugify";
import { z } from "zod";

import { User } from "@acme/db";

import * as academicPeriodService from "../service/academicPeriod.service";
import { createTRPCRouter, isUserLoggedInAndAssignedToSchool } from "../trpc";

export const studentRouter = createTRPCRouter({
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
        classId: z.string(),
        responsibles: z.array(
          z.object({
            name: z.string(),
            email: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.$transaction(async (tx) => {
        const academicPeriod =
          await academicPeriodService.getCurrentOrLastActiveAcademicPeriod();
        if (!academicPeriod) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Não há período letivo ativo",
          });
        }
        const studentRole = await tx.role.findFirst({
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
        const responsibleRole = await tx.role.findFirst({
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
        const userOnClerk = await clerkClient.users.createUser({
          firstName: firstName,
          lastName: rest.join(" "),
          emailAddress: [input.email],
        });
        const countUserWithSameName = await tx.user.count({
          where: {
            name: input.name,
          },
        });
        const countSuffix =
          countUserWithSameName > 0 ? `-${String(countUserWithSameName)}` : "";
        const responsiblesToSave = [];
        for (const responsible of input.responsibles) {
          const [firstName, ...rest] = responsible.name.split(" ");
          const responsibleOnClerk = await clerkClient.users.createUser({
            firstName: firstName,
            lastName: rest.join(" "),
            emailAddress: [responsible.email],
          });
          const countUserWithSameName = await tx.user.count({
            where: {
              name: responsible.name,
            },
          });
          const countSuffix =
            countUserWithSameName > 0
              ? `-${String(countUserWithSameName)}`
              : "";
          responsiblesToSave.push({
            name: responsible.name,
            email: responsible.email,
            schoolId: ctx.session.school.id,
            roleId: responsibleRole.id,
            slug: slugify(`${responsible.name}${countSuffix}`).toLowerCase(),
            externalAuthId: responsibleOnClerk.id,
          });
        }
        const responsiblesSaved = await Promise.all(
          responsiblesToSave.map((responsible) =>
            tx.user.create({ data: responsible }),
          ),
        );
        const student = await tx.student.create({
          data: {
            User: {
              create: {
                name: input.name,
                email: input.email,
                schoolId: ctx.session.school.id,
                roleId: studentRole.id,
                slug: slugify(`${input.name}${countSuffix}`).toLowerCase(),
                externalAuthId: userOnClerk.id,
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
                classId: input.classId,
              },
            },
          },
        });
        return student;
      });
    }),
  findBySlug: isUserLoggedInAndAssignedToSchool
    .input(z.object({ slug: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.student.findFirst({
        where: {
          User: {
            slug: input.slug,
            schoolId: ctx.session.school.id,
          },
        },
        include: {
          User: true,
          StudentHasResponsible: {
            include: {
              ResponsibleUser: true,
            },
          },
          StudentHasAcademicPeriod: {
            include: {
              AcademicPeriod: true,
            },
          },
        },
      });
    }),
  editStudent: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        studentId: z.string(),
        name: z.string(),
        email: z.string(),
        classId: z.string().optional(),
        responsibles: z
          .array(
            z.object({
              name: z.string(),
              email: z.string(),
            }),
          )
          .min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.$transaction(async (tx) => {
        const student = await tx.student.findUnique({
          where: {
            id: input.studentId,
          },
          include: {
            User: true,
            StudentHasResponsible: {
              include: {
                ResponsibleUser: true,
              },
            },
            StudentHasAcademicPeriod: {
              include: {
                AcademicPeriod: true,
              },
            },
          },
        });
        if (!student) throw new Error("Estudante não encontrado");

        if (student.User.email !== input.email) {
          if (!student.User.externalAuthId)
            throw new Error("Estudante não encontrado");
          await clerkClient.users.updateUser(student.User.externalAuthId, {
            firstName: input.name.split(" ")[0],
            lastName: input.name.split(" ").slice(1).join(" "),
            publicMetadata: {
              name: input.name,
              slug: slugify(input.name).toLowerCase(),
              email: input.email,
            },
          });
        }
        const countUserWithSameName = await tx.user.count({
          where: {
            name: input.name,
          },
        });
        const countSuffix =
          countUserWithSameName > 0 ? `-${String(countUserWithSameName)}` : "";
        await ctx.prisma.user.update({
          where: {
            id: student.User.id,
          },
          data: {
            name: input.name,
            slug: slugify(`${input.name}${countSuffix}`).toLowerCase(),
            email: input.email,
          },
        });
        const countResponsiblesWithSameName = await tx.user.count({
          where: {
            name: {
              in: input.responsibles.map(({ name }) => name),
            },
          },
        });
        const countResponsiblesSuffix =
          countResponsiblesWithSameName > 0
            ? `-${String(countResponsiblesWithSameName)}`
            : "";
        const userResponsibles: User[] = [];
        const studentResponsibleRole = await tx.role.findFirst({
          where: {
            name: "STUDENT_RESPONSIBLE",
          },
        });
        if (!studentResponsibleRole) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Função de responsável não encontrada",
          });
        }
        for (const responsible of input.responsibles) {
          const responsibleUserOnOurDb = await tx.user.findFirst({
            where: {
              email: responsible.email,
              schoolId: ctx.session.school.id,
            },
          });
          if (!responsibleUserOnOurDb) {
            const [firstName, ...rest] = responsible.name.split(" ");
            const createdResponsibleOnClerk =
              await clerkClient.users.createUser({
                firstName,
                lastName: rest.join(" "),
                emailAddress: [responsible.email],
              });
            const countUserWithSameName = await tx.user.count({
              where: {
                name: responsible.name,
              },
            });
            const countSuffix =
              countUserWithSameName > 0
                ? `-${String(countUserWithSameName)}`
                : countResponsiblesSuffix;
            const createdResponsibleUser = await tx.user.create({
              data: {
                name: responsible.name,
                slug: slugify(
                  `${responsible.name}${countSuffix}`,
                ).toLowerCase(),
                email: responsible.email,
                roleId: studentResponsibleRole.id,
                schoolId: ctx.session.school.id,
                externalAuthId: createdResponsibleOnClerk.id,
              },
            });
            userResponsibles.push(createdResponsibleUser);
          } else {
            let slug = responsibleUserOnOurDb.slug;
            if (responsible.name !== responsibleUserOnOurDb.name) {
              const countResponsibleWithSameName = await tx.user.count({
                where: {
                  name: responsible.name,
                },
              });
              const countResponsibleSuffix =
                countResponsibleWithSameName > 0
                  ? `-${String(countResponsibleWithSameName)}`
                  : countResponsiblesSuffix;
              slug = slugify(
                `${responsible.name}${countResponsibleSuffix}`,
              ).toLowerCase();
            }
            await tx.user.update({
              where: {
                id: responsibleUserOnOurDb.id,
              },
              data: {
                name: responsible.name,
                slug,
                email: responsible.email,
                roleId: studentResponsibleRole.id,
                schoolId: ctx.session.school.id,
              },
            });
          }
        }
        await tx.studentHasResponsible.createMany({
          data: userResponsibles.map((responsibleUser) => ({
            responsibleId: responsibleUser.id,
            studentId: input.studentId,
          })),
        });
        const userWithResponsibles = await tx.user.findFirst({
          where: {
            id: input.studentId,
            schoolId: ctx.session.school.id,
          },
          include: {
            StudentHasResponsible: {
              include: {
                ResponsibleUser: true,
              },
            },
          },
        });
        if (!userWithResponsibles) return;
        const danglingResponsibles =
          userWithResponsibles.StudentHasResponsible.filter(
            (responsible) =>
              !userResponsibles.find(
                (userResponsible) => userResponsible.id === responsible.id,
              ),
          );
        await tx.studentHasResponsible.deleteMany({
          where: {
            studentId: input.studentId,
            responsibleId: {
              in: danglingResponsibles.map(
                ({ ResponsibleUser }) => ResponsibleUser.id,
              ),
            },
          },
        });
        await tx.user.deleteMany({
          where: {
            id: {
              in: danglingResponsibles.map(
                ({ ResponsibleUser }) => ResponsibleUser.id,
              ),
            },
          },
        });
        for (const danglingResponsible of danglingResponsibles) {
          if (!danglingResponsible.ResponsibleUser.externalAuthId) continue;
          await clerkClient.users.deleteUser(
            danglingResponsible.ResponsibleUser.externalAuthId,
          );
        }
      });
    }),
});
