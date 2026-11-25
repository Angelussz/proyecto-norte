import { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";
import { verifyToken, SESSION_COOKIE_NAME, getSessionCookieOptions } from "@/lib/session";
import { AccountError } from "@/features/auth/services/account.service";
import type { JwtPayload } from "@/features/auth/types/auth.interface";

export const NO_STORE_HEADERS = { "Cache-Control": "no-store" } as const;

const ACCOUNT_ERROR_STATUS: Record<AccountError["code"], number> = {
  VALIDATION: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
};

/**
 * Lee y verifica el JWT de la cookie de sesión.
 * Devuelve el payload o una respuesta 401 si falta o es inválido/expirado.
 */
export async function requireAccountSession(
  req: NextRequest,
): Promise<{ payload: JwtPayload } | { errorResponse: NextResponse }> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return {
      errorResponse: NextResponse.json(
        { error: "No autenticado" },
        { status: 401, headers: NO_STORE_HEADERS },
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
        { status: 401, headers: NO_STORE_HEADERS },
      ),
    };
  }
}

/**
 * Parsea el cuerpo JSON y lo valida contra un esquema Zod.
 * Devuelve los datos validados o una respuesta 400 con el primer error.
 */
export async function parseAccountBody<T>(
  req: NextRequest,
  schema: z.ZodType<T>,
): Promise<{ data: T } | { errorResponse: NextResponse }> {
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return {
      errorResponse: NextResponse.json(
        { error: "Formato de cuerpo JSON inválido" },
        { status: 400, headers: NO_STORE_HEADERS },
      ),
    };
  }

  const parsed = schema.safeParse(rawBody);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return {
      errorResponse: NextResponse.json(
        { error: firstError },
        { status: 400, headers: NO_STORE_HEADERS },
      ),
    };
  }

  return { data: parsed.data };
}

/**
 * Mapea `AccountError` al código HTTP correspondiente y captura errores inesperados.
 */
export function handleAccountRouteError(
  error: unknown,
  scope: string,
  fallbackMessage: string,
): NextResponse {
  if (error instanceof AccountError) {
    return NextResponse.json(
      { error: error.message },
      { status: ACCOUNT_ERROR_STATUS[error.code] || 500, headers: NO_STORE_HEADERS },
    );
  }

  console.error(scope, error);
  return NextResponse.json({ error: fallbackMessage }, { status: 500, headers: NO_STORE_HEADERS });
}

/**
 * Adjunta la cookie de sesión JWT con las opciones estándar del proyecto.
 */
export function setSessionCookie(response: NextResponse, token: string): void {
  const cookieOpts = getSessionCookieOptions();
  response.cookies.set({
    name: cookieOpts.name,
    value: token,
    maxAge: cookieOpts.maxAge,
    httpOnly: cookieOpts.httpOnly,
    secure: cookieOpts.secure,
    sameSite: cookieOpts.sameSite,
    path: cookieOpts.path,
  });
}

/**
 * Elimina la cookie de sesión del navegador (maxAge = 0).
 */
export function clearSessionCookie(response: NextResponse): void {
  const cookieOpts = getSessionCookieOptions(0);
  response.cookies.set({
    name: cookieOpts.name,
    value: "",
    maxAge: 0,
    httpOnly: cookieOpts.httpOnly,
    secure: cookieOpts.secure,
    sameSite: cookieOpts.sameSite,
    path: cookieOpts.path,
  });
}
