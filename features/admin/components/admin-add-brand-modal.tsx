"use client";

import { useState, useEffect } from "react";

export interface BrandFormData {
  id?: string;
  name: string;
  skuPrefix: string;
  description: string;
  assignedItems: number;
  active: boolean;
}

interface AdminAddBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (brand: BrandFormData) => void;
  onDelete?: (id: string) => void;
  initialData?: BrandFormData | null;
}

export function AdminAddBrandModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData = null,
}: AdminAddBrandModalProps) {
  const isEdit = Boolean(initialData);

  const [name, setName] = useState("");
  const [skuPrefix, setSkuPrefix] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [assignedItems, setAssignedItems] = useState(0);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || "");
        setSkuPrefix(initialData.skuPrefix || "");
        setDescription(initialData.description || "");
        setActive(initialData.active ?? true);
        setAssignedItems(initialData.assignedItems || 0);
      } else {
        setName("");
        setSkuPrefix("");
        setDescription("");
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      alert("Por favor ingresa el nombre de la marca / firma.");
      return;
    }

    onSave({
      id: initialData?.id,
      name: name.trim().toUpperCase(),
      skuPrefix: skuPrefix.trim().toUpperCase(),
      description: description.trim(),
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
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#d8e7cf] text-[#121f10] font-inter text-[10px] uppercase font-bold tracking-widest">
                ATELIER NORTE · LÍNEAS Y FIRMAS
              </span>
              <span className="px-2 py-0.5 bg-[#e8e2d4] text-[#524438] font-mono text-[11px] uppercase tracking-wider font-semibold">
                {isEdit ? `MODO EDICIÓN · ID: ${initialData?.id || "BRD"}` : "NUEVA LÍNEA / FIRMA"}
              </span>
            </div>
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
            <span className="material-symbols-outlined text-[#c77d2e] text-[24px]">bookmark</span>
            <h2 className="font-headline text-[24px] sm:text-[28px] uppercase tracking-wide text-[#1e1c13] leading-none">
              {isEdit ? `EDITAR MARCA: ${name || initialData?.name}` : "AÑADIR NUEVA MARCA / FIRMA"}
            </h2>
          </div>
          <p className="font-inter text-[12px] text-[#524438]">
            {isEdit
              ? "Modifica los metadatos de catalogación, prefijo SKU y visibilidad en catálogo público."
              : "Registra una nueva etiqueta textil o línea de atelier vinculada al catálogo oficial."}
          </p>
        </div>

        {/* ── Modal Body / Form ── */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 flex flex-col gap-5 bg-[#fff9ed]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="flex flex-col gap-1">
              <label className="font-inter text-[11px] uppercase tracking-wider text-[#524438] font-semibold flex items-center gap-1">
                <span>NOMBRE DE LA MARCA / LÍNEA</span>
                <span className="text-[#673900] font-bold">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: NORTE ESSENTIALS"
                className="w-full bg-white px-4 py-2 text-[#1e1c13] font-inter text-[13px] border border-[#d8c3b2]/60 focus:border-[#673900] focus:outline-none placeholder:text-[#857466]/70 transition-colors"
              />
            </div>

            {/* Prefijo SKU */}
            <div className="flex flex-col gap-1">
              <label className="font-inter text-[11px] uppercase tracking-wider text-[#524438] font-semibold flex items-center gap-1">
                <span>PREFIJO SKU / IDENTIFICADOR</span>
                <span className="text-[#673900] font-bold">*</span>
              </label>
              <input
                type="text"
                value={skuPrefix}
                onChange={(e) => setSkuPrefix(e.target.value.toUpperCase())}
                placeholder="Ej: NRT-ESS"
                className="w-full bg-white px-4 py-2 text-[#1e1c13] font-mono text-[13px] uppercase border border-[#d8c3b2]/60 focus:border-[#673900] focus:outline-none placeholder:text-[#857466]/70 transition-colors"
              />
              <span className="font-inter text-[11px] text-[#524438] mt-0.5">
                Prefijo antepuesto a los códigos SKU (ej: NRT-ESS-01).
              </span>
            </div>
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-1">
            <label className="font-inter text-[11px] uppercase tracking-wider text-[#524438] font-semibold">
              DESCRIPCIÓN DE LA MARCA / LÍNEA
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el concepto de la línea, lugar de procedencia, materiales y patronaje..."
              className="w-full bg-white px-4 py-2 text-[#1e1c13] font-inter text-[13px] border border-[#d8c3b2]/60 focus:border-[#673900] focus:outline-none resize-none placeholder:text-[#857466]/70 leading-relaxed transition-colors"
            />
          </div>

          {/* Bloque: Prendas Asignadas / Visibilidad */}
          <div className="p-4 bg-[#faf3e4] border border-[#d8c3b2]/40 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#d8c3b2]/20 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#33402f] text-[18px]">
                  checkroom
                </span>
                <span className="font-inter text-[11px] uppercase font-semibold text-[#1e1c13]">
                  Prendas Asignadas Actualmente
                </span>
              </div>
              <span className="font-mono font-semibold text-[11px] text-[#33402f] bg-[#eee8d9] px-2 py-0.5 border border-[#d8c3b2]/30">
                {assignedItems} prendas vinculadas en catálogo
              </span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input
                id="modal-brand-active"
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4 rounded-none border-[#d8c3b2] text-[#673900] focus:ring-0 focus:outline-none cursor-pointer"
              />
              <label
                htmlFor="modal-brand-active"
                className="font-inter text-[11px] uppercase tracking-wider text-[#1e1c13] font-medium cursor-pointer"
              >
                Línea activa y visible en tienda online
              </label>
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
                <span>Eliminar Marca</span>
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
                <span>{isEdit ? "Guardar Cambios" : "Crear Marca"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
