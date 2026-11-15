-- AlterTable
ALTER TABLE "Categories" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "size_system_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "sku" TEXT;
