"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavItem = {
  label: string;
  icon: string;
  href: string;
  children?: { label: string; icon: string; href: string }[];
};

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "TIENDA",
    items: [
      { label: "Dashboard", icon: "dashboard", href: "/admin" },
      {
        label: "Productos",
        icon: "checkroom",
        href: "/admin/productos",
        children: [
          {
            label: "Listado de Productos",
            icon: "styler",
            href: "/admin/productos",
          },
          {
            label: "Agregar Producto",
            icon: "add",
            href: "/admin/productos/nuevo",
          },
          {
            label: "Editar Producto",
            icon: "edit",
            href: "/admin/productos/editar",
          },
        ],
      },
      {
        label: "Categorías",
        icon: "category",
        href: "/admin/categorias",
        children: [
          {
            label: "Sistema de Talles",
            icon: "straighten",
            href: "/admin/categorias",
          },
          {
            label: "Marcas y Colores",
            icon: "palette",
            href: "/admin/categorias/colores-marcas",
          },
        ],
      },
      { label: "Inventario", icon: "inventory_2", href: "/admin/inventario" },
    ],
  },
  {
    title: "VENTAS",
    items: [
      { label: "Pedidos", icon: "shopping_bag", href: "/admin/pedidos" },
      { label: "Pagos", icon: "payments", href: "/admin/pagos" },
      {
        label: "Comprobantes",
        icon: "receipt_long",
        href: "/admin/comprobantes",
      },
    ],
  },
  {
    title: "USUARIOS",
    items: [
      { label: "Clientes", icon: "group", href: "/admin/clientes" },
      {
        label: "Admins",
        icon: "admin_panel_settings",
        href: "/admin/admins",
      },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    Productos: pathname.startsWith("/admin/productos"),
    Categorías: pathname.startsWith("/admin/categorias"),
  });

  // Mantener desplegado el menú que contiene la ruta activa
  useEffect(() => {
    NAV_SECTIONS.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children?.length) {
          if (
            pathname.startsWith(item.href) ||
            item.children.some((child) => pathname.startsWith(child.href))
          ) {
            setOpenMenus((prev) => ({ ...prev, [item.label]: true }));
          }
        }
      });
    });
  }, [pathname]);

  function toggleMenu(label: string) {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-[#33402f] text-[#fff9ed] z-50 flex flex-col justify-between">
      {/* Logo / Brand */}
      <div className="flex flex-col">
        <div className="px-6 pt-8 pb-6 border-b border-white/10">
          <span className="block font-headline text-[36px] leading-none tracking-widest text-[#fff9ed]">
            NORTE
          </span>
          <span className="block font-inter text-[10px] text-[#e0dacb] uppercase tracking-widest mt-1">
            ATELIER ADMIN
          </span>
        </div>

        {/* Nav Sections */}
        <div className="overflow-y-auto px-2 py-2 flex flex-col gap-4">
          {NAV_SECTIONS.map((section) => (
            <section key={section.title}>
              <div className="px-2 pb-1">
                <span className="font-inter text-[10px] uppercase tracking-widest text-[#e0dacb]/60 font-semibold">
                  {section.title}
                </span>
              </div>
              <nav className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  const hasChildren = !!item.children?.length;
                  const isOpen = openMenus[item.label];

                  return (
                    <div key={item.href} className="flex flex-col">
                      {hasChildren ? (
                        /* Botón que despliega automáticamente las subopciones al apretar en la opción */
                        <button
                          type="button"
                          onClick={() => toggleMenu(item.label)}
                          className={`w-full flex items-center justify-between px-2 py-1.5 font-inter text-[14px] transition-colors cursor-pointer select-none text-left ${
                            active
                              ? "bg-white/10 text-[#ffb875] font-semibold"
                              : "text-[#e0dacb] hover:text-[#fff9ed] hover:bg-white/5"
                          }`}
                        >
                          <div className="flex items-center flex-1 min-w-0">
                            <span className="material-symbols-outlined text-[18px] mr-2 opacity-80">
                              {item.icon}
                            </span>
                            <span>{item.label}</span>
                          </div>
                          <span
                            className={`material-symbols-outlined text-[16px] text-[#e0dacb] transition-transform duration-200 ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          >
                            expand_more
                          </span>
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          className={`flex items-center px-2 py-1.5 font-inter text-[14px] transition-colors ${
                            active
                              ? "bg-white/10 text-[#ffb875] font-semibold border-l-2 border-[#c77d2e]"
                              : "text-[#e0dacb] hover:text-[#fff9ed] hover:bg-white/5"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px] mr-2 opacity-80">
                            {item.icon}
                          </span>
                          {item.label}
                        </Link>
                      )}

                      {/* Sub-menu */}
                      {hasChildren && isOpen && (
                        <div className="flex flex-col ml-4 pl-3 border-l border-white/10 py-1 gap-0.5">
                          {item.children!.map((child) => {
                            const childActive = pathname === child.href;
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={`flex items-center px-2 py-1 font-inter text-[12px] transition-colors ${
                                  childActive
                                    ? "text-[#ffb875] font-semibold bg-white/10 border-l-2 border-[#c77d2e]"
                                    : "text-[#e0dacb] hover:text-[#fff9ed] hover:bg-white/5"
                                }`}
                              >
                                <span className="material-symbols-outlined text-[14px] mr-1.5 opacity-80">
                                  {child.icon}
                                </span>
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </section>
          ))}
        </div>
      </div>

      {/* Footer: User + actions */}
      <div className="p-4 bg-black/25 flex flex-col gap-2 border-t border-white/10">
        <div className="flex items-center gap-3 pb-1">
          <div className="w-9 h-9 bg-[#c77d2e] flex items-center justify-center font-headline text-[18px] text-white shrink-0 shadow-sm">
            EV
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-inter text-[14px] text-[#fff9ed] font-medium truncate leading-tight">
              Elena Vázquez
            </span>
            <span className="font-inter text-[10px] uppercase tracking-wider text-[#e0dacb] leading-none mt-1">
              Administradora
            </span>
          </div>
        </div>
        <div className="flex flex-col pt-2 mt-0.5 border-t border-white/10 gap-1">
          <Link
            href="/"
            className="font-inter text-[10px] uppercase tracking-widest text-[#e0dacb] hover:text-[#c77d2e] flex items-center gap-2 py-1 px-1 hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] opacity-80">open_in_new</span>
            VER TIENDA ONLINE
          </Link>
          <button className="font-inter text-[10px] uppercase tracking-widest text-[#e0dacb]/70 hover:text-red-300 flex items-center gap-2 py-1 px-1 hover:bg-white/5 transition-colors w-full text-left">
            <span className="material-symbols-outlined text-[16px] opacity-80">logout</span>
            CERRAR SESIÓN
          </button>
        </div>
      </div>
    </aside>
  );
}
