import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router';
import EquipmentListModal from '../../components/Equipment/EquipmentListModal';
import ImageBackgroundWrapper from '../../components/imageBackground';
import Buttons from '../../components/Login/Button';
import { getFirebaseAuth, ensureAuthTokenReady } from '../../utils/auth/authService';
import { addCharacter, syncMagicPointsFromSheet } from '../../utils/character/characterState';
import {
  calculateSheetMagicPoints,
  CharacterSheetState,
  createEmptySheet,
  DEFAULT_BASE_THACO,
  NonWeaponProficiencyRow,
  ProficiencyRow,
  SavingThrowRow,
  setCharacterSheet,
  ThievingSkillRow,
  WeaponRow,
} from '../../utils/character/characterSheetState';
import {
  getExperienceDefaults as getClassExperienceDefaults,
  getHitDieForClass,
  getLevelOptionsForClass,
  getLevelTitleForClass,
} from '../../utils/character/experience';
import { COIN_FIELDS, deductEquipmentCost } from '../../utils/character/coins';
import EquipmentItemRow from '../../components/CharacterSheet/EquipmentItemRow';
import RaceSelectOptions from '../../components/CharacterSheet/RaceSelectOptions';
import { getEquipmentLinesForCategory, withSelectedEquipmentOption } from '../../utils/character/equipment';
import { removeLineFromBucket, syncSheetAfterEquipmentRemoval } from '../../utils/character/equipmentRemoval';
import { withCalculatedRealArmorClass } from '../../utils/character/armorClass';
import { parseHitPointValue, withLevelAwareTotalHitPoints } from '../../utils/character/hitPoints';
import { applySecondarySkillToSheet, SECONDARY_SKILLS } from '../../utils/character/secondarySkills';
import {
  applyDexterityAdjustmentsToSheet,
  getDexteritySavingThrowBonus,
  parseAbilityScore,
} from '../../utils/character/abilityScores';
import { getClassSpecialAbilitiesText, getClassXpBonusFieldValue, getRaceSelectionForClass, hasClassRules, hasClassXpBonusRule, isRaceAllowedForClass } from '../../utils/character/classRules';
import {
  WEAPON_CHART_CENTERED_FIELDS,
  WEAPON_DERIVED_READONLY_FIELDS,
  applyWeaponSelectionToRow,
  enrichAllWeaponRows,
  getSoulSwordGlowColor,
  getWeaponThacoChartTarget,
  getWeaponEquipmentLines,
  getWeaponFieldDisplayValue,
  getWeaponRowContext,
  isSoulSwordLine,
  SOUL_SWORD_COLORS,
  updateWeaponRowField,
} from '../../utils/character/weapons';
import {
  getWeaponDisplayLabel,
  getWeaponProficiencySlotOptions,
} from '../../utils/character/weaponProficiencies';
import {
  createSavingThrowHandlers,
  SAVING_THROW_CHECK_FIELDS,
} from '../../utils/character/savingThrows';

const WEAPON_FIELDS: Array<keyof WeaponRow> = [
  'weapon',
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

const CHARACTER_CLASSES = [
  'Wizard',
  'Runeist',
  'Bard',
  'Priest',
  'Druid',
  'Rogue',
  'Assassin',
  'Fighter',
  'Archer',
  'Barbarian',
  'Cavalier',
  'Monk',
  'Ranger',
  'Paladin',
  'Harbinger',
  'Vanar Knight',
];
const SHEET_PAGES = ['Page 1', 'Page 2', 'Page 3', 'Page 4', 'Page 5'];
const SOCIAL_CLASS_OPTIONS = [
  'Lower Lower Class',
  'Middle Lower Class',
  'Upper Lower Class',
  'Lower Middle Class',
  'Middle Middle Class',
  'Upper Middle Class',
  'Lower Upper Class',
  'Middle Upper Class',
  'Upper Upper Class',
];
const THACO_ARMOR_CLASSES = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6, -7, -8, -9, -10];
const RACIAL_ADJUSTMENTS: Record<string, string> = {
  Human: 'No racial ability adjustment.',
  Dwarf: '+1 Constitution; -1 Charisma',
  Elf: '+1 Dexterity; -1 Constitution',
  'Half-elf': 'No racial ability adjustment.',
  Gnome: '+1 Intelligence; -1 Wisdom',
  Halfling: '+1 Dexterity; -1 Strength',
};
const RACIAL_ABILITIES: Record<string, string> = {
  Human: 'Ability Adjustment: No racial ability adjustment.',
  Dwarf: [
    'Ability Adjustment: +1 Constitution; -1 Charisma',
    '',
    'In melee, dwarves add +1 to attack rolls against orcs, half-orcs, goblins, and hobgoblins.',
    'When ogres, trolls, ogre magi, giants, or titans attack dwarves, those monsters subtract 4 from their attack rolls because of the dwarves\' small size and combat ability against much larger creatures.',
    '',
    'Dwarven infravision enables them to see up to 60 feet in the dark.',
    '',
    'Dwarves are miners of great skill. While underground, they can detect the following information when within 10 feet of the phenomenon, and can determine approximate depth below the surface at any time:',
    'Detect grade or slope in passage: 1-5 on 1d6',
    'Detect new tunnel/passage construction: 1-5 on 1d6',
    'Detect sliding/shifting walls or rooms: 1-4 on 1d6',
    'Detect stonework traps, pits, and deadfalls: 1-3 on 1d6',
    'Determine approximate depth underground: 1-3 on 1d6',
  ].join('\n'),
  Elf: [
    'Ability Adjustment: +1 Dexterity; -1 Constitution',
    '',
    'When employing a bow of any sort other than a crossbow, or when using a short or long sword, elves gain a +1 bonus to their attack rolls.',
    'Elven infravision enables them to see up to 60 feet in darkness.',
    'Secret doors: 1-2 on 1d6.',
  ].join('\n'),
  'Half-elf': [
    'Ability Adjustment: No racial ability adjustment.',
    '',
    'Half-elven infravision enables them to see up to 60 feet in darkness.',
    'Secret doors: 1-2 on 1d6.',
  ].join('\n'),
  Gnome: [
    'Ability Adjustment: +1 Intelligence; -1 Wisdom',
    '',
    'In melee, gnome characters add +1 to attack rolls against kobolds or goblins.',
    'When gnolls, bugbears, ogres, trolls, ogre magi, giants, or titans attack gnomes, those monsters subtract 4 from their attack rolls because of the gnomes\' small size and combat skills against much larger creatures.',
    '',
    'Gnomish infravision enables them to see up to 60 feet in the dark.',
    '',
    'Being tunnelers of exceptional merit, gnomes can detect the following within 10 feet. They can determine approximate depth or direction underground at any time. They must stop and concentrate for one round to use these abilities:',
    'Detect grade or slope in passage: 1-5 on 1d6',
    'Detect unsafe walls, ceiling, and floors: 1-7 on 1d10',
    'Determine approximate depth underground: 1-4 on 1d6',
    'Determine approximate direction underground: 1-3 on 1d6',
  ].join('\n'),
  Halfling: [
    'Ability Adjustment: +1 Dexterity; -1 Strength',
    '',
    'Halflings have a natural talent with slings and thrown weapons. All halflings gain a +1 bonus to their attack rolls when using thrown weapons and slings.',
  ].join('\n'),
};

const parseLevelTitle = (levelTitle: string) => {
  const match = levelTitle.match(/\d+/);
  return match ? Number(match[0]) : 1;
};

const signed = (value: number) => value > 0 ? `+${value}` : String(value);

const parseExceptionalStrength = (score: string) => {
  const value = score.trim().toLowerCase();
  const match = value.match(/^18\/(\d{1,2}|00)$/);

  if (!match) {
    return null;
  }

  return match[1] === '00' ? 100 : Number(match[1]);
};

const getStrengthAutofill = (score: string) => {
  const exceptional = parseExceptionalStrength(score);

  if (exceptional !== null) {
    if (exceptional <= 50) return { hit: '+1', dmg: '+3', wgt: '135', press: '280', doors: '12', bars: '20%' };
    if (exceptional <= 75) return { hit: '+2', dmg: '+3', wgt: '160', press: '305', doors: '13', bars: '25%' };
    if (exceptional <= 90) return { hit: '+2', dmg: '+4', wgt: '185', press: '330', doors: '14', bars: '30%' };
    if (exceptional <= 99) return { hit: '+2', dmg: '+5', wgt: '235', press: '380', doors: '15(3)', bars: '35%' };
    return { hit: '+3', dmg: '+6', wgt: '335', press: '480', doors: '16(6)', bars: '40%' };
  }

  const value = parseAbilityScore(score);

  if (value === null) return null;
  if (value <= 1) return { hit: '-5', dmg: '-4', wgt: '1', press: '3', doors: '1', bars: '0%' };
  if (value === 2) return { hit: '-3', dmg: '-2', wgt: '1', press: '5', doors: '1', bars: '0%' };
  if (value === 3) return { hit: '-3', dmg: '-1', wgt: '5', press: '10', doors: '2', bars: '0%' };
  if (value <= 5) return { hit: '-2', dmg: '-1', wgt: '10', press: '25', doors: '3', bars: '0%' };
  if (value <= 7) return { hit: '-1', dmg: 'None', wgt: '20', press: '55', doors: '4', bars: '0%' };
  if (value <= 9) return { hit: 'Normal', dmg: 'None', wgt: '35', press: '90', doors: '5', bars: '1%' };
  if (value <= 11) return { hit: 'Normal', dmg: 'None', wgt: '40', press: '115', doors: '6', bars: '2%' };
  if (value <= 13) return { hit: 'Normal', dmg: 'None', wgt: '45', press: '140', doors: '7', bars: '4%' };
  if (value <= 15) return { hit: 'Normal', dmg: 'None', wgt: '55', press: '170', doors: '8', bars: '7%' };
  if (value === 16) return { hit: 'Normal', dmg: '+1', wgt: '70', press: '195', doors: '9', bars: '10%' };
  if (value === 17) return { hit: '+1', dmg: '+1', wgt: '85', press: '220', doors: '10', bars: '13%' };
  if (value === 18) return { hit: '+1', dmg: '+2', wgt: '110', press: '255', doors: '11', bars: '16%' };
  if (value === 19) return { hit: '+3', dmg: '+7', wgt: '485', press: '640', doors: '16(8)', bars: '50%' };
  if (value === 20) return { hit: '+3', dmg: '+8', wgt: '535', press: '700', doors: '17(10)', bars: '60%' };
  if (value === 21) return { hit: '+4', dmg: '+9', wgt: '635', press: '810', doors: '17(12)', bars: '70%' };
  if (value === 22) return { hit: '+4', dmg: '+10', wgt: '785', press: '970', doors: '18(14)', bars: '80%' };
  if (value === 23) return { hit: '+5', dmg: '+11', wgt: '935', press: '1,130', doors: '18(16)', bars: '90%' };
  if (value === 24) return { hit: '+6', dmg: '+12', wgt: '1,235', press: '1,440', doors: '19(17)', bars: '95%' };
  return { hit: '+7', dmg: '+14', wgt: '1,535', press: '1,750', doors: '19(18)', bars: '99%' };
};

const getConstitutionAutofill = (score: string) => {
  const value = parseAbilityScore(score);
  if (value === null) return null;
  const hp = value <= 1 ? '-3' : value <= 3 ? '-2' : value <= 6 ? '-1' : value <= 14 ? '0' : value === 15 ? '+1' : value === 16 ? '+2' : value === 17 ? '+2 (+3)*' : value === 18 ? '+2 (+4)*' : value === 19 ? '+2 (+5)*' : value === 20 ? '+2 (+5)**' : value <= 22 ? '+2 (+6)***' : value <= 24 ? '+2 (+7)****' : '+2 (+7)';
  const systemShock = value <= 1 ? '25%' : value === 2 ? '30%' : value === 3 ? '35%' : value === 4 ? '40%' : value === 5 ? '45%' : value === 6 ? '50%' : value === 7 ? '55%' : value === 8 ? '60%' : value === 9 ? '65%' : value === 10 ? '70%' : value === 11 ? '75%' : value === 12 ? '80%' : value === 13 ? '85%' : value === 14 ? '88%' : value === 15 ? '90%' : value === 16 ? '95%' : value === 17 ? '97%' : value <= 24 ? '99%' : '100%';
  const resurrection = value <= 1 ? '30%' : value === 2 ? '35%' : value === 3 ? '40%' : value === 4 ? '45%' : value === 5 ? '50%' : value === 6 ? '55%' : value === 7 ? '60%' : value === 8 ? '65%' : value === 9 ? '70%' : value === 10 ? '75%' : value === 11 ? '80%' : value === 12 ? '85%' : value === 13 ? '90%' : value === 14 ? '92%' : value === 15 ? '94%' : value === 16 ? '96%' : value === 17 ? '98%' : '100%';
  const poison = value <= 1 ? '-2' : value === 2 ? '-1' : value <= 19 ? '0' : value <= 20 ? '+1' : value <= 22 ? '+2' : value <= 24 ? '+3' : '+4';
  const regen = value <= 19 ? 'Nil' : value === 20 ? '1/6 turns' : value === 21 ? '1/5 turns' : value === 22 ? '1/4 turns' : value === 23 ? '1/3 turns' : value === 24 ? '1/2 turns' : '1/1 turn';
  return { hp, systemShock, resurrection, poison, regen };
};

const getIntelligenceAutofill = (score: string) => {
  const value = parseAbilityScore(score);
  if (value === null) return null;
  const languages = value <= 1 ? '0*' : value <= 8 ? '1' : value <= 11 ? '2' : value <= 13 ? '3' : value <= 15 ? '4' : value === 16 ? '5' : value === 17 ? '6' : value === 18 ? '7' : value === 19 ? '8' : value === 20 ? '9' : value === 21 ? '10' : value === 22 ? '11' : value === 23 ? '12' : value === 24 ? '15' : '20';
  const spellLevel = value <= 8 ? '-' : value === 9 ? '4th' : value <= 11 ? '5th' : value <= 13 ? '6th' : value <= 15 ? '7th' : value <= 17 ? '8th' : '9th';
  const learnSpell = value <= 8 ? '-' : value === 9 ? '35%' : value === 10 ? '40%' : value === 11 ? '45%' : value === 12 ? '50%' : value === 13 ? '55%' : value === 14 ? '60%' : value === 15 ? '65%' : value === 16 ? '70%' : value === 17 ? '75%' : value === 18 ? '85%' : value === 19 ? '95%' : `${Math.min(value + 76, 100)}%`;
  const spellsPerLevel = value <= 8 ? '-' : value === 9 ? '6' : value <= 12 ? '7' : value <= 14 ? '9' : value <= 16 ? '11' : value === 17 ? '14' : value === 18 ? '18' : 'All';
  const immunity = value < 19 ? '-' : `${value - 18}${value === 19 ? 'st' : value === 20 ? 'nd' : value === 21 ? 'rd' : 'th'}-level`;
  return { languages, spellLevel, learnSpell, spellsPerLevel, immunity };
};

const getWisdomAutofill = (score: string) => {
  const value = parseAbilityScore(score);
  if (value === null) return null;
  const defense = value <= 1 ? '-6' : value === 2 ? '-4' : value === 3 ? '-3' : value === 4 ? '-2' : value <= 7 ? '-1' : value <= 14 ? '0' : value === 15 ? '+1' : value === 16 ? '+2' : value === 17 ? '+3' : '+4';
  const bonus = value <= 8 ? '-' : value <= 12 ? '0' : value <= 14 ? '1st' : value <= 16 ? '2nd' : value === 17 ? '3rd' : value === 18 ? '4th' : value === 19 ? '1st, 3rd' : value === 20 ? '2nd, 4th' : value === 21 ? '3rd, 5th' : value === 22 ? '4th, 5th' : value === 23 ? '1st, 6th' : value === 24 ? '5th, 6th' : '6th, 7th';
  const fail = value <= 1 ? '80%' : value === 2 ? '60%' : value === 3 ? '50%' : value === 4 ? '45%' : value === 5 ? '40%' : value === 6 ? '35%' : value === 7 ? '30%' : value === 8 ? '25%' : value === 9 ? '20%' : value === 10 ? '15%' : value === 11 ? '10%' : value === 12 ? '5%' : '0%';
  const immunity = value <= 18 ? '-' : value === 19 ? 'cause fear, charm person, command, friends, hypnotism' : value === 20 ? 'forget, hold person, ray of enfeeblement, scare' : value === 21 ? 'fear' : value === 22 ? 'charm monster, confusion, emotion, fumble, suggestion' : value === 23 ? 'chaos, feeblemind, hold monster, magic jar, quest' : value === 24 ? 'geas, mass suggestion, rod of rulership' : 'antipathy/sympathy, death spell, mass charm';
  return { defense, bonus, fail, immunity };
};

const getCharismaAutofill = (score: string) => {
  const value = parseAbilityScore(score);
  if (value === null) return null;
  const henchmen = value <= 1 ? '0' : value <= 4 ? '1' : value <= 6 ? '2' : value <= 8 ? '3' : value <= 11 ? '4' : value <= 13 ? '5' : value === 14 ? '6' : value === 15 ? '7' : value === 16 ? '8' : value === 17 ? '10' : value === 18 ? '15' : String(Math.min((value - 17) * 5 + 15, 50));
  const loyalty = value <= 1 ? '-8' : value === 2 ? '-7' : value === 3 ? '-6' : value === 4 ? '-5' : value === 5 ? '-4' : value === 6 ? '-3' : value === 7 ? '-2' : value === 8 ? '-1' : value <= 13 ? '0' : value === 14 ? '+1' : value === 15 ? '+3' : value === 16 ? '+4' : value === 17 ? '+6' : value === 18 ? '+8' : value === 19 ? '+10' : value === 20 ? '+12' : value === 21 ? '+14' : value === 22 ? '+16' : value === 23 ? '+18' : '+20';
  const reaction = value <= 1 ? '-7' : value === 2 ? '-6' : value === 3 ? '-5' : value === 4 ? '-4' : value === 5 ? '-3' : value === 6 ? '-2' : value === 7 ? '-1' : value <= 12 ? '0' : signed(value - 12 + (value >= 16 ? 1 : 0));
  return { henchmen, loyalty, reaction };
};

const ABILITY_DERIVED_FIELDS: Record<string, string[]> = {
  Strength: ['Strength Hit', 'Strength Dmg', 'Strength Wgt', 'Strength Press', 'Strength Doors', 'Strength Bars/Gates'],
  Dexterity: ['Dexterity Reac Adj', 'Dexterity Msl Att Adj', 'Dexterity Def Adj (AC)', 'Dexterity Parry'],
  Constitution: ['Constitution HP Adj', 'Constitution Sys Shk', 'Constitution Res Sur', 'Constitution Poison Save', 'Constitution Regen'],
  Intelligence: ['Intelligence # of Lang', 'Intelligence Sp Lvl', 'Intelligence Learn Spl', 'Intelligence Sp/Lvl', 'Intelligence Immunity'],
  Wisdom: ['Wisdom Magic Defense', 'Wisdom Bonus Spells', 'Wisdom % Fail', 'Wisdom Immunity'],
  Charisma: ['Charisma Max # Henchman', 'Charisma Loyalty Base', 'Charisma Reaction Adj'],
};
const WARRIOR_CLASSES = ['Fighter', 'Archer', 'Ranger', 'Paladin', 'Barbarian', 'Cavalier', 'Vanar Knight'];
const PRIEST_CLASSES = ['Priest'];
const ROGUE_CLASSES = ['Rogue', 'Runeist', 'Monk', 'Harbinger', 'Bard', 'Assassin'];
const WIZARD_CLASSES = ['Wizard', 'Druid'];
const THACO_BY_GROUP: Record<string, number[]> = {
  Priest: [20, 20, 20, 18, 18, 18, 16, 16, 16, 14, 14, 14, 12, 12, 12, 10, 10, 10, 8, 8],
  Rogue: [20, 20, 19, 19, 18, 18, 17, 17, 16, 16, 15, 15, 14, 14, 13, 13, 12, 12, 11, 11],
  Warrior: [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
  Wizard: [20, 20, 20, 19, 19, 19, 18, 18, 18, 17, 17, 17, 16, 16, 16, 15, 15, 15, 14, 14],
};
const numericModifier = (value: string) => {
  const match = value.match(/[+-]?\d+/);
  return match ? Number(match[0]) : null;
};

const getClassHitPointAdjustment = (hpAdjustment: string, selectedClass: string) => {
  const parenthetical = hpAdjustment.match(/\(([+-]?\d+)\)/);
  const base = hpAdjustment.match(/^[+-]?\d+/);

  if (WARRIOR_CLASSES.includes(selectedClass) && parenthetical) {
    return parenthetical[1];
  }

  return base ? base[0] : hpAdjustment;
};

const getClassThacoGroup = (selectedClass: string) => {
  if (WARRIOR_CLASSES.includes(selectedClass)) return 'Warrior';
  if (PRIEST_CLASSES.includes(selectedClass)) return 'Priest';
  if (ROGUE_CLASSES.includes(selectedClass)) return 'Rogue';
  if (WIZARD_CLASSES.includes(selectedClass)) return 'Wizard';
  return '';
};

const getBaseThaco = (selectedClass: string, levelTitle: string) => {
  if (!selectedClass.trim() || !levelTitle.trim()) {
    return DEFAULT_BASE_THACO;
  }

  const group = getClassThacoGroup(selectedClass);
  const table = THACO_BY_GROUP[group];

  if (!table) {
    return DEFAULT_BASE_THACO;
  }

  const levelValue = parseLevelTitle(levelTitle);
  const boundedLevel = Math.min(Math.max(levelValue, 1), 20);
  return String(table[boundedLevel - 1]);
};

const getSpecialistAttacks = (selectedClass: string, levelValue: number) => {
  if (!WARRIOR_CLASSES.includes(selectedClass)) {
    return '';
  }

  return getSpecialistAttackOptions(levelValue)[0];
};

const getSpecialistAttackOptions = (levelValue: number) => {
  if (levelValue >= 13) {
    return ['Melee 5/2', 'Light X-bow 2/1', 'Heavy X-bow 3/2', 'Thrown Dagger 5/1', 'Thrown Dart 6/1', 'Other Missiles 5/2'];
  }

  if (levelValue >= 7) {
    return ['Melee 2/1', 'Light X-bow 3/2', 'Heavy X-bow 1/1', 'Thrown Dagger 4/1', 'Thrown Dart 5/1', 'Other Missiles 2/1'];
  }

  return ['Melee 3/2', 'Light X-bow 1/1', 'Heavy X-bow 1/2', 'Thrown Dagger 3/1', 'Thrown Dart 4/1', 'Other Missiles 3/2'];
};

const getCombatDefaults = (selectedClass: string, levelTitle: string) => ({
  'Base class Att/Rnd': '1/1',
  SP: getSpecialistAttacks(selectedClass, parseLevelTitle(levelTitle)),
  'Base THACO': getBaseThaco(selectedClass, levelTitle),
});

const formatExperience = (value: number) => value.toLocaleString('en-US');

const parseExperience = (value: string) => {
  const parsed = Number(value.replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : null;
};

const createWeaponRow = (index: number): WeaponRow => ({
  id: `weapon-${Date.now()}-${index}`,
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

const createWeaponProficiencyRow = (index: number): ProficiencyRow => ({
  id: `weapon-proficiency-${Date.now()}-${index}`,
  name: '',
  slots: '',
});

const createNonWeaponProficiencyRow = (index: number): NonWeaponProficiencyRow => ({
  id: `non-weapon-proficiency-${Date.now()}-${index}`,
  name: '',
  slots: '',
  attribute: '',
  attributeMod: '',
});

const TRACKING_MODIFIER_LABELS = [
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
const THIEVING_DEX_BONUS_CLASSES = ['Rogue', 'Bard'] as const;
const classUsesThievingDexBonus = (selectedClass: string) => (
  THIEVING_DEX_BONUS_CLASSES.includes(selectedClass as typeof THIEVING_DEX_BONUS_CLASSES[number])
);


const SOUL_SWORD_COLOR_OPTIONS = SOUL_SWORD_COLORS.map((color) => (
  color.charAt(0).toUpperCase() + color.slice(1)
));
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
  ['Litch', 'Lich'],
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
const THIEVING_SKILL_COLUMNS: Array<[keyof ThievingSkillRow, string]> = [
  ['skill', 'Skill'],
  ['base', 'Base'],
  ['halfElf', 'H/Elf'],
  ['elf', 'Elf'],
  ['dwarf', 'Dwarf'],
  ['gnome', 'Gnome'],
  ['halfling', 'Halfling'],
  ['dex', 'Dex'],
  ['thief', 'Thief'],
  ['armor', 'Armor'],
  ['realPercent', 'Real %'],
];
const THIEVING_POINT_CLASSES = ['Rogue', 'Bard'];
const THIEVING_DESCRIPTIONS = [
  'Thief/Rogue: begins with 90 points to allocate at character creation, then gains 30 additional points each level after 1st.',
  'Bard: begins with 60 points to allocate at character creation, then gains 30 additional points each level after 1st.',
];
const SAVING_THROW_RULES = [
  'Constitution Chart: 4-6 +1, 7-10 +2, 11-13 +3, 14-17 +4, 18-19 +5.',
  'Dwarves get bonuses on Rods, Staves, Wands, and Poison saves. See Constitution Chart above.',
  'Elves are 90% resistant to Sleep and Charm. If the percentage roll is missed, roll the regular save.',
  'Gnomes receive bonuses on Rods, Staves, Wands, and all spells. See Constitution Chart above.',
  'Halflings get bonuses on Rods, Staves, Wands, Poisons, and all spells. See Constitution Chart above.',
  'Strength: hit adjustment applies to save vs Web.',
  'Dexterity: defense adjustment applies to Attack Spells, Rods, Staves, Wands, and Breath.',
  'Constitution: poison save applies to all Poison saves.',
  'Intelligence: spell immunity applies to Illusions.',
  'Wisdom: magical defense adjustment applies to Mind Spells, Charm, Fear, Illusions, and Sleep.',
  'Charisma: reaction adjustment applies to Charm.',
  'Roll equal to or greater than Real. Once Saving Throw is made 4 times, the Real goes down by one.',
];
const STARTING_EQUIPMENT = [
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

const getTurningColumn = (levelValue: number) => {
  if (levelValue <= 9) return levelValue - 1;
  if (levelValue <= 11) return 9;
  if (levelValue <= 13) return 10;
  return 11;
};

const getEffectiveTurningLevel = (selectedClass: string, levelValue: number) => {
  if (selectedClass === 'Priest') return Math.max(levelValue, 1);
  if (selectedClass === 'Paladin') return Math.max(levelValue - 2, 0);
  return 0;
};

const getTurningUndeadDefaults = (selectedClass: string, levelValue: number) => {
  const effectiveLevel = getEffectiveTurningLevel(selectedClass, levelValue);

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

const getThievingSkillPool = (selectedClass: string, levelValue: number) => {
  if (selectedClass === 'Rogue') {
    return 90 + (Math.max(levelValue, 1) - 1) * 30;
  }

  if (selectedClass === 'Bard') {
    return 60 + (Math.max(levelValue, 1) - 1) * 30;
  }

  return null;
};

const parsePointSpend = (value: string) => {
  const parsed = Number(value.replace(/[^0-9-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const getThievingPointsToSpend = (selectedClass: string, levelValue: number, thievingSkills: ThievingSkillRow[]) => {
  const pool = getThievingSkillPool(selectedClass, levelValue);

  if (pool === null) {
    return '';
  }

  const spent = thievingSkills.reduce((total, row) => total + parsePointSpend(row.thief), 0);
  return String(pool - spent);
};

const parsePercentValue = (value: string) => {
  const parsed = Number(value.replace(/[^0-9-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatPercentValue = (value: number) => value === 0 ? '' : `${signed(value)}%`;

const getRaceThievingField = (race: string): keyof ThievingSkillRow | null => {
  if (race === 'Half-elf') return 'halfElf';
  if (race === 'Elf') return 'elf';
  if (race === 'Dwarf') return 'dwarf';
  if (race === 'Gnome') return 'gnome';
  if (race === 'Halfling') return 'halfling';
  return null;
};

const getDexterityThievingAdjustment = (skill: string, dexterity: string) => {
  const dex = parseAbilityScore(dexterity);

  if (dex === null) {
    return '';
  }

  const normalizedSkill = skill.toLowerCase();
  let column: 'pickPockets' | 'openLocks' | 'findRemoveTraps' | 'moveSilently' | 'hideShadows' | null = null;

  if (normalizedSkill.includes('pick pockets')) column = 'pickPockets';
  if (normalizedSkill.includes('open locks') || normalizedSkill.includes('set locks')) column = 'openLocks';
  if (normalizedSkill.includes('find traps') || normalizedSkill.includes('remove traps') || normalizedSkill.includes('set traps')) column = 'findRemoveTraps';
  if (normalizedSkill.includes('move silently')) column = 'moveSilently';
  if (normalizedSkill.includes('hide in shadows')) column = 'hideShadows';

  if (!column) {
    return '';
  }

  const rows: Record<number, Record<NonNullable<typeof column>, number>> = {
    9: { pickPockets: -15, openLocks: -10, findRemoveTraps: -10, moveSilently: -20, hideShadows: -10 },
    10: { pickPockets: -10, openLocks: -5, findRemoveTraps: -10, moveSilently: -15, hideShadows: -5 },
    11: { pickPockets: -5, openLocks: 0, findRemoveTraps: -5, moveSilently: -10, hideShadows: 0 },
    12: { pickPockets: 0, openLocks: 0, findRemoveTraps: 0, moveSilently: -5, hideShadows: 0 },
    13: { pickPockets: 0, openLocks: 0, findRemoveTraps: 0, moveSilently: 0, hideShadows: 0 },
    14: { pickPockets: 0, openLocks: 0, findRemoveTraps: 0, moveSilently: 0, hideShadows: 0 },
    15: { pickPockets: 0, openLocks: 0, findRemoveTraps: 0, moveSilently: 0, hideShadows: 0 },
    16: { pickPockets: 0, openLocks: 5, findRemoveTraps: 0, moveSilently: 0, hideShadows: 0 },
    17: { pickPockets: 5, openLocks: 10, findRemoveTraps: 0, moveSilently: 5, hideShadows: 5 },
    18: { pickPockets: 10, openLocks: 15, findRemoveTraps: 5, moveSilently: 10, hideShadows: 10 },
    19: { pickPockets: 15, openLocks: 20, findRemoveTraps: 10, moveSilently: 15, hideShadows: 15 },
  };
  const boundedDex = Math.min(Math.max(dex, 9), 19);
  return formatPercentValue(rows[boundedDex][column]);
};

const calculateThievingRealPercent = (row: ThievingSkillRow, race: string) => {
  const raceField = getRaceThievingField(race);
  const total = parsePercentValue(row.base)
    + (raceField ? parsePercentValue(row[raceField]) : 0)
    + parsePercentValue(row.dex)
    + parsePercentValue(row.thief)
    + parsePercentValue(row.armor);

  return `${Math.min(Math.max(total, 0), 95)}%`;
};

const recalculateThievingSkills = (
  rows: ThievingSkillRow[],
  race: string,
  dexterity: string,
  selectedClass: string,
) => (
  rows.map((row) => {
    const withDex = {
      ...row,
      dex: classUsesThievingDexBonus(selectedClass)
        ? getDexterityThievingAdjustment(row.skill, dexterity)
        : '',
    };

    return {
      ...withDex,
      realPercent: calculateThievingRealPercent(withDex, race),
    };
  })
);

const getConstitutionRaceSaveBonus = (constitution: string) => {
  const value = parseAbilityScore(constitution);

  if (value === null) return 0;
  if (value <= 3) return 0;
  if (value <= 6) return 1;
  if (value <= 10) return 2;
  if (value <= 13) return 3;
  if (value <= 17) return 4;
  return 5;
};

const savingThrowIncludes = (name: string, terms: string[]) => {
  const normalizedName = name.toLowerCase();
  return terms.some((term) => normalizedName.includes(term));
};

const getSavingThrowBonus = (rowName: string, currentSheet: CharacterSheetState, selectedClass: string) => {
  const name = rowName.toLowerCase();
  let bonus = 0;
  const constitutionRaceBonus = getConstitutionRaceSaveBonus(currentSheet.abilityDetails.Constitution);

  if (currentSheet.race === 'Dwarf' && (savingThrowIncludes(name, ['poison']) || savingThrowIncludes(name, ['rods', 'staves', 'wands']))) {
    bonus += constitutionRaceBonus;
  }

  if (currentSheet.race === 'Gnome' && (savingThrowIncludes(name, ['rods', 'staves', 'wands']) || savingThrowIncludes(name, ['spell', 'illusion', 'charm', 'sleep', 'fear', 'hold person', 'web', 'polymorph']))) {
    bonus += constitutionRaceBonus;
  }

  if (currentSheet.race === 'Halfling' && (savingThrowIncludes(name, ['poison']) || savingThrowIncludes(name, ['rods', 'staves', 'wands']) || savingThrowIncludes(name, ['spell', 'illusion', 'charm', 'sleep', 'fear', 'hold person', 'web', 'polymorph']))) {
    bonus += constitutionRaceBonus;
  }

  if (savingThrowIncludes(name, ['poison'])) {
    bonus += numericModifier(currentSheet.abilityDetails['Constitution Poison Save']) ?? 0;
  }

  if (savingThrowIncludes(name, ['web'])) {
    bonus += numericModifier(currentSheet.abilityDetails['Strength Hit']) ?? 0;
  }

  if (savingThrowIncludes(name, ['attack spells', 'rods', 'staves', 'wands', 'breath'])) {
    bonus += getDexteritySavingThrowBonus(
      selectedClass,
      currentSheet.abilityDetails['Dexterity Def Adj (AC)'],
    );
  }

  if (savingThrowIncludes(name, ['mind spells', 'charm', 'fear', 'illusion', 'sleep'])) {
    bonus += numericModifier(currentSheet.abilityDetails['Wisdom Magic Defense']) ?? 0;
  }

  if (savingThrowIncludes(name, ['charm'])) {
    bonus += numericModifier(currentSheet.abilityDetails['Charisma Reaction Adj']) ?? 0;
  }

  return Math.max(0, bonus);
};

const getSavingThrowReductionSummary = (currentSheet: CharacterSheetState, selectedClass: string) => {
  const reductions = currentSheet.savingThrowRows
    .map((row) => {
      const bonus = getSavingThrowBonus(row.name, currentSheet, selectedClass);
      return bonus > 0 ? `${row.name}: reduce Real by ${bonus}` : '';
    })
    .filter(Boolean);
  const intelligenceImmunity = currentSheet.abilityDetails['Intelligence Immunity'];

  if (currentSheet.race === 'Elf') {
    reductions.push('Sleep and Charm: 90% resistance. If the percentage roll fails, roll the regular save.');
  }

  if (intelligenceImmunity && intelligenceImmunity !== '-') {
    reductions.push(`Major Illusion and Minor Illusion: ${intelligenceImmunity} Intelligence immunity applies.`);
  }

  return reductions.join('\n');
};

export default function AddCharacterPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'existing' | 'new'>('new');
  const [activeSheetPage, setActiveSheetPage] = useState('Page 1');
  const [name, setName] = useState('');
  const [characterClass, setCharacterClass] = useState('');
  const [level, setLevel] = useState('1');
  const [maxMagicPoints, setMaxMagicPoints] = useState('10');
  const [sheet, setSheet] = useState<CharacterSheetState>(() => createEmptySheet());
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [authUserUid, setAuthUserUid] = useState<string | null>(null);
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const classLevelOptions = getLevelOptionsForClass(characterClass);
  const maxClassLevel = classLevelOptions[classLevelOptions.length - 1] ?? 20;
  const currentClassLevel = parseLevelTitle(sheet.levelTitle || level);
  const weaponProficiencySlotOptions = getWeaponProficiencySlotOptions(characterClass);
  const selectedSoulSwordIndex = sheet.weaponRows.findIndex((row) => isSoulSwordLine(row.weapon));
  const selectedSoulSwordRow = selectedSoulSwordIndex >= 0 ? sheet.weaponRows[selectedSoulSwordIndex] : null;
  const armorTypeOptions = withSelectedEquipmentOption(getEquipmentLinesForCategory(sheet.equipmentDetails, 'Armor'), sheet.armorDetails['Armor Type']);
  const helmOptions = withSelectedEquipmentOption(getEquipmentLinesForCategory(sheet.equipmentDetails, 'Helms'), sheet.armorDetails.Helm);
  const shieldOptions = withSelectedEquipmentOption(getEquipmentLinesForCategory(sheet.equipmentDetails, 'Shields'), sheet.armorDetails.Shield);

  useEffect(() => {
    const auth = getFirebaseAuth();
    console.log('[add-character] Firebase auth loading started');
    const suspiciousAuthTimer = window.setTimeout(() => {
      console.warn('[add-character] Auth still loading after 3000ms');
    }, 3000);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('[add-character] onAuthStateChanged fired', { uid: user?.uid ?? null });

      void (async () => {
        if (!user) {
          setAuthUserUid(null);
          setAuthLoading(false);
          setAuthReady(true);
          window.clearTimeout(suspiciousAuthTimer);
          return;
        }

        try {
          const uid = await ensureAuthTokenReady();
          console.log('[add-character] auth token ready uid', uid);
          setAuthUserUid(uid);
          setAuthReady(Boolean(uid));
        } catch (tokenError) {
          console.error('[add-character] auth token failed', tokenError);
          setAuthUserUid(null);
          setAuthReady(false);
        } finally {
          setAuthLoading(false);
          window.clearTimeout(suspiciousAuthTimer);
        }
      })();
    });

    return () => {
      window.clearTimeout(suspiciousAuthTimer);
      unsubscribe();
    };
  }, []);

  const updateSheetField = (field: keyof CharacterSheetState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = event.target.value;

    if (field === 'levelTitle') {
      const parsedLevel = parseLevelTitle(value);
      const levelTitle = getLevelTitleForClass(characterClass, parsedLevel);
      setLevel(String(parsedLevel));

      setSheet((currentSheet) => ({
        ...currentSheet,
        [field]: levelTitle,
        combatDetails: {
          ...currentSheet.combatDetails,
          ...getCombatDefaults(characterClass, levelTitle),
          MP: String(calculateSheetMagicPoints(characterClass, parsedLevel, currentSheet)),
        },
        experienceDetails: {
          ...currentSheet.experienceDetails,
          ...getClassExperienceDefaults(characterClass, parsedLevel),
        },
        hitPointDetails: {
          ...withLevelAwareTotalHitPoints(
            {
              ...currentSheet.hitPointDetails,
              'Per Level': getHitDieForClass(characterClass),
            },
            parsedLevel,
          ),
        },
        proficiencyDetails: {
          ...currentSheet.proficiencyDetails,
          'Thieving Skill Points': getThievingPointsToSpend(characterClass, parsedLevel, currentSheet.thievingSkills),
        },
        turningUndead: getTurningUndeadDefaults(characterClass, parsedLevel),
      }));

      return;
    }

    setSheet((currentSheet) => ({
      ...currentSheet,
      [field]: value,
    }));
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    if (error) {
      setError('');
    }
  };

  const handleClassChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedClass = event.target.value;
    const selectedClassLevelOptions = getLevelOptionsForClass(selectedClass);
    const selectedClassMaxLevel = selectedClassLevelOptions[selectedClassLevelOptions.length - 1] ?? 20;
    const selectedLevel = Math.min(Number(level), selectedClassMaxLevel);
    setCharacterClass(selectedClass);
    setLevel(String(selectedLevel));

    setSheet((currentSheet) => {
      const nextRace = getRaceSelectionForClass(selectedClass, currentSheet.race);
      const dexterityUpdates = currentSheet.abilityDetails.Dexterity.trim()
        ? applyDexterityAdjustmentsToSheet(currentSheet, selectedClass)
        : {};
      const nextThievingSkills = recalculateThievingSkills(
        currentSheet.thievingSkills,
        nextRace,
        currentSheet.abilityDetails.Dexterity,
        selectedClass,
      );

      return {
        ...currentSheet,
        race: nextRace,
        racialBonuses: nextRace
          ? (RACIAL_ABILITIES[nextRace] ?? RACIAL_ADJUSTMENTS[nextRace] ?? '')
          : '',
        specialAbilities: hasClassRules(selectedClass)
          ? getClassSpecialAbilitiesText(selectedClass)
          : '',
        levelTitle: getLevelTitleForClass(selectedClass, parseLevelTitle(currentSheet.levelTitle)),
        combatDetails: {
          ...currentSheet.combatDetails,
          ...getCombatDefaults(selectedClass, currentSheet.levelTitle),
          MP: String(calculateSheetMagicPoints(selectedClass, parseLevelTitle(currentSheet.levelTitle), currentSheet)),
        },
        hitPointDetails: {
          ...withLevelAwareTotalHitPoints(
            {
              ...currentSheet.hitPointDetails,
              'Per Level': getHitDieForClass(selectedClass),
              Adjustment: getClassHitPointAdjustment(currentSheet.abilityDetails['Constitution HP Adj'], selectedClass),
            },
            parseLevelTitle(currentSheet.levelTitle),
          ),
        },
        experienceDetails: {
          ...currentSheet.experienceDetails,
          ...getClassExperienceDefaults(selectedClass, parseLevelTitle(currentSheet.levelTitle)),
          Bonus: hasClassXpBonusRule(selectedClass)
            ? getClassXpBonusFieldValue(selectedClass, currentSheet.abilityDetails)
            : '',
        },
        proficiencyDetails: {
          ...currentSheet.proficiencyDetails,
          'Thieving Skill Points': getThievingPointsToSpend(selectedClass, parseLevelTitle(currentSheet.levelTitle), nextThievingSkills),
        },
        thievingSkills: nextThievingSkills,
        turningUndead: getTurningUndeadDefaults(selectedClass, parseLevelTitle(currentSheet.levelTitle)),
        ...dexterityUpdates,
      };
    });
  };

  const handleRaceChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const race = event.target.value;

    if (race && !isRaceAllowedForClass(characterClass, race)) {
      return;
    }

    setSheet((currentSheet) => {
      const nextSheet = {
        ...currentSheet,
        race,
        racialBonuses: RACIAL_ABILITIES[race] ?? RACIAL_ADJUSTMENTS[race] ?? '',
        thievingSkills: recalculateThievingSkills(currentSheet.thievingSkills, race, currentSheet.abilityDetails.Dexterity, characterClass),
      };

      return nextSheet;
    });
  };

  const updateSheetRecordField = (
    section: 'abilityDetails' | 'combatDetails' | 'experienceDetails' | 'hitPointDetails' | 'armorDetails' | 'proficiencyDetails' | 'trackingModifiers' | 'turningUndead' | 'savingThrowDetails' | 'equipmentDetails',
    field: string,
  ) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = event.target.value;

    if (section === 'experienceDetails' && field === 'Current') {
      setSheet((currentSheet) => ({
        ...currentSheet,
        experienceDetails: {
          ...currentSheet.experienceDetails,
          Current: value,
          ...getClassExperienceDefaults(characterClass, parseLevelTitle(currentSheet.levelTitle), value),
        },
      }));

      return;
    }

    if (section === 'hitPointDetails') {
      setSheet((currentSheet) => ({
        ...currentSheet,
        hitPointDetails: withLevelAwareTotalHitPoints(
          {
            ...currentSheet.hitPointDetails,
            [field]: value,
          },
          parseLevelTitle(currentSheet.levelTitle),
        ),
      }));

      return;
    }

    if (section === 'combatDetails' && field === 'Base THACO') {
      setSheet((currentSheet) => {
        const combatDetails = {
          ...currentSheet.combatDetails,
          [field]: value,
        };
        const context = getWeaponRowContext({ ...currentSheet, combatDetails }, characterClass);

        return {
          ...currentSheet,
          combatDetails,
          weaponRows: enrichAllWeaponRows(currentSheet.weaponRows, context),
        };
      });

      return;
    }

    if (section === 'armorDetails') {
      setSheet((currentSheet) => ({
        ...currentSheet,
        armorDetails: withCalculatedRealArmorClass({
          ...currentSheet.armorDetails,
          [field]: value,
        }),
      }));

      return;
    }

    setSheet((currentSheet) => ({
      ...currentSheet,
      [section]: {
        ...currentSheet[section],
        [field]: value,
      },
    }));
  };

  const handleEquipLine = (itemLine: string, _itemName: string, equipmentBucket = 'Other', itemCost = '') => {
    const deduction = deductEquipmentCost(sheet.equipmentDetails, itemCost);

    if (deduction.insufficientFunds) {
      return 'Not enough coins for that purchase.';
    }

    setSheet((currentSheet) => {
      const currentEquipment = deduction.equipmentDetails[equipmentBucket]?.trim();

      return {
        ...currentSheet,
        equipmentDetails: {
          ...deduction.equipmentDetails,
          [equipmentBucket]: currentEquipment ? `${currentEquipment}\n${itemLine}` : itemLine,
        },
      };
    });
  };

  const getEquipmentBucketLines = (field: string) => (sheet.equipmentDetails[field] ?? '').split('\n');

  const updateEquipmentBucketLine = (field: string, rowIndex: number) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setSheet((currentSheet) => {
      const lines = (currentSheet.equipmentDetails[field] ?? '').split('\n');
      lines[rowIndex] = value;

      return {
        ...currentSheet,
        equipmentDetails: {
          ...currentSheet.equipmentDetails,
          [field]: lines.join('\n'),
        },
      };
    });
  };

  const addEquipmentBucketLine = (field: string) => {
    setSheet((currentSheet) => {
      const currentEquipment = currentSheet.equipmentDetails[field] ?? '';

      return {
        ...currentSheet,
        equipmentDetails: {
          ...currentSheet.equipmentDetails,
          [field]: currentEquipment ? `${currentEquipment}\n` : '\n',
        },
      };
    });
  };

  const removeStartingEquipmentLine = (index: number) => {
    setSheet((currentSheet) => ({
      ...currentSheet,
      equipmentDetails: {
        ...currentSheet.equipmentDetails,
        [`Starting Equipment ${index + 1}`]: '',
      },
    }));
  };

  const removeEquipmentBucketLine = (field: string, rowIndex: number) => {
    setSheet((currentSheet) => {
      const { removedLine, nextValue } = removeLineFromBucket(currentSheet.equipmentDetails[field] ?? '', rowIndex);
      const nextEquipmentDetails = {
        ...currentSheet.equipmentDetails,
        [field]: nextValue,
      };

      return syncSheetAfterEquipmentRemoval(
        {
          ...currentSheet,
          equipmentDetails: nextEquipmentDetails,
        },
        removedLine,
        field,
        characterClass,
      );
    });
  };

  const updateAbilityScoreField = (ability: 'Strength' | 'Dexterity' | 'Constitution' | 'Intelligence' | 'Wisdom' | 'Charisma') => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setSheet((currentSheet) => {
      let abilityDetails = {
        ...currentSheet.abilityDetails,
        [ability]: value,
      };
      let weaponRows = currentSheet.weaponRows;
      let armorDetails = currentSheet.armorDetails;
      let hitPointDetails = currentSheet.hitPointDetails;
      let proficiencyDetails = currentSheet.proficiencyDetails;
      let thievingSkills = currentSheet.thievingSkills;

      if (!value.trim()) {
        ABILITY_DERIVED_FIELDS[ability].forEach((field) => {
          abilityDetails[field] = '';
        });

        if (ability === 'Strength') {
          weaponRows = currentSheet.weaponRows.map((row) => ({
            ...row,
            thacoStrengthBonus: '',
            damageStrengthBonus: '',
          }));
        }

        if (ability === 'Dexterity') {
          armorDetails = withCalculatedRealArmorClass({
            ...currentSheet.armorDetails,
            Base: '',
          });
          weaponRows = currentSheet.weaponRows.map((row) => ({
            ...row,
            speedReactionAdj: '',
          }));
          thievingSkills = recalculateThievingSkills(currentSheet.thievingSkills, currentSheet.race, '', characterClass);
        }

        if (ability === 'Constitution') {
          hitPointDetails = withLevelAwareTotalHitPoints(
            {
              ...currentSheet.hitPointDetails,
              Adjustment: '',
            },
            parseLevelTitle(currentSheet.levelTitle),
          );
        }

        if (ability === 'Wisdom') {
          proficiencyDetails = {
            ...currentSheet.proficiencyDetails,
            'Tracking Wisdom': '',
          };
        }

        return {
          ...currentSheet,
          abilityDetails,
          armorDetails,
          hitPointDetails,
          proficiencyDetails,
          thievingSkills,
          weaponRows,
          ...(hasClassXpBonusRule(characterClass) && (ability === 'Intelligence' || ability === 'Dexterity')
            ? {
                experienceDetails: {
                  ...currentSheet.experienceDetails,
                  Bonus: getClassXpBonusFieldValue(characterClass, abilityDetails),
                },
              }
            : {}),
        };
      }

      if (ability === 'Strength') {
        const autofill = getStrengthAutofill(value);
        if (autofill) {
          abilityDetails['Strength Hit'] = autofill.hit;
          abilityDetails['Strength Dmg'] = autofill.dmg;
          abilityDetails['Strength Wgt'] = autofill.wgt;
          abilityDetails['Strength Press'] = autofill.press;
          abilityDetails['Strength Doors'] = autofill.doors;
          abilityDetails['Strength Bars/Gates'] = autofill.bars;
          weaponRows = currentSheet.weaponRows.map((row) => ({
            ...row,
            thacoStrengthBonus: autofill.hit,
            damageStrengthBonus: autofill.dmg,
          }));
        }
      }

      if (ability === 'Dexterity') {
        const dexterityUpdates = applyDexterityAdjustmentsToSheet(
          { ...currentSheet, abilityDetails },
          characterClass,
          value,
        );
        abilityDetails = dexterityUpdates.abilityDetails;
        armorDetails = dexterityUpdates.armorDetails;
        weaponRows = dexterityUpdates.weaponRows;
        thievingSkills = recalculateThievingSkills(currentSheet.thievingSkills, currentSheet.race, value, characterClass);
      }

      if (ability === 'Constitution') {
        const autofill = getConstitutionAutofill(value);
        if (autofill) {
          abilityDetails['Constitution HP Adj'] = autofill.hp;
          abilityDetails['Constitution Sys Shk'] = autofill.systemShock;
          abilityDetails['Constitution Res Sur'] = autofill.resurrection;
          abilityDetails['Constitution Poison Save'] = autofill.poison;
          abilityDetails['Constitution Regen'] = autofill.regen;
          hitPointDetails = withLevelAwareTotalHitPoints(
            {
              ...currentSheet.hitPointDetails,
              Adjustment: getClassHitPointAdjustment(autofill.hp, characterClass),
            },
            parseLevelTitle(currentSheet.levelTitle),
          );
        }
      }

      if (ability === 'Intelligence') {
        const autofill = getIntelligenceAutofill(value);
        if (autofill) {
          abilityDetails['Intelligence # of Lang'] = autofill.languages;
          abilityDetails['Intelligence Sp Lvl'] = autofill.spellLevel;
          abilityDetails['Intelligence Learn Spl'] = autofill.learnSpell;
          abilityDetails['Intelligence Sp/Lvl'] = autofill.spellsPerLevel;
          abilityDetails['Intelligence Immunity'] = autofill.immunity;
        }
      }

      if (ability === 'Wisdom') {
        const autofill = getWisdomAutofill(value);
        if (autofill) {
          abilityDetails['Wisdom Magic Defense'] = autofill.defense;
          abilityDetails['Wisdom Bonus Spells'] = autofill.bonus;
          abilityDetails['Wisdom % Fail'] = autofill.fail;
          abilityDetails['Wisdom Immunity'] = autofill.immunity;
          proficiencyDetails = {
            ...currentSheet.proficiencyDetails,
            'Tracking Wisdom': value,
          };
        }
      }

      if (ability === 'Charisma') {
        const autofill = getCharismaAutofill(value);
        if (autofill) {
          abilityDetails['Charisma Max # Henchman'] = autofill.henchmen;
          abilityDetails['Charisma Loyalty Base'] = autofill.loyalty;
          abilityDetails['Charisma Reaction Adj'] = autofill.reaction;
        }
      }

      const nextSheet = {
        ...currentSheet,
        abilityDetails,
        armorDetails,
        combatDetails: {
          ...currentSheet.combatDetails,
          MP: ability === 'Intelligence'
            ? String(calculateSheetMagicPoints(characterClass, parseLevelTitle(currentSheet.levelTitle), { ...currentSheet, abilityDetails }))
            : currentSheet.combatDetails.MP,
        },
        hitPointDetails,
        proficiencyDetails,
        thievingSkills,
        weaponRows,
        ...(hasClassXpBonusRule(characterClass) && (ability === 'Intelligence' || ability === 'Dexterity')
          ? {
              experienceDetails: {
                ...currentSheet.experienceDetails,
                Bonus: getClassXpBonusFieldValue(characterClass, abilityDetails),
              },
            }
          : {}),
      };
      const context = getWeaponRowContext(nextSheet, characterClass);

      return {
        ...nextSheet,
        weaponRows: enrichAllWeaponRows(nextSheet.weaponRows, context),
      };
    });
  };

  const updatePietyField = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setSheet((currentSheet) => {
      const abilityDetails = {
        ...currentSheet.abilityDetails,
        Piety: value,
      };

      return {
        ...currentSheet,
        abilityDetails,
        combatDetails: {
          ...currentSheet.combatDetails,
          MP: String(calculateSheetMagicPoints(characterClass, parseLevelTitle(currentSheet.levelTitle), { ...currentSheet, abilityDetails })),
        },
      };
    });
  };

  const updateWeaponRow = (rowIndex: number, field: keyof WeaponRow) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setSheet((currentSheet) => ({
      ...currentSheet,
      weaponRows: currentSheet.weaponRows.map((row, index) => (
        index === rowIndex
          ? updateWeaponRowField(row, field, value, getWeaponRowContext(currentSheet, characterClass))
          : row
      )),
    }));
  };

  const handleWeaponSelect = (rowIndex: number) => (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    const selectedSoulSword = isSoulSwordLine(value);

    setSheet((currentSheet) => ({
      ...currentSheet,
      weaponRows: currentSheet.weaponRows.map((row, index) => (
        index === rowIndex
          ? {
            ...applyWeaponSelectionToRow(row, value, getWeaponRowContext(currentSheet, characterClass)),
            soulSwordColor: selectedSoulSword ? '' : '',
            soulSwordIgnited: selectedSoulSword ? false : false,
          }
          : row
      )),
    }));
  };

  const addWeaponLine = () => {
    setSheet((currentSheet) => ({
      ...currentSheet,
      weaponRows: [
        ...currentSheet.weaponRows,
        createWeaponRow(currentSheet.weaponRows.length + 1),
      ],
    }));
  };

  const updateSoulSwordColor = (event: ChangeEvent<HTMLSelectElement>) => {
    const color = event.target.value.toLowerCase();

    setSheet((currentSheet) => {
      if (selectedSoulSwordIndex < 0) {
        return currentSheet;
      }

      const weaponRows = currentSheet.weaponRows.map((row, index) => (
        index === selectedSoulSwordIndex ? { ...row, soulSwordColor: color } : row
      ));
      const context = getWeaponRowContext(currentSheet, characterClass);

      return {
        ...currentSheet,
        weaponRows: enrichAllWeaponRows(weaponRows, context),
      };
    });
  };

  const toggleSoulSwordIgnite = () => {
    setSheet((currentSheet) => {
      if (selectedSoulSwordIndex < 0) {
        return currentSheet;
      }

      const weaponRows = currentSheet.weaponRows.map((row, index) => (
        index === selectedSoulSwordIndex
          ? { ...row, soulSwordIgnited: !row.soulSwordIgnited }
          : row
      ));
      const context = getWeaponRowContext(currentSheet, characterClass);

      return {
        ...currentSheet,
        weaponRows: enrichAllWeaponRows(weaponRows, context),
      };
    });
  };

  const updateWeaponProficiencyRow = (rowIndex: number, field: keyof ProficiencyRow) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = event.target.value;

    setSheet((currentSheet) => {
      const weaponProficiencies = currentSheet.weaponProficiencies.map((row, index) => {
        if (index !== rowIndex) return row;

        if (field === 'name') {
          return {
            ...row,
            name: value,
            slots: value.trim() ? '0' : '',
          };
        }

        return { ...row, [field]: value };
      });
      const context = getWeaponRowContext({ ...currentSheet, weaponProficiencies }, characterClass);

      return {
        ...currentSheet,
        weaponProficiencies,
        weaponRows: enrichAllWeaponRows(currentSheet.weaponRows, context),
      };
    });
  };

  const addWeaponProficiencyLine = () => {
    setSheet((currentSheet) => ({
      ...currentSheet,
      weaponProficiencies: [
        ...currentSheet.weaponProficiencies,
        createWeaponProficiencyRow(currentSheet.weaponProficiencies.length + 1),
      ],
    }));
  };

  const updateNonWeaponProficiencyRow = (rowIndex: number, field: keyof NonWeaponProficiencyRow) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setSheet((currentSheet) => ({
      ...currentSheet,
      nonWeaponProficiencies: currentSheet.nonWeaponProficiencies.map((row, index) => (
        index === rowIndex ? { ...row, [field]: value } : row
      )),
    }));
  };

  const addNonWeaponProficiencyLine = () => {
    setSheet((currentSheet) => ({
      ...currentSheet,
      nonWeaponProficiencies: [
        ...currentSheet.nonWeaponProficiencies,
        createNonWeaponProficiencyRow(currentSheet.nonWeaponProficiencies.length + 1),
      ],
    }));
  };

  const handleSecondarySkillChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const secondarySkill = event.target.value;

    setSheet((currentSheet) => applySecondarySkillToSheet(currentSheet, secondarySkill));
  };

  const updateThievingSkillRow = (rowIndex: number, field: keyof ThievingSkillRow) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setSheet((currentSheet) => {
      const updatedRows = currentSheet.thievingSkills.map((row, index) => (
        index === rowIndex ? { ...row, [field]: value } : row
      ));
      const thievingSkills = recalculateThievingSkills(updatedRows, currentSheet.race, currentSheet.abilityDetails.Dexterity, characterClass);

      return {
        ...currentSheet,
        proficiencyDetails: {
          ...currentSheet.proficiencyDetails,
          'Thieving Skill Points': getThievingPointsToSpend(characterClass, parseLevelTitle(currentSheet.levelTitle), thievingSkills),
        },
        thievingSkills,
      };
    });
  };

  const { updateSavingThrowRow, updateSavingThrowCheck } = createSavingThrowHandlers((updater) => {
    setSheet((currentSheet) => ({
      ...currentSheet,
      savingThrowRows: updater(currentSheet.savingThrowRows),
    }));
  });

  const submitCharacter = async () => {
    if (isSubmitting || authLoading) {
      return;
    }

    setIsSubmitting(true);
    const trimmedName = name.trim();
    const effectiveClass = characterClass || 'Fighter';
    const rawLevel = mode === 'new' ? parseLevelTitle(sheet.levelTitle) : Number(level);
    const parsedLevel = Number.isFinite(rawLevel) && rawLevel > 0 ? Math.floor(rawLevel) : 1;
    const rawMaxMagicPoints = mode === 'new'
      ? calculateSheetMagicPoints(effectiveClass, parsedLevel, sheet)
      : Number(maxMagicPoints);
    const parsedMaxMagicPoints = Number.isFinite(rawMaxMagicPoints) && rawMaxMagicPoints >= 0
      ? Math.floor(rawMaxMagicPoints)
      : 0;
    const parsedMaxHitPoints = mode === 'new'
      ? parseHitPointValue(sheet.hitPointDetails['Total HP']) ?? parseHitPointValue(sheet.hitPointDetails.Full) ?? parseHitPointValue(sheet.hitPointDetails.Current) ?? 0
      : 0;
    const parsedHitPoints = mode === 'new'
      ? parseHitPointValue(sheet.hitPointDetails['Total HP']) ?? parseHitPointValue(sheet.hitPointDetails.Current) ?? parsedMaxHitPoints
      : parsedMaxHitPoints;
    setError('');

    if (!trimmedName) {
      setError('Character name is required.');
      setIsSubmitting(false);
      return;
    }

    try {
      if (!authReady || !authUserUid) {
        throw new Error('You must be logged in to create a character.');
      }

      const character = await addCharacter(
        {
          name: trimmedName,
          class: effectiveClass,
          characterClass: effectiveClass,
          level: parsedLevel,
          magicPoints: parsedMaxMagicPoints,
          maxMagicPoints: parsedMaxMagicPoints,
          hitPoints: Math.min(parsedHitPoints, parsedMaxHitPoints),
          maxHitPoints: parsedMaxHitPoints,
        },
        mode === 'new' ? sheet : undefined,
      );

      if (mode === 'new') {
        void syncMagicPointsFromSheet(character.id, effectiveClass, parsedLevel);
      }

      const params = new URLSearchParams({ selectedCharacter: character.name, characterId: String(character.id) });
      console.log('[add-character] before router.push', { characterId: character.id, uid: authUserUid });
      router.push(`/dashboard?${params.toString()}`);
      console.log('[add-character] router.push called', { path: `/dashboard?${params.toString()}` });
    } catch (submitError) {
      const message = submitError instanceof Error
        ? submitError.message
        : 'Unable to save character for the current account. Please make sure you are signed in.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitCharacter();
  };

  return (
    <ImageBackgroundWrapper>
      <main style={styles.page}>
        <div style={styles.headerRow}>
          <div>
            <p style={styles.eyebrow}>Characters</p>
            <h1 style={styles.title}>Add Character</h1>
          </div>
          <div style={styles.headerActions}>
            <button type="button" onClick={() => router.push('/characters')} style={styles.backButton}>
              Back
            </button>
            <Buttons
              type="button"
              onPress={submitCharacter}
              disabled={isSubmitting || authLoading || !authReady || !authUserUid}
              style={styles.createButton}
            >
              {authLoading
                ? 'Loading account...'
                : isSubmitting
                  ? 'Creating...'
                  : (mode === 'new' ? 'Create Character' : 'Add Existing Character')}
            </Buttons>
          </div>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.modeRow}>
          <button type="button" onClick={() => setMode('new')} style={{ ...styles.modeButton, ...(mode === 'new' ? styles.modeButtonActive : {}) }}>
            Create New
          </button>
          <button type="button" onClick={() => setMode('existing')} style={{ ...styles.modeButton, ...(mode === 'existing' ? styles.modeButtonActive : {}) }}>
            Add Existing
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === 'existing' && (
            <section style={styles.panel}>
              <h2 style={styles.sectionTitle}>Existing Character</h2>
              <div style={styles.identityGrid}>
                <label style={styles.field}><span style={styles.label}>Name</span><input value={name} onChange={handleNameChange} style={styles.control} /></label>
                <label style={styles.field}>
                  <span style={styles.label}>Class</span>
                  <select value={characterClass} onChange={handleClassChange} style={styles.control}>
                    <option value="">Select class</option>
                    {CHARACTER_CLASSES.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label style={styles.field}>
                  <span style={styles.label}>Level</span>
                  <select value={String(Math.min(Number(level), maxClassLevel))} onChange={(event) => setLevel(event.target.value)} style={styles.control}>
                    {classLevelOptions.map((levelOption) => (
                      <option key={levelOption} value={levelOption}>{levelOption}</option>
                    ))}
                  </select>
                </label>
                <label style={styles.field}><span style={styles.label}>Magic Points</span><input type="number" min={0} value={maxMagicPoints} onChange={(event) => setMaxMagicPoints(event.target.value)} style={styles.control} /></label>
              </div>
            </section>
          )}

          {mode === 'new' && (
            <section style={styles.sheet}>
              <div style={styles.sheetHeader}>
                <h2 style={styles.sheetTitle}>Trueshield Games Player Character Sheet</h2>
                <div style={styles.sheetTabs}>
                  {SHEET_PAGES.map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setActiveSheetPage(page)}
                      style={{ ...styles.sheetTab, ...(activeSheetPage === page ? styles.sheetTabActive : {}) }}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>

              {activeSheetPage === 'Page 1' ? (
                <>
                  <div style={styles.lineGrid}>
                    <label style={styles.lineField}><span style={styles.lineLabel}>Character Name:</span><input value={name} onChange={handleNameChange} style={styles.lineInput} /></label>
                    <label style={styles.lineField}><span style={styles.lineLabel}>Player Name:</span><input value={sheet.playerName} onChange={updateSheetField('playerName')} style={styles.lineInput} /></label>
                    <label style={styles.lineField}><span style={styles.lineLabel}>Character Alias:</span><input value={sheet.characterAlias} onChange={updateSheetField('characterAlias')} style={styles.lineInput} /></label>
                    <label style={styles.lineField}>
                      <span style={styles.lineLabel}>Class:</span>
                      <select value={characterClass} onChange={handleClassChange} style={styles.lineInput}>
                        <option value="">Select class</option>
                        {CHARACTER_CLASSES.map((item) => <option key={item} value={item}>{item}</option>)}
                      </select>
                    </label>
                    <label style={styles.lineField}>
                      <span style={styles.lineLabel}>Race:</span>
                      <select value={sheet.race} onChange={handleRaceChange} style={styles.lineInput}>
                        <option value="">Select race</option>
                        <RaceSelectOptions characterClass={characterClass} />
                      </select>
                    </label>
                    <label style={styles.lineField}><span style={styles.lineLabel}>Alignment:</span><input value={sheet.alignment} onChange={updateSheetField('alignment')} style={styles.lineInput} /></label>
                    <label style={styles.lineField}><span style={styles.lineLabel}>Deity:</span><input value={sheet.deity} onChange={updateSheetField('deity')} style={styles.lineInput} /></label>
                    <label style={styles.lineField}>
                      <span style={styles.lineLabel}>Level/Title:</span>
                      <select value={String(Math.min(parseLevelTitle(sheet.levelTitle), maxClassLevel))} onChange={updateSheetField('levelTitle')} style={styles.lineInput}>
                        {classLevelOptions.map((levelOption) => (
                          <option key={levelOption} value={levelOption}>
                            {getLevelTitleForClass(characterClass, levelOption)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label style={styles.lineField}><span style={styles.lineLabel}>Homeland:</span><input value={sheet.homeland} onChange={updateSheetField('homeland')} style={styles.lineInput} /></label>
                  </div>

                  <div style={styles.detailRow}>
                    <label style={styles.socialClassField}>
                      <span style={styles.lineLabel}>Social Class:</span>
                      <select value={sheet.socialClass} onChange={updateSheetField('socialClass')} style={styles.lineInput}>
                        <option value="">Select</option>
                        {SOCIAL_CLASS_OPTIONS.map((socialClass) => <option key={socialClass} value={socialClass}>{socialClass}</option>)}
                      </select>
                    </label>
                    <label style={styles.tinyLineField}><span style={styles.lineLabel}>Sex:</span><input value={sheet.sex} onChange={updateSheetField('sex')} style={styles.lineInput} /></label>
                    <label style={styles.tinyLineField}><span style={styles.lineLabel}>Age:</span><input value={sheet.age} onChange={updateSheetField('age')} style={styles.lineInput} /></label>
                    <label style={styles.smallLineField}><span style={styles.lineLabel}>Height:</span><input value={sheet.height} onChange={updateSheetField('height')} style={styles.lineInput} /></label>
                    <label style={styles.smallLineField}><span style={styles.lineLabel}>Weight:</span><input value={sheet.weight} onChange={updateSheetField('weight')} style={styles.lineInput} /></label>
                    <label style={styles.mediumLineField}><span style={styles.lineLabel}>Eyes:</span><input value={sheet.eyes} onChange={updateSheetField('eyes')} style={styles.lineInput} /></label>
                    <label style={styles.mediumLineField}><span style={styles.lineLabel}>Hair:</span><input value={sheet.hair} onChange={updateSheetField('hair')} style={styles.lineInput} /></label>
                  </div>

                  <label style={styles.textBlock}><span style={styles.lineLabel}>Languages:</span><textarea value={sheet.languages} onChange={updateSheetField('languages')} style={styles.sheetTextarea} /></label>
                  <label style={styles.textBlock}><span style={styles.lineLabel}>Racial Bonuses and Abilities:</span><textarea value={sheet.racialBonuses} onChange={updateSheetField('racialBonuses')} style={{ ...styles.sheetTextarea, minHeight: 220 }} /></label>
                  <div style={styles.textBlock}>
                    <span style={styles.lineLabel}>Special Abilities and Restrictions:</span>
                    <textarea
                      value={sheet.specialAbilities}
                      onChange={updateSheetField('specialAbilities')}
                      wrap="off"
                      style={styles.specialAbilitiesTextarea}
                    />
                  </div>
                  <label style={styles.textBlock}><span style={styles.lineLabel}>Notes/History:</span><textarea value={sheet.notes} onChange={updateSheetField('notes')} style={{ ...styles.sheetTextarea, minHeight: 360 }} /></label>
                </>
              ) : activeSheetPage === 'Page 2' ? (
                <>
                  <div style={styles.sheetSection}>
                    <h3 style={styles.sheetSectionTitle}>Ability Scores</h3>
                    <div style={styles.abilityLine}>
                      <label style={styles.scoreField}><span style={styles.lineLabel}>Strength:</span><input value={sheet.abilityDetails.Strength} onChange={updateAbilityScoreField('Strength')} style={styles.scoreInput} /></label>
                      {['Hit', 'Dmg', 'Wgt', 'Press', 'Doors', 'Bars/Gates'].map((field) => (
                        <label key={field} style={styles.modifierField}>
                          <span style={styles.lineLabel}>{field}:</span>
                          <input value={sheet.abilityDetails[`Strength ${field}`]} onChange={updateSheetRecordField('abilityDetails', `Strength ${field}`)} style={styles.lineInput} />
                        </label>
                      ))}
                    </div>
                    <div style={styles.abilityLine}>
                      <label style={styles.scoreField}><span style={styles.lineLabel}>Dexterity:</span><input value={sheet.abilityDetails.Dexterity} onChange={updateAbilityScoreField('Dexterity')} style={styles.scoreInput} /></label>
                      <label style={styles.modifierField}><span style={styles.lineLabel}>Reac Adj:</span><input value={sheet.abilityDetails['Dexterity Reac Adj']} onChange={updateSheetRecordField('abilityDetails', 'Dexterity Reac Adj')} style={styles.lineInput} /></label>
                      <label style={styles.modifierField}><span style={styles.lineLabel}>Msl Att Adj:</span><input value={sheet.abilityDetails['Dexterity Msl Att Adj']} onChange={updateSheetRecordField('abilityDetails', 'Dexterity Msl Att Adj')} style={styles.lineInput} /></label>
                      <label style={styles.modifierField}><span style={styles.lineLabel}>Def Adj (AC):</span><input value={sheet.abilityDetails['Dexterity Def Adj (AC)']} onChange={updateSheetRecordField('abilityDetails', 'Dexterity Def Adj (AC)')} style={styles.lineInput} /></label>
                      <label style={styles.modifierField}><span style={styles.lineLabel}>Parry:</span><input value={sheet.abilityDetails['Dexterity Parry']} onChange={updateSheetRecordField('abilityDetails', 'Dexterity Parry')} style={styles.lineInput} /></label>
                    </div>
                    <div style={styles.abilityLine}>
                      <label style={styles.scoreField}><span style={styles.lineLabel}>Constitution:</span><input value={sheet.abilityDetails.Constitution} onChange={updateAbilityScoreField('Constitution')} style={styles.scoreInput} /></label>
                      {[
                        ['HP Adj', 'Constitution HP Adj'],
                        ['Sys Shk', 'Constitution Sys Shk'],
                        ['Res Sur', 'Constitution Res Sur'],
                        ['Poison Save', 'Constitution Poison Save'],
                        ['Regen', 'Constitution Regen'],
                      ].map(([label, field]) => (
                        <label key={field} style={styles.modifierField}>
                          <span style={styles.lineLabel}>{label}:</span>
                          <input value={sheet.abilityDetails[field]} onChange={updateSheetRecordField('abilityDetails', field)} style={styles.lineInput} />
                        </label>
                      ))}
                    </div>
                    <div style={styles.abilityLine}>
                      <label style={styles.scoreField}><span style={styles.lineLabel}>Intelligence:</span><input value={sheet.abilityDetails.Intelligence} onChange={updateAbilityScoreField('Intelligence')} style={styles.scoreInput} /></label>
                      {[
                        ['# of Lang', 'Intelligence # of Lang'],
                        ['Sp Lvl', 'Intelligence Sp Lvl'],
                        ['Learn Spl', 'Intelligence Learn Spl'],
                        ['Sp/Lvl', 'Intelligence Sp/Lvl'],
                        ['Immunity', 'Intelligence Immunity'],
                      ].map(([label, field]) => (
                        <label key={field} style={styles.modifierField}>
                          <span style={styles.lineLabel}>{label}:</span>
                          <input value={sheet.abilityDetails[field]} onChange={updateSheetRecordField('abilityDetails', field)} style={styles.lineInput} />
                        </label>
                      ))}
                    </div>
                    <div style={styles.abilityLine}>
                      <label style={styles.scoreField}><span style={styles.lineLabel}>Wisdom:</span><input value={sheet.abilityDetails.Wisdom} onChange={updateAbilityScoreField('Wisdom')} style={styles.scoreInput} /></label>
                      {[
                        ['Magic Defense', 'Wisdom Magic Defense'],
                        ['Bonus Spells', 'Wisdom Bonus Spells'],
                        ['% Fail', 'Wisdom % Fail'],
                        ['Immunity', 'Wisdom Immunity'],
                      ].map(([label, field]) => (
                        <label key={field} style={styles.modifierField}>
                          <span style={styles.lineLabel}>{label}:</span>
                          <input value={sheet.abilityDetails[field]} onChange={updateSheetRecordField('abilityDetails', field)} style={styles.lineInput} />
                        </label>
                      ))}
                    </div>
                    <div style={styles.abilityLine}>
                      <label style={styles.scoreField}><span style={styles.lineLabel}>Charisma:</span><input value={sheet.abilityDetails.Charisma} onChange={updateAbilityScoreField('Charisma')} style={styles.scoreInput} /></label>
                      <label style={styles.longModifierField}><span style={styles.lineLabel}>Max # Henchman:</span><input value={sheet.abilityDetails['Charisma Max # Henchman']} onChange={updateSheetRecordField('abilityDetails', 'Charisma Max # Henchman')} style={styles.lineInput} /></label>
                      <label style={styles.longModifierField}><span style={styles.lineLabel}>Loyalty Base:</span><input value={sheet.abilityDetails['Charisma Loyalty Base']} onChange={updateSheetRecordField('abilityDetails', 'Charisma Loyalty Base')} style={styles.lineInput} /></label>
                      <label style={styles.longModifierField}><span style={styles.lineLabel}>Reaction Adj:</span><input value={sheet.abilityDetails['Charisma Reaction Adj']} onChange={updateSheetRecordField('abilityDetails', 'Charisma Reaction Adj')} style={styles.lineInput} /></label>
                    </div>
                    <div style={styles.comelinessLine}>
                      <label style={styles.scoreField}><span style={styles.lineLabel}>Comeliness:</span><input value={sheet.abilityDetails.Comeliness} onChange={updateSheetRecordField('abilityDetails', 'Comeliness')} style={styles.scoreInput} /></label>
                      <p style={styles.inlineNote}>1/6 Ugly, 7/9 Homely, 10/13 Average, 14/17 Above Average, 18/21 Beautiful</p>
                    </div>
                    <div style={styles.abilityLine}>
                      <label style={styles.scoreField}><span style={styles.lineLabel}>Piety:</span><input value={sheet.abilityDetails.Piety} onChange={updatePietyField} style={styles.scoreInput} /></label>
                    </div>
                  </div>

                  <p style={styles.ruleNote}>SP - Specialization. MP - Magic Points. LP - Luck Points (d4 per level). Shirt LP - Shirt Luck Points.</p>

                  <div style={styles.compactStatsGrid}>
                    <label style={styles.compactLineField}>
                      <span style={styles.lineLabel}>Base class Att/Rnd:</span>
                      <input value={sheet.combatDetails['Base class Att/Rnd']} onChange={updateSheetRecordField('combatDetails', 'Base class Att/Rnd')} style={styles.lineInput} />
                    </label>
                    <label style={styles.compactLineField}>
                      <span style={styles.lineLabel}>SP (pg. 71):</span>
                      <select value={sheet.combatDetails.SP} onChange={updateSheetRecordField('combatDetails', 'SP')} style={styles.lineInput}>
                        <option value="">None</option>
                        {WARRIOR_CLASSES.includes(characterClass) && getSpecialistAttackOptions(parseLevelTitle(sheet.levelTitle)).map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </label>
                    <label style={styles.compactLineField}>
                      <span style={styles.lineLabel}>Base THACO (pg. 121):</span>
                      <input value={sheet.combatDetails['Base THACO']} onChange={updateSheetRecordField('combatDetails', 'Base THACO')} style={styles.lineInput} />
                    </label>
                    <label style={styles.compactLineField}>
                      <span style={styles.lineLabel}>MP:</span>
                      <input value={sheet.combatDetails.MP} onChange={updateSheetRecordField('combatDetails', 'MP')} style={styles.lineInput} />
                    </label>
                    <label style={styles.compactLineField}>
                      <span style={styles.lineLabel}>LP:</span>
                      <input value={sheet.combatDetails.LP} onChange={updateSheetRecordField('combatDetails', 'LP')} style={styles.lineInput} />
                    </label>
                    <label style={styles.compactLineField}>
                      <span style={styles.lineLabel}>Shirt LP:</span>
                      <input value={sheet.combatDetails['Shirt LP']} onChange={updateSheetRecordField('combatDetails', 'Shirt LP')} style={styles.lineInput} />
                    </label>
                  </div>

                  <div style={styles.twoColumnSections}>
                    <div style={styles.sheetSection}>
                      <h3 style={styles.sheetSectionTitle}>Experience Points</h3>
                      <div style={styles.miniGrid}>
                        {['Current', 'Bonus', 'Next XP Target', 'To Reach Level'].map((field) => (
                          <label key={field} style={styles.compactLineField}>
                            <span style={styles.lineLabel}>{field}:</span>
                            <input
                              value={sheet.experienceDetails[field]}
                              onChange={updateSheetRecordField('experienceDetails', field)}
                              readOnly={field === 'Bonus' && hasClassXpBonusRule(characterClass)}
                              style={styles.lineInput}
                            />
                          </label>
                        ))}
                      </div>
                      <p style={styles.ruleNote}>Experience Points and Hit Points begins in Chapter 3 (pg. 35).</p>
                    </div>
                    <div style={styles.sheetSection}>
                      <h3 style={styles.sheetSectionTitle}>Hit Points</h3>
                      <div style={styles.miniGrid}>
                        {['Per Level', 'HP Roll', 'Adjustment', 'Total HP'].map((field) => (
                          <label key={field} style={styles.compactLineField}><span style={styles.lineLabel}>{field}:</span><input value={sheet.hitPointDetails[field]} onChange={updateSheetRecordField('hitPointDetails', field)} readOnly={field === 'Total HP'} style={styles.lineInput} /></label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={styles.sheetSection}>
                    <h3 style={styles.sheetSectionTitle}>Armor Class</h3>
                    <div style={styles.compactStatsGrid}>
                      {[
                        ['Base', 'Base'],
                        ['Armor Type (pg 92)', 'Armor Type'],
                        ['Helm', 'Helm'],
                        ['Shield', 'Shield'],
                        ['Magical', 'Magical'],
                        ['Real', 'Real'],
                      ].map(([label, field]) => (
                        <label key={field} style={styles.compactLineField}>
                          <span style={styles.lineLabel}>{label}:</span>
                          {field === 'Armor Type' ? (
                            <select value={sheet.armorDetails[field]} onChange={updateSheetRecordField('armorDetails', field)} style={styles.lineInput}>
                              <option value="">{armorTypeOptions.length ? 'Select armor' : 'No armor'}</option>
                              {armorTypeOptions.map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          ) : field === 'Helm' ? (
                            <select value={sheet.armorDetails[field]} onChange={updateSheetRecordField('armorDetails', field)} style={styles.lineInput}>
                              <option value="">{helmOptions.length ? 'Select helm' : 'No helm'}</option>
                              {helmOptions.map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          ) : field === 'Shield' ? (
                            <select value={sheet.armorDetails[field]} onChange={updateSheetRecordField('armorDetails', field)} style={styles.lineInput}>
                              <option value="">{shieldOptions.length ? 'Select shield' : 'No shield'}</option>
                              {shieldOptions.map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          ) : (
                            <input value={sheet.armorDetails[field]} onChange={updateSheetRecordField('armorDetails', field)} readOnly={field === 'Real'} style={styles.lineInput} />
                          )}
                        </label>
                      ))}
                    </div>
                    <p style={styles.ruleNote}>AC Base 10 - Def Adj. Real AC = Base - Type, Helm, Shield, and Magical.</p>
                  </div>

                  <div style={styles.sheetSection}>
                    <div style={styles.weaponHeader}>
                      <h3 style={styles.sheetSectionTitle}>Weapons</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        {selectedSoulSwordRow && (
                          <>
                            <select
                              value={selectedSoulSwordRow.soulSwordColor}
                              onChange={updateSoulSwordColor}
                              style={{ ...styles.lineInput, minWidth: 110 }}
                            >
                              <option value="">Select color</option>
                              {SOUL_SWORD_COLOR_OPTIONS.map((color) => (
                                <option key={color} value={color.toLowerCase()}>{color}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={toggleSoulSwordIgnite}
                              style={styles.smallActionButton}
                              disabled={!selectedSoulSwordRow.soulSwordColor}
                            >
                              {selectedSoulSwordRow.soulSwordIgnited ? 'Unignite' : 'Ignite'}
                            </button>
                            {selectedSoulSwordRow.soulSwordIgnited && (
                              <span style={{ ...styles.lineLabel, color: '#7f1d1d' }}>Critical on a 16-20</span>
                            )}
                          </>
                        )}
                        <button type="button" onClick={addWeaponLine} style={styles.smallActionButton}>Add weapon</button>
                      </div>
                    </div>
                    <div style={styles.weaponTable}>
                      <div style={{ ...styles.weaponTableGroupHead, gridColumn: '1 / span 1' }}>Weapon</div>
                      <div style={{ ...styles.weaponTableGroupHead, gridColumn: '2 / span 1' }}>WAC</div>
                      <div style={{ ...styles.weaponTableGroupHead, ...styles.thacoGroupHead, gridColumn: '3 / span 4' }}>THAC0</div>
                      <div style={{ ...styles.weaponTableGroupHead, ...styles.speedGroupHead, gridColumn: '7 / span 4' }}>Speed Factor</div>
                      <div style={{ ...styles.weaponTableGroupHead, ...styles.damageGroupHead, gridColumn: '11 / span 6' }}>Damage</div>
                      <div style={styles.weaponTableHead}>Name</div>
                      <div style={styles.weaponTableHead}>WAC</div>
                      <div style={styles.weaponTableHead}>W</div>
                      <div style={styles.weaponTableHead}>SB</div>
                      <div style={styles.weaponTableHead}>SP</div>
                      <div style={styles.weaponTableHead}>R</div>
                      <div style={styles.weaponTableHead}>W</div>
                      <div style={styles.weaponTableHead}>RA</div>
                      <div style={styles.weaponTableHead}>WB</div>
                      <div style={styles.weaponTableHead}>R</div>
                      <div style={styles.weaponTableHead}>S-M</div>
                      <div style={styles.weaponTableHead}>L</div>
                      <div style={styles.weaponTableHead}>W</div>
                      <div style={styles.weaponTableHead}>SB</div>
                      <div style={styles.weaponTableHead}>SP</div>
                      <div style={styles.weaponTableHead}>R</div>
                      {sheet.weaponRows.map((row, rowIndex) => (
                        <React.Fragment key={row.id}>
                          {WEAPON_FIELDS.map((field) => {
                            const isSoulSwordIgnited = isSoulSwordLine(row.weapon) && row.soulSwordIgnited;
                            const soulSwordGlow = isSoulSwordIgnited
                              ? { boxShadow: `inset 0 0 0 2px ${getSoulSwordGlowColor(row.soulSwordColor)}, 0 0 10px ${getSoulSwordGlowColor(row.soulSwordColor)}` }
                              : {};

                            if (field === 'weapon') {
                              return (
                                <select
                                  key={`${row.id}-${field}`}
                                  value={row[field]}
                                  onChange={handleWeaponSelect(rowIndex)}
                                  style={{ ...styles.tableInput, ...soulSwordGlow }}
                                >
                                  <option value="">Select Weapon</option>
                                  {getWeaponEquipmentLines(sheet.equipmentDetails, row.weapon).map((line) => (
                                    <option key={line} value={line}>{getWeaponDisplayLabel(line)}</option>
                                  ))}
                                </select>
                              );
                            }

                            return (
                              <input
                                key={`${row.id}-${field}`}
                                value={getWeaponFieldDisplayValue(field, row[field] as string)}
                                onChange={updateWeaponRow(rowIndex, field)}
                                readOnly={WEAPON_DERIVED_READONLY_FIELDS.includes(field)}
                                style={WEAPON_CHART_CENTERED_FIELDS.includes(field)
                                  ? { ...styles.centeredTableInput, ...soulSwordGlow }
                                  : { ...styles.tableInput, ...soulSwordGlow }}
                              />
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                    <p style={styles.ruleNote}>Specialization: +1 to Hit, +2 to Damage. Double Specialization: +3 to Hit, +3 to Damage.</p>
                    <p style={styles.ruleNote}>WAC is Real Speed Factor for parry rolls. THAC0 R = Base THAC0 - (W + SB + SP). Speed Factor R = W - (RA + WB). Damage R = W + SB + SP.</p>
                  </div>

                  <div style={styles.sheetSection}>
                    <h3 style={styles.sheetSectionTitle}>THAC0 Chart</h3>
                    <div style={styles.thacoChart}>
                      <div style={styles.weaponTableHead}>Weapon</div>
                      {THACO_ARMOR_CLASSES.map((armorClass) => <div key={armorClass} style={styles.weaponTableHead}>{armorClass}</div>)}
                      {sheet.weaponRows.map((row, rowIndex) => (
                        <React.Fragment key={`${row.id}-chart`}>
                          <div
                            style={{
                              ...styles.thacoWeaponName,
                              ...(isSoulSwordLine(row.weapon) && row.soulSwordIgnited
                                ? { boxShadow: `inset 0 0 0 2px ${getSoulSwordGlowColor(row.soulSwordColor)}, 0 0 10px ${getSoulSwordGlowColor(row.soulSwordColor)}` }
                                : {}),
                            }}
                          >
                            {getWeaponDisplayLabel(row.weapon) || `Weapon ${rowIndex + 1}`}
                          </div>
                          {THACO_ARMOR_CLASSES.map((armorClass) => (
                            <div
                              key={`${row.id}-${armorClass}`}
                              style={{
                                ...styles.thacoCell,
                                ...(isSoulSwordLine(row.weapon) && row.soulSwordIgnited
                                  ? { boxShadow: `inset 0 0 0 2px ${getSoulSwordGlowColor(row.soulSwordColor)}, 0 0 10px ${getSoulSwordGlowColor(row.soulSwordColor)}` }
                                  : {}),
                              }}
                            >
                              {getWeaponThacoChartTarget(row, armorClass)}
                            </div>
                          ))}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </>
              ) : activeSheetPage === 'Page 3' ? (
                <>
                  <div style={styles.sheetSection}>
                    <div style={styles.weaponHeader}>
                      <h3 style={styles.sheetSectionTitle}>Weapon Proficiencies <span style={styles.subtleTitle}>#Slot numbers Pg. 71</span></h3>
                      <button type="button" onClick={addWeaponProficiencyLine} style={styles.smallActionButton}>Add line</button>
                    </div>
                    <div style={styles.proficiencyTable}>
                      <div style={styles.weaponTableHead}>Weapon/Group</div>
                      <div style={styles.weaponTableHead}>Slots</div>
                      {sheet.weaponProficiencies.map((row, rowIndex) => (
                        <React.Fragment key={row.id}>
                          <select
                            value={row.name}
                            onChange={updateWeaponProficiencyRow(rowIndex, 'name')}
                            style={styles.tableInput}
                          >
                            <option value="">Select Weapon</option>
                            {getWeaponEquipmentLines(sheet.equipmentDetails, row.name).map((line) => (
                              <option key={line} value={line}>{getWeaponDisplayLabel(line)}</option>
                            ))}
                          </select>
                          <select
                            value={row.slots}
                            onChange={updateWeaponProficiencyRow(rowIndex, 'slots')}
                            style={styles.centeredTableInput}
                          >
                            <option value="">Slots</option>
                            {weaponProficiencySlotOptions.map((slotOption) => (
                              <option
                                key={slotOption.value}
                                value={slotOption.value}
                                disabled={Boolean(
                                  slotOption.minLevel
                                  && currentClassLevel < slotOption.minLevel,
                                )}
                              >
                                {slotOption.label}
                              </option>
                            ))}
                          </select>
                        </React.Fragment>
                      ))}
                    </div>
                    <div style={styles.proficiencySlotRow}>
                      <label style={styles.compactLineField}>
                        <span style={styles.lineLabel}>Initial Proficiency Slots:</span>
                        <input value={sheet.proficiencyDetails['Weapon Initial Slots']} onChange={updateSheetRecordField('proficiencyDetails', 'Weapon Initial Slots')} style={styles.lineInput} />
                      </label>
                      <label style={styles.compactLineField}>
                        <span style={styles.lineLabel}>One additional every:</span>
                        <input value={sheet.proficiencyDetails['Weapon Additional Every']} onChange={updateSheetRecordField('proficiencyDetails', 'Weapon Additional Every')} style={styles.lineInput} />
                      </label>
                      <span style={styles.lineLabel}>levels</span>
                    </div>
                  </div>

                  <div style={styles.twoColumnSections}>
                    <div style={styles.sheetSection}>
                      <h3 style={styles.sheetSectionTitle}>Non-Weapon Proficiencies <span style={styles.subtleTitle}>#Roll Secondary Skill Pg. 75</span></h3>
                      <label style={styles.compactLineField}>
                        <span style={styles.lineLabel}>Secondary Skill:</span>
                        <select value={sheet.proficiencyDetails['Secondary Skill']} onChange={handleSecondarySkillChange} style={styles.lineInput}>
                          <option value="">Select secondary skill</option>
                          {SECONDARY_SKILLS.map((skill) => (
                            <option key={skill.roll} value={skill.name}>
                              {skill.roll} - {skill.name}{skill.description ? ` (${skill.description})` : ''}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div style={styles.nonWeaponScroll}>
                        <div style={styles.nonWeaponTable}>
                          <div style={styles.weaponTableHead}>Proficiency</div>
                          <div style={styles.weaponTableHead}>Slots</div>
                          <div style={styles.weaponTableHead}>Attribute</div>
                          <div style={styles.weaponTableHead}>Mod</div>
                          {sheet.nonWeaponProficiencies.map((row, rowIndex) => (
                            <React.Fragment key={row.id}>
                              <input value={row.name} onChange={updateNonWeaponProficiencyRow(rowIndex, 'name')} style={styles.tableInput} />
                              <input value={row.slots} onChange={updateNonWeaponProficiencyRow(rowIndex, 'slots')} style={styles.tableInput} />
                              <input value={row.attribute} onChange={updateNonWeaponProficiencyRow(rowIndex, 'attribute')} style={styles.tableInput} />
                              <input value={row.attributeMod} onChange={updateNonWeaponProficiencyRow(rowIndex, 'attributeMod')} style={styles.tableInput} />
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                      <button type="button" onClick={addNonWeaponProficiencyLine} style={styles.smallActionButton}>Add proficiency</button>
                      <div style={styles.proficiencySlotRow}>
                        <label style={styles.compactLineField}>
                          <span style={styles.lineLabel}>Initial Proficiency Slots:</span>
                          <input value={sheet.proficiencyDetails['Non-Weapon Initial Slots']} onChange={updateSheetRecordField('proficiencyDetails', 'Non-Weapon Initial Slots')} style={styles.lineInput} />
                        </label>
                        <label style={styles.compactLineField}>
                          <span style={styles.lineLabel}>One additional every:</span>
                          <input value={sheet.proficiencyDetails['Non-Weapon Additional Every']} onChange={updateSheetRecordField('proficiencyDetails', 'Non-Weapon Additional Every')} style={styles.lineInput} />
                        </label>
                        <span style={styles.lineLabel}>levels</span>
                      </div>
                    </div>

                    <div style={styles.sheetSection}>
                      <h3 style={styles.sheetSectionTitle}>Tracking Modifiers <span style={styles.subtleTitle}>(Wisdom) Pg. 86</span></h3>
                      <label style={styles.compactLineField}>
                        <span style={styles.lineLabel}>Tracking Wisdom:</span>
                        <input value={sheet.proficiencyDetails['Tracking Wisdom']} onChange={updateSheetRecordField('proficiencyDetails', 'Tracking Wisdom')} style={styles.lineInput} />
                      </label>
                      <div style={styles.trackingGrid}>
                        {TRACKING_MODIFIER_LABELS.map((modifier) => (
                          <React.Fragment key={modifier}>
                            <div style={styles.trackingLabel}>{modifier}</div>
                            <input value={sheet.trackingModifiers[modifier]} onChange={updateSheetRecordField('trackingModifiers', modifier)} style={styles.tableInput} />
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={styles.twoColumnSections}>
                    <div style={styles.sheetSection}>
                      <h3 style={styles.sheetSectionTitle}>Turning Undead <span style={styles.subtleTitle}>Pg. 137</span></h3>
                      <div style={styles.turningGrid}>
                        {TURNING_UNDEAD_LABELS.map(([key, label]) => (
                          <React.Fragment key={key}>
                            <span style={styles.lineLabel}>{label}</span>
                            <input value={sheet.turningUndead[key]} onChange={updateSheetRecordField('turningUndead', key)} style={styles.lineInput} />
                          </React.Fragment>
                        ))}
                      </div>
                      <p style={styles.ruleNote}>T = turn. D = destroy. D* = destroy plus an additional 2d4 creatures of this type. Paladins turn as priests two levels lower.</p>
                    </div>

                    <div style={styles.sheetSection}>
                      <h3 style={styles.sheetSectionTitle}>Thieving Skill Points</h3>
                      <label style={styles.compactLineField}>
                        <span style={styles.lineLabel}>Points to Spend:</span>
                        <input
                          value={sheet.proficiencyDetails['Thieving Skill Points']}
                          readOnly
                          style={styles.lineInput}
                        />
                      </label>
                      <div style={styles.descriptionBlock}>
                        {THIEVING_DESCRIPTIONS.map((description) => (
                          <p key={description} style={styles.ruleNote}>{description}</p>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={styles.sheetSection}>
                    <h3 style={styles.sheetSectionTitle}>Thieving Skills <span style={styles.subtleTitle}>Pg. 54</span></h3>
                    <div style={styles.thievingTable}>
                      {THIEVING_SKILL_COLUMNS.map(([, label]) => (
                        <div key={label} style={styles.weaponTableHead}>{label}</div>
                      ))}
                      {sheet.thievingSkills.map((row, rowIndex) => (
                        <React.Fragment key={row.id}>
                          {THIEVING_SKILL_COLUMNS.map(([field]) => (
                            <input
                              key={`${row.id}-${field}`}
                              value={row[field]}
                              onChange={updateThievingSkillRow(rowIndex, field)}
                              readOnly={field === 'dex' || field === 'realPercent'}
                              style={field === 'skill' ? styles.tableInput : styles.centeredTableInput}
                            />
                          ))}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </>
              ) : activeSheetPage === 'Page 4' ? (
                <>
                  <div style={styles.sheetSection}>
                    <h3 style={styles.sheetSectionTitle}>Saving Throws</h3>
                    <div style={styles.savingThrowTable}>
                      <div style={styles.weaponTableHead}>Saving Throw</div>
                      <div style={styles.weaponTableHead}>Base</div>
                      <div style={styles.weaponTableHead}>Real</div>
                      <div style={styles.weaponTableHead}>D4</div>
                      <div style={styles.weaponTableHead}>1</div>
                      <div style={styles.weaponTableHead}>2</div>
                      <div style={styles.weaponTableHead}>3</div>
                      <div style={styles.weaponTableHead}>4</div>
                      {sheet.savingThrowRows.map((row, rowIndex) => (
                        <React.Fragment key={row.id}>
                          <input value={row.name} onChange={updateSavingThrowRow(rowIndex, 'name')} style={styles.tableInput} />
                          <input value={row.base} onChange={updateSavingThrowRow(rowIndex, 'base')} style={styles.centeredTableInput} />
                          <input value={row.real} onChange={updateSavingThrowRow(rowIndex, 'real')} inputMode="numeric" style={styles.centeredTableInput} type="text" />
                          <input value={row.d4} onChange={updateSavingThrowRow(rowIndex, 'd4')} inputMode="numeric" style={styles.centeredTableInput} type="text" />
                          {SAVING_THROW_CHECK_FIELDS.map((checkField) => (
                            <label key={`${row.id}-${checkField}`} style={styles.checkboxCell}>
                              <input
                                checked={Boolean(row[checkField])}
                                onChange={updateSavingThrowCheck(rowIndex, checkField)}
                                style={styles.checkboxInput}
                                type="checkbox"
                              />
                            </label>
                          ))}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  <div style={styles.twoColumnSections}>
                    <div style={styles.sheetSection}>
                      <h3 style={styles.sheetSectionTitle}>Saving Throw Reductions</h3>
                      <textarea
                        readOnly
                        value={getSavingThrowReductionSummary(sheet, characterClass)}
                        style={{ ...styles.sheetTextarea, minHeight: 110 }}
                      />
                    </div>
                    <div style={styles.sheetSection}>
                      <h3 style={styles.sheetSectionTitle}>Immunities</h3>
                      <textarea
                        value={sheet.savingThrowDetails.Immunities}
                        onChange={updateSheetRecordField('savingThrowDetails', 'Immunities')}
                        style={{ ...styles.sheetTextarea, minHeight: 110 }}
                      />
                    </div>
                  </div>

                  <div style={styles.sheetSection}>
                    <h3 style={styles.sheetSectionTitle}>Ability Bonuses and Race Notes</h3>
                    <div style={styles.savingRulesGrid}>
                      {SAVING_THROW_RULES.map((rule) => (
                        <p key={rule} style={styles.ruleNote}>{rule}</p>
                      ))}
                    </div>
                  </div>
                </>
              ) : activeSheetPage === 'Page 5' ? (
                <>
                  <div style={styles.sheetSection}>
                    <h3 style={styles.sheetSectionTitle}>Coins, Gems, and Misc</h3>
                    <div style={styles.compactStatsGrid}>
                      {[...COIN_FIELDS, 'Gems', 'Misc'].map((field) => (
                        <label key={field} style={styles.compactLineField}>
                          <span style={styles.lineLabel}>{field}:</span>
                          <input value={sheet.equipmentDetails[field]} onChange={updateSheetRecordField('equipmentDetails', field)} style={styles.lineInput} />
                        </label>
                      ))}
                    </div>
                    <p style={styles.ruleNote}>Starting Equipment - Cost 19 GP of starting coins.</p>
                  </div>

                  <div style={styles.sheetSection}>
                    <div style={styles.weaponHeader}>
                      <h3 style={styles.sheetSectionTitle}>Starting Equipment</h3>
                      <button type="button" onClick={() => setIsEquipmentModalOpen(true)} style={styles.smallActionButton}>
                        Equipment List
                      </button>
                    </div>
                    <div style={styles.equipmentList}>
                      {STARTING_EQUIPMENT.map((item, index) => (
                        <EquipmentItemRow
                          key={item}
                          value={sheet.equipmentDetails[`Starting Equipment ${index + 1}`]}
                          onChange={updateSheetRecordField('equipmentDetails', `Starting Equipment ${index + 1}`)}
                          onRemove={() => removeStartingEquipmentLine(index)}
                          inputStyle={styles.equipmentItemInput}
                        />
                      ))}
                    </div>
                  </div>

                  <div style={styles.sheetSection}>
                    <div style={styles.weaponHeader}>
                      <h3 style={styles.sheetSectionTitle}>Other Equipment</h3>
                      <button type="button" onClick={() => addEquipmentBucketLine('Other')} style={styles.smallActionButton}>Add item</button>
                    </div>
                    <div style={styles.equipmentList}>
                      {getEquipmentBucketLines('Other').map((item, index) => (
                        <EquipmentItemRow
                          key={`other-equipment-${index}`}
                          value={item}
                          onChange={updateEquipmentBucketLine('Other', index)}
                          onRemove={() => removeEquipmentBucketLine('Other', index)}
                          inputStyle={styles.equipmentItemInput}
                        />
                      ))}
                    </div>
                  </div>

                  <div style={styles.threeColumnSections}>
                    {['Armor', 'Weapons', 'Magical'].map((field) => (
                      <div key={field} style={styles.sheetSection}>
                        <div style={styles.weaponHeader}>
                          <h3 style={styles.sheetSectionTitle}>{field === 'Magical' ? 'Magical Items' : field}</h3>
                          <button type="button" onClick={() => addEquipmentBucketLine(field)} style={styles.smallActionButton}>Add item</button>
                        </div>
                        <div style={styles.equipmentList}>
                          {getEquipmentBucketLines(field).map((item, index) => (
                            <EquipmentItemRow
                              key={`${field}-equipment-${index}`}
                              value={item}
                              onChange={updateEquipmentBucketLine(field, index)}
                              onRemove={() => removeEquipmentBucketLine(field, index)}
                              inputStyle={styles.equipmentItemInput}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={styles.placeholderPage}>
                  {activeSheetPage} is ready for the next section.
                </div>
              )}
            </section>
          )}

        </form>

        <EquipmentListModal
          isOpen={isEquipmentModalOpen}
          onClose={() => setIsEquipmentModalOpen(false)}
          onEquipLine={handleEquipLine}
          actionLabel="Buy"
        />
      </main>
    </ImageBackgroundWrapper>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    color: '#f8fafc',
    margin: '0 auto',
    maxWidth: 1120,
    padding: '32px 16px 56px',
  },
  headerRow: {
    alignItems: 'flex-start',
    display: 'flex',
    gap: 16,
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  headerActions: {
    alignItems: 'center',
    display: 'flex',
    gap: 10,
  },
  eyebrow: {
    color: '#d4af37',
    fontSize: 14,
    fontWeight: 800,
    margin: '0 0 8px',
  },
  title: {
    fontSize: 38,
    margin: 0,
  },
  backButton: {
    background: 'rgba(15,23,42,0.72)',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 6,
    color: '#a9fff7',
    cursor: 'pointer',
    fontWeight: 800,
    minHeight: 40,
    padding: '0 14px',
  },
  createButton: {
    minHeight: 40,
  },
  modeRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  modeButton: {
    background: 'rgba(15,23,42,0.72)',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 6,
    color: '#cbd5e1',
    cursor: 'pointer',
    fontWeight: 800,
    minHeight: 40,
    padding: '0 14px',
  },
  modeButtonActive: {
    background: 'rgba(169,255,247,0.12)',
    borderColor: 'rgba(169,255,247,0.44)',
    color: '#a9fff7',
  },
  form: {
    display: 'grid',
    gap: 16,
  },
  panel: {
    background: 'rgba(15,23,42,0.9)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    boxShadow: '0 18px 42px rgba(0,0,0,0.24)',
    display: 'grid',
    gap: 12,
    padding: 16,
  },
  sectionTitle: {
    color: '#a9fff7',
    fontSize: 18,
    fontWeight: 800,
    margin: 0,
  },
  identityGrid: {
    display: 'grid',
    gap: 12,
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  },
  field: {
    display: 'grid',
    gap: 8,
  },
  label: {
    color: '#d4af37',
    fontSize: 12,
    fontWeight: 800,
    textTransform: 'uppercase',
  },
  control: {
    background: 'rgba(2,6,23,0.84)',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 6,
    color: '#f8fafc',
    fontSize: 16,
    minHeight: 42,
    outline: 'none',
    padding: '0 12px',
  },
  sheet: {
    background: [
      'radial-gradient(circle at 15% 8%, rgba(255,255,255,0.52), transparent 28%)',
      'radial-gradient(circle at 88% 12%, rgba(108,69,33,0.16), transparent 34%)',
      'radial-gradient(circle at 18% 88%, rgba(119,75,31,0.14), transparent 32%)',
      'linear-gradient(135deg, #ead4a6 0%, #f6e8c8 42%, #dfc18a 100%)',
    ].join(', '),
    border: '1px solid rgba(91,58,28,0.48)',
    borderRadius: 8,
    color: '#24180f',
    display: 'grid',
    fontFamily: '"Palatino Linotype", "Book Antiqua", Georgia, serif',
    gap: 18,
    padding: 24,
    boxShadow: '0 18px 48px rgba(0,0,0,0.34), inset 0 0 34px rgba(94,58,22,0.16)',
  },
  sheetHeader: {
    alignItems: 'center',
    display: 'flex',
    gap: 12,
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  sheetTitle: {
    color: '#3a2413',
    fontFamily: '"Palatino Linotype", "Book Antiqua", Georgia, serif',
    fontSize: 20,
    fontWeight: 900,
    letterSpacing: 0.4,
    margin: 0,
  },
  sheetTabs: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  sheetTab: {
    background: 'rgba(236,211,159,0.78)',
    border: '1px solid rgba(91,58,28,0.42)',
    borderRadius: 4,
    color: '#3a2413',
    cursor: 'pointer',
    fontFamily: '"Palatino Linotype", "Book Antiqua", Georgia, serif',
    fontWeight: 800,
    minHeight: 32,
    padding: '0 10px',
  },
  sheetTabActive: {
    background: '#523315',
    color: '#fff3d2',
  },
  lineGrid: {
    display: 'grid',
    gap: '14px 16px',
    gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
  },
  detailRow: {
    alignItems: 'end',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px 14px',
  },
  lineField: {
    alignItems: 'end',
    display: 'grid',
    gap: 4,
    gridColumn: 'span 2',
  },
  shortLineField: {
    alignItems: 'end',
    display: 'grid',
    gap: 4,
    gridColumn: 'span 1',
  },
  compactLineField: {
    alignItems: 'end',
    display: 'grid',
    flex: '1 1 92px',
    gap: 4,
    minWidth: 0,
  },
  tinyLineField: {
    alignItems: 'end',
    display: 'grid',
    flex: '0 1 58px',
    gap: 4,
    minWidth: 52,
  },
  smallLineField: {
    alignItems: 'end',
    display: 'grid',
    flex: '0 1 78px',
    gap: 4,
    minWidth: 68,
  },
  mediumLineField: {
    alignItems: 'end',
    display: 'grid',
    flex: '0 1 94px',
    gap: 4,
    minWidth: 78,
  },
  socialClassField: {
    alignItems: 'end',
    display: 'grid',
    flex: '1 1 164px',
    gap: 4,
    minWidth: 0,
  },
  fullLine: {
    gridColumn: '1 / -1',
  },
  lineLabel: {
    color: '#4b2e16',
    fontFamily: '"Palatino Linotype", "Book Antiqua", Georgia, serif',
    fontSize: 13,
    fontWeight: 800,
  },
  lineInput: {
    background: 'rgba(255,248,221,0.22)',
    border: 0,
    borderBottom: '1px solid rgba(62,37,17,0.66)',
    boxSizing: 'border-box',
    color: '#24180f',
    fontFamily: '"Palatino Linotype", "Book Antiqua", Georgia, serif',
    fontSize: 16,
    minHeight: 34,
    minWidth: 0,
    outline: 'none',
    padding: '4px 5px',
    width: '100%',
  },
  scoreInput: {
    background: 'rgba(255,248,221,0.34)',
    border: '1px solid rgba(82,51,21,0.28)',
    borderBottom: '2px solid rgba(62,37,17,0.78)',
    borderRadius: 4,
    boxSizing: 'border-box',
    color: '#24180f',
    fontFamily: '"Palatino Linotype", "Book Antiqua", Georgia, serif',
    fontSize: 20,
    fontWeight: 900,
    minHeight: 38,
    minWidth: 0,
    outline: 'none',
    padding: '3px 6px',
    textAlign: 'center',
    width: '100%',
  },
  textBlock: {
    display: 'grid',
    gap: 8,
  },
  sheetSection: {
    border: '1px solid rgba(91,58,28,0.28)',
    borderRadius: 6,
    display: 'grid',
    gap: 12,
    padding: 12,
  },
  sheetSectionTitle: {
    color: '#3a2413',
    fontSize: 16,
    fontWeight: 900,
    margin: 0,
  },
  subtleTitle: {
    color: '#6b4f35',
    fontSize: 12,
    fontWeight: 800,
  },
  abilityLine: {
    alignItems: 'end',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px 14px',
  },
  scoreField: {
    alignItems: 'end',
    display: 'grid',
    flex: '0 1 112px',
    gap: 4,
    minWidth: 96,
  },
  modifierField: {
    alignItems: 'end',
    display: 'grid',
    flex: '1 1 82px',
    gap: 4,
    minWidth: 68,
  },
  longModifierField: {
    alignItems: 'end',
    display: 'grid',
    flex: '1 1 170px',
    gap: 4,
    minWidth: 130,
  },
  comelinessLine: {
    alignItems: 'end',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px 14px',
  },
  inlineNote: {
    color: '#5b4026',
    flex: '2 1 380px',
    fontSize: 13,
    fontWeight: 800,
    lineHeight: 1.4,
    margin: 0,
  },
  ruleNote: {
    color: '#5b4026',
    fontSize: 13,
    fontWeight: 800,
    lineHeight: 1.45,
    margin: 0,
  },
  descriptionBlock: {
    display: 'grid',
    gap: 6,
  },
  compactStatsGrid: {
    display: 'grid',
    gap: '12px 14px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
  },
  twoColumnSections: {
    display: 'grid',
    gap: 14,
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  },
  threeColumnSections: {
    display: 'grid',
    gap: 14,
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  },
  miniGrid: {
    display: 'grid',
    gap: '12px 14px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
  },
  weaponHeader: {
    alignItems: 'center',
    display: 'flex',
    gap: 12,
    justifyContent: 'space-between',
  },
  smallActionButton: {
    background: '#523315',
    border: '1px solid rgba(91,58,28,0.42)',
    borderRadius: 4,
    color: '#fff3d2',
    cursor: 'pointer',
    fontFamily: '"Palatino Linotype", "Book Antiqua", Georgia, serif',
    fontWeight: 800,
    minHeight: 32,
    padding: '0 10px',
  },
  smallLinkButton: {
    alignItems: 'center',
    background: '#523315',
    border: '1px solid rgba(91,58,28,0.42)',
    borderRadius: 4,
    color: '#fff3d2',
    display: 'inline-flex',
    fontFamily: '"Palatino Linotype", "Book Antiqua", Georgia, serif',
    fontWeight: 800,
    minHeight: 32,
    padding: '0 10px',
    textDecoration: 'none',
  },
  weaponTable: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: 'minmax(130px, 1.5fr) minmax(54px, 0.7fr) repeat(4, minmax(54px, 0.8fr)) repeat(4, minmax(54px, 0.8fr)) repeat(6, minmax(58px, 0.9fr))',
    overflowX: 'auto',
  },
  weaponTableGroupHead: {
    background: '#3f2814',
    color: '#fff3d2',
    fontSize: 13,
    fontWeight: 900,
    minHeight: 30,
    padding: '7px 5px',
    textAlign: 'center',
  },
  thacoGroupHead: {
    borderLeft: '3px solid rgba(255,243,210,0.55)',
  },
  speedGroupHead: {
    borderLeft: '3px solid rgba(255,243,210,0.55)',
  },
  damageGroupHead: {
    borderLeft: '3px solid rgba(255,243,210,0.55)',
  },
  weaponTableHead: {
    background: 'rgba(82,51,21,0.88)',
    color: '#fff3d2',
    fontSize: 12,
    fontWeight: 900,
    minHeight: 28,
    padding: '6px 5px',
    textAlign: 'center',
  },
  tableInput: {
    background: 'rgba(255,248,221,0.3)',
    border: '1px solid rgba(62,37,17,0.3)',
    boxSizing: 'border-box',
    color: '#24180f',
    fontFamily: '"Palatino Linotype", "Book Antiqua", Georgia, serif',
    fontSize: 14,
    minHeight: 32,
    minWidth: 0,
    outline: 'none',
    padding: '4px 5px',
    width: '100%',
  },
  centeredTableInput: {
    background: 'rgba(255,248,221,0.3)',
    border: '1px solid rgba(62,37,17,0.3)',
    boxSizing: 'border-box',
    color: '#24180f',
    fontFamily: '"Palatino Linotype", "Book Antiqua", Georgia, serif',
    fontSize: 14,
    minHeight: 32,
    minWidth: 0,
    outline: 'none',
    padding: '4px 5px',
    textAlign: 'center',
    width: '100%',
  },
  proficiencyTable: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: 'minmax(220px, 1fr) minmax(70px, 0.18fr)',
  },
  nonWeaponTable: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: 'minmax(170px, 1fr) minmax(54px, 0.18fr) minmax(82px, 0.3fr) minmax(54px, 0.18fr)',
  },
  nonWeaponScroll: {
    border: '1px solid rgba(62,37,17,0.24)',
    borderRadius: 4,
    maxHeight: 360,
    overflowY: 'auto',
    paddingRight: 3,
  },
  proficiencySlotRow: {
    alignItems: 'end',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px 14px',
  },
  trackingGrid: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: 'minmax(172px, 1fr) minmax(46px, 0.18fr)',
  },
  trackingLabel: {
    alignItems: 'center',
    background: 'rgba(255,248,221,0.24)',
    border: '1px solid rgba(62,37,17,0.22)',
    color: '#24180f',
    display: 'flex',
    fontSize: 12,
    fontWeight: 800,
    lineHeight: 1.15,
    minHeight: 27,
    padding: '3px 6px',
  },
  turningGrid: {
    display: 'grid',
    gap: '10px 12px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(92px, 1fr))',
  },
  thievingTable: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: 'minmax(132px, 1.3fr) repeat(10, minmax(58px, 0.7fr))',
    overflowX: 'auto',
  },
  savingThrowTable: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: 'minmax(180px, 1fr) minmax(54px, 0.2fr) minmax(92px, 0.38fr) minmax(48px, 0.16fr) repeat(4, minmax(34px, 0.12fr))',
  },
  checkboxCell: {
    alignItems: 'center',
    background: 'rgba(255,248,221,0.3)',
    border: '1px solid rgba(62,37,17,0.3)',
    display: 'flex',
    justifyContent: 'center',
    minHeight: 38,
  },
  checkboxInput: {
    accentColor: '#523315',
    height: 16,
    width: 16,
  },
  savingRulesGrid: {
    columnGap: 18,
    columns: '2 260px',
  },
  equipmentList: {
    columnGap: 18,
    columns: '3 220px',
  },
  equipmentItemInput: {
    background: 'rgba(255,248,221,0.24)',
    border: 0,
    borderBottom: '1px solid rgba(62,37,17,0.34)',
    boxSizing: 'border-box',
    breakInside: 'avoid',
    color: '#24180f',
    display: 'block',
    fontFamily: '"Palatino Linotype", "Book Antiqua", Georgia, serif',
    fontSize: 14,
    fontWeight: 800,
    lineHeight: 1.35,
    marginBottom: 7,
    minHeight: 28,
    outline: 'none',
    padding: '3px 5px',
    width: '100%',
  },
  otherEquipmentInput: {
    background: 'rgba(255,248,221,0.24)',
    border: 0,
    borderBottom: '1px solid rgba(62,37,17,0.34)',
    boxSizing: 'border-box',
    color: '#24180f',
    display: 'block',
    fontFamily: '"Palatino Linotype", "Book Antiqua", Georgia, serif',
    fontSize: 14,
    fontWeight: 800,
    lineHeight: 1.35,
    minHeight: 190,
    outline: 'none',
    padding: '6px 5px',
    resize: 'vertical',
    width: '100%',
  },
  xpAwardSummary: {
    alignItems: 'center',
    background: 'rgba(82,51,21,0.12)',
    border: '1px solid rgba(62,37,17,0.24)',
    borderRadius: 4,
    color: '#3a2413',
    display: 'flex',
    flexWrap: 'wrap',
    fontSize: 15,
    fontWeight: 900,
    gap: 10,
    justifyContent: 'space-between',
    minHeight: 40,
    padding: '8px 10px',
  },
  levelUpNotice: {
    background: 'rgba(78, 112, 42, 0.2)',
    border: '1px solid rgba(64, 92, 34, 0.42)',
    borderRadius: 5,
    color: '#2d461c',
    fontSize: 14,
    fontWeight: 900,
    lineHeight: 1.35,
    padding: '9px 10px',
  },
  thacoChart: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: 'minmax(130px, 1.4fr) repeat(21, minmax(36px, 1fr))',
    overflowX: 'auto',
  },
  thacoWeaponName: {
    background: 'rgba(255,248,221,0.38)',
    border: '1px solid rgba(62,37,17,0.22)',
    color: '#24180f',
    fontSize: 13,
    fontWeight: 900,
    minHeight: 30,
    padding: '6px 5px',
  },
  thacoCell: {
    background: 'rgba(255,248,221,0.28)',
    border: '1px solid rgba(62,37,17,0.2)',
    color: '#24180f',
    fontSize: 13,
    fontWeight: 800,
    minHeight: 30,
    padding: '6px 5px',
    textAlign: 'center',
  },
  sheetTextarea: {
    background: [
      'repeating-linear-gradient(rgba(251,239,201,0.64), rgba(251,239,201,0.64) 29px, rgba(78,46,20,0.28) 30px)',
      'linear-gradient(135deg, rgba(255,252,230,0.32), rgba(126,78,32,0.08))',
    ].join(', '),
    border: '1px solid rgba(91,58,28,0.3)',
    borderRadius: 6,
    color: '#24180f',
    fontFamily: '"Palatino Linotype", "Book Antiqua", Georgia, serif',
    fontSize: 16,
    lineHeight: '30px',
    minHeight: 64,
    outline: 'none',
    padding: '6px 8px',
    resize: 'vertical',
  },
  specialAbilitiesTextarea: {
    background: [
      'repeating-linear-gradient(rgba(251,239,201,0.64), rgba(251,239,201,0.64) 29px, rgba(78,46,20,0.28) 30px)',
      'linear-gradient(135deg, rgba(255,252,230,0.32), rgba(126,78,32,0.08))',
    ].join(', '),
    backgroundAttachment: 'local',
    border: '1px solid rgba(91,58,28,0.3)',
    borderRadius: 6,
    color: '#24180f',
    fontFamily: '"Palatino Linotype", "Book Antiqua", Georgia, serif',
    fontSize: 16,
    lineHeight: '30px',
    minHeight: 140,
    maxHeight: 240,
    outline: 'none',
    overflow: 'auto',
    padding: '6px 8px',
    resize: 'vertical',
  },
  placeholderPage: {
    border: '1px dashed rgba(91,64,38,0.42)',
    borderRadius: 6,
    color: '#6b4f35',
    fontWeight: 800,
    minHeight: 220,
    padding: 18,
  },
  error: {
    background: 'rgba(127,29,29,0.5)',
    border: '1px solid rgba(248,113,113,0.4)',
    borderRadius: 8,
    color: '#fecaca',
    margin: 0,
    padding: 12,
  },
};
