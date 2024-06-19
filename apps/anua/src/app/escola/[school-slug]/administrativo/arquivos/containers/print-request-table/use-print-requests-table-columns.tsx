import type { Column } from "@tanstack/react-table";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  MapPinIcon,
  PencilIcon,
  ShoppingCartIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { createColumnHelper } from "@tanstack/react-table";
import toast from "react-hot-toast";

import type { RouterOutputs } from "@acme/api";
import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@acme/ui/hover-card";
import {
  MultiSelectFilter,
  multiSelectFilterFn,
} from "@acme/ui/table-with-pagination/_components/multi-select-filter";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";

import { api } from "~/trpc/react";

export const statusesInPortuguese = [
  "Pedido",
  "Aprovado",
  "Rejeitado",
  "Comprado",
  "Chegou",
] as const;

export const statusesEnum = [
  "REQUESTED",
  "APPROVED",
  "REJECTED",
  "BOUGHT",
  "ARRIVED",
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

  const { data: distinctProducts } =
    api.purchaseRequest.getUniqueProductNames.useQuery();

  const columnHelper =
    createColumnHelper<RouterOutputs["printRequest"]["allBySchoolId"][0]>();

  const { mutateAsync: deletePurchaseRequest } =
    api.purchaseRequest.deleteById.useMutation();

  async function handleDeletePurchaseRequest(purchaseRequestId: string) {
    const toastId = toast.loading("Removendo professor...");
    try {
      await deletePurchaseRequest({ id: purchaseRequestId });
      toast.success("Professor removido com sucesso!");
    } catch (e) {
      toast.error("Erro ao remover professor");
    } finally {
      toast.dismiss(toastId);
      await Promise.all([
        utils.teacher.getSchoolTeachers.invalidate(),
        utils.teacher.countSchoolTeachers.invalidate(),
      ]);
    }
  }

  return [
    columnHelper.accessor("Teacher.User.name", {
      id: "professor",
      header: "Professor",
      enableColumnFilter: true,
      enableSorting: false,
      filterFn: multiSelectFilterFn,
      meta: {
        filterComponent: (props: {
          column: Column<any, unknown>;
          onFilterChange: (param: { name: string; value: string[] }) => void;
        }) => (
          <MultiSelectFilter
            data={distinctProducts?.map((product) => product.productName) ?? []}
            {...props}
          />
        ),
      },
    }),
    columnHelper.accessor((row) => statusesMap[row.status], {
      id: "status",
      header: "Status",
      enableColumnFilter: true,
      enableSorting: false,
      meta: {
        filterComponent: (props: {
          column: Column<any, unknown>;
          onFilterChange: (param: { name: string; value: string[] }) => void;
        }) => {
          return (
            <MultiSelectFilter
              data={["Pedido", "Aprovado", "Rejeitado", "Comprado", "Chegou"]}
              {...props}
            />
          );
        },
      },
    }),
  ];
}
