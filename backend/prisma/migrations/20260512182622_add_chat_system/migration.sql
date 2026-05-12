-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('STORY', 'OOC', 'LOG', 'DICE');

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "type" "MessageType" NOT NULL DEFAULT 'STORY',
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "character_id" TEXT,
    "table_id" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "Character"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "Table"("id") ON DELETE CASCADE ON UPDATE CASCADE;
