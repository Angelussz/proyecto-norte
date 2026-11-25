/**
 * lib/sort-sizes.ts
 *
 * Utilidades para ordenar talles según el orden canónico de los sistemas
 * de talles definidos en la DB (SizeGroupDto[]).
 *
 * Uso:
 *   import { buildSizeOrderMap, sortSizesBySystem } from "@/lib/sort-sizes";
 *   const map = buildSizeOrderMap(sizeGroupsData);
 *   const ordered = sortSizesBySystem(mySizes, map);
 */

import type { SizeGroupDto } from "@/features/admin/types/size-system.interface";

/**
 * Construye un mapa { talle_normalizado → posición_global } recorriendo todos
 * los sistemas activos en orden de grupo → sistema → posición dentro del sistema.
 * El primer sistema que define un talle "gana" (igual que en el modal).
 */
export function buildSizeOrderMap(groups: SizeGroupDto[]): Map<string, number> {
  const map = new Map<string, number>();
  let globalIdx = 0;
  for (const group of groups) {
    for (const sys of group.systems.filter((s) => s.active)) {
      for (const size of sys.sizes) {
        const key = size.toLowerCase().trim();
        if (!map.has(key)) {
          map.set(key, globalIdx++);
        }
      }
    }
  }
  return map;
}

/**
 * Ordena un array de talles usando el mapa canónico.
 * Los talles que no se encuentran en el mapa van al final (posición 9999).
 */
export function sortSizesBySystem(sizes: string[], orderMap: Map<string, number>): string[] {
  return [...sizes].sort((a, b) => {
    const ia = orderMap.get(a.toLowerCase().trim()) ?? 9999;
    const ib = orderMap.get(b.toLowerCase().trim()) ?? 9999;
    return ia - ib;
  });
}
