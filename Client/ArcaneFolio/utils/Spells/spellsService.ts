import { apiFetch } from '../api';
import { Spell } from '../../types/spellTypes';

export const SPELL_SCHOOL_OPTIONS = [
  'Abjuration',
  'Alteration',
  'Conjuration/Summoning',
  'Enchantment/Charm',
  'Greater Divination',
  'Illusion',
  'Invocation/Evocation',
  'Necromancy',
  'Lesser Divination',
];

export const SPELL_SCHOOL_FILTER_OPTIONS = [
  'All',
  ...SPELL_SCHOOL_OPTIONS,
];

export const PRIEST_SPELL_SPHERE_OPTIONS = [
  'All',
  'Animal',
  'Astral',
  'Charm',
  'Combat',
  'Creation',
  'Divination',
  'Elemental',
  'Guardian',
  'Healing',
  'Necromantic',
  'Plant',
  'Protection',
  'Summoning',
  'Sun',
  'Weather',
];

export type SpellFilters = {
  characterClass?: string;
  level?: number;
  school?: string;
  search?: string;
};

const buildQuery = (filters?: SpellFilters) => {
  const params = new URLSearchParams();

  if (filters?.level) {
    params.set('level', String(filters.level));
  }

  if (filters?.characterClass?.trim()) {
    params.set('characterClass', filters.characterClass.trim());
  }

  if (filters?.school?.trim()) {
    params.set('school', filters.school.trim());
  }

  if (filters?.search?.trim()) {
    params.set('search', filters.search.trim());
  }

  const query = params.toString();
  return query ? `?${query}` : '';
};

export const getSpells = (filters?: SpellFilters) => {
  return apiFetch<Spell[]>(`/spells${buildQuery(filters)}`);
};
