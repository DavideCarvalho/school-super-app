import type { Column } from "@tanstack/react-table";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PencilIcon, TrashIcon } from "@heroicons/react/20/solid";
import { createColumnHelper } from "@tanstack/react-table";
import toast from "react-hot-toast";

import type { RouterOutputs } from "@acme/api";
import { Button } from "@acme/ui/button";
import {
  MultiSelectFilter,
  multiSelectFilterFn,
} from "@acme/ui/table-with-pagination/_components/multi-select-filter";

import { api } from "~/trpc/react";

export function usePurchaseRequestsTableColumns() {
  const searchParams = useSearchParams();
  const router = useRouter();
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
        utils.teacher.getSchoolTeachers.invalidate(),
        utils.teacher.countSchoolTeachers.invalidate(),
      ]);
    }
  }

  const { mutateAsync: deleteTeacher } = api.teacher.deleteById.useMutation();

  async function handleDeletePurchaseRequest(purchaseRequestId: string) {
    const toastId = toast.loading("Removendo professor...");
    try {
      // await deleteTeacher({ userId: teacherId });
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
        }) => {
          // TODO: ter uma função default pra isso
          const handleFilterChange = ({
            name,
            value,
          }: {
            name: string;
            value: string[];
          }) => {
            const params = new URLSearchParams(searchParams ?? undefined);
            params.delete(name);
            if (Array.isArray(value)) {
              for (const v of value) params.append(name, v);
            }
            if (typeof value === "string" && (value as string).trim() !== "") {
              params.append(name, value);
            }
            router.replace(`${pathname}?${params.toString()}`, {
              scroll: false,
            });
          };
          return (
            <MultiSelectFilter
              data={
                distinctProducts?.map((product) => product.productName) ?? []
              }
              onFilterChange={handleFilterChange}
              column={props.column}
            />
          );
        },
      },
    }),
    columnHelper.accessor("quantity", {
      id: "quantidade",
      header: "Quantidade",
      enableColumnFilter: false,
      enableSorting: true,
    }),
    columnHelper.accessor("value", {
      id: "valor",
      header: "Valor",
      enableColumnFilter: false,
      enableSorting: true,
    }),
    columnHelper.accessor("finalQuantity", {
      id: "quantidade-comprada",
      header: "Quantidade comprada",
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.accessor("finalValue", {
      id: "valor-total-comprado",
      header: "Valor comprado",
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.accessor("dueDate", {
      id: "pra-quando",
      header: "Pra quando?",
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.accessor("estimatedArrivalDate", {
      id: "data-de-chegada-estimada",
      header: "Data de chegada estimada",
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.accessor("arrivalDate", {
      id: "data-de-chegada",
      header: "Data de chegada",
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.display({
      id: "actions",
      cell: ({ row }) => {
        const hashRoute = "editar-funcionario?funcionario=oie";
        return (
          <div className="flex items-center gap-2">
            <Link href={`${pathname}?${searchParams?.toString()}#${hashRoute}`}>
              <Button size="sm" variant="ghost">
                <PencilIcon className="h-4 w-4" />
                <span className="sr-only">Editar</span>
              </Button>
            </Link>
            <Button
              className="text-red-600 hover:text-red-800"
              size="sm"
              variant="ghost"
              onClick={() => handleDeletePurchaseRequest(row.original.id)}
            >
              <TrashIcon className="h-4 w-4 text-red-500" />
              <span className="sr-only">Remover</span>
            </Button>
          </div>
        );
      },
    }),
  ];
}
