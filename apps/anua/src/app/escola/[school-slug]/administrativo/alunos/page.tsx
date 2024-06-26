import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { Button } from "@acme/ui/button";

import { api, createSSRHelper } from "~/trpc/server";
import { NewStudentModalListener } from "./components/new-student-modal-listener";
import { StudentsTableServer } from "./containers/students-table/students-table.server";

export default async function StudentsPage({
  params,
  searchParams,
}: {
  params: { "school-slug": string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const requestHeaders = headers();
  const xUrl = requestHeaders.get("x-url");
  if (!xUrl) throw new Error("unreachable");
  const url = new URL(xUrl);
  const school = await api.school.bySlug({ slug: params["school-slug"] });
  if (!school) throw new Error("School not found");
  const page = searchParams.page ? Number(searchParams.page) : 1;
  const size = searchParams.size ? Number(searchParams.size) : 10;
  const helper = await createSSRHelper();
  helper.student.allBySchoolId.prefetch({
    page,
    size,
  });
  helper.student.countAllBySchoolId.prefetch();
  const dehydratedState = dehydrate(helper.queryClient);
  return (
    <HydrationBoundary state={dehydratedState}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Alunos</h2>
        <Link
          href={`${url.pathname}?${url.searchParams.toString()}#adicionar-aluno`}
        >
          <Button>Adicionar aluno</Button>
        </Link>
      </div>
      <NewStudentModalListener />
      <StudentsTableServer />
    </HydrationBoundary>
  );
}
