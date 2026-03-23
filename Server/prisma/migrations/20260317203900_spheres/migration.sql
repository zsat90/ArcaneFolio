/*
  Warnings:

  - You are about to drop the column `sphere` on the `Spell` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Spell" DROP COLUMN "sphere",
ADD COLUMN     "spheres" TEXT[];
