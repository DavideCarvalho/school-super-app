import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { Button } from "@acme/ui/button";

import { PurchaseRequestsTableV2 } from "~/components/purchase-requests-table-v2";
import { TeachersTableV2 } from "~/components/school-teachers-table-v2";
import { api, createSSRHelper } from "~/trpc/server";
import { EditTeacherModalListener } from "./_components/edit-teacher-modal-listener";
import { NewTeacherModalListener } from "./_components/new-teacher-modal-listener";

export default async function TeachersPage({
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
  await helper.teacher.getSchoolTeachers.prefetch({
    page: Number(url.searchParams.get("page")),
    limit: Number(url.searchParams.get("limit")),
  });
  await helper.teacher.countSchoolTeachers.prefetch();
  const dehydratedState = dehydrate(helper.queryClient);
  return (
    <HydrationBoundary state={dehydratedState}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Solicitações de compra</h2>
        <Link
          href={`${url.pathname}?${url.searchParams.toString()}#criar-solicitacao`}
        >
          <Button>Criar solicitação</Button>
        </Link>
      </div>
      <NewTeacherModalListener />
      <EditTeacherModalListener />
      <Suspense>
        <PurchaseRequestsTableV2 />
      </Suspense>
    </HydrationBoundary>
  );
}
