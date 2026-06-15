import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// Optional: normalize spacing/capitalization slightly
function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

async function main() {
  const spellFilePath = path.resolve(__dirname, "spells.json");
  const data = fs.readFileSync(spellFilePath, "utf-8");
  const rawSpells = JSON.parse(data);

  const spells = rawSpells.map((s: any) => ({
    name: s.name,
    level: s.level ?? 0,

    components: s.components ?? [],
    range: s.range ?? "",
    areaOfEffect: s.areaOfEffect ?? "",
    save: s.save ?? "",

    castingTime: s.castingTime?.toString() ?? "",
    duration: s.duration ?? "",
    description: s.description ?? "",

    magicPointCost: s.magicPointCost ?? 0,
    characterClass: s.characterClass ?? "Wizard",

    // ✅ Flexible multi-school support (string[])
    schools: s.schools
      ? s.schools.map((sch: string) => normalizeText(sch))
      : s.school
        ? s.school.split(",").map((sch: string) => normalizeText(sch))
        : [],

    // ✅ Always an array
    spheres: s.spheres ?? [],

    spellbookId: s.spellbookId ?? null,
  }));

  // 🔥 Previously this unconditionally deleted all spells before seeding.
  // Removing unconditional deletion prevents accidental data loss.
  // If you still want to reset the spells table during a seed, set
  // the environment variable SEED_RESET=true when running the seed.
  if (process.env.SEED_RESET === 'true') {
    console.log('⚠️ SEED_RESET=true — clearing spells table before seeding');
    await prisma.spell.deleteMany();
  }

  await prisma.spell.createMany({
    data: spells,
  });

  console.log("✅ Spells seeded successfully");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });