/*
  Warnings:

  - You are about to drop the `activation_tokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "activation_tokens" DROP CONSTRAINT "activation_tokens_user_id_fkey";

-- DropTable
DROP TABLE "activation_tokens";
