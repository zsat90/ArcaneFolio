import type { NextApiRequest, NextApiResponse } from 'next';
import { Spell } from '../../types/spellTypes';
import { filterSeedSpells } from '../../utils/spells/spellCatalog';

const getQueryValue = (value: string | string[] | undefined) => {
  return Array.isArray(value) ? value[0] : value;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Spell[] | { message: string }>,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const levelQuery = getQueryValue(req.query.level);
  const characterClassQuery = getQueryValue(req.query.characterClass);
  const schoolQuery = getQueryValue(req.query.school);
  const searchQuery = getQueryValue(req.query.search);
  const level = levelQuery === undefined ? undefined : Number(levelQuery);

  return res.status(200).json(filterSeedSpells({
    characterClass: characterClassQuery,
    level: Number.isFinite(level) ? level : undefined,
    school: schoolQuery,
    search: searchQuery,
  }));
}
