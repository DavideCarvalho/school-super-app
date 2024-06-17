import type { Column } from "@tanstack/react-table";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
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
import { Button } from "@acme/ui/button";
import {
  MultiSelectFilter,
  multiSelectFilterFn,
} from "@acme/ui/table-with-pagination/_components/multi-select-filter";

import { api } from "~/trpc/react";
import { brazilianDateFormatter } from "~/utils/brazilian-date-formatter";
import { brazilianRealFormatter } from "~/utils/brazilian-real-formatter";

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
    createColumnHelper<RouterOutputs["purchaseRequest"]["allBySchoolId"][0]>();

  const { mutateAsync: deleteUser } = api.user.deleteById.useMutation();

  async function handleDeleteWorker(workerId: string) {
    const toastId = toast.loading("Removendo solicitação de compra...");
    try {
      await deleteUser({ userId: workerId });
      toast.success("Solicitação de compra removida com sucesso!");
    } catch (e) {
      toast.error("Erro ao remover solicitação de compra");
    } finally {
      toast.dismiss(toastId);
      await Promise.all([
        utils.purchaseRequest.allBySchoolId.invalidate(),
        utils.purchaseRequest.countAllBySchoolId.invalidate(),
      ]);
    }
  }

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
    columnHelper.accessor("productName", {
      id: "produto",
      header: "Produto",
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
    columnHelper.accessor("quantity", {
      id: "quantidade",
      header: "Quantidade",
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.accessor((row) => brazilianRealFormatter(row.value), {
      id: "valor",
      header: "Valor",
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.accessor(
      (row) => (row.finalQuantity ? "finalQuantity" : "-"),
      {
        id: "quantidade-comprada",
        header: "Quantidade comprada",
        enableColumnFilter: false,
        enableSorting: false,
      },
    ),
    columnHelper.accessor(
      (row) => (row.finalValue ? brazilianRealFormatter(row.finalValue) : "-"),
      {
        id: "valor-total-comprado",
        header: "Valor comprado",
        enableColumnFilter: false,
        enableSorting: false,
      },
    ),
    columnHelper.accessor((row) => brazilianDateFormatter(row.dueDate), {
      id: "pra-quando",
      header: "Pra quando?",
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.accessor(
      (row) =>
        row.estimatedArrivalDate
          ? brazilianDateFormatter(row.estimatedArrivalDate)
          : "-",
      {
        id: "data-de-chegada-estimada",
        header: "Data de chegada estimada",
        enableColumnFilter: false,
        enableSorting: false,
      },
    ),
    columnHelper.accessor(
      (row) =>
        row.arrivalDate ? brazilianDateFormatter(row.arrivalDate) : "-",
      {
        id: "data-de-chegada",
        header: "Data de chegada",
        enableColumnFilter: false,
        enableSorting: false,
      },
    ),
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
    columnHelper.display({
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            {row.original.status === "REQUESTED" ||
            row.original.status === "REJECTED" ? (
              <Link
                href={`${pathname}?${searchParams?.toString()}#editar-solicitacao?solicitacao=${row.original.id}`}
              >
                <Button size="sm" variant="ghost">
                  <PencilIcon className="h-4 w-4" />
                  <span className="sr-only">Editar</span>
                </Button>
                <Button
                  className="text-red-600 hover:text-red-800"
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeletePurchaseRequest(row.original.id)}
                >
                  <TrashIcon className="h-4 w-4 text-red-500" />
                  <span className="sr-only">Remover</span>
                </Button>
              </Link>
            ) : null}
            {row.original.status === "REQUESTED" ? (
              <>
                <Link
                  href={`${pathname}?${searchParams?.toString()}#rejeitar-solicitacao?solicitacao=${row.original.id}`}
                >
                  <Button
                    className="text-red-600 hover:text-red-800"
                    size="sm"
                    variant="ghost"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    <span className="sr-only">Rejeitar</span>
                  </Button>
                </Link>
                <Link
                  href={`${pathname}?${searchParams?.toString()}#aprovar-solicitacao?solicitacao=${row.original.id}`}
                >
                  <Button
                    className="text-green-600 hover:text-green-800"
                    size="sm"
                    variant="ghost"
                  >
                    <CheckIcon className="h-4 w-4" />
                    <span className="sr-only">Aprovar</span>
                  </Button>
                </Link>
              </>
            ) : null}
            {row.original.status === "APPROVED" ? (
              <Link
                href={`${pathname}?${searchParams?.toString()}#solicitacao-comprada?solicitacao=${row.original.id}`}
              >
                <Button
                  className="text-green-600 hover:text-green-800"
                  size="sm"
                  variant="ghost"
                >
                  <ShoppingCartIcon className="h-4 w-4" />
                  <span className="sr-only">Comprado</span>
                </Button>
              </Link>
            ) : null}
            {row.original.status === "BOUGHT" ? (
              <Link
                href={`${pathname}?${searchParams?.toString()}#solicitacao-comprada?solicitacao=${row.original.id}`}
              >
                <Button
                  className="text-green-600 hover:text-green-800"
                  size="sm"
                  variant="ghost"
                >
                  <MapPinIcon className="h-4 w-4" />
                  <span className="sr-only">Chegou</span>
                </Button>
              </Link>
            ) : null}
          </div>
        );
      },
    }),
  ];
}
