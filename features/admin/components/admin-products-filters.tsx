"use client";

import { useState } from "react";

export function AdminProductsFilters() {
  const [search, setSearch] = useState("");

  return (
    <section className="w-full px-8 py-4 bg-surface-container-high/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="flex flex-col gap-3 w-full">
        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-3 w-full">
          {/* Search input */}
          <div className="relative flex items-center min-w-[260px] flex-1 max-w-md">
            <span className="material-symbols-outlined text-on-surface-variant text-[18px] absolute left-3 pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, SKU o etiqueta..."
              className="w-full pl-9 pr-4 py-2 bg-surface-container-lowest text-on-surface placeholder:text-outline/70 text-[14px] font-inter outline-none rounded-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          {/* Category filter */}
          <div className="relative min-w-[170px]">
            <select className="w-full appearance-none bg-surface-container-lowest text-on-surface text-[14px] font-inter px-3 py-2 pr-8 rounded-none outline-none focus:ring-1 focus:ring-primary cursor-pointer">
              <option value="">Categoría: Todas</option>
              <option value="sobrecamisas">Sobrecamisas</option>
              <option value="sastreria">Pantalones &amp; Sastrería</option>
              <option value="calzado">Calzado</option>
              <option value="accesorios">Accesorios</option>
              <option value="atelier">Edición Atelier</option>
            </select>
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              keyboard_arrow_down
            </span>
          </div>

          {/* Status filter */}
          <div className="relative min-w-[150px]">
            <select className="w-full appearance-none bg-surface-container-lowest text-on-surface text-[14px] font-inter px-3 py-2 pr-8 rounded-none outline-none focus:ring-1 focus:ring-primary cursor-pointer">
              <option value="">Estado: Todos</option>
              <option value="in_stock">En stock</option>
              <option value="low_stock">Stock bajo</option>
              <option value="out_of_stock">Agotado</option>
            </select>
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              keyboard_arrow_down
            </span>
          </div>

          {/* Brand filter */}
          <div className="relative min-w-[150px]">
            <select className="w-full appearance-none bg-surface-container-lowest text-on-surface text-[14px] font-inter px-3 py-2 pr-8 rounded-none outline-none focus:ring-1 focus:ring-primary cursor-pointer">
              <option value="">Marca: Todas</option>
              <option value="atelier">NORTE Atelier</option>
              <option value="coleccion">NORTE Colección</option>
              <option value="linea_taller">Línea Taller</option>
            </select>
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              keyboard_arrow_down
            </span>
          </div>

          {/* Gender filter */}
          <div className="relative min-w-[150px]">
            <select className="w-full appearance-none bg-surface-container-lowest text-on-surface text-[14px] font-inter px-3 py-2 pr-8 rounded-none outline-none focus:ring-1 focus:ring-primary cursor-pointer">
              <option value="">Sexo: Todos</option>
              <option value="hombre">Hombre</option>
              <option value="mujer">Mujer</option>
              <option value="unisex">Unisex</option>
            </select>
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              keyboard_arrow_down
            </span>
          </div>
        </div>

        {/* Count + clear filters */}
        <div className="flex items-center justify-between border-t border-outline-variant/50 pt-1.5">
          <span className="text-[11px] font-inter font-medium text-on-surface-variant tracking-wider uppercase">
            Mostrando <strong className="text-on-surface font-semibold">1-8</strong> de{" "}
            <strong className="text-on-surface font-semibold">48</strong> productos
          </span>
          <button
            type="button"
            onClick={() => setSearch("")}
            className="p-1.5 text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 text-[10px] font-inter font-medium uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
            <span>Limpiar filtros</span>
          </button>
        </div>
      </div>
    </section>
  );
}
