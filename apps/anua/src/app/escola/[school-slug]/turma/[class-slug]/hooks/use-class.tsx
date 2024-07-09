import { useContext } from "react";

import type { Class } from "@acme/db";

import { ClassContext } from "../contexts/class.context";

export function useClass(): Class {
  const context = useContext(ClassContext);
  if (context === undefined || context === null) {
    throw new Error("useClass must be used within a ClassContextProvider");
  }
  return context;
}
