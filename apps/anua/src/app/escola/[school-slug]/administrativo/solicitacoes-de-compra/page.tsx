import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { Button } from "@acme/ui/button";

import { api, createSSRHelper } from "~/trpc/server";
import { EditPurchaseRequestModalListener } from "./_components/edit-purchase-request-modal-listener";
import { NewPurchaseRequestModalListener } from "./_components/new-purchase-request-modal-listener";
import { PurchaseRequestsTableV2 } from "./containers/purchase-requests-table";

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
  // TODO: Dar prefetch para PurchaseRequests
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
      <EditPurchaseRequestModalListener />
      <NewPurchaseRequestModalListener />
      <Suspense>
        <PurchaseRequestsTableV2 />
      </Suspense>
    </HydrationBoundary>
  );
}