"use client";

import { LineChart } from "@tremor/react";

import { CustomChartTooltipMoneyFormatter } from "~/components/custom-chart-tooltip-money-formatter";
import { api } from "~/trpc/react";

export function CanteenSellsValueByMonthChartClient() {
  const [canteenSellsByMonthData] =
    api.canteen.canteenSellsByMonth.useSuspenseQuery();
  return (
    <>
      <h3 className="text-tremor-content-strong text-lg font-medium">
        Valor de vendas por mês
      </h3>
      <LineChart
        className="mt-4 h-72"
        data={canteenSellsByMonthData.map((d) => ({
          month: d.month,
          Valor: d.totalPrice,
        }))}
        index="month"
        categories={["Valor"]}
        customTooltip={CustomChartTooltipMoneyFormatter}
      />
    </>
  );
}
