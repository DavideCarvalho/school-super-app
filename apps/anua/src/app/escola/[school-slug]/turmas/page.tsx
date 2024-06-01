import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { Button } from "@acme/ui/button";

import { ClassesTableV2 } from "~/components/school-classes-table-v2";
import { api, createSSRHelper } from "~/trpc/server";
import { EditClassModalListener } from "./_components/edit-class-modal-listener";
import { NewClassModalListener } from "./_components/new-class-modal-listener";

export default async function SubjectsPage({
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
  const helper = await createSSRHelper();
  await helper.class.allBySchoolId.prefetch({
    page: Number(url.searchParams.get("page")),
    limit: Number(url.searchParams.get("limit")),
  });
  await helper.class.countAllBySchoolId.prefetch();
  const dehydratedState = dehydrate(helper.queryClient);
  return (
    <HydrationBoundary state={dehydratedState}>
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
        <ClassesTableV2 />
      </Suspense>
    </HydrationBoundary>
  );
}
