import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description:
    "Accede a tu cuenta NORTE. Consultá tus pedidos, piezas reservadas y gestioná tu perfil.",
};

export default function LoginPage() {
  return (
    <section aria-labelledby="login-heading" className="flex flex-col justify-center">
      {/* Encabezado */}
      <div className="mb-8">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Cuenta Personal
        </span>
        <h1
          id="login-heading"
          className="text-4xl uppercase leading-none tracking-[0.05em] text-foreground sm:text-5xl"
          style={{ fontFamily: "var(--font-bebas), sans-serif" }}
        >
          Iniciar Sesión
        </h1>
        <p className="mt-2 text-xs font-light text-muted-foreground">
          Bienvenido al archivo privado de NORTE. Accedé a tus pedidos y piezas
          reservadas.
        </p>
      </div>

      {/* Formulario cliente */}
      <LoginForm />

      {/* Link a registro */}
      <p className="mt-8 text-center text-xs text-muted-foreground">
        ¿No tenés cuenta?{" "}
        <Link
          href="/register"
          className="ml-1 font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
        >
          Crear cuenta
        </Link>
      </p>
    </section>
  );
}
