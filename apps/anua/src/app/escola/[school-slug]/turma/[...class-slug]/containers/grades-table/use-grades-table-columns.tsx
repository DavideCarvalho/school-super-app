import { createColumnHelper } from "@tanstack/react-table";

import type { RouterOutputs } from "@acme/api";

type Row = RouterOutputs["class"]["getStudentsGrades"][0];

export function useAssignmentsTableColumns() {
  const columnHelper = createColumnHelper<Row>();

  return [
    columnHelper.accessor("Student.User.name", {
      id: "name",
      header: "Aluno",
    }),
    columnHelper.accessor("studentTotalGrade", {
      id: "attendedClasses",
      header: "Presença",
    }),
  ];
}
