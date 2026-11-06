"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// ─── Mock data (solo frontend, sin backend) ───────────────────────────────────
const PRODUCTS_MOCK = [
  {
    id: "1",
    name: "Sobrecamisa Lino Oliva",
    category: "Sobrecamisas",
    sku: "NRT-LNO-08",
    price: 145,
    stock: 28,
    stockLevel: "good",
    active: true,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBBRuMcDOLRNjxLBPvKckga526AqzRMfEH-m2KQihN24Hq2KB2qFD11YI3sRsl_yPF0kXUBLflVwBgVOl2hKmZyRM695PBBN5bmh0GlliDuvPxLsocCdiqzBADeP2VVfkPPRfmfCc0CPhUUitxqj_x-59VhIstgAGNZ5z-OqY4MQtdRtExJReAipbaLHz9WdqdHB0z1jds8DDKTxpRUveFhMHySvZVnMAyd4pBaKAhZj35cmeprR7LG",
    variants: [
      {
        size: "Talla S",
        sku: "NRT-LNO-08-S",
        total: 6,
        colors: [
          { hex: "#54624F", name: "Verde Oliva", stock: 4 },
          { hex: "#918E85", name: "Gris Piedra", stock: 2 },
        ],
        alert: false,
      },
      {
        size: "Talla M",
        sku: "NRT-LNO-08-M",
        total: 12,
        colors: [
          { hex: "#54624F", name: "Verde Oliva", stock: 8 },
          { hex: "#918E85", name: "Gris Piedra", stock: 4 },
        ],
        alert: false,
      },
      {
        size: "Talla L",
        sku: "NRT-LNO-08-L",
        total: 8,
        colors: [
          { hex: "#54624F", name: "Verde Oliva", stock: 5 },
          { hex: "#918E85", name: "Gris Piedra", stock: 3 },
        ],
        alert: false,
      },
      {
        size: "Talla XL",
        sku: "NRT-LNO-08-XL",
        total: 2,
        colors: [
          { hex: "#54624F", name: "Verde Oliva", stock: 1 },
          { hex: "#918E85", name: "Gris Piedra", stock: 1 },
        ],
        alert: true,
      },
    ],
  },
  {
    id: "2",
    name: "Pantalón Traje Sastre Arena",
    category: "Sastrería",
    sku: "NRT-TRJ-02",
    price: 210,
    stock: 12,
    stockLevel: "low",
    active: true,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCwHKmTg0srAt35wBA2lbFGmAQr9aejM9FMIOdyC13im2sWuwHEoujXE7iYM9SJ3WeW7R6ZMVz7BQ5NHNNcT1dJfcNq_rBiPlDyAbOjeWP0q_OtqOxIvSfG_Opy8OVIQuJyxWTSILUpgXrRl2--a758MtTtEDZftinPvKG4SybtMpppxSq4htYfH0PKAnfqML9YTC7B4i5D1V11AvsUi3Z_diTuhNSZNDQPxfY5nf7GWvrOhP3L2me8",
    variants: [
      {
        size: "Talla 40",
        sku: "NRT-TRJ-02-40",
        total: 4,
        colors: [
          { hex: "#D4C3A3", name: "Arena Natural", stock: 2 },
          { hex: "#1C1B18", name: "Negro Carbón", stock: 1 },
          { hex: "#A84B29", name: "Terracota", stock: 1 },
        ],
        alert: false,
      },
      {
        size: "Talla 42",
        sku: "NRT-TRJ-02-42",
        total: 2,
        colors: [
          { hex: "#D4C3A3", name: "Arena Natural", stock: 1 },
          { hex: "#4A5338", name: "Verde Oliva", stock: 1 },
        ],
        alert: true,
      },
      {
        size: "Talla 44",
        sku: "NRT-TRJ-02-44",
        total: 6,
        colors: [
          { hex: "#D4C3A3", name: "Arena Natural", stock: 3 },
          { hex: "#1C1B18", name: "Negro Carbón", stock: 2 },
          { hex: "#A84B29", name: "Terracota", stock: 1 },
        ],
        alert: false,
      },
    ],
  },
  {
    id: "3",
    name: "Zapatillas Esenciales Blancas",
    category: "Calzado",
    sku: "NRT-ZAP-01",
    price: 95,
    stock: 45,
    stockLevel: "good",
    active: true,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCm0oCDFcou4e8hBFK6J0gakBtjFZBeQ4RR2JGtdm4dD6KP329xoj8xC3QuUw0W8o8RamOsEhYq0KfwSsHSIjSeS4IInr2s8Uvds-3dZdlMFcHOz8u_x39RRdjqpifd0vFWPr4fo7-j5va4rS9CnvVjyGwuRqvHIw041igPsmjhJGmrf1o1d6b-RvN7o66lvgoIRBUXt025c3sTaVeImxYQhlR64G7nuzcYr6yWMsMbKxIWmjtWKlrG",
    variants: [
      {
        size: "Talla 40",
        sku: "NRT-ZAP-01-40",
        total: 10,
        colors: [{ hex: "#FFFFFF", name: "Blanco Puro", stock: 10 }],
        alert: false,
      },
      {
        size: "Talla 41",
        sku: "NRT-ZAP-01-41",
        total: 15,
        colors: [{ hex: "#FFFFFF", name: "Blanco Puro", stock: 15 }],
        alert: false,
      },
      {
        size: "Talla 42",
        sku: "NRT-ZAP-01-42",
        total: 12,
        colors: [{ hex: "#FFFFFF", name: "Blanco Puro", stock: 12 }],
        alert: false,
      },
      {
        size: "Talla 43",
        sku: "NRT-ZAP-01-43",
        total: 8,
        colors: [{ hex: "#FFFFFF", name: "Blanco Puro", stock: 8 }],
        alert: false,
      },
    ],
  },
  {
    id: "4",
    name: "Reloj Minimalista Cuero Roble",
    category: "Accesorios",
    sku: "NRT-ACC-14",
    price: 120,
    stock: 4,
    stockLevel: "low",
    active: true,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCiCZRvVi9C18d6dM1NfljfMSwHUtK9iXUA88-kbj-Nr1xjuc7xQ7v9B-xWZw-hnRZUGZZ2bEnLsV0oBedMWuPxUBT6w1B2HA7lgai5nAeyr8YR4Aq59UbfPKS7LJxMZT6Z80nOX73V9-_iyD9-OiAeB5MwY2wz6IcK7HXltZ9N5QsEwPkOU2m3Vq6YXcTZ3Ed_pJTVdyqk_Rta-OhgBVVLMIhyIaL8O96F7iKkiVh_B9ZDOkx",
    variants: [
      {
        size: "Correa 20mm",
        sku: "NRT-ACC-14-20",
        total: 2,
        colors: [
          { hex: "#8B5A2B", name: "Cuero Roble", stock: 1 },
          { hex: "#1C1B18", name: "Negro Mate", stock: 1 },
        ],
        alert: true,
      },
      {
        size: "Correa 22mm",
        sku: "NRT-ACC-14-22",
        total: 2,
        colors: [
          { hex: "#8B5A2B", name: "Cuero Roble", stock: 1 },
          { hex: "#D4C3A3", name: "Cuero Arena", stock: 1 },
        ],
        alert: true,
      },
    ],
  },
  {
    id: "5",
    name: "Vestido Bohemio Algodón Crudo",
    category: "Edición Atelier",
    sku: "NRT-VES-05",
    price: 195,
    stock: 0,
    stockLevel: "out",
    active: false,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDzCor7L0-eVP7kqSZfJlUJpzHzcVmSgudN9iXRBOQ90aeXGGbjKBtf25Z3sJTTo3b7frxMiSPyTTLugSe0HEK0bPSaw_pWPQR4UPlf_ilhVev8u2wyv4hzuKrWQoGnokKQdjQKMGipw9VO9izO2Cv52UlKMVogpND-kXKc2kEGChl0Zoa7cXyGosCKxSDzKigV1hjOMbXfrXa8FUfbHeKxQfjr2P66vkcs-9FGoeYR_1kqjNzUc9He",
    variants: [
      {
        size: "Talla S",
        sku: "NRT-VES-05-S",
        total: 0,
        colors: [{ hex: "#F5F2EB", name: "Algodón Crudo", stock: 0 }],
        alert: true,
      },
      {
        size: "Talla M",
        sku: "NRT-VES-05-M",
        total: 0,
        colors: [{ hex: "#F5F2EB", name: "Algodón Crudo", stock: 0 }],
        alert: true,
      },
      {
        size: "Talla L",
        sku: "NRT-VES-05-L",
        total: 0,
        colors: [{ hex: "#F5F2EB", name: "Algodón Crudo", stock: 0 }],
        alert: true,
      },
    ],
  },
];

// ─── Stock badge ──────────────────────────────────────────────────────────────
function StockBadge({ stock, level }: { stock: number; level: "good" | "low" | "out" }) {
  if (level === "good") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary-container text-on-secondary-fixed text-[10px] font-inter font-semibold tracking-wider uppercase">
        <span className="w-1.5 h-1.5 bg-[#33402f] rounded-full" />
        {stock} uds
      </span>
    );
  }
  if (level === "low") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-inter font-semibold tracking-wider uppercase">
        <span className="w-1.5 h-1.5 bg-[#c77d2e] rounded-full" />
        {stock} uds
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-dim text-on-surface-variant text-[10px] font-inter font-semibold tracking-wider uppercase">
      <span className="w-1.5 h-1.5 bg-outline rounded-full" />0 uds
    </span>
  );
}

// ─── Toggle switch ────────────────────────────────────────────────────────────
function ActiveToggle({ active, productId: _productId }: { active: boolean; productId: string }) {
  const [isActive, setIsActive] = useState(active);
  return (
    <button
      type="button"
      aria-label={isActive ? "Desactivar producto" : "Activar producto"}
      onClick={(e) => {
        e.stopPropagation();
        setIsActive(!isActive);
      }}
      className={cn(
        "w-9 h-5 relative inline-flex items-center px-0.5 rounded-none cursor-pointer transition-colors duration-200",
        isActive ? "bg-primary" : "bg-surface-dim",
      )}
    >
      <span
        className={cn(
          "inline-block w-4 h-4 transform transition-transform duration-200",
          isActive ? "translate-x-4 bg-white" : "translate-x-0 bg-outline-variant",
        )}
      />
    </button>
  );
}

// ─── Variants animated row ────────────────────────────────────────────────────
function VariantsRow({
  variants,
  isOpen,
}: {
  variants: NonNullable<(typeof PRODUCTS_MOCK)[0]["variants"]>;
  isOpen: boolean;
}) {
  return (
    <tr className="bg-surface-container-high/40">
      <td className="p-0" colSpan={7}>
        {/* Grid wrapper — transiciona de 0fr a 1fr */}
        <div
          className="grid transition-[grid-template-rows] duration-300 ease-in-out"
          style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
        >
          {/* overflow:hidden necesario para que el 0fr realmente oculte */}
          <div className="overflow-hidden">
            <div className="pl-20 pr-4 py-3 bg-surface-container-high/30 flex flex-col gap-1.5">
              {/* Subheader */}
              <div className="flex items-center justify-between text-[10px] font-inter font-medium uppercase text-on-surface-variant tracking-wider pb-1 px-3">
                <span>Desglose por Talla &amp; Confección</span>
                <span>Almacén Central Madrid</span>
              </div>

              {variants.map((variant) => (
                <div
                  key={variant.sku}
                  className={cn(
                    "flex items-center justify-between px-4 py-2 transition-colors duration-150",
                    "bg-surface-container-lowest hover:bg-[#c77d2e]/15 cursor-pointer",
                  )}
                >
                  {/* Size + SKU */}
                  <div className="flex items-center gap-4">
                    <span
                      className={cn(
                        "material-symbols-outlined text-[16px]",
                        variant.alert ? "text-[#c77d2e]" : "text-outline",
                      )}
                    >
                      subdirectory_arrow_right
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-inter font-medium text-on-surface">
                        {variant.size}
                      </span>
                      <span className="text-[10px] font-mono font-inter text-on-surface-variant">
                        SKU: {variant.sku}
                      </span>
                    </div>
                  </div>

                  {/* Color swatches */}
                  <div className="flex items-center gap-2">
                    {variant.colors.map((color) => (
                      <div
                        key={color.hex}
                        className="relative flex items-center justify-center border border-outline-variant/60 w-5 h-5"
                        style={{ backgroundColor: color.hex }}
                        title={`${color.name}: ${color.stock} uds`}
                      >
                        <span className="absolute -top-1.5 -right-1.5 bg-surface text-on-surface border border-outline-variant font-mono text-[9px] leading-tight px-1 font-bold">
                          {color.stock}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div>
                    <span
                      className={cn(
                        "text-[14px] font-mono font-inter",
                        variant.alert ? "text-primary font-semibold" : "text-on-surface",
                      )}
                    >
                      {variant.total} uds
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── Main table ───────────────────────────────────────────────────────────────
export function AdminProductsTable() {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["2"]));

  const toggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <section className="w-full px-8 py-6 overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[1080px]">
        <thead>
          <tr className="bg-surface-container text-on-surface-variant">
            {/* Columna expand — estrecha */}
            <th scope="col" className="w-10 py-3 pl-3 pr-0" />
            <th
              scope="col"
              className="py-3 px-4 text-[12px] font-inter font-semibold tracking-widest uppercase w-16 text-center"
            >
              IMAGEN
            </th>
            <th
              scope="col"
              className="py-3 px-4 text-[12px] font-inter font-semibold tracking-widest uppercase"
            >
              NOMBRE &amp; SKU
            </th>
            <th
              scope="col"
              className="py-3 px-4 text-[12px] font-inter font-semibold tracking-widest uppercase"
            >
              PRECIO BASE
            </th>
            <th
              scope="col"
              className="py-3 px-4 text-[12px] font-inter font-semibold tracking-widest uppercase"
            >
              STOCK TOTAL
            </th>
            <th
              scope="col"
              className="py-3 px-4 text-[12px] font-inter font-semibold tracking-widest uppercase text-center w-24"
            >
              ACTIVO
            </th>
            <th
              scope="col"
              className="py-3 px-4 text-[12px] font-inter font-semibold tracking-widest uppercase text-right min-w-[170px]"
            >
              ACCIONES
            </th>
          </tr>
        </thead>
        <tbody className="divide-y-0">
          {PRODUCTS_MOCK.map((product) => {
            const isExpanded = expandedIds.has(product.id);
            const hasVariants = Boolean(product.variants && product.variants.length > 0);

            return (
              <>
                {/* ── Fila principal ── */}
                <tr
                  key={product.id}
                  onClick={() => hasVariants && toggle(product.id)}
                  className={cn(
                    "transition-colors group/row select-none",
                    hasVariants && "cursor-pointer",
                    !product.active
                      ? "bg-surface-container-high/20 opacity-80 hover:opacity-100"
                      : "bg-surface hover:bg-surface-container-low",
                  )}
                >
                  {/* ── Celda expand (izquierda de la foto) ── */}
                  <td className="py-3 pl-3 pr-0 w-10">
                    {hasVariants && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggle(product.id);
                        }}
                        aria-label={isExpanded ? "Cerrar variantes" : "Ver variantes"}
                        className={cn(
                          // Visible al hacer hover en la fila o si ya está expandido
                          "flex items-center justify-center w-7 h-7 rounded-none transition-all duration-200 cursor-pointer",
                          "text-on-surface-variant hover:text-primary hover:bg-surface-container",
                          isExpanded ? "opacity-100" : "opacity-0 group-hover/row:opacity-100",
                        )}
                      >
                        {/* La flecha rota suavemente al expandir/cerrar */}
                        <span
                          className={cn(
                            "material-symbols-outlined text-[20px] transition-transform duration-300 select-none",
                            isExpanded ? "rotate-180" : "rotate-0",
                          )}
                        >
                          expand_more
                        </span>
                      </button>
                    )}
                  </td>

                  {/* Imagen */}
                  <td className="py-3 px-4">
                    <div
                      className={cn(
                        "w-12 h-12 bg-surface-container overflow-hidden shrink-0",
                        !product.active && "filter grayscale",
                      )}
                    >
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover rounded-none"
                        unoptimized
                      />
                    </div>
                  </td>

                  {/* Nombre & SKU */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col min-w-0">
                      <span
                        className={cn(
                          "text-[16px] font-inter font-medium text-on-surface transition-colors",
                          product.active
                            ? "group-hover/row:text-primary"
                            : "line-through text-outline",
                          hasVariants && "font-semibold",
                        )}
                      >
                        {product.name}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-inter text-on-surface-variant uppercase tracking-wider block my-0.5",
                          !product.active && "text-[#c77d2e] font-medium",
                        )}
                      >
                        {product.category}
                      </span>
                      <span className="text-[10px] font-mono font-inter text-outline uppercase tracking-wider">
                        SKU: {product.sku}
                      </span>
                    </div>
                  </td>

                  {/* Precio */}
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        "text-[16px] font-inter font-medium",
                        product.active ? "text-on-surface" : "text-on-surface-variant",
                      )}
                    >
                      ${product.price.toFixed(2)}
                    </span>
                  </td>

                  {/* Stock */}
                  <td className="py-3 px-4">
                    <StockBadge
                      stock={product.stock}
                      level={product.stockLevel as "good" | "low" | "out"}
                    />
                  </td>

                  {/* Toggle activo */}
                  <td
                    className="py-3 px-4 text-center cursor-default"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ActiveToggle active={product.active} productId={product.id} />
                  </td>

                  {/* Acciones */}
                  <td
                    className="py-3 px-4 text-right cursor-default"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="inline-flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        className="px-2 py-1 text-[10px] font-inter font-semibold uppercase tracking-wider text-on-surface hover:text-primary hover:bg-surface-container transition-colors rounded-none"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        title="Borrar producto"
                        className="px-2 py-1 text-[10px] font-inter font-semibold uppercase tracking-wider text-on-surface-variant hover:text-error hover:bg-surface-container transition-colors rounded-none flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        <span>Borrar</span>
                      </button>
                    </div>
                  </td>
                </tr>

                {/* ── Fila de variantes animada ── Siempre renderizada, animada con grid */}
                {hasVariants && (
                  <VariantsRow
                    key={`variants-${product.id}`}
                    variants={product.variants!}
                    isOpen={isExpanded}
                  />
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
