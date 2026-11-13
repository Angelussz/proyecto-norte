import "dotenv/config";
import { prisma } from "../lib/prisma";
import {
  PRODUCTS_MOCK,
  USERS_MOCK,
  ADDRESSES_MOCK,
  SEED_ORDERS_MOCK,
  ORDER_ITEMS_MOCK,
  CATEGORIES_MOCK,
} from "../lib/mocks";
async function main() {
  console.log("Iniciando seed de la base de datos...");

  // 1. Categorías
  const categoriesMap = new Map<string, string>();
  for (const category of CATEGORIES_MOCK) {
    const record = await prisma.categories.upsert({
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
    categoriesMap.set(category.slug, record.id);
  }

  // 2. Productos y variantes
  for (let i = 0; i < PRODUCTS_MOCK.length; i++) {
    const item = PRODUCTS_MOCK[i];
    const categorySlug = item.category.toLowerCase().replace(/\s+/g, "-");
    const categoryId = categoriesMap.get(categorySlug)!;
    const productSlug = `${item.name.toLowerCase().replace(/\s+/g, "-")}-${i + 1}`;

    const product = await prisma.products.upsert({
      where: { slug: productSlug },
      update: { base_price: item.price, image_url: item.image },
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
          color: "000000", // EL COLOR DEBE SER EN FROMAT HEXADECIMAL
          price: item.price,
          unit_cost: Math.round(item.price * 0.5),
          stock: 10,
          active: true,
          image_url: item.image,
        },
      });
    }
  }

  // 3. Usuarios
  // Hash de la contraseña "admin" (bcrypt, 10 rondas) — usada solo por
  // los usuarios que pueden iniciar sesión con email + contraseña.
  const ADMIN_PASSWORD_HASH = "$2b$10$w8RaRMP8qWos4cjPN8pVmeFfMFl8TvDVQ4PHIw/gn6Y2u47jNSW12";

  // Correos que SOLO pueden iniciar sesión con Google.
  // Su password_hash se deja vacío para que el login con contraseña falle
  // con 401 en lugar de lanzar una excepción de bcrypt.
  const GOOGLE_ONLY_EMAILS = ["briansegovia2022@gmail.com", "angelodelperez@gmail.com"];

  for (const u of USERS_MOCK) {
    const passwordHash = GOOGLE_ONLY_EMAILS.includes(u.email) ? "" : ADMIN_PASSWORD_HASH;
    await prisma.users.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        last_name: u.last_name,
        phone: u.phone,
        password_hash: passwordHash,
        role: u.role,
        // En dev los marcamos como verificados para no necesitar el flujo de email.
        email_verified: true,
        email_verified_at: new Date(),
      },
      create: {
        name: u.name,
        last_name: u.last_name,
        email: u.email,
        phone: u.phone,
        password_hash: passwordHash,
        role: u.role,
        email_verified: true,
        email_verified_at: new Date(),
      },
    });
  }

  // 4. Direcciones
  for (const a of ADDRESSES_MOCK) {
    const user = await prisma.users.findUnique({ where: { email: a.user_email } });
    if (!user) continue;

    const existing = await prisma.address.findFirst({
      where: { user_id: user.id, recipient: a.recipient },
    });
    if (!existing) {
      await prisma.address.create({
        data: {
          user_id: user.id,
          recipient: a.recipient,
          contact_phone: a.contact_phone,
          address_line: a.address_line,
          city: a.city,
          reference: a.reference,
          is_default: a.is_default,
        },
      });
    }
  }

  // 5. Órdenes + Pagos + Comprobantes fiscales
  for (const o of SEED_ORDERS_MOCK) {
    const user = await prisma.users.findUnique({ where: { email: o.user_email } });
    if (!user) continue;

    const address = await prisma.address.findFirst({
      where: { user_id: user.id, is_default: true },
    });
    if (!address) continue;

    const existingOrder = await prisma.orders.findFirst({
      where: { user_id: user.id, status: o.status },
    });

    const order =
      existingOrder ??
      (await prisma.orders.create({
        data: {
          user_id: user.id,
          address_id: address.id,
          subtotal: o.subtotal,
          shipping_cost: o.shipping_cost,
          total: o.total,
          status: o.status,
        },
      }));

    // Pago
    if (o.payment) {
      const existingPay = await prisma.payments.findFirst({
        where: { order_id: order.id },
      });
      if (!existingPay) {
        await prisma.payments.create({
          data: {
            order_id: order.id,
            amount: o.payment.amount,
            payment_method: o.payment.payment_method,
            gateway: o.payment.gateway,
            gateway_transaction_id: o.payment.gateway_transaction_id,
            voucher_url: o.payment.voucher_url,
            status: o.payment.status,
            paid_at: o.payment.paid_at,
          },
        });
      }
    }

    // Comprobante fiscal
    if (o.fiscal_receipt) {
      const existingFiscal = await prisma.fiscalVouchers.findFirst({
        where: { order_id: order.id },
      });
      if (!existingFiscal) {
        await prisma.fiscalVouchers.create({
          data: {
            order_id: order.id,
            voucher_type: o.fiscal_receipt.voucher_type,
            identity_document_type: o.fiscal_receipt.identity_document_type,
            identity_document_number: o.fiscal_receipt.identity_document_number,
            business_name: o.fiscal_receipt.business_name,
            fiscal_address: o.fiscal_receipt.fiscal_address,
            serial_number: o.fiscal_receipt.serial_number,
            fiscal_status: o.fiscal_receipt.fiscal_status,
          },
        });
      }
    }
  }

  // 6. Items de órdenes
  for (const item of ORDER_ITEMS_MOCK) {
    const user = await prisma.users.findUnique({
      where: { email: item.order_ref.user_email },
    });
    if (!user) continue;

    const order = await prisma.orders.findFirst({
      where: { user_id: user.id, status: item.order_ref.status },
    });
    if (!order) continue;

    const existingItem = await prisma.orderDetails.findFirst({
      where: { order_id: order.id, sku_snapshot: item.sku_snapshot },
    });
    if (existingItem) continue;

    const variant = await prisma.productVariants.findFirst({
      where: { sku: item.sku_snapshot },
    });
    if (!variant) {
      console.warn(`Variante no encontrada para SKU: ${item.sku_snapshot}`);
      continue;
    }

    await prisma.orderDetails.create({
      data: {
        order_id: order.id,
        variant_id: variant.id,
        sku_snapshot: item.sku_snapshot,
        product_name_snapshot: item.product_name_snapshot,
        unit_price: item.unit_price,
        quantity: item.quantity,
        subtotal: item.subtotal,
      },
    });
  }

  // 7. Sistemas de Talles (SizeGroup + SizeSystem)
  const SIZE_GROUPS_SEED = [
    {
      title: "1. Ropa General (Poleras, Camisetas, Chaquetas, Ropa Deportiva)",
      description:
        "Prendas de parte superior, prendas de punto y sobrecamisas con patronaje unisex y calce desestructurado.",
      systems: [
        {
          label: "Sistema Alfa Estándar",
          badge: "RECOMENDADO",
          badge_variant: "recommended",
          description:
            "Ideal para todo tipo de prendas superiores con calce regular, holgado o relajado.",
          sizes: ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"],
          active: true,
        },
      ],
    },
    {
      title: "2. Prendas y Accesorios de Talle Único o Adaptable",
      description:
        "Para cualquier prenda o accesorio que maneje un talle único o sea adaptable (sweaters oversize, ponchos, gorras, faldas wrap, bufandas).",
      systems: [
        {
          label: "Talles Únicos",
          badge: "ACTIVO",
          badge_variant: "active",
          description: "Prendas de patronaje flexible o adaptabilidad mediante cierres mecánicos.",
          sizes: ["Talle Único", "Talle Ajustable"],
          active: true,
        },
      ],
    },
    {
      title: "3. Pantalones, Jeans y Ropa Formal",
      description:
        "Sastrería artesanal, pantalones de vestir con pinzas, denim estructurado y bermudas.",
      systems: [
        {
          label: "Numérico Tipo US / México — Masculino",
          badge: "Hombres",
          badge_variant: "gender",
          description:
            "Tallas clásicas americanas de tiro y calce masculino para denim y pantalones.",
          sizes: ["28", "30", "32", "34", "36", "38", "40"],
          active: true,
        },
        {
          label: "Numérico Tipo US / México — Femenino",
          badge: "Mujeres",
          badge_variant: "gender",
          description:
            "Numeración estándar americana femenina para vaqueros y pantalones de sastrería.",
          sizes: ["0", "2", "4", "6", "8", "10", "12", "14", "16", "18"],
          active: true,
        },
        {
          label: "Numérico Tipo EU / Cono Sur",
          badge: "Sastrería Taller",
          badge_variant: "workshop",
          description: "Patronaje europeo oficial y sastrería de taller.",
          sizes: ["34", "36", "38", "40", "42", "44", "46", "48"],
          active: true,
        },
        {
          label: "Medidas en Pulgadas / Cintura",
          badge: "Denim & Waist",
          badge_variant: "workshop",
          description: "Ajuste exacto por contorno de cintura.",
          sizes: ["30W", "32W", "34W", "36W", "38W"],
          active: true,
        },
      ],
    },
    {
      title: "4. Calzado (Zapatos, Zapatillas, Sandalias)",
      description: "Taxonomía y numeración estándar para calzado de confección artesanal.",
      systems: [
        {
          label: "Calzado Adulto",
          badge: "EU ADULTO",
          badge_variant: "workshop",
          description: "Escala unificada de hormas estándar para calzado adulto de atelier.",
          sizes: ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
          active: true,
        },
      ],
    },
    {
      title: "5. Accesorios y Complementos",
      description: "Sombreros, marroquinería, joyería y accesorios de atelier.",
      systems: [
        {
          label: "1. Sombreros, Gorras y Boinas",
          badge: "ACTIVO",
          badge_variant: "active",
          description:
            "Perímetro craneal en centímetros para sombrerería de fieltro, lino y boinas artesanales.",
          sizes: [
            "54 cm",
            "55 cm",
            "56 cm",
            "57 cm",
            "58 cm",
            "59 cm",
            "60 cm",
            "Talle Único Ajustable",
          ],
          active: true,
        },
        {
          label: "2. Cinturones y Marroquinería",
          badge: "ACTIVO",
          badge_variant: "active",
          description:
            "Longitud en centímetros desde hebilla al agujero central para correas y cinturones de piel artesanal.",
          sizes: ["80 cm", "85 cm", "90 cm", "95 cm", "100 cm", "105 cm", "110 cm"],
          active: true,
        },
      ],
    },
    {
      title: "6. Para Pijamas, Ropa Interior, Sweaters Holgados, Sombreros",
      description:
        "Opciones de patronaje técnico bajo pedido, ajustes especiales y confección a medida artesanal.",
      systems: [
        {
          label: "Talles Dobles",
          badge: null,
          badge_variant: null,
          description:
            "Ideal para siluetas fluidas, prendas holgadas o hombros caídos con patronaje versátil.",
          sizes: ["XS/S", "S/M", "M/L", "L/XL"],
          active: true,
        },
      ],
    },
    {
      title: "7. Joyería y Accesorios de Metales (Anillos, Cadenas, Pulseras)",
      description:
        "Parametrización y normativas de tallaje para orfebrería, sortijas, gargantillas y brazaletes de atelier.",
      systems: [
        {
          label: "A. Anillos y Sortijas",
          badge: "US / EU RING SIZE",
          badge_variant: "workshop",
          description: "Escala milimétrica de diámetro interior para sortijas en metales nobles.",
          sizes: ["5 US", "6 US", "7 US", "8 US", "9 US", "10 US"],
          active: true,
        },
        {
          label: "B. Cadenas y Collares",
          badge: "LONGITUD DE CAÍDA",
          badge_variant: "workshop",
          description: "Largos estandarizados para cadenas de plata 925, gargantillas y colgantes.",
          sizes: ["40 cm (Gargantilla)", "45 cm (Princesa)", "50 cm (Matinée)"],
          active: true,
        },
        {
          label: "C. Pulseras y Brazaletes",
          badge: "CONTORNO MUÑECA",
          badge_variant: "workshop",
          description: "Perímetro circular de ajuste con cierre de caja o mosquetón de orfebrería.",
          sizes: ["16 cm (S)", "18 cm (M)", "20 cm (L)"],
          active: true,
        },
      ],
    },
  ];

  for (const group of SIZE_GROUPS_SEED) {
    const existing = await prisma.sizeGroup.findFirst({ where: { title: group.title } });
    if (!existing) {
      await prisma.sizeGroup.create({
        data: {
          title: group.title,
          description: group.description,
          systems: {
            create: group.systems.map((s) => ({
              label: s.label,
              badge: s.badge,
              badge_variant: s.badge_variant,
              description: s.description,
              sizes: s.sizes,
              active: s.active,
            })),
          },
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
