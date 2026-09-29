"use client";

/**
 * features/store/components/user-menu.tsx
 *
 * Dropdown de usuario en el header de la tienda.
 *
 * Estados:
 *  - Cargando      → skeleton circular
 *  - Sin sesión    → ícono User → /login
 *  - Con sesión    → avatar (foto Google o iniciales) + dropdown con opciones
 *
 * Opciones del dropdown (e-commerce best practices):
 *  - Mi cuenta         (todos los usuarios)
 *  - Mis pedidos       (todos los usuarios)
 *  - Panel Admin       (solo ADMIN — solo frontend por ahora)
 *  - Cerrar sesión     (todos los usuarios)
 */

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  ShoppingBag,
  LayoutDashboard,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useSession } from "@/features/auth/hooks/useSession";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Genera las iniciales del usuario (máx. 2 caracteres) */
function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ─── Skeleton (mientras carga la sesión) ────────────────────────────────────

function AvatarSkeleton() {
  return (
    <div className="size-9 animate-pulse rounded-full bg-muted" />
  );
}

// ─── Avatar (foto de Google o iniciales) ────────────────────────────────────

function Avatar({ name, picture }: { name?: string | null; picture?: string }) {
  if (picture) {
    return (
      <Image
        src={picture}
        alt={name ?? ""}
        width={36}
        height={36}
        className="size-9 rounded-full object-cover ring-2 ring-primary/30 transition-all group-hover:ring-primary"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground ring-2 ring-primary/30 transition-all group-hover:ring-primary">
      {getInitials(name)}
    </div>
  );
}

// ─── Dropdown item ───────────────────────────────────────────────────────────

function MenuItem({
  href,
  icon: Icon,
  children,
  danger = false,
  onClick,
}: {
  href?: string;
  icon: React.ElementType;
  children: React.ReactNode;
  danger?: boolean;
  onClick?: () => void;
}) {
  const base =
    "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors w-full text-left";
  const color = danger
    ? "text-destructive hover:bg-destructive/10"
    : "text-foreground hover:bg-muted";

  if (href) {
    return (
      <Link href={href} className={`${base} ${color}`} onClick={onClick}>
        <Icon className="size-4 shrink-0" />
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={`${base} ${color}`}>
      <Icon className="size-4 shrink-0" />
      {children}
    </button>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

export function UserMenu() {
  const { user, isLoading, isAdmin } = useSession();
  const [open, setOpen] = useState(false);
  const [logoutError, setLogoutError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Cerrar el dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cerrar con Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ── Estado: cargando ────────────────────────────────────────────────────────
  if (isLoading) {
    return <AvatarSkeleton />;
  }

  // ── Estado: sin sesión → ícono de user hacia /login ────────────────────────
  if (!user) {
    return (
      <Link
        href="/login"
        aria-label="Iniciar sesión"
        className="transition-colors hover:text-primary"
      >
        <User className="size-6" />
      </Link>
    );
  }

  // ── Logout ──────────────────────────────────────────────────────────────────
  async function handleLogout() {
    setOpen(false);
    setLogoutError(false);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error("Logout fallido");
      // Invalidamos la caché de sesión → el header vuelve al estado "sin sesión"
      queryClient.invalidateQueries({ queryKey: ["session"] });
      router.push("/login");
      router.refresh();
    } catch {
      // Si el fetch falla, NO invalidamos la caché ni redirigimos.
      // El usuario sigue logueado (estado consistente) y ve el error.
      setLogoutError(true);
    }
  }

  // ── Estado: con sesión → avatar + dropdown ──────────────────────────────────
  return (
    <div ref={menuRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        id="user-menu-trigger"
        aria-label="Menú de usuario"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((prev) => !prev)}
        className="group flex items-center gap-1.5 outline-none"
      >
        <Avatar name={user.name} picture={user.picture} />
        <ChevronDown
          className={`size-3.5 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-xl animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Cabecera con info del usuario */}
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-semibold text-foreground">
              {user.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
            {isAdmin && (
              <span className="mt-1.5 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                Admin
              </span>
            )}
          </div>

          {/* Opciones */}
          <div role="group" className="py-1">
            <MenuItem href="/account" icon={User} onClick={() => setOpen(false)}>
              Mi cuenta
            </MenuItem>
            <MenuItem href="/orders" icon={ShoppingBag} onClick={() => setOpen(false)}>
              Mis pedidos
            </MenuItem>

            {/* Opción admin — solo visible si el usuario tiene rol ADMIN */}
            {isAdmin && (
              <MenuItem
                href="/admin"
                icon={LayoutDashboard}
                onClick={() => setOpen(false)}
              >
                Panel admin
              </MenuItem>
            )}
          </div>

          {/* Cerrar sesión */}
          <div role="group" className="border-t border-border py-1">
            <MenuItem icon={LogOut} danger onClick={handleLogout}>
              Cerrar sesión
            </MenuItem>
            {logoutError && (
              <p className="px-4 pb-2 text-[11px] text-destructive">
                Error al cerrar sesión. Intentá de nuevo.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
