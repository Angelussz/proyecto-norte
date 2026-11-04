"use client";

export function AdminProductsHeader() {
  return (
    <header className="fixed top-0 left-[260px] right-0 h-16 bg-surface/95 backdrop-blur-sm border-b border-outline-variant/60 z-40 px-8 flex items-center justify-between">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[11px] font-inter font-medium text-on-surface-variant uppercase tracking-wider">
          <span className="text-primary font-semibold">ADMIN</span>
          <span className="text-outline-variant">/</span>
          <span className="text-on-surface font-medium">Productos</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-6">
        {/* Global search */}
        <div className="relative flex items-center">
          <span className="material-symbols-outlined text-on-surface-variant text-[18px] absolute left-3 pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar pedidos, productos, clientes..."
            className="w-72 lg:w-96 pl-9 pr-4 py-1.5 bg-surface-container-lowest text-on-surface placeholder:text-outline/70 text-[14px] font-inter outline-none border border-outline-variant/50 focus:border-primary transition-colors rounded-none"
          />
        </div>

        {/* Store selector */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container border border-outline-variant/60">
          <span className="material-symbols-outlined text-[16px] text-primary">storefront</span>
          <span className="text-[10px] font-inter uppercase tracking-wider text-on-surface font-medium">
            Atelier Madrid
          </span>
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
            keyboard_arrow_down
          </span>
        </div>

        {/* Notifications */}
        <button
          type="button"
          className="relative p-1.5 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#c77d2e]" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
        </div>
      </div>
    </header>
  );
}
