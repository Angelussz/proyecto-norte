"use client";

import { useState, useEffect } from "react";

export interface ColorFormData {
  id?: string;
  name: string;
  hex: string;
  skuCode?: string;
  assignedItems?: number;
  active?: boolean;
}

interface AdminAddColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (color: ColorFormData) => void;
  onDelete?: (id: string) => void;
  initialData?: ColorFormData | null;
}

export function AdminAddColorModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData = null,
}: AdminAddColorModalProps) {
  const isEdit = Boolean(initialData);

  const [name, setName] = useState("");
  const [skuCode, setSkuCode] = useState("");
  const [hex, setHex] = useState("#4F583D");
  const [active, setActive] = useState(true);
  const [assignedItems, setAssignedItems] = useState(0);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || "");
        setSkuCode(initialData.skuCode || "");
        setHex(
          initialData.hex
            ? initialData.hex.startsWith("#")
              ? initialData.hex
              : `#${initialData.hex}`
            : "#4F583D",
        );
        setActive(initialData.active ?? true);
        setAssignedItems(initialData.assignedItems || 0);
      } else {
        setName("");
        setSkuCode("");
        setHex("#4F583D");
        setActive(true);
        setAssignedItems(0);
      }
    }
  }, [isOpen, initialData]);

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleHexTextChange(val: string) {
    const clean = val.replace(/[^0-9A-Fa-f]/g, "").slice(0, 6);
    setHex(`#${clean.toUpperCase()}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      alert("Por favor ingresa el nombre del color / tintura.");
      return;
    }

    const formattedHex = hex.startsWith("#") ? hex.toUpperCase() : `#${hex.toUpperCase()}`;
    const autoSku = skuCode.trim()
      ? skuCode.trim().toUpperCase()
      : name
          .trim()
          .replace(/[^A-Za-z]/g, "")
          .slice(0, 3)
          .toUpperCase() || "CLR";

    onSave({
      id: initialData?.id,
      name: name.trim(),
      skuCode: autoSku,
      hex: formattedHex,
      assignedItems,
      active,
    });
    onClose();
  }

  function handleDelete() {
    if (initialData?.id && onDelete) {
      onDelete(initialData.id);
      onClose();
    }
  }

  const cleanHex = hex.replace("#", "");

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      {/* Backdrop click */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-[#fff9ed] border border-[#d8c3b2]/60 shadow-2xl flex flex-col overflow-hidden z-10 my-auto">
        {/* ── Modal Header ── */}
        <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-[#d8c3b2]/30 bg-[#faf3e4] flex flex-col gap-1.5 relative">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 bg-[#d8e7cf] text-[#121f10] font-inter text-[10px] uppercase font-bold tracking-widest">
              ATELIER NORTE · PALETA CROMÁTICA
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-[#524438] hover:text-[#ba1a1a] transition-colors p-1 cursor-pointer"
              title="Cerrar ventana"
            >
              <span className="material-symbols-outlined text-[20px] block">close</span>
            </button>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="material-symbols-outlined text-[#33402f] text-[24px]">palette</span>
            <h2 className="font-headline text-[24px] sm:text-[28px] uppercase tracking-wide text-[#1e1c13] leading-none">
              {isEdit
                ? `EDITAR TINTURA: ${name || initialData?.name}`
                : "AÑADIR NUEVA TINTURA OFICIAL"}
            </h2>
          </div>
          <p className="font-inter text-[12px] text-[#524438]">
            {isEdit
              ? "Modifica el nombre del tono, código identificador SKU y valor cromático hexadecimal oficial."
              : "Registra una nueva tintura homologada para telas y prendas oficiales del atelier."}
          </p>
        </div>

        {/* ── Modal Body / Form ── */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 flex flex-col gap-5 bg-[#fff9ed]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="flex flex-col gap-1">
              <label className="font-inter text-[11px] uppercase tracking-wider text-[#524438] font-semibold flex items-center gap-1">
                <span>NOMBRE DEL COLOR / TINTURA</span>
                <span className="text-[#673900] font-bold">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Verde Oliva, Arena Natural"
                className="w-full bg-white px-4 py-2 text-[#1e1c13] font-inter text-[13px] border border-[#d8c3b2]/60 focus:border-[#673900] focus:outline-none placeholder:text-[#857466]/70 transition-colors"
              />
            </div>

            {/* Código SKU */}
            <div className="flex flex-col gap-1">
              <label className="font-inter text-[11px] uppercase tracking-wider text-[#524438] font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span>SKU (3 LETRAS)</span>
                  <span className="text-[#673900] font-bold">*</span>
                </span>
                <span
                  className="material-symbols-outlined text-[15px] text-[#857466] hover:text-[#673900] cursor-help transition-colors"
                  title="Código de 3 letras que identifica al color."
                >
                  info
                </span>
              </label>
              <input
                type="text"
                maxLength={3}
                value={skuCode}
                onChange={(e) => setSkuCode(e.target.value.toUpperCase())}
                placeholder="Ej: VRD"
                className="w-full bg-white px-4 py-2 text-[#1e1c13] font-mono text-[13px] uppercase border border-[#d8c3b2]/60 focus:border-[#673900] focus:outline-none placeholder:text-[#857466]/70 transition-colors"
              />
              <span className="font-inter text-[11px] text-[#524438] mt-0.5">
                Posición en SKU: <strong className="font-mono text-[#673900]">NRT-???-LNO</strong>
              </span>
            </div>
          </div>

          {/* Selector de color HEX */}
          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-[11px] uppercase tracking-wider text-[#524438] font-semibold flex items-center gap-1">
              <span>VALOR CROMÁTICO HEXADECIMAL</span>
              <span className="text-[#673900] font-bold">*</span>
            </label>
            <div className="flex items-center gap-3 bg-white p-2.5 border border-[#d8c3b2]/60">
              <label
                className="w-10 h-10 border border-[#d8c3b2]/80 shrink-0 shadow-sm flex items-center justify-center cursor-pointer relative"
                style={{ backgroundColor: hex }}
                title="Haz clic para seleccionar el color"
              >
                <input
                  type="color"
                  value={hex}
                  onChange={(e) => setHex(e.target.value.toUpperCase())}
                  className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                />
                <span className="material-symbols-outlined text-[16px] text-white/90 drop-shadow">
                  colorize
                </span>
              </label>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-mono text-[14px] font-semibold text-[#1e1c13]">#</span>
                  <input
                    type="text"
                    maxLength={6}
                    value={cleanHex}
                    onChange={(e) => handleHexTextChange(e.target.value)}
                    placeholder="4F583D"
                    className="w-full font-mono text-[14px] text-[#1e1c13] bg-transparent focus:outline-none uppercase font-semibold"
                  />
                </div>
                <span className="font-inter text-[11px] text-[#54624f]">
                  Tono verificado para tinción en base vegetal, algodón orgánico y lino.
                </span>
              </div>
            </div>
          </div>

          {/* Bloque: Prendas vinculadas / Disponibilidad */}
          <div className="p-4 bg-[#faf3e4] border border-[#d8c3b2]/40 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#d8c3b2]/20 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#33402f] text-[18px]">
                  checkroom
                </span>
                <span className="font-inter text-[11px] uppercase font-semibold text-[#1e1c13]">
                  Vinculación en Catálogo
                </span>
              </div>
              <span className="font-mono font-semibold text-[11px] text-[#33402f] bg-[#eee8d9] px-2 py-0.5 border border-[#d8c3b2]/30">
                {assignedItems} prendas vinculadas en catálogo
              </span>
            </div>
            {/* Advertencia de impacto */}
            <div className="flex items-start gap-2.5 p-3 bg-[#fff3e0] border border-[#f5c28e] text-[#7a3300]">
              <span className="material-symbols-outlined text-[18px] text-[#c77d2e] shrink-0 mt-0.5">
                warning
              </span>
              <p className="font-inter text-[12px] leading-relaxed">
                <strong className="font-bold uppercase tracking-wider block text-[11px] mb-0.5 text-[#6b2c00]">
                  Atención:
                </strong>
                Los cambios se aplicarán a todas las prendas que usan este color. Cualquier
                modificación en el nombre, código o tono actualizará automáticamente las prendas
                vinculadas en el catálogo y su matriz de inventario.
              </p>
            </div>
          </div>

          {/* ── Modal Footer ── */}
          <div className="flex items-center justify-between pt-4 border-t border-[#d8c3b2]/30 flex-wrap gap-3">
            {isEdit && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-4 py-2 border border-[#d8c3b2]/40 text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors font-inter text-[11px] uppercase tracking-wider cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>Eliminar Tintura</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 border border-[#d8c3b2]/60 text-[#524438] hover:text-[#1e1c13] hover:bg-[#faf3e4] transition-colors font-inter text-[11px] uppercase tracking-wider cursor-pointer bg-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#673900] hover:bg-[#894d00] text-white font-headline text-[18px] uppercase tracking-wider transition-colors shadow-sm flex items-center gap-1.5 active:translate-y-px cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">check</span>
                <span>{isEdit ? "Guardar Cambios" : "Crear Color"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
