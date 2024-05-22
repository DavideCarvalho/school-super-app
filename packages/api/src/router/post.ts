import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const postRouter = createTRPCRouter({
  getPosts: publicProcedure
    .input(
      z.object({
        lastId: z.number().optional(),
        schoolId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where = input.lastId
        ? {
            id: {
              lt: input.lastId,
            },
          }
        : {};
      const posts = await ctx.prisma.post.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
        include: {
          User: true,
          School: true,
          _count: {
            select: {
              UserLikedPost: true,
            },
          },
          Comments: {
            include: {
              Likes: true,
              User: true,
            },
            take: 3,
            orderBy: {
              id: "asc",
            },
          },
        },
      });
      return posts;
    }),
  userLikedPost: publicProcedure
    .input(
      z.object({
        postUuid: z.string(),
        userId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findFirst({
        where: {
          uuid: input.postUuid,
        },
      });
      if (!post) return;
      const count = await ctx.prisma.post.findFirst({
        where: {
          uuid: post.uuid,
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
        schoolId: z.string().optional(),
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
        postUuid: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findFirst({
        where: {
          uuid: input.postUuid,
        },
      });
      if (!post) return;
      return ctx.prisma.userLikedPost.create({
        data: {
          postId: post.id,
          userId: input.userId,
        },
      });
    }),
  unlikePost: publicProcedure
    .input(
      z.object({
        postUuid: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findFirst({
        where: {
          uuid: input.postUuid,
        },
      });
      if (!post) return;
      return ctx.prisma.userLikedPost.deleteMany({
        where: {
          postId: post.id,
          userId: input.userId,
        },
      });
    }),
  getPostByUuid: publicProcedure
    .input(z.object({ postUuid: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.post.findFirst({
        where: {
          uuid: input.postUuid,
        },
        include: {
          User: true,
          School: true,
          Comments: {
            include: {
              Likes: true,
              User: true,
            },
          },
        },
      });
    }),
  addComment: publicProcedure
    .input(
      z.object({
        postUuid: z.string(),
        comment: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findFirst({
        where: {
          uuid: input.postUuid,
        },
      });
      if (!post) return;
      return ctx.prisma.comment.create({
        data: {
          postId: post.id,
          comment: input.comment,
          userId: input.userId,
        },
      });
    }),
  likeComment: publicProcedure
    .input(
      z.object({
        commentUuid: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.prisma.comment.findFirst({
        where: {
          uuid: input.commentUuid,
        },
      });
      if (!comment) return;
      return ctx.prisma.commentLike.create({
        data: {
          commentId: comment.id,
          userId: input.userId,
        },
      });
    }),
  unlikeComment: publicProcedure
    .input(
      z.object({
        commentUuid: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.prisma.comment.findFirst({
        where: {
          uuid: input.commentUuid,
        },
      });
      if (!comment) return;
      return ctx.prisma.commentLike.deleteMany({
        where: {
          commentId: comment.id,
          userId: input.userId,
        },
      });
    }),
});
