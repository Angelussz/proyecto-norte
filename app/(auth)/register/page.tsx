import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
  title: "Crear Cuenta",
  description:
    "Únete al universo NORTE. Acceso exclusivo a piezas atemporales y lanzamientos anticipados.",
};

export default function RegisterPage() {
  return (
    <section aria-labelledby="register-heading" className="flex flex-col justify-center">
      {/* Encabezado */}
      <div className="mb-6">
        <h1
          id="register-heading"
          className="text-4xl font-bold uppercase tracking-[0.04em] text-foreground sm:text-5xl"
          style={{ fontFamily: "var(--font-bebas), sans-serif" }}
        >
          Crear Cuenta
        </h1>
        <p className="mt-2 text-xs font-normal tracking-wide text-muted-foreground sm:text-sm">
          Únete al universo NORTE. Acceso exclusivo a piezas atemporales y
          lanzamientos anticipados.
        </p>
      </div>

      {/* Formulario cliente */}
      <RegisterForm />

      {/* Link a login */}
      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground sm:text-sm">
          ¿Ya tenés cuenta?{" "}
          <Link
            href="/login"
            className="ml-1 font-semibold text-foreground underline underline-offset-4 decoration-primary transition-colors hover:text-primary"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </section>
  );
}
