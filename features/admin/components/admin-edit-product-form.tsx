"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  AdminInventoryVariantsSection,
  type VariantRow,
} from "@/features/admin/components/admin-inventory-variants-section";
import { useCategories } from "@/features/category/hooks/useCategories";
import { useBrands } from "@/features/admin/hooks/useBrands";
import { useColors } from "@/features/admin/hooks/useColors";
import {
  useProduct,
  useProducts,
  useUpdateProduct,
  useDeleteProduct,
} from "@/features/admin/hooks/useProducts";
import { getInventoryProductById } from "@/features/admin/components/admin-inventory-view";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getBaseSkuFromVariant(variantSku?: string | null): string {
  if (!variantSku) return "";
  const parts = variantSku.split("-");
  if (parts.length >= 2) {
    return `${parts[0]}-${parts[1]}`;
  }
  return variantSku;
}

/* ─── Mock data fallback si no se encuentra producto ─── */
const MOCK_PRODUCT = {
  id: "NRT-CAM0001",
  name: "Sobrecamisa Lino Rústico Arena",
  category: "Camisas",
  sku: "NRT-CAM0001",
  brand: "NORTE Atelier",
  gender: "Unisex",
  slug: "sobrecamisa-lino-rustico-arena",
  description:
    "Confeccionada en 100% lino orgánico de gramaje medio con textura natural viva procedente de telares tradicionales de Normandía. Presenta corte recto ligeramente holgado con hombros relajados, cuello camisero con acabado sastre impecable y tapeta frontal con botones de corozo teñidos artesanalmente en matriz nogal.",
  care: "100% Lino Europeo certificado Master of Linen. Lavado a la piedra. Botones naturales de corozo ecuatoriano. Lavar en seco o en ciclo delicado a 30°C.",
  priceRetail: 165.0,
  priceCost: 62.0,
  vat: 21,
  vipDiscount: 15,
  status: true,
  featured: true,
  dynamicCover: true,
  createdAt: "24 mayo 2024, 11:42",
  lastEditedAt: "5 noviembre 2026, 09:15",
  lastEditedBy: "Elena Vázquez",
};

export function AdminEditProductForm() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const rawId = (params?.id as string) || searchParams?.get("id") || "";

  // 1. Buscar en inventario (local o mock)
  const inventoryProduct = useMemo(() => {
    return rawId ? getInventoryProductById(rawId) : null;
  }, [rawId]);

  // 2. Buscar en base de datos si es id de producto existente
  const isLocalOnly = /^p\d+$/i.test(rawId);
  const { data: dbProduct, isLoading: dbProductLoading } = useProduct(
    rawId && !isLocalOnly ? rawId : null,
  );

  // 3. Catálogos globales
  const { data: categories, isLoading: catsLoading, isError: catsError } = useCategories();
  const { data: brands, isLoading: brandsLoading, isError: brandsError } = useBrands();
  const { data: globalColors = [] } = useColors();
  const { data: allProducts = [] } = useProducts();

  const queryClient = useQueryClient();
  const updateProduct = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  // 4. Datos del producto resueltos
  const p = useMemo(() => {
    if (dbProduct) {
      const firstSku =
        getBaseSkuFromVariant(dbProduct.variants?.[0]?.sku) ||
        `NRT-${dbProduct.name.slice(0, 3).toUpperCase()}-0001`;
      return {
        id: dbProduct.id,
        name: dbProduct.name,
        category: dbProduct.categoryName || "Camisas",
        sku: firstSku,
        brand: "NORTE Atelier",
        gender: "Unisex",
        slug: dbProduct.slug || slugify(dbProduct.name),
        description: dbProduct.description || "",
        care:
          dbProduct.material ||
          "100% Lino Europeo certificado. Lavar en seco o en ciclo delicado a 30°C.",
        priceRetail: dbProduct.basePrice || 165.0,
        priceCost: Math.round((dbProduct.basePrice || 165.0) * 0.4),
        vat: 21,
        vipDiscount: 15,
        status: dbProduct.active,
        featured: false,
        dynamicCover: true,
        createdAt: "24 mayo 2024, 11:42",
        lastEditedAt: "15 noviembre 2026, 17:00",
        lastEditedBy: "Elena Vázquez",
      };
    }

    if (inventoryProduct) {
      const priceVal = inventoryProduct.pvp
        ? parseFloat(inventoryProduct.pvp.replace(/[^0-9.]/g, ""))
        : 165.0;
      const validPrice = isNaN(priceVal) ? 165.0 : priceVal;
      return {
        id: inventoryProduct.id,
        name: inventoryProduct.name,
        category: inventoryProduct.category,
        sku: inventoryProduct.sku,
        brand: "NORTE Atelier",
        gender: "Unisex",
        slug: slugify(inventoryProduct.name),
        description: `Pieza artesanal perteneciente a la línea de ${inventoryProduct.category.toLowerCase()}. Confección con materiales seleccionados y patronaje atemporal de atelier.`,
        care: "Confección artesanal. Limpieza profesional o ciclo delicado según directriz técnica.",
        priceRetail: validPrice,
        priceCost: Math.round(validPrice * 0.4),
        vat: 21,
        vipDiscount: 15,
        status: true,
        featured: false,
        dynamicCover: true,
        createdAt: "24 mayo 2024, 11:42",
        lastEditedAt: "15 noviembre 2026, 17:00",
        lastEditedBy: "Elena Vázquez",
      };
    }

    return MOCK_PRODUCT;
  }, [dbProduct, inventoryProduct]);

  // 5. Variantes iniciales estructuradas para el componente de inventario
  const initialVariants = useMemo<VariantRow[]>(() => {
    if (dbProduct?.variants && dbProduct.variants.length > 0) {
      return dbProduct.variants.map((v) => {
        const found = globalColors.find(
          (c) =>
            c.hex.toLowerCase() === v.color.toLowerCase() ||
            c.name.toLowerCase() === v.color.toLowerCase(),
        );
        return {
          size: v.size,
          colorName: found?.name || v.color,
          colorHex: found?.hex || (v.color.startsWith("#") ? v.color : "#4F583D"),
          stock: v.stock,
        };
      });
    }

    if (inventoryProduct) {
      const rows: VariantRow[] = [];
      inventoryProduct.sizes.forEach((sz) => {
        inventoryProduct.colors.forEach((col) => {
          const val = inventoryProduct.stock[sz]?.[col.name] ?? 0;
          rows.push({
            size: sz,
            colorName: col.name,
            colorHex: col.hex,
            stock: val,
          });
        });
      });
      return rows;
    }

    return [];
  }, [dbProduct, inventoryProduct, globalColors]);

  // ── Estados controlados del formulario ────────────────────────────────────
  const [name, setName] = useState(p.name);
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [sku, setSku] = useState("");
  const [skuManuallyEdited, setSkuManuallyEdited] = useState(false);
  const [gender, setGender] = useState(p.gender);
  const [description, setDescription] = useState(p.description);
  const [material, setMaterial] = useState(p.care);
  const [basePrice, setBasePrice] = useState(String(p.priceRetail));
  const [unitCost, setUnitCost] = useState(String(p.priceCost));
  const [active, setActive] = useState(p.status);
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sincronizar estados cuando se cargan los datos del producto
  useEffect(() => {
    if (p.name) setName(p.name);
    if (p.gender) setGender(p.gender);
    if (p.description) setDescription(p.description);
    if (p.care) setMaterial(p.care);
    if (p.priceRetail !== undefined) setBasePrice(String(p.priceRetail));
    if (p.priceCost !== undefined) setUnitCost(String(p.priceCost));
    if (p.status !== undefined) setActive(p.status);
    if (p.sku && !skuManuallyEdited) setSku(getBaseSkuFromVariant(p.sku));
  }, [p]);

  // Sincronizar categoría
  useEffect(() => {
    if (categories && categories.length > 0 && !categoryId) {
      const match =
        categories.find((c) => c.name.toLowerCase() === p.category.toLowerCase()) ||
        categories.find((c) => p.category.toLowerCase().includes(c.name.toLowerCase())) ||
        categories.find((c) => c.name.toLowerCase().includes(p.category.toLowerCase())) ||
        categories[0];
      if (match) {
        setCategoryId(match.id);
      }
    }
  }, [categories, p.category, categoryId]);

  const selectedCategoryName =
    categories?.find((c) => c.id === categoryId)?.name ?? (categoryId ? "" : p.category);

  // Sincronizar marca
  useEffect(() => {
    if (!brandId && brands && brands.length > 0) {
      const prefixFromSku = p.sku?.split("-")[0]?.toUpperCase();
      const match =
        (prefixFromSku ? brands.find((b) => b.skuPrefix.toUpperCase() === prefixFromSku) : null) ||
        brands.find((b) => b.name.toLowerCase() === p.brand.toLowerCase()) ||
        brands.find((b) => b.name.toLowerCase().includes(p.brand.toLowerCase())) ||
        brands.find((b) => p.brand.toLowerCase().includes(b.name.toLowerCase())) ||
        brands[0];
      if (match) {
        setBrandId(match.id);
      }
    }
  }, [brands, brandId, p.brand, p.sku]);

  // Auto-SKU dinámico: mientras elijo categoría y marca se va cambiando
  useEffect(() => {
    if (skuManuallyEdited) return;
    if (!brandId && !categoryId) return;

    const brand = brandId ? brands?.find((b) => b.id === brandId) : null;
    const cat = categoryId ? categories?.find((c) => c.id === categoryId) : null;

    const brandPrefix = brand?.skuPrefix?.trim().toUpperCase() ?? "???";
    const catCode = cat
      ? cat.name
          .trim()
          .replace(/[^A-Za-z]/g, "")
          .slice(0, 3)
          .toUpperCase() || "???"
      : "???";

    // Preservar el número del producto actual (ej. 0001, 0002...)
    const matchNum = p.sku.match(/\d{3,4}/);
    let numStr = matchNum ? matchNum[0].padStart(4, "0") : "";
    if (!numStr) {
      const idx = allProducts.findIndex((item) => item.id === p.id);
      numStr = idx !== -1 ? String(idx + 1).padStart(4, "0") : "0001";
    }

    const autoSku = `${brandPrefix}-${catCode}${numStr}`;
    setSku(autoSku);
  }, [brandId, categoryId, brands, categories, skuManuallyEdited, allProducts, p.sku, p.id]);

  // Derivados de precio
  const basePriceNum = parseFloat(basePrice) || 0;
  const unitCostNum = parseFloat(unitCost) || 0;
  const margin = basePriceNum > 0 ? ((basePriceNum - unitCostNum) / basePriceNum) * 100 : 0;
  const marginStr = margin.toFixed(1);
  const profit = (basePriceNum - unitCostNum).toFixed(2);
  const currentSlug = slugify(name);

  // ── Guardar Cambios ───────────────────────────────────────────────────────
  async function handleSave() {
    if (!name.trim()) {
      setNotification({ type: "error", message: "El nombre de la prenda es obligatorio." });
      return;
    }
    if (!categoryId) {
      setNotification({ type: "error", message: "Seleccioná una categoría." });
      return;
    }
    if (!material.trim()) {
      setNotification({ type: "error", message: "La composición/material es obligatoria." });
      return;
    }
    if (!basePrice || basePriceNum <= 0) {
      setNotification({ type: "error", message: "El precio de venta debe ser mayor a 0." });
      return;
    }

    setIsSaving(true);
    try {
      // 1. Si es producto de la base de datos
      if (dbProduct) {
        const form = new FormData();
        form.set("name", name.trim());
        form.set("category_id", categoryId);
        form.set("material", material.trim());
        form.set("base_price", String(basePriceNum));
        if (description.trim()) form.set("description", description.trim());
        form.set("slug", currentSlug);
        form.set("active", String(active));

        await updateProduct.mutateAsync({ id: dbProduct.id, form });

        // Actualizar o crear variantes
        const variantsToSave = variants.filter((v) => v.stock > 0);
        if (variantsToSave.length > 0) {
          await Promise.all(
            variantsToSave.map(async (v) => {
              const existingVar = dbProduct.variants?.find(
                (ex) =>
                  ex.size.toLowerCase() === v.size.toLowerCase() &&
                  (ex.color.toLowerCase() === v.colorHex.toLowerCase() ||
                    ex.color.toLowerCase() === v.colorName.toLowerCase()),
              );

              if (existingVar) {
                await fetch(`/api/admin/products/${dbProduct.id}/variants/${existingVar.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    stock: v.stock,
                    price: basePriceNum,
                    unitCost: unitCostNum,
                  }),
                });
              } else {
                const colorCode =
                  globalColors.find(
                    (c) =>
                      c.hex.toLowerCase() === v.colorHex.toLowerCase() ||
                      c.name.toLowerCase() === v.colorName.toLowerCase(),
                  )?.skuCode ||
                  v.colorName
                    .replace(/[^A-Za-z]/g, "")
                    .slice(0, 3)
                    .toUpperCase() ||
                  "STD";
                const cleanSize =
                  v.size
                    .toUpperCase()
                    .replace(/^TALLA\s*/i, "")
                    .trim() || "U";
                const variantSku = sku.trim()
                  ? `${sku.trim()}-${colorCode}-${cleanSize}`
                  : undefined;

                await fetch(`/api/admin/products/${dbProduct.id}/variants`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    size: v.size,
                    color: v.colorName,
                    colorHex: v.colorHex,
                    stock: v.stock,
                    sku: variantSku,
                    price: basePriceNum,
                    unitCost: unitCostNum,
                  }),
                });
              }
            }),
          );
        }
      }

      // 2. Si también está en inventario local/localStorage, actualizarlo
      if (inventoryProduct) {
        try {
          const raw = localStorage.getItem("norte-inventory-v3");
          if (raw) {
            const list = JSON.parse(raw);
            const idx = list.findIndex(
              (item: { id: string; sku: string }) =>
                item.id === inventoryProduct.id || item.sku === inventoryProduct.sku,
            );
            if (idx !== -1) {
              const updatedItem = {
                ...list[idx],
                name: name.trim(),
                sku: sku.trim() || list[idx].sku,
                category: selectedCategoryName || list[idx].category,
                pvp: `$${basePriceNum.toFixed(2)}`,
              };
              list[idx] = updatedItem;
              localStorage.setItem("norte-inventory-v3", JSON.stringify(list));
            }
          }
        } catch (e) {
          console.warn("No se pudo actualizar localStorage:", e);
        }
      }

      setNotification({
        type: "success",
        message: "¡Cambios guardados correctamente! Redirigiendo a productos…",
      });
      // Invalidar caché de React Query para que la lista y el detalle reflejen
      // los cambios de variantes guardados vía fetch directo (sin pasar por el mutation)
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      if (dbProduct) {
        await queryClient.invalidateQueries({ queryKey: ["admin-product", dbProduct.id] });
      }
      setTimeout(() => {
        router.push("/admin/productos");
        router.refresh();
      }, 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido al guardar.";
      setNotification({ type: "error", message: msg });
    } finally {
      setIsSaving(false);
    }
  }

  // ── Eliminar Producto ─────────────────────────────────────────────────────
  async function handleDelete() {
    try {
      if (dbProduct) {
        await deleteProductMutation.mutateAsync(dbProduct.id);
      }
      setShowDeleteModal(false);
      setNotification({
        type: "success",
        message: "¡Prenda eliminada correctamente! Redirigiendo a productos…",
      });
      setTimeout(() => {
        router.push("/admin/productos");
      }, 1200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al eliminar la prenda.";
      setNotification({ type: "error", message: msg });
    }
  }

  function handleDiscard() {
    router.back();
  }

  return (
    <>
      <div className="w-full max-w-[1400px] mx-auto px-4 lg:px-12 py-8 flex flex-col gap-8">
        {/* ── Banner de Notificación ── */}
        {notification && (
          <div
            className={`px-6 py-4 font-inter text-[14px] flex items-center justify-between gap-4 shadow-sm ${
              notification.type === "success"
                ? "bg-[#33402f] text-[#fff9ed]"
                : "bg-red-700 text-white"
            }`}
          >
            <span>{notification.message}</span>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-white/70 hover:text-white text-[18px] leading-none"
            >
              ×
            </button>
          </div>
        )}

        {/* ── Header ── */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#eee8d9]">
          <div className="flex flex-col gap-1 max-w-3xl">
            <h1 className="font-headline text-[48px] leading-none text-[#1e1c13] uppercase tracking-tight">
              EDITAR PRODUCTO: {name || p.name}
            </h1>
            <p className="font-inter text-[12px] text-[#524438] mt-1">
              Última edición por <strong className="text-[#1e1c13]">{p.lastEditedBy}</strong> el{" "}
              {p.lastEditedAt}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-3 border border-red-300 text-red-600 hover:bg-red-50 font-inter text-[11px] uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              ELIMINAR
            </button>
            <button
              type="button"
              onClick={handleDiscard}
              className="px-4 py-3 bg-[#eee8d9] hover:bg-[#e8e2d4] text-[#1e1c13] font-inter text-[12px] uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
              DESCARTAR
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || updateProduct.isPending}
              className="px-8 py-3 bg-[#673900] hover:bg-[#894d00] disabled:opacity-60 text-white font-headline text-[20px] uppercase tracking-wider transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
            >
              {isSaving || updateProduct.isPending ? "GUARDANDO…" : "GUARDAR CAMBIOS"}
              {!(isSaving || updateProduct.isPending) && (
                <span className="material-symbols-outlined text-[18px]">check</span>
              )}
            </button>
          </div>
        </header>

        {/* ── 2-column grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ════ LEFT (8 cols) ════ */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* ── CARD A: INFORMACIÓN GENERAL ── */}
            <section className="bg-white p-8 shadow-sm flex flex-col gap-6">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-[#c77d2e]" />
                  <h2 className="font-headline text-[24px] uppercase tracking-wide text-[#1e1c13]">
                    INFORMACIÓN GENERAL
                  </h2>
                </div>
                <span className="font-inter text-[10px] uppercase tracking-widest text-[#524438]">
                  REQUERIDO
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Nombre */}
                <div className="md:col-span-12 flex flex-col gap-1.5">
                  <label
                    className="font-inter text-[11px] uppercase tracking-wider text-[#524438]"
                    htmlFor="prod-name"
                  >
                    Nombre de la Prenda
                  </label>
                  <input
                    id="prod-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Sobrecamisa Lino Rústico Arena"
                    className="w-full bg-[#faf3e4] px-4 py-3 font-inter text-[16px] text-[#1e1c13] placeholder:text-[#857466] focus:outline-none focus:bg-[#fff9ed] focus:ring-1 focus:ring-[#673900]"
                  />
                </div>

                {/* Categoría */}
                <div className="md:col-span-6 flex flex-col gap-1.5">
                  <label
                    className="font-inter text-[11px] uppercase tracking-wider text-[#524438]"
                    htmlFor="prod-category"
                  >
                    Categoría
                  </label>
                  <div className="relative">
                    {catsError ? (
                      <p className="font-inter text-[13px] text-red-600">
                        Error al cargar categorías
                      </p>
                    ) : (
                      <select
                        id="prod-category"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        disabled={catsLoading}
                        className="w-full bg-[#faf3e4] px-4 py-3 font-inter text-[14px] text-[#1e1c13] appearance-none focus:outline-none focus:bg-[#fff9ed] focus:ring-1 focus:ring-[#673900] disabled:opacity-60"
                      >
                        <option value="">
                          {catsLoading ? "Cargando categorías…" : "Seleccionar categoría"}
                        </option>
                        {categories?.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    )}
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#524438] text-[20px]">
                      keyboard_arrow_down
                    </span>
                  </div>
                </div>

                {/* Marca */}
                <div className="md:col-span-6 flex flex-col gap-1.5">
                  <label
                    className="font-inter text-[11px] uppercase tracking-wider text-[#524438]"
                    htmlFor="prod-brand"
                  >
                    Marca / Firma
                  </label>
                  <div className="relative">
                    {brandsError ? (
                      <p className="font-inter text-[13px] text-red-600">Error al cargar marcas</p>
                    ) : (
                      <select
                        id="prod-brand"
                        value={brandId}
                        onChange={(e) => setBrandId(e.target.value)}
                        disabled={brandsLoading}
                        className="w-full bg-[#faf3e4] px-4 py-3 font-inter text-[14px] text-[#1e1c13] appearance-none focus:outline-none focus:bg-[#fff9ed] focus:ring-1 focus:ring-[#673900] disabled:opacity-60"
                      >
                        <option value="">
                          {brandsLoading ? "Cargando marcas…" : "Seleccionar marca"}
                        </option>
                        {brands?.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    )}
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#524438] text-[20px]">
                      keyboard_arrow_down
                    </span>
                  </div>
                </div>

                {/* SKU Base */}
                <div className="md:col-span-6 flex flex-col gap-1.5">
                  <label
                    className="font-inter text-[11px] uppercase tracking-wider text-[#524438]"
                    htmlFor="prod-sku"
                  >
                    SKU Base
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="prod-sku"
                      type="text"
                      value={sku}
                      onChange={(e) => {
                        setSku(e.target.value.toUpperCase());
                        setSkuManuallyEdited(true);
                      }}
                      placeholder="NRT-CAM0001"
                      className="w-full bg-[#faf3e4] pl-4 pr-10 py-3 font-mono text-[16px] text-[#1e1c13] uppercase tracking-wider focus:outline-none focus:bg-[#fff9ed] focus:ring-1 focus:ring-[#673900]"
                    />
                    {skuManuallyEdited && (
                      <button
                        type="button"
                        title="Restaurar SKU automático"
                        onClick={() => setSkuManuallyEdited(false)}
                        className="absolute right-2.5 text-[#857466] hover:text-[#673900] transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">refresh</span>
                      </button>
                    )}
                  </div>
                  <span className="font-inter text-[11px] text-[#524438]">
                    {skuManuallyEdited ? (
                      <span className="text-[#c77d2e]">
                        SKU personalizado — pulsá ↺ para restaurar el auto-generado.
                      </span>
                    ) : brandId || categoryId ? (
                      <span className="text-[#33402f]">
                        SKU generado automáticamente.
                        {!brandId && " Seleccioná una marca para completarlo."}
                        {!categoryId && " Seleccioná una categoría para completarlo."}
                      </span>
                    ) : (
                      "Se generará al seleccionar marca o categoría."
                    )}
                  </span>
                </div>

                {/* Género */}
                <div className="md:col-span-6 flex flex-col gap-1.5">
                  <label
                    className="font-inter text-[11px] uppercase tracking-wider text-[#524438]"
                    htmlFor="prod-gender"
                  >
                    Género / Sexo
                  </label>
                  <div className="relative">
                    <select
                      id="prod-gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-[#faf3e4] px-4 py-3 font-inter text-[14px] text-[#1e1c13] appearance-none focus:outline-none focus:bg-[#fff9ed] focus:ring-1 focus:ring-[#673900]"
                    >
                      <option>Hombre</option>
                      <option>Mujer</option>
                      <option>Unisex</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#524438] text-[20px]">
                      keyboard_arrow_down
                    </span>
                  </div>
                </div>

                {/* URL Slug */}
                <div className="md:col-span-12 bg-[#f4eddf] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="material-symbols-outlined text-[#c77d2e] text-[18px]">
                      link
                    </span>
                    <span className="font-inter text-[10px] uppercase tracking-wider text-[#524438] shrink-0">
                      URL Slug:
                    </span>
                    <span className="font-inter text-[12px] text-[#673900] truncate">
                      norteatelier.com/shop/{currentSlug || p.slug}
                    </span>
                  </div>
                </div>

                {/* Descripción */}
                <div className="md:col-span-12 flex flex-col gap-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="font-inter text-[11px] uppercase tracking-wider text-[#524438]">
                      Descripción Editorial &amp; Silueta
                    </label>
                  </div>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descripción editorial de la prenda…"
                    className="w-full bg-[#faf3e4] p-4 font-inter text-[14px] text-[#1e1c13] leading-relaxed focus:outline-none focus:bg-[#fff9ed] focus:ring-1 focus:ring-[#673900] resize-none"
                  />
                </div>

                {/* Composición */}
                <div className="md:col-span-12 flex flex-col gap-1.5">
                  <label
                    className="font-inter text-[11px] uppercase tracking-wider text-[#524438]"
                    htmlFor="prod-care"
                  >
                    Composición, Trazabilidad &amp; Cuidados
                  </label>
                  <input
                    id="prod-care"
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    placeholder="Ej. 100% Lino Europeo certificado Master of Linen..."
                    className="w-full bg-[#faf3e4] px-4 py-3 font-inter text-[14px] text-[#1e1c13] focus:outline-none focus:bg-[#fff9ed] focus:ring-1 focus:ring-[#673900]"
                  />
                </div>
              </div>
            </section>

            {/* ── CARD B: GALERÍA MULTIMEDIA ── */}
            <section className="bg-white p-8 shadow-sm flex flex-col gap-6">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-[#c77d2e]" />
                  <h2 className="font-headline text-[24px] uppercase tracking-wide text-[#1e1c13]">
                    GALERÍA MULTIMEDIA
                  </h2>
                </div>
                <span className="font-inter text-[10px] uppercase tracking-widest text-[#524438]">
                  3/8 FOTOS
                </span>
              </div>

              {/* Dropzone */}
              <div className="w-full p-6 bg-[#faf3e4] hover:bg-[#f4eddf] transition-colors flex flex-col items-center justify-center text-center cursor-pointer group border-2 border-dashed border-[#e0dacb] hover:border-[#c77d2e]">
                <span className="material-symbols-outlined text-[28px] text-[#673900] mb-2">
                  add_photo_alternate
                </span>
                <p className="font-headline text-[18px] uppercase text-[#1e1c13] tracking-wider">
                  Añadir fotografías
                </p>
                <p className="font-inter text-[11px] text-[#524438] mt-1">
                  JPG, PNG, WebP — proporción 3:4 — máx. 12MB
                </p>
              </div>

              {/* Uploaded images */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "PORTADA EDITORIAL", size: "2.4 MB • 3000x4000", featured: true },
                  { label: "", size: "1.9 MB • 3000x4000", featured: false },
                  { label: "", size: "2.1 MB • 3000x4000", featured: false },
                ].map((img, i) => (
                  <div key={i} className="relative group bg-[#f4eddf] flex flex-col">
                    <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#e0dacb] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[40px] text-[#857466]">
                        image
                      </span>
                      {img.featured && (
                        <span className="absolute top-2 left-2 bg-[#33402f] text-[#fff9ed] px-2 py-0.5 font-inter text-[10px] uppercase tracking-wider font-semibold">
                          PORTADA EDITORIAL
                        </span>
                      )}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          className="w-7 h-7 bg-[#1e1c13]/80 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                      </div>
                    </div>
                    <div className="p-3 bg-[#faf3e4] flex items-center justify-between">
                      <span className="font-inter text-[12px] text-[#524438]">{img.size}</span>
                      {img.featured && (
                        <span
                          className="material-symbols-outlined text-[18px] text-[#c77d2e]"
                          title="Imagen destacada"
                        >
                          star
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Toggle Portada Dinámica */}
              <div className="flex items-center justify-between bg-[#faf3e4] p-4">
                <div className="flex flex-col">
                  <span className="font-inter text-[11px] uppercase tracking-wider text-[#1e1c13] font-semibold">
                    Portada Dinámica en Vitrina
                  </span>
                  <span className="font-inter text-[12px] text-[#524438]">
                    Alternar automáticamente con foto de silueta al pasar el cursor (hover preview).
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                  <input defaultChecked={p.dynamicCover} className="sr-only peer" type="checkbox" />
                  <div className="w-11 h-6 bg-[#eee8d9] peer-focus:outline-none peer-checked:bg-[#673900] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-5 after:w-5 after:transition-all" />
                </label>
              </div>
            </section>

            {/* ── CARD C: PRECIOS ── */}
            <section className="bg-white p-8 shadow-sm flex flex-col gap-6">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-[#c77d2e]" />
                  <h2 className="font-headline text-[24px] uppercase tracking-wide text-[#1e1c13]">
                    PRECIOS, COSTOS &amp; FACTURACIÓN
                  </h2>
                </div>
                <span className="font-inter text-[10px] uppercase tracking-widest text-[#524438]">
                  MONEDA BASE: USD ($)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Precio Venta */}
                <div className="flex flex-col gap-1.5">
                  <label
                    className="font-inter text-[11px] uppercase tracking-wider text-[#524438]"
                    htmlFor="price-retail"
                  >
                    Precio de Venta Atelier ($)
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 font-headline text-[20px] text-[#524438]">
                      $
                    </span>
                    <input
                      id="price-retail"
                      type="number"
                      step="0.50"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      className="w-full bg-[#faf3e4] pl-8 pr-3 py-3 font-headline text-[20px] text-[#1e1c13] focus:outline-none focus:bg-[#fff9ed] focus:ring-1 focus:ring-[#673900]"
                    />
                  </div>
                  <span className="font-inter text-[12px] text-[#524438]">
                    PVP final sugerido con IVA
                  </span>
                </div>

                {/* Costo Taller */}
                <div className="flex flex-col gap-1.5">
                  <label
                    className="font-inter text-[11px] uppercase tracking-wider text-[#524438]"
                    htmlFor="price-cost"
                  >
                    Costo Taller / Mano de Obra ($)
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 font-headline text-[20px] text-[#524438]">
                      $
                    </span>
                    <input
                      id="price-cost"
                      type="number"
                      step="0.50"
                      value={unitCost}
                      onChange={(e) => setUnitCost(e.target.value)}
                      className="w-full bg-[#faf3e4] pl-8 pr-3 py-3 font-headline text-[20px] text-[#1e1c13] focus:outline-none focus:bg-[#fff9ed] focus:ring-1 focus:ring-[#673900]"
                    />
                  </div>
                  <span className="font-inter text-[12px] text-[#524438]">
                    Materia prima + confección
                  </span>
                </div>

                {/* Margen */}
                <div className="flex flex-col gap-1.5 bg-[#faf3e4] p-4 justify-between">
                  <span className="font-inter text-[11px] uppercase tracking-wider text-[#524438]">
                    Margen Bruto Estimado
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-headline text-[36px] text-[#673900] leading-none">
                      {marginStr}%
                    </span>
                    <span className="font-inter text-[10px] uppercase text-[#33402f] font-semibold">
                      (${profit})
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#eee8d9] overflow-hidden">
                    <div
                      className="h-full bg-[#673900] transition-all"
                      style={{ width: `${Math.min(margin, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* IVA */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-inter text-[11px] uppercase tracking-wider text-[#524438]">
                    Régimen Impositivo (IVA)
                  </label>
                  <div className="flex items-center w-full bg-[#faf3e4] px-4 py-3 gap-2 focus-within:ring-1 focus-within:ring-[#673900] focus-within:bg-[#fff9ed]">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      defaultValue={p.vat}
                      className="w-12 text-center font-mono text-[14px] font-semibold bg-white border border-[#eee8d9] py-0.5 focus:outline-none focus:ring-1 focus:ring-[#673900] text-[#1e1c13]"
                    />
                    <span className="font-inter text-[14px] text-[#1e1c13] flex-1 truncate">
                      % IVA General Ropa y Calzado (España/UE)
                    </span>
                    <span className="material-symbols-outlined text-[#524438] text-[20px] pointer-events-none">
                      percent
                    </span>
                  </div>
                </div>

                {/* Descuento VIP */}
                <div className="flex items-center justify-between bg-[#faf3e4] px-4 py-3 self-end min-h-[48px]">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-inter text-[10px] uppercase tracking-wider font-semibold text-[#1e1c13]">
                      Descuento Club Norte VIP
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-inter text-[12px] text-[#524438]">
                        Tarifa especial -
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        defaultValue={p.vipDiscount}
                        className="w-10 text-center font-mono text-[12px] font-semibold bg-white border border-[#eee8d9] py-0.5 focus:outline-none focus:ring-1 focus:ring-[#673900] text-[#1e1c13]"
                      />
                      <span className="font-inter text-[12px] text-[#524438]">%</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-2">
                    <input defaultChecked className="sr-only peer" type="checkbox" />
                    <div className="w-10 h-5 bg-[#eee8d9] peer-focus:outline-none peer-checked:bg-[#c77d2e] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-4 after:w-4 after:transition-all" />
                  </label>
                </div>
              </div>
            </section>
          </div>

          {/* ════ RIGHT COLUMN (4 cols) ════ */}
          <aside className="lg:col-span-4 flex flex-col gap-8">
            {/* ── CARD 1: ESTADO & VISIBILIDAD ── */}
            <section className="bg-white p-8 shadow-sm flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#eee8d9]">
                <span className="font-headline text-[24px] text-[#1e1c13] tracking-wider uppercase">
                  ESTADO &amp; VISIBILIDAD
                </span>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-3 bg-[#faf3e4]">
                  <div className="flex flex-col">
                    <span className="font-inter text-[10px] uppercase tracking-wider text-[#1e1c13] font-semibold">
                      Estado de Venta
                    </span>
                    <span className="font-inter text-[12px] text-[#524438]">
                      {active ? "Visible en tienda ahora" : "Oculto (borrador)"}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="sr-only peer"
                      type="checkbox"
                    />
                    <div className="w-11 h-6 bg-[#eee8d9] peer-focus:outline-none peer-checked:bg-[#c77d2e] transition-colors relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-white">
                  <div className="flex flex-col">
                    <span className="font-inter text-[10px] uppercase tracking-wider text-[#1e1c13] font-semibold">
                      Destacado en Home
                    </span>
                    <span className="font-inter text-[12px] text-[#524438]">
                      Aparece en sección Novedades
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input defaultChecked={p.featured} className="sr-only peer" type="checkbox" />
                    <div className="w-11 h-6 bg-[#eee8d9] peer-focus:outline-none peer-checked:bg-[#c77d2e] transition-colors relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
              </div>
            </section>

            {/* ── CARD 2: INVENTARIO, TALLES Y COLORES ── */}
            <AdminInventoryVariantsSection
              categoryName={selectedCategoryName}
              initialVariants={initialVariants}
              onVariantsChange={setVariants}
            />
          </aside>
        </div>

        {/* ── STICKY BOTTOM BAR ── */}
        <div className="sticky bottom-0 z-30 w-full bg-[#333027] text-[#f7f0e2] px-4 lg:px-12 py-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#c77d2e] animate-pulse" />
            <span className="font-inter text-[12px] text-[#e0dacb]">
              {isSaving || updateProduct.isPending
                ? "Guardando cambios…"
                : `Editando: ${name || p.name}`}
            </span>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleDiscard}
              className="px-4 py-3 bg-white/10 hover:bg-white/15 text-[#f7f0e2] font-inter text-[10px] uppercase tracking-widest transition-colors cursor-pointer"
            >
              DESCARTAR CAMBIOS
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || updateProduct.isPending}
              className="px-8 py-3 bg-[#673900] hover:bg-[#894d00] disabled:opacity-60 text-white font-headline text-[20px] uppercase tracking-wider shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              {isSaving || updateProduct.isPending ? "GUARDANDO…" : "GUARDAR CAMBIOS"}
              {!(isSaving || updateProduct.isPending) && (
                <span className="material-symbols-outlined text-[18px]">check</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── MODAL ELIMINAR ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e1c13]/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md p-8 shadow-2xl flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-red-500 text-[28px]">
                delete_forever
              </span>
              <h3 className="font-headline text-[28px] uppercase text-[#1e1c13] tracking-wide">
                ELIMINAR PRODUCTO
              </h3>
            </div>
            <p className="font-inter text-[14px] text-[#524438] leading-relaxed">
              ¿Estás seguro de que quieres eliminar{" "}
              <strong className="text-[#1e1c13]">{name || p.name}</strong>? Esta acción no se puede
              deshacer.
            </p>
            <div className="bg-[#faf3e4] p-3 flex items-start gap-2">
              <span className="material-symbols-outlined text-[#c77d2e] text-[18px] mt-0.5">
                info
              </span>
              <span className="font-inter text-[12px] text-[#524438]">
                El producto será eliminado del catálogo. Los pedidos anteriores que lo contengan no
                se verán afectados.
              </span>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-3 bg-[#eee8d9] hover:bg-[#e8e2d4] text-[#1e1c13] font-inter text-[12px] uppercase tracking-widest transition-colors cursor-pointer"
              >
                CANCELAR
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteProductMutation.isPending}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-inter text-[12px] uppercase tracking-widest transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {deleteProductMutation.isPending ? "ELIMINANDO…" : "SÍ, ELIMINAR"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
