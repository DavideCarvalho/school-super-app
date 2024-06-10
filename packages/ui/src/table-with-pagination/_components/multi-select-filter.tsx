import type { Column, FilterFn } from "@tanstack/react-table";
import { useMemo } from "react";

import { MultiSelect } from "../../multi-select";

export function MultiSelectFilter({
  column,
  onFilterChange,
}: {
  column: Column<any, unknown>;
  onFilterChange: (param: { name: string; value: string[] }) => void;
}) {
  const columnFilterValue: string[] =
    (column.getFilterValue() as string[]) ?? ([] as string[]);
  console.log(columnFilterValue);
  const sortedUniqueValues = useMemo(
    () => Array.from(column.getFacetedUniqueValues().keys()).sort(),
    [column.getFacetedUniqueValues()],
  );
  return (
    <MultiSelect
      selected={columnFilterValue.map((value) => ({ value, label: value }))}
      options={sortedUniqueValues.map((value) => ({ value, label: value }))}
      onChange={(option) => {
        onFilterChange({ name: column.id, value: option.map((o) => o.value) });
        return column.setFilterValue(option.map((o) => o.value));
      }}
    />
  );
}

export const multiSelectFilterFn: FilterFn<any> = (
  row,
  id,
  value: string[],
) => {
  if (!value.length) return true;
  return value.includes(row.getValue(id));
};
