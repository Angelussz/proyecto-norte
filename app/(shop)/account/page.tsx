import type { Metadata } from "next";
import { AccountView } from "@/features/auth/components/account-view";

export const metadata: Metadata = {
  title: "Mi cuenta — NORTE",
  description: "Administrá tu perfil, seguridad y preferencias de cuenta en NORTE.",
};

/**
 * app/(shop)/account/page.tsx
 *
 * Página protegida de "Mi Cuenta".
 * El middleware.ts ya garantiza que solo usuarios autenticados llegan aquí.
 * La interactividad (secciones, formularios, modal) vive en AccountView (client).
 */
export default function AccountPage() {
  return (
    <main className="flex-1 flex flex-col">
      <AccountView />
    </main>
  );
}
