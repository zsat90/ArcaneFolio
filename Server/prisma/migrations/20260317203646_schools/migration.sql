/*
  Warnings:

  - You are about to drop the column `school` on the `Spell` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Spell" DROP COLUMN "school",
ADD COLUMN     "schools" TEXT[];
