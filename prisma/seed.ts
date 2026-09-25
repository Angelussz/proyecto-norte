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
      update: { name: category.name },
      create: {
        name: category.name,
        slug: category.slug,
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

  // 3. Usuarios
  for (const u of USERS_MOCK) {
    await prisma.users.upsert({
      where: { email: u.email },
      update: { name: u.name, last_name: u.last_name, phone: u.phone },
      create: {
        name: u.name,
        last_name: u.last_name,
        email: u.email,
        phone: u.phone,
        password_hash: "$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdhpbJ3.gPpv7hW2",
        role: u.role,
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

    const order = existingOrder ?? await prisma.orders.create({
      data: {
        user_id: user.id,
        address_id: address.id,
        subtotal: o.subtotal,
        shipping_cost: o.shipping_cost,
        total: o.total,
        status: o.status,
      },
    });

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
