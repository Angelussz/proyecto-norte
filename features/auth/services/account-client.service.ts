/**
 * account-client.service.ts
 * Funciones de cliente (browser) para interactuar con la API de cuenta.
 * Este archivo NO importa Prisma ni módulos de servidor.
 */
import type {
  AccountSecurityResponse,
  AvatarUpdateResponse,
  ChangeEmailBody,
  ChangeEmailResponse,
  ChangePasswordBody,
  ChangePasswordResponse,
  DeleteAccountBody,
  NotificationPreferences,
  ProfileResponse,
  RevokeOtherSessionsResponse,
  RevokeSessionResponse,
  UpdateNotificationsBody,
  UpdateProfileBody,
  UserProfile,
} from "@/features/auth/types/auth.interface";

async function accountRequest<T>(
  url: string,
  init: RequestInit,
  fallbackError: string,
): Promise<T> {
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;

  const res = await fetch(url, {
    ...init,
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      ...(init.body && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error ?? fallbackError);
  }

  return res.json() as Promise<T>;
}

/**
 * Cliente HTTP para consultar el perfil completo.
 */
export async function fetchProfileApi(): Promise<UserProfile> {
  const data = await accountRequest<ProfileResponse>(
    "/api/account/profile",
    { method: "GET" },
    "No se pudo obtener el perfil.",
  );
  return data.user;
}

/**
 * Cliente HTTP para actualizar los datos del perfil.
 */
export async function updateProfileApi(dto: UpdateProfileBody): Promise<UserProfile> {
  const data = await accountRequest<ProfileResponse>(
    "/api/account/profile",
    { method: "PATCH", body: JSON.stringify(dto) },
    "Error al actualizar el perfil.",
  );
  return data.user;
}

/**
 * Cliente HTTP para subir o reemplazar la fotografía de perfil.
 */
export async function uploadAvatarApi(file: File): Promise<AvatarUpdateResponse> {
  const formData = new FormData();
  formData.append("image", file);

  return accountRequest<AvatarUpdateResponse>(
    "/api/account/avatar",
    { method: "POST", body: formData },
    "Error al guardar la fotografía.",
  );
}

/**
 * Cliente HTTP para eliminar la fotografía de perfil actual.
 */
export async function deleteAvatarApi(): Promise<UserProfile> {
  const data = await accountRequest<ProfileResponse>(
    "/api/account/avatar",
    { method: "DELETE" },
    "Error al eliminar la fotografía.",
  );
  return data.user;
}

/**
 * Cliente HTTP para eliminar (anonimizar) la cuenta del usuario.
 * Si la promesa resuelve, la cookie de sesión ya fue eliminada en el servidor.
 */
export async function deleteAccountApi(dto: DeleteAccountBody): Promise<void> {
  await accountRequest<{ ok: boolean }>(
    "/api/account",
    { method: "DELETE", body: JSON.stringify(dto) },
    "Error al cerrar la cuenta.",
  );
}

/**
 * Cliente HTTP para consultar sesiones activas y registro de actividad.
 */
export async function fetchAccountSecurityApi(): Promise<AccountSecurityResponse> {
  return accountRequest<AccountSecurityResponse>(
    "/api/account/security",
    { method: "GET" },
    "No se pudo cargar la información de seguridad.",
  );
}

/**
 * Cliente HTTP para revocar una sesión remota puntual.
 */
export async function revokeSessionApi(sessionId: string): Promise<RevokeSessionResponse> {
  return accountRequest<RevokeSessionResponse>(
    `/api/account/sessions/${encodeURIComponent(sessionId)}`,
    { method: "DELETE" },
    "No se pudo cerrar la sesión.",
  );
}

/**
 * Cliente HTTP para revocar todas las demás sesiones activas.
 */
export async function revokeOtherSessionsApi(): Promise<RevokeOtherSessionsResponse> {
  return accountRequest<RevokeOtherSessionsResponse>(
    "/api/account/sessions",
    { method: "DELETE" },
    "No se pudieron cerrar las demás sesiones.",
  );
}

/**
 * Cliente HTTP para cambiar la contraseña del usuario autenticado.
 * El servidor valida la contraseña actual, actualiza el hash y renueva la cookie de sesión.
 */
export async function changePasswordApi(dto: ChangePasswordBody): Promise<ChangePasswordResponse> {
  return accountRequest<ChangePasswordResponse>(
    "/api/account/password",
    { method: "PATCH", body: JSON.stringify(dto) },
    "Error al cambiar la contraseña.",
  );
}

/**
 * Cliente HTTP para actualizar el correo electrónico de la cuenta verificando la contraseña actual.
 */
export async function changeEmailApi(dto: ChangeEmailBody): Promise<ChangeEmailResponse> {
  return accountRequest<ChangeEmailResponse>(
    "/api/account/email",
    { method: "PATCH", body: JSON.stringify(dto) },
    "Error al actualizar el correo electrónico.",
  );
}

/**
 * Cliente HTTP para obtener las preferencias de notificación del usuario.
 */
export async function fetchNotificationPreferencesApi(): Promise<NotificationPreferences> {
  const json = await accountRequest<{ data: NotificationPreferences }>(
    "/api/account/notifications",
    { method: "GET", cache: "no-store" },
    "No se pudieron cargar las preferencias de notificación.",
  );
  return json.data;
}

/**
 * Cliente HTTP para actualizar las preferencias de notificación del usuario.
 */
export async function updateNotificationPreferencesApi(
  dto: UpdateNotificationsBody,
): Promise<NotificationPreferences> {
  const json = await accountRequest<{ data: NotificationPreferences }>(
    "/api/account/notifications",
    { method: "PATCH", body: JSON.stringify(dto) },
    "No se pudieron guardar las preferencias de notificación.",
  );
  return json.data;
}
