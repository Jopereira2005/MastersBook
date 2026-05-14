-- AlterTable
ALTER TABLE "TableState" ADD COLUMN     "current_turn" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_combat_active" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "turn_order" TEXT[];
