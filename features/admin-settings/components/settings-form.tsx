"use client";

import { useState } from "react";
import { Save, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAdminSettings } from "../hooks/useAdminSettings";
import { useUpdateAdminSettings } from "../hooks/useUpdateAdminSettings";
import type { AdminSettings, UpdateAdminSettingsDto } from "../types/admin-settings.interface";

interface SettingsFormValues {
  shippingCost: string;
  shippingLabel: string;
  freeShippingThreshold: string;
  taxRate: string;
}

const EMPTY_FORM: SettingsFormValues = {
  shippingCost: "",
  shippingLabel: "",
  freeShippingThreshold: "",
  taxRate: "",
};

function settingsToForm(settings: AdminSettings): SettingsFormValues {
  return {
    shippingCost: String(settings.shippingCost),
    shippingLabel: settings.shippingLabel,
    freeShippingThreshold:
      settings.freeShippingThreshold === null ? "" : String(settings.freeShippingThreshold),
    taxRate: String(settings.taxRate * 100),
  };
}

export function SettingsForm() {
  const { settings, isLoading, isError, error, refetch } = useAdminSettings();

  const {
    updateSettingsAsync,
    isPending,
    error: updateError,
    reset: resetMutation,
  } = useUpdateAdminSettings();

  const [formDraft, setFormDraft] = useState<SettingsFormValues | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = formDraft ?? (settings ? settingsToForm(settings) : EMPTY_FORM);

  function handleChange(field: keyof SettingsFormValues, value: string) {
    setFormDraft((previous) => ({
      ...(previous ?? form),
      [field]: value,
    }));

    setValidationError(null);
    setSuccessMessage(null);
    resetMutation();
  }

  function handleReset() {
    if (!settings) return;

    setFormDraft(null);
    setValidationError(null);
    setSuccessMessage(null);
    resetMutation();
  }

  function buildPayload(): UpdateAdminSettingsDto | null {
    const shippingCostText = form.shippingCost.trim();
    const taxRateText = form.taxRate.trim();
    const thresholdText = form.freeShippingThreshold.trim();
    const shippingLabel = form.shippingLabel.trim();

    if (!shippingCostText || !taxRateText) {
      setValidationError("El costo de envío y el porcentaje de impuestos son obligatorios.");
      return null;
    }

    const shippingCost = Number(shippingCostText);
    const taxPercentage = Number(taxRateText);
    const freeShippingThreshold = thresholdText === "" ? null : Number(thresholdText);

    if (!Number.isFinite(shippingCost) || shippingCost < 0 || shippingCost > 1_000_000) {
      setValidationError("El costo de envío debe estar entre 0 y 1.000.000.");
      return null;
    }

    if (!shippingLabel || shippingLabel.length > 80) {
      setValidationError("La etiqueta de envío es obligatoria y admite hasta 80 caracteres.");
      return null;
    }

    if (
      freeShippingThreshold !== null &&
      (!Number.isFinite(freeShippingThreshold) ||
        freeShippingThreshold < 0 ||
        freeShippingThreshold > 1_000_000)
    ) {
      setValidationError("El umbral de envío gratis debe estar entre 0 y 1.000.000.");
      return null;
    }

    if (!Number.isFinite(taxPercentage) || taxPercentage < 0 || taxPercentage > 100) {
      setValidationError("El impuesto debe estar entre 0% y 100%.");
      return null;
    }

    const payload: UpdateAdminSettingsDto = {};

    if (shippingCost !== settings?.shippingCost) {
      payload.shippingCost = shippingCost;
    }

    if (shippingLabel !== settings?.shippingLabel) {
      payload.shippingLabel = shippingLabel;
    }

    if (freeShippingThreshold !== settings?.freeShippingThreshold) {
      payload.freeShippingThreshold = freeShippingThreshold;
    }

    const taxRate = taxPercentage / 100;

    if (taxRate !== settings?.taxRate) {
      payload.taxRate = taxRate;
    }

    if (Object.keys(payload).length === 0) {
      setValidationError("No hay cambios para guardar.");
      return null;
    }

    return payload;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!settings || isPending) return;

    setValidationError(null);
    setSuccessMessage(null);

    const payload = buildPayload();

    if (!payload) return;

    try {
      await updateSettingsAsync(payload);
      setFormDraft(null);
      setSuccessMessage("La configuración se guardó correctamente.");
    } catch {
      // El error se muestra mediante updateError.
    }
  }

  const hasChanges =
    !!settings &&
    (form.shippingCost.trim() === "" ||
      Number(form.shippingCost) !== settings.shippingCost ||
      form.shippingLabel.trim() !== settings.shippingLabel ||
      (form.freeShippingThreshold.trim() === ""
        ? settings.freeShippingThreshold !== null
        : Number(form.freeShippingThreshold) !== settings.freeShippingThreshold) ||
      form.taxRate.trim() === "" ||
      Number(form.taxRate) / 100 !== settings.taxRate);

  if (isLoading && !settings) {
    return (
      <div className="border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Cargando configuración...
      </div>
    );
  }

  if (isError && !settings) {
    return (
      <div className="border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        No se pudo cargar la configuración: {error?.message ?? "Error desconocido"}.
        <button type="button" onClick={() => refetch()} className="ml-2 font-semibold underline">
          Reintentar
        </button>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración de envíos</CardTitle>
          <CardDescription>
            Definí el costo, la etiqueta y las condiciones de envío gratis.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="shippingCost">Costo de envío</Label>
            <Input
              id="shippingCost"
              type="number"
              min="0"
              max="1000000"
              step="0.01"
              value={form.shippingCost}
              onChange={(event) => handleChange("shippingCost", event.target.value)}
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Importe aplicado cuando corresponde cobrar el envío.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="shippingLabel">Etiqueta de envío</Label>
            <Input
              id="shippingLabel"
              type="text"
              maxLength={80}
              value={form.shippingLabel}
              onChange={(event) => handleChange("shippingLabel", event.target.value)}
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Nombre que identifica el método o tarifa de envío.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="freeShippingThreshold">Umbral para envío gratis</Label>
            <Input
              id="freeShippingThreshold"
              type="number"
              min="0"
              max="1000000"
              step="0.01"
              placeholder="Dejar vacío para desactivar"
              value={form.freeShippingThreshold}
              onChange={(event) => handleChange("freeShippingThreshold", event.target.value)}
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Monto mínimo de compra para ofrecer envío gratis. Si queda vacío, no se establece un
              umbral.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de impuestos</CardTitle>
          <CardDescription>
            Establecé el porcentaje de impuestos aplicado a las órdenes.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex max-w-sm flex-col gap-2">
            <Label htmlFor="taxRate">Porcentaje de impuestos (%)</Label>
            <Input
              id="taxRate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={form.taxRate}
              onChange={(event) => handleChange("taxRate", event.target.value)}
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Por ejemplo, 18 representa un impuesto del 18%.
            </p>
          </div>
        </CardContent>
      </Card>

      {(validationError || updateError) && (
        <div className="border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {validationError ?? updateError?.message ?? "No se pudieron guardar los cambios."}
        </div>
      )}

      {successMessage && (
        <div className="border border-green-300 bg-green-50 p-4 text-sm text-green-800">
          {successMessage}
        </div>
      )}

      <div className="flex flex-wrap justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={!hasChanges || isPending}
        >
          <RotateCcw />
          Descartar cambios
        </Button>

        <Button type="submit" disabled={!hasChanges || isPending}>
          <Save />
          {isPending ? "Guardando..." : "Guardar configuración"}
        </Button>
      </div>
    </form>
  );
}
