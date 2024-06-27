"use client";

import { useSearchParams } from "next/navigation";

import { TableWithPagination } from "@acme/ui/table-with-pagination/table-with-pagination";

import { api } from "~/trpc/react";
import { useAssignmentsTableColumns } from "./use-assignments-table-columns";

interface AssignmentsTableProps {
  classId: string;
}

export function AssignmentsTableClient({ classId }: AssignmentsTableProps) {
  const searchParams = useSearchParams();

  const page = searchParams.has("page") ? Number(searchParams.get("page")) : 1;
  const size = searchParams.has("size") ? Number(searchParams.get("size")) : 10;

  const columns = useAssignmentsTableColumns();
  const { data: assignments, isLoading: isLoadingAssignments } =
    api.class.getClassAssignments.useQuery({
      classId,
      page,
      limit: size,
    });
  const { data: assignmentsCount } = api.class.countClassAssignments.useQuery({
    classId,
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
