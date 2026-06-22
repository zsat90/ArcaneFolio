export type AllowedSpellType = 'priest' | 'wizard';

export const PRIEST_SPELL_CLASSES = ['Priest', 'Paladin', 'Ranger', 'Druid'] as const;
export const WIZARD_SPELL_CLASSES = ['Wizard', 'Runeist'] as const;

export const SPELLBOOK_UNAVAILABLE_MESSAGE = 'This class cannot use a spellbook.';
export const SPELL_ADD_UNAVAILABLE_MESSAGE = 'This class cannot add spells.';
export const SPELL_LEARN_DENIED_MESSAGE = 'This character class cannot learn this spell.';

export const getAllowedSpellType = (characterClass: string, level?: number): AllowedSpellType | null => {
  const trimmedClass = characterClass.trim();
  const classLevel = Number.isFinite(level) ? Number(level) : null;

  if (trimmedClass === 'Ranger' && classLevel !== null && classLevel < 8) {
    return null;
  }

  if (trimmedClass === 'Paladin' && classLevel !== null && classLevel < 9) {
    return null;
  }

  if ((PRIEST_SPELL_CLASSES as readonly string[]).includes(trimmedClass)) {
    return 'priest';
  }

  if ((WIZARD_SPELL_CLASSES as readonly string[]).includes(trimmedClass)) {
    return 'wizard';
  }

  return null;
};

export const canUseSpellbook = (characterClass: string, level?: number) => getAllowedSpellType(characterClass, level) !== null;

export const canAddSpells = (characterClass: string, level?: number) => getAllowedSpellType(characterClass, level) !== null;

export const normalizeSpellType = (spellType: string): AllowedSpellType | null => {
  const normalized = spellType.trim().toLowerCase();

  if (normalized === 'priest') {
    return 'priest';
  }

  if (normalized === 'wizard') {
    return 'wizard';
  }

  return null;
};

export const formatAllowedSpellTypeLabel = (spellType: AllowedSpellType) => (
  spellType === 'priest' ? 'Priest' : 'Wizard'
);

export const canCharacterLearnSpellType = (characterClass: string, spellType: string) => {
  const allowedSpellType = getAllowedSpellType(characterClass);
  const normalizedSpellType = normalizeSpellType(spellType);

  return allowedSpellType !== null && allowedSpellType === normalizedSpellType;
};

export const validateSpellAddition = (
  characterClass: string,
  spellType: string,
): { ok: true } | { ok: false; error: string } => {
  if (!canAddSpells(characterClass)) {
    return { ok: false, error: SPELL_ADD_UNAVAILABLE_MESSAGE };
  }

  if (!canCharacterLearnSpellType(characterClass, spellType)) {
    return { ok: false, error: SPELL_LEARN_DENIED_MESSAGE };
  }

  return { ok: true };
};
