type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pagesAroundCurrent = Array.from(
    { length: Math.min(3, totalPages) },
    (_, i) => {
      const start = Math.max(currentPage - 1, 0);
      return start + i;
    }
  ).filter((page) => page < totalPages);

  return (
    <>
      <div className="flex justify-center mt-4 gap-2 flex-wrap">
        <button
          onClick={() => onPageChange(0)}
          disabled={currentPage === 0}
          className="px-3 py-1 border rounded text-sm bg-white text-gray-700 disabled:opacity-50 dark:bg-gray-700 dark:text-white"
        >
          &laquo;
        </button>
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 0))}
          disabled={currentPage === 0}
          className="px-3 py-1 border rounded text-sm bg-white text-gray-700 disabled:opacity-50 dark:bg-gray-700 dark:text-white"
        >
          &lt;
        </button>

        {currentPage > 2 && <span className="px-2">...</span>}
        {pagesAroundCurrent.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 border rounded text-sm ${
              page === currentPage
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-200"
            }`}
          >
            {page + 1}
          </button>
        ))}

        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages - 1))}
          disabled={currentPage === totalPages - 1}
          className="px-3 py-1 border rounded text-sm bg-white text-gray-700 disabled:opacity-50 dark:bg-gray-700 dark:text-white"
        >
          &gt;
        </button>
        <button
          onClick={() => onPageChange(totalPages - 1)}
          disabled={currentPage === totalPages - 1}
          className="px-3 py-1 border rounded text-sm bg-white text-gray-700 disabled:opacity-50 dark:bg-gray-700 dark:text-white"
        >
          &raquo;
        </button>
      </div>
      <div className="flex justify-center mt-3">
          <span className="text-sm text-gray-500 dark:text-gray-300">
            Página {currentPage + 1} de {totalPages}
          </span>
      </div>
    </>
  );
};

export default Pagination;
