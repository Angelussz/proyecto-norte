"use client";

const STATS = [
  {
    label: "Catálogo Completo",
    value: "48",
    sub: "100% auditable",
    subColor: "text-secondary",
  },
  {
    label: "Piezas Activas",
    value: "42",
    sub: "87.5% en vitrina",
    subColor: "text-on-surface-variant",
    valueColor: "text-primary",
  },
  {
    label: "Atención Reposición",
    value: "05",
    sub: "Stock bajo",
    subColor: "text-[#c77d2e]",
    valueColor: "text-[#c77d2e]",
  },
  {
    label: "Agotados",
    value: "01",
    sub: "Edición Atelier",
    subColor: "text-error",
    valueColor: "text-tertiary",
  },
];

export function AdminProductsStats() {
  return (
    <section className="w-full bg-surface-container-low px-8 py-6 flex flex-col gap-4">
      {/* Title row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[11px] font-inter font-medium text-on-surface-variant uppercase tracking-widest mb-1">
            <span className="text-primary font-semibold">ADMIN</span>
            <span className="text-outline-variant">/</span>
            <span className="text-on-surface font-medium">PRODUCTOS</span>
          </div>
          <h1 className="font-headline text-[48px] text-on-surface tracking-[0.05em] uppercase leading-none">
            PRODUCTOS
          </h1>
          <p className="text-[14px] font-inter text-on-surface-variant mt-1.5 max-w-2xl">
            Gestión del catálogo, inventario de piezas, precios y variantes de confección artesanal.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="px-4 py-2.5 bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors text-[12px] font-inter font-semibold uppercase tracking-wider flex items-center gap-1.5 rounded-none"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>Exportar CSV</span>
          </button>
          <button
            type="button"
            className="px-6 py-2.5 bg-primary text-on-primary hover:bg-primary-container transition-colors font-headline text-[20px] tracking-wider uppercase flex items-center gap-1.5 rounded-none shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>NUEVO PRODUCTO</span>
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-surface-container p-4 flex flex-col justify-between">
            <span className="text-[10px] font-inter font-medium text-on-surface-variant uppercase tracking-widest">
              {stat.label}
            </span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span
                className={`font-headline text-[36px] text-on-surface leading-none ${stat.valueColor ?? "text-on-surface"}`}
              >
                {stat.value}
              </span>
              <span className={`text-[10px] font-inter font-medium ${stat.subColor}`}>
                {stat.sub}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
