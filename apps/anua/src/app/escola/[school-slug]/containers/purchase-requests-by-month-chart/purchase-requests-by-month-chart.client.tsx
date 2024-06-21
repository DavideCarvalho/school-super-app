"use client";

import { LineChart } from "@tremor/react";

import { CustomChartTooltip } from "~/components/custom-chart-tooltip";
import { api } from "~/trpc/react";

export function PurchaseRequestsByMonthChartClient() {
  const [purchaseRequestsLast360DaysByMonthData] =
    api.purchaseRequest.purchaseRequestsLast360DaysByMonth.useSuspenseQuery();
  return (
    <>
      <h3 className="text-tremor-content-strong text-lg font-medium">
        Solicitações de compra por mês
      </h3>
      <LineChart
        className="mt-4 h-72"
        data={purchaseRequestsLast360DaysByMonthData.map((d) => ({
          month: d.month,
          "Solicitações criadas": d.count,
        }))}
        index="month"
        categories={["Solicitações criadas"]}
        customTooltip={CustomChartTooltip}
      />
    </>
  );
}
