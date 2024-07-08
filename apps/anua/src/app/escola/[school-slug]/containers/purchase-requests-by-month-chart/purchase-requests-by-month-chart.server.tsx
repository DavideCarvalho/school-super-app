import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { api, HydrateClient } from "~/trpc/server";
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
  await api.purchaseRequest.purchaseRequestsMonthlyValueInLast360Days.prefetch();
  return (
    <HydrateClient>
      <PurchaseRequestsByMonthChartClient />
    </HydrateClient>
  );
}
