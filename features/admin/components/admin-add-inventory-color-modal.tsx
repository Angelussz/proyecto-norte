"use client";

import { useState, useMemo, useEffect } from "react";
import { useColors } from "@/features/admin/hooks/useColors";

export interface ColorVariant {
  name: string;
  hex: string;
}

interface AdminAddInventoryColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    sku: string;
    colors: ColorVariant[];
  } | null;
  onSaveColors: (productId: string, selectedColors: ColorVariant[]) => void;
}

// Paleta base de respaldo con los colores clásicos de NORTE
const DEFAULT_PALETTE: ColorVariant[] = [
  { name: "Verde Oliva", hex: "#4F583D" },
  { name: "Terracota", hex: "#9E472A" },
  { name: "Arena Natural", hex: "#E4D5B7" },
  { name: "Negro Carbón", hex: "#1A1A1A" },
  { name: "Blanco Puro", hex: "#FDFBF7" },
  { name: "Gris Mineral", hex: "#7E7F83" },
  { name: "Azul Marino", hex: "#1E2A38" },
  { name: "Cacao Tostado", hex: "#5C4033" },
  { name: "Ocre Tierra", hex: "#C68B45" },
];

export function AdminAddInventoryColorModal({
  isOpen,
  onClose,
  product,
  onSaveColors,
}: AdminAddInventoryColorModalProps) {
  const { data: colorsData } = useColors();

  // Consolidar todos los colores del catálogo (DB + base + los que ya tenga el producto)
  const fullPalette = useMemo(() => {
    const map = new Map<string, ColorVariant>();

    // 1. Agregar los que ya tiene el producto
    if (product?.colors) {
      product.colors.forEach((c) => {
        map.set(c.name.toLowerCase().trim(), { name: c.name, hex: c.hex });
      });
    }

    // 2. Agregar paleta por defecto
    DEFAULT_PALETTE.forEach((c) => {
      const key = c.name.toLowerCase().trim();
      if (!map.has(key)) {
        map.set(key, c);
      }
    });

    // 3. Agregar colores activos desde la base de datos si existen
    if (colorsData && Array.isArray(colorsData)) {
      colorsData
        .filter((c) => c.active)
        .forEach((c) => {
          const key = c.name.toLowerCase().trim();
          map.set(key, { name: c.name, hex: c.hex });
        });
    }

    return Array.from(map.values());
  }, [colorsData, product?.colors]);

  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  // Sincronizar colores seleccionados cuando se abre el modal para un producto
  useEffect(() => {
    if (isOpen && product) {
      setSelectedNames(product.colors.map((c) => c.name));
      setSearch("");
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  // Filtrado por buscador
  const filteredPalette = fullPalette.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.hex.toLowerCase().includes(search.toLowerCase()),
  );

  // Ordenar: primero los que ya están en la matriz del producto, luego los demás
  const currentAssignedNames = new Set(product.colors.map((c) => c.name.toLowerCase().trim()));

  const sortedList = [...filteredPalette].sort((a, b) => {
    const aInMatrix = currentAssignedNames.has(a.name.toLowerCase().trim());
    const bInMatrix = currentAssignedNames.has(b.name.toLowerCase().trim());
    if (aInMatrix && !bInMatrix) return -1;
    if (!aInMatrix && bInMatrix) return 1;
    return a.name.localeCompare(b.name);
  });

  function toggleColor(name: string) {
    setSelectedNames((prev) => {
      const exists = prev.some((n) => n.toLowerCase().trim() === name.toLowerCase().trim());
      if (exists) {
        return prev.filter((n) => n.toLowerCase().trim() !== name.toLowerCase().trim());
      } else {
        return [...prev, name];
      }
    });
  }

  function handleSave() {
    if (!product) return;

    // Mapear nombres seleccionados a objetos ColorVariant completos
    const updatedColors: ColorVariant[] = selectedNames.map((name) => {
      const match = fullPalette.find(
        (c) => c.name.toLowerCase().trim() === name.toLowerCase().trim(),
      );
      return {
        name,
        hex: match ? match.hex : "#999999",
      };
    });

    onSaveColors(product.id, updatedColors);
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
                GESTIÓN DE MATRIZ CROMÁTICA
              </span>
            </div>
            <h3 className="font-headline text-[22px] sm:text-[24px] uppercase tracking-wide text-[#1e1c13] font-bold leading-tight">
              AÑADIR TINTURAS & COLORES AL INVENTARIO
            </h3>
            <p className="font-inter text-[12px] sm:text-[13px] text-[#524438] font-medium">
              {product.name} • <span className="font-mono text-[#786c5e]">SKU: {product.sku}</span>
            </p>

            {/* Muestra de los cuadritos de colores que ya tiene seleccionados el producto */}
            <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-[#e8dfcf]">
              <span className="font-inter text-[10px] font-bold uppercase tracking-wider text-[#786c5e]">
                COLORES EN MATRIZ:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {product.colors.length === 0 ? (
                  <span className="font-inter text-[11px] text-[#a5998a] italic">
                    Ninguno asignado
                  </span>
                ) : (
                  product.colors.map((c) => (
                    <span
                      key={c.name}
                      className="w-3.5 h-3.5 inline-block shrink-0 border border-black/20 shadow-2xs"
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Botón Cerrar */}
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
            placeholder="Escribir o buscar color..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#e3dac9] font-inter text-[13px] text-[#1e1c13] placeholder:text-[#a5998a] outline-none focus:border-[#c77d2e] shadow-2xs transition-colors"
          />
        </div>

        {/* ── Conteo y estado ── */}
        <div className="flex items-center justify-between font-inter text-[10px] font-bold uppercase tracking-wider text-[#524438] px-0.5">
          <span>PALETA DISPONIBLE ({filteredPalette.length} OPCIONES)</span>
          <span className="text-[#673900]">{selectedNames.length} SELECCIONADOS</span>
        </div>

        {/* ── Lista de colores ── */}
        <div className="max-h-[260px] overflow-y-auto space-y-2 pr-1 divide-y-0">
          {sortedList.length === 0 ? (
            <div className="p-6 text-center font-inter text-[12px] text-[#857466] bg-white border border-[#e8dfcf]">
              No se encontraron colores que coincidan con &quot;{search}&quot;.
            </div>
          ) : (
            sortedList.map((c) => {
              const isChecked = selectedNames.some(
                (n) => n.toLowerCase().trim() === c.name.toLowerCase().trim(),
              );
              const isInMatrix = currentAssignedNames.has(c.name.toLowerCase().trim());

              return (
                <div
                  key={c.name}
                  onClick={() => toggleColor(c.name)}
                  className="flex items-center justify-between p-3 bg-white hover:bg-[#faf7f0] border border-[#e8dfcf] hover:border-[#d9cdb8] cursor-pointer select-none transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Checkbox cuadrado */}
                    <div
                      className={`w-4 h-4 border flex items-center justify-center transition-colors ${
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

                    {/* Muestra de color (swatch) */}
                    <span
                      className="w-5 h-5 inline-block shrink-0 border border-black/15 shadow-2xs"
                      style={{ backgroundColor: c.hex }}
                    />

                    {/* Nombre y HEX */}
                    <div className="flex flex-col text-left">
                      <span className="font-inter text-[13px] font-bold text-[#1e1c13] leading-tight">
                        {c.name}
                      </span>
                      <span className="font-inter text-[11px] font-mono text-[#786c5e] uppercase">
                        {c.hex}
                      </span>
                    </div>
                  </div>

                  {/* Badge de estado */}
                  {isInMatrix ? (
                    <span className="bg-[#dce9d5] text-[#3b5e28] border border-[#c4dcba] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5">
                      EN MATRIZ
                    </span>
                  ) : (
                    <span className="text-[#8a7b6e] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
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
            className="px-6 py-2.5 bg-[#673900] hover:bg-[#7e4600] text-white font-headline text-[15px] sm:text-[16px] uppercase tracking-wider flex items-center gap-2 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">palette</span>
            <span>+ AGREGAR COLORES SELECCIONADOS</span>
          </button>
        </div>
      </div>
    </div>
  );
}
