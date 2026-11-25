/**
 * Contratos de tipos del dominio de autenticación.
 * Solo tipos puros — sin lógica ni datos de ejemplo.
 */

// ─── Payload embebido en el JWT ────────────────────────────────────────────────
// Lo que firmamos al crear el token; también lo que leemos al verificarlo.
export interface JwtPayload {
  sub: string; // ID del usuario (subject → estándar JWT)
  jti?: string; // ID único de la sesión en UserSession (opcional para compatibilidad)
  email: string;
  name: string; // nombre para mostrarlo en el header sin ir a la DB
  picture?: string; // URL del avatar (viene de Google; puede no existir)
  role: "ADMIN" | "CUSTOMER";
  iat?: number; // issued at  (lo agrega jose automáticamente)
  exp?: number; // expiration (lo agrega jose automáticamente)
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
  last_name?: string;
  phone?: string;
  picture?: string;
  role: "ADMIN" | "CUSTOMER";
  email_verified?: boolean;
  created_at?: string;
}

// ─── Body esperado para actualizar perfil ─────────────────────────────────────
export interface UpdateProfileBody {
  name: string;
  lastName: string;
  phone?: string;
}

// ─── Perfil completo del usuario (GET / PATCH /api/account/profile) ───────────
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  last_name: string;
  phone: string;
  picture?: string;
  role: "ADMIN" | "CUSTOMER";
  email_verified: boolean;
  created_at: string;
}

export interface ProfileResponse {
  user: UserProfile;
}

// ─── Body esperado en DELETE /api/account ─────────────────────────────────────
export interface DeleteAccountBody {
  password: string;
  reason?: string;
  feedback?: string;
}

// ─── Seguridad de cuenta: Sesiones Activas y Registro de Actividad ────────────
export type AccountActivityEventType =
  | "LOGIN_SUCCESS"
  | "LOGIN_GOOGLE"
  | "REGISTER"
  | "PROFILE_UPDATED"
  | "PASSWORD_CHANGED"
  | "SESSION_REVOKED"
  | "SESSIONS_REVOKED_ALL"
  | "ACCOUNT_CLOSED";

export interface ActiveSessionItem {
  id: string;
  deviceLabel: string;
  ipMasked: string;
  lastActiveAt: string;
  createdAt: string;
  isCurrent: boolean;
}

export interface ActivityLogItem {
  id: string;
  eventType: AccountActivityEventType;
  title: string;
  metadata: string | null;
  ipMasked: string | null;
  createdAt: string;
}

export interface AccountSecurityResponse {
  sessions: ActiveSessionItem[];
  activities: ActivityLogItem[];
}

export interface RevokeSessionResponse {
  ok: true;
  revokedId: string;
}

export interface RevokeOtherSessionsResponse {
  ok: true;
  revokedCount: number;
}

// ─── Body esperado en el endpoint ────────────────────────────────────────────
export interface LoginBody {
  email: string;
  password: string;
}

// ─── Body esperado en POST /api/auth/register ─────────────────────────────────
export interface RegisterBody {
  name: string;
  lastName: string;
  email: string;
  password: string;
}

// ─── Respuesta pública de POST /api/auth/register ────────────────────────────
export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: "ADMIN" | "CUSTOMER";
  };
}
