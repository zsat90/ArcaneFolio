import { CharacterSheetState, NonWeaponProficiencyRow } from './characterSheetState';

type NonWeaponProficiencyDefinition = {
  name: string;
  attribute: string;
  attributeMod: string;
};

type SecondarySkill = {
  roll: string;
  name: string;
  description: string;
  proficiencies: string[];
};

const SECONDARY_ROW_PREFIX = 'secondary-skill-';

const NON_WEAPON_PROFICIENCIES: Record<string, NonWeaponProficiencyDefinition> = {
  Agriculture: { name: 'Agriculture', attribute: 'Intelligence', attributeMod: '0' },
  'Animal Handling': { name: 'Animal Handling', attribute: 'Wisdom', attributeMod: '-1' },
  'Animal Lore': { name: 'Animal Lore', attribute: 'Intelligence', attributeMod: '0' },
  Appraising: { name: 'Appraising', attribute: 'Intelligence', attributeMod: '0' },
  Armorer: { name: 'Armorer', attribute: 'Intelligence', attributeMod: '-2' },
  'Artistic Ability': { name: 'Artistic Ability', attribute: 'Wisdom', attributeMod: '0' },
  'Bowyer/Fletcher': { name: 'Bowyer/Fletcher', attribute: 'Dexterity', attributeMod: '-1' },
  Carpentry: { name: 'Carpentry', attribute: 'Strength', attributeMod: '0' },
  'Gem Cutting': { name: 'Gem Cutting', attribute: 'Dexterity', attributeMod: '-2' },
  Gaming: { name: 'Gaming', attribute: 'Charisma', attributeMod: '0' },
  Fishing: { name: 'Fishing', attribute: 'Wisdom', attributeMod: '-1' },
  Hunting: { name: 'Hunting', attribute: 'Wisdom', attributeMod: '-1' },
  Leatherworking: { name: 'Leatherworking', attribute: 'Intelligence', attributeMod: '0' },
  Mining: { name: 'Mining', attribute: 'Wisdom', attributeMod: '-3' },
  Navigation: { name: 'Navigation', attribute: 'Intelligence', attributeMod: '-2' },
  'Reading/Writing': { name: 'Reading/Writing', attribute: 'Intelligence', attributeMod: '+1' },
  Seamanship: { name: 'Seamanship', attribute: 'Dexterity', attributeMod: '+1' },
  'Seamstress/Tailor': { name: 'Seamstress/Tailor', attribute: 'Dexterity', attributeMod: '-1' },
  Stonemasonry: { name: 'Stonemasonry', attribute: 'Strength', attributeMod: '-2' },
  Survival: { name: 'Survival', attribute: 'Intelligence', attributeMod: '0' },
  Swimming: { name: 'Swimming', attribute: 'Strength', attributeMod: '0' },
  Tracking: { name: 'Tracking', attribute: 'Wisdom', attributeMod: '0' },
  Weaving: { name: 'Weaving', attribute: 'Intelligence', attributeMod: '-1' },
  Weaponsmithing: { name: 'Weaponsmithing', attribute: 'Intelligence', attributeMod: '-3' },
};

export const SECONDARY_SKILLS: SecondarySkill[] = [
  { roll: '01-02', name: 'Armorer', description: 'make, repair & evaluate armor and weapons', proficiencies: ['Armorer', 'Weaponsmithing'] },
  { roll: '03-04', name: 'Bowyer/Fletcher', description: 'make, repair, & evaluate bows and arrows', proficiencies: ['Bowyer/Fletcher'] },
  { roll: '05-10', name: 'Farmer', description: 'basic agriculture', proficiencies: ['Agriculture'] },
  { roll: '11-14', name: 'Fisher', description: 'swimming, nets, and small boat handling', proficiencies: ['Fishing', 'Swimming'] },
  { roll: '15-20', name: 'Forester', description: 'basic wood lore, lumbering', proficiencies: ['Survival'] },
  { roll: '21-23', name: 'Gambler', description: 'knowledge of gambling games', proficiencies: ['Gaming'] },
  { roll: '24-27', name: 'Groom', description: 'animal handling', proficiencies: ['Animal Handling'] },
  { roll: '28-32', name: 'Hunter', description: 'basic wood lore, butchering, basic tracking', proficiencies: ['Hunting', 'Tracking'] },
  { roll: '33-34', name: 'Jeweler', description: 'appraisal of gems and jewelry', proficiencies: ['Gem Cutting', 'Appraising'] },
  { roll: '35-37', name: 'Leather worker', description: 'skinning, tanning', proficiencies: ['Leatherworking'] },
  { roll: '38-39', name: 'Limner/Painter', description: 'map making, appraisal of art objects', proficiencies: ['Artistic Ability', 'Appraising'] },
  { roll: '40-42', name: 'Mason', description: 'stone-cutting', proficiencies: ['Stonemasonry'] },
  { roll: '43-44', name: 'Miner', description: 'stone-cutting, assaying', proficiencies: ['Mining', 'Appraising'] },
  { roll: '45-46', name: 'Navigator', description: 'astronomy, sailing, swimming, navigation', proficiencies: ['Navigation', 'Seamanship', 'Swimming'] },
  { roll: '47-49', name: 'Sailor', description: 'sailing, swimming', proficiencies: ['Seamanship', 'Swimming'] },
  { roll: '50-51', name: 'Scribe', description: 'reading, writing, basic math', proficiencies: ['Reading/Writing'] },
  { roll: '52-53', name: 'Shipwright', description: 'sailing, carpentry', proficiencies: ['Seamanship', 'Carpentry'] },
  { roll: '54-56', name: 'Tailor/Weaver', description: 'weaving, sewing, embroidery', proficiencies: ['Seamstress/Tailor', 'Weaving'] },
  { roll: '57-59', name: 'Teamster/Freighter', description: 'animal handling, wagon repair', proficiencies: ['Animal Handling', 'Carpentry'] },
  { roll: '60-62', name: 'Trader/Barterer', description: 'appraisal of common goods', proficiencies: ['Appraising'] },
  { roll: '63-66', name: 'Trapper/Furrier', description: 'basic wood lore, skinning', proficiencies: ['Hunting', 'Animal Lore', 'Leatherworking'] },
  { roll: '67-68', name: 'Weaponsmith', description: 'make, repair, & evaluate weapons', proficiencies: ['Weaponsmithing'] },
  { roll: '69-71', name: 'Woodworker/Carpenter', description: 'carpentry, carving', proficiencies: ['Carpentry'] },
  { roll: '72-85', name: 'No skill of measurable worth', description: '', proficiencies: [] },
  { roll: '86-00', name: 'Roll twice', description: 'reroll any result of 86-00', proficiencies: [] },
];

const createEmptyNonWeaponProficiencyRow = (index: number): NonWeaponProficiencyRow => ({
  id: `non-weapon-proficiency-secondary-empty-${index}`,
  name: '',
  slots: '',
  attribute: '',
  attributeMod: '',
});

const isSecondarySkillRow = (row: NonWeaponProficiencyRow) => row.id.startsWith(SECONDARY_ROW_PREFIX);

const isBlankRow = (row: NonWeaponProficiencyRow) => (
  !row.name.trim() && !row.slots.trim() && !row.attribute.trim() && !row.attributeMod.trim()
);

const createSecondarySkillRows = (secondarySkillName: string): NonWeaponProficiencyRow[] => {
  const secondarySkill = SECONDARY_SKILLS.find((skill) => skill.name === secondarySkillName);

  if (!secondarySkill) {
    return [];
  }

  return secondarySkill.proficiencies
    .map((proficiencyName, index) => {
      const proficiency = NON_WEAPON_PROFICIENCIES[proficiencyName];

      if (!proficiency) {
        return null;
      }

      return {
        id: `${SECONDARY_ROW_PREFIX}${secondarySkill.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index + 1}`,
        name: proficiency.name,
        slots: '0',
        attribute: proficiency.attribute,
        attributeMod: proficiency.attributeMod,
      };
    })
    .filter((row): row is NonWeaponProficiencyRow => Boolean(row));
};

export const applySecondarySkillToSheet = (
  sheet: CharacterSheetState,
  secondarySkillName: string,
): CharacterSheetState => {
  const secondaryRows = createSecondarySkillRows(secondarySkillName);
  const manualRows = sheet.nonWeaponProficiencies.filter((row) => !isSecondarySkillRow(row));
  const filledManualRows = manualRows.filter((row) => !isBlankRow(row));
  const minimumRows = Math.max(sheet.nonWeaponProficiencies.length, 16);
  const emptyRowCount = Math.max(minimumRows - secondaryRows.length - filledManualRows.length, 0);

  return {
    ...sheet,
    nonWeaponProficiencies: [
      ...secondaryRows,
      ...filledManualRows,
      ...Array.from({ length: emptyRowCount }, (_, index) => createEmptyNonWeaponProficiencyRow(index + 1)),
    ],
    proficiencyDetails: {
      ...sheet.proficiencyDetails,
      'Secondary Skill': secondarySkillName,
    },
  };
};
