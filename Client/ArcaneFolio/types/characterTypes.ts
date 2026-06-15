export interface Character {
    id: number;
    name: string;
    class: string;
    characterClass?: string;
    level?: number;
    magicPoints?: number;
    maxMagicPoints?: number;
    hitPoints?: number;
    maxHitPoints?: number;
}
