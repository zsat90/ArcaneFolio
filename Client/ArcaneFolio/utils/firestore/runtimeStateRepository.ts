import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { FirestoreRuntimeStateRecord } from '../../types/firestoreCharacterTypes';
import { getFirebaseFirestore } from '../auth/authService';
import {
  FIRESTORE_TIMEOUT_MS,
  requireOwnerId,
  runFirestoreOperation,
  sanitizeForFirestore,
  withFirestoreTimeout,
} from './firestoreClient';
import { characterStateDocPath } from './firestorePaths';

const getRuntimeStateDocRef = (ownerId: string, characterId: number) => (
  doc(getFirebaseFirestore(), 'users', ownerId, 'characters', String(characterId), 'state', 'main')
);

export const toRuntimeStateRecord = (values: {
  currentHp: number;
  maxHp: number;
  currentMp: number;
  maxMp: number;
  temporaryEffects?: string;
}): FirestoreRuntimeStateRecord => ({
  currentHp: values.currentHp,
  maxHp: values.maxHp,
  currentMp: values.currentMp,
  maxMp: values.maxMp,
  temporaryEffects: values.temporaryEffects ?? '',
  updatedAt: Date.now(),
});

export const saveRuntimeStateDocument = async (
  characterId: number,
  state: {
    currentHp: number;
    maxHp: number;
    currentMp: number;
    maxMp: number;
    temporaryEffects?: string;
  },
) => {
  const ownerId = await requireOwnerId();
  const documentPath = characterStateDocPath(ownerId, characterId);
  const payload = sanitizeForFirestore(toRuntimeStateRecord(state));

  await runFirestoreOperation(
    'write',
    documentPath,
    'setDoc',
    'save runtime state to Firestore',
    () => withFirestoreTimeout(
      setDoc(getRuntimeStateDocRef(ownerId, characterId), payload),
      FIRESTORE_TIMEOUT_MS,
      'Saving runtime state took too long. Check connection or Firestore rules.',
    ),
    { characterId },
  );
};

export const loadRuntimeStateDocument = async (characterId: number) => {
  const ownerId = await requireOwnerId();
  const documentPath = characterStateDocPath(ownerId, characterId);

  return runFirestoreOperation(
    'read',
    documentPath,
    'getDoc',
    'load runtime state from Firestore',
    async () => {
      const snapshot = await withFirestoreTimeout(
        getDoc(getRuntimeStateDocRef(ownerId, characterId)),
        FIRESTORE_TIMEOUT_MS,
        'Loading runtime state took too long. Check connection or Firestore rules.',
      );

      if (!snapshot.exists()) {
        return null;
      }

      return snapshot.data() as FirestoreRuntimeStateRecord;
    },
    { characterId },
  );
};

export const deleteRuntimeStateDocument = async (characterId: number) => {
  const ownerId = await requireOwnerId();
  const documentPath = characterStateDocPath(ownerId, characterId);

  await runFirestoreOperation(
    'delete',
    documentPath,
    'deleteDoc',
    'delete runtime state from Firestore',
    () => deleteDoc(getRuntimeStateDocRef(ownerId, characterId)),
    { characterId },
  );
};
