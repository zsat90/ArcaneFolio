/*
  Warnings:

  - You are about to drop the column `magicPointCost` on the `Character` table. All the data in the column will be lost.
  - Added the required column `magicPoints` to the `Character` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Character" DROP COLUMN "magicPointCost",
ADD COLUMN     "magicPoints" INTEGER NOT NULL;
