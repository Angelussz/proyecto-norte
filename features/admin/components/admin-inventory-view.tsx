"use client";

import { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ColorVariant {
  name: string;
  hex: string;
}

interface StockMatrix {
  [talle: string]: { [color: string]: number };
}

interface ProductCard {
  id: string;
  sku: string;
  category: string;
  name: string;
  pvp?: string;
  sizes: string[];
  colors: ColorVariant[];
  stock: StockMatrix;
  totalStock: number;
  stockLevel: "healthy" | "low" | "critical";
  expanded: boolean;
  image: string;
}

interface Movement {
  id: string;
  product: string;
  delta: number;
  detail: string;
  time: string;
  type: "in" | "out" | "error";
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_PRODUCTS: ProductCard[] = [
  {
    id: "p1",
    sku: "NRT-LNO-12",
    category: "SOBRECAMISAS",
    name: "Sobrecamisa Lino Rústico Arena",
    pvp: "165,00 €",
    sizes: ["38 (S)", "40 (M)", "42 (L)", "44 (XL)"],
    colors: [
      { name: "Arena Natural", hex: "#E4D5B7" },
      { name: "Verde Oliva", hex: "#4F583D" },
      { name: "Terracota", hex: "#9E472A" },
    ],
    stock: {
      "38 (S)": { "Arena Natural": 8, "Verde Oliva": 4, Terracota: 0 },
      "40 (M)": { "Arena Natural": 10, "Verde Oliva": 6, Terracota: 3 },
      "42 (L)": { "Arena Natural": 5, "Verde Oliva": 2, Terracota: 1 },
      "44 (XL)": { "Arena Natural": 2, "Verde Oliva": 1, Terracota: 1 },
    },
    totalStock: 43,
    stockLevel: "healthy",
    expanded: true,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCfieGQB4Efr4bdZTlNGrS1HU9H8T3levaOx4Cy8WmMqna1XPL0DGhR5AGWZRkMm2-gNiyKir8Y5xZLyw4l5i0VC8qL8IYmCdi57qLKjcYEykLcG9BSIjQmoRSFnx6sauTr9Hzvq-gUvoug1BVMW1oErR8zkgk8jyL-W3IJRrV2awr3Z-IClgYvfUc1acL4dsRQm2_wfqGrpnpZL0OE8AGucOwxmEZmiJ7bOVutuejz2EZhVCDiBKES",
  },
  {
    id: "p2",
    sku: "NRT-TRJ-02",
    category: "PANTALONES",
    name: "Pantalón Traje Sastre Arena",
    sizes: ["40 (M)", "42 (L)", "44 (XL)"],
    colors: [
      { name: "Arena Natural", hex: "#E4D5B7" },
      { name: "Negro Carbón", hex: "#222222" },
    ],
    stock: {
      "40 (M)": { "Arena Natural": 4, "Negro Carbón": 2 },
      "42 (L)": { "Arena Natural": 3, "Negro Carbón": 2 },
      "44 (XL)": { "Arena Natural": 1, "Negro Carbón": 0 },
    },
    totalStock: 12,
    stockLevel: "low",
    expanded: false,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCuU0KpkkioZ-hEgpbcaLOriWoaacJuUJFRg58ygY70_6AYnVRq9vy3f1sf6B7HaA0Y0NmIDakZ36dCfydZXkN4Mn7I8wwCA-yBaaY5z7YBOdTnfFoOLSMm1JtsrvDie1VsUq4T9bfGwlrTjPj_P2j9pydrKj13mAUkqVjAcyvuskdxel5pVJTIIUZwoPTbCepjtyywt6ylVHT99jUbh3NiH4DBiQAxqxdCt211Sgzh_UqlegZXCNyl",
  },
  {
    id: "p3",
    sku: "NRT-ZAP-01",
    category: "CALZADO",
    name: "Zapatillas Esenciales Blancas",
    sizes: ["41", "42", "43", "44"],
    colors: [{ name: "Blanco Puro", hex: "#FDFBF7" }],
    stock: {
      "41": { "Blanco Puro": 12 },
      "42": { "Blanco Puro": 14 },
      "43": { "Blanco Puro": 11 },
      "44": { "Blanco Puro": 8 },
    },
    totalStock: 45,
    stockLevel: "healthy",
    expanded: false,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBZeBmio3o_7iHY68IFRh4YJkpJ6dehe1HbVT_rqug0UVScWoWjenj8I8S9nHmOt1Ye9-u1JDG5K1g5T-JUO1LvSgrotmyhDvkBLkCDOp5-475u-AdHGM57j7OKeDA3Q1yAM1EZfeF4a3z-_zr08XOzVewwPGkOaKob_Cn4u4E_sl5uGvkUCqYdZKaajixnTtxcRakQQ_PaWut2qXiyhoKeMrKvaNdqt0WNZjv9vLUyp-YspDXNRp2W",
  },
];

const MOVEMENTS: Movement[] = [
  {
    id: "m1",
    product: "Sobrecamisa Lino Arena",
    delta: 10,
    detail: "Talle 40 • Arena Natural: 10 uds",
    time: "Hoy, 11:24 por E. Vázquez",
    type: "in",
  },
  {
    id: "m2",
    product: "Zapatillas Esenciales",
    delta: -1,
    detail: "Talla 43 / Blanco Puro",
    time: "Hoy, 09:40 Automático",
    type: "out",
  },
  {
    id: "m3",
    product: "Pantalón Traje Sastre",
    delta: -2,
    detail: "Talla 40 / Negro Carbón",
    time: "Ayer, 17:15 por E. Vázquez",
    type: "error",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcTotal(stock: StockMatrix): number {
  return Object.values(stock).reduce(
    (sum, row) => sum + Object.values(row).reduce((s, v) => s + (v as number), 0),
    0,
  );
}

// ─── StockCell ────────────────────────────────────────────────────────────────

function StockCell({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-6 h-6 bg-surface-container-high hover:bg-surface-variant flex items-center justify-center font-bold text-on-surface text-sm transition-colors"
      >
        −
      </button>
      <input
        type="number"
        value={value}
        min={0}
        onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
        className={`w-12 text-center py-1 bg-surface-container font-inter text-[13px] font-semibold outline-none focus:bg-white transition-colors ${
          value === 0 ? "text-error" : "text-on-surface"
        }`}
      />
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="w-6 h-6 bg-surface-container-high hover:bg-surface-variant flex items-center justify-center font-bold text-on-surface text-sm transition-colors"
      >
        +
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function AdminInventoryView() {
  const [products, setProducts] = useState<ProductCard[]>(INITIAL_PRODUCTS);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  function toggleExpand(id: string) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, expanded: !p.expanded } : p)));
  }

  function updateStock(productId: string, talle: string, colorName: string, newVal: number) {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const newStock: StockMatrix = {
          ...p.stock,
          [talle]: { ...p.stock[talle], [colorName]: newVal },
        };
        return { ...p, stock: newStock, totalStock: calcTotal(newStock) };
      }),
    );
  }

  function saveMatrix(productId: string) {
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    setToast(`Stock de "${p.name}" actualizado correctamente.`);
    setTimeout(() => setToast(null), 3000);
  }

  const totalColorClass = (level: ProductCard["stockLevel"]) =>
    level === "healthy" ? "text-secondary" : level === "low" ? "text-mustard" : "text-error";

  return (
    <main className="w-full bg-surface min-h-[calc(100vh-4rem)]">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1e1c13] text-[#fff9ed] px-5 py-3 border-l-4 border-mustard font-inter text-[13px] shadow-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-mustard text-[18px]">check_circle</span>
          <span>{toast}</span>
        </div>
      )}

      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* ── Page Header ── */}
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-mustard" />
              <span className="font-inter text-[10px] text-on-surface-variant uppercase tracking-[0.25em] font-semibold">
                SISTEMA CENTRAL DE CONFECCIÓN Y STOCK
              </span>
            </div>
            <h1 className="font-headline text-[42px] tracking-wide text-on-surface uppercase leading-none">
              CONTROL DE INVENTARIO Y VARIANTES
            </h1>
            <p className="font-inter text-[13px] text-on-surface-variant max-w-2xl leading-relaxed">
              Gestión matricial de stock por SKU, asignación dinámica de talles, variantes de color
              de confección y balance en tiempo real entre atelier y canales de venta.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-container-high hover:bg-surface-variant text-on-surface font-inter text-[12px] uppercase tracking-wider transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Reporte Stock (CSV)
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-container-high hover:bg-surface-variant text-on-surface font-inter text-[12px] uppercase tracking-wider transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              Ajuste Masivo
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-headline text-[16px] uppercase tracking-wider transition-colors shadow-sm hover:bg-primary-container"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Asignar Variante
            </button>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* KPI 1 */}
          <div className="bg-surface-container-low p-6 flex flex-col justify-between relative overflow-hidden border border-outline-variant/30 shadow-sm">
            <div className="flex items-start justify-between relative z-10">
              <span className="font-inter text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">
                Total Unidades Físicas
              </span>
              <span className="material-symbols-outlined text-primary text-[20px]">inventory</span>
            </div>
            <div className="mt-4 relative z-10">
              <span className="font-headline text-[42px] text-on-surface tracking-wide block leading-none">
                1,420
              </span>
              <span className="font-inter text-[11px] text-secondary font-bold uppercase tracking-wider block mt-1">
                +42 esta semana
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

          {/* KPI 2 */}
          <div className="bg-surface-container-low p-6 flex flex-col justify-between relative overflow-hidden border border-outline-variant/30 shadow-sm">
            <div className="flex items-start justify-between relative z-10">
              <span className="font-inter text-[10px] text-secondary uppercase tracking-widest font-semibold">
                Stock Saludable
              </span>
              <span className="material-symbols-outlined text-secondary text-[20px]">verified</span>
            </div>
            <div className="mt-4 relative z-10">
              <span className="font-headline text-[42px] text-secondary tracking-wide block leading-none">
                38
              </span>
              <span className="font-inter text-[11px] bg-secondary-container text-on-secondary-container px-2 py-0.5 uppercase font-semibold inline-block mt-1">
                Nivel Óptimo
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

          {/* KPI 3 */}
          <div className="bg-surface-container-low p-6 flex flex-col justify-between relative overflow-hidden border border-outline-variant/30 shadow-sm">
            <div className="flex items-start justify-between relative z-10">
              <span className="font-inter text-[10px] text-mustard uppercase tracking-widest font-semibold">
                Bajo Stock / Reposición
              </span>
              <span className="material-symbols-outlined text-mustard text-[20px]">
                warning_amber
              </span>
            </div>
            <div className="mt-4 relative z-10">
              <span className="font-headline text-[42px] text-mustard tracking-wide block leading-none">
                06
              </span>
              <span className="font-inter text-[11px] bg-mustard/15 text-primary px-2 py-0.5 uppercase font-semibold inline-block mt-1">
                Prioridad Media
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

          {/* KPI 4 */}
          <div className="bg-surface-container-low p-6 flex flex-col justify-between relative overflow-hidden border border-outline-variant/30 shadow-sm">
            <div className="flex items-start justify-between relative z-10">
              <span className="font-inter text-[10px] text-error uppercase tracking-widest font-semibold">
                Rotura de Stock
              </span>
              <span className="material-symbols-outlined text-error text-[20px]">block</span>
            </div>
            <div className="mt-4 relative z-10">
              <span className="font-headline text-[42px] text-error tracking-wide block leading-none">
                02
              </span>
              <span className="font-inter text-[11px] bg-error-container text-on-error-container px-2 py-0.5 uppercase font-semibold inline-block mt-1">
                Acción Crítica
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

        {/* ── Filter Bar ── */}
        <div className="flex flex-col gap-2">
          <div className="bg-surface-container-low border border-outline-variant/30 shadow-sm p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
              {/* Búsqueda */}
              <div className="relative flex-1 max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Buscar por nombre, SKU o etiqueta..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white text-on-surface placeholder:text-outline/70 font-inter text-[13px] outline-none shadow-sm focus:ring-1 focus:ring-primary"
                />
              </div>
              {/* Selector Categoría */}
              <div className="relative">
                <select
                  value={filterCat}
                  onChange={(e) => setFilterCat(e.target.value)}
                  className="appearance-none bg-white text-on-surface font-inter text-[13px] pl-3 pr-8 py-2 outline-none shadow-sm cursor-pointer w-full sm:w-auto border border-outline-variant/40"
                >
                  <option value="">Categoría: Todas</option>
                  <option>Sobrecamisas</option>
                  <option>Pantalones</option>
                  <option>Calzado</option>
                  <option>Prendas Exteriores</option>
                  <option>Accesorios</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
                  keyboard_arrow_down
                </span>
              </div>
              {/* Selector Estado */}
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="appearance-none bg-white text-on-surface font-inter text-[13px] pl-3 pr-8 py-2 outline-none shadow-sm cursor-pointer w-full sm:w-auto border border-outline-variant/40"
                >
                  <option value="">Estado: Todos</option>
                  <option>Activo</option>
                  <option>Borrador</option>
                  <option>Agotado</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
                  keyboard_arrow_down
                </span>
              </div>
              {/* Selector Marca */}
              <div className="relative">
                <select
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                  className="appearance-none bg-white text-on-surface font-inter text-[13px] pl-3 pr-8 py-2 outline-none shadow-sm cursor-pointer w-full sm:w-auto border border-outline-variant/40"
                >
                  <option value="">Marca: Todas</option>
                  <option>NORTE Atelier</option>
                  <option>NORTE Essentials</option>
                  <option>Colaboración Jorge Juan</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
                  keyboard_arrow_down
                </span>
              </div>
            </div>
          </div>
          {/* Limpiar filtros */}
          <div className="flex items-center justify-end px-1">
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilterCat("");
                setFilterStatus("");
                setFilterBrand("");
              }}
              className="inline-flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors font-inter text-[11px] uppercase tracking-wider font-semibold"
            >
              <span className="material-symbols-outlined text-[14px]">filter_alt_off</span>
              Limpiar Filtros
            </button>
          </div>
        </div>

        {/* ── Main Workspace: Product Matrix ── */}
        <div className="w-full flex flex-col gap-5">
          {/* Paginación */}
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
            <span className="font-inter text-[11px] uppercase tracking-wider text-on-surface-variant">
              Página 1 de 4 • 38 prendas registradas
            </span>
            <nav className="flex items-center gap-1.5">
              <button
                disabled
                className="px-2.5 py-1 font-inter text-[11px] border border-outline-variant/60 text-on-surface-variant/50 cursor-not-allowed bg-white"
              >
                ← Ant
              </button>
              <button className="px-2.5 py-1 font-inter text-[11px] font-bold bg-primary text-white shadow-sm">
                1
              </button>
              {[2, 3, 4].map((n) => (
                <button
                  key={n}
                  className="px-2.5 py-1 font-inter text-[11px] border border-outline-variant/60 bg-white text-on-surface hover:bg-surface-container"
                >
                  {n}
                </button>
              ))}
              <button className="px-2.5 py-1 font-inter text-[11px] border border-outline-variant/60 bg-white text-on-surface hover:bg-surface-container">
                Sig →
              </button>
            </nav>
          </div>

          {/* Product Cards */}
          {products.map((product) => (
            <article
              key={product.id}
              className="bg-surface-container-low border border-outline-variant/30 shadow-sm"
            >
              {/* Header */}
              <div className="p-4 bg-surface-container flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(product.id)}
                    className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors shrink-0"
                    title="Expandir / Contraer Matriz"
                  >
                    <span
                      className={`material-symbols-outlined text-[20px] transition-transform duration-300 ${
                        product.expanded ? "rotate-180" : "rotate-0"
                      }`}
                    >
                      keyboard_arrow_down
                    </span>
                  </button>
                  {/* Thumbnail */}
                  <div className="w-16 h-20 bg-surface-container-highest shrink-0 overflow-hidden shadow-sm">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Info */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-inter text-[10px] px-2 py-0.5 bg-[#33402f] text-[#fff9ed] uppercase font-semibold tracking-wider">
                        {product.category}
                      </span>
                      <span className="font-inter text-[11px] text-on-surface-variant uppercase tracking-wider font-mono">
                        SKU: {product.sku}
                      </span>
                    </div>
                    <h2 className="font-headline text-[22px] tracking-wide text-on-surface uppercase leading-tight">
                      {product.name}
                    </h2>
                    <div className="flex items-center gap-3 font-inter text-[12px] text-on-surface-variant flex-wrap">
                      {product.pvp && (
                        <>
                          <span>
                            PVP: <strong className="text-on-surface">{product.pvp}</strong>
                          </span>
                          <span>•</span>
                        </>
                      )}
                      <span>
                        Talles:{" "}
                        <strong className="text-on-surface">
                          {product.sizes.map((s) => s.replace(/ \([A-Z]+\)/, "")).join(", ")}
                        </strong>
                      </span>
                      <span>•</span>
                      <div className="flex items-center gap-1.5">
                        <span>Colores:</span>
                        {product.colors.map((c) => (
                          <span
                            key={c.name}
                            className="inline-flex items-center p-1 bg-white border border-outline-variant/50 shadow-sm"
                            title={c.name}
                          >
                            <span
                              className="w-2.5 h-2.5 inline-block shrink-0"
                              style={{ backgroundColor: c.hex }}
                            />
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center gap-4 self-end md:self-auto">
                  <div className="text-right">
                    <span className="block font-inter text-[10px] uppercase tracking-widest text-on-surface-variant">
                      Stock Total
                    </span>
                    <span
                      className={`font-headline text-[28px] leading-none ${totalColorClass(product.stockLevel)}`}
                    >
                      {product.totalStock} UDS
                    </span>
                  </div>
                  <button
                    type="button"
                    className="p-2 text-on-surface-variant hover:text-on-surface bg-white shadow-sm self-start"
                  >
                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                  </button>
                </div>
              </div>

              {/* Expandable Matrix */}
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  product.expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="p-5 flex flex-col gap-5">
                    {/* Config Strip */}
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Talles */}
                      <div className="flex flex-col gap-2">
                        <span className="font-inter text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">
                          TALLES ACTIVOS
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {product.sizes.map((s) => (
                            <span
                              key={s}
                              className="px-2.5 py-1 bg-white text-on-surface font-inter text-[12px] shadow-sm font-semibold border border-outline-variant/40"
                            >
                              {s}
                            </span>
                          ))}
                          <button
                            type="button"
                            className="px-2.5 py-1 bg-surface-container hover:bg-surface-variant text-primary font-inter text-[11px] uppercase tracking-wider font-semibold transition-colors flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">add</span>
                            Talla
                          </button>
                        </div>
                      </div>
                      {/* Colores */}
                      <div className="flex flex-col gap-2">
                        <span className="font-inter text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">
                          VARIANTES DE COLOR ASIGNADAS
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          {product.colors.map((c) => (
                            <div
                              key={c.name}
                              className="flex items-center gap-1.5 px-2 py-1 bg-white shadow-sm border border-outline-variant/40"
                            >
                              <span
                                className="w-3.5 h-3.5 inline-block shrink-0"
                                style={{ backgroundColor: c.hex }}
                              />
                              <span className="font-inter text-[12px] font-medium text-on-surface">
                                {c.name}
                              </span>
                            </div>
                          ))}
                          <button
                            type="button"
                            className="px-2.5 py-1 bg-surface-container hover:bg-surface-variant text-primary font-inter text-[11px] uppercase tracking-wider font-semibold transition-colors flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">palette</span>
                            Color
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Matrix Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left bg-white shadow-sm border-collapse">
                        <thead>
                          <tr className="bg-surface-container text-on-surface">
                            <th className="py-3 px-4 font-inter text-[11px] uppercase tracking-wider font-bold">
                              Talla
                            </th>
                            {product.colors.map((c) => (
                              <th
                                key={c.name}
                                className="py-3 px-4 font-inter text-[11px] uppercase tracking-wider font-bold"
                              >
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className="w-2.5 h-2.5 inline-block shrink-0"
                                    style={{ backgroundColor: c.hex }}
                                  />
                                  {c.name}
                                </div>
                              </th>
                            ))}
                            <th className="py-3 px-4 font-inter text-[11px] uppercase tracking-wider font-bold text-center">
                              Subtotal
                            </th>
                            <th className="py-3 px-4 font-inter text-[11px] uppercase tracking-wider font-bold text-right">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container">
                          {product.sizes.map((talle) => {
                            const rowData = product.stock[talle] ?? {};
                            const rowTotal = Object.values(rowData).reduce(
                              (s, v) => s + (v as number),
                              0,
                            );
                            return (
                              <tr
                                key={talle}
                                className="hover:bg-surface-container-low transition-colors"
                              >
                                <td className="py-3 px-4 font-inter text-[13px] font-bold text-on-surface">
                                  {talle}
                                </td>
                                {product.colors.map((c) => (
                                  <td key={c.name} className="py-3 px-4">
                                    <StockCell
                                      value={rowData[c.name] ?? 0}
                                      onChange={(v) => updateStock(product.id, talle, c.name, v)}
                                    />
                                  </td>
                                ))}
                                <td className="py-3 px-4 text-center font-inter text-[13px] font-bold text-on-surface">
                                  {rowTotal}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <button
                                    type="button"
                                    className="text-on-surface-variant hover:text-primary transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">
                                      more_horiz
                                    </span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-outline-variant/20">
                      <div className="flex items-center gap-2 font-inter text-[11px] text-on-surface-variant">
                        <span className="material-symbols-outlined text-[16px] text-secondary">
                          sync
                        </span>
                        <span>Última sincronización con Taller Jorge Juan: Hace 14 minutos</span>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          className="px-4 py-2 bg-surface-container text-on-surface hover:bg-surface-variant font-inter text-[11px] uppercase tracking-wider transition-colors"
                        >
                          Descartar Cambios
                        </button>
                        <button
                          type="button"
                          onClick={() => saveMatrix(product.id)}
                          className="px-5 py-2 bg-primary text-white font-headline text-[14px] uppercase tracking-wider flex items-center gap-1 shadow-sm transition-colors hover:bg-primary-container"
                        >
                          <span className="material-symbols-outlined text-[16px]">check</span>
                          Actualizar Stock
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* ── Últimos Movimientos (Ancho Completo) ── */}
        <section className="w-full bg-surface-container-low border border-outline-variant/30 shadow-sm p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
            <h4 className="font-headline text-[22px] tracking-wide text-on-surface uppercase">
              ÚLTIMOS MOVIMIENTOS
            </h4>
            <a
              href="#"
              className="font-inter text-[11px] text-primary font-semibold uppercase tracking-wider hover:underline"
            >
              Ver Historial
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MOVEMENTS.map((mov) => {
              const dotColor =
                mov.type === "in" ? "bg-secondary" : mov.type === "out" ? "bg-primary" : "bg-error";
              const deltaColor =
                mov.type === "in"
                  ? "text-secondary"
                  : mov.type === "out"
                    ? "text-primary"
                    : "text-error";
              return (
                <div
                  key={mov.id}
                  className="bg-white border border-outline-variant/30 shadow-sm flex items-start gap-3 p-4"
                >
                  <div className={`w-2 h-2 rounded-full ${dotColor} mt-1.5 shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-inter text-[13px] font-semibold text-on-surface truncate">
                        {mov.product}
                      </span>
                      <span className={`font-inter text-[12px] font-bold ${deltaColor} shrink-0`}>
                        {mov.delta > 0 ? `+${mov.delta}` : mov.delta} uds
                      </span>
                    </div>
                    <p className="font-inter text-[11px] text-on-surface-variant mt-1">
                      {mov.detail}
                    </p>
                    <span className="font-inter text-[11px] text-outline font-mono block mt-2">
                      {mov.time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
