"use client";

import { useContext } from "react";

import { SubjectContext } from "../contexts/subject.context";

export function SubjectGuard({ children }: { children: React.ReactNode }) {
  const subject = useContext(SubjectContext);
  if (!subject) {
    return null;
  }
  return <>{children}</>;
}
