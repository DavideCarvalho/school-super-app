import { Suspense } from "react";
import { headers } from "next/headers";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

import { createSSRHelper } from "~/trpc/server";
import { GradesTableClient } from "./grades-table.client";

interface GradesTableServerProps {
  classId: string;
}

export async function GradesTableServer(props: GradesTableServerProps) {
  return (
    <ErrorBoundary fallback={<p>⚠️Opa, algo deu errado</p>}>
      <Suspense>
        <GradesTableDataLoader {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}

async function GradesTableDataLoader(props: GradesTableServerProps) {
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
      <GradesTableClient {...props} />
    </HydrationBoundary>
  );
}
