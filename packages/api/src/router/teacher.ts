import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const teacherRouter = createTRPCRouter({
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
    .input(z.object({ classId: z.string() }))
    .query(async ({ ctx, input }) => {
      // TODO: Pegar apenas os dias que estão disponíveis
      // TODO: Os dias disponíveis vão ser os que não estão com TeacherHasClass
      // TODO: Pra isso, precisamos adicionar um id do TeacherHasClass dentro do TeacherAvailability
      // TODO: Assim, quando salvarmos um TeacherHasClass, também devemos salvar o id no TeacherAvailability
      return ctx.prisma.teacherAvailability.findMany({
        where: {
          classId: input.classId,
        },
        include: {
          Teacher: true,
        },
      });
    }),
});
