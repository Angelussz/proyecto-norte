/**
 * Contratos de tipos del dominio de autenticación.
 * Solo tipos puros — sin lógica ni datos de ejemplo.
 */

// ─── Payload embebido en el JWT ────────────────────────────────────────────────
// Lo que firmamos al crear el token; también lo que leemos al verificarlo.
export interface JwtPayload {
  sub: string;      // ID del usuario (subject → estándar JWT)
  email: string;
  name: string;     // nombre para mostrarlo en el header sin ir a la DB
  picture?: string; // URL del avatar (viene de Google; puede no existir)
  role: "ADMIN" | "CUSTOMER";
  iat?: number;     // issued at  (lo agrega jose automáticamente)
  exp?: number;     // expiration (lo agrega jose automáticamente)
}

// ─── Respuesta pública del endpoint POST /api/auth/login ──────────────────────
export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    picture?: string;
    role: "ADMIN" | "CUSTOMER";
  };
}

// ─── Sesión pública (respuesta de GET /api/auth/me) ───────────────────────────
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role: "ADMIN" | "CUSTOMER";
}

// ─── Body esperado en el endpoint ────────────────────────────────────────────
export interface LoginBody {
  email: string;
  password: string;
}
