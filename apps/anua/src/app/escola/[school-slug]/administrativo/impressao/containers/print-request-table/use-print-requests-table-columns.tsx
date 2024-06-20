import type { Column } from "@tanstack/react-table";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ArrowTopRightOnSquareIcon,
  DocumentMagnifyingGlassIcon,
  HandThumbDownIcon,
  HandThumbUpIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";
import { createColumnHelper } from "@tanstack/react-table";
import toast from "react-hot-toast";

import type { RouterOutputs } from "@acme/api";
import { Button } from "@acme/ui/button";
import { MultiSelectFilter } from "@acme/ui/table-with-pagination/_components/multi-select-filter";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";

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

  const { mutateAsync: deletePrintRequest } =
    api.printRequest.deleteById.useMutation();

  const { mutateAsync: changePrintRequestStatusToPrinted } =
    api.printRequest.printRequest.useMutation();

  async function handleDeletePrintRequest(printRequestId: string) {
    const toastId = toast.loading("Removendo impressão...");
    try {
      await deletePrintRequest({ id: printRequestId });
      toast.success("Impressão removida com sucesso!");
    } catch (e) {
      toast.error("Erro ao remover impressão");
    } finally {
      toast.dismiss(toastId);
      await Promise.all([
        utils.printRequest.allBySchoolId.invalidate(),
        utils.printRequest.countAllBySchoolId.invalidate(),
      ]);
    }
  }

  async function handleChangePrintRequestStatusToPrinted(
    printRequestId: string,
  ) {
    await changePrintRequestStatusToPrinted({
      id: printRequestId,
    });
    await Promise.all([
      utils.printRequest.allBySchoolId.invalidate(),
      utils.printRequest.countAllBySchoolId.invalidate(),
    ]);
  }

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
    columnHelper.display({
      id: "actions",
      cell: ({ row }) => {
        if (row.original.status === "REJECTED") {
          return (
            <Link
              href={`${pathname}?${searchParams?.toString()}#revisar-impressao?impressao=${row.original.id}`}
            >
              <Button size="sm" variant="ghost">
                <DocumentMagnifyingGlassIcon className="h-4 w-4" />
              </Button>
            </Link>
          );
        }
        if (row.original.status === "REQUESTED") {
          return (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={`${pathname}?${searchParams?.toString()}#aprovar-impressao?impressao=${row.original.id}`}
                    >
                      <Button size="sm" variant="ghost">
                        <HandThumbUpIcon className="h-4 w-4 text-green-500" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Aprovar impressão</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={`${pathname}?${searchParams?.toString()}#rejeitar-impressao?impressao=${row.original.id}`}
                    >
                      <Button size="sm" variant="ghost">
                        <HandThumbDownIcon className="h-4 w-4 text-red-800" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reprovar impressão</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={`${pathname}?${searchParams?.toString()}#rejeitar-impressao?impressao=${row.original.id}`}
                    >
                      <Button size="sm" variant="ghost">
                        <TrashIcon className="h-4 w-4 text-red-500" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Remover impressão</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          );
        }
        if (row.original.status === "APPROVED") {
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={row.original.path}>
                    <Button
                      onClick={() =>
                        handleChangePrintRequestStatusToPrinted(row.original.id)
                      }
                    >
                      <ArrowTopRightOnSquareIcon />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Imprimir</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
        if (row.original.status === "PRINTED") {
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={row.original.path}>
                    <Button>
                      <ArrowTopRightOnSquareIcon />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Imprimir</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
        return <></>;
      },
    }),
  ];
}
