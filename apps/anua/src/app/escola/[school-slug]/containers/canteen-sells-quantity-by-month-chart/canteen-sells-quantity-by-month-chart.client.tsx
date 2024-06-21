"use client";

import { LineChart } from "@tremor/react";

import { CustomChartTooltip } from "~/components/custom-chart-tooltip";
import { api } from "~/trpc/react";

export function CanteenSellsQuantityByMonthChart() {
  const [canteenSellsByMonthData] =
    api.canteen.canteenSellsByMonth.useSuspenseQuery();
  return (
    <>
      <h3 className="text-tremor-content-strong text-lg font-medium">
        Quantidade de vendas por mês
      </h3>
      <LineChart
        className="mt-4 h-72"
        data={
          canteenSellsByMonthData.map((d) => ({
                month: d.month,
                "Quantidade de vendas": d.count,
              }))
        }
        index="month"
        categories={["Quantidade de vendas"]}
        customTooltip={CustomChartTooltip}
      />
    </>
  );
}
