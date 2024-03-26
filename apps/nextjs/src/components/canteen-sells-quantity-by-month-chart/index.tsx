"use client";

import { LineChart } from "@tremor/react";

import { api } from "~/trpc/react";
import { CustomChartTooltip } from "../custom-chart-tooltip";

interface CanteenSellsQuantityByMonthChartProps {
  canteenId: string;
}

export function CanteenSellsQuantityByMonthChart({
  canteenId,
}: CanteenSellsQuantityByMonthChartProps) {
  const { data: canteenSellsByMonthData } =
    api.canteen.canteenSellsByMonth.useQuery({
      canteenId,
    });
  return (
    <>
      <h3 className="text-tremor-content-strong text-lg font-medium">
        Quantidade de vendas por mês
      </h3>
      <LineChart
        className="mt-4 h-72"
        data={
          canteenSellsByMonthData?.length
            ? canteenSellsByMonthData?.map((d) => ({
                month: d.month,
                "Quantidade de vendas": d.count,
              }))
            : []
        }
        index="month"
        categories={["Quantidade de vendas"]}
        customTooltip={CustomChartTooltip}
      />
    </>
  );
}
