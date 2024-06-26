import { createColumnHelper } from "@tanstack/react-table";
import { isAfter, isBefore, isToday } from "date-fns";

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
    columnHelper.display({
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        if (isAfter(row.original.dueDate, new Date())) {
          return "Esperando entregas";
        }

        if (
          isToday(row.original.dueDate) ||
          isBefore(row.original.dueDate, new Date())
        ) {
          return "Finalizado";
        }
      },
    }),
  ];
}
