"use client";

import { useState, useEffect } from "react";

export interface NewSizeOption {
  id: string;
  label: string;
  badge?: string;
  badgeVariant?: "recommended" | "active" | "gender" | "workshop";
  description: string;
  sizes: string[];
  active: boolean;
}

export interface NewSizeCategory {
  id: string;
  title: string;
  description: string;
  options: NewSizeOption[];
}

interface AdminAddSizeSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: NewSizeCategory) => void;
  groupNumber?: number;
}

interface SystemDraft {
  id: string;
  title: string;
  description: string;
  sizes: string[];
  newSizeInput: string;
}

export function AdminAddSizeSystemModal({
  isOpen,
  onClose,
  onSave,
  groupNumber = 8,
}: AdminAddSizeSystemModalProps) {
  const [groupTitle, setGroupTitle] = useState("ROPA DE ABRIGO PESADA, TAPADOS Y PARCAS");
  const [groupDescription, setGroupDescription] = useState(
    "Prendas exteriores técnicas, parkas, sobretodos y tapados envolventes con calce holgado diseñados para capas intermedias o sastrería artesanal.",
  );

  const [systems, setSystems] = useState<SystemDraft[]>([
    {
      id: "sys-1",
      title: "Sistema Alfa Abrigo con Holgura (Calce Oversize)",
      description:
        "Escala estándar para capas intermedias, forros polares y parkas técnicas con holgura de 6 a 8 cm.",
      sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"],
      newSizeInput: "",
    },
  ]);

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

  function handleAddSize(systemId: string) {
    setSystems((prev) =>
      prev.map((sys) => {
        if (sys.id !== systemId) return sys;
        const trimmed = sys.newSizeInput.trim();
        if (!trimmed || sys.sizes.includes(trimmed)) return sys;
        return {
          ...sys,
          sizes: [...sys.sizes, trimmed],
          newSizeInput: "",
        };
      }),
    );
  }

  function handleRemoveSize(systemId: string, sizeToRemove: string) {
    setSystems((prev) =>
      prev.map((sys) => {
        if (sys.id !== systemId) return sys;
        return {
          ...sys,
          sizes: sys.sizes.filter((s) => s !== sizeToRemove),
        };
      }),
    );
  }

  function handleRemoveSystem(systemId: string) {
    setSystems((prev) => prev.filter((sys) => sys.id !== systemId));
  }

  function handleAddAnotherSystem() {
    const nextIndex = systems.length + 1;
    setSystems((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        title: `Sistema ${nextIndex} Personalizado`,
        description: "Descripción de escala y desahogos para este sistema.",
        sizes: ["S", "M", "L", "XL"],
        newSizeInput: "",
      },
    ]);
  }

  function handleSave() {
    const newCat: NewSizeCategory = {
      id: `grupo-${groupNumber}-${Date.now()}`,
      title: `${groupNumber}. ${groupTitle.trim() || "Grupo Personalizado"}`,
      description: groupDescription.trim(),
      options: systems.map((sys) => ({
        id: sys.id,
        label: sys.title.trim() || "Sistema de Talles",
        badge: "NUEVO",
        badgeVariant: "active",
        description: sys.description.trim(),
        sizes: sys.sizes,
        active: true,
      })),
    };

    onSave(newCat);
    onClose();
  }

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1e1c13]/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative bg-[#fff9ed] border border-[#d8c3b2]/60 shadow-2xl max-w-3xl w-full my-auto z-10 flex flex-col overflow-hidden max-h-[90vh]">
        {/* ── Modal Header ── */}
        <div className="px-6 py-5 bg-[#faf3e4] border-b border-[#d8c3b2]/40 flex items-start justify-between gap-4 shrink-0">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#33402f] text-[#fff9ed] font-mono text-[9px] uppercase tracking-widest font-bold">
                ATELIER NORTE
              </span>
              <span className="px-2 py-0.5 bg-[#d8e7cf] text-[#121f10] font-mono text-[9px] uppercase tracking-wider font-semibold">
                GRUPO NUEVO #{groupNumber}
              </span>
            </div>
            <h2 className="font-headline text-[28px] sm:text-[34px] uppercase tracking-wide text-[#1e1c13] leading-none mt-1">
              + AGREGAR NUEVO GRUPO &amp; SISTEMA DE TALLES
            </h2>
            <p className="font-inter text-[12px] text-[#524438] leading-relaxed">
              Parametrización oficial de tallaje para catálogo del atelier NORTE
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="p-1.5 text-[#524438] hover:text-[#673900] hover:bg-[#e8e2d4] transition-colors cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[22px] block">close</span>
          </button>
        </div>

        {/* ── Modal Scrollable Body ── */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6">
          {/* Card 1: Tipo de Ropa General / Grupo Maestro */}
          <div className="bg-[#faf3e4] p-5 border border-[#d8c3b2]/40 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#d8c3b2]/30">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#673900] text-[20px]">
                  category
                </span>
                <span className="font-headline text-[18px] uppercase tracking-wider text-[#1e1c13]">
                  TIPO DE ROPA GENERAL / GRUPO MAESTRO
                </span>
              </div>
              <span className="px-2 py-0.5 bg-[#673900] text-white font-mono text-[10px] uppercase font-bold tracking-widest">
                GRUPO #{groupNumber}
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {/* Field 1: Título */}
              <div className="flex flex-col gap-1.5">
                <label className="font-inter text-[11px] uppercase tracking-wider text-[#1e1c13] font-semibold flex items-center justify-between">
                  <span>Título (Ropa para la cual se usará el sistema de talles)</span>
                  <span className="text-[#673900] font-mono text-[10px] uppercase font-bold">
                    Requerido
                  </span>
                </label>
                <input
                  type="text"
                  value={groupTitle}
                  onChange={(e) => setGroupTitle(e.target.value)}
                  placeholder="Ej: ROPA DE ABRIGO PESADA, TAPADOS Y PARCAS"
                  className="w-full px-4 py-2.5 bg-white text-[#1e1c13] placeholder:text-[#857466]/70 font-inter text-[13px] border border-[#d8c3b2]/50 focus:border-[#673900] focus:outline-none transition-colors"
                />
              </div>

              {/* Field 2: Descripción */}
              <div className="flex flex-col gap-1.5">
                <label className="font-inter text-[11px] uppercase tracking-wider text-[#1e1c13] font-semibold">
                  Descripción del Tipo de Ropa
                </label>
                <textarea
                  rows={2}
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="Describe el tipo de prenda, su confección, desahogos y para qué prendas específicas se aplicará este grupo..."
                  className="w-full px-4 py-2 bg-white text-[#1e1c13] placeholder:text-[#857466]/70 font-inter text-[13px] border border-[#d8c3b2]/50 focus:border-[#673900] focus:outline-none transition-colors leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Sistemas de Talles para este Grupo */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-1 border-b border-[#d8c3b2]/30">
              <span className="material-symbols-outlined text-[#673900] text-[20px]">
                straighten
              </span>
              <span className="font-headline text-[18px] uppercase tracking-wider text-[#1e1c13]">
                SISTEMAS DE TALLES PARA ESTE GRUPO
              </span>
            </div>

            {/* List of systems */}
            <div className="flex flex-col gap-4">
              {systems.map((sys, sIndex) => (
                <div
                  key={sys.id}
                  className="bg-[#fff9ed] p-5 border-2 border-[#673900]/40 shadow-sm flex flex-col gap-3 relative"
                >
                  {/* System Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#d8c3b2]/20">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#673900] text-white font-mono text-[10px] uppercase font-bold tracking-wider">
                        SISTEMA {sIndex + 1}
                      </span>
                      <span className="font-inter text-[12px] font-semibold text-[#1e1c13] uppercase tracking-wider">
                        Configuración de Tallas
                      </span>
                    </div>
                    {systems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSystem(sys.id)}
                        className="text-[#524438] hover:text-[#ba1a1a] transition-colors flex items-center gap-1 font-inter text-[11px] uppercase tracking-wider cursor-pointer"
                        title="Eliminar este sistema"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        <span>Eliminar</span>
                      </button>
                    )}
                  </div>

                  {/* System Title */}
                  <div className="flex flex-col gap-1">
                    <label className="font-inter text-[11px] uppercase tracking-wider text-[#1e1c13] font-semibold">
                      Título del Sistema de Talles
                    </label>
                    <input
                      type="text"
                      value={sys.title}
                      onChange={(e) =>
                        setSystems((prev) =>
                          prev.map((s) => (s.id === sys.id ? { ...s, title: e.target.value } : s)),
                        )
                      }
                      placeholder="Ej: Sistema Alfa Abrigo con Holgura"
                      className="w-full px-4 py-2 bg-white text-[#1e1c13] placeholder:text-[#857466]/70 font-inter text-[13px] border border-[#d8c3b2]/50 focus:border-[#673900] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* System Description */}
                  <div className="flex flex-col gap-1">
                    <label className="font-inter text-[11px] uppercase tracking-wider text-[#1e1c13] font-semibold">
                      Descripción del Sistema
                    </label>
                    <input
                      type="text"
                      value={sys.description}
                      onChange={(e) =>
                        setSystems((prev) =>
                          prev.map((s) =>
                            s.id === sys.id ? { ...s, description: e.target.value } : s,
                          ),
                        )
                      }
                      placeholder="Ej: Escala estándar para capas intermedias y parkas"
                      className="w-full px-4 py-2 bg-white text-[#1e1c13] placeholder:text-[#857466]/70 font-inter text-[13px] border border-[#d8c3b2]/50 focus:border-[#673900] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* System Sizes (Matriz de tallas) */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    <label className="font-inter text-[11px] uppercase tracking-wider text-[#1e1c13] font-semibold flex items-center justify-between">
                      <span>Talles que llevará este sistema (Matriz de tallas)</span>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#f4eddf] font-mono text-[9px] text-[#524438] uppercase tracking-wider border border-[#d8c3b2]/30">
                          <span className="material-symbols-outlined text-[13px] text-[#673900]">
                            drag_indicator
                          </span>
                          <span>Arrastra para reordenar</span>
                        </span>
                      </div>
                    </label>

                    {/* Chips / Pills container */}
                    <div className="flex flex-wrap gap-1.5 p-3 bg-[#faf3e4] border border-[#d8c3b2]/40 min-h-[52px] items-center">
                      {sys.sizes.map((size) => (
                        <span
                          key={size}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#d8c3b2]/50 hover:border-[#673900]/50 text-[#1e1c13] shadow-sm select-none transition-all"
                        >
                          <svg
                            className="w-3 h-3 text-[#524438]/60 shrink-0"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <circle cx="8" cy="6" r="2" />
                            <circle cx="16" cy="6" r="2" />
                            <circle cx="8" cy="12" r="2" />
                            <circle cx="16" cy="12" r="2" />
                            <circle cx="8" cy="18" r="2" />
                            <circle cx="16" cy="18" r="2" />
                          </svg>
                          <span className="font-mono text-[11px] font-semibold">{size}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSize(sys.id, size)}
                            className="hover:text-[#ba1a1a] transition-colors text-[#524438] text-[11px] ml-0.5 cursor-pointer font-bold"
                            title="Eliminar talle"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Add size input bar */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={sys.newSizeInput}
                        onChange={(e) =>
                          setSystems((prev) =>
                            prev.map((s) =>
                              s.id === sys.id ? { ...s, newSizeInput: e.target.value } : s,
                            ),
                          )
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddSize(sys.id);
                          }
                        }}
                        placeholder="+ Escribir o añadir talle (ej: 5XL, Único o 42)..."
                        className="flex-1 px-3 py-1.5 bg-white text-[#1e1c13] placeholder:text-[#857466]/70 font-inter text-[13px] border border-[#d8c3b2]/50 focus:border-[#673900] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSize(sys.id)}
                        className="px-4 py-1.5 bg-[#54624f] hover:bg-[#33402f] text-[#fff9ed] font-headline text-[15px] uppercase tracking-wider transition-colors active:translate-y-px shrink-0 cursor-pointer"
                      >
                        + Añadir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add another system button */}
            <button
              type="button"
              onClick={handleAddAnotherSystem}
              className="flex items-center justify-center gap-1.5 px-4 py-3 bg-[#faf3e4] hover:bg-[#e8e2d4] text-[#673900] font-headline text-[16px] uppercase tracking-wider transition-colors border-2 border-dashed border-[#d8c3b2]/60 hover:border-[#673900] active:translate-y-px mt-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>+ AGREGAR OTRO SISTEMA DE TALLES A ESTA CATEGORÍA</span>
            </button>
          </div>
        </div>

        {/* ── Modal Footer ── */}
        <div className="px-6 py-4 bg-[#eee8d9] border-t border-[#d8c3b2]/40 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-[#fff9ed] text-[#524438] hover:text-[#1e1c13] font-headline text-[17px] uppercase tracking-wider border border-[#d8c3b2]/50 transition-colors w-full sm:w-auto text-center cursor-pointer"
          >
            CANCELAR
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 bg-[#673900] hover:bg-[#894d00] text-white font-headline text-[17px] uppercase tracking-wider transition-all shadow-md active:translate-y-px flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">check</span>
            <span>+ CREAR Y GUARDAR SISTEMA DE TALLES #{groupNumber}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
