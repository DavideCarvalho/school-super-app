import type {
  Column,
  ColumnDef,
  ColumnFiltersState,
  FilterMeta,
} from "@tanstack/react-table";
import { useEffect } from "react";
import {
  ArrowDownIcon,
  ArrowLongLeftIcon,
  ArrowLongRightIcon,
  ArrowUpIcon,
} from "@heroicons/react/20/solid";
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
  initialFilters?: ColumnFiltersState;
  pageSize?: number;
  pageIndex?: number;
  initialSort?: { id: string; desc: boolean };
  noDataMessage?: string;
}

export function TableWithPagination<TData extends Record<string, unknown>>({
  data,
  columns,
  onPageChange = () => {},
  onFilterChange = () => {},
  onSortingChange = () => {},
  isLoading = false,
  pageSize = 10,
  pageIndex = 0,
  initialFilters = [],
  initialSort,
  noDataMessage = "No data to show!",
}: ReactTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    initialState: {
      pagination: {
        pageSize,
        pageIndex,
      },
      columnFilters: initialFilters,
      sorting: initialSort ? [initialSort] : [],
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getSortedRowModel: getSortedRowModel(),
  });

  useEffect(() => {
    table.setPageIndex(pageIndex);
  }, [table, pageIndex]);

  useEffect(() => {
    table.setPageSize(pageSize);
  }, [table, pageSize]);

  if (isLoading) {
    return <h1>Loading data...</h1>;
  }

  if (data.length === 0) {
    return <h1>{noDataMessage}</h1>;
  }

  let hasAtLeastOneFilter = false;
  headerGroupLoop: for (const headerGroup of table.getHeaderGroups()) {
    for (const header of headerGroup.headers) {
      if (header.column.getCanFilter()) {
        hasAtLeastOneFilter = true;
        break headerGroupLoop;
      }
    }
  }

  return (
    <div className="mt-8 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <table className="min-w-full table-fixed divide-y divide-gray-300">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={`px-3 py-3.5 text-left text-sm font-semibold text-gray-900 ${header.column.getCanSort() ? "cursor-pointer select-none" : ""}`}
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
                            onClick={(e) => {
                              const handler =
                                header.column.getToggleSortingHandler();
                              if (!handler) return;
                              handler(e);
                              const currentSortingValue =
                                header.column.getIsSorted();
                              let nextValue: "asc" | "desc" | undefined =
                                "desc";
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
                            }}
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
                          {hasAtLeastOneFilter ? (
                            <div className="my-2">
                              <Filter
                                onFilterChange={onFilterChange}
                                column={header.column}
                              />
                            </div>
                          ) : null}
                        </>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading && data.length === 0 ? (
                <TableSkeleton columnsLength={columns.length} />
              ) : null}
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {table.getRowModel().rows.length &&
                table.getRowModel().rows.length < 5 &&
                Array(Math.abs(5 - table.getRowModel().rows.length))
                  .fill(0)
                  .map((_, i) => (
                    <tr key={`fake_${i}`}>
                      <td
                        key={i}
                        className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                      >
                        &nbsp;
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          <PaginationV2
            currentPage={table.getState().pagination.pageIndex + 1}
            totalCount={table.getPageCount()}
            itemsPerPage={table.getState().pagination.pageSize}
          />
        </div>
      </div>
    </div>
  );
}

interface TableSkeletonProps {
  columnsLength: number;
}

function TableSkeleton({ columnsLength }: TableSkeletonProps) {
  return (
    <>
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <tr key={i}>
            {Array(columnsLength)
              .fill(0)
              .map((_, i) => (
                <TableSkeletonRow key={i} />
              ))}
          </tr>
        ))}
    </>
  );
}

function TableSkeletonRow() {
  return (
    <td className="text-center">
      <p className="mt-2 animate-pulse rounded bg-gray-500 text-sm">&nbsp;</p>
    </td>
  );
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  // onPageChange: (page: number) => void;
}

// function Pagination({
//   currentPage,
//   totalPages,
//   onPageChange,
// }: PaginationProps) {
//   const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

//   // biome-ignore lint/style/noNonNullAssertion: This will always be defined
//   const firstPage = pages[0]!;
//   // biome-ignore lint/style/noNonNullAssertion: This will always be defined
//   const lastPage = pages[pages.length - 1]!;

//   const nextPage = currentPage === totalPages ? undefined : pages[currentPage];
//   const previousPage = currentPage === 1 ? undefined : pages[currentPage - 2];

//   return (
//     <nav className="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0">
//       <div className="-mt-px flex w-0 flex-1">
//         <button
//           type="button"
//           disabled={currentPage === 1}
//           onClick={() => onPageChange(currentPage - 1)}
//           className="inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
//         >
//           <ArrowLongLeftIcon
//             className="mr-3 h-5 w-5 text-gray-400"
//             aria-hidden="true"
//           />
//           Previous
//         </button>
//       </div>
//       <div className="hidden md:-mt-px md:flex">
//         {firstPage !== currentPage && (
//           <button
//             type="button"
//             onClick={() => onPageChange(firstPage)}
//             className={`inline-flex items-center border-t-2 ${
//               firstPage === currentPage
//                 ? "border-indigo-500 text-indigo-600"
//                 : "border-transparent text-gray-500"
//             } px-4 pt-4 text-sm font-medium hover:border-gray-300 hover:text-gray-700`}
//             aria-current={lastPage === currentPage ? "page" : undefined}
//           >
//             {firstPage}
//           </button>
//         )}
//         {previousPage && previousPage !== firstPage && (
//           <>
//             <button
//               type="button"
//               className={`inline-flex items-center border-t-2 ${
//                 previousPage === currentPage
//                   ? "border-indigo-500 text-indigo-600"
//                   : "border-transparent text-gray-500"
//               } px-4 pt-4 text-sm font-medium hover:cursor-default`}
//               aria-current={previousPage === currentPage ? "page" : undefined}
//             >
//               ...
//             </button>
//             <button
//               type="button"
//               onClick={() => onPageChange(previousPage)}
//               className={`inline-flex items-center border-t-2 ${
//                 previousPage === currentPage
//                   ? "border-indigo-500 text-indigo-600"
//                   : "border-transparent text-gray-500"
//               } px-4 pt-4 text-sm font-medium hover:border-gray-300 hover:text-gray-700`}
//               aria-current={previousPage === currentPage ? "page" : undefined}
//             >
//               {previousPage}
//             </button>
//           </>
//         )}
//         {(currentPage !== firstPage || currentPage !== lastPage) && (
//           <button
//             type="button"
//             className={
//               "border-t-2border-indigo-500 inline-flex cursor-default items-center px-4 pt-4 text-sm font-medium text-indigo-600"
//             }
//           >
//             {currentPage}
//           </button>
//         )}
//         {nextPage && nextPage !== lastPage && (
//           <>
//             <button
//               type="button"
//               onClick={() => onPageChange(nextPage)}
//               className={`inline-flex items-center border-t-2 ${
//                 nextPage === currentPage
//                   ? "border-indigo-500 text-indigo-600"
//                   : "border-transparent text-gray-500"
//               } px-4 pt-4 text-sm font-medium hover:border-gray-300 hover:text-gray-700`}
//               aria-current={nextPage === currentPage ? "page" : undefined}
//             >
//               {nextPage}
//             </button>
//             <button
//               type="button"
//               className={`inline-flex items-center border-t-2 ${
//                 nextPage === currentPage
//                   ? "border-indigo-500 text-indigo-600"
//                   : "border-transparent text-gray-500"
//               } px-4 pt-4 text-sm font-medium hover:cursor-default`}
//               aria-current={nextPage === currentPage ? "page" : undefined}
//             >
//               ...
//             </button>
//           </>
//         )}
//         {lastPage !== firstPage && currentPage !== lastPage && (
//           <button
//             type="button"
//             onClick={() => onPageChange(lastPage)}
//             className={`inline-flex items-center border-t-2 ${
//               lastPage === currentPage
//                 ? "border-indigo-500 text-indigo-600"
//                 : "border-transparent text-gray-500"
//             } px-4 pt-4 text-sm font-medium hover:border-gray-300 hover:text-gray-700`}
//             aria-current={lastPage === currentPage ? "page" : undefined}
//           >
//             {lastPage}
//           </button>
//         )}
//       </div>

//       <div className="-mt-px flex w-0 flex-1 justify-end">
//         <button
//           type="button"
//           disabled={currentPage === totalPages}
//           onClick={() => onPageChange(currentPage + 1)}
//           className="inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
//         >
//           Next
//           <ArrowLongRightIcon
//             className="ml-3 h-5 w-5 text-gray-400"
//             aria-hidden="true"
//           />
//         </button>
//       </div>
//     </nav>
//   );
// }

function Filter({
  column,
  onFilterChange,
}: {
  column: Column<any, unknown>;
  onFilterChange: (param: { name: string; value: string[] }) => void;
}) {
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
    const FilterComponent = meta.filterComponent;
    return <FilterComponent column={column} onFilterChange={onFilterChange} />;
  }

  return null;
}
