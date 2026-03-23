/*
  Warnings:

  - The `school` column on the `Spell` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Spell" DROP COLUMN "school",
ADD COLUMN     "school" TEXT[];

-- DropEnum
DROP TYPE "School";
