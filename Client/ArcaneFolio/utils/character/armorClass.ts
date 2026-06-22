const ARMOR_REDUCTIONS: Record<string, number> = {
  'Banded mail': 6,
  Brigandine: 4,
  'Bronze plate mail': 6,
  'Chain mail': 5,
  'Elven Chain': 5,
  'Field plate': 8,
  'Full plate': 9,
  Hide: 4,
  Leather: 2,
  Padded: 2,
  'Plate mail': 7,
  'Rigid Leather - Vanar/Sindar Armor': 8,
  'Ring mail': 3,
  'Scale mail': 4,
  'Splint mail': 5,
  'Studded leather': 3,
};

const HELM_REDUCTIONS: Record<string, number> = {
  'Great helm': 2,
  Basinet: 1,
};

const SHIELD_REDUCTIONS: Record<string, number> = {
  Buckler: 1,
  Small: 2,
  Medium: 3,
  Body: 5,
};

const parseNumber = (value?: string) => {
  if (!value) {
    return null;
  }

  const match = value.replace(/,/g, '').match(/[+-]?\d+/);
  if (!match) {
    return null;
  }

  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
};

const getEquipmentName = (value?: string) => {
  if (!value) {
    return '';
  }

  return value
    .split(' (')[0]
    .replace(/\s+\+\d+$/, '')
    .trim();
};

const getEquipmentMagicBonus = (value?: string) => {
  if (!value) {
    return 0;
  }

  const match = value.split(' (')[0].match(/\+(\d+)$/);
  if (!match) {
    return 0;
  }

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getReduction = (value: string | undefined, reductions: Record<string, number>) => {
  const equipmentName = getEquipmentName(value);
  return (reductions[equipmentName] ?? 0) + getEquipmentMagicBonus(value);
};

export const calculateRealArmorClass = (armorDetails: Record<string, string>) => {
  const base = parseNumber(armorDetails.Base);

  if (base === null) {
    return '';
  }

  const armorReduction = getReduction(armorDetails['Armor Type'], ARMOR_REDUCTIONS);
  const helmReduction = getReduction(armorDetails.Helm, HELM_REDUCTIONS);
  const shieldReduction = getReduction(armorDetails.Shield, SHIELD_REDUCTIONS);
  const magicalReduction = Math.abs(parseNumber(armorDetails.Magical) ?? 0);
  const realArmorClass = base - armorReduction - helmReduction - shieldReduction - magicalReduction;

  return String(Math.max(realArmorClass, -10));
};

export const withCalculatedRealArmorClass = (armorDetails: Record<string, string>) => ({
  ...armorDetails,
  Real: calculateRealArmorClass(armorDetails),
});
