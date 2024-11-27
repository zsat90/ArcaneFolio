-- DropForeignKey
ALTER TABLE "Spell" DROP CONSTRAINT "Spell_spellbookId_fkey";

-- AlterTable
ALTER TABLE "Spell" ALTER COLUMN "spellbookId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Spell" ADD CONSTRAINT "Spell_spellbookId_fkey" FOREIGN KEY ("spellbookId") REFERENCES "Spellbook"("id") ON DELETE SET NULL ON UPDATE CASCADE;
