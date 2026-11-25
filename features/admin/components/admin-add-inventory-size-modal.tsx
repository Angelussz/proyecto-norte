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

interface SystemInfo {
  id: string;
  label: string;
  groupTitle: string;
  sizes: string[];
}

interface SizeOption {
  size: string;
  systemId: string;
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

  // 1. Filtrar grupos según la categoría del producto
  const groupKeywords = product?.category ? getGroupKeywordsForCategory(product.category) : null;

  const filteredGroups = useMemo(() => {
    if (!sizeGroupsData) return [];
    return sizeGroupsData.filter((group) => {
      if (!groupKeywords) return true;
      const normTitle = normalize(group.title);
      return groupKeywords.some((kw) => normTitle.includes(normalize(kw)));
    });
  }, [sizeGroupsData, groupKeywords]);

  // 2. Sistemas de tallas activos disponibles con sus talles en orden estricto
  const availableSystems = useMemo<SystemInfo[]>(() => {
    return filteredGroups.flatMap((group) =>
      group.systems
        .filter((sys) => sys.active)
        .map((sys) => ({
          id: sys.id,
          label: sys.label,
          groupTitle: group.title,
          sizes: sys.sizes,
        })),
    );
  }, [filteredGroups]);

  // 3. Detectar cuál sistema de talla usa el producto actualmente (por coincidencia de talles)
  const detectedSystemId = useMemo(() => {
    if (!product || availableSystems.length === 0) return "";
    if (product.sizes.length === 0) return availableSystems[0]?.id || "";

    const currentNormalized = new Set(product.sizes.map((s) => s.toLowerCase().trim()));

    let bestMatchCount = -1;
    let bestSystemId = availableSystems[0]?.id || "";

    for (const sys of availableSystems) {
      const matchCount = sys.sizes.filter((s) =>
        currentNormalized.has(s.toLowerCase().trim()),
      ).length;
      if (matchCount > bestMatchCount) {
        bestMatchCount = matchCount;
        bestSystemId = sys.id;
      }
    }

    return bestSystemId;
  }, [product, availableSystems]);

  const [selectedSystemId, setSelectedSystemId] = useState<string>("all");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  // Al abrir el modal, inicializar estado con los talles del producto y activar su sistema
  useEffect(() => {
    if (isOpen && product) {
      setSelectedSizes([...product.sizes]);
      setSearch("");
      setSelectedSystemId(detectedSystemId || "all");
    }
  }, [isOpen, product, detectedSystemId]);

  // 4. Lista de opciones en orden estricto según el sistema de tallas seleccionado
  const catalogSizes = useMemo<SizeOption[]>(() => {
    const systemsToUse =
      selectedSystemId !== "all"
        ? availableSystems.filter((sys) => sys.id === selectedSystemId)
        : availableSystems;

    const result: SizeOption[] = [];
    const seen = new Set<string>();

    systemsToUse.forEach((sys) => {
      sys.sizes.forEach((size) => {
        // En vista "all", evitar duplicar exactamente la misma talla de sistemas repetidos
        const dedupKey =
          selectedSystemId === "all"
            ? `${size.toLowerCase().trim()}-${sys.id}`
            : size.toLowerCase().trim();
        if (!seen.has(dedupKey)) {
          seen.add(dedupKey);
          result.push({
            size,
            systemId: sys.id,
            systemLabel: sys.label,
            groupTitle: sys.groupTitle,
          });
        }
      });
    });

    return result;
  }, [availableSystems, selectedSystemId]);

  if (!isOpen || !product) return null;

  const currentAssignedSizes = new Set(product.sizes.map((s) => s.toLowerCase().trim()));

  // 5. Filtrar solo por búsqueda de texto, SIN romper el orden secuencial del sistema
  const filteredList = catalogSizes.filter(
    (s) =>
      s.size.toLowerCase().includes(search.toLowerCase()) ||
      s.systemLabel.toLowerCase().includes(search.toLowerCase()) ||
      s.groupTitle.toLowerCase().includes(search.toLowerCase()),
  );

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

    // Ordenar los talles seleccionados según el orden en que aparecen en el sistema
    const orderMap = new Map<string, number>();
    availableSystems.forEach((sys) => {
      sys.sizes.forEach((size, idx) => {
        const key = size.toLowerCase().trim();
        if (!orderMap.has(key)) {
          orderMap.set(key, idx);
        }
      });
    });

    const orderedSelectedSizes = [...selectedSizes].sort((a, b) => {
      const idxA = orderMap.get(a.toLowerCase().trim()) ?? 999;
      const idxB = orderMap.get(b.toLowerCase().trim()) ?? 999;
      return idxA - idxB;
    });

    onSaveSizes(product.id, orderedSelectedSizes);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[540px] bg-[#fbf7ee] border border-[#e3dac9] p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-hidden"
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

        {/* ── Selector de sistema de tallas (si la categoría tiene más de un sistema) ── */}
        {availableSystems.length > 1 && (
          <div className="flex flex-col gap-1.5 p-2.5 bg-[#f4ede0] border border-[#e3dac9]">
            <div className="flex items-center justify-between">
              <span className="font-inter text-[10px] font-bold uppercase tracking-wider text-[#6c5d4f]">
                SISTEMA DE TALLES
              </span>
              {detectedSystemId && (
                <span className="font-inter text-[9px] text-[#3b5e28] font-bold uppercase tracking-wider bg-[#dce9d5] px-1.5 py-0.5 border border-[#c4dcba]">
                  Detectado en producto
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {availableSystems.map((sys) => {
                const isSelected = selectedSystemId === sys.id;
                const isDetected = sys.id === detectedSystemId;
                return (
                  <button
                    key={sys.id}
                    type="button"
                    onClick={() => setSelectedSystemId(sys.id)}
                    className={`px-2.5 py-1 font-inter text-[11px] font-bold uppercase tracking-wider transition-colors border ${
                      isSelected
                        ? "bg-[#673900] text-white border-[#673900] shadow-2xs"
                        : "bg-white text-[#524438] border-[#e3dac9] hover:bg-[#ebdcc9]"
                    }`}
                  >
                    {sys.label}
                    {isDetected && !isSelected && <span className="ml-1 text-[#3b5e28]">●</span>}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setSelectedSystemId("all")}
                className={`px-2.5 py-1 font-inter text-[11px] font-bold uppercase tracking-wider transition-colors border ${
                  selectedSystemId === "all"
                    ? "bg-[#673900] text-white border-[#673900] shadow-2xs"
                    : "bg-white text-[#524438] border-[#e3dac9] hover:bg-[#ebdcc9]"
                }`}
              >
                Ver Todos
              </button>
            </div>
          </div>
        )}

        {/* ── Buscador ── */}
        <div className="relative">
          <span className="material-symbols-outlined text-[18px] text-[#8f8274] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Escribir o buscar talle..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#e3dac9] font-inter text-[13px] text-[#1e1c13] placeholder:text-[#a5998a] outline-none focus:border-[#c77d2e] shadow-2xs transition-colors"
          />
        </div>

        {/* ── Contadores ── */}
        <div className="flex items-center justify-between font-inter text-[10px] font-bold uppercase tracking-wider text-[#524438] px-0.5">
          <span>
            TALLES DISPONIBLES ({filteredList.length} OPCIONES)
            {selectedSystemId !== "all" && (
              <span className="text-[#786c5e] font-normal lowercase ml-1">
                (según {availableSystems.find((s) => s.id === selectedSystemId)?.label})
              </span>
            )}
          </span>
          <span className="text-[#673900]">{selectedSizes.length} SELECCIONADOS</span>
        </div>

        {/* ── Lista de talles ordenadas por sistema ── */}
        <div className="max-h-[250px] overflow-y-auto space-y-2 pr-1">
          {isLoading ? (
            <div className="p-6 text-center font-inter text-[12px] text-[#857466] bg-white border border-[#e8dfcf]">
              Cargando talles del catálogo…
            </div>
          ) : filteredList.length === 0 && search ? (
            <div className="p-6 text-center font-inter text-[12px] text-[#857466] bg-white border border-[#e8dfcf]">
              No se encontraron talles para &quot;{search}&quot;.
            </div>
          ) : filteredList.length === 0 ? (
            <div className="p-6 text-center font-inter text-[12px] text-[#857466] bg-white border border-[#e8dfcf]">
              No hay talles configurados para esta categoría. Agregalos desde{" "}
              <strong>Categorías → Talles</strong>.
            </div>
          ) : (
            filteredList.map((item) => {
              const isChecked = selectedSizes.some(
                (s) => s.toLowerCase().trim() === item.size.toLowerCase().trim(),
              );
              const isInMatrix = currentAssignedSizes.has(item.size.toLowerCase().trim());

              return (
                <div
                  key={`${item.systemId}-${item.size}`}
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

                    {/* Talle + sistema en una sola línea */}
                    <span className="font-inter text-[13px] font-bold text-[#1e1c13]">
                      {item.size}{" "}
                      <span className="font-normal text-[#786c5e]">({item.systemLabel})</span>
                    </span>
                  </div>

                  {/* Badge: verde si ya está en la matriz, gris si disponible */}
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
