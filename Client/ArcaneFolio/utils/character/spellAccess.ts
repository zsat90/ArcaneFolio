export type AllowedSpellType = 'priest' | 'wizard';

export const PRIEST_SPELL_CLASSES = ['Priest', 'Paladin', 'Ranger', 'Druid'] as const;
export const WIZARD_SPELL_CLASSES = ['Wizard', 'Runeist', 'Bard', 'Druid', 'Ranger'] as const;

export const SPELLBOOK_UNAVAILABLE_MESSAGE = 'This class cannot use a spellbook.';
export const SPELL_ADD_UNAVAILABLE_MESSAGE = 'This class cannot add spells.';
export const SPELL_LEARN_DENIED_MESSAGE = 'This character class cannot learn this spell.';

export const getAllowedSpellTypes = (characterClass: string, level?: number): AllowedSpellType[] => {
  const trimmedClass = characterClass.trim();
  const classLevel = Number.isFinite(level) ? Number(level) : null;
  const allowedSpellTypes: AllowedSpellType[] = [];

  if ((PRIEST_SPELL_CLASSES as readonly string[]).includes(trimmedClass)) {
    if (trimmedClass !== 'Ranger' || classLevel === null || classLevel >= 8) {
      if (trimmedClass !== 'Paladin' || classLevel === null || classLevel >= 9) {
        allowedSpellTypes.push('priest');
      }
    }
  }

  if ((WIZARD_SPELL_CLASSES as readonly string[]).includes(trimmedClass)) {
    allowedSpellTypes.push('wizard');
  }

  return allowedSpellTypes;
};

export const getAllowedSpellType = (characterClass: string, level?: number): AllowedSpellType | null => (
  getAllowedSpellTypes(characterClass, level)[0] ?? null
);

export const canUseSpellbook = (characterClass: string, level?: number) => getAllowedSpellTypes(characterClass, level).length > 0;

export const canAddSpells = (characterClass: string, level?: number) => getAllowedSpellTypes(characterClass, level).length > 0;

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
  const normalizedSpellType = normalizeSpellType(spellType);

  return normalizedSpellType !== null && getAllowedSpellTypes(characterClass).includes(normalizedSpellType);
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
