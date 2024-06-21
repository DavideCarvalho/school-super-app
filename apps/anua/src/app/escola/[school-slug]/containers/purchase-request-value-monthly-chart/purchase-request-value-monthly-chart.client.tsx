"use client";

import { LineChart } from "@tremor/react";

import { CustomChartTooltip } from "~/components/custom-chart-tooltip";
import { api } from "~/trpc/react";

export function PurchaseRequestsValueMonthlyChartClient() {
  const [purchaseRequestsMonthlyValueInLast360DaysData] =
    api.purchaseRequest.purchaseRequestsMonthlyValueInLast360Days.useSuspenseQuery();

  return (
    <>
      <h3 className="text-tremor-content-strong text-lg font-medium">
        Valor total de solicitações de compra por mês
      </h3>
      <LineChart
        className="mt-4 h-72"
        data={purchaseRequestsMonthlyValueInLast360DaysData.map((d) => ({
          month: d.month,
          Valor: d.value,
        }))}
        index="month"
        categories={["Valor"]}
        customTooltip={CustomChartTooltip}
      />

      {/* TODO: Passar isso pra dashboard {canteen && (
        <>
          <CanteenSellsQuantityByMonthChart canteenId={canteen.id} />
          <CanteenSellsValueByMonthChart canteenId={canteen.id} />
        </>
      )} */}
    </>
  );
}
