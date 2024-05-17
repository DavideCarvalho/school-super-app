import { wrapApiHandlerWithSentry } from "@sentry/nextjs";
import { createNextApiHandler } from "@trpc/server/adapters/next";

import { appRouter, createTRPCContext } from "@acme/api";

// export API handler
export default wrapApiHandlerWithSentry(
  createNextApiHandler({
    router: appRouter,
    createContext: createTRPCContext,
  }),
  "/api/trpc",
);

// If you need to enable cors, you can do so like this:
// const handler = async (req: NextApiRequest, res: NextApiResponse) => {
//   // Enable cors
//   await cors(req, res);

//   // Let the tRPC handler do its magic
//   return createNextApiHandler({
//     router: appRouter,
//     createContext,
//   })(req, res);
// };

// export default handler;
