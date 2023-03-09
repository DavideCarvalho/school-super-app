import { prisma } from "@acme/db";

import { authRouter } from "./router/auth";
import { fileRouter } from "./router/file";
import { postRouter } from "./router/post";
import { schoolRouter } from "./router/school";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  post: postRouter,
  auth: authRouter,
  school: schoolRouter,
  file: fileRouter,
});

export const trpCaller = appRouter.createCaller({ prisma, session: null });

// export type definition of API
export type AppRouter = typeof appRouter;
