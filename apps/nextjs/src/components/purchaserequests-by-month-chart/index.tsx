"use client";

import { LineChart } from "@tremor/react";

import { api } from "~/trpc/react";
import { CustomChartTooltip } from "../custom-chart-tooltip";

interface PurchaseRequestsByMonthChartProps {
  schoolId: string;
}

export function PurchaseRequestsByMonthChart({
  schoolId,
}: PurchaseRequestsByMonthChartProps) {
  const { data: purchaseRequestsLast360DaysByMonthData } =
    api.purchaseRequest.purchaseRequestsLast360DaysByMonth.useQuery({
      schoolId,
    });
  return (
    <>
      <h3 className="text-tremor-content-strong text-lg font-medium">
        Solicitações de compra por mês
      </h3>
      <LineChart
        className="mt-4 h-72"
        data={
          purchaseRequestsLast360DaysByMonthData?.length
            ? purchaseRequestsLast360DaysByMonthData?.map((d) => ({
                month: d.month,
                "Solicitações criadas": d.count,
              }))
            : []
        }
        index="month"
        categories={["Solicitações criadas"]}
        customTooltip={CustomChartTooltip}
      />
    </>
  );
}
