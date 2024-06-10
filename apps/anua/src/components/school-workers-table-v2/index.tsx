"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { TableWithPagination } from "@acme/ui/table-with-pagination/table-with-pagination";

import { api } from "~/trpc/react";
import { useSchoolWorkerColumns } from "./use-school-worker-columns";

export function WorkersTableV2() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const columns = useSchoolWorkerColumns();

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

  const { data: workers, isLoading: isLoadingWorkers } =
    api.user.allBySchoolId.useQuery();

  console.log("workers.length", workers?.length);

  return (
    <TableWithPagination
      isLoading={!workers && isLoadingWorkers}
      data={workers ?? []}
      columns={columns}
      totalCount={workers?.length ?? 0}
      pageIndex={page}
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
