import { getScopedStorageKey } from '../auth/accountScope';
import { Character } from '../../types/characterTypes';
import { CharacterSheetState } from '../character/characterSheetState';
import {
  loadCharacterDocuments,
  loadLegacyCharacterDocuments,
  saveCharacterDocument,
  deleteLegacyCharacterDocument,
} from './characterRepository';
import { saveSheetDocument } from './sheetRepository';
import { saveSpellbookDocument } from './spellbookRepository';
import { saveRuntimeStateDocument, toRuntimeStateRecord } from './runtimeStateRepository';
import { seedCharacterDataCache } from './characterDataCache';
import { logFirestoreDiagnostics } from './firestoreDiagnostics';

const MIGRATION_COMPLETE_KEY = 'arcane:migration-complete';
const CUSTOM_CHARACTERS_KEY = 'arcane:custom-characters';
const SHEET_STORAGE_KEY = 'arcane:character-sheets';
const SPELLBOOK_KEY = 'arcane:spellbooks';
const CHARACTER_STATE_KEY = 'arcane:character-state';

type LocalStoredCharacter = Character & { ownerId?: string };
type CharacterResourceState = Record<string, {
  magicPoints?: number;
  maxMagicPoints?: number;
  hitPoints?: number;
  maxHitPoints?: number;
}>;
type SpellbookState = Record<string, number[]>;

const canUseStorage = () => typeof window !== 'undefined';

const readScopedJson = <T,>(baseKey: string, fallback: T): T => {
  if (!canUseStorage()) {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(getScopedStorageKey(baseKey));
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
};

const isMigrationComplete = (ownerId: string) => {
  if (!canUseStorage()) {
    return true;
  }

  return window.localStorage.getItem(getScopedStorageKey(MIGRATION_COMPLETE_KEY)) === 'true';
};

const markMigrationComplete = (ownerId: string) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(getScopedStorageKey(MIGRATION_COMPLETE_KEY), 'true');
  logFirestoreDiagnostics('migration-complete', { ownerId });
};

const readLocalCharacters = (ownerId: string) => (
  readScopedJson<LocalStoredCharacter[]>(CUSTOM_CHARACTERS_KEY, [])
    .filter((character) => character.ownerId === ownerId)
);

const readLocalSheets = () => (
  readScopedJson<Record<string, CharacterSheetState>>(SHEET_STORAGE_KEY, {})
);

const readLocalSpellbooks = () => (
  readScopedJson<SpellbookState>(SPELLBOOK_KEY, {})
);

const readLocalRuntimeState = () => (
  readScopedJson<CharacterResourceState>(CHARACTER_STATE_KEY, {})
);

export const runFirestoreMigrationIfNeeded = async (ownerId: string) => {
  if (!ownerId || isMigrationComplete(ownerId)) {
    return;
  }

  try {
    logFirestoreDiagnostics('migration-start', { ownerId });

    const existingCharacters = await loadCharacterDocuments().catch(() => []);

    if (existingCharacters.length > 0) {
      markMigrationComplete(ownerId);
      return;
    }

    const legacyCharacters = await loadLegacyCharacterDocuments();
  const localCharacters = readLocalCharacters(ownerId);
  const localSheets = readLocalSheets();
  const localSpellbooks = readLocalSpellbooks();
  const localRuntime = readLocalRuntimeState();

  const charactersToMigrate = new Map<number, Character>();

  legacyCharacters.forEach((record) => {
    charactersToMigrate.set(record.id, {
      id: record.id,
      name: record.name,
      class: record.class || record.characterClass || 'Fighter',
      characterClass: record.characterClass || record.class || 'Fighter',
      level: record.level ?? 1,
      magicPoints: record.magicPoints ?? 0,
      maxMagicPoints: record.maxMagicPoints ?? record.magicPoints ?? 0,
      hitPoints: record.hitPoints ?? 0,
      maxHitPoints: record.maxHitPoints ?? record.hitPoints ?? 0,
    });
  });

  localCharacters.forEach((character) => {
    charactersToMigrate.set(character.id, character);
  });

  if (charactersToMigrate.size === 0) {
    markMigrationComplete(ownerId);
    return;
  }

  for (const character of Array.from(charactersToMigrate.values())) {
    const sheet = localSheets[String(character.id)];
    const spellIds = localSpellbooks[String(character.id)] ?? [];
    const runtime = localRuntime[String(character.id)];

    await saveCharacterDocument(character, sheet);
    if (sheet) {
      await saveSheetDocument(character.id, sheet);
    }

    await saveSpellbookDocument(character.id, spellIds);
    await saveRuntimeStateDocument(
      character.id,
      toRuntimeStateRecord({
        currentHp: runtime?.hitPoints ?? character.hitPoints ?? 0,
        maxHp: runtime?.maxHitPoints ?? character.maxHitPoints ?? 0,
        currentMp: runtime?.magicPoints ?? character.magicPoints ?? 0,
        maxMp: runtime?.maxMagicPoints ?? character.maxMagicPoints ?? 0,
      }),
    );

    seedCharacterDataCache(character.id, {
      sheet,
      spellIds,
      runtimeState: toRuntimeStateRecord({
        currentHp: runtime?.hitPoints ?? character.hitPoints ?? 0,
        maxHp: runtime?.maxHitPoints ?? character.maxHitPoints ?? 0,
        currentMp: runtime?.magicPoints ?? character.magicPoints ?? 0,
        maxMp: runtime?.maxMagicPoints ?? character.maxMagicPoints ?? 0,
      }),
    });

    await deleteLegacyCharacterDocument(character.id);
  }

  markMigrationComplete(ownerId);
  logFirestoreDiagnostics('migration-finished', { ownerId, count: charactersToMigrate.size });
  } catch (error) {
    console.error('[firestore:migration] Migration failed', error);
  }
};
