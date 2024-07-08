"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  httpBatchLink,
  loggerLink,
  unstable_httpBatchStreamLink,
} from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import { createTRPCReact } from "@trpc/react-query";
import SuperJSON from "superjson";

import type { AppRouter } from "@acme/api";

import { env } from "~/env";
import { createQueryClient } from "./query-client";

let clientQueryClientSingleton: QueryClient | undefined = undefined;
const getQueryClient = () => {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return createQueryClient();
  }
  if (!clientQueryClientSingleton) {
    clientQueryClientSingleton = createQueryClient();
  }
  return clientQueryClientSingleton;
};

export const api = createTRPCReact<AppRouter>();

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        unstable_httpBatchStreamLink({
          transformer: SuperJSON,
          url: `${getBaseUrl()}/api/trpc`,
          headers() {
            const headers = new Headers();
            headers.set("x-trpc-source", "nextjs-react");
            return headers;
          },
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </api.Provider>
    </QueryClientProvider>
  );
}

const getBaseUrl = () => {
  if (typeof window !== "undefined") return window.location.origin;
  if (env.NEXT_PUBLIC_ANUA_URL) return `https://${env.NEXT_PUBLIC_ANUA_URL}`;
  // eslint-disable-next-line no-restricted-properties
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

export const _oldapi = createTRPCNext<AppRouter>({
  config() {
    return {
      /**
       * @link https://trpc.io/docs/v11/client/links
       */
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          /**
           * @link https://trpc.io/docs/v11/data-transformers
           */
          transformer: SuperJSON,
        }),
      ],
    };
  },
  ssr: false,
  transformer: SuperJSON,
});

export const withTRPC = _oldapi.withTRPC;
