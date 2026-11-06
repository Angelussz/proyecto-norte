"use client";

import { useState } from "react";

// ── Tipos ──────────────────────────────────────────────────────────────────
interface SizeOption {
  id: string;
  label: string;
  badge?: string;
  badgeVariant?: "recommended" | "active" | "gender" | "workshop";
  description: string;
  sizes: string[];
  active: boolean;
}

interface SizeCategory {
  id: string;
  title: string;
  description: string;
  options: SizeOption[];
}

// ── Mock Data ──────────────────────────────────────────────────────────────
const INITIAL_CATEGORIES: SizeCategory[] = [
  {
    id: "ropa-general",
    title: "1. Ropa General (Poleras, Camisetas, Chaquetas, Ropa Deportiva)",
    description:
      "Prendas de parte superior, prendas de punto y sobrecamisas con patronaje unisex y calce desestructurado. También para cinturones y guantes.",
    options: [
      {
        id: "alfa-estandar",
        label: "Sistema Alfa Estándar",
        badge: "RECOMENDADO",
        badgeVariant: "recommended",
        description:
          "Ideal para todo tipo de prendas superiores con calce regular, holgado o relajado.",
        sizes: ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"],
        active: true,
      },
    ],
  },
  {
    id: "talle-unico",
    title: "2. Prendas y Accesorios de Talle Único o Adaptable",
    description:
      "Para cualquier prenda o accesorio que maneje un talle único o sea adaptable (sweaters oversize, ponchos, gorras, faldas wrap, bufandas).",
    options: [
      {
        id: "talles-unicos",
        label: "Talles Únicos",
        badge: "ACTIVO",
        badgeVariant: "active",
        description: "Prendas de patronaje flexible o adaptabilidad mediante cierres mecánicos.",
        sizes: ["Talle Único", "Talle Ajustable"],
        active: true,
      },
    ],
  },
  {
    id: "pantalones",
    title: "3. Pantalones, Jeans y Ropa Formal",
    description:
      "Sastrería artesanal, pantalones de vestir con pinzas, denim estructurado y bermudas.",
    options: [
      {
        id: "numerico-us-m",
        label: "Numérico Tipo US / México — Masculino",
        badge: "Hombres",
        badgeVariant: "gender",
        description:
          "Tallas clásicas americanas de tiro y calce masculino para denim y pantalones.",
        sizes: ["28", "30", "32", "34", "36", "38", "40"],
        active: true,
      },
      {
        id: "numerico-us-f",
        label: "Numérico Tipo US / México — Femenino",
        badge: "Mujeres",
        badgeVariant: "gender",
        description:
          "Numeración estándar americana femenina para vaqueros y pantalones de sastrería.",
        sizes: ["0", "2", "4", "6", "8", "10", "12", "14", "16", "18"],
        active: true,
      },
      {
        id: "numerico-eu",
        label: "Numérico Tipo EU / Cono Sur",
        badge: "Sastrería Taller",
        badgeVariant: "workshop",
        description: "Patronaje europeo oficial y sastrería de taller.",
        sizes: ["34", "36", "38", "40", "42", "44", "46", "48"],
        active: true,
      },
      {
        id: "pulgadas-cintura",
        label: "Medidas en Pulgadas / Cintura",
        badge: "Denim & Waist",
        badgeVariant: "workshop",
        description: "Ajuste exacto por contorno de cintura.",
        sizes: ["30W", "32W", "34W", "36W", "38W"],
        active: true,
      },
    ],
  },
  {
    id: "calzado",
    title: "4. Calzado (Zapatos, Zapatillas, Sandalias)",
    description: "Taxonomía y numeración estándar para calzado de confección artesanal.",
    options: [
      {
        id: "calzado-adulto",
        label: "Calzado Adulto",
        badge: "EU ADULTO",
        badgeVariant: "workshop",
        description: "Escala unificada de hormas estándar para calzado adulto de atelier.",
        sizes: ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
        active: true,
      },
    ],
  },
  {
    id: "accesorios",
    title: "5. Accesorios y Complementos",
    description: "Sombreros, marroquinería, joyería y accesorios de atelier.",
    options: [
      {
        id: "sombreros",
        label: "Sombreros, Gorras y Boinas",
        badge: "ACTIVO",
        badgeVariant: "active",
        description:
          "Perímetro craneal en centímetros para sombrerería de fieltro, lino y boinas artesanales.",
        sizes: [
          "54 cm",
          "55 cm",
          "56 cm",
          "57 cm",
          "58 cm",
          "59 cm",
          "60 cm",
          "Talle Único Ajustable",
        ],
        active: true,
      },
      {
        id: "contorno-cabeza",
        label: "Por Contorno de Cabeza",
        badge: "ACTIVO",
        badgeVariant: "active",
        description:
          "Medida perimetral precisa para sombrerería artesanal, gorras y complementos de cabeza.",
        sizes: ["54 cm", "56 cm", "58 cm", "60 cm"],
        active: true,
      },
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function BadgeVariant({ variant, text }: { variant?: SizeOption["badgeVariant"]; text?: string }) {
  if (!text) return null;
  if (variant === "recommended")
    return (
      <span className="px-1.5 py-0.5 bg-primary text-on-primary font-inter text-[9px] uppercase tracking-wider font-bold">
        {text}
      </span>
    );
  if (variant === "active")
    return (
      <span className="px-1.5 py-0.5 bg-[#33402f] text-[#fff9ed] font-mono text-[9px] uppercase tracking-wider font-bold">
        {text}
      </span>
    );
  if (variant === "gender")
    return (
      <span className="px-1.5 py-0.5 bg-surface-container text-on-surface-variant font-inter text-[10px] uppercase font-semibold border border-outline-variant/30">
        {text}
      </span>
    );
  return (
    <span className="px-1.5 py-0.5 bg-surface-container text-on-surface-variant font-mono text-[9px] uppercase font-semibold border border-outline-variant/40">
      {text}
    </span>
  );
}

// ── Componente principal ───────────────────────────────────────────────────
export function AdminSizeSystemView() {
  const [categories, setCategories] = useState<SizeCategory[]>(INITIAL_CATEGORIES);
  const [saved, setSaved] = useState(false);

  function toggleOption(catId: string, optId: string) {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === catId
          ? {
              ...cat,
              options: cat.options.map((opt) =>
                opt.id === optId ? { ...opt, active: !opt.active } : opt,
              ),
            }
          : cat,
      ),
    );
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const totalActive = categories.reduce(
    (acc, cat) => acc + cat.options.filter((o) => o.active).length,
    0,
  );
  const totalOptions = categories.reduce((acc, cat) => acc + cat.options.length, 0);

  return (
    <main className="w-full bg-surface min-h-[calc(100vh-4rem)]">
      {/* Toast */}
      {saved && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1e1c13] text-[#fff9ed] px-5 py-3 border-l-4 border-[#c77d2e] font-inter text-[13px] shadow-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-[#c77d2e] text-[18px]">check_circle</span>
          <span>Sistemas de talles guardados correctamente.</span>
        </div>
      )}

      {/* ── Hero Header ──────────────────────────────────── */}
      <div className="relative w-full overflow-hidden px-6 lg:px-8 py-10 bg-surface">
        {/* Ambient blobs */}
        <div className="absolute -top-24 right-16 w-80 h-80 bg-primary-fixed/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-60 -left-16 w-72 h-72 bg-secondary-fixed/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-[1280px] mx-auto flex flex-col gap-6">
          {/* Top bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              {/* Sub-breadcrumb */}
              <div className="flex items-center gap-1.5 font-inter text-[10px] text-on-surface-variant uppercase tracking-[0.2em]">
                <span className="text-primary font-semibold">ADMIN</span>
                <span className="text-outline-variant">/</span>
                <span>TIENDA</span>
                <span className="text-outline-variant">/</span>
                <span className="text-on-surface font-semibold">SISTEMAS DE TALLES</span>
              </div>

              {/* Badge + live indicator */}
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-secondary-fixed text-on-secondary-fixed font-inter text-[10px] uppercase tracking-widest font-semibold">
                  GUÍA DE PATRONAJE &amp; SISTEMAS ACTIVOS
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c77d2e] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="font-inter text-[10px] text-on-surface-variant tracking-wider uppercase font-medium">
                  Sincronizado v2.4
                </span>
              </div>
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary-container text-on-primary transition-all duration-150 shadow-md active:translate-y-px cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span className="font-headline text-[18px] uppercase tracking-wider">
                GUARDAR CAMBIOS
              </span>
            </button>
          </div>

          {/* Title + description */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="max-w-3xl">
              <h1 className="font-headline text-[42px] text-on-surface tracking-normal leading-none uppercase">
                NORTE ADMIN — SISTEMAS DE TALLES Y GUÍA DE PATRONAJE
              </h1>
              <p className="font-inter text-[14px] text-on-surface-variant mt-2 leading-relaxed max-w-2xl">
                Normativas de tallaje oficiales, taxonomía unificada y tablas de equivalencias de
                patronaje para confección artesanal y venta multicanal.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-on-surface-variant font-inter text-[10px] tracking-widest uppercase bg-surface-container-low px-4 py-2 self-start lg:self-auto border border-outline-variant/40">
              <span className="material-symbols-outlined text-[16px] text-[#c77d2e]">
                straighten
              </span>
              <span>NORTE SYSTEM DESIGN — GUÍA DE TALLES</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────── */}
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 pb-12 flex flex-col gap-8">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Categorías",
              value: categories.length,
              sub: "Grupos de prendas",
              icon: "category",
              color: "text-primary",
            },
            {
              label: "Sistemas Activos",
              value: totalActive,
              sub: "De " + totalOptions + " disponibles",
              icon: "check_circle",
              color: "text-[#33402f]",
            },
            {
              label: "Talles Totales",
              value: categories.reduce(
                (a, c) => a + c.options.reduce((b, o) => b + o.sizes.length, 0),
                0,
              ),
              sub: "Valores en catálogo",
              icon: "straighten",
              color: "text-[#c77d2e]",
            },
            {
              label: "Cobertura",
              value: "100%",
              sub: "Sincronizado con tienda",
              icon: "sync",
              color: "text-secondary",
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="bg-surface-container-low p-5 flex flex-col justify-between relative overflow-hidden border border-outline-variant/30 shadow-sm"
            >
              <div className="flex items-start justify-between relative z-10">
                <span className="font-inter text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">
                  {kpi.label}
                </span>
                <span className={`material-symbols-outlined ${kpi.color} text-[20px]`}>
                  {kpi.icon}
                </span>
              </div>
              <div className="mt-4 relative z-10">
                <span className="font-headline text-[36px] text-on-surface tracking-wide block leading-none">
                  {kpi.value}
                </span>
                <span className="font-inter text-[11px] text-on-surface-variant uppercase block mt-1 font-medium">
                  {kpi.sub}
                </span>
              </div>
              {/* Watermark */}
              <div className="absolute -right-2 -bottom-2 opacity-10 pointer-events-none select-none">
                <span
                  className="material-symbols-outlined text-on-surface leading-none block"
                  style={{ fontSize: "95px" }}
                >
                  {kpi.icon}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Section: Usos y Sistemas de Talles ───────── */}
        <section className="bg-surface-container-low p-6 lg:p-8 shadow-sm border border-outline-variant/40 flex flex-col gap-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-on-primary text-[26px]">
                  straighten
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-headline text-[24px] uppercase tracking-wide text-on-surface leading-tight">
                    USOS Y SISTEMAS DE TALLES
                  </h2>
                  <span className="px-2 py-0.5 bg-secondary-fixed text-on-secondary-fixed font-inter text-[10px] uppercase font-bold tracking-widest">
                    SISTEMAS HABILITADOS EN TIENDA
                  </span>
                </div>
                <p className="font-inter text-[12px] text-on-surface-variant mt-0.5">
                  Configuración simplificada de normativas de tallaje para catálogo de adultos
                  (hombre y mujer). Marca los sistemas activos.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 bg-[#33402f] hover:bg-secondary text-[#fff9ed] font-headline text-[16px] uppercase tracking-wider transition-colors duration-150 shadow-sm active:translate-y-px cursor-pointer self-start sm:self-auto shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>+ AGREGAR SISTEMA</span>
            </button>
          </div>

          {/* Category Blocks */}
          <div className="flex flex-col gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-surface p-6 border border-outline-variant/30 flex flex-col gap-4"
              >
                {/* Cat header */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline text-[20px] uppercase tracking-wider text-on-surface">
                      {cat.title}
                    </h3>
                    <button
                      type="button"
                      className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-highest transition-colors cursor-pointer"
                      title="Editar sistema de talles"
                    >
                      <span className="material-symbols-outlined text-[18px] block">edit_note</span>
                    </button>
                  </div>
                  <p className="font-inter text-[12px] text-on-surface-variant">
                    {cat.description}
                  </p>
                </div>

                {/* Options */}
                <div className="pt-2 border-t border-outline-variant/20 flex flex-col gap-3">
                  {cat.options.map((opt) => (
                    <label
                      key={opt.id}
                      className="flex items-start gap-3 p-3 bg-surface-container-low border border-outline-variant/40 hover:border-primary transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={opt.active}
                        onChange={() => toggleOption(cat.id, opt.id)}
                        className="mt-1 text-primary focus:ring-0 rounded-none cursor-pointer h-4 w-4 shrink-0"
                      />
                      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-inter text-[13px] font-semibold text-on-surface">
                            {opt.label}
                          </span>
                          {opt.badge && (
                            <BadgeVariant variant={opt.badgeVariant} text={opt.badge} />
                          )}
                          {!opt.active && (
                            <span className="px-1.5 py-0.5 bg-error/10 text-error font-mono text-[9px] uppercase tracking-wider font-bold">
                              INACTIVO
                            </span>
                          )}
                        </div>
                        <p className="font-inter text-[12px] text-on-surface-variant">
                          {opt.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-0.5">
                          {opt.sizes.map((size) => (
                            <span
                              key={size}
                              className={`px-2.5 py-1 font-mono text-[11px] font-semibold border ${
                                opt.active
                                  ? "bg-surface-container-highest text-on-surface border-outline-variant/40"
                                  : "bg-surface-container text-on-surface-variant/50 border-outline-variant/20"
                              }`}
                            >
                              {size}
                            </span>
                          ))}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-outline-variant/20">
            <div className="flex items-center gap-2 text-on-surface-variant font-inter text-[12px]">
              <span className="material-symbols-outlined text-[18px] text-[#c77d2e]">
                verified_user
              </span>
              <span>
                Las directrices activas se aplican a los filtros de catálogo, fichas y validación de
                inventario para adultos.
              </span>
            </div>
            <button
              type="button"
              onClick={handleSave}
              className="px-8 py-3 bg-primary hover:bg-primary-container text-on-primary font-headline text-[18px] uppercase tracking-wider transition-all duration-150 active:translate-y-px shadow-sm flex items-center gap-2 self-stretch sm:self-auto justify-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span>GUARDAR SISTEMAS DE TALLES</span>
            </button>
          </div>
        </section>

        {/* ── Sync Banner ───────────────────────────────── */}
        <div className="bg-surface-container p-5 border border-outline-variant/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[22px] shrink-0">
              sync
            </span>
            <p className="font-inter text-[12px] text-on-surface-variant leading-relaxed">
              <strong className="font-semibold text-on-surface">Sincronización Automática:</strong>{" "}
              Cualquier cambio en las categorías, talles por categoría, colores o firmas se propaga
              inmediatamente a las pantallas de Creación de Producto, Fichas de Inventario y Tienda
              Online Pública.
            </p>
          </div>
          <span className="font-inter text-[10px] text-on-surface-variant uppercase tracking-widest bg-surface-container-low px-3 py-1 border border-outline-variant/30 shrink-0">
            v2.4 — ACTIVO
          </span>
        </div>
      </div>
    </main>
  );
}
