import type { CharacterSheetState } from './characterSheetState';

export const parseHitPointValue = (value?: string) => {
  if (!value) {
    return null;
  }

  const match = value.replace(/,/g, '').trim().match(/[+-]?\d+/);
  if (!match) {
    return null;
  }

  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
};

export const calculateTotalHitPoints = (hitPointDetails: CharacterSheetState['hitPointDetails']) => {
  const hpRoll = parseHitPointValue(hitPointDetails['HP Roll']);
  const adjustment = parseHitPointValue(hitPointDetails.Adjustment);

  if (hpRoll === null && adjustment === null) {
    return '';
  }

  return String(Math.max((hpRoll ?? 0) + (adjustment ?? 0), 0));
};

export const withCalculatedTotalHitPoints = (hitPointDetails: CharacterSheetState['hitPointDetails']) => ({
  ...hitPointDetails,
  'Total HP': calculateTotalHitPoints(hitPointDetails),
});

export const calculateLevelAwareTotalHitPoints = (
  hitPointDetails: CharacterSheetState['hitPointDetails'],
  levelValue: number,
) => {
  const hpRoll = parseHitPointValue(hitPointDetails['HP Roll']);
  const adjustment = parseHitPointValue(hitPointDetails.Adjustment);
  const levelUpBase = parseHitPointValue(hitPointDetails['Level Up HP Base']);

  if (hpRoll === null && adjustment === null && levelUpBase === null) {
    return '';
  }

  if (levelUpBase !== null) {
    return String(Math.max(levelUpBase + (hpRoll ?? 0) + (adjustment ?? 0), 0));
  }

  const boundedLevel = Math.max(levelValue || 1, 1);
  const perLevelAdjustment = (adjustment ?? 0) * boundedLevel;
  return String(Math.max((hpRoll ?? 0) + perLevelAdjustment, 0));
};

export const withLevelAwareTotalHitPoints = (
  hitPointDetails: CharacterSheetState['hitPointDetails'],
  levelValue: number,
) => ({
  ...hitPointDetails,
  'Total HP': calculateLevelAwareTotalHitPoints(hitPointDetails, levelValue),
});
