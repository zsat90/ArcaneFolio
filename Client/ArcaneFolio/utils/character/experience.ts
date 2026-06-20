type ExperienceDefaults = {
  Current: string;
  'Next XP Target': string;
  'To Reach Level': string;
};

type ExperienceRow = {
  level: number;
  current: number;
  title: string;
};

const FIGHTER_PALADIN_XP = [
  0,
  2000,
  4000,
  8000,
  16000,
  32000,
  64000,
  125000,
  250000,
  500000,
  750000,
  1000000,
  1250000,
  1500000,
  1750000,
  2000000,
  2250000,
  2500000,
  2750000,
  3000000,
];

const FIGHTER_PALADIN_XP_CLASSES = ['Fighter', 'Paladin'];

const RANGER_XP = [
  0,
  2250,
  4500,
  9000,
  18000,
  36000,
  75000,
  150000,
  300000,
  600000,
  900000,
  1200000,
  1500000,
  1800000,
  2100000,
  2400000,
  2700000,
  3000000,
  3300000,
  3600000,
];

const WIZARD_XP = [
  0,
  2500,
  5000,
  10000,
  20000,
  40000,
  60000,
  90000,
  135000,
  250000,
  375000,
  750000,
  1125000,
  1500000,
  1875000,
  2250000,
  2625000,
  3000000,
  3375000,
  3750000,
];

const ROGUE_XP = [
  0,
  1250,
  2500,
  5000,
  10000,
  20000,
  40000,
  70000,
  110000,
  160000,
  220000,
  440000,
  660000,
  880000,
  1100000,
  1320000,
  1540000,
  1760000,
  1980000,
  2200000,
];

const ROGUE_XP_CLASSES = ['Rogue', 'Thief', 'Bard'];

const PRIEST_XP = [
  0,
  1500,
  3000,
  6000,
  13000,
  27500,
  55000,
  110000,
  225000,
  450000,
  675000,
  900000,
  1125000,
  1350000,
  1575000,
  1800000,
  2025000,
  2250000,
  2475000,
  2700000,
];

const DRUID_XP = [
  0,
  2000,
  4000,
  7500,
  12500,
  20000,
  35000,
  60000,
  90000,
  125000,
  200000,
  300000,
  750000,
  1500000,
  3000000,
  3500000,
  500000,
  1000000,
  1500000,
  2000000,
];

const PRIEST_XP_CLASSES = ['Priest', 'Cleric'];

const CAVALIER_ROWS: ExperienceRow[] = [
  { level: 1, current: 0, title: 'Armiger' },
  { level: 2, current: 2501, title: 'Scutifer' },
  { level: 3, current: 5001, title: 'Esquire' },
  { level: 4, current: 10001, title: 'Knight Errant' },
  { level: 5, current: 18501, title: 'Knight Bachelor' },
  { level: 6, current: 37001, title: 'Knight' },
  { level: 7, current: 85001, title: 'Grand Knight' },
  { level: 8, current: 140001, title: 'Banneret' },
  { level: 9, current: 220001, title: 'Chevalier' },
  { level: 10, current: 300001, title: 'Cavalier' },
  { level: 11, current: 600001, title: 'Cavalier, 11th' },
  { level: 12, current: 900001, title: 'Cavalier, 12th' },
];

const BARBARIAN_ROWS: ExperienceRow[] = [
  { level: 1, current: 0, title: 'Barbarian' },
  { level: 2, current: 6001, title: 'Barbarian' },
  { level: 3, current: 12001, title: 'Barbarian' },
  { level: 4, current: 24001, title: 'Barbarian' },
  { level: 5, current: 48001, title: 'Barbarian' },
  { level: 6, current: 80001, title: 'Barbarian' },
  { level: 7, current: 150001, title: 'Barbarian' },
  { level: 8, current: 275001, title: 'Barbarian' },
  { level: 9, current: 500001, title: 'Barbarian' },
  { level: 10, current: 1000001, title: 'Barbarian' },
  { level: 11, current: 1500001, title: 'Barbarian' },
];

const MONK_ROWS: ExperienceRow[] = [
  { level: 1, current: 0, title: 'Novice' },
  { level: 2, current: 2251, title: 'Initiate' },
  { level: 3, current: 4751, title: 'Brother' },
  { level: 4, current: 10001, title: 'Disciple' },
  { level: 5, current: 22501, title: 'Immaculate' },
  { level: 6, current: 47501, title: 'Master' },
  { level: 7, current: 98001, title: 'Superior Master' },
  { level: 8, current: 200001, title: 'Master of Dragons' },
  { level: 9, current: 350001, title: 'Master of the North Wind' },
  { level: 10, current: 500001, title: 'Master of the West Wind' },
  { level: 11, current: 700001, title: 'Master of the South Wind' },
  { level: 12, current: 950001, title: 'Master of the East Wind' },
  { level: 13, current: 1250001, title: 'Master of Winter' },
  { level: 14, current: 1750001, title: 'Master of Autumn' },
  { level: 15, current: 2250001, title: 'Master of Summer' },
  { level: 16, current: 2750001, title: 'Master of Spring' },
  { level: 17, current: 3250001, title: 'Grand Master of Flowers' },
];

const RUNEIST_ROWS: ExperienceRow[] = [
  { level: 1, current: 0, title: 'Scrivener' },
  { level: 2, current: 2251, title: 'Malechet' },
  { level: 3, current: 4501, title: 'Engraver' },
  { level: 4, current: 9001, title: 'Master Scrivener' },
  { level: 5, current: 18001, title: 'Master Engraver' },
  { level: 6, current: 35001, title: 'Atlar' },
  { level: 7, current: 60001, title: 'Atlar' },
  { level: 8, current: 95001, title: 'Symbolist' },
  { level: 9, current: 145001, title: 'Runeist' },
  { level: 10, current: 220001, title: 'Master Symbolist' },
  { level: 11, current: 420001, title: 'Master Runeist' },
  { level: 12, current: 700001, title: 'Grandmaster Runeist' },
];

export const formatExperience = (value: number) => value.toLocaleString('en-US');

export const parseExperience = (value: string) => {
  const trimmed = value.replace(/,/g, '').trim();

  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);

  return Number.isFinite(parsed) ? parsed : null;
};

export const parseLevelTitle = (levelTitle: string) => {
  const match = levelTitle.match(/\d+/);
  return match ? Number(match[0]) : 1;
};

export const LEVEL_OPTIONS = Array.from({ length: 20 }, (_, index) => index + 1);

export const getLevelOptionsForClass = (selectedClass: string) => {
  if (selectedClass === 'Cavalier') {
    return LEVEL_OPTIONS.slice(0, 12);
  }

  if (selectedClass === 'Monk') {
    return LEVEL_OPTIONS.slice(0, 17);
  }

  return LEVEL_OPTIONS;
};

const getRuneistCurrentForLevel = (levelValue: number) => {
  if (levelValue <= 12) {
    return RUNEIST_ROWS[Math.max(levelValue, 1) - 1].current;
  }

  return 950001 + ((levelValue - 13) * 450000);
};

const getRuneistTitle = (levelValue: number) => {
  if (levelValue <= 12) {
    return RUNEIST_ROWS[Math.max(levelValue, 1) - 1].title;
  }

  return 'Grandmaster Runeist';
};

const getCavalierRow = (levelValue: number) => {
  return CAVALIER_ROWS[Math.min(Math.max(levelValue, 1), CAVALIER_ROWS.length) - 1];
};

const getBarbarianCurrentForLevel = (levelValue: number) => {
  if (levelValue <= 11) {
    return BARBARIAN_ROWS[Math.max(levelValue, 1) - 1].current;
  }

  return 2000001 + ((levelValue - 12) * 500000);
};

const getMonkRow = (levelValue: number) => {
  return MONK_ROWS[Math.min(Math.max(levelValue, 1), MONK_ROWS.length) - 1];
};

export const getLevelTitleForClass = (selectedClass: string, levelValue: number) => {
  if (selectedClass === 'Runeist') {
    return `${levelValue} ${getRuneistTitle(levelValue)}`;
  }

  if (selectedClass === 'Monk') {
    return `${Math.min(levelValue, MONK_ROWS.length)} ${getMonkRow(levelValue).title}`;
  }

  if (selectedClass === 'Barbarian') {
    return `${levelValue} Barbarian`;
  }

  if (selectedClass === 'Cavalier') {
    return `${levelValue} ${getCavalierRow(levelValue).title}`;
  }

  return String(levelValue);
};

export const getHitDieForClass = (selectedClass: string) => {
  if (selectedClass === 'Wizard') {
    return 'd4';
  }

  if (selectedClass === 'Rogue' || selectedClass === 'Thief' || selectedClass === 'Monk') {
    return 'd6';
  }

  if (selectedClass === 'Priest' || selectedClass === 'Cleric' || selectedClass === 'Druid' || selectedClass === 'Bard') {
    return 'd8';
  }

  if (selectedClass === 'Fighter' || selectedClass === 'Paladin') {
    return 'd10';
  }

  if (selectedClass === 'Cavalier' || selectedClass === 'Barbarian' || selectedClass === 'Ranger') {
    return 'd12';
  }

  if (selectedClass === 'Runeist') {
    return 'd8';
  }

  return '';
};

const getExperienceRange = (selectedClass: string, levelValue: number) => {
  if (selectedClass === 'Runeist') {
    const current = getRuneistCurrentForLevel(levelValue);
    const nextTarget = getRuneistCurrentForLevel(levelValue + 1);
    return { current, nextTarget };
  }

  if (selectedClass === 'Cavalier') {
    const boundedLevel = Math.min(Math.max(levelValue, 1), CAVALIER_ROWS.length);
    const current = CAVALIER_ROWS[boundedLevel - 1].current;
    const nextTarget = CAVALIER_ROWS[boundedLevel]?.current;
    return { current, nextTarget };
  }

  if (selectedClass === 'Barbarian') {
    const current = getBarbarianCurrentForLevel(levelValue);
    const nextTarget = getBarbarianCurrentForLevel(levelValue + 1);
    return { current, nextTarget };
  }

  if (selectedClass === 'Monk') {
    const boundedLevel = Math.min(Math.max(levelValue, 1), MONK_ROWS.length);
    const current = MONK_ROWS[boundedLevel - 1].current;
    const nextTarget = MONK_ROWS[boundedLevel]?.current;
    return { current, nextTarget };
  }

  if (FIGHTER_PALADIN_XP_CLASSES.includes(selectedClass)) {
    const boundedLevel = Math.min(Math.max(levelValue, 1), FIGHTER_PALADIN_XP.length);
    const current = FIGHTER_PALADIN_XP[boundedLevel - 1];
    const nextTarget = FIGHTER_PALADIN_XP[boundedLevel];
    return { current, nextTarget };
  }

  if (selectedClass === 'Ranger') {
    const boundedLevel = Math.min(Math.max(levelValue, 1), RANGER_XP.length);
    const current = RANGER_XP[boundedLevel - 1];
    const nextTarget = RANGER_XP[boundedLevel];
    return { current, nextTarget };
  }

  if (selectedClass === 'Wizard') {
    const boundedLevel = Math.min(Math.max(levelValue, 1), WIZARD_XP.length);
    const current = WIZARD_XP[boundedLevel - 1];
    const nextTarget = WIZARD_XP[boundedLevel];
    return { current, nextTarget };
  }

  if (ROGUE_XP_CLASSES.includes(selectedClass)) {
    const boundedLevel = Math.min(Math.max(levelValue, 1), ROGUE_XP.length);
    const current = ROGUE_XP[boundedLevel - 1];
    const nextTarget = ROGUE_XP[boundedLevel];
    return { current, nextTarget };
  }

  if (PRIEST_XP_CLASSES.includes(selectedClass)) {
    const boundedLevel = Math.min(Math.max(levelValue, 1), PRIEST_XP.length);
    const current = PRIEST_XP[boundedLevel - 1];
    const nextTarget = PRIEST_XP[boundedLevel];
    return { current, nextTarget };
  }

  if (selectedClass === 'Druid') {
    const boundedLevel = Math.min(Math.max(levelValue, 1), DRUID_XP.length);
    const current = DRUID_XP[boundedLevel - 1];
    const nextTarget = DRUID_XP[boundedLevel];
    return { current, nextTarget };
  }

  return null;
};

export const getExperienceDefaults = (
  selectedClass: string,
  levelValue: number,
  currentExperience?: string,
): ExperienceDefaults | { 'Next XP Target': string; 'To Reach Level': string } => {
  const range = getExperienceRange(selectedClass, levelValue);

  if (!range) {
    return {
      'Next XP Target': '',
      'To Reach Level': '',
    };
  }

  if (range.nextTarget === undefined) {
    return {
      Current: formatExperience(range.current),
      'Next XP Target': 'Max level',
      'To Reach Level': '',
    };
  }

  const current = currentExperience?.trim() ? parseExperience(currentExperience) : range.current;
  const realCurrent = current ?? range.current;

  return {
    Current: formatExperience(realCurrent),
    'Next XP Target': formatExperience(range.nextTarget),
    'To Reach Level': formatExperience(Math.max(range.nextTarget - realCurrent, 0)),
  };
};
