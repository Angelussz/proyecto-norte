import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type {
  DeleteAccountBody,
  JwtPayload,
  UpdateProfileBody,
  UserProfile,
} from "@/features/auth/types/auth.interface";

const DELETED_EMAIL_SUFFIX = "@norte.invalid";

function isDeletedEmail(email: string): boolean {
  return email.endsWith(DELETED_EMAIL_SUFFIX);
}

export class AccountError extends Error {
  constructor(
    public readonly code: "VALIDATION" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "CONFLICT",
    message: string,
  ) {
    super(message);
    this.name = "AccountError";
  }
}

// ─── Funciones del servidor (acceso a DB y lógica de negocio) ──────────────────

/**
 * Obtiene el perfil completo de un usuario activo por su ID.
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

  if (!user || isDeletedEmail(user.email)) {
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
  context?: { jti?: string; ipAddress?: string },
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
      email: true,
    },
  });

  if (!existing || isDeletedEmail(existing.email)) {
    throw new AccountError("NOT_FOUND", "Usuario no encontrado.");
  }

  const [updated] = await prisma.$transaction([
    prisma.users.update({
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
    }),
    prisma.accountActivityLog.create({
      data: {
        user_id: userId,
        event_type: "PROFILE_UPDATED",
        title: "Datos de perfil actualizados",
        metadata: "Portal Web",
        ip_address: context?.ipAddress ?? null,
      },
    }),
  ]);

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
    ...(context?.jti ? { jti: context.jti } : {}),
    email: updated.email,
    name: updated.name,
    picture: updated.picture_url ?? undefined,
    role: updated.role,
  };

  return {
    user: userProfile,
    updatedPayload,
  };
}

/**
 * Anonimiza la cuenta de un usuario CUSTOMER tras verificar su contraseña.
 *
 * Se anonimiza en lugar de borrar físicamente porque `Orders.user_id` usa
 * `onDelete: Restrict`, preservando la integridad referencial de pedidos
 * históricos mientras se eliminan datos personales identificables (RGPD)
 * y direcciones guardadas sin pedidos asociados.
 *
 * Nota: `reason` y `feedback` no se persisten en DB porque el schema actual
 * no define tabla de bajas ni columnas de auditoría en `Users`.
 */
export async function closeUserAccount(userId: string, data: DeleteAccountBody): Promise<void> {
  if (!userId?.trim()) {
    throw new AccountError("UNAUTHORIZED", "Sesión inválida.");
  }

  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      password_hash: true,
    },
  });

  if (!user || isDeletedEmail(user.email)) {
    throw new AccountError("NOT_FOUND", "Usuario no encontrado.");
  }

  if (user.role === "ADMIN") {
    throw new AccountError(
      "FORBIDDEN",
      "Las cuentas de administrador no pueden eliminarse desde este panel.",
    );
  }

  if (!user.password_hash) {
    throw new AccountError(
      "UNAUTHORIZED",
      "Esta cuenta usa Google para iniciar sesión. No tiene contraseña configurada.",
    );
  }

  let passwordMatches = false;
  try {
    passwordMatches = await compare(data.password, user.password_hash);
  } catch {
    passwordMatches = false;
  }

  if (!passwordMatches) {
    throw new AccountError("UNAUTHORIZED", "La contraseña introducida es incorrecta.");
  }

  await prisma.$transaction([
    prisma.address.deleteMany({
      where: {
        user_id: userId,
        orders: { none: {} },
      },
    }),
    prisma.userSession.updateMany({
      where: {
        user_id: userId,
        revoked_at: null,
      },
      data: { revoked_at: new Date() },
    }),
    prisma.accountActivityLog.create({
      data: {
        user_id: userId,
        event_type: "ACCOUNT_CLOSED",
        title: "Cuenta cerrada y anonimizada",
        metadata: data.reason ?? null,
      },
    }),
    prisma.users.update({
      where: { id: userId },
      data: {
        name: "Usuario",
        last_name: "Eliminado",
        email: `deleted_${userId}${DELETED_EMAIL_SUFFIX}`,
        phone: "",
        password_hash: "",
        picture_url: null,
        email_verified: false,
        email_verified_at: null,
      },
    }),
  ]);
}
