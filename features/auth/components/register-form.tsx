"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff, Loader2, Info } from "lucide-react";

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
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
        fill="#4285F4"
      />
      <path
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
        fill="#34A853"
      />
      <path
        d="M5.28 14.27a7.17 7.17 0 010-4.54V6.58H1.25a11.97 11.97 0 000 10.84l4.03-3.15z"
        fill="#FBBC05"
      />
      <path
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
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
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.94-14.3-5.26-8.13-9.64-17.72-13.14-28.78-3.5-11.06-5.25-21.75-5.25-32.08 0-14.36 3.6-26.32 10.8-35.88 7.21-9.56 16.14-14.41 26.8-14.54 4.8 0 10.12 1.25 15.96 3.76 5.84 2.5 9.77 3.82 11.78 3.94 1.77-.12 5.92-1.5 12.45-4.14 6.53-2.65 12.06-3.83 16.6-3.55 12.51.78 22.37 5.56 29.58 14.36-11.04 6.72-16.42 16.03-16.15 27.93.27 9.69 4.1 17.65 11.49 23.88 4.22 3.64 8.94 6.2 14.16 7.68-2.6 7.56-5.63 15.02-9.08 22.39zM119.22 33.15c0-6.9 2.53-13.62 7.6-20.17 5.07-6.55 11.47-11.06 19.2-13.53.25 1.02.38 2.05.38 3.1 0 6.89-2.64 13.84-7.92 20.85-5.28 7.02-11.66 11.42-19.14 13.2-.08-1.15-.12-2.3-.12-3.45z" />
    </svg>
  );
}

// ─── PasswordInput sub-componente ────────────────────────────────────────────
interface PasswordInputProps {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  hint?: string;
}

function PasswordInput({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  disabled,
  hint,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-xs font-semibold uppercase tracking-wider text-foreground"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={name === "password" ? "new-password" : "new-password"}
          required
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="
            w-full rounded-lg border border-border bg-card px-4 py-3 pr-11
            text-sm text-foreground placeholder:text-muted-foreground/60 shadow-sm
            transition-all duration-200
            focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40
            disabled:opacity-50
          "
        />
        <button
          type="button"
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          onClick={() => setVisible((v) => !v)}
          className="
            absolute inset-y-0 right-0 flex items-center pr-3.5
            text-muted-foreground transition-colors
            hover:text-foreground focus:outline-none
          "
        >
          {visible ? (
            <EyeOff className="size-4" strokeWidth={1.6} />
          ) : (
            <Eye className="size-4" strokeWidth={1.6} />
          )}
        </button>
      </div>
      {hint && (
        <p className="flex items-center gap-1.5 pt-0.5 text-[11px] text-muted-foreground">
          <Info className="size-3.5 shrink-0" strokeWidth={1.5} />
          {hint}
        </p>
      )}
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────
export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== repeatPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    startTransition(async () => {
      // TODO: conectar con Server Action / API Route de registro
      await new Promise((r) => setTimeout(r, 800));
      console.log("Registro con:", email);
    });
  }

  const isFormValid =
    email.length > 0 && password.length >= 8 && repeatPassword.length > 0;

  return (
    <div className="space-y-5">
      {/* ── Formulario de registro ── */}
      <form
        id="register-form"
        onSubmit={handleSubmit}
        className="space-y-4"
        noValidate
      >
        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="register-email"
            className="block text-xs font-semibold uppercase tracking-wider text-foreground"
          >
            Correo electrónico
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="m@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
            className="
              w-full rounded-lg border border-border bg-card px-4 py-3
              text-sm text-foreground placeholder:text-muted-foreground/60 shadow-sm
              transition-all duration-200
              focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40
              disabled:opacity-50
            "
          />
        </div>

        {/* Contraseña */}
        <PasswordInput
          id="register-password"
          name="password"
          label="Contraseña"
          placeholder="Mínimo 8 caracteres"
          value={password}
          onChange={setPassword}
          disabled={isPending}
          hint="Mínimo 8 caracteres, al menos una mayúscula y un número."
        />

        {/* Repetir contraseña */}
        <PasswordInput
          id="register-repeat-password"
          name="repeat-password"
          label="Repetir contraseña"
          placeholder="Repite tu contraseña"
          value={repeatPassword}
          onChange={setRepeatPassword}
          disabled={isPending}
        />

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
        <div className="pt-1">
          <button
            id="register-submit-btn"
            type="submit"
            disabled={isPending || !isFormValid}
            className="
              flex w-full items-center justify-center gap-2
              rounded-lg bg-primary px-6 py-3.5
              text-sm font-medium tracking-wide text-primary-foreground
              shadow-sm shadow-primary/20 transition-all duration-150 ease-in-out
              hover:bg-primary/90 active:scale-[0.99]
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
              disabled:cursor-not-allowed disabled:opacity-60
            "
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Registrarme
          </button>
        </div>
      </form>

      {/* ── Divisor ── */}
      <div className="relative flex items-center" aria-hidden="true">
        <div className="flex-grow border-t border-border" />
        <span className="mx-4 flex-shrink text-xs font-medium lowercase text-muted-foreground">
          o
        </span>
        <div className="flex-grow border-t border-border" />
      </div>

      {/* ── Auth social ── */}
      <div id="register-social-auth" className="space-y-2.5">
        {/* Google */}
        <button
          type="button"
          id="register-google-btn"
          className="
            flex w-full items-center justify-center gap-3
            rounded-lg border border-border bg-card px-4 py-3
            text-xs font-medium tracking-wide text-foreground shadow-sm
            transition-colors hover:bg-muted
            focus:outline-none focus:ring-2 focus:ring-primary/25
          "
        >
          <GoogleIcon />
          <span>Continuar con Google</span>
        </button>

        {/* Apple */}
        <button
          type="button"
          id="register-apple-btn"
          className="
            flex w-full items-center justify-center gap-3
            rounded-lg border border-border bg-card px-4 py-3
            text-xs font-medium tracking-wide text-foreground shadow-sm
            transition-colors hover:bg-muted
            focus:outline-none focus:ring-2 focus:ring-primary/25
          "
        >
          <AppleIcon />
          <span>Continuar con Apple</span>
        </button>
      </div>
    </div>
  );
}
