"use client";

import { useContext } from "react";

import { ClassContext } from "../contexts/class.context";

export function ClassGuard({ children }: { children: React.ReactNode }) {
  const clasz = useContext(ClassContext);
  if (!clasz) {
    return null;
  }
  return <>{children}</>;
}
