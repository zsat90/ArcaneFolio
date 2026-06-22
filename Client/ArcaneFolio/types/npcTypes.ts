export type NpcAbilityKey =
  | 'strength'
  | 'dexterity'
  | 'constitution'
  | 'intelligence'
  | 'wisdom'
  | 'charisma'
  | 'comeliness'
  | 'piety';

export type NpcThac0ChartEntry = {
  armorClass: number;
  target: string;
};

export type Npc = {
  id: string;
  ownerId: string;
  name: string;
  race: string;
  class: string;
  level: number;
  alignment: string;
  appearanceDescription: string;
  personalityTraits: string;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  comeliness: number;
  piety: number;
  hitPoints: number;
  magicPoints: number;
  maxMagicPoints: number;
  armorClass: number;
  baseThac0: number;
  realThac0: number;
  weapon: string;
  weaponDamage: string;
  weaponMagicBonus: number;
  weaponSpeedFactor: number;
  weaponWac: number;
  proficiencySlots: number;
  weaponThac0Chart: NpcThac0ChartEntry[];
  armor: string;
  armorMagicBonus: number;
  equipmentNotes: string;
  createdAt: number;
  updatedAt: number;
};

export type NpcInput = Omit<Npc, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'> & {
  id?: string;
  ownerId?: string;
  createdAt?: number;
  updatedAt?: number;
};

export type NpcSpellbook = {
  npcId: string;
  ownerId: string;
  spellIds: number[];
  memorizedSpellIds: number[];
  notes: string;
  updatedAt: number;
};
