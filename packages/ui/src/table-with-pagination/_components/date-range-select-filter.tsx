import type { Column, FilterFn } from "@tanstack/react-table";
import { useState } from "react";
import { Select, SelectItem } from "@tremor/react";
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  getDay,
  isAfter,
  isBefore,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from "date-fns";

const ranges = [
  {
    label: "Today",
    value: {
      from: new Date(),
      to: new Date(),
    },
  },
  {
    label: "Yesterday",
    value: {
      from: subDays(new Date(), 1),
      to: subDays(new Date(), 1),
    },
  },
  {
    label: "This week",
    value: {
      from: subDays(new Date(), getDay(new Date())),
      to: new Date(),
    },
  },
  {
    label: "Last 7 days",
    value: {
      from: subDays(new Date(), 7),
      to: new Date(),
    },
  },
  {
    label: "Last Week",
    value: {
      from: startOfWeek(subDays(new Date(), 7)),
      to: endOfWeek(subDays(new Date(), 7)),
    },
  },
  {
    label: "This month",
    value: {
      from: startOfMonth(new Date()),
      to: new Date(),
    },
  },
  {
    label: "Last 30 days",
    value: {
      from: subDays(new Date(), 30),
      to: new Date(),
    },
  },
  {
    label: "Last month",
    value: {
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1)),
    },
  },
  {
    label: "This year",
    value: {
      from: startOfYear(new Date()),
      to: endOfYear(new Date()),
    },
  },
  {
    label: "Last year",
    value: {
      from: startOfYear(subYears(new Date(), 1)),
      to: endOfYear(subYears(new Date(), 1)),
    },
  },
];

export function DateRangeSelectFilter({
  column,
  onFilterChange,
}: {
  column: Column<any, unknown>;
  onFilterChange: (param: { name: string; value: string }) => void;
}) {
  const columnFilterValue: string | undefined =
    (column.getFilterValue() as string) ?? undefined;
  const [value, setValue] = useState<string | undefined>(columnFilterValue);
  return (
    <Select
      value={value}
      onValueChange={(value) => {
        onFilterChange({
          name: column.id,
          value,
        });
        column.setFilterValue(value);
        return setValue(value);
      }}
    >
      {ranges.map(({ label }) => (
        <SelectItem key={label} value={label}>
          {label}
        </SelectItem>
      ))}
    </Select>
  );
}

export const dateRangeSelectFilterFn: FilterFn<any> = (
  row,
  id,
  value: string,
) => {
  const rowValue: Date = row.getValue(id);
  const range = ranges.find(({ label }) => label === value);
  if (!range) return true;
  return (
    isAfter(endOfDay(rowValue), startOfDay(range.value.from)) &&
    isBefore(startOfDay(rowValue), endOfDay(range.value.to))
  );
};
