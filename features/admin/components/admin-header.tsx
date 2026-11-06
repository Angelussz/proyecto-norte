"use client";

import { usePathname } from "next/navigation";

export function AdminHeader() {
  const pathname = usePathname();

  // Generar breadcrumbs dinámicos según la ruta
  function getBreadcrumbs() {
    if (pathname.startsWith("/admin/categorias")) {
      return (
        <div className="flex items-center gap-1.5 font-inter text-[11px] text-[#524438] uppercase tracking-wider">
          <span className="text-[#673900] font-semibold">ADMIN</span>
          <span className="text-[#d8c3b2]">/</span>
          <span className="text-[#524438]">TIENDA</span>
          <span className="text-[#d8c3b2]">/</span>
          <span className="text-[#1e1c13] font-medium">CATEGORÍAS Y ATRIBUTOS</span>
        </div>
      );
    }
    if (pathname.startsWith("/admin/productos/nuevo")) {
      return (
        <div className="flex items-center gap-1.5 font-inter text-[11px] text-[#524438] uppercase tracking-wider">
          <span className="text-[#673900] font-semibold">ADMIN</span>
          <span className="text-[#d8c3b2]">/</span>
          <span className="text-[#524438]">TIENDA</span>
          <span className="text-[#d8c3b2]">/</span>
          <span className="text-[#524438]">PRODUCTOS</span>
          <span className="text-[#d8c3b2]">/</span>
          <span className="text-[#c77d2e] font-semibold">NUEVO PRODUCTO</span>
        </div>
      );
    }
    if (pathname.startsWith("/admin/productos/editar")) {
      return (
        <div className="flex items-center gap-1.5 font-inter text-[11px] text-[#524438] uppercase tracking-wider">
          <span className="text-[#673900] font-semibold">ADMIN</span>
          <span className="text-[#d8c3b2]">/</span>
          <span className="text-[#524438]">TIENDA</span>
          <span className="text-[#d8c3b2]">/</span>
          <span className="text-[#524438]">PRODUCTOS</span>
          <span className="text-[#d8c3b2]">/</span>
          <span className="text-[#c77d2e] font-semibold">EDITAR PRODUCTO</span>
        </div>
      );
    }
    if (pathname.startsWith("/admin/productos")) {
      return (
        <div className="flex items-center gap-1.5 font-inter text-[11px] text-[#524438] uppercase tracking-wider">
          <span className="text-[#673900] font-semibold">ADMIN</span>
          <span className="text-[#d8c3b2]">/</span>
          <span className="text-[#524438]">TIENDA</span>
          <span className="text-[#d8c3b2]">/</span>
          <span className="text-[#1e1c13] font-medium">PRODUCTOS</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1.5 font-inter text-[11px] text-[#524438] uppercase tracking-wider">
        <span className="text-[#673900] font-semibold">ADMIN</span>
        <span className="text-[#d8c3b2]">/</span>
        <span className="text-[#1e1c13] font-medium">DASHBOARD</span>
      </div>
    );
  }

  return (
    <header className="fixed top-0 left-[260px] right-0 h-16 bg-[#fff9ed]/95 backdrop-blur-sm border-b border-[#d8c3b2]/60 z-40 px-6 lg:px-8 flex items-center justify-between">
      {/* Breadcrumb a la izquierda */}
      <div className="flex items-center gap-4">{getBreadcrumbs()}</div>

      {/* Controles de la derecha */}
      <div className="flex items-center gap-4 lg:gap-6">
        {/* Barra de búsqueda */}
        <div className="relative flex items-center">
          <span className="material-symbols-outlined text-[#524438] text-[18px] absolute left-3 pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar pedidos, productos, clientes..."
            className="w-64 lg:w-96 pl-9 pr-4 py-1.5 bg-white text-[#1e1c13] placeholder:text-[#857466]/70 font-inter text-[13px] outline-none border border-[#d8c3b2]/50 focus:border-[#673900] transition-colors"
          />
        </div>

        {/* Selector de Atelier / Tienda */}
        <div className="hidden sm:flex items-center gap-1 px-3 py-1 bg-[#f4eddf] border border-[#d8c3b2]/60">
          <span className="material-symbols-outlined text-[16px] text-[#673900]">storefront</span>
          <span className="font-inter text-[10px] uppercase tracking-wider text-[#1e1c13] font-medium">
            Atelier Madrid
          </span>
          <span className="material-symbols-outlined text-[16px] text-[#524438]">
            keyboard_arrow_down
          </span>
        </div>

        {/* Notificaciones */}
        <button
          type="button"
          className="relative p-1.5 text-[#524438] hover:text-[#1e1c13] transition-colors"
          title="Notificaciones"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#c77d2e]" />
        </button>

        {/* Avatar de Usuario */}
        <div className="w-8 h-8 rounded-full bg-[#673900] flex items-center justify-center shrink-0 shadow-sm">
          <span className="material-symbols-outlined text-white text-[18px]">person</span>
        </div>
      </div>
    </header>
  );
}
