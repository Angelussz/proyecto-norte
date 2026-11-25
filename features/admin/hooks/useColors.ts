"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ColorDto,
  CreateColorBody,
  UpdateColorBody,
} from "@/features/admin/types/brand-color.interface";

const COLORS_KEY = ["colors"] as const;

// ── Fetchers ──────────────────────────────────────────────────────────────────

async function fetchColors(): Promise<ColorDto[]> {
  const res = await fetch("/api/admin/colors");
  if (!res.ok) throw new Error("Error al obtener los colores.");
  const json = await res.json();
  return json.data as ColorDto[];
}

async function fetchCreateColor(body: CreateColorBody): Promise<ColorDto> {
  const res = await fetch("/api/admin/colors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Error al crear el color.");
  const json = await res.json();
  return json.data as ColorDto;
}

async function fetchUpdateColor({
  id,
  body,
}: {
  id: string;
  body: UpdateColorBody;
}): Promise<ColorDto> {
  const res = await fetch(`/api/admin/colors/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Error al actualizar el color.");
  const json = await res.json();
  return json.data as ColorDto;
}

async function fetchDeleteColor(id: string): Promise<void> {
  const res = await fetch(`/api/admin/colors/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.error ?? "Error al eliminar el color.");
  }
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useColors() {
  return useQuery({ queryKey: COLORS_KEY, queryFn: fetchColors });
}

export function useCreateColor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fetchCreateColor,
    onSuccess: () => qc.invalidateQueries({ queryKey: COLORS_KEY }),
  });
}

export function useUpdateColor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fetchUpdateColor,
    onSuccess: () => qc.invalidateQueries({ queryKey: COLORS_KEY }),
  });
}

export function useDeleteColor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fetchDeleteColor,
    onSuccess: () => qc.invalidateQueries({ queryKey: COLORS_KEY }),
  });
}
