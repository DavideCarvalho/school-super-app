import { useContext } from "react";

import type { Class } from "@acme/db";

import { SubjectContext } from "../contexts/subject.context";

export function useSubject(): Class {
  const context = useContext(SubjectContext);
  if (context === undefined || context === null) {
    throw new Error("useSubject must be used within a SubjectContextProvider");
  }
  return context;
}
