export type AdminUserRole = "ADMIN" | "CUSTOMER";

export type AdminUserStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

export type AdminUserFilters = {
  page?: number;
  limit?: number;
  role?: AdminUserRole | "ALL";
  status?: AdminUserStatus | "ALL";
  search?: string;
};

export interface AdminUser {
  id: string;
  name: string;
  last_name: string;
  email: string;
  phone: string;
  role: AdminUserRole;
  email_verified: boolean;
  created_at: string;
  suspended_until: string | null;
  deleted_at: string | null;
  status: AdminUserStatus;
  orders_count: number;
}

export interface AdminUserSuspension {
  id: string;
  reason: string;
  created_at: string;
  suspended_until: string;
  reactivated_at: string | null;
  user: {
    id: string;
    name: string;
    last_name: string;
    email: string;
  };
  admin: {
    id: string;
    name: string;
    last_name: string;
    email: string;
  };
  reactivated_by: {
    id: string;
    name: string;
    last_name: string;
    email: string;
  } | null;
}

export interface AdminUserDetail extends AdminUser {
  suspensions: AdminUserSuspension[];
}

export interface AdminUserPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminUsersListResponse {
  data: AdminUser[];
  pagination: AdminUserPagination;
}

export interface UpdateAdminUserRoleDto {
  role: AdminUserRole;
}

export interface SuspendAdminUserDto {
  reason: string;
  duration_days?: 1 | 7 | 15 | 30;
  suspended_until?: string;
}

export interface ReactivateAdminUserDto {
  reason?: string;
}
