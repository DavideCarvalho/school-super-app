import { createColumnHelper } from "@tanstack/react-table";

import type { RouterOutputs } from "@acme/api";

import { brazilianDateFormatter } from "~/utils/brazilian-date-formatter";

type Row = RouterOutputs["class"]["getClassAssignments"][0];

export function useAssignmentsTableColumns() {
  const columnHelper = createColumnHelper<Row>();

  return [
    columnHelper.accessor("name", {
      id: "name",
      header: "Atividade",
    }),
    columnHelper.accessor((row) => brazilianDateFormatter(row.dueDate), {
      id: "dueDate",
      header: "Data de entrega",
    }),
    columnHelper.accessor(
      (row) =>
        `${row.StudentHasAssignment.length} / ${row.TeacherHasClass.Class.StudentAttendingClass.length}`,
      {
        id: "deliveries",
        header: "Entregas",
      },
    ),
  ];
}
