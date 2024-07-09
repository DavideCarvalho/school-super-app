"use client";

import { createContext } from "react";

import type { Class } from "@acme/db";

import { api } from "~/trpc/react";

export const ClassContext = createContext<Class | undefined | null>(undefined);

export function ClassContextProvider({
  children,
  classSlug,
}: {
  children: React.ReactNode;
  classSlug: string;
}) {
  const { data: school } = api.class.findBySlug.useQuery({
    slug: classSlug,
  });

  return (
    <ClassContext.Provider value={school}>{children}</ClassContext.Provider>
  );
}
