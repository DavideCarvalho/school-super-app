import { useContext } from "react";

import { SchoolContext } from "../contexts/school.context";

export function SchoolGuard({ children }: { children: React.ReactNode }) {
  const school = useContext(SchoolContext);
  if (!school) {
    return null;
  }
  return <>{children}</>;
}
