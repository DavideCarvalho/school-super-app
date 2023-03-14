interface PaginationProps {
  currentPage: number;
  totalCount: number;
  itemsPerPage: number;
  onChangePage: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalCount,
  itemsPerPage,
  onChangePage,
}: PaginationProps) {
  const pages = Math.ceil(totalCount / itemsPerPage);
  const pagesList = Array.from(Array(pages < 5 ? pages : 5).keys()).map((i) =>
    currentPage <= 5 ? i + 1 : i + currentPage - 4,
  );
  return (
    <div className="bg-gray-50 py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center lg:flex-row lg:justify-between">
          <p className="text-sm font-medium text-gray-500">
            Página {currentPage} de {pages}
          </p>

          <nav className="relative mt-6 flex justify-end space-x-1.5 lg:mt-0">
            {pagesList.map((page) => (
              <button
                key={page}
                onClick={() => onChangePage(page)}
                title=""
                className={`inline-flex w-9 items-center justify-center rounded-md border ${
                  page === currentPage
                    ? "border-gray-900 bg-gray-100 text-gray-900"
                    : "border-gray-200 bg-white text-gray-400"
                } px-3 py-2 text-sm font-bold  focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2`}
              >
                {page}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
