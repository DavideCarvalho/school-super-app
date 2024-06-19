"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { TableWithPagination } from "@acme/ui/table-with-pagination/table-with-pagination";

import { api } from "~/trpc/react";
import { usePurchaseRequestsTableColumns } from "./use-print-requests-table-columns";
import { mapStatusesInPortugueseToEnum } from "./utils";

export function PurchaseRequestsTableV2() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const columns = usePurchaseRequestsTableColumns();

  const filters = [
    {
      id: "status",
      value: searchParams?.getAll("status"),
    },
  ];

  const page = searchParams?.has("page") ? Number(searchParams.get("page")) : 1;
  const size = searchParams?.has("size")
    ? Number(searchParams?.get("size"))
    : 10;

  const statusesFiltered = mapStatusesInPortugueseToEnum(
    filters[0]?.value ?? [],
  );

  const { data: printRequests, isLoading: isLoadingPrintRequest } =
    api.file.allBySchoolId.useQuery({
      page,
      size,
      statuses: statusesFiltered.length ? statusesFiltered : undefined,
    });

  const { data: printRequestsCount } = api.file.countAllBySchoolId.useQuery({
    statuses: statusesFiltered.length ? statusesFiltered : undefined,
  });

  return (
    <TableWithPagination
      isLoading={!printRequests && isLoadingPrintRequest}
      data={printRequests ?? []}
      columns={columns}
      totalCount={printRequestsCount ?? 0}
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
