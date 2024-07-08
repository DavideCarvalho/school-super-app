import { useContext } from "react";

import type { School } from "@acme/db";

import { SchoolContext } from "../contexts/school.context";

export function useSchool(): School {
  const context = useContext(SchoolContext);
  if (context === undefined || context === null) {
    throw new Error("useSchool must be used within a SchoolContextProvider");
  }
  return context;
}
