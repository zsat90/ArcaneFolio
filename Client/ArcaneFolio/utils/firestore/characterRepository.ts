import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { Character } from '../../types/characterTypes';
import { FirestoreCharacterRecord } from '../../types/firestoreCharacterTypes';
import { CharacterSheetState } from '../character/characterSheetState';
import { getFirebaseFirestore } from '../auth/authService';
import {
  FIRESTORE_TIMEOUT_MS,
  requireOwnerId,
  runFirestoreOperation,
  sanitizeForFirestore,
  withFirestoreTimeout,
} from './firestoreClient';
import { characterDocPath, legacyCharacterDocPath } from './firestorePaths';

const parseNumber = (value?: string | number) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (!value) {
    return 0;
  }

  const parsed = Number(String(value).replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : 0;
};

export const toCharacterRecord = (
  character: Character,
  ownerId: string,
  sheet?: CharacterSheetState,
  createdAt?: number,
): FirestoreCharacterRecord => {
  const characterClass = character.characterClass || character.class || 'Fighter';

  return {
    id: character.id,
    ownerId,
    name: character.name,
    class: character.class || characterClass,
    characterClass,
    race: sheet?.race || '',
    level: character.level ?? 1,
    currentXp: parseNumber(sheet?.experienceDetails?.Current),
    nextXpTarget: parseNumber(sheet?.experienceDetails?.['Next XP Target']),
    hitPoints: character.hitPoints ?? 0,
    maxHitPoints: character.maxHitPoints ?? character.hitPoints ?? 0,
    magicPoints: character.magicPoints ?? 0,
    maxMagicPoints: character.maxMagicPoints ?? character.magicPoints ?? 0,
    createdAt: createdAt ?? Date.now(),
    updatedAt: Date.now(),
  };
};

export const characterRecordToCharacter = (record: FirestoreCharacterRecord): Character => ({
  id: record.id,
  name: record.name,
  class: record.class,
  characterClass: record.characterClass,
  level: record.level,
  magicPoints: record.magicPoints,
  maxMagicPoints: record.maxMagicPoints,
  hitPoints: record.hitPoints,
  maxHitPoints: record.maxHitPoints,
});

const getCharacterDocRef = (ownerId: string, characterId: number) => (
  doc(getFirebaseFirestore(), 'users', ownerId, 'characters', String(characterId))
);

export const saveCharacterDocument = async (
  character: Character,
  sheet?: CharacterSheetState,
  existingCreatedAt?: number,
) => {
  const ownerId = await requireOwnerId();
  const documentPath = characterDocPath(ownerId, character.id);
  const existing = await getDoc(getCharacterDocRef(ownerId, character.id));
  const createdAt = existingCreatedAt
    ?? (existing.exists() ? (existing.data() as FirestoreCharacterRecord).createdAt : Date.now());
  const payload = sanitizeForFirestore(
    toCharacterRecord(character, ownerId, sheet, createdAt) as unknown as Record<string, unknown>,
  ) as FirestoreCharacterRecord;

  await runFirestoreOperation(
    'write',
    documentPath,
    'setDoc',
    'save character to Firestore',
    () => withFirestoreTimeout(
      setDoc(getCharacterDocRef(ownerId, character.id), payload),
      FIRESTORE_TIMEOUT_MS,
      'Saving took too long. Check connection, Firebase config, or Firestore rules.',
    ),
    { characterId: character.id, name: character.name },
  );
};

export const loadCharacterDocuments = async () => {
  const ownerId = await requireOwnerId();
  const collectionPath = `users/${ownerId}/characters`;

  return runFirestoreOperation(
    'read',
    collectionPath,
    'getDocs',
    'load characters from Firestore',
    async () => {
      const snapshot = await withFirestoreTimeout(
        getDocs(collection(getFirebaseFirestore(), 'users', ownerId, 'characters')),
        FIRESTORE_TIMEOUT_MS,
        'Loading characters took too long. Check connection, Firebase config, or Firestore rules.',
      );

      return snapshot.docs
        .map((docSnapshot) => docSnapshot.data() as FirestoreCharacterRecord)
        .filter((character) => character.ownerId === ownerId)
        .sort((left, right) => left.name.localeCompare(right.name));
    },
  );
};

export const deleteCharacterDocument = async (characterId: number) => {
  const ownerId = await requireOwnerId();
  const documentPath = characterDocPath(ownerId, characterId);

  await runFirestoreOperation(
    'delete',
    documentPath,
    'deleteDoc',
    'delete character from Firestore',
    () => deleteDoc(getCharacterDocRef(ownerId, characterId)),
    { characterId },
  );
};

/** One-time migration only — reads legacy top-level `characters` collection. Normal app flow uses users/{uid}/characters. */
export const loadLegacyCharacterDocuments = async () => {
  const ownerId = await requireOwnerId();

  try {
    const snapshot = await getDocs(
      query(collection(getFirebaseFirestore(), 'characters'), where('ownerId', '==', ownerId)),
    );

    return snapshot.docs
      .map((docSnapshot) => docSnapshot.data() as Character & { ownerId: string });
  } catch {
    return [];
  }
};

export const deleteLegacyCharacterDocument = async (characterId: number) => {
  const ownerId = await requireOwnerId();
  const legacyPath = legacyCharacterDocPath(ownerId, characterId);

  try {
    await deleteDoc(doc(getFirebaseFirestore(), 'characters', `${ownerId}_${characterId}`));
    console.log('[firestore:migration] Deleted legacy character document', { legacyPath });
  } catch {
    // Legacy doc may not exist.
  }
};
