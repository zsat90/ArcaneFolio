import type { CharacterSheetState } from './characterSheetState';
import { withCalculatedRealArmorClass } from './armorClass';

export type DexterityAutofill = {
  reaction: string;
  missile: string;
  defense: string;
  parry: string;
};

type ClassDexterityDefensiveOverride = {
  className: string;
  getBonus: (score: number) => number;
};

export const parseAbilityScore = (score: string) => {
  const trimmedScore = score.trim();

  if (!trimmedScore) {
    return null;
  }

  const value = Number(trimmedScore);
  return Number.isFinite(value) ? value : null;
};

export const parseNumericModifier = (value: string) => {
  const match = value.match(/[+-]?\d+/);
  return match ? Number(match[0]) : null;
};

export const formatSignedModifier = (value: number) => {
  if (value === 0) {
    return '0';
  }

  return value > 0 ? `+${value}` : String(value);
};

export const getBarbarianDexterityDefensiveBonus = (score: number) => (
  Math.max(0, (score - 14) * 2)
);

const CLASS_DEXTERITY_DEFENSIVE_OVERRIDES: ClassDexterityDefensiveOverride[] = [
  {
    className: 'Barbarian',
    getBonus: getBarbarianDexterityDefensiveBonus,
  },
];

const getClassDexterityDefensiveOverride = (characterClass: string) => (
  CLASS_DEXTERITY_DEFENSIVE_OVERRIDES.find((rule) => rule.className === characterClass.trim()) ?? null
);

export const getStandardDexterityAutofill = (score: string): DexterityAutofill | null => {
  const value = parseAbilityScore(score);

  if (value === null) {
    return null;
  }

  const rows: Record<number, { reaction: string; missile: string; defense: string }> = {
    1: { reaction: '-6', missile: '-6', defense: '+5' },
    2: { reaction: '-4', missile: '-4', defense: '+5' },
    3: { reaction: '-3', missile: '-3', defense: '+4' },
    4: { reaction: '-2', missile: '-2', defense: '+3' },
    5: { reaction: '-1', missile: '-1', defense: '+2' },
    6: { reaction: '0', missile: '0', defense: '+1' },
    15: { reaction: '0', missile: '0', defense: '-1' },
    16: { reaction: '+1', missile: '+1', defense: '-2' },
    17: { reaction: '+2', missile: '+2', defense: '-3' },
    18: { reaction: '+2', missile: '+2', defense: '-4' },
    19: { reaction: '+3', missile: '+3', defense: '-4' },
    20: { reaction: '+3', missile: '+3', defense: '-4' },
    21: { reaction: '+4', missile: '+4', defense: '-5' },
    22: { reaction: '+4', missile: '+4', defense: '-5' },
    23: { reaction: '+4', missile: '+4', defense: '-5' },
    24: { reaction: '+5', missile: '+5', defense: '-6' },
    25: { reaction: '+5', missile: '+5', defense: '-6' },
  };
  const row = rows[value] ?? { reaction: '0', missile: '0', defense: '0' };

  return {
    ...row,
    parry: String(Math.ceil(Math.max(value, 1) / 2)),
  };
};

export const getDexterityDefensiveAdjustmentDisplay = (
  characterClass: string,
  dexterityScore: string,
) => {
  const score = parseAbilityScore(dexterityScore);

  if (score === null) {
    return '';
  }

  const override = getClassDexterityDefensiveOverride(characterClass);

  if (override) {
    return formatSignedModifier(override.getBonus(score));
  }

  return getStandardDexterityAutofill(dexterityScore)?.defense ?? '0';
};

export const getDexterityAutofill = (
  characterClass: string,
  score: string,
): DexterityAutofill | null => {
  const standard = getStandardDexterityAutofill(score);

  if (!standard) {
    return null;
  }

  return {
    ...standard,
    defense: getDexterityDefensiveAdjustmentDisplay(characterClass, score),
  };
};

export const getDexterityArmorBase = (
  characterClass: string,
  dexterityScore: string,
  defensiveAdjustment: string,
) => {
  const score = parseAbilityScore(dexterityScore);

  if (score === null) {
    return '';
  }

  const override = getClassDexterityDefensiveOverride(characterClass);

  if (override) {
    return String(10 - override.getBonus(score));
  }

  const adjustment = parseNumericModifier(defensiveAdjustment);
  return adjustment === null ? '' : String(10 + adjustment);
};

export const getDexteritySavingThrowBonus = (
  characterClass: string,
  defensiveAdjustment: string,
) => {
  const parsed = parseNumericModifier(defensiveAdjustment) ?? 0;
  const override = getClassDexterityDefensiveOverride(characterClass);

  if (override) {
    return Math.max(0, parsed);
  }

  return Math.abs(Math.min(parsed, 0));
};

export const applyDexterityAdjustmentsToSheet = (
  sheet: Pick<CharacterSheetState, 'abilityDetails' | 'armorDetails' | 'weaponRows'>,
  characterClass: string,
  dexterityScore = sheet.abilityDetails.Dexterity,
) => {
  if (!dexterityScore.trim()) {
    return {
      abilityDetails: {
        ...sheet.abilityDetails,
        Dexterity: dexterityScore,
        'Dexterity Reac Adj': '',
        'Dexterity Msl Att Adj': '',
        'Dexterity Def Adj (AC)': '',
        'Dexterity Parry': '',
      },
      armorDetails: withCalculatedRealArmorClass({
        ...sheet.armorDetails,
        Base: '',
      }),
      weaponRows: sheet.weaponRows.map((row) => ({
        ...row,
        speedReactionAdj: '',
      })),
    };
  }

  const autofill = getDexterityAutofill(characterClass, dexterityScore);

  if (!autofill) {
    return {
      abilityDetails: {
        ...sheet.abilityDetails,
        Dexterity: dexterityScore,
      },
      armorDetails: sheet.armorDetails,
      weaponRows: sheet.weaponRows,
    };
  }

  return {
    abilityDetails: {
      ...sheet.abilityDetails,
      Dexterity: dexterityScore,
      'Dexterity Reac Adj': autofill.reaction,
      'Dexterity Msl Att Adj': autofill.missile,
      'Dexterity Def Adj (AC)': autofill.defense,
      'Dexterity Parry': autofill.parry,
    },
    armorDetails: withCalculatedRealArmorClass({
      ...sheet.armorDetails,
      Base: getDexterityArmorBase(characterClass, dexterityScore, autofill.defense),
    }),
    weaponRows: sheet.weaponRows.map((row) => ({
      ...row,
      speedReactionAdj: autofill.reaction,
    })),
  };
};

export const getDexterityModifierSummary = (characterClass: string, score: number) => {
  const parry = `Parry ${Math.ceil(score / 2)}`;
  const override = getClassDexterityDefensiveOverride(characterClass);

  if (override) {
    const bonus = override.getBonus(score);
    return bonus > 0 ? `+${bonus} AC, ${parry}` : `No adjustment, ${parry}`;
  }

  if (score <= 3) return `+4 AC, -3 missile/reaction, ${parry}`;
  if (score === 4) return `+3 AC, -2 missile/reaction, ${parry}`;
  if (score === 5) return `+2 AC, -1 missile/reaction, ${parry}`;
  if (score === 6) return `+1 AC, ${parry}`;
  if (score <= 14) return `No adjustment, ${parry}`;
  if (score === 15) return `-1 AC, ${parry}`;
  if (score === 16) return `-2 AC, +1 missile/reaction, ${parry}`;
  if (score === 17) return `-3 AC, +2 missile/reaction, ${parry}`;
  if (score === 18) return `-4 AC, +2 missile/reaction, ${parry}`;
  if (score === 19) return `-4 AC, +3 missile/reaction, ${parry}`;
  if (score === 20) return `-4 AC, +3 missile/reaction, ${parry}`;
  if (score === 21) return `-5 AC, +4 missile/reaction, ${parry}`;
  if (score === 22) return `-5 AC, +4 missile/reaction, ${parry}`;
  if (score === 23) return `-5 AC, +4 missile/reaction, ${parry}`;
  if (score === 24) return `-6 AC, +5 missile/reaction, ${parry}`;
  return `-6 AC, +5 missile/reaction, ${parry}`;
};
