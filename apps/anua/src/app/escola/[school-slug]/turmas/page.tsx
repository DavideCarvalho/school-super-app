import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";

import { Button } from "@acme/ui/button";

import { api, HydrateClient } from "~/trpc/server";
import { EditClassModalListener } from "./_components/edit-class-modal-listener";
import { NewClassModalListener } from "./_components/new-class-modal-listener";
import { ClassesTable } from "./containers/classes-table";

export default async function ClassesPage({
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
    url.searchParams.set("page", "1");
  }
  if (!url.searchParams.has("limit")) {
    url.searchParams.set("limit", "10");
  }
  const school = await api.school.bySlug({ slug: params["school-slug"] });
  if (!school) throw new Error("School not found");
  await api.class.allBySchoolId.prefetch({
    page: Number(url.searchParams.get("page")),
    limit: Number(url.searchParams.get("limit")),
  });
  await api.class.countAllBySchoolId.prefetch();
  return (
    <HydrateClient>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Turmas</h2>
        <Link
          href={`${url.pathname}?${url.searchParams.toString()}#adicionar-turma`}
        >
          <Button>Adicionar Turma</Button>
        </Link>
      </div>
      <NewClassModalListener />
      <EditClassModalListener />
      <Suspense>
        <ClassesTable />
      </Suspense>
    </HydrateClient>
  );
}
