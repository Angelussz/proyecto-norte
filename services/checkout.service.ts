import type { CheckoutSummary } from "@/interfaces/checkout.interface";
import { CHECKOUT_MOCK } from "@/lib/mocks";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Capa de servicio — simula el llamado al backend.
 * Hoy resuelve desde lib/mocks.ts (CHECKOUT_MOCK).
 * Para conectar la API real, reemplazar el cuerpo por:
 *   const res = await fetch(`${process.env.API_URL}/api/checkout`, { cache: "force-cache" });
 *   if (!res.ok) return null;
 *   return (await res.json()) as CheckoutSummary;
 */
export async function getCheckoutSummary(): Promise<CheckoutSummary> {
  // Simula latencia de red
  await delay(150);

  return CHECKOUT_MOCK;
}
