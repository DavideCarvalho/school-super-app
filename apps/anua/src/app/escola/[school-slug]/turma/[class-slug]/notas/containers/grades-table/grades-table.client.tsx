"use client";

import { useSearchParams } from "next/navigation";

import { TableWithPagination } from "@acme/ui/table-with-pagination/table-with-pagination";

import { api } from "~/trpc/react";
import { useAssignmentsTableColumns } from "./use-grades-table-columns";

interface GradeTableProps {
  classId: string;
  subjectId: string;
}

export function GradesTableClient({ classId, subjectId }: GradeTableProps) {
  const searchParams = useSearchParams();

  const page = searchParams.has("page") ? Number(searchParams.get("page")) : 1;
  const size = searchParams.has("size") ? Number(searchParams.get("size")) : 10;

  const columns = useAssignmentsTableColumns();
  const { data: studentGrades, isLoading: isLoadingStudentGrades } =
    api.grade.getStudentsGradesForClassOnCurrentAcademicPeriod.useQuery({
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
      data={studentGrades ?? []}
      isLoading={!studentGrades && isLoadingStudentGrades}
      totalCount={studentsCount ?? 0}
      columns={columns}
    />
  );
}
