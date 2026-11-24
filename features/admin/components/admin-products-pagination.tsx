"use client";

import { cn } from "@/lib/utils";

const PAGES = [1, 2, 3];

export function AdminProductsPagination() {
  const currentPage = 1;
  const totalPages = 6;

  return (
    <footer className="w-full px-8 py-6 bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Info */}
      <div className="flex items-center gap-3 text-[11px] font-inter font-medium text-on-surface-variant uppercase tracking-wider">
        <span>
          Página <strong className="text-on-surface font-semibold">{currentPage}</strong> de{" "}
          <strong className="text-on-surface font-semibold">{totalPages}</strong>
        </span>
        <span className="text-outline-variant">|</span>
        <span>Total 48 registros de confección</span>
      </div>

      {/* Controls */}
      <div className="inline-flex items-center gap-1">
        {/* Previous */}
        <button
          type="button"
          disabled
          className="px-4 py-2 bg-surface-container text-outline text-[12px] font-inter font-semibold uppercase tracking-wider cursor-not-allowed opacity-60 rounded-none flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">west</span>
          <span>Anterior</span>
        </button>

        {/* Page numbers */}
        {PAGES.map((page) => (
          <button
            key={page}
            type="button"
            className={cn(
              "w-10 h-10 text-[12px] font-inter font-bold uppercase rounded-none transition-colors",
              page === currentPage
                ? "bg-primary text-on-primary"
                : "bg-surface-container-lowest text-on-surface hover:bg-surface-container",
            )}
          >
            {page}
          </button>
        ))}

        <span className="w-8 text-center text-on-surface-variant text-[14px] font-inter font-bold select-none">
          ...
        </span>

        {/* Next */}
        <button
          type="button"
          className="px-4 py-2 bg-surface-container-lowest text-on-surface hover:bg-surface-container text-[12px] font-inter font-semibold uppercase tracking-wider rounded-none flex items-center gap-1 transition-colors"
        >
          <span>Siguiente</span>
          <span className="material-symbols-outlined text-[16px]">east</span>
        </button>
      </div>
    </footer>
  );
}
