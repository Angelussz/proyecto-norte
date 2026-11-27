/**
 * lib/email-templates/base.ts
 *
 * Layout base HTML para todos los emails transaccionales de NORTE.
 * Estilo editorial mínimo: beige, naranja, Bebas Neue simulada con Georgia.
 */

export function baseEmailLayout(content: string, preheader = ""): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>NORTE</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
  <style>
    body { margin: 0; padding: 0; background-color: #f4eddf; font-family: Georgia, 'Times New Roman', serif; }
    .wrapper { width: 100%; background-color: #f4eddf; padding: 40px 20px; box-sizing: border-box; }
    .container { max-width: 560px; margin: 0 auto; background-color: #fff9ed; }
    .header { background-color: #1e1c13; padding: 24px 32px; }
    .header-logo { color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: 0.25em; text-transform: uppercase; text-decoration: none; font-family: Georgia, serif; }
    .header-label { color: #c88b3a; font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; margin-top: 4px; }
    .body { padding: 36px 32px; }
    .footer { background-color: #e8e2d4; padding: 20px 32px; }
    .footer p { margin: 0; font-size: 11px; color: #857466; letter-spacing: 0.05em; line-height: 1.6; }
    .footer a { color: #857466; text-decoration: underline; }
    h1 { margin: 0 0 20px 0; font-size: 30px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #1e1c13; font-family: Georgia, serif; }
    p { margin: 0 0 16px 0; font-size: 14px; color: #534438; line-height: 1.65; }
    .label { font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: #857466; margin-bottom: 6px; }
    .btn { display: inline-block; padding: 14px 28px; background-color: #c88b3a; color: #ffffff !important; font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; text-decoration: none; margin-top: 8px; }
    .divider { border: none; border-top: 1px solid #e8e2d4; margin: 24px 0; }
    .alert-box { background-color: #ffdad6; border-left: 3px solid #ba1a1a; padding: 14px 18px; margin-bottom: 20px; }
    .alert-box p { color: #93000a; font-size: 13px; margin: 0; }
    .info-row { background-color: #f4eddf; padding: 10px 14px; margin-bottom: 8px; }
    .info-row .key { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #857466; }
    .info-row .val { font-size: 14px; color: #1e1c13; font-weight: 600; margin-top: 2px; }
  </style>
</head>
<body>
  ${preheader ? `<span style="display:none;max-height:0;overflow:hidden;">${preheader}&nbsp;‌​‌‌​​​‌‌​‌​‌‌‌​‌​​​‌‌‌​‌​‌​​‌‌​</span>` : ""}
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="header-logo">NORTE</div>
        <div class="header-label">Archivo &middot; Colección</div>
      </div>
      <div class="body">
        ${content}
      </div>
      <div class="footer">
        <p>Este email fue enviado por NORTE Archivo.<br />
        Si no reconoces esta actividad, <a href="mailto:soporte@norte.dev">contacta a soporte</a>.</p>
        <p style="margin-top:10px;">
          NORTE · Av. Córdoba 1234, Buenos Aires, Argentina
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}
