import { Suspense } from "react";
import { headers } from "next/headers";
import { ErrorBoundary } from "react-error-boundary";

import { api, HydrateClient } from "~/trpc/server";
import { SubjectsTableClient } from "./subjects-table.client";

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
  await Promise.all([
    api.subject.allBySchoolId.prefetch({
      page: Number(url.searchParams.get("page")),
      limit: Number(url.searchParams.get("size")),
    }),
    api.subject.countAllBySchoolId.prefetch(),
  ]);
  return (
    <HydrateClient>
      <SubjectsTableClient />
    </HydrateClient>
  );
}
