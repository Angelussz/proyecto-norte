"use client";

import { Search, RotateCcw, RefreshCw } from "lucide-react";

import type {
  AdminUserFilters,
  AdminUserRole,
  AdminUserStatus,
} from "@/features/admin-users/types/admin-user.interface";

interface UsersFiltersBarProps {
  filters: AdminUserFilters;
  onFilterChange: (newFilters: Partial<AdminUserFilters>) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  isFetching?: boolean;
}

export function UsersFiltersBar({
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  isFetching = false,
}: UsersFiltersBarProps) {
  const hasActiveFilters = Boolean(
    filters.search?.trim() ||
    (filters.role && filters.role !== "ALL") ||
    (filters.status && filters.status !== "ALL"),
  );

  return (
    <div className="flex flex-col gap-3 border border-border bg-card p-3 shadow-xs">
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
            <Search className="size-4" />
          </div>

          <input
            type="text"
            value={filters.search ?? ""}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            placeholder="Buscar por nombre, apellido, email o teléfono..."
            className="h-9 w-full border border-border bg-background pl-9 pr-3 text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary"
          />
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isFetching}
          title="Refrescar usuarios"
          className="flex h-9 shrink-0 items-center justify-center gap-1.5 border border-border bg-background px-3 text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
          <span>Refrescar</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border/50 pt-3">
        <div className="min-w-[140px] flex-1 sm:max-w-xs">
          <select
            value={filters.role ?? "ALL"}
            onChange={(e) =>
              onFilterChange({
                role: e.target.value as AdminUserRole | "ALL",
                page: 1,
              })
            }
            className="h-8 w-full cursor-pointer border border-border bg-background px-2.5 text-[11px] font-semibold uppercase tracking-wider text-foreground outline-none focus:border-primary"
          >
            <option value="ALL">Todos los roles</option>
            <option value="ADMIN">Administradores</option>
            <option value="CUSTOMER">Clientes</option>
          </select>
        </div>

        <div className="min-w-[140px] flex-1 sm:max-w-xs">
          <select
            value={filters.status ?? "ALL"}
            onChange={(e) =>
              onFilterChange({
                status: e.target.value as AdminUserStatus | "ALL",
                page: 1,
              })
            }
            className="h-8 w-full cursor-pointer border border-border bg-background px-2.5 text-[11px] font-semibold uppercase tracking-wider text-foreground outline-none focus:border-primary"
          >
            <option value="ALL">Todos los estados</option>
            <option value="ACTIVE">Activos</option>
            <option value="SUSPENDED">Suspendidos</option>
            <option value="DELETED">Eliminados</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="ml-auto flex h-8 items-center gap-1 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
          >
            <RotateCcw className="size-3" />
            <span>Limpiar filtros</span>
          </button>
        )}
      </div>
    </div>
  );
}
