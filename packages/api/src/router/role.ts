import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";
import { isUserLoggedInAndAssignedToSchool } from "./../trpc";

export const roleRouter = createTRPCRouter({
  byName: isUserLoggedInAndAssignedToSchool
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.role.findFirst({
        where: { name: input.name },
      });
    }),
  getAllWorkerRoles: isUserLoggedInAndAssignedToSchool.query(
    async ({ ctx }) => {
      const workerRoleNames = [
        "DIRECTOR",
        "COORDINATOR",
        "ADMINISTRATIVE",
        "CANTEEN",
        "TEACHER",
      ];
      const roles = await ctx.prisma.role.findMany({
        where: {
          name: {
            in: workerRoleNames,
          },
        },
      });
      return [
        {
          // biome-ignore lint/style/noNonNullAssertion: Sem o ! TS acha que pode ser nulo
          ...roles.find((r) => r.name === "DIRECTOR")!,
          label: "Diretor",
        },
        {
          // biome-ignore lint/style/noNonNullAssertion: Sem o ! TS acha que pode ser nulo
          ...roles.find((r) => r.name === "COORDINATOR")!,
          label: "Coordenador",
        },
        {
          // biome-ignore lint/style/noNonNullAssertion: Sem o ! TS acha que pode ser nulo
          ...roles.find((r) => r.name === "ADMINISTRATIVE")!,
          label: "Administrativo",
        },
        {
          // biome-ignore lint/style/noNonNullAssertion: Sem o ! TS acha que pode ser nulo
          ...roles.find((r) => r.name === "CANTEEN")!,
          label: "Cantina",
        },
        {
          // biome-ignore lint/style/noNonNullAssertion: Sem o ! TS acha que pode ser nulo
          ...roles.find((r) => r.name === "TEACHER")!,
          label: "Professor",
        },
      ];
    },
  ),
});
