import { doc, getDoc, setDoc } from 'firebase/firestore';
import { NpcSpellbook } from '../../types/npcTypes';
import { getFirebaseFirestore } from '../auth/authService';
import {
  FIRESTORE_TIMEOUT_MS,
  runFirestoreOperation,
  sanitizeForFirestore,
  withFirestoreTimeout,
} from '../firestore/firestoreClient';
import { npcSpellbookDocPath } from '../firestore/firestorePaths';

export type SpellbookTarget =
  | { targetType: 'character'; targetId: number }
  | { targetType: 'npc'; targetId: string };

const getNpcSpellbookDocRef = (uid: string, npcId: string) => (
  doc(getFirebaseFirestore(), 'users', uid, 'npcs', npcId, 'spellbook', 'main')
);

const createEmptyNpcSpellbook = (uid: string, npcId: string): NpcSpellbook => ({
  npcId,
  ownerId: uid,
  spellIds: [],
  memorizedSpellIds: [],
  notes: '',
  updatedAt: Date.now(),
});

export const getNpcSpellbook = async (uid: string, npcId: string) => {
  const documentPath = npcSpellbookDocPath(uid, npcId);

  return runFirestoreOperation(
    'read',
    documentPath,
    'getDoc',
    'load NPC spellbook from Firestore',
    async () => {
      const snapshot = await withFirestoreTimeout(
        getDoc(getNpcSpellbookDocRef(uid, npcId)),
        FIRESTORE_TIMEOUT_MS,
        'Loading NPC spellbook took too long. Check connection or Firestore rules.',
      );

      if (!snapshot.exists()) {
        return createEmptyNpcSpellbook(uid, npcId);
      }

      const data = snapshot.data() as Partial<NpcSpellbook>;

      return {
        npcId,
        ownerId: uid,
        spellIds: Array.isArray(data.spellIds) ? data.spellIds : [],
        memorizedSpellIds: Array.isArray(data.memorizedSpellIds) ? data.memorizedSpellIds : [],
        notes: data.notes ?? '',
        updatedAt: Number(data.updatedAt) || Date.now(),
      } satisfies NpcSpellbook;
    },
    { npcId },
  );
};

export const saveNpcSpellbook = async (
  uid: string,
  npcId: string,
  spellbookData: Partial<NpcSpellbook>,
) => {
  const documentPath = npcSpellbookDocPath(uid, npcId);
  const payload = sanitizeForFirestore({
    npcId,
    ownerId: uid,
    spellIds: spellbookData.spellIds ?? [],
    memorizedSpellIds: spellbookData.memorizedSpellIds ?? [],
    notes: spellbookData.notes ?? '',
    updatedAt: Date.now(),
  } satisfies NpcSpellbook) as unknown as NpcSpellbook;

  await runFirestoreOperation(
    'write',
    documentPath,
    'setDoc',
    'save NPC spellbook to Firestore',
    () => withFirestoreTimeout(
      setDoc(getNpcSpellbookDocRef(uid, npcId), payload),
      FIRESTORE_TIMEOUT_MS,
      'Saving NPC spellbook took too long. Check connection or Firestore rules.',
    ),
    { npcId, spellCount: payload.spellIds.length },
  );

  return payload;
};

export const addSpellToNpcSpellbook = async (uid: string, npcId: string, spellId: number) => {
  const current = await getNpcSpellbook(uid, npcId);
  const spellIds = Array.from(new Set([...current.spellIds, spellId]));

  return saveNpcSpellbook(uid, npcId, {
    ...current,
    spellIds,
  });
};

export const removeSpellFromNpcSpellbook = async (uid: string, npcId: string, spellId: number) => {
  const current = await getNpcSpellbook(uid, npcId);

  return saveNpcSpellbook(uid, npcId, {
    ...current,
    spellIds: current.spellIds.filter((id) => id !== spellId),
    memorizedSpellIds: current.memorizedSpellIds.filter((id) => id !== spellId),
  });
};
