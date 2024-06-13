"use client";

import type { Column } from "@tanstack/react-table";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
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
import { rolesMap } from "./utils";

export function useSchoolWorkerColumns() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const utils = api.useUtils();

  const { data: roles } = api.role.getAllWorkerRoles.useQuery();

  const columnHelper =
    createColumnHelper<RouterOutputs["user"]["allBySchoolId"][0]>();

  const { mutateAsync: deleteUser } = api.user.deleteById.useMutation();

  async function handleDeleteWorker(workerId: string) {
    const toastId = toast.loading("Removendo funcionário...");
    try {
      await deleteUser({ userId: workerId });
      toast.success("Funcionário removido com sucesso!");
    } catch (e) {
      toast.error("Erro ao remover funcionário");
    } finally {
      toast.dismiss(toastId);
      await Promise.all([
        utils.teacher.getSchoolTeachers.invalidate(),
        utils.teacher.countSchoolTeachers.invalidate(),
      ]);
    }
  }

  const { mutateAsync: deleteTeacher } = api.teacher.deleteById.useMutation();

  async function handleDeleteTeacher(teacherId: string) {
    const toastId = toast.loading("Removendo professor...");
    try {
      await deleteTeacher({ userId: teacherId });
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
    columnHelper.accessor("name", {
      id: "nome",
      header: "Nome",
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.accessor((row) => rolesMap[row.Role.name] ?? row.Role.name, {
      id: "funcao",
      header: "Função",
      enableColumnFilter: true,
      enableSorting: false,
      filterFn: multiSelectFilterFn,
      meta: {
        filterComponent: (props: {
          column: Column<any, unknown>;
          onFilterChange: (param: { name: string; value: string[] }) => void;
        }) => (
          <MultiSelectFilter
            data={roles?.map((r) => r.label) ?? []}
            {...props}
          />
        ),
      },
    }),
    columnHelper.display({
      id: "actions",
      cell: ({ row }) => {
        let hashRoute = `editar-funcionario?funcionario=${row.original.slug}`;
        if (row.original.Role.name === "TEACHER") {
          hashRoute = `editar-professor?professor=${row.original.slug}`;
        }
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
              onClick={() =>
                row.original.Role.name === "TEACHER"
                  ? handleDeleteTeacher(row.original.id)
                  : handleDeleteWorker(row.original.id)
              }
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
