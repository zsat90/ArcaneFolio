export type FirestoreCharacterRecord = {
  id: number;
  ownerId: string;
  name: string;
  class: string;
  characterClass: string;
  race: string;
  level: number;
  currentXp: number;
  nextXpTarget: number;
  hitPoints: number;
  maxHitPoints: number;
  magicPoints: number;
  maxMagicPoints: number;
  createdAt: number;
  updatedAt: number;
};

export type FirestoreSpellbookRecord = {
  spellIds: number[];
  notes: string;
  updatedAt: number;
};

export type FirestoreRuntimeStateRecord = {
  currentHp: number;
  maxHp: number;
  currentMp: number;
  maxMp: number;
  temporaryEffects: string;
  updatedAt: number;
};
