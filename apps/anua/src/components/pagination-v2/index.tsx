"use client";

import { usePathname, useSearchParams } from "next/navigation";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@acme/ui/pagination";

interface PaginationV2Props {
  currentPage: number;
  totalCount: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function PaginationV2({
  currentPage,
  totalCount,
  itemsPerPage,
  onPageChange,
}: PaginationV2Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pages = Math.ceil(totalCount / itemsPerPage);
  const pagesList = Array.from(Array(pages < 3 ? pages : 3).keys()).map((i) =>
    currentPage <= 5 ? i + 1 : i + currentPage - 2,
  );

  function pageUrl(page: number) {
    const newSearchParams = new URLSearchParams(searchParams!.toString());
    newSearchParams.set("page", page.toString());
    return `${pathname}?${newSearchParams.toString()}`;
  }

  return (
    <Pagination>
      <PaginationContent>
        {pagesList[0]! > 1 && (
          <>
            <PaginationItem>
              <PaginationLink href={pageUrl(1)} onClick={() => onPageChange(1)}>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          </>
        )}
        {pagesList.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href={pageUrl(page)}
              isActive={page === currentPage}
              onClick={() => onPageChange(page)}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        {pagesList[pagesList.length - 1]! < pages && (
          <>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                href={pageUrl(pages)}
                onClick={() => onPageChange(pages)}
              >
                {pages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}
        {/* <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem> */}
      </PaginationContent>
    </Pagination>
  );
  // return (
  //   <div className="bg-gray-50 py-6">
  //     <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  //       <div className="flex flex-col items-center lg:flex-row lg:justify-between">
  //         <p className="text-sm font-medium text-gray-500">
  //           Página {currentPage} de {pages}
  //         </p>

  //         <nav className="mt-6 flex justify-end space-x-1.5 lg:mt-0">
  //           {pagesList.map((page) => (
  //             <button
  //               key={page}
  //               onClick={() => onChangePage(page)}
  //               title=""
  //               className={`inline-flex w-9 items-center justify-center rounded-md border ${
  //                 page === currentPage
  //                   ? "border-gray-900 bg-gray-100 text-gray-900"
  //                   : "border-gray-200 bg-white text-gray-400"
  //               } px-3 py-2 text-sm font-bold  focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2`}
  //             >
  //               {page}
  //             </button>
  //           ))}
  //         </nav>
  //       </div>
  //     </div>
  //   </div>
  // );
}
