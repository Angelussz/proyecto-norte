"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  AdminInventoryVariantsSection,
  type VariantRow,
} from "@/features/admin/components/admin-inventory-variants-section";
import { useCategories } from "@/features/category/hooks/useCategories";
import { useBrands } from "@/features/admin/hooks/useBrands";
import { useColors } from "@/features/admin/hooks/useColors";
import { useCreateProduct, useProducts } from "@/features/admin/hooks/useProducts";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type Notification = { type: "success" | "error"; message: string } | null;

export interface ProductFormImage {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  sizeFormatted: string;
  isFeatured: boolean;
  type: "image" | "video";
}

export function AdminProductForm() {
  const router = useRouter();

  // ── Categorías y marcas ───────────────────────────────────────────────────
  const { data: categories, isLoading: catsLoading, isError: catsError } = useCategories();
  const { data: brands, isLoading: brandsLoading, isError: brandsError } = useBrands();
  const { data: globalColors = [] } = useColors();
  const createProduct = useCreateProduct();
  const { data: allProducts = [] } = useProducts();

  // ── Estado del formulario ─────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [sku, setSku] = useState("");
  const [skuManuallyEdited, setSkuManuallyEdited] = useState(false);
  const [isSkuEditable, setIsSkuEditable] = useState(false);
  const skuInputRef = useRef<HTMLInputElement>(null);
  const [gender, setGender] = useState("Unisex");
  const [description, setDescription] = useState("");
  const [material, setMaterial] = useState("");
  const [basePrice, setBasePrice] = useState<string>("");
  const [unitCost, setUnitCost] = useState<string>("");
  const [active, setActive] = useState(true);
  const [notification, setNotification] = useState<Notification>(null);

  // ── Variantes ─────────────────────────────────────────────────────────────
  const [variants, setVariants] = useState<VariantRow[]>([]);

  // ── Derivados en tiempo real ──────────────────────────────────────────────
  const slug = slugify(name);
  const basePriceNum = parseFloat(basePrice) || 0;
  const unitCostNum = parseFloat(unitCost) || 0;
  const margin = basePriceNum > 0 ? ((basePriceNum - unitCostNum) / basePriceNum) * 100 : 0;
  const marginStr = margin.toFixed(1);
  const profit = (basePriceNum - unitCostNum).toFixed(2);

  // ── Auto-SKU: se genera en cuanto hay marca O categoría ─────────────────
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

    // Número: total de productos existentes + 1 (4 dígitos con padding)
    const nextNum = String(allProducts.length + 1).padStart(4, "0");

    const autoSku = `${brandPrefix}-${catCode}${nextNum}`;
    setSku(autoSku);
  }, [brandId, categoryId, brands, categories, skuManuallyEdited, allProducts]);

  // ── Imágenes ──────────────────────────────────────────────────────────────
  const [images, setImages] = useState<ProductFormImage[]>([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragAllowedIndex, setDragAllowedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Limpieza de URLs temporales al desmontar el componente
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [images]);

  // ── Guardar ───────────────────────────────────────────────────────────────
  async function handleSave(forceActive?: boolean) {
    if (!name.trim()) {
      setNotification({ type: "error", message: "El nombre del producto es obligatorio." });
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

    const effectiveActive = forceActive !== undefined ? forceActive : active;

    // Subir imágenes y/o video al servidor
    let uploadedImageUrl: string | null = null;
    let uploadedVideoUrl: string | null = null;

    if (images.length > 0) {
      setImageUploading(true);
      try {
        // Separar imágenes y videos
        const onlyImages = images.filter((m) => m.type === "image");
        const onlyVideos = images.filter((m) => m.type === "video");

        // 1. Subir la imagen de portada (primera imagen)
        if (onlyImages.length > 0) {
          const featured = onlyImages.find((img) => img.isFeatured) ?? onlyImages[0];
          const imgForm = new FormData();
          imgForm.set("image", featured.file);
          const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: imgForm });
          const uploadData = (await uploadRes.json()) as { url?: string; error?: string };
          if (!uploadRes.ok || !uploadData.url) {
            throw new Error(uploadData.error ?? "Error al subir la imagen de portada");
          }
          uploadedImageUrl = uploadData.url;

          // Subir imágenes adicionales (no portada)
          const additionalImages = onlyImages.filter((img) => img.id !== featured.id);
          if (additionalImages.length > 0) {
            await Promise.all(
              additionalImages.map(async (other) => {
                const otherForm = new FormData();
                otherForm.set("image", other.file);
                await fetch("/api/admin/upload", { method: "POST", body: otherForm }).catch(
                  () => null,
                );
              }),
            );
          }
        }

        // 2. Subir video editorial (solo el primero)
        if (onlyVideos.length > 0) {
          const videoFile = onlyVideos[0];
          const videoForm = new FormData();
          videoForm.set("image", videoFile.file); // el endpoint acepta ambos con este key
          const videoRes = await fetch("/api/admin/upload", { method: "POST", body: videoForm });
          const videoData = (await videoRes.json()) as { url?: string; error?: string };
          if (!videoRes.ok || !videoData.url) {
            throw new Error(videoData.error ?? "Error al subir el video editorial");
          }
          uploadedVideoUrl = videoData.url;
        }
      } catch (err) {
        setImageUploading(false);
        setNotification({
          type: "error",
          message: err instanceof Error ? err.message : "Error al subir archivos multimedia",
        });
        return;
      }
      setImageUploading(false);
    }

    const form = new FormData();
    form.set("name", name.trim());
    form.set("category_id", categoryId);
    form.set("material", material.trim());
    form.set("base_price", String(basePriceNum));
    if (description.trim()) form.set("description", description.trim());
    if (slug) form.set("slug", slug);
    form.set("active", String(effectiveActive));
    if (uploadedImageUrl) form.set("image_url", uploadedImageUrl);
    if (uploadedVideoUrl) form.set("video_url", uploadedVideoUrl);

    try {
      const created = await createProduct.mutateAsync(form);
      // `created` es el DTO del producto con `id` (ver fetchCreateProduct en useProducts.ts)
      const productId: string = (created as { id: string }).id;

      // Guardar variantes con stock > 0
      const variantsToSave = variants.filter((v) => v.stock > 0);
      if (variantsToSave.length > 0) {
        await Promise.all(
          variantsToSave.map(async (v) => {
            const colorCode =
              globalColors?.find(
                (c) =>
                  c.hex.toLowerCase() === v.colorHex.toLowerCase() ||
                  c.name.toLowerCase() === v.colorName.toLowerCase(),
              )?.skuCode ||
              v.colorName
                .trim()
                .replace(/[^A-Za-z]/g, "")
                .slice(0, 3)
                .toUpperCase() ||
              "STD";
            const cleanSize =
              v.size
                .toUpperCase()
                .replace(/^TALLA\s*/i, "")
                .trim() || "U";
            const variantSku = sku.trim() ? `${sku.trim()}-${colorCode}-${cleanSize}` : undefined;

            const res = await fetch(`/api/admin/products/${productId}/variants`, {
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
            if (!res.ok) {
              const errData = await res.json().catch(() => ({}));
              throw new Error(
                errData.error || `Error al guardar variante ${v.size} / ${v.colorName}`,
              );
            }
          }),
        );
      }

      setNotification({
        type: "success",
        message: effectiveActive
          ? "¡Producto publicado correctamente! Redirigiendo a productos…"
          : "¡Borrador guardado correctamente! Redirigiendo a productos…",
      });
      setTimeout(() => {
        router.push("/admin/productos");
      }, 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido al guardar.";
      setNotification({ type: "error", message });
    }
  }

  function handleDiscard() {
    router.back();
  }

  function handleFilesSelect(files: FileList | File[]) {
    const filesArray = Array.from(files);
    if (!filesArray.length) return;
    setImageUploadError(null);

    const allowedImageMimes = ["image/jpeg", "image/png", "image/webp"];
    const allowedVideoMimes = ["video/mp4", "video/webm"];
    const maxImageBytes = 15 * 1024 * 1024; // 15 MB
    const maxVideoBytes = 50 * 1024 * 1024; // 50 MB

    const validFiles: File[] = [];
    for (const file of filesArray) {
      const isImage = allowedImageMimes.includes(file.type);
      const isVideo = allowedVideoMimes.includes(file.type);

      if (!isImage && !isVideo) {
        setImageUploadError("Solo se admiten formatos JPG, PNG, WebP o videos MP4, WebM.");
        continue;
      }
      if (isImage && file.size > maxImageBytes) {
        setImageUploadError(`La imagen "${file.name}" supera el límite de 15 MB.`);
        continue;
      }
      if (isVideo && file.size > maxVideoBytes) {
        setImageUploadError(`El video "${file.name}" supera el límite de 50 MB.`);
        continue;
      }
      validFiles.push(file);
    }

    if (!validFiles.length) return;

    setImages((prev) => {
      const availableSlots = 8 - prev.length;
      if (availableSlots <= 0) {
        setImageUploadError("Has alcanzado el límite máximo de 8 archivos.");
        return prev;
      }

      const filesToProcess = validFiles.slice(0, availableSlots);
      if (validFiles.length > availableSlots) {
        setImageUploadError(
          `Solo se pueden cargar hasta 8 archivos en total (se agregaron ${availableSlots}).`,
        );
      }

      const newEntries: ProductFormImage[] = filesToProcess.map((file, idx) => ({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        name: file.name,
        sizeFormatted: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        isFeatured: prev.length === 0 && idx === 0 && !file.type.startsWith("video/"),
        type: file.type.startsWith("video/") ? "video" : "image",
      }));

      return [...prev, ...newEntries];
    });
  }

  function handleRemoveImage(id: string) {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      const remaining = prev.filter((img) => img.id !== id);
      if (target?.isFeatured && remaining.length > 0) {
        remaining[0].isFeatured = true;
      }
      return remaining;
    });
  }

  function reorderImages(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      // La primera imagen siempre es la portada editorial
      return next.map((img, idx) => ({
        ...img,
        isFeatured: idx === 0,
      }));
    });
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 lg:px-12 py-8 flex flex-col gap-8">
      {/* ── Notificación ── */}
      {notification && (
        <div
          className={`px-6 py-4 font-inter text-[14px] flex items-center justify-between gap-4 ${
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
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6">
        <div className="flex flex-col gap-1 max-w-3xl">
          <h1 className="font-headline text-[48px] leading-none text-[#1e1c13] uppercase tracking-tight">
            AGREGAR NUEVO PRODUCTO
          </h1>
          <p className="font-inter text-[16px] text-[#524438] mt-1">
            Ingreso de nueva pieza artesanal al catálogo editorial, asignación de SKU, precios y
            desglose de confección.
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <button
            type="button"
            onClick={handleDiscard}
            className="px-6 py-3 bg-[#eee8d9] hover:bg-[#e8e2d4] text-[#1e1c13] font-inter text-[12px] uppercase tracking-widest transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
            DESCARTAR BORRADOR
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={createProduct.isPending || imageUploading}
            className="px-8 py-3 bg-[#673900] hover:bg-[#894d00] disabled:opacity-60 text-white font-headline text-[20px] uppercase tracking-wider transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
          >
            {imageUploading
              ? "SUBIENDO ARCHIVOS…"
              : createProduct.isPending
                ? "GUARDANDO…"
                : "GUARDAR Y PUBLICAR"}
            {!createProduct.isPending && !imageUploading && (
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            )}
          </button>
        </div>
      </header>

      {/* ── 2-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ════════════════════════════════
            LEFT COLUMN  (8 cols)
        ════════════════════════════════ */}
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
                  autoComplete="off"
                  suppressHydrationWarning
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
                      autoComplete="off"
                      suppressHydrationWarning
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
                      autoComplete="off"
                      suppressHydrationWarning
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

              {/* SKU */}
              <div className="md:col-span-6 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    className="font-inter text-[11px] uppercase tracking-wider text-[#524438]"
                    htmlFor="prod-sku"
                  >
                    SKU Base
                  </label>
                  <span className="font-mono text-[10px] text-[#857466] uppercase">
                    {!isSkuEditable ? "🔒 Protegido" : "✏️ Editable"}
                  </span>
                </div>
                <div className="relative flex items-center">
                  <input
                    ref={skuInputRef}
                    id="prod-sku"
                    type="text"
                    readOnly={!isSkuEditable}
                    autoComplete="off"
                    suppressHydrationWarning
                    value={sku}
                    onChange={(e) => {
                      setSku(e.target.value.toUpperCase());
                      setSkuManuallyEdited(true);
                    }}
                    placeholder="NRT-CAM0001"
                    className={`w-full pl-4 pr-20 py-3 font-mono text-[16px] uppercase tracking-wider transition-colors ${
                      !isSkuEditable
                        ? "bg-[#ede6d6] text-[#524438] cursor-not-allowed select-all focus:outline-none"
                        : "bg-[#faf3e4] text-[#1e1c13] focus:outline-none focus:bg-[#fff9ed] focus:ring-1 focus:ring-[#673900]"
                    }`}
                  />
                  <div className="absolute right-2 flex items-center gap-1">
                    {skuManuallyEdited && (
                      <button
                        type="button"
                        title="Restaurar SKU automático"
                        onClick={() => {
                          setSkuManuallyEdited(false);
                          setIsSkuEditable(false);
                        }}
                        className="p-1 text-[#857466] hover:text-[#673900] transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">refresh</span>
                      </button>
                    )}
                    <button
                      type="button"
                      title={isSkuEditable ? "Bloquear SKU" : "Habilitar edición manual de SKU"}
                      onClick={() => {
                        if (!isSkuEditable) {
                          setIsSkuEditable(true);
                          setTimeout(() => skuInputRef.current?.focus(), 50);
                        } else {
                          setIsSkuEditable(false);
                        }
                      }}
                      className="px-2 py-1 bg-white/70 hover:bg-white text-[15px] transition-colors cursor-pointer rounded shadow-xs flex items-center justify-center border border-[#d8d0c0]"
                    >
                      {isSkuEditable ? "🔒" : "✏️"}
                    </button>
                  </div>
                </div>
                <span className="font-inter text-[11px] text-[#524438]">
                  {!isSkuEditable ? (
                    brandId || categoryId ? (
                      <span className="text-[#33402f]">
                        SKU generado automáticamente. Bloqueado por seguridad. Hacé clic en ✏️ para
                        editarlo.
                      </span>
                    ) : (
                      "Se generará al seleccionar marca o categoría. Hacé clic en ✏️ para ingresar uno manual."
                    )
                  ) : (
                    <span className="text-[#c77d2e]">
                      Modo edición manual activo. Pulsá ↺ para restaurar el automático o 🔒 para
                      bloquear.
                    </span>
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
                    autoComplete="off"
                    suppressHydrationWarning
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

              {/* URL Slug banner */}
              <div className="md:col-span-12 bg-[#f4eddf] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="material-symbols-outlined text-[#c77d2e] text-[18px]">link</span>
                  <span className="font-inter text-[10px] uppercase tracking-wider text-[#524438] shrink-0">
                    URL Slug:
                  </span>
                  <span className="font-inter text-[12px] text-[#673900] truncate">
                    norteatelier.com/shop/{slug || "…"}
                  </span>
                </div>
              </div>

              {/* Descripción */}
              <div className="md:col-span-12 flex flex-col gap-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="font-inter text-[11px] uppercase tracking-wider text-[#524438]">
                    Descripción Editorial &amp; Silueta
                  </label>
                  <div className="flex items-center gap-1 bg-[#f4eddf] px-2 py-0.5">
                    {[
                      "format_bold",
                      "format_italic",
                      "link",
                      "format_list_bulleted",
                      "format_quote",
                    ].map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        className="p-1 hover:bg-[#e8e2d4] text-[#524438] hover:text-[#1e1c13]"
                      >
                        <span className="material-symbols-outlined text-[16px]">{icon}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  rows={4}
                  autoComplete="off"
                  suppressHydrationWarning
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción editorial de la pieza…"
                  className="w-full bg-[#faf3e4] p-4 font-inter text-[14px] text-[#1e1c13] leading-relaxed placeholder:text-[#857466] focus:outline-none focus:bg-[#fff9ed] focus:ring-1 focus:ring-[#673900] resize-none"
                />
              </div>

              {/* Composición / Material */}
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
                  autoComplete="off"
                  suppressHydrationWarning
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="100% Lino Europeo certificado. Lavar en seco o ciclo delicado 30°C."
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
                  GALERÍA MULTIMEDIA Y FOTOGRAFÍA EDITORIAL
                </h2>
              </div>
              <span className="font-inter text-[10px] uppercase tracking-widest text-[#524438]">
                {images.length}/8 ARCHIVOS CARGADOS
              </span>
            </div>

            {/* Input oculto (soporta múltiples imágenes) */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              suppressHydrationWarning
              accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleFilesSelect(e.target.files);
                e.target.value = "";
              }}
            />

            {/* Dropzone */}
            <div
              className={`w-full p-8 bg-[#faf3e4] hover:bg-[#f4eddf] transition-colors flex flex-col items-center justify-center text-center group ${
                images.length >= 8 ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
              }`}
              onClick={() => {
                if (images.length < 8) fileInputRef.current?.click();
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (images.length < 8 && e.dataTransfer.files) {
                  handleFilesSelect(e.dataTransfer.files);
                }
              }}
            >
              <div className="w-12 h-12 bg-[#eee8d9] group-hover:bg-[#ffdcc0] flex items-center justify-center mb-4 transition-colors">
                <span className="material-symbols-outlined text-[26px] text-[#673900]">
                  perm_media
                </span>
              </div>
              <p className="font-headline text-[20px] uppercase text-[#1e1c13] tracking-wider">
                {images.length >= 8
                  ? "Límite máximo de 8 archivos alcanzado"
                  : "Arrastra fotografías o videos editoriales"}
              </p>
              <p className="font-inter text-[12px] text-[#524438] mt-1">
                Imágenes JPG, PNG, WebP máx. 15 MB · Videos MP4, WebM máx. 50 MB
              </p>
              {images.length < 8 && (
                <span className="mt-4 px-4 py-1.5 bg-white font-inter text-[10px] uppercase tracking-widest text-[#1e1c13] shadow-sm">
                  SELECCIONAR DESDE DISPOSITIVO
                </span>
              )}
            </div>

            {/* Error de upload */}
            {imageUploadError && (
              <p className="font-inter text-[13px] text-red-600">{imageUploadError}</p>
            )}

            {/* Galería de imágenes cargadas */}
            {images.length > 0 && (
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center gap-1.5 text-[#524438] text-[12px] font-inter">
                  <span className="material-symbols-outlined text-[16px] text-[#c77d2e]">
                    drag_indicator
                  </span>
                  <span>
                    Mantené presionado el ícono{" "}
                    <span className="font-mono font-bold text-[#1e1c13]">:::</span> para arrastrar
                    el archivo y cambiarla de lugar. La primera imagen (#1) será la portada.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((img, index) => {
                    const isDragging = draggedIndex === index;
                    const isDragOver = dragOverIndex === index;

                    return (
                      <div
                        key={img.id}
                        draggable={dragAllowedIndex === index}
                        onDragStart={(e) => {
                          setDraggedIndex(index);
                          e.dataTransfer.effectAllowed = "move";
                          e.dataTransfer.setData("text/plain", String(index));
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                          if (dragOverIndex !== index) {
                            setDragOverIndex(index);
                          }
                        }}
                        onDragLeave={() => {
                          if (dragOverIndex === index) {
                            setDragOverIndex(null);
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (draggedIndex !== null && draggedIndex !== index) {
                            reorderImages(draggedIndex, index);
                          }
                          setDragAllowedIndex(null);
                          setDraggedIndex(null);
                          setDragOverIndex(null);
                        }}
                        onDragEnd={() => {
                          setDragAllowedIndex(null);
                          setDraggedIndex(null);
                          setDragOverIndex(null);
                        }}
                        className={`relative group bg-[#f4eddf] flex flex-col border transition-all select-none ${
                          isDragging
                            ? "opacity-40 scale-95 border-dashed border-[#c77d2e]"
                            : isDragOver
                              ? "ring-2 ring-[#673900] scale-[1.02] border-[#673900]"
                              : img.isFeatured
                                ? "border-[#c77d2e] shadow-md"
                                : "border-[#e0dacb] hover:border-[#857466]"
                        }`}
                      >
                        <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#e0dacb]">
                          {img.type === "video" ? (
                            <video
                              src={img.previewUrl}
                              className="w-full h-full object-cover pointer-events-none"
                              muted
                              loop
                              autoPlay
                              playsInline
                            />
                          ) : (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={img.previewUrl}
                              alt={img.name}
                              className="w-full h-full object-cover pointer-events-none"
                            />
                          )}

                          {/* Badge de posición / portada / video */}
                          <div className="absolute top-2 left-2 flex items-center gap-1.5 pointer-events-none">
                            <span className="bg-[#1e1c13]/85 text-white px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider">
                              #{index + 1}
                            </span>
                            {img.type === "video" ? (
                              <span className="bg-[#673900] text-[#fff9ed] px-2 py-0.5 font-inter text-[10px] uppercase tracking-wider font-semibold shadow-sm">
                                VIDEO
                              </span>
                            ) : (
                              img.isFeatured && (
                                <span className="bg-[#33402f] text-[#fff9ed] px-2 py-0.5 font-inter text-[10px] uppercase tracking-wider font-semibold shadow-sm">
                                  PORTADA
                                </span>
                              )
                            )}
                          </div>

                          {/* Botón eliminar */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(img.id);
                            }}
                            title="Eliminar imagen"
                            className="absolute top-2 right-2 w-7 h-7 bg-[#1e1c13]/85 hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm z-10"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>

                        {/* Pie de tarjeta con info y símbolo de arrastre */}
                        <div className="p-3 bg-[#faf3e4] flex items-center justify-between gap-2">
                          <div className="flex flex-col min-w-0">
                            <span
                              className="font-inter text-[11px] text-[#1e1c13] truncate font-medium"
                              title={img.name}
                            >
                              {img.name}
                            </span>
                            <span className="font-inter text-[10px] text-[#524438]">
                              {img.sizeFormatted}
                            </span>
                          </div>

                          {/* Símbolo drag_indicator exclusivo para mover */}
                          <div
                            onMouseDown={() => setDragAllowedIndex(index)}
                            onMouseUp={() => setDragAllowedIndex(null)}
                            onTouchStart={() => setDragAllowedIndex(index)}
                            onTouchEnd={() => setDragAllowedIndex(null)}
                            title="Mantené presionado aquí para arrastrar y cambiar de lugar"
                            className="p-1 text-[#857466] hover:text-[#673900] active:text-[#673900] hover:bg-[#eee8d9] transition-colors cursor-grab active:cursor-grabbing shrink-0"
                          >
                            <span className="material-symbols-outlined text-[20px] pointer-events-none select-none">
                              drag_indicator
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Gallery toggle */}
            <div className="flex items-center justify-between pt-1 bg-[#faf3e4] p-4">
              <div className="flex flex-col">
                <span className="font-inter text-[11px] uppercase tracking-wider text-[#1e1c13] font-semibold">
                  Portada Dinámica en Vitrina
                </span>
                <span className="font-inter text-[12px] text-[#524438]">
                  Alternar automáticamente con foto de silueta al pasar el cursor (hover preview).
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  defaultChecked
                  suppressHydrationWarning
                  className="sr-only peer"
                  type="checkbox"
                />
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
                    autoComplete="off"
                    suppressHydrationWarning
                    step="0.50"
                    min="0"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder="0.00"
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
                    autoComplete="off"
                    suppressHydrationWarning
                    step="0.50"
                    min="0"
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                    placeholder="0.00"
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
                    autoComplete="off"
                    suppressHydrationWarning
                    min={0}
                    max={100}
                    defaultValue={21}
                    className="w-12 text-center font-mono text-[14px] font-semibold bg-white border border-[#eee8d9] py-0.5 focus:outline-none focus:ring-1 focus:ring-[#673900] text-[#1e1c13]"
                  />
                  <span className="font-inter text-[14px] text-[#1e1c13] flex-1 truncate">
                    % IVA
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
                    <span className="font-inter text-[12px] text-[#524438]">Tarifa especial -</span>
                    <input
                      type="number"
                      autoComplete="off"
                      suppressHydrationWarning
                      min={0}
                      max={100}
                      defaultValue={15}
                      className="w-10 text-center font-mono text-[12px] font-semibold bg-white border border-[#eee8d9] py-0.5 focus:outline-none focus:ring-1 focus:ring-[#673900] text-[#1e1c13]"
                    />
                    <span className="font-inter text-[12px] text-[#524438]">%</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-2">
                  <input
                    defaultChecked
                    suppressHydrationWarning
                    className="sr-only peer"
                    type="checkbox"
                  />
                  <div className="w-10 h-5 bg-[#eee8d9] peer-focus:outline-none peer-checked:bg-[#c77d2e] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-4 after:w-4 after:transition-all" />
                </label>
              </div>
            </div>
          </section>
        </div>

        {/* ════════════════════════════════
            RIGHT COLUMN  (4 cols)
        ════════════════════════════════ */}
        <aside className="lg:col-span-4 flex flex-col gap-8">
          {/* ── CARD 1: ESTADO & VISIBILIDAD ── */}
          <section className="bg-white p-8 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#eee8d9]">
              <span className="font-headline text-[24px] text-[#1e1c13] tracking-wider uppercase">
                ESTADO &amp; VISIBILIDAD
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {/* Estado de Venta */}
              <div className="flex items-center justify-between p-3 bg-[#faf3e4]">
                <div className="flex flex-col">
                  <span className="font-inter text-[10px] uppercase tracking-wider text-[#1e1c13] font-semibold">
                    Estado de Venta
                  </span>
                  <span className="font-inter text-[12px] text-[#524438]">
                    {active ? "Visible inmediatamente" : "Oculto (borrador)"}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    checked={active}
                    suppressHydrationWarning
                    onChange={(e) => setActive(e.target.checked)}
                    className="sr-only peer"
                    type="checkbox"
                  />
                  <div className="w-11 h-6 bg-[#eee8d9] peer-focus:outline-none peer-checked:bg-[#c77d2e] transition-colors relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>

              {/* Destacado en Home (solo UI) */}
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
                  <input
                    defaultChecked
                    suppressHydrationWarning
                    className="sr-only peer"
                    type="checkbox"
                  />
                  <div className="w-11 h-6 bg-[#eee8d9] peer-focus:outline-none peer-checked:bg-[#c77d2e] transition-colors relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>

              {/* Historial */}
              <div className="pt-4 border-t border-[#eee8d9] flex flex-col gap-1 text-[#524438]">
                <span className="font-inter text-[10px] uppercase tracking-widest text-[#1e1c13] font-semibold">
                  Historial de Registro
                </span>
                <p className="font-inter text-[12px] leading-relaxed">
                  Borrador nuevo · Programado para publicación inmediata.
                </p>
              </div>
            </div>
          </section>

          {/* ── CARD 2: INVENTARIO, TALLES Y COLORES ── */}
          <AdminInventoryVariantsSection
            onVariantsChange={setVariants}
            categoryName={categories?.find((c) => c.id === categoryId)?.name ?? ""}
          />
        </aside>
      </div>

      {/* ── STICKY BOTTOM BAR ── */}
      <div className="sticky bottom-0 z-30 w-full bg-[#333027] text-[#f7f0e2] px-4 lg:px-12 py-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#c77d2e] animate-pulse" />
          <span className="font-inter text-[12px] text-[#e0dacb]">
            {imageUploading
              ? "Subiendo imágenes…"
              : createProduct.isPending
                ? "Guardando producto…"
                : "Cambios sin guardar • Borrador nuevo"}
          </span>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
          <button
            type="button"
            className="px-4 py-3 bg-white/10 hover:bg-white/15 text-[#f7f0e2] font-inter text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            VISTA PREVIA
          </button>
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={createProduct.isPending || imageUploading}
            className="px-4 py-3 bg-white/10 hover:bg-white/15 disabled:opacity-50 text-[#f7f0e2] font-inter text-[10px] uppercase tracking-widest transition-colors cursor-pointer"
          >
            GUARDAR BORRADOR
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={createProduct.isPending || imageUploading}
            className="px-8 py-3 bg-[#673900] hover:bg-[#894d00] disabled:opacity-60 text-white font-headline text-[20px] uppercase tracking-wider shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
          >
            {imageUploading
              ? "SUBIENDO ARCHIVOS…"
              : createProduct.isPending
                ? "PUBLICANDO…"
                : "PUBLICAR PRODUCTO"}
            {!createProduct.isPending && !imageUploading && (
              <span className="material-symbols-outlined text-[18px]">check</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
