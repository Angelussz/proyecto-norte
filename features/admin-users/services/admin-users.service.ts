import type {
  AdminUser,
  AdminUserDetail,
  AdminUserFilters,
  AdminUsersListResponse,
  SuspendAdminUserDto,
  UpdateAdminUserRoleDto,
} from "@/features/admin-users/types/admin-user.interface";

export class AdminUsersApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "AdminUsersApiError";
    this.status = status;
    this.code = code;
  }
}

async function handleResponseError(response: Response): Promise<never> {
  const body = await response.json().catch(() => null);

  throw new AdminUsersApiError(
    body?.message ?? body?.error ?? "Error al consultar los usuarios",
    response.status,
    body?.code,
  );
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    await handleResponseError(response);
  }

  return (await response.json()) as T;
}

export async function fetchAdminUsers(
  filters: AdminUserFilters = {},
  signal?: AbortSignal,
): Promise<AdminUsersListResponse> {
  const params = new URLSearchParams();

  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  if (filters.role && filters.role !== "ALL") {
    params.set("role", filters.role);
  }

  if (filters.status && filters.status !== "ALL") {
    params.set("status", filters.status);
  }

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  const query = params.toString();
  const url = query ? `/api/admin/users?${query}` : "/api/admin/users";

  return request<AdminUsersListResponse>(url, {
    method: "GET",
    signal,
  });
}

export async function fetchAdminUserDetail(
  id: string,
  signal?: AbortSignal,
): Promise<AdminUserDetail> {
  return request<AdminUserDetail>(`/api/admin/users/${encodeURIComponent(id)}`, {
    method: "GET",
    signal,
  });
}

export async function updateAdminUser(
  id: string,
  data: UpdateAdminUserRoleDto,
): Promise<AdminUser> {
  return request<AdminUser>(`/api/admin/users/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function suspendAdminUser(id: string, data: SuspendAdminUserDto): Promise<AdminUser> {
  return request<AdminUser>(`/api/admin/users/${encodeURIComponent(id)}/suspension`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function reactivateAdminUser(id: string): Promise<AdminUser> {
  return request<AdminUser>(`/api/admin/users/${encodeURIComponent(id)}/suspension`, {
    method: "DELETE",
  });
}

export async function deleteAdminUser(id: string): Promise<AdminUser> {
  return request<AdminUser>(`/api/admin/users/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
