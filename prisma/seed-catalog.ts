
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { CATEGORIES_MOCK, PRODUCTS_MOCK } from "../lib/mocks";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Falta DATABASE_URL en el archivo .env");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

async function main() {
  const categoryIds = new Map<string, string>();

  for (const category of CATEGORIES_MOCK) {
    const savedCategory = await prisma.categories.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        image_url: category.image_url,
      },
      create: {
        name: category.name,
        slug: category.slug,
        image_url: category.image_url,
      },
    });

    categoryIds.set(category.slug, savedCategory.id);
  }

  for (const [index, item] of PRODUCTS_MOCK.entries()) {
    const categorySlug = item.category.toLowerCase().replace(/\s+/g, "-");
    const categoryId = categoryIds.get(categorySlug);

    if (!categoryId) {
      throw new Error(
        `No existe la categoría "${item.category}" para "${item.name}".`
      );
    }

    const productSlug =
      `${item.name.toLowerCase().replace(/\s+/g, "-")}-${index + 1}`;

    const product = await prisma.products.upsert({
      where: { slug: productSlug },
      update: {
        name: item.name,
        category_id: categoryId,
        base_price: item.price,
        image_url: item.image,
        active: true,
      },
      create: {
        name: item.name,
        slug: productSlug,
        description: `Producto de catálogo: ${item.name}`,
        material: "Lino",
        base_price: item.price,
        active: true,
        image_url: item.image,
        category_id: categoryId,
      },
    });

    for (const size of ["S", "M", "L"]) {
      const sku = `${productSlug.toUpperCase()}-${size}`;

      await prisma.productVariants.upsert({
        where: { sku },
        update: {
          product_id: product.id,
          size,
          color: "Natural",
          price: item.price,
          unit_cost: Number(item.price) / 2,
          stock: 10,
          active: true,
          image_url: item.image,
        },
        create: {
          product_id: product.id,
          sku,
          size,
          color: "Natural",
          price: item.price,
          unit_cost: Number(item.price) / 2,
          stock: 10,
          active: true,
          image_url: item.image,
        },
      });
    }

    console.log(`Producto procesado: ${item.name}`);
  }

  const [categories, products, variants] = await Promise.all([
    prisma.categories.count(),
    prisma.products.count(),
    prisma.productVariants.count(),
  ]);

  console.log({
    categoriasEnBase: categories,
    productosEnBase: products,
    variantesEnBase: variants,
  });
}

main()
  .catch((error) => {
    console.error("Error al recuperar el catálogo:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
