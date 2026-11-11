"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Master Catalogs ──────────────────────────────────────────────────────────

const CATALOG_COLORS = [
  { name: "Verde Oliva", hex: "#4F583D" },
  { name: "Terracota", hex: "#9E472A" },
  { name: "Arena Natural", hex: "#E4D5B7" },
  { name: "Negro Carbón", hex: "#222220" },
  { name: "Blanco Puro", hex: "#FFFFFF" },
  { name: "Azul Marino", hex: "#1B2A4A" },
  { name: "Gris Piedra", hex: "#918E85" },
];

const CATALOG_SIZES = [
  { size: "36", label: "XS", full: "Talla 36 (XS)" },
  { size: "38", label: "S", full: "Talla 38 (S)" },
  { size: "40", label: "M", full: "Talla 40 (M)" },
  { size: "42", label: "L", full: "Talla 42 (L)" },
  { size: "44", label: "XL", full: "Talla 44 (XL)" },
  { size: "46", label: "XXL", full: "Talla 46 (XXL)" },
];

// ─── Initial State matching user's image ───────────────────────────────────────

const INITIAL_ACTIVE_SIZES: SizeConfig[] = [
  {
    size: "38",
    label: "S",
    open: true,
    colors: [
      { name: "Verde Oliva", hex: "#4F583D", stock: 8 },
      { name: "Arena Natural", hex: "#E4D5B7", stock: 6 },
    ],
  },
  {
    size: "40",
    label: "M",
    open: true,
    colors: [
      { name: "Verde Oliva", hex: "#4F583D", stock: 10 },
      { name: "Terracota", hex: "#9E472A", stock: 4 },
    ],
  },
  {
    size: "42",
    label: "L",
    open: true,
    colors: [{ name: "Verde Oliva", hex: "#4F583D", stock: 8 }],
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function AdminInventoryVariantsSection() {
  // Selected colors in the color picker
  const [selectedColorNames, setSelectedColorNames] = useState<string[]>([
    "Verde Oliva",
    "Terracota",
    "Arena Natural",
  ]);
  const [colorSearch, setColorSearch] = useState("");
  const [isColorOpen, setIsColorOpen] = useState(false);

  // Selected sizes in the size picker
  const [selectedSizeKeys, setSelectedSizeKeys] = useState<string[]>(["38", "40", "42"]);
  const [sizeSearch, setSizeSearch] = useState("");
  const [isSizeOpen, setIsSizeOpen] = useState(false);

  // Refs for click outside
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Configured talles and their stock per color
  const [sizes, setSizes] = useState<SizeConfig[]>(INITIAL_ACTIVE_SIZES);

  // Filtered lists
  const filteredColors = CATALOG_COLORS.filter((c) =>
    c.name.toLowerCase().includes(colorSearch.toLowerCase()),
  );

  const filteredSizes = CATALOG_SIZES.filter(
    (s) =>
      s.full.toLowerCase().includes(sizeSearch.toLowerCase()) ||
      s.size.includes(sizeSearch) ||
      s.label.toLowerCase().includes(sizeSearch.toLowerCase()),
  );

  // Toggle selection in color list
  function toggleColorSelect(name: string) {
    setSelectedColorNames((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name],
    );
  }

  // Toggle selection in size list
  function toggleSizeSelect(key: string) {
    setSelectedSizeKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  // Add selected colors to talles
  function handleAddColors() {
    if (selectedColorNames.length === 0) return;

    setSizes((prevSizes) =>
      prevSizes.map((s) => {
        // Find existing colors
        const existingColorNames = s.colors.map((c) => c.name);
        const newColorsToAdd = selectedColorNames
          .filter((name) => !existingColorNames.includes(name))
          .map((name) => {
            const master = CATALOG_COLORS.find((c) => c.name === name);
            return {
              name,
              hex: master?.hex || "#999999",
              stock: 0,
            };
          });

        return {
          ...s,
          colors: [...s.colors, ...newColorsToAdd],
        };
      }),
    );
    setIsColorOpen(false);
  }

  // Add selected sizes to configured list
  function handleAddSizes() {
    if (selectedSizeKeys.length === 0) return;

    setSizes((prevSizes) => {
      const existingKeys = prevSizes.map((s) => s.size);
      const newSizesToAdd: SizeConfig[] = selectedSizeKeys
        .filter((key) => !existingKeys.includes(key))
        .map((key) => {
          const master = CATALOG_SIZES.find((s) => s.size === key);
          const initialColorsForSize = selectedColorNames.map((name) => {
            const colorMaster = CATALOG_COLORS.find((c) => c.name === name);
            return {
              name,
              hex: colorMaster?.hex || "#999999",
              stock: 0,
            };
          });

          return {
            size: key,
            label: master?.label || key,
            open: true,
            colors: initialColorsForSize,
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

  // Total stock calculation
  const totalStock = sizes.reduce((acc, s) => acc + s.colors.reduce((a, c) => a + c.stock, 0), 0);

  // Active unique colors across all sizes
  const activeColors = Array.from(
    new Map(sizes.flatMap((s) => s.colors).map((c) => [c.name, c])).values(),
  );

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

        {/* Collapsible Dropdown: Scrollable list + Action button */}
        {isColorOpen && (
          <div className="flex flex-col gap-2.5 animate-in fade-in duration-150">
            <div className="border border-[#eee8d9] bg-white divide-y divide-[#faf3e4] max-h-[160px] overflow-y-auto">
              {filteredColors.length === 0 ? (
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
                      {/* Checkbox */}
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

        {/* Collapsible Dropdown: Scrollable list + Action button */}
        {isSizeOpen && (
          <div className="flex flex-col gap-2.5 animate-in fade-in duration-150">
            <div className="border border-[#eee8d9] bg-white divide-y divide-[#faf3e4] max-h-[170px] overflow-y-auto">
              {filteredSizes.length === 0 ? (
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
                      {/* Checkbox */}
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
                  {size.colors.map((color, cIdx) => (
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
                          onChange={(e) => setStockValue(sIdx, cIdx, parseInt(e.target.value) || 0)}
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
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
