import { baseEmailLayout } from "./base";

export function newSessionEmail(
  name: string,
  meta: { device: string; ip: string; date: string },
): { subject: string; html: string } {
  return {
    subject: "Nuevo inicio de sesión en tu cuenta — NORTE",
    html: baseEmailLayout(
      `
      <div class="label">Alerta de acceso</div>
      <h1>Nuevo<br />Acceso</h1>
      <p>Hola <strong>${name}</strong>, detectamos un nuevo inicio de sesión 
      en tu cuenta de NORTE.</p>
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
      <p>Si reconoces este acceso, no es necesario que hagas nada.</p>
      <div class="alert-box">
        <p>⚠️ Si no fuiste tú, cerrá todas las sesiones desde tu cuenta 
        de inmediato.</p>
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://norte.dev"}/account" class="btn">
        Gestionar sesiones
      </a>
      `,
      "Nuevo acceso detectado en tu cuenta de NORTE.",
    ),
  };
}
