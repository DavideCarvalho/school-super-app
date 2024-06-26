import { createColumnHelper } from "@tanstack/react-table";

import type { RouterOutputs } from "@acme/api";

type Row = RouterOutputs["class"]["getClassAttendance"][0];

export function useAssignmentsTableColumns() {
  const columnHelper = createColumnHelper<Row>();

  return [
    columnHelper.accessor("Student.User.name", {
      id: "name",
      header: "Aluno",
    }),
    columnHelper.accessor("attendedClasses", {
      id: "attendedClasses",
      header: "Presença",
    }),
    columnHelper.accessor("attendancePercentage", {
      id: "attendancePercentage",
      header: "Percentual de presença",
    }),
  ];
}
