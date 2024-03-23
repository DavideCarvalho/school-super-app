import type { CustomTooltipProps } from "@tremor/react";

export function CustomChartTooltip({ payload, active }: CustomTooltipProps) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-tremor-default border-tremor-border bg-tremor-background text-tremor-default shadow-tremor-dropdown w-56 border p-2">
      {payload.map((category, idx) => (
        <div key={idx} className="flex flex-1 space-x-2.5">
          <div
            className={`flex w-1 flex-col bg-${category.color}-500 rounded`}
          />
          <div className="space-y-1">
            <p className="text-tremor-content">{category.dataKey}</p>
            <p className="text-tremor-content-emphasis font-medium">
              {category.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
