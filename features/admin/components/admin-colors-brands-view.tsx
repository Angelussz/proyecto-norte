"use client";

import { useState } from "react";

interface OfficialColor {
  id: string;
  name: string;
  hex: string;
}

interface AtelierBrand {
  id: string;
  name: string;
  description: string;
  assignedItems: number;
  iconColor: "primary" | "secondary" | "mustard";
  locked?: boolean;
}

const INITIAL_COLORS: OfficialColor[] = [
  { id: "c1", name: "Arena Natural", hex: "#e4d5b7" },
  { id: "c2", name: "Verde Oliva", hex: "#4f583d" },
  { id: "c3", name: "Terracota", hex: "#9e472a" },
  { id: "c4", name: "Negro Carbón", hex: "#1a1a1a" },
  { id: "c5", name: "Blanco Puro", hex: "#fdfbf7" },
  { id: "c6", name: "Azul Marino", hex: "#1B2838" },
  { id: "c7", name: "Gris Melange", hex: "#8C8F94" },
  { id: "c8", name: "Marrón Tabaco", hex: "#5C3A21" },
  { id: "c9", name: "Burdeos / Borgoña", hex: "#5A1827" },
  { id: "c10", name: "Beige Crudo", hex: "#F5ECE1" },
];

const INITIAL_BRANDS: AtelierBrand[] = [
  {
    id: "b1",
    name: "NORTE ATELIER",
    description: "Línea sede confeccionada en Madrid. Patronaje clásico atemporal.",
    assignedItems: 28,
    iconColor: "primary",
    locked: true,
  },
  {
    id: "b2",
    name: "NORTE ESSENTIALS",
    description: "Básicos perennes confeccionados en pequeñas tiradas limitadas.",
    assignedItems: 8,
    iconColor: "secondary",
  },
  {
    id: "b3",
    name: "COLABORACIÓN JORGE JUAN",
    description: "Cápsula exclusiva de sastrería desestructurada para la temporada 2025.",
    assignedItems: 2,
    iconColor: "mustard",
  },
];

export function AdminColorsBrandsView() {
  const [colors, setColors] = useState<OfficialColor[]>(INITIAL_COLORS);
  const [brands, setBrands] = useState<AtelierBrand[]>(INITIAL_BRANDS);

  // Form states - Color
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#2C3E50");

  // Form states - Brand
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandDesc, setNewBrandDesc] = useState("");

  // Edit Brand Modal
  const [editingBrand, setEditingBrand] = useState<AtelierBrand | null>(null);

  // Changelog Modal
  const [showChangelogModal, setShowChangelogModal] = useState(false);

  // Preview Color Modal
  const [previewColor, setPreviewColor] = useState<OfficialColor | null>(null);

  // Feedback Notification
  const [notification, setNotification] = useState<string | null>(null);

  function triggerNotice(msg: string) {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  }

  // Handlers for Colors
  function handleAddColor() {
    if (!newColorName.trim()) {
      alert("Por favor introduce un nombre para el color.");
      return;
    }
    const colorId = `c_${Date.now()}`;
    const formattedHex = newColorHex.startsWith("#")
      ? newColorHex.toUpperCase()
      : `#${newColorHex.toUpperCase()}`;
    const newEntry: OfficialColor = {
      id: colorId,
      name: newColorName.trim(),
      hex: formattedHex,
    };
    setColors((prev) => [...prev, newEntry]);
    setNewColorName("");
    setNewColorHex("#2C3E50");
    triggerNotice(`Tintura "${newEntry.name}" añadida con éxito.`);
  }

  function handleDeleteColor(id: string) {
    const toDelete = colors.find((c) => c.id === id);
    if (!toDelete) return;
    if (confirm(`¿Eliminar la tintura oficial "${toDelete.name}" (${toDelete.hex})?`)) {
      setColors((prev) => prev.filter((c) => c.id !== id));
      triggerNotice(`Tintura "${toDelete.name}" eliminada.`);
    }
  }

  // Handlers for Brands
  function handleAddBrand() {
    if (!newBrandName.trim()) {
      alert("Por favor introduce el nombre de la firma o línea.");
      return;
    }
    const brandId = `b_${Date.now()}`;
    const newEntry: AtelierBrand = {
      id: brandId,
      name: newBrandName.trim().toUpperCase(),
      description: newBrandDesc.trim() || "Nueva firma textil registrada en el atelier.",
      assignedItems: 0,
      iconColor: "secondary",
    };
    setBrands((prev) => [...prev, newEntry]);
    setNewBrandName("");
    setNewBrandDesc("");
    triggerNotice(`Marca "${newEntry.name}" registrada con éxito.`);
  }

  function handleDeleteBrand(id: string) {
    const toDelete = brands.find((b) => b.id === id);
    if (!toDelete || toDelete.locked) return;
    if (confirm(`¿Eliminar la firma "${toDelete.name}"?`)) {
      setBrands((prev) => prev.filter((b) => b.id !== id));
      triggerNotice(`Firma "${toDelete.name}" eliminada.`);
    }
  }

  function handleSaveEditBrand() {
    if (!editingBrand) return;
    setBrands((prev) =>
      prev.map((b) =>
        b.id === editingBrand.id
          ? {
              ...b,
              name: editingBrand.name.trim().toUpperCase(),
              description: editingBrand.description.trim(),
            }
          : b,
      ),
    );
    triggerNotice(`Firma "${editingBrand.name}" actualizada.`);
    setEditingBrand(null);
  }

  // Export JSON
  function handleExportJson() {
    const exportPayload = {
      atelier: "NORTE Atelier Madrid",
      version: "2025.1",
      exportedAt: new Date().toISOString(),
      officialColors: colors,
      atelierBrands: brands,
    };
    const jsonBlob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: "application/json",
    });
    const downloadUrl = URL.createObjectURL(jsonBlob);
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = `norte_colores_y_marcas_${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(downloadUrl);
    triggerNotice("Archivo JSON de colores y marcas exportado correctamente.");
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
            <div className="flex items-start justify-between">
              <span className="font-inter text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">
                Cartas de Color
              </span>
              <span className="material-symbols-outlined text-primary text-[20px]">palette</span>
            </div>
            <div className="mt-4">
              <span className="font-headline text-[36px] text-on-surface tracking-wide block leading-none">
                {colors.length}
              </span>
              <span className="font-inter text-[12px] text-on-surface-variant uppercase block mt-1 font-medium">
                Tinturas Oficiales
              </span>
              <p className="font-inter text-[12px] text-secondary mt-1">
                Hexadecimal vinculado, 100% activo en catálogo
              </p>
            </div>
            <div className="absolute -right-2 -bottom-3 opacity-5 pointer-events-none select-none">
              <span className="material-symbols-outlined text-[88px] text-on-surface">colors</span>
            </div>
          </div>

          {/* KPI 2: Marcas & Líneas Atelier */}
          <div className="bg-surface-container-low p-6 flex flex-col justify-between relative overflow-hidden group border border-outline-variant/30 shadow-sm">
            <div className="flex items-start justify-between">
              <span className="font-inter text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">
                Marcas &amp; Líneas Atelier
              </span>
              <span className="material-symbols-outlined text-mustard text-[20px]">verified</span>
            </div>
            <div className="mt-4">
              <span className="font-headline text-[36px] text-on-surface tracking-wide block leading-none">
                {brands.length}
              </span>
              <span className="font-inter text-[12px] text-on-surface-variant uppercase block mt-1 font-medium">
                Firmas Registradas
              </span>
              <p className="font-inter text-[12px] text-secondary mt-1">
                Sello de confección oficial
              </p>
            </div>
            <div className="absolute -right-2 -bottom-3 opacity-5 pointer-events-none select-none">
              <span className="material-symbols-outlined text-[88px] text-on-surface">label</span>
            </div>
          </div>

          {/* KPI 3: Prendas Asignadas */}
          <div className="bg-surface-container-low p-6 flex flex-col justify-between relative overflow-hidden group border border-outline-variant/30 shadow-sm">
            <div className="flex items-start justify-between">
              <span className="font-inter text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">
                Prendas Asignadas
              </span>
              <span className="material-symbols-outlined text-forest-green text-[20px]">
                checkroom
              </span>
            </div>
            <div className="mt-4">
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
            <div className="absolute -right-2 -bottom-3 opacity-5 pointer-events-none select-none">
              <span className="material-symbols-outlined text-[88px] text-on-surface">
                inventory_2
              </span>
            </div>
          </div>

          {/* KPI 4: Disponibilidad */}
          <div className="bg-surface-container-low p-6 flex flex-col justify-between relative overflow-hidden group border border-outline-variant/30 shadow-sm">
            <div className="flex items-start justify-between">
              <span className="font-inter text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">
                Disponibilidad
              </span>
              <span className="material-symbols-outlined text-secondary text-[20px]">sync</span>
            </div>
            <div className="mt-4">
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
            <div className="absolute -right-2 -bottom-3 opacity-5 pointer-events-none select-none">
              <span className="material-symbols-outlined text-[88px] text-on-surface">
                cloud_done
              </span>
            </div>
          </div>
        </div>

        {/* ── 2. SECCIÓN: Paleta de Colores & Tinturas Globales ── */}
        <section className="bg-surface-container-low p-6 lg:p-8 shadow-sm border border-outline-variant/40 flex flex-col gap-6">
          {/* Header de la Sección 2 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-mustard flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-inverse-surface text-[26px]">
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
              <span>{colors.length} Tinturas Registradas</span>
            </div>
          </div>

          {/* Formulario para Añadir Color Global */}
          <div className="bg-surface p-4 border border-outline-variant/30">
            <h3 className="font-headline text-[18px] uppercase text-on-surface tracking-wider mb-3">
              REGISTRAR NUEVA TINTURA OFICIAL
            </h3>
            <form
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
              onSubmit={(e) => {
                e.preventDefault();
                handleAddColor();
              }}
            >
              <div className="sm:col-span-6 relative">
                <input
                  type="text"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  placeholder="Nombre del color (ej: Añil Natural, Índigo Atelier)"
                  className="w-full bg-surface-container-lowest px-4 py-2.5 text-on-surface font-inter text-[14px] placeholder:text-outline/70 border border-outline-variant/40 focus:border-primary focus:outline-none rounded-none"
                />
              </div>
              <div className="sm:col-span-3 flex items-center gap-2 bg-surface-container-lowest px-3 py-2 border border-outline-variant/40">
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
              <div className="sm:col-span-3">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-secondary hover:bg-forest-green text-[#fff9ed] font-headline text-[18px] uppercase tracking-wider transition-colors active:translate-y-px shadow-sm flex items-center justify-center gap-1.5 rounded-none cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>+ AÑADIR COLOR</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {colors.map((color) => (
                <div
                  key={color.id}
                  className="bg-surface p-3.5 border border-outline-variant/30 flex items-center justify-between group hover:border-primary transition-colors"
                >
                  <div
                    className="flex items-center gap-3 cursor-pointer min-w-0"
                    onClick={() => setPreviewColor(color)}
                    title="Click para ver detalle del tono"
                  >
                    <span
                      className="w-8 h-8 shadow-sm shrink-0 border border-outline-variant/50 rounded-none group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-inter text-[13px] font-semibold text-on-surface truncate">
                        {color.name}
                      </span>
                      <span className="font-mono text-[11px] text-on-surface-variant uppercase">
                        {color.hex}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteColor(color.id)}
                    className="text-on-surface-variant hover:text-error transition-colors p-1 shrink-0 ml-1"
                    title={`Eliminar color ${color.name}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. SECCIÓN: Marcas & Firmas de Atelier ── */}
        <section className="bg-surface-container-low p-6 lg:p-8 shadow-sm border border-outline-variant/40 flex flex-col gap-6">
          {/* Header de la Sección 3 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-forest-green flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[#fff9ed] text-[26px]">
                  verified
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-headline text-[24px] uppercase tracking-wide text-on-surface leading-tight">
                    3. MARCAS &amp; FIRMAS DE ATELIER
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
              onSubmit={(e) => {
                e.preventDefault();
                handleAddBrand();
              }}
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
              <div className="sm:col-span-6 relative flex flex-col gap-1">
                <label className="font-inter text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                  Descripción Breve
                </label>
                <input
                  type="text"
                  value={newBrandDesc}
                  onChange={(e) => setNewBrandDesc(e.target.value)}
                  placeholder="Ej: Lugar o tienda de procedencia (ej: Boutique Barrio Salamanca, Taller Bilbao)"
                  className="w-full bg-surface-container-lowest px-4 py-2 text-on-surface font-inter text-[14px] placeholder:text-outline/70 border border-outline-variant/40 focus:border-primary focus:outline-none rounded-none"
                />
              </div>
              <div className="sm:col-span-3 flex flex-col justify-end self-end">
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-secondary hover:bg-forest-green text-[#fff9ed] font-headline text-[18px] uppercase tracking-wider transition-colors active:translate-y-px shadow-sm flex items-center justify-center gap-1.5 rounded-none cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>+ AÑADIR MARCA</span>
                </button>
              </div>
            </form>
          </div>

          {/* Listado Horizontal de Marcas Registradas en 3 columnas */}
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
                        className="text-on-surface-variant hover:text-error transition-colors p-1"
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
                    {brand.locked ? (
                      <span
                        className="material-symbols-outlined text-[16px] text-on-surface-variant"
                        title="Línea sede oficial protegida"
                      >
                        lock
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditingBrand({ ...brand })}
                        className="font-inter text-[11px] text-primary hover:underline uppercase font-medium cursor-pointer"
                      >
                        Editar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 4. Banner de Sincronización Automática de Taller ── */}
        <div className="bg-forest-green text-[#fff9ed] p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
          <div className="flex items-start gap-4 max-w-2xl">
            <div className="w-12 h-12 bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">cloud_sync</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline text-[22px] tracking-wide uppercase text-[#fff9ed]">
                Sincronización Automática de Taller
              </span>
              <p className="font-inter text-[13px] text-[#fff9ed]/80 leading-relaxed mt-1">
                Cualquier cambio en las firmas de atelier o en la carta de tinturas se propaga
                inmediatamente a las pantallas de Creación de Producto, Fichas de Inventario y
                Tienda Online Pública.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-stretch sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setShowChangelogModal(true)}
              className="px-4 py-2.5 bg-secondary/40 text-[#fff9ed] hover:bg-secondary/60 transition-colors font-inter text-[12px] uppercase tracking-wider font-medium rounded-none cursor-pointer"
            >
              Registro de Cambios
            </button>
            <button
              type="button"
              onClick={handleExportJson}
              className="px-4 py-2.5 bg-mustard text-inverse-surface hover:bg-mustard/90 transition-colors font-inter text-[12px] uppercase tracking-wider font-semibold flex items-center gap-1.5 rounded-none cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Exportar JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal: Editar Marca ── */}
      {editingBrand && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface max-w-lg w-full p-6 border border-outline-variant shadow-xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <h3 className="font-headline text-[20px] uppercase tracking-wide text-on-surface">
                EDITAR MARCA / FIRMA ATELIER
              </h3>
              <button
                type="button"
                onClick={() => setEditingBrand(null)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="font-inter text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                  Nombre de la Línea
                </span>
                <input
                  type="text"
                  value={editingBrand.name}
                  onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
                  className="bg-surface-container-lowest border border-outline-variant/40 px-3 py-2 text-on-surface font-inter text-[14px] outline-none focus:border-primary rounded-none"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-inter text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                  Descripción
                </span>
                <textarea
                  rows={3}
                  value={editingBrand.description}
                  onChange={(e) =>
                    setEditingBrand({ ...editingBrand, description: e.target.value })
                  }
                  className="bg-surface-container-lowest border border-outline-variant/40 px-3 py-2 text-on-surface font-inter text-[14px] outline-none focus:border-primary rounded-none"
                />
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/30">
              <button
                type="button"
                onClick={() => setEditingBrand(null)}
                className="px-4 py-2 border border-outline-variant/60 font-inter text-[12px] uppercase tracking-wider text-on-surface hover:bg-surface-container rounded-none"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEditBrand}
                className="px-5 py-2 bg-primary hover:bg-primary-container text-on-primary font-inter text-[12px] uppercase tracking-wider font-semibold rounded-none"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Registro de Cambios (Changelog) ── */}
      {showChangelogModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface max-w-xl w-full p-6 border border-outline-variant shadow-xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">history</span>
                <h3 className="font-headline text-[20px] uppercase tracking-wide text-on-surface">
                  REGISTRO DE CAMBIOS Y SINCRONIZACIÓN
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowChangelogModal(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-3 font-inter text-[13px] max-h-72 overflow-y-auto pr-1">
              <div className="p-3 bg-surface-container-lowest border border-outline-variant/30 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-on-surface">Carta de Color Sincronizada</span>
                  <span className="text-on-surface-variant text-[11px] font-mono">Hoy, 10:25</span>
                </div>
                <p className="text-on-surface-variant text-[12px]">
                  10 tinturas oficiales propagadas al motor de catálogo textil y a la tienda online.
                </p>
                <span className="text-[10px] text-forest-green font-semibold uppercase mt-0.5">
                  Operador: Elena Vázquez
                </span>
              </div>
              <div className="p-3 bg-surface-container-lowest border border-outline-variant/30 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-on-surface">Marca Agregada: Jorge Juan</span>
                  <span className="text-on-surface-variant text-[11px] font-mono">Ayer, 18:40</span>
                </div>
                <p className="text-on-surface-variant text-[12px]">
                  Se vinculó la cápsula de sastrería desestructurada 2025 con 2 prendas asignadas.
                </p>
                <span className="text-[10px] text-forest-green font-semibold uppercase mt-0.5">
                  Operador: Elena Vázquez
                </span>
              </div>
            </div>
            <div className="flex justify-end pt-3 border-t border-outline-variant/30">
              <button
                type="button"
                onClick={() => setShowChangelogModal(false)}
                className="px-5 py-2 bg-secondary hover:bg-forest-green text-[#fff9ed] font-inter text-[12px] uppercase tracking-wider rounded-none"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Previsualización de Color ── */}
      {previewColor && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface max-w-sm w-full p-6 border border-outline-variant shadow-xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
              <span className="font-inter text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">
                MUESTRA DE TINTURA OFICIAL
              </span>
              <button
                type="button"
                onClick={() => setPreviewColor(null)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div
              className="w-full h-32 border border-outline-variant/50 shadow-inner flex items-end p-3"
              style={{ backgroundColor: previewColor.hex }}
            >
              <span className="font-mono text-[12px] px-2 py-0.5 bg-black/40 text-white backdrop-blur-xs">
                {previewColor.hex}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="font-headline text-[22px] uppercase text-on-surface tracking-wide">
                {previewColor.name}
              </h4>
              <p className="font-inter text-[12px] text-on-surface-variant">
                Tintura homologada para telas de lino, lana virgen y algodón orgánico del atelier.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPreviewColor(null)}
              className="w-full py-2 bg-primary hover:bg-primary-container text-on-primary font-inter text-[12px] uppercase tracking-wider rounded-none"
            >
              Cerrar Muestra
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
