import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { cache } from "react";

import { createCaller, createTRPCContext } from "@acme/api";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(headers());
  heads.set("x-trpc-source", "rsc");


  return createTRPCContext({ session: auth(), headers: heads });
});

export const api = createCaller(createContext);

// Not working yet
// export const helpers = createServerSideHelpers({
//   router: appRouter,
//   ctx: await createContext(),
//   transformer: superjson,
// });
