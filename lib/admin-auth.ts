import { timingSafeEqual } from 'node:crypto'
import { env } from '@/lib/env'

export class AdminAuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AdminAuthError'
  }
}

/**
 * Guard de rutas admin por token compartido (header `x-admin-token`).
 * Falla cerrado: si ADMIN_API_TOKEN no está configurado, deniega todo.
 * Comparación en tiempo constante para no filtrar el secreto por timing.
 */
export function requireAdminToken(req: Request): void {
  const expected = env.ADMIN_API_TOKEN
  if (!expected) throw new AdminAuthError('ADMIN_API_TOKEN no está configurado')

  const given = req.headers.get('x-admin-token') ?? ''
  const givenBuf = Buffer.from(given)
  const expectedBuf = Buffer.from(expected)
  if (givenBuf.length !== expectedBuf.length || !timingSafeEqual(givenBuf, expectedBuf)) {
    throw new AdminAuthError('Token de administración inválido')
  }
}
