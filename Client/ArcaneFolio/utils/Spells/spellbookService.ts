import { apiFetch } from '../api';
import { addSpellToSelectedSpellbook } from '../character/characterState';
import { validateSpellAddition } from '../character/spellAccess';
import {
  addSpellToNpcSpellbook,
  getNpcSpellbook,
  removeSpellFromNpcSpellbook,
  type SpellbookTarget,
} from '../npc/npcSpellbookService';

export type AddSpellToSpellbookResult =
  | { success: true }
  | { success: false; error: string };

export const addSpellToCharacterSpellbook = async (
  spellId: number,
  characterClass: string,
  spellType: string,
): Promise<AddSpellToSpellbookResult> => {
  const validation = validateSpellAddition(characterClass, spellType);

  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  try {
    const response = await apiFetch<{ success: boolean; error?: string }>('/spellbook/add', {
      method: 'POST',
      body: JSON.stringify({ characterClass, spellId }),
    });

    if (!response.success) {
      return { success: false, error: response.error ?? 'Unable to add spell.' };
    }
  } catch (error) {
    let message = 'Unable to add spell.';

    if (error instanceof Error && error.message) {
      try {
        const parsed = JSON.parse(error.message) as { error?: string };
        message = parsed.error ?? error.message;
      } catch {
        message = error.message;
      }
    }

    return { success: false, error: message };
  }

  const wasAdded = addSpellToSelectedSpellbook(spellId);

  if (!wasAdded) {
    return { success: false, error: 'Select a character before adding spells.' };
  }

  return { success: true };
};

export const loadTargetSpellbook = async (
  target: SpellbookTarget,
  ownerId?: string,
) => {
  if (target.targetType === 'npc') {
    if (!ownerId) {
      throw new Error('NPC owner is required to load an NPC spellbook.');
    }

    return getNpcSpellbook(ownerId, target.targetId);
  }

  throw new Error('Character target spellbook loading is still handled by selected character state.');
};

export const addSpellToTargetSpellbook = async (
  target: SpellbookTarget,
  spellId: number,
  ownerId?: string,
) => {
  if (target.targetType === 'npc') {
    if (!ownerId) {
      throw new Error('NPC owner is required to update an NPC spellbook.');
    }

    return addSpellToNpcSpellbook(ownerId, target.targetId, spellId);
  }

  return addSpellToSelectedSpellbook(spellId);
};

export const removeSpellFromTargetSpellbook = async (
  target: SpellbookTarget,
  spellId: number,
  ownerId?: string,
) => {
  if (target.targetType === 'npc') {
    if (!ownerId) {
      throw new Error('NPC owner is required to update an NPC spellbook.');
    }

    return removeSpellFromNpcSpellbook(ownerId, target.targetId, spellId);
  }

  throw new Error('Character spell removal is still handled by selected character state.');
};
