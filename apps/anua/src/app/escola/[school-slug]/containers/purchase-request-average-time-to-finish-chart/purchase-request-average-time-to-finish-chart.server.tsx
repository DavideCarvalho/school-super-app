import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { api, HydrateClient } from "~/trpc/server";
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
  await api.purchaseRequest.purchaseRequestsTimeToFinalStatusInLast360Days.prefetch();
  return (
    <HydrateClient>
      <PurchaseRequestsAverageTimeToFinishChartClient />
    </HydrateClient>
  );
}
