import "dotenv/config";
import { prisma } from "../lib/prisma";
import { PRODUCTS_MOCK } from "../lib/mocks";

async function main() {
  console.log("Iniciando seed de la base de datos...");

  // Categorías base
  const categoriesMap = new Map<string, string>();

  for (const item of PRODUCTS_MOCK) {
    const slug = item.category.toLowerCase().replace(/\s+/g, "-");
    if (!categoriesMap.has(slug)) {
      const category = await prisma.categories.upsert({
        where: { slug },
        update: { name: item.category },
        create: {
          name: item.category,
          slug,
          description: `Categoría ${item.category}`,
        },
      });
      categoriesMap.set(slug, category.id);
    }
  }

  // Productos y variantes
  for (let i = 0; i < PRODUCTS_MOCK.length; i++) {
    const item = PRODUCTS_MOCK[i];
    const categorySlug = item.category.toLowerCase().replace(/\s+/g, "-");
    const categoryId = categoriesMap.get(categorySlug)!;
    const productSlug = `${item.name.toLowerCase().replace(/\s+/g, "-")}-${i + 1}`;

    const product = await prisma.products.upsert({
      where: { slug: productSlug },
      update: {
        base_price: item.price,
        image_url: item.image,
      },
      create: {
        name: item.name,
        slug: productSlug,
        description: `Descripción premium de ${item.name}. Confeccionado con materiales de alta calidad.`,
        material: "100% Algodón / Lino orgánico",
        base_price: item.price,
        active: true,
        image_url: item.image,
        category_id: categoryId,
      },
    });

    // Crear variantes básicas de talles (S, M, L)
    const sizes = ["S", "M", "L"];
    for (const size of sizes) {
      const sku = `${productSlug.toUpperCase()}-${size}`;
      await prisma.productVariants.upsert({
        where: { sku },
        update: { price: item.price },
        create: {
          product_id: product.id,
          sku,
          size,
          color: "Estándar",
          price: item.price,
          unit_cost: Math.round(item.price * 0.5),
          stock: 10,
          active: true,
          image_url: item.image,
        },
      });
    }
  }

  console.log("¡Seed completado exitosamente!");
}

main()
  .catch((e) => {
    console.error("Error al ejecutar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
