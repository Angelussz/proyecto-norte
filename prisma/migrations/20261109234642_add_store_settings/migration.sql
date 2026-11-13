-- CreateTable
CREATE TABLE "StoreSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "shipping_cost" DECIMAL(10,2) NOT NULL DEFAULT 9.9,
    "shipping_label" TEXT NOT NULL DEFAULT 'Tarifa plana',
    "free_shipping_threshold" DECIMAL(10,2),
    "tax_rate" DECIMAL(5,4) NOT NULL DEFAULT 0.18,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreSettings_pkey" PRIMARY KEY ("id")
);
