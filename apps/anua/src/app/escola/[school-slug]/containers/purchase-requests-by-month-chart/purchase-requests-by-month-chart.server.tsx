import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

import { createSSRHelper } from "~/trpc/server";
import { PurchaseRequestsByMonthChartClient } from "./purchase-requests-by-month-chart.client";

export async function PurchaseRequestsByMonthChartServer() {
  return (
    <ErrorBoundary fallback={<p>⚠️Opa, algo deu errado</p>}>
      <Suspense>
        <PurchaseRequestsByMonthChartDataLoader />
      </Suspense>
    </ErrorBoundary>
  );
}

async function PurchaseRequestsByMonthChartDataLoader() {
  const helper = await createSSRHelper();
  helper.purchaseRequest.purchaseRequestsMonthlyValueInLast360Days.prefetch();
  const dehydratedState = dehydrate(helper.queryClient);
  return (
    <HydrationBoundary state={dehydratedState}>
      <PurchaseRequestsByMonthChartClient />
    </HydrationBoundary>
  );
}
