import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { api, HydrateClient } from "~/trpc/server";
import { CanteenSellsValueByMonthChartClient } from "./canteen-sells-value-by-month-chart.client";

export async function CanteenSellsValueByMonthChartServer() {
  return (
    <ErrorBoundary fallback={<p>⚠️Opa, algo deu errado</p>}>
      <Suspense>
        <CanteenSellsValueByMonthChartDataLoader />
      </Suspense>
    </ErrorBoundary>
  );
}

async function CanteenSellsValueByMonthChartDataLoader() {
  await api.canteen.canteenSellsByMonth.prefetch();
  return (
    <HydrateClient>
      <CanteenSellsValueByMonthChartClient />
    </HydrateClient>
  );
}
