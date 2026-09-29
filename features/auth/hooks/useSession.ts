"use client";

/**
 * features/auth/hooks/useSession.ts
 *
 * Hook de React Query que consulta GET /api/auth/me y devuelve el usuario
 * autenticado (o null si no hay sesión).
 *
 * ¿Por qué React Query y no un simple useState + useEffect?
 *  - Caché compartida entre todos los componentes: el header, la página de
 *    perfil, etc. comparten el mismo fetch.
 *  - Se sincroniza automáticamente cuando el usuario hace foco en la ventana,
 *    cosa importante en e-commerce (carritos, stock).
 *  - `staleTime` evita un fetch por cada render; solo refresca cuando es
 *    necesario.
 */

import { useQuery } from "@tanstack/react-query";
import type { SessionUser } from "@/features/auth/types/auth.interface";

interface MeResponse {
  user: SessionUser | null;
}

async function fetchMe(): Promise<SessionUser | null> {
  const res = await fetch("/api/auth/me", { credentials: "same-origin" });
  if (!res.ok) return null;
  const data: MeResponse = await res.json();
  return data.user;
}

export function useSession() {
  const { data: user, isLoading } = useQuery<SessionUser | null>({
    queryKey: ["session"],
    queryFn: fetchMe,
    staleTime: 60_000,          // no refresca si tiene menos de 1 min
    refetchOnWindowFocus: false, // en e-commerce no queremos perder el foco
  });

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "ADMIN",
  };
}
