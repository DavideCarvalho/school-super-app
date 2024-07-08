import { Suspense } from "react";
import { headers } from "next/headers";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

import { api, createSSRHelper, HydrateClient } from "~/trpc/server";
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
  await Promise.all([
    api.grade.getStudentsGradesForClassOnCurrentAcademicPeriod.prefetch({
      classId: props.classId,
      page,
      limit: size,
    }),
    api.class.countStudentsForClassOnCurrentAcademicPeriod.prefetch({
      classId: props.classId,
    }),
  ]);
  return (
    <HydrateClient>
      <GradesTableClient {...props} />
    </HydrateClient>
  );
}
