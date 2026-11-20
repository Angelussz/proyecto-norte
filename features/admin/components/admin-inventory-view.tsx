"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { AdminAddInventoryColorModal } from "./admin-add-inventory-color-modal";
import { AdminAddInventorySizeModal } from "./admin-add-inventory-size-modal";
import { useSizeGroups } from "@/features/admin/hooks/useSizeGroups";
import { buildSizeOrderMap, sortSizesBySystem } from "@/lib/sort-sizes";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ColorVariant {
  name: string;
  hex: string;
}

interface StockMatrix {
  [talle: string]: { [color: string]: number | null | undefined };
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

export const INITIAL_PRODUCTS: ProductCard[] = [
  {
    id: "p1",
    sku: "NRT-CAM0001",
    category: "SOBRECAMISAS",
    name: "Sobrecamisa Lino Rústico Arena",
    pvp: "$165.00",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Arena Natural", hex: "#E4D5B7" },
      { name: "Verde Oliva", hex: "#4F583D" },
      { name: "Terracota", hex: "#9E472A" },
    ],
    stock: {
      S: { "Arena Natural": 8, "Verde Oliva": 4, Terracota: 0 },
      M: { "Arena Natural": 10, "Verde Oliva": 5, Terracota: 3 },
      L: { "Arena Natural": 3, "Verde Oliva": 5, Terracota: 1 },
      XL: { "Arena Natural": 2, "Verde Oliva": 1, Terracota: 1 },
    },
    totalStock: 42,
    stockLevel: "healthy",
    expanded: true,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCfieGQB4Efr4bdZTlNGrS1HU9H8T3levaOx4Cy8WmMqna1XPL0DGhR5AGWZRkMm2-gNiyKir8Y5xZLyw4l5i0VC8qL8IYmCdi57qLKjcYEykLcG9BSIjQmoRSFnx6sauTr9Hzvq-gUvoug1BVMW1oErR8zkgk8jyL-W3IJRrV2awr3Z-IClgYvfUc1acL4dsRQm2_wfqGrpnpZL0OE8AGucOwxmEZmiJ7bOVutuejz2EZhVCDiBKES",
  },
  {
    id: "p2",
    sku: "NRT-PAN0002",
    category: "PANTALONES",
    name: "Pantalón Traje Sastre Arena",
    pvp: "$145.00",
    sizes: ["38", "40", "42", "44"],
    colors: [
      { name: "Arena Natural", hex: "#E4D5B7" },
      { name: "Negro Carbón", hex: "#1A1A1A" },
    ],
    stock: {
      "38": { "Arena Natural": 2, "Negro Carbón": 1 },
      "40": { "Arena Natural": 4, "Negro Carbón": 2 },
      "42": { "Arena Natural": 3, "Negro Carbón": 1 },
      "44": { "Arena Natural": 1, "Negro Carbón": 0 },
    },
    totalStock: 14,
    stockLevel: "low",
    expanded: false,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCuU0KpkkioZ-hEgpbcaLOriWoaacJuUJFRg58ygY70_6AYnVRq9vy3f1sf6B7HaA0Y0NmIDakZ36dCfydZXkN4Mn7I8wwCA-yBaaY5z7YBOdTnfFoOLSMm1JtsrvDie1VsUq4T9bfGwlrTjPj_P2j9pydrKj13mAUkqVjAcyvuskdxel5pVJTIIUZwoPTbCepjtyywt6ylVHT99jUbh3NiH4DBiQAxqxdCt211Sgzh_UqlegZXCNyl",
  },
  {
    id: "p3",
    sku: "ALB-CAL0003",
    category: "CALZADO",
    name: "Zapatillas Esenciales Blancas",
    pvp: "$120.00",
    sizes: ["40", "41", "42", "43", "44", "45"],
    colors: [
      { name: "Blanco Puro", hex: "#FDFBF7" },
      { name: "Negro Carbón", hex: "#1A1A1A" },
    ],
    stock: {
      "40": { "Blanco Puro": 6, "Negro Carbón": 4 },
      "41": { "Blanco Puro": 8, "Negro Carbón": 5 },
      "42": { "Blanco Puro": 12, "Negro Carbón": 7 },
      "43": { "Blanco Puro": 10, "Negro Carbón": 6 },
      "44": { "Blanco Puro": 5, "Negro Carbón": 3 },
      "45": { "Blanco Puro": 3, "Negro Carbón": 1 },
    },
    totalStock: 70,
    stockLevel: "healthy",
    expanded: false,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBZeBmio3o_7iHY68IFRh4YJkpJ6dehe1HbVT_rqug0UVScWoWjenj8I8S9nHmOt1Ye9-u1JDG5K1g5T-JUO1LvSgrotmyhDvkBLkCDOp5-475u-AdHGM57j7OKeDA3Q1yAM1EZfeF4a3z-_zr08XOzVewwPGkOaKob_Cn4u4E_sl5uGvkUCqYdZKaajixnTtxcRakQQ_PaWut2qXiyhoKeMrKvaNdqt0WNZjv9vLUyp-YspDXNRp2W",
  },
  {
    id: "p4",
    sku: "ALB-CAM0004",
    category: "CAMISAS",
    name: "Camisa Lino Cuello Mao",
    pvp: "$135.00",
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Blanco Puro", hex: "#FDFBF7" },
      { name: "Azul Marino", hex: "#1E2A38" },
      { name: "Verde Oliva", hex: "#4F583D" },
      { name: "Arena Natural", hex: "#E4D5B7" },
    ],
    stock: {
      S: { "Blanco Puro": 5, "Azul Marino": 4, "Verde Oliva": 3, "Arena Natural": 2 },
      M: { "Blanco Puro": 7, "Azul Marino": 5, "Verde Oliva": 4, "Arena Natural": 3 },
      L: { "Blanco Puro": 4, "Azul Marino": 3, "Verde Oliva": 2, "Arena Natural": 1 },
    },
    totalStock: 43,
    stockLevel: "healthy",
    expanded: false,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCe8G22N74E_A_vF_DFLb4Pr4WDTtE7F2om8PrfNlWfz5WiX_o5_V6-jurTcLfOXDu_a67jizLGLsqEHAuGkoesszXs4Sc6wdjeHVvSK22IxmA8MJmcoOdR2AVRX1DK1mJDs5V4THnUWKod-MbakZTLqlArzILiTpFKYiISLsFDiiFEsK6n7oUs9eewAVSFrc0ealoxTmYyl1hkLZUshqLAgDcnq8nVfQbspdsTS0rGnSVimYSVlQQs",
  },
  {
    id: "p5",
    sku: "CJJ-SUE0005",
    category: "SUÉTERES",
    name: "Suéter Punto Grueso Merino",
    pvp: "$195.00",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Cacao Tostado", hex: "#5C4033" },
      { name: "Gris Mineral", hex: "#7E7F83" },
      { name: "Arena Natural", hex: "#E4D5B7" },
    ],
    stock: {
      S: { "Cacao Tostado": 1, "Gris Mineral": 0, "Arena Natural": 0 },
      M: { "Cacao Tostado": 2, "Gris Mineral": 1, "Arena Natural": 1 },
      L: { "Cacao Tostado": 1, "Gris Mineral": 0, "Arena Natural": 0 },
      XL: { "Cacao Tostado": 0, "Gris Mineral": 0, "Arena Natural": 0 },
    },
    totalStock: 6,
    stockLevel: "low",
    expanded: false,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBd-YsR-XNfNdYYiIB9pddWYzQC4GRRh3DinlyIPQEjXj4Qo5lD3hjDLANrRM_0GaTR_NjueqE0fduw4-W_Po0s9oVjba9rP0-abr2-VthEqyRv2aeSKUAIrZCp1k_79XQITX-fp8ukMAj9bowci6xAx3A4srU1PDwAPDITKOtfKJazc7Bx5Lh18jBtmts8nffQhSbfPXfBs24Ur0AeKvf--Wdr4PZFFYJXKI5OO9eyFxRJ46_9hMHh",
  },
  {
    id: "p6",
    sku: "CJJ-CHA0006",
    category: "CHAQUETAS",
    name: "Chaqueta Oversize Espiga",
    pvp: "$230.00",
    sizes: ["M", "L"],
    colors: [
      { name: "Gris Mineral", hex: "#7E7F83" },
      { name: "Negro Carbón", hex: "#1A1A1A" },
    ],
    stock: {
      M: { "Gris Mineral": 0, "Negro Carbón": 0 },
      L: { "Gris Mineral": 0, "Negro Carbón": 0 },
    },
    totalStock: 0,
    stockLevel: "critical",
    expanded: false,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBMn1DJnKYB5FMQoR7oSs53BpdsFlVDrZSBSzM6Gc9KnBY9Hf8iwcsi8nHXY7BJAG_xlyStcYz6qyhpeqo5yCHvmmyGv_wGsXpEKCfB0IrbKzGufd9raZGSL07Bz8boWB3FwFxLkaUrFROOd4NrA_07soH9StsyQizJ8_WN5jS_SpJ5nYLei3dqXGArKy3btgyKderS1R8Ebnuoas11Ss1iB0AKKJzD3bDUebP5bfC90vYRXKmCcR24",
  },
  {
    id: "p7",
    sku: "TMD-BER0007",
    category: "BERMUDAS",
    name: "Bermuda Lino Plisada",
    pvp: "$98.00",
    sizes: ["38", "40", "42", "44", "46"],
    colors: [
      { name: "Terracota", hex: "#9E472A" },
      { name: "Verde Oliva", hex: "#4F583D" },
      { name: "Arena Natural", hex: "#E4D5B7" },
      { name: "Azul Marino", hex: "#1E2A38" },
      { name: "Blanco Puro", hex: "#FDFBF7" },
    ],
    stock: {
      "38": {
        Terracota: 3,
        "Verde Oliva": 4,
        "Arena Natural": 5,
        "Azul Marino": 2,
        "Blanco Puro": 3,
      },
      "40": {
        Terracota: 6,
        "Verde Oliva": 5,
        "Arena Natural": 8,
        "Azul Marino": 4,
        "Blanco Puro": 5,
      },
      "42": {
        Terracota: 4,
        "Verde Oliva": 3,
        "Arena Natural": 6,
        "Azul Marino": 3,
        "Blanco Puro": 4,
      },
      "44": {
        Terracota: 2,
        "Verde Oliva": 2,
        "Arena Natural": 3,
        "Azul Marino": 1,
        "Blanco Puro": 2,
      },
      "46": {
        Terracota: 1,
        "Verde Oliva": 1,
        "Arena Natural": 2,
        "Azul Marino": 0,
        "Blanco Puro": 1,
      },
    },
    totalStock: 75,
    stockLevel: "healthy",
    expanded: false,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB7PzReJ2qcvlMj8hQMGCxwKDhPVVgSu9EJ6JfuycbYYJ4X1AoAy6X5n6M3Nc5vrh7LVk_BLkvidPtryUopotyrDCV-MzrBfqA6Fcbq0G94S0mgTVtkzfEy6Di3-sZI3YnV7ClVFuQ9rCXB-KP2sduxQqtEQ90jhiFgEh2UPSBIU5dzuEz9rzYStMvl-fvY0sUVskrUXSF8rhFUWMVYdBMsfYSwh5aOJdXOo3fzFWJx8-38d9ypcDBc",
  },
  {
    id: "p8",
    sku: "TMD-ACC0008",
    category: "ACCESORIOS",
    name: "Gorra Algodón Orgánico Lavado",
    pvp: "$45.00",
    sizes: ["Talle Único"],
    colors: [
      { name: "Ocre Tierra", hex: "#C68B45" },
      { name: "Verde Oliva", hex: "#4F583D" },
      { name: "Negro Carbón", hex: "#1A1A1A" },
    ],
    stock: {
      "Talle Único": { "Ocre Tierra": 12, "Verde Oliva": 15, "Negro Carbón": 8 },
    },
    totalStock: 35,
    stockLevel: "healthy",
    expanded: false,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDWdSprNGTgxBlN1l9XC3OYy2Oh9D7yMcVUDeG7098zFWsDT3HpL2B92bDQuAR6zwyXjt6uehYRC3mOqaYa9tm-gwm52bUyUhBunu7Jv3yL1MEMgCao2LskNiehlHjnxJ5kYSLOKg23F5F-G_azHETjahQZybCEz2y-14GEJY_w7yGO3KhJ6t1zyuxXnyaeOiilK2ALXNmKq4q20ze7q4J2eBVvwTrEyBWf74wAWzfkZidYNSWIFGPp",
  },
  {
    id: "p9",
    sku: "ALB-CAM0009",
    category: "CAMISAS",
    name: "Remera Manga Larga Ribbed",
    pvp: "$78.00",
    sizes: ["S", "M", "L"],
    colors: [{ name: "Arena Natural", hex: "#E4D5B7" }],
    stock: {
      S: { "Arena Natural": 1 },
      M: { "Arena Natural": 2 },
      L: { "Arena Natural": 0 },
    },
    totalStock: 3,
    stockLevel: "critical",
    expanded: false,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCfieGQB4Efr4bdZTlNGrS1HU9H8T3levaOx4Cy8WmMqna1XPL0DGhR5AGWZRkMm2-gNiyKir8Y5xZLyw4l5i0VC8qL8IYmCdi57qLKjcYEykLcG9BSIjQmoRSFnx6sauTr9Hzvq-gUvoug1BVMW1oErR8zkgk8jyL-W3IJRrV2awr3Z-IClgYvfUc1acL4dsRQm2_wfqGrpnpZL0OE8AGucOwxmEZmiJ7bOVutuejz2EZhVCDiBKES",
  },
  {
    id: "p10",
    sku: "TMD-CAL0010",
    category: "CALZADO",
    name: "Botines Chelsea Cuero Nobuk",
    pvp: "$210.00",
    sizes: ["41", "42", "43", "44"],
    colors: [
      { name: "Cacao Tostado", hex: "#5C4033" },
      { name: "Negro Carbón", hex: "#1A1A1A" },
    ],
    stock: {
      "41": { "Cacao Tostado": 3, "Negro Carbón": 2 },
      "42": { "Cacao Tostado": 4, "Negro Carbón": 3 },
      "43": { "Cacao Tostado": 2, "Negro Carbón": 1 },
      "44": { "Cacao Tostado": 1, "Negro Carbón": 0 },
    },
    totalStock: 16,
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
    detail: "Talle M • Arena Natural: 10 uds",
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
  return Object.values(stock).reduce<number>((sum, row) => {
    if (!row) return sum;
    return (
      sum + Object.values(row).reduce<number>((s, v) => s + (typeof v === "number" ? v : 0), 0)
    );
  }, 0);
}

function getSizeSku(productSku: string, talle: string): string {
  const cleanSize =
    talle
      .toUpperCase()
      .replace(/^TALLA\s*/i, "")
      .trim() || "U";
  const parts = productSku.split("-");
  if (parts.length >= 2) {
    const brand = parts[0];
    const catCodeNum = parts[1];
    return `${brand}-${catCodeNum}-***-${cleanSize}`;
  }
  return `${productSku}-***-${cleanSize}`;
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

const LS_KEY = "norte-inventory-v3";

function formatPvpToUsd(pvp?: string): string | undefined {
  if (!pvp) return undefined;
  if (pvp.includes("€")) {
    const cleaned = pvp.replace("€", "").trim();
    const normalized = cleaned.replace(",", ".");
    const num = parseFloat(normalized);
    if (!isNaN(num)) {
      return `$${num.toFixed(2)}`;
    }
    return `$${cleaned}`;
  }
  if (!pvp.startsWith("$")) {
    return `$${pvp}`;
  }
  return pvp;
}

function loadFromLS(): ProductCard[] | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ProductCard[];
      return parsed.map((p) => ({
        ...p,
        pvp: formatPvpToUsd(p.pvp),
      }));
    }
  } catch {}
  return null;
}

function persistProducts(updated: ProductCard[]) {
  try {
    const sanitized = updated.map((p) => ({
      ...p,
      pvp: formatPvpToUsd(p.pvp),
    }));
    localStorage.setItem(LS_KEY, JSON.stringify(sanitized));
  } catch (e) {
    console.warn("[Inventario] No se pudo guardar en localStorage:", e);
  }
}

export function getInventoryProductById(id: string): ProductCard | undefined {
  if (!id) return undefined;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const list = JSON.parse(raw) as ProductCard[];
        const found = list.find((p) => p.id === id || p.sku.toLowerCase() === id.toLowerCase());
        if (found) return found;
      }
    } catch {}
  }
  return INITIAL_PRODUCTS.find((p) => p.id === id || p.sku.toLowerCase() === id.toLowerCase());
}

export function AdminInventoryView() {
  const [products, setProducts] = useState<ProductCard[]>(() => loadFromLS() ?? INITIAL_PRODUCTS);
  // Snapshot completo del producto guardado (sizes + colors + stock).
  // Solo se actualiza al presionar "Actualizar Stock". Permite Descartar TODO.
  const [savedSnapshots, setSavedSnapshots] = useState<
    Record<string, Pick<ProductCard, "sizes" | "colors" | "stock">>
  >(() => {
    const base = loadFromLS() ?? INITIAL_PRODUCTS;
    return Object.fromEntries(
      base.map((p) => [
        p.id,
        structuredClone({ sizes: p.sizes, colors: p.colors, stock: p.stock }),
      ]),
    );
  });
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeColorGroups, setActiveColorGroups] = useState<Record<string, number>>({});
  const [dismissedAlerts, setDismissedAlerts] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [colorModalProduct, setColorModalProduct] = useState<ProductCard | null>(null);
  const [sizeModalProduct, setSizeModalProduct] = useState<ProductCard | null>(null);
  const [productToDelete, setProductToDelete] = useState<ProductCard | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Orden canónico de talles desde la DB (misma fuente que el modal de talles)
  const { data: sizeGroupsData } = useSizeGroups();
  const sizeOrderMap = useMemo(() => buildSizeOrderMap(sizeGroupsData ?? []), [sizeGroupsData]);

  // Cuando llega el mapa canónico de la DB, re-ordena talles y colores de todos
  // los productos cargados (desde localStorage o INITIAL_PRODUCTS).
  // Solo se ejecuta una vez: cuando sizeOrderMap pasa de vacío a tener datos.
  const sortAppliedRef = useRef(false);
  useEffect(() => {
    if (sizeOrderMap.size === 0) return; // todavía no llegaron los datos
    if (sortAppliedRef.current) return; // ya se aplicó en esta sesión
    sortAppliedRef.current = true;

    setProducts((prev) => {
      const sorted = prev.map((p) => {
        const orderedSizes = sortSizesBySystem(p.sizes, sizeOrderMap);
        const sortedColors = [...p.colors].sort((a, b) =>
          a.name.localeCompare(b.name, "es", { sensitivity: "base" }),
        );
        // Reconstruir stock con el nuevo orden de filas (talles)
        const reorderedStock: StockMatrix = {};
        orderedSizes.forEach((talle) => {
          reorderedStock[talle] = { ...p.stock[talle] };
        });
        return { ...p, sizes: orderedSizes, colors: sortedColors, stock: reorderedStock };
      });
      // Sincronizar snapshots con el orden correcto (para que Descartar
      // también restaure al orden ordenado, no al desordenado original).
      setSavedSnapshots(
        Object.fromEntries(
          sorted.map((p) => [
            p.id,
            structuredClone({ sizes: p.sizes, colors: p.colors, stock: p.stock }),
          ]),
        ),
      );
      return sorted;
    });
  }, [sizeOrderMap]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    if (openMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  // Resetear paginación al cambiar cualquier filtro o término de búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterCat, filterStatus, filterBrand, filterGender]);

  function handleDeleteProduct(productId: string) {
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    setProductToDelete(p);
    setOpenMenuId(null);
  }

  function handleConfirmDeleteProduct() {
    if (!productToDelete) return;
    const p = productToDelete;
    const updated = products.filter((x) => x.id !== p.id);
    setProducts(updated);
    persistProducts(updated);
    setProductToDelete(null);
    setToast(`"${p.name}" eliminado del inventario.`);
    setTimeout(() => setToast(null), 3000);
  }

  function handleSaveSizes(productId: string, newSizes: string[]) {
    const current = products.find((p) => p.id === productId);
    if (!current) return;

    // Ordenar talles según el sistema canónico de la DB (segunda línea de defensa
    // por si el modal ya los entregó ordenados, o por si vienen de otra fuente).
    const orderedSizes = sortSizesBySystem(newSizes, sizeOrderMap);

    // Reconstruir la matriz preservando stock existente para talles que ya había
    const updatedStock: StockMatrix = {};
    orderedSizes.forEach((talle) => {
      const currentTalleStock = current.stock[talle] ?? {};
      updatedStock[talle] = {};
      current.colors.forEach((c) => {
        const prevVal = currentTalleStock[c.name];
        updatedStock[talle][c.name] = prevVal !== undefined ? prevVal : 0;
      });
    });

    const newTotalStock = calcTotal(updatedStock);
    const newLevel: "healthy" | "low" | "critical" =
      newTotalStock === 0 ? "critical" : newTotalStock < 15 ? "low" : "healthy";

    // Solo actualiza la vista — NO persiste ni actualiza el snapshot.
    // Los cambios quedan pendientes hasta "Actualizar Stock".
    setProducts((prev) =>
      prev.map((p) =>
        p.id !== productId
          ? p
          : {
              ...p,
              sizes: orderedSizes,
              stock: updatedStock,
              totalStock: newTotalStock,
              stockLevel: newLevel,
            },
      ),
    );

    setToast(`Talles actualizados. Presioná "Actualizar Stock" para guardar.`);
    setTimeout(() => setToast(null), 3500);
  }

  function handleSaveColors(productId: string, newColors: ColorVariant[]) {
    const current = products.find((p) => p.id === productId);
    if (!current) return;

    // Ordenar colores alfabéticamente por nombre
    const sortedColors = [...newColors].sort((a, b) =>
      a.name.localeCompare(b.name, "es", { sensitivity: "base" }),
    );

    // Reconstruir la matriz preservando stock existente para colores que ya había
    const updatedStock: StockMatrix = {};
    current.sizes.forEach((talle) => {
      const currentTalleStock = current.stock[talle] ?? {};
      updatedStock[talle] = {};
      sortedColors.forEach((c) => {
        const prevVal = currentTalleStock[c.name];
        updatedStock[talle][c.name] = prevVal !== undefined ? prevVal : 0;
      });
    });

    const newTotalStock = calcTotal(updatedStock);
    const newLevel: "healthy" | "low" | "critical" =
      newTotalStock === 0 ? "critical" : newTotalStock < 15 ? "low" : "healthy";

    // Solo actualiza la vista — NO persiste ni actualiza el snapshot.
    // Los cambios quedan pendientes hasta "Actualizar Stock".
    setProducts((prev) =>
      prev.map((p) =>
        p.id !== productId
          ? p
          : {
              ...p,
              colors: sortedColors,
              stock: updatedStock,
              totalStock: newTotalStock,
              stockLevel: newLevel,
            },
      ),
    );

    setToast(`Colores actualizados. Presioná "Actualizar Stock" para guardar.`);
    setTimeout(() => setToast(null), 3500);
  }

  function handleColorGroupSelect(productId: string, group: number) {
    setActiveColorGroups((prev) => ({ ...prev, [productId]: group }));
    setDismissedAlerts((prev) => ({ ...prev, [`${productId}-${group}`]: true }));
  }

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
    const current = products.find((x) => x.id === productId);
    if (!current) return;

    const newTotal = calcTotal(current.stock);
    const newLevel: "healthy" | "low" | "critical" =
      newTotal === 0 ? "critical" : newTotal < 15 ? "low" : "healthy";

    const updatedProducts = products.map((p) =>
      p.id !== productId ? p : { ...p, totalStock: newTotal, stockLevel: newLevel },
    );

    // Guardar snapshot completo: sizes + colors + stock
    setSavedSnapshots((prev) => ({
      ...prev,
      [productId]: structuredClone({
        sizes: current.sizes,
        colors: current.colors,
        stock: current.stock,
      }),
    }));
    setProducts(updatedProducts);
    persistProducts(updatedProducts);

    setToast(`Stock de "${current.name}" guardado correctamente.`);
    setTimeout(() => setToast(null), 3000);
  }

  function discardMatrix(productId: string) {
    const snap = savedSnapshots[productId];
    if (!snap) return;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const restoredStock = structuredClone(snap.stock);
        const restoredTotal = calcTotal(restoredStock);
        const restoredLevel: "healthy" | "low" | "critical" =
          restoredTotal === 0 ? "critical" : restoredTotal < 15 ? "low" : "healthy";
        return {
          ...p,
          sizes: structuredClone(snap.sizes),
          colors: structuredClone(snap.colors),
          stock: restoredStock,
          totalStock: restoredTotal,
          stockLevel: restoredLevel,
        };
      }),
    );
    const p = products.find((x) => x.id === productId);
    setToast(`Cambios en "${p?.name}" descartados.`);
    setTimeout(() => setToast(null), 3000);
  }

  // Detecta si hay cambios pendientes vs. el último snapshot guardado.
  // Compara sizes, colors Y stock — así agregar un talle/color también activa el indicador.
  function hasUnsavedChanges(productId: string): boolean {
    const current = products.find((x) => x.id === productId);
    const snap = savedSnapshots[productId];
    if (!current || !snap) return false;
    return (
      JSON.stringify(current.sizes) !== JSON.stringify(snap.sizes) ||
      JSON.stringify(current.colors) !== JSON.stringify(snap.colors) ||
      JSON.stringify(current.stock) !== JSON.stringify(snap.stock)
    );
  }

  const filteredProducts = products.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      const matches = p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      if (!matches) return false;
    }
    if (filterCat && p.category.toLowerCase() !== filterCat.toLowerCase()) {
      return false;
    }
    if (filterStatus && p.stockLevel !== filterStatus) {
      return false;
    }
    if (filterBrand) {
      const brandMap: Record<string, string> = {
        "NORTE Atelier": "NRT",
        "Alba Studio": "ALB",
        "Cápsula Jorge Juan": "CJJ",
        "Taller Madrid": "TMD",
      };
      const prefix = brandMap[filterBrand];
      if (prefix && !p.sku.toUpperCase().startsWith(prefix)) {
        return false;
      }
    }
    return true;
  });

  const ITEMS_PER_PAGE = 4;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProducts = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, safeCurrentPage]);

  const totalPhysicalUnits = products.reduce((acc, p) => acc + p.totalStock, 0);
  const healthyCount = products.filter((p) => p.stockLevel === "healthy").length;
  const lowCount = products.filter((p) => p.stockLevel === "low").length;
  const criticalCount = products.filter((p) => p.stockLevel === "critical").length;
  const availableCategories = Array.from(new Set(products.map((p) => p.category)));

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
            <Link
              href="/admin/productos/nuevo"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-headline text-[16px] uppercase tracking-wider transition-colors shadow-sm hover:bg-primary-container"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              AGREGAR PRODUCTO
            </Link>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* KPI 1 */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setFilterStatus("")}
            onKeyDown={(e) => e.key === "Enter" && setFilterStatus("")}
            className="bg-surface-container-low p-6 flex flex-col justify-between relative overflow-hidden border border-outline-variant/30 shadow-sm cursor-pointer hover:border-outline-variant/60 transition-colors select-none"
          >
            <div className="flex items-start justify-between relative z-10">
              <span className="font-inter text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">
                Total Unidades Físicas
              </span>
              <span className="material-symbols-outlined text-primary text-[20px]">inventory</span>
            </div>
            <div className="mt-4 relative z-10">
              <span className="font-headline text-[42px] text-on-surface tracking-wide block leading-none">
                {totalPhysicalUnits.toLocaleString("es-ES")}
              </span>
              <span className="font-inter text-[11px] text-secondary font-bold uppercase tracking-wider block mt-1">
                {products.length} prendas registradas
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
          <div
            role="button"
            tabIndex={0}
            onClick={() => setFilterStatus("healthy")}
            onKeyDown={(e) => e.key === "Enter" && setFilterStatus("healthy")}
            className="bg-surface-container-low p-6 flex flex-col justify-between relative overflow-hidden border border-outline-variant/30 shadow-sm cursor-pointer hover:border-outline-variant/60 transition-colors select-none"
          >
            <div className="flex items-start justify-between relative z-10">
              <span className="font-inter text-[10px] text-secondary uppercase tracking-widest font-semibold">
                Stock Saludable
              </span>
              <span className="material-symbols-outlined text-secondary text-[20px]">verified</span>
            </div>
            <div className="mt-4 relative z-10">
              <span className="font-headline text-[42px] text-secondary tracking-wide block leading-none">
                {String(healthyCount).padStart(2, "0")}
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
          <div
            role="button"
            tabIndex={0}
            onClick={() => setFilterStatus("low")}
            onKeyDown={(e) => e.key === "Enter" && setFilterStatus("low")}
            className="bg-surface-container-low p-6 flex flex-col justify-between relative overflow-hidden border border-outline-variant/30 shadow-sm cursor-pointer hover:border-outline-variant/60 transition-colors select-none"
          >
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
                {String(lowCount).padStart(2, "0")}
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
          <div
            role="button"
            tabIndex={0}
            onClick={() => setFilterStatus("critical")}
            onKeyDown={(e) => e.key === "Enter" && setFilterStatus("critical")}
            className="bg-surface-container-low p-6 flex flex-col justify-between relative overflow-hidden border border-outline-variant/30 shadow-sm cursor-pointer hover:border-outline-variant/60 transition-colors select-none"
          >
            <div className="flex items-start justify-between relative z-10">
              <span className="font-inter text-[10px] text-error uppercase tracking-widest font-semibold">
                Rotura de Stock
              </span>
              <span className="material-symbols-outlined text-error text-[20px]">block</span>
            </div>
            <div className="mt-4 relative z-10">
              <span className="font-headline text-[42px] text-error tracking-wide block leading-none">
                {String(criticalCount).padStart(2, "0")}
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
          <div className="bg-surface-container-low p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 w-full">
              {/* Búsqueda */}
              <div className="relative sm:col-span-2 lg:col-span-1 w-full">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Buscar por nombre, SKU"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white text-on-surface placeholder:text-outline/70 font-inter text-[13px] outline-none shadow-sm focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Selector Categoría */}
              <div className="relative w-full">
                <select
                  value={filterCat}
                  onChange={(e) => setFilterCat(e.target.value)}
                  className="appearance-none bg-white text-on-surface font-inter text-[13px] pl-3 pr-8 py-2 outline-none shadow-sm cursor-pointer w-full"
                >
                  <option value="">Categoría: Todas</option>
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0) + cat.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
                  keyboard_arrow_down
                </span>
              </div>

              {/* Selector Estado */}
              <div className="relative w-full">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="appearance-none bg-white text-on-surface font-inter text-[13px] pl-3 pr-8 py-2 outline-none shadow-sm cursor-pointer w-full"
                >
                  <option value="">Estado: Todos</option>
                  <option value="healthy">Stock Saludable</option>
                  <option value="low">Bajo Stock / Reposición</option>
                  <option value="critical">Rotura de Stock</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
                  keyboard_arrow_down
                </span>
              </div>

              {/* Selector Marca */}
              <div className="relative w-full">
                <select
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                  className="appearance-none bg-white text-on-surface font-inter text-[13px] pl-3 pr-8 py-2 outline-none shadow-sm cursor-pointer w-full"
                >
                  <option value="">Marca: Todas</option>
                  <option>NORTE Atelier</option>
                  <option>Alba Studio</option>
                  <option>Cápsula Jorge Juan</option>
                  <option>Taller Madrid</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
                  keyboard_arrow_down
                </span>
              </div>

              {/* Selector Sexo */}
              <div className="relative w-full">
                <select
                  value={filterGender}
                  onChange={(e) => setFilterGender(e.target.value)}
                  className="appearance-none bg-white text-on-surface font-inter text-[13px] pl-3 pr-8 py-2 outline-none shadow-sm cursor-pointer w-full"
                >
                  <option value="">Sexo: Todos</option>
                  <option>Unisex</option>
                  <option>Hombre</option>
                  <option>Mujer</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
                  keyboard_arrow_down
                </span>
              </div>
            </div>
          </div>
          {/* Limpiar filtros */}
          <div className="flex items-center justify-end px-1 pt-1">
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilterCat("");
                setFilterStatus("");
                setFilterBrand("");
                setFilterGender("");
              }}
              className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors font-inter text-[11px] uppercase tracking-wider font-semibold"
            >
              <span className="material-symbols-outlined text-[15px]">filter_alt_off</span>
              <span>LIMPIAR FILTROS</span>
            </button>
          </div>
        </div>

        {/* ── Main Workspace: Product Matrix ── */}
        <div className="w-full flex flex-col gap-5">
          {/* Paginación */}
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
            <span className="font-inter text-[11px] uppercase tracking-wider text-on-surface-variant">
              Página {safeCurrentPage} de {totalPages} • {filteredProducts.length} prenda
              {filteredProducts.length !== 1 ? "s" : ""} registrada
              {filteredProducts.length !== 1 ? "s" : ""}
            </span>
            <nav
              className="flex items-center gap-1.5"
              aria-label="Paginación superior de inventario"
            >
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage <= 1}
                className={`px-2.5 py-1 font-inter text-[11px] border border-outline-variant/60 transition-colors ${
                  safeCurrentPage <= 1
                    ? "text-on-surface-variant/40 cursor-not-allowed bg-white"
                    : "text-on-surface hover:bg-surface-container bg-white cursor-pointer"
                }`}
                title="Página anterior"
              >
                ← Ant
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-2.5 py-1 font-inter text-[11px] transition-colors ${
                    pageNum === safeCurrentPage
                      ? "font-bold bg-primary text-white shadow-sm"
                      : "border border-outline-variant/60 text-on-surface hover:bg-surface-container bg-white cursor-pointer"
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage >= totalPages}
                className={`px-2.5 py-1 font-inter text-[11px] border border-outline-variant/60 transition-colors ${
                  safeCurrentPage >= totalPages
                    ? "text-on-surface-variant/40 cursor-not-allowed bg-white"
                    : "text-on-surface hover:bg-surface-container bg-white cursor-pointer"
                }`}
                title="Página siguiente"
              >
                Sig →
              </button>
            </nav>
          </div>

          {/* Product Cards */}
          {filteredProducts.length === 0 ? (
            <div className="bg-surface-container-low border border-outline-variant/30 p-12 text-center">
              <span className="font-inter text-[13px] text-on-surface-variant">
                No se encontraron prendas con los filtros aplicados.
              </span>
            </div>
          ) : (
            paginatedProducts.map((product) => (
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
                              PVP:{" "}
                              <strong className="text-on-surface">
                                {formatPvpToUsd(product.pvp)}
                              </strong>
                            </span>
                            <span>•</span>
                          </>
                        )}
                        <span>
                          Talles:{" "}
                          <strong className="text-on-surface">{product.sizes.join(", ")}</strong>
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
                    {/* Kebab menu */}
                    <div
                      className="relative self-start"
                      ref={openMenuId === product.id ? menuRef : null}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === product.id ? null : product.id);
                        }}
                        className="p-2 text-on-surface-variant hover:text-on-surface bg-white shadow-sm transition-colors cursor-pointer"
                        aria-label="Opciones del producto"
                      >
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                      {openMenuId === product.id && (
                        <div
                          className="absolute right-0 top-full mt-1 z-30 bg-white border border-outline-variant/40 shadow-lg min-w-[180px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link
                            href={`/admin/productos/editar/${product.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            className="flex items-center gap-2 px-4 py-2.5 font-inter text-[13px] text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                            Editar producto
                          </Link>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProduct(product.id);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 font-inter text-[13px] text-error hover:bg-error-container transition-colors cursor-pointer text-left"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
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
                              onClick={() => setSizeModalProduct(product)}
                              className="px-2.5 py-1 bg-surface-container hover:bg-surface-variant text-primary font-inter text-[11px] uppercase tracking-wider font-semibold transition-colors flex items-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-[18px] font-bold leading-none">
                                add
                              </span>
                              <span className="material-symbols-outlined text-[15px]">
                                straighten
                              </span>
                              <span>Talla</span>
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
                              onClick={() => setColorModalProduct(product)}
                              className="px-2.5 py-1 bg-surface-container hover:bg-surface-variant text-primary font-inter text-[11px] uppercase tracking-wider font-semibold transition-colors flex items-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-[18px] font-bold leading-none">
                                add
                              </span>
                              <span className="material-symbols-outlined text-[15px]">palette</span>
                              <span>Color</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Matrix Bar Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 pb-1">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[20px] text-primary">
                            apps
                          </span>
                          <h4 className="font-inter text-[12px] font-bold uppercase tracking-wider text-on-surface">
                            MATRIZ DE EXISTENCIAS POR TALLA Y COLOR
                          </h4>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-inter text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                            GRUPO COLORES:
                          </span>
                          <div className="flex items-center gap-1.5">
                            {/* Botón 1 */}
                            <button
                              type="button"
                              onClick={() => handleColorGroupSelect(product.id, 1)}
                              className={`w-7 h-7 flex items-center justify-center font-inter text-[12px] font-bold border transition-colors shadow-sm ${
                                (activeColorGroups[product.id] ?? 1) === 1
                                  ? "bg-[#eee8d9] text-on-surface border-outline-variant/80"
                                  : "bg-white text-on-surface-variant hover:bg-surface-container border-outline-variant/60"
                              }`}
                            >
                              1
                            </button>

                            {/* Botón 2 con alerta roja titilante (desaparece al hacer click) */}
                            <button
                              type="button"
                              onClick={() => handleColorGroupSelect(product.id, 2)}
                              className={`relative w-7 h-7 flex items-center justify-center font-inter text-[12px] font-bold border transition-colors shadow-sm ${
                                (activeColorGroups[product.id] ?? 1) === 2
                                  ? "bg-[#eee8d9] text-on-surface border-outline-variant/80"
                                  : "bg-white text-on-surface-variant hover:bg-surface-container border-outline-variant/60"
                              }`}
                            >
                              2{/* Titilante Rojo */}
                              {!dismissedAlerts[`${product.id}-2`] && (
                                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 pointer-events-none">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                                </span>
                              )}
                            </button>

                            {/* Botón 3 con alerta naranja / mostaza titilante (desaparece al hacer click) */}
                            <button
                              type="button"
                              onClick={() => handleColorGroupSelect(product.id, 3)}
                              className={`relative w-7 h-7 flex items-center justify-center font-inter text-[12px] font-bold border transition-colors shadow-sm ${
                                (activeColorGroups[product.id] ?? 1) === 3
                                  ? "bg-[#eee8d9] text-on-surface border-outline-variant/80"
                                  : "bg-white text-on-surface-variant hover:bg-surface-container border-outline-variant/60"
                              }`}
                            >
                              3{/* Titilante Ámbar / Mostaza */}
                              {!dismissedAlerts[`${product.id}-3`] && (
                                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 pointer-events-none">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#d97706]"></span>
                                </span>
                              )}
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
                                TALLA
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
                                    {c.name.toUpperCase()}
                                  </div>
                                </th>
                              ))}
                              <th className="py-3 px-4 font-inter text-[11px] uppercase tracking-wider font-bold text-center">
                                SUBTOTAL
                              </th>
                              <th className="py-3 px-4 font-inter text-[11px] uppercase tracking-wider font-bold text-center">
                                ACCIONES
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-surface-container">
                            {product.sizes.map((talle) => {
                              const rowData = product.stock[talle] ?? {};
                              const rowTotal = Object.values(rowData).reduce<number>(
                                (s, v) => s + (typeof v === "number" ? v : 0),
                                0,
                              );
                              return (
                                <tr
                                  key={talle}
                                  className="hover:bg-surface-container-low transition-colors"
                                >
                                  <td className="py-3 px-4">
                                    <div className="flex flex-col">
                                      <span className="font-inter text-[13px] font-bold text-on-surface">
                                        {talle}
                                      </span>
                                      <span className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase">
                                        {getSizeSku(product.sku, talle)}
                                      </span>
                                    </div>
                                  </td>
                                  {product.colors.map((c) => {
                                    const cellVal = rowData[c.name];
                                    return (
                                      <td key={c.name} className="py-3 px-4">
                                        {cellVal === null || cellVal === undefined ? (
                                          <span className="font-inter text-[12px] text-on-surface-variant/70 italic">
                                            No fabricado
                                          </span>
                                        ) : (
                                          <StockCell
                                            value={cellVal}
                                            onChange={(v) =>
                                              updateStock(product.id, talle, c.name, v)
                                            }
                                          />
                                        )}
                                      </td>
                                    );
                                  })}
                                  <td className="py-3 px-4 text-center font-inter text-[13px] font-bold text-on-surface">
                                    {rowTotal} uds
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                      <button
                                        type="button"
                                        title="Editar variante"
                                        className="p-1 text-on-surface-variant hover:text-primary transition-colors"
                                      >
                                        <span className="material-symbols-outlined text-[18px]">
                                          edit
                                        </span>
                                      </button>
                                      <button
                                        type="button"
                                        title="Eliminar fila"
                                        className="p-1 text-on-surface-variant hover:text-error transition-colors"
                                      >
                                        <span className="material-symbols-outlined text-[18px]">
                                          delete_outline
                                        </span>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Footer Actions */}
                      {(() => {
                        const dirty = hasUnsavedChanges(product.id);
                        return (
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-outline-variant/20">
                            <div className="flex items-center gap-2 font-inter text-[11px] text-on-surface-variant">
                              {dirty ? (
                                <>
                                  <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#d97706]" />
                                  </span>
                                  <span className="text-[#d97706] font-semibold">
                                    Cambios pendientes — no guardados
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="material-symbols-outlined text-[16px] text-secondary">
                                    check_circle
                                  </span>
                                  <span>Stock guardado</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                              <button
                                type="button"
                                disabled={!dirty}
                                onClick={() => discardMatrix(product.id)}
                                className="px-4 py-2 bg-surface-container text-on-surface hover:bg-surface-variant font-inter text-[11px] uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                Descartar Cambios
                              </button>
                              <button
                                type="button"
                                disabled={!dirty}
                                onClick={() => saveMatrix(product.id)}
                                className="px-5 py-2 bg-primary text-white font-headline text-[14px] uppercase tracking-wider flex items-center gap-1 shadow-sm transition-colors hover:bg-primary-container disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <span className="material-symbols-outlined text-[16px]">check</span>
                                Actualizar Stock
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}

          {/* Paginación Inferior */}
          {filteredProducts.length > 0 && (
            <div className="flex items-center justify-between pt-3 border-t border-outline-variant/30 mt-2">
              <span className="font-inter text-[11px] uppercase tracking-wider text-on-surface-variant">
                Mostrando {(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                {Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredProducts.length)} de{" "}
                {filteredProducts.length} prenda
                {filteredProducts.length !== 1 ? "s" : ""}
              </span>
              <nav
                className="flex items-center gap-1.5"
                aria-label="Paginación inferior de inventario"
              >
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 380, behavior: "smooth" });
                  }}
                  disabled={safeCurrentPage <= 1}
                  className={`px-2.5 py-1 font-inter text-[11px] border border-outline-variant/60 transition-colors ${
                    safeCurrentPage <= 1
                      ? "text-on-surface-variant/40 cursor-not-allowed bg-white"
                      : "text-on-surface hover:bg-surface-container bg-white cursor-pointer"
                  }`}
                  title="Página anterior"
                >
                  ← Ant
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => {
                      setCurrentPage(pageNum);
                      window.scrollTo({ top: 380, behavior: "smooth" });
                    }}
                    className={`px-2.5 py-1 font-inter text-[11px] transition-colors ${
                      pageNum === safeCurrentPage
                        ? "font-bold bg-primary text-white shadow-sm"
                        : "border border-outline-variant/60 text-on-surface hover:bg-surface-container bg-white cursor-pointer"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 380, behavior: "smooth" });
                  }}
                  disabled={safeCurrentPage >= totalPages}
                  className={`px-2.5 py-1 font-inter text-[11px] border border-outline-variant/60 transition-colors ${
                    safeCurrentPage >= totalPages
                      ? "text-on-surface-variant/40 cursor-not-allowed bg-white"
                      : "text-on-surface hover:bg-surface-container bg-white cursor-pointer"
                  }`}
                  title="Página siguiente"
                >
                  Sig →
                </button>
              </nav>
            </div>
          )}
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

      <AdminAddInventoryColorModal
        isOpen={Boolean(colorModalProduct)}
        onClose={() => setColorModalProduct(null)}
        product={colorModalProduct}
        onSaveColors={handleSaveColors}
      />

      <AdminAddInventorySizeModal
        isOpen={Boolean(sizeModalProduct)}
        onClose={() => setSizeModalProduct(null)}
        product={sizeModalProduct}
        onSaveSizes={handleSaveSizes}
      />

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
                  {productToDelete.sku}
                </span>
              </div>
              <p className="text-[12px] text-on-surface-variant">
                ¿Deseas eliminar este producto del inventario? Esta acción removerá el producto y
                toda su matriz de stock asignada de talles y colores.
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
                onClick={handleConfirmDeleteProduct}
                className="px-5 py-2 bg-[#ba1a1a] hover:bg-[#93000a] text-white font-headline text-[15px] uppercase tracking-wider transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>SÍ, ELIMINAR</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
