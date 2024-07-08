import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { api, HydrateClient } from "~/trpc/server";
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
  await api.purchaseRequest.purchaseRequestsMonthlyValueInLast360Days.prefetch();
  return (
    <HydrateClient>
      <PurchaseRequestsValueMonthlyChartClient />
    </HydrateClient>
  );
}
