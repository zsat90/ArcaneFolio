/*
  Warnings:

  - Added the required column `magicPointCost` to the `Character` table without a default value. This is not possible if the table is not empty.
  - Added the required column `magicPointCost` to the `Spells` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "magicPointCost" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Spells" ADD COLUMN     "magicPointCost" INTEGER NOT NULL;
