import { createColumnHelper } from "@tanstack/react-table";
import toast from "react-hot-toast";

import type { RouterOutputs } from "@acme/api";
import {
  MultiSelectFilter,
  multiSelectFilterFn,
} from "@acme/ui/table-with-pagination/_components/multi-select-filter";

import { api } from "~/trpc/react";

const rolesMap = {
  DIRECTOR: "Diretor",
  COORDINATOR: "Coordenador",
  ADMINISTRATIVE: "Administrador",
  CANTEEN: "Cantina",
  TEACHER: "Professor",
};

export function useSchoolWorkerColumns() {
  const { mutateAsync: deleteUser } = api.teacher.deleteById.useMutation();
  const utils = api.useUtils();

  const columnHelper =
    createColumnHelper<RouterOutputs["user"]["allBySchoolId"][0]>();

  async function deleteWorker(workerId: string) {
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

  return [
    columnHelper.accessor("name", {
      id: "nome",
      header: "Nome",
      sortingFn: "auto",
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.accessor((row) => rolesMap[row.Role.name] ?? row.Role.name, {
      id: "funcao",
      header: "Função",
      sortingFn: "auto",
      filterFn: multiSelectFilterFn,
      meta: {
        filterComponent: MultiSelectFilter,
      },
    }),
  ];
}
