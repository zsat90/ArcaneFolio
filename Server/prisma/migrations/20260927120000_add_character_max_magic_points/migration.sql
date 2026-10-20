ALTER TABLE "Character" ADD COLUMN "maxMagicPoints" INTEGER NOT NULL DEFAULT 0;

UPDATE "Character"
SET "maxMagicPoints" = "magicPoints";