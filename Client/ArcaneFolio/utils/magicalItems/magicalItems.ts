import {
  MAGIC_ITEM_CATEGORY_KEYS,
  MAGIC_ITEM_CATEGORY_LABELS,
  MAGIC_ITEMS,
  type MagicItemCategoryKey,
} from '../../data/magicItems';
import type { MagicalItem } from '../../types/magicalItemTypes';

export const MAGICAL_ITEM_CATEGORIES = MAGIC_ITEM_CATEGORY_KEYS.map(
  (key) => MAGIC_ITEM_CATEGORY_LABELS[key],
);

export type MagicalItemCategory = typeof MAGICAL_ITEM_CATEGORIES[number];

const slugify = (value: string) => (
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
);

const toMagicalItem = (name: string, categoryKey: MagicItemCategoryKey): MagicalItem => ({
  id: `${categoryKey}-${slugify(name)}`,
  name,
  category: MAGIC_ITEM_CATEGORY_LABELS[categoryKey],
  categoryKey,
});

export const MAGICAL_ITEMS_BY_CATEGORY_KEY: Record<MagicItemCategoryKey, MagicalItem[]> = (
  MAGIC_ITEM_CATEGORY_KEYS.reduce((groups, categoryKey) => {
    groups[categoryKey] = MAGIC_ITEMS[categoryKey].map((name) => toMagicalItem(name, categoryKey));

    return groups;
  }, {} as Record<MagicItemCategoryKey, MagicalItem[]>)
);

export const MAGICAL_ITEMS_BY_CATEGORY: Record<MagicalItemCategory, MagicalItem[]> = (
  MAGIC_ITEM_CATEGORY_KEYS.reduce((groups, categoryKey) => {
    groups[MAGIC_ITEM_CATEGORY_LABELS[categoryKey]] = MAGICAL_ITEMS_BY_CATEGORY_KEY[categoryKey];

    return groups;
  }, {} as Record<MagicalItemCategory, MagicalItem[]>)
);

export const getAllMagicalItems = () => (
  MAGIC_ITEM_CATEGORY_KEYS.flatMap((categoryKey) => MAGICAL_ITEMS_BY_CATEGORY_KEY[categoryKey])
);

export const formatMagicalItemLine = (item: MagicalItem) => {
  const details = item.notes?.trim();
  const labeledName = `${item.category} - ${item.name}`;

  return details ? `${labeledName} (${details})` : labeledName;
};

const pickRandomItem = (items: MagicalItem[]) => {
  const index = Math.floor(Math.random() * items.length);

  return items[index];
};

export const generateRandomMagicalItems = (count: number) => {
  const boundedCount = Math.max(1, Math.min(100, count));
  const sourceItems = getAllMagicalItems();

  return Array.from({ length: boundedCount }, (_, index) => {
    const item = pickRandomItem(sourceItems);

    return {
      ...item,
      id: `generated-${item.id}-${Date.now()}-${index}`,
    };
  });
};
