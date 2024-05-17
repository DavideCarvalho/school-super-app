"use client";

import { LineChart } from "@tremor/react";

import { api } from "~/trpc/react";
import { CustomChartTooltipMoneyFormatter } from "../custom-chart-tooltip-money-formatter";

interface CanteenSellsValueByMonthChartProps {
  canteenId: string;
}

export function CanteenSellsValueByMonthChart({
  canteenId,
}: CanteenSellsValueByMonthChartProps) {
  const { data: canteenSellsByMonthData } =
    api.canteen.canteenSellsByMonth.useQuery({
      canteenId,
    });
  return (
    <>
      <h3 className="text-tremor-content-strong text-lg font-medium">
        Valor de vendas por mês
      </h3>
      <LineChart
        className="mt-4 h-72"
        data={
          canteenSellsByMonthData?.length
            ? canteenSellsByMonthData?.map((d) => ({
                month: d.month,
                Valor: d.totalPrice,
              }))
            : []
        }
        index="month"
        categories={["Valor"]}
        customTooltip={CustomChartTooltipMoneyFormatter}
      />
    </>
  );
}
