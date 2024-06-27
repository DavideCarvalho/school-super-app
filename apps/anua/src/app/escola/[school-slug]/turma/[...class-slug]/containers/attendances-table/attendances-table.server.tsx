import { Suspense } from "react";
import { headers } from "next/headers";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

import { createSSRHelper } from "~/trpc/server";
import { AttendancesTableClient } from "./attendances-table.client";

interface AssignmentsTableServerProps {
  classId: string;
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
  const helper = await createSSRHelper();
  await Promise.all([
    helper.class.getClassAttendance.prefetch({
      classId: props.classId,
      page,
      limit: size,
    }),
    helper.class.countClassAttendance.prefetch({
      classId: props.classId,
    }),
  ]);
  const dehydratedState = dehydrate(helper.queryClient);
  return (
    <HydrationBoundary state={dehydratedState}>
      <AttendancesTableClient {...props} />
    </HydrationBoundary>
  );
}
