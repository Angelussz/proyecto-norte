"use client";

import { useMemo, useState, Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ProductListItem } from "@/features/admin/types/product.interface";
import type { ColorDto } from "@/features/admin/types/brand-color.interface";
import { useProduct } from "@/features/admin/hooks/useProducts";
import { useColors } from "@/features/admin/hooks/useColors";

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

// ─── SKU matrix formatter ─────────────────────────────────────────────────────
// En la matriz agrupada por talla, cada fila muestra el SKU con la talla y "***"
// en lugar del color ya que en esa fila conviven múltiples colores:
// Formato: MARCA-CAT0001-***-TALLE (ej. NRT-CAM0001-***-M)
function formatMatrixSku(variantSku: string, rawSize: string): string {
  const cleanSize =
    rawSize
      .toUpperCase()
      .replace(/^TALLA\s*/i, "")
      .trim() || "U";
  const parts = variantSku.split("-");
  if (parts.length >= 2) {
    const brand = parts[0];
    const catCodeNum = parts[1];
    return `${brand}-${catCodeNum}-***-${cleanSize}`;
  }
  return `${variantSku}-***-${cleanSize}`;
}

// ─── Color resolver helper ────────────────────────────────────────────────────
function resolveColor(colorVal: string, colorsList?: ColorDto[]) {
  const isHex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(colorVal);
  if (isHex) {
    const found = colorsList?.find((c) => c.hex.toLowerCase() === colorVal.toLowerCase());
    return { hex: colorVal, name: found?.name ?? colorVal };
  }
  const byName = colorsList?.find((c) => c.name.toLowerCase() === colorVal.toLowerCase());
  if (byName) {
    return { hex: byName.hex, name: byName.name };
  }
  return { hex: "#D4C3A3", name: colorVal || "Estándar" };
}

// ─── Variants animated row con datos reales ───────────────────────────────────
function VariantsRow({ productId, isOpen }: { productId: string; isOpen: boolean }) {
  const { data: product, isLoading, isError } = useProduct(isOpen ? productId : null);
  const { data: globalColors = [] } = useColors();

  const groupedVariants = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return [];

    // 1. Recopilar todos los colores únicos que maneja este producto
    const productColorsMap = new Map<string, { hex: string; name: string }>();
    for (const v of product.variants) {
      if (v.active === false && v.stock === 0) continue;
      const resolved = resolveColor(v.colorHex || v.color, globalColors);
      const norm = resolved.name.toLowerCase();
      if (!productColorsMap.has(norm)) {
        productColorsMap.set(norm, resolved);
      }
    }
    const allColorsList = Array.from(productColorsMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name, "es", { sensitivity: "base" }),
    );

    // 2. Recopilar todas las tallas únicas presentes en el producto
    const sizeLabelsMap = new Map<string, { rawSize: string; sampleSku: string }>();
    for (const v of product.variants) {
      if (v.active === false && v.stock === 0) continue;
      const sizeLabel = v.size
        ? v.size.toLowerCase().startsWith("talla")
          ? v.size
          : `Talla ${v.size}`
        : "Talla Única";
      if (!sizeLabelsMap.has(sizeLabel)) {
        sizeLabelsMap.set(sizeLabel, { rawSize: v.size, sampleSku: v.sku });
      }
    }

    // 3. Para cada talla, construir la matriz con TODOS los colores del producto.
    // Si la variante tiene stock 0 (o no tenía unidades para esa talla), se muestra con 0
    // para que quede constancia visual de que no hay stock disponible.
    const result: Array<{
      size: string;
      sku: string;
      total: number;
      colors: Array<{ hex: string; name: string; stock: number }>;
      alert: boolean;
    }> = [];

    for (const [sizeLabel, { rawSize, sampleSku }] of sizeLabelsMap.entries()) {
      let total = 0;
      const colors = allColorsList.map((col) => {
        const match = product.variants.find((v) => {
          if (v.active === false && v.stock === 0) return false;
          const currentSizeLabel = v.size
            ? v.size.toLowerCase().startsWith("talla")
              ? v.size
              : `Talla ${v.size}`
            : "Talla Única";
          if (currentSizeLabel.toLowerCase() !== sizeLabel.toLowerCase()) return false;
          const resolved = resolveColor(v.colorHex || v.color, globalColors);
          return (
            resolved.name.toLowerCase() === col.name.toLowerCase() ||
            resolved.hex.toLowerCase() === col.hex.toLowerCase()
          );
        });

        const stock = match && typeof match.stock === "number" ? Math.max(0, match.stock) : 0;
        total += stock;
        return {
          hex: col.hex,
          name: col.name,
          stock,
        };
      });

      result.push({
        size: sizeLabel,
        sku: formatMatrixSku(sampleSku, rawSize),
        total,
        colors,
        alert: total <= 2,
      });
    }

    return result;
  }, [product, globalColors]);

  return (
    <tr className="bg-surface-container-high/40">
      <td className="p-0" colSpan={7}>
        {/* Grid wrapper — transiciona de 0fr a 1fr */}
        <div
          className="grid transition-[grid-template-rows] duration-300 ease-in-out"
          style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
        >
          {/* overflow:hidden necesario para que el 0fr realmente oculte */}
          <div className="overflow-hidden">
            <div className="pl-20 pr-4 py-3 bg-surface-container-high/30 flex flex-col gap-1.5">
              {/* Subheader */}
              <div className="flex items-center justify-between text-[10px] font-inter font-medium uppercase text-on-surface-variant tracking-wider pb-1 px-3">
                <span>Desglose por Talla &amp; Confección</span>
                <span>Almacén Central Madrid</span>
              </div>

              {/* Loading */}
              {isLoading && (
                <div className="flex items-center gap-2 px-4 py-3 bg-surface-container-lowest text-[12px] font-inter text-on-surface-variant animate-pulse">
                  <span className="material-symbols-outlined text-[16px] animate-spin">
                    progress_activity
                  </span>
                  <span>Cargando desglose de variantes…</span>
                </div>
              )}

              {/* Error */}
              {isError && (
                <div className="px-4 py-2.5 bg-surface-container-lowest text-[12px] font-inter text-error">
                  Error al cargar el desglose de variantes.
                </div>
              )}

              {/* Sin variantes */}
              {!isLoading && !isError && product && product.variants.length === 0 && (
                <div className="px-4 py-2.5 bg-surface-container-lowest text-[12px] font-inter text-on-surface-variant">
                  No hay variantes registradas para este producto.
                </div>
              )}

              {/* Variantes por Talla */}
              {!isLoading &&
                !isError &&
                groupedVariants.map((variant) => (
                  <div
                    key={variant.sku}
                    className={cn(
                      "flex items-center justify-between px-4 py-2 transition-colors duration-150",
                      "bg-surface-container-lowest hover:bg-[#c77d2e]/15 cursor-pointer",
                    )}
                  >
                    {/* Size + SKU */}
                    <div className="flex items-center gap-4">
                      <span
                        className={cn(
                          "material-symbols-outlined text-[16px]",
                          variant.alert ? "text-[#c77d2e]" : "text-outline",
                        )}
                      >
                        subdirectory_arrow_right
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-inter font-medium text-on-surface">
                          {variant.size}
                        </span>
                        <span className="text-[10px] font-mono font-inter text-on-surface-variant">
                          SKU: {variant.sku}
                        </span>
                      </div>
                    </div>

                    {/* Color swatches */}
                    <div className="flex items-center gap-2">
                      {variant.colors.map((color, idx) => (
                        <div
                          key={`${color.hex}-${idx}`}
                          className={cn(
                            "relative flex items-center justify-center border w-5 h-5 transition-transform",
                            color.stock === 0
                              ? "border-outline-variant/40 opacity-70"
                              : "border-outline-variant/60 shadow-xs",
                          )}
                          style={{ backgroundColor: color.hex }}
                          title={`${color.name}: ${color.stock} uds${color.stock === 0 ? " (Sin stock)" : ""}`}
                        >
                          <span
                            className={cn(
                              "absolute -top-1.5 -right-1.5 border font-mono text-[9px] leading-tight px-1 font-bold",
                              color.stock === 0
                                ? "bg-surface text-error border-error/50"
                                : "bg-surface text-on-surface border-outline-variant",
                            )}
                          >
                            {color.stock}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div>
                      <span
                        className={cn(
                          "text-[14px] font-mono font-inter",
                          variant.alert ? "text-primary font-semibold" : "text-on-surface",
                        )}
                      >
                        {variant.total} uds
                      </span>
                    </div>
                  </div>
                ))}
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
  const [productToDelete, setProductToDelete] = useState<ProductListItem | null>(null);

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
                  <Fragment key={product.id}>
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
                            className="px-2 py-1 text-[10px] font-inter font-semibold uppercase tracking-wider text-on-surface hover:text-primary hover:bg-surface-container transition-colors rounded-none flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                            <span>Editar</span>
                          </Link>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProductToDelete(product);
                            }}
                            title="Borrar producto"
                            className="px-2 py-1 text-[10px] font-inter font-semibold uppercase tracking-wider text-on-surface-variant hover:text-error hover:bg-surface-container transition-colors rounded-none flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                            <span>Borrar</span>
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* ── Fila de variantes animada con datos reales ── */}
                    {hasVariants && (
                      <VariantsRow
                        key={`variants-${product.id}`}
                        productId={product.id}
                        isOpen={isExpanded}
                      />
                    )}
                  </Fragment>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* ── Modal Confirmar Eliminar Producto ── */}
      {productToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            className="fixed inset-0 bg-[#1e1c13]/60 backdrop-blur-sm transition-opacity"
            onClick={() => setProductToDelete(null)}
          />
          <div className="relative bg-[#fff9ed] border border-[#d8c3b2]/60 shadow-2xl max-w-md w-full p-6 z-10 flex flex-col gap-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-error/10 text-error flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">delete_forever</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="px-2 py-0.5 bg-error/10 text-error font-mono text-[9px] uppercase tracking-wider font-bold w-fit">
                  CONFIRMAR ELIMINACIÓN
                </span>
                <h3 className="font-headline text-[22px] uppercase tracking-wide text-[#1e1c13] leading-tight">
                  ¿ELIMINAR PRODUCTO?
                </h3>
              </div>
            </div>

            <div className="font-inter text-[13px] text-[#524438] leading-relaxed bg-[#faf3e4] p-3 border border-[#d8c3b2]/40 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2 border-b border-[#d8c3b2]/30 pb-2">
                <span className="font-headline text-[15px] uppercase tracking-wider text-[#1e1c13]">
                  {productToDelete.name}
                </span>
                <span className="px-2 py-0.5 bg-white text-[#524438] text-[10px] font-mono border border-[#d8c3b2]/40 font-semibold">
                  {productToDelete.categoryName}
                </span>
              </div>
              <p className="text-[12px] text-on-surface-variant">
                ¿Deseas eliminar permanentemente esta prenda? Esta acción removerá el producto y
                todas sus variantes de confección de la base de datos.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 bg-white text-[#524438] hover:text-[#1e1c13] font-headline text-[15px] uppercase tracking-wider border border-[#d8c3b2]/50 transition-colors cursor-pointer"
              >
                CANCELAR
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(productToDelete.id);
                  setProductToDelete(null);
                }}
                className="px-5 py-2 bg-[#ba1a1a] hover:bg-[#93000a] text-white font-headline text-[15px] uppercase tracking-wider transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>SÍ, ELIMINAR</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
