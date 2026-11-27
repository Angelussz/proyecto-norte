import { baseEmailLayout } from "./base";

const ORDER_STATUS_LABELS: Record<string, { label: string; description: string; color: string }> = {
  PAID: {
    label: "Pago confirmado",
    description: "Tu pago fue procesado exitosamente. Comenzaremos a preparar tu pedido.",
    color: "#33402f",
  },
  PREPARING: {
    label: "En preparación",
    description:
      "Tu pedido está siendo preparado por nuestro equipo. Te avisaremos cuando esté listo para envío.",
    color: "#c88b3a",
  },
  SHIPPED: {
    label: "Enviado",
    description: "Tu pedido está en camino. Pronto recibirás la información de seguimiento.",
    color: "#c88b3a",
  },
  DELIVERED: {
    label: "Entregado",
    description: "Tu pedido fue entregado. ¡Gracias por confiar en NORTE!",
    color: "#33402f",
  },
  CANCELLED: {
    label: "Cancelado",
    description: "Tu pedido fue cancelado. Si tienes preguntas, contacta a soporte.",
    color: "#ba1a1a",
  },
};

export function orderStatusEmail(
  name: string,
  orderId: string,
  status: string,
  total: string,
): { subject: string; html: string } {
  const statusInfo = ORDER_STATUS_LABELS[status] ?? {
    label: status,
    description: "El estado de tu pedido ha sido actualizado.",
    color: "#534438",
  };

  return {
    subject: `Pedido actualizado: ${statusInfo.label} — NORTE`,
    html: baseEmailLayout(
      `
      <div class="label">Actualización de pedido</div>
      <h1>${statusInfo.label}</h1>
      <p>Hola <strong>${name}</strong>, ${statusInfo.description}</p>
      <div class="info-row">
        <div class="key">Número de pedido</div>
        <div class="val">#${orderId.slice(-8).toUpperCase()}</div>
      </div>
      <div class="info-row">
        <div class="key">Total</div>
        <div class="val">${total}</div>
      </div>
      <div class="info-row">
        <div class="key">Estado</div>
        <div class="val" style="color:${statusInfo.color};">${statusInfo.label}</div>
      </div>
      <hr class="divider" />
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://norte.dev"}/account" class="btn">
        Ver mis pedidos
      </a>
      `,
      `Tu pedido está: ${statusInfo.label}.`,
    ),
  };
}
