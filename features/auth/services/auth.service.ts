/**
 * features/auth/services/auth.service.ts
 *
 * Capa de servicio de autenticación.
 * Aquí vive la lógica de negocio pura: buscar el usuario, comparar contraseñas.
 * No importa nada de Next.js (Request, Response, cookies) → fácil de testear.
 */

import { compare, hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isDeletedEmail } from "@/features/auth/lib/deleted-account";
import type { JwtPayload } from "@/features/auth/types/auth.interface";
import { sendEmail } from "@/lib/email.service";
import { welcomeEmail } from "@/lib/email-templates/welcome";

// Error tipado para diferenciar "credenciales inválidas" de errores 500
export class AuthError extends Error {
  constructor(
    public readonly code: "INVALID_CREDENTIALS" | "USER_NOT_FOUND" | "EMAIL_ALREADY_EXISTS",
    message: string,
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
export async function verifyCredentials(email: string, password: string): Promise<JwtPayload> {
  // 1. Buscar al usuario en la DB por email
  const user = await prisma.users.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: {
      id: true,
      email: true,
      name: true,
      password_hash: true,
      picture_url: true, // avatar guardado desde Google OAuth
      role: true,
      email_verified: true,
    },
  });

  // 2. Si no existe o la cuenta fue cerrada → mismo mensaje genérico
  //    (no revelamos si el email está o no registrado)
  if (!user || isDeletedEmail(user.email)) {
    throw new AuthError("INVALID_CREDENTIALS", "Credenciales inválidas");
  }

  // TODO: bloquear login si !user.email_verified cuando se implemente el
  //       flujo de verificación por email (Resend / SendGrid).
  //       Responder 403 con código "EMAIL_NOT_VERIFIED" para que el cliente
  //       pueda mostrar un mensaje específico y un botón "Reenviar correo".

  // 3. Comparar la contraseña enviada con el hash almacenado.
  //    Si password_hash está vacío, el usuario es exclusivamente de Google
  //    y no puede iniciar sesión con contraseña.
  if (!user.password_hash) {
    throw new AuthError("INVALID_CREDENTIALS", "Credenciales inválidas");
  }

  let passwordMatches = false;
  try {
    passwordMatches = await compare(password, user.password_hash);
  } catch {
    // Hash inválido (no es bcrypt) → tratar como credenciales incorrectas
    passwordMatches = false;
  }
  if (!passwordMatches) {
    throw new AuthError("INVALID_CREDENTIALS", "Credenciales inválidas");
  }

  // 4. Devolver el payload del token (sin el hash de la contraseña)
  return {
    sub: user.id,
    email: user.email,
    name: user.name,
    picture: user.picture_url ?? undefined, // foto de Google si ya inició sesión con OAuth
    role: user.role,
  };
}

/**
 * Registra un nuevo usuario con email y contraseña.
 *
 * @throws AuthError con code "EMAIL_ALREADY_EXISTS" si el email ya está en uso.
 * @returns Payload listo para embeber en un JWT.
 */
export async function createUser(
  name: string,
  lastName: string,
  email: string,
  password: string,
): Promise<JwtPayload> {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Verificar que el email no esté ya registrado
  const existing = await prisma.users.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (existing) {
    throw new AuthError("EMAIL_ALREADY_EXISTS", "Ya existe una cuenta con ese correo.");
  }

  // 2. Hashear la contraseña (10 rondas = balance coste/seguridad en dev/prod)
  const passwordHash = await hash(password, 10);

  // 3. Crear el usuario en la DB
  const user = await prisma.users.create({
    data: {
      name: name.trim(),
      last_name: lastName.trim(),
      email: normalizedEmail,
      password_hash: passwordHash,
      phone: "", // campo requerido; se podrá actualizar en el perfil
      role: "CUSTOMER",
      email_verified: false, // TODO: implementar flujo de verificación por email
    },
    select: {
      id: true,
      email: true,
      name: true,
      picture_url: true,
      role: true,
    },
  });

  // 4. Devolver el payload del token
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    picture: user.picture_url ?? undefined,
    role: user.role,
  };

  // Enviar email de bienvenida (best-effort: si falla no interrumpe el registro)
  const { html, subject } = welcomeEmail(user.name);
  await sendEmail({ to: user.email, subject, html }).catch(() => undefined);

  return payload;
}
