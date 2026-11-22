"use client";

import { useState } from "react";

import type {
  AdminUser,
  AdminUserFilters,
  AdminUserRole,
  SuspendAdminUserDto,
} from "@/features/admin-users/types/admin-user.interface";

import { useSession } from "@/features/auth/hooks/useSession";
import { useAdminUsers } from "@/features/admin-users/hooks/useAdminUsers";
import { useAdminUserMutations } from "@/features/admin-users/hooks/useAdminUserMutations";

import { UsersFiltersBar } from "@/features/admin-users/components/users-filters-bar";
import { UsersTable } from "@/features/admin-users/components/users-table";
import { UserDetailDialog } from "@/features/admin-users/components/user-detail-dialog";
import { UserRoleDialog } from "@/features/admin-users/components/user-role-dialog";
import { UserSuspensionDialog } from "@/features/admin-users/components/user-suspension-dialog";

const INITIAL_FILTERS: AdminUserFilters = {
  page: 1,
  limit: 10,
  role: "ALL",
  status: "ALL",
  search: "",
};

export default function AdminUsersPage() {
  const [filters, setFilters] = useState<AdminUserFilters>(INITIAL_FILTERS);

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [roleUser, setRoleUser] = useState<AdminUser | null>(null);
  const [suspensionUser, setSuspensionUser] = useState<AdminUser | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { user: sessionUser } = useSession();

  const { users, pagination, isLoading, isFetching, isError, error, refetch } =
    useAdminUsers(filters);

  const mutations = useAdminUserMutations();

  const updateFilters = (newFilters: Partial<AdminUserFilters>) => {
    setFilters((current) => ({
      ...current,
      ...newFilters,
    }));
  };

  const clearFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const handleChangeRole = (role: AdminUserRole) => {
    if (!roleUser) return;

    setActionError(null);

    mutations.updateRole.mutate(
      {
        id: roleUser.id,
        dto: { role },
      },
      {
        onSuccess: () => {
          setRoleUser(null);
        },
      },
    );
  };

  const handleSuspend = (dto: SuspendAdminUserDto) => {
    if (!suspensionUser) return;

    setActionError(null);

    mutations.suspend.mutate(
      {
        id: suspensionUser.id,
        dto,
      },
      {
        onSuccess: () => {
          setSuspensionUser(null);
        },
      },
    );
  };

  const handleReactivate = (user: AdminUser) => {
    const confirmed = window.confirm(
      `¿Querés reactivar la cuenta de ${user.name} ${user.last_name}?`,
    );

    if (!confirmed) return;

    setActionError(null);

    mutations.reactivate.mutate(
      { id: user.id },
      {
        onSuccess: () => {
          setSelectedUser(null);
        },
        onError: (mutationError) => {
          setActionError(mutationError.message);
        },
      },
    );
  };

  const handleDelete = (user: AdminUser) => {
    const confirmed = window.confirm(
      `¿Querés eliminar la cuenta de ${user.name} ${user.last_name}? Esta acción desactivará la cuenta, pero conservará sus registros.`,
    );

    if (!confirmed) return;

    setActionError(null);

    mutations.remove.mutate(
      { id: user.id },
      {
        onSuccess: () => {
          setSelectedUser(null);
        },
        onError: (mutationError) => {
          setActionError(mutationError.message);
        },
      },
    );
  };

  const roleMutationError = mutations.updateRole.error?.message ?? null;
  const suspensionMutationError = mutations.suspend.error?.message ?? null;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Administración de usuarios
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Consultá usuarios, administrá sus permisos y controlá el estado de sus cuentas.
          </p>
        </div>

        {pagination && (
          <p className="text-xs text-muted-foreground">{pagination.total} usuarios registrados</p>
        )}
      </div>

      <UsersFiltersBar
        filters={filters}
        onFilterChange={updateFilters}
        onClearFilters={clearFilters}
        onRefresh={() => refetch()}
        isFetching={isFetching}
      />

      {actionError && (
        <div
          role="alert"
          className="border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {actionError}
        </div>
      )}

      {isError && (
        <div
          role="alert"
          className="flex flex-col gap-2 border border-destructive/30 bg-destructive/5 p-4"
        >
          <p className="text-sm font-semibold text-destructive">
            No se pudieron cargar los usuarios.
          </p>
          <p className="text-xs text-muted-foreground">
            {error?.message ?? "Ocurrió un error inesperado."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="w-fit text-xs font-semibold text-primary hover:underline"
          >
            Intentar nuevamente
          </button>
        </div>
      )}

      {!isError && (
        <>
          <UsersTable users={users} onViewUser={setSelectedUser} isLoading={isLoading} />

          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-4 sm:flex-row">
              <p className="text-xs text-muted-foreground">
                Página {pagination.page} de {pagination.totalPages}
                {" · "}
                {pagination.total} usuarios
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1 || isFetching}
                  onClick={() => updateFilters({ page: pagination.page - 1 })}
                  className="border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Anterior
                </button>

                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages || isFetching}
                  onClick={() => updateFilters({ page: pagination.page + 1 })}
                  className="border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <UserDetailDialog
        key={selectedUser?.id ?? "no-user"}
        user={selectedUser}
        currentUserId={sessionUser?.id ?? null}
        onClose={() => setSelectedUser(null)}
        onChangeRole={(user) => setRoleUser(user)}
        onSuspend={(user) => setSuspensionUser(user)}
        onReactivate={handleReactivate}
        onDelete={handleDelete}
      />

      <UserRoleDialog
        user={roleUser}
        open={Boolean(roleUser)}
        isPending={mutations.updateRole.isPending}
        error={roleMutationError}
        onClose={() => setRoleUser(null)}
        onConfirm={handleChangeRole}
      />

      <UserSuspensionDialog
        userName={suspensionUser ? `${suspensionUser.name} ${suspensionUser.last_name}` : ""}
        open={Boolean(suspensionUser)}
        isPending={mutations.suspend.isPending}
        error={suspensionMutationError}
        onClose={() => setSuspensionUser(null)}
        onConfirm={handleSuspend}
      />
    </div>
  );
}
