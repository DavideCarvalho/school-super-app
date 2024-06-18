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
    columnHelper.accessor(
      (row) => (row.finalQuantity ? row.finalQuantity : row.quantity),
      {
        id: "quantidade",
        header: "Quantidade",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          if (row.original.finalQuantity) {
            return (
              <div>
                <HoverCard>
                  <HoverCardTrigger>
                    <p
                      className={cn(
                        row.original.finalQuantity > row.original.quantity
                          ? "text-red-500"
                          : "text-green-500",
                      )}
                    >
                      {row.original.finalQuantity > row.original.quantity ? (
                        <ArrowUpIcon />
                      ) : (
                        <ArrowDownIcon />
                      )}
                      {row.original.finalQuantity}*
                    </p>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <p>Quantidade pedida: {row.original.value}</p>
                    <p>Quantidade comprada: {row.original.finalQuantity}</p>
                  </HoverCardContent>
                </HoverCard>
              </div>
            );
          }
          return <p>{row.original.quantity}</p>;
        },
      },
    ),
    columnHelper.accessor((row) => row.finalValue ?? row.value, {
      id: "valor",
      header: "Valor",
      enableColumnFilter: false,
      enableSorting: false,
      cell: ({ row }) => {
        if (row.original.status === "BOUGHT") {
          if (row.original.finalValue) {
            return (
              <div>
                <HoverCard>
                  <HoverCardTrigger>
                    <p>
                      {row.original.value > row.original.finalValue ? (
                        <ArrowUpIcon />
                      ) : (
                        <ArrowDownIcon />
                      )}
                      {row.original.finalValue}*
                    </p>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <p>
                      Valor informado:{" "}
                      {brazilianRealFormatter(row.original.value)}
                    </p>
                    <p>
                      Valor comprado:{" "}
                      {brazilianRealFormatter(row.original.finalValue)}
                    </p>
                  </HoverCardContent>
                </HoverCard>
              </div>
            );
          }
          return <p>{row.original.quantity}</p>;
        }
        return <p>{row.original.quantity}</p>;
      },
    }),
    // columnHelper.accessor(
    //   (row) =>
    //     row.finalValue
    //       ? brazilianRealFormatter(row.finalValue)
    //       : brazilianRealFormatter(row.value),
    //   {
    //     id: "valor",
    //     header: "Valor",
    //     enableColumnFilter: false,
    //     enableSorting: false,
    //   },
    // ),
    columnHelper.accessor((row) => brazilianDateFormatter(row.dueDate), {
      id: "pra-quando",
      header: "Pra quando?",
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.accessor(
      (row) =>
        row.arrivalDate
          ? brazilianDateFormatter(row.arrivalDate)
          : row.estimatedArrivalDate
            ? brazilianDateFormatter(row.estimatedArrivalDate)
            : "-",
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
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={`${pathname}?${searchParams?.toString()}#editar-solicitacao?solicitacao=${row.original.id}`}
                      >
                        <Button size="sm" variant="ghost">
                          <PencilIcon className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Editar solicitação</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="text-red-600 hover:text-red-800"
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          handleDeletePurchaseRequest(row.original.id)
                        }
                      >
                        <TrashIcon className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Remover</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Remover solicitação</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            ) : null}
            {row.original.status === "REQUESTED" ? (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
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
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Rejeitar solicitação</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
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
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Aprovar solicitação</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            ) : null}
            {row.original.status === "APPROVED" ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
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
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Solicitação comprada</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : null}
            {row.original.status === "BOUGHT" ? (
              <Link
                href={`${pathname}?${searchParams?.toString()}#solicitacao-chegou?solicitacao=${row.original.id}`}
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
