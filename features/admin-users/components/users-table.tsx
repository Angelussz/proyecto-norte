"use client";

import { Eye } from "lucide-react";

import type { AdminUser, AdminUserStatus } from "@/features/admin-users/types/admin-user.interface";

interface UsersTableProps {
  users: AdminUser[];
  onViewUser: (user: AdminUser) => void;
  isLoading?: boolean;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-AR", {
    dateStyle: "short",
  });
}

function UserStatusBadge({ status }: { status: AdminUserStatus }) {
  const styles: Record<AdminUserStatus, string> = {
    ACTIVE: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    SUSPENDED: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    DELETED: "bg-red-500/10 text-red-600 border-red-500/20",
  };

  const labels: Record<AdminUserStatus, string> = {
    ACTIVE: "Activo",
    SUSPENDED: "Suspendido",
    DELETED: "Eliminado",
  };

  return (
    <span
      className={`inline-flex items-center border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function UserRoleBadge({ role }: { role: AdminUser["role"] }) {
  return (
    <span className="inline-flex items-center border border-border bg-muted/40 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground">
      {role === "ADMIN" ? "Administrador" : "Cliente"}
    </span>
  );
}

export function UsersTable({ users, onViewUser, isLoading = false }: UsersTableProps) {
  if (isLoading) {
    return (
      <div className="border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Cargando usuarios...
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="border border-border bg-card p-10 text-center">
        <p className="text-sm font-semibold text-foreground">No se encontraron usuarios</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Probá modificando los filtros de búsqueda.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-border bg-card">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-border bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-semibold">Usuario</th>
            <th className="px-4 py-3 font-semibold">Teléfono</th>
            <th className="px-4 py-3 font-semibold">Rol</th>
            <th className="px-4 py-3 font-semibold">Estado</th>
            <th className="px-4 py-3 text-center font-semibold">Pedidos</th>
            <th className="px-4 py-3 font-semibold">Registro</th>
            <th className="px-4 py-3 text-center font-semibold">Detalle</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {users.map((user) => (
            <tr key={user.id} className="transition-colors hover:bg-muted/30">
              <td className="px-4 py-3">
                <p className="font-semibold text-foreground">
                  {user.name} {user.last_name}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">{user.email}</p>
              </td>

              <td className="px-4 py-3 text-muted-foreground">{user.phone || "Sin teléfono"}</td>

              <td className="px-4 py-3">
                <UserRoleBadge role={user.role} />
              </td>

              <td className="px-4 py-3">
                <UserStatusBadge status={user.status} />
              </td>

              <td className="px-4 py-3 text-center font-semibold tabular-nums text-foreground">
                {user.orders_count}
              </td>

              <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                {formatDate(user.created_at)}
              </td>

              <td className="px-4 py-3 text-center">
                <button
                  type="button"
                  onClick={() => onViewUser(user)}
                  title="Ver detalle del usuario"
                  aria-label={`Ver detalle de ${user.name} ${user.last_name}`}
                  className="inline-flex size-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                >
                  <Eye className="size-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
