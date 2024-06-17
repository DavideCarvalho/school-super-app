"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { TableWithPagination } from "@acme/ui/table-with-pagination/table-with-pagination";

import { api } from "~/trpc/react";
import {
  statusesEnum,
  statusesInPortuguese,
  usePurchaseRequestsTableColumns,
} from "./use-purchase-requests-table-columns";

export function PurchaseRequestsTableV2() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const columns = usePurchaseRequestsTableColumns();

  const filters = [
    {
      id: "produto",
      value: searchParams?.getAll("produto"),
    },
    {
      id: "status",
      value: searchParams?.getAll("status"),
    },
  ];

  const page = searchParams?.has("page") ? Number(searchParams.get("page")) : 1;
  const size = searchParams?.has("size")
    ? Number(searchParams?.get("size"))
    : 10;

  const statusesFiltered = (filters[1]?.value ?? [])
    .filter((v) => v !== "")
    .map(
      (status) =>
        statusesEnum[statusesInPortuguese.findIndex((s) => s === status)],
    )
    .filter(Boolean) as unknown as (typeof statusesEnum)[];

  const { data: purchaseRequests, isLoading: isLoadingPurchaseRequests } =
    api.purchaseRequest.allBySchoolId.useQuery({
      size,
      page,
      products: filters[0]?.value?.length ? filters[0].value : undefined,
      statuses: statusesFiltered.length ? statusesFiltered : undefined,
    });

  const { data: purchaseRequestsCount } =
    api.purchaseRequest.countAllBySchoolId.useQuery({
      products: filters[0]?.value?.length ? filters[0].value : undefined,
      statuses: statusesFiltered.length ? statusesFiltered : undefined,
    });

  return (
    <TableWithPagination
      isLoading={!purchaseRequests && isLoadingPurchaseRequests}
      data={purchaseRequests ?? []}
      columns={columns}
      totalCount={purchaseRequestsCount ?? 0}
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
