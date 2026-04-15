/*
  Warnings:

  - You are about to drop the `characters` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `friendships` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `systems` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `table_players` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tables` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "characters" DROP CONSTRAINT "characters_system_id_fkey";

-- DropForeignKey
ALTER TABLE "characters" DROP CONSTRAINT "characters_user_id_fkey";

-- DropForeignKey
ALTER TABLE "friendships" DROP CONSTRAINT "friendships_user_id_1_fkey";

-- DropForeignKey
ALTER TABLE "friendships" DROP CONSTRAINT "friendships_user_id_2_fkey";

-- DropForeignKey
ALTER TABLE "table_players" DROP CONSTRAINT "table_players_character_id_fkey";

-- DropForeignKey
ALTER TABLE "table_players" DROP CONSTRAINT "table_players_table_id_fkey";

-- DropForeignKey
ALTER TABLE "table_players" DROP CONSTRAINT "table_players_user_id_fkey";

-- DropForeignKey
ALTER TABLE "tables" DROP CONSTRAINT "tables_gm_id_fkey";

-- DropForeignKey
ALTER TABLE "tables" DROP CONSTRAINT "tables_system_id_fkey";

-- DropTable
DROP TABLE "characters";

-- DropTable
DROP TABLE "friendships";

-- DropTable
DROP TABLE "systems";

-- DropTable
DROP TABLE "table_players";

-- DropTable
DROP TABLE "tables";

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "System" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "System_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "race" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "attributes" JSONB NOT NULL,
    "bio" TEXT,
    "user_id" TEXT NOT NULL,
    "system_id" TEXT NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Table" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "invite_code" TEXT NOT NULL,
    "gm_id" TEXT NOT NULL,
    "system_id" TEXT NOT NULL,

    CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TablePlayer" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "table_id" TEXT NOT NULL,
    "character_id" TEXT NOT NULL,

    CONSTRAINT "TablePlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friendship" (
    "id" TEXT NOT NULL,
    "status" "FriendshipStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id_1" TEXT NOT NULL,
    "user_id_2" TEXT NOT NULL,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Table_invite_code_key" ON "Table"("invite_code");

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_system_id_fkey" FOREIGN KEY ("system_id") REFERENCES "System"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_gm_id_fkey" FOREIGN KEY ("gm_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_system_id_fkey" FOREIGN KEY ("system_id") REFERENCES "System"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TablePlayer" ADD CONSTRAINT "TablePlayer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TablePlayer" ADD CONSTRAINT "TablePlayer_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "Table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TablePlayer" ADD CONSTRAINT "TablePlayer_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_user_id_1_fkey" FOREIGN KEY ("user_id_1") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_user_id_2_fkey" FOREIGN KEY ("user_id_2") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
