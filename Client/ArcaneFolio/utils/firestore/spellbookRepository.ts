import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { FirestoreSpellbookRecord } from '../../types/firestoreCharacterTypes';
import { getFirebaseFirestore } from '../auth/authService';
import {
  FIRESTORE_TIMEOUT_MS,
  requireOwnerId,
  runFirestoreOperation,
  sanitizeForFirestore,
  withFirestoreTimeout,
} from './firestoreClient';
import { characterSpellbookDocPath } from './firestorePaths';

const getSpellbookDocRef = (ownerId: string, characterId: number) => (
  doc(getFirebaseFirestore(), 'users', ownerId, 'characters', String(characterId), 'spellbook', 'main')
);

export const saveSpellbookDocument = async (characterId: number, spellIds: number[], notes = '') => {
  const ownerId = await requireOwnerId();
  const documentPath = characterSpellbookDocPath(ownerId, characterId);
  const payload = sanitizeForFirestore({
    spellIds,
    notes,
    updatedAt: Date.now(),
  } satisfies FirestoreSpellbookRecord);

  await runFirestoreOperation(
    'write',
    documentPath,
    'setDoc',
    'save spellbook to Firestore',
    () => withFirestoreTimeout(
      setDoc(getSpellbookDocRef(ownerId, characterId), payload),
      FIRESTORE_TIMEOUT_MS,
      'Saving spellbook took too long. Check connection or Firestore rules.',
    ),
    { characterId, spellCount: spellIds.length },
  );
};

export const loadSpellbookDocument = async (characterId: number) => {
  const ownerId = await requireOwnerId();
  const documentPath = characterSpellbookDocPath(ownerId, characterId);

  return runFirestoreOperation(
    'read',
    documentPath,
    'getDoc',
    'load spellbook from Firestore',
    async () => {
      const snapshot = await withFirestoreTimeout(
        getDoc(getSpellbookDocRef(ownerId, characterId)),
        FIRESTORE_TIMEOUT_MS,
        'Loading spellbook took too long. Check connection or Firestore rules.',
      );

      if (!snapshot.exists()) {
        return { spellIds: [], notes: '' };
      }

      const data = snapshot.data() as FirestoreSpellbookRecord;
      return {
        spellIds: Array.isArray(data.spellIds) ? data.spellIds : [],
        notes: data.notes ?? '',
      };
    },
    { characterId },
  );
};

export const deleteSpellbookDocument = async (characterId: number) => {
  const ownerId = await requireOwnerId();
  const documentPath = characterSpellbookDocPath(ownerId, characterId);

  await runFirestoreOperation(
    'delete',
    documentPath,
    'deleteDoc',
    'delete spellbook from Firestore',
    () => deleteDoc(getSpellbookDocRef(ownerId, characterId)),
    { characterId },
  );
};
