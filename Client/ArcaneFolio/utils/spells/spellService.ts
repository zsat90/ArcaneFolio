import { Spell } from '../../types/spellTypes';
import { getSpellById } from './spellCatalog';
import { getSpells, type SpellFilters } from './spellsService';

export const loadSpells = (filters?: SpellFilters) => getSpells(filters);

export const loadSpellById = async (spellId: number): Promise<Spell | null> => {
  const localSpell = getSpellById(spellId);

  if (localSpell) {
    return localSpell;
  }

  const spells = await getSpells();
  return spells.find((spell) => spell.id === spellId) ?? null;
};

export const getSpellDescription = (spell: Spell) => ({
  name: spell.name,
  school: spell.schools.join(', '),
  sphere: spell.spheres.join(', '),
  castingTime: spell.castingTime,
  components: spell.components.join(', '),
  range: spell.range,
  duration: spell.duration,
  description: spell.description,
});
