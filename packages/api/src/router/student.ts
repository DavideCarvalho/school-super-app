import { z } from "zod";

import {
  createTRPCRouter,
  isUserLoggedInAndAssignedToSchool,
  publicProcedure,
} from "../trpc";

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
  studentsBySchoolId: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(5),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.student.findMany({
        where: {
          User: {
            schoolId: input.schoolId,
          },
        },
        take: input.limit,
        skip: (input.page - 1) * input.limit,
        include: {
          User: true,
        },
      });
    }),
});
