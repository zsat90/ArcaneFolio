import { apiFetch } from '../api';
import { addSpellToSelectedSpellbook } from '../character/characterState';
import { validateSpellAddition } from '../character/spellAccess';

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
