import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { CharacterSheetState } from '../character/characterSheetState';
import { getFirebaseFirestore } from '../auth/authService';
import {
  FIRESTORE_TIMEOUT_MS,
  requireOwnerId,
  runFirestoreOperation,
  sanitizeForFirestore,
  withFirestoreTimeout,
} from './firestoreClient';
import { characterSheetDocPath } from './firestorePaths';

const getSheetDocRef = (ownerId: string, characterId: number) => (
  doc(getFirebaseFirestore(), 'users', ownerId, 'characters', String(characterId), 'sheet', 'main')
);

export const saveSheetDocument = async (characterId: number, sheet: CharacterSheetState) => {
  const ownerId = await requireOwnerId();
  const documentPath = characterSheetDocPath(ownerId, characterId);
  const payload = sanitizeForFirestore({
    ...sheet,
    updatedAt: Date.now(),
  });

  await runFirestoreOperation(
    'write',
    documentPath,
    'setDoc',
    'save character sheet to Firestore',
    () => withFirestoreTimeout(
      setDoc(getSheetDocRef(ownerId, characterId), payload),
      FIRESTORE_TIMEOUT_MS,
      'Saving character sheet took too long. Check connection or Firestore rules.',
    ),
    { characterId },
  );
};

export const loadSheetDocument = async (characterId: number) => {
  const ownerId = await requireOwnerId();
  const documentPath = characterSheetDocPath(ownerId, characterId);

  return runFirestoreOperation(
    'read',
    documentPath,
    'getDoc',
    'load character sheet from Firestore',
    async () => {
      const snapshot = await withFirestoreTimeout(
        getDoc(getSheetDocRef(ownerId, characterId)),
        FIRESTORE_TIMEOUT_MS,
        'Loading character sheet took too long. Check connection or Firestore rules.',
      );

      if (!snapshot.exists()) {
        return null;
      }

      const data = snapshot.data() as CharacterSheetState & { updatedAt?: number };
      const { updatedAt: _updatedAt, ...sheet } = data;
      return sheet;
    },
    { characterId },
  );
};

export const deleteSheetDocument = async (characterId: number) => {
  const ownerId = await requireOwnerId();
  const documentPath = characterSheetDocPath(ownerId, characterId);

  await runFirestoreOperation(
    'delete',
    documentPath,
    'deleteDoc',
    'delete character sheet from Firestore',
    () => deleteDoc(getSheetDocRef(ownerId, characterId)),
    { characterId },
  );
};
