"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

// ─── Google SVG Icon ────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0"
      viewBox="0 0 24 24"
      focusable="false"
    >
      <path
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
        fill="#4285F4"
      />
      <path
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
        fill="#34A853"
      />
      <path
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
        fill="#FBBC05"
      />
      <path
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
        fill="#EA4335"
      />
    </svg>
  );
}

// ─── Apple SVG Icon ──────────────────────────────────────────────────────────
function AppleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0 fill-current"
      viewBox="0 0 170 170"
      focusable="false"
    >
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.66-7.85-11.91-14.42-6-9.26-10.74-20.08-14.23-32.48-3.49-12.39-5.23-23.75-5.23-34.08 0-14.82 3.84-27.14 11.53-36.96 7.69-9.82 17.51-14.85 29.47-15.1 4.58 0 9.87 1.25 15.86 3.75 6 2.5 10.15 3.81 12.46 3.94 1.74 0 5.92-1.39 12.54-4.17 6.62-2.78 12.35-3.99 17.18-3.64 13.06.87 23.36 5.86 30.9 14.97-11.47 6.96-17.06 16.5-16.77 28.61.31 9.4 3.94 17.26 10.9 23.57 6.96 6.3 15.02 9.88 24.17 10.74-2.22 6.64-4.87 13.25-7.94 19.85zM119.22 31.84c0-7.72 2.76-15.04 8.28-21.96 5.53-6.92 12.28-11.23 20.26-12.93.31 1.05.47 2.16.47 3.33 0 7.64-2.88 15.06-8.65 22.26-5.77 7.21-12.63 11.48-20.59 12.82-.25-1.12-.37-2.12-.37-3.52z" />
    </svg>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Si el middleware redirigió aquí desde una ruta protegida,
  // `redirectTo` contiene la ruta original para volver después del login.
  const redirectTo = searchParams.get("redirectTo") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  /**
   * handleSubmit — conecta el formulario con el endpoint POST /api/auth/login.
   *
   * Usamos fetch() nativo (no una librería) para tener control total:
   *  - Si la respuesta es 200 → el servidor ya guardó el JWT en la cookie
   *    HTTP-only automáticamente. Solo necesitamos redirigir.
   *  - Si es 401 → mostramos "Credenciales inválidas" al usuario.
   *  - Si es otro error → mensaje genérico.
   */
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (res.ok) {
          // Login exitoso: el JWT ya está en la cookie.
          // router.refresh() le dice a Next.js que re-ejecute los
          // Server Components para que lean la nueva cookie.
          await res.json();
          router.refresh();
          // Redirigir a la ruta original (o a la tienda si no hay ninguna).
          router.push(redirectTo);
        } else if (res.status === 401) {
          setError("Correo o contraseña incorrectos.");
        } else if (res.status === 429) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? "Demasiados intentos. Intentá más tarde.");
        } else {
          setError("Ocurrió un error. Intentá de nuevo.");
        }
      } catch {
        setError("No se pudo conectar con el servidor.");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* ── Formulario de credenciales ── */}
      <form
        id="login-credentials-form"
        onSubmit={handleSubmit}
        className="space-y-4"
        noValidate
      >
        {/* Campo email */}
        <div className="space-y-1.5">
          <label
            htmlFor="login-email"
            className="block text-[13px] font-medium tracking-wide text-foreground"
          >
            Correo electrónico
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            suppressHydrationWarning
            className="
              w-full rounded-lg border border-border bg-card px-4 py-3
              text-sm text-foreground placeholder:text-muted-foreground/60
              transition duration-200
              focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/25
              disabled:opacity-50
            "
            disabled={isPending}
          />
        </div>

        {/* Campo contraseña */}
        <div className="space-y-1.5">
          <label
            htmlFor="login-password"
            className="block text-[13px] font-medium tracking-wide text-foreground"
          >
            Contraseña
          </label>
          <div className="relative">
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              suppressHydrationWarning
              className="
                w-full rounded-lg border border-border bg-card px-4 py-3 pr-11
                text-sm text-foreground placeholder:text-muted-foreground/60
                transition duration-200
                focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/25
                disabled:opacity-50
              "
              disabled={isPending}
            />
            <button
              type="button"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              onClick={() => setShowPassword((v) => !v)}
              className="
                absolute inset-y-0 right-0 flex items-center pr-3.5
                text-muted-foreground transition-colors hover:text-foreground focus:outline-none
              "
            >
              {showPassword ? (
                <EyeOff className="size-4" strokeWidth={1.6} />
              ) : (
                <Eye className="size-4" strokeWidth={1.6} />
              )}
            </button>
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <p
            role="alert"
            className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive"
          >
            {error}
          </p>
        )}

        {/* Botón principal */}
        <button
          id="login-submit-btn"
          type="submit"
          disabled={isPending || !email || !password}
          className="
            flex w-full items-center justify-center gap-2
            rounded-lg bg-primary px-6 py-3.5
            text-sm font-medium tracking-wider text-primary-foreground uppercase
            shadow-sm transition-all duration-200
            hover:bg-primary/90 active:scale-[0.99]
            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
            disabled:cursor-not-allowed disabled:opacity-60
          "
        >
          {isPending && <Loader2 className="size-4 animate-spin" />}
          Ingresar
        </button>
      </form>

      {/* ── Divisor ── */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <span className="relative bg-background px-4 font-serif text-xs italic text-muted-foreground">
          o
        </span>
      </div>

      {/* ── Auth social ── */}
      <div id="login-social-auth" className="space-y-3">
        {/* Google — redirige al flujo OAuth real */}
        <a
          href="/api/auth/google"
          id="login-google-btn"
          className="
            flex w-full items-center justify-center gap-3
            rounded-lg border border-border bg-card/60 px-4 py-3
            text-sm font-medium text-foreground
            transition-all duration-200
            hover:border-muted-foreground/40 hover:bg-card
            active:scale-[0.99]
            focus:outline-none focus:ring-2 focus:ring-primary/25
          "
        >
          <GoogleIcon />
          <span className="tracking-wide">Continuar con Google</span>
        </a>

        {/* Apple */}
        <button
          type="button"
          id="login-apple-btn"
          className="
            flex w-full items-center justify-center gap-3
            rounded-lg border border-border bg-card/60 px-4 py-3
            text-sm font-medium text-foreground
            transition-all duration-200
            hover:border-muted-foreground/40 hover:bg-card
            active:scale-[0.99]
            focus:outline-none focus:ring-2 focus:ring-primary/25
          "
        >
          <AppleIcon />
          <span className="tracking-wide">Continuar con Apple</span>
        </button>
      </div>
    </div>
  );
}
