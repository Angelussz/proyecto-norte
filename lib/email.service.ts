/**
 * lib/email.service.ts
 *
 * Servicio de email para NORTE.
 * Usa Resend cuando RESEND_API_KEY está configurada.
 * Si NO está configurada, imprime el email en consola (modo stub para desarrollo).
 *
 * ── Para activar en producción ────────────────────────────────────────────────
 *  1. Crear cuenta en https://resend.com (plan Free: 3.000 emails/mes)
 *  2. Generar API Key en Resend Dashboard → API Keys
 *  3. Verificar tu dominio en Resend Dashboard → Domains
 *  4. Añadir en .env:
 *       RESEND_API_KEY=re_xxxxxxxxxxxx
 *       EMAIL_FROM=noreply@tudominio.com
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  /** Nombre para mostrar en el encabezado "Para:" */
  recipientName?: string;
}

export interface EmailResult {
  sent: boolean;
  /** ID del mensaje si Resend lo procesó; undefined en modo stub */
  messageId?: string;
  /** Error descriptivo si no se pudo enviar */
  error?: string;
}

function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * Envía un email transaccional.
 *
 * - Con RESEND_API_KEY → llama a la API de Resend.
 * - Sin RESEND_API_KEY → imprime en consola (modo stub / dev).
 *
 * Nunca lanza: devuelve `{ sent: false, error }` si falla,
 * para que el flujo principal no se interrumpa por un error de email.
 */
export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  const from = process.env.EMAIL_FROM ?? "noreply@norte.dev";
  const { to, subject, html } = payload;

  if (!isEmailConfigured()) {
    // ── Modo stub ─────────────────────────────────────────────────────────────
    console.log(
      [
        "┌─── [EMAIL STUB] ──────────────────────────────────────────",
        `│ Para:    ${to}`,
        `│ Asunto:  ${subject}`,
        `│ Desde:   ${from}`,
        "│ (Sin RESEND_API_KEY — el email NO fue enviado)",
        "└───────────────────────────────────────────────────────────",
      ].join("\n"),
    );
    return { sent: false, messageId: undefined };
  }

  try {
    // ── Modo producción ───────────────────────────────────────────────────────
    // Importación dinámica para que el módulo no falle en entornos sin Resend
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const result = await resend.emails.send({ from, to, subject, html });

    if (result.error) {
      console.error("[email] Resend rechazó el envío:", result.error);
      return { sent: false, error: result.error.message };
    }

    return { sent: true, messageId: result.data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error("[email] Fallo al enviar email:", message);
    return { sent: false, error: message };
  }
}
