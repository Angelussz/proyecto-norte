import { baseEmailLayout } from "./base";

export function welcomeEmail(name: string): { subject: string; html: string } {
  return {
    subject: "Bienvenido al Archivo NORTE",
    html: baseEmailLayout(
      `
      <div class="label">Registro completado</div>
      <h1>Bienvenido,<br />${name}</h1>
      <p>Tu cuenta en el <strong>Archivo NORTE</strong> ha sido creada con éxito. 
      Ahora puedes acceder a colecciones exclusivas, gestionar tus pedidos y 
      personalizar tu experiencia curatorial.</p>
      <hr class="divider" />
      <p>Para comenzar, explora nuestra selección actual o completa tu perfil 
      con tus datos de envío.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://norte.dev"}" class="btn">
        Explorar el Archivo
      </a>
      `,
      `Bienvenido al Archivo NORTE, ${name}.`,
    ),
  };
}
