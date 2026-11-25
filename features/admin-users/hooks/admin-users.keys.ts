import type { AdminUserFilters } from "@/features/admin-users/types/admin-user.interface";

export const adminUsersKeys = {
  all: ["admin", "users"] as const,

  lists: () => [...adminUsersKeys.all, "list"] as const,

  list: (filters: AdminUserFilters = {}) => [...adminUsersKeys.lists(), filters] as const,

  details: () => [...adminUsersKeys.all, "detail"] as const,

  detail: (id: string) => [...adminUsersKeys.details(), id] as const,
};
