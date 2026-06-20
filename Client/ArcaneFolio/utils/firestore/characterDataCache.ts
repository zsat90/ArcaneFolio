import { CharacterSheetState } from '../character/characterSheetState';
import { FirestoreRuntimeStateRecord } from '../../types/firestoreCharacterTypes';
import { loadSheetDocument, saveSheetDocument } from './sheetRepository';
import { loadSpellbookDocument, saveSpellbookDocument } from './spellbookRepository';
import { loadRuntimeStateDocument, saveRuntimeStateDocument, toRuntimeStateRecord } from './runtimeStateRepository';

type SpellbookCache = {
  spellIds: number[];
  notes: string;
};

const sheetCache = new Map<number, CharacterSheetState>();
const spellbookCache = new Map<number, SpellbookCache>();
const runtimeCache = new Map<number, FirestoreRuntimeStateRecord>();
const loadingPromises = new Map<number, Promise<void>>();

export const clearCharacterDataCache = () => {
  sheetCache.clear();
  spellbookCache.clear();
  runtimeCache.clear();
  loadingPromises.clear();
};

export const clearCachedCharacterData = (characterId: number) => {
  sheetCache.delete(characterId);
  spellbookCache.delete(characterId);
  runtimeCache.delete(characterId);
  loadingPromises.delete(characterId);
};

export const getCachedSheet = (characterId: number) => sheetCache.get(characterId) ?? null;

export const setCachedSheet = (characterId: number, sheet: CharacterSheetState) => {
  sheetCache.set(characterId, sheet);
};

export const getCachedSpellbookIds = (characterId: number) => (
  spellbookCache.get(characterId)?.spellIds ?? null
);

export const getCachedSpellbook = (characterId: number) => spellbookCache.get(characterId) ?? null;

export const setCachedSpellbook = (characterId: number, spellIds: number[], notes = '') => {
  spellbookCache.set(characterId, { spellIds, notes });
};

export const getCachedRuntimeState = (characterId: number) => runtimeCache.get(characterId) ?? null;

export const setCachedRuntimeState = (characterId: number, state: FirestoreRuntimeStateRecord) => {
  runtimeCache.set(characterId, state);
};

export const preloadCharacterData = async (characterId: number) => {
  if (loadingPromises.has(characterId)) {
    await loadingPromises.get(characterId);
    return;
  }

  const loadPromise = (async () => {
    const [sheet, spellbook, runtimeState] = await Promise.all([
      loadSheetDocument(characterId),
      loadSpellbookDocument(characterId),
      loadRuntimeStateDocument(characterId),
    ]);

    if (sheet) {
      sheetCache.set(characterId, sheet);
    }

    spellbookCache.set(characterId, spellbook);
    if (runtimeState) {
      runtimeCache.set(characterId, runtimeState);
    }
  })();

  loadingPromises.set(characterId, loadPromise);

  try {
    await loadPromise;
  } finally {
    loadingPromises.delete(characterId);
  }
};

export const persistSheet = async (characterId: number, sheet: CharacterSheetState) => {
  sheetCache.set(characterId, sheet);
  await saveSheetDocument(characterId, sheet);
};

export const persistSpellbook = async (characterId: number, spellIds: number[], notes = '') => {
  spellbookCache.set(characterId, { spellIds, notes });
  await saveSpellbookDocument(characterId, spellIds, notes);
};

export const persistRuntimeState = async (
  characterId: number,
  state: {
    currentHp: number;
    maxHp: number;
    currentMp: number;
    maxMp: number;
    temporaryEffects?: string;
  },
) => {
  const record = toRuntimeStateRecord(state);
  runtimeCache.set(characterId, record);
  await saveRuntimeStateDocument(characterId, state);
};

export const seedCharacterDataCache = (
  characterId: number,
  data: {
    sheet?: CharacterSheetState;
    spellIds?: number[];
    spellbookNotes?: string;
    runtimeState?: FirestoreRuntimeStateRecord;
  },
) => {
  if (data.sheet) {
    sheetCache.set(characterId, data.sheet);
  }

  if (data.spellIds) {
    spellbookCache.set(characterId, {
      spellIds: data.spellIds,
      notes: data.spellbookNotes ?? '',
    });
  }

  if (data.runtimeState) {
    runtimeCache.set(characterId, data.runtimeState);
  }
};
