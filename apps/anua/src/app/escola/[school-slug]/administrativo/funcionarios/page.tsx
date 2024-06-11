import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { Button } from "@acme/ui/button";

import { TeachersTableV2 } from "~/components/school-teachers-table-v2";
import { WorkersTableV2 } from "~/components/school-workers-table-v2";
import { api, createSSRHelper } from "~/trpc/server";
import { EditTeacherModalListener } from "./_components/edit-teacher-modal-listener";
import { EditWorkerModalListener } from "./_components/edit-worker-modal-listener";
import { NewWorkerModalListener } from "./_components/new-worker-modal-listener";

export default async function WorkersPage({
  params,
}: {
  params: { "school-slug": string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const requestHeaders = headers();
  const xUrl = requestHeaders.get("x-url");
  if (!xUrl) throw new Error("unreachable");
  const url = new URL(xUrl);
  if (!url.searchParams.has("page")) {
    url.searchParams.set("size", "1");
  }
  if (!url.searchParams.has("size")) {
    url.searchParams.set("size", "10");
  }
  const school = await api.school.bySlug({ slug: params["school-slug"] });
  if (!school) throw new Error("School not found");
  const helper = await createSSRHelper();
  await helper.teacher.getSchoolTeachers.prefetch({
    page: Number(url.searchParams.get("page")),
    limit: Number(url.searchParams.get("size")),
  });
  await helper.user.allBySchoolId.prefetch();
  await helper.teacher.countSchoolTeachers.prefetch();
  const dehydratedState = dehydrate(helper.queryClient);
  return (
    <HydrationBoundary state={dehydratedState}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Funcionários</h2>
        <Link
          href={`${url.pathname}?${url.searchParams.toString()}#adicionar-funcionario`}
        >
          <Button>Adicionar funcionário</Button>
        </Link>
      </div>
      <NewWorkerModalListener />
      <EditWorkerModalListener />
      <EditTeacherModalListener />
      <Suspense>
        <WorkersTableV2 />
      </Suspense>
    </HydrationBoundary>
  );
}
