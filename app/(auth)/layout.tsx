import type { Metadata } from "next";
import Link from "next/link";
import { AuthNavLink } from "@/features/auth/components/auth-nav-link";
import { AuthEditorialPanelDynamic } from "@/features/auth/components/auth-editorial-panel-dynamic";

export const metadata: Metadata = {
  title: {
    template: "%s — NORTE",
    default: "NORTE",
  },
};

/**
 * Layout de autenticación.
 * - Header y footer compartidos entre /login y /register.
 * - Grid de dos columnas: el `children` ocupa la izquierda,
 *   el panel editorial (imagen fija con crossfade) ocupa la derecha.
 * - El panel NUNCA se desmonta al navegar entre rutas de auth,
 *   eliminando cualquier layout shift.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-screen flex-col justify-between bg-background text-foreground selection:bg-primary selection:text-primary-foreground"
      style={{ fontFamily: "var(--font-inter), sans-serif" }}
    >
      {/* ── Header compartido ── */}
      <header className="mx-auto w-full max-w-[1440px] px-8 pt-8 pb-4 sm:px-12 lg:px-16">
        <div className="flex items-center justify-between">
          {/* Wordmark */}
          <Link
            href="/"
            aria-label="NORTE — Ir a la tienda"
            className="group focus:outline-none"
          >
            <span
              className="text-3xl tracking-[0.18em] text-foreground transition-opacity duration-200 group-hover:opacity-75"
              style={{ fontFamily: "var(--font-bebas), sans-serif" }}
            >
              NORTE
            </span>
          </Link>

          {/* Link utilitario: cambia entre páginas (client) */}
          <AuthNavLink />
        </div>
      </header>

      {/* ── Main: grid dos columnas ── */}
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-8 py-6 sm:px-12 lg:px-16">
        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-12 xl:gap-20">
          {/* Columna izquierda: contenido de cada página (formulario) */}
          <div className="mx-auto w-full max-w-[440px] lg:col-span-6 lg:mx-0 xl:col-span-5">
            {children}
          </div>

          {/* Columna derecha: panel editorial fijo con crossfade (client) */}
          <AuthEditorialPanelDynamic />
        </div>
      </main>

      {/* ── Footer compartido ── */}
      <footer className="mx-auto mt-4 w-full max-w-[1440px] space-y-2 border-t border-border/40 px-8 py-6 text-center sm:px-12 lg:px-16">
        <div>
          <Link
            href="#"
            className="text-xs font-medium tracking-wide text-foreground underline underline-offset-4 transition-colors hover:text-primary"
          >
            Necesito ayuda
          </Link>
        </div>
        <p className="mx-auto max-w-xl text-[11px] font-light leading-relaxed text-muted-foreground">
          Al continuar, aceptás nuestros{" "}
          <Link
            href="#"
            className="underline underline-offset-2 transition-colors hover:text-foreground"
          >
            Términos y Condiciones
          </Link>{" "}
          y nuestra política sobre{" "}
          <Link
            href="#"
            className="underline underline-offset-2 transition-colors hover:text-foreground"
          >
            Protección de Datos
          </Link>
          .
        </p>
      </footer>
    </div>
  );
}
