import { addDays, endOfDay, startOfDay } from "date-fns";

import { createTRPCRouter, isUserLoggedInAndAssignedToSchool } from "../trpc";

export const inteligenceRouter = createTRPCRouter({
  getPrintRequestsNotApprovedCloseToDueDate:
    isUserLoggedInAndAssignedToSchool.query(({ ctx }) => {
      const today = new Date();
      return ctx.prisma.printRequest.findMany({
        where: {
          dueDate: {
            lte: endOfDay(addDays(new Date(), 3)),
            gte: startOfDay(today),
          },
          status: "REQUESTED",
          User: {
            schoolId: ctx.session.school.id,
          },
        },
      });
    }),
  getPrintRequestsToPrintToday: isUserLoggedInAndAssignedToSchool.query(
    ({ ctx }) => {
      const today = new Date();
      return ctx.prisma.printRequest.findMany({
        where: {
          dueDate: {
            lte: endOfDay(today),
            gte: startOfDay(today),
          },
          User: {
            schoolId: ctx.session.school.id,
          },
        },
      });
    },
  ),
  getPrintRequestsOwnerUserNeedToReview:
    isUserLoggedInAndAssignedToSchool.query(({ ctx }) => {
      return ctx.prisma.printRequest.findMany({
        where: {
          status: "REVIEW",
          userId: ctx.session.user.id,
          User: {
            schoolId: ctx.session.school.id,
          },
        },
      });
    }),
});
