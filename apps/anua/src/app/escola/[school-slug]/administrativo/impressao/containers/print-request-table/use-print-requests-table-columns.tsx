import type { Column } from "@tanstack/react-table";
import { usePathname, useSearchParams } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";

import type { RouterOutputs } from "@acme/api";
import { MultiSelectFilter } from "@acme/ui/table-with-pagination/_components/multi-select-filter";

import { api } from "~/trpc/react";

type Row = RouterOutputs["printRequest"]["allBySchoolId"][0];

export const statusesInPortuguese = [
  "Pedido",
  "Aprovado",
  "Rejeitado",
  "Revisão",
] as const;

export const statusesEnum = [
  "REQUESTED",
  "APPROVED",
  "PRINTED",
  "REVIEW",
] as const;

const statusesMap: Record<string, string> = {};

for (let i = 0; i < statusesEnum.length; i++) {
  const status = statusesEnum[i];
  const statusInPortuguese = statusesInPortuguese[i];
  if (!status) continue;
  if (!statusInPortuguese) continue;
  statusesMap[status] = statusInPortuguese;
}

export function usePurchaseRequestsTableColumns() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const utils = api.useUtils();

  const { data: distinctTeachers } = api.teacher.getUniqueTeachers.useQuery();

  const columnHelper = createColumnHelper<Row>();

  return [
    columnHelper.accessor("User.name", {
      id: "usuario",
      header: "Usuário",
      enableColumnFilter: false,
      enableSorting: false,
      meta: {
        filterComponent: (props: {
          column: Column<Row, unknown>;
          onFilterChange: (param: { name: string; value: string[] }) => void;
        }) => {
          return (
            <MultiSelectFilter
              data={distinctTeachers?.map(({ name }) => name) ?? []}
              {...props}
            />
          );
        },
      },
    }),
    columnHelper.accessor(
      (row) => (row.frontAndBack ? "Frente e trás" : "Apenas frente"),
      {
        id: "impressao",
        header: "Impressão",
        enableColumnFilter: false,
        enableSorting: false,
      },
    ),
    columnHelper.accessor((row) => statusesMap[row.status], {
      id: "status",
      header: "Status",
      enableColumnFilter: false,
      enableSorting: false,
      meta: {
        filterComponent: (props: {
          column: Column<Row, unknown>;
          onFilterChange: (param: { name: string; value: string[] }) => void;
        }) => {
          return (
            <MultiSelectFilter
              data={["Pedido", "Aprovado", "Rejeitado", "Revisão"]}
              {...props}
            />
          );
        },
      },
    }),
  ];
}
