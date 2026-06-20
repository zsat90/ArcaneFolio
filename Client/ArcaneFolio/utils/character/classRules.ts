import { parseAbilityScore } from './abilityScores';

export const ALL_RACE_OPTIONS = ['Human', 'Dwarf', 'Elf', 'Half-elf', 'Gnome', 'Halfling'] as const;

export type RaceOption = (typeof ALL_RACE_OPTIONS)[number];

export type ClassRule = {
  className: string;
  allowedRaces: readonly string[];
  xpBonusRequirement: string;
  qualifiesForXpBonus?: (abilityDetails: Record<string, string>) => boolean;
  spellAccess: readonly string[];
  specialAbilities: readonly string[];
  restrictions: readonly string[];
};

const ALL_RACES: readonly RaceOption[] = ALL_RACE_OPTIONS;

const WIZARD_CLASS_RULES: ClassRule = {
  className: 'Wizard',
  allowedRaces: ['Human', 'Elf', 'Half-elf'],
  xpBonusRequirement: 'Gains 10% bonus XP if Intelligence is 16 or higher.',
  qualifiesForXpBonus: (abilityDetails) => (parseAbilityScore(abilityDetails.Intelligence) ?? 0) >= 16,
  spellAccess: ['Wizard spells.'],
  specialAbilities: [],
  restrictions: [],
};

const RUNEIST_CLASS_RULES: ClassRule = {
  className: 'Runeist',
  allowedRaces: ['Human', 'Elf', 'Half-elf'],
  xpBonusRequirement: 'Gains 10% bonus XP if Intelligence and Dexterity are both 17 or higher.',
  qualifiesForXpBonus: (abilityDetails) => (
    (parseAbilityScore(abilityDetails.Intelligence) ?? 0) >= 17
    && (parseAbilityScore(abilityDetails.Dexterity) ?? 0) >= 17
  ),
  spellAccess: ['Wizard spells only.'],
  specialAbilities: [
    'At 1st level, may create special tattooing tools, including bamboo needles and inks.',
    'At 1st level, may enchant symbols and imbue them with a spell.',
    'At 3rd level, may cast Wizard Mark at will.',
    'At 6th level, may summon their totem animal once per day. The totem is tattooed upon the Runeist’s body. The animal may have no greater than 3 Hit Dice and may remain for 1 turn per Runeist level.',
    'At 8th level, may cast Wizard Eye 2 times per week.',
    'At 10th level, may cast Magic Mouth 1 time per day.',
    'Runeist magic originates from symbols on their body, so they do not need spell components.',
    'Runeists may mark others and objects with symbols using the Enchant Symbol spell.',
  ],
  restrictions: [
    'Runeists still require spellbooks to regain magic points and memorize spells.',
    'Runeists use Wizard spells only.',
  ],
};

const BARD_CLASS_RULES: ClassRule = {
  className: 'Bard',
  allowedRaces: ['Human', 'Half-elf'],
  xpBonusRequirement: 'None',
  spellAccess: [],
  specialAbilities: [
    'Can influence the reactions of groups of NPCs through performance, speech, jokes, stories, music, poetry, or song.',
    'Can shift a non-hostile group’s reaction one level toward friendly or hostile.',
    'Listeners roll a saving throw vs. paralyzation, modified by -1 for every 3 Bard levels.',
    'Can inspire allies before battle if the exact threat is known.',
    'After 3 full rounds of performance, allies within 10 feet per Bard level gain one of these benefits: +1 to attack rolls, +1 to saving throws, or +2 morale.',
    'Inspiration lasts 1 round per Bard level.',
    'Can counter magical attacks based on songs, poetry, explanations, commands, or suggestions.',
    'Allies within 30 feet are protected while the Bard performs a counter-song.',
    'Counter-song can be used once per encounter or battle.',
    'Bards can read and write their native tongue if a written language exists.',
    'Bards know local history.',
    'Bards have a 5% chance per level to identify the general purpose and function of a magical item after close examination.',
  ],
  restrictions: [
    'Reaction influence cannot be used during active combat.',
    'The performance must be appropriate to the audience.',
    'Counter-song does not affect verbal spell components or command words.',
    'Magical item identification reveals only the general nature, not the exact function.',
  ],
};

const PRIEST_CLASS_RULES: ClassRule = {
  className: 'Priest',
  allowedRaces: ALL_RACES,
  xpBonusRequirement: 'Gains 10% bonus XP if Wisdom is 16 or higher.',
  qualifiesForXpBonus: (abilityDetails) => (parseAbilityScore(abilityDetails.Wisdom) ?? 0) >= 16,
  spellAccess: ['Priest spells.'],
  specialAbilities: [
    'Turn undead.',
    'Access to priest spell spheres.',
    'Gains bonus spells from high Wisdom.',
  ],
  restrictions: [
    'Must follow deity restrictions.',
    'Limited weapon selection.',
  ],
};

const DRUID_CLASS_RULES: ClassRule = {
  className: 'Druid',
  allowedRaces: ['Human', 'Half-elf'],
  xpBonusRequirement: 'Gains 10% bonus XP if Wisdom is 16 or higher.',
  qualifiesForXpBonus: (abilityDetails) => (parseAbilityScore(abilityDetails.Wisdom) ?? 0) >= 16,
  spellAccess: [
    'Major spheres: All, Animal, Elemental, Healing, Plant, Weather.',
    'Minor sphere: Divination.',
  ],
  specialAbilities: [
    '+2 saving throws versus fire.',
    '+2 saving throws versus electricity.',
    'Secret Druidic language.',
    'Level 3: Perfect plant, animal, and water identification.',
    'Level 3: Move through overgrowth without leaving a trail.',
    'Learn woodland creature languages as levels increase.',
    'Level 7: Immune to woodland creature charm.',
    'Level 7: Shapechange up to 3 times per day.',
    'Shapechanging heals damage.',
  ],
  restrictions: [
    'Limited spell spheres.',
    'Cannot use most priest books and scrolls.',
    'Restricted armor and weapons.',
  ],
};

const ROGUE_CLASS_RULES: ClassRule = {
  className: 'Rogue',
  allowedRaces: ALL_RACES,
  xpBonusRequirement: 'Gains 10% bonus XP if Dexterity is 16 or higher.',
  qualifiesForXpBonus: (abilityDetails) => (parseAbilityScore(abilityDetails.Dexterity) ?? 0) >= 16,
  spellAccess: [],
  specialAbilities: [
    "Thieves' Cant.",
    'Communicate with thieves and criminals through coded speech.',
    'Access to rogue skills.',
  ],
  restrictions: [
    "Requires a shared language to use Thieves' Cant.",
  ],
};

const FIGHTER_CLASS_RULES: ClassRule = {
  className: 'Fighter',
  allowedRaces: ALL_RACES,
  xpBonusRequirement: 'Gains 10% bonus XP if Strength is 16 or higher.',
  qualifiesForXpBonus: (abilityDetails) => (parseAbilityScore(abilityDetails.Strength) ?? 0) >= 16,
  spellAccess: [],
  specialAbilities: [
    'Broadest weapon access.',
    'Broadest armor access.',
    'Superior combat progression.',
  ],
  restrictions: [
    'No spellcasting.',
  ],
};

const ASSASSIN_CLASS_RULES: ClassRule = {
  className: 'Assassin',
  allowedRaces: ALL_RACES,
  xpBonusRequirement: 'None',
  spellAccess: [],
  specialAbilities: [
    'Assassination.',
    'Stealth.',
    'Disguise.',
    'Poison use.',
    'Rogue-style skills.',
  ],
  restrictions: [
    'Subject to Assassin class rules.',
  ],
};

const ARCHER_CLASS_RULES: ClassRule = {
  className: 'Archer',
  allowedRaces: ['Human', 'Elf', 'Half-elf'],
  xpBonusRequirement: 'Gains 10% bonus XP if Strength and Dexterity are both 16 or higher.',
  qualifiesForXpBonus: (abilityDetails) => (
    (parseAbilityScore(abilityDetails.Strength) ?? 0) >= 16
    && (parseAbilityScore(abilityDetails.Dexterity) ?? 0) >= 16
  ),
  spellAccess: [
    'Level 7-8: Magic Missile, Shield.',
    'Level 9-10: Strength, Mirror Image.',
    'Level 11-12: Flame Arrow, Protection from Normal Missiles.',
    'Level 13+: Enchanted Weapon (bows/arrows only).',
  ],
  specialAbilities: [
    'Superior bow accuracy and damage.',
    'Level 3: Craft arrows.',
    'Level 5: Craft bows.',
    'Animal empathy.',
    'Influence animal reactions.',
    'Point Blank range (10-50 feet).',
  ],
  restrictions: [
    'Cannot read spell scrolls.',
    'Cannot write spells.',
    'Must individually learn each spell.',
    'Failed spell learning is permanent.',
    'Plate mail removes Archer accuracy bonus.',
  ],
};

const BARBARIAN_CLASS_RULES: ClassRule = {
  className: 'Barbarian',
  allowedRaces: ['Human'],
  xpBonusRequirement: 'None',
  spellAccess: [],
  specialAbilities: [
    'Custom Dexterity AC bonus: Dex 15 = +2 AC, Dex 16 = +4 AC, Dex 17 = +6 AC, Dex 18 = +8 AC.',
    '+4 vs Poison.',
    '+3 vs Paralyzation, Death Magic, Petrification, and Polymorph.',
    '+2 vs Rods, Staves, Wands, and Breath Weapons.',
    'Climb cliffs and trees.',
    'Hide in natural terrain.',
    'Improved surprise chances.',
    'Back attack detection.',
    'Leaping and springing.',
    'Detect Illusion.',
    'Detect Magic.',
    'Leadership among barbarians.',
    'Survival skills.',
    'First Aid.',
    'Outdoor Craft.',
    'Ranger-level outdoor tracking.',
    'Optional cultural skills: Animal Handling, Horsemanship, Long Distance Signaling, Running, Small Craft, Sound Imitation, Snare Building.',
  ],
  restrictions: [
    'Human only.',
    'Cannot be Lawful.',
    'Uses custom Barbarian Dexterity AC adjustment.',
  ],
};

const CAVALIER_CLASS_RULES: ClassRule = {
  className: 'Cavalier',
  allowedRaces: ['Human', 'Elf', 'Half-elf'],
  xpBonusRequirement: 'None',
  spellAccess: [],
  specialAbilities: [
    'Mounted combat specialist.',
    'Progressive weapon mastery bonuses.',
    'Enhanced riding abilities.',
    'Level 3: Saddle vaulting.',
    'Level 4: Female Elf Cavaliers may ride unicorns.',
    'Level 5: Mount speed boost.',
    'Level 7: Pegasus rider.',
    'Level 9: Hippogriff rider.',
    'Level 11: Griffon rider.',
    'Improves Strength, Dexterity, and Constitution through level progression.',
    'Chivalric code.',
  ],
  restrictions: [
    'Must maintain chivalric conduct.',
    'Must begin with Good alignment.',
    'Allowed alignments: Lawful Good, Neutral Good, Chaotic Good.',
  ],
};

const MONK_CLASS_RULES: ClassRule = {
  className: 'Monk',
  allowedRaces: ALL_RACES,
  xpBonusRequirement: 'None',
  spellAccess: [],
  specialAbilities: [
    'Uses custom hit dice.',
    'Level 1 HP: 2d4.',
    'Gains 1d4 HP per level thereafter.',
  ],
  restrictions: [
    'Maximum level 17.',
  ],
};

const RANGER_CLASS_RULES: ClassRule = {
  className: 'Ranger',
  allowedRaces: ['Human', 'Elf', 'Half-elf'],
  xpBonusRequirement: 'Gains 10% bonus XP if Strength, Dexterity, and Wisdom are all 16 or higher.',
  qualifiesForXpBonus: (abilityDetails) => (
    (parseAbilityScore(abilityDetails.Strength) ?? 0) >= 16
    && (parseAbilityScore(abilityDetails.Dexterity) ?? 0) >= 16
    && (parseAbilityScore(abilityDetails.Wisdom) ?? 0) >= 16
  ),
  spellAccess: [
    'Begins at level 8.',
    'Priest spells from Animal and Plant spheres.',
  ],
  specialAbilities: [
    'Animal empathy.',
    'Automatically befriend domestic animals.',
    'Influence wild animal reactions.',
    'Identify animal quality.',
    'Build strongholds.',
    'Level 10: Attracts 2d6 followers.',
  ],
  restrictions: [
    'No bonus spells from Wisdom.',
    'Cannot use Priest scrolls.',
    'Cannot use most Priest magical items.',
  ],
};

const PALADIN_CLASS_RULES: ClassRule = {
  className: 'Paladin',
  allowedRaces: ['Human'],
  xpBonusRequirement: 'Gains 10% bonus XP if Strength and Charisma are both 16 or higher.',
  qualifiesForXpBonus: (abilityDetails) => (
    (parseAbilityScore(abilityDetails.Strength) ?? 0) >= 16
    && (parseAbilityScore(abilityDetails.Charisma) ?? 0) >= 16
  ),
  spellAccess: [
    'Begins at level 9.',
    'Spheres: Combat, Divination, Healing, Protection.',
  ],
  specialAbilities: [
    'Detect Evil.',
    '+2 to all saving throws.',
    'Immunity to disease.',
    'Lay on Hands.',
    'Cure Disease.',
    'Aura of Protection.',
    'Holy Sword Circle of Power.',
    'Turn Undead and Fiends at level 3.',
    'Special War Horse at level 4.',
    'Priest spellcasting at level 9.',
  ],
  restrictions: [
    'Human only.',
    'Lawful Good only.',
    'Maximum 10 magical items.',
    'Must tithe 10% of all income.',
    'Must donate excess wealth.',
    'Cannot use cleric or druid scrolls.',
    'Cannot use most priest items.',
    'No special followers.',
    'May only employ Lawful Good henchmen.',
    'Must uphold Paladin code of conduct.',
  ],
};

const VANAR_KNIGHT_CLASS_RULES: ClassRule = {
  className: 'Vanar Knight',
  allowedRaces: ['Human', 'Elf'],
  xpBonusRequirement: 'None',
  spellAccess: ['None.'],
  specialAbilities: [
    'Class entry requirements: Strength 16+, Dexterity 16+, Constitution 16+, and Piety 12+.',
    'Telekinesis at 1st level.',
    'Telekinesis capacity: 250 lbs, plus 250 lbs every 3 levels.',
    'Heal 2 HP per level (up to 10th level).',
    'Detect Evil Intent at will.',
    'Detect Lies at will.',
    '+4 To Hit and +4 Damage at 5th level.',
    'Weapon Mastery (5th level).',
    'Gryphon Rider training at 5th level.',
    '25% chance to bond with a Gryphon.',
    'Weapon Mastery (5th level) - Feint: Dexterity check + attack roll, negates 2 opponent parries, once per turn.',
    'Weapon Mastery (5th level) - Numb: successful hit reduces movement and negates Dexterity AC bonuses.',
    'Weapon Mastery (5th level) - Quicksilver Motion: Initiative Speed Factor -2, once per encounter.',
    'Weapon Mastery (5th level) - Death Blow: Save vs Death or die, once per combat.',
    'Grand Mastery (15th level): +5 To Hit and +5 Damage.',
    'Grand Mastery (15th level) - Lightning Motion: Speed Factor -4.',
    'Grand Mastery (15th level) - Deflection: redirect attacks into other enemies, once per combat.',
    'Grand Mastery (15th level) - Skewer: counts as two attacks, deals x5 damage bonus, once per combat.',
    'Soul Sword: +3 To Hit, +3 Damage, 3d8 Damage vs Small/Medium/Large.',
    'Soul Sword ignited form becomes Vorpal: +5 To Hit, +5 Damage, Critical Hit on natural 16-20.',
  ],
  restrictions: [
    'Human or Elven blood only.',
    'Must be Lawful Good.',
    'Worship Deceon.',
    'Soul Sword required.',
    'Must pass Piety checks before 5th level to ignite Soul Sword.',
  ],
};

const HARBINGER_CLASS_RULES: ClassRule = {
  className: 'Harbinger',
  allowedRaces: ['Human', 'Elf', 'Half-elf'],
  xpBonusRequirement: 'None',
  spellAccess: [
    'Druid spells beginning at Level 5.',
    'Gains Magic Points beginning at Level 5.',
    '4 MP per level through Level 10, plus Intelligence bonus.',
  ],
  specialAbilities: [
    'Class entry requirements: Strength 13+, Dexterity 13+, Constitution 15+.',
    'Tracking as Ranger 3 levels lower.',
    'Running proficiency.',
    'Survival proficiency.',
    'First Aid proficiency.',
    'Direction Sense proficiency.',
    'Hide in Shadows as Thief 2 levels lower.',
    'Move Silently as Thief 2 levels lower.',
    'Cartography and mapmaking training.',
    'Trained wilderness traveler.',
    'Expert messenger and courier.',
    'Uses Warrior THAC0.',
    'May specialize in any weapon.',
    'May double specialize in Harbinger Sword and Short Composite Bow.',
    'Harbinger Sword: one or two-handed, 2d8 damage vs Small/Medium, 2d8 damage vs Large, Speed Factor 4.',
    'Harbinger Pack: waterproof, capacity 800 lbs, always weighs 20 lbs.',
    'Harbinger Pack: 95% Wilderness Hide chance and 75% Urban Hide chance.',
    'Harbinger Pack: can only be opened by owner, destroyed if tampered with, may provide magical protections.',
    'Waystation Benefit: free room and board at Waystations.',
    'Waystation Benefit: extensive courier network support.',
  ],
  restrictions: [
    'Human, Elf, or Half-Elf only.',
    'Must be Good aligned (Lawful Good, Neutral Good, or Chaotic Good).',
    'No armor heavier than Leather Armor.',
    'Heavy armor restricts class abilities.',
    'Druid spellcasting does not begin until Level 5.',
  ],
};

const CLASS_RULES: Record<string, ClassRule> = {
  Wizard: WIZARD_CLASS_RULES,
  Runeist: RUNEIST_CLASS_RULES,
  Bard: BARD_CLASS_RULES,
  Priest: PRIEST_CLASS_RULES,
  Druid: DRUID_CLASS_RULES,
  Rogue: ROGUE_CLASS_RULES,
  Fighter: FIGHTER_CLASS_RULES,
  Assassin: ASSASSIN_CLASS_RULES,
  Archer: ARCHER_CLASS_RULES,
  Barbarian: BARBARIAN_CLASS_RULES,
  Cavalier: CAVALIER_CLASS_RULES,
  Monk: MONK_CLASS_RULES,
  Ranger: RANGER_CLASS_RULES,
  Paladin: PALADIN_CLASS_RULES,
  'Vanar Knight': VANAR_KNIGHT_CLASS_RULES,
  Harbinger: HARBINGER_CLASS_RULES,
};

export const getClassRules = (characterClass: string): ClassRule | null => (
  CLASS_RULES[characterClass.trim()] ?? null
);

export const hasClassRules = (characterClass: string) => getClassRules(characterClass) !== null;

export const isRaceAllowedForClass = (characterClass: string, race: string) => {
  if (!race.trim()) {
    return true;
  }

  const rules = getClassRules(characterClass);

  if (!rules) {
    return true;
  }

  return rules.allowedRaces.includes(race);
};

export const getRaceSelectionForClass = (characterClass: string, race: string) => (
  isRaceAllowedForClass(characterClass, race) ? race : ''
);

export const formatClassRuleList = (items: readonly string[]) => (
  items.length ? items.join('\n') : 'None'
);

export const getClassSpecialAbilitiesText = (characterClass: string) => {
  const rules = getClassRules(characterClass);

  if (!rules) {
    return '';
  }

  const lines: string[] = [];

  if (rules.spellAccess.length) {
    lines.push('Spell Access:');
    lines.push(...rules.spellAccess);
  }

  if (rules.specialAbilities.length) {
    if (lines.length) {
      lines.push('');
    }

    lines.push('Special Abilities:');
    lines.push(...rules.specialAbilities);
  }

  if (rules.restrictions.length) {
    if (lines.length) {
      lines.push('');
    }

    lines.push('Restrictions:');
    lines.push(...rules.restrictions);
  }

  return lines.join('\n');
};

export const hasClassXpBonusRule = (characterClass: string) => {
  const rules = getClassRules(characterClass);
  return Boolean(rules?.qualifiesForXpBonus);
};

export const qualifiesForClassXpBonus = (
  characterClass: string,
  abilityDetails: Record<string, string>,
) => {
  const rules = getClassRules(characterClass);
  return Boolean(rules?.qualifiesForXpBonus?.(abilityDetails));
};

export const getClassXpBonusFieldValue = (
  characterClass: string,
  abilityDetails: Record<string, string> = {},
) => (
  qualifiesForClassXpBonus(characterClass, abilityDetails) ? '10%' : ''
);

export const getClassXpBonusMultiplier = (
  characterClass: string,
  abilityDetails: Record<string, string>,
) => (
  qualifiesForClassXpBonus(characterClass, abilityDetails) ? 1.1 : 1
);
