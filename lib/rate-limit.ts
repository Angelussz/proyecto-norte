/**
 * lib/rate-limit.ts
 *
 * Rate limiter en memoria con ventana fija (fixed window).
 *
 * ¿Por qué en memoria y no Redis?
 *   - En un entorno de una sola instancia (servidor Node) funciona perfectamente.
 *   - No requiere dependencias externas.
 *   - Para escalar horizontalmente (múltiples réplicas) se necesitaría
 *     reemplazar el Map por Redis con `ioredis` o `@upstash/ratelimit`.
 *
 * Algoritmo: ventana fija por clave (ej: dirección IP).
 *   - Cuenta intentos en un intervalo de `windowMs` ms.
 *   - Si se superan `maxRequests` en ese intervalo → bloquea.
 *   - La ventana se resetea sola cuando expira (limpieza lazy).
 */

interface WindowEntry {
  count: number;
  resetAt: number; // timestamp en ms cuando se limpia la ventana
}

// Map global (vive mientras el servidor Node corre)
const store = new Map<string, WindowEntry>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;     // intentos restantes en la ventana actual
  retryAfterMs: number;  // ms hasta que se resetea (0 si allowed)
}

/**
 * checkRateLimit — verifica si la clave dada tiene intentos disponibles.
 *
 * @param key          - Clave única por cliente (ej: IP, email normalizado)
 * @param maxRequests  - Máximo de requests permitidos en la ventana
 * @param windowMs     - Duración de la ventana en milisegundos
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();

  let entry = store.get(key);

  // Si no existe o ya venció → nueva ventana
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
    store.set(key, entry);
  }

  entry.count++;

  if (entry.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: entry.resetAt - now,
    };
  }

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    retryAfterMs: 0,
  };
}

/**
 * getClientIp — extrae la IP del cliente desde los headers de Next.js.
 * Soporta proxies/CDN que usan X-Forwarded-For.
 */
export function getClientIp(req: Request): string {
  // Vercel / Cloudflare / nginx
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}
