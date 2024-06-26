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
    api.attendance.getClassAttendanceForCurrentAcademicPeriod.useQuery({
      classId,
      page,
      limit: size,
    });
  const { data: studentsCount } =
    api.class.countStudentsForClassOnCurrentAcademicPeriod.useQuery({
      classId,
    });
  return (
    <TableWithPagination
      data={attendances ?? []}
      isLoading={!attendances && isLoadingAttendances}
      totalCount={studentsCount ?? 0}
      columns={columns}
    />
  );
}
