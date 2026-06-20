import type { NextApiRequest, NextApiResponse } from 'next';
import { validateSpellAddition } from '../../../utils/character/spellAccess';
import { getSpellById } from '../../../utils/spells/spellCatalog';

type AddSpellResponse = {
  success: boolean;
  error?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<AddSpellResponse>,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { characterClass, spellId } = req.body ?? {};

  if (typeof characterClass !== 'string' || !characterClass.trim()) {
    return res.status(400).json({ success: false, error: 'Character class is required.' });
  }

  const parsedSpellId = Number(spellId);

  if (!Number.isFinite(parsedSpellId)) {
    return res.status(400).json({ success: false, error: 'Valid spell ID is required.' });
  }

  const spell = getSpellById(parsedSpellId);

  if (!spell) {
    return res.status(404).json({ success: false, error: 'Spell not found.' });
  }

  const validation = validateSpellAddition(characterClass, spell.characterClass);

  if (!validation.ok) {
    return res.status(403).json({ success: false, error: validation.error });
  }

  return res.status(200).json({ success: true });
}
