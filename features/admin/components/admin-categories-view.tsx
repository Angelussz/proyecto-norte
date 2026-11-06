"use client";

import { useState } from "react";

type CategoryItem = {
  id: string;
  name: string;
  sku: string;
  slug: string;
  active: boolean;
  description: string;
  activeItemsCount: number;
  sizes: string[];
  systemPresets: {
    systemName: string;
    sizes: string[];
  };
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
    activeItemsCount: 14,
    sizes: ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "Talle Único", "Talle Ajustable"],
    systemPresets: {
      systemName: "Sistema Alfa",
      sizes: ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL"],
    },
  },
  {
    id: "cat-2",
    name: "PANTALONES & SASTRERÍA",
    sku: "NRT-TRJ",
    slug: "/pantalones",
    active: true,
    description:
      "Pantalón ancho, pinzas artesanales y cortes rectos sartoriales. 10 prendas activas.",
    activeItemsCount: 10,
    sizes: ["36", "38", "40", "42", "44", "46", "48", "Talle Único", "Talle Ajustable"],
    systemPresets: {
      systemName: "Sistema Numérico EU",
      sizes: ["36", "38", "40", "42", "44", "46", "48"],
    },
  },
  {
    id: "cat-3",
    name: "CALZADO & ESENCIALES",
    sku: "NRT-ZAP",
    slug: "/calzado",
    active: true,
    description:
      "Alpargatas, mocasines y calzado de confección artesana en suela vegetal. 6 modelos.",
    activeItemsCount: 6,
    sizes: ["38", "39", "40", "41", "42", "43", "44", "45", "Talle Único", "Talle Ajustable"],
    systemPresets: {
      systemName: "Numeración Calzado",
      sizes: ["38", "39", "40", "41", "42", "43", "44", "45"],
    },
  },
  {
    id: "cat-4",
    name: "PRENDAS EXTERIORES",
    sku: "NRT-EXT",
    slug: "/exteriores",
    active: true,
    description:
      "Gabardinas de algodón encerado, saharianas y abrigos desestructurados. 4 referencias.",
    activeItemsCount: 4,
    sizes: ["S", "M", "L", "XL", "XXL", "3XL", "Talle Único", "Talle Ajustable"],
    systemPresets: {
      systemName: "Sistema Alfa",
      sizes: ["S", "M", "L", "XL", "XXL", "3XL"],
    },
  },
  {
    id: "cat-5",
    name: "ACCESORIOS & MARROQUINERÍA",
    sku: "NRT-ACC",
    slug: "/accesorios",
    active: true,
    description:
      "Bolsos tote de lona encerada, cinturones de piel vegetal y bufandas de telar. 4 referencias.",
    activeItemsCount: 4,
    sizes: ["S", "M", "L", "XL", "Talle Único", "Talle Ajustable"],
    systemPresets: {
      systemName: "Sistema Alfa",
      sizes: ["S", "M", "L", "XL"],
    },
  },
];

const UNIQUE_SIZES_PRESET = ["Talle Único", "Talle Ajustable"];

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
  const [customInputSize, setCustomInputSize] = useState<Record<string, string>>({});

  // Modal para nueva categoría
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatSku, setNewCatSku] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [newCatDescription, setNewCatDescription] = useState("");

  // Añadir un talle específico a una categoría
  function addSizeToCategory(catId: string, sizeToAdd: string) {
    const trimmed = sizeToAdd.trim();
    if (!trimmed) return;

    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== catId) return cat;
        if (cat.sizes.includes(trimmed)) return cat;
        return {
          ...cat,
          sizes: [...cat.sizes, trimmed],
        };
      }),
    );
  }

  // Quitar un talle de una categoría
  function removeSizeFromCategory(catId: string, sizeToRemove: string) {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== catId) return cat;
        return {
          ...cat,
          sizes: cat.sizes.filter((s) => s !== sizeToRemove),
        };
      }),
    );
  }

  // Toggle visibilidad / activo
  function toggleCategoryActive(catId: string) {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === catId ? { ...cat, active: !cat.active } : cat)),
    );
  }

  // Eliminar categoría
  function deleteCategory(catId: string) {
    setCategories((prev) => prev.filter((cat) => cat.id !== catId));
  }

  // Manejar creación de categoría desde el modal
  function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const formattedSku = newCatSku.trim() || `NRT-${newCatName.slice(0, 3).toUpperCase()}`;
    const formattedSlug =
      newCatSlug.trim() ||
      `/${newCatName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")}`;

    const newCategory: CategoryItem = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim().toUpperCase(),
      sku: formattedSku.toUpperCase(),
      slug: formattedSlug,
      active: true,
      description:
        newCatDescription.trim() ||
        "Nueva categoría registrada en el catálogo artesanal del atelier.",
      activeItemsCount: 0,
      sizes: ["S", "M", "L", "Talle Único"],
      systemPresets: {
        systemName: "Sistema Alfa",
        sizes: ["XS", "S", "M", "L", "XL"],
      },
    };

    setCategories((prev) => [newCategory, ...prev]);
    setNewCatName("");
    setNewCatSku("");
    setNewCatSlug("");
    setNewCatDescription("");
    setIsModalOpen(false);
  }

  // Exportar JSON mock
  function handleExportJSON() {
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(categories, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "norte_categorias_catalogo.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  const activeCategoriesCount = categories.filter((c) => c.active).length;
  const totalItemsCount = categories.reduce((acc, c) => acc + c.activeItemsCount, 0);

  return (
    <div className="relative w-full overflow-hidden px-4 lg:px-16 py-8 lg:py-12 bg-surface min-h-screen">
      {/* Auras decorativas de fondo */}
      <div className="absolute -top-32 right-12 w-96 h-96 bg-[#ffb875]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-80 -left-20 w-80 h-80 bg-[#d8e7cf]/30 rounded-full blur-3xl pointer-events-none" />

      {/* ── 1. Header de Sección ── */}
      <header className="relative z-10 flex flex-col gap-4 max-w-[1280px] mx-auto pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 font-inter text-[10px] text-[#524438] uppercase tracking-[0.2em]">
              <span className="text-[#673900] font-semibold">ADMIN</span>
              <span className="text-[#d8c3b2]">/</span>
              <span className="text-[#524438]">TIENDA</span>
              <span className="text-[#d8c3b2]">/</span>
              <span className="text-[#1e1c13] font-semibold">CATEGORÍAS Y ATRIBUTOS</span>
            </div>
            <div className="inline-flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-[#d8e7cf] text-[#121f10] font-inter text-[10px] uppercase tracking-widest font-semibold">
                ESTRUCTURA DE CATÁLOGO &amp; VALORES GLOBALES
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c77d2e] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#673900]" />
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pt-1">
          <div className="max-w-3xl">
            <h1 className="font-headline text-[48px] text-[#1e1c13] tracking-normal leading-none uppercase">
              GESTIÓN DE CATEGORÍAS Y ATRIBUTOS
            </h1>
            <p className="font-inter text-[16px] text-[#524438] mt-2 leading-relaxed max-w-2xl">
              Administración unificada del catálogo textil del atelier: jerarquías de categorías,
              parametrización de talles individuales por prenda, cartas de color de tintura oficial
              y firmas registradas.
            </p>
          </div>
        </div>
      </header>

      {/* ── 2. Panel de Métricas / Resumen Superior (3 KPI Cards) ── */}
      <section className="relative z-10 max-w-[1280px] mx-auto pb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Categorías Activas */}
        <div className="relative bg-[#faf3e4] p-6 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between overflow-hidden border border-[#d8c3b2]/30">
          <div className="absolute -right-3 -bottom-3 text-[#e8e2d4]/60 pointer-events-none font-headline text-[80px] select-none leading-none">
            01
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-inter text-[10px] uppercase tracking-[0.2em] text-[#524438] font-semibold">
                CATEGORÍAS ACTIVAS
              </span>
              <span className="material-symbols-outlined text-[#673900] text-[20px]">category</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-headline text-[36px] text-[#1e1c13]">
                {activeCategoriesCount}
              </span>
              <span className="font-inter text-[14px] text-[#524438] uppercase font-medium">
                Principales
              </span>
            </div>
          </div>
          <div className="mt-4 pt-2 bg-[#f4eddf]/60 -mx-6 -mb-6 px-6 pb-2 flex items-center justify-between">
            <span className="font-inter text-[12px] text-[#524438]">
              {categories.length * 5} Subcategorías activas
            </span>
            <span className="inline-flex items-center text-[#673900] font-inter text-[10px] font-semibold uppercase">
              100% VISIBLE
            </span>
          </div>
        </div>

        {/* Card 2: Sistemas de Talle */}
        <div className="relative bg-[#faf3e4] p-6 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between overflow-hidden border border-[#d8c3b2]/30">
          <div className="absolute -right-3 -bottom-3 text-[#e8e2d4]/60 pointer-events-none font-headline text-[80px] select-none leading-none">
            02
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-inter text-[10px] uppercase tracking-[0.2em] text-[#524438] font-semibold">
                SISTEMAS DE TALLE
              </span>
              <span className="material-symbols-outlined text-[#c77d2e] text-[20px]">
                straighten
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-headline text-[36px] text-[#1e1c13]">5</span>
              <span className="font-inter text-[14px] text-[#524438] uppercase font-medium">
                Rangos Específicos
              </span>
            </div>
          </div>
          <div className="mt-4 pt-2 bg-[#f4eddf]/60 -mx-6 -mb-6 px-6 pb-2 flex items-center justify-between">
            <span className="font-inter text-[12px] text-[#524438]">
              Por tipología de confección
            </span>
            <span className="inline-flex items-center gap-1 text-[#33402f] font-inter text-[10px] font-semibold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#33402f]" /> 100% COBERTURA
            </span>
          </div>
        </div>

        {/* Card 3: Prendas Asignadas */}
        <div className="relative bg-[#faf3e4] p-6 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between overflow-hidden border border-[#d8c3b2]/30">
          <div className="absolute -right-3 -bottom-3 text-[#e8e2d4]/60 pointer-events-none font-headline text-[80px] select-none leading-none">
            03
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-inter text-[10px] uppercase tracking-[0.2em] text-[#524438] font-semibold">
                PRENDAS ASIGNADAS
              </span>
              <span className="material-symbols-outlined text-[#54624f] text-[20px]">styler</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-headline text-[36px] text-[#1e1c13]">{totalItemsCount}</span>
              <span className="font-inter text-[14px] text-[#524438] uppercase font-medium">
                Prendas Totales
              </span>
            </div>
          </div>
          <div className="mt-4 pt-2 bg-[#f4eddf]/60 -mx-6 -mb-6 px-6 pb-2 flex items-center justify-between">
            <span className="font-inter text-[12px] text-[#524438]">Arquetipos normalizados</span>
            <span className="inline-flex items-center text-[#673900] font-inter text-[10px] font-semibold uppercase">
              CATÁLOGO ACTIVO
            </span>
          </div>
        </div>
      </section>

      {/* ── UNIFIED MAIN CONTAINER ── */}
      <div className="relative z-10 max-w-[1280px] mx-auto flex flex-col gap-10">
        {/* ======================================================== */}
        {/* SECCIÓN 1: GESTIÓN DE CATEGORÍAS & SUS TALLES ASIGNADOS */}
        {/* ======================================================== */}
        <section className="flex flex-col gap-4">
          {/* Header de la Sección 1 */}
          <div className="bg-[#f4eddf] p-6 shadow-sm border border-[#d8c3b2]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#673900] flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-white text-[26px]">
                  account_tree
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-headline text-[24px] uppercase tracking-wide text-[#1e1c13]">
                    1. GESTIÓN DE CATEGORÍAS &amp; SUS TALLES
                  </h2>
                  <span className="px-2 py-0.5 bg-[#33402f] text-[#fff9ed] font-inter text-[10px] font-semibold uppercase tracking-wider">
                    {activeCategoriesCount} CATEGORÍAS ACTIVAS
                  </span>
                </div>
                <p className="font-inter text-[12px] text-[#524438] mt-0.5">
                  Arquetipos de prendas, prefijos normalizados de SKU y parametrización de talles
                  específicos habilitados para cada prenda.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-[#673900] hover:bg-[#894d00] text-white transition-all duration-150 shadow-sm active:translate-y-px"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span className="font-headline text-[20px] uppercase tracking-wider">
                  + NUEVA CATEGORÍA
                </span>
              </button>
            </div>
          </div>

          {/* Editorial Callout Breve con foto en blanco y negro */}
          <div className="bg-[#faf3e4] shadow-sm border border-[#d8c3b2]/30 p-4 flex flex-col sm:flex-row items-center gap-4 overflow-hidden">
            {/* Foto de lino y tela */}
            <div className="w-full sm:w-32 h-20 bg-[#e0dacb] shrink-0 border border-[#d8c3b2]/40 overflow-hidden relative">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDu0yi7dQjI8sYST3K28n5KcUuE_IygkJkDol5DfuCHwx4Ls_ytOMc8iJeBN13LpEnNAbBOC1opD0FZM8myhO0hcMf4_nekDh6doXfCrJTF_CS1qIiOeV18utjgjyhgppQiAqF0ZEAuwYIYUNkfrGaAQ4YcTp-US_MvlwmqcpQ24Z5ZbPV-F6tViTxxcN2dda8IbdRtiIWDKAH-oPRB7HGQ2BuB-w0MBLw89kYbfK4"
                alt="Rollos de lino y lana atelier"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
              />
            </div>
            <div className="flex flex-col justify-between w-full">
              <div className="flex items-center justify-between">
                <span className="font-inter text-[10px] text-[#673900] uppercase font-bold tracking-widest">
                  CRITERIO DEL ATELIER: MATRIZ DE TALLAJE INDIVIDUAL
                </span>
                <span className="font-mono text-[11px] text-[#524438]">Sincronización v2025.1</span>
              </div>
              <p className="font-inter text-[14px] text-[#1e1c13] mt-1 leading-snug">
                Cada categoría gestiona sus propias tallas físicas. Las prendas asociadas a dicha
                categoría sólo permitirán registrar variantes de stock dentro de las tallas aquí
                habilitadas.
              </p>
            </div>
          </div>

          {/* Lista de Categorías */}
          <div className="flex flex-col gap-4">
            {categories.map((cat) => {
              const currentSelectVal = selectedSystem[cat.id] || "";
              const currentInputVal = customInputSize[cat.id] || "";

              return (
                <article
                  key={cat.id}
                  className="bg-[#faf3e4] p-6 shadow-sm hover:shadow-md transition-shadow border border-[#d8c3b2]/40 flex flex-col gap-4"
                >
                  {/* Encabezado de la categoría */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-2 border-b border-[#d8c3b2]/30">
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        className="cursor-grab active:cursor-grabbing text-[#857466] hover:text-[#673900] mt-1"
                        title="Arrastrar para reordenar"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          drag_indicator
                        </span>
                      </button>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="font-headline text-[24px] uppercase text-[#1e1c13] tracking-wide">
                            {cat.name}
                          </h3>
                          {cat.active ? (
                            <span className="px-2 py-0.5 bg-[#33402f] text-[#fff9ed] font-inter text-[10px] uppercase tracking-wider font-semibold">
                              ACTIVO
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-[#857466] text-white font-inter text-[10px] uppercase tracking-wider font-semibold">
                              INACTIVO
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-[#f4eddf] font-mono text-[11px] text-[#673900] font-bold border border-[#d8c3b2]/40">
                            SKU: {cat.sku}
                          </span>
                          <span className="text-[#524438] text-[12px] font-mono">{cat.slug}</span>
                        </div>
                        <p className="font-inter text-[14px] text-[#524438] mt-1">
                          {cat.description}
                        </p>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-1 bg-[#f4eddf] p-1 self-end sm:self-start shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const newDesc = prompt(
                            `Editar descripción para ${cat.name}:`,
                            cat.description,
                          );
                          if (newDesc !== null) {
                            setCategories((prev) =>
                              prev.map((c) =>
                                c.id === cat.id ? { ...c, description: newDesc } : c,
                              ),
                            );
                          }
                        }}
                        className="p-1.5 hover:bg-[#fff9ed] text-[#524438] hover:text-[#673900] transition-colors"
                        title="Editar Categoría"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit_note</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleCategoryActive(cat.id)}
                        className={`p-1.5 hover:bg-[#fff9ed] transition-colors ${
                          cat.active
                            ? "text-[#524438] hover:text-[#c77d2e]"
                            : "text-[#857466] hover:text-[#33402f]"
                        }`}
                        title={cat.active ? "Desactivar visibilidad" : "Activar visibilidad"}
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
                        className="p-1.5 hover:bg-[#fff9ed] text-[#524438] hover:text-red-600 transition-colors"
                        title="Eliminar Categoría"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Componente Integrado de Talles para esta Categoría */}
                  <div className="bg-[#fff9ed] px-4 py-3 border border-[#d8c3b2]/30 flex flex-col gap-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[#673900] text-[16px]">
                          straighten
                        </span>
                        <span className="font-inter text-[11px] uppercase font-semibold text-[#1e1c13] tracking-wider">
                          Talles habilitados para esta categoría ({cat.sizes.length})
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-[#857466] uppercase tracking-wider">
                        Matriz de asignación
                      </span>
                    </div>

                    {/* Chips de talles actualmente asignados */}
                    <div className="flex flex-wrap items-center gap-2">
                      {cat.sizes.length === 0 ? (
                        <span className="font-inter text-[12px] text-[#857466] italic py-1">
                          Sin talles habilitados. Añade uno desde los sistemas inferiores.
                        </span>
                      ) : (
                        cat.sizes.map((s) => (
                          <span
                            key={s}
                            className="group inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#eee8d9] text-[#1e1c13] font-inter text-[11px] font-semibold tracking-wider hover:bg-[#e8e2d4] hover:border-[#673900]/50 hover:shadow-sm border border-transparent transition-all select-none"
                          >
                            <span className="material-symbols-outlined text-[15px] text-[#857466]/60 group-hover:text-[#673900] transition-colors pointer-events-none">
                              drag_indicator
                            </span>
                            <span>{s}</span>
                            <button
                              type="button"
                              onClick={() => removeSizeFromCategory(cat.id, s)}
                              className="text-[#524438] hover:text-red-600 transition-colors flex items-center ml-0.5"
                              title={`Eliminar talle ${s}`}
                            >
                              <span className="material-symbols-outlined text-[14px]">close</span>
                            </button>
                          </span>
                        ))
                      )}
                    </div>

                    {/* Presets rápidos y selector */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-[#d8c3b2]/20">
                      {/* Presets del sistema específico */}
                      <div className="flex flex-wrap items-center gap-2 font-inter text-[14px]">
                        <span className="font-inter text-[10px] uppercase text-[#524438] font-semibold tracking-wider">
                          {cat.systemPresets.systemName}:
                        </span>
                        {cat.systemPresets.sizes.map((presetSize, idx) => (
                          <span key={presetSize} className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => addSizeToCategory(cat.id, presetSize)}
                              className={`font-mono text-[12px] font-semibold transition-colors ${
                                cat.sizes.includes(presetSize)
                                  ? "text-[#857466] line-through opacity-50 cursor-default"
                                  : "text-[#673900] hover:text-[#c77d2e] hover:underline"
                              }`}
                              title={
                                cat.sizes.includes(presetSize)
                                  ? "Ya añadido"
                                  : `Añadir ${presetSize}`
                              }
                            >
                              {presetSize}
                            </button>
                            {idx < cat.systemPresets.sizes.length - 1 && (
                              <span className="text-[#d8c3b2] text-[11px]">·</span>
                            )}
                          </span>
                        ))}
                      </div>

                      {/* Presets de Talles Únicos */}
                      <div className="flex flex-wrap items-center gap-2 font-inter text-[14px]">
                        <span className="font-inter text-[10px] uppercase text-[#524438] font-semibold tracking-wider">
                          Talles Únicos:
                        </span>
                        {UNIQUE_SIZES_PRESET.map((uniqueSize, idx) => (
                          <span key={uniqueSize} className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => addSizeToCategory(cat.id, uniqueSize)}
                              className={`font-mono text-[12px] font-semibold transition-colors ${
                                cat.sizes.includes(uniqueSize)
                                  ? "text-[#857466] line-through opacity-50 cursor-default"
                                  : "text-[#673900] hover:text-[#c77d2e] hover:underline"
                              }`}
                              title={
                                cat.sizes.includes(uniqueSize)
                                  ? "Ya añadido"
                                  : `Añadir ${uniqueSize}`
                              }
                            >
                              {uniqueSize}
                            </button>
                            {idx < UNIQUE_SIZES_PRESET.length - 1 && (
                              <span className="text-[#d8c3b2] text-[11px]">·</span>
                            )}
                          </span>
                        ))}
                      </div>

                      {/* Selector de sistema y campo personalizado */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xl pt-1">
                        <select
                          value={currentSelectVal}
                          onChange={(e) =>
                            setSelectedSystem((prev) => ({
                              ...prev,
                              [cat.id]: e.target.value,
                            }))
                          }
                          className="flex-1 h-9 bg-white px-3 text-[#1e1c13] font-inter text-[13px] border border-[#d8c3b2]/50 focus:border-[#673900] focus:outline-none cursor-pointer"
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

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="O talle manual..."
                            value={currentInputVal}
                            onChange={(e) =>
                              setCustomInputSize((prev) => ({
                                ...prev,
                                [cat.id]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                if (currentInputVal.trim()) {
                                  addSizeToCategory(cat.id, currentInputVal.trim());
                                  setCustomInputSize((prev) => ({ ...prev, [cat.id]: "" }));
                                }
                              }
                            }}
                            className="w-32 h-9 bg-white px-2 text-[#1e1c13] font-mono text-[12px] border border-[#d8c3b2]/50 focus:border-[#673900] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (currentInputVal.trim()) {
                                addSizeToCategory(cat.id, currentInputVal.trim());
                                setCustomInputSize((prev) => ({ ...prev, [cat.id]: "" }));
                              } else if (currentSelectVal) {
                                // Añadir la etiqueta seleccionada
                                addSizeToCategory(cat.id, currentSelectVal.split("(")[0].trim());
                                setSelectedSystem((prev) => ({ ...prev, [cat.id]: "" }));
                              }
                            }}
                            className="h-9 px-4 bg-[#54624f] hover:bg-[#33402f] text-white font-inter text-[11px] uppercase tracking-wider font-semibold transition-colors active:translate-y-px inline-flex items-center justify-center shrink-0"
                          >
                            + AÑADIR TALLE
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── Banner de Sincronización Global de Catálogo ── */}
        <div className="bg-[#f4eddf] p-4 border border-[#d8c3b2]/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#673900] text-[22px]">sync</span>
            <p className="font-inter text-[12px] text-[#524438] leading-relaxed">
              <strong className="font-semibold text-[#1e1c13]">Sincronización Automática:</strong>{" "}
              Cualquier cambio en las categorías, talles por categoría, colores o firmas se propaga
              inmediatamente a las pantallas de Creación de Producto, Fichas de Inventario y Tienda
              Online Pública.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => alert("Registro de cambios: Sistema v2025.1 en sincronía continua.")}
              className="font-inter text-[10px] text-[#673900] font-bold uppercase tracking-wider hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">history</span> Registro de
              Cambios
            </button>
            <span className="text-[#d8c3b2]">|</span>
            <button
              type="button"
              onClick={handleExportJSON}
              className="font-inter text-[10px] text-[#524438] hover:text-[#1e1c13] uppercase tracking-wider flex items-center gap-1 font-semibold"
            >
              <span className="material-symbols-outlined text-[16px]">download</span> Exportar JSON
            </button>
          </div>
        </div>
      </div>

      {/* ── MODAL NUEVA CATEGORÍA ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e1c13]/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg p-8 shadow-2xl flex flex-col gap-6 border border-[#d8c3b2]">
            <div className="flex items-center justify-between border-b border-[#eee8d9] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#673900] text-[24px]">
                  account_tree
                </span>
                <h3 className="font-headline text-[26px] uppercase text-[#1e1c13] tracking-wide">
                  NUEVA CATEGORÍA DE ATELIER
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#857466] hover:text-[#1e1c13] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-inter text-[11px] uppercase tracking-wider text-[#524438] font-semibold">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: CAMISAS DE LINO"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-[#faf3e4] px-4 py-2.5 font-inter text-[14px] text-[#1e1c13] focus:outline-none focus:bg-[#fff9ed] focus:ring-1 focus:ring-[#673900]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-inter text-[11px] uppercase tracking-wider text-[#524438] font-semibold">
                    Prefijo SKU
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: NRT-CAM"
                    value={newCatSku}
                    onChange={(e) => setNewCatSku(e.target.value)}
                    className="w-full bg-[#faf3e4] px-4 py-2 font-mono text-[13px] uppercase text-[#1e1c13] focus:outline-none focus:bg-[#fff9ed] focus:ring-1 focus:ring-[#673900]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-inter text-[11px] uppercase tracking-wider text-[#524438] font-semibold">
                    Ruta / Slug
                  </label>
                  <input
                    type="text"
                    placeholder="/camisas"
                    value={newCatSlug}
                    onChange={(e) => setNewCatSlug(e.target.value)}
                    className="w-full bg-[#faf3e4] px-4 py-2 font-mono text-[13px] text-[#1e1c13] focus:outline-none focus:bg-[#fff9ed] focus:ring-1 focus:ring-[#673900]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-inter text-[11px] uppercase tracking-wider text-[#524438] font-semibold">
                  Descripción Textil / Confección
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe la tipología de prenda, hilado o confección artesanal..."
                  value={newCatDescription}
                  onChange={(e) => setNewCatDescription(e.target.value)}
                  className="w-full bg-[#faf3e4] p-3 font-inter text-[13px] text-[#1e1c13] focus:outline-none focus:bg-[#fff9ed] focus:ring-1 focus:ring-[#673900] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#eee8d9]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-[#eee8d9] hover:bg-[#e8e2d4] text-[#1e1c13] font-inter text-[11px] uppercase tracking-widest transition-colors"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#673900] hover:bg-[#894d00] text-white font-headline text-[18px] uppercase tracking-wider transition-colors shadow-sm"
                >
                  CREAR CATEGORÍA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
