"use client";

import { useState, useMemo, useEffect } from "react";
import { useSizeGroups } from "@/features/admin/hooks/useSizeGroups";

export interface SizeOption {
  size: string;
  system: string;
}

interface AdminAddInventorySizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    sku: string;
    category?: string;
    sizes: string[];
    colors: { name: string; hex: string }[];
  } | null;
  onSaveSizes: (productId: string, selectedSizes: string[]) => void;
}

// Curva de talles de respaldo por defecto
const DEFAULT_SIZES: SizeOption[] = [
  { size: "36 (XS)", system: "Indumentaria General" },
  { size: "38 (S)", system: "Indumentaria General" },
  { size: "40 (M)", system: "Indumentaria General" },
  { size: "42 (L)", system: "Indumentaria General" },
  { size: "44 (XL)", system: "Indumentaria General" },
  { size: "46 (XXL)", system: "Indumentaria General" },
  { size: "XS", system: "Letras Internacionales" },
  { size: "S", system: "Letras Internacionales" },
  { size: "M", system: "Letras Internacionales" },
  { size: "L", system: "Letras Internacionales" },
  { size: "XL", system: "Letras Internacionales" },
  { size: "XXL", system: "Letras Internacionales" },
  { size: "39", system: "Calzado Europeo" },
  { size: "40", system: "Calzado Europeo" },
  { size: "41", system: "Calzado Europeo" },
  { size: "42", system: "Calzado Europeo" },
  { size: "43", system: "Calzado Europeo" },
  { size: "44", system: "Calzado Europeo" },
  { size: "45", system: "Calzado Europeo" },
  { size: "TALLE ÚNICO", system: "Accesorios" },
];

export function AdminAddInventorySizeModal({
  isOpen,
  onClose,
  product,
  onSaveSizes,
}: AdminAddInventorySizeModalProps) {
  const { data: sizeGroupsData } = useSizeGroups();

  // Consolidar todos los talles disponibles (DB + base + los que ya tenga el producto)
  const fullSizeList = useMemo(() => {
    const map = new Map<string, SizeOption>();

    // 1. Agregar los talles que ya tiene asignados el producto
    if (product?.sizes) {
      product.sizes.forEach((s) => {
        map.set(s.toLowerCase().trim(), {
          size: s,
          system: product.category ? `${product.category} (Actual)` : "Matriz Actual",
        });
      });
    }

    // 2. Agregar grupos y sistemas de la base de datos si existen
    if (sizeGroupsData && Array.isArray(sizeGroupsData)) {
      sizeGroupsData.forEach((group) => {
        group.systems
          .filter((sys) => sys.active)
          .forEach((sys) => {
            sys.sizes.forEach((sz) => {
              const key = sz.toLowerCase().trim();
              if (!map.has(key)) {
                map.set(key, {
                  size: sz,
                  system: `${group.title} • ${sys.label}`,
                });
              }
            });
          });
      });
    }

    // 3. Agregar talles por defecto
    DEFAULT_SIZES.forEach((s) => {
      const key = s.size.toLowerCase().trim();
      if (!map.has(key)) {
        map.set(key, s);
      }
    });

    return Array.from(map.values());
  }, [sizeGroupsData, product?.sizes, product?.category]);

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  // Sincronizar tallas seleccionadas al abrir el modal para un producto
  useEffect(() => {
    if (isOpen && product) {
      setSelectedSizes([...product.sizes]);
      setSearch("");
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  // Filtrado por buscador
  const filteredSizes = fullSizeList.filter(
    (s) =>
      s.size.toLowerCase().includes(search.toLowerCase()) ||
      s.system.toLowerCase().includes(search.toLowerCase()),
  );

  // Ordenar: primero los que ya están en la matriz del producto
  const currentAssignedSizes = new Set(product.sizes.map((s) => s.toLowerCase().trim()));

  const sortedList = [...filteredSizes].sort((a, b) => {
    const aInMatrix = currentAssignedSizes.has(a.size.toLowerCase().trim());
    const bInMatrix = currentAssignedSizes.has(b.size.toLowerCase().trim());
    if (aInMatrix && !bInMatrix) return -1;
    if (!aInMatrix && bInMatrix) return 1;
    return a.size.localeCompare(b.size, undefined, { numeric: true });
  });

  function toggleSize(size: string) {
    setSelectedSizes((prev) => {
      const exists = prev.some((s) => s.toLowerCase().trim() === size.toLowerCase().trim());
      if (exists) {
        return prev.filter((s) => s.toLowerCase().trim() !== size.toLowerCase().trim());
      } else {
        return [...prev, size];
      }
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

            {/* Muestra de los talles que ya tiene asignados el producto */}
            <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-[#e8dfcf]">
              <span className="font-inter text-[10px] font-bold uppercase tracking-wider text-[#786c5e]">
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
            placeholder="Escribir o buscar talle..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#e3dac9] font-inter text-[13px] text-[#1e1c13] placeholder:text-[#a5998a] outline-none focus:border-[#c77d2e] shadow-2xs transition-colors"
          />
        </div>

        {/* ── Conteo y estado ── */}
        <div className="flex items-center justify-between font-inter text-[10px] font-bold uppercase tracking-wider text-[#524438] px-0.5">
          <span>TALLES DISPONIBLES ({filteredSizes.length} OPCIONES)</span>
          <span className="text-[#673900]">{selectedSizes.length} SELECCIONADOS</span>
        </div>

        {/* ── Lista de talles ── */}
        <div className="max-h-[260px] overflow-y-auto space-y-2 pr-1 divide-y-0">
          {sortedList.length === 0 ? (
            <div className="p-6 text-center font-inter text-[12px] text-[#857466] bg-white border border-[#e8dfcf]">
              No se encontraron talles que coincidan con &quot;{search}&quot;.
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

                    {/* Muestra de talle */}
                    <div className="min-w-[38px] px-2 py-1 bg-[#f7f2e7] border border-[#e4dbcc] flex items-center justify-center">
                      <span className="font-inter text-[12px] font-bold text-[#1e1c13]">
                        {item.size}
                      </span>
                    </div>

                    {/* Nombre y Sistema */}
                    <div className="flex flex-col text-left">
                      <span className="font-inter text-[13px] font-bold text-[#1e1c13] leading-tight">
                        Talle {item.size}
                      </span>
                      <span className="font-inter text-[11px] text-[#786c5e]">{item.system}</span>
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
            <span className="material-symbols-outlined text-[18px]">straighten</span>
            <span>+ AGREGAR TALLES SELECCIONADOS</span>
          </button>
        </div>
      </div>
    </div>
  );
}
