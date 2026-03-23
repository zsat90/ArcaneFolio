/*
  Warnings:

  - The values [Conjuration_summoning,Enchantment_charm,Greater_divinations,Illusions,Invocation_Evocation,Lesser_divination] on the enum `School` will be removed. If these variants are still used in the database, this will fail.
  - The `sphere` column on the `Spell` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the column `school` on the `Spell` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "School_new" AS ENUM ('Abjuration', 'Alteration', 'Conjuration_Summoning', 'Divination', 'Enchantment_Charm', 'Evocation', 'Illusion_Phantasm', 'Necromancy');
ALTER TABLE "Spell" ALTER COLUMN "school" TYPE "School_new"[] USING ("school"::text::"School_new"[]);
ALTER TYPE "School" RENAME TO "School_old";
ALTER TYPE "School_new" RENAME TO "School";
DROP TYPE "School_old";
COMMIT;

-- AlterTable
ALTER TABLE "Spell" ALTER COLUMN "school" SET DATA TYPE "School"[],
DROP COLUMN "sphere",
ADD COLUMN     "sphere" TEXT[];
