import { NextRequest, NextResponse } from "next/server";
import { handleAdminError } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/inventory
 *
 * Devuelve todos los productos activos de la base de datos con sus variantes
 * agrupadas en una matriz de stock StockMatrix { [talle]: { [colorName]: stock } }.
 */
export async function GET() {
  try {
    const [products, dbColors] = await Promise.all([
      prisma.products.findMany({
        where: { active: true },
        orderBy: { created_at: "desc" },
        include: {
          category: { select: { name: true } },
          variants: {
            where: { active: true },
            orderBy: [{ size: "asc" }, { color: "asc" }],
          },
        },
      }),
      prisma.color.findMany({
        where: { active: true },
        orderBy: { sort_order: "asc" },
      }),
    ]);

    const colorLookupByHex = new Map<string, { name: string; hex: string }>();
    const colorLookupByName = new Map<string, { name: string; hex: string }>();

    for (const c of dbColors) {
      const hex = c.hex.startsWith("#") ? c.hex : `#${c.hex}`;
      colorLookupByHex.set(hex.toLowerCase(), { name: c.name, hex });
      colorLookupByName.set(c.name.trim().toLowerCase(), { name: c.name, hex });
    }

    const data = products.map((p) => {
      const colorMap = new Map<string, { name: string; hex: string }>();
      const sizeSet = new Set<string>();

      for (const v of p.variants) {
        const rawColor = v.color.trim();
        const hexCandidate = rawColor.startsWith("#") ? rawColor : `#${rawColor}`;
        const matched =
          colorLookupByHex.get(hexCandidate.toLowerCase()) ??
          colorLookupByName.get(rawColor.toLowerCase());

        const colorName = matched?.name ?? rawColor;
        const colorHex = matched?.hex ?? hexCandidate;

        if (!colorMap.has(colorName)) {
          colorMap.set(colorName, { name: colorName, hex: colorHex });
        }
        if (v.size) {
          sizeSet.add(v.size);
        }
      }

      const colors = Array.from(colorMap.values());
      const sizes = Array.from(sizeSet);

      const stock: Record<string, Record<string, number>> = {};
      for (const size of sizes) {
        stock[size] = {};
        for (const c of colors) {
          stock[size][c.name] = 0;
        }
      }

      for (const v of p.variants) {
        const rawColor = v.color.trim();
        const hexCandidate = rawColor.startsWith("#") ? rawColor : `#${rawColor}`;
        const matched =
          colorLookupByHex.get(hexCandidate.toLowerCase()) ??
          colorLookupByName.get(rawColor.toLowerCase());
        const colorName = matched?.name ?? rawColor;

        if (stock[v.size]) {
          stock[v.size][colorName] = v.stock;
        }
      }

      const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
      const stockLevel: "healthy" | "low" | "critical" =
        totalStock === 0 ? "critical" : totalStock < 15 ? "low" : "healthy";

      const firstSku = p.variants[0]?.sku;
      let sku = p.id.slice(0, 8).toUpperCase();
      if (firstSku) {
        const parts = firstSku.split("-");
        sku = parts.length >= 2 ? `${parts[0]}-${parts[1]}` : firstSku;
      }

      return {
        id: p.id,
        sku,
        category: p.category.name.toUpperCase(),
        name: p.name,
        pvp: `$${Number(p.base_price).toFixed(2)}`,
        sizes,
        colors,
        stock,
        totalStock,
        stockLevel,
        expanded: false,
        image: p.image_url ?? "",
      };
    });

    return NextResponse.json({ data });
  } catch (err) {
    return handleAdminError(err, "GET /api/admin/inventory");
  }
}

/**
 * PUT /api/admin/inventory
 *
 * Actualiza la matriz de stock de un producto (talles, colores y stock).
 * Crea o reactiva variantes necesarias, actualiza cantidades y desactiva
 * variantes retiradas de la matriz.
 */
export async function PUT(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      productId: string;
      sizes: string[];
      colors: { name: string; hex: string }[];
      stock: Record<string, Record<string, number>>;
    };

    const { productId, sizes, colors, stock } = body;
    if (!productId || !Array.isArray(sizes) || !Array.isArray(colors)) {
      return NextResponse.json(
        { error: "productId, sizes y colors son requeridos." },
        { status: 400 },
      );
    }

    const product = await prisma.products.findUnique({
      where: { id: productId },
      include: {
        category: true,
        variants: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
    }

    const dbColors = await prisma.color.findMany();
    const colorLookupByHex = new Map(dbColors.map((c) => [c.hex.toLowerCase(), c]));
    const colorLookupByName = new Map(dbColors.map((c) => [c.name.trim().toLowerCase(), c]));

    let baseSku = product.id.slice(0, 8).toUpperCase();
    const firstSku = product.variants.find((v) => v.sku)?.sku;
    if (firstSku) {
      const parts = firstSku.split("-");
      if (parts.length >= 2) {
        baseSku = `${parts[0]}-${parts[1]}`;
      }
    } else {
      const catCode = product.category.name.slice(0, 3).toUpperCase();
      baseSku = `NRT-${catCode}`;
    }

    await prisma.$transaction(async (tx) => {
      // 1. Actualizar o crear variantes para cada combinación (talle, color)
      for (const size of sizes) {
        for (const color of colors) {
          const qty = Math.max(0, Number(stock[size]?.[color.name] ?? 0));
          const colorHex = color.hex.startsWith("#") ? color.hex : `#${color.hex}`;

          const existing = product.variants.find(
            (v) =>
              v.size === size &&
              (v.color.toLowerCase() === colorHex.toLowerCase() ||
                v.color.toLowerCase() === color.name.toLowerCase()),
          );

          if (existing) {
            await tx.productVariants.update({
              where: { id: existing.id },
              data: {
                stock: qty,
                active: true,
                color: colorHex,
              },
            });
          } else {
            const dbCol =
              colorLookupByHex.get(colorHex.toLowerCase()) ??
              colorLookupByName.get(color.name.toLowerCase());
            const colorCode =
              dbCol?.sku_code ??
              (color.name
                .replace(/[^a-zA-Z]/g, "")
                .slice(0, 3)
                .toUpperCase() ||
                "COL");
            const cleanSize = size.toUpperCase().replace(/\s+/g, "");

            let candidateSku = `${baseSku}-${colorCode}-${cleanSize}`;
            const skuCollision = await tx.productVariants.findUnique({
              where: { sku: candidateSku },
            });
            if (skuCollision && skuCollision.product_id !== productId) {
              candidateSku = `${candidateSku}-${Date.now().toString().slice(-4)}`;
            } else if (skuCollision && skuCollision.product_id === productId) {
              await tx.productVariants.update({
                where: { id: skuCollision.id },
                data: {
                  size,
                  color: colorHex,
                  stock: qty,
                  active: true,
                },
              });
              continue;
            }

            await tx.productVariants.create({
              data: {
                product_id: productId,
                sku: candidateSku,
                size,
                color: colorHex,
                price: product.base_price,
                unit_cost: 0,
                stock: qty,
                active: true,
              },
            });
          }
        }
      }

      // 2. Desactivar variantes que fueron eliminadas de la matriz
      const activeVariants = product.variants.filter((v) => v.active);
      for (const v of activeVariants) {
        const rawHex = v.color.startsWith("#") ? v.color : `#${v.color}`;
        const stillInSizes = sizes.includes(v.size);
        const stillInColors = colors.some(
          (c) =>
            c.hex.toLowerCase() === rawHex.toLowerCase() ||
            c.name.toLowerCase() === v.color.toLowerCase(),
        );

        if (!stillInSizes || !stillInColors) {
          await tx.productVariants.update({
            where: { id: v.id },
            data: { active: false, stock: 0 },
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleAdminError(err, "PUT /api/admin/inventory");
  }
}
