import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { Button } from "@acme/ui/button";

import { api, createSSRHelper } from "~/trpc/server";
import { ApprovePurchaseRequestModalListener } from "./_components/approve-purchase-request-modal-listener";
import { ArrivedPurchaseRequestModalListener } from "./_components/arrived-purchase-request-modal-listener";
import { BoughtPurchaseRequestModalListener } from "./_components/bought-purchase-request-modal-listener";
import { EditPurchaseRequestModalListener } from "./_components/edit-purchase-request-modal-listener";
import { NewPurchaseRequestModalListener } from "./_components/new-purchase-request-modal-listener";
import { RejectPurchaseRequestModalListener } from "./_components/reject-purchase-request-modal-listener";
import { PurchaseRequestsTableV2 } from "./containers/purchase-requests-table";
import { mapStatusesInPortugueseToEnum } from "./containers/purchase-requests-table/utils";

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
  const page = url.searchParams?.has("page")
    ? Number(url.searchParams.get("page"))
    : 1;
  const size = url.searchParams?.has("size")
    ? Number(url.searchParams?.get("size"))
    : 10;
  const products = url.searchParams.getAll("produto");
  const status = url.searchParams.getAll("status");
  const statusesMapped = mapStatusesInPortugueseToEnum(status);
  await helper.purchaseRequest.allBySchoolId.prefetch({
    page,
    size,
    products: products.length ? products : undefined,
    statuses: statusesMapped.length ? statusesMapped : undefined,
  });
  await helper.purchaseRequest.countAllBySchoolId.prefetch({
    products: products.length ? products : undefined,
    statuses: statusesMapped.length ? statusesMapped : undefined,
  });
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
      <ApprovePurchaseRequestModalListener />
      <RejectPurchaseRequestModalListener />
      <BoughtPurchaseRequestModalListener />
      <ArrivedPurchaseRequestModalListener />
      <Suspense>
        <PurchaseRequestsTableV2 />
      </Suspense>
    </HydrationBoundary>
  );
}
