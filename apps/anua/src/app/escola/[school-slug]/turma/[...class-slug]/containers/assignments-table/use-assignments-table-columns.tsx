"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { isAfter, isBefore, isToday } from "date-fns";

import type { RouterOutputs } from "@acme/api";

import { brazilianDateFormatter } from "~/utils/brazilian-date-formatter";

type Row =
  RouterOutputs["assignment"]["getCurrentAcademicPeriodAssignments"][0];

export function useAssignmentsTableColumns(classId: string) {
  const columnHelper = createColumnHelper<Row>();

  return [
    columnHelper.accessor("name", {
      id: "name",
      header: "Atividade",
    }),
    columnHelper.accessor("TeacherHasClass.Subject.name", {
      id: "subjectName",
      header: "Matéria",
    }),
    columnHelper.accessor((row) => brazilianDateFormatter(row.dueDate), {
      id: "dueDate",
      header: "Data de entrega",
    }),
    columnHelper.accessor("grade", {
      id: "grade",
      header: "Nota",
    }),
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
