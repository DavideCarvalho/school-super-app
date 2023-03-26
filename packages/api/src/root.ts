import { prisma } from "@acme/db";

import { authRouter } from "./router/auth";
import { emailRouter } from "./router/email";
import { fileRouter } from "./router/file";
import { roleRouter } from "./router/role";
import { schoolRouter } from "./router/school";
import { teacherRouter } from "./router/teacher";
import { userRouter } from "./router/user";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  school: schoolRouter,
  file: fileRouter,
  teacher: teacherRouter,
  email: emailRouter,
  user: userRouter,
  role: roleRouter,
});

export const trpCaller = appRouter.createCaller({ prisma, session: null });

// export type definition of API
export type AppRouter = typeof appRouter;
