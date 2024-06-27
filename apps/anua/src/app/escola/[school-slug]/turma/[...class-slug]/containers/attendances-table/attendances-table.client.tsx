"use client";

import { useSearchParams } from "next/navigation";

import { TableWithPagination } from "@acme/ui/table-with-pagination/table-with-pagination";

import { api } from "~/trpc/react";
import { useAttendancesTableColumns } from "./use-attendances-table-columns";

interface AttendancesTableProps {
  classId: string;
}

export function AttendancesTableClient({ classId }: AttendancesTableProps) {
  const searchParams = useSearchParams();

  const page = searchParams.has("page") ? Number(searchParams.get("page")) : 1;
  const size = searchParams.has("size") ? Number(searchParams.get("size")) : 10;

  const columns = useAttendancesTableColumns();
  const { data: attendances, isLoading: isLoadingAttendances } =
    api.class.getClassAttendance.useQuery({
      classId,
      page,
      limit: size,
    });
  const { data: attendanceCount } = api.class.countClassAttendance.useQuery({
    classId,
  });
  return (
    <TableWithPagination
      data={attendances ?? []}
      isLoading={!attendances && isLoadingAttendances}
      totalCount={attendanceCount ?? 0}
      columns={columns}
    />
  );
}
