"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Link utilitario del header de auth.
 * En /login muestra "Colección 2025" (decorativo).
 * En /register muestra "Iniciar Sesión" (funcional).
 */
export function AuthNavLink() {
  const pathname = usePathname();

  if (pathname === "/register") {
    return (
      <Link
        href="/login"
        className="text-xs font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
      >
        Iniciar Sesión
      </Link>
    );
  }

  return (
    <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
      Colección 2025
    </span>
  );
}
