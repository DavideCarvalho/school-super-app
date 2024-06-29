import { Suspense } from "react";
import { headers } from "next/headers";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

import { createSSRHelper } from "~/trpc/server";
import { StudentsTableClient } from "./students-table.client";

export async function SubjectsTableServer() {
  return (
    <ErrorBoundary fallback={<p>⚠️Opa, algo deu errado</p>}>
      <Suspense>
        <SubjectsTableDataLoader />
      </Suspense>
    </ErrorBoundary>
  );
}

async function SubjectsTableDataLoader() {
  const requestHeaders = headers();
  const xUrl = requestHeaders.get("x-url")!;
  const url = new URL(xUrl);
  const helper = await createSSRHelper();
  await Promise.all([
    helper.subject.allBySchoolId.prefetch({
      page: Number(url.searchParams.get("page")),
      limit: Number(url.searchParams.get("size")),
    }),
    helper.subject.countAllBySchoolId.prefetch(),
  ]);
  const dehydratedState = dehydrate(helper.queryClient);
  return (
    <HydrationBoundary state={dehydratedState}>
      <StudentsTableClient />
    </HydrationBoundary>
  );
}
