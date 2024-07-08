"use client";

import { createContext } from "react";

import type { School } from "@acme/db";

import { api } from "~/trpc/react";

export const SchoolContext = createContext<School | undefined | null>(
  undefined,
);

export function SchoolContextProvider({
  children,
  schoolSlug,
}: {
  children: React.ReactNode;
  schoolSlug: string;
}) {
  const { data: school } = api.school.bySlug.useQuery({ slug: schoolSlug });

  return (
    <SchoolContext.Provider value={school}>{children}</SchoolContext.Provider>
  );
}
