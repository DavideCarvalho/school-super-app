import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { Button } from "@acme/ui/button";

import { api, createSSRHelper, HydrateClient } from "~/trpc/server";
import { ApprovePurchaseRequestModalListener } from "./_components/approve-purchase-request-modal-listener";
import { ArrivedPurchaseRequestModalListener } from "./_components/arrived-purchase-request-modal-listener";
import { BoughtPurchaseRequestModalListener } from "./_components/bought-purchase-request-modal-listener";
import { EditPurchaseRequestModalListener } from "./_components/edit-purchase-request-modal-listener";
import { NewPurchaseRequestModalListener } from "./_components/new-purchase-request-modal-listener";
import { RejectPurchaseRequestModalListener } from "./_components/reject-purchase-request-modal-listener";
import { PurchaseRequestsTableV2 } from "./containers/purchase-requests-table";
import { mapStatusesInPortugueseToEnum } from "./containers/purchase-requests-table/utils";

export default async function TeachersPage({
  searchParams,
}: {
  params: { "school-slug": string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const requestHeaders = headers();
  const xUrl = requestHeaders.get("x-url");
  if (!xUrl) throw new Error("unreachable");
  const url = new URL(xUrl);
  const page = searchParams.page ? Number(searchParams.page) : 1;
  const size = searchParams.size ? Number(url.searchParams.size) : 10;
  const products = url.searchParams.getAll("produto");
  const status = url.searchParams.getAll("status");
  const statusesMapped = mapStatusesInPortugueseToEnum(status);
  await Promise.all([
    api.purchaseRequest.allBySchoolId.prefetch({
      page,
      size,
      products: products.length ? products : undefined,
      statuses: statusesMapped.length ? statusesMapped : undefined,
    }),
    api.purchaseRequest.countAllBySchoolId.prefetch({
      products: products.length ? products : undefined,
      statuses: statusesMapped.length ? statusesMapped : undefined,
    }),
  ]);
  return (
    <HydrateClient>
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
    </HydrateClient>
  );
}
