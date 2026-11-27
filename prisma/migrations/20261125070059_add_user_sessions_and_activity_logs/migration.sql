-- CreateEnum
CREATE TYPE "ActivityEventType" AS ENUM ('LOGIN_SUCCESS', 'LOGIN_GOOGLE', 'REGISTER', 'PROFILE_UPDATED', 'PASSWORD_CHANGED', 'SESSION_REVOKED', 'SESSIONS_REVOKED_ALL', 'ACCOUNT_CLOSED');

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "device_label" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL DEFAULT '',
    "last_active_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountActivityLog" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_type" "ActivityEventType" NOT NULL,
    "title" TEXT NOT NULL,
    "metadata" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserSession_user_id_revoked_at_expires_at_idx" ON "UserSession"("user_id", "revoked_at", "expires_at");

-- CreateIndex
CREATE INDEX "AccountActivityLog_user_id_created_at_idx" ON "AccountActivityLog"("user_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountActivityLog" ADD CONSTRAINT "AccountActivityLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
