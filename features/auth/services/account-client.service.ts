/**
 * account-client.service.ts
 * Funciones de cliente (browser) para interactuar con la API de cuenta.
 * Este archivo NO importa Prisma ni módulos de servidor.
 */
import type {
  DeleteAccountBody,
  ProfileResponse,
  UpdateProfileBody,
  UserProfile,
} from "@/features/auth/types/auth.interface";

async function accountRequest<T>(
  url: string,
  init: RequestInit,
  fallbackError: string,
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
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
