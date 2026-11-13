-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'REQUIRES_REVIEW');

-- CreateTable
CREATE TABLE "PaymentRefunds" (
    "id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "stripe_refund_id" TEXT,
    "idempotency_key" TEXT NOT NULL,
    "requested_by" TEXT NOT NULL,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "PaymentRefunds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRefunds_stripe_refund_id_key" ON "PaymentRefunds"("stripe_refund_id");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRefunds_idempotency_key_key" ON "PaymentRefunds"("idempotency_key");

-- CreateIndex
CREATE INDEX "PaymentRefunds_payment_id_status_idx" ON "PaymentRefunds"("payment_id", "status");

-- CreateIndex
CREATE INDEX "PaymentRefunds_created_at_idx" ON "PaymentRefunds"("created_at");

-- AddForeignKey
ALTER TABLE "PaymentRefunds" ADD CONSTRAINT "PaymentRefunds_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "Payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
