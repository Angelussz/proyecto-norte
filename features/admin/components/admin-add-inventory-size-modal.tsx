"use client";

import { useState, useMemo, useEffect } from "react";
import { useSizeGroups } from "@/features/admin/hooks/useSizeGroups";

// ─── Mismo mapa de keywords que usa AdminInventoryVariantsSection ─────────────
const CATEGORY_KEYWORDS: { match: string[]; groupKeywords: string[] }[] = [
  {
    match: [
      "camisa",
      "polera",
      "camiseta",
      "remera",
      "blusa",
      "chomba",
      "chaqueta",
      "abrigo",
      "sweater",
      "suéter",
      "sobrecamisa",
      "top",
    ],
    groupKeywords: ["ropa general", "prendas"],
  },
  {
    match: ["pantalon", "jean", "bermuda", "short", "falda", "vestido"],
    groupKeywords: ["pantalon", "jean", "formal"],
  },
  {
    match: ["calzado", "zapato", "zapatilla", "bota", "sandalia", "mocasin"],
    groupKeywords: ["calzado"],
  },
  {
    match: [
      "accesorio",
      "joya",
      "joyeria",
      "anillo",
      "collar",
      "pulsera",
      "cinturon",
      "bufanda",
      "gorra",
      "bolso",
      "cartera",
    ],
    groupKeywords: ["accesorio", "talle único", "joyería", "joya", "cinturón", "bufanda", "poncho"],
  },
];

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getGroupKeywordsForCategory(categoryName: string): string[] | null {
  const norm = normalize(categoryName);
  for (const rule of CATEGORY_KEYWORDS) {
    if (rule.match.some((kw) => norm.includes(normalize(kw)))) {
      return rule.groupKeywords;
    }
  }
  return null; // sin filtro → muestra todos los grupos
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface SizeOption {
  size: string;
  systemLabel: string;
  groupTitle: string;
}

interface AdminAddInventorySizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    sku: string;
    category: string;
    sizes: string[];
    colors: { name: string; hex: string }[];
  } | null;
  onSaveSizes: (productId: string, selectedSizes: string[]) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AdminAddInventorySizeModal({
  isOpen,
  onClose,
  product,
  onSaveSizes,
}: AdminAddInventorySizeModalProps) {
  const { data: sizeGroupsData, isLoading } = useSizeGroups();

  // Filtrar y aplanar talles del catálogo según la categoría del producto
  const catalogSizes = useMemo<SizeOption[]>(() => {
    if (!sizeGroupsData) return [];

    const groupKeywords = product?.category ? getGroupKeywordsForCategory(product.category) : null;

    const filteredGroups = sizeGroupsData.filter((group) => {
      if (!groupKeywords) return true;
      const normTitle = normalize(group.title);
      return groupKeywords.some((kw) => normTitle.includes(normalize(kw)));
    });

    // Aplanar con de-duplicación por valor de talla
    const seen = new Set<string>();
    const result: SizeOption[] = [];

    filteredGroups.forEach((group) => {
      group.systems
        .filter((sys) => sys.active)
        .forEach((sys) => {
          sys.sizes.forEach((size) => {
            const key = size.toLowerCase().trim();
            if (!seen.has(key)) {
              seen.add(key);
              result.push({
                size,
                systemLabel: sys.label,
                groupTitle: group.title,
              });
            }
          });
        });
    });

    return result;
  }, [sizeGroupsData, product?.category]);

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isOpen && product) {
      setSelectedSizes([...product.sizes]);
      setSearch("");
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const currentAssignedSizes = new Set(product.sizes.map((s) => s.toLowerCase().trim()));

  // Filtrar por buscador
  const filtered = catalogSizes.filter(
    (s) =>
      s.size.toLowerCase().includes(search.toLowerCase()) ||
      s.systemLabel.toLowerCase().includes(search.toLowerCase()) ||
      s.groupTitle.toLowerCase().includes(search.toLowerCase()),
  );

  // Ordenar: primero EN MATRIZ, luego disponibles
  const sortedList = [...filtered].sort((a, b) => {
    const aIn = currentAssignedSizes.has(a.size.toLowerCase().trim());
    const bIn = currentAssignedSizes.has(b.size.toLowerCase().trim());
    if (aIn && !bIn) return -1;
    if (!aIn && bIn) return 1;
    return a.size.localeCompare(b.size, undefined, { numeric: true });
  });

  function toggleSize(size: string) {
    setSelectedSizes((prev) => {
      const exists = prev.some((s) => s.toLowerCase().trim() === size.toLowerCase().trim());
      return exists
        ? prev.filter((s) => s.toLowerCase().trim() !== size.toLowerCase().trim())
        : [...prev, size];
    });
  }

  function handleSave() {
    if (!product) return;
    onSaveSizes(product.id, selectedSizes);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[500px] bg-[#fbf7ee] border border-[#e3dac9] p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Encabezado ── */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#c77d2e] shrink-0" />
              <span className="font-inter text-[10px] font-bold uppercase tracking-widest text-[#6c5d4f]">
                GESTIÓN DE CURVA DE TALLES
              </span>
            </div>
            <h3 className="font-headline text-[22px] sm:text-[24px] uppercase tracking-wide text-[#1e1c13] font-bold leading-tight">
              AÑADIR TALLES & DIMENSIONES AL INVENTARIO
            </h3>
            <p className="font-inter text-[12px] sm:text-[13px] text-[#524438] font-medium">
              {product.name} • <span className="font-mono text-[#786c5e]">SKU: {product.sku}</span>
            </p>

            {/* Badge de categoría */}
            {product.category && (
              <div className="flex items-center gap-2 mt-1">
                <span className="font-inter text-[10px] font-bold uppercase tracking-wider text-[#786c5e]">
                  CATEGORÍA:
                </span>
                <span className="px-2 py-0.5 bg-[#f0ead9] text-[#524438] font-inter text-[10px] font-bold uppercase tracking-wider border border-[#e3dac9]">
                  {product.category}
                </span>
              </div>
            )}

            {/* Talles ya asignados */}
            <div className="flex items-start gap-2 mt-2 pt-1.5 border-t border-[#e8dfcf]">
              <span className="font-inter text-[10px] font-bold uppercase tracking-wider text-[#786c5e] mt-0.5 shrink-0">
                TALLES EN MATRIZ:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {product.sizes.length === 0 ? (
                  <span className="font-inter text-[11px] text-[#a5998a] italic">
                    Ninguno asignado
                  </span>
                ) : (
                  product.sizes.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 bg-white text-[#1e1c13] font-inter text-[11px] font-bold border border-[#e8dfcf] shadow-2xs"
                    >
                      {s}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#786c5e] hover:text-[#1e1c13] hover:bg-[#ebdcc9] transition-colors shrink-0"
            aria-label="Cerrar modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* ── Buscador ── */}
        <div className="relative mt-1">
          <span className="material-symbols-outlined text-[18px] text-[#8f8274] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Escribir o buscar talle..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#e3dac9] font-inter text-[13px] text-[#1e1c13] placeholder:text-[#a5998a] outline-none focus:border-[#c77d2e] shadow-2xs transition-colors"
          />
        </div>

        {/* ── Contadores ── */}
        <div className="flex items-center justify-between font-inter text-[10px] font-bold uppercase tracking-wider text-[#524438] px-0.5">
          <span>TALLES DISPONIBLES ({filtered.length} OPCIONES)</span>
          <span className="text-[#673900]">{selectedSizes.length} SELECCIONADOS</span>
        </div>

        {/* ── Lista ── */}
        <div className="max-h-[260px] overflow-y-auto space-y-2 pr-1">
          {isLoading ? (
            <div className="p-6 text-center font-inter text-[12px] text-[#857466] bg-white border border-[#e8dfcf]">
              Cargando talles del catálogo…
            </div>
          ) : sortedList.length === 0 && search ? (
            <div className="p-6 text-center font-inter text-[12px] text-[#857466] bg-white border border-[#e8dfcf]">
              No se encontraron talles para &quot;{search}&quot;.
            </div>
          ) : sortedList.length === 0 ? (
            <div className="p-6 text-center font-inter text-[12px] text-[#857466] bg-white border border-[#e8dfcf]">
              No hay talles configurados para esta categoría. Agregalos desde{" "}
              <strong>Categorías → Talles</strong>.
            </div>
          ) : (
            sortedList.map((item) => {
              const isChecked = selectedSizes.some(
                (s) => s.toLowerCase().trim() === item.size.toLowerCase().trim(),
              );
              const isInMatrix = currentAssignedSizes.has(item.size.toLowerCase().trim());

              return (
                <div
                  key={item.size}
                  onClick={() => toggleSize(item.size)}
                  className="flex items-center justify-between p-3 bg-white hover:bg-[#faf7f0] border border-[#e8dfcf] hover:border-[#d9cdb8] cursor-pointer select-none transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Checkbox */}
                    <div
                      className={`w-4 h-4 border flex items-center justify-center transition-colors shrink-0 ${
                        isChecked
                          ? "bg-[#673900] border-[#673900] text-white"
                          : "bg-white border-[#ccc]"
                      }`}
                    >
                      {isChecked && (
                        <span className="material-symbols-outlined text-[13px] font-bold leading-none">
                          check
                        </span>
                      )}
                    </div>

                    {/* Muestra de talle */}
                    <div className="min-w-[42px] px-2 py-1 bg-[#f7f2e7] border border-[#e4dbcc] flex items-center justify-center shrink-0">
                      <span className="font-inter text-[12px] font-bold text-[#1e1c13]">
                        {item.size}
                      </span>
                    </div>

                    {/* Nombre y sistema */}
                    <div className="flex flex-col text-left">
                      <span className="font-inter text-[13px] font-bold text-[#1e1c13] leading-tight">
                        {item.size}
                      </span>
                      <span className="font-inter text-[11px] text-[#786c5e]">
                        {item.groupTitle} · {item.systemLabel}
                      </span>
                    </div>
                  </div>

                  {/* Badge */}
                  {isInMatrix ? (
                    <span className="bg-[#dce9d5] text-[#3b5e28] border border-[#c4dcba] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 shrink-0">
                      EN MATRIZ
                    </span>
                  ) : (
                    <span className="text-[#8a7b6e] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 shrink-0">
                      DISPONIBLE
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between pt-3 mt-1 border-t border-[#e8dfcf] gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-[#eee8d9] hover:bg-[#e4ddcc] text-[#1e1c13] font-inter text-[11px] font-bold uppercase tracking-wider transition-colors"
          >
            CANCELAR
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={selectedSizes.length === 0}
            className="px-6 py-2.5 bg-[#673900] hover:bg-[#7e4600] disabled:opacity-50 disabled:cursor-not-allowed text-white font-headline text-[15px] sm:text-[16px] uppercase tracking-wider flex items-center gap-2 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">straighten</span>
            <span>+ AGREGAR TALLES SELECCIONADOS</span>
          </button>
        </div>
      </div>
    </div>
  );
}
