import { Suspense } from "react";
import { headers } from "next/headers";
import { ErrorBoundary } from "react-error-boundary";

import { api, HydrateClient } from "~/trpc/server";
import { SubjectSelectClient } from "./subject-select.client";

interface SubjectSelectServerProps {
  classSlug: string;
}

export async function SubjectSelectServer(props: SubjectSelectServerProps) {
  return (
    <ErrorBoundary fallback={<p>⚠️Opa, algo deu errado</p>}>
      <Suspense>
        <SubjectSelectDataLoader {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}

async function SubjectSelectDataLoader(props: SubjectSelectServerProps) {
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
      <SubjectSelectClient />
    </HydrateClient>
  );
}
