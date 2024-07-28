"use client";

import { useSearchParams } from "next/navigation";

import { TableWithPagination } from "@acme/ui/table-with-pagination/table-with-pagination";

import { api } from "~/trpc/react";
import { useStudentsAttendancesTableColumns } from "./use-students-attendances-table-columns";

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
    api.attendance.getClassAttendanceForCurrentAcademicPeriod.useQuery({
      classId,
      subjectId,
      page,
      limit: size,
    });
  const { data: studentsCount } =
    api.class.countStudentsForClassOnCurrentAcademicPeriod.useQuery({
      classId,
    });
  return (
    <TableWithPagination
      data={attendances ? attendances.studentsAttendance : []}
      isLoading={!attendances && isLoadingAttendances}
      totalCount={studentsCount ?? 0}
      columns={columns}
    />
  );
}
