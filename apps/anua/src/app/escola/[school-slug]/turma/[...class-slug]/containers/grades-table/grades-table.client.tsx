"use client";

import { useSearchParams } from "next/navigation";

import { TableWithPagination } from "@acme/ui/table-with-pagination/table-with-pagination";

import { api } from "~/trpc/react";
import { useAssignmentsTableColumns } from "./use-grades-table-columns";

interface GradeTableProps {
  classId: string;
}

export function GradesTableClient({ classId }: GradeTableProps) {
  const searchParams = useSearchParams();

  const page = searchParams.has("page") ? Number(searchParams.get("page")) : 1;
  const size = searchParams.has("size") ? Number(searchParams.get("size")) : 10;

  const columns = useAssignmentsTableColumns();
  const { data: attendances, isLoading: isLoadingAttendances } =
    api.class.getClassAttendance.useQuery({
      classId,
      page,
      limit: size,
    });
  const { data: attendancesCount } = api.class.countClassAttendance.useQuery({
    classId,
  });
  return (
    <TableWithPagination
      data={attendances ?? []}
      isLoading={!attendances && isLoadingAttendances}
      totalCount={attendancesCount ?? 0}
      columns={columns}
    />
  );
}
