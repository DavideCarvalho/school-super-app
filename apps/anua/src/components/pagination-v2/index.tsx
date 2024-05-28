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
}

export function PaginationV2({
  currentPage,
  totalCount,
  itemsPerPage,
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
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious href={pageUrl(currentPage - 1)} />
          </PaginationItem>
        )}
        {pagesList[0]! > 1 && (
          <>
            <PaginationItem className="ml-2">
              <PaginationLink href={pageUrl(1)}>1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          </>
        )}
        {pagesList.map((page) => (
          <PaginationItem key={page} className="ml-2">
            <PaginationLink
              href={pageUrl(page)}
              isActive={page === currentPage}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        {pagesList[pagesList.length - 1]! < pages && (
          <>
            <PaginationItem className="ml-2">
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem className="ml-2">
              <PaginationLink href={pageUrl(pages)}>{pages}</PaginationLink>
            </PaginationItem>
          </>
        )}
        {currentPage !== pages && (
          <PaginationItem className="ml-2">
            <PaginationNext href={pageUrl(currentPage + 1)} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}
