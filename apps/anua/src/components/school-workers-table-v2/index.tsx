"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";
import toast from "react-hot-toast";

import type { RouterOutputs } from "@acme/api";
import {
  MultiSelectFilter,
  multiSelectFilterFn,
} from "@acme/ui/table-with-pagination/_components/multi-select-filter";
import { TableWithPagination } from "@acme/ui/table-with-pagination/table-with-pagination";

import { api } from "~/trpc/react";

const rolesMap = {
  DIRECTOR: "Diretor",
  COORDINATOR: "Coordenador",
  ADMINISTRATIVE: "Administrador",
  CANTEEN_WORKER: "Cantina",
  TEACHER: "Professor",
};

export function WorkersTableV2() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const page = searchParams?.get("page") ? Number(searchParams.get("page")) : 1;
  const limit = searchParams?.get("limit")
    ? Number(searchParams.get("limit"))
    : 10;

  const rowList = Array(limit).fill(0);
  const { data: workers, isLoading: isLoadingWorkers } =
    api.user.allBySchoolId.useQuery({
      page,
      limit,
    });

  const { data: workersCount } = api.user.countAllBySchoolId.useQuery({});

  const utils = api.useUtils();

  const { mutateAsync: deleteUser } = api.teacher.deleteById.useMutation();

  const columnHelper =
    createColumnHelper<RouterOutputs["user"]["allBySchoolId"][0]>();

  const columns = [
    columnHelper.accessor("name", {
      header: "Nome",
      sortingFn: "auto",
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.accessor((row) => rolesMap[row.Role.name] ?? "-", {
      id: "role",
      header: "Função",
      sortingFn: "auto",
      filterFn: multiSelectFilterFn,
      meta: {
        filterComponent: MultiSelectFilter,
      },
    }),
  ];

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

  useEffect(() => {
    if (!searchParams) return;
    if (searchParams.has("page") && searchParams.has("limit")) return;
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("page", searchParams.get("page") || "1");
    newSearchParams.set("limit", searchParams.get("limit") || "10");
    router.push(`?${newSearchParams.toString()}`);
  }, [searchParams, router.push]);

  return (
    <>
      <TableWithPagination
        isLoading={isLoadingWorkers}
        data={workers ?? []}
        columns={columns}
        pageIndex={
          searchParams?.has("page") ? Number(searchParams.get("page")) - 1 : 0
        }
        pageSize={
          searchParams?.has("size") ? Number(searchParams.get("size")) : 10
        }
        onPageChange={(page) => {
          const params = new URLSearchParams(searchParams ?? undefined);
          params.set("page", String(page));
          router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }}
      />
      {/* <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome do funcionário</TableHead>
            <TableHead>Turmas</TableHead>
            <TableHead>Disponibilidade</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rowList.map((_row, index) => {
            const teacher = teachers ? teachers[index] : undefined;
            return (
              <TableRow
                key={teacher?.id ?? `${_row}-${index}-${page}`}
                style={{
                  height: "60px",
                }}
              >
                <TableCell>{teacher?.User?.name ?? "-"}</TableCell>
                <TableCell>
                  {teacher?.TeacherHasClass?.map(
                    ({ Subject }) => Subject.name,
                  )?.join(", ") ?? "-"}
                </TableCell>
                <TableCell>
                  {teacher?.TeacherHasClasses?.map(
                    ({ Class }) => Class.name,
                  )?.join(", ") ?? "-"}
                </TableCell>
                <TableCell>
                  {teacher?.TeacherAvailability?.map(
                    (availability) =>
                      `${daysOfWeekToPortuguese[availability.day as keyof typeof daysOfWeekToPortuguese]} - ${availability.startTime} - ${availability.endTime}`,
                  )?.join(", ") ?? "-"}
                </TableCell>
                <TableCell>
                  {teacher ? (
                    <div className="flex items-center gap-2">
                      <Link
                        href={`${pathname}?${searchParams?.toString()}#editar-professor?professor=${teacher.User.slug}`}
                      >
                        <Button size="sm" variant="ghost">
                          <UserIcon className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                      </Link>
                      <Button
                        className="text-red-600 hover:text-red-800"
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteTeacher(teacher.id)}
                      >
                        <Trash2Icon className="h-4 w-4" />
                        <span className="sr-only">Remover</span>
                      </Button>
                    </div>
                  ) : null}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <PaginationV2
        currentPage={page}
        itemsPerPage={limit}
        totalCount={teachersCount}
      /> */}
    </>
  );
}
