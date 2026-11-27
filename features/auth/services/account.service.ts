import { compare, hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type {
  ChangeEmailBody,
  ChangePasswordBody,
  DeleteAccountBody,
  JwtPayload,
  UpdateProfileBody,
  UserProfile,
} from "@/features/auth/types/auth.interface";
import { revokeAllOtherSessions } from "@/features/auth/services/security.service";
import { validateNewPasswordStrength } from "@/features/auth/lib/password-rules";
import { cleanupStoredAvatar } from "@/features/auth/lib/avatar-storage";
import { buildDeletedEmail, isDeletedEmail } from "@/features/auth/lib/deleted-account";
import { sendEmail } from "@/lib/email.service";
import { passwordChangedEmail } from "@/lib/email-templates/password-changed";
import { emailChangedEmail } from "@/lib/email-templates/email-changed";
import { accountClosedEmail } from "@/lib/email-templates/account-closed";

export function mapUserRecordToProfile(user: {
  id: string;
  email: string;
  name: string;
  last_name: string;
  phone: string;
  picture_url: string | null;
  role: "ADMIN" | "CUSTOMER";
  email_verified: boolean;
  password_hash: string;
  created_at: Date;
}): UserProfile {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    last_name: user.last_name,
    phone: user.phone,
    picture: user.picture_url ?? undefined,
    role: user.role,
    email_verified: user.email_verified,
    has_password: Boolean(user.password_hash),
    created_at: user.created_at.toISOString(),
  };
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
      password_hash: true,
      created_at: true,
    },
  });

  if (!user || isDeletedEmail(user.email)) {
    throw new AccountError("NOT_FOUND", "Usuario no encontrado.");
  }

  return mapUserRecordToProfile(user);
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
        password_hash: true,
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

  const userProfile = mapUserRecordToProfile(updated);

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
 * Anonimiza la cuenta de un usuario CUSTOMER tras verificar su contraseña
 * (o directamente por sesión verificada en cuentas Google-only sin contraseña).
 *
 * Se anonimiza en lugar de borrar físicamente porque `Orders.user_id` usa
 * `onDelete: Restrict`, preservando la integridad referencial de pedidos
 * históricos mientras se eliminan datos personales identificables (RGPD),
 * su fotografía almacenada, suscripciones a notificaciones, sesiones activas
 * y direcciones guardadas sin pedidos asociados.
 *
 * Registra el evento `ACCOUNT_CLOSED` en `AccountActivityLog` junto con
 * motivo/feedback (si se brindaron) e IP de la solicitud.
 */
export async function closeUserAccount(
  userId: string,
  data: DeleteAccountBody,
  context?: { ipAddress?: string },
): Promise<void> {
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
      picture_url: true,
      picture_id: true,
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

  if (user.password_hash) {
    // Cuenta con contraseña: verificar que sea correcta antes de proceder
    if (!data.password) {
      throw new AccountError(
        "UNAUTHORIZED",
        "La contraseña es obligatoria para confirmar el cierre.",
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
  } else if (data.password) {
    throw new AccountError(
      "UNAUTHORIZED",
      "Esta cuenta inicia sesión con Google y no requiere contraseña.",
    );
  }
  // Cuenta Google-only (sin password_hash): se permite sin verificación de contraseña

  const reasonText = data.reason?.trim();
  const feedbackText = data.feedback?.trim();
  const closureMetadata =
    reasonText && feedbackText
      ? `${reasonText} | ${feedbackText}`
      : reasonText || feedbackText || null;

  // Transacción interactiva — orden garantizado:
  // 1. Eliminar direcciones sin pedidos (antes de anonimizar el user_id)
  // 2. Revocar sesiones activas
  // 3. Registrar el evento de cierre
  // 4. Anonimizar el registro del usuario y apagar notificaciones (último, respeta FK constraints)
  await prisma.$transaction(async (tx) => {
    await tx.address.deleteMany({
      where: {
        user_id: userId,
        orders: { none: {} },
      },
    });

    await tx.userSession.updateMany({
      where: {
        user_id: userId,
        revoked_at: null,
      },
      data: { revoked_at: new Date() },
    });

    await tx.accountActivityLog.create({
      data: {
        user_id: userId,
        event_type: "ACCOUNT_CLOSED",
        title: "Cuenta cerrada y anonimizada",
        metadata: closureMetadata,
        ip_address: context?.ipAddress ?? null,
      },
    });

    await tx.users.update({
      where: { id: userId },
      data: {
        name: "Usuario",
        last_name: "Eliminado",
        email: buildDeletedEmail(userId),
        phone: "",
        password_hash: "",
        picture_url: null,
        picture_id: null,
        email_verified: false,
        email_verified_at: null,
        notif_orders: false,
        notif_promotions: false,
        notif_newsletter: false,
        notif_restock: false,
      },
    });
  });

  // Limpiar archivo local o recurso de Cloudinary después del commit exitoso
  await cleanupStoredAvatar(user.picture_url, user.picture_id);

  // Enviar email de confirmación de cierre (best-effort, no bloquea la respuesta)
  const { html, subject } = accountClosedEmail(user.email.split("@")[0]);
  await sendEmail({ to: user.email, subject, html }).catch(() => undefined);
}

// ---------------------------------------------------------------------------
// Cambiar contraseña
// ---------------------------------------------------------------------------

/**
 * Actualiza la contraseña del usuario autenticado.
 * - Verifica que la cuenta no esté cerrada.
 * - Verifica que la cuenta tenga contraseña (no sea Google-only).
 * - Valida la contraseña actual con bcryptjs.
 * - Hashea la nueva contraseña y la guarda en DB.
 * - Registra el evento PASSWORD_CHANGED en AccountActivityLog.
 * - Revoca todas las demás sesiones activas para forzar nuevo login en otros dispositivos.
 * - Retorna el payload JWT actualizado para renovar la cookie en el endpoint.
 */
export async function changeUserPassword(
  userId: string,
  data: ChangePasswordBody,
  context?: { jti?: string; ipAddress?: string; deviceLabel?: string },
): Promise<{ updatedPayload: JwtPayload; revokedOtherSessions: number }> {
  if (!userId?.trim()) {
    throw new AccountError("UNAUTHORIZED", "Sesión inválida.");
  }

  if (!data.currentPassword) {
    throw new AccountError("VALIDATION", "La contraseña actual es requerida.");
  }

  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      picture_url: true,
      role: true,
      password_hash: true,
    },
  });

  if (!user || isDeletedEmail(user.email)) {
    throw new AccountError("NOT_FOUND", "Usuario no encontrado.");
  }

  if (!user.password_hash) {
    throw new AccountError(
      "UNAUTHORIZED",
      "Esta cuenta usa Google para iniciar sesión. No tiene contraseña configurada.",
    );
  }

  let currentMatches = false;
  try {
    currentMatches = await compare(data.currentPassword, user.password_hash);
  } catch {
    currentMatches = false;
  }

  if (!currentMatches) {
    throw new AccountError("UNAUTHORIZED", "La contraseña actual es incorrecta.");
  }

  const strengthError = validateNewPasswordStrength(data.newPassword);
  if (strengthError) {
    throw new AccountError("VALIDATION", strengthError);
  }

  const isSamePassword = await compare(data.newPassword, user.password_hash).catch(() => false);
  if (isSamePassword) {
    throw new AccountError("VALIDATION", "La nueva contraseña debe ser diferente a la actual.");
  }

  const newHash = await hash(data.newPassword, 10);

  await prisma.$transaction([
    prisma.users.update({
      where: { id: userId },
      data: { password_hash: newHash },
    }),
    prisma.accountActivityLog.create({
      data: {
        user_id: userId,
        event_type: "PASSWORD_CHANGED",
        title: "Contraseña actualizada",
        metadata: context?.deviceLabel ?? "Portal Web",
        ip_address: context?.ipAddress ?? null,
      },
    }),
  ]);

  // Revocar todas las demás sesiones activas (excepto la actual)
  const { revokedCount } = await revokeAllOtherSessions(userId, context?.jti, context?.ipAddress);

  const updatedPayload: JwtPayload = {
    sub: user.id,
    ...(context?.jti ? { jti: context.jti } : {}),
    email: user.email,
    name: user.name,
    picture: user.picture_url ?? undefined,
    role: user.role,
  };

  // Enviar alerta de cambio de contraseña (best-effort)
  const now = new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" });
  const { html, subject } = passwordChangedEmail(user.name, {
    device: context?.deviceLabel ?? "Portal Web",
    ip: context?.ipAddress ? context.ipAddress.replace(/\.\d+$/, ".xxx") : "desconocida",
    date: now,
  });
  await sendEmail({ to: user.email, subject, html }).catch(() => undefined);

  return { updatedPayload, revokedOtherSessions: revokedCount };
}

// ---------------------------------------------------------------------------
// Cambiar correo electrónico
// ---------------------------------------------------------------------------

/**
 * Actualiza el correo electrónico de una cuenta con contraseña tras verificarla.
 * - Rechaza cuentas Google-only (sin `password_hash`).
 * - Comprueba disponibilidad del nuevo email (409 Conflict si ya existe).
 * - Actualiza el email, registra EMAIL_CHANGED y revoca las demás sesiones activas.
 * - Retorna el perfil y payload JWT actualizados para renovar la cookie manteniendo el `jti`.
 */
export async function changeUserEmail(
  userId: string,
  data: ChangeEmailBody,
  context?: { jti?: string; ipAddress?: string; deviceLabel?: string },
): Promise<{ user: UserProfile; updatedPayload: JwtPayload; revokedOtherSessions: number }> {
  if (!userId?.trim()) {
    throw new AccountError("UNAUTHORIZED", "Sesión inválida.");
  }

  const normalizedNewEmail = data.newEmail?.trim().toLowerCase();
  if (!normalizedNewEmail) {
    throw new AccountError("VALIDATION", "El nuevo correo electrónico es obligatorio.");
  }

  if (!data.password) {
    throw new AccountError("VALIDATION", "Debes confirmar tu contraseña actual.");
  }

  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      password_hash: true,
    },
  });

  if (!user || isDeletedEmail(user.email)) {
    throw new AccountError("NOT_FOUND", "Usuario no encontrado.");
  }

  if (!user.password_hash) {
    throw new AccountError(
      "UNAUTHORIZED",
      "Esta cuenta inicia sesión con Google. El correo se gestiona desde tu cuenta de Google.",
    );
  }

  let passwordMatches = false;
  try {
    passwordMatches = await compare(data.password, user.password_hash);
  } catch {
    passwordMatches = false;
  }

  if (!passwordMatches) {
    throw new AccountError("UNAUTHORIZED", "La contraseña actual es incorrecta.");
  }

  if (normalizedNewEmail === user.email.toLowerCase()) {
    throw new AccountError(
      "VALIDATION",
      "El nuevo correo electrónico debe ser diferente al actual.",
    );
  }

  const emailOwner = await prisma.users.findUnique({
    where: { email: normalizedNewEmail },
    select: { id: true },
  });

  if (emailOwner && emailOwner.id !== userId) {
    throw new AccountError("CONFLICT", "Ya existe una cuenta registrada con ese correo.");
  }

  let updated;
  try {
    const [updatedUser] = await prisma.$transaction([
      prisma.users.update({
        where: { id: userId },
        data: {
          email: normalizedNewEmail,
          email_verified: false,
          email_verified_at: null,
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
          password_hash: true,
          created_at: true,
        },
      }),
      prisma.accountActivityLog.create({
        data: {
          user_id: userId,
          event_type: "EMAIL_CHANGED",
          title: "Correo electrónico actualizado",
          metadata: context?.deviceLabel ?? "Portal Web",
          ip_address: context?.ipAddress ?? null,
        },
      }),
    ]);
    updated = updatedUser;
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      throw new AccountError("CONFLICT", "Ya existe una cuenta registrada con ese correo.");
    }
    throw error;
  }

  const { revokedCount } = await revokeAllOtherSessions(userId, context?.jti, context?.ipAddress);

  const userProfile = mapUserRecordToProfile(updated);
  const updatedPayload: JwtPayload = {
    sub: updated.id,
    ...(context?.jti ? { jti: context.jti } : {}),
    email: updated.email,
    name: updated.name,
    picture: updated.picture_url ?? undefined,
    role: updated.role,
  };

  // Enviar alerta de cambio de email al correo ANTERIOR (best-effort)
  const now = new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" });
  const { html, subject } = emailChangedEmail(updated.name, normalizedNewEmail, {
    device: context?.deviceLabel ?? "Portal Web",
    ip: context?.ipAddress ? context.ipAddress.replace(/\.\d+$/, ".xxx") : "desconocida",
    date: now,
  });
  // Se envía a normalizedNewEmail porque es el correo que ya fue persistido;
  // en un flujo real de verificación se enviaría al correo anterior para confirmar el cambio.
  await sendEmail({ to: normalizedNewEmail, subject, html }).catch(() => undefined);

  return { user: userProfile, updatedPayload, revokedOtherSessions: revokedCount };
}

// ─── Preferencias de Notificaciones ──────────────────────────────────────────

type NotifPrefsData = {
  notif_orders: boolean;
  notif_promotions: boolean;
  notif_newsletter: boolean;
  notif_restock: boolean;
};

/**
 * Obtiene las preferencias de notificación del usuario.
 * notif_security siempre es true (campo protegido del sistema).
 */
export async function getNotificationPreferences(userId: string) {
  if (!userId?.trim()) {
    throw new AccountError("UNAUTHORIZED", "Sesión inválida.");
  }

  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      email: true,
      notif_orders: true,
      notif_promotions: true,
      notif_newsletter: true,
      notif_restock: true,
      notif_security: true,
    },
  });

  if (!user || isDeletedEmail(user.email)) {
    throw new AccountError("NOT_FOUND", "Usuario no encontrado.");
  }

  return {
    notif_orders: user.notif_orders,
    notif_promotions: user.notif_promotions,
    notif_newsletter: user.notif_newsletter,
    notif_restock: user.notif_restock,
    notif_security: user.notif_security,
  };
}

/**
 * Actualiza las preferencias de notificación del usuario.
 * notif_security no es editable por el usuario.
 */
export async function updateNotificationPreferences(userId: string, data: NotifPrefsData) {
  if (!userId?.trim()) {
    throw new AccountError("UNAUTHORIZED", "Sesión inválida.");
  }

  const existing = await prisma.users.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });

  if (!existing || isDeletedEmail(existing.email)) {
    throw new AccountError("NOT_FOUND", "Usuario no encontrado.");
  }

  const updated = await prisma.users.update({
    where: { id: userId },
    data: {
      notif_orders: data.notif_orders,
      notif_promotions: data.notif_promotions,
      notif_newsletter: data.notif_newsletter,
      notif_restock: data.notif_restock,
      // notif_security no se toca — siempre permanece true
    },
    select: {
      notif_orders: true,
      notif_promotions: true,
      notif_newsletter: true,
      notif_restock: true,
      notif_security: true,
    },
  });
  return updated;
}
