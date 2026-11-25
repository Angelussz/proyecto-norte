/**
 * account-client.service.ts
 * Funciones de cliente (browser) para interactuar con la API de cuenta.
 * Este archivo NO importa Prisma ni módulos de servidor.
 */
import type {
  ProfileResponse,
  UpdateProfileBody,
  UserProfile,
} from "@/features/auth/types/auth.interface";

/**
 * Cliente HTTP para consultar el perfil completo.
 */
export async function fetchProfileApi(): Promise<UserProfile> {
  const res = await fetch("/api/account/profile", {
    method: "GET",
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error ?? "No se pudo obtener el perfil.");
  }

  const data: ProfileResponse = await res.json();
  return data.user;
}

/**
 * Cliente HTTP para actualizar los datos del perfil.
 */
export async function updateProfileApi(dto: UpdateProfileBody): Promise<UserProfile> {
  const res = await fetch("/api/account/profile", {
    method: "PATCH",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(dto),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error ?? "Error al actualizar el perfil.");
  }

  const data: ProfileResponse = await res.json();
  return data.user;
}
