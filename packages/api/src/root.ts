import { prisma } from "@acme/db";

import { authRouter } from "./router/auth";
import { classRouter } from "./router/class";
import { emailRouter } from "./router/email";
import { fileRouter } from "./router/file";
import { roleRouter } from "./router/role";
import { schoolRouter } from "./router/school";
import { schoolYearRouter } from "./router/schoolYear";
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
  schoolYear: schoolYearRouter,
  class: classRouter,
});

export const trpCaller = appRouter.createCaller({ prisma, session: null });

// export type definition of API
export type AppRouter = typeof appRouter;
