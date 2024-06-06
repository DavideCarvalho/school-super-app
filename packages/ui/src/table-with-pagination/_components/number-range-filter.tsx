import { useEffect, useState } from "react";
import type { Column } from "@tanstack/react-table";

function NumberRangeFilter({
  column,
  onFilterChange,
}: {
  column: Column<any, unknown>;
  onFilterChange: (param: { name: string; value: string[] }) => void;
}) {
  let columnFilterValue: [number, number] = [0, 9999];

  if (column.getFilterValue()) {
    columnFilterValue = column.getFilterValue() as [number, number];
  }

  if (!columnFilterValue) {
    if (
      column.getFacetedMinMaxValues()?.[0] &&
      column.getFacetedMinMaxValues()?.[1]
    ) {
      column.setFilterValue([
        Number(column.getFacetedMinMaxValues()?.[0]),
        Number(column.getFacetedMinMaxValues()?.[1]),
      ]);
    }
  }

  const minValue = column.getFacetedMinMaxValues()?.[0]
    ? Number(column.getFacetedMinMaxValues()?.[0])
    : undefined;

  const fromInputMaxValue = columnFilterValue[1] - 1;

  const maxValue = column.getFacetedMinMaxValues()?.[1]
    ? Number(column.getFacetedMinMaxValues()?.[1])
    : undefined;

  const toInputMinValue = columnFilterValue[1];
  return (
    <div>
      <div className="flex space-x-2">
        <DebouncedInput
          type="number"
          min={minValue}
          max={fromInputMaxValue}
          value={columnFilterValue[0]}
          onChange={(value) => {
            onFilterChange({
              name: column.id,
              value: [
                Number(value).toString(),
                columnFilterValue[1].toString(),
              ],
            });
            return column.setFilterValue((old: [number, number]) => {
              if (!old) return [Number(value), 9999];
              return [Number(value), old[1]];
            });
          }}
          placeholder={`Min ${
            column.getFacetedMinMaxValues()?.[0]
              ? `(${column.getFacetedMinMaxValues()?.[0]})`
              : ""
          }`}
          className="w-24 rounded border shadow"
        />
        <DebouncedInput
          type="number"
          min={toInputMinValue}
          max={maxValue}
          value={columnFilterValue[1]}
          onChange={(value) => {
            onFilterChange({
              name: column.id,
              value: [
                columnFilterValue[0].toString(),
                Number(value).toString(),
              ],
            });
            return column.setFilterValue((old: [number, number]) => {
              if (!old) return [0, Number(value)];
              return [old[0], Number(value)];
            });
          }}
          placeholder={`Max ${
            column.getFacetedMinMaxValues()?.[1]
              ? `(${column.getFacetedMinMaxValues()?.[1]})`
              : ""
          }`}
          className="w-24 rounded border shadow"
        />
      </div>
      <div className="h-1" />
    </div>
  );
}

function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number | string[];
  onChange: (value: string | number | string[]) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
