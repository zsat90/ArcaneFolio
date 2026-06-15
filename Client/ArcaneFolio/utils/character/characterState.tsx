import { useEffect, useState } from 'react';
import { Character } from '../../types/characterTypes';
import { calculateSheetMagicPoints, getCharacterSheet } from './characterSheetState';
import { parseHitPointValue } from './hitPoints';

const SELECTED_CHARACTER_KEY = 'arcane:selected-character';
const CUSTOM_CHARACTERS_KEY = 'arcane:custom-characters';
const REMOVED_CHARACTERS_KEY = 'arcane:removed-characters';
const CHARACTER_STATE_KEY = 'arcane:character-state';
const SPELLBOOK_KEY = 'arcane:spellbooks';
const CHARACTER_SHEETS_KEY = 'arcane:character-sheets';
const CHANGE_EVENT = 'arcane-character-change';
const SPELLBOOK_EVENT = 'arcane-spellbook-change';

type CharacterResources = {
  magicPoints: number;
  maxMagicPoints: number;
  hitPoints: number;
  maxHitPoints: number;
};
type CharacterResourceState = Record<string, Partial<CharacterResources>>;
type SpellbookState = Record<string, number[]>;

export const DEFAULT_CHARACTERS: Character[] = [
  { id: 1, name: 'Gandalf', class: 'Wizard', characterClass: 'Wizard', level: 3, magicPoints: 12, maxMagicPoints: 12, hitPoints: 0, maxHitPoints: 0 },
  { id: 2, name: 'Frodo', class: 'Rogue', characterClass: 'Rogue', level: 1, magicPoints: 4, maxMagicPoints: 4, hitPoints: 0, maxHitPoints: 0 },
  { id: 3, name: 'Aragorn', class: 'Fighter', characterClass: 'Fighter', level: 2, magicPoints: 6, maxMagicPoints: 6, hitPoints: 0, maxHitPoints: 0 },
];

const canUseStorage = () => typeof window !== 'undefined';

const readJson = <T,>(key: string, fallback: T): T => {
  if (!canUseStorage()) {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  if (canUseStorage()) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
};

const removeValue = (key: string) => {
  if (canUseStorage()) {
    window.localStorage.removeItem(key);
  }
};

const emitCharacterChange = () => {
  if (canUseStorage()) {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
};

const emitSpellbookChange = () => {
  if (canUseStorage()) {
    window.dispatchEvent(new Event(SPELLBOOK_EVENT));
  }
};

export const normalizeCharacter = (character: Character): Character => {
  const characterClass = character.characterClass || character.class;
  const maxMagicPoints = character.maxMagicPoints ?? character.magicPoints ?? 10;
  const maxHitPoints = character.maxHitPoints ?? character.hitPoints ?? 0;

  return {
    ...character,
    class: character.class || characterClass,
    characterClass,
    magicPoints: character.magicPoints ?? maxMagicPoints,
    maxMagicPoints,
    hitPoints: character.hitPoints ?? maxHitPoints,
    maxHitPoints,
  };
};

const parseResourceNumber = (value?: string) => {
  if (!value) {
    return null;
  }

  const parsed = Number(value.replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : null;
};

const getSheetHitPointValues = (characterId: number, fallback?: Character) => {
  const sheet = getCharacterSheet(characterId);
  const totalHitPoints = parseHitPointValue(sheet.hitPointDetails['Total HP']);
  const fullHitPoints = parseResourceNumber(sheet.hitPointDetails.Full);
  const currentHitPoints = parseResourceNumber(sheet.hitPointDetails.Current);
  const maxHitPoints = Math.max(0, totalHitPoints ?? fullHitPoints ?? fallback?.maxHitPoints ?? fallback?.hitPoints ?? currentHitPoints ?? 0);
  const hitPoints = Math.min(Math.max(0, totalHitPoints ?? currentHitPoints ?? fallback?.hitPoints ?? maxHitPoints), maxHitPoints);

  return {
    hitPoints,
    maxHitPoints,
  };
};

const getResourceDefaults = (character: Character): CharacterResources => {
  const hitPointValues = getSheetHitPointValues(character.id, character);
  const maxMagicPoints = character.maxMagicPoints ?? character.magicPoints ?? 0;

  return {
    magicPoints: character.magicPoints ?? maxMagicPoints,
    maxMagicPoints,
    ...hitPointValues,
  };
};

const mergeResources = (character: Character, resources?: Partial<CharacterResources>): CharacterResources => {
  const defaults = getResourceDefaults(character);

  return {
    magicPoints: resources?.magicPoints ?? defaults.magicPoints,
    maxMagicPoints: resources?.maxMagicPoints ?? defaults.maxMagicPoints,
    hitPoints: resources?.hitPoints ?? defaults.hitPoints,
    maxHitPoints: resources?.maxHitPoints ?? defaults.maxHitPoints,
  };
};

export const setSelectedCharacter = (character: Character) => {
  const normalizedCharacter = normalizeCharacter(character);
  const state = readJson<CharacterResourceState>(CHARACTER_STATE_KEY, {});
  const key = String(normalizedCharacter.id);

  if (!state[key]) {
    state[key] = getResourceDefaults(normalizedCharacter);
    writeJson(CHARACTER_STATE_KEY, state);
  }

  writeJson(SELECTED_CHARACTER_KEY, normalizedCharacter);
  emitCharacterChange();
};

export const getCharacters = () => {
  const customCharacters = readJson<Character[]>(CUSTOM_CHARACTERS_KEY, []);
  const removedCharacterIds = new Set(readJson<number[]>(REMOVED_CHARACTERS_KEY, []));
  const charactersById = new Map<number, Character>();

  DEFAULT_CHARACTERS.concat(customCharacters).forEach((character) => {
    const normalizedCharacter = normalizeCharacter(character);

    if (!removedCharacterIds.has(normalizedCharacter.id)) {
      charactersById.set(normalizedCharacter.id, normalizedCharacter);
    }
  });

  return Array.from(charactersById.values());
};

export const addCharacter = (character: Omit<Character, 'id'> & { id?: number }) => {
  const normalizedCharacter = normalizeCharacter({
    ...character,
    id: character.id ?? Date.now(),
  });
  const customCharacters = readJson<Character[]>(CUSTOM_CHARACTERS_KEY, []);
  const existingIndex = customCharacters.findIndex((item) => item.id === normalizedCharacter.id);

  if (existingIndex >= 0) {
    customCharacters[existingIndex] = normalizedCharacter;
  } else {
    customCharacters.push(normalizedCharacter);
  }

  writeJson(CUSTOM_CHARACTERS_KEY, customCharacters);
  setSelectedCharacter(normalizedCharacter);
  emitCharacterChange();
  return normalizedCharacter;
};

export const removeCharacter = (characterId: number) => {
  const key = String(characterId);
  const customCharacters = readJson<Character[]>(CUSTOM_CHARACTERS_KEY, []);
  const removedCharacterIds = new Set(readJson<number[]>(REMOVED_CHARACTERS_KEY, []));
  const isDefaultCharacter = DEFAULT_CHARACTERS.some((character) => character.id === characterId);

  writeJson(
    CUSTOM_CHARACTERS_KEY,
    customCharacters.filter((character) => character.id !== characterId),
  );

  if (isDefaultCharacter) {
    removedCharacterIds.add(characterId);
    writeJson(REMOVED_CHARACTERS_KEY, Array.from(removedCharacterIds));
  }

  const resourceState = readJson<CharacterResourceState>(CHARACTER_STATE_KEY, {});
  delete resourceState[key];
  writeJson(CHARACTER_STATE_KEY, resourceState);

  const spellbookState = readJson<SpellbookState>(SPELLBOOK_KEY, {});
  delete spellbookState[key];
  writeJson(SPELLBOOK_KEY, spellbookState);

  const sheetState = readJson<Record<string, unknown>>(CHARACTER_SHEETS_KEY, {});
  delete sheetState[key];
  writeJson(CHARACTER_SHEETS_KEY, sheetState);

  const selectedCharacter = readJson<Character | null>(SELECTED_CHARACTER_KEY, null);

  if (selectedCharacter?.id === characterId) {
    removeValue(SELECTED_CHARACTER_KEY);
  }

  emitCharacterChange();
  emitSpellbookChange();
};

export const getSelectedCharacter = (): Character | null => {
  const character = readJson<Character | null>(SELECTED_CHARACTER_KEY, null);

  if (!character) {
    return null;
  }

  const normalizedCharacter = normalizeCharacter(character);
  const resources = readJson<CharacterResourceState>(CHARACTER_STATE_KEY, {})[String(normalizedCharacter.id)];
  const sheet = getCharacterSheet(normalizedCharacter.id);
  const sheetMagicPoints = calculateSheetMagicPoints(
    normalizedCharacter.characterClass || normalizedCharacter.class || '',
    normalizedCharacter.level || 1,
    sheet,
  );
  const maxMagicPoints = sheetMagicPoints;
  const magicPoints = Math.min(resources?.magicPoints ?? maxMagicPoints, maxMagicPoints);
  const sheetHitPointValues = getSheetHitPointValues(normalizedCharacter.id, normalizedCharacter);
  const maxHitPoints = sheetHitPointValues.maxHitPoints;
  const hitPoints = Math.min(resources?.hitPoints ?? sheetHitPointValues.hitPoints, maxHitPoints);

  return {
    ...normalizedCharacter,
    magicPoints,
    maxMagicPoints,
    hitPoints,
    maxHitPoints,
  };
};

export const syncMagicPointsFromSheet = (characterId: number, characterClass: string, level: number) => {
  const sheet = getCharacterSheet(characterId);
  const maxMagicPoints = calculateSheetMagicPoints(characterClass, level, sheet);
  const hitPointValues = getSheetHitPointValues(characterId);
  const state = readJson<CharacterResourceState>(CHARACTER_STATE_KEY, {});
  const current = state[String(characterId)] ?? {};

  state[String(characterId)] = {
    ...current,
    magicPoints: maxMagicPoints,
    maxMagicPoints,
    hitPoints: hitPointValues.hitPoints,
    maxHitPoints: hitPointValues.maxHitPoints,
  };

  writeJson(CHARACTER_STATE_KEY, state);
  emitCharacterChange();
};

export const addMagicPoints = (amount: number) => {
  const character = getSelectedCharacter();

  if (!character || Number.isNaN(amount) || amount <= 0) {
    return getSelectedCharacter();
  }

  const state = readJson<CharacterResourceState>(CHARACTER_STATE_KEY, {});
  const key = String(character.id);
  const current = mergeResources(character, state[key]);

  state[key] = {
    ...current,
    magicPoints: Math.min(current.maxMagicPoints, current.magicPoints + amount),
  };

  writeJson(CHARACTER_STATE_KEY, state);
  emitCharacterChange();
  return getSelectedCharacter();
};

export const resetMagicPoints = () => {
  const character = getSelectedCharacter();

  if (!character) {
    return null;
  }

  const state = readJson<CharacterResourceState>(CHARACTER_STATE_KEY, {});
  const key = String(character.id);
  const current = mergeResources(character, state[key]);

  state[key] = {
    ...current,
    magicPoints: character.maxMagicPoints ?? character.magicPoints ?? 0,
    maxMagicPoints: character.maxMagicPoints ?? character.magicPoints ?? 0,
  };

  writeJson(CHARACTER_STATE_KEY, state);
  emitCharacterChange();
  return getSelectedCharacter();
};

export const spendMagicPoints = (amount: number) => {
  const character = getSelectedCharacter();

  if (!character || Number.isNaN(amount) || amount <= 0) {
    return false;
  }

  const currentMagicPoints = character.magicPoints ?? 0;

  if (currentMagicPoints < amount) {
    return false;
  }

  const state = readJson<CharacterResourceState>(CHARACTER_STATE_KEY, {});
  const key = String(character.id);
  const current = mergeResources(character, state[key]);

  state[key] = {
    ...current,
    magicPoints: currentMagicPoints - amount,
    maxMagicPoints: character.maxMagicPoints ?? currentMagicPoints,
  };

  writeJson(CHARACTER_STATE_KEY, state);
  emitCharacterChange();
  return true;
};

export const damageSelectedCharacter = (amount: number) => {
  const character = getSelectedCharacter();

  if (!character || Number.isNaN(amount) || amount <= 0) {
    return getSelectedCharacter();
  }

  const state = readJson<CharacterResourceState>(CHARACTER_STATE_KEY, {});
  const key = String(character.id);
  const current = mergeResources(character, state[key]);

  state[key] = {
    ...current,
    hitPoints: Math.max(0, current.hitPoints - amount),
  };

  writeJson(CHARACTER_STATE_KEY, state);
  emitCharacterChange();
  return getSelectedCharacter();
};

export const healSelectedCharacter = (amount: number) => {
  const character = getSelectedCharacter();

  if (!character || Number.isNaN(amount) || amount <= 0) {
    return getSelectedCharacter();
  }

  const state = readJson<CharacterResourceState>(CHARACTER_STATE_KEY, {});
  const key = String(character.id);
  const current = mergeResources(character, state[key]);

  state[key] = {
    ...current,
    hitPoints: Math.min(current.maxHitPoints, current.hitPoints + amount),
  };

  writeJson(CHARACTER_STATE_KEY, state);
  emitCharacterChange();
  return getSelectedCharacter();
};

export const restSelectedCharacter = () => {
  const character = getSelectedCharacter();

  if (!character) {
    return null;
  }

  const state = readJson<CharacterResourceState>(CHARACTER_STATE_KEY, {});
  const key = String(character.id);
  const current = mergeResources(character, state[key]);
  const levelHealing = Math.max(0, character.level ?? 0);

  state[key] = {
    ...current,
    magicPoints: character.maxMagicPoints ?? character.magicPoints ?? 0,
    maxMagicPoints: character.maxMagicPoints ?? character.magicPoints ?? 0,
    hitPoints: Math.min(current.maxHitPoints, current.hitPoints + levelHealing),
  };

  writeJson(CHARACTER_STATE_KEY, state);
  emitCharacterChange();
  return getSelectedCharacter();
};

export const getSpellbookIds = (characterId?: number) => {
  const character = characterId ? null : getSelectedCharacter();
  const key = String(characterId ?? character?.id ?? '');
  const state = readJson<SpellbookState>(SPELLBOOK_KEY, {});

  return key ? state[key] ?? [] : [];
};

export const addSpellToSelectedSpellbook = (spellId: number) => {
  const character = getSelectedCharacter();

  if (!character) {
    return false;
  }

  const state = readJson<SpellbookState>(SPELLBOOK_KEY, {});
  const key = String(character.id);
  const spellIds = new Set(state[key] ?? []);
  spellIds.add(spellId);
  state[key] = Array.from(spellIds);

  writeJson(SPELLBOOK_KEY, state);
  emitSpellbookChange();
  return true;
};

export const removeSpellFromSelectedSpellbook = (spellId: number) => {
  const character = getSelectedCharacter();

  if (!character) {
    return false;
  }

  const state = readJson<SpellbookState>(SPELLBOOK_KEY, {});
  const key = String(character.id);
  state[key] = (state[key] ?? []).filter((id) => id !== spellId);

  writeJson(SPELLBOOK_KEY, state);
  emitSpellbookChange();
  return true;
};

export const useSelectedCharacter = () => {
  const [character, setCharacter] = useState<Character | null>(null);

  useEffect(() => {
    const syncCharacter = () => setCharacter(getSelectedCharacter());

    syncCharacter();
    window.addEventListener(CHANGE_EVENT, syncCharacter);
    window.addEventListener('storage', syncCharacter);

    return () => {
      window.removeEventListener(CHANGE_EVENT, syncCharacter);
      window.removeEventListener('storage', syncCharacter);
    };
  }, []);

  return character;
};

export const useSpellbookIds = () => {
  const [spellIds, setSpellIds] = useState<number[]>([]);

  useEffect(() => {
    const syncSpellbook = () => setSpellIds(getSpellbookIds());

    syncSpellbook();
    window.addEventListener(SPELLBOOK_EVENT, syncSpellbook);
    window.addEventListener(CHANGE_EVENT, syncSpellbook);
    window.addEventListener('storage', syncSpellbook);

    return () => {
      window.removeEventListener(SPELLBOOK_EVENT, syncSpellbook);
      window.removeEventListener(CHANGE_EVENT, syncSpellbook);
      window.removeEventListener('storage', syncSpellbook);
    };
  }, []);

  return spellIds;
};
