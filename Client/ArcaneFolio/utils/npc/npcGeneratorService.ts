import { NpcInput, NpcThac0ChartEntry } from '../../types/npcTypes';
import { calculateSheetMagicPoints, createEmptySheet } from '../character/characterSheetState';
import { getBaseThacoForClassLevel } from '../character/levelUp';
import { getThacoChartTarget, parseWeaponLine } from '../character/weapons';
import { getProficiencyModifiers } from '../character/weaponProficiencies';
import { getDefaultWeaponSpeedFactor } from '../character/weaponCatalog';
import {
  getDexterityArmorBase,
  getStandardDexterityAutofill,
  parseAbilityScore,
  parseNumericModifier,
} from '../character/abilityScores';

export const NPC_CLASS_OPTIONS = [
  'Fighter',
  'Wizard',
  'Priest',
  'Rogue',
  'Bard',
  'Druid',
  'Assassin',
  'Archer',
  'Barbarian',
  'Cavalier',
  'Monk',
  'Ranger',
  'Paladin',
  'Runeist',
  'Harbinger',
  'Vanar Knight',
];

export const NPC_ALIGNMENT_OPTIONS = [
  'Lawful Good',
  'Neutral Good',
  'Chaotic Good',
  'Lawful Neutral',
  'True Neutral',
  'Chaotic Neutral',
  'Lawful Evil',
  'Neutral Evil',
  'Chaotic Evil',
];

export const NPC_ARMOR_OPTIONS = [
  'None',
  'Padded',
  'Leather',
  'Studded leather',
  'Ring mail',
  'Scale mail',
  'Chain mail',
  'Splint mail',
  'Banded mail',
  'Plate mail',
  'Field plate',
  'Rigid Leather - Vanar/Sindar Armor',
  'Full plate',
];

export const NPC_PROFICIENCY_SLOT_OPTIONS = [
  { value: 0, label: '0 - Not Proficient' },
  { value: 1, label: '1 - Proficient' },
  { value: 2, label: '2 - Specialized' },
  { value: 3, label: '3 - Double Specialized' },
  { value: 4, label: '4 - Weapon Mastery' },
  { value: 5, label: '5 - Grand Mastery' },
];

const THACO_ARMOR_CLASSES = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6, -7, -8, -9, -10];

const ARMOR_CLASS_BY_ARMOR: Record<string, number> = {
  None: 10,
  Padded: 8,
  Leather: 8,
  'Studded leather': 7,
  'Ring mail': 7,
  'Scale mail': 6,
  'Chain mail': 5,
  'Splint mail': 5,
  'Banded mail': 4,
  'Plate mail': 3,
  'Field plate': 2,
  'Rigid Leather - Vanar/Sindar Armor': 2,
  'Full plate': 1,
};

export const clampNpcMagicBonus = (value: number) => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(6, Math.max(0, Math.floor(value)));
};

export const clampNpcWeaponMagicBonus = clampNpcMagicBonus;
export const clampNpcArmorMagicBonus = clampNpcMagicBonus;

export const calculateNpcArmorClass = (
  characterClass: string,
  dexterity: number,
  armor: string,
  armorMagicBonus = 0,
) => {
  const dexAutofill = getStandardDexterityAutofill(String(dexterity));
  const dexBase = getDexterityArmorBase(characterClass, String(dexterity), dexAutofill?.defense ?? '0');
  const baseArmorClass = parseAbilityScore(dexBase) ?? 10;
  const armorClass = ARMOR_CLASS_BY_ARMOR[armor] ?? 10;
  const armorReduction = Math.max(0, 10 - armorClass);
  const magicReduction = clampNpcArmorMagicBonus(armorMagicBonus);

  return Math.max(-10, baseArmorClass - armorReduction - magicReduction);
};

export const calculateNpcWeaponThac0Chart = (
  realThac0: number,
): NpcThac0ChartEntry[] => {
  return THACO_ARMOR_CLASSES.map((armorClass) => ({
    armorClass,
    target: getThacoChartTarget(String(realThac0), armorClass),
  }));
};

export const calculateNpcMaxMagicPoints = (npc: Pick<NpcInput, 'class' | 'level' | 'intelligence' | 'piety'>) => {
  const sheet = createEmptySheet();

  sheet.abilityDetails.Intelligence = String(npc.intelligence);
  sheet.abilityDetails.Piety = String(npc.piety);

  return calculateSheetMagicPoints(npc.class, npc.level, sheet);
};

export const recalculateNpcCombat = (npc: NpcInput): NpcInput => {
  const level = Number.isFinite(npc.level) ? Math.max(1, Math.floor(npc.level)) : 1;
  const dexterity = Number.isFinite(npc.dexterity) ? npc.dexterity : 10;
  const baseThac0 = Number(getBaseThacoForClassLevel(npc.class, level));
  const armorMagicBonus = clampNpcArmorMagicBonus(npc.armorMagicBonus ?? 0);
  const armorClass = calculateNpcArmorClass(npc.class, dexterity, npc.armor, armorMagicBonus);
  const parsedWeapon = parseWeaponLine(npc.weapon);
  const weaponMagicBonus = clampNpcWeaponMagicBonus(npc.weaponMagicBonus ?? Number(parsedWeapon.bonusValue) ?? 0);
  const defaultSpeedFactor = Number(getDefaultWeaponSpeedFactor(npc.weapon)) || Number(parsedWeapon.baseSpeed) || 0;
  const weaponSpeedFactor = Number.isFinite(npc.weaponSpeedFactor)
    ? Math.max(0, Math.floor(npc.weaponSpeedFactor))
    : defaultSpeedFactor;
  const proficiencyBonus = getProficiencyModifiers(npc.proficiencySlots, npc.class).thacoSpecialization;
  const dexterityReactionAdjustment = parseNumericModifier(
    getStandardDexterityAutofill(String(dexterity))?.reaction ?? '0',
  ) ?? 0;
  const realThac0 = baseThac0 - proficiencyBonus - weaponMagicBonus;
  const weaponWac = weaponSpeedFactor - dexterityReactionAdjustment - weaponMagicBonus;
  const weaponDamage = npc.weaponDamage ?? '';
  const maxMagicPoints = calculateNpcMaxMagicPoints({
    ...npc,
    level,
  });
  const currentMagicPoints = Number.isFinite(npc.magicPoints)
    ? Math.min(Math.max(0, npc.magicPoints), maxMagicPoints)
    : maxMagicPoints;

  return {
    ...npc,
    level,
    dexterity,
    baseThac0,
    realThac0,
    armorClass,
    magicPoints: currentMagicPoints,
    maxMagicPoints,
    armorMagicBonus,
    weaponMagicBonus,
    weaponSpeedFactor,
    weaponWac,
    weaponDamage,
    weaponThac0Chart: calculateNpcWeaponThac0Chart(realThac0),
  };
};

export const createBlankNpcInput = (): NpcInput => recalculateNpcCombat({
  name: '',
  race: 'Human',
  class: 'Fighter',
  level: 1,
  alignment: 'True Neutral',
  appearanceDescription: '',
  personalityTraits: '',
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
  comeliness: 10,
  piety: 10,
  hitPoints: 6,
  magicPoints: 0,
  maxMagicPoints: 0,
  armorClass: 10,
  baseThac0: 20,
  realThac0: 20,
  weapon: '',
  weaponDamage: '',
  weaponMagicBonus: 0,
  weaponSpeedFactor: 0,
  weaponWac: 0,
  proficiencySlots: 1,
  weaponThac0Chart: [],
  armor: 'None',
  armorMagicBonus: 0,
  equipmentNotes: '',
});
