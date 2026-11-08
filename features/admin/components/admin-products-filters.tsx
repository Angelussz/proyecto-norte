"use client";

import { useState } from "react";

export function AdminProductsFilters() {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterGender, setFilterGender] = useState("");

  const handleClear = () => {
    setSearch("");
    setFilterCat("");
    setFilterStatus("");
    setFilterBrand("");
    setFilterGender("");
  };

  return (
    <section className="w-full px-8 py-4">
      <div className="flex flex-col gap-2 w-full">
        <div className="bg-surface-container-low border border-outline-variant/30 shadow-sm p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 w-full">
            {/* Search input */}
            <div className="relative sm:col-span-2 lg:col-span-1 w-full">
              <span className="material-symbols-outlined text-on-surface-variant text-[18px] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, SKU"
                className="w-full pl-9 pr-3 py-2 bg-white text-on-surface placeholder:text-outline/70 font-inter text-[13px] outline-none shadow-sm focus:ring-1 focus:ring-primary border border-outline-variant/30"
              />
            </div>

            {/* Category filter */}
            <div className="relative w-full">
              <select
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
                className="appearance-none bg-white text-on-surface font-inter text-[13px] pl-3 pr-8 py-2 outline-none shadow-sm cursor-pointer w-full border border-outline-variant/30"
              >
                <option value="">Categoría: Todas</option>
                <option value="sobrecamisas">Sobrecamisas</option>
                <option value="sastreria">Pantalones &amp; Sastrería</option>
                <option value="calzado">Calzado</option>
                <option value="accesorios">Accesorios</option>
                <option value="atelier">Edición Atelier</option>
              </select>
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                keyboard_arrow_down
              </span>
            </div>

            {/* Status filter */}
            <div className="relative w-full">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none bg-white text-on-surface font-inter text-[13px] pl-3 pr-8 py-2 outline-none shadow-sm cursor-pointer w-full border border-outline-variant/30"
              >
                <option value="">Estado: Todos</option>
                <option value="in_stock">En stock</option>
                <option value="low_stock">Stock bajo</option>
                <option value="out_of_stock">Agotado</option>
              </select>
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                keyboard_arrow_down
              </span>
            </div>

            {/* Brand filter */}
            <div className="relative w-full">
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="appearance-none bg-white text-on-surface font-inter text-[13px] pl-3 pr-8 py-2 outline-none shadow-sm cursor-pointer w-full border border-outline-variant/30"
              >
                <option value="">Marca: Todas</option>
                <option value="atelier">NORTE Atelier</option>
                <option value="coleccion">NORTE Colección</option>
                <option value="linea_taller">Línea Taller</option>
              </select>
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                keyboard_arrow_down
              </span>
            </div>

            {/* Gender filter */}
            <div className="relative w-full">
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="appearance-none bg-white text-on-surface font-inter text-[13px] pl-3 pr-8 py-2 outline-none shadow-sm cursor-pointer w-full border border-outline-variant/30"
              >
                <option value="">Sexo: Todos</option>
                <option value="hombre">Hombre</option>
                <option value="mujer">Mujer</option>
                <option value="unisex">Unisex</option>
              </select>
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                keyboard_arrow_down
              </span>
            </div>
          </div>
        </div>

        {/* Limpiar filtros */}
        <div className="flex items-center justify-end px-1 pt-1">
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors font-inter text-[11px] uppercase tracking-wider font-semibold"
          >
            <span className="material-symbols-outlined text-[15px]">filter_alt_off</span>
            <span>LIMPIAR FILTROS</span>
          </button>
        </div>
      </div>
    </section>
  );
}
