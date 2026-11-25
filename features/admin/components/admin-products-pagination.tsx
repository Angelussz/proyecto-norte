"use client";

import { cn } from "@/lib/utils";

interface Props {
  currentPage: number;
  totalPages: number;
  total: number;
  onPage: (page: number) => void;
}

export function AdminProductsPagination({ currentPage, totalPages, total, onPage }: Props) {
  // Build visible page range (show up to 5 pages around current)
  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <footer className="w-full px-8 py-6 bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Info */}
      <div className="flex items-center gap-3 text-[11px] font-inter font-medium text-on-surface-variant uppercase tracking-wider">
        <span>
          Página <strong className="text-on-surface font-semibold">{currentPage}</strong> de{" "}
          <strong className="text-on-surface font-semibold">{totalPages}</strong>
        </span>
        <span className="text-outline-variant">|</span>
        <span>Total {total} registros de confección</span>
      </div>

      {/* Controls */}
      <div className="inline-flex items-center gap-1">
        {/* Previous */}
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPage(Math.max(1, currentPage - 1))}
          className={cn(
            "px-4 py-2 text-[12px] font-inter font-semibold uppercase tracking-wider rounded-none flex items-center gap-1 transition-colors",
            currentPage === 1
              ? "bg-surface-container text-outline cursor-not-allowed opacity-60"
              : "bg-surface-container-lowest text-on-surface hover:bg-surface-container cursor-pointer",
          )}
        >
          <span className="material-symbols-outlined text-[16px]">west</span>
          <span>Anterior</span>
        </button>

        {/* Page numbers */}
        {pageNumbers.map((page, idx) =>
          page === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="w-8 text-center text-on-surface-variant text-[14px] font-inter font-bold select-none"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPage(page as number)}
              className={cn(
                "w-10 h-10 text-[12px] font-inter font-bold uppercase rounded-none transition-colors",
                page === currentPage
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-lowest text-on-surface hover:bg-surface-container",
              )}
            >
              {page}
            </button>
          ),
        )}

        {/* Next */}
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPage(Math.min(totalPages, currentPage + 1))}
          className={cn(
            "px-4 py-2 text-[12px] font-inter font-semibold uppercase tracking-wider rounded-none flex items-center gap-1 transition-colors",
            currentPage === totalPages
              ? "bg-surface-container text-outline cursor-not-allowed opacity-60"
              : "bg-surface-container-lowest text-on-surface hover:bg-surface-container cursor-pointer",
          )}
        >
          <span>Siguiente</span>
          <span className="material-symbols-outlined text-[16px]">east</span>
        </button>
      </div>
    </footer>
  );
}
