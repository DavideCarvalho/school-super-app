import { cache } from "react";
import { headers } from "next/headers";
import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { createServerSideHelpers } from "@trpc/react-query/server";
import SuperJSON from "superjson";

import type { AppRouter } from "@acme/api";
import { appRouter, createCaller, createTRPCContext } from "@acme/api";

import { createQueryClient } from "./query-client";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(headers());
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({ session: null, headers: heads });
});

const getQueryClient = cache(createQueryClient);
const caller = createCaller(createContext);

export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient,
);

export const createSSRHelper = async () =>
  createServerSideHelpers({
    router: appRouter,
    ctx: await createContext(),
    transformer: SuperJSON,
  });
