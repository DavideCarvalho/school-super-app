import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

import { createSSRHelper } from "~/trpc/server";
import { PurchaseRequestsAverageTimeToFinishChartClient } from "./purchase-request-average-time-to-finish-chart.client";

export async function PurchaseRequestsAverageTimeToFinishChartServer() {
  return (
    <ErrorBoundary fallback={<p>⚠️Opa, algo deu errado</p>}>
      <Suspense>
        <PurchaseRequestsAverageTimeToFinishChartDataLoader />
      </Suspense>
    </ErrorBoundary>
  );
}

async function PurchaseRequestsAverageTimeToFinishChartDataLoader() {
  const helper = await createSSRHelper();
  await helper.purchaseRequest.purchaseRequestsTimeToFinalStatusInLast360Days.prefetch();
  const dehydratedState = dehydrate(helper.queryClient);
  return (
    <HydrationBoundary state={dehydratedState}>
      <PurchaseRequestsAverageTimeToFinishChartClient />
    </HydrationBoundary>
  );
}
