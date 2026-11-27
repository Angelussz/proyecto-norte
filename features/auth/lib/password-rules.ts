/**
 * Reglas compartidas de fortaleza de contraseña entre cliente y backend.
 * Este archivo no importa dependencias de servidor ni de React.
 */

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export interface PasswordRuleCheck {
  id: "min_length" | "uppercase" | "number" | "special";
  label: string;
  errorMessage: string;
  test: (password: string) => boolean;
}

export const PASSWORD_RULES: readonly PasswordRuleCheck[] = [
  {
    id: "min_length",
    label: `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`,
    errorMessage: `La nueva contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`,
    test: (pwd) => pwd.length >= PASSWORD_MIN_LENGTH,
  },
  {
    id: "uppercase",
    label: "Al menos una letra mayúscula",
    errorMessage: "La nueva contraseña debe incluir al menos una letra mayúscula.",
    test: (pwd) => /[A-Z]/.test(pwd),
  },
  {
    id: "number",
    label: "Al menos un número decimal",
    errorMessage: "La nueva contraseña debe incluir al menos un número.",
    test: (pwd) => /[0-9]/.test(pwd),
  },
  {
    id: "special",
    label: "Un símbolo o signo especial (@, #, $)",
    errorMessage: "La nueva contraseña debe incluir al menos un símbolo especial.",
    test: (pwd) => /[^A-Za-z0-9]/.test(pwd),
  },
] as const;

/**
 * Valida una nueva contraseña contra todas las reglas de fortaleza.
 * Devuelve null si es válida o el primer mensaje de error en caso contrario.
 */
export function validateNewPasswordStrength(password: string): string | null {
  if (!password) {
    return PASSWORD_RULES[0].errorMessage;
  }

  for (const rule of PASSWORD_RULES) {
    if (!rule.test(password)) {
      return rule.errorMessage;
    }
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    return `La nueva contraseña no puede superar los ${PASSWORD_MAX_LENGTH} caracteres.`;
  }

  return null;
}
