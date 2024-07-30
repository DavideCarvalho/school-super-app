import { Suspense } from "react";
import { headers } from "next/headers";
import { ErrorBoundary } from "react-error-boundary";

import { api, HydrateClient } from "~/trpc/server";
import { AttendancesTableClient } from "./attendances-table.client";

interface AttendancesTableServerProps {
  classId: string;
  subjectId: string;
}

export async function AttendancesTableServer(
  props: AttendancesTableServerProps,
) {
  return (
    <ErrorBoundary fallback={<p>⚠️Opa, algo deu errado</p>}>
      <Suspense>
        <AttendancesTableDataLoader {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}

async function AttendancesTableDataLoader(props: AttendancesTableServerProps) {
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
    api.attendance.getClassAttendancesDoneForCurrentAcademicPeriod.prefetch({
      classId: props.classId,
      subjectId: props.subjectId,
      page,
      limit: size,
    }),
    api.attendance.countClassAttendancesDoneForCurrentAcademicPeriod.prefetch({
      classId: props.classId,
      subjectId: props.subjectId,
    }),
  ]);
  return (
    <HydrateClient>
      <AttendancesTableClient {...props} />
    </HydrateClient>
  );
}
