import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { Button } from "@acme/ui/button";

import { api, createSSRHelper } from "~/trpc/server";
import { EditTeacherModalListener } from "./_components/edit-teacher-modal-listener";
import { EditWorkerModalListener } from "./_components/edit-worker-modal-listener";
import { NewWorkerModalListener } from "./_components/new-worker-modal-listener";
import { WorkersTable } from "./containers/workers-table";
import { mapRolesInPortugueseToEnum } from "./containers/workers-table/utils";

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
  const school = await api.school.bySlug({ slug: params["school-slug"] });
  if (!school) throw new Error("School not found");
  const page = url.searchParams?.has("page")
    ? Number(url.searchParams.get("page"))
    : 1;
  const size = url.searchParams?.has("size")
    ? Number(url.searchParams?.get("size"))
    : 10;
  const roles = mapRolesInPortugueseToEnum(
    url.searchParams.getAll("funcao") ?? [],
  );
  const helper = await createSSRHelper();
  await helper.user.allBySchoolId.prefetch({
    page,
    size,
    roles: roles.length ? roles : undefined,
  });
  await helper.user.countAllBySchoolId.prefetch({
    roles: roles.length ? roles : undefined,
  });
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
        <WorkersTable />
      </Suspense>
    </HydrationBoundary>
  );
}
