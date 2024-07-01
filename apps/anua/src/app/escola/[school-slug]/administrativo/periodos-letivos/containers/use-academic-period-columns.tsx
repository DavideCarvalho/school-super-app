import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { RouterOutputs } from "@acme/api";

export function useAcademicPeriodColumns() {
  const columnHelper =
    createColumnHelper<RouterOutputs["academicPeriod"]["allBySchoolId"][0]>();
  return [
    columnHelper.accessor("startDate", {
      id: "startDate",
      header: "Começa",
      enableColumnFilter: false,
      enableSorting: false,
      cell: ({ row }) => {
        return format(row.original.startDate, "dd/MM/yyyy", { locale: ptBR });
      },
    }),
    columnHelper.accessor("endDate", {
      id: "endDate",
      header: "Termina",
      enableColumnFilter: false,
      enableSorting: false,
      cell: ({ row }) => {
        return format(row.original.endDate, "dd/MM/yyyy", { locale: ptBR });
      },
    }),
  ];
}
