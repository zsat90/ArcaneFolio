import { useEffect, useState } from 'react';
import { Character } from '../../types/characterTypes';
import { ensureAuthTokenReady, getFirebaseAuth } from '../auth/authService';
import { getScopedStorageKey } from '../auth/accountScope';
import {
  clearCachedCharacterData,
  clearCharacterDataCache,
  getCachedRuntimeState,
  getCachedSpellbookIds,
  persistRuntimeState,
  persistSheet,
  persistSpellbook,
  preloadCharacterData,
  setCachedRuntimeState,
  setCachedSpellbook,
} from '../firestore/characterDataCache';
import {
  characterRecordToCharacter,
  deleteCharacterDocument,
  loadCharacterDocuments,
  saveCharacterDocument,
} from '../firestore/characterRepository';
import { logFirestoreDiagnostics } from '../firestore/firestoreDiagnostics';
import { deleteRuntimeStateDocument, saveRuntimeStateDocument, toRuntimeStateRecord } from '../firestore/runtimeStateRepository';
import { deleteSheetDocument } from '../firestore/sheetRepository';
import { deleteSpellbookDocument, saveSpellbookDocument } from '../firestore/spellbookRepository';
import {
  calculateSheetMagicPoints,
  getCharacterSheet,
} from './characterSheetState';
import { parseLevelTitle } from './experience';
import { parseHitPointValue } from './hitPoints';

const SELECTED_CHARACTER_KEY = 'arcane:selected-character-id';
const CHANGE_EVENT = 'arcane-character-change';
const SPELLBOOK_EVENT = 'arcane-spellbook-change';

type CharacterResources = {
  magicPoints: number;
  maxMagicPoints: number;
  hitPoints: number;
  maxHitPoints: number;
};

export const DEFAULT_CHARACTERS: Character[] = [];

const canUseStorage = () => typeof window !== 'undefined';

const readSelectedCharacterId = () => {
  if (!canUseStorage()) {
    return null;
  }

  const value = window.localStorage.getItem(getScopedStorageKey(SELECTED_CHARACTER_KEY));
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const writeSelectedCharacterId = (characterId: number | null) => {
  if (!canUseStorage()) {
    return;
  }

  if (characterId === null) {
    window.localStorage.removeItem(getScopedStorageKey(SELECTED_CHARACTER_KEY));
    return;
  }

  window.localStorage.setItem(getScopedStorageKey(SELECTED_CHARACTER_KEY), String(characterId));
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

  return { hitPoints, maxHitPoints };
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

const getCalculatedCharacterResources = (character: Character): CharacterResources => {
  const normalizedCharacter = normalizeCharacter(character);
  const runtime = getCachedRuntimeState(normalizedCharacter.id);
  const sheet = getCharacterSheet(normalizedCharacter.id);
  const level = parseLevelTitle(sheet.levelTitle || String(normalizedCharacter.level || 1));
  const maxMagicPoints = calculateSheetMagicPoints(
    normalizedCharacter.characterClass || normalizedCharacter.class || '',
    level,
    sheet,
  );
  const hitPointValues = getSheetHitPointValues(normalizedCharacter.id, normalizedCharacter);
  const currentMagicPoints = runtime
    ? runtime.currentMp
    : normalizedCharacter.magicPoints ?? maxMagicPoints;
  const currentHitPoints = runtime
    ? runtime.currentHp
    : hitPointValues.hitPoints;

  return {
    magicPoints: Math.min(Math.max(0, currentMagicPoints), maxMagicPoints),
    maxMagicPoints,
    hitPoints: Math.min(Math.max(0, currentHitPoints), hitPointValues.maxHitPoints),
    maxHitPoints: hitPointValues.maxHitPoints,
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

const getCurrentOwnerId = () => getFirebaseAuth().currentUser?.uid || null;

const getErrorCode = (error: unknown) => (
  typeof error === 'object' && error && 'code' in error
    ? String(error.code)
    : 'unknown'
);

const getErrorMessage = (error: unknown) => (
  typeof error === 'object' && error && 'message' in error
    ? String(error.message)
    : 'Unknown error'
);

const updateRuntimeState = async (character: Character, resources: CharacterResources) => {
  const record = toRuntimeStateRecord({
    currentHp: resources.hitPoints,
    maxHp: resources.maxHitPoints,
    currentMp: resources.magicPoints,
    maxMp: resources.maxMagicPoints,
  });
  setCachedRuntimeState(character.id, record);
  await persistRuntimeState(character.id, {
    currentHp: resources.hitPoints,
    maxHp: resources.maxHitPoints,
    currentMp: resources.magicPoints,
    maxMp: resources.maxMagicPoints,
  });
};

export const clearSessionCharacterState = () => {
  writeSelectedCharacterId(null);
  clearCharacterDataCache();
  emitCharacterChange();
  emitSpellbookChange();
};

export const setSelectedCharacter = (character: Character) => {
  const normalizedCharacter = normalizeCharacter(character);
  writeSelectedCharacterId(normalizedCharacter.id);
  selectedCharacterCache = normalizedCharacter;

  void preloadCharacterData(normalizedCharacter.id).then(async () => {
    let runtime = getCachedRuntimeState(normalizedCharacter.id);

    if (!runtime) {
      const defaults = getCalculatedCharacterResources(normalizedCharacter);
      await updateRuntimeState(normalizedCharacter, defaults);
    }

    selectedCharacterCache = mergeCharacterWithRuntime(normalizedCharacter);
    emitCharacterChange();
  });
};

export const getCharacters = async () => {
  const ownerId = getCurrentOwnerId();

  if (!ownerId) {
    return [] as Character[];
  }

  const records = await loadCharacterDocuments();
  const characters = records.map((record) => normalizeCharacter(characterRecordToCharacter(record)));
  const selectedCharacterId = readSelectedCharacterId();

  if (selectedCharacterId && !characters.some((character) => character.id === selectedCharacterId)) {
    writeSelectedCharacterId(null);
  }

  return characters;
};

export const addCharacter = async (
  character: Omit<Character, 'id'> & { id?: number },
  sheet?: import('./characterSheetState').CharacterSheetState,
) => {
  const ownerId = await ensureAuthTokenReady();

  if (!ownerId) {
    throw new Error('You must be logged in to create a character.');
  }

  logFirestoreDiagnostics('add-character-start', {
    characterName: character.name,
  });

  const normalizedCharacter = normalizeCharacter({
    ...character,
    id: character.id ?? Date.now(),
  });

  await saveCharacterDocument(normalizedCharacter, sheet);
  await saveSpellbookDocument(normalizedCharacter.id, []);
  await saveRuntimeStateDocument(
    normalizedCharacter.id,
    toRuntimeStateRecord({
      currentHp: normalizedCharacter.hitPoints ?? 0,
      maxHp: normalizedCharacter.maxHitPoints ?? 0,
      currentMp: normalizedCharacter.magicPoints ?? 0,
      maxMp: normalizedCharacter.maxMagicPoints ?? 0,
    }),
  );

  if (sheet) {
    await persistSheet(normalizedCharacter.id, sheet);
  }

  setCachedSpellbook(normalizedCharacter.id, []);
  setCachedRuntimeState(
    normalizedCharacter.id,
    toRuntimeStateRecord({
      currentHp: normalizedCharacter.hitPoints ?? 0,
      maxHp: normalizedCharacter.maxHitPoints ?? 0,
      currentMp: normalizedCharacter.magicPoints ?? 0,
      maxMp: normalizedCharacter.maxMagicPoints ?? 0,
    }),
  );

  setSelectedCharacter(normalizedCharacter);
  return normalizedCharacter;
};

export const removeCharacter = async (characterId: number) => {
  const ownerId = await ensureAuthTokenReady();

  if (!ownerId) {
    return;
  }

  try {
    await Promise.all([
      deleteCharacterDocument(characterId),
      deleteSheetDocument(characterId),
      deleteSpellbookDocument(characterId),
      deleteRuntimeStateDocument(characterId),
    ]);
  } catch (error) {
    console.error(
      `[characters] delete failed code=${getErrorCode(error)} message=${getErrorMessage(error)}`,
      error,
    );
    throw error;
  }

  clearCachedCharacterData(characterId);

  if (readSelectedCharacterId() === characterId) {
    writeSelectedCharacterId(null);
  }

  emitCharacterChange();
  emitSpellbookChange();
};

let selectedCharacterCache: Character | null = null;

export const getSelectedCharacter = (): Character | null => selectedCharacterCache;

export const getSelectedCharacterSnapshot = () => selectedCharacterCache;

export const hydrateSelectedCharacter = async (characters: Character[]) => {
  const selectedCharacterId = readSelectedCharacterId();

  if (!selectedCharacterId) {
    selectedCharacterCache = null;
    return null;
  }

  const character = characters.find((item) => item.id === selectedCharacterId);

  if (!character) {
    writeSelectedCharacterId(null);
    selectedCharacterCache = null;
    return null;
  }

  await preloadCharacterData(character.id);
  selectedCharacterCache = mergeCharacterWithRuntime(character);
  emitCharacterChange();
  return selectedCharacterCache;
};

const mergeCharacterWithRuntime = (character: Character): Character => {
  const normalizedCharacter = normalizeCharacter(character);
  const runtime = getCachedRuntimeState(normalizedCharacter.id);
  const sheet = getCharacterSheet(normalizedCharacter.id);
  const level = parseLevelTitle(sheet.levelTitle || String(normalizedCharacter.level || 1));
  const sheetMagicPoints = calculateSheetMagicPoints(
    normalizedCharacter.characterClass || normalizedCharacter.class || '',
    level,
    sheet,
  );

  if (!runtime) {
    const maxMagicPoints = sheetMagicPoints;

    return {
      ...normalizedCharacter,
      magicPoints: Math.min(normalizedCharacter.magicPoints ?? maxMagicPoints, maxMagicPoints),
      maxMagicPoints,
    };
  }

  const maxMagicPoints = sheetMagicPoints;
  const magicPoints = Math.min(runtime.currentMp, maxMagicPoints);
  const maxHitPoints = runtime.maxHp || normalizedCharacter.maxHitPoints || 0;
  const hitPoints = Math.min(runtime.currentHp, maxHitPoints);

  return {
    ...normalizedCharacter,
    magicPoints,
    maxMagicPoints,
    hitPoints,
    maxHitPoints,
  };
};

export const syncMagicPointsFromSheet = async (characterId: number, characterClass: string, level: number) => {
  const sheet = getCharacterSheet(characterId);
  const maxMagicPoints = calculateSheetMagicPoints(characterClass, level, sheet);
  const hitPointValues = getSheetHitPointValues(characterId);
  const runtime = getCachedRuntimeState(characterId);
  const current = runtime
    ? {
        magicPoints: runtime.currentMp,
        maxMagicPoints: runtime.maxMp,
        hitPoints: runtime.currentHp,
        maxHitPoints: runtime.maxHp,
      }
    : hitPointValues;

  const currentMagicPoints = runtime ? runtime.currentMp : maxMagicPoints;
  const nextCurrentMagicPoints = Math.min(Math.max(0, currentMagicPoints), maxMagicPoints);
  const currentHitPoints = runtime ? runtime.currentHp : hitPointValues.hitPoints;
  const next = {
    magicPoints: nextCurrentMagicPoints,
    maxMagicPoints,
    hitPoints: Math.min(Math.max(0, currentHitPoints), hitPointValues.maxHitPoints),
    maxHitPoints: hitPointValues.maxHitPoints,
  };

  await updateRuntimeState({ id: characterId, name: '', class: characterClass }, next);
  emitCharacterChange();
};

const withSelectedCharacterUpdate = async (
  updater: (character: Character, current: CharacterResources) => CharacterResources,
) => {
  const character = getSelectedCharacterSnapshot();

  if (!character) {
    return null;
  }

  const current = getCalculatedCharacterResources(character);
  const next = updater(character, current);

  await updateRuntimeState(character, next);
  selectedCharacterCache = mergeCharacterWithRuntime(character);
  emitCharacterChange();
  return selectedCharacterCache;
};

export const addMagicPoints = (amount: number) => {
  if (Number.isNaN(amount) || amount <= 0) {
    return getSelectedCharacterSnapshot();
  }

  void withSelectedCharacterUpdate((character, current) => ({
    ...current,
    magicPoints: Math.min(current.maxMagicPoints, current.magicPoints + amount),
  }));

  return getSelectedCharacterSnapshot();
};

export const resetMagicPoints = () => {
  const character = getSelectedCharacterSnapshot();

  if (!character) {
    return null;
  }

  void withSelectedCharacterUpdate((_character, current) => ({
    ...current,
    magicPoints: current.maxMagicPoints,
  }));

  return getSelectedCharacterSnapshot();
};

export const spendMagicPoints = (amount: number) => {
  const character = getSelectedCharacterSnapshot();

  if (!character || Number.isNaN(amount) || amount <= 0) {
    return false;
  }

  const currentMagicPoints = character.magicPoints ?? 0;

  if (currentMagicPoints < amount) {
    return false;
  }

  void withSelectedCharacterUpdate((_character, current) => ({
    ...current,
    magicPoints: currentMagicPoints - amount,
    maxMagicPoints: character.maxMagicPoints ?? currentMagicPoints,
  }));

  return true;
};

export const damageSelectedCharacter = (amount: number) => {
  if (Number.isNaN(amount) || amount <= 0) {
    return getSelectedCharacterSnapshot();
  }

  return withSelectedCharacterUpdate((_character, current) => ({
    ...current,
    hitPoints: Math.max(0, current.hitPoints - amount),
  }));
};

export const healSelectedCharacter = (amount: number) => {
  if (Number.isNaN(amount) || amount <= 0) {
    return getSelectedCharacterSnapshot();
  }

  return withSelectedCharacterUpdate((_character, current) => ({
    ...current,
    hitPoints: Math.min(current.maxHitPoints, current.hitPoints + amount),
  }));
};

export const restSelectedCharacter = () => {
  const character = getSelectedCharacterSnapshot();

  if (!character) {
    return null;
  }

  return withSelectedCharacterUpdate((_character, current) => ({
    ...current,
    magicPoints: current.maxMagicPoints,
  }));
};

export const getSpellbookIds = (characterId?: number) => {
  const id = characterId ?? readSelectedCharacterId();

  if (!id) {
    return [];
  }

  return getCachedSpellbookIds(id) ?? [];
};

export const addSpellToSelectedSpellbook = (spellId: number) => {
  const characterId = readSelectedCharacterId();

  if (!characterId) {
    return false;
  }

  const spellIds = new Set(getCachedSpellbookIds(characterId) ?? []);
  spellIds.add(spellId);
  const nextIds = Array.from(spellIds);

  setCachedSpellbook(characterId, nextIds);
  void persistSpellbook(characterId, nextIds).catch((error) => {
    console.error('[spellbook] Failed to persist spellbook', error);
  });
  emitSpellbookChange();
  return true;
};

export const removeSpellFromSelectedSpellbook = (spellId: number) => {
  const characterId = readSelectedCharacterId();

  if (!characterId) {
    return false;
  }

  const nextIds = (getCachedSpellbookIds(characterId) ?? []).filter((id) => id !== spellId);

  setCachedSpellbook(characterId, nextIds);
  void persistSpellbook(characterId, nextIds).catch((error) => {
    console.error('[spellbook] Failed to persist spellbook', error);
  });
  emitSpellbookChange();
  return true;
};

export const useSelectedCharacter = () => {
  const [character, setCharacter] = useState<Character | null>(null);

  useEffect(() => {
    const syncCharacter = async () => {
      const selectedId = readSelectedCharacterId();

      if (!selectedId) {
        setCharacter(null);
        return;
      }

      await preloadCharacterData(selectedId);
      const characters = await getCharacters().catch(() => []);
      const match = characters.find((item) => item.id === selectedId);
      setCharacter(match ? mergeCharacterWithRuntime(match) : null);
    };

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
    const syncSpellbook = async () => {
      const selectedId = readSelectedCharacterId();

      if (!selectedId) {
        setSpellIds([]);
        return;
      }

      await preloadCharacterData(selectedId);
      setSpellIds(getCachedSpellbookIds(selectedId) ?? []);
    };

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
