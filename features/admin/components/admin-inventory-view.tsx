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

// ─── Helper: calcular total de un producto ────────────────────────────────────
function calcTotal(stock: StockMatrix): number {
  return Object.values(stock).reduce(
    (sum, row) => sum + Object.values(row).reduce((s, v) => s + (v as number), 0),
    0,
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StockCell({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const isZero = value === 0;
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-6 h-6 bg-surface-container hover:bg-surface-variant flex items-center justify-center font-bold text-on-surface text-sm transition-colors"
      >
        −
      </button>
      <input
        type="number"
        value={value}
        min={0}
        onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
        className={`w-12 text-center py-1 bg-surface-container font-body-sm text-body-sm font-semibold outline-none focus:bg-surface-bright transition-colors ${
          isZero ? "text-error" : "text-on-surface"
        }`}
      />
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="w-6 h-6 bg-surface-container hover:bg-surface-variant flex items-center justify-center font-bold text-on-surface text-sm transition-colors"
      >
        +
      </button>
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

export function AdminInventoryView() {
  const [products, setProducts] = useState<ProductCard[]>(INITIAL_PRODUCTS);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("Categoría: Todas");
  const [filterStatus, setFilterStatus] = useState("Estado: Todos");
  const [filterBrand, setFilterBrand] = useState("Marca: Todas");
  const [toast, setToast] = useState<string | null>(null);

  // ── Toggle expand ──
  function toggleExpand(id: string) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, expanded: !p.expanded } : p)));
  }

  // ── Update stock cell ──
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

  // ── Save matrix ──
  function saveMatrix(productId: string) {
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    setToast(`Stock de "${p.name}" actualizado correctamente.`);
    setTimeout(() => setToast(null), 3000);
  }

  const stockLevelColor = (level: ProductCard["stockLevel"]) =>
    level === "healthy" ? "text-secondary" : level === "low" ? "text-mustard" : "text-error";

  return (
    <div className="space-y-space-xl">
      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-forest-green text-surface-bright px-space-lg py-space-sm shadow-lg flex items-center gap-2 font-label-sm text-label-sm uppercase tracking-wider animate-in fade-in slide-in-from-bottom-4">
          <span className="material-symbols-outlined text-[18px]">check</span>
          {toast}
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-space-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-mustard" />
            <span className="font-label-xs text-label-xs uppercase tracking-[0.25em] text-on-surface-variant font-semibold">
              SISTEMA CENTRAL DE CONFECCIÓN Y STOCK
            </span>
          </div>
          <h1 className="font-headline text-4xl tracking-wider text-on-surface uppercase leading-none">
            CONTROL DE INVENTARIO Y VARIANTES
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-2xl leading-relaxed">
            Gestión matricial de stock por SKU, asignación dinámica de talles, variantes de color de
            confección y balance en tiempo real entre atelier y canales de venta.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-space-sm shrink-0">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-space-md py-2.5 bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-sm text-label-sm uppercase tracking-wider transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Reporte Stock (CSV)</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-space-md py-2.5 bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-sm text-label-sm uppercase tracking-wider transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span>Ajuste Masivo</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-space-lg py-2.5 bg-primary text-on-primary font-headline-xs text-headline-xs uppercase tracking-wider transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Asignar Variante a Prenda</span>
          </button>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        {/* KPI 1: Total Unidades */}
        <div className="p-space-lg bg-surface-container-low shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant font-semibold">
              TOTAL UNIDADES FÍSICAS
            </span>
            <span className="material-symbols-outlined text-primary text-[20px]">inventory</span>
          </div>
          <div className="mt-space-md flex items-baseline gap-space-sm">
            <span className="font-headline text-4xl text-on-surface leading-none">1,420</span>
            <span className="font-label-xs text-label-xs text-secondary font-bold uppercase tracking-wider">
              +42 esta semana
            </span>
          </div>
          <div className="mt-space-sm pt-space-xs flex items-center justify-between text-on-surface-variant font-body-xs text-body-xs">
            <span>Capacidad ocupada</span>
            <span className="font-semibold text-on-surface">78.4% de taller</span>
          </div>
          <div className="w-full bg-surface-container-highest h-1 mt-2">
            <div className="bg-forest-green h-1 w-[78%]" />
          </div>
          <span
            className="material-symbols-outlined absolute -right-2 -bottom-2 opacity-10 text-on-surface pointer-events-none select-none"
            style={{ fontSize: "95px" }}
          >
            inventory_2
          </span>
        </div>

        {/* KPI 2: Stock Saludable */}
        <div className="p-space-lg bg-surface-container-low shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant font-semibold">
              STOCK SALUDABLE
            </span>
            <span className="material-symbols-outlined text-secondary text-[20px]">verified</span>
          </div>
          <div className="mt-space-md flex items-baseline gap-space-sm">
            <span className="font-headline text-4xl text-on-surface leading-none">38</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
              Referencias
            </span>
          </div>
          <div className="mt-space-sm pt-space-xs flex items-center justify-between text-on-surface-variant font-body-xs text-body-xs">
            <span>Rotación promedio</span>
            <span className="font-semibold text-on-surface">14.2 días</span>
          </div>
          <div className="w-full bg-surface-container-highest h-1 mt-2">
            <div className="bg-secondary h-1 w-[86%]" />
          </div>
          <span
            className="material-symbols-outlined absolute -right-2 -bottom-2 opacity-10 text-on-surface pointer-events-none select-none"
            style={{ fontSize: "95px" }}
          >
            verified
          </span>
        </div>

        {/* KPI 3: Bajo Stock */}
        <div className="p-space-lg bg-surface-container-low shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="font-label-xs text-label-xs uppercase tracking-widest text-mustard font-semibold">
              BAJO STOCK / REPOSICIÓN
            </span>
            <span className="material-symbols-outlined text-mustard text-[20px]">
              warning_amber
            </span>
          </div>
          <div className="mt-space-md flex items-baseline gap-space-sm">
            <span className="font-headline text-4xl text-mustard leading-none">06</span>
            <span className="font-label-xs text-label-xs bg-mustard/15 text-primary px-2 py-0.5 uppercase font-semibold">
              Prioridad Media
            </span>
          </div>
          <div className="mt-space-sm pt-space-xs flex items-center justify-between text-on-surface-variant font-body-xs text-body-xs">
            <span>Pedidos a taller pendientes</span>
            <span className="font-semibold text-on-surface">3 lotes en curso</span>
          </div>
          <div className="w-full bg-surface-container-highest h-1 mt-2">
            <div className="bg-mustard h-1 w-[45%]" />
          </div>
          <span
            className="material-symbols-outlined absolute -right-2 -bottom-2 opacity-10 text-on-surface pointer-events-none select-none"
            style={{ fontSize: "95px" }}
          >
            warning_amber
          </span>
        </div>

        {/* KPI 4: Rotura de Stock */}
        <div className="p-space-lg bg-surface-container-low shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="font-label-xs text-label-xs uppercase tracking-widest text-error font-semibold">
              ROTURA DE STOCK
            </span>
            <span className="material-symbols-outlined text-error text-[20px]">block</span>
          </div>
          <div className="mt-space-md flex items-baseline gap-space-sm">
            <span className="font-headline text-4xl text-error leading-none">02</span>
            <span className="font-label-xs text-label-xs bg-error-container text-on-error-container px-2 py-0.5 uppercase font-semibold">
              Acción Crítica
            </span>
          </div>
          <div className="mt-space-sm pt-space-xs flex items-center justify-between text-on-surface-variant font-body-xs text-body-xs">
            <span>Demanda reprimida</span>
            <span className="font-semibold text-on-surface">19 alertas cliente</span>
          </div>
          <div className="w-full bg-surface-container-highest h-1 mt-2">
            <div className="bg-error h-1 w-full" />
          </div>
          <span
            className="material-symbols-outlined absolute -right-2 -bottom-2 opacity-10 text-on-surface pointer-events-none select-none"
            style={{ fontSize: "95px" }}
          >
            block
          </span>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="space-y-space-sm">
        <div className="p-space-md bg-surface-container-low shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-sm flex-1">
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
                className="w-full pl-9 pr-3 py-2 bg-surface-container-lowest text-on-surface placeholder:text-outline/70 font-body-sm text-body-sm outline-none shadow-sm focus:ring-1 focus:ring-primary"
              />
            </div>
            {/* Selector Categoría */}
            <div className="relative">
              <select
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
                className="appearance-none bg-surface-container-lowest text-on-surface font-body-sm text-body-sm pl-3 pr-8 py-2 outline-none shadow-sm cursor-pointer w-full sm:w-auto"
              >
                <option>Categoría: Todas</option>
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
                className="appearance-none bg-surface-container-lowest text-on-surface font-body-sm text-body-sm pl-3 pr-8 py-2 outline-none shadow-sm cursor-pointer w-full sm:w-auto"
              >
                <option>Estado: Todos</option>
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
                className="appearance-none bg-surface-container-lowest text-on-surface font-body-sm text-body-sm pl-3 pr-8 py-2 outline-none shadow-sm cursor-pointer w-full sm:w-auto"
              >
                <option>Marca: Todas</option>
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
        <div className="flex items-center px-space-xs text-on-surface-variant font-label-xs text-label-xs uppercase tracking-wider justify-end">
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setFilterCat("Categoría: Todas");
              setFilterStatus("Estado: Todos");
              setFilterBrand("Marca: Todas");
            }}
            className="inline-flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors cursor-pointer uppercase font-semibold"
          >
            <span className="material-symbols-outlined text-[14px]">filter_alt_off</span>
            <span>LIMPIAR FILTROS</span>
          </button>
        </div>
      </div>

      {/* ── Main Workspace ── */}
      <div className="grid grid-cols-1 2xl:grid-cols-12 gap-space-xl">
        {/* ── Left: Product Matrix ── */}
        <div className="2xl:col-span-8 space-y-space-lg">
          {/* Paginación */}
          <div className="flex items-center justify-between pb-2 pt-1 border-b border-outline-variant/30 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-on-surface-variant">
              Página 1 de 4 • 38 prendas registradas
            </span>
            <nav className="flex items-center gap-1.5" aria-label="Paginación de matriz">
              <button
                disabled
                className="px-2.5 py-1 text-xs font-mono border border-outline-variant/60 text-on-surface-variant/50 cursor-not-allowed bg-surface-container-lowest"
              >
                ← Ant
              </button>
              <button className="px-2.5 py-1 text-xs font-mono font-bold bg-primary text-white shadow-sm">
                1
              </button>
              {[2, 3, 4].map((n) => (
                <button
                  key={n}
                  className="px-2.5 py-1 text-xs font-mono border border-outline-variant/60 bg-surface-container-lowest text-on-surface hover:bg-surface-container"
                >
                  {n}
                </button>
              ))}
              <button className="px-2.5 py-1 text-xs font-mono border border-outline-variant/60 bg-surface-container-lowest text-on-surface hover:bg-surface-container">
                Sig →
              </button>
            </nav>
          </div>

          {/* Product Cards */}
          {products.map((product) => (
            <article key={product.id} className="bg-surface-container-low shadow-sm">
              {/* ── Product Header ── */}
              <div className="p-space-lg bg-surface-container flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                <div className="flex items-center gap-space-md">
                  {/* Expand toggle */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(product.id)}
                    className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer hover:bg-surface-container-high shrink-0 self-center"
                    title="Contraer / Expandir Matriz"
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
                  <div className="w-16 h-20 bg-surface-container-highest shrink-0 overflow-hidden relative shadow-sm">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Info */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-label-xs text-label-xs px-2 py-0.5 bg-forest-green text-surface-bright uppercase font-semibold">
                        {product.category}
                      </span>
                      <span className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider font-mono">
                        SKU: {product.sku}
                      </span>
                    </div>
                    <h2 className="font-headline text-xl tracking-wide text-on-surface uppercase">
                      {product.name}
                    </h2>
                    <div className="flex items-center gap-space-md font-body-sm text-body-sm text-on-surface-variant flex-wrap">
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
                      <div className="inline-flex items-center gap-2">
                        <span className="text-on-surface-variant">Colores:</span>
                        {product.colors.map((c) => (
                          <span
                            key={c.name}
                            className="inline-flex items-center p-1 bg-surface-container-lowest border border-outline-variant/50 shadow-sm"
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

                {/* Total & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-space-lg self-end md:self-auto w-full md:w-auto pt-space-sm md:pt-0">
                  <div className="flex items-center gap-space-md">
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="text-right">
                        <span className="block font-label-xs text-label-xs uppercase tracking-wider text-on-surface-variant">
                          Stock Total Prenda
                        </span>
                        <span
                          className={`font-headline text-2xl leading-none ${stockLevelColor(product.stockLevel)}`}
                        >
                          {product.totalStock} UDS
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="p-2 text-on-surface-variant hover:text-on-surface bg-surface-container-lowest shadow-sm self-start"
                    >
                      <span className="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Expandable Matrix ── */}
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  product.expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="p-space-lg space-y-space-md bg-surface-container-low">
                    {/* Config Strip */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
                      {/* Talles */}
                      <div className="space-y-1.5">
                        <span className="block font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant font-semibold">
                          TALLES ACTIVOS
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {product.sizes.map((s) => (
                            <span
                              key={s}
                              className="px-2.5 py-1 bg-surface-container-lowest text-on-surface font-label-sm text-label-sm shadow-sm font-semibold"
                            >
                              {s}
                            </span>
                          ))}
                          <button
                            type="button"
                            className="px-2.5 py-1 bg-surface-container hover:bg-surface-variant text-primary font-label-xs text-label-xs uppercase tracking-wider font-semibold transition-colors flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">add</span>
                            Talla
                          </button>
                        </div>
                      </div>
                      {/* Colores */}
                      <div className="space-y-1.5">
                        <span className="block font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant font-semibold">
                          VARIANTES DE COLOR ASIGNADAS
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          {product.colors.map((c) => (
                            <div
                              key={c.name}
                              className="flex items-center gap-1.5 px-2 py-1 bg-surface-container-lowest shadow-sm"
                            >
                              <span
                                className="w-3.5 h-3.5 inline-block"
                                style={{ backgroundColor: c.hex }}
                              />
                              <span className="font-body-xs text-body-xs font-medium text-on-surface">
                                {c.name}
                              </span>
                            </div>
                          ))}
                          <button
                            type="button"
                            className="px-2.5 py-1 bg-surface-container hover:bg-surface-variant text-primary font-label-xs text-label-xs uppercase tracking-wider font-semibold transition-colors flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">palette</span>
                            Color
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Matrix Table */}
                    <div className="overflow-x-auto mt-space-md">
                      <table className="w-full text-left bg-surface-container-lowest shadow-sm border-collapse">
                        <thead>
                          <tr className="bg-surface-container-high text-on-surface">
                            <th className="py-3 px-4 font-label-xs text-label-xs uppercase tracking-wider font-bold">
                              Talla
                            </th>
                            {product.colors.map((c) => (
                              <th
                                key={c.name}
                                className="py-3 px-4 font-label-xs text-label-xs uppercase tracking-wider font-bold"
                              >
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className="w-2.5 h-2.5 inline-block"
                                    style={{ backgroundColor: c.hex }}
                                  />
                                  {c.name}
                                </div>
                              </th>
                            ))}
                            <th className="py-3 px-4 font-label-xs text-label-xs uppercase tracking-wider font-bold text-center">
                              Subtotal
                            </th>
                            <th className="py-3 px-4 font-label-xs text-label-xs uppercase tracking-wider font-bold text-right">
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
                                <td className="py-3 px-4 font-label-sm text-label-sm font-bold text-on-surface">
                                  {talle}
                                  <span className="block font-body-xs text-body-xs text-on-surface-variant font-normal">
                                    {product.sku
                                      .replace(/NRT-/, "NRT-" + talle.replace(/[^0-9]/g, "") + "-")
                                      .replace(/NRT-NRT-/, "NRT-")}
                                  </span>
                                </td>
                                {product.colors.map((c) => (
                                  <td key={c.name} className="py-3 px-4">
                                    <StockCell
                                      value={rowData[c.name] ?? 0}
                                      onChange={(v) => updateStock(product.id, talle, c.name, v)}
                                    />
                                  </td>
                                ))}
                                <td className="py-3 px-4 text-center font-label-sm text-label-sm font-bold text-on-surface">
                                  {rowTotal}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <button
                                    type="button"
                                    className="text-on-surface-variant hover:text-primary transition-colors"
                                    title="Más opciones"
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
                    <div className="pt-space-sm flex flex-col sm:flex-row items-center justify-between gap-space-md">
                      <div className="flex items-center gap-2 text-on-surface-variant font-body-xs text-body-xs">
                        <span className="material-symbols-outlined text-[16px] text-secondary">
                          sync
                        </span>
                        <span>Última sincronización con Taller Jorge Juan: Hace 14 minutos</span>
                      </div>
                      <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          className="px-space-md py-2 bg-surface-container text-on-surface hover:bg-surface-variant font-label-xs text-label-xs uppercase tracking-wider"
                        >
                          Descartar Cambios
                        </button>
                        <button
                          type="button"
                          onClick={() => saveMatrix(product.id)}
                          className="px-space-lg py-2 bg-primary text-on-primary font-headline-xs text-headline-xs uppercase tracking-wider flex items-center gap-1 shadow-sm transition-colors hover:opacity-90"
                        >
                          <span className="material-symbols-outlined text-[16px]">check</span>
                          <span>Actualizar Stock de Prenda</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* ── Right: Last Movements ── */}
        <div className="2xl:col-span-4 space-y-space-lg">
          <div className="p-space-lg bg-surface-container-low shadow-sm space-y-space-md">
            <div className="flex items-center justify-between pb-space-xs border-b border-surface-container-high">
              <h4 className="font-headline text-xl tracking-wide text-on-surface uppercase">
                ÚLTIMOS MOVIMIENTOS
              </h4>
              <a
                href="#"
                className="font-label-xs text-label-xs text-primary font-semibold uppercase tracking-wider hover:underline"
              >
                Ver Historial
              </a>
            </div>
            <div className="space-y-space-sm">
              {MOVEMENTS.map((mov) => {
                const dotColor =
                  mov.type === "in"
                    ? "bg-secondary"
                    : mov.type === "out"
                      ? "bg-primary"
                      : "bg-error";
                const deltaColor =
                  mov.type === "in"
                    ? "text-secondary"
                    : mov.type === "out"
                      ? "text-primary"
                      : "text-error";
                return (
                  <div
                    key={mov.id}
                    className="bg-surface-container-lowest shadow-sm flex items-start gap-space-sm p-3"
                  >
                    <div className={`w-2 h-2 rounded-full ${dotColor} mt-1.5 shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-label-sm text-label-sm font-semibold text-on-surface truncate">
                          {mov.product}
                        </span>
                        <span className={`font-label-xs text-label-xs font-bold ${deltaColor}`}>
                          {mov.delta > 0 ? `+${mov.delta}` : mov.delta} uds
                        </span>
                      </div>
                      <p className="font-body-xs text-body-xs text-on-surface-variant">
                        {mov.detail}
                      </p>
                      <span className="font-label-xs text-label-xs text-outline font-mono">
                        {mov.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Resumen Rápido ── */}
          <div className="p-space-lg bg-surface-container-low shadow-sm space-y-space-md">
            <div className="flex items-center justify-between pb-space-xs border-b border-surface-container-high">
              <h4 className="font-headline text-xl tracking-wide text-on-surface uppercase">
                RESUMEN DE TALLER
              </h4>
            </div>
            <div className="space-y-3">
              {[
                { label: "Lotes en producción", value: "3", icon: "manufacturing" },
                { label: "Prendas en confección", value: "86 uds", icon: "content_cut" },
                { label: "Tiempo medio entrega", value: "8 días", icon: "schedule" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                    <span className="font-body-xs text-body-xs uppercase tracking-wider">
                      {item.label}
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm font-bold text-on-surface">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
