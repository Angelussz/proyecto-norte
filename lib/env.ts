// Acceso validado a variables de entorno (solo servidor).
// Next.js ya carga `.env` en runtime, no hace falta `dotenv` aquí.
function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing environment variable: ${name}`)
  return value
}

export const env = {
  DATABASE_URL: required('DATABASE_URL'),
} as const
