import type { Column, FilterFn } from "@tanstack/react-table";
import { DateRangePicker, DateRangePickerItem } from "@tremor/react";
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

type DateFilterColumnValue = [Date | undefined, Date | undefined];

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

export function DateFilter({
  column,
  onFilterChange,
}: {
  column: Column<any, unknown>;
  onFilterChange: (param: {
    name: string;
    value: [Date | undefined, Date | undefined];
  }) => void;
}) {
  const columnFilterValue: DateFilterColumnValue =
    (column.getFilterValue() as DateFilterColumnValue) ??
    ([] as unknown as DateFilterColumnValue);

  return (
    <DateRangePicker
      className="mx-auto inline-flex max-w-md"
      value={{
        from: columnFilterValue[0],
        to: columnFilterValue[1],
      }}
      onValueChange={(value) => {
        column.setFilterValue([value.from, value.to]);
        onFilterChange({
          name: column.id,
          value: [value?.from, value?.to],
        });
      }}
    >
      {ranges.map((range) => (
        <DateRangePickerItem
          from={range.value.from}
          to={range.value.to}
          key={range.label}
          value={range.label}
        >
          {range.label}
        </DateRangePickerItem>
      ))}
    </DateRangePicker>
  );
}

export const dateFilterFn: FilterFn<any> = (row, id, value: [Date, Date]) => {
  const rowValue: Date = row.getValue(id);
  const from = value[0];
  const to = value[1];
  if (from == null || to == null) return true;
  return (
    isAfter(endOfDay(rowValue), startOfDay(from)) &&
    isBefore(startOfDay(rowValue), endOfDay(to))
  );
};
