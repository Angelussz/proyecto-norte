"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ProductListItem } from "@/features/admin/types/product.interface";

// ─── Stock badge ──────────────────────────────────────────────────────────────
function StockBadge({ stock }: { stock: number }) {
  if (stock > 5) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary-container text-on-secondary-fixed text-[10px] font-inter font-semibold tracking-wider uppercase">
        <span className="w-1.5 h-1.5 bg-[#33402f] rounded-full" />
        {stock} uds
      </span>
    );
  }
  if (stock > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-inter font-semibold tracking-wider uppercase">
        <span className="w-1.5 h-1.5 bg-[#c77d2e] rounded-full" />
        {stock} uds
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-dim text-on-surface-variant text-[10px] font-inter font-semibold tracking-wider uppercase">
      <span className="w-1.5 h-1.5 bg-outline rounded-full" />0 uds
    </span>
  );
}

// ─── Toggle switch ────────────────────────────────────────────────────────────
function ActiveToggle({
  active,
  productId,
  onToggle,
}: {
  active: boolean;
  productId: string;
  onToggle: (id: string, active: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-label={active ? "Desactivar producto" : "Activar producto"}
      onClick={(e) => {
        e.stopPropagation();
        onToggle(productId, !active);
      }}
      className={cn(
        "w-9 h-5 relative inline-flex items-center px-0.5 rounded-none cursor-pointer transition-colors duration-200",
        active ? "bg-primary" : "bg-surface-dim",
      )}
    >
      <span
        className={cn(
          "inline-block w-4 h-4 transform transition-transform duration-200",
          active ? "translate-x-4 bg-white" : "translate-x-0 bg-outline-variant",
        )}
      />
    </button>
  );
}

// ─── Variants summary row ─────────────────────────────────────────────────────
function VariantsSummaryRow({
  variantCount,
  totalStock,
  isOpen,
}: {
  variantCount: number;
  totalStock: number;
  isOpen: boolean;
}) {
  return (
    <tr className="bg-surface-container-high/40">
      <td className="p-0" colSpan={7}>
        <div
          className="grid transition-[grid-template-rows] duration-300 ease-in-out"
          style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <div className="pl-20 pr-4 py-3 bg-surface-container-high/30 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[10px] font-inter font-medium uppercase text-on-surface-variant tracking-wider pb-1 px-3">
                <span>Resumen de Variantes</span>
                <span>Almacén Central</span>
              </div>
              <div className="flex items-center gap-4 px-4 py-2 bg-surface-container-lowest">
                <span className="material-symbols-outlined text-[16px] text-outline">
                  subdirectory_arrow_right
                </span>
                <span className="text-[14px] font-inter font-medium text-on-surface">
                  {variantCount} variante{variantCount !== 1 ? "s" : ""} ·{" "}
                  <span
                    className={cn(
                      "font-semibold",
                      totalStock === 0
                        ? "text-error"
                        : totalStock <= 5
                          ? "text-[#c77d2e]"
                          : "text-on-surface",
                    )}
                  >
                    {totalStock} uds en total
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── Skeleton rows ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="bg-surface animate-pulse">
      <td className="py-3 pl-3 pr-0 w-10" />
      <td className="py-3 px-4">
        <div className="w-12 h-12 bg-surface-container rounded-none" />
      </td>
      <td className="py-3 px-4">
        <div className="flex flex-col gap-1">
          <div className="h-4 bg-surface-container rounded w-40" />
          <div className="h-3 bg-surface-container rounded w-24" />
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="h-4 bg-surface-container rounded w-16" />
      </td>
      <td className="py-3 px-4">
        <div className="h-6 bg-surface-container rounded w-14" />
      </td>
      <td className="py-3 px-4 text-center">
        <div className="h-5 w-9 bg-surface-container rounded mx-auto" />
      </td>
      <td className="py-3 px-4 text-right">
        <div className="h-6 bg-surface-container rounded w-24 ml-auto" />
      </td>
    </tr>
  );
}

// ─── Main table ───────────────────────────────────────────────────────────────
interface Props {
  products: ProductListItem[];
  isLoading: boolean;
  isError: boolean;
  onToggleActive: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
  currentPage: number;
  totalPages: number;
  total: number;
  onPage: (page: number) => void;
}

export function AdminProductsTable({
  products,
  isLoading,
  isError,
  onToggleActive,
  onDelete,
  currentPage,
  totalPages,
  total,
  onPage,
}: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Page numbers to display
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <section className="w-full px-8 py-6">
      {/* ── Paginación Superior ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-outline-variant/30">
        <span className="font-inter text-[11px] uppercase tracking-wider text-on-surface-variant">
          Página {currentPage} de {totalPages} • {total} productos registrados
        </span>
        {totalPages > 1 && (
          <nav className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => onPage(Math.max(1, currentPage - 1))}
              className={cn(
                "px-2.5 py-1 font-inter text-[11px] border border-outline-variant/60 bg-white transition-colors shadow-sm",
                currentPage === 1
                  ? "text-on-surface-variant/50 cursor-not-allowed"
                  : "text-on-surface hover:bg-surface-container cursor-pointer",
              )}
            >
              ← Ant
            </button>
            {pageNumbers.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onPage(n)}
                className={cn(
                  "px-2.5 py-1 font-inter text-[11px] transition-colors shadow-sm",
                  n === currentPage
                    ? "font-bold bg-primary text-white"
                    : "border border-outline-variant/60 bg-white text-on-surface hover:bg-surface-container",
                )}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => onPage(Math.min(totalPages, currentPage + 1))}
              className={cn(
                "px-2.5 py-1 font-inter text-[11px] border border-outline-variant/60 bg-white transition-colors shadow-sm",
                currentPage === totalPages
                  ? "text-on-surface-variant/50 cursor-not-allowed"
                  : "text-on-surface hover:bg-surface-container cursor-pointer",
              )}
            >
              Sig →
            </button>
          </nav>
        )}
      </div>

      {/* ── Contenedor scroll horizontal para la tabla ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1080px]">
          <thead>
            <tr className="bg-surface-container text-on-surface-variant">
              <th scope="col" className="w-10 py-3 pl-3 pr-0" />
              <th
                scope="col"
                className="py-3 px-4 text-[12px] font-inter font-semibold tracking-widest uppercase w-16 text-center"
              >
                IMAGEN
              </th>
              <th
                scope="col"
                className="py-3 px-4 text-[12px] font-inter font-semibold tracking-widest uppercase"
              >
                NOMBRE &amp; SKU
              </th>
              <th
                scope="col"
                className="py-3 px-4 text-[12px] font-inter font-semibold tracking-widest uppercase"
              >
                PRECIO BASE
              </th>
              <th
                scope="col"
                className="py-3 px-4 text-[12px] font-inter font-semibold tracking-widest uppercase"
              >
                STOCK TOTAL
              </th>
              <th
                scope="col"
                className="py-3 px-4 text-[12px] font-inter font-semibold tracking-widest uppercase text-center w-24"
              >
                ACTIVO
              </th>
              <th
                scope="col"
                className="py-3 px-4 text-[12px] font-inter font-semibold tracking-widest uppercase text-right min-w-[170px]"
              >
                ACCIONES
              </th>
            </tr>
          </thead>
          <tbody className="divide-y-0">
            {/* Loading state */}
            {isLoading && (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            )}

            {/* Error state */}
            {isError && !isLoading && (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <span className="font-inter text-[13px] text-error font-medium">
                    Error al cargar los productos. Intenta recargar la página.
                  </span>
                </td>
              </tr>
            )}

            {/* Empty state */}
            {!isLoading && !isError && products.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <span className="font-inter text-[13px] text-on-surface-variant">
                    No se encontraron productos con los filtros aplicados.
                  </span>
                </td>
              </tr>
            )}

            {/* Data rows */}
            {!isLoading &&
              !isError &&
              products.map((product) => {
                const isExpanded = expandedIds.has(product.id);
                const hasVariants = product.variantCount > 0;

                return (
                  <>
                    {/* ── Fila principal ── */}
                    <tr
                      key={product.id}
                      onClick={() => hasVariants && toggle(product.id)}
                      className={cn(
                        "transition-colors group/row select-none",
                        hasVariants && "cursor-pointer",
                        !product.active
                          ? "bg-surface-container-high/20 opacity-80 hover:opacity-100"
                          : "bg-surface hover:bg-surface-container-low",
                      )}
                    >
                      {/* ── Celda expand ── */}
                      <td className="py-3 pl-3 pr-0 w-10">
                        {hasVariants && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggle(product.id);
                            }}
                            aria-label={isExpanded ? "Cerrar variantes" : "Ver variantes"}
                            className={cn(
                              "flex items-center justify-center w-7 h-7 rounded-none transition-all duration-200 cursor-pointer",
                              "text-on-surface-variant hover:text-primary hover:bg-surface-container",
                              isExpanded ? "opacity-100" : "opacity-0 group-hover/row:opacity-100",
                            )}
                          >
                            <span
                              className={cn(
                                "material-symbols-outlined text-[20px] transition-transform duration-300 select-none",
                                isExpanded ? "rotate-180" : "rotate-0",
                              )}
                            >
                              expand_more
                            </span>
                          </button>
                        )}
                      </td>

                      {/* Imagen */}
                      <td className="py-3 px-4">
                        <div
                          className={cn(
                            "w-12 h-12 bg-surface-container overflow-hidden shrink-0",
                            !product.active && "filter grayscale",
                          )}
                        >
                          {product.imageUrl ? (
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover rounded-none"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-surface-container">
                              <span className="material-symbols-outlined text-outline text-[20px]">
                                image
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Nombre & categoría */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col min-w-0">
                          <span
                            className={cn(
                              "text-[16px] font-inter font-medium text-on-surface transition-colors",
                              product.active
                                ? "group-hover/row:text-primary"
                                : "line-through text-outline",
                              hasVariants && "font-semibold",
                            )}
                          >
                            {product.name}
                          </span>
                          <span
                            className={cn(
                              "text-[10px] font-inter text-on-surface-variant uppercase tracking-wider block my-0.5",
                              !product.active && "text-[#c77d2e] font-medium",
                            )}
                          >
                            {product.categoryName}
                          </span>
                          <span className="text-[10px] font-mono font-inter text-outline uppercase tracking-wider">
                            slug: {product.slug}
                          </span>
                        </div>
                      </td>

                      {/* Precio */}
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            "text-[16px] font-inter font-medium",
                            product.active ? "text-on-surface" : "text-on-surface-variant",
                          )}
                        >
                          ${product.basePrice.toFixed(2)}
                        </span>
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4">
                        <StockBadge stock={product.totalStock} />
                      </td>

                      {/* Toggle activo */}
                      <td
                        className="py-3 px-4 text-center cursor-default"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ActiveToggle
                          active={product.active}
                          productId={product.id}
                          onToggle={onToggleActive}
                        />
                      </td>

                      {/* Acciones */}
                      <td
                        className="py-3 px-4 text-right cursor-default"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/productos/editar/${product.id}`}
                            className="px-2 py-1 text-[10px] font-inter font-semibold uppercase tracking-wider text-on-surface hover:text-primary hover:bg-surface-container transition-colors rounded-none"
                          >
                            Editar
                          </Link>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                window.confirm(
                                  `¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`,
                                )
                              ) {
                                onDelete(product.id);
                              }
                            }}
                            title="Borrar producto"
                            className="px-2 py-1 text-[10px] font-inter font-semibold uppercase tracking-wider text-on-surface-variant hover:text-error hover:bg-surface-container transition-colors rounded-none flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                            <span>Borrar</span>
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* ── Fila de variantes animada ── */}
                    {hasVariants && (
                      <VariantsSummaryRow
                        key={`variants-${product.id}`}
                        variantCount={product.variantCount}
                        totalStock={product.totalStock}
                        isOpen={isExpanded}
                      />
                    )}
                  </>
                );
              })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
