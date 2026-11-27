-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "notif_newsletter" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notif_orders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notif_promotions" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notif_restock" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notif_security" BOOLEAN NOT NULL DEFAULT true;
