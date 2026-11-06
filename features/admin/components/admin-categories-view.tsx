"use client";

import { useState } from "react";
import Link from "next/link";

type CategoryItem = {
  id: string;
  name: string;
  sku: string;
  slug: string;
  active: boolean;
  description: string;
  systemName: string;
  systemSizes: string[];
  uniqueSizes: string[];
  addedSizes: string[];
};

const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: "cat-1",
    name: "SOBRECAMISAS",
    sku: "NRT-LNO",
    slug: "/sobrecamisas",
    active: true,
    description:
      "Prendas de media estación y lino crudo estructurado. 14 prendas activas en tienda.",
    systemName: "SISTEMA ALFA",
    systemSizes: ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL"],
    uniqueSizes: ["Talle Único", "Talle Ajustable"],
    addedSizes: [],
  },
  {
    id: "cat-2",
    name: "PANTALONES & SASTRERÍA",
    sku: "NRT-TRJ",
    slug: "/pantalones",
    active: true,
    description:
      "Pantalón ancho, pinzas artesanales y cortes rectos sartoriales. 10 prendas activas.",
    systemName: "SISTEMA NUMÉRICO EU",
    systemSizes: ["36", "38", "40", "42", "44", "46", "48"],
    uniqueSizes: ["Talle Único", "Talle Ajustable"],
    addedSizes: [],
  },
  {
    id: "cat-3",
    name: "CALZADO & ESENCIALES",
    sku: "NRT-ZAP",
    slug: "/calzado",
    active: true,
    description:
      "Alpargatas, mocasines y calzado de confección artesana en suela vegetal. 6 modelos.",
    systemName: "NUMERACIÓN CALZADO",
    systemSizes: ["38", "39", "40", "41", "42", "43", "44", "45"],
    uniqueSizes: ["Talle Único", "Talle Ajustable"],
    addedSizes: [],
  },
  {
    id: "cat-4",
    name: "PRENDAS EXTERIORES",
    sku: "NRT-EXT",
    slug: "/exteriores",
    active: true,
    description:
      "Gabardinas de algodón encerado, saharianas y abrigos desestructurados. 4 referencias.",
    systemName: "SISTEMA ALFA",
    systemSizes: ["S", "M", "L", "XL", "XXL", "3XL"],
    uniqueSizes: ["Talle Único", "Talle Ajustable"],
    addedSizes: [],
  },
  {
    id: "cat-5",
    name: "ACCESORIOS & MARROQUINERÍA",
    sku: "NRT-ACC",
    slug: "/accesorios",
    active: true,
    description:
      "Bolsos tote de lona encerada, cinturones de piel vegetal y bufandas de telar. 4 referencias.",
    systemName: "SISTEMA ALFA",
    systemSizes: ["S", "M", "L", "XL"],
    uniqueSizes: ["Talle Único", "Talle Ajustable"],
    addedSizes: [],
  },
];

const SIZE_SYSTEM_OPTIONS = [
  "Sistema Alfa (XS, S, M, L, XL, XXL)",
  "Numérico EU / Cono Sur (36, 38, 40, 42, 44...)",
  "Numérico US / México (28, 30, 32, 34...)",
  "Calzado Adulto Unisex EU (35 - 46)",
  "Talle Único Estándar (TU / One Size)",
  "Talle Único Ajustable / Regulable",
  "Medidas en Pulgadas / Cintura",
  "Medidas Anatómicas Exactas (cm)",
];

export function AdminCategoriesView() {
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [selectedSystem, setSelectedSystem] = useState<Record<string, string>>({});

  function addSize(catId: string, sizeName: string) {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== catId) return cat;
        if (cat.addedSizes.includes(sizeName)) return cat;
        return { ...cat, addedSizes: [...cat.addedSizes, sizeName] };
      }),
    );
  }

  function removeSize(catId: string, sizeName: string) {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== catId) return cat;
        return { ...cat, addedSizes: cat.addedSizes.filter((s) => s !== sizeName) };
      }),
    );
  }

  function handleAddSelectedSystem(catId: string) {
    const val = selectedSystem[catId];
    if (!val) return;
    const label = val.split("(")[0].trim();
    addSize(catId, label);
    setSelectedSystem((prev) => ({ ...prev, [catId]: "" }));
  }

  function toggleVisibility(catId: string) {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === catId ? { ...cat, active: !cat.active } : cat)),
    );
  }

  function deleteCategory(catId: string) {
    setCategories((prev) => prev.filter((cat) => cat.id !== catId));
  }

  function handleNewCategory() {
    const name = prompt("Nombre de la nueva categoría (ej: CAMISERÍA CLÁSICA):");
    if (!name?.trim()) return;
    const sku = prompt("Prefijo SKU (ej: NRT-CAM):") || `NRT-${name.slice(0, 3).toUpperCase()}`;

    const newCat: CategoryItem = {
      id: `cat-${Date.now()}`,
      name: name.trim().toUpperCase(),
      sku: sku.trim().toUpperCase(),
      slug: `/${name
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")}`,
      active: true,
      description: "Nueva categoría registrada en el catálogo textil de NORTE Atelier.",
      systemName: "SISTEMA ALFA",
      systemSizes: ["XS", "S", "M", "L", "XL"],
      uniqueSizes: ["Talle Único", "Talle Ajustable"],
      addedSizes: [],
    };

    setCategories((prev) => [...prev, newCat]);
  }

  return (
    <main className="w-full bg-surface min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* ── 1. Encabezado principal ── */}
        <header className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex flex-col gap-2">
            {/* Badge */}
            <div className="inline-flex items-center gap-2">
              <span className="w-2 h-2 bg-mustard" />
              <span className="font-inter text-[10px] text-on-surface-variant uppercase tracking-[0.25em] font-semibold">
                ESTRUCTURA DE CATÁLOGO &amp; VALORES GLOBALES
              </span>
            </div>

            {/* Título y subtítulo */}
            <h1 className="font-headline text-[42px] uppercase tracking-normal leading-none text-on-surface mt-1">
              GESTIÓN DE CATEGORÍAS Y ATRIBUTOS
            </h1>
            <p className="font-inter text-[13px] text-on-surface-variant leading-relaxed max-w-3xl">
              Administración unificada del catálogo textil del atelier: jerarquías de categorías,
              parametrización de talles individuales por prenda, cartas de color de tintura oficial
              y firmas registradas.
            </p>
          </div>

          {/* Botones de navegación directa a sub-vistas */}
          <div className="flex flex-wrap items-center gap-3 shrink-0 self-start lg:self-center">
            <Link
              href="/admin/categorias/talles"
              className="group inline-flex items-center gap-2.5 px-5 py-2.5 bg-[#c77d2e] hover:bg-[#b06a20] text-white font-inter text-[12px] uppercase tracking-wider font-semibold shadow-md hover:shadow-lg transition-all active:translate-y-px"
            >
              <span className="material-symbols-outlined text-[19px]">straighten</span>
              <span>Ir a Sistema de Talles</span>
              <span className="material-symbols-outlined text-[15px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </Link>

            <Link
              href="/admin/categorias/colores-marcas"
              className="group inline-flex items-center gap-2.5 px-5 py-2.5 bg-[#33402f] hover:bg-[#253022] text-[#fff9ed] font-inter text-[12px] uppercase tracking-wider font-semibold shadow-md hover:shadow-lg transition-all active:translate-y-px"
            >
              <span className="material-symbols-outlined text-[19px] text-[#ffb875]">palette</span>
              <span>Ir a Marcas y Colores</span>
              <span className="material-symbols-outlined text-[15px] text-[#ffb875] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </Link>
          </div>
        </header>

        {/* ── 2. Panel de Métricas / 3 KPI Cards ── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="relative bg-[#faf3e4] p-6 border border-[#d8c3b2]/30 flex flex-col justify-between overflow-hidden">
            <div className="absolute -right-2 -bottom-2 opacity-10 pointer-events-none select-none">
              <span
                className="material-symbols-outlined text-on-surface leading-none block"
                style={{ fontSize: "95px" }}
              >
                category
              </span>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#524438] font-semibold">
                  CATEGORÍAS ACTIVAS
                </span>
                <span className="material-symbols-outlined text-[#673900] text-[20px]">
                  category
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline text-[38px] text-[#1e1c13] leading-none">
                  {categories.filter((c) => c.active).length}
                </span>
                <span className="text-[12px] uppercase tracking-wider font-semibold text-[#524438]">
                  PRINCIPALES
                </span>
              </div>
            </div>
            <div className="mt-6 pt-2 -mx-6 -mb-6 px-6 pb-2.5 bg-[#f4eddf]/70 flex items-center justify-between border-t border-[#d8c3b2]/20">
              <span className="text-[11px] text-[#524438]">24 Subcategorías activas</span>
              <span className="text-[#673900] text-[10px] font-bold uppercase tracking-wider">
                100% VISIBLE
              </span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="relative bg-[#faf3e4] p-6 border border-[#d8c3b2]/30 flex flex-col justify-between overflow-hidden">
            <div className="absolute -right-2 -bottom-2 opacity-10 pointer-events-none select-none">
              <span
                className="material-symbols-outlined text-on-surface leading-none block"
                style={{ fontSize: "95px" }}
              >
                straighten
              </span>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#524438] font-semibold">
                  SISTEMAS DE TALLE
                </span>
                <span className="material-symbols-outlined text-[#c77d2e] text-[20px]">
                  straighten
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline text-[38px] text-[#1e1c13] leading-none">5</span>
                <span className="text-[12px] uppercase tracking-wider font-semibold text-[#524438]">
                  RANGOS ESPECÍFICOS
                </span>
              </div>
            </div>
            <div className="mt-6 pt-2 -mx-6 -mb-6 px-6 pb-2.5 bg-[#f4eddf]/70 flex items-center justify-between border-t border-[#d8c3b2]/20">
              <span className="text-[11px] text-[#524438]">Por tipología de confección</span>
              <span className="inline-flex items-center gap-1.5 text-[#33402f] text-[10px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#33402f]" /> 100% COBERTURA
              </span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="relative bg-[#faf3e4] p-6 border border-[#d8c3b2]/30 flex flex-col justify-between overflow-hidden">
            <div className="absolute -right-2 -bottom-2 opacity-10 pointer-events-none select-none">
              <span
                className="material-symbols-outlined text-on-surface leading-none block"
                style={{ fontSize: "95px" }}
              >
                checkroom
              </span>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#524438] font-semibold">
                  PRENDAS ASIGNADAS
                </span>
                <span className="material-symbols-outlined text-[#54624f] text-[20px]">styler</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline text-[38px] text-[#1e1c13] leading-none">38</span>
                <span className="text-[12px] uppercase tracking-wider font-semibold text-[#524438]">
                  PRENDAS TOTALES
                </span>
              </div>
            </div>
            <div className="mt-6 pt-2 -mx-6 -mb-6 px-6 pb-2.5 bg-[#f4eddf]/70 flex items-center justify-between border-t border-[#d8c3b2]/20">
              <span className="text-[11px] text-[#524438]">Arquetipos normalizados</span>
              <span className="text-[#673900] text-[10px] font-bold uppercase tracking-wider">
                CATÁLOGO ACTIVO
              </span>
            </div>
          </div>
        </section>

        {/* ── 3. Barra de Sección: 1. GESTIÓN DE CATEGORÍAS & SUS TALLES ── */}
        <section className="flex flex-col gap-4">
          <div className="bg-[#f4eddf] p-5 border border-[#d8c3b2]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#673900] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-white text-[24px]">
                  account_tree
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="font-headline text-[22px] uppercase tracking-wide text-[#1e1c13] leading-none">
                    1. GESTIÓN DE CATEGORÍAS &amp; SUS TALLES
                  </h2>
                  <span className="px-2 py-0.5 bg-[#33402f] text-[#fff9ed] text-[9px] font-semibold uppercase tracking-wider">
                    {categories.filter((c) => c.active).length} CATEGORÍAS ACTIVAS
                  </span>
                </div>
                <p className="text-[11px] text-[#524438] mt-1">
                  Arquetipos de prendas, prefijos normalizados de SKU y parametrización de talles
                  específicos habilitados para cada prenda.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNewCategory}
              className="px-6 py-3 bg-[#673900] hover:bg-[#894d00] text-white font-headline text-[18px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shrink-0"
            >
              + NUEVA CATEGORÍA
            </button>
          </div>

          {/* Banner fotográfico horizontal panorámico de rollos de tela */}
          <div className="w-full h-24 overflow-hidden border border-[#d8c3b2]/40 bg-[#e0dacb]">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDu0yi7dQjI8sYST3K28n5KcUuE_IygkJkDol5DfuCHwx4Ls_ytOMc8iJeBN13LpEnNAbBOC1opD0FZM8myhO0hcMf4_nekDh6doXfCrJTF_CS1qIiOeV18utjgjyhgppQiAqF0ZEAuwYIYUNkfrGaAQ4YcTp-US_MvlwmqcpQ24Z5ZbPV-F6tViTxxcN2dda8IbdRtiIWDKAH-oPRB7HGQ2BuB-w0MBLw89kYbfK4"
              alt="Rollos textiles artesanales"
              className="w-full h-full object-cover grayscale"
            />
          </div>

          {/* ── 4. Lista de Categorías ── */}
          <div className="flex flex-col gap-4">
            {categories.map((cat) => (
              <article
                key={cat.id}
                className="bg-[#faf3e4] p-5 border border-[#d8c3b2]/40 flex flex-col gap-3"
              >
                {/* Cabecera de la categoría */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      className="text-[#857466] hover:text-[#673900] mt-0.5 cursor-grab active:cursor-grabbing"
                      title="Arrastrar para reordenar"
                    >
                      <span className="material-symbols-outlined text-[20px]">drag_indicator</span>
                    </button>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-headline text-[22px] uppercase text-[#1e1c13] tracking-wide leading-none">
                          {cat.name}
                        </h3>
                        {cat.active ? (
                          <span className="px-2 py-0.5 bg-[#33402f] text-[#fff9ed] text-[9px] uppercase tracking-wider font-semibold">
                            ACTIVO
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-[#857466] text-white text-[9px] uppercase tracking-wider font-semibold">
                            INACTIVO
                          </span>
                        )}
                        <span className="px-2 py-0.5 bg-[#f4eddf] font-mono text-[10px] text-[#673900] font-bold border border-[#d8c3b2]/40">
                          SKU: {cat.sku}
                        </span>
                        <span className="text-[#524438] text-[11px] font-mono">{cat.slug}</span>
                      </div>
                      <p className="text-[12px] text-[#524438] mt-1">{cat.description}</p>
                    </div>
                  </div>

                  {/* Acciones de categoría */}
                  <div className="flex items-center gap-2 text-[#524438] self-end sm:self-start">
                    <button
                      type="button"
                      onClick={() => {
                        const newDesc = prompt("Editar descripción:", cat.description);
                        if (newDesc !== null) {
                          setCategories((prev) =>
                            prev.map((c) => (c.id === cat.id ? { ...c, description: newDesc } : c)),
                          );
                        }
                      }}
                      className="hover:text-[#673900] transition-colors p-1"
                      title="Editar"
                    >
                      <span className="material-symbols-outlined text-[18px]">sort</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleVisibility(cat.id)}
                      className="hover:text-[#c77d2e] transition-colors p-1"
                      title="Visibilidad"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {cat.active ? "visibility" : "visibility_off"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`¿Eliminar la categoría ${cat.name}?`)) {
                          deleteCategory(cat.id);
                        }
                      }}
                      className="hover:text-red-600 transition-colors p-1"
                      title="Eliminar"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>

                {/* Subpanel integrado de talles */}
                <div className="bg-[#fff9ed] p-4 border border-[#d8c3b2]/30 flex flex-col gap-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#1e1c13] uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[#673900] text-[16px]">
                      straighten
                    </span>
                    <span>TALLES HABILITADOS PARA ESTA CATEGORÍA</span>
                  </div>

                  {/* Fila del sistema específico */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
                    <span className="font-semibold text-[#524438] uppercase tracking-wider">
                      {cat.systemName}:
                    </span>
                    {cat.systemSizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => addSize(cat.id, size)}
                        className="font-mono text-[#673900] hover:text-[#c77d2e] hover:underline transition-colors font-medium"
                      >
                        {size}
                      </button>
                    ))}
                  </div>

                  {/* Fila de talles únicos */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
                    <span className="font-semibold text-[#524438] uppercase tracking-wider">
                      TALLES ÚNICOS:
                    </span>
                    {cat.uniqueSizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => addSize(cat.id, size)}
                        className="font-mono text-[#673900] hover:text-[#c77d2e] hover:underline transition-colors font-medium"
                      >
                        {size}
                      </button>
                    ))}
                  </div>

                  {/* Talles adicionales agregados */}
                  {cat.addedSizes.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#d8c3b2]/20">
                      <span className="text-[10px] text-[#524438] uppercase font-semibold">
                        Añadidos:
                      </span>
                      {cat.addedSizes.map((size) => (
                        <span
                          key={size}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#eee8d9] text-[#1e1c13] text-[11px] font-mono font-medium"
                        >
                          {size}
                          <button
                            type="button"
                            onClick={() => removeSize(cat.id, size)}
                            className="hover:text-red-600 text-[#857466]"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Dropdown y botón Añadir Talle */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 max-w-md">
                    <select
                      value={selectedSystem[cat.id] || ""}
                      onChange={(e) =>
                        setSelectedSystem((prev) => ({ ...prev, [cat.id]: e.target.value }))
                      }
                      className="flex-1 h-8 bg-white px-3 text-[12px] text-[#1e1c13] border border-[#d8c3b2]/60 focus:border-[#673900] focus:outline-none cursor-pointer"
                    >
                      <option value="" disabled>
                        Selecciona sistema de talla
                      </option>
                      {SIZE_SYSTEM_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleAddSelectedSystem(cat.id)}
                      className="h-8 px-4 bg-[#54624f] hover:bg-[#33402f] text-white text-[11px] font-semibold uppercase tracking-wider transition-colors shrink-0"
                    >
                      + AÑADIR TALLE
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── 5. Banner de Sincronización Automática inferior ── */}
        <footer className="bg-[#f4eddf] p-4 border border-[#d8c3b2]/40 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#673900] text-[20px] shrink-0">
              sync
            </span>
            <p className="text-[11px] text-[#524438] leading-normal">
              <strong className="text-[#1e1c13]">Sincronización Automática:</strong> Cualquier
              cambio en las categorías, talles por categoría, colores o firmas se propaga
              inmediatamente a las pantallas de Creación de Producto, Fichas de Inventario y Tienda
              Online Pública.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 text-[10px] font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => alert("Registro de Cambios: Catálogo sincronizado.")}
              className="text-[#673900] hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">history</span> REGISTRO DE
              CAMBIOS
            </button>
            <span className="text-[#d8c3b2]">|</span>
            <button
              type="button"
              onClick={() => {
                const data = JSON.stringify(categories, null, 2);
                const blob = new Blob([data], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "norte_categorias.json";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="text-[#524438] hover:text-[#1e1c13] flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">download</span> EXPORTAR JSON
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}
