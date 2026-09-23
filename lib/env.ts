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
  CLOUDINARY_CLOUD_NAME: optional('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: optional('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: optional('CLOUDINARY_API_SECRET'),
  ADMIN_API_TOKEN: optional('ADMIN_API_TOKEN'),
} as const
