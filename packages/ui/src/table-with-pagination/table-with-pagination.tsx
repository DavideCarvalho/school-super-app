import type {
  Column,
  ColumnDef,
  ColumnFiltersState,
  ColumnSort,
  FilterMeta,
} from "@tanstack/react-table";
import { memo, useCallback, useMemo } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/20/solid";
import {
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MultiSelect, MultiSelectItem } from "@tremor/react";

import { PaginationV2 } from "../pagination-v2";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../table";

export interface CustomFilterMeta extends FilterMeta {
  filterComponent?: (props: {
    column: Column<any, unknown>;
    onFilterChange: (param: { name: string; value: string[] }) => void;
  }) => JSX.Element;
}

interface ReactTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  isLoading: boolean;
  onPageChange?: (page: number) => void;
  onFilterChange?: (param: { name: string; value: string[] }) => void;
  onSortingChange?: (param: {
    name: string;
    value: "asc" | "desc" | undefined;
  }) => void;
  columnFilters?: ColumnFiltersState;
  pageSize?: number;
  pageIndex?: number;
  totalCount: number;
  initialSort?: { id: string; desc: boolean };
  noDataMessage?: string;
}

export function TableWithPagination<TData extends Record<string, unknown>>({
  data,
  columns,
  onFilterChange = () => {},
  onSortingChange = () => {},
  isLoading = false,
  pageSize = 10,
  pageIndex = 0,
  totalCount,
  columnFilters = [],
  noDataMessage = "Nada para mostrar!",
}: ReactTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    state: {
      pagination: {
        pageSize,
        pageIndex,
      },
      columnFilters,
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualFiltering: true,
  });

  const hasAtLeastOneFilter = useMemo(() => {
    return table
      .getHeaderGroups()
      .some((headerGroup) =>
        headerGroup.headers.some((header) => header.column.getCanFilter()),
      );
  }, [table]);

  const handleSortingChange = useCallback(
    (header) => (e) => {
      const handler = header.column.getToggleSortingHandler();
      if (!handler) return;
      handler(e);
      const currentSortingValue = header.column.getIsSorted();
      let nextValue: "asc" | "desc" | undefined = "desc";
      if (currentSortingValue === "asc") {
        nextValue = undefined;
      }
      if (currentSortingValue === "desc") {
        nextValue = "asc";
      }
      onSortingChange({
        name: header.column.id,
        value: nextValue,
      });
    },
    [onSortingChange],
  );

  if (!isLoading && data.length === 0) {
    return <h1>{noDataMessage}</h1>;
  }

  return (
    <div className="mt-8 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <Table className="min-w-full table-fixed divide-y divide-gray-300">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={`px-3 py-3.5 text-left text-sm font-semibold text-gray-900 ${
                        header.column.getCanSort()
                          ? "cursor-pointer select-none"
                          : ""
                      }`}
                    >
                      {typeof header.column.columnDef.header === "function" ? (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={handleSortingChange(header)}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {{
                              asc: (
                                <ArrowUpIcon
                                  width={15}
                                  height={15}
                                  className="inline-block"
                                />
                              ),
                              desc: (
                                <ArrowDownIcon
                                  width={15}
                                  height={15}
                                  className="inline-block"
                                />
                              ),
                            }[header.column.getIsSorted() as string] ?? null}
                          </button>
                          {hasAtLeastOneFilter && (
                            <div className="my-2">
                              <Filter
                                onFilterChange={onFilterChange}
                                column={header.column}
                              />
                            </div>
                          )}
                        </>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading && data.length === 0 ? (
                <TableSkeleton
                  pageSize={table.getState().pagination.pageSize}
                  columnsLength={columns.length}
                />
              ) : null}
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {table.getRowModel().rows.length < pageSize &&
                Array(pageSize - table.getRowModel().rows.length)
                  .fill(0)
                  .map((_, i) => (
                    <TableRow key={`fake_${i}`}>
                      {table.getVisibleFlatColumns().map((column) => (
                        <TableCell
                          key={column.id}
                          className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                        >
                          &nbsp;
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <PaginationV2
        currentPage={pageIndex + 1}
        totalCount={totalCount}
        itemsPerPage={pageSize}
      />
    </div>
  );
}

interface TableSkeletonProps {
  pageSize: number;
  columnsLength: number;
}

const TableSkeleton = ({ pageSize, columnsLength }: TableSkeletonProps) => {
  return (
    <>
      {Array(pageSize)
        .fill(0)
        .map((_, i) => (
          <tr key={i}>
            {Array(columnsLength)
              .fill(0)
              .map((_, j) => (
                <TableSkeletonRow key={j} />
              ))}
          </tr>
        ))}
    </>
  );
};

const TableSkeletonRow = () => {
  return (
    <td className="text-center">
      <p className="mt-2 animate-pulse rounded bg-gray-500 text-sm">&nbsp;</p>
    </td>
  );
};

const Filter = memo(
  ({
    column,
    onFilterChange,
  }: {
    column: Column<any, unknown>;
    onFilterChange: (param: { name: string; value: string[] }) => void;
  }) => {
    if (!column.getCanFilter()) {
      return (
        <MultiSelect
          value={undefined}
          onValueChange={() => {}}
          className="invisible"
        >
          <MultiSelectItem value={""} />
        </MultiSelect>
      );
    }

    const meta = column.columnDef.meta as CustomFilterMeta | undefined;
    if (meta?.filterComponent) {
      console.log("meta", meta.filterComponent);
      console.log("typeof meta.filterComponent", typeof meta.filterComponent);
      if (typeof meta.filterComponent === "function") {
        return meta.filterComponent({ column, onFilterChange });
      }
      const FilterComponent = meta.filterComponent;
      return (
        <FilterComponent column={column} onFilterChange={onFilterChange} />
      );
    }

    return null;
  },
);
Filter.displayName = "Filter";
