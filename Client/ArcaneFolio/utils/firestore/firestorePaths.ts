export const characterDocPath = (uid: string, characterId: number) => (
  `users/${uid}/characters/${characterId}`
);

export const characterSheetDocPath = (uid: string, characterId: number) => (
  `${characterDocPath(uid, characterId)}/sheet/main`
);

export const characterSpellbookDocPath = (uid: string, characterId: number) => (
  `${characterDocPath(uid, characterId)}/spellbook/main`
);

export const characterStateDocPath = (uid: string, characterId: number) => (
  `${characterDocPath(uid, characterId)}/state/main`
);

/** @deprecated Legacy top-level collection used before Phase 3 */
export const legacyCharacterDocPath = (uid: string, characterId: number) => (
  `characters/${uid}_${characterId}`
);
