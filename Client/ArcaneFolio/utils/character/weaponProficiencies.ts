import type { ProficiencyRow } from './characterSheetState';

export type WeaponProficiencyGroup = 'Warrior' | 'Wizard' | 'Priest' | 'Rogue';

export const WARRIOR_WEAPON_CLASSES = new Set([
  'Fighter',
  'Archer',
  'Barbarian',
  'Cavalier',
  'Ranger',
  'Paladin',
  'Vanar Knight',
]);

export const CLASS_WEAPON_PROFICIENCY_GROUP: Record<string, WeaponProficiencyGroup> = {
  Wizard: 'Wizard',
  Runeist: 'Rogue',
  Bard: 'Rogue',
  Priest: 'Priest',
  Druid: 'Priest',
  Rogue: 'Rogue',
  Assassin: 'Rogue',
  Fighter: 'Warrior',
  Archer: 'Warrior',
  Barbarian: 'Warrior',
  Cavalier: 'Warrior',
  Monk: 'Rogue',
  Ranger: 'Warrior',
  Paladin: 'Warrior',
  Harbinger: 'Rogue',
  'Vanar Knight': 'Warrior',
};

export const NON_PROFICIENT_WEAPON_PENALTY: Record<WeaponProficiencyGroup, number> = {
  Warrior: -2,
  Wizard: -5,
  Priest: -3,
  Rogue: -3,
};

export const getWeaponProficiencyGroup = (characterClass: string): WeaponProficiencyGroup => (
  CLASS_WEAPON_PROFICIENCY_GROUP[characterClass] ?? 'Warrior'
);

export const isWarriorWeaponClass = (characterClass: string) => (
  WARRIOR_WEAPON_CLASSES.has(characterClass)
);

export type WeaponProficiencySlotOption = {
  value: string;
  label: string;
  minLevel?: number;
};

const BASE_SLOT_OPTIONS: WeaponProficiencySlotOption[] = [
  { value: '0', label: '0' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
];

export const getWeaponProficiencySlotOptions = (characterClass: string): WeaponProficiencySlotOption[] => {
  if (characterClass !== 'Vanar Knight') {
    return BASE_SLOT_OPTIONS;
  }

  return [
    ...BASE_SLOT_OPTIONS,
    { value: 'WM', label: 'Weapon Mastery', minLevel: 5 },
    { value: 'GM', label: 'Grand Mastery', minLevel: 15 },
  ];
};

const parseWeaponProficiencySlots = (slotValue: string, characterClass: string) => {
  if (characterClass === 'Vanar Knight') {
    if (slotValue === 'WM') {
      return 4;
    }

    if (slotValue === 'GM') {
      return 5;
    }
  }

  const slots = Number(slotValue);
  return Number.isFinite(slots) ? slots : 0;
};

export const getWeaponDisplayLabel = (weaponLine: string) => {
  const trimmed = weaponLine.trim();

  if (!trimmed) {
    return '';
  }

  const parenIndex = trimmed.indexOf(' (');

  return parenIndex > 0 ? trimmed.slice(0, parenIndex) : trimmed;
};

export const getProficiencySlotsForWeapon = (
  weaponProficiencies: ProficiencyRow[],
  weaponLine: string,
  characterClass: string,
): number | null => {
  const trimmedWeapon = weaponLine.trim();

  if (!trimmedWeapon) {
    return null;
  }

  const exactMatch = weaponProficiencies.find((row) => row.name === trimmedWeapon);

  if (exactMatch) {
    return parseWeaponProficiencySlots(exactMatch.slots, characterClass);
  }

  const weaponLabel = getWeaponDisplayLabel(trimmedWeapon);
  const labelMatch = weaponProficiencies.find((row) => (
    weaponLabel && getWeaponDisplayLabel(row.name) === weaponLabel
  ));

  if (labelMatch) {
    return parseWeaponProficiencySlots(labelMatch.slots, characterClass);
  }

  // Weapon not listed on proficiency page — treat as non-proficient (0 slots).
  return 0;
};

export const getWeaponProficiencyModifiersForWeapon = (
  weaponProficiencies: ProficiencyRow[],
  weaponLine: string,
  characterClass: string,
): WeaponProficiencyModifiers | null => {
  const slots = getProficiencySlotsForWeapon(weaponProficiencies, weaponLine, characterClass);

  if (slots === null) {
    return null;
  }

  return getProficiencyModifiers(slots, characterClass);
};

export const formatSpecializationValue = (value: number) => (
  value === 0 ? '' : String(value)
);

export type WeaponProficiencyModifiers = {
  thacoSpecialization: number;
  damageSpecialization: number;
};

export const getProficiencyModifiers = (
  slots: number,
  characterClass: string,
): WeaponProficiencyModifiers => {
  const group = getWeaponProficiencyGroup(characterClass);
  const slotCount = Number.isFinite(slots) ? Math.max(0, Math.floor(slots)) : 0;

  if (slotCount === 0) {
    const penalty = NON_PROFICIENT_WEAPON_PENALTY[group];
    return { thacoSpecialization: penalty, damageSpecialization: penalty };
  }

  if (slotCount === 1) {
    return { thacoSpecialization: 0, damageSpecialization: 0 };
  }

  if (slotCount === 2) {
    return { thacoSpecialization: 1, damageSpecialization: 2 };
  }

  if (characterClass === 'Vanar Knight' && slotCount === 4) {
    return { thacoSpecialization: 4, damageSpecialization: 4 };
  }

  if (characterClass === 'Vanar Knight' && slotCount >= 5) {
    return { thacoSpecialization: 5, damageSpecialization: 5 };
  }

  if (slotCount >= 3) {
    return { thacoSpecialization: 3, damageSpecialization: 3 };
  }

  return { thacoSpecialization: 0, damageSpecialization: 0 };
};
