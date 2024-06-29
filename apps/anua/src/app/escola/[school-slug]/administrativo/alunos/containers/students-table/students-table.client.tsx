"use client";

import { useSearchParams } from "next/navigation";

import { TableWithPagination } from "@acme/ui/table-with-pagination/table-with-pagination";

import { api } from "~/trpc/react";
import { useStudentsColumns } from "./use-students-columns";

export function StudentsTableClient() {
  const searchParams = useSearchParams();
  const columns = useStudentsColumns();

  const page = searchParams?.has("page") ? Number(searchParams.get("page")) : 1;
  const size = searchParams?.has("size")
    ? Number(searchParams?.get("size"))
    : 10;

  const { data: students, isLoading: isLoadingStudents } =
    api.student.allBySchoolId.useQuery({
      page,
      size,
    });

  const { data: studentsCount } = api.student.countAllBySchoolId.useQuery();

  return (
    <TableWithPagination
      isLoading={!students && isLoadingStudents}
      data={students ?? []}
      columns={columns}
      totalCount={studentsCount ?? 0}
      pageIndex={page - 1}
      pageSize={size}
    />
  );
}
