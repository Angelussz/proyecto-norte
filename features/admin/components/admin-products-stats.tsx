"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface Props {
  total: number;
  active: number;
  lowStock: number;
  outOfStock: number;
  activeFilterStatus?: string;
  onSelectFilterStatus?: (status: string) => void;
}

export function AdminProductsStats({
  total,
  active,
  lowStock,
  outOfStock,
  activeFilterStatus,
  onSelectFilterStatus,
}: Props) {
  return (
    <section className="w-full px-8 py-6 flex flex-col gap-6">
      {/* Title row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="font-headline text-[48px] text-on-surface tracking-[0.05em] uppercase leading-none">
            PRODUCTOS
          </h1>
          <p className="text-[14px] font-inter text-on-surface-variant mt-1.5 max-w-2xl">
            Gestión del catálogo, inventario de piezas, precios y variantes de confección artesanal.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="px-4 py-2.5 bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors text-[12px] font-inter font-semibold uppercase tracking-wider flex items-center gap-1.5 rounded-none"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>Exportar CSV</span>
          </button>
          <Link
            href="/admin/productos/nuevo"
            className="px-6 py-2.5 bg-primary text-on-primary hover:bg-primary-container transition-colors font-headline text-[20px] tracking-wider uppercase flex items-center gap-1.5 rounded-none shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>NUEVO PRODUCTO</span>
          </Link>
        </div>
      </div>

      {/* ── KPI Cards (Interactivos con filtro automático de estado) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1: Catálogo Completo */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelectFilterStatus?.("")}
          onKeyDown={(e) => e.key === "Enter" && onSelectFilterStatus?.("")}
          title="Ver todo el catálogo (sin filtro de estado)"
          className={cn(
            "bg-surface-container-low p-6 flex flex-col justify-between relative overflow-hidden border shadow-sm cursor-pointer transition-all duration-200 select-none group",
            !activeFilterStatus
              ? "ring-2 ring-primary border-primary shadow-md"
              : "border-outline-variant/30 hover:border-primary/60 hover:shadow-md",
          )}
        >
          <div className="flex items-start justify-between relative z-10">
            <span className="font-inter text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold group-hover:text-primary transition-colors">
              Catálogo Completo
            </span>
            <span className="material-symbols-outlined text-primary text-[20px]">inventory_2</span>
          </div>
          <div className="mt-4 relative z-10">
            <span className="font-headline text-[42px] text-on-surface tracking-wide block leading-none">
              {total}
            </span>
            <span className="font-inter text-[11px] text-secondary font-bold uppercase tracking-wider block mt-1">
              {!activeFilterStatus ? "● Filtro aplicado" : "100% auditable"}
            </span>
          </div>
          <div className="absolute -right-2 -bottom-2 opacity-10 pointer-events-none select-none">
            <span
              className="material-symbols-outlined text-on-surface leading-none block"
              style={{ fontSize: "95px" }}
            >
              inventory_2
            </span>
          </div>
        </div>

        {/* KPI 2: Piezas Activas */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelectFilterStatus?.(activeFilterStatus === "active" ? "" : "active")}
          onKeyDown={(e) =>
            e.key === "Enter" &&
            onSelectFilterStatus?.(activeFilterStatus === "active" ? "" : "active")
          }
          title="Filtrar por piezas activas"
          className={cn(
            "bg-surface-container-low p-6 flex flex-col justify-between relative overflow-hidden border shadow-sm cursor-pointer transition-all duration-200 select-none group",
            activeFilterStatus === "active"
              ? "ring-2 ring-secondary border-secondary shadow-md"
              : "border-outline-variant/30 hover:border-secondary/60 hover:shadow-md",
          )}
        >
          <div className="flex items-start justify-between relative z-10">
            <span className="font-inter text-[10px] text-secondary uppercase tracking-widest font-semibold">
              Piezas Activas
            </span>
            <span className="material-symbols-outlined text-secondary text-[20px]">verified</span>
          </div>
          <div className="mt-4 relative z-10">
            <span className="font-headline text-[42px] text-secondary tracking-wide block leading-none">
              {active}
            </span>
            <span className="font-inter text-[11px] bg-secondary-container text-on-secondary-container px-2 py-0.5 uppercase font-semibold inline-block mt-1">
              {activeFilterStatus === "active"
                ? "● Filtro aplicado"
                : `${total > 0 ? Math.round((active / total) * 100) : 0}% en vitrina`}
            </span>
          </div>
          <div className="absolute -right-2 -bottom-2 opacity-10 pointer-events-none select-none">
            <span
              className="material-symbols-outlined text-on-surface leading-none block"
              style={{ fontSize: "95px" }}
            >
              verified
            </span>
          </div>
        </div>

        {/* KPI 3: Atención Reposición */}
        <div
          role="button"
          tabIndex={0}
          onClick={() =>
            onSelectFilterStatus?.(activeFilterStatus === "low_stock" ? "" : "low_stock")
          }
          onKeyDown={(e) =>
            e.key === "Enter" &&
            onSelectFilterStatus?.(activeFilterStatus === "low_stock" ? "" : "low_stock")
          }
          title="Filtrar por piezas que requieren reposición (stock bajo)"
          className={cn(
            "bg-surface-container-low p-6 flex flex-col justify-between relative overflow-hidden border shadow-sm cursor-pointer transition-all duration-200 select-none group",
            activeFilterStatus === "low_stock"
              ? "ring-2 ring-mustard border-mustard shadow-md"
              : "border-outline-variant/30 hover:border-mustard/60 hover:shadow-md",
          )}
        >
          <div className="flex items-start justify-between relative z-10">
            <span className="font-inter text-[10px] text-mustard uppercase tracking-widest font-semibold">
              Atención Reposición
            </span>
            <span className="material-symbols-outlined text-mustard text-[20px]">
              warning_amber
            </span>
          </div>
          <div className="mt-4 relative z-10">
            <span className="font-headline text-[42px] text-mustard tracking-wide block leading-none">
              {String(lowStock).padStart(2, "0")}
            </span>
            <span className="font-inter text-[11px] bg-mustard/15 text-primary px-2 py-0.5 uppercase font-semibold inline-block mt-1">
              {activeFilterStatus === "low_stock" ? "● Filtro aplicado" : "Stock bajo"}
            </span>
          </div>
          <div className="absolute -right-2 -bottom-2 opacity-10 pointer-events-none select-none">
            <span
              className="material-symbols-outlined text-on-surface leading-none block"
              style={{ fontSize: "95px" }}
            >
              warning_amber
            </span>
          </div>
        </div>

        {/* KPI 4: Agotados */}
        <div
          role="button"
          tabIndex={0}
          onClick={() =>
            onSelectFilterStatus?.(activeFilterStatus === "out_of_stock" ? "" : "out_of_stock")
          }
          onKeyDown={(e) =>
            e.key === "Enter" &&
            onSelectFilterStatus?.(activeFilterStatus === "out_of_stock" ? "" : "out_of_stock")
          }
          title="Filtrar por piezas agotadas (stock 0)"
          className={cn(
            "bg-surface-container-low p-6 flex flex-col justify-between relative overflow-hidden border shadow-sm cursor-pointer transition-all duration-200 select-none group",
            activeFilterStatus === "out_of_stock"
              ? "ring-2 ring-error border-error shadow-md"
              : "border-outline-variant/30 hover:border-error/60 hover:shadow-md",
          )}
        >
          <div className="flex items-start justify-between relative z-10">
            <span className="font-inter text-[10px] text-error uppercase tracking-widest font-semibold">
              Agotados
            </span>
            <span className="material-symbols-outlined text-error text-[20px]">block</span>
          </div>
          <div className="mt-4 relative z-10">
            <span className="font-headline text-[42px] text-error tracking-wide block leading-none">
              {String(outOfStock).padStart(2, "0")}
            </span>
            <span className="font-inter text-[11px] bg-error-container text-on-error-container px-2 py-0.5 uppercase font-semibold inline-block mt-1">
              {activeFilterStatus === "out_of_stock" ? "● Filtro aplicado" : "Edición Atelier"}
            </span>
          </div>
          <div className="absolute -right-2 -bottom-2 opacity-10 pointer-events-none select-none">
            <span
              className="material-symbols-outlined text-on-surface leading-none block"
              style={{ fontSize: "95px" }}
            >
              block
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
