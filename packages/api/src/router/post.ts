import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const postRouter = createTRPCRouter({
  getPosts: publicProcedure
    .input(
      z.object({
        page: z.number().optional().default(1),
        limit: z.number().optional().default(5),
        schoolId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const posts = await ctx.prisma.post.findMany({
        where: {
          schoolId: input.schoolId,
        },
        take: input.limit,
        skip: (input.page - 1) * input.limit,
        include: {
          User: true,
          School: true,
          _count: {
            select: {
              UserLikedPost: true,
            },
          },
        },
      });
      return posts;
    }),
  userLikedPost: publicProcedure
    .input(
      z.object({
        postId: z.string(),
        userId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const count = await ctx.prisma.post.findFirst({
        where: {
          id: input.postId,
        },
        include: {
          _count: {
            select: {
              UserLikedPost: true,
            },
          },
        },
      });
      if (!count?._count?.UserLikedPost) return false;
      return true;
    }),
  createPost: publicProcedure
    .input(
      z.object({
        content: z.string(),
        schoolId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.post.create({
        data: {
          content: input.content,
          schoolId: input.schoolId,
          userId: input.userId,
        },
      });
    }),
  likePost: publicProcedure
    .input(
      z.object({
        postId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.userLikedPost.create({
        data: {
          postId: input.postId,
          userId: input.userId,
        },
      });
    }),
  unlikePost: publicProcedure
    .input(
      z.object({
        postId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.userLikedPost.deleteMany({
        where: {
          postId: input.postId,
          userId: input.userId,
        },
      });
    }),
});
