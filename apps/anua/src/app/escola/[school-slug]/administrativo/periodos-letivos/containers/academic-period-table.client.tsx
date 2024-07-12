"use client";

import { useSearchParams } from "next/navigation";

import { TableWithPagination } from "@acme/ui/table-with-pagination/table-with-pagination";

import { api } from "~/trpc/react";
import { useAcademicPeriodColumns } from "./use-academic-period-columns";

export function AcademicPeriodTableClient() {
  const searchParams = useSearchParams();
  const columns = useAcademicPeriodColumns();

  const page = searchParams?.has("page") ? Number(searchParams.get("page")) : 1;
  const size = searchParams?.has("size")
    ? Number(searchParams?.get("size"))
    : 10;

  const { data: academicPeriods, isLoading: isLoadingAcademicPeriods } =
    api.academicPeriod.allBySchoolId.useQuery({
      page,
      size,
    });

  const { data: academicPeriodsCount } =
    api.academicPeriod.countAllBySchoolId.useQuery();

  return (
    <TableWithPagination
      isLoading={!academicPeriods && isLoadingAcademicPeriods}
      data={academicPeriods ?? []}
      columns={columns}
      totalCount={academicPeriodsCount ?? 0}
      pageIndex={page - 1}
      pageSize={size}
    />
  );
}
