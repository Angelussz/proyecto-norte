import { baseEmailLayout } from "./base";

export function passwordChangedEmail(
  name: string,
  meta: { device: string; ip: string; date: string },
): { subject: string; html: string } {
  return {
    subject: "Tu contraseña fue actualizada — NORTE",
    html: baseEmailLayout(
      `
      <div class="label">Alerta de seguridad</div>
      <h1>Contraseña<br />Actualizada</h1>
      <p>Hola <strong>${name}</strong>, tu contraseña fue cambiada exitosamente. 
      Si fuiste tú, puedes ignorar este mensaje.</p>
      <div class="alert-box">
        <p>⚠️ Si no realizaste este cambio, cambia tu contraseña inmediatamente 
        y contacta a soporte.</p>
      </div>
      <div class="info-row">
        <div class="key">Dispositivo</div>
        <div class="val">${meta.device}</div>
      </div>
      <div class="info-row">
        <div class="key">IP aproximada</div>
        <div class="val">${meta.ip}</div>
      </div>
      <div class="info-row">
        <div class="key">Fecha y hora</div>
        <div class="val">${meta.date}</div>
      </div>
      <hr class="divider" />
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://norte.dev"}/account" class="btn">
        Revisar mi cuenta
      </a>
      `,
      "Tu contraseña de NORTE fue actualizada.",
    ),
  };
}
