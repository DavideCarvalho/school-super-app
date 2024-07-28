import { Suspense } from "react";
import { headers } from "next/headers";
import { ErrorBoundary } from "react-error-boundary";

import { api, HydrateClient } from "~/trpc/server";
import { AttendancesTableClient } from "./studants-attendances-table.client";

interface AssignmentsTableServerProps {
  classId: string;
  subjectId: string;
}

export async function AttendancesTableServer(
  props: AssignmentsTableServerProps,
) {
  return (
    <ErrorBoundary fallback={<p>⚠️Opa, algo deu errado</p>}>
      <Suspense>
        <AttendancesTableDataLoader {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}

async function AttendancesTableDataLoader(props: AssignmentsTableServerProps) {
  const requestHeaders = headers();
  const xUrl = requestHeaders.get("x-url")!;
  const url = new URL(xUrl);
  const page = url.searchParams.has("page")
    ? Number(url.searchParams.get("page"))
    : 1;
  const size = url.searchParams.has("size")
    ? Number(url.searchParams.get("size"))
    : 10;
  await Promise.all([
    api.attendance.getClassAttendanceForCurrentAcademicPeriod.prefetch({
      classId: props.classId,
      subjectId: props.subjectId,
      page,
      limit: size,
    }),
    api.class.countStudentsForClassOnCurrentAcademicPeriod.prefetch({
      classId: props.classId,
    }),
  ]);
  return (
    <HydrateClient>
      <AttendancesTableClient {...props} />
    </HydrateClient>
  );
}
