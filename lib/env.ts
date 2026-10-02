// Acceso validado a variables de entorno (solo servidor).
// Next.js ya carga `.env` en runtime, no hace falta `dotenv` aquí.
function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing environment variable: ${name}`)
  return value
}

// Opcionales en arranque (no rompen `next build`); se validan al usarlos.
function optional(name: string): string | undefined {
  return process.env[name] || undefined
}

export const env = {
  DATABASE_URL: required('DATABASE_URL'),
  JWT_SECRET: required('JWT_SECRET'),
  CLOUDINARY_CLOUD_NAME: optional('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: optional('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: optional('CLOUDINARY_API_SECRET'),
  ADMIN_API_TOKEN: optional('ADMIN_API_TOKEN'),
  // Google OAuth — requeridas para el flujo de login con Google.
  // Si no están definidas, el error aparece al arrancar el servidor
  // (mucho más fácil de diagnosticar que un crash en runtime).
  GOOGLE_CLIENT_ID: required('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: required('GOOGLE_CLIENT_SECRET'),
  GOOGLE_REDIRECT_URI: required('GOOGLE_REDIRECT_URI'),
} as const
