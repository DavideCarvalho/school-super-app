"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { PencilIcon, TrashIcon } from "@heroicons/react/20/solid";
import { createColumnHelper } from "@tanstack/react-table";
import toast from "react-hot-toast";

import type { RouterOutputs } from "@acme/api";
import { Button } from "@acme/ui/button";

import { api } from "~/trpc/react";
import { rolesMap } from "./utils";

type Row = RouterOutputs["student"]["allBySchoolId"][0];

export function useStudentsColumns() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const utils = api.useUtils();

  const { data: roles } = api.role.getAllWorkerRoles.useQuery();

  const columnHelper = createColumnHelper<Row>();

  const { mutateAsync: deleteUser } = api.user.deleteById.useMutation();

  async function handleDeleteWorker(workerId: string) {
    const toastId = toast.loading("Removendo aluno...");
    try {
      await deleteUser({ userId: workerId });
      toast.success("Aluno removido com sucesso!");
    } catch (e) {
      toast.error("Erro ao remover aluno");
    } finally {
      toast.dismiss(toastId);
      await Promise.all([
        utils.student.allBySchoolId.invalidate(),
        utils.student.countAllBySchoolId.invalidate(),
      ]);
    }
  }

  const { mutateAsync: deleteTeacher } = api.teacher.deleteById.useMutation();

  async function handleDeleteStudent(studentId: string) {
    const toastId = toast.loading("Removendo aluno...");
    try {
      // await deleteTeacher({ userId: teacherId });
      toast.success("Aluno removido com sucesso!");
    } catch (e) {
      toast.error("Erro ao remover aluno");
    } finally {
      toast.dismiss(toastId);
      await Promise.all([
        utils.student.allBySchoolId.invalidate(),
        utils.student.countAllBySchoolId.invalidate(),
      ]);
    }
  }

  return [
    columnHelper.accessor("User.name", {
      id: "nome",
      header: "Nome",
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.accessor((row) => row.StudentHasResponsible.length, {
      id: "responsaveis",
      header: "Responsáveis",
      enableColumnFilter: false,
      enableSorting: false,
      cell: ({ row }) => {
        return <p>{row.original.StudentHasResponsible.length} responsáveis</p>;
      },
    }),
    columnHelper.display({
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <Link
              href={`${pathname}?${searchParams?.toString()}#editar-aluno?aluno=${row.original.User.slug}`}
            >
              <Button size="sm" variant="ghost">
                <PencilIcon className="h-4 w-4" />
                <span className="sr-only">Editar</span>
              </Button>
            </Link>
          </div>
        );
      },
    }),
  ];
}
