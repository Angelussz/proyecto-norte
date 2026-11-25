import { prisma } from "@/lib/prisma";
import type {
  JwtPayload,
  UpdateProfileBody,
  UserProfile,
} from "@/features/auth/types/auth.interface";

export class AccountError extends Error {
  constructor(
    public readonly code: "VALIDATION" | "UNAUTHORIZED" | "NOT_FOUND" | "CONFLICT",
    message: string,
  ) {
    super(message);
    this.name = "AccountError";
  }
}

// ─── Funciones del servidor (acceso a DB y lógica de negocio) ──────────────────

/**
 * Obtiene el perfil completo de un usuario por su ID.
 */
export async function getUserProfile(userId: string): Promise<UserProfile> {
  if (!userId?.trim()) {
    throw new AccountError("UNAUTHORIZED", "Sesión inválida.");
  }

  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      last_name: true,
      phone: true,
      picture_url: true,
      role: true,
      email_verified: true,
      created_at: true,
    },
  });

  if (!user) {
    throw new AccountError("NOT_FOUND", "Usuario no encontrado.");
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    last_name: user.last_name,
    phone: user.phone,
    picture: user.picture_url ?? undefined,
    role: user.role,
    email_verified: user.email_verified,
    created_at: user.created_at.toISOString(),
  };
}

/**
 * Actualiza el perfil del usuario (nombre, apellido, teléfono).
 * Valida los datos y devuelve el perfil actualizado junto con el nuevo payload JWT.
 */
export async function updateUserProfile(
  userId: string,
  data: UpdateProfileBody,
): Promise<{ user: UserProfile; updatedPayload: JwtPayload }> {
  if (!userId?.trim()) {
    throw new AccountError("UNAUTHORIZED", "Sesión inválida.");
  }

  const trimmedName = data.name?.trim();
  const trimmedLastName = data.lastName?.trim();
  const trimmedPhone = data.phone?.trim() ?? "";

  if (!trimmedName || trimmedName.length < 2) {
    throw new AccountError("VALIDATION", "El nombre debe tener al menos 2 caracteres.");
  }

  if (!trimmedLastName || trimmedLastName.length < 2) {
    throw new AccountError("VALIDATION", "El apellido debe tener al menos 2 caracteres.");
  }

  const existing = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
    },
  });

  if (!existing) {
    throw new AccountError("NOT_FOUND", "Usuario no encontrado.");
  }

  const updated = await prisma.users.update({
    where: { id: userId },
    data: {
      name: trimmedName,
      last_name: trimmedLastName,
      phone: trimmedPhone,
    },
    select: {
      id: true,
      email: true,
      name: true,
      last_name: true,
      phone: true,
      picture_url: true,
      role: true,
      email_verified: true,
      created_at: true,
    },
  });

  const userProfile: UserProfile = {
    id: updated.id,
    email: updated.email,
    name: updated.name,
    last_name: updated.last_name,
    phone: updated.phone,
    picture: updated.picture_url ?? undefined,
    role: updated.role,
    email_verified: updated.email_verified,
    created_at: updated.created_at.toISOString(),
  };

  const updatedPayload: JwtPayload = {
    sub: updated.id,
    email: updated.email,
    name: `${updated.name} ${updated.last_name}`.trim(),
    picture: updated.picture_url ?? undefined,
    role: updated.role,
  };

  return {
    user: userProfile,
    updatedPayload,
  };
}
