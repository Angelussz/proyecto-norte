-- CreateTable
CREATE TABLE "SizeGroup" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SizeGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SizeSystem" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "badge" TEXT,
    "badge_variant" TEXT,
    "sizes" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SizeSystem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SizeSystem" ADD CONSTRAINT "SizeSystem_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "SizeGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
