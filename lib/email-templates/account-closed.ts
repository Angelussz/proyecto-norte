import { baseEmailLayout } from "./base";

export function accountClosedEmail(name: string): { subject: string; html: string } {
  return {
    subject: "Tu cuenta en NORTE ha sido cerrada",
    html: baseEmailLayout(
      `
      <div class="label">Confirmación de cierre</div>
      <h1>Cuenta<br />Cerrada</h1>
      <p>Hola <strong>${name}</strong>, tu solicitud de cierre de cuenta fue procesada 
      exitosamente. Tus datos personales han sido anonimizados conforme al 
      Reglamento General de Protección de Datos (RGPD UE 2016/679).</p>
      <hr class="divider" />
      <p style="font-size:13px;color:#857466;">
        Los registros contables y fiscales legalmente exigidos serán custodiados 
        bajo cifrado según los plazos que dicta la ley española y europea.
      </p>
      <p style="font-size:13px;color:#857466;">
        Si deseas volver al archivo en el futuro, puedes crear una nueva cuenta 
        desde cero en cualquier momento.
      </p>
      `,
      "Tu cuenta de NORTE ha sido cerrada.",
    ),
  };
}
