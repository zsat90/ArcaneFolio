/*
  Warnings:

  - You are about to drop the `Spells` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Spells" DROP CONSTRAINT "Spells_spellbookId_fkey";

-- DropTable
DROP TABLE "Spells";

-- CreateTable
CREATE TABLE "Spell" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "components" TEXT[],
    "range" INTEGER NOT NULL,
    "areaOfEffect" TEXT NOT NULL,
    "save" TEXT NOT NULL,
    "castingTime" INTEGER NOT NULL,
    "magicPointCost" INTEGER NOT NULL,
    "duration" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "spellbookId" INTEGER NOT NULL,

    CONSTRAINT "Spell_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Spell" ADD CONSTRAINT "Spell_spellbookId_fkey" FOREIGN KEY ("spellbookId") REFERENCES "Spellbook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
