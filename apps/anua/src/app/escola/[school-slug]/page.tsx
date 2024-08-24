import { api } from "~/trpc/server";
import { CanteenSellsQuantityByMonthChartServer } from "./containers/canteen-sells-quantity-by-month-chart/canteen-sells-quantity-by-month-chart.server";
import { CanteenSellsValueByMonthChartServer } from "./containers/canteen-sells-value-by-month-chart/canteen-sells-value-by-month-chart.server";
import { InteligenceCarouselServer } from "./containers/inteligence-carousel/inteligence-carousel.server";
import { PurchaseRequestsAverageTimeToFinishChartServer } from "./containers/purchase-request-average-time-to-finish-chart/purchase-request-average-time-to-finish-chart.server";
import { PurchaseRequestsValueMonthlyChartServer } from "./containers/purchase-request-value-monthly-chart/purchase-request-value-monthly-chart.server";
import { PurchaseRequestsByMonthChartServer } from "./containers/purchase-requests-by-month-chart/purchase-requests-by-month-chart.server";

export default async function DashboardPage({
  params,
}: {
  params: { "school-slug": string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const school = await api.school.bySlug({ slug: params["school-slug"] });
  if (!school) throw new Error("School not found");
  return (
    <>
      <InteligenceCarouselServer />
      <PurchaseRequestsValueMonthlyChartServer />
      <PurchaseRequestsAverageTimeToFinishChartServer />
      <PurchaseRequestsByMonthChartServer />
      {/* <CanteenSellsValueByMonthChartServer />
      <CanteenSellsQuantityByMonthChartServer /> */}
    </>
  );
}
