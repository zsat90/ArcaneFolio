export type Spell = {
  id: number;
  characterClass: string;
  spheres: string[];
  schools: string[];
  name: string;
  level: number;
  components: string[];
  range: string;
  areaOfEffect: string;
  save: string;
  castingTime: string;
  castingWord?: string | null;
  castNameMeaning?: string | null;
  magicPointCost: number | null;
  duration: string;
  description: string;
  spellbookId?: number | null;
};
