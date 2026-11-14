"use client";

import { useState } from "react";
import {
  AdminAddBrandModal,
  type BrandFormData,
} from "@/features/admin/components/admin-add-brand-modal";
import {
  AdminAddColorModal,
  type ColorFormData,
} from "@/features/admin/components/admin-add-color-modal";
import {
  useBrands,
  useCreateBrand,
  useUpdateBrand,
  useDeleteBrand,
} from "@/features/admin/hooks/useBrands";
import {
  useColors,
  useCreateColor,
  useUpdateColor,
  useDeleteColor,
} from "@/features/admin/hooks/useColors";
import type { BrandDto, ColorDto } from "@/features/admin/types/brand-color.interface";

// ── Tipos locales para el modal (view-layer) ──────────────────────────────────

type AtelierBrandLocal = {
  id: string;
  name: string;
  skuPrefix?: string;
  description: string;
  assignedItems: number;
  iconColor: "primary" | "secondary" | "mustard";
  locked?: boolean;
  active?: boolean;
};

type OfficialColorLocal = {
  id: string;
  name: string;
  hex: string;
  skuCode?: string;
  assignedItems?: number;
  active?: boolean;
};

function dtoToBrandLocal(b: BrandDto): AtelierBrandLocal {
  return {
    id: b.id,
    name: b.name,
    skuPrefix: b.skuPrefix,
    description: b.description ?? "",
    assignedItems: b.assignedItems,
    iconColor: (b.iconColor as "primary" | "secondary" | "mustard") ?? "secondary",
    locked: b.locked,
    active: b.active,
  };
}

function dtoToColorLocal(c: ColorDto): OfficialColorLocal {
  return {
    id: c.id,
    name: c.name,
    hex: c.hex,
    skuCode: c.skuCode,
    assignedItems: c.assignedItems,
    active: c.active,
  };
}

export function AdminColorsBrandsView() {
  // ── React Query ───────────────────────────────────────────────────────────
  const { data: brandsData = [], isLoading: brandsLoading, isError: brandsError } = useBrands();
  const { data: colorsData = [], isLoading: colorsLoading, isError: colorsError } = useColors();

  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const deleteBrand = useDeleteBrand();

  const createColor = useCreateColor();
  const updateColor = useUpdateColor();
  const deleteColor = useDeleteColor();

  // ── Mapear DTOs a view-types ──────────────────────────────────────────────
  const brands = brandsData.map(dtoToBrandLocal);
  const colors = colorsData.map(dtoToColorLocal);

  // ── Form states - Color ───────────────────────────────────────────────────
  const [newColorName, setNewColorName] = useState("");
  const [newColorSku, setNewColorSku] = useState("");
  const [newColorHex, setNewColorHex] = useState("#2C3E50");

  // ── Form states - Brand ───────────────────────────────────────────────────
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandSku, setNewBrandSku] = useState("");
  const [newBrandDesc, setNewBrandDesc] = useState("");

  // ── Modales de Marca y Color ──────────────────────────────────────────────
  const [isAddBrandModalOpen, setIsAddBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<AtelierBrandLocal | null>(null);

  const [isAddColorModalOpen, setIsAddColorModalOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<OfficialColorLocal | null>(null);

  // ── Feedback Notification ─────────────────────────────────────────────────
  const [notification, setNotification] = useState<string | null>(null);

  function triggerNotice(msg: string) {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  }

  // ── Handlers para Marcas ──────────────────────────────────────────────────
  async function handleSaveBrand(data: BrandFormData) {
    try {
      if (data.id) {
        await updateBrand.mutateAsync({
          id: data.id,
          body: {
            name: data.name,
            skuPrefix: data.skuPrefix,
            description: data.description,
            active: data.active,
          },
        });
        triggerNotice(`Marca "${data.name}" actualizada con éxito.`);
      } else {
        await createBrand.mutateAsync({
          name: data.name,
          skuPrefix: data.skuPrefix || "BRD",
          description: data.description || "Nueva firma textil registrada en el atelier.",
          iconColor: "secondary",
          active: data.active,
        });
        triggerNotice(`Marca "${data.name}" registrada con éxito.`);
      }
    } catch {
      triggerNotice("Error al guardar la marca. Intenta de nuevo.");
    }
  }

  function handleInlineAddBrand(e: React.FormEvent) {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    const autoSku = newBrandSku.trim()
      ? newBrandSku.trim().toUpperCase().slice(0, 3)
      : newBrandName
          .trim()
          .replace(/[^A-Za-z]/g, "")
          .slice(0, 3)
          .toUpperCase() || "BRD";

    handleSaveBrand({
      name: newBrandName.trim().toUpperCase(),
      skuPrefix: autoSku,
      description: newBrandDesc.trim() || "Nueva firma textil registrada en el atelier.",
      assignedItems: 0,
      active: true,
    });
    setNewBrandName("");
    setNewBrandSku("");
    setNewBrandDesc("");
  }

  async function handleDeleteBrand(id: string) {
    const toDelete = brands.find((b) => b.id === id);
    if (!toDelete || toDelete.locked) return;
    if (confirm(`¿Eliminar la firma "${toDelete.name}"?`)) {
      try {
        await deleteBrand.mutateAsync(id);
        triggerNotice(`Firma "${toDelete.name}" eliminada.`);
      } catch {
        triggerNotice("Error al eliminar la marca.");
      }
    }
  }

  // ── Handlers para Colores ─────────────────────────────────────────────────
  async function handleSaveColor(data: ColorFormData) {
    try {
      if (data.id) {
        await updateColor.mutateAsync({
          id: data.id,
          body: {
            name: data.name,
            hex: data.hex,
            skuCode: data.skuCode,
            active: data.active,
          },
        });
        triggerNotice(`Tintura "${data.name}" actualizada con éxito.`);
      } else {
        await createColor.mutateAsync({
          name: data.name,
          skuCode: data.skuCode || "CLR",
          hex: data.hex,
          active: data.active,
        });
        triggerNotice(`Tintura "${data.name}" añadida con éxito.`);
      }
    } catch {
      triggerNotice("Error al guardar el color. Intenta de nuevo.");
    }
  }

  function handleInlineAddColor(e: React.FormEvent) {
    e.preventDefault();
    if (!newColorName.trim()) return;
    const autoSku = newColorSku.trim()
      ? newColorSku.trim().toUpperCase().slice(0, 3)
      : newColorName
          .trim()
          .replace(/[^A-Za-z]/g, "")
          .slice(0, 3)
          .toUpperCase() || "CLR";

    const formattedHex = newColorHex.startsWith("#")
      ? newColorHex.toUpperCase()
      : `#${newColorHex.toUpperCase()}`;

    handleSaveColor({
      name: newColorName.trim(),
      skuCode: autoSku,
      hex: formattedHex,
      assignedItems: 0,
      active: true,
    });
    setNewColorName("");
    setNewColorSku("");
    setNewColorHex("#2C3E50");
  }

  async function handleDeleteColor(id: string) {
    const toDelete = colors.find((c) => c.id === id);
    if (!toDelete) return;
    if (confirm(`¿Eliminar la tintura oficial "${toDelete.name}" (${toDelete.hex})?`)) {
      try {
        await deleteColor.mutateAsync(id);
        triggerNotice(`Tintura "${toDelete.name}" eliminada.`);
      } catch {
        triggerNotice("Error al eliminar el color.");
      }
    }
  }

  const totalAssignedGarments = brands.reduce((acc, b) => acc + b.assignedItems, 0);

  return (
    <main className="w-full bg-surface min-h-[calc(100vh-4rem)]">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1e1c13] text-[#fff9ed] px-5 py-3 border-l-4 border-mustard font-inter text-[13px] shadow-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-mustard text-[18px]">info</span>
          <span>{notification}</span>
        </div>
      )}

      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* ── 1. Top 4 KPI Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Cartas de Color */}
          <div className="bg-surface-container-low p-6 flex flex-col justify-between relative overflow-hidden group border border-outline-variant/30 shadow-sm">
            <div className="flex items-start justify-between relative z-10">
              <span className="font-inter text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">
                Cartas de Color
              </span>
              <span className="material-symbols-outlined text-primary text-[20px]">palette</span>
            </div>
            <div className="mt-4 relative z-10">
              <span className="font-headline text-[36px] text-on-surface tracking-wide block leading-none">
                {colorsLoading ? "…" : colors.length}
              </span>
              <span className="font-inter text-[12px] text-on-surface-variant uppercase block mt-1 font-medium">
                Tinturas Oficiales
              </span>
              <p className="font-inter text-[12px] text-secondary mt-1">
                Hexadecimal vinculado, 100% activo en catálogo
              </p>
            </div>
            <div className="absolute -right-2 -bottom-2 opacity-10 pointer-events-none select-none">
              <span
                className="material-symbols-outlined text-on-surface leading-none block"
                style={{ fontSize: "95px" }}
              >
                colors
              </span>
            </div>
          </div>

          {/* KPI 2: Marcas & Líneas Atelier */}
          <div className="bg-surface-container-low p-6 flex flex-col justify-between relative overflow-hidden group border border-outline-variant/30 shadow-sm">
            <div className="flex items-start justify-between relative z-10">
              <span className="font-inter text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">
                Marcas &amp; Líneas Atelier
              </span>
              <span className="material-symbols-outlined text-mustard text-[20px]">verified</span>
            </div>
            <div className="mt-4 relative z-10">
              <span className="font-headline text-[36px] text-on-surface tracking-wide block leading-none">
                {brandsLoading ? "…" : brands.length}
              </span>
              <span className="font-inter text-[12px] text-on-surface-variant uppercase block mt-1 font-medium">
                Firmas Registradas
              </span>
              <p className="font-inter text-[12px] text-secondary mt-1">
                Sello de confección oficial
              </p>
            </div>
            <div className="absolute -right-2 -bottom-2 opacity-10 pointer-events-none select-none">
              <span
                className="material-symbols-outlined text-on-surface leading-none block"
                style={{ fontSize: "95px" }}
              >
                label
              </span>
            </div>
          </div>

          {/* KPI 3: Prendas Asignadas */}
          <div className="bg-surface-container-low p-6 flex flex-col justify-between relative overflow-hidden group border border-outline-variant/30 shadow-sm">
            <div className="flex items-start justify-between relative z-10">
              <span className="font-inter text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">
                Prendas Asignadas
              </span>
              <span className="material-symbols-outlined text-forest-green text-[20px]">
                checkroom
              </span>
            </div>
            <div className="mt-4 relative z-10">
              <span className="font-headline text-[36px] text-on-surface tracking-wide block leading-none">
                {totalAssignedGarments}
              </span>
              <span className="font-inter text-[12px] text-on-surface-variant uppercase block mt-1 font-medium">
                Prendas Totales
              </span>
              <p className="font-inter text-[12px] text-secondary mt-1">
                Vinculadas a marcas del atelier
              </p>
            </div>
            <div className="absolute -right-2 -bottom-2 opacity-10 pointer-events-none select-none">
              <span
                className="material-symbols-outlined text-on-surface leading-none block"
                style={{ fontSize: "95px" }}
              >
                inventory_2
              </span>
            </div>
          </div>

          {/* KPI 4: Disponibilidad */}
          <div className="bg-surface-container-low p-6 flex flex-col justify-between relative overflow-hidden group border border-outline-variant/30 shadow-sm">
            <div className="flex items-start justify-between relative z-10">
              <span className="font-inter text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">
                Disponibilidad
              </span>
              <span className="material-symbols-outlined text-secondary text-[20px]">sync</span>
            </div>
            <div className="mt-4 relative z-10">
              <span className="font-headline text-[36px] text-on-surface tracking-wide block leading-none">
                100%
              </span>
              <span className="font-inter text-[12px] text-on-surface-variant uppercase block mt-1 font-medium">
                Sincronizado
              </span>
              <p className="font-inter text-[12px] text-secondary mt-1">
                Con tienda online y fichas técnicas
              </p>
            </div>
            <div className="absolute -right-2 -bottom-2 opacity-10 pointer-events-none select-none">
              <span
                className="material-symbols-outlined text-on-surface leading-none block"
                style={{ fontSize: "95px" }}
              >
                cloud_done
              </span>
            </div>
          </div>
        </div>

        {/* ── 2. SECCIÓN 1: Marcas & Firmas de Atelier ── */}
        <section className="bg-surface-container-low p-6 lg:p-8 shadow-sm border border-outline-variant/40 flex flex-col gap-6">
          {/* Header de la Sección 1 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#33402f] flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[#fff9ed] text-[26px]">
                  verified
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-headline text-[24px] uppercase tracking-wide text-on-surface leading-tight">
                    1. MARCAS &amp; FIRMAS DE ATELIER
                  </h2>
                  <span className="px-2 py-0.5 bg-secondary-fixed text-on-secondary-fixed font-inter text-[10px] uppercase font-bold tracking-widest">
                    LÍNEAS Y COLABORACIONES
                  </span>
                </div>
                <p className="font-inter text-[12px] text-on-surface-variant mt-0.5">
                  Etiquetas textiles, submarcas del atelier y firmas de diseñadores invitados
                  vinculadas al catálogo oficial.
                </p>
              </div>
            </div>
          </div>

          {/* Formulario para Añadir Firma */}
          <div className="bg-surface p-4 border border-outline-variant/30">
            <h3 className="font-headline text-[18px] uppercase text-on-surface tracking-wider mb-3">
              REGISTRAR NUEVA FIRMA O LÍNEA
            </h3>
            <form
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start"
              onSubmit={handleInlineAddBrand}
            >
              <div className="sm:col-span-3 relative flex flex-col gap-1">
                <label className="font-inter text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                  Nombre de la Marca / Línea
                </label>
                <input
                  type="text"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="Ej: NORTE Studio, Cápsula Menorca"
                  className="w-full bg-surface-container-lowest px-4 py-2 text-on-surface font-inter text-[14px] placeholder:text-outline/70 border border-outline-variant/40 focus:border-primary focus:outline-none rounded-none"
                />
              </div>
              <div className="sm:col-span-2 relative flex flex-col gap-1">
                <label className="font-inter text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                  SKU (3 LETRAS)
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    maxLength={3}
                    value={newBrandSku}
                    onChange={(e) => setNewBrandSku(e.target.value.toUpperCase())}
                    placeholder="???-NRT-LNO"
                    className="w-full bg-surface-container-lowest pl-3 pr-8 py-2 text-on-surface font-mono text-[14px] uppercase placeholder:text-outline/70 border border-outline-variant/40 focus:border-primary focus:outline-none rounded-none"
                  />
                  <span
                    className="material-symbols-outlined absolute right-2 text-outline hover:text-primary text-[15px] cursor-help transition-colors select-none"
                    title="Código de 3 letras que identifica a la marca."
                  >
                    info
                  </span>
                </div>
              </div>
              <div className="sm:col-span-4 relative flex flex-col gap-1">
                <label className="font-inter text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                  Descripción Breve
                </label>
                <input
                  type="text"
                  value={newBrandDesc}
                  onChange={(e) => setNewBrandDesc(e.target.value)}
                  placeholder="Ej: Lugar o tienda de procedencia (ej: Boutique Barrio Salamanca)"
                  className="w-full bg-surface-container-lowest px-4 py-2 text-on-surface font-inter text-[14px] placeholder:text-outline/70 border border-outline-variant/40 focus:border-primary focus:outline-none rounded-none"
                />
              </div>
              <div className="sm:col-span-3 flex flex-col justify-end self-end">
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-secondary hover:bg-forest-green text-[#fff9ed] font-headline text-[18px] uppercase tracking-wider transition-colors active:translate-y-px shadow-sm flex items-center justify-center gap-1.5 rounded-none cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>AÑADIR MARCA</span>
                </button>
              </div>
            </form>
          </div>

          {/* Listado Horizontal de Marcas Registradas en 3 columnas */}
          {brandsError ? (
            <p className="font-inter text-[13px] text-error">
              Error al cargar las marcas. Recarga la página.
            </p>
          ) : brandsLoading ? (
            <p className="font-inter text-[13px] text-on-surface-variant animate-pulse">
              Cargando marcas…
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {brands.map((brand) => {
                const bookmarkColor =
                  brand.iconColor === "primary"
                    ? "text-primary"
                    : brand.iconColor === "mustard"
                      ? "text-mustard"
                      : "text-secondary";

                return (
                  <div
                    key={brand.id}
                    className="bg-surface p-4 border border-outline-variant/30 flex flex-col justify-between gap-3 hover:border-primary transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-[18px] ${bookmarkColor}`}>
                          bookmark
                        </span>
                        <span className="font-headline text-[18px] uppercase text-on-surface tracking-wider">
                          {brand.name}
                        </span>
                      </div>
                      {!brand.locked && (
                        <button
                          type="button"
                          onClick={() => handleDeleteBrand(brand.id)}
                          className="text-on-surface-variant hover:text-error transition-colors p-1 cursor-pointer"
                          title={`Eliminar marca ${brand.name}`}
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      )}
                    </div>
                    <p className="font-inter text-[12px] text-on-surface-variant leading-relaxed">
                      {brand.description}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                      <span
                        className={`font-inter text-[11px] uppercase font-semibold ${
                          brand.locked ? "text-forest-green" : "text-on-surface-variant"
                        }`}
                      >
                        {brand.assignedItems} Prendas Asignadas
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingBrand(brand)}
                        className="font-inter text-[11px] text-primary hover:underline uppercase font-medium cursor-pointer"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── 3. SECCIÓN 2: Paleta de Colores & Tinturas Globales ── */}
        <section className="bg-surface-container-low p-6 lg:p-8 shadow-sm border border-outline-variant/40 flex flex-col gap-6">
          {/* Header de la Sección 2 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#c77d2e] flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[#1e1c13] text-[26px]">
                  palette
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-headline text-[24px] uppercase tracking-wide text-on-surface leading-tight">
                    2. PALETA DE COLORES &amp; TINTURAS GLOBALES
                  </h2>
                  <span className="px-2 py-0.5 bg-primary-fixed text-on-primary-fixed font-inter text-[10px] uppercase font-bold tracking-widest">
                    VALORES GLOBALES ATELIER
                  </span>
                </div>
                <p className="font-inter text-[12px] text-on-surface-variant mt-0.5">
                  Carta cromática oficial registrada para teñidos en taller. Estos colores están
                  disponibles en toda la tienda online y fichas técnicas.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto font-mono text-[12px] text-on-surface-variant bg-surface-container px-3 py-1 border border-outline-variant/30">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                format_paint
              </span>
              <span>{colorsLoading ? "…" : colors.length} Tinturas Registradas</span>
            </div>
          </div>

          {/* Formulario para Añadir Color Global */}
          <div className="bg-surface p-4 border border-outline-variant/30">
            <h3 className="font-headline text-[18px] uppercase text-on-surface tracking-wider mb-3">
              REGISTRAR NUEVA TINTURA OFICIAL
            </h3>
            <form
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
              onSubmit={handleInlineAddColor}
            >
              <div className="sm:col-span-4 flex flex-col gap-1">
                <label className="font-inter text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                  Nombre del Color / Tintura
                </label>
                <input
                  type="text"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  placeholder="Ej: Añil Natural, Índigo Atelier"
                  className="w-full bg-surface-container-lowest px-4 py-2.5 text-on-surface font-inter text-[14px] placeholder:text-outline/70 border border-outline-variant/40 focus:border-primary focus:outline-none rounded-none"
                />
              </div>
              <div className="sm:col-span-2 flex flex-col gap-1">
                <label className="font-inter text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                  SKU (3 LETRAS)
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    maxLength={3}
                    value={newColorSku}
                    onChange={(e) => setNewColorSku(e.target.value.toUpperCase())}
                    placeholder="NRT-???-LNO"
                    className="w-full bg-surface-container-lowest pl-3 pr-8 py-2.5 text-on-surface font-mono text-[14px] uppercase placeholder:text-outline/70 border border-outline-variant/40 focus:border-primary focus:outline-none rounded-none"
                  />
                  <span
                    className="material-symbols-outlined absolute right-2 text-outline hover:text-primary text-[15px] cursor-help transition-colors select-none"
                    title="Código de 3 letras que identifica al color."
                  >
                    info
                  </span>
                </div>
              </div>
              <div className="sm:col-span-3 flex flex-col gap-1">
                <label className="font-inter text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                  Color Hex
                </label>
                <div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-2 border border-outline-variant/40 h-[42px]">
                  <label
                    className="w-7 h-7 p-0 border border-outline-variant/60 cursor-pointer rounded-none shrink-0 relative"
                    style={{ backgroundColor: newColorHex }}
                    title="Elegir muestra de color"
                  >
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value.toUpperCase())}
                      className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                    />
                  </label>
                  <input
                    type="text"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-full font-mono text-[12px] text-on-surface bg-transparent focus:outline-none uppercase"
                    placeholder="#000000"
                  />
                </div>
              </div>
              <div className="sm:col-span-3 flex flex-col justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setEditingColor(null);
                    setIsAddColorModalOpen(true);
                  }}
                  className="w-full py-2.5 px-4 bg-secondary hover:bg-forest-green text-[#fff9ed] font-headline text-[18px] uppercase tracking-wider transition-colors active:translate-y-px shadow-sm flex items-center justify-center gap-1.5 rounded-none cursor-pointer h-[42px]"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>AÑADIR COLOR</span>
                </button>
              </div>
            </form>
          </div>

          {/* Grid de Colores Activos con Swatches Físicos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-inter text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                TINTURAS Y TONOS ACTIVOS EN CATÁLOGO
              </span>
              <span className="font-inter text-[11px] text-on-surface-variant">
                Click en la muestra para previsualizar
              </span>
            </div>
            {colorsError ? (
              <p className="font-inter text-[13px] text-error">
                Error al cargar los colores. Recarga la página.
              </p>
            ) : colorsLoading ? (
              <p className="font-inter text-[13px] text-on-surface-variant animate-pulse">
                Cargando tinturas…
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {colors.map((color) => (
                  <div
                    key={color.id}
                    className="bg-surface border border-outline-variant/30 flex flex-col group hover:border-primary transition-colors overflow-hidden"
                  >
                    {/* Header: SKU + acciones */}
                    <div className="flex items-center justify-between px-3 py-2 border-b border-outline-variant/20 bg-surface-container-lowest">
                      <span className="font-mono text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
                        SKU: {color.skuCode ?? "—"}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingColor(color)}
                          className="text-on-surface-variant hover:text-primary transition-colors p-0.5 cursor-pointer"
                          title={`Editar ${color.name}`}
                        >
                          <span className="material-symbols-outlined text-[15px]">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteColor(color.id)}
                          className="text-on-surface-variant hover:text-error transition-colors p-0.5 cursor-pointer"
                          title={`Eliminar color ${color.name}`}
                        >
                          <span className="material-symbols-outlined text-[15px]">close</span>
                        </button>
                      </div>
                    </div>

                    {/* Muestra de color */}
                    <div
                      className="w-full h-16 cursor-pointer group-hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: color.hex }}
                      onClick={() => setEditingColor(color)}
                      title="Click para editar"
                    />

                    {/* Nombre y hex */}
                    <div className="px-3 py-2.5 flex flex-col gap-0.5">
                      <span className="font-inter text-[13px] font-semibold text-on-surface leading-tight truncate">
                        {color.name}
                      </span>
                      <span className="font-mono text-[11px] text-on-surface-variant uppercase">
                        {color.hex}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ── Modal Añadir / Editar Marca (con fondo sombreado) ── */}
      <AdminAddBrandModal
        isOpen={isAddBrandModalOpen || Boolean(editingBrand)}
        onClose={() => {
          setIsAddBrandModalOpen(false);
          setEditingBrand(null);
        }}
        onSave={handleSaveBrand}
        onDelete={editingBrand && !editingBrand.locked ? handleDeleteBrand : undefined}
        initialData={
          editingBrand
            ? {
                id: editingBrand.id,
                name: editingBrand.name,
                skuPrefix: editingBrand.skuPrefix || "",
                description: editingBrand.description,
                assignedItems: editingBrand.assignedItems,
                active: editingBrand.active ?? true,
              }
            : null
        }
      />

      {/* ── Modal Añadir / Editar Color / Tintura (con fondo sombreado) ── */}
      <AdminAddColorModal
        isOpen={isAddColorModalOpen || Boolean(editingColor)}
        onClose={() => {
          setIsAddColorModalOpen(false);
          setEditingColor(null);
        }}
        onSave={handleSaveColor}
        onDelete={handleDeleteColor}
        initialData={
          editingColor
            ? {
                id: editingColor.id,
                name: editingColor.name,
                hex: editingColor.hex,
                skuCode: editingColor.skuCode,
                assignedItems: editingColor.assignedItems,
                active: editingColor.active ?? true,
              }
            : null
        }
      />
    </main>
  );
}
