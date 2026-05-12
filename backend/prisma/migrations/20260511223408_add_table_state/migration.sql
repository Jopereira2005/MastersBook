-- AlterTable
ALTER TABLE "TablePlayer" ADD COLUMN     "conditions" JSONB,
ADD COLUMN     "current_attributes" JSONB,
ADD COLUMN     "private_notes" TEXT,
ADD COLUMN     "temporary_attributes" JSONB;

-- CreateTable
CREATE TABLE "TableState" (
    "id" TEXT NOT NULL,
    "current_location" TEXT,
    "in_game_date" TEXT,
    "weather" TEXT,
    "active_scene" TEXT NOT NULL DEFAULT 'EXPLORATION',
    "initiative_order" JSONB,
    "public_notes" TEXT,
    "table_id" TEXT NOT NULL,

    CONSTRAINT "TableState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TableState_table_id_key" ON "TableState"("table_id");

-- AddForeignKey
ALTER TABLE "TableState" ADD CONSTRAINT "TableState_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "Table"("id") ON DELETE CASCADE ON UPDATE CASCADE;
