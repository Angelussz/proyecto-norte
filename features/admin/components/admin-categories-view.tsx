"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import {
  AdminAddCategoryModal,
  type CreateCategoryData,
} from "@/features/admin/components/admin-add-category-modal";
import {
  AdminEditCategoryModal,
  type EditableCategory,
  type AssignedSizeSystem,
} from "@/features/admin/components/admin-edit-category-modal";
import {
  useAdminCategories,
  useCreateAdminCategory,
  useUpdateAdminCategory,
  useDeleteAdminCategory,
} from "@/features/admin/hooks/useAdminCategories";
import type { AdminCategoryDto } from "@/features/admin/types/admin-category.interface";

export type CategoryItem = {
  id: string;
  name: string;
  sku: string;
  slug: string;
  active: boolean;
  description: string;
  systems?: AssignedSizeSystem[];
  systemName: string;
  systemSizes: string[];
  uniqueSizes: string[];
  addedSizes: string[];
};

export interface SizeSystemCatalogItem {
  id: string;
  label: string;
  systemName: string;
  sizes: string[];
}

export const SIZE_SYSTEM_CATALOG: SizeSystemCatalogItem[] = [
  {
    id: "num_eu",
    label: "Numérico EU / Cono Sur (34, 36, 38, 40...)",
    systemName: "NUMÉRICO EU / CONO SUR",
    sizes: ["34", "36", "38", "40", "42", "44", "46", "48"],
  },
  {
    id: "num_us",
    label: "Numérico US / México (28, 30, 32, 34...)",
    systemName: "NUMÉRICO US / MÉXICO",
    sizes: ["28", "30", "32", "34", "36", "38", "40"],
  },
  {
    id: "alfa_std",
    label: "Sistema Alfa (XXS, XS, S, M, L, XL, XXL, 3XL)",
    systemName: "SISTEMA ALFA",
    sizes: ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL"],
  },
  {
    id: "calzado_eu",
    label: "Calzado Adulto Unisex EU (35 - 46)",
    systemName: "NUMERACIÓN CALZADO",
    sizes: ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"],
  },
  {
    id: "num_sastreria",
    label: "Numérico Sastrería / Calce Estructurado (38 - 46)",
    systemName: "NUMÉRICO SASTRERÍA",
    sizes: ["38", "40", "42", "44", "46"],
  },
  {
    id: "talles_unicos",
    label: "Talles Únicos & Adaptables (TU, Regulable)",
    systemName: "TALLES ÚNICOS",
    sizes: ["Talle Único", "Talle Ajustable"],
  },
  {
    id: "med_cintura",
    label: "Medidas en Pulgadas / Cintura (30W - 38W)",
    systemName: "MEDIDAS EN PULGADAS",
    sizes: ["30W", "32W", "34W", "36W", "38W"],
  },
  {
    id: "med_anat",
    label: "Medidas Anatómicas Exactas (cm)",
    systemName: "MEDIDAS ANATÓMICAS",
    sizes: ["88 cm", "92 cm", "96 cm", "100 cm", "104 cm"],
  },
];

const LS_CATEGORIES_KEY = "norte-categories-v1";

/** @deprecated – migrado a DB. Se mantiene solo para limpiar localStorage si existe. */
function clearLegacyLS() {
  try {
    localStorage.removeItem(LS_CATEGORIES_KEY);
  } catch {}
}

export function getCategorySystems(cat: CategoryItem): AssignedSizeSystem[] {
  if (cat.systems && cat.systems.length > 0) {
    return cat.systems;
  }
  const result: AssignedSizeSystem[] = [];
  if (cat.systemName && cat.systemSizes && cat.systemSizes.length > 0) {
    result.push({
      id: `sys-${cat.id}-main`,
      name: cat.systemName,
      sizes: cat.systemSizes,
    });
  }
  if (cat.uniqueSizes && cat.uniqueSizes.length > 0) {
    result.push({
      id: `sys-${cat.id}-unicos`,
      name: "TALLES ÚNICOS",
      sizes: cat.uniqueSizes,
    });
  }
  if (cat.addedSizes && cat.addedSizes.length > 0) {
    cat.addedSizes.forEach((item, idx) => {
      const found = SIZE_SYSTEM_CATALOG.find(
        (s) =>
          s.id === item ||
          s.label.toLowerCase().includes(item.toLowerCase()) ||
          s.systemName.toLowerCase().includes(item.toLowerCase()),
      );
      if (found) {
        result.push({
          id: `sys-legacy-${cat.id}-${idx}`,
          name: found.systemName,
          sizes: found.sizes,
        });
      }
    });
  }
  return result;
}

const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: "cat-1",
    name: "SOBRECAMISAS",
    sku: "NRT-LNO",
    slug: "/sobrecamisas",
    active: true,
    description:
      "Prendas de media estación y lino crudo estructurado. 14 prendas activas en tienda.",
    systems: [
      {
        id: "sys-cat-1-alfa",
        name: "SISTEMA ALFA",
        sizes: ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL"],
      },
      {
        id: "sys-cat-1-unicos",
        name: "TALLES ÚNICOS",
        sizes: ["Talle Único", "Talle Ajustable"],
      },
    ],
    systemName: "SISTEMA ALFA",
    systemSizes: ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL"],
    uniqueSizes: ["Talle Único", "Talle Ajustable"],
    addedSizes: [],
  },
  {
    id: "cat-2",
    name: "PANTALONES & SASTRERÍA",
    sku: "NRT-TRJ",
    slug: "/pantalones",
    active: true,
    description:
      "Pantalón ancho, pinzas artesanales y cortes rectos sartoriales. 10 prendas activas.",
    systems: [
      {
        id: "sys-cat-2-num-eu",
        name: "SISTEMA NUMÉRICO EU",
        sizes: ["36", "38", "40", "42", "44", "46", "48"],
      },
      {
        id: "sys-cat-2-unicos",
        name: "TALLES ÚNICOS",
        sizes: ["Talle Único", "Talle Ajustable"],
      },
    ],
    systemName: "SISTEMA NUMÉRICO EU",
    systemSizes: ["36", "38", "40", "42", "44", "46", "48"],
    uniqueSizes: ["Talle Único", "Talle Ajustable"],
    addedSizes: [],
  },
  {
    id: "cat-3",
    name: "CALZADO & ESENCIALES",
    sku: "NRT-ZAP",
    slug: "/calzado",
    active: true,
    description:
      "Alpargatas, mocasines y calzado de confección artesana en suela vegetal. 6 modelos.",
    systems: [
      {
        id: "sys-cat-3-calzado",
        name: "NUMERACIÓN CALZADO",
        sizes: ["38", "39", "40", "41", "42", "43", "44", "45"],
      },
      {
        id: "sys-cat-3-unicos",
        name: "TALLES ÚNICOS",
        sizes: ["Talle Único", "Talle Ajustable"],
      },
    ],
    systemName: "NUMERACIÓN CALZADO",
    systemSizes: ["38", "39", "40", "41", "42", "43", "44", "45"],
    uniqueSizes: ["Talle Único", "Talle Ajustable"],
    addedSizes: [],
  },
  {
    id: "cat-4",
    name: "PRENDAS EXTERIORES",
    sku: "NRT-EXT",
    slug: "/exteriores",
    active: true,
    description:
      "Gabardinas de algodón encerado, saharianas y abrigos desestructurados. 4 referencias.",
    systems: [
      {
        id: "sys-cat-4-alfa",
        name: "SISTEMA ALFA",
        sizes: ["S", "M", "L", "XL", "XXL", "3XL"],
      },
      {
        id: "sys-cat-4-unicos",
        name: "TALLES ÚNICOS",
        sizes: ["Talle Único", "Talle Ajustable"],
      },
    ],
    systemName: "SISTEMA ALFA",
    systemSizes: ["S", "M", "L", "XL", "XXL", "3XL"],
    uniqueSizes: ["Talle Único", "Talle Ajustable"],
    addedSizes: [],
  },
  {
    id: "cat-5",
    name: "ACCESORIOS & MARROQUINERÍA",
    sku: "NRT-ACC",
    slug: "/accesorios",
    active: true,
    description:
      "Bolsos tote de lona encerada, cinturones de piel vegetal y bufandas de telar. 4 referencias.",
    systems: [
      {
        id: "sys-cat-5-alfa",
        name: "SISTEMA ALFA",
        sizes: ["S", "M", "L", "XL"],
      },
      {
        id: "sys-cat-5-unicos",
        name: "TALLES ÚNICOS",
        sizes: ["Talle Único", "Talle Ajustable"],
      },
    ],
    systemName: "SISTEMA ALFA",
    systemSizes: ["S", "M", "L", "XL"],
    uniqueSizes: ["Talle Único", "Talle Ajustable"],
    addedSizes: [],
  },
];

// ─── Convierte AdminCategoryDto → CategoryItem (formato interno de la vista) ──

export function formatSku3(sku: string | null | undefined): string {
  if (!sku) return "";
  const trimmed = sku.trim();
  if (trimmed.includes("-")) {
    const parts = trimmed.split("-");
    const last = parts[parts.length - 1];
    if (last) return last.slice(0, 3).toUpperCase();
  }
  return trimmed.slice(0, 3).toUpperCase();
}

function dtoToCategoryItem(dto: AdminCategoryDto): CategoryItem {
  // Mapear sizeSystemIds → sistemas usando SIZE_SYSTEM_CATALOG
  const systems: AssignedSizeSystem[] = dto.sizeSystemIds
    .map((sysId) => SIZE_SYSTEM_CATALOG.find((s) => s.id === sysId))
    .filter(Boolean)
    .map((s) => ({
      id: s!.id,
      name: s!.systemName,
      sizes: [...s!.sizes],
    }));

  return {
    id: dto.id,
    name: dto.name,
    sku: formatSku3(dto.sku),
    slug: dto.slug,
    active: dto.active,
    description: dto.description ?? "",
    systems,
    // Campos legacy (no se usan cuando hay systems[])
    systemName: systems[0]?.name ?? "",
    systemSizes: systems[0]?.sizes ?? [],
    uniqueSizes: [],
    addedSizes: [],
  };
}

export function AdminCategoriesView() {
  // ─── React Query ─────────────────────────────────────────────────────────
  const { data: dbCategories, isLoading, isError, refetch } = useAdminCategories();
  const createMutation = useCreateAdminCategory();
  const updateMutation = useUpdateAdminCategory();
  const deleteMutation = useDeleteAdminCategory();

  // ─── Estado local UI (Staging de cambios) ─────────────────────────────────
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [savedSnapshot, setSavedSnapshot] = useState<CategoryItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const isInitializedRef = useRef(false);

  const [selectedSystem, setSelectedSystem] = useState<Record<string, string>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Limpiar localStorage legacy al montar (ya no se usa)
  useEffect(() => {
    clearLegacyLS();
  }, []);

  // Inicializar estado local cuando llegan los datos de la DB
  useEffect(() => {
    if (dbCategories) {
      const mapped = dbCategories.map(dtoToCategoryItem);
      if (!isInitializedRef.current) {
        setCategories(mapped);
        setSavedSnapshot(structuredClone(mapped));
        isInitializedRef.current = true;
      }
    }
  }, [dbCategories]);

  // Comparar si hay cambios sin guardar respecto al snapshot de la DB
  const hasUnsavedChanges = useMemo(() => {
    if (!isInitializedRef.current) return false;
    return JSON.stringify(categories) !== JSON.stringify(savedSnapshot);
  }, [categories, savedSnapshot]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  // ─── Handlers locales (no persisten de inmediato en DB) ───────────────────

  function handleAddSelectedSystem(catId: string) {
    const val = selectedSystem[catId];
    if (!val) return;

    const found =
      SIZE_SYSTEM_CATALOG.find((s) => s.id === val || s.label === val) ||
      SIZE_SYSTEM_CATALOG.find((s) => val.toLowerCase().includes(s.id.toLowerCase())) ||
      SIZE_SYSTEM_CATALOG.find((s) =>
        s.label.toLowerCase().includes(val.split("(")[0].trim().toLowerCase()),
      );
    if (!found) return;

    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== catId) return cat;

        const currentSystems = getCategorySystems(cat);
        const alreadyExists = currentSystems.some(
          (s) => s.name.toUpperCase().trim() === found.systemName.toUpperCase().trim(),
        );
        if (alreadyExists) return cat;

        const newSystem: AssignedSizeSystem = {
          id: found.id,
          name: found.systemName,
          sizes: [...found.sizes],
        };

        return {
          ...cat,
          systems: [...currentSystems, newSystem],
        };
      }),
    );

    setSelectedSystem((prev) => ({ ...prev, [catId]: "" }));
  }

  function handleRemoveSystem(catId: string, systemId: string) {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== catId) return cat;
        const currentSystems = getCategorySystems(cat);
        const updated = currentSystems.filter(
          (s) => s.id !== systemId && s.name.toUpperCase().trim() !== systemId.toUpperCase().trim(),
        );
        return {
          ...cat,
          systems: updated,
        };
      }),
    );
  }

  function toggleVisibility(catId: string) {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === catId ? { ...cat, active: !cat.active } : cat)),
    );
  }

  function deleteCategory(catId: string) {
    setCategories((prev) => prev.filter((cat) => cat.id !== catId));
    setEditingCategory(null);
  }

  function handleSaveNewCategory(data: CreateCategoryData) {
    const slug = `/${data.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}`;

    const defaultSystems: AssignedSizeSystem[] = [
      {
        id: "alfa_std",
        name: "SISTEMA ALFA",
        sizes: ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL"],
      },
      {
        id: "talles_unicos",
        name: "TALLES ÚNICOS",
        sizes: ["Talle Único", "Talle Ajustable"],
      },
    ];

    const newCat: CategoryItem = {
      id: `temp-${Date.now()}`,
      name: data.name,
      sku: data.sku || `NRT-${data.name.substring(0, 3).toUpperCase()}`,
      slug,
      active: true,
      description: data.description || "",
      systems: defaultSystems,
      systemName: defaultSystems[0].name,
      systemSizes: defaultSystems[0].sizes,
      uniqueSizes: defaultSystems[1].sizes,
      addedSizes: [],
    };

    setCategories((prev) => [...prev, newCat]);
    setIsAddModalOpen(false);
  }

  function handleSaveEditedCategory(updated: EditableCategory) {
    setCategories((prev) =>
      prev.map((c) => (c.id === updated.id ? ({ ...c, ...updated } as CategoryItem) : c)),
    );
    setEditingCategory(null);
  }

  // ─── Descartar cambios locales ───────────────────────────────────────────

  function handleDiscardChanges() {
    setCategories(structuredClone(savedSnapshot));
    showToast("Cambios descartados.");
  }

  // ─── Persistir cambios acumulados en el backend ──────────────────────────

  async function handleSaveChanges() {
    if (!hasUnsavedChanges || isSaving) return;
    setIsSaving(true);
    try {
      // 1. Eliminar categorías que ya no están
      const currentIds = new Set(categories.map((c) => c.id));
      const toDelete = savedSnapshot.filter(
        (s) => !currentIds.has(s.id) && !s.id.startsWith("temp-"),
      );
      for (const del of toDelete) {
        await deleteMutation.mutateAsync(del.id);
      }

      // 2. Crear nuevas categorías
      const toCreate = categories.filter((c) => c.id.startsWith("temp-"));
      for (const cat of toCreate) {
        const sizeSystemIds = (cat.systems ?? []).map((s) => {
          const found = SIZE_SYSTEM_CATALOG.find((c) => c.id === s.id || c.systemName === s.name);
          return found?.id ?? s.id;
        });
        await createMutation.mutateAsync({
          name: cat.name,
          sku: cat.sku,
          description: cat.description,
          active: cat.active,
          sizeSystemIds,
        });
      }

      // 3. Actualizar categorías existentes
      const toUpdate = categories.filter((c) => !c.id.startsWith("temp-"));
      for (const cat of toUpdate) {
        const original = savedSnapshot.find((s) => s.id === cat.id);
        if (!original) continue;

        const currentSystemIds = (cat.systems ?? []).map((s) => {
          const found = SIZE_SYSTEM_CATALOG.find((c) => c.id === s.id || c.systemName === s.name);
          return found?.id ?? s.id;
        });
        const originalSystemIds = (original.systems ?? []).map((s) => {
          const found = SIZE_SYSTEM_CATALOG.find((c) => c.id === s.id || c.systemName === s.name);
          return found?.id ?? s.id;
        });

        const hasChanged =
          cat.name !== original.name ||
          cat.sku !== original.sku ||
          cat.description !== original.description ||
          cat.active !== original.active ||
          JSON.stringify(currentSystemIds) !== JSON.stringify(originalSystemIds);

        if (hasChanged) {
          await updateMutation.mutateAsync({
            id: cat.id,
            body: {
              name: cat.name,
              sku: cat.sku,
              description: cat.description,
              active: cat.active,
              sizeSystemIds: currentSystemIds,
            },
          });
        }
      }

      const fresh = await refetch();
      if (fresh.data) {
        const mapped = fresh.data.map(dtoToCategoryItem);
        setCategories(mapped);
        setSavedSnapshot(structuredClone(mapped));
      } else {
        setSavedSnapshot(structuredClone(categories));
      }

      showToast("Cambios guardados correctamente en la base de datos.");
    } catch (err: unknown) {
      console.error("[handleSaveChanges]", err);
      showToast(err instanceof Error ? err.message : "Error al guardar cambios.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="w-full bg-surface min-h-[calc(100vh-4rem)]">
      {/* ── Loading / Error states ── */}
      {isLoading && (
        <div className="flex items-center justify-center h-64 text-on-surface-variant font-inter text-sm uppercase tracking-widest">
          Cargando categorías…
        </div>
      )}
      {isError && (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-error font-inter text-sm uppercase tracking-widest">
          <span>Error al cargar categorías desde la base de datos.</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 bg-[#673900] text-white hover:bg-[#894d00] font-semibold text-xs tracking-wider cursor-pointer transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}
      {!isLoading && !isError && (
        <div className="w-full max-w-[1400px] mx-auto px-4 lg:px-12 py-8 flex flex-col gap-8">
          {/* ── 1. Encabezado principal ── */}
          <header className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex flex-col gap-2">
              {/* Badge */}
              <div className="inline-flex items-center gap-2">
                <span className="w-2 h-2 bg-mustard" />
                <span className="font-inter text-[10px] text-on-surface-variant uppercase tracking-[0.25em] font-semibold">
                  ESTRUCTURA DE CATÁLOGO &amp; VALORES GLOBALES
                </span>
              </div>

              {/* Título y subtítulo */}
              <h1 className="font-headline text-[42px] uppercase tracking-normal leading-none text-on-surface mt-1">
                GESTIÓN DE CATEGORÍAS Y ATRIBUTOS
              </h1>
              <p className="font-inter text-[13px] text-on-surface-variant leading-relaxed max-w-3xl">
                Administración unificada del catálogo textil del atelier: jerarquías de categorías,
                parametrización de talles individuales por prenda, cartas de color de tintura
                oficial y firmas registradas.
              </p>
            </div>

            {/* Botones de navegación directa a sub-vistas */}
            <div className="flex flex-wrap items-center gap-3 shrink-0 self-start lg:self-center">
              <Link
                href="/admin/categorias/talles"
                className="group inline-flex items-center gap-2.5 px-5 py-2.5 bg-[#c77d2e] hover:bg-[#b06a20] text-white font-inter text-[12px] uppercase tracking-wider font-semibold shadow-md hover:shadow-lg transition-all active:translate-y-px"
              >
                <span className="material-symbols-outlined text-[19px]">straighten</span>
                <span>Ir a Sistema de Talles</span>
                <span className="material-symbols-outlined text-[15px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </Link>

              <Link
                href="/admin/categorias/colores-marcas"
                className="group inline-flex items-center gap-2.5 px-5 py-2.5 bg-[#33402f] hover:bg-[#253022] text-[#fff9ed] font-inter text-[12px] uppercase tracking-wider font-semibold shadow-md hover:shadow-lg transition-all active:translate-y-px"
              >
                <span className="material-symbols-outlined text-[19px] text-[#ffb875]">
                  palette
                </span>
                <span>Ir a Marcas y Colores</span>
                <span className="material-symbols-outlined text-[15px] text-[#ffb875] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </Link>
            </div>
          </header>

          {/* ── 2. Panel de Métricas / 3 KPI Cards ── */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1 */}
            <div className="relative bg-[#faf3e4] p-6 border border-[#d8c3b2]/30 flex flex-col justify-between overflow-hidden">
              <div className="absolute -right-2 -bottom-2 opacity-10 pointer-events-none select-none">
                <span
                  className="material-symbols-outlined text-on-surface leading-none block"
                  style={{ fontSize: "95px" }}
                >
                  category
                </span>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#524438] font-semibold">
                    CATEGORÍAS ACTIVAS
                  </span>
                  <span className="material-symbols-outlined text-[#673900] text-[20px]">
                    category
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-headline text-[38px] text-[#1e1c13] leading-none">
                    {categories.filter((c) => c.active).length}
                  </span>
                  <span className="text-[12px] uppercase tracking-wider font-semibold text-[#524438]">
                    PRINCIPALES
                  </span>
                </div>
              </div>
              <div className="mt-6 pt-2 -mx-6 -mb-6 px-6 pb-2.5 bg-[#f4eddf]/70 flex items-center justify-between border-t border-[#d8c3b2]/20">
                <span className="text-[11px] text-[#524438]">24 Subcategorías activas</span>
                <span className="text-[#673900] text-[10px] font-bold uppercase tracking-wider">
                  100% VISIBLE
                </span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="relative bg-[#faf3e4] p-6 border border-[#d8c3b2]/30 flex flex-col justify-between overflow-hidden">
              <div className="absolute -right-2 -bottom-2 opacity-10 pointer-events-none select-none">
                <span
                  className="material-symbols-outlined text-on-surface leading-none block"
                  style={{ fontSize: "95px" }}
                >
                  straighten
                </span>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#524438] font-semibold">
                    SISTEMAS DE TALLE
                  </span>
                  <span className="material-symbols-outlined text-[#c77d2e] text-[20px]">
                    straighten
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-headline text-[38px] text-[#1e1c13] leading-none">5</span>
                  <span className="text-[12px] uppercase tracking-wider font-semibold text-[#524438]">
                    RANGOS ESPECÍFICOS
                  </span>
                </div>
              </div>
              <div className="mt-6 pt-2 -mx-6 -mb-6 px-6 pb-2.5 bg-[#f4eddf]/70 flex items-center justify-between border-t border-[#d8c3b2]/20">
                <span className="text-[11px] text-[#524438]">Por tipología de confección</span>
                <span className="inline-flex items-center gap-1.5 text-[#33402f] text-[10px] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#33402f]" /> 100% COBERTURA
                </span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="relative bg-[#faf3e4] p-6 border border-[#d8c3b2]/30 flex flex-col justify-between overflow-hidden">
              <div className="absolute -right-2 -bottom-2 opacity-10 pointer-events-none select-none">
                <span
                  className="material-symbols-outlined text-on-surface leading-none block"
                  style={{ fontSize: "95px" }}
                >
                  checkroom
                </span>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#524438] font-semibold">
                    PRENDAS ASIGNADAS
                  </span>
                  <span className="material-symbols-outlined text-[#54624f] text-[20px]">
                    styler
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-headline text-[38px] text-[#1e1c13] leading-none">38</span>
                  <span className="text-[12px] uppercase tracking-wider font-semibold text-[#524438]">
                    PRENDAS TOTALES
                  </span>
                </div>
              </div>
              <div className="mt-6 pt-2 -mx-6 -mb-6 px-6 pb-2.5 bg-[#f4eddf]/70 flex items-center justify-between border-t border-[#d8c3b2]/20">
                <span className="text-[11px] text-[#524438]">Arquetipos normalizados</span>
                <span className="text-[#673900] text-[10px] font-bold uppercase tracking-wider">
                  CATÁLOGO ACTIVO
                </span>
              </div>
            </div>
          </section>

          {/* ── 3. Barra de Sección: 1. GESTIÓN DE CATEGORÍAS & SUS TALLES ── */}
          <section className="flex flex-col gap-4">
            <div className="bg-[#f4eddf] p-5 border border-[#d8c3b2]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#673900] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-white text-[24px]">
                    account_tree
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="font-headline text-[22px] uppercase tracking-wide text-[#1e1c13] leading-none">
                      1. GESTIÓN DE CATEGORÍAS &amp; SUS TALLES
                    </h2>
                    <span className="px-2 py-0.5 bg-[#33402f] text-[#fff9ed] text-[9px] font-semibold uppercase tracking-wider">
                      {categories.filter((c) => c.active).length} CATEGORÍAS ACTIVAS
                    </span>
                  </div>
                  <p className="text-[11px] text-[#524438] mt-1">
                    Arquetipos de prendas, prefijos normalizados de SKU y parametrización de talles
                    específicos habilitados para cada prenda.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="px-6 py-3 bg-[#673900] hover:bg-[#894d00] text-white font-headline text-[18px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shrink-0 cursor-pointer shadow-sm active:translate-y-px"
              >
                + NUEVA CATEGORÍA
              </button>
            </div>

            {/* Banner fotográfico horizontal panorámico de rollos de tela */}
            <div className="w-full h-24 overflow-hidden border border-[#d8c3b2]/40 bg-[#e0dacb]">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDu0yi7dQjI8sYST3K28n5KcUuE_IygkJkDol5DfuCHwx4Ls_ytOMc8iJeBN13LpEnNAbBOC1opD0FZM8myhO0hcMf4_nekDh6doXfCrJTF_CS1qIiOeV18utjgjyhgppQiAqF0ZEAuwYIYUNkfrGaAQ4YcTp-US_MvlwmqcpQ24Z5ZbPV-F6tViTxxcN2dda8IbdRtiIWDKAH-oPRB7HGQ2BuB-w0MBLw89kYbfK4"
                alt="Rollos textiles artesanales"
                className="w-full h-full object-cover grayscale"
              />
            </div>

            {/* ── 4. Lista de Categorías ── */}
            <div className="flex flex-col gap-4">
              {categories.map((cat) => (
                <article
                  key={cat.id}
                  className={`p-5 border border-l-4 flex flex-col gap-3 transition-all duration-200 ${
                    cat.active
                      ? "bg-[#faf3e4] border-[#d8c3b2]/40 border-l-[#33402f] shadow-xs"
                      : "bg-[#e8dfcf] border-[#c4b5a3] border-l-[#736456] shadow-[inset_0_2px_6px_rgba(40,30,20,0.12)]"
                  }`}
                >
                  {/* Cabecera de la categoría */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        className={`mt-0.5 cursor-grab active:cursor-grabbing ${
                          cat.active
                            ? "text-[#857466] hover:text-[#673900]"
                            : "text-[#9e9082] hover:text-[#524438]"
                        }`}
                        title="Arrastrar para reordenar"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          drag_indicator
                        </span>
                      </button>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3
                            className={`font-headline text-[22px] uppercase tracking-wide leading-none ${
                              cat.active ? "text-[#1e1c13]" : "text-[#6e6153]"
                            }`}
                          >
                            {cat.name}
                          </h3>
                          {cat.active ? (
                            <span className="px-2 py-0.5 bg-[#33402f] text-[#fff9ed] text-[9px] uppercase tracking-wider font-semibold">
                              ACTIVO
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-[#6e6153] text-[#f4eddf] text-[9px] uppercase tracking-wider font-semibold">
                              INACTIVO
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 font-mono text-[10px] font-bold border ${
                              cat.active
                                ? "bg-[#f4eddf] text-[#673900] border-[#d8c3b2]/40"
                                : "bg-[#ded4c3] text-[#786450] border-[#c4b5a3]"
                            }`}
                          >
                            SKU: {formatSku3(cat.sku)}
                          </span>
                        </div>
                        <p
                          className={`text-[12px] mt-1 ${
                            cat.active ? "text-[#524438]" : "text-[#7a6d5f]"
                          }`}
                        >
                          {cat.description}
                        </p>
                      </div>
                    </div>

                    {/* Acciones de categoría */}
                    <div className="flex items-center gap-2 text-[#524438] self-end sm:self-start">
                      <button
                        type="button"
                        onClick={() => setEditingCategory(cat)}
                        className="hover:text-[#673900] transition-colors p-1 cursor-pointer"
                        title="Editar categoría"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit_note</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleVisibility(cat.id)}
                        className="hover:text-[#c77d2e] transition-colors p-1 cursor-pointer"
                        title={cat.active ? "Desactivar categoría" : "Activar categoría"}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {cat.active ? "visibility" : "visibility_off"}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`¿Eliminar la categoría ${cat.name}?`)) {
                            deleteCategory(cat.id);
                          }
                        }}
                        className="hover:text-red-600 transition-colors p-1 cursor-pointer"
                        title="Eliminar"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Subpanel integrado de talles */}
                  <div
                    className={`p-4 border flex flex-col gap-2.5 transition-colors ${
                      cat.active
                        ? "bg-[#fff9ed] border-[#d8c3b2]/30"
                        : "bg-[#ded4c3]/80 border-[#c4b5a3] shadow-inner"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
                      <span
                        className={`material-symbols-outlined text-[16px] ${
                          cat.active ? "text-[#673900]" : "text-[#786450]"
                        }`}
                      >
                        straighten
                      </span>
                      <span className={cat.active ? "text-[#1e1c13]" : "text-[#6e6153]"}>
                        TALLES HABILITADOS PARA ESTA CATEGORÍA
                      </span>
                    </div>

                    {/* Filas de sistemas de talles habilitados para esta categoría */}
                    {getCategorySystems(cat).map((sys, idx) => (
                      <div
                        key={sys.id || `${sys.name}-${idx}`}
                        className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]"
                      >
                        <span
                          className={`font-semibold uppercase tracking-wider ${
                            cat.active ? "text-[#524438]" : "text-[#736456]"
                          }`}
                        >
                          {sys.name}:
                        </span>
                        {sys.sizes.map((size) => (
                          <span
                            key={size}
                            className={`font-mono font-medium ${
                              cat.active ? "text-[#673900]" : "text-[#7a6249]"
                            }`}
                          >
                            {size}
                          </span>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleRemoveSystem(cat.id, sys.id)}
                          title={`Eliminar sistema ${sys.name}`}
                          className="inline-flex items-center justify-center w-4 h-4 ml-1 text-[#857466] hover:text-red-600 hover:bg-red-50 rounded text-xs font-bold transition-colors cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}

                    {/* Dropdown y botón Añadir Talle */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 max-w-md">
                      <select
                        value={selectedSystem[cat.id] || ""}
                        onChange={(e) =>
                          setSelectedSystem((prev) => ({ ...prev, [cat.id]: e.target.value }))
                        }
                        className={`flex-1 h-8 px-3 text-[12px] border focus:outline-none cursor-pointer ${
                          cat.active
                            ? "bg-white text-[#1e1c13] border-[#d8c3b2]/60 focus:border-[#673900]"
                            : "bg-[#eae2d3] text-[#524438] border-[#c4b5a3] focus:border-[#786450]"
                        }`}
                      >
                        <option value="" disabled>
                          Selecciona sistema de talla
                        </option>
                        {SIZE_SYSTEM_CATALOG.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleAddSelectedSystem(cat.id)}
                        className={`h-8 px-4 text-white text-[11px] font-semibold uppercase tracking-wider transition-colors shrink-0 ${
                          cat.active
                            ? "bg-[#54624f] hover:bg-[#33402f]"
                            : "bg-[#6c7867] hover:bg-[#54624f]"
                        }`}
                      >
                        + AÑADIR TALLE
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* ── 5. Banner de Sincronización Automática inferior ── */}
          <footer className="bg-[#f4eddf] p-4 border border-[#d8c3b2]/40 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#673900] text-[20px] shrink-0">
                sync
              </span>
              <p className="text-[11px] text-[#524438] leading-normal">
                <strong className="text-[#1e1c13]">Sincronización Automática:</strong> Cualquier
                cambio en las categorías, talles por categoría, colores o firmas se propaga
                inmediatamente a las pantallas de Creación de Producto, Fichas de Inventario y
                Tienda Online Pública.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 text-[10px] font-bold uppercase tracking-wider">
              <button
                type="button"
                onClick={() => alert("Registro de Cambios: Catálogo sincronizado.")}
                className="text-[#673900] hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px]">history</span> REGISTRO DE
                CAMBIOS
              </button>
              <span className="text-[#d8c3b2]">|</span>
              <button
                type="button"
                onClick={() => {
                  const data = JSON.stringify(categories, null, 2);
                  const blob = new Blob([data], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "norte_categorias.json";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="text-[#524438] hover:text-[#1e1c13] flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px]">download</span> EXPORTAR
                JSON
              </button>
            </div>
          </footer>

          {/* ── STICKY BOTTOM BAR (Igual a la de agregar/editar producto e inventario) ── */}
          <div className="sticky bottom-0 z-30 w-full bg-[#333027] text-[#f7f0e2] px-4 lg:px-12 py-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isSaving || hasUnsavedChanges ? "bg-[#c77d2e] animate-pulse" : "bg-[#466635]"
                }`}
              />
              <span className="font-inter text-[12px] text-[#e0dacb]">
                {isSaving
                  ? "Guardando cambios en la base de datos…"
                  : hasUnsavedChanges
                    ? "Cambios sin guardar en categorías"
                    : "Todos los cambios guardados"}
              </span>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleDiscardChanges}
                disabled={!hasUnsavedChanges || isSaving}
                className="px-4 py-3 bg-white/10 hover:bg-white/15 disabled:opacity-40 disabled:cursor-not-allowed text-[#f7f0e2] font-inter text-[10px] uppercase tracking-widest transition-colors cursor-pointer"
              >
                DESCARTAR CAMBIOS
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={!hasUnsavedChanges || isSaving}
                className="px-8 py-3 bg-[#673900] hover:bg-[#894d00] disabled:opacity-50 disabled:cursor-not-allowed text-white font-headline text-[20px] uppercase tracking-wider shadow-sm flex items-center gap-2 transition-colors cursor-pointer active:translate-y-px"
              >
                {isSaving ? "GUARDANDO…" : "GUARDAR CAMBIOS"}
                <span className="material-symbols-outlined text-[18px]">
                  {isSaving ? "hourglass_top" : "check"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Agregar Nueva Categoría ── */}
      <AdminAddCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveNewCategory}
      />

      {/* ── Modal Editar Categoría ── */}
      <AdminEditCategoryModal
        category={editingCategory}
        isOpen={Boolean(editingCategory)}
        onClose={() => setEditingCategory(null)}
        onSave={handleSaveEditedCategory}
        onDelete={deleteCategory}
      />

      {/* ── Toast de confirmación ── */}
      {toast && (
        <div className="fixed bottom-24 right-6 z-50 bg-[#1e1c13] text-[#fff9ed] px-5 py-3 border-l-4 border-mustard font-inter text-[13px] shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="material-symbols-outlined text-mustard text-[18px]">check_circle</span>
          <span>{toast}</span>
        </div>
      )}
    </main>
  );
}
