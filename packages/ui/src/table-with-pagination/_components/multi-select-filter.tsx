import { useMemo } from "react";
import type { Column, FilterFn } from "@tanstack/react-table";
import { MultiSelect, MultiSelectItem } from "@tremor/react";

export function MultiSelectFilter({
  column,
  onFilterChange,
}: {
  column: Column<any, unknown>;
  onFilterChange: (param: { name: string; value: string[] }) => void;
}) {
  const columnFilterValue: string[] =
    (column.getFilterValue() as string[]) ?? ([] as string[]);
  const sortedUniqueValues = useMemo(
    () => Array.from(column.getFacetedUniqueValues().keys()).sort(),
    [column.getFacetedUniqueValues()],
  );
  return (
    <MultiSelect
      value={columnFilterValue}
      onValueChange={(value) => {
        onFilterChange({ name: column.id, value });
        return column.setFilterValue(value);
      }}
    >
      {sortedUniqueValues.map((value: string) => (
        <MultiSelectItem key={value} value={value}>
          {value}
        </MultiSelectItem>
      ))}
    </MultiSelect>
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
