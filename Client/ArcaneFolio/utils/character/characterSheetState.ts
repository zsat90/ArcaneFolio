import { createEmptyPartyTreasureCoins } from './partyTreasure';
import { getDexterityModifierSummary } from './abilityScores';

import { getScopedStorageKey } from '../auth/accountScope';
import { getCachedSheet, persistSheet, setCachedSheet } from '../firestore/characterDataCache';

export type WeaponRow = {
  id: string;
  weapon: string;
  soulSwordColor: string;
  soulSwordIgnited: boolean;
  wac: string;
  thacoWeaponBonus: string;
  thacoStrengthBonus: string;
  thacoSpecialization: string;
  thacoReal: string;
  speedBase: string;
  speedReactionAdj: string;
  speedWeaponBonus: string;
  speedReal: string;
  damageSmallMedium: string;
  damageLarge: string;
  damageWeaponBonus: string;
  damageStrengthBonus: string;
  damageSpecialization: string;
  damageReal: string;
};

export type ProficiencyRow = {
  id: string;
  name: string;
  slots: string;
};

export type NonWeaponProficiencyRow = {
  id: string;
  name: string;
  slots: string;
  attribute: string;
  attributeMod: string;
};

export type ThievingSkillRow = {
  id: string;
  skill: string;
  base: string;
  halfElf: string;
  elf: string;
  dwarf: string;
  gnome: string;
  halfling: string;
  dex: string;
  thief: string;
  armor: string;
  realPercent: string;
};

export type SavingThrowRow = {
  id: string;
  name: string;
  base: string;
  real: string;
  d4: string;
  check1: boolean;
  check2: boolean;
  check3: boolean;
  check4: boolean;
};

export type XPAwardRow = {
  id: string;
  xp: string;
};

export type CharacterSheetState = {
  playerName: string;
  characterAlias: string;
  race: string;
  alignment: string;
  deity: string;
  homeland: string;
  levelTitle: string;
  socialClass: string;
  sex: string;
  age: string;
  height: string;
  weight: string;
  eyes: string;
  hair: string;
  experience: string;
  racialBonuses: string;
  specialAbilities: string;
  abilities: Record<string, string>;
  combat: Record<string, string>;
  saves: Record<string, string>;
  armor: string;
  weapons: string;
  money: string;
  encumbrance: string;
  appearance: string;
  personality: string;
  classFeatures: string;
  companions: string;
  proficiencies: string;
  languages: string;
  equipment: string;
  treasure: string;
  notes: string;
  abilityDetails: Record<string, string>;
  combatDetails: Record<string, string>;
  experienceDetails: Record<string, string>;
  hitPointDetails: Record<string, string>;
  armorDetails: Record<string, string>;
  weaponRows: WeaponRow[];
  weaponProficiencies: ProficiencyRow[];
  nonWeaponProficiencies: NonWeaponProficiencyRow[];
  proficiencyDetails: Record<string, string>;
  trackingModifiers: Record<string, string>;
  turningUndead: Record<string, string>;
  thievingSkills: ThievingSkillRow[];
  savingThrowRows: SavingThrowRow[];
  savingThrowDetails: Record<string, string>;
  equipmentDetails: Record<string, string>;
  xpAwardRows: XPAwardRow[];
  xpValuablesArrows: string;
  xpValuablesNotes: string;
  partyTreasureCoins: Record<string, string>;
  partyTreasureNotes: string;
};

export const SHEET_STORAGE_KEY = 'arcane:character-sheets';
export const ABILITY_FIELDS = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];
export const COMBAT_FIELDS = ['Armor Class', 'Hit Points', 'THAC0', 'Movement', 'Initiative', 'Damage Bonus'];
export const SAVE_FIELDS = [
  'Paralyzation/Poison/Death Magic',
  'Rod/Staff/Wand',
  'Petrification/Polymorph',
  'Breath Weapon',
  'Spell',
];
export const ABILITY_DETAIL_FIELDS = [
  'Strength',
  'Strength Hit',
  'Strength Dmg',
  'Strength Wgt',
  'Strength Press',
  'Strength Doors',
  'Strength Bars/Gates',
  'Dexterity',
  'Dexterity Reac Adj',
  'Dexterity Msl Att Adj',
  'Dexterity Def Adj (AC)',
  'Dexterity Parry',
  'Constitution',
  'Constitution HP Adj',
  'Constitution Sys Shk',
  'Constitution Res Sur',
  'Constitution Poison Save',
  'Constitution Regen',
  'Intelligence',
  'Intelligence # of Lang',
  'Intelligence Sp Lvl',
  'Intelligence Learn Spl',
  'Intelligence Sp/Lvl',
  'Intelligence Immunity',
  'Wisdom',
  'Wisdom Magic Defense',
  'Wisdom Bonus Spells',
  'Wisdom % Fail',
  'Wisdom Immunity',
  'Charisma',
  'Charisma Max # Henchman',
  'Charisma Loyalty Base',
  'Charisma Reaction Adj',
  'Comeliness',
  'Piety',
];
export const COMBAT_DETAIL_FIELDS = ['Base class Att/Rnd', 'SP', 'Base THACO', 'MP', 'LP', 'Shirt LP'];
export const DEFAULT_BASE_THACO = '20';
export const EXPERIENCE_DETAIL_FIELDS = ['Current', 'Bonus', 'Next XP Target', 'To Reach Level'];
export const HIT_POINT_DETAIL_FIELDS = ['Per Level', 'HP Roll', 'Adjustment', 'Total HP'];
export const ARMOR_DETAIL_FIELDS = ['Base', 'Armor Type', 'Helm', 'Shield', 'Magical', 'Real'];
export const PROFICIENCY_DETAIL_FIELDS = [
  'Weapon Initial Slots',
  'Weapon Additional Every',
  'Non-Weapon Initial Slots',
  'Non-Weapon Additional Every',
  'Secondary Skill',
  'Tracking Wisdom',
  'Thieving Skill Points',
];
export const TRACKING_MODIFIER_FIELDS = [
  'Soft or muddy ground',
  'Thick brush, vines, or reeds',
  'Occasional signs, dust',
  'Normal ground, wood floor',
  'Rocky ground, shallow water',
  'Every 2 creatures in the group',
  'Every 12 hrs since trail was made',
  'Every hour of rain, snow, or sleet',
  'Poor light (moon, starlight)',
  'Tracked party attempts to hide trail',
];
export const TURNING_UNDEAD_FIELDS = [
  'Skeleton',
  'Zombie',
  'Ghoul',
  'Shadow',
  'Wight',
  'Ghast',
  'Wraith',
  'Mummy',
  'Spectre',
  'Vampire',
  'Ghost',
  'Litch',
  'Special',
];
export const SAVING_THROW_DETAIL_FIELDS = ['Automatic Immunities', 'Immunities'];
const STARTING_EQUIPMENT_DEFAULTS = [
  '2 Pair Linen Undergarments',
  '10ft of Cord',
  '2 Pair Linen Stockings',
  '2 Linen Shirts',
  '1 Leather Belt',
  '1 Pair Soft High Boots',
  '1 Woolen Cloak',
  '1 Pair Woolen Gloves',
  '1 Bedroll',
  '1 Pewter Plate, Bowl, Cup',
  '1 Small Iron Cooking Pot',
  '1 Hairbrush',
  '1 Fire-Starting Bow',
  '50ft Fishing Line',
  'Flint and Steel',
  '3 Bone Sewing Needles',
  '2 Small Leather Pouches',
  '1 Pair of Scissors',
  '2lbs of Soap',
  '7 Days of Trail Rations',
  '1 Pair Woolen Stockings',
  '5 Fishing Hooks',
  '1 Pair Doeskin Breeches',
  '1 Hooded Lantern',
  '1 Pair Linen Breeches',
  '1 Pint Lantern Oil',
  '1 Good Cloth Cloak',
  '1 50ft Spool of Thread',
  '1 Pair Leather Gloves',
  '50ft Hemp Rope',
  '1 Linen Nightshirt',
  '1 3 Pint Waterskin',
  '1 Woolen Blanket',
  '1 Whetstone',
  '1 Set of Cutlery',
  '2 Sticks of Chalk',
  '1 Waterproof Backpack',
];
export const EQUIPMENT_DETAIL_FIELDS = [
  'PP',
  'GP',
  'EP',
  'SP',
  'CP',
  'Gems',
  'Misc',
  'Armor',
  'Weapons',
  'Other',
  'Magical',
  ...STARTING_EQUIPMENT_DEFAULTS.map((_, index) => `Starting Equipment ${index + 1}`),
];

const SAVING_THROW_DEFAULTS: Array<[string, string]> = [
  ['Poison Type A-F', '18'],
  ['Poison Type G-J', '18'],
  ['Poison Type K-N', '18'],
  ['Poison Type O-P', '18'],
  ['Disease', '16'],
  ['Sickness', '14'],
  ['Insanity', '12'],
  ['Psionics', '17'],
  ['Polymorph', '15'],
  ['Death Magic', '15'],
  ['Paralyzation', '15'],
  ['Mind Spells', '15'],
  ['Sleep', '16'],
  ['Charm', '17'],
  ['Major Illusion', '17'],
  ['Minor Illusion', '15'],
  ['Fear', '17'],
  ['Know Alignment', '17'],
  ['Hold Person', '17'],
  ['Web', '17'],
  ['Attack Spells', '17'],
  ['Other Spells', '16'],
  ['Rods', '16'],
  ['Staves', '16'],
  ['Wands', '16'],
  ['Breath Other', '16'],
  ['Breath Draco', '18'],
  ['Dragon Fear', '17'],
  ['Gaze Attacks', '16'],
];

const createEmptyWeaponRow = (id: string): WeaponRow => ({
  id,
  weapon: '',
  soulSwordColor: '',
  soulSwordIgnited: false,
  wac: '',
  thacoWeaponBonus: '',
  thacoStrengthBonus: '',
  thacoSpecialization: '',
  thacoReal: '',
  speedBase: '',
  speedReactionAdj: '',
  speedWeaponBonus: '',
  speedReal: '',
  damageSmallMedium: '',
  damageLarge: '',
  damageWeaponBonus: '',
  damageStrengthBonus: '',
  damageSpecialization: '',
  damageReal: '',
});

export const createEmptyWeaponRows = () => [
  createEmptyWeaponRow('weapon-1'),
];

const createEmptyProficiencyRow = (id: string): ProficiencyRow => ({
  id,
  name: '',
  slots: '',
});

const createEmptyNonWeaponProficiencyRow = (id: string): NonWeaponProficiencyRow => ({
  id,
  name: '',
  slots: '',
  attribute: '',
  attributeMod: '',
});

const createThievingSkillRow = (id: string, skill: string, base: string, values: Partial<ThievingSkillRow> = {}): ThievingSkillRow => ({
  id,
  skill,
  base,
  halfElf: values.halfElf ?? '',
  elf: values.elf ?? '',
  dwarf: values.dwarf ?? '',
  gnome: values.gnome ?? '',
  halfling: values.halfling ?? '',
  dex: values.dex ?? '',
  thief: values.thief ?? '',
  armor: values.armor ?? '',
  realPercent: values.realPercent ?? '',
});

export const createEmptyWeaponProficiencies = () => (
  Array.from({ length: 6 }, (_, index) => createEmptyProficiencyRow(`weapon-proficiency-${index + 1}`))
);

export const createEmptyNonWeaponProficiencies = () => (
  Array.from({ length: 16 }, (_, index) => createEmptyNonWeaponProficiencyRow(`non-weapon-proficiency-${index + 1}`))
);

export const createEmptyThievingSkills = () => [
  createThievingSkillRow('thief-open-locks', 'Open Locks', '10%', { halfElf: '-5%', dwarf: '+10%', gnome: '+5%', halfling: '+5%' }),
  createThievingSkillRow('thief-find-traps', 'Find Traps', '5%', { elf: '+10%', dwarf: '+15%', gnome: '+10%', halfling: '+5%' }),
  createThievingSkillRow('thief-set-traps', 'Set Traps', '5%', { dwarf: '+5%', gnome: '+15%' }),
  createThievingSkillRow('thief-hide-shadows', 'Hide in Shadows', '5%', { halfElf: '+10%', elf: '+5%', halfling: '+15%' }),
  createThievingSkillRow('thief-climb-walls', 'Climb Walls', '60%', { halfElf: '-10%', elf: '-15%', halfling: '-15%' }),
  createThievingSkillRow('thief-pick-pockets', 'Pick Pockets', '15%', { halfElf: '+10%', elf: '+5%', gnome: '+5%' }),
  createThievingSkillRow('thief-set-locks', 'Set Locks', '10%', { halfElf: '-5%', dwarf: '+10%', gnome: '+5%', halfling: '+5%' }),
  createThievingSkillRow('thief-remove-traps', 'Remove Traps', '5%', { dwarf: '+15%', gnome: '+10%', halfling: '+5%' }),
  createThievingSkillRow('thief-move-silently', 'Move Silently', '10%', { halfElf: '+5%', elf: '+5%', gnome: '+10%', halfling: '+5%' }),
  createThievingSkillRow('thief-detect-noise', 'Detect Noise', '15%', { halfElf: '+5%', elf: '+10%', halfling: '+5%' }),
  createThievingSkillRow('thief-read-languages', 'Read Languages', '0%', { halfElf: '-5%' }),
];

const createSavingThrowRow = (id: string, name: string, base: string): SavingThrowRow => ({
  id,
  name,
  base,
  real: '',
  d4: '',
  check1: false,
  check2: false,
  check3: false,
  check4: false,
});

export const createEmptySavingThrowRows = () => (
  SAVING_THROW_DEFAULTS.map(([name, base], index) => (
    createSavingThrowRow(`saving-throw-${index + 1}`, name, base)
  ))
);

const createXPAwardRow = (id: string): XPAwardRow => ({
  id,
  xp: '',
});

export const createEmptyXPAwardRows = () => (
  Array.from({ length: 60 }, (_, index) => createXPAwardRow(`xp-award-${index + 1}`))
);

export const makeRecord = (fields: string[]) => {
  return fields.reduce<Record<string, string>>((values, field) => {
    values[field] = '';
    return values;
  }, {});
};

export const createEmptySheet = (): CharacterSheetState => ({
  playerName: '',
  characterAlias: '',
  race: '',
  alignment: '',
  deity: '',
  homeland: '',
  levelTitle: '',
  socialClass: '',
  sex: '',
  age: '',
  height: '',
  weight: '',
  eyes: '',
  hair: '',
  experience: '',
  racialBonuses: '',
  specialAbilities: '',
  abilities: makeRecord(ABILITY_FIELDS),
  combat: makeRecord(COMBAT_FIELDS),
  saves: makeRecord(SAVE_FIELDS),
  armor: '',
  weapons: '',
  money: '',
  encumbrance: '',
  appearance: '',
  personality: '',
  classFeatures: '',
  companions: '',
  proficiencies: '',
  languages: '',
  equipment: '',
  treasure: '',
  notes: '',
  abilityDetails: makeRecord(ABILITY_DETAIL_FIELDS),
  combatDetails: {
    ...makeRecord(COMBAT_DETAIL_FIELDS),
    'Base class Att/Rnd': '1/1',
    'Base THACO': DEFAULT_BASE_THACO,
  },
  experienceDetails: makeRecord(EXPERIENCE_DETAIL_FIELDS),
  hitPointDetails: makeRecord(HIT_POINT_DETAIL_FIELDS),
  armorDetails: makeRecord(ARMOR_DETAIL_FIELDS),
  weaponRows: createEmptyWeaponRows(),
  weaponProficiencies: createEmptyWeaponProficiencies(),
  nonWeaponProficiencies: createEmptyNonWeaponProficiencies(),
  proficiencyDetails: {
    ...makeRecord(PROFICIENCY_DETAIL_FIELDS),
  },
  trackingModifiers: {
    ...makeRecord(TRACKING_MODIFIER_FIELDS),
    'Soft or muddy ground': '+4',
    'Thick brush, vines, or reeds': '+3',
    'Occasional signs, dust': '+1',
    'Normal ground, wood floor': '0',
    'Rocky ground, shallow water': '-1',
    'Every 2 creatures in the group': '+1',
    'Every 12 hrs since trail was made': '-1',
    'Every hour of rain, snow, or sleet': '-5',
    'Poor light (moon, starlight)': '-6',
    'Tracked party attempts to hide trail': '-5',
  },
  turningUndead: makeRecord(TURNING_UNDEAD_FIELDS),
  thievingSkills: createEmptyThievingSkills(),
  savingThrowRows: createEmptySavingThrowRows(),
  savingThrowDetails: makeRecord(SAVING_THROW_DETAIL_FIELDS),
  equipmentDetails: {
    ...makeRecord(EQUIPMENT_DETAIL_FIELDS),
    ...STARTING_EQUIPMENT_DEFAULTS.reduce<Record<string, string>>((items, item, index) => {
      items[`Starting Equipment ${index + 1}`] = item;
      return items;
    }, {}),
  },
  xpAwardRows: createEmptyXPAwardRows(),
  xpValuablesArrows: '',
  xpValuablesNotes: '',
  partyTreasureCoins: createEmptyPartyTreasureCoins(),
  partyTreasureNotes: '',
});

export const normalizeSheet = (sheet?: Partial<CharacterSheetState>): CharacterSheetState => {
  const emptySheet = createEmptySheet();
  const oldSaves = sheet?.saves ?? {};
  const oldHitPointDetails = sheet?.hitPointDetails ?? {};
  const hitPointDetails = {
    ...emptySheet.hitPointDetails,
    ...oldHitPointDetails,
    'Total HP': oldHitPointDetails['Total HP']
      ?? oldHitPointDetails.Full
      ?? oldHitPointDetails.Current
      ?? '',
  };

  return {
    ...emptySheet,
    ...sheet,
    money: sheet?.money ?? sheet?.treasure ?? '',
    abilities: {
      ...emptySheet.abilities,
      ...(sheet?.abilities ?? {}),
    },
    combat: {
      ...emptySheet.combat,
      ...(sheet?.combat ?? {}),
    },
    saves: {
      ...emptySheet.saves,
      ...(sheet?.saves ?? {}),
      'Paralyzation/Poison/Death Magic': oldSaves['Paralyzation/Poison/Death Magic']
        ?? oldSaves.Paralyzation
        ?? oldSaves.Poison
        ?? oldSaves.Death
        ?? '',
      'Petrification/Polymorph': oldSaves['Petrification/Polymorph'] ?? oldSaves.Petrification ?? '',
    },
    abilityDetails: {
      ...emptySheet.abilityDetails,
      ...(sheet?.abilityDetails ?? {}),
    },
    combatDetails: {
      ...emptySheet.combatDetails,
      ...(sheet?.combatDetails ?? {}),
      'Base THACO': sheet?.combatDetails?.['Base THACO']?.trim() || DEFAULT_BASE_THACO,
    },
    experienceDetails: {
      ...emptySheet.experienceDetails,
      ...(sheet?.experienceDetails ?? {}),
    },
    hitPointDetails,
    armorDetails: {
      ...emptySheet.armorDetails,
      ...(sheet?.armorDetails ?? {}),
    },
    weaponRows: sheet?.weaponRows?.length
      ? sheet.weaponRows.map((row, index) => ({
        ...createEmptyWeaponRow(row.id ?? `weapon-${index + 1}`),
        ...row,
      }))
      : emptySheet.weaponRows,
    weaponProficiencies: sheet?.weaponProficiencies?.length
      ? sheet.weaponProficiencies.map((row, index) => ({
        ...createEmptyProficiencyRow(row.id ?? `weapon-proficiency-${index + 1}`),
        ...row,
      }))
      : emptySheet.weaponProficiencies,
    nonWeaponProficiencies: sheet?.nonWeaponProficiencies?.length
      ? sheet.nonWeaponProficiencies.map((row, index) => ({
        ...createEmptyNonWeaponProficiencyRow(row.id ?? `non-weapon-proficiency-${index + 1}`),
        ...row,
      }))
      : emptySheet.nonWeaponProficiencies,
    proficiencyDetails: {
      ...emptySheet.proficiencyDetails,
      ...(sheet?.proficiencyDetails ?? {}),
    },
    trackingModifiers: {
      ...emptySheet.trackingModifiers,
      ...(sheet?.trackingModifiers ?? {}),
    },
    turningUndead: {
      ...emptySheet.turningUndead,
      ...(sheet?.turningUndead ?? {}),
    },
    thievingSkills: sheet?.thievingSkills?.length
      ? sheet.thievingSkills.map((row, index) => ({
        ...createThievingSkillRow(row.id ?? `thief-skill-${index + 1}`, row.skill ?? '', row.base ?? ''),
        ...row,
      }))
      : emptySheet.thievingSkills,
    savingThrowRows: sheet?.savingThrowRows?.length
      ? sheet.savingThrowRows.map((row, index) => {
        const hasChecks = Boolean(row.check1 || row.check2 || row.check3 || row.check4);

        return {
          ...createSavingThrowRow(row.id ?? `saving-throw-${index + 1}`, row.name ?? '', row.base ?? ''),
          ...row,
          real: row.real === row.base ? '' : row.real ?? '',
          d4: row.d4 === '4' && !hasChecks ? '' : row.d4 ?? '',
          check1: Boolean(row.check1),
          check2: Boolean(row.check2),
          check3: Boolean(row.check3),
          check4: Boolean(row.check4),
        };
      })
      : emptySheet.savingThrowRows,
    savingThrowDetails: {
      ...emptySheet.savingThrowDetails,
      ...(sheet?.savingThrowDetails ?? {}),
    },
    equipmentDetails: {
      ...emptySheet.equipmentDetails,
      ...(sheet?.equipmentDetails ?? {}),
      PP: sheet?.equipmentDetails?.PP ?? '',
      GP: sheet?.equipmentDetails?.GP ?? sheet?.equipmentDetails?.Coins ?? sheet?.money ?? '',
      EP: sheet?.equipmentDetails?.EP ?? '',
      SP: sheet?.equipmentDetails?.SP ?? '',
      CP: sheet?.equipmentDetails?.CP ?? '',
      Armor: sheet?.equipmentDetails?.Armor ?? '',
      Weapons: sheet?.equipmentDetails?.Weapons ?? '',
      Other: sheet?.equipmentDetails?.Other ?? sheet?.equipmentDetails?.['Other Equipment'] ?? sheet?.equipment ?? '',
      Magical: sheet?.equipmentDetails?.Magical ?? sheet?.equipmentDetails?.['Magic Items'] ?? sheet?.treasure ?? '',
    },
    xpAwardRows: sheet?.xpAwardRows?.length
      ? sheet.xpAwardRows.map((row, index) => ({
        ...createXPAwardRow(row.id ?? `xp-award-${index + 1}`),
        ...row,
      }))
      : emptySheet.xpAwardRows,
    xpValuablesArrows: sheet?.xpValuablesArrows ?? '',
    xpValuablesNotes: sheet?.xpValuablesNotes ?? '',
    partyTreasureCoins: {
      ...emptySheet.partyTreasureCoins,
      ...(sheet?.partyTreasureCoins ?? {}),
    },
    partyTreasureNotes: sheet?.partyTreasureNotes ?? '',
  };
};

const canUseStorage = () => typeof window !== 'undefined';
const resolveSheetStorageKey = () => getScopedStorageKey(SHEET_STORAGE_KEY);

/** @deprecated Firestore is source of truth. Returns in-memory cache snapshot only. */
export const readCharacterSheets = () => {
  return {};
};

/** @deprecated Firestore is source of truth. */
export const writeCharacterSheets = (_sheets: Record<string, CharacterSheetState>) => {
  // no-op: sheets persist to Firestore via setCharacterSheet
};

export const getCharacterSheet = (characterId: number) => (
  normalizeSheet(getCachedSheet(characterId) ?? createEmptySheet())
);

export const setCharacterSheet = (characterId: number, sheet: CharacterSheetState) => {
  const normalized = normalizeSheet(sheet);
  setCachedSheet(characterId, normalized);

  void persistSheet(characterId, normalized).catch((error: unknown) => {
    console.error('[character-sheet] Failed to persist sheet to Firestore', error);
  });

  if (canUseStorage()) {
    window.dispatchEvent(new Event('arcane-character-change'));
  }
};

const signed = (value: number) => value > 0 ? `+${value}` : String(value);
const scoreNumber = (score: string) => Number(score);

export const getDexterityParry = (score: string) => {
  const value = scoreNumber(score);

  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  return Math.ceil(value / 2);
};

const strengthSummary = (score: number) => {
  if (score <= 3) return '-3 hit, -1 damage';
  if (score <= 5) return '-2 hit, -1 damage';
  if (score <= 7) return '-1 hit';
  if (score <= 16) return 'No combat adjustment';
  if (score === 17) return '+1 hit, +1 damage';
  if (score === 18) return '+1 hit, +2 damage';
  if (score === 19) return '+3 hit, +7 damage';
  if (score === 20) return '+3 hit, +8 damage';
  if (score === 21) return '+4 hit, +9 damage';
  if (score === 22) return '+4 hit, +10 damage';
  if (score === 23) return '+5 hit, +11 damage';
  if (score === 24) return '+6 hit, +12 damage';
  return '+7 hit, +14 damage';
};

const constitutionSummary = (score: number) => {
  if (score <= 3) return '-2 HP/level';
  if (score <= 6) return '-1 HP/level';
  if (score <= 14) return 'No HP adjustment';
  if (score === 15) return '+1 HP/level';
  if (score === 16) return '+2 HP/level';
  if (score === 17) return '+2 HP/level, +3 warrior';
  if (score === 18) return '+2 HP/level, +4 warrior';
  if (score === 19) return '+2 HP/level, +5 warrior';
  if (score === 20) return '+2 HP/level, +5 warrior';
  if (score === 21) return '+2 HP/level, +6 warrior';
  if (score === 22) return '+2 HP/level, +6 warrior';
  if (score === 23) return '+2 HP/level, +6 warrior';
  if (score === 24) return '+2 HP/level, +7 warrior';
  return '+2 HP/level, +7 warrior';
};

const intelligenceSummary = (score: number) => {
  if (score <= 8) return 'Cannot cast wizard spells';
  if (score === 9) return 'Max 4th-level spells';
  if (score <= 11) return 'Max 5th-level spells';
  if (score <= 13) return 'Max 6th-level spells';
  if (score <= 15) return 'Max 7th-level spells';
  if (score === 16) return 'Max 8th-level spells';
  if (score >= 19) return 'All spell levels, illusion resistance';
  return 'Max 9th-level spells';
};

const wisdomSummary = (score: number) => {
  const defense = score <= 3 ? -3 : score <= 5 ? -2 : score <= 7 ? -1 : score <= 14 ? 0 : score <= 16 ? 1 : score === 17 ? 2 : 3;
  return `${signed(defense)} magical defense adjustment`;
};

const charismaSummary = (score: number) => {
  const reaction = score <= 3 ? -5 : score <= 4 ? -4 : score <= 5 ? -3 : score <= 7 ? -2 : score <= 8 ? -1 : score <= 12 ? 0 : score <= 14 ? 1 : score === 15 ? 3 : score === 16 ? 4 : score === 17 ? 6 : score === 18 ? 7 : 8;
  return `${signed(reaction)} reaction adjustment`;
};

export const getAbilityModifierSummary = (ability: string, score: string, characterClass = '') => {
  const value = scoreNumber(score);

  if (!Number.isFinite(value) || value <= 0) {
    return 'Enter score';
  }

  if (ability === 'Strength') return strengthSummary(value);
  if (ability === 'Dexterity') return getDexterityModifierSummary(characterClass, value);
  if (ability === 'Constitution') return constitutionSummary(value);
  if (ability === 'Intelligence') return intelligenceSummary(value);
  if (ability === 'Wisdom') return wisdomSummary(value);
  if (ability === 'Charisma') return charismaSummary(value);

  return '';
};

const MAGE_MP_ADJUSTMENTS: Record<number, number> = {
  1: -8,
  2: -7,
  3: -6,
  4: -5,
  5: -4,
  6: -3,
  7: -2,
  8: -1,
  9: 0,
  10: 0,
  11: 0,
  12: 0,
  13: 0,
  14: 1,
  15: 2,
  16: 3,
  17: 4,
  18: 5,
  19: 6,
  20: 7,
  21: 7,
  22: 8,
  23: 9,
  24: 9,
  25: 10,
};

const PRIEST_MP_ADJUSTMENTS: Record<number, number> = {
  1: -9,
  2: -8,
  3: -7,
  4: -6,
  5: -5,
  6: -4,
  7: -3,
  8: -2,
  9: -1,
  10: 0,
  11: 0,
  12: 0,
  13: 0,
  14: 1,
  15: 2,
  16: 3,
  17: 4,
  18: 5,
  19: 6,
  20: 7,
  21: 8,
  22: 9,
  23: 10,
  24: 10,
  25: 11,
};

export const calculateSheetMagicPoints = (characterClass: string, level: number, sheet: CharacterSheetState) => {
  const boundedLevel = Math.max(level || 1, 1);
  const intelligence = Number(sheet.abilityDetails.Intelligence);
  const piety = Number(sheet.abilityDetails.Piety);

  // Wizard and Runeist use Intelligence for MP. The ability bonus applies once per level.
  if (characterClass === 'Wizard' || characterClass === 'Runeist') {
    return Math.max(0, (4 + (MAGE_MP_ADJUSTMENTS[intelligence] ?? 0)) * boundedLevel);
  }

  // Priest uses Piety for MP. The ability bonus applies once per level.
  if (characterClass === 'Priest') {
    return Math.max(0, (4 + (PRIEST_MP_ADJUSTMENTS[piety] ?? 0)) * boundedLevel);
  }

  if (characterClass === 'Druid') {
    return Math.max(0, (boundedLevel * 4) + (MAGE_MP_ADJUSTMENTS[intelligence] ?? 0));
  }

  return 0;
};
