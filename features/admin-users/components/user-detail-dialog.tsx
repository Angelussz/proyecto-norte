"use client";

import { useState } from "react";
import {
  X,
  Shield,
  UserRound,
  ShoppingBag,
  Clock,
  RefreshCw,
  Trash2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

import { useAdminUserDetail } from "@/features/admin-users/hooks/useAdminUserDetail";
import type { AdminUser, AdminUserStatus } from "@/features/admin-users/types/admin-user.interface";

interface UserDetailDialogProps {
  user: AdminUser | null;
  currentUserId: string | null;
  onClose: () => void;
  onChangeRole: (user: AdminUser) => void;
  onSuspend: (user: AdminUser) => void;
  onReactivate: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
}

function formatDate(date: string | null) {
  if (!date) return "—";

  return new Date(date).toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getStatus(user: AdminUser): AdminUserStatus {
  if (user.deleted_at) return "DELETED";

  if (user.suspended_until && new Date(user.suspended_until).getTime() > Date.now()) {
    return "SUSPENDED";
  }

  return "ACTIVE";
}

function StatusBadge({ status }: { status: AdminUserStatus }) {
  const styles: Record<AdminUserStatus, string> = {
    ACTIVE: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
    SUSPENDED: "border-amber-500/20 bg-amber-500/10 text-amber-600",
    DELETED: "border-red-500/20 bg-red-500/10 text-red-600",
  };

  const labels: Record<AdminUserStatus, string> = {
    ACTIVE: "Activo",
    SUSPENDED: "Suspendido",
    DELETED: "Eliminado",
  };

  return (
    <span
      className={`inline-flex border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: typeof UserRound;
  children: React.ReactNode;
}) {
  return (
    <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
      <Icon className="size-4 text-primary" />
      {children}
    </h3>
  );
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 break-words text-sm text-foreground">{value}</div>
    </div>
  );
}

export function UserDetailDialog({
  user,
  currentUserId,
  onClose,
  onChangeRole,
  onSuspend,
  onReactivate,
  onDelete,
}: UserDetailDialogProps) {
  const [showAllHistory, setShowAllHistory] = useState(false);

  const {
    user: detail,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useAdminUserDetail(user?.id ?? "");

  if (!user) return null;

  const currentUser = detail ?? user;
  const status = getStatus(currentUser);
  const isOwnAccount = Boolean(currentUserId && currentUser.id === currentUserId);

  const canReactivate = status === "SUSPENDED" && !isOwnAccount;
  const canSuspend = status === "ACTIVE" && !isOwnAccount;
  const canDelete = status !== "DELETED" && !isOwnAccount;
  const canChangeRole = status !== "DELETED" && !isOwnAccount;

  const suspensions = detail?.suspensions ?? [];
  const visibleSuspensions = showAllHistory ? suspensions : suspensions.slice(0, 3);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-detail-title"
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden border border-border bg-card shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Administración
            </p>
            <h2 id="user-detail-title" className="mt-1 text-lg font-bold text-foreground">
              Detalle del usuario
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="inline-flex size-9 items-center justify-center border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          {isLoading && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Cargando información del usuario...
            </div>
          )}

          {isError && (
            <div className="flex items-center justify-between gap-3 border border-red-500/20 bg-red-500/5 p-3">
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="size-4 shrink-0" />
                No se pudo cargar el detalle completo.
              </div>
              <button
                type="button"
                onClick={() => refetch()}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Reintentar
              </button>
            </div>
          )}

          {!isLoading && (
            <>
              <section className="flex flex-col justify-between gap-4 border border-border bg-muted/20 p-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center bg-primary/10 text-primary">
                    <UserRound className="size-6" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-base font-bold text-foreground">
                      {currentUser.name} {currentUser.last_name}
                    </h3>
                    <p className="truncate text-xs text-muted-foreground">{currentUser.email}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={status} />
                  <span className="border border-border bg-card px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground">
                    {currentUser.role === "ADMIN" ? "Administrador" : "Cliente"}
                  </span>
                </div>
              </section>

              {isOwnAccount && (
                <div className="flex items-start gap-2 border border-blue-500/20 bg-blue-500/5 p-3 text-sm text-blue-600">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                  <p>
                    Esta es tu propia cuenta. Por seguridad, no podés suspenderla, eliminarla ni
                    cambiar tu rol desde aquí.
                  </p>
                </div>
              )}

              <section>
                <SectionTitle icon={UserRound}>Datos personales</SectionTitle>

                <div className="grid grid-cols-1 gap-4 border border-border p-4 sm:grid-cols-2">
                  <InfoItem label="Nombre" value={currentUser.name} />
                  <InfoItem label="Apellido" value={currentUser.last_name} />
                  <InfoItem label="Correo electrónico" value={currentUser.email} />
                  <InfoItem label="Teléfono" value={currentUser.phone || "Sin teléfono"} />
                  <InfoItem
                    label="Email verificado"
                    value={currentUser.email_verified ? "Sí" : "No"}
                  />
                  <InfoItem
                    label="ID de usuario"
                    value={<span className="break-all font-mono text-xs">{currentUser.id}</span>}
                  />
                </div>
              </section>

              <section>
                <SectionTitle icon={Shield}>Información de la cuenta</SectionTitle>

                <div className="grid grid-cols-1 gap-4 border border-border p-4 sm:grid-cols-2">
                  <InfoItem
                    label="Rol"
                    value={currentUser.role === "ADMIN" ? "Administrador" : "Cliente"}
                  />
                  <InfoItem label="Estado" value={<StatusBadge status={status} />} />
                  <InfoItem label="Fecha de registro" value={formatDate(currentUser.created_at)} />
                  <InfoItem
                    label="Cantidad de pedidos"
                    value={
                      <span className="inline-flex items-center gap-2 font-semibold">
                        <ShoppingBag className="size-4 text-muted-foreground" />
                        {currentUser.orders_count}
                      </span>
                    }
                  />
                  {currentUser.suspended_until && (
                    <InfoItem
                      label="Suspensión hasta"
                      value={formatDate(currentUser.suspended_until)}
                    />
                  )}
                  {currentUser.deleted_at && (
                    <InfoItem
                      label="Fecha de eliminación"
                      value={formatDate(currentUser.deleted_at)}
                    />
                  )}
                </div>
              </section>

              <section>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <SectionTitle icon={Clock}>Historial de suspensiones</SectionTitle>

                  <span className="text-[10px] font-semibold text-muted-foreground">
                    {suspensions.length} registro(s)
                  </span>
                </div>

                {suspensions.length === 0 ? (
                  <div className="border border-border bg-muted/20 p-5 text-center">
                    <ShieldCheck className="mx-auto size-6 text-muted-foreground" />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Este usuario no tiene suspensiones registradas.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {visibleSuspensions.map((suspension) => (
                      <article key={suspension.id} className="border border-border p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-bold text-foreground">Suspensión registrada</p>

                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(suspension.created_at)}
                          </span>
                        </div>

                        <div className="mt-3 space-y-3">
                          <InfoItem label="Motivo" value={suspension.reason} />

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <InfoItem
                              label="Administrador responsable"
                              value={`${suspension.admin.name} ${suspension.admin.last_name}`}
                            />
                            <InfoItem
                              label="Suspensión hasta"
                              value={formatDate(suspension.suspended_until)}
                            />
                            <InfoItem
                              label="Reactivación"
                              value={
                                suspension.reactivated_at
                                  ? formatDate(suspension.reactivated_at)
                                  : "No registrada"
                              }
                            />
                            <InfoItem
                              label="Reactivado por"
                              value={
                                suspension.reactivated_by
                                  ? `${suspension.reactivated_by.name} ${suspension.reactivated_by.last_name}`
                                  : "—"
                              }
                            />
                          </div>
                        </div>
                      </article>
                    ))}

                    {suspensions.length > 3 && (
                      <button
                        type="button"
                        onClick={() => setShowAllHistory((previous) => !previous)}
                        className="w-full border border-border py-2 text-xs font-semibold text-primary transition-colors hover:bg-muted"
                      >
                        {showAllHistory
                          ? "Mostrar menos"
                          : `Ver todo el historial (${suspensions.length})`}
                      </button>
                    )}
                  </div>
                )}
              </section>
            </>
          )}
        </div>

        <footer className="border-t border-border bg-muted/20 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {canSuspend && (
                <button
                  type="button"
                  disabled={isLoading || isError || !detail}
                  onClick={() => onSuspend(currentUser)}
                  className="inline-flex items-center justify-center gap-2 border border-amber-500/30 px-3 py-2 text-xs font-semibold text-amber-600 transition-colors hover:bg-amber-500/10 disabled:opacity-50"
                >
                  <Clock className="size-3.5" />
                  Suspender
                </button>
              )}

              {canReactivate && (
                <button
                  type="button"
                  disabled={isLoading || isError || !detail}
                  onClick={() => onReactivate(currentUser)}
                  className="inline-flex items-center justify-center gap-2 border border-emerald-500/30 px-3 py-2 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-500/10 disabled:opacity-50"
                >
                  <RefreshCw className="size-3.5" />
                  Reactivar
                </button>
              )}

              {canDelete && (
                <button
                  type="button"
                  disabled={isLoading || isError || !detail}
                  onClick={() => onDelete(currentUser)}
                  className="inline-flex items-center justify-center gap-2 border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                >
                  <Trash2 className="size-3.5" />
                  Eliminar
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {canChangeRole && (
                <button
                  type="button"
                  disabled={isLoading || isError || !detail}
                  onClick={() => onChangeRole(currentUser)}
                  className="inline-flex items-center justify-center gap-2 border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                >
                  <Shield className="size-3.5" />
                  Cambiar rol
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Cerrar
              </button>
            </div>
          </div>

          {isFetching && !isLoading && (
            <p className="mt-2 text-right text-[10px] text-muted-foreground">
              Actualizando información...
            </p>
          )}
        </footer>
      </section>
    </div>
  );
}
