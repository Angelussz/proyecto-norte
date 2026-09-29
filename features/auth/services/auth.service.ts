/**
 * features/auth/services/auth.service.ts
 *
 * Capa de servicio de autenticación.
 * Aquí vive la lógica de negocio pura: buscar el usuario, comparar contraseñas.
 * No importa nada de Next.js (Request, Response, cookies) → fácil de testear.
 */

import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { JwtPayload } from "@/features/auth/types/auth.interface";

// Error tipado para diferenciar "credenciales inválidas" de errores 500
export class AuthError extends Error {
  constructor(
    public readonly code: "INVALID_CREDENTIALS" | "USER_NOT_FOUND",
    message: string
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Verifica email + contraseña contra la base de datos.
 *
 * ¿Por qué usamos bcryptjs.compare en vez de comparar hashes directamente?
 *   bcrypt es un algoritmo de hash LENTO por diseño (adaptive cost factor).
 *   Esto hace que los ataques de fuerza bruta sean imprácticamente lentos.
 *   `compare` también es inmune a timing attacks porque compara en tiempo
 *   constante sin cortocircuitar en el primer byte diferente.
 *
 * @returns Payload listo para embeber en el JWT si las credenciales son válidas.
 * @throws  AuthError si el usuario no existe o la contraseña no coincide.
 */
export async function verifyCredentials(
  email: string,
  password: string
): Promise<JwtPayload> {
  // 1. Buscar al usuario en la DB por email
  const user = await prisma.users.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: {
      id: true,
      email: true,
      name: true,
      password_hash: true,
      role: true,
    },
  });

  // 2. Si no existe → mismo mensaje genérico que "contraseña incorrecta"
  //    (no revelamos si el email está o no registrado)
  if (!user) {
    throw new AuthError("INVALID_CREDENTIALS", "Credenciales inválidas");
  }

  // 3. Comparar la contraseña enviada con el hash almacenado
  const passwordMatches = await compare(password, user.password_hash);
  if (!passwordMatches) {
    throw new AuthError("INVALID_CREDENTIALS", "Credenciales inválidas");
  }

  // 4. Devolver el payload del token (sin el hash de la contraseña)
  return {
    sub: user.id,
    email: user.email,
    role: user.role,
  };
}
