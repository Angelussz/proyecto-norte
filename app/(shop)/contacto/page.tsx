import type { Metadata } from "next";
import { ContactView } from "@/features/contact/components/contact-view";

export const metadata: Metadata = {
  title: "Contacto | NORTE - Estilo sin esfuerzo, confianza cada día",
  description:
    "Comunícate con el equipo y atelier de NORTE. Asistencia personalizada para pedidos, consultas de tallas, citas privadas y prensa.",
};

export default function ContactoPage() {
  return <ContactView />;
}
