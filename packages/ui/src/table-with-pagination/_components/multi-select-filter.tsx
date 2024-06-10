import type { Column, FilterFn } from "@tanstack/react-table";
import { useCallback, useMemo } from "react";

import { MultiSelect } from "../../multi-select";

export function MultiSelectFilter({
  data,
  column,
  onFilterChange,
}: {
  data?: string[];
  column: Column<any, unknown>;
  onFilterChange: (param: { name: string; value: string[] }) => void;
}) {
  const columnFilterValue: string[] =
    (column.getFilterValue() as string[]) ?? ([] as string[]);

  const sortedUniqueValues = useMemo(
    () => data ?? Array.from(column.getFacetedUniqueValues().keys()).sort(),
    [column.getFacetedUniqueValues(), data],
  );

  const handleChange = useCallback(
    (option) => {
      const selectedValues = option.map((o) => o.value);
      onFilterChange({ name: column.id, value: selectedValues });
      column.setFilterValue(selectedValues);
    },
    [onFilterChange, column],
  );

  return (
    <MultiSelect
      selected={columnFilterValue.map((value) => ({ value, label: value }))}
      options={sortedUniqueValues.map((value) => ({ value, label: value }))}
      onChange={handleChange}
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
