"use client";

import { LineChart } from "@tremor/react";

import { CustomChartTooltip } from "~/components/custom-chart-tooltip";
import { api } from "~/trpc/react";

export function PurchaseRequestsAverageTimeToFinishChartClient() {
  const [purchaseRequestsTimeToFinalStatusInLast360DaysData] =
    api.purchaseRequest.purchaseRequestsTimeToFinalStatusInLast360Days.useSuspenseQuery();

  return (
    <>
      <h3 className="text-tremor-content-strong text-lg font-medium">
        Tempo médio para finalização de solicitações de compra por mês
      </h3>
      <LineChart
        className="mt-4 h-72"
        data={purchaseRequestsTimeToFinalStatusInLast360DaysData.map((d) => ({
          month: d.month,
          "Dias para fechar": d.averageDaysToFinish,
        }))}
        index="month"
        categories={["Dias para fechar"]}
        customTooltip={CustomChartTooltip}
      />

      {/* <PurchaseRequestsByMonthChart schoolId={schoolId} /> */}

      {/* {canteen && (
        <>
          <CanteenSellsQuantityByMonthChart canteenId={canteen.id} />
          <CanteenSellsValueByMonthChart canteenId={canteen.id} />
        </>
      )} */}
    </>
  );
}
