import type { ProficiencyRow, WeaponRow } from './characterSheetState';
import { DEFAULT_BASE_THACO } from './characterSheetState';
import { getWeaponProficiencyModifiersForWeapon, formatSpecializationValue } from './weaponProficiencies';

export type ParsedWeaponLine = {
  bonusValue: string;
  baseSpeed: string;
  smDamage: string;
  lDamage: string;
};

export type WeaponRowContext = {
  characterClass: string;
  baseThaco: string;
  weaponProficiencies: ProficiencyRow[];
};

export const SOUL_SWORD_COLORS = ['green', 'blue', 'gold', 'red'] as const;
export type SoulSwordColor = (typeof SOUL_SWORD_COLORS)[number];

export const isSoulSwordLine = (weaponLine: string) => (
  weaponLine.toLowerCase().includes('soul sword -')
);

const getSoulSwordColor = (value: string): SoulSwordColor | '' => {
  const normalized = value.trim().toLowerCase();
  return (SOUL_SWORD_COLORS as readonly string[]).includes(normalized)
    ? normalized as SoulSwordColor
    : '';
};

export const getSoulSwordGlowColor = (value: string) => {
  const color = getSoulSwordColor(value);

  if (!color) return '';
  if (color === 'blue') return '#60a5fa';
  if (color === 'gold') return '#facc15';
  if (color === 'red') return '#f87171';
  return '#4ade80';
};

export const getThacoChartTarget = (realThaco: string, armorClass: number) => {
  if (!realThaco.trim()) {
    return '';
  }

  const thaco = Number(realThaco);

  if (!Number.isFinite(thaco)) {
    return '';
  }

  const target = thaco - armorClass;

  return String(Math.min(20, Math.max(2, target)));
};

export const getWeaponThacoChartTarget = (row: Pick<WeaponRow, 'weapon' | 'thacoReal'>, armorClass: number) => {
  if (!row.weapon.trim() || !row.thacoReal.trim()) {
    return '';
  }

  return getThacoChartTarget(row.thacoReal, armorClass);
};

export const getWeaponEquipmentLines = (equipmentDetails: Record<string, string>, selectedWeapon = '') => {
  const lines = (equipmentDetails.Weapons ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const selectedValue = selectedWeapon.trim();

  if (selectedValue && !lines.includes(selectedValue)) {
    return [...lines, selectedValue];
  }

  return lines;
};

export const parseWeaponLine = (weaponLine: string): ParsedWeaponLine => {
  const bonusMatch = weaponLine.match(/\s([+-])(\d+)\s*(?:\(|$)/);
  const bonusValue = bonusMatch ? bonusMatch[2] : '';

  const speedMatch = weaponLine.match(/Speed\s+(\d+)/i);
  const baseSpeed = speedMatch?.[1] ?? '';

  const smDamageMatch = weaponLine.match(/Damage\s+S-M\s+(\d+d\d+(?:\+\d+)?)/i);
  const smDamage = smDamageMatch?.[1] ?? '';

  const lDamageMatch = weaponLine.match(/;\s*L\s+(\d+d\d+(?:\+\d+)?)/i);
  const lDamage = lDamageMatch?.[1] ?? '';

  return { bonusValue, baseSpeed, smDamage, lDamage };
};

export const parseNumericField = (value: string) => {
  const parsed = Number(value.replace(/[^0-9.-]/g, ''));

  return Number.isFinite(parsed) ? parsed : null;
};

export const parseSignedNumeric = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed.replace(/[^0-9.+-]/g, ''));

  return Number.isFinite(parsed) ? parsed : null;
};

export const formatWeaponChartDisplay = (value: string) => {
  const parsed = parseSignedNumeric(value);

  if (parsed === null || parsed === 0) {
    return '';
  }

  if (parsed < 0) {
    return String(parsed);
  }

  return String(parsed);
};

export const recalculateWeaponSpeed = (row: Pick<WeaponRow, 'speedBase' | 'speedReactionAdj' | 'speedWeaponBonus'>) => {
  const baseSpeed = parseNumericField(row.speedBase);

  if (baseSpeed === null) {
    return { speedReal: '', wac: '' };
  }

  const reactionAdj = parseSignedNumeric(row.speedReactionAdj) ?? 0;
  const weaponBonus = parseNumericField(row.speedWeaponBonus) ?? 0;
  const realSpeed = String(baseSpeed - reactionAdj - weaponBonus);

  return { speedReal: realSpeed, wac: realSpeed };
};

export const isWeaponRowReadyForSpeedReal = (row: WeaponRow) => (
  Boolean(row.weapon.trim()) && Boolean(row.speedBase.trim())
);

export const getWeaponFieldDisplayValue = (field: keyof WeaponRow, value: string) => {
  if (field === 'damageSmallMedium' || field === 'damageLarge' || field === 'weapon') {
    return value;
  }

  if (field === 'thacoReal' || field === 'speedReal' || field === 'wac') {
    return value;
  }

  return formatWeaponChartDisplay(value);
};

export const calculateThacoReal = (
  baseThaco: string,
  row: Pick<WeaponRow, 'thacoWeaponBonus' | 'thacoStrengthBonus' | 'thacoSpecialization'>,
) => {
  const base = parseNumericField(baseThaco);

  if (base === null) {
    return '';
  }

  const weaponBonus = parseNumericField(row.thacoWeaponBonus) ?? 0;
  const strengthBonus = parseSignedNumeric(row.thacoStrengthBonus) ?? 0;
  const specialization = parseSignedNumeric(row.thacoSpecialization) ?? 0;

  return String(base - weaponBonus - strengthBonus - specialization);
};

export const calculateDamageReal = (
  row: Pick<WeaponRow, 'damageWeaponBonus' | 'damageStrengthBonus' | 'damageSpecialization'>,
) => {
  const weaponBonus = parseNumericField(row.damageWeaponBonus) ?? 0;
  const strengthBonus = parseSignedNumeric(row.damageStrengthBonus) ?? 0;
  const specialization = parseSignedNumeric(row.damageSpecialization) ?? 0;
  const total = weaponBonus + strengthBonus + specialization;

  return total === 0 ? '' : String(total);
};

export const isWeaponRowReadyForRealValues = (row: WeaponRow) => (
  Boolean(row.weapon.trim())
  && Boolean(row.speedBase.trim())
  && Boolean(row.damageSmallMedium.trim())
  && Boolean(row.damageLarge.trim())
);

export const enrichWeaponRow = (row: WeaponRow, context: WeaponRowContext): WeaponRow => {
  const isSoulSword = isSoulSwordLine(row.weapon);
  const soulSwordBonus = row.soulSwordIgnited ? '5' : '3';
  const soulSwordDamage = row.soulSwordIgnited ? '3d10' : '3d8';

  const soulSwordColor = getSoulSwordColor(row.soulSwordColor);
  const withSoulSwordDefaults: WeaponRow = isSoulSword
    ? {
      ...row,
      soulSwordColor,
      soulSwordIgnited: Boolean(row.soulSwordIgnited && soulSwordColor),
      speedBase: '5',
      thacoWeaponBonus: soulSwordBonus,
      speedWeaponBonus: soulSwordBonus,
      damageSmallMedium: soulSwordDamage,
      damageLarge: soulSwordDamage,
      damageWeaponBonus: soulSwordBonus,
    }
    : {
      ...row,
      soulSwordColor: '',
      soulSwordIgnited: false,
    };

  const proficiencyMods = getWeaponProficiencyModifiersForWeapon(
    context.weaponProficiencies,
    withSoulSwordDefaults.weapon,
    context.characterClass,
  );

  const withProficiency: WeaponRow = {
    ...withSoulSwordDefaults,
    thacoSpecialization: proficiencyMods
      ? formatSpecializationValue(proficiencyMods.thacoSpecialization)
      : '',
    damageSpecialization: proficiencyMods
      ? formatSpecializationValue(proficiencyMods.damageSpecialization)
      : '',
  };

  const withSpeed = isWeaponRowReadyForSpeedReal(withProficiency)
    ? { ...withProficiency, ...recalculateWeaponSpeed(withProficiency) }
    : { ...withProficiency, wac: '', speedReal: '' };

  if (!isWeaponRowReadyForRealValues(withProficiency)) {
    return {
      ...withSpeed,
      thacoReal: '',
      damageReal: '',
    };
  }

  return {
    ...withSpeed,
    thacoReal: calculateThacoReal(context.baseThaco, withSpeed),
    damageReal: calculateDamageReal(withSpeed),
  };
};

export const enrichAllWeaponRows = (weaponRows: WeaponRow[], context: WeaponRowContext) => (
  weaponRows.map((row) => enrichWeaponRow(row, context))
);

export const getWeaponRowContext = (
  sheet: { combatDetails: Record<string, string>; weaponProficiencies: ProficiencyRow[] },
  characterClass: string,
): WeaponRowContext => ({
  characterClass,
  baseThaco: sheet.combatDetails['Base THACO']?.trim() || DEFAULT_BASE_THACO,
  weaponProficiencies: sheet.weaponProficiencies,
});

export const applyWeaponSelectionToRow = (
  row: WeaponRow,
  weaponLine: string,
  context?: WeaponRowContext,
): WeaponRow => {
  if (!weaponLine.trim()) {
    const clearedRow: WeaponRow = {
      ...row,
      weapon: '',
      soulSwordColor: '',
      soulSwordIgnited: false,
      wac: '',
      thacoWeaponBonus: '',
      speedBase: '',
      speedWeaponBonus: '',
      speedReal: '',
      damageSmallMedium: '',
      damageLarge: '',
      damageWeaponBonus: '',
      thacoSpecialization: '',
      damageSpecialization: '',
      thacoReal: '',
      damageReal: '',
    };

    return context ? enrichWeaponRow(clearedRow, context) : clearedRow;
  }

  const parsed = parseWeaponLine(weaponLine);
  const isSoulSword = isSoulSwordLine(weaponLine);
  const updatedRow: WeaponRow = {
    ...row,
    weapon: weaponLine,
    soulSwordColor: isSoulSword ? (row.soulSwordColor || 'green') : '',
    soulSwordIgnited: isSoulSword ? false : false,
    thacoWeaponBonus: isSoulSword ? '3' : parsed.bonusValue,
    speedBase: isSoulSword ? '5' : parsed.baseSpeed,
    speedWeaponBonus: isSoulSword ? '3' : parsed.bonusValue,
    damageSmallMedium: isSoulSword ? '3d8' : parsed.smDamage,
    damageLarge: isSoulSword ? '3d8' : parsed.lDamage,
    damageWeaponBonus: isSoulSword ? '3' : parsed.bonusValue,
  };

  return context
    ? enrichWeaponRow(updatedRow, context)
    : { ...updatedRow, ...recalculateWeaponSpeed(updatedRow) };
};

export const updateWeaponRowField = (
  row: WeaponRow,
  field: keyof WeaponRow,
  value: string,
  context?: WeaponRowContext,
): WeaponRow => {
  const updatedRow = { ...row, [field]: value };

  if (field === 'speedReactionAdj' || field === 'speedBase' || field === 'speedWeaponBonus') {
    return context ? enrichWeaponRow(updatedRow, context) : { ...updatedRow, ...recalculateWeaponSpeed(updatedRow) };
  }

  if (
    context
    && (
      field === 'thacoStrengthBonus'
      || field === 'damageStrengthBonus'
      || field === 'thacoWeaponBonus'
      || field === 'damageWeaponBonus'
    )
  ) {
    return enrichWeaponRow(updatedRow, context);
  }

  return updatedRow;
};

export const WEAPON_DERIVED_READONLY_FIELDS: Array<keyof WeaponRow> = [
  'wac',
  'thacoWeaponBonus',
  'thacoSpecialization',
  'thacoReal',
  'speedBase',
  'speedWeaponBonus',
  'speedReal',
  'damageSmallMedium',
  'damageLarge',
  'damageWeaponBonus',
  'damageSpecialization',
  'damageReal',
];

export const WEAPON_CHART_CENTERED_FIELDS: Array<keyof WeaponRow> = [
  'wac',
  'thacoWeaponBonus',
  'thacoStrengthBonus',
  'thacoSpecialization',
  'thacoReal',
  'speedBase',
  'speedReactionAdj',
  'speedWeaponBonus',
  'speedReal',
  'damageSmallMedium',
  'damageLarge',
  'damageWeaponBonus',
  'damageStrengthBonus',
  'damageSpecialization',
  'damageReal',
];
