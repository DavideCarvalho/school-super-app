"use client";

import { createContext } from "react";
import { useParams, useSearchParams } from "next/navigation";

import type { Class } from "@acme/db";

import { api } from "~/trpc/react";

export const ClassContext = createContext<Class | undefined | null>(undefined);

export function ClassContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const classSlug = params["class-slug"];
  const { data: clasz } = api.class.findBySlug.useQuery({
    slug: classSlug as string,
  });

  return (
    <ClassContext.Provider value={clasz}>{children}</ClassContext.Provider>
  );
}
