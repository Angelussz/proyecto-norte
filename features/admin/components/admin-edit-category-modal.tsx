"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface AssignedSizeSystem {
  id: string;
  name: string;
  colorDot?: string;
  sizes: string[];
}

export interface EditableCategory {
  id: string;
  name: string;
  sku: string;
  slug: string;
  active: boolean;
  description: string;
  systems?: AssignedSizeSystem[];
  systemName?: string;
  systemSizes?: string[];
  uniqueSizes?: string[];
  addedSizes?: string[];
}

interface AdminEditCategoryModalProps {
  category: EditableCategory | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCategory: EditableCategory) => Promise<void> | void;
  onDelete: (categoryId: string) => Promise<void> | void;
}

const CATALOG_SYSTEM_OPTIONS: AssignedSizeSystem[] = [
  {
    id: "alfa_std",
    name: "Sistema Alfa Estándar (XXS - 3XL)",
    colorDot: "bg-[#33402f]",
    sizes: ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL"],
  },
  {
    id: "talles_unicos",
    name: "Talles Únicos & Adaptables",
    colorDot: "bg-[#c77d2e]",
    sizes: ["Talle Único", "Talle Ajustable"],
  },
  {
    id: "num_sastreria",
    name: "Numérico Sastrería / Calce Estructurado",
    colorDot: "bg-[#54624f]",
    sizes: ["38", "40", "42", "44", "46"],
  },
  {
    id: "num_eu",
    name: "Numérico EU / Cono Sur (34, 36, 38, 40...)",
    colorDot: "bg-[#54624f]",
    sizes: ["34", "36", "38", "40", "42", "44", "46", "48"],
  },
  {
    id: "num_us",
    name: "Numérico US / Denim (28, 30, 32, 34...)",
    colorDot: "bg-[#33402f]",
    sizes: ["28", "30", "32", "34", "36", "38", "40"],
  },
  {
    id: "med_cintura",
    name: "Medidas en Pulgadas / Cintura",
    colorDot: "bg-[#c77d2e]",
    sizes: ["30W", "32W", "34W", "36W", "38W"],
  },
  {
    id: "med_anat",
    name: "Medidas Anatómicas Exactas (cm)",
    colorDot: "bg-[#54624f]",
    sizes: ["88 cm", "92 cm", "96 cm", "100 cm", "104 cm"],
  },
  {
    id: "calzado_eu",
    name: "Calzado Adulto Unisex EU (35 - 46)",
    colorDot: "bg-[#33402f]",
    sizes: ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
  },
];

export function AdminEditCategoryModal({
  category,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: AdminEditCategoryModalProps) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [assignedSystems, setAssignedSystems] = useState<AssignedSizeSystem[]>([]);
  const [selectedCatalogSystemId, setSelectedCatalogSystemId] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Drag and drop reordering state for systems
  const [draggedSystemIndex, setDraggedSystemIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Sync state when category changes or modal opens
  useEffect(() => {
    if (isOpen && category) {
      setName(category.name);
      const rawSku = category.sku || "";
      const cleanSku = rawSku.includes("-") ? rawSku.split("-").pop()! : rawSku;
      setSku(cleanSku.slice(0, 3).toUpperCase());
      setDescription(category.description);
      setError("");

      if (category.systems && category.systems.length > 0) {
        setAssignedSystems(category.systems);
      } else {
        // Build initial systems from category fields if not present
        const initial: AssignedSizeSystem[] = [];
        if (category.systemSizes && category.systemSizes.length > 0) {
          initial.push({
            id: `sys-${category.id}-1`,
            name: `${category.systemName || "Sistema Alfa Estándar"} (${category.systemSizes[0]} - ${category.systemSizes[category.systemSizes.length - 1]})`,
            colorDot: "bg-[#33402f]",
            sizes: category.systemSizes,
          });
        }
        if (category.uniqueSizes && category.uniqueSizes.length > 0) {
          initial.push({
            id: `sys-${category.id}-2`,
            name: "Talles Únicos & Adaptables",
            colorDot: "bg-[#c77d2e]",
            sizes: category.uniqueSizes,
          });
        }
        if (category.addedSizes && category.addedSizes.length > 0) {
          initial.push({
            id: `sys-${category.id}-3`,
            name: "Numérico Sastrería / Calce Estructurado",
            colorDot: "bg-[#54624f]",
            sizes: category.addedSizes,
          });
        }
        setAssignedSystems(
          initial.length > 0
            ? initial
            : [
                {
                  id: "alfa_std",
                  name: "Sistema Alfa Estándar (XXS - 3XL)",
                  colorDot: "bg-[#33402f]",
                  sizes: ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL"],
                },
              ],
        );
      }
    }
  }, [isOpen, category]);

  // Handle ESC key
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

  if (!isOpen || !category) return null;

  function handleAddSystem() {
    if (!selectedCatalogSystemId) return;
    const found = CATALOG_SYSTEM_OPTIONS.find((s) => s.id === selectedCatalogSystemId);
    if (!found) return;

    // Check if already assigned
    const exists = assignedSystems.some((s) => s.name === found.name);
    if (exists) {
      setSelectedCatalogSystemId("");
      return;
    }

    setAssignedSystems((prev) => [
      ...prev,
      {
        id: `${found.id}-${Date.now()}`,
        name: found.name,
        colorDot: found.colorDot,
        sizes: [...found.sizes],
      },
    ]);
    setSelectedCatalogSystemId("");
  }

  function handleRemoveSystem(systemId: string) {
    setAssignedSystems((prev) => prev.filter((s) => s.id !== systemId));
  }

  // Drag and drop handlers
  function handleDragStart(index: number) {
    setDraggedSystemIndex(index);
  }

  function handleDragEnter(targetIndex: number) {
    if (draggedSystemIndex === null || draggedSystemIndex === targetIndex) return;

    setAssignedSystems((prev) => {
      const copy = [...prev];
      const [movedItem] = copy.splice(draggedSystemIndex, 1);
      copy.splice(targetIndex, 0, movedItem);
      return copy;
    });

    setDraggedSystemIndex(targetIndex);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (draggedSystemIndex !== null && draggedSystemIndex !== index) {
      setDragOverIndex(index);
    }
  }

  function handleDragEnd() {
    setDraggedSystemIndex(null);
    setDragOverIndex(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!category || isSubmitting) return;
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("El nombre de la categoría es obligatorio");
      return;
    }

    const rawSku = sku.trim().toUpperCase() || category.sku || "";
    const cleanSku = rawSku.includes("-") ? rawSku.split("-").pop()! : rawSku;
    const trimmedSku = cleanSku.slice(0, 3).toUpperCase();
    const computedSlug = `/${trimmedName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")}`;

    const updated: EditableCategory = {
      ...category,
      name: trimmedName.toUpperCase(),
      sku: trimmedSku,
      slug: computedSlug,
      description: description.trim(),
      systems: assignedSystems,
      systemSizes: assignedSystems[0]?.sizes || category.systemSizes,
      uniqueSizes: assignedSystems[1]?.sizes || category.uniqueSizes,
    };

    try {
      setIsSubmitting(true);
      setError("");
      await onSave(updated);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al actualizar la categoría");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteClick() {
    if (!category || isSubmitting) return;
    try {
      setIsSubmitting(true);
      setError("");
      await onDelete(category.id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al eliminar la categoría");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1e1c13]/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-2xl bg-white border border-[#d8c3b2]/50 shadow-2xl z-10 overflow-hidden flex flex-col transition-all transform my-auto max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#eee8d9] px-6 py-4 border-b border-[#d8c3b2]/40 flex items-center justify-between shrink-0">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#d8e7cf] text-[#121f10] font-inter uppercase tracking-widest font-semibold text-[10px]">
                ID: {category.id.toUpperCase()}
              </span>
              <span className="font-mono text-[11px] text-[#673900] font-bold px-1.5 py-0.5 bg-[#fff9ed] border border-[#d8c3b2]/30">
                MODO EDICIÓN
              </span>
            </div>
            <h2 className="font-headline text-[24px] uppercase text-[#1e1c13] tracking-wide mt-1">
              EDITAR CATEGORÍA: {category.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="w-8 h-8 flex items-center justify-center text-[#524438] hover:text-[#1e1c13] hover:bg-[#f4eddf] transition-colors rounded-none cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[75vh]">
            {error && (
              <div className="p-3 bg-[#ffdad6] text-[#93000a] font-inter text-[12px] border border-[#ba1a1a]/30">
                {error}
              </div>
            )}

            {/* Category Title & SKU Prefix */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label
                  htmlFor="edit-cat-name"
                  className="font-inter text-[11px] uppercase tracking-wider text-[#1e1c13] font-semibold flex items-center justify-between"
                >
                  <span>TÍTULO / NOMBRE DE LA CATEGORÍA</span>
                  <span className="text-[11px] text-[#524438] font-normal tracking-normal font-mono">
                    Campo obligatorio
                  </span>
                </label>
                <input
                  id="edit-cat-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Ej: Sobrecamisas..."
                  className="w-full h-11 px-4 bg-[#faf3e4] text-[#1e1c13] font-inter text-[13px] border border-[#d8c3b2]/50 focus:border-[#673900] focus:bg-white focus:outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="edit-cat-sku"
                  className="font-inter text-[11px] uppercase tracking-wider text-[#1e1c13] font-semibold flex items-center justify-between"
                >
                  <span>CÓDIGO SKU</span>
                  <span className="text-[11px] text-[#524438] font-normal tracking-normal font-mono">
                    3 letras
                  </span>
                </label>
                <input
                  id="edit-cat-sku"
                  type="text"
                  maxLength={3}
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  placeholder="Ej: ACC"
                  className="w-full h-11 px-4 bg-[#faf3e4] text-[#673900] font-mono text-[13px] font-bold border border-[#d8c3b2]/50 focus:border-[#673900] focus:bg-white focus:outline-none transition-colors uppercase"
                />
              </div>
            </div>

            {/* Category Description */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="edit-cat-desc"
                  className="font-inter text-[11px] uppercase tracking-wider text-[#1e1c13] font-semibold"
                >
                  DESCRIPCIÓN DE LA CATEGORÍA
                </label>
                <span className="text-[11px] text-[#524438] font-normal font-mono">
                  Slug: {category.slug}
                </span>
              </div>
              <textarea
                id="edit-cat-desc"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-4 bg-[#faf3e4] text-[#1e1c13] font-inter text-[13px] border border-[#d8c3b2]/50 focus:border-[#673900] focus:bg-white focus:outline-none transition-colors leading-relaxed resize-none"
              />
            </div>

            {/* Section 3: Sistemas de Talles Asignados */}
            <div className="flex flex-col gap-3 pt-2 border-t border-[#d8c3b2]/30">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-inter text-[12px] uppercase font-semibold text-[#1e1c13] tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#673900] text-[18px]">
                      straighten
                    </span>
                    SISTEMAS DE TALLES ASIGNADOS A ESTA CATEGORÍA
                  </span>
                  <span className="font-mono text-[11px] text-[#524438] px-1.5 py-0.5 bg-[#f4eddf] border border-[#d8c3b2]/40">
                    {assignedSystems.length} Sistemas Activos
                  </span>
                </div>
                <p className="font-inter text-[11px] text-[#524438]">
                  Configura o elimina los sistemas de tallaje habilitados para las prendas de este
                  grupo.
                </p>
              </div>

              {/* Assigned Systems Cards */}
              <div className="flex flex-col gap-2 mt-1">
                {assignedSystems.map((sys, idx) => {
                  const isDragging = draggedSystemIndex === idx;
                  const isOver = dragOverIndex === idx;

                  return (
                    <div
                      key={sys.id}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnter={() => handleDragEnter(idx)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "bg-[#fff9ed] p-3 border flex items-center justify-between gap-3 group transition-colors shadow-sm select-none",
                        isDragging
                          ? "opacity-30 border-dashed border-[#673900] scale-98"
                          : isOver
                            ? "border-2 border-[#673900] bg-white ring-2 ring-[#c77d2e]/30"
                            : "border-[#d8c3b2]/40 hover:border-[#673900]/60",
                      )}
                    >
                      <button
                        type="button"
                        className="cursor-grab active:cursor-grabbing text-[#857466] hover:text-[#673900] shrink-0 flex items-center justify-center p-0.5"
                        title="Arrastrar para reordenar sistema"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          drag_indicator
                        </span>
                      </button>

                      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "w-2 h-2 rounded-full shrink-0",
                              sys.colorDot || "bg-[#33402f]",
                            )}
                          />
                          <span className="font-inter text-[12px] font-semibold text-[#1e1c13] uppercase tracking-wide truncate">
                            {sys.name}
                          </span>
                          <span className="text-[10px] font-mono text-[#524438] bg-[#f4eddf] px-1 py-0.5 shrink-0">
                            {sys.sizes.length} tallas
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {sys.sizes.map((size) => (
                            <span
                              key={size}
                              className="px-2 py-0.5 bg-[#eee8d9] text-[#1e1c13] font-mono text-[11px] font-semibold border border-[#d8c3b2]/30"
                            >
                              {size}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveSystem(sys.id)}
                        className="p-1.5 text-[#524438] hover:text-[#ba1a1a] hover:bg-[#f4eddf] transition-colors shrink-0 cursor-pointer"
                        title="Eliminar sistema de talle"
                      >
                        <span className="text-[16px] leading-none select-none">🗑️</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Inline Selector for Adding Another System */}
              <div className="flex items-center gap-2 pt-2">
                <select
                  value={selectedCatalogSystemId}
                  onChange={(e) => setSelectedCatalogSystemId(e.target.value)}
                  className="flex-1 h-9 bg-white px-3 text-[#1e1c13] font-inter text-[13px] border border-[#d8c3b2]/50 focus:border-[#673900] focus:outline-none cursor-pointer"
                >
                  <option value="">+ Asignar otro sistema de talles...</option>
                  {CATALOG_SYSTEM_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddSystem}
                  className="h-9 px-4 bg-[#54624f] hover:bg-[#33402f] text-[#fff9ed] font-inter text-[11px] uppercase tracking-wider font-semibold transition-colors active:translate-y-px inline-flex items-center justify-center shrink-0 cursor-pointer"
                >
                  + AGREGAR
                </button>
              </div>
            </div>

            {/* Info banner */}
            <div className="p-3 bg-[#faf3e4] border border-[#d8c3b2]/30 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#673900] text-[18px] shrink-0">
                info
              </span>
              <p className="font-inter text-[#524438] text-[11px] leading-tight">
                Las modificaciones aplicadas se sincronizarán en tiempo real con las fichas de
                producto asociadas a esta categoría.
              </p>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-[#f4eddf] border-t border-[#d8c3b2]/40 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 mt-auto">
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
              <button
                type="button"
                onClick={handleDeleteClick}
                disabled={isSubmitting}
                className="font-inter text-[11px] text-[#ba1a1a] hover:underline uppercase font-semibold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[14px]">delete</span>
                <span>Eliminar Categoría</span>
              </button>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-[#524438] hover:text-[#1e1c13] hover:bg-[#eee8d9] font-inter text-[11px] uppercase tracking-wider font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                CANCELAR
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-[#673900] hover:bg-[#894d00] disabled:opacity-50 disabled:cursor-not-allowed text-white font-headline text-[17px] uppercase tracking-wider transition-all duration-150 shadow-sm active:translate-y-px flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isSubmitting ? "hourglass_top" : "check"}
                </span>
                <span>{isSubmitting ? "GUARDANDO…" : "GUARDAR CAMBIOS"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
