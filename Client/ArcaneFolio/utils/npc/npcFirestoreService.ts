import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { Npc, NpcInput } from '../../types/npcTypes';
import { getFirebaseFirestore } from '../auth/authService';
import {
  FIRESTORE_TIMEOUT_MS,
  requireOwnerId,
  runFirestoreOperation,
  sanitizeForFirestore,
  withFirestoreTimeout,
} from '../firestore/firestoreClient';
import { npcDocPath } from '../firestore/firestorePaths';
import { recalculateNpcCombat } from './npcGeneratorService';

const getNpcCollectionRef = (ownerId: string) => (
  collection(getFirebaseFirestore(), 'users', ownerId, 'npcs')
);

const getNpcDocRef = (ownerId: string, npcId: string) => (
  doc(getFirebaseFirestore(), 'users', ownerId, 'npcs', npcId)
);

export const toNpcRecord = (
  input: NpcInput,
  ownerId: string,
  existingCreatedAt?: number,
): Npc => {
  const now = Date.now();
  const id = input.id || doc(getNpcCollectionRef(ownerId)).id;
  const recalculated = recalculateNpcCombat(input);

  return sanitizeForFirestore({
    ...recalculated,
    id,
    ownerId,
    createdAt: existingCreatedAt ?? input.createdAt ?? now,
    updatedAt: now,
  } as unknown as Record<string, unknown>) as unknown as Npc;
};

export const createNpcDocument = async (input: NpcInput) => {
  const ownerId = await requireOwnerId();
  const npc = toNpcRecord(input, ownerId);
  const documentPath = npcDocPath(ownerId, npc.id);

  await runFirestoreOperation(
    'write',
    documentPath,
    'setDoc',
    'create NPC in Firestore',
    () => withFirestoreTimeout(
      setDoc(getNpcDocRef(ownerId, npc.id), npc),
      FIRESTORE_TIMEOUT_MS,
      'Saving NPC took too long. Check connection, Firebase config, or Firestore rules.',
    ),
    { npcId: npc.id, name: npc.name },
  );

  return npc;
};

export const updateNpcDocument = async (input: NpcInput) => {
  const ownerId = await requireOwnerId();
  const npc = toNpcRecord(input, ownerId, input.createdAt);
  const documentPath = npcDocPath(ownerId, npc.id);

  await runFirestoreOperation(
    'write',
    documentPath,
    'setDoc',
    'update NPC in Firestore',
    () => withFirestoreTimeout(
      setDoc(getNpcDocRef(ownerId, npc.id), npc),
      FIRESTORE_TIMEOUT_MS,
      'Updating NPC took too long. Check connection, Firebase config, or Firestore rules.',
    ),
    { npcId: npc.id, name: npc.name },
  );

  return npc;
};

export const loadNpcDocuments = async () => {
  const ownerId = await requireOwnerId();
  const collectionPath = `users/${ownerId}/npcs`;

  return runFirestoreOperation(
    'read',
    collectionPath,
    'getDocs',
    'load NPCs from Firestore',
    async () => {
      const snapshot = await withFirestoreTimeout(
        getDocs(getNpcCollectionRef(ownerId)),
        FIRESTORE_TIMEOUT_MS,
        'Loading NPCs took too long. Check connection, Firebase config, or Firestore rules.',
      );

      return snapshot.docs
        .map((docSnapshot) => recalculateNpcCombat(docSnapshot.data() as NpcInput) as Npc)
        .filter((npc) => npc.ownerId === ownerId)
        .sort((left, right) => left.name.localeCompare(right.name));
    },
  );
};

export const deleteNpcDocument = async (npcId: string) => {
  const ownerId = await requireOwnerId();
  const documentPath = npcDocPath(ownerId, npcId);

  await runFirestoreOperation(
    'delete',
    documentPath,
    'deleteDoc',
    'delete NPC from Firestore',
    () => deleteDoc(getNpcDocRef(ownerId, npcId)),
    { npcId },
  );
};
