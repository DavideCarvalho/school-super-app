import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { Button } from "@acme/ui/button";

import { api, createSSRHelper, HydrateClient } from "~/trpc/server";
import { EditTeacherModalListener } from "./_components/edit-teacher-modal-listener";
import { EditWorkerModalListener } from "./_components/edit-worker-modal-listener";
import { NewWorkerModalListener } from "./_components/new-worker-modal-listener";
import { WorkersTable } from "./containers/workers-table";
import { mapRolesInPortugueseToEnum } from "./containers/workers-table/utils";

export default async function WorkersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const requestHeaders = headers();
  const xUrl = requestHeaders.get("x-url");
  if (!xUrl) throw new Error("unreachable");
  const url = new URL(xUrl);
  const page = searchParams.page ? Number(searchParams.page) : 1;
  const size = searchParams.size ? Number(searchParams.size) : 10;
  const roles = mapRolesInPortugueseToEnum(
    url.searchParams.getAll("funcao") ?? [],
  );
  await Promise.all([
    api.user.allBySchoolId.prefetch({
      page,
      size,
      roles: roles.length ? roles : undefined,
    }),
    api.user.countAllBySchoolId.prefetch({
      roles: roles.length ? roles : undefined,
    }),
  ]);
  return (
    <HydrateClient>
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
    </HydrateClient>
  );
}
