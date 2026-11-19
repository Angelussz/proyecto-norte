import { NextResponse } from "next/server";
import { handleAdminError } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/inventory
 *
 * Devuelve todos los productos activos con sus variantes agrupadas en una
 * StockMatrix { talle: { colorName: stock } } lista para usar en el inventario.
 *
 * Respuesta:
 * {
 *   data: InventoryProductDto[]
 * }
 *
 * InventoryProductDto {
 *   id, sku (del 1er SKU), category, name, pvp,
 *   sizes: string[],
 *   colors: { name, hex }[],
 *   stock: { [talle]: { [colorName]: number } },
 *   variants: { id, sku, size, colorName, colorHex, stock }[]  ← para el PATCH individual
 *   totalStock: number,
 *   stockLevel: "healthy" | "low" | "critical"
 * }
 */
export async function GET() {
  try {
    const products = await prisma.products.findMany({
      where: { active: true },
      orderBy: { created_at: "desc" },
      include: {
        category: { select: { name: true } },
        variants: {
          where: { active: true },
          orderBy: [{ size: "asc" }, { color: "asc" }],
        },
      },
    });

    const data = products.map((p) => {
      // Construir la lista de colores únicos (conservando el nombre + hex)
      // Convención del seed: la columna `color` guarda el HEX (#xxxxxx)
      // El nombre del color NO está en la DB → lo aproximamos a partir del hex
      // usando el nombre del campo `color` tal cual está guardado.
      // Si hay campo `color_name` en el futuro, se usaría ese.
      const colorMap = new Map<string, { name: string; hex: string }>();
      const sizeSet = new Set<string>();

      for (const v of p.variants) {
        // La columna `color` guarda el hex. Usamos el hex como clave y como nombre temporal.
        const hex = v.color.startsWith("#") ? v.color : `#${v.color}`;
        if (!colorMap.has(hex)) {
          colorMap.set(hex, { name: hex, hex });
        }
        sizeSet.add(v.size);
      }

      const colors = Array.from(colorMap.values());
      const sizes = Array.from(sizeSet);

      // StockMatrix { talle: { hex: stock } }
      const stock: Record<string, Record<string, number>> = {};
      for (const size of sizes) {
        stock[size] = {};
        for (const color of colors) {
          stock[size][color.hex] = 0;
        }
      }
      for (const v of p.variants) {
        const hex = v.color.startsWith("#") ? v.color : `#${v.color}`;
        if (stock[v.size]) {
          stock[v.size][hex] = v.stock;
        }
      }

      const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
      const stockLevel: "healthy" | "low" | "critical" =
        totalStock === 0 ? "critical" : totalStock < 15 ? "low" : "healthy";

      return {
        id: p.id,
        sku: p.variants[0]?.sku?.split("-").slice(0, 2).join("-") ?? p.id,
        category: p.category.name.toUpperCase(),
        name: p.name,
        pvp: `${Number(p.base_price).toFixed(2)} €`,
        sizes,
        colors,
        stock,
        // variantes individuales con sus IDs para hacer PATCH
        variants: p.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          size: v.size,
          colorName: v.color.startsWith("#") ? v.color : `#${v.color}`,
          colorHex: v.color.startsWith("#") ? v.color : `#${v.color}`,
          stock: v.stock,
        })),
        totalStock,
        stockLevel,
        imageUrl: p.image_url,
      };
    });

    return NextResponse.json({ data });
  } catch (err) {
    return handleAdminError(err, "GET /api/admin/inventory");
  }
}
