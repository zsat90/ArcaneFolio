import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import EquipmentListModal from '../../components/Equipment/EquipmentListModal';
import ImageBackgroundWrapper from '../../components/imageBackground';
import NavDrawer from '../../components/Navigation/navDrawer';
import { useSelectedCharacter } from '../../utils/character/characterState';
import {
  CharacterSheetState,
  NonWeaponProficiencyRow,
  ProficiencyRow,
  SavingThrowRow,
  ThievingSkillRow,
  WeaponRow,
  XPAwardRow,
  createEmptySheet,
  getCharacterSheet,
  setCharacterSheet,
} from '../../utils/character/characterSheetState';
import {
  formatExperience,
  getExperienceDefaults as getClassExperienceDefaults,
  getHitDieForClass,
  getLevelOptionsForClass,
  getLevelTitleForClass,
  parseExperience,
  parseLevelTitle,
} from '../../utils/character/experience';
import { COIN_FIELDS, COIN_VALUE_IN_DOLLARS, deductEquipmentCost } from '../../utils/character/coins';
import {
  adjustPartyCoinTotal,
  formatCurrency,
  getPartyTreasureCombinedValue,
  getStoredCoinAmount,
  parseCoinEntry,
} from '../../utils/character/partyTreasure';
import EquipmentItemRow from '../../components/CharacterSheet/EquipmentItemRow';
import RaceSelectOptions from '../../components/CharacterSheet/RaceSelectOptions';
import { getEquipmentLinesForCategory, withSelectedEquipmentOption } from '../../utils/character/equipment';
import { removeLineFromBucket, syncSheetAfterEquipmentRemoval } from '../../utils/character/equipmentRemoval';
import { withCalculatedRealArmorClass } from '../../utils/character/armorClass';
import { applyDexterityAdjustmentsToSheet, parseAbilityScore } from '../../utils/character/abilityScores';
import { getRaceSelectionForClass, getClassSpecialAbilitiesText, getClassXpBonusFieldValue, hasClassRules, hasClassXpBonusRule, isRaceAllowedForClass } from '../../utils/character/classRules';
import {
  createSavingThrowHandlers,
  SAVING_THROW_CHECK_FIELDS,
} from '../../utils/character/savingThrows';
import { withLevelAwareTotalHitPoints } from '../../utils/character/hitPoints';
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
  applyLevelChangeToSheet,
  type LevelUpAttentionKey,
} from '../../utils/character/levelUp';

const SHEET_PAGES = ['Page 1', 'Page 2', 'Page 3', 'Page 4', 'Page 5', 'Page 6', 'Page 7'];
const PAGE_TAB_LABELS: Record<string, string> = {
  'Page 1': 'Info',
  'Page 2': 'Combat',
  'Page 3': 'Proficiencies',
  'Page 4': 'Saving Throws',
  'Page 5': 'Equipment',
  'Page 6': 'XP/Valuables',
  'Page 7': 'Party Treasure',
};
const XP_COLUMN_COUNT = 3;
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
const THIEVING_DESCRIPTIONS = [
  'Thief/Rogue: begins with 90 points to allocate at character creation, then gains 30 additional points each level after 1st.',
  'Bard: begins with 60 points to allocate at character creation, then gains 30 additional points each level after 1st.',
];
const THIEVING_DEX_BONUS_CLASSES = ['Rogue', 'Bard'] as const;
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
const getXPAwardTotal = (rows: XPAwardRow[]) => (
  rows.reduce((total, row) => total + (parseExperience(row.xp) ?? 0), 0)
);

const getSavingThrowReductionSummary = (currentSheet: CharacterSheetState) => {
  return currentSheet.savingThrowDetails['Automatic Immunities'] || '';
};

const classUsesThievingDexBonus = (selectedClass: string) => (
  THIEVING_DEX_BONUS_CLASSES.includes(selectedClass as typeof THIEVING_DEX_BONUS_CLASSES[number])
);

const parseArrowCount = (value: string) => {
  if (!value.trim()) {
    return 0;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return Math.floor(parsed);
};

const parsePercentValue = (value: string) => {
  const parsed = Number(value.replace(/[^0-9-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatPercentValue = (value: number) => {
  if (value === 0) return '';
  return `${value > 0 ? '+' : ''}${value}%`;
};

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

const createProficiencyRow = (prefix: string, index: number): ProficiencyRow => ({
  id: `${prefix}-${Date.now()}-${index}`,
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

const SOUL_SWORD_COLOR_OPTIONS = SOUL_SWORD_COLORS.map((color) => (
  color.charAt(0).toUpperCase() + color.slice(1)
));

const createXPAwardRow = (index: number): XPAwardRow => ({
  id: `xp-award-${Date.now()}-${index}`,
  xp: '',
});

type LevelUpModalState = {
  isOpen: boolean;
  trigger: 'xp' | 'manual';
  oldLevel: number;
  newLevel: number;
  setXpToMinimum: boolean;
  baseSheet: CharacterSheetState | null;
  previewSheet: CharacterSheetState | null;
  reviewItems: string[];
  attentionKeys: LevelUpAttentionKey[];
};

const DEFAULT_LEVEL_UP_MODAL_STATE: LevelUpModalState = {
  isOpen: false,
  trigger: 'xp',
  oldLevel: 1,
  newLevel: 1,
  setXpToMinimum: false,
  baseSheet: null,
  previewSheet: null,
  reviewItems: [],
  attentionKeys: [],
};

export default function CharacterSheetPage() {
  const selectedCharacter = useSelectedCharacter();
  const [sheet, setSheet] = useState<CharacterSheetState>(() => createEmptySheet());
  const [saveState, setSaveState] = useState('Saved');
  const [activePage, setActivePage] = useState('Page 1');
  const [viewportWidth, setViewportWidth] = useState(1280);
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [partyCoinEntries, setPartyCoinEntries] = useState<Record<string, string>>({});
  const [levelUpModal, setLevelUpModal] = useState<LevelUpModalState>(DEFAULT_LEVEL_UP_MODAL_STATE);
  const [attentionKeys, setAttentionKeys] = useState<LevelUpAttentionKey[]>([]);
  const processedAutoLevelKeys = useRef(new Set<string>());
  const sheetHydratedForKey = useRef('');

  const sheetKey = selectedCharacter ? String(selectedCharacter.id) : '';
  const characterName = selectedCharacter?.name || 'No Character Selected';
  const characterClass = selectedCharacter?.characterClass || selectedCharacter?.class || '';
  const characterLevel = selectedCharacter?.level ? String(selectedCharacter.level) : '';
  const classLevelOptions = getLevelOptionsForClass(characterClass);
  const maxClassLevel = classLevelOptions[classLevelOptions.length - 1] ?? 20;
  const currentClassLevel = parseLevelTitle(sheet.levelTitle || characterLevel);
  const weaponProficiencySlotOptions = getWeaponProficiencySlotOptions(characterClass);
  const selectedSoulSwordIndex = sheet.weaponRows.findIndex((row) => isSoulSwordLine(row.weapon));
  const selectedSoulSwordRow = selectedSoulSwordIndex >= 0 ? sheet.weaponRows[selectedSoulSwordIndex] : null;
  const armorTypeOptions = withSelectedEquipmentOption(getEquipmentLinesForCategory(sheet.equipmentDetails, 'Armor'), sheet.armorDetails['Armor Type']);
  const helmOptions = withSelectedEquipmentOption(getEquipmentLinesForCategory(sheet.equipmentDetails, 'Helms'), sheet.armorDetails.Helm);
  const shieldOptions = withSelectedEquipmentOption(getEquipmentLinesForCategory(sheet.equipmentDetails, 'Shields'), sheet.armorDetails.Shield);
  const xpAwardTotal = getXPAwardTotal(sheet.xpAwardRows);
  const partyTreasureCombinedValue = getPartyTreasureCombinedValue(sheet.partyTreasureCoins);
  const currentXP = parseExperience(sheet.experienceDetails.Current);
  const nextXPTarget = parseExperience(sheet.experienceDetails['Next XP Target']);
  const isTabletViewport = viewportWidth <= 1024;
  const isCompactTabletViewport = viewportWidth <= 900;

  const hasAttention = (key: LevelUpAttentionKey) => attentionKeys.includes(key);
  const withAttentionStyle = (style: React.CSSProperties, key: LevelUpAttentionKey): React.CSSProperties => (
    hasAttention(key)
      ? {
        ...style,
        backgroundColor: 'rgba(254,226,226,0.6)',
        boxShadow: 'inset 0 0 0 2px rgba(220,38,38,0.55), 0 0 8px rgba(220,38,38,0.3)',
      }
      : style
  );
  const clearAttention = (...keys: LevelUpAttentionKey[]) => {
    if (!keys.length) return;
    setAttentionKeys((current) => current.filter((item) => !keys.includes(item)));
  };
  const clearAllAttention = () => {
    setAttentionKeys([]);
    setSaveState('Saved');
  };

  const createLevelUpModalState = (
    baseSheet: CharacterSheetState,
    trigger: 'xp' | 'manual',
    oldLevel: number,
    requestedLevel: number,
    setXpToMinimum: boolean,
  ): LevelUpModalState => {
    const result = applyLevelChangeToSheet(
      baseSheet,
      characterClass,
      oldLevel,
      requestedLevel,
      { setCurrentXpToLevelMinimum: setXpToMinimum },
    );

    return {
      isOpen: true,
      trigger,
      oldLevel,
      newLevel: requestedLevel,
      setXpToMinimum,
      baseSheet,
      previewSheet: result.nextSheet,
      reviewItems: result.reviewItems,
      attentionKeys: result.attentionKeys,
    };
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const syncViewportWidth = () => {
      setViewportWidth(window.innerWidth);
    };

    syncViewportWidth();
    window.addEventListener('resize', syncViewportWidth);

    return () => window.removeEventListener('resize', syncViewportWidth);
  }, []);

  useEffect(() => {
    processedAutoLevelKeys.current.clear();
    setPartyCoinEntries({});
    setLevelUpModal(DEFAULT_LEVEL_UP_MODAL_STATE);
    setAttentionKeys([]);

    if (!sheetKey) {
      sheetHydratedForKey.current = '';
      setSheet(createEmptySheet());
      return;
    }

    sheetHydratedForKey.current = '';
    let active = true;

    void import('../../utils/firestore/characterDataCache').then(({ preloadCharacterData }) => (
      preloadCharacterData(Number(sheetKey))
    )).then(() => {
      if (!active) {
        return;
      }

      const loadedSheet = getCharacterSheet(Number(sheetKey));
      const nextRace = getRaceSelectionForClass(characterClass, loadedSheet.race);
      const dexterityUpdates = applyDexterityAdjustmentsToSheet(loadedSheet, characterClass);
      const nextThievingSkills = recalculateThievingSkills(
        loadedSheet.thievingSkills,
        nextRace,
        loadedSheet.abilityDetails.Dexterity,
        characterClass,
      );

      setSheet({
        ...loadedSheet,
        race: nextRace,
        ...dexterityUpdates,
        thievingSkills: nextThievingSkills,
        ...(hasClassRules(characterClass)
          ? { specialAbilities: getClassSpecialAbilitiesText(characterClass) }
          : {}),
        experienceDetails: {
          ...loadedSheet.experienceDetails,
          ...(hasClassXpBonusRule(characterClass)
            ? { Bonus: getClassXpBonusFieldValue(characterClass, loadedSheet.abilityDetails) }
            : {}),
        },
      });
      sheetHydratedForKey.current = sheetKey;
    });

    return () => {
      active = false;
    };
  }, [sheetKey, characterClass]);

  useEffect(() => {
    if (!sheetKey || sheetHydratedForKey.current !== sheetKey) {
      return;
    }

    setCharacterSheet(Number(sheetKey), sheet);
    setSaveState('Saved');
  }, [sheet, sheetKey]);

  useEffect(() => {
    if (
      !sheetKey
      || levelUpModal.isOpen
      || currentXP === null
      || nextXPTarget === null
      || nextXPTarget <= 0
      || currentXP < nextXPTarget
    ) {
      return;
    }

    const oldLevel = parseLevelTitle(sheet.levelTitle || characterLevel);
    const autoLevelKey = `${sheetKey}:${oldLevel}:${nextXPTarget}`;

    if (processedAutoLevelKeys.current.has(autoLevelKey)) {
      return;
    }

    processedAutoLevelKeys.current.add(autoLevelKey);
    setLevelUpModal(createLevelUpModalState(sheet, 'xp', oldLevel, oldLevel + 1, false));
  }, [characterLevel, currentXP, levelUpModal.isOpen, nextXPTarget, sheet, sheetKey]);

  const closeLevelUpModal = () => {
    setLevelUpModal(DEFAULT_LEVEL_UP_MODAL_STATE);
  };

  const confirmLevelUpModal = () => {
    if (!levelUpModal.previewSheet) {
      closeLevelUpModal();
      return;
    }

    setSaveState('Saving');
    setSheet(levelUpModal.previewSheet);
    setAttentionKeys(levelUpModal.attentionKeys);
    closeLevelUpModal();
  };

  const toggleLevelUpXpAdjustment = (checked: boolean) => {
    if (!levelUpModal.baseSheet) {
      return;
    }

    const recalculated = createLevelUpModalState(
      levelUpModal.baseSheet,
      levelUpModal.trigger,
      levelUpModal.oldLevel,
      levelUpModal.newLevel,
      checked,
    );

    setLevelUpModal(recalculated);
  };

  const updateSheetField = (field: keyof CharacterSheetState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = event.target.value;
    setSaveState('Saving');

    if (field === 'levelTitle') {
      const parsedLevel = parseLevelTitle(value);
      const oldLevel = parseLevelTitle(sheet.levelTitle || characterLevel);

      if (parsedLevel !== oldLevel) {
        const setXpToMinimum = parsedLevel > oldLevel;
        setLevelUpModal(createLevelUpModalState(sheet, 'manual', oldLevel, parsedLevel, setXpToMinimum));
      }

      return;
    }

    setSheet((currentSheet) => ({ ...currentSheet, [field]: value }));
  };

  const handleRaceChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const race = event.target.value;

    if (race && !isRaceAllowedForClass(characterClass, race)) {
      return;
    }

    setSaveState('Saving');
    setSheet((currentSheet) => ({
      ...currentSheet,
      race,
      thievingSkills: recalculateThievingSkills(
        currentSheet.thievingSkills,
        race,
        currentSheet.abilityDetails.Dexterity,
        characterClass,
      ),
    }));
  };

  const updateSheetRecordField = (
    section: 'abilityDetails' | 'combatDetails' | 'experienceDetails' | 'hitPointDetails' | 'armorDetails' | 'proficiencyDetails' | 'trackingModifiers' | 'turningUndead' | 'savingThrowDetails' | 'equipmentDetails',
    field: string,
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = event.target.value;
    setSaveState('Saving');

    if (section === 'combatDetails' && field === 'Base THACO') {
      clearAttention('combat.baseThaco', 'weapons.thaco');
    }
    if (section === 'combatDetails' && field === 'MP') {
      clearAttention('combat.mp');
    }
    if (section === 'hitPointDetails' && (field === 'HP Roll' || field === 'Total HP')) {
      clearAttention('hitPoints.hpRoll', 'hitPoints.total');
    }
    if (section === 'proficiencyDetails' && (field === 'Weapon Initial Slots' || field === 'Weapon Additional Every')) {
      clearAttention('proficiency.weaponSlots');
    }
    if (section === 'proficiencyDetails' && (field === 'Non-Weapon Initial Slots' || field === 'Non-Weapon Additional Every')) {
      clearAttention('proficiency.nonWeaponSlots');
    }
    if (section === 'proficiencyDetails' && field === 'Thieving Skill Points') {
      clearAttention('thieving.points');
    }
    if (section === 'turningUndead') {
      clearAttention('turningUndead');
    }

    if (section === 'experienceDetails' && field === 'Current') {
      setSheet((currentSheet) => ({
        ...currentSheet,
        experienceDetails: {
          ...currentSheet.experienceDetails,
          Current: value,
          ...getClassExperienceDefaults(characterClass, parseLevelTitle(currentSheet.levelTitle || characterLevel), value),
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
          parseLevelTitle(currentSheet.levelTitle || characterLevel),
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

    if (section === 'abilityDetails' && field === 'Dexterity') {
      setSheet((currentSheet) => {
        const dexterityUpdates = applyDexterityAdjustmentsToSheet(
          {
            ...currentSheet,
            abilityDetails: {
              ...currentSheet.abilityDetails,
              Dexterity: value,
            },
          },
          characterClass,
          value,
        );
        const abilityDetails = dexterityUpdates.abilityDetails ?? currentSheet.abilityDetails;
        const thievingSkills = recalculateThievingSkills(
          currentSheet.thievingSkills,
          currentSheet.race,
          value,
          characterClass,
        );

        return {
          ...currentSheet,
          ...dexterityUpdates,
          thievingSkills,
          ...(hasClassXpBonusRule(characterClass)
            ? {
                experienceDetails: {
                  ...currentSheet.experienceDetails,
                  Bonus: getClassXpBonusFieldValue(characterClass, abilityDetails),
                },
              }
            : {}),
        };
      });

      return;
    }

    if (section === 'abilityDetails' && field === 'Intelligence') {
      setSheet((currentSheet) => {
        const abilityDetails = {
          ...currentSheet.abilityDetails,
          Intelligence: value,
        };

        return {
          ...currentSheet,
          abilityDetails,
          ...(hasClassXpBonusRule(characterClass)
            ? {
                experienceDetails: {
                  ...currentSheet.experienceDetails,
                  Bonus: getClassXpBonusFieldValue(characterClass, abilityDetails),
                },
              }
            : {}),
        };
      });

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

    setSaveState('Saving');
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
    setSaveState('Saving');

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
    setSaveState('Saving');
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
    setSaveState('Saving');
    setSheet((currentSheet) => ({
      ...currentSheet,
      equipmentDetails: {
        ...currentSheet.equipmentDetails,
        [`Starting Equipment ${index + 1}`]: '',
      },
    }));
  };

  const removeEquipmentBucketLine = (field: string, rowIndex: number) => {
    setSaveState('Saving');
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

  const updateWeaponRow = (rowIndex: number, field: keyof WeaponRow) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (field === 'thacoStrengthBonus' || field === 'damageStrengthBonus') {
      clearAttention('weapons.thaco');
    }
    setSaveState('Saving');
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
    clearAttention('weapons.thaco');
    setSaveState('Saving');

    setSheet((currentSheet) => ({
      ...currentSheet,
      weaponRows: currentSheet.weaponRows.map((row, index) => (
        index === rowIndex
          ? {
            ...applyWeaponSelectionToRow(row, value, getWeaponRowContext(currentSheet, characterClass)),
            soulSwordColor: selectedSoulSword ? '' : '',
            soulSwordIgnited: false,
          }
          : row
      )),
    }));
  };

  const updateSoulSwordColor = (event: ChangeEvent<HTMLSelectElement>) => {
    const color = event.target.value.toLowerCase();
    setSaveState('Saving');

    setSheet((currentSheet) => {
      if (selectedSoulSwordIndex < 0) {
        return currentSheet;
      }

      const weaponRows = currentSheet.weaponRows.map((row, index) => (
        index === selectedSoulSwordIndex ? { ...row, soulSwordColor: color } : row
      ));
      const context = getWeaponRowContext({ ...currentSheet, weaponProficiencies: currentSheet.weaponProficiencies }, characterClass);

      return {
        ...currentSheet,
        weaponRows: enrichAllWeaponRows(weaponRows, context),
      };
    });
  };

  const toggleSoulSwordIgnite = () => {
    setSaveState('Saving');

    setSheet((currentSheet) => {
      if (selectedSoulSwordIndex < 0) {
        return currentSheet;
      }

      const weaponRows = currentSheet.weaponRows.map((row, index) => (
        index === selectedSoulSwordIndex
          ? { ...row, soulSwordIgnited: !row.soulSwordIgnited }
          : row
      ));
      const context = getWeaponRowContext({ ...currentSheet, weaponProficiencies: currentSheet.weaponProficiencies }, characterClass);

      return {
        ...currentSheet,
        weaponRows: enrichAllWeaponRows(weaponRows, context),
      };
    });
  };

  const updateWeaponProficiencyRow = (rowIndex: number, field: keyof ProficiencyRow) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = event.target.value;
    clearAttention('weapons.thaco', 'proficiency.weaponSlots');
    setSaveState('Saving');
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

  const updateProficiencyRow = (section: 'weaponProficiencies' | 'nonWeaponProficiencies', rowIndex: number, field: keyof ProficiencyRow | keyof NonWeaponProficiencyRow) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (section === 'weaponProficiencies') {
      clearAttention('proficiency.weaponSlots', 'weapons.thaco');
    } else {
      clearAttention('proficiency.nonWeaponSlots');
    }
    setSaveState('Saving');
    setSheet((currentSheet) => ({
      ...currentSheet,
      [section]: currentSheet[section].map((row, index) => index === rowIndex ? { ...row, [field]: value } : row),
    }));
  };

  const updateThievingSkillRow = (rowIndex: number, field: keyof ThievingSkillRow) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    clearAttention('thieving.points');
    setSaveState('Saving');
    setSheet((currentSheet) => {
      const updatedRows = currentSheet.thievingSkills.map((row, index) => (
        index === rowIndex ? { ...row, [field]: value } : row
      ));

      return {
        ...currentSheet,
        thievingSkills: recalculateThievingSkills(
          updatedRows,
          currentSheet.race,
          currentSheet.abilityDetails.Dexterity,
          characterClass,
        ),
      };
    });
  };

  const { updateSavingThrowRow, updateSavingThrowCheck } = createSavingThrowHandlers((updater) => {
    setSaveState('Saving');
    setSheet((currentSheet) => ({
      ...currentSheet,
      savingThrowRows: updater(currentSheet.savingThrowRows),
    }));
  });

  const updateXPAwardRow = (rowIndex: number) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSaveState('Saving');
    setSheet((currentSheet) => {
      const previousXP = parseExperience(currentSheet.xpAwardRows[rowIndex]?.xp ?? '') ?? 0;
      const nextXP = parseExperience(value) ?? 0;
      const current = parseExperience(currentSheet.experienceDetails.Current) ?? 0;
      const nextCurrent = Math.max(current + nextXP - previousXP, 0);
      const levelValue = parseLevelTitle(currentSheet.levelTitle || characterLevel);

      return {
        ...currentSheet,
        experienceDetails: {
          ...currentSheet.experienceDetails,
          Current: formatExperience(nextCurrent),
          ...getClassExperienceDefaults(characterClass, levelValue, formatExperience(nextCurrent)),
        },
        xpAwardRows: currentSheet.xpAwardRows.map((row, index) => index === rowIndex ? { ...row, xp: value } : row),
      };
    });
  };

  const addWeaponLine = () => {
    setSaveState('Saving');
    setSheet((currentSheet) => ({
      ...currentSheet,
      weaponRows: [...currentSheet.weaponRows, createWeaponRow(currentSheet.weaponRows.length + 1)],
    }));
  };

  const addWeaponProficiencyLine = () => {
    setSaveState('Saving');
    setSheet((currentSheet) => ({
      ...currentSheet,
      weaponProficiencies: [...currentSheet.weaponProficiencies, createProficiencyRow('weapon-proficiency', currentSheet.weaponProficiencies.length + 1)],
    }));
  };

  const addNonWeaponProficiencyLine = () => {
    setSaveState('Saving');
    setSheet((currentSheet) => ({
      ...currentSheet,
      nonWeaponProficiencies: [...currentSheet.nonWeaponProficiencies, createNonWeaponProficiencyRow(currentSheet.nonWeaponProficiencies.length + 1)],
    }));
  };

  const addXPAwardLine = () => {
    setSaveState('Saving');
    setSheet((currentSheet) => ({
      ...currentSheet,
      xpAwardRows: [...currentSheet.xpAwardRows, createXPAwardRow(currentSheet.xpAwardRows.length + 1)],
    }));
  };

  const updateXpValuableArrows = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (value === '' || /^\d+$/.test(value)) {
      setSaveState('Saving');
      setSheet((currentSheet) => ({ ...currentSheet, xpValuablesArrows: value }));
    }
  };

  const adjustXpValuableArrows = (delta: number) => {
    setSaveState('Saving');
    setSheet((currentSheet) => {
      const current = parseArrowCount(currentSheet.xpValuablesArrows);
      const next = Math.max(current + delta, 0);

      return {
        ...currentSheet,
        xpValuablesArrows: String(next),
      };
    });
  };

  const updatePartyCoinEntry = (field: string) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (value === '' || /^\d+$/.test(value)) {
      setPartyCoinEntries((current) => ({ ...current, [field]: value }));
    }
  };

  const adjustPartyCoin = (field: string, direction: 'add' | 'subtract') => {
    const amount = parseCoinEntry(partyCoinEntries[field] ?? '');

    if (amount <= 0) {
      return;
    }

    const delta = direction === 'add' ? amount : -amount;

    setSaveState('Saving');
    setSheet((currentSheet) => ({
      ...currentSheet,
      partyTreasureCoins: {
        ...currentSheet.partyTreasureCoins,
        [field]: adjustPartyCoinTotal(currentSheet.partyTreasureCoins[field], delta),
      },
    }));
    setPartyCoinEntries((current) => ({ ...current, [field]: '' }));
  };

  const handlePartyCoinEntryKeyDown = (field: string) => (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      adjustPartyCoin(field, 'add');
    }
  };

  // sheet reset intentionally removed to match Add Character layout

  return (
    <ImageBackgroundWrapper>
      <main style={{ ...styles.page, ...(isTabletViewport ? { padding: '12px 12px 44px' } : {}) }}>
        <NavDrawer />

        <div style={{ ...styles.headerRow, ...(isTabletViewport ? { alignItems: 'center', marginBottom: 18 } : {}) }}>
          <div>
            <h1 style={{ ...styles.title, ...(isTabletViewport ? { fontSize: 32 } : {}) }}>Character Sheet</h1>
          </div>
          {attentionKeys.length > 0 && (
            <button onClick={clearAllAttention} style={styles.reviewSaveButton} type="button">
              Save Review
            </button>
          )}
        </div>

        <section style={{ ...styles.sheet, ...(isTabletViewport ? { gap: 14, padding: 16 } : {}) }}>
          <div style={{ ...styles.sheetHeader, ...(isTabletViewport ? { alignItems: 'flex-start' } : {}) }}>
            <h2 style={{ ...styles.sheetTitle, ...(isTabletViewport ? { fontSize: 18 } : {}) }}>Trueshield Games Player Character Sheet</h2>
            <div style={{ ...styles.sheetTabs, ...(isTabletViewport ? { width: '100%' } : {}) }}>
              {SHEET_PAGES.map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setActivePage(page)}
                  style={{
                    ...styles.sheetTab,
                    ...(isTabletViewport ? { minHeight: 30, padding: '0 9px' } : {}),
                    ...(activePage === page ? styles.sheetTabActive : {}),
                  }}
                >
                  {PAGE_TAB_LABELS[page] ?? page}
                </button>
              ))}
            </div>
          </div>

          {activePage === 'Page 1' && (
            <>
              <div
                style={{
                  ...styles.lineGrid,
                  ...(isTabletViewport ? { gap: '12px 12px', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' } : {}),
                  ...(isCompactTabletViewport ? { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' } : {}),
                }}
              >
                <label style={styles.lineField}><span style={styles.lineLabel}>Character Name:</span><input readOnly value={characterName} style={styles.lineInput} /></label>
                <label style={styles.lineField}><span style={styles.lineLabel}>Player Name:</span><input value={sheet.playerName} onChange={updateSheetField('playerName')} style={styles.lineInput} /></label>
                <label style={styles.lineField}><span style={styles.lineLabel}>Character Alias:</span><input value={sheet.characterAlias} onChange={updateSheetField('characterAlias')} style={styles.lineInput} /></label>
                <label style={styles.lineField}><span style={styles.lineLabel}>Class:</span><input readOnly value={characterClass} style={styles.lineInput} /></label>
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
                  <select value={String(Math.min(parseLevelTitle(sheet.levelTitle || characterLevel), maxClassLevel))} onChange={updateSheetField('levelTitle')} style={styles.lineInput}>
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
              {[
                ['Languages', 'languages'],
                ['Racial Bonuses and Abilities', 'racialBonuses'],
              ].map(([label, key]) => (
                <label key={key} style={styles.textBlock}>
                  <span style={styles.lineLabel}>{label}:</span>
                  <textarea value={sheet[key as keyof CharacterSheetState] as string} onChange={updateSheetField(key as keyof CharacterSheetState)} style={styles.sheetTextarea} />
                </label>
              ))}
              <div style={styles.textBlock}>
                <span style={styles.lineLabel}>Special Abilities and Restrictions:</span>
                <textarea
                  value={sheet.specialAbilities}
                  onChange={updateSheetField('specialAbilities')}
                  wrap="off"
                  style={styles.specialAbilitiesTextarea}
                />
              </div>
              <label style={styles.textBlock}>
                <span style={styles.lineLabel}>Notes/History:</span>
                <textarea value={sheet.notes} onChange={updateSheetField('notes')} style={{ ...styles.sheetTextarea, minHeight: 360 }} />
              </label>
            </>
          )}

          {activePage === 'Page 2' && (
            <>
              <div style={styles.sheetSection}>
                <h3 style={styles.sheetSectionTitle}>Ability Scores</h3>
                <div style={styles.abilityLine}>
                  <label style={styles.scoreField}><span style={styles.lineLabel}>Strength:</span><input value={sheet.abilityDetails.Strength} onChange={updateSheetRecordField('abilityDetails', 'Strength')} style={styles.scoreInput} /></label>
                  {['Hit', 'Dmg', 'Wgt', 'Press', 'Doors', 'Bars/Gates'].map((field) => (
                    <label key={field} style={styles.modifierField}>
                      <span style={styles.lineLabel}>{field}:</span>
                      <input value={sheet.abilityDetails[`Strength ${field}`]} onChange={updateSheetRecordField('abilityDetails', `Strength ${field}`)} style={styles.lineInput} />
                    </label>
                  ))}
                </div>
                <div style={styles.abilityLine}>
                  <label style={styles.scoreField}><span style={styles.lineLabel}>Dexterity:</span><input value={sheet.abilityDetails.Dexterity} onChange={updateSheetRecordField('abilityDetails', 'Dexterity')} style={styles.scoreInput} /></label>
                  <label style={styles.modifierField}><span style={styles.lineLabel}>Reac Adj:</span><input value={sheet.abilityDetails['Dexterity Reac Adj']} onChange={updateSheetRecordField('abilityDetails', 'Dexterity Reac Adj')} style={styles.lineInput} /></label>
                  <label style={styles.modifierField}><span style={styles.lineLabel}>Msl Att Adj:</span><input value={sheet.abilityDetails['Dexterity Msl Att Adj']} onChange={updateSheetRecordField('abilityDetails', 'Dexterity Msl Att Adj')} style={styles.lineInput} /></label>
                  <label style={styles.modifierField}><span style={styles.lineLabel}>Def Adj (AC):</span><input value={sheet.abilityDetails['Dexterity Def Adj (AC)']} onChange={updateSheetRecordField('abilityDetails', 'Dexterity Def Adj (AC)')} style={styles.lineInput} /></label>
                  <label style={styles.modifierField}><span style={styles.lineLabel}>Parry:</span><input value={sheet.abilityDetails['Dexterity Parry']} onChange={updateSheetRecordField('abilityDetails', 'Dexterity Parry')} style={styles.lineInput} /></label>
                </div>
                <div style={styles.abilityLine}>
                  <label style={styles.scoreField}><span style={styles.lineLabel}>Constitution:</span><input value={sheet.abilityDetails.Constitution} onChange={updateSheetRecordField('abilityDetails', 'Constitution')} style={styles.scoreInput} /></label>
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
                  <label style={styles.scoreField}><span style={styles.lineLabel}>Intelligence:</span><input value={sheet.abilityDetails.Intelligence} onChange={updateSheetRecordField('abilityDetails', 'Intelligence')} style={styles.scoreInput} /></label>
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
                  <label style={styles.scoreField}><span style={styles.lineLabel}>Wisdom:</span><input value={sheet.abilityDetails.Wisdom} onChange={updateSheetRecordField('abilityDetails', 'Wisdom')} style={styles.scoreInput} /></label>
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
                  <label style={styles.scoreField}><span style={styles.lineLabel}>Charisma:</span><input value={sheet.abilityDetails.Charisma} onChange={updateSheetRecordField('abilityDetails', 'Charisma')} style={styles.scoreInput} /></label>
                  <label style={styles.longModifierField}><span style={styles.lineLabel}>Max # Henchman:</span><input value={sheet.abilityDetails['Charisma Max # Henchman']} onChange={updateSheetRecordField('abilityDetails', 'Charisma Max # Henchman')} style={styles.lineInput} /></label>
                  <label style={styles.longModifierField}><span style={styles.lineLabel}>Loyalty Base:</span><input value={sheet.abilityDetails['Charisma Loyalty Base']} onChange={updateSheetRecordField('abilityDetails', 'Charisma Loyalty Base')} style={styles.lineInput} /></label>
                  <label style={styles.longModifierField}><span style={styles.lineLabel}>Reaction Adj:</span><input value={sheet.abilityDetails['Charisma Reaction Adj']} onChange={updateSheetRecordField('abilityDetails', 'Charisma Reaction Adj')} style={styles.lineInput} /></label>
                </div>
                <div style={styles.comelinessLine}>
                  <label style={styles.scoreField}><span style={styles.lineLabel}>Comeliness:</span><input value={sheet.abilityDetails.Comeliness} onChange={updateSheetRecordField('abilityDetails', 'Comeliness')} style={styles.scoreInput} /></label>
                  <p style={styles.inlineNote}>1/6 Ugly, 7/9 Homely, 10/13 Average, 14/17 Above Average, 18/21 Beautiful</p>
                </div>
                <div style={styles.abilityLine}>
                  <label style={styles.scoreField}><span style={styles.lineLabel}>Piety:</span><input value={sheet.abilityDetails.Piety} onChange={updateSheetRecordField('abilityDetails', 'Piety')} style={styles.scoreInput} /></label>
                </div>
              </div>

              <p style={styles.ruleNote}>SP - Specialization. MP - Magic Points. LP - Luck Points (d4 per level). Shirt LP - Shirt Luck Points.</p>

              <div style={styles.compactStatsGrid}>
                <label style={styles.compactLineField}><span style={styles.lineLabel}>Base class Att/Rnd:</span><input value={sheet.combatDetails['Base class Att/Rnd']} onChange={updateSheetRecordField('combatDetails', 'Base class Att/Rnd')} style={styles.lineInput} /></label>
                <label style={styles.compactLineField}><span style={styles.lineLabel}>SP (pg. 71):</span><input value={sheet.combatDetails.SP} onChange={updateSheetRecordField('combatDetails', 'SP')} style={styles.lineInput} /></label>
                <label style={styles.compactLineField}>
                  <span style={styles.lineLabel}>Base THACO (pg. 121):</span>
                  <input
                    value={sheet.combatDetails['Base THACO']}
                    onChange={updateSheetRecordField('combatDetails', 'Base THACO')}
                    style={withAttentionStyle(styles.lineInput, 'combat.baseThaco')}
                  />
                </label>
                <label style={styles.compactLineField}>
                  <span style={styles.lineLabel}>MP:</span>
                  <input
                    value={sheet.combatDetails.MP}
                    onChange={updateSheetRecordField('combatDetails', 'MP')}
                    style={withAttentionStyle(styles.lineInput, 'combat.mp')}
                  />
                </label>
                <label style={styles.compactLineField}><span style={styles.lineLabel}>LP:</span><input value={sheet.combatDetails.LP} onChange={updateSheetRecordField('combatDetails', 'LP')} style={styles.lineInput} /></label>
                <label style={styles.compactLineField}><span style={styles.lineLabel}>Shirt LP:</span><input value={sheet.combatDetails['Shirt LP']} onChange={updateSheetRecordField('combatDetails', 'Shirt LP')} style={styles.lineInput} /></label>
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
                      <label key={field} style={styles.compactLineField}>
                        <span style={styles.lineLabel}>{field}:</span>
                        <input
                          value={sheet.hitPointDetails[field]}
                          onChange={updateSheetRecordField('hitPointDetails', field)}
                          readOnly={field === 'Total HP'}
                          style={withAttentionStyle(
                            styles.lineInput,
                            field === 'Total HP' ? 'hitPoints.total' : 'hitPoints.hpRoll',
                          )}
                        />
                      </label>
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
                  {['Name', 'WAC', 'W', 'SB', 'SP', 'R', 'W', 'RA', 'WB', 'R', 'S-M', 'L', 'W', 'SB', 'SP', 'R'].map((head) => (
                    <div key={head} style={styles.weaponTableHead}>{head}</div>
                  ))}
                  {sheet.weaponRows.map((row, rowIndex) => (
                    <React.Fragment key={row.id}>
                      {WEAPON_FIELDS.map((field) => {
                        const isSoulSwordIgnited = isSoulSwordLine(row.weapon) && row.soulSwordIgnited;
                        const soulSwordGlow = isSoulSwordIgnited
                          ? { boxShadow: `inset 0 0 0 2px ${getSoulSwordGlowColor(row.soulSwordColor)}, 0 0 10px ${getSoulSwordGlowColor(row.soulSwordColor)}` }
                          : {};
                        const isWeaponThacoField = field === 'thacoWeaponBonus' || field === 'thacoStrengthBonus' || field === 'thacoSpecialization' || field === 'thacoReal';
                        const thacoAttention = hasAttention('weapons.thaco')
                          ? {
                            backgroundColor: 'rgba(254,226,226,0.6)',
                            boxShadow: 'inset 0 0 0 2px rgba(220,38,38,0.55), 0 0 8px rgba(220,38,38,0.3)',
                          }
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
                              ? { ...styles.centeredTableInput, ...soulSwordGlow, ...(isWeaponThacoField ? thacoAttention : {}) }
                              : { ...styles.tableInput, ...soulSwordGlow, ...(isWeaponThacoField ? thacoAttention : {}) }}
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
          )}

          {activePage === 'Page 3' && (
            <>
              <div style={styles.sheetSection}>
                <div style={styles.weaponHeader}>
                  <h3 style={styles.sheetSectionTitle}>Weapon Proficiencies <span style={styles.subtleTitle}>#Slot numbers Pg. 71</span></h3>
                  <button type="button" onClick={addWeaponProficiencyLine} style={styles.smallActionButton}>Add line</button>
                </div>
                <div style={styles.proficiencyTable}>
                  <div style={styles.weaponTableHead}>Weapon/Group</div><div style={styles.weaponTableHead}>Slots</div>
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
                  <label style={styles.slotNumberField}>
                    <span style={styles.lineLabel}>Initial Proficiency Slots:</span>
                    <input
                      value={sheet.proficiencyDetails['Weapon Initial Slots']}
                      onChange={updateSheetRecordField('proficiencyDetails', 'Weapon Initial Slots')}
                      style={withAttentionStyle(styles.slotNumberInput, 'proficiency.weaponSlots')}
                    />
                  </label>
                  <label style={styles.slotNumberField}>
                    <span style={styles.lineLabel}>One additional every:</span>
                    <input
                      value={sheet.proficiencyDetails['Weapon Additional Every']}
                      onChange={updateSheetRecordField('proficiencyDetails', 'Weapon Additional Every')}
                      style={withAttentionStyle(styles.slotNumberInput, 'proficiency.weaponSlots')}
                    />
                  </label>
                  <span style={styles.lineLabel}>levels</span>
                </div>
              </div>

              <div style={styles.twoColumnSections}>
                <div style={styles.sheetSection}>
                  <h3 style={styles.sheetSectionTitle}>Non-Weapon Proficiencies <span style={styles.subtleTitle}>#Roll Secondary Skill Pg. 75</span></h3>
                  <label style={styles.compactLineField}>
                    <span style={styles.lineLabel}>Secondary Skill:</span>
                    <input value={sheet.proficiencyDetails['Secondary Skill']} onChange={updateSheetRecordField('proficiencyDetails', 'Secondary Skill')} style={styles.lineInput} />
                  </label>
                  <div style={styles.nonWeaponScroll}>
                    <div style={styles.nonWeaponTable}>
                      {['Proficiency', 'Slots', 'Attribute', 'Mod'].map((head) => <div key={head} style={styles.weaponTableHead}>{head}</div>)}
                      {sheet.nonWeaponProficiencies.map((row, rowIndex) => (
                        <React.Fragment key={row.id}>
                          <input value={row.name} onChange={updateProficiencyRow('nonWeaponProficiencies', rowIndex, 'name')} style={styles.tableInput} />
                          <input value={row.slots} onChange={updateProficiencyRow('nonWeaponProficiencies', rowIndex, 'slots')} style={styles.tableInput} />
                          <input value={row.attribute} onChange={updateProficiencyRow('nonWeaponProficiencies', rowIndex, 'attribute')} style={styles.tableInput} />
                          <input value={row.attributeMod} onChange={updateProficiencyRow('nonWeaponProficiencies', rowIndex, 'attributeMod')} style={styles.tableInput} />
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                  <button type="button" onClick={addNonWeaponProficiencyLine} style={styles.smallActionButton}>Add proficiency</button>
                  <div style={styles.proficiencySlotRow}>
                    <label style={styles.slotNumberField}>
                      <span style={styles.lineLabel}>Initial Proficiency Slots:</span>
                      <input
                        value={sheet.proficiencyDetails['Non-Weapon Initial Slots']}
                        onChange={updateSheetRecordField('proficiencyDetails', 'Non-Weapon Initial Slots')}
                        style={withAttentionStyle(styles.slotNumberInput, 'proficiency.nonWeaponSlots')}
                      />
                    </label>
                    <label style={styles.slotNumberField}>
                      <span style={styles.lineLabel}>One additional every:</span>
                      <input
                        value={sheet.proficiencyDetails['Non-Weapon Additional Every']}
                        onChange={updateSheetRecordField('proficiencyDetails', 'Non-Weapon Additional Every')}
                        style={withAttentionStyle(styles.slotNumberInput, 'proficiency.nonWeaponSlots')}
                      />
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
                        <span style={styles.trackingLabel}>{modifier}</span>
                        <input value={sheet.trackingModifiers[modifier]} onChange={updateSheetRecordField('trackingModifiers', modifier)} style={styles.centeredTableInput} />
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
                      <label key={key} style={styles.turningCell}>
                        <span style={styles.turningLabel}>{label}</span>
                        <input
                          value={sheet.turningUndead[key]}
                          onChange={updateSheetRecordField('turningUndead', key)}
                          style={withAttentionStyle(styles.turningInput, 'turningUndead')}
                        />
                      </label>
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
                      style={withAttentionStyle(styles.lineInput, 'thieving.points')}
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
                  {THIEVING_SKILL_COLUMNS.map(([, label]) => <div key={label} style={styles.weaponTableHead}>{label}</div>)}
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
          )}

          {activePage === 'Page 4' && (
            <>
              <div style={styles.sheetSection}>
                <h3 style={styles.sheetSectionTitle}>Saving Throws</h3>
                <div style={styles.savingThrowTable}>
                  {['Saving Throw', 'Base', 'Real', 'D4', '1', '2', '3', '4'].map((head) => <div key={head} style={styles.weaponTableHead}>{head}</div>)}
                  {sheet.savingThrowRows.map((row, rowIndex) => (
                    <React.Fragment key={row.id}>
                      <input value={row.name} onChange={updateSavingThrowRow(rowIndex, 'name')} style={styles.tableInput} />
                      <input value={row.base} onChange={updateSavingThrowRow(rowIndex, 'base')} style={styles.centeredTableInput} />
                      <input value={row.real} onChange={updateSavingThrowRow(rowIndex, 'real')} inputMode="numeric" style={styles.centeredTableInput} type="text" />
                      <input value={row.d4} onChange={updateSavingThrowRow(rowIndex, 'd4')} inputMode="numeric" style={styles.centeredTableInput} type="text" />
                      {SAVING_THROW_CHECK_FIELDS.map((field) => (
                        <label key={`${row.id}-${field}`} style={styles.checkboxCell}>
                          <input checked={Boolean(row[field])} onChange={updateSavingThrowCheck(rowIndex, field)} style={styles.checkboxInput} type="checkbox" />
                        </label>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div style={styles.twoColumnSections}>
                <div style={styles.sheetSection}>
                  <h3 style={styles.sheetSectionTitle}>Saving Throw Reductions</h3>
                  <textarea readOnly value={getSavingThrowReductionSummary(sheet)} style={{ ...styles.sheetTextarea, minHeight: 110 }} />
                </div>
                <div style={styles.sheetSection}>
                  <h3 style={styles.sheetSectionTitle}>Immunities</h3>
                  <textarea value={sheet.savingThrowDetails.Immunities} onChange={updateSheetRecordField('savingThrowDetails', 'Immunities')} style={{ ...styles.sheetTextarea, minHeight: 110 }} />
                </div>
              </div>
              <div style={styles.sheetSection}>
                <h3 style={styles.sheetSectionTitle}>Ability Bonuses and Race Notes</h3>
                <div style={{ ...styles.savingRulesGrid, ...(isTabletViewport ? { columns: '1 260px' } : {}) }}>
                  {SAVING_THROW_RULES.map((rule) => (
                    <p key={rule} style={styles.ruleNote}>{rule}</p>
                  ))}
                </div>
              </div>
            </>
          )}

          {activePage === 'Page 5' && (
            <>
              <div style={styles.sheetSection}>
                <h3 style={styles.sheetSectionTitle}>Coins, Gems, and Misc</h3>
                <div style={styles.compactStatsGrid}>
                  {[...COIN_FIELDS, 'Gems', 'Misc'].map((field) => (
                    <label key={field} style={styles.compactLineField}><span style={styles.lineLabel}>{field}:</span><input value={sheet.equipmentDetails[field]} onChange={updateSheetRecordField('equipmentDetails', field)} style={styles.lineInput} /></label>
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
                <div style={{ ...styles.equipmentList, ...(isTabletViewport ? { columns: '2 220px' } : {}) }}>
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
                <div style={{ ...styles.equipmentList, ...(isTabletViewport ? { columns: '2 220px' } : {}) }}>
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
              <div
                style={{
                  ...styles.threeColumnSections,
                  ...(isTabletViewport ? { gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' } : {}),
                }}
              >
                {['Armor', 'Weapons', 'Magical'].map((field) => (
                  <div key={field} style={styles.sheetSection}>
                    <div style={styles.weaponHeader}>
                      <h3 style={styles.sheetSectionTitle}>{field === 'Magical' ? 'Magical Items' : field}</h3>
                      <button type="button" onClick={() => addEquipmentBucketLine(field)} style={styles.smallActionButton}>Add item</button>
                    </div>
                    <div style={{ ...styles.equipmentList, ...(isTabletViewport ? { columns: '2 220px' } : {}) }}>
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
          )}

          {activePage === 'Page 6' && (
            <div style={{ ...styles.page6Layout, ...(isTabletViewport ? { gridTemplateColumns: '1fr' } : {}) }}>
              <div style={styles.sheetSection}>
                <div style={styles.weaponHeader}>
                  <h3 style={styles.sheetSectionTitle}>XP</h3>
                  <button type="button" onClick={addXPAwardLine} style={styles.smallActionButton}>Add XP row</button>
                </div>
                <div style={styles.xpAwardSummary}>
                  <span>Total XP Added</span>
                  <strong>{formatExperience(xpAwardTotal)}</strong>
                </div>
                {currentXP !== null && nextXPTarget !== null && currentXP >= nextXPTarget && (
                  <div style={styles.levelUpNotice}>Player leveled up. Current XP meets or exceeds the next XP target.</div>
                )}
                <div style={styles.xpAwardTable}>
                  {Array.from({ length: XP_COLUMN_COUNT }, (_, index) => <div key={`xp-head-${index}`} style={styles.weaponTableHead}>XP</div>)}
                  {sheet.xpAwardRows.map((row, rowIndex) => (
                    <input key={row.id} value={row.xp} onChange={updateXPAwardRow(rowIndex)} style={styles.centeredTableInput} />
                  ))}
                </div>
              </div>
              <div style={{ ...styles.sheetSection, ...styles.page6Notes }}>
                <h3 style={styles.sheetSectionTitle}>Valuables / Notes</h3>
                <div style={styles.arrowCounterRow}>
                  <span style={styles.arrowCounterLabel}>Arrow Counter</span>
                  <div style={styles.arrowCounterControls}>
                    <button type="button" onClick={() => adjustXpValuableArrows(-1)} style={styles.arrowSubtractButton}>
                      -
                    </button>
                    <input
                      inputMode="numeric"
                      onChange={updateXpValuableArrows}
                      placeholder="0"
                      style={styles.arrowCounterInput}
                      type="text"
                      value={sheet.xpValuablesArrows}
                    />
                    <button type="button" onClick={() => adjustXpValuableArrows(1)} style={styles.arrowAddButton}>
                      +
                    </button>
                  </div>
                </div>
                <textarea
                  value={sheet.xpValuablesNotes}
                  onChange={(event) => setSheet((currentSheet) => ({ ...currentSheet, xpValuablesNotes: event.target.value }))}
                  style={{
                    ...styles.sheetTextarea,
                    ...styles.page6Textarea,
                    ...(isTabletViewport ? { minHeight: 420 } : {}),
                  }}
                />
              </div>
            </div>
          )}

          {activePage === 'Page 7' && (
            <div style={styles.page7Layout}>
              <div style={styles.sheetSection}>
                <div style={styles.partyTreasureHeader}>
                  <div>
                    <h3 style={styles.sheetSectionTitle}>Party Treasure</h3>
                    <p style={styles.partyTreasureSubtitle}>Add or subtract coins to keep a running party total.</p>
                  </div>
                  <div style={styles.partyTreasureSummary}>
                    <span style={styles.partyTreasureSummaryLabel}>Combined Value</span>
                    <strong style={styles.partyTreasureSummaryValue}>{formatCurrency(partyTreasureCombinedValue)}</strong>
                  </div>
                </div>

                <div style={styles.partyCoinTable}>
                  <div style={styles.partyCoinTableHead}>Coin</div>
                  <div style={styles.partyCoinTableHead}>Value</div>
                  <div style={styles.partyCoinTableHead}>Running Total</div>
                  <div style={styles.partyCoinTableHead}>Amount</div>
                  <div style={styles.partyCoinTableHead}>Add</div>
                  <div style={styles.partyCoinTableHead}>Subtract</div>

                  {COIN_FIELDS.map((field) => (
                    <React.Fragment key={field}>
                      <div style={styles.partyCoinLabelCell}>
                        <span style={styles.partyCoinLabel}>{field}</span>
                      </div>
                      <div style={styles.partyCoinValueCell}>
                        {formatCurrency(COIN_VALUE_IN_DOLLARS[field])}
                      </div>
                      <div style={styles.partyCoinTotalCell}>
                        {getStoredCoinAmount(sheet.partyTreasureCoins[field]).toLocaleString('en-US')}
                      </div>
                      <div style={styles.partyCoinInputCell}>
                        <input
                          inputMode="numeric"
                          onChange={updatePartyCoinEntry(field)}
                          onKeyDown={handlePartyCoinEntryKeyDown(field)}
                          placeholder="0"
                          style={styles.partyCoinInput}
                          type="text"
                          value={partyCoinEntries[field] ?? ''}
                        />
                      </div>
                      <div style={styles.partyCoinActionCell}>
                        <button type="button" onClick={() => adjustPartyCoin(field, 'add')} style={styles.partyCoinAddButton}>
                          +
                        </button>
                      </div>
                      <div style={styles.partyCoinActionCell}>
                        <button type="button" onClick={() => adjustPartyCoin(field, 'subtract')} style={styles.partyCoinSubtractButton}>
                          -
                        </button>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div style={{ ...styles.sheetSection, ...styles.page7NotesSection }}>
                <h3 style={styles.sheetSectionTitle}>Valuables and Notes</h3>
                <p style={styles.partyTreasureSubtitle}>Track gems, art, deeds, shared loot notes, and other party valuables here.</p>
                <textarea
                  onChange={(event) => {
                    setSaveState('Saving');
                    setSheet((currentSheet) => ({ ...currentSheet, partyTreasureNotes: event.target.value }));
                  }}
                  placeholder="Example: Ruby (500 GP), deed to the old mill, split from the tomb haul..."
                  style={{ ...styles.sheetTextarea, ...styles.page7Textarea }}
                  value={sheet.partyTreasureNotes}
                />
              </div>
            </div>
          )}
        </section>

        <EquipmentListModal
          isOpen={isEquipmentModalOpen}
          onClose={() => setIsEquipmentModalOpen(false)}
          onEquipLine={handleEquipLine}
          actionLabel="Get"
        />

        {levelUpModal.isOpen && (
          <div style={styles.levelUpModalBackdrop}>
            <section style={styles.levelUpModalCard}>
              <h3 style={styles.levelUpModalTitle}>Character leveled up!</h3>
              <p style={styles.levelUpModalSubtext}>
                {characterName}: Level {levelUpModal.oldLevel} {'->'} Level {levelUpModal.newLevel}
              </p>

              <div style={styles.levelUpNotice}>
                <strong>Review after leveling:</strong>
                <ul style={styles.levelUpChecklist}>
                  {levelUpModal.reviewItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                  <li>Roll a d4 for saving throws where applicable.</li>
                </ul>
              </div>

              {levelUpModal.trigger === 'manual' && levelUpModal.newLevel > levelUpModal.oldLevel && (
                <label style={styles.levelUpToggleLabel}>
                  <input
                    checked={levelUpModal.setXpToMinimum}
                    onChange={(event) => toggleLevelUpXpAdjustment(event.target.checked)}
                    type="checkbox"
                  />
                  <span>Set current XP to level minimum for Level {levelUpModal.newLevel}</span>
                </label>
              )}

              {levelUpModal.trigger === 'manual' && levelUpModal.newLevel < levelUpModal.oldLevel && (
                <label style={styles.levelUpToggleLabel}>
                  <input
                    checked={levelUpModal.setXpToMinimum}
                    onChange={(event) => toggleLevelUpXpAdjustment(event.target.checked)}
                    type="checkbox"
                  />
                  <span>Also reduce current XP to the selected level minimum</span>
                </label>
              )}

              <div style={styles.levelUpModalActions}>
                <button onClick={closeLevelUpModal} style={styles.levelUpCancelButton} type="button">
                  Cancel
                </button>
                <button onClick={confirmLevelUpModal} style={styles.smallActionButton} type="button">
                  Confirm
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    </ImageBackgroundWrapper>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    color: '#f8fafc',
    margin: '0 auto',
    maxWidth: 1180,
    padding: '16px 16px 56px',
  },
  header: {
    alignItems: 'flex-start',
    display: 'flex',
    gap: 16,
    justifyContent: 'space-between',
    margin: '18px 0',
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
  headerRow: {
    alignItems: 'flex-start',
    display: 'flex',
    gap: 16,
    justifyContent: 'space-between',
    marginBottom: 26,
    paddingTop: 10,
  },
  reviewSaveButton: {
    background: 'rgba(20,83,45,0.28)',
    border: '1px solid rgba(74,222,128,0.46)',
    borderRadius: 4,
    color: '#dcfce7',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 900,
    minHeight: 30,
    padding: '0 12px',
  },
  savedPill: {
    border: '1px solid rgba(74,222,128,0.42)',
    borderRadius: 999,
    color: '#bbf7d0',
    fontWeight: 800,
    padding: '7px 10px',
  },
  resetButton: {
    background: 'rgba(127,29,29,0.38)',
    border: '1px solid rgba(248,113,113,0.45)',
    borderRadius: 6,
    color: '#fecaca',
    cursor: 'pointer',
    fontWeight: 800,
    minHeight: 38,
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
    boxShadow: '0 18px 48px rgba(0,0,0,0.34), inset 0 0 34px rgba(94,58,22,0.16)',
    color: '#24180f',
    display: 'grid',
    fontFamily: '"Palatino Linotype", "Book Antiqua", Georgia, serif',
    gap: 18,
    padding: 24,
  },
  sheetHeader: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  sheetTitle: {
    color: '#3a2413',
    fontSize: 20,
    fontWeight: 900,
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
  lineField: {
    display: 'grid',
    gap: 4,
    gridColumn: 'span 2',
  },
  shortLineField: {
    display: 'grid',
    gap: 4,
    gridColumn: 'span 1',
  },
  detailRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px 14px',
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
  lineLabel: {
    color: '#4b2e16',
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
  textBlock: {
    display: 'grid',
    gap: 8,
  },
  sheetTextarea: {
    background: 'rgba(255,248,221,0.28)',
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
    background: 'rgba(255,248,221,0.28)',
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
    display: 'grid',
    flex: '0 1 112px',
    gap: 4,
    minWidth: 96,
  },
  scoreInput: {
    background: 'rgba(255,248,221,0.34)',
    border: '1px solid rgba(82,51,21,0.28)',
    borderBottom: '2px solid rgba(62,37,17,0.78)',
    borderRadius: 4,
    color: '#24180f',
    fontFamily: '"Palatino Linotype", "Book Antiqua", Georgia, serif',
    fontSize: 20,
    fontWeight: 900,
    minHeight: 38,
    outline: 'none',
    padding: '3px 6px',
    textAlign: 'center',
    width: '100%',
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
  miniGrid: {
    display: 'grid',
    gap: '12px 14px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
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
    fontWeight: 800,
    minHeight: 32,
    padding: '0 10px',
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
  page3Grid: {
    display: 'grid',
    gap: 14,
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  },
  fullWidth: {
    gridColumn: '1 / -1',
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
    gap: '10px 12px',
  },
  slotNumberField: {
    alignItems: 'end',
    display: 'grid',
    gap: 4,
    gridTemplateColumns: 'auto 54px',
    minWidth: 0,
  },
  slotNumberInput: {
    background: 'rgba(255,248,221,0.34)',
    border: '1px solid rgba(62,37,17,0.3)',
    borderRadius: 4,
    boxSizing: 'border-box',
    color: '#24180f',
    fontFamily: '"Palatino Linotype", "Book Antiqua", Georgia, serif',
    fontSize: 16,
    fontWeight: 900,
    minHeight: 30,
    outline: 'none',
    padding: '3px 5px',
    textAlign: 'center',
    width: 54,
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
    display: 'flex',
    fontSize: 12,
    fontWeight: 800,
    minHeight: 27,
    padding: '3px 6px',
  },
  turningGrid: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: 'repeat(auto-fit, minmax(128px, 1fr))',
  },
  turningCell: {
    alignItems: 'center',
    background: 'rgba(255,248,221,0.24)',
    border: '1px solid rgba(62,37,17,0.22)',
    display: 'grid',
    gap: 6,
    gridTemplateColumns: 'minmax(68px, 1fr) minmax(42px, 0.5fr)',
    minHeight: 36,
    padding: '4px 6px',
  },
  turningLabel: {
    color: '#4b2e16',
    fontSize: 12,
    fontWeight: 900,
    lineHeight: 1.1,
  },
  turningInput: {
    background: 'rgba(255,248,221,0.42)',
    border: '1px solid rgba(62,37,17,0.28)',
    borderRadius: 4,
    boxSizing: 'border-box',
    color: '#24180f',
    fontFamily: '"Palatino Linotype", "Book Antiqua", Georgia, serif',
    fontSize: 14,
    fontWeight: 900,
    minHeight: 28,
    minWidth: 0,
    outline: 'none',
    padding: '3px 5px',
    textAlign: 'center',
    width: '100%',
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
  savingRulesGrid: {
    columnGap: 18,
    columns: '2 260px',
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
  equipmentList: {
    columnGap: 18,
    columns: '3 220px',
  },
  equipmentItemInput: {
    background: 'rgba(255,248,221,0.24)',
    border: 0,
    borderBottom: '1px solid rgba(62,37,17,0.34)',
    color: '#24180f',
    display: 'block',
    fontFamily: '"Palatino Linotype", "Book Antiqua", Georgia, serif',
    fontSize: 14,
    fontWeight: 800,
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
  levelUpModalBackdrop: {
    alignItems: 'center',
    background: 'rgba(15,23,42,0.62)',
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    left: 0,
    padding: 16,
    position: 'fixed',
    right: 0,
    top: 0,
    zIndex: 80,
  },
  levelUpModalCard: {
    background: '#fff8dd',
    border: '1px solid rgba(82,51,21,0.35)',
    borderRadius: 10,
    boxShadow: '0 24px 72px rgba(15,23,42,0.4)',
    color: '#24180f',
    display: 'grid',
    gap: 12,
    maxWidth: 560,
    padding: '16px 18px',
    width: '100%',
  },
  levelUpModalTitle: {
    color: '#3e2511',
    fontSize: 24,
    margin: 0,
  },
  levelUpModalSubtext: {
    color: '#4b2e16',
    fontSize: 15,
    fontWeight: 700,
    margin: 0,
  },
  levelUpChecklist: {
    margin: '8px 0 0',
    paddingLeft: 18,
  },
  levelUpToggleLabel: {
    alignItems: 'center',
    display: 'flex',
    fontSize: 14,
    fontWeight: 700,
    gap: 8,
  },
  levelUpModalActions: {
    display: 'flex',
    gap: 10,
    justifyContent: 'flex-end',
  },
  levelUpCancelButton: {
    background: 'rgba(82,51,21,0.12)',
    border: '1px solid rgba(82,51,21,0.32)',
    borderRadius: 4,
    color: '#4b2e16',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 900,
    minHeight: 28,
    padding: '0 10px',
  },
  page6Layout: {
    alignItems: 'stretch',
    display: 'grid',
    gap: 14,
    gridTemplateColumns: 'minmax(220px, 0.42fr) minmax(420px, 1.58fr)',
  },
  page6Notes: {
    alignItems: 'stretch',
    display: 'grid',
    gap: 10,
    gridTemplateRows: 'auto auto 1fr',
    minHeight: 0,
  },
  arrowCounterRow: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  arrowCounterLabel: {
    color: '#5a4630',
    fontSize: 14,
    fontWeight: 800,
    textTransform: 'uppercase',
  },
  arrowCounterControls: {
    alignItems: 'center',
    display: 'flex',
    gap: 8,
  },
  arrowCounterInput: {
    background: 'rgba(255,255,255,0.72)',
    border: '1px solid rgba(62,37,17,0.28)',
    borderRadius: 4,
    boxSizing: 'border-box',
    color: '#24180f',
    fontFamily: '"Palatino Linotype", "Book Antiqua", Georgia, serif',
    fontSize: 18,
    fontWeight: 900,
    minHeight: 34,
    outline: 'none',
    padding: '0 10px',
    textAlign: 'center',
    width: 96,
  },
  arrowAddButton: {
    background: 'rgba(78, 112, 42, 0.18)',
    border: '1px solid rgba(64, 92, 34, 0.42)',
    borderRadius: 6,
    color: '#2d461c',
    cursor: 'pointer',
    fontSize: 20,
    fontWeight: 900,
    minHeight: 34,
    minWidth: 42,
  },
  arrowSubtractButton: {
    background: 'rgba(127, 29, 29, 0.12)',
    border: '1px solid rgba(127, 29, 29, 0.34)',
    borderRadius: 6,
    color: '#7f1d1d',
    cursor: 'pointer',
    fontSize: 20,
    fontWeight: 900,
    minHeight: 34,
    minWidth: 42,
  },
  page6Textarea: {
    height: '100%',
    minHeight: 620,
    resize: 'vertical',
  },
  page7Layout: {
    display: 'grid',
    gap: 14,
  },
  partyTreasureHeader: {
    alignItems: 'flex-start',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  partyTreasureSubtitle: {
    color: '#5a4630',
    fontSize: 14,
    lineHeight: 1.45,
    margin: '6px 0 0',
  },
  partyTreasureSummary: {
    alignItems: 'flex-end',
    background: 'rgba(82,51,21,0.12)',
    border: '1px solid rgba(62,37,17,0.24)',
    borderRadius: 6,
    display: 'grid',
    gap: 4,
    minWidth: 180,
    padding: '10px 12px',
  },
  partyTreasureSummaryLabel: {
    color: '#5a4630',
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  partyTreasureSummaryValue: {
    color: '#2d461c',
    fontSize: 22,
    fontWeight: 900,
  },
  partyCoinTable: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: '72px minmax(90px, 0.7fr) minmax(120px, 0.9fr) minmax(120px, 0.9fr) 72px 92px',
    overflowX: 'auto',
  },
  partyCoinTableHead: {
    background: 'rgba(82,51,21,0.18)',
    color: '#3d2914',
    fontSize: 12,
    fontWeight: 900,
    minHeight: 34,
    padding: '8px 10px',
    textTransform: 'uppercase',
  },
  partyCoinLabelCell: {
    alignItems: 'center',
    background: 'rgba(255,248,221,0.34)',
    border: '1px solid rgba(62,37,17,0.18)',
    display: 'flex',
    minHeight: 52,
    padding: '8px 10px',
  },
  partyCoinLabel: {
    color: '#24180f',
    fontSize: 16,
    fontWeight: 900,
  },
  partyCoinValueCell: {
    alignItems: 'center',
    background: 'rgba(255,248,221,0.28)',
    border: '1px solid rgba(62,37,17,0.18)',
    color: '#5a4630',
    display: 'flex',
    fontSize: 14,
    fontWeight: 700,
    minHeight: 52,
    padding: '8px 10px',
  },
  partyCoinTotalCell: {
    alignItems: 'center',
    background: 'rgba(255,248,221,0.38)',
    border: '1px solid rgba(62,37,17,0.18)',
    color: '#24180f',
    display: 'flex',
    fontSize: 20,
    fontWeight: 900,
    justifyContent: 'center',
    minHeight: 52,
    padding: '8px 10px',
  },
  partyCoinInputCell: {
    alignItems: 'center',
    background: 'rgba(255,248,221,0.28)',
    border: '1px solid rgba(62,37,17,0.18)',
    display: 'flex',
    minHeight: 52,
    padding: '8px 10px',
  },
  partyCoinInput: {
    background: 'rgba(255,255,255,0.72)',
    border: '1px solid rgba(62,37,17,0.28)',
    borderRadius: 4,
    boxSizing: 'border-box',
    color: '#24180f',
    fontFamily: '"Palatino Linotype", "Book Antiqua", Georgia, serif',
    fontSize: 16,
    fontWeight: 800,
    minHeight: 36,
    outline: 'none',
    padding: '0 10px',
    textAlign: 'center',
    width: '100%',
  },
  partyCoinActionCell: {
    alignItems: 'center',
    background: 'rgba(255,248,221,0.28)',
    border: '1px solid rgba(62,37,17,0.18)',
    display: 'flex',
    justifyContent: 'center',
    minHeight: 52,
    padding: '8px 10px',
  },
  partyCoinAddButton: {
    background: 'rgba(78, 112, 42, 0.18)',
    border: '1px solid rgba(64, 92, 34, 0.42)',
    borderRadius: 6,
    color: '#2d461c',
    cursor: 'pointer',
    fontSize: 20,
    fontWeight: 900,
    minHeight: 36,
    minWidth: 44,
  },
  partyCoinSubtractButton: {
    background: 'rgba(127, 29, 29, 0.12)',
    border: '1px solid rgba(127, 29, 29, 0.34)',
    borderRadius: 6,
    color: '#7f1d1d',
    cursor: 'pointer',
    fontSize: 20,
    fontWeight: 900,
    minHeight: 36,
    minWidth: 44,
  },
  page7NotesSection: {
    display: 'grid',
    gap: 8,
  },
  page7Textarea: {
    minHeight: 280,
    resize: 'vertical',
  },
  xpAwardTable: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: `repeat(${XP_COLUMN_COUNT}, minmax(56px, 1fr))`,
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
};
