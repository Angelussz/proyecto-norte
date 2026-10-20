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
  { item: "Inicio", link: "/" },
  { item: "Tienda", link: "/products" },
  { item: "Nosotros", link: "/nosotros" },
  { item: "Contacto", link: "/contacto" },
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
        {/* ── Logo + Navegación agrupados a la izquierda ───────────────── */}
        <div className="flex items-center gap-8 lg:gap-10">
          <Link
            href="/"
            className="flex-none text-3xl tracking-wider text-foreground select-none"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            NORTE
          </Link>

          <nav className="hidden items-center gap-6 lg:gap-8 md:flex" aria-label="Navegación principal">
            {NAV.map((item) => {
              const isActive = item.link !== "#" && pathname === item.link;
              return (
                <Link
                  key={item.item}
                  href={item.link}
                  suppressHydrationWarning
                  className={`text-xs font-semibold uppercase tracking-widest transition-colors hover:text-primary ${isActive
                      ? "border-b-2 border-primary pb-1 text-primary"
                      : "text-muted-foreground"
                    }`}
                >
                  {item.item}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ── Acciones a la derecha: Buscador + Iconos ──────────────────── */}
        <div className="flex items-center gap-3 sm:gap-4 text-foreground">
          {/* Buscador: parte blanca visible a la izquierda con esquinas redondeadas y borde blanco, al lado de la lupa */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2"
            role="search"
          >
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos…"
                autoComplete="off"
                suppressHydrationWarning
                className="h-9 w-36 sm:w-48 md:w-56 lg:w-64 bg-white pl-3.5 pr-8 text-xs font-body text-foreground placeholder:text-muted-foreground rounded-full border border-white focus:outline-none shadow-sm transition-all"
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
            </div>
            <button
              type="submit"
              aria-label="Buscar"
              className="p-1 transition-colors hover:text-primary"
            >
              <Search className="size-6" />
            </button>
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
