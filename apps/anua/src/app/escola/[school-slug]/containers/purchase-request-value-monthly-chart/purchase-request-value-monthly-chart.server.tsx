import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

import { api, createSSRHelper } from "~/trpc/server";
import { PurchaseRequestsValueMonthlyChartClient } from "./purchase-request-value-monthly-chart.client";

export async function PurchaseRequestsValueMonthlyChartServer() {
  return (
    <ErrorBoundary fallback={<p>⚠️Opa, algo deu errado</p>}>
      <Suspense>
        <PurchaseRequestsValueMonthlyChartDataLoader />
      </Suspense>
    </ErrorBoundary>
  );
}

async function PurchaseRequestsValueMonthlyChartDataLoader() {
  const helper = await createSSRHelper();
  helper.purchaseRequest.purchaseRequestsMonthlyValueInLast360Days.prefetch();
  const dehydratedState = dehydrate(helper.queryClient);
  return (
    <HydrationBoundary state={dehydratedState}>
      <PurchaseRequestsValueMonthlyChartClient />
    </HydrationBoundary>
  );
}
