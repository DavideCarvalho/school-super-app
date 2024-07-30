"use client";

import { useSearchParams } from "next/navigation";

import { TableWithPagination } from "@acme/ui/table-with-pagination/table-with-pagination";

import { api } from "~/trpc/react";
import { useStudentsAttendancesTableColumns } from "./use-attendances-table-columns";

interface AttendancesTableProps {
  classId: string;
  subjectId: string;
}

export function AttendancesTableClient({
  classId,
  subjectId,
}: AttendancesTableProps) {
  const searchParams = useSearchParams();

  const page = searchParams.has("page") ? Number(searchParams.get("page")) : 1;
  const size = searchParams.has("size") ? Number(searchParams.get("size")) : 10;

  const columns = useStudentsAttendancesTableColumns();
  const { data: attendances, isLoading: isLoadingAttendances } =
    api.attendance.getClassAttendancesDoneForCurrentAcademicPeriod.useQuery({
      classId,
      subjectId,
      page,
      limit: size,
    });
  const { data: attendancesCount } =
    api.attendance.countClassAttendancesDoneForCurrentAcademicPeriod.useQuery({
      classId,
      subjectId,
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
