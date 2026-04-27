-- DropForeignKey
ALTER TABLE "Character" DROP CONSTRAINT "Character_system_id_fkey";

-- DropForeignKey
ALTER TABLE "Character" DROP CONSTRAINT "Character_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_user_id_1_fkey";

-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_user_id_2_fkey";

-- DropForeignKey
ALTER TABLE "Table" DROP CONSTRAINT "Table_gm_id_fkey";

-- DropForeignKey
ALTER TABLE "Table" DROP CONSTRAINT "Table_system_id_fkey";

-- DropForeignKey
ALTER TABLE "TablePlayer" DROP CONSTRAINT "TablePlayer_character_id_fkey";

-- DropForeignKey
ALTER TABLE "TablePlayer" DROP CONSTRAINT "TablePlayer_table_id_fkey";

-- DropForeignKey
ALTER TABLE "TablePlayer" DROP CONSTRAINT "TablePlayer_user_id_fkey";

-- AlterTable
ALTER TABLE "Friendship" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_system_id_fkey" FOREIGN KEY ("system_id") REFERENCES "System"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_gm_id_fkey" FOREIGN KEY ("gm_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_system_id_fkey" FOREIGN KEY ("system_id") REFERENCES "System"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TablePlayer" ADD CONSTRAINT "TablePlayer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TablePlayer" ADD CONSTRAINT "TablePlayer_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "Table"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TablePlayer" ADD CONSTRAINT "TablePlayer_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_user_id_1_fkey" FOREIGN KEY ("user_id_1") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_user_id_2_fkey" FOREIGN KEY ("user_id_2") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
