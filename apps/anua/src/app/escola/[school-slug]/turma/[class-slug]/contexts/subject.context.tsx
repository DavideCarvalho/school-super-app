"use client";

import { createContext } from "react";
import { useSearchParams } from "next/navigation";

import type { Subject } from "@acme/db";

import { api } from "~/trpc/react";

export const SubjectContext = createContext<Subject | undefined | null>(
  undefined,
);

export function SubjectContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const subjectSlug = searchParams.get("materia");

  const { data: subject } = api.subject.findBySlug.useQuery(
    {
      slug: subjectSlug as string,
    },
    {
      enabled: subjectSlug != null,
    },
  );

  return (
    <SubjectContext.Provider value={subject}>
      {children}
    </SubjectContext.Provider>
  );
}
