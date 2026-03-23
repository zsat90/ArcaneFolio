/*
  Warnings:

  - Added the required column `school` to the `Spell` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "School" AS ENUM ('Abjuration', 'Alteration', 'Conjuration_summoning', 'Enchantment_charm', 'Greater_divinations', 'Illusions', 'Invocation_Evocation', 'Lesser_divination', 'Necromancy');

-- AlterTable
ALTER TABLE "Spell" ADD COLUMN     "school" "School" NOT NULL,
ADD COLUMN     "sphere" TEXT;
