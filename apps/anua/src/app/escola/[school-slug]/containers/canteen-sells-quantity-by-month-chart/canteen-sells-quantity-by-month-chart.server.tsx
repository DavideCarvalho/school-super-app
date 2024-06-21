import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

import { createSSRHelper } from "~/trpc/server";
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
  const helper = await createSSRHelper();
  helper.canteen.canteenSellsByMonth.prefetch();
  const dehydratedState = dehydrate(helper.queryClient);
  return (
    <HydrationBoundary state={dehydratedState}>
      <CanteenSellsQuantityByMonthChart />
    </HydrationBoundary>
  );
}
