"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { TableWithPagination } from "@acme/ui/table-with-pagination/table-with-pagination";

import { api } from "~/trpc/react";
import { useWorkersColumns } from "./use-worker-columns";
import { mapRolesInPortugueseToEnum } from "./utils";

export function WorkersTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const columns = useWorkersColumns();

  const filters = [
    {
      id: "funcao",
      value: searchParams?.getAll("funcao"),
    },
  ];

  const page = searchParams?.has("page") ? Number(searchParams.get("page")) : 1;
  const size = searchParams?.has("size")
    ? Number(searchParams?.get("size"))
    : 10;

  const rolesFiltered = mapRolesInPortugueseToEnum(
    (filters[0]?.value ?? []).filter((v) => v !== ""),
  );

  const { data: workers, isLoading: isLoadingWorkers } =
    api.user.allBySchoolId.useQuery({
      page,
      size,
      roles: rolesFiltered.length ? rolesFiltered : undefined,
    });

  const { data: workersCount } = api.user.countAllBySchoolId.useQuery({
    roles: rolesFiltered.length ? rolesFiltered : undefined,
  });

  return (
    <TableWithPagination
      isLoading={!workers && isLoadingWorkers}
      data={workers ?? []}
      columns={columns}
      totalCount={workersCount ?? 0}
      pageIndex={page - 1}
      pageSize={size}
      columnFilters={filters}
      onFilterChange={({ name, value }) => {
        const params = new URLSearchParams(searchParams ?? undefined);
        params.delete(name);
        if (Array.isArray(value)) {
          for (const v of value) params.append(name, v);
        }
        if (typeof value === "string" && (value as string).trim() !== "") {
          params.append(name, value);
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }}
    />
  );
}
