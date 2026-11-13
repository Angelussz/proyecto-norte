"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useColors } from "@/features/admin/hooks/useColors";
import { useSizeGroups } from "@/features/admin/hooks/useSizeGroups";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface VariantRow {
  size: string;
  colorName: string;
  colorHex: string;
  stock: number;
}

export interface ColorItem {
  name: string;
  hex: string;
  stock?: number;
}

export interface SizeConfig {
  size: string;
  label: string;
  colors: { name: string; hex: string; stock: number }[];
  open: boolean;
}

interface Props {
  onVariantsChange?: (variants: VariantRow[]) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AdminInventoryVariantsSection({ onVariantsChange }: Props) {
  // ── Catálogos desde la DB ─────────────────────────────────────────────────
  const { data: colorsData } = useColors();
  const { data: sizeGroupsData } = useSizeGroups();

  // Aplanar colores activos del catálogo
  const catalogColors: ColorItem[] = (colorsData ?? [])
    .filter((c) => c.active)
    .map((c) => ({ name: c.name, hex: c.hex }));

  // Aplanar todas las tallas activas de todos los grupos/sistemas
  const catalogSizes: { size: string; label: string; full: string }[] = (
    sizeGroupsData ?? []
  ).flatMap((group) =>
    group.systems
      .filter((s) => s.active)
      .flatMap((sys) =>
        sys.sizes.map((size) => ({
          size,
          label: size,
          full: `${size} (${sys.label})`,
        })),
      ),
  );

  // De-duplicar tallas (mismo valor de size puede aparecer en varios sistemas)
  const uniqueSizes = catalogSizes.reduce(
    (acc, s) => {
      if (!acc.find((x) => x.size === s.size)) acc.push(s);
      return acc;
    },
    [] as typeof catalogSizes,
  );

  // ── Estado de selección ───────────────────────────────────────────────────
  const [selectedColorNames, setSelectedColorNames] = useState<string[]>([]);
  const [colorSearch, setColorSearch] = useState("");
  const [isColorOpen, setIsColorOpen] = useState(false);

  const [selectedSizeKeys, setSelectedSizeKeys] = useState<string[]>([]);
  const [sizeSearch, setSizeSearch] = useState("");
  const [isSizeOpen, setIsSizeOpen] = useState(false);

  // Refs para click outside
  const colorContainerRef = useRef<HTMLDivElement>(null);
  const sizeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (colorContainerRef.current && !colorContainerRef.current.contains(target)) {
        setIsColorOpen(false);
      }
      if (sizeContainerRef.current && !sizeContainerRef.current.contains(target)) {
        setIsSizeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Estado de tallas configuradas ─────────────────────────────────────────
  const [sizes, setSizes] = useState<SizeConfig[]>([]);

  // ── Callback: notificar variantes al padre ─────────────────────────────────
  const buildVariantRows = useCallback(
    (currentSizes: SizeConfig[]): VariantRow[] =>
      currentSizes.flatMap((s) =>
        s.colors.map((c) => ({
          size: s.size,
          colorName: c.name,
          colorHex: c.hex,
          stock: c.stock,
        })),
      ),
    [],
  );

  // Notificar al padre cada vez que cambia `sizes`
  useEffect(() => {
    if (!onVariantsChange) return;
    onVariantsChange(buildVariantRows(sizes));
  }, [sizes, onVariantsChange, buildVariantRows]);

  // ── Sincronizar colores seleccionados → tallas existentes ─────────────────
  // Cuando cambia `selectedColorNames`, actualizar TODAS las tallas:
  //   - Agregar los colores nuevos (stock 0)
  //   - Quitar los colores deseleccionados
  useEffect(() => {
    if (sizes.length === 0) return; // nada que sincronizar aún
    setSizes((prev) =>
      prev.map((s) => {
        const kept = s.colors.filter((c) => selectedColorNames.includes(c.name));
        const existingNames = s.colors.map((c) => c.name);
        const toAdd = selectedColorNames
          .filter((name) => !existingNames.includes(name))
          .map((name) => {
            const master = catalogColors.find((c) => c.name === name);
            return { name, hex: master?.hex ?? "#999999", stock: 0 };
          });
        return { ...s, colors: [...kept, ...toAdd] };
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColorNames]);

  // ── Listas filtradas ──────────────────────────────────────────────────────
  const filteredColors = catalogColors.filter((c) =>
    c.name.toLowerCase().includes(colorSearch.toLowerCase()),
  );

  const filteredSizes = uniqueSizes.filter(
    (s) =>
      s.full.toLowerCase().includes(sizeSearch.toLowerCase()) ||
      s.size.includes(sizeSearch) ||
      s.label.toLowerCase().includes(sizeSearch.toLowerCase()),
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  function toggleColorSelect(name: string) {
    setSelectedColorNames((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name],
    );
  }

  function toggleSizeSelect(key: string) {
    setSelectedSizeKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  // Agregar los colores seleccionados a todas las tallas existentes
  function handleAddColors() {
    if (selectedColorNames.length === 0) return;
    setSizes((prevSizes) =>
      prevSizes.map((s) => {
        const existingColorNames = s.colors.map((c) => c.name);
        const newColorsToAdd = selectedColorNames
          .filter((name) => !existingColorNames.includes(name))
          .map((name) => {
            const master = catalogColors.find((c) => c.name === name);
            return { name, hex: master?.hex || "#999999", stock: 0 };
          });
        return { ...s, colors: [...s.colors, ...newColorsToAdd] };
      }),
    );
    setIsColorOpen(false);
  }

  // Agregar las tallas seleccionadas con los colores actuales
  function handleAddSizes() {
    if (selectedSizeKeys.length === 0) return;
    setSizes((prevSizes) => {
      const existingKeys = prevSizes.map((s) => s.size);
      const newSizesToAdd: SizeConfig[] = selectedSizeKeys
        .filter((key) => !existingKeys.includes(key))
        .map((key) => {
          const master = uniqueSizes.find((s) => s.size === key);
          const initialColors = selectedColorNames.map((name) => {
            const colorMaster = catalogColors.find((c) => c.name === name);
            return { name, hex: colorMaster?.hex || "#999999", stock: 0 };
          });
          return {
            size: key,
            label: master?.label || key,
            open: true,
            colors: initialColors,
          };
        });
      return [...prevSizes, ...newSizesToAdd];
    });
    setIsSizeOpen(false);
  }

  // Accordion toggle
  function toggleAccordion(sIdx: number) {
    setSizes((prev) => prev.map((s, i) => (i === sIdx ? { ...s, open: !s.open } : s)));
  }

  // Stepper stock update
  function updateStock(sIdx: number, cIdx: number, delta: number) {
    setSizes((prev) =>
      prev.map((s, i) =>
        i === sIdx
          ? {
              ...s,
              colors: s.colors.map((c, j) =>
                j === cIdx ? { ...c, stock: Math.max(0, c.stock + delta) } : c,
              ),
            }
          : s,
      ),
    );
  }

  function setStockValue(sIdx: number, cIdx: number, val: number) {
    setSizes((prev) =>
      prev.map((s, i) =>
        i === sIdx
          ? {
              ...s,
              colors: s.colors.map((c, j) => (j === cIdx ? { ...c, stock: Math.max(0, val) } : c)),
            }
          : s,
      ),
    );
  }

  // ── Totales y colores activos ─────────────────────────────────────────────
  const totalStock = sizes.reduce((acc, s) => acc + s.colors.reduce((a, c) => a + c.stock, 0), 0);

  // Muestra los colores seleccionados (o los presentes en tallas) en el banner de total
  const activeColorsMap = new Map<string, { name: string; hex: string }>();

  selectedColorNames.forEach((name) => {
    const found = catalogColors.find((c) => c.name === name);
    if (found) {
      activeColorsMap.set(name, { name: found.name, hex: found.hex });
    }
  });

  sizes
    .flatMap((s) => s.colors)
    .forEach((c) => {
      if (!activeColorsMap.has(c.name)) {
        activeColorsMap.set(c.name, { name: c.name, hex: c.hex });
      }
    });

  const activeColors = Array.from(activeColorsMap.values());

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section className="bg-white p-6 shadow-sm flex flex-col gap-6 border border-[#eee8d9]">
      {/* ── Section Title ── */}
      <div className="flex items-center gap-2.5 pb-2 border-b border-[#eee8d9]">
        <span className="w-2.5 h-2.5 bg-[#c77d2e] shrink-0" />
        <h2 className="font-headline text-[22px] uppercase tracking-wide text-[#1e1c13] leading-none">
          INVENTARIO, TALLES Y COLORES
        </h2>
      </div>

      {/* ── Total General Prenda Banner ── */}
      <div className="bg-[#faf3e4] p-4 flex flex-col gap-2">
        <span className="font-inter text-[10px] uppercase tracking-widest text-[#524438] font-bold">
          TOTAL GENERAL PRENDA
        </span>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="font-headline text-[36px] text-[#1e1c13] font-bold leading-none">
              {totalStock}
            </span>
            <span className="font-inter text-[11px] uppercase tracking-wider text-[#524438] font-semibold">
              UNIDADES EN STOCK
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {activeColors.map((c) => (
              <span
                key={c.name}
                className="w-3.5 h-3.5 inline-block shrink-0 border border-black/10"
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── 1. Color Selection Section ── */}
      <div ref={colorContainerRef} className="flex flex-col gap-2.5">
        <span className="font-inter text-[12px] text-[#c77d2e] font-semibold tracking-wide">
          {selectedColorNames.length} seleccionados
        </span>

        {/* Search input & toggle */}
        <div className="relative">
          <span className="material-symbols-outlined text-[16px] text-[#786c5e] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Escribir o buscar color..."
            value={colorSearch}
            onChange={(e) => {
              setColorSearch(e.target.value);
              setIsColorOpen(true);
            }}
            className="w-full pl-8 pr-8 py-1.5 bg-white border border-[#eee8d9] font-inter text-[12px] text-[#1e1c13] placeholder:text-[#a09587] outline-none focus:border-[#c77d2e]"
          />
          <button
            type="button"
            onClick={() => setIsColorOpen((prev) => !prev)}
            aria-label={isColorOpen ? "Cerrar selector de colores" : "Abrir selector de colores"}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-[#786c5e] hover:text-[#1e1c13] transition-colors"
          >
            <span
              className={cn(
                "material-symbols-outlined text-[18px] transition-transform duration-200",
                isColorOpen && "rotate-180",
              )}
            >
              keyboard_arrow_down
            </span>
          </button>
        </div>

        {/* Collapsible Dropdown */}
        {isColorOpen && (
          <div className="flex flex-col gap-2.5 animate-in fade-in duration-150">
            <div className="border border-[#eee8d9] bg-white divide-y divide-[#faf3e4] max-h-[160px] overflow-y-auto">
              {catalogColors.length === 0 ? (
                <div className="p-3 text-center font-inter text-[12px] text-[#857466]">
                  Cargando colores…
                </div>
              ) : filteredColors.length === 0 ? (
                <div className="p-3 text-center font-inter text-[12px] text-[#857466]">
                  No se encontraron colores
                </div>
              ) : (
                filteredColors.map((c) => {
                  const isChecked = selectedColorNames.includes(c.name);
                  return (
                    <div
                      key={c.name}
                      onClick={() => toggleColorSelect(c.name)}
                      className="flex items-center justify-between px-3 py-2 hover:bg-[#faf3e4]/60 cursor-pointer select-none transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 inline-block shrink-0 border border-black/10"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="font-inter text-[12px] text-[#1e1c13] font-medium">
                          {c.name}
                        </span>
                      </div>
                      <div
                        className={cn(
                          "w-4 h-4 border flex items-center justify-center transition-colors",
                          isChecked
                            ? "bg-[#c77d2e] border-[#c77d2e] text-white"
                            : "bg-white border-[#ccc]",
                        )}
                      >
                        {isChecked && (
                          <span className="material-symbols-outlined text-[13px] leading-none font-bold">
                            check
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Action button */}
            <button
              type="button"
              onClick={handleAddColors}
              className="w-full py-2.5 bg-[#673900] hover:bg-[#7e4600] text-white font-inter text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              AGREGAR COLORES SELECCIONADOS
            </button>
          </div>
        )}
      </div>

      {/* ── 2. Size (Talle) Selection Section ── */}
      <div ref={sizeContainerRef} className="flex flex-col gap-2.5">
        <span className="font-inter text-[12px] text-[#c77d2e] font-semibold tracking-wide">
          {selectedSizeKeys.length} seleccionadas
        </span>

        {/* Search input & toggle */}
        <div className="relative">
          <span className="material-symbols-outlined text-[16px] text-[#786c5e] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Escribir o buscar talle..."
            value={sizeSearch}
            onChange={(e) => {
              setSizeSearch(e.target.value);
              setIsSizeOpen(true);
            }}
            className="w-full pl-8 pr-8 py-1.5 bg-white border border-[#eee8d9] font-inter text-[12px] text-[#1e1c13] placeholder:text-[#a09587] outline-none focus:border-[#c77d2e]"
          />
          <button
            type="button"
            onClick={() => setIsSizeOpen((prev) => !prev)}
            aria-label={isSizeOpen ? "Cerrar selector de talles" : "Abrir selector de talles"}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-[#786c5e] hover:text-[#1e1c13] transition-colors"
          >
            <span
              className={cn(
                "material-symbols-outlined text-[18px] transition-transform duration-200",
                isSizeOpen && "rotate-180",
              )}
            >
              keyboard_arrow_down
            </span>
          </button>
        </div>

        {/* Collapsible Dropdown */}
        {isSizeOpen && (
          <div className="flex flex-col gap-2.5 animate-in fade-in duration-150">
            <div className="border border-[#eee8d9] bg-white divide-y divide-[#faf3e4] max-h-[170px] overflow-y-auto">
              {uniqueSizes.length === 0 ? (
                <div className="p-3 text-center font-inter text-[12px] text-[#857466]">
                  Cargando talles…
                </div>
              ) : filteredSizes.length === 0 ? (
                <div className="p-3 text-center font-inter text-[12px] text-[#857466]">
                  No se encontraron talles
                </div>
              ) : (
                filteredSizes.map((s) => {
                  const isChecked = selectedSizeKeys.includes(s.size);
                  return (
                    <div
                      key={s.size}
                      onClick={() => toggleSizeSelect(s.size)}
                      className="flex items-center justify-between px-3 py-2 hover:bg-[#faf3e4]/60 cursor-pointer select-none transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[15px] text-[#786c5e]">
                          straighten
                        </span>
                        <span className="font-inter text-[12px] text-[#1e1c13] font-medium">
                          {s.full}
                        </span>
                      </div>
                      <div
                        className={cn(
                          "w-4 h-4 border flex items-center justify-center transition-colors",
                          isChecked
                            ? "bg-[#c77d2e] border-[#c77d2e] text-white"
                            : "bg-white border-[#ccc]",
                        )}
                      >
                        {isChecked && (
                          <span className="material-symbols-outlined text-[13px] leading-none font-bold">
                            check
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Action button */}
            <button
              type="button"
              onClick={handleAddSizes}
              className="w-full py-2.5 bg-[#673900] hover:bg-[#7e4600] text-white font-inter text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              AGREGAR TALLES SELECCIONADOS
            </button>
          </div>
        )}
      </div>

      {/* ── 3. Configured Talles Accordion Cards ── */}
      <div className="flex flex-col gap-2.5 pt-1">
        {sizes.map((size, sIdx) => {
          const sizeTotal = size.colors.reduce((a, c) => a + c.stock, 0);
          return (
            <div key={size.size} className="flex flex-col">
              {/* Accordion Header */}
              <div
                onClick={() => toggleAccordion(sIdx)}
                className="p-2.5 bg-[#faf3e4] border border-[#eee8d9] flex items-center justify-between cursor-pointer select-none hover:bg-[#f5ecda] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "material-symbols-outlined text-[18px] text-[#524438] transition-transform duration-200",
                      size.open ? "rotate-0" : "-rotate-90",
                    )}
                  >
                    keyboard_arrow_down
                  </span>
                  <span className="font-headline text-[18px] uppercase tracking-wide text-[#1e1c13] font-bold">
                    TALLA {size.size} ({size.label})
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-[#eee8d9] font-inter text-[10px] font-bold uppercase tracking-wider text-[#1e1c13]">
                  {sizeTotal} UDS
                </span>
              </div>

              {/* Accordion Body */}
              {size.open && (
                <div className="p-3 bg-white border-x border-b border-[#eee8d9] flex flex-col gap-2">
                  {size.colors.length === 0 ? (
                    <p className="font-inter text-[12px] text-[#857466] text-center py-1">
                      Seleccioná colores y agregalos arriba.
                    </p>
                  ) : (
                    size.colors.map((color, cIdx) => (
                      <div key={color.name} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 shrink-0 border border-black/10"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="font-inter text-[12px] text-[#1e1c13] font-semibold">
                            {color.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => updateStock(sIdx, cIdx, -1)}
                            className="w-6 h-6 flex items-center justify-center bg-[#faf3e4] hover:bg-[#f2e7d3] text-[#1e1c13] font-bold text-[14px] transition-colors"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={0}
                            value={color.stock}
                            onChange={(e) =>
                              setStockValue(sIdx, cIdx, parseInt(e.target.value) || 0)
                            }
                            className="w-12 text-center font-inter text-[12px] font-bold bg-white border border-[#eee8d9] py-0.5 outline-none focus:border-[#673900]"
                          />
                          <button
                            type="button"
                            onClick={() => updateStock(sIdx, cIdx, 1)}
                            className="w-6 h-6 flex items-center justify-center bg-[#faf3e4] hover:bg-[#f2e7d3] text-[#1e1c13] font-bold text-[14px] transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
