import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

import { createSSRHelper } from "~/trpc/server";
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
  const helper = await createSSRHelper();
  await helper.canteen.canteenSellsByMonth.prefetch();
  const dehydratedState = dehydrate(helper.queryClient);
  return (
    <HydrationBoundary state={dehydratedState}>
      <CanteenSellsValueByMonthChartClient />
    </HydrationBoundary>
  );
}
