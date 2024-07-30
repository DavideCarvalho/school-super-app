import { Suspense } from "react";
import { headers } from "next/headers";
import { ErrorBoundary } from "react-error-boundary";

import { api, HydrateClient } from "~/trpc/server";
import { StudentsAttendancesTableClient } from "./studants-attendances-table.client";

interface StudentsAttendancesTableServerProps {
  classId: string;
  subjectId: string;
}

export async function StudentsAttendancesTableServer(
  props: StudentsAttendancesTableServerProps,
) {
  return (
    <ErrorBoundary fallback={<p>⚠️Opa, algo deu errado</p>}>
      <Suspense>
        <StudentsAttendancesTableDataLoader {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}

async function StudentsAttendancesTableDataLoader(
  props: StudentsAttendancesTableServerProps,
) {
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
      <StudentsAttendancesTableClient {...props} />
    </HydrateClient>
  );
}
