import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ page, pageSize, totalItems, totalPages, onPageChange }: PaginationProps) {
  if (totalItems === 0 || totalPages === 0)
    return null;

  const firstItem = (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, totalItems);
  const pages = getVisiblePages(page, totalPages);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-text-secondary">
        Mostrando <strong className="font-medium text-text">{firstItem}–{lastItem}</strong> de{" "}
        <strong className="font-medium text-text">{totalItems}</strong>
      </p>

      <div className="flex items-center gap-1">
        <PaginationButton disabled={page === 1} onClick={() => onPageChange(page - 1)} ariaLabel="Página anterior">
          <ChevronLeft size={17} />
        </PaginationButton>

        {pages.map(pageNumber => (
          <PaginationButton
            key={pageNumber}
            active={pageNumber === page}
            onClick={() => onPageChange(pageNumber)}
            ariaLabel={`Página ${pageNumber}`}
          >
            {pageNumber}
          </PaginationButton>
        ))}

        <PaginationButton disabled={page === totalPages} onClick={() => onPageChange(page + 1)} ariaLabel="Próxima página">
          <ChevronRight size={17} />
        </PaginationButton>
      </div>
    </div>
  );
}

type PaginationButtonProps = {
  children: ReactNode;
  onClick: () => void;
  ariaLabel: string;
  active?: boolean;
  disabled?: boolean;
};

function PaginationButton({ children, onClick, ariaLabel, active = false, disabled = false }: PaginationButtonProps) {
  const stateClasses = active
    ? "border-primary bg-primary text-white"
    : "border-border bg-surface text-text-secondary hover:bg-surface-secondary hover:text-text";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`flex size-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40 ${stateClasses}`}
    >
      {children}
    </button>
  );
}

function getVisiblePages(currentPage: number, totalPages: number): number[] {
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages)
    return Array.from({ length: totalPages }, (_, index) => index + 1);

  let startPage = currentPage - 2;
  let endPage = currentPage + 2;

  if (startPage < 1) {
    startPage = 1;
    endPage = maxVisiblePages;
  }

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = totalPages - maxVisiblePages + 1;
  }

  return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
}
