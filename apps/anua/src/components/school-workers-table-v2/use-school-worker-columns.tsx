import { Column, createColumnHelper } from "@tanstack/react-table";
import toast from "react-hot-toast";

import type { RouterOutputs } from "@acme/api";
import {
  MultiSelectFilter,
  multiSelectFilterFn,
} from "@acme/ui/table-with-pagination/_components/multi-select-filter";

import { api } from "~/trpc/react";

export const rolesInPortuguese = [
  "Diretor",
  "Coordenador",
  "Administrador",
  "Cantina",
  "Professor",
] as const;

export const rolesEnum = [
  "DIRECTOR",
  "COORDINATOR",
  "ADMINISTRATIVE",
  "CANTEEN",
  "TEACHER",
] as const;

const rolesMap: Record<string, string> = {};

for (let i = 0; i < rolesEnum.length; i++) {
  const role = rolesEnum[i];
  const roleInPortuguese = rolesInPortuguese[i];
  if (!role) continue;
  if (!roleInPortuguese) continue;
  rolesMap[role] = roleInPortuguese;
}

export function useSchoolWorkerColumns() {
  const { mutateAsync: deleteUser } = api.teacher.deleteById.useMutation();
  const utils = api.useUtils();

  const { data: roles } = api.role.getAllWorkerRoles.useQuery();

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
        }) => {
          return (
            <MultiSelectFilter
              data={roles?.map((r) => r.label) ?? []}
              {...props}
            />
          );
        },
      },
    }),
  ];
}
