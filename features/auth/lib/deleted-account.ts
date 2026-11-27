export const DELETED_EMAIL_SUFFIX = "@norte.invalid";

export function isDeletedEmail(email: string): boolean {
  return email.endsWith(DELETED_EMAIL_SUFFIX);
}

export function buildDeletedEmail(userId: string): string {
  return `deleted_${userId}${DELETED_EMAIL_SUFFIX}`;
}
