"use client";

import { useState, useEffect } from "react";

export interface CreateCategoryData {
  name: string;
  sku: string;
  description: string;
}

interface AdminAddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateCategoryData) => Promise<void> | void;
}

export function AdminAddCategoryModal({ isOpen, onClose, onSave }: AdminAddCategoryModalProps) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset fields when opening
  useEffect(() => {
    if (isOpen) {
      setName("");
      setSku("");
      setDescription("");
      setError("");
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("El nombre de la categoría es obligatorio");
      return;
    }

    const rawSku = sku.trim().toUpperCase();
    const cleanSku = rawSku.includes("-") ? rawSku.split("-").pop()! : rawSku;
    const trimmedSku =
      cleanSku.slice(0, 3) ||
      trimmedName
        .slice(0, 3)
        .toUpperCase()
        .replace(/[^A-Z]/g, "X");

    try {
      setIsSubmitting(true);
      setError("");
      await onSave({
        name: trimmedName.toUpperCase(),
        sku: trimmedSku,
        description:
          description.trim() ||
          "Nueva categoría registrada en el catálogo textil de NORTE Atelier.",
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al crear la categoría");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1e1c13]/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-white border border-[#d8c3b2]/50 shadow-2xl z-10 overflow-hidden flex flex-col transition-all transform my-auto">
        {/* Header */}
        <div className="bg-[#eee8d9] px-6 py-4 border-b border-[#d8c3b2]/40 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#d8e7cf] text-[#121f10] font-inter uppercase tracking-widest font-semibold text-[10px]">
                ATELIER NORTE · NUEVO REGISTRO
              </span>
              <span className="font-mono text-[11px] text-[#673900] font-bold px-1.5 py-0.5 bg-[#fff9ed] border border-[#d8c3b2]/30">
                ESTADO: NUEVA CATEGORÍA
              </span>
            </div>
            <h2 className="font-headline text-[24px] uppercase text-[#1e1c13] tracking-wide mt-1">
              + AGREGAR NUEVA CATEGORÍA
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="w-8 h-8 flex items-center justify-center text-[#524438] hover:text-[#1e1c13] hover:bg-[#f4eddf] transition-colors rounded-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {error && (
            <div className="p-3 bg-[#ffdad6] text-[#93000a] font-inter text-[12px] border border-[#ba1a1a]/30">
              {error}
            </div>
          )}

          {/* Title & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label
                htmlFor="modal-cat-name"
                className="font-inter text-[11px] uppercase tracking-wider text-[#1e1c13] font-semibold flex items-center justify-between"
              >
                <span>TÍTULO / NOMBRE DE LA CATEGORÍA</span>
                <span className="text-[11px] text-[#524438] font-normal tracking-normal font-mono">
                  Obligatorio
                </span>
              </label>
              <input
                id="modal-cat-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Ej: Sobrecamisas, Pantalones..."
                className="w-full h-11 px-4 bg-[#faf3e4] text-[#1e1c13] font-inter text-[13px] border border-[#d8c3b2]/50 focus:border-[#673900] focus:bg-white focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="modal-cat-sku"
                className="font-inter text-[11px] uppercase tracking-wider text-[#1e1c13] font-semibold flex items-center justify-between"
              >
                <span>CÓDIGO SKU</span>
                <span className="text-[11px] text-[#673900] font-bold font-mono">3 letras</span>
              </label>
              <input
                id="modal-cat-sku"
                type="text"
                maxLength={3}
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="Ej: ACC"
                className="w-full h-11 px-4 bg-[#faf3e4] text-[#1e1c13] font-mono text-[13px] uppercase border border-[#d8c3b2]/50 focus:border-[#673900] focus:bg-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="modal-cat-desc"
              className="font-inter text-[11px] uppercase tracking-wider text-[#1e1c13] font-semibold flex items-center justify-between"
            >
              <span>DESCRIPCIÓN DE LA CATEGORÍA</span>
              <span className="text-[11px] text-[#524438] font-normal tracking-normal font-mono">
                Visible en catálogo
              </span>
            </label>
            <textarea
              id="modal-cat-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe las características principales de esta categoría, tipo de tejido y rango de prendas..."
              className="w-full p-4 bg-[#faf3e4] text-[#1e1c13] font-inter text-[13px] border border-[#d8c3b2]/50 focus:border-[#673900] focus:bg-white focus:outline-none transition-colors leading-relaxed resize-none"
            />
          </div>

          {/* Info Banner */}
          <div className="p-3 bg-[#faf3e4] border border-[#d8c3b2]/30 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#673900] text-[18px] shrink-0">
              info
            </span>
            <p className="font-inter text-[#524438] text-[11px] leading-tight">
              Al crear esta categoría, quedará disponible de inmediato en la gestión de atributos,
              talles y asignación de productos.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#d8c3b2]/30 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#524438] hover:text-[#1e1c13] hover:bg-[#eee8d9] font-inter text-[11px] uppercase tracking-wider font-semibold transition-colors cursor-pointer"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#673900] hover:bg-[#894d00] disabled:opacity-50 disabled:cursor-not-allowed text-white font-headline text-[17px] uppercase tracking-wider transition-all duration-150 shadow-sm active:translate-y-px flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isSubmitting ? "hourglass_top" : "add"}
              </span>
              <span>{isSubmitting ? "CREANDO…" : "CREAR CATEGORÍA"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
