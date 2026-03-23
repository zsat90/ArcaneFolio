export type Spell = {
    id: number;
    name: string;
    level: number;
    characterClass: string;
    components: string[];
    range: string;
    areaOfEffect: string;
    save: string;
    castingTime: string;
    magicPointCost: number;
    duration: string;
    description: string;
    school: string;
    sphere?: string | null;
    spellbookId?: number | null;
  };