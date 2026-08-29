-- CreateTable (idempotent: safe on both fresh CI DBs and existing Neon DBs)
CREATE TABLE IF NOT EXISTS "blocks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "view" TEXT NOT NULL,
    "startingPrice" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (idempotent)
CREATE UNIQUE INDEX IF NOT EXISTS "blocks_slug_key" ON "blocks"("slug");

-- AlterTable: add blockId column only if it doesn't already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'rooms' AND column_name = 'blockId'
    ) THEN
        ALTER TABLE "rooms" ADD COLUMN "blockId" TEXT;
    END IF;
END $$;

-- CreateIndex (idempotent)
CREATE INDEX IF NOT EXISTS "rooms_blockId_idx" ON "rooms"("blockId");

-- AddForeignKey (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'rooms_blockId_fkey'
    ) THEN
        ALTER TABLE "rooms" ADD CONSTRAINT "rooms_blockId_fkey"
            FOREIGN KEY ("blockId") REFERENCES "blocks"("id")
            ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
