import { Suspense } from "react";
import { headers } from "next/headers";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

import { api, createSSRHelper, HydrateClient } from "~/trpc/server";
import { AssignmentsTableClient } from "./assignments-table.client";

interface AssignmentsTableServerProps {
  classId: string;
  subjectId: string;
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
  await Promise.all([
    api.assignment.getCurrentAcademicPeriodAssignments.prefetch({
      classId: props.classId,
      subjectId: props.subjectId,
      page,
      limit: size,
    }),
    api.assignment.countCurrentAcademicPeriodAssignments.prefetch({
      classId: props.classId,
      subjectId: props.subjectId,
    }),
  ]);
  return (
    <HydrateClient>
      <AssignmentsTableClient {...props} />
    </HydrateClient>
  );
}
