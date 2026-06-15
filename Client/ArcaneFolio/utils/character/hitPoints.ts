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
