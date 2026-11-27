import { baseEmailLayout } from "./base";

export function emailChangedEmail(
  name: string,
  newEmail: string,
  meta: { device: string; ip: string; date: string },
): { subject: string; html: string } {
  return {
    subject: "Tu correo electrónico fue actualizado — NORTE",
    html: baseEmailLayout(
      `
      <div class="label">Alerta de seguridad</div>
      <h1>Correo<br />Actualizado</h1>
      <p>Hola <strong>${name}</strong>, el correo electrónico asociado a tu cuenta 
      fue cambiado exitosamente.</p>
      <div class="info-row">
        <div class="key">Nuevo correo</div>
        <div class="val">${newEmail}</div>
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
      <div class="alert-box">
        <p>⚠️ Si no realizaste este cambio, contacta a soporte de inmediato.</p>
      </div>
      `,
      "Tu correo de NORTE fue actualizado.",
    ),
  };
}
