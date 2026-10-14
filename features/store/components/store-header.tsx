"use client";

/**
 * features/store/components/store-header.tsx
 *
 * Header sticky de la tienda.
 * Es Client Component porque necesita el UserMenu interactivo.
 */

import Link from "next/link";
import { Menu, ShoppingBag } from "lucide-react";
import { UserMenu } from "@/features/store/components/user-menu";

const NAV = [
  { item: "Tienda", link: "/products" },
  { item: "Sobre Nosotros", link: "/products" },
];

export function StoreHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 md:px-16">
        <Link
          href="/"
          className="text-3xl tracking-wider text-foreground"
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        >
          NORTE
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.item}
              href={item.link}
              className="text-sm font-semibold uppercase tracking-widest transition-colors hover:text-primary"
            >
              {item.item}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4 text-foreground">
          {/* UserMenu maneja los 3 estados: loading, sin sesión (ícono User -> /login), con sesión */}
          <UserMenu />

          <Link href="/cart" aria-label="Carrito" className="transition-colors hover:text-primary">
            <ShoppingBag className="size-6" />
          </Link>
          <button aria-label="Menú" className="transition-colors hover:text-primary md:hidden">
            <Menu className="size-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
