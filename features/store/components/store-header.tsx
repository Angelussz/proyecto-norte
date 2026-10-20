"use client";

/**
 * features/store/components/store-header.tsx
 *
 * Header sticky de la tienda.
 * Navegación alineada a la izquierda junto al logo
 * y buscador siempre visible con estética blanca editorial.
 */

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, X, ShoppingBag } from "lucide-react";
import { UserMenu } from "@/features/store/components/user-menu";

const NAV = [
  { item: "Tienda", link: "/products" },
  { item: "Nosotros", link: "#" },
  { item: "Contacto", link: "#" },
];

export function StoreHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/products?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 md:px-16">
        {/* ── Logo y enlaces de navegación alineados a la izquierda ─────── */}
        <div className="flex items-center gap-8 lg:gap-12">
          <Link
            href="/"
            className="text-3xl tracking-wider text-foreground select-none"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            NORTE
          </Link>
          <nav className="hidden items-center gap-7 md:flex" aria-label="Navegación principal">
            {NAV.map((item) => {
              const isActive = item.link !== "#" && pathname === item.link;
              return (
                <Link
                  key={item.item}
                  href={item.link}
                  className={`text-xs font-semibold uppercase tracking-widest transition-colors hover:text-primary ${
                    isActive ? "border-b-2 border-primary pb-1 text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.item}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ── Acciones a la derecha: Buscador visible + Iconos ──────────── */}
        <div className="flex items-center gap-3 sm:gap-4 text-foreground">
          {/* Buscador siempre visible con fondo blanco y estilo editorial */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center"
            role="search"
          >
            <Search className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar productos…"
              className="h-9 w-32 sm:w-48 md:w-60 lg:w-64 bg-white pl-9 pr-8 text-xs font-body text-foreground placeholder:text-muted-foreground border border-border/80 focus:border-primary focus:outline-none transition-all shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Limpiar búsqueda"
                className="absolute right-2.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-3.5" />
              </button>
            )}
          </form>

          {/* UserMenu maneja los 3 estados: loading, sin sesión (ícono User -> /login), con sesión */}
          <UserMenu />

          <Link href="/cart" aria-label="Carrito" className="transition-colors hover:text-primary p-1">
            <ShoppingBag className="size-6" />
          </Link>

          <button aria-label="Menú" className="transition-colors hover:text-primary md:hidden p-1">
            <Menu className="size-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
