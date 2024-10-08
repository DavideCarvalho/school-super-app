import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from "superjson";

import { prisma } from "@acme/db";

import { academicPeriodRouter } from "./router/academicPeriod";
import { assignmentRouter } from "./router/assignment";
import { attendanceRouter } from "./router/attendance";
import { authRouter } from "./router/auth";
import { canteenRouter } from "./router/canteen";
import { classRouter } from "./router/class";
import { emailRouter } from "./router/email";
import { gradeRouter } from "./router/grade";
import { inteligenceRouter } from "./router/inteligence";
import { peiRouter } from "./router/pei";
import { postRouter } from "./router/post";
import { printRequestRouter } from "./router/printRequest";
import { purchaseRequestRouter } from "./router/purchaseRequest";
import { roleRouter } from "./router/role";
import { schoolRouter } from "./router/school";
import { studentRouter } from "./router/student";
import { subjectRouter } from "./router/subjects";
import { teacherRouter } from "./router/teacher";
import { teacherHasClassRouter } from "./router/teacherHasClass";
import { userRouter } from "./router/user";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  school: schoolRouter,
  printRequest: printRequestRouter,
  teacher: teacherRouter,
  email: emailRouter,
  user: userRouter,
  role: roleRouter,
  class: classRouter,
  subject: subjectRouter,
  teacherHasClass: teacherHasClassRouter,
  purchaseRequest: purchaseRequestRouter,
  canteen: canteenRouter,
  student: studentRouter,
  pei: peiRouter,
  post: postRouter,
  academicPeriod: academicPeriodRouter,
  assignment: assignmentRouter,
  attendance: attendanceRouter,
  grade: gradeRouter,
  inteligence: inteligenceRouter,
});

export const trpCaller = appRouter.createCaller({ prisma, session: null });

export const serverSideHelpers = createServerSideHelpers({
  router: appRouter,
  ctx: {
    session: null,
    prisma,
  },
  transformer: superjson,
});

// export type definition of API
export type AppRouter = typeof appRouter;
