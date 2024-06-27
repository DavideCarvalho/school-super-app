import { Suspense } from "react";
import { headers } from "next/headers";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

import { createSSRHelper } from "~/trpc/server";
import { AssignmentsTableClient } from "./assignments-table.client";

interface AssignmentsTableServerProps {
  classId: string;
}

export async function AssignmentsTableServer(
  props: AssignmentsTableServerProps,
) {
  return (
    <ErrorBoundary fallback={<p>⚠️Opa, algo deu errado</p>}>
      <Suspense>
        <AssignmentsTableDataLoader {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}

async function AssignmentsTableDataLoader(props: AssignmentsTableServerProps) {
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
    helper.class.getClassAssignments.prefetch({
      classId: props.classId,
      page,
      limit: size,
    }),
    helper.class.countClassAssignments.prefetch({
      classId: props.classId,
    }),
  ]);
  const dehydratedState = dehydrate(helper.queryClient);
  return (
    <HydrationBoundary state={dehydratedState}>
      <AssignmentsTableClient {...props} />
    </HydrationBoundary>
  );
}
