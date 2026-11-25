import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  verifyToken,
  signToken,
  SESSION_COOKIE_NAME,
  getSessionCookieOptions,
} from "@/lib/session";
import {
  getUserProfile,
  updateUserProfile,
  AccountError,
} from "@/features/auth/services/account.service";
import type { JwtPayload, UpdateProfileBody } from "@/features/auth/types/auth.interface";

const NO_STORE = { "Cache-Control": "no-store" } as const;

const ACCOUNT_ERROR_STATUS: Record<AccountError["code"], number> = {
  VALIDATION: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
};

const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres.").max(100),
    lastName: z.string().trim().min(2, "El apellido debe tener al menos 2 caracteres.").max(100),
    phone: z.string().trim().max(30).optional().default(""),
  })
  .strict();

/**
 * Lee y verifica el JWT de la cookie de sesión.
 * Devuelve el payload o una respuesta 401 si falta o es inválido/expirado.
 */
async function requireSession(
  req: NextRequest,
): Promise<{ payload: JwtPayload } | { errorResponse: NextResponse }> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return {
      errorResponse: NextResponse.json(
        { error: "No autenticado" },
        { status: 401, headers: NO_STORE },
      ),
    };
  }

  try {
    const payload = await verifyToken(token);
    return { payload };
  } catch {
    return {
      errorResponse: NextResponse.json(
        { error: "Sesión inválida o expirada" },
        { status: 401, headers: NO_STORE },
      ),
    };
  }
}

function handleRouteError(error: unknown, label: string, fallbackMessage: string): NextResponse {
  if (error instanceof AccountError) {
    return NextResponse.json(
      { error: error.message },
      { status: ACCOUNT_ERROR_STATUS[error.code] || 500, headers: NO_STORE },
    );
  }

  console.error(label, error);
  return NextResponse.json({ error: fallbackMessage }, { status: 500, headers: NO_STORE });
}

/**
 * GET /api/account/profile
 * Devuelve el perfil completo del usuario autenticado directamente desde PostgreSQL.
 */
export async function GET(req: NextRequest) {
  const auth = await requireSession(req);
  if ("errorResponse" in auth) return auth.errorResponse;

  try {
    const user = await getUserProfile(auth.payload.sub);
    return NextResponse.json({ user }, { status: 200, headers: NO_STORE });
  } catch (error) {
    return handleRouteError(error, "[GET /api/account/profile]", "Error interno del servidor");
  }
}

/**
 * PATCH /api/account/profile
 * Actualiza nombre, apellido y teléfono del usuario autenticado.
 * Actualiza también la cookie de sesión para reflejar el nuevo nombre sin forzar re-login.
 */
export async function PATCH(req: NextRequest) {
  const auth = await requireSession(req);
  if ("errorResponse" in auth) return auth.errorResponse;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Formato de cuerpo JSON inválido" },
      { status: 400, headers: NO_STORE },
    );
  }

  const parseResult = updateProfileSchema.safeParse(body);
  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0]?.message ?? "Datos inválidos";
    return NextResponse.json({ error: firstError }, { status: 400, headers: NO_STORE });
  }

  try {
    const { user, updatedPayload } = await updateUserProfile(
      auth.payload.sub,
      parseResult.data as UpdateProfileBody,
    );

    const newToken = await signToken(updatedPayload);
    const cookieOpts = getSessionCookieOptions();

    const response = NextResponse.json({ user }, { status: 200, headers: NO_STORE });
    response.cookies.set({
      name: cookieOpts.name,
      value: newToken,
      maxAge: cookieOpts.maxAge,
      httpOnly: cookieOpts.httpOnly,
      secure: cookieOpts.secure,
      sameSite: cookieOpts.sameSite,
      path: cookieOpts.path,
    });

    return response;
  } catch (error) {
    return handleRouteError(
      error,
      "[PATCH /api/account/profile]",
      "Error interno al actualizar el perfil",
    );
  }
}
