/*
  Warnings:

  - A unique constraint covering the columns `[spellbookId]` on the table `Character` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `spellbookId` to the `Character` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "spellbookId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Spells" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "components" TEXT[],
    "range" INTEGER NOT NULL,
    "areaOfEffect" TEXT NOT NULL,
    "save" TEXT NOT NULL,
    "castingTime" INTEGER NOT NULL,
    "duration" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "spellbookId" INTEGER NOT NULL,

    CONSTRAINT "Spells_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Spellbook" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Spellbook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Character_spellbookId_key" ON "Character"("spellbookId");

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_spellbookId_fkey" FOREIGN KEY ("spellbookId") REFERENCES "Spellbook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Spells" ADD CONSTRAINT "Spells_spellbookId_fkey" FOREIGN KEY ("spellbookId") REFERENCES "Spellbook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
