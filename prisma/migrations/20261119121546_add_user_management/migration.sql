-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "suspended_until" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "UserSuspension" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "suspended_until" TIMESTAMP(3) NOT NULL,
    "reactivated_at" TIMESTAMP(3),
    "reactivated_by" TEXT,

    CONSTRAINT "UserSuspension_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserSuspension_user_id_created_at_idx" ON "UserSuspension"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "UserSuspension_admin_id_created_at_idx" ON "UserSuspension"("admin_id", "created_at");

-- CreateIndex
CREATE INDEX "UserSuspension_suspended_until_idx" ON "UserSuspension"("suspended_until");

-- AddForeignKey
ALTER TABLE "UserSuspension" ADD CONSTRAINT "UserSuspension_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSuspension" ADD CONSTRAINT "UserSuspension_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSuspension" ADD CONSTRAINT "UserSuspension_reactivated_by_fkey" FOREIGN KEY ("reactivated_by") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
