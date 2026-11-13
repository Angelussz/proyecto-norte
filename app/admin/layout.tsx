"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/features/auth/hooks/useSession";
import { Store, LogOut, PackageCheck, ShieldCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, isAdmin } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  // Redirigir a login si no está autenticado o no es administrador
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !isAdmin) {
        router.push(`/login?redirectTo=${encodeURIComponent(pathname || "/admin/orders")}`);
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, router, pathname]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      queryClient.invalidateQueries({ queryKey: ["session"] });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Error al cerrar sesión", err);
    }
  }

  // Pantalla de carga mientras se valida la sesión
  if (isLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <span
            className="text-3xl tracking-[0.22em] select-none"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            NORTE
          </span>
          <div className="flex items-center gap-2 border border-border bg-card px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
            <ShieldCheck className="size-3.5 text-primary animate-pulse" />
            <span>Validando credenciales operativas...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* ─── Topbar Editorial Admin ─────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 md:px-8">
          {/* Logo y Badge de Operaciones */}
          <div className="flex items-center gap-3 md:gap-5">
            <Link
              href="/admin/orders"
              className="text-2xl font-normal tracking-[0.22em] text-foreground transition-opacity hover:opacity-80 select-none"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              NORTE
            </Link>
            <div className="flex items-center gap-1.5 border border-border bg-card px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              <span>OPS / ADMIN</span>
            </div>
          </div>

          {/* Navegación Principal */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/admin/orders"
              className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-widest transition-colors ${
                pathname.startsWith("/admin/orders")
                  ? "text-primary border-b-2 border-primary py-5 -mb-px"
                  : "text-muted-foreground hover:text-foreground py-5"
              }`}
            >
              <PackageCheck className="size-4" />
              <span>Gestión de Órdenes</span>
            </Link>
            <Link
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
            >
              <Store className="size-3.5" />
              <span>Ver Tienda</span>
            </Link>
          </nav>

          {/* Perfil & Acciones */}
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold text-foreground">{user?.name}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {user?.email}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Cerrar sesión"
              className="flex size-9 items-center justify-center border border-border bg-card text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ─── Contenido Principal de las Vistas ──────────────────────────── */}
      <main className="flex-1 pb-16">{children}</main>
    </div>
  );
}
