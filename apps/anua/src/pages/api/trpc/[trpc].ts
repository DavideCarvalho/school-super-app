import { createNextApiHandler } from "@trpc/server/adapters/next";

import { appRouter, createTRPCContextPagesRoute } from "@acme/api";

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContextPagesRoute,
});

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
