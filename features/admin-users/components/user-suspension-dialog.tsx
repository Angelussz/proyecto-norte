"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { SuspendAdminUserDto } from "@/features/admin-users/types/admin-user.interface";

interface UserSuspensionDialogProps {
  userName: string;
  open: boolean;
  isPending: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: (data: SuspendAdminUserDto) => void;
}

type SuspensionMode = "duration" | "custom";

const durationOptions = [
  { label: "1 día", value: 1 },
  { label: "7 días", value: 7 },
  { label: "15 días", value: 15 },
  { label: "30 días", value: 30 },
] as const;

export function UserSuspensionDialog({
  userName,
  open,
  isPending,
  error,
  onClose,
  onConfirm,
}: UserSuspensionDialogProps) {
  if (!open) return null;

  return (
    <UserSuspensionDialogContent
      key={userName}
      userName={userName}
      isPending={isPending}
      error={error}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}

function UserSuspensionDialogContent({
  userName,
  isPending,
  error,
  onClose,
  onConfirm,
}: Omit<UserSuspensionDialogProps, "open">) {
  const [mode, setMode] = useState<SuspensionMode>("duration");
  const [duration, setDuration] = useState<1 | 7 | 15 | 30>(7);
  const [customDate, setCustomDate] = useState("");
  const [reason, setReason] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const [minimumDate] = useState(() => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 1);

    return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanReason = reason.trim();

    if (cleanReason.length < 3) {
      setValidationError("El motivo debe tener al menos 3 caracteres.");
      return;
    }

    if (cleanReason.length > 2000) {
      setValidationError("El motivo no puede superar los 2000 caracteres.");
      return;
    }

    if (mode === "custom") {
      if (!customDate) {
        setValidationError("Seleccioná una fecha de finalización.");
        return;
      }

      const selectedDate = new Date(customDate);

      if (Number.isNaN(selectedDate.getTime()) || selectedDate.getTime() <= Date.now()) {
        setValidationError("La fecha debe ser posterior a la fecha actual.");
        return;
      }

      onConfirm({
        reason: cleanReason,
        suspended_until: selectedDate.toISOString(),
      });

      return;
    }

    onConfirm({
      reason: cleanReason,
      duration_days: duration,
    });
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="suspension-dialog-title"
        className="w-full max-w-lg border border-border bg-card text-foreground shadow-2xl"
      >
        <header className="border-b border-border px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
            Administración de usuarios
          </p>

          <h2 id="suspension-dialog-title" className="mt-1 text-base font-bold text-foreground">
            Suspender usuario
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Vas a suspender la cuenta de <strong className="text-foreground">{userName}</strong>.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          <div>
            <p className="mb-2 text-xs font-semibold text-foreground">Duración de la suspensión</p>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setMode("duration");
                  setValidationError(null);
                }}
                className={`border px-3 py-2 text-sm transition-colors disabled:opacity-50 ${
                  mode === "duration"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-foreground hover:bg-muted/40"
                }`}
              >
                Por duración
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setMode("custom");
                  setValidationError(null);
                }}
                className={`border px-3 py-2 text-sm transition-colors disabled:opacity-50 ${
                  mode === "custom"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-foreground hover:bg-muted/40"
                }`}
              >
                Fecha personalizada
              </button>
            </div>
          </div>

          {mode === "duration" ? (
            <div>
              <label
                htmlFor="suspension-duration"
                className="mb-2 block text-xs font-semibold text-foreground"
              >
                Seleccionar duración
              </label>

              <select
                id="suspension-duration"
                value={duration}
                disabled={isPending}
                onChange={(event) => setDuration(Number(event.target.value) as 1 | 7 | 15 | 30)}
                className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary disabled:opacity-50"
              >
                {durationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label
                htmlFor="suspension-date"
                className="mb-2 block text-xs font-semibold text-foreground"
              >
                Fecha y hora de finalización
              </label>

              <input
                id="suspension-date"
                type="datetime-local"
                value={customDate}
                disabled={isPending}
                onChange={(event) => setCustomDate(event.target.value)}
                min={minimumDate}
                className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary disabled:opacity-50"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="suspension-reason"
              className="mb-2 block text-xs font-semibold text-foreground"
            >
              Motivo de la suspensión
            </label>

            <textarea
              id="suspension-reason"
              value={reason}
              disabled={isPending}
              onChange={(event) => setReason(event.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="Explicá el motivo de la suspensión..."
              className="w-full resize-y border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary disabled:opacity-50"
            />

            <p className="mt-1 text-right text-xs text-muted-foreground">
              {reason.length}/2000 caracteres
            </p>
          </div>

          {(validationError || error) && (
            <div
              role="alert"
              className="border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive"
            >
              {validationError || error}
            </div>
          )}

          <footer className="flex flex-col-reverse gap-2 border-t border-border bg-muted/20 pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>

            <Button type="submit" disabled={isPending}>
              {isPending ? "Procesando..." : "Confirmar suspensión"}
            </Button>
          </footer>
        </form>
      </section>
    </div>
  );
}
