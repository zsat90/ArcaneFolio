import { Spell } from '../../types/spellTypes';

export type GeneratorClass = 'Wizard' | 'Runeist' | 'Bard';
export type GeneratorMode = 'progression' | 'random';

type SpellProgression = Record<number, readonly number[]>;

export const WIZARD_SPELL_PROGRESSION = {
  1: [1, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [2, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [2, 1, 0, 0, 0, 0, 0, 0, 0],
  4: [3, 2, 0, 0, 0, 0, 0, 0, 0],
  5: [4, 2, 1, 0, 0, 0, 0, 0, 0],
  6: [4, 2, 2, 1, 0, 0, 0, 0, 0],
  7: [4, 3, 2, 1, 0, 0, 0, 0, 0],
  8: [4, 3, 3, 2, 0, 0, 0, 0, 0],
  9: [4, 3, 3, 2, 1, 0, 0, 0, 0],
  10: [4, 4, 3, 2, 2, 0, 0, 0, 0],
  11: [4, 4, 4, 3, 3, 0, 0, 0, 0],
  12: [4, 4, 4, 4, 4, 1, 0, 0, 0],
  13: [5, 5, 5, 4, 4, 2, 0, 0, 0],
  14: [5, 5, 5, 4, 4, 2, 1, 0, 0],
  15: [5, 5, 5, 5, 5, 3, 1, 0, 0],
  16: [5, 5, 5, 5, 5, 3, 2, 1, 0],
  17: [5, 5, 5, 5, 5, 3, 3, 2, 0],
  18: [5, 5, 5, 5, 5, 3, 3, 2, 1],
  19: [5, 5, 5, 5, 5, 3, 3, 3, 1],
  20: [5, 5, 5, 5, 5, 4, 3, 3, 2],
} as const;

export const RUNEIST_SPELL_PROGRESSION = {
  1: [2, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [3, 1, 0, 0, 0, 0, 0, 0, 0],
  3: [3, 2, 0, 0, 0, 0, 0, 0, 0],
  4: [4, 3, 1, 0, 0, 0, 0, 0, 0],
  5: [4, 4, 2, 1, 0, 0, 0, 0, 0],
  6: [5, 4, 3, 2, 0, 0, 0, 0, 0],
  7: [6, 4, 4, 3, 1, 0, 0, 0, 0],
  8: [6, 5, 4, 3, 2, 0, 0, 0, 0],
  9: [6, 5, 5, 4, 3, 1, 0, 0, 1],
  10: [6, 5, 5, 5, 3, 2, 0, 0, 1],
  11: [6, 6, 5, 5, 4, 3, 1, 0, 0],
  12: [7, 6, 6, 5, 4, 4, 1, 0, 0],
  13: [7, 7, 6, 5, 5, 4, 2, 1, 0],
  14: [7, 7, 7, 5, 5, 4, 2, 1, 0],
  15: [7, 7, 7, 6, 5, 4, 3, 2, 1],
  16: [7, 7, 7, 7, 5, 4, 3, 2, 2],
  17: [7, 7, 7, 7, 6, 4, 3, 2, 2],
  18: [7, 7, 7, 7, 7, 4, 3, 2, 2],
  19: [7, 7, 7, 7, 7, 5, 4, 2, 2],
  20: [7, 7, 7, 7, 7, 5, 5, 3, 2],
} as const;

export const BARD_SPELL_PROGRESSION = {
  1: [1, 0, 0, 0, 0, 0],
  2: [1, 0, 0, 0, 0, 0],
  3: [2, 0, 0, 0, 0, 0],
  4: [2, 1, 0, 0, 0, 0],
  5: [3, 1, 0, 0, 0, 0],
  6: [3, 2, 0, 0, 0, 0],
  7: [3, 2, 1, 0, 0, 0],
  8: [3, 3, 1, 0, 0, 0],
  9: [3, 3, 2, 0, 0, 0],
  10: [3, 3, 2, 1, 0, 0],
  11: [3, 3, 3, 1, 0, 0],
  12: [3, 3, 3, 2, 0, 0],
  13: [3, 3, 3, 2, 1, 0],
  14: [3, 3, 3, 3, 1, 0],
  15: [3, 3, 3, 3, 2, 1],
  16: [4, 3, 3, 3, 2, 1],
  17: [4, 4, 3, 3, 3, 1],
  18: [4, 4, 4, 3, 3, 2],
  19: [4, 4, 4, 4, 3, 2],
  20: [4, 4, 4, 4, 4, 3],
} as const;

const PROGRESSIONS: Record<GeneratorClass, SpellProgression> = {
  Wizard: WIZARD_SPELL_PROGRESSION,
  Runeist: RUNEIST_SPELL_PROGRESSION,
  Bard: BARD_SPELL_PROGRESSION,
};

const shuffle = <T,>(items: T[]) => {
  const shuffledItems = [...items];

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffledItems[index], shuffledItems[swapIndex]] = [shuffledItems[swapIndex], shuffledItems[index]];
  }

  return shuffledItems;
};

export const getCumulativeProgression = (generatorClass: GeneratorClass, casterLevel: number) => {
  const progression = PROGRESSIONS[generatorClass];
  const maxSpellLevel = Math.max(...Object.values(progression).map((row) => row.length));
  const totals = Array.from({ length: maxSpellLevel }, () => 0);
  const normalizedLevel = Math.max(1, Math.min(20, casterLevel));

  for (let level = 1; level <= normalizedLevel; level += 1) {
    const gainedSpells = progression[level] ?? [];

    gainedSpells.forEach((count, index) => {
      totals[index] += count;
    });
  }

  return totals;
};

export const generateProgressionSpellbook = (
  spells: Spell[],
  generatorClass: GeneratorClass,
  casterLevel: number,
) => {
  const totals = getCumulativeProgression(generatorClass, casterLevel);

  return totals.flatMap((count, index) => {
    const spellLevel = index + 1;
    const availableSpells = spells.filter((spell) => spell.level === spellLevel);

    return shuffle(availableSpells).slice(0, count);
  });
};

export const generateRandomSpellbook = (spells: Spell[], count: number) => {
  const availableSpells = spells.filter((spell) => spell.level >= 1 && spell.level <= 10);

  return shuffle(availableSpells).slice(0, Math.max(0, count));
};
