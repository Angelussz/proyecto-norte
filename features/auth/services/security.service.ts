import { prisma } from "@/lib/prisma";
import { SESSION_MAX_AGE_MS } from "@/lib/session";
import { maskIpAddress, type RequestContext } from "@/lib/request-context";
import { AccountError } from "@/features/auth/services/account.service";
import type {
  AccountActivityEventType,
  AccountSecurityResponse,
  ActiveSessionItem,
  ActivityLogItem,
} from "@/features/auth/types/auth.interface";
import { sendEmail } from "@/lib/email.service";
import { newSessionEmail } from "@/lib/email-templates/new-session";

const TOUCH_INTERVAL_MS = 60_000;
const ACTIVITY_LIMIT = 15;

/**
 * Crea una sesión persistente en DB (devuelve su UUID para embeber como `jti`
 * en el JWT) y registra simultáneamente el evento de actividad inicial.
 */
export async function startAuthenticatedSession(
  userId: string,
  ctx: RequestContext,
  event: {
    eventType: Extract<AccountActivityEventType, "LOGIN_SUCCESS" | "LOGIN_GOOGLE" | "REGISTER">;
    title: string;
  },
): Promise<string> {
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS);

  const [session] = await prisma.$transaction([
    prisma.userSession.create({
      data: {
        user_id: userId,
        device_label: ctx.deviceLabel,
        ip_address: ctx.ipAddress,
        user_agent: ctx.userAgent,
        expires_at: expiresAt,
      },
      select: { id: true },
    }),
    prisma.accountActivityLog.create({
      data: {
        user_id: userId,
        event_type: event.eventType,
        title: event.title,
        metadata: ctx.deviceLabel,
        ip_address: ctx.ipAddress,
      },
    }),
  ]);

  // Enviar alerta de nuevo inicio de sesión para LOGIN_SUCCESS y LOGIN_GOOGLE (best-effort)
  // No se envía en REGISTER para no duplicar con el email de bienvenida.
  if (event.eventType === "LOGIN_SUCCESS" || event.eventType === "LOGIN_GOOGLE") {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { email: true, name: true, notif_security: true },
    });
    if (user?.notif_security) {
      const now = new Date().toLocaleString("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
      });
      const { html, subject } = newSessionEmail(user.name, {
        device: ctx.deviceLabel,
        ip: maskIpAddress(ctx.ipAddress),
        date: now,
      });
      await sendEmail({ to: user.email, subject, html }).catch(() => undefined);
    }
  }

  return session.id;
}

/**
 * Verifica que el `jti` de una cookie siga activo (no revocado y no expirado)
 * para ese usuario, y actualiza `last_active_at` de forma throttled (cada 60 s).
 */
export async function isSessionActiveAndTouch(userId: string, jti: string): Promise<boolean> {
  const now = new Date();
  const session = await prisma.userSession.findFirst({
    where: {
      id: jti,
      user_id: userId,
      revoked_at: null,
      expires_at: { gt: now },
    },
    select: { id: true, last_active_at: true },
  });

  if (!session) return false;

  if (now.getTime() - session.last_active_at.getTime() > TOUCH_INTERVAL_MS) {
    await prisma.userSession
      .update({
        where: { id: session.id },
        data: { last_active_at: now },
      })
      .catch(() => {
        // No bloquear lectura de sesión si el touch concurrente falla
      });
  }

  return true;
}

/**
 * Marca la sesión actual como revocada al hacer logout explícito.
 */
export async function revokeSessionById(userId: string, jti?: string): Promise<void> {
  if (!jti?.trim()) return;

  await prisma.userSession.updateMany({
    where: {
      id: jti,
      user_id: userId,
      revoked_at: null,
    },
    data: { revoked_at: new Date() },
  });
}

/**
 * Devuelve las sesiones activas y el historial reciente de actividad del usuario.
 */
export async function getAccountSecurity(
  userId: string,
  currentJti?: string,
): Promise<AccountSecurityResponse> {
  if (!userId?.trim()) {
    throw new AccountError("UNAUTHORIZED", "Sesión inválida.");
  }

  const now = new Date();

  const [rawSessions, rawActivities] = await Promise.all([
    prisma.userSession.findMany({
      where: {
        user_id: userId,
        revoked_at: null,
        expires_at: { gt: now },
      },
      orderBy: { last_active_at: "desc" },
      select: {
        id: true,
        device_label: true,
        ip_address: true,
        last_active_at: true,
        created_at: true,
      },
    }),
    prisma.accountActivityLog.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      take: ACTIVITY_LIMIT,
      select: {
        id: true,
        event_type: true,
        title: true,
        metadata: true,
        ip_address: true,
        created_at: true,
      },
    }),
  ]);

  const sessions: ActiveSessionItem[] = rawSessions
    .map((s) => ({
      id: s.id,
      deviceLabel: s.device_label,
      ipMasked: maskIpAddress(s.ip_address),
      lastActiveAt: s.last_active_at.toISOString(),
      createdAt: s.created_at.toISOString(),
      isCurrent: Boolean(currentJti && s.id === currentJti),
    }))
    // Asegurar que la sesión actual aparezca siempre primera
    .sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent));

  const activities: ActivityLogItem[] = rawActivities.map((a) => ({
    id: a.id,
    eventType: a.event_type,
    title: a.title,
    metadata: a.metadata,
    ipMasked: a.ip_address ? maskIpAddress(a.ip_address) : null,
    createdAt: a.created_at.toISOString(),
  }));

  return { sessions, activities };
}

/**
 * Revoca una sesión remota puntual del usuario autenticado y deja registro en auditoría.
 */
export async function revokeRemoteSession(
  userId: string,
  sessionId: string,
  currentJti?: string,
  ipAddress?: string,
): Promise<{ revokedId: string }> {
  if (!userId?.trim()) {
    throw new AccountError("UNAUTHORIZED", "Sesión inválida.");
  }

  if (!sessionId?.trim()) {
    throw new AccountError("VALIDATION", "ID de sesión inválido.");
  }

  if (currentJti && sessionId === currentJti) {
    throw new AccountError(
      "VALIDATION",
      "No puedes cerrar tu sesión actual desde aquí. Usa el botón Cerrar sesión del menú.",
    );
  }

  const now = new Date();
  const target = await prisma.userSession.findFirst({
    where: {
      id: sessionId,
      user_id: userId,
      revoked_at: null,
      expires_at: { gt: now },
    },
    select: { id: true, device_label: true },
  });

  if (!target) {
    throw new AccountError("NOT_FOUND", "La sesión no existe o ya fue cerrada.");
  }

  await prisma.$transaction([
    prisma.userSession.updateMany({
      where: {
        id: target.id,
        user_id: userId,
        revoked_at: null,
      },
      data: { revoked_at: now },
    }),
    prisma.accountActivityLog.create({
      data: {
        user_id: userId,
        event_type: "SESSION_REVOKED",
        title: "Sesión remota cerrada",
        metadata: target.device_label,
        ip_address: ipAddress ?? null,
      },
    }),
  ]);

  return { revokedId: target.id };
}

/**
 * Cierra todas las sesiones activas del usuario excepto la sesión actual (`currentJti`).
 */
export async function revokeAllOtherSessions(
  userId: string,
  currentJti?: string,
  ipAddress?: string,
): Promise<{ revokedCount: number }> {
  if (!userId?.trim()) {
    throw new AccountError("UNAUTHORIZED", "Sesión inválida.");
  }

  const now = new Date();

  const revokedCount = await prisma.$transaction(async (tx) => {
    const result = await tx.userSession.updateMany({
      where: {
        user_id: userId,
        revoked_at: null,
        expires_at: { gt: now },
        ...(currentJti ? { id: { not: currentJti } } : {}),
      },
      data: { revoked_at: now },
    });

    if (result.count > 0) {
      await tx.accountActivityLog.create({
        data: {
          user_id: userId,
          event_type: "SESSIONS_REVOKED_ALL",
          title: "Sesiones en otros dispositivos cerradas",
          metadata: result.count === 1 ? "1 sesión cerrada" : `${result.count} sesiones cerradas`,
          ip_address: ipAddress ?? null,
        },
      });
    }

    return result.count;
  });

  return { revokedCount };
}
