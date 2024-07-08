import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { api, HydrateClient } from "~/trpc/server";
import { CanteenSellsQuantityByMonthChart } from "./canteen-sells-quantity-by-month-chart.client";

export async function CanteenSellsQuantityByMonthChartServer() {
  return (
    <ErrorBoundary fallback={<p>⚠️Opa, algo deu errado</p>}>
      <Suspense>
        <CanteenSellsQuantityByMonthChartDataLoader />
      </Suspense>
    </ErrorBoundary>
  );
}

async function CanteenSellsQuantityByMonthChartDataLoader() {
  await api.canteen.canteenSellsByMonth.prefetch();
  return (
    <HydrateClient>
      <CanteenSellsQuantityByMonthChart />
    </HydrateClient>
  );
}
