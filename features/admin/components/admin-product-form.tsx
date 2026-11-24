"use client";

import { useState } from "react";

type ColorVariant = {
  name: string;
  hex: string;
  stock: number;
};

type SizeVariant = {
  size: string;
  label: string;
  colors: ColorVariant[];
  open: boolean;
};

const INITIAL_SIZES: SizeVariant[] = [
  {
    size: "38",
    label: "S",
    open: true,
    colors: [
      { name: "Arena Natural", hex: "#e0dacb", stock: 10 },
      { name: "Verde Oliva", hex: "#54624f", stock: 8 },
    ],
  },
  {
    size: "40",
    label: "M",
    open: false,
    colors: [
      { name: "Arena Natural", hex: "#e0dacb", stock: 9 },
      { name: "Terracota", hex: "#c77d2e", stock: 7 },
    ],
  },
  {
    size: "42",
    label: "L",
    open: false,
    colors: [{ name: "Negro Carbón", hex: "#222220", stock: 8 }],
  },
];

export function AdminProductForm() {
  const [sizes, setSizes] = useState<SizeVariant[]>(INITIAL_SIZES);
  const [images] = useState([
    { label: "PORTADA EDITORIAL", size: "2.4 MB • 3000x4000", featured: true },
    { label: "", size: "1.9 MB • 3000x4000", featured: false },
    { label: "", size: "2.1 MB • 3000x4000", featured: false },
  ]);

  function toggleSize(idx: number) {
    setSizes((prev) => prev.map((s, i) => (i === idx ? { ...s, open: !s.open } : s)));
  }

  function updateStock(sIdx: number, cIdx: number, delta: number) {
    setSizes((prev) =>
      prev.map((s, i) =>
        i === sIdx
          ? {
              ...s,
              colors: s.colors.map((c, j) =>
                j === cIdx ? { ...c, stock: Math.max(0, c.stock + delta) } : c,
              ),
            }
          : s,
      ),
    );
  }

  const totalStock = sizes.reduce((acc, s) => acc + s.colors.reduce((a, c) => a + c.stock, 0), 0);

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 lg:px-12 py-8 flex flex-col gap-8">
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
            className="px-6 py-3 bg-[#eee8d9] hover:bg-[#e8e2d4] text-[#1e1c13] font-inter text-[12px] uppercase tracking-widest transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
            DESCARTAR BORRADOR
          </button>
          <button
            type="button"
            className="px-8 py-3 bg-[#673900] hover:bg-[#894d00] text-white font-headline text-[20px] uppercase tracking-wider transition-colors shadow-sm flex items-center gap-2"
          >
            GUARDAR Y PUBLICAR
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
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
                  defaultValue="Sobrecamisa Lino Rústico Arena"
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
                  <select
                    id="prod-category"
                    className="w-full bg-[#faf3e4] px-4 py-3 font-inter text-[14px] text-[#1e1c13] appearance-none focus:outline-none focus:bg-[#fff9ed] focus:ring-1 focus:ring-[#673900]"
                  >
                    <option>Sobrecamisas &amp; Chaquetillas</option>
                    <option>Sastrería Desestructurada</option>
                    <option>Camisería Clásica</option>
                    <option>Pantalones &amp; Bermudas</option>
                    <option>Calzado &amp; Babuchas</option>
                    <option>Accesorios en Piel</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#524438] text-[20px]">
                    keyboard_arrow_down
                  </span>
                </div>
              </div>

              {/* SKU */}
              <div className="md:col-span-6 flex flex-col gap-1.5">
                <label
                  className="font-inter text-[11px] uppercase tracking-wider text-[#524438]"
                  htmlFor="prod-sku"
                >
                  SKU Base
                </label>
                <input
                  id="prod-sku"
                  type="text"
                  defaultValue="NRT-LNO-12"
                  placeholder="NRT-XXX-00"
                  className="w-full bg-[#faf3e4] px-4 py-3 font-mono text-[16px] text-[#1e1c13] uppercase tracking-wider focus:outline-none focus:bg-[#fff9ed] focus:ring-1 focus:ring-[#673900]"
                />
              </div>

              {/* Marca + Género */}
              <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label
                    className="font-inter text-[11px] uppercase tracking-wider text-[#524438]"
                    htmlFor="prod-brand"
                  >
                    Marca / Firma
                  </label>
                  <input
                    id="prod-brand"
                    type="text"
                    defaultValue="NORTE Atelier"
                    placeholder="NORTE Atelier"
                    className="w-full bg-[#faf3e4] px-4 py-3 font-inter text-[14px] text-[#1e1c13] placeholder:text-[#857466] focus:outline-none focus:bg-[#fff9ed] focus:ring-1 focus:ring-[#673900]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label
                    className="font-inter text-[11px] uppercase tracking-wider text-[#524438]"
                    htmlFor="prod-gender"
                  >
                    Género / Sexo
                  </label>
                  <div className="relative">
                    <select
                      id="prod-gender"
                      className="w-full bg-[#faf3e4] px-4 py-3 font-inter text-[14px] text-[#1e1c13] appearance-none focus:outline-none focus:bg-[#fff9ed] focus:ring-1 focus:ring-[#673900]"
                    >
                      <option>Hombre</option>
                      <option>Mujer</option>
                      <option selected>Unisex</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#524438] text-[20px]">
                      keyboard_arrow_down
                    </span>
                  </div>
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
                    norteatelier.com/shop/sobrecamisa-lino-rustico-arena
                  </span>
                </div>
                <button
                  type="button"
                  className="text-[#c77d2e] hover:text-[#673900] font-inter text-[10px] uppercase tracking-widest font-semibold shrink-0"
                >
                  EDITAR
                </button>
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
                  defaultValue="Confeccionada en 100% lino orgánico de gramaje medio con textura natural viva procedente de telares tradicionales de Normandía. Presenta corte recto ligeramente holgado con hombros relajados, cuello camisero con acabado sastre impecable y tapeta frontal con botones de corozo teñidos artesanalmente en matriz nogal."
                  className="w-full bg-[#faf3e4] p-4 font-inter text-[14px] text-[#1e1c13] leading-relaxed placeholder:text-[#857466] focus:outline-none focus:bg-[#fff9ed] focus:ring-1 focus:ring-[#673900] resize-none"
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
                  defaultValue="100% Lino Europeo certificado Master of Linen. Lavado a la piedra. Botones naturales de corozo ecuatoriano. Lavar en seco o en ciclo delicado a 30°C."
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
                {images.length}/8 FOTOS CARGADAS
              </span>
            </div>

            {/* Dropzone */}
            <div className="w-full p-8 bg-[#faf3e4] hover:bg-[#f4eddf] transition-colors flex flex-col items-center justify-center text-center cursor-pointer group">
              <div className="w-12 h-12 bg-[#eee8d9] group-hover:bg-[#ffdcc0] flex items-center justify-center mb-4 transition-colors">
                <span className="material-symbols-outlined text-[26px] text-[#673900]">
                  add_photo_alternate
                </span>
              </div>
              <p className="font-headline text-[20px] uppercase text-[#1e1c13] tracking-wider">
                Arrastra fotografías editoriales o busca archivos
              </p>
              <p className="font-inter text-[12px] text-[#524438] mt-1">
                Formatos JPG, PNG, WebP en alta resolución (proporción sugerida 3:4 vertical
                atelier, máx. 12MB)
              </p>
              <span className="mt-4 px-4 py-1.5 bg-white font-inter text-[10px] uppercase tracking-widest text-[#1e1c13] shadow-sm">
                SELECCIONAR DESDE DISPOSITIVO
              </span>
            </div>

            {/* Uploaded images */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {images.map((img, i) => (
                <div key={i} className="relative group bg-[#f4eddf] flex flex-col">
                  <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#e0dacb]">
                    <div className="w-full h-full bg-[#e0dacb] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[40px] text-[#857466]">
                        image
                      </span>
                    </div>
                    {img.featured && (
                      <span className="absolute top-2 left-2 bg-[#33402f] text-[#fff9ed] px-2 py-0.5 font-inter text-[10px] uppercase tracking-wider font-semibold">
                        PORTADA EDITORIAL
                      </span>
                    )}
                    <button
                      type="button"
                      className="absolute top-2 right-2 w-7 h-7 bg-[#1e1c13]/80 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
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
                <input defaultChecked className="sr-only peer" type="checkbox" />
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
                    defaultValue="165.00"
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
                    defaultValue="62.00"
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
                    62.4%
                  </span>
                  <span className="font-inter text-[10px] uppercase text-[#33402f] font-semibold">
                    ($103.00)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#eee8d9] overflow-hidden">
                  <div className="h-full bg-[#673900]" style={{ width: "62.4%" }} />
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
                    defaultValue={21}
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
                    <span className="font-inter text-[12px] text-[#524438]">Tarifa especial -</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      defaultValue={15}
                      className="w-10 text-center font-mono text-[12px] font-semibold bg-white border border-[#eee8d9] py-0.5 focus:outline-none focus:ring-1 focus:ring-[#673900] text-[#1e1c13]"
                    />
                    <span className="font-inter text-[12px] text-[#524438]">%</span>
                  </div>
                  <span className="font-inter text-[12px] text-[#33402f] font-medium">
                    ($140.25)
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-2">
                  <input defaultChecked className="sr-only peer" type="checkbox" />
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
              <span className="material-symbols-outlined text-[#673900] text-[20px]">tune</span>
            </div>
            <div className="flex flex-col gap-4">
              {/* Estado de Venta */}
              <div className="flex items-center justify-between p-3 bg-[#faf3e4]">
                <div className="flex flex-col">
                  <span className="font-inter text-[10px] uppercase tracking-wider text-[#1e1c13] font-semibold">
                    Estado de Venta
                  </span>
                  <span className="font-inter text-[12px] text-[#524438]">
                    Visible inmediatamente
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input defaultChecked className="sr-only peer" type="checkbox" />
                  <div className="w-11 h-6 bg-[#eee8d9] peer-focus:outline-none peer-checked:bg-[#c77d2e] transition-colors relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>

              {/* Destacado en Home */}
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
                  <input defaultChecked className="sr-only peer" type="checkbox" />
                  <div className="w-11 h-6 bg-[#eee8d9] peer-focus:outline-none peer-checked:bg-[#c77d2e] transition-colors relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>

              {/* Historial */}
              <div className="pt-4 border-t border-[#eee8d9] flex flex-col gap-1 text-[#524438]">
                <span className="font-inter text-[10px] uppercase tracking-widest text-[#1e1c13] font-semibold">
                  Historial de Registro
                </span>
                <p className="font-inter text-[12px] leading-relaxed">
                  Borrador creado por <strong className="text-[#1e1c13]">Elena Vázquez</strong> hoy
                  · Programado para publicación inmediata.
                </p>
              </div>
            </div>
          </section>

          {/* ── CARD 2: INVENTARIO & VARIANTES ── */}
          <section className="bg-white p-8 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between pb-1 border-b border-[#eee8d9]">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-[#c77d2e]" />
                <h2 className="font-headline text-[24px] uppercase tracking-wide text-[#1e1c13]">
                  INVENTARIO &amp; VARIANTES
                </h2>
              </div>
              <span className="px-2 py-0.5 bg-[#c77d2e]/15 text-[#c77d2e] font-inter text-[10px] uppercase tracking-wider font-semibold">
                STOCK TOTAL: {totalStock} UDS
              </span>
            </div>

            {/* Total stock banner */}
            <div className="bg-[#faf3e4] p-4 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-inter text-[10px] uppercase tracking-wider text-[#524438] font-semibold">
                  Total General Prenda
                </span>
                <span className="font-headline text-[36px] text-[#1e1c13] leading-none mt-1">
                  {totalStock}{" "}
                  <span className="font-inter text-[12px] text-[#524438] uppercase tracking-wider">
                    Unidades en Stock
                  </span>
                </span>
              </div>
            </div>

            {/* Desglose por tallas */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-inter text-[11px] uppercase tracking-wider text-[#524438] font-semibold">
                  Desglose por Tallas &amp; Colores
                </span>
                <button
                  type="button"
                  className="font-inter text-[10px] uppercase tracking-widest text-[#673900] hover:text-[#c77d2e] flex items-center gap-1 font-semibold transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  AGREGAR TALLA
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {sizes.map((size, sIdx) => {
                  const sizeTotal = size.colors.reduce((a, c) => a + c.stock, 0);
                  return (
                    <div key={size.size} className="border border-[#eee8d9] bg-white">
                      {/* Size header */}
                      <div
                        className="p-3 bg-[#faf3e4] flex items-center justify-between cursor-pointer select-none"
                        onClick={() => toggleSize(sIdx)}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`material-symbols-outlined text-[18px] text-[#524438] transition-transform duration-200 ${size.open ? "rotate-180" : ""}`}
                          >
                            expand_more
                          </span>
                          <span className="font-headline text-[20px] uppercase text-[#1e1c13] tracking-wide">
                            Talla {size.size} ({size.label})
                          </span>
                        </div>
                        <span className="px-2 py-0.5 bg-[#eee8d9] font-inter text-[10px] uppercase tracking-wider text-[#1e1c13] font-semibold">
                          {sizeTotal} uds
                        </span>
                      </div>

                      {/* Colors */}
                      {size.open && (
                        <div className="p-3 flex flex-col gap-1">
                          {size.colors.map((color, cIdx) => (
                            <div
                              key={color.name}
                              className="flex items-center justify-between py-1 border-b border-[#faf3e4]"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-3.5 h-3.5 border border-[#eee8d9] shrink-0"
                                  style={{ backgroundColor: color.hex }}
                                />
                                <span className="font-inter text-[12px] text-[#1e1c13] font-medium">
                                  {color.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => updateStock(sIdx, cIdx, -1)}
                                  className="w-6 h-6 flex items-center justify-center bg-[#faf3e4] hover:bg-[#f4eddf] text-[#1e1c13] text-[14px]"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  value={color.stock}
                                  readOnly
                                  className="w-10 text-center font-mono text-[12px] bg-white border border-[#eee8d9] py-0.5 focus:outline-none focus:ring-1 focus:ring-[#673900]"
                                />
                                <button
                                  type="button"
                                  onClick={() => updateStock(sIdx, cIdx, 1)}
                                  className="w-6 h-6 flex items-center justify-center bg-[#faf3e4] hover:bg-[#f4eddf] text-[#1e1c13] text-[14px]"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            className="mt-1 py-1 px-2 border border-dashed border-[#eee8d9] hover:border-[#c77d2e] text-[#524438] hover:text-[#c77d2e] font-inter text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px]">add</span>
                            Agregar Color
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </aside>
      </div>

      {/* ── STICKY BOTTOM BAR ── */}
      <div className="sticky bottom-0 z-30 w-full bg-[#333027] text-[#f7f0e2] px-4 lg:px-12 py-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#c77d2e] animate-pulse" />
          <span className="font-inter text-[12px] text-[#e0dacb]">
            Cambios sin guardar • Borrador automático hace 1 min
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
            className="px-4 py-3 bg-white/10 hover:bg-white/15 text-[#f7f0e2] font-inter text-[10px] uppercase tracking-widest transition-colors"
          >
            GUARDAR BORRADOR
          </button>
          <button
            type="button"
            className="px-8 py-3 bg-[#673900] hover:bg-[#894d00] text-white font-headline text-[20px] uppercase tracking-wider shadow-sm flex items-center gap-2 transition-colors"
          >
            PUBLICAR PRODUCTO
            <span className="material-symbols-outlined text-[18px]">check</span>
          </button>
        </div>
      </div>
    </div>
  );
}
