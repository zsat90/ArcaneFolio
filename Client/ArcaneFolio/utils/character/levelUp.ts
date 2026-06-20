import type { CharacterSheetState } from './characterSheetState';
import { calculateSheetMagicPoints } from './characterSheetState';
import {
  formatExperience,
  getExperienceDefaults,
  getLevelOptionsForClass,
  getLevelTitleForClass,
  parseExperience,
} from './experience';
import { enrichAllWeaponRows, getWeaponRowContext } from './weapons';
import { getWeaponProficiencyGroup } from './weaponProficiencies';

const THACO_BY_GROUP: Record<'Priest' | 'Rogue' | 'Warrior' | 'Wizard', number[]> = {
  Priest: [20, 20, 20, 18, 18, 18, 16, 16, 16, 14, 14, 14, 12, 12, 12, 10, 10, 10, 8, 8],
  Rogue: [20, 20, 19, 19, 18, 18, 17, 17, 16, 16, 15, 15, 14, 14, 13, 13, 12, 12, 11, 11],
  Warrior: [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
  Wizard: [20, 20, 20, 19, 19, 19, 18, 18, 18, 17, 17, 17, 16, 16, 16, 15, 15, 15, 14, 14],
};

const TURNING_UNDEAD_LABELS: Array<[string, string]> = [
  ['Skeleton', 'Skeleton'],
  ['Zombie', 'Zombie'],
  ['Ghoul', 'Ghoul'],
  ['Shadow', 'Shadow'],
  ['Wight', 'Wight'],
  ['Ghast', 'Ghast'],
  ['Wraith', 'Wraith'],
  ['Mummy', 'Mummy'],
  ['Spectre', 'Spectre'],
  ['Vampire', 'Vampire'],
  ['Ghost', 'Ghost'],
  ['Litch', 'Litch'],
  ['Special', 'Special'],
];

const TURNING_UNDEAD_BY_LEVEL: Record<string, string[]> = {
  Skeleton: ['10', '7', '4', 'T', 'T', 'D', 'D', 'D*', 'D*', 'D*', 'D*', 'D*'],
  Zombie: ['13', '10', '7', '4', 'T', 'T', 'D', 'D', 'D*', 'D*', 'D*', 'D*'],
  Ghoul: ['16', '13', '10', '7', '4', 'T', 'T', 'D', 'D', 'D*', 'D*', 'D*'],
  Shadow: ['19', '16', '13', '10', '7', '4', 'T', 'T', 'D', 'D', 'D*', 'D*'],
  Wight: ['20', '19', '16', '13', '10', '7', '4', 'T', 'T', 'D', 'D', 'D*'],
  Ghast: ['-', '20', '19', '16', '13', '10', '7', '4', 'T', 'T', 'D', 'D'],
  Wraith: ['-', '-', '20', '19', '16', '13', '10', '7', '4', 'T', 'T', 'D'],
  Mummy: ['-', '-', '-', '20', '19', '16', '13', '10', '7', '4', 'T', 'T'],
  Spectre: ['-', '-', '-', '-', '20', '19', '16', '13', '10', '7', '4', 'T'],
  Vampire: ['-', '-', '-', '-', '-', '20', '19', '16', '13', '10', '7', '4'],
  Ghost: ['-', '-', '-', '-', '-', '-', '20', '19', '16', '13', '10', '7'],
  Litch: ['-', '-', '-', '-', '-', '-', '-', '20', '19', '16', '13', '10'],
  Special: ['-', '-', '-', '-', '-', '-', '-', '-', '20', '19', '16', '13'],
};

const THIEVING_POINT_ROGUE_CLASSES = ['Rogue', 'Assassin'];
const THIEVING_POINT_BARD_CLASSES = ['Bard', 'Harbinger'];
const MP_TRACKED_CLASSES = ['Wizard', 'Druid', 'Runeist', 'Priest'];

export type LevelUpAttentionKey =
  | 'combat.baseThaco'
  | 'weapons.thaco'
  | 'hitPoints.hpRoll'
  | 'hitPoints.total'
  | 'combat.mp'
  | 'proficiency.weaponSlots'
  | 'proficiency.nonWeaponSlots'
  | 'turningUndead'
  | 'thieving.points';

export type ApplyLevelChangeOptions = {
  setCurrentXpToLevelMinimum: boolean;
};

export type ApplyLevelChangeResult = {
  nextSheet: CharacterSheetState;
  reviewItems: string[];
  attentionKeys: LevelUpAttentionKey[];
};

const parsePointSpend = (value: string) => {
  const parsed = Number(value.replace(/[^0-9-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const getThievingSkillPool = (characterClass: string, levelValue: number) => {
  const boundedLevel = Math.max(levelValue, 1);

  if (THIEVING_POINT_ROGUE_CLASSES.includes(characterClass)) {
    return 90 + ((boundedLevel - 1) * 30);
  }

  if (THIEVING_POINT_BARD_CLASSES.includes(characterClass)) {
    return 60 + ((boundedLevel - 1) * 30);
  }

  return null;
};

const getEffectiveTurningLevel = (characterClass: string, levelValue: number) => {
  if (characterClass === 'Priest') return Math.max(levelValue, 1);
  if (characterClass === 'Paladin') return Math.max(levelValue - 2, 0);
  return 0;
};

const getTurningColumn = (levelValue: number) => {
  if (levelValue <= 9) return levelValue - 1;
  if (levelValue <= 11) return 9;
  if (levelValue <= 13) return 10;
  return 11;
};

export const getTurningUndeadDefaultsForLevel = (characterClass: string, levelValue: number) => {
  const effectiveLevel = getEffectiveTurningLevel(characterClass, levelValue);

  if (!effectiveLevel) {
    return TURNING_UNDEAD_LABELS.reduce<Record<string, string>>((values, [key]) => {
      values[key] = '';
      return values;
    }, {});
  }

  const column = getTurningColumn(effectiveLevel);
  return TURNING_UNDEAD_LABELS.reduce<Record<string, string>>((values, [key]) => {
    values[key] = TURNING_UNDEAD_BY_LEVEL[key]?.[column] ?? '';
    return values;
  }, {});
};

export const getBaseThacoForClassLevel = (characterClass: string, levelValue: number) => {
  const group = getWeaponProficiencyGroup(characterClass);
  const table = THACO_BY_GROUP[group];
  const boundedLevel = Math.min(Math.max(levelValue, 1), 20);

  return String(table[boundedLevel - 1]);
};

export const getMinimumExperienceForLevel = (characterClass: string, levelValue: number) => {
  const defaults = getExperienceDefaults(characterClass, levelValue);
  const current = 'Current' in defaults ? defaults.Current : '';
  return parseExperience(current) ?? null;
};

const getWeaponSlotGain = (sheet: CharacterSheetState, oldLevel: number, newLevel: number) => {
  const every = Number(sheet.proficiencyDetails['Weapon Additional Every']);

  if (!Number.isFinite(every) || every <= 0 || newLevel <= oldLevel) {
    return 0;
  }

  let gained = 0;
  for (let level = oldLevel + 1; level <= newLevel; level += 1) {
    if (level % every === 0) gained += 1;
  }
  return gained;
};

const getNonWeaponSlotGain = (sheet: CharacterSheetState, oldLevel: number, newLevel: number) => {
  const every = Number(sheet.proficiencyDetails['Non-Weapon Additional Every']);

  if (!Number.isFinite(every) || every <= 0 || newLevel <= oldLevel) {
    return 0;
  }

  let gained = 0;
  for (let level = oldLevel + 1; level <= newLevel; level += 1) {
    if (level % every === 0) gained += 1;
  }
  return gained;
};

const addToNumericField = (value: string, amount: number) => {
  const current = Number(value);
  const safeCurrent = Number.isFinite(current) ? current : 0;
  return String(safeCurrent + amount);
};

export const applyLevelChangeToSheet = (
  sheet: CharacterSheetState,
  characterClass: string,
  oldLevel: number,
  requestedNewLevel: number,
  options: ApplyLevelChangeOptions,
): ApplyLevelChangeResult => {
  const levelOptions = getLevelOptionsForClass(characterClass);
  const maxLevel = levelOptions[levelOptions.length - 1] ?? 20;
  const newLevel = Math.min(Math.max(requestedNewLevel, 1), maxLevel);
  const nextLevelTitle = getLevelTitleForClass(characterClass, newLevel);

  const minimumXp = getMinimumExperienceForLevel(characterClass, newLevel);
  const existingCurrentXp = parseExperience(sheet.experienceDetails.Current) ?? 0;
  const nextCurrentXp = options.setCurrentXpToLevelMinimum && minimumXp !== null
    ? minimumXp
    : existingCurrentXp;

  const experienceDefaults = getExperienceDefaults(
    characterClass,
    newLevel,
    formatExperience(nextCurrentXp),
  );

  const nextBaseThaco = getBaseThacoForClassLevel(characterClass, newLevel);
  const nextCombatDetails: Record<string, string> = {
    ...sheet.combatDetails,
    'Base THACO': nextBaseThaco,
  };

  if (MP_TRACKED_CLASSES.includes(characterClass)) {
    nextCombatDetails.MP = String(calculateSheetMagicPoints(characterClass, newLevel, sheet));
  }

  const weaponContext = getWeaponRowContext(
    { combatDetails: nextCombatDetails, weaponProficiencies: sheet.weaponProficiencies },
    characterClass,
  );
  const nextWeaponRows = enrichAllWeaponRows(sheet.weaponRows, weaponContext);

  const weaponSlotGain = getWeaponSlotGain(sheet, oldLevel, newLevel);
  const nonWeaponSlotGain = getNonWeaponSlotGain(sheet, oldLevel, newLevel);
  const nextThievingPool = getThievingSkillPool(characterClass, newLevel);
  const spentThievingPoints = sheet.thievingSkills.reduce((total, row) => total + parsePointSpend(row.thief), 0);

  const nextSheet: CharacterSheetState = {
    ...sheet,
    levelTitle: nextLevelTitle,
    combatDetails: nextCombatDetails,
    weaponRows: nextWeaponRows,
    experienceDetails: {
      ...sheet.experienceDetails,
      ...experienceDefaults,
      Current: formatExperience(nextCurrentXp),
    },
    hitPointDetails: {
      ...sheet.hitPointDetails,
      'HP Roll': '',
      'Level Up HP Base': sheet.hitPointDetails['Total HP'] || '0',
      'Total HP': sheet.hitPointDetails['Total HP'],
    },
    proficiencyDetails: {
      ...sheet.proficiencyDetails,
      'Weapon Initial Slots': weaponSlotGain
        ? addToNumericField(sheet.proficiencyDetails['Weapon Initial Slots'], weaponSlotGain)
        : sheet.proficiencyDetails['Weapon Initial Slots'],
      'Non-Weapon Initial Slots': nonWeaponSlotGain
        ? addToNumericField(sheet.proficiencyDetails['Non-Weapon Initial Slots'], nonWeaponSlotGain)
        : sheet.proficiencyDetails['Non-Weapon Initial Slots'],
      'Thieving Skill Points': nextThievingPool === null
        ? ''
        : String(nextThievingPool - spentThievingPoints),
    },
    turningUndead: getTurningUndeadDefaultsForLevel(characterClass, newLevel),
    xpAwardRows: sheet.xpAwardRows.map((row) => ({ ...row, xp: '' })),
    xpValuablesNotes: '',
  };

  const reviewItems = [
    'Enter HP roll for the new level.',
    'Review Base THAC0 and weapon THAC0 values.',
  ];

  if (MP_TRACKED_CLASSES.includes(characterClass)) {
    reviewItems.push('Review Magic Points progression.');
  }

  if (weaponSlotGain > 0) {
    reviewItems.push('New weapon proficiency slot available.');
  }

  if (nonWeaponSlotGain > 0) {
    reviewItems.push('New non-weapon proficiency slot available.');
  }

  if (getEffectiveTurningLevel(characterClass, newLevel) > 0) {
    reviewItems.push('Turn Undead chart updated.');
  }

  if (nextThievingPool !== null) {
    reviewItems.push('Thief skill points updated.');
  }

  const attentionKeys: LevelUpAttentionKey[] = [
    'combat.baseThaco',
    'weapons.thaco',
    'hitPoints.hpRoll',
    'hitPoints.total',
    'proficiency.weaponSlots',
    'proficiency.nonWeaponSlots',
    'turningUndead',
    'thieving.points',
  ];

  if (MP_TRACKED_CLASSES.includes(characterClass)) {
    attentionKeys.push('combat.mp');
  }

  return {
    nextSheet,
    reviewItems,
    attentionKeys,
  };
};
