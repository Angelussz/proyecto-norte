import { verifyToken, SESSION_COOKIE_NAME } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminAuthError } from "@/lib/admin-auth";

export interface AdminSessionUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN";
}

/**
 * Exige una sesión humana válida y comprueba los privilegios
 * actuales del administrador directamente en PostgreSQL.
 *
 * No acepta ADMIN_API_TOKEN como alternativa.
 */
export async function requireAdminSessionUser(req: Request): Promise<AdminSessionUser> {
  const cookieHeader = req.headers.get("cookie");

  const sessionCookie = cookieHeader
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${SESSION_COOKIE_NAME}=`));

  if (!sessionCookie) {
    throw new AdminAuthError("No autorizado: se requiere una sesión ADMIN");
  }

  let token: string;

  try {
    token = decodeURIComponent(sessionCookie.slice(SESSION_COOKIE_NAME.length + 1));
  } catch {
    throw new AdminAuthError("Sesión inválida");
  }

  let payload;

  try {
    payload = await verifyToken(token);
  } catch {
    throw new AdminAuthError("Sesión inválida o expirada");
  }

  const user = await prisma.users.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      suspended_until: true,
      deleted_at: true,
    },
  });

  if (!user || user.deleted_at) {
    throw new AdminAuthError("La cuenta no está disponible");
  }

  if (user.suspended_until && user.suspended_until > new Date()) {
    throw new AdminAuthError("La cuenta está suspendida");
  }

  if (user.role !== "ADMIN") {
    throw new AdminAuthError("No autorizado: se requiere rol ADMIN");
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: "ADMIN",
  };
}
