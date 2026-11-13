/**
 * features/admin/hooks/useSizeGroups.ts
 *
 * Hooks de React Query para consumir la API de Sistemas de Talles.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  SizeGroupDto,
  CreateSizeGroupBody,
  UpdateSizeGroupBody,
} from "@/features/admin/types/size-system.interface";

const BASE = "/api/admin/size-groups";

// ─── Fetchers ─────────────────────────────────────────────────────────────────
async function fetchGroups(): Promise<SizeGroupDto[]> {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error("Error al cargar los sistemas de talles.");
  const json = await res.json();
  return json.data as SizeGroupDto[];
}

async function createGroup(body: CreateSizeGroupBody): Promise<SizeGroupDto> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Error al crear el grupo.");
  }
  const json = await res.json();
  return json.data as SizeGroupDto;
}

async function updateGroup(id: string, body: UpdateSizeGroupBody): Promise<SizeGroupDto> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Error al actualizar el grupo.");
  }
  const json = await res.json();
  return json.data as SizeGroupDto;
}

async function deleteGroup(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Error al eliminar el grupo.");
  }
}

async function deleteSystem(groupId: string, systemId: string): Promise<void> {
  const res = await fetch(`${BASE}/${groupId}/systems/${systemId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Error al eliminar el sistema.");
  }
}

async function toggleSystem(
  groupId: string,
  systemId: string,
  active: boolean,
): Promise<{ id: string; active: boolean }> {
  const res = await fetch(`${BASE}/${groupId}/systems/${systemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ active }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Error al actualizar el sistema.");
  }
  const json = await res.json();
  return json.data;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────
export function useSizeGroups() {
  return useQuery<SizeGroupDto[], Error>({
    queryKey: ["admin", "size-groups"],
    queryFn: fetchGroups,
    staleTime: 60_000,
  });
}

export function useCreateSizeGroup() {
  const qc = useQueryClient();
  return useMutation<SizeGroupDto, Error, CreateSizeGroupBody>({
    mutationFn: createGroup,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "size-groups"] }),
  });
}

export function useUpdateSizeGroup() {
  const qc = useQueryClient();
  return useMutation<SizeGroupDto, Error, { id: string; body: UpdateSizeGroupBody }>({
    mutationFn: ({ id, body }) => updateGroup(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "size-groups"] }),
  });
}

export function useDeleteSizeGroup() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteGroup,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "size-groups"] }),
  });
}

export function useDeleteSizeSystem() {
  const qc = useQueryClient();
  return useMutation<void, Error, { groupId: string; systemId: string }>({
    mutationFn: ({ groupId, systemId }) => deleteSystem(groupId, systemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "size-groups"] }),
  });
}

export function useToggleSizeSystem() {
  const qc = useQueryClient();
  return useMutation<
    { id: string; active: boolean },
    Error,
    { groupId: string; systemId: string; active: boolean }
  >({
    mutationFn: ({ groupId, systemId, active }) => toggleSystem(groupId, systemId, active),
    // Optimistic update: actualiza la caché sin esperar al servidor
    onMutate: async ({ groupId, systemId, active }) => {
      await qc.cancelQueries({ queryKey: ["admin", "size-groups"] });
      const prev = qc.getQueryData<SizeGroupDto[]>(["admin", "size-groups"]);
      qc.setQueryData<SizeGroupDto[]>(["admin", "size-groups"], (old) =>
        (old ?? []).map((g) =>
          g.id !== groupId
            ? g
            : {
                ...g,
                systems: g.systems.map((s) => (s.id !== systemId ? s : { ...s, active })),
              },
        ),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      // Si falla, revertimos
      if (ctx && (ctx as { prev: SizeGroupDto[] | undefined }).prev) {
        qc.setQueryData(["admin", "size-groups"], (ctx as { prev: SizeGroupDto[] }).prev);
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["admin", "size-groups"] }),
  });
}
