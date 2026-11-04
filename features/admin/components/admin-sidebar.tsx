"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = {
  TIENDA: [
    { label: "Dashboard", icon: "dashboard", path: "/admin/dashboard" },
    { label: "Productos", icon: "styler", path: "/admin/productos" },
    { label: "Categorías", icon: "category", path: "/admin/categorias" },
    { label: "Inventario", icon: "inventory_2", path: "/admin/inventario" },
  ],
  VENTAS: [
    { label: "Pedidos", icon: "shopping_bag", path: "/admin/pedidos" },
    { label: "Pagos", icon: "payments", path: "/admin/pagos" },
    { label: "Comprobantes", icon: "receipt_long", path: "/admin/comprobantes" },
  ],
  USUARIOS: [
    { label: "Clientes", icon: "group", path: "/admin/clientes" },
    { label: "Admins", icon: "shield_person", path: "/admin/admins" },
  ],
};

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-[#33402f] text-[#fff9ed] z-50 flex flex-col justify-between select-none shadow-[1px_0_0_0_rgba(0,0,0,0.06)]">
      {/* Logo */}
      <div className="flex flex-col">
        <div className="px-6 pt-8 pb-6 border-b border-white/10">
          <span className="block font-headline text-[36px] tracking-widest text-[#fff9ed] leading-none">
            NORTE
          </span>
          <span className="block text-[10px] font-inter font-medium text-[#bccbb4] uppercase tracking-[0.2em] mt-1">
            ATELIER ADMIN
          </span>
        </div>

        {/* Nav */}
        <nav className="px-1 py-4 flex flex-col gap-2">
          {Object.entries(NAV_ITEMS).map(([section, items]) => (
            <div key={section}>
              <div className="px-4 pt-1 pb-1">
                <span className="text-[10px] font-inter font-medium uppercase tracking-[0.18em] text-[#bccbb4]/70">
                  {section}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                {items.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 transition-colors border-l-[3px]",
                        isActive
                          ? "bg-[#54624f]/40 text-[#fff9ed] border-l-[#c77d2e] font-semibold"
                          : "text-[#fff9ed]/80 hover:bg-[#54624f]/25 hover:text-[#fff9ed] border-transparent text-[12px] font-inter font-medium uppercase tracking-[0.15em]",
                      )}
                    >
                      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                      <span
                        className={cn(
                          isActive ? "text-[12px] font-inter uppercase tracking-[0.15em]" : "",
                        )}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-white/10 bg-[#33402f]">
        <div className="flex items-center gap-3 mb-4 px-1">
          <div className="w-9 h-9 bg-[#673900] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white text-[18px]">person</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] font-inter font-medium text-[#fff9ed] truncate uppercase tracking-[0.15em]">
              Admin NORTE
            </span>
            <span className="text-[10px] font-inter text-[#bccbb4] truncate">Administrador</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Link
            href="/"
            className="flex items-center justify-between px-2 py-1.5 text-[#fff9ed]/80 hover:text-[#fff9ed] hover:bg-[#54624f]/20 text-[10px] font-inter uppercase tracking-wider transition-colors"
          >
            <span>Ver tienda online</span>
            <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
          </Link>
          <button
            type="button"
            className="flex items-center justify-between px-2 py-1.5 text-[#fff9ed]/60 hover:text-[#fff9ed] hover:bg-[#54624f]/20 text-[10px] font-inter uppercase tracking-wider transition-colors w-full text-left"
          >
            <span>Cerrar sesión</span>
            <span className="material-symbols-outlined text-[14px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
