"use client";

import { useState } from "react";
import type { SuspendAdminUserDto } from "@/features/admin-users/types/admin-user.interface";
import { Button } from "@/components/ui/button";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="suspension-dialog-title"
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="mb-5">
          <h2 id="suspension-dialog-title" className="text-lg font-semibold text-gray-900">
            Suspender usuario
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            Vas a suspender la cuenta de <strong>{userName}</strong>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Duración de la suspensión</p>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode("duration");
                  setValidationError(null);
                }}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  mode === "duration"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-300 text-gray-700"
                }`}
              >
                Por duración
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("custom");
                  setValidationError(null);
                }}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  mode === "custom"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-300 text-gray-700"
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
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Seleccionar duración
              </label>

              <select
                id="suspension-duration"
                value={duration}
                onChange={(event) => setDuration(Number(event.target.value) as 1 | 7 | 15 | 30)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
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
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Fecha y hora de finalización
              </label>

              <input
                id="suspension-date"
                type="datetime-local"
                value={customDate}
                onChange={(event) => setCustomDate(event.target.value)}
                min={minimumDate}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="suspension-reason"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Motivo de la suspensión
            </label>

            <textarea
              id="suspension-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="Explicá el motivo de la suspensión..."
              className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />

            <p className="mt-1 text-right text-xs text-gray-500">{reason.length}/2000 caracteres</p>
          </div>

          {(validationError || error) && (
            <p role="alert" className="text-sm text-red-600">
              {validationError || error}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>

            <Button type="submit" disabled={isPending}>
              {isPending ? "Procesando..." : "Confirmar suspensión"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
