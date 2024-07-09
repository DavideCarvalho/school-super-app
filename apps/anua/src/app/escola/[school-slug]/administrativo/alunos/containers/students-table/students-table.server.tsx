import { Suspense } from "react";
import { headers } from "next/headers";
import { ErrorBoundary } from "react-error-boundary";

import { api, HydrateClient } from "~/trpc/server";
import { StudentsTableClient } from "./students-table.client";

export async function StudentsTableServer() {
  return (
    <ErrorBoundary fallback={<p>⚠️Opa, algo deu errado</p>}>
      <Suspense>
        <StudentsTableDataLoader />
      </Suspense>
    </ErrorBoundary>
  );
}

async function StudentsTableDataLoader() {
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
    api.student.allBySchoolId.prefetch({
      page,
      size,
    }),
    api.student.countAllBySchoolId.prefetch(),
  ]);
  return (
    <HydrateClient>
      <StudentsTableClient />
    </HydrateClient>
  );
}
