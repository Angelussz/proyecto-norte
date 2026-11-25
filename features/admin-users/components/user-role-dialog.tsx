"use client";

import { useState } from "react";
import { Shield, UserRound, X, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AdminUser, AdminUserRole } from "@/features/admin-users/types/admin-user.interface";

interface UserRoleDialogProps {
  user: AdminUser | null;
  open: boolean;
  isPending?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: (role: AdminUserRole) => void;
}

interface UserRoleDialogContentProps {
  user: AdminUser;
  isPending: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: (role: AdminUserRole) => void;
}

function UserRoleDialogContent({
  user,
  isPending,
  error,
  onClose,
  onConfirm,
}: UserRoleDialogContentProps) {
  const [selectedRole, setSelectedRole] = useState<AdminUserRole>(user.role);

  const hasChanged = selectedRole !== user.role;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-role-title"
        className="w-full max-w-md border border-border bg-card shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Administración de usuarios
            </p>
            <h2 id="user-role-title" className="mt-1 text-base font-bold text-foreground">
              Cambiar rol
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="Cerrar diálogo"
            className="inline-flex size-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="space-y-5 p-5">
          <div className="border border-border bg-muted/20 p-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center bg-primary/10 text-primary">
                <UserRound className="size-5" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-foreground">
                  {user.name} {user.last_name}
                </p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-foreground">
              Seleccioná el nuevo rol
            </label>

            <div className="space-y-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setSelectedRole("CUSTOMER")}
                className={`flex w-full items-center gap-3 border p-3 text-left transition-colors ${
                  selectedRole === "CUSTOMER"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/40"
                }`}
              >
                <UserRound className="size-5 shrink-0 text-muted-foreground" />

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-foreground">Cliente</span>
                  <span className="block text-xs text-muted-foreground">
                    Acceso habitual a la tienda.
                  </span>
                </span>

                <span
                  className={`size-4 rounded-full border-2 ${
                    selectedRole === "CUSTOMER"
                      ? "border-primary bg-primary ring-2 ring-primary/20"
                      : "border-muted-foreground"
                  }`}
                />
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={() => setSelectedRole("ADMIN")}
                className={`flex w-full items-center gap-3 border p-3 text-left transition-colors ${
                  selectedRole === "ADMIN"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/40"
                }`}
              >
                <Shield className="size-5 shrink-0 text-muted-foreground" />

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-foreground">Administrador</span>
                  <span className="block text-xs text-muted-foreground">
                    Acceso a funciones administrativas.
                  </span>
                </span>

                <span
                  className={`size-4 rounded-full border-2 ${
                    selectedRole === "ADMIN"
                      ? "border-primary bg-primary ring-2 ring-primary/20"
                      : "border-muted-foreground"
                  }`}
                />
              </button>
            </div>
          </div>

          {selectedRole === "ADMIN" && user.role !== "ADMIN" && (
            <div className="border border-amber-500/20 bg-amber-500/5 p-3">
              <p className="text-xs leading-relaxed text-amber-600">
                Atención: este usuario recibirá permisos de administrador. Solo asigná este rol a
                personas autorizadas.
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-600">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>

        <footer className="flex flex-col-reverse gap-2 border-t border-border bg-muted/20 p-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>

          <Button
            type="button"
            disabled={!hasChanged || isPending}
            onClick={() => onConfirm(selectedRole)}
          >
            {isPending ? "Guardando..." : "Confirmar cambio"}
          </Button>
        </footer>
      </section>
    </div>
  );
}

export function UserRoleDialog({
  user,
  open,
  isPending = false,
  error = null,
  onClose,
  onConfirm,
}: UserRoleDialogProps) {
  if (!open || !user) return null;

  return (
    <UserRoleDialogContent
      key={user.id}
      user={user}
      isPending={isPending}
      error={error}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
