import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { env } from "@/lib/env";
import { verifyToken, SESSION_COOKIE_NAME } from "@/lib/session";
import type { JwtPayload } from "@/features/auth/types/auth.interface";

export class AdminAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminAuthError";
  }
}

/**
 * Guard de rutas admin por token compartido (header `x-admin-token`).
 * Falla cerrado: si ADMIN_API_TOKEN no está configurado, deniega todo.
 * Comparación en tiempo constante para no filtrar el secreto por timing.
 */
export function requireAdminToken(req: Request): void {
  const expected = env.ADMIN_API_TOKEN;
  if (!expected) throw new AdminAuthError("ADMIN_API_TOKEN no está configurado");

  const given = req.headers.get("x-admin-token") ?? "";
  const givenBuf = Buffer.from(given);
  const expectedBuf = Buffer.from(expected);
  if (givenBuf.length !== expectedBuf.length || !timingSafeEqual(givenBuf, expectedBuf)) {
    throw new AdminAuthError("Token de administración inválido");
  }
}

/**
 * Autentica al administrador verificando:
 * 1. Cookie HTTP-only de sesión (`norte_session`) con rol ADMIN.
 * 2. O header `x-admin-token` para scripts/CLI.
 * Lanza `AdminAuthError` si ninguna credencial es válida.
 */
export async function requireAdminUser(
  req: Request | NextRequest,
): Promise<JwtPayload | { sub: string; email: string; name: string; role: "ADMIN" }> {
  // 1. Probar por cookie de sesión
  let sessionToken: string | undefined;

  if ("cookies" in req && typeof (req as NextRequest).cookies?.get === "function") {
    sessionToken = (req as NextRequest).cookies.get(SESSION_COOKIE_NAME)?.value;
  } else {
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]*)`));
      if (match) {
        sessionToken = decodeURIComponent(match[1]);
      }
    }
  }

  if (sessionToken) {
    try {
      const payload = await verifyToken(sessionToken);
      if (payload.role === "ADMIN") {
        return payload;
      }
    } catch {
      // Ignorar fallo de verificación y probar header
    }
  }

  // 2. Probar por token de API
  try {
    requireAdminToken(req);
    return {
      sub: "system-admin-token",
      email: "admin@system",
      name: "System Admin",
      role: "ADMIN",
    };
  } catch {
    throw new AdminAuthError("No autorizado: se requiere rol ADMIN");
  }
}
