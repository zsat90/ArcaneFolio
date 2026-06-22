import { Spell } from '../../types/spellTypes';
import { Npc } from '../../types/npcTypes';
import { resetMagicPoints, spendMagicPoints } from '../character/characterState';
import { updateNpcDocument } from '../npc/npcFirestoreService';
import { recalculateNpcCombat } from '../npc/npcGeneratorService';
import type { SpellbookTarget } from '../npc/npcSpellbookService';

export type SpellCastingResult =
  | { success: true; npc?: Npc }
  | { success: false; error: string };

export const getSpellMagicPointCost = (spell: Spell) => (
  Math.max(0, spell.magicPointCost ?? 0)
);

export const canSpendMagicPoints = (currentMagicPoints: number, spell: Spell) => (
  currentMagicPoints >= getSpellMagicPointCost(spell)
);

export const castSpellForTarget = async (
  target: SpellbookTarget,
  spell: Spell,
  context?: { npc?: Npc },
): Promise<SpellCastingResult> => {
  const cost = getSpellMagicPointCost(spell);

  if (target.targetType === 'npc') {
    const npc = context?.npc;

    if (!npc) {
      return { success: false, error: 'NPC is required to cast an NPC spell.' };
    }

    const currentMagicPoints = npc.magicPoints ?? 0;

    if (currentMagicPoints < cost) {
      return { success: false, error: 'Not enough Magic Points.' };
    }

    const updatedNpc = await updateNpcDocument({
      ...npc,
      magicPoints: currentMagicPoints - cost,
    });

    return { success: true, npc: updatedNpc };
  }

  if (cost === 0) {
    return { success: true };
  }

  const spent = spendMagicPoints(cost);

  return spent
    ? { success: true }
    : { success: false, error: 'Not enough Magic Points.' };
};

export const restoreMagicPoints = async (
  target: SpellbookTarget,
  context?: { npc?: Npc },
): Promise<SpellCastingResult> => {
  if (target.targetType === 'npc') {
    const npc = context?.npc;

    if (!npc) {
      return { success: false, error: 'NPC is required to reset NPC Magic Points.' };
    }

    const recalculatedNpc = recalculateNpcCombat(npc);
    const updatedNpc = await updateNpcDocument({
      ...recalculatedNpc,
      magicPoints: recalculatedNpc.maxMagicPoints,
    });

    return { success: true, npc: updatedNpc };
  }

  resetMagicPoints();
  return { success: true };
};
