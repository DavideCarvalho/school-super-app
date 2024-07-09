"use client";

import { useSearchParams } from "next/navigation";

import { TableWithPagination } from "@acme/ui/table-with-pagination/table-with-pagination";

import { api } from "~/trpc/react";
import { useAssignmentsTableColumns } from "./use-assignments-table-columns";

interface AssignmentsTableProps {
  classId: string;
  subjectId: string;
}

export function AssignmentsTableClient({
  classId,
  subjectId,
}: AssignmentsTableProps) {
  const searchParams = useSearchParams();

  const page = searchParams.has("page") ? Number(searchParams.get("page")) : 1;
  const size = searchParams.has("size") ? Number(searchParams.get("size")) : 10;

  const columns = useAssignmentsTableColumns(classId);
  const { data: assignments, isLoading: isLoadingAssignments } =
    api.assignment.getCurrentAcademicPeriodAssignments.useQuery({
      classId,
      subjectId,
      page,
      limit: size,
    });
  const { data: assignmentsCount } =
    api.assignment.countCurrentAcademicPeriodAssignments.useQuery({
      classId,
      subjectId,
    });
  return (
    <TableWithPagination
      data={assignments ?? []}
      isLoading={!assignments && isLoadingAssignments}
      totalCount={assignmentsCount ?? 0}
      columns={columns}
    />
  );
}
