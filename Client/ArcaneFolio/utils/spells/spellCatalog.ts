import seedSpells from '../../data/allSpells.json';
import priestSeedSpells from '../../data/priestSpells.json';
import { Spell } from '../../types/spellTypes';

type SeedSpell = Omit<Spell, 'id'> & { id?: number; mpc?: number | null };

const normalizeSpell = (spell: SeedSpell, index: number, defaultClass: string, idOffset = 0): Spell => ({
  id: spell.id ?? idOffset + index + 1,
  characterClass: spell.characterClass ?? defaultClass,
  spheres: spell.spheres ?? [],
  schools: spell.schools ?? [],
  name: spell.name,
  level: spell.level ?? 0,
  components: spell.components ?? [],
  range: spell.range ?? '',
  areaOfEffect: spell.areaOfEffect ?? '',
  save: spell.save ?? '',
  castingTime: spell.castingTime?.toString() ?? '',
  castingWord: spell.castingWord ?? null,
  castNameMeaning: spell.castNameMeaning ?? null,
  magicPointCost: spell.magicPointCost !== undefined ? spell.magicPointCost : spell.mpc !== undefined ? spell.mpc : 0,
  duration: spell.duration ?? '',
  description: spell.description ?? '',
  spellbookId: spell.spellbookId ?? null,
});

export const getSeedSpells = (): Spell[] => {
  const uniqueSpells = new Map<string, Spell>();
  const wizardSeedSpells = seedSpells as SeedSpell[];
  const priestSpells = priestSeedSpells as SeedSpell[];
  const maxWizardId = wizardSeedSpells.reduce((maxId, spell, index) => Math.max(maxId, spell.id ?? index + 1), 0);

  [
    ...wizardSeedSpells.map((spell, index) => normalizeSpell(spell, index, 'Wizard')),
    ...priestSpells.map((spell, index) => normalizeSpell(spell, index, 'Priest', maxWizardId)),
  ].forEach((normalizedSpell) => {
    const key = `${normalizedSpell.name.toLowerCase()}-${normalizedSpell.characterClass.toLowerCase()}-${normalizedSpell.level}`;

    if (!uniqueSpells.has(key)) {
      uniqueSpells.set(key, normalizedSpell);
    }
  });

  return Array.from(uniqueSpells.values());
};

export const getSpellById = (spellId: number) => (
  getSeedSpells().find((spell) => spell.id === spellId) ?? null
);

export type SpellCatalogFilters = {
  characterClass?: string;
  level?: number;
  school?: string;
  search?: string;
};

export const filterSeedSpells = (filters: SpellCatalogFilters = {}) => {
  const characterClassQuery = filters.characterClass?.trim().toLowerCase();
  const schoolQuery = filters.school?.trim().toLowerCase();
  const searchQuery = filters.search?.trim().toLowerCase();
  const level = filters.level;

  return getSeedSpells()
    .filter((spell) => level === undefined || spell.level === level)
    .filter((spell) => !characterClassQuery || spell.characterClass.toLowerCase() === characterClassQuery)
    .filter((spell) => {
      if (!schoolQuery) {
        return true;
      }

      const filterGroups = spell.characterClass.toLowerCase() === 'priest' ? spell.spheres : spell.schools;

      return filterGroups.some((school) => school.toLowerCase() === schoolQuery);
    })
    .filter((spell) => !searchQuery || spell.name.toLowerCase().includes(searchQuery))
    .sort((a, b) => a.name.localeCompare(b.name) || a.level - b.level);
};
