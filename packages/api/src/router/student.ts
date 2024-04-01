import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const studentRouter = createTRPCRouter({
  studentsWithCanteenLimitBySchoolId: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.$queryRaw<
        {
          id: string;
          userName: string;
        }[]
      >`
        SELECT Student.id as id, U.name as userName
          INNER JOIN anua.User U on Student.id = U.id
        WHERE U.schoolId = ${input.schoolId}
        AND ((SELECT SUM(price) as month_total
        FROM StudentCanteenItemPurchase
        WHERE MONTH(createdAt) = MONTH(NOW())
          AND YEAR(createdAt) = YEAR(NOW())
        GROUP BY studentId)
        < Student.canteenLimit OR Student.canteenLimit IS NULL)
      `;
    }),
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
