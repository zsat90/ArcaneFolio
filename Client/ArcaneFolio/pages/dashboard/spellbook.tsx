import React, { useEffect, useMemo, useState } from 'react';
import ImageBackgroundWrapper from '../../components/imageBackground';
import NavDrawer from '../../components/Navigation/navDrawer';
import { Spell } from '../../types/spellTypes';
import { getSpells, PRIEST_SPELL_SPHERE_OPTIONS, SPELL_SCHOOL_FILTER_OPTIONS } from '../../utils/spells/spellsService';
import {
  removeSpellFromSelectedSpellbook,
  spendMagicPoints,
  useSelectedCharacter,
  useSpellbookIds,
} from '../../utils/character/characterState';

export default function SpellBookPage() {
  const selectedCharacter = useSelectedCharacter();
  const spellbookIds = useSpellbookIds();
  const [spells, setSpells] = useState<Spell[]>([]);
  const [spellSearch, setSpellSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedSchool, setSelectedSchool] = useState('All');
  const [notice, setNotice] = useState('');
  const [expandedSpellId, setExpandedSpellId] = useState<number | null>(null);

  const levels = ['All', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  const selectedCharacterClass = selectedCharacter?.characterClass || selectedCharacter?.class;
  const schoolOptions = selectedCharacterClass === 'Priest' ? PRIEST_SPELL_SPHERE_OPTIONS : SPELL_SCHOOL_FILTER_OPTIONS;

  useEffect(() => {
    let isCurrent = true;

    getSpells()
      .then((spellResults) => {
        if (isCurrent) {
          setSpells(spellResults);
        }
      })
      .catch((err) => {
        if (isCurrent) {
          setNotice(err instanceof Error ? err.message : 'Unable to load spellbook.');
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const spellbookSpells = useMemo(() => {
    const spellIdSet = new Set(spellbookIds);
    const search = spellSearch.trim().toLowerCase();
    const level = selectedLevel === 'All' ? undefined : Number(selectedLevel);
    const school = selectedSchool === 'All' ? undefined : selectedSchool;

    return spells
      .filter((spell) => spellIdSet.has(spell.id))
      .filter((spell) => level === undefined || spell.level === level)
      .filter((spell) => {
        if (!school) {
          return true;
        }

        const filterGroups = spell.characterClass === 'Priest' ? spell.spheres : spell.schools;

        return filterGroups.some((spellSchool) => spellSchool === school);
      })
      .filter((spell) => !search || spell.name.toLowerCase().includes(search))
      .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
  }, [spellSearch, selectedLevel, selectedSchool, spellbookIds, spells]);

  useEffect(() => {
    setSelectedSchool('All');
  }, [selectedCharacterClass]);

  const handleRemoveSpell = (spell: Spell) => {
    removeSpellFromSelectedSpellbook(spell.id);
    setNotice(`${spell.name} removed from spellbook.`);
  };

  const handleCastSpell = (spell: Spell) => {
    if (spell.magicPointCost === null) {
      setNotice(`${spell.name} does not have a magic point cost yet.`);
      return;
    }

    const wasCast = spendMagicPoints(spell.magicPointCost);

    if (wasCast) {
      setNotice(`${spell.name} cast. ${spell.magicPointCost} MP spent.`);
    } else {
      setNotice(`Not enough magic points to cast ${spell.name}.`);
    }
  };

  const formatMagicPointCost = (magicPointCost: Spell['magicPointCost']) => (
    magicPointCost === null ? 'MPC TBD' : `${magicPointCost} MP`
  );

  return (
    <ImageBackgroundWrapper>
      <div style={{ padding: 16, maxWidth: 1100, margin: '0 auto', color: '#f8fafc' }}>
        <NavDrawer />

        <div style={styles.summaryRow}>
          <div>
            <h1 style={styles.title}>Spellbook</h1>
            <p style={styles.subtitle}>
              {selectedCharacter ? `${selectedCharacter.name}'s prepared spells` : 'Select a character to manage a spellbook.'}
            </p>
          </div>
          <span style={styles.count}>{spellbookSpells.length} spells</span>
        </div>

        <div style={styles.filters}>
          <select value={selectedLevel} onChange={(event) => setSelectedLevel(event.target.value)} style={styles.control}>
            {levels.map((level) => (
              <option key={level} value={level}>{level === 'All' ? 'All Levels' : `Level ${level}`}</option>
            ))}
          </select>

          <select value={selectedSchool} onChange={(event) => setSelectedSchool(event.target.value)} style={styles.control}>
            {schoolOptions.map((school) => (
              <option key={school} value={school}>{school === 'All' ? 'All Schools/Spheres' : school}</option>
            ))}
          </select>

          <input
            placeholder="Search Spellbook"
            value={spellSearch}
            onChange={(event) => setSpellSearch(event.target.value)}
            style={{ ...styles.control, flex: '1 1 240px' }}
          />
        </div>

        {notice && <p style={styles.notice}>{notice}</p>}

        {spellbookSpells.length === 0 && (
          <p style={styles.empty}>
            {selectedCharacter ? 'No spells in this spellbook yet. Add spells from the Spells page.' : 'Select a character first.'}
          </p>
        )}

        <div style={styles.spellList}>
          {spellbookSpells.map((spell) => (
            <article key={spell.id} style={styles.spellItem}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setExpandedSpellId(expandedSpellId === spell.id ? null : spell.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setExpandedSpellId(expandedSpellId === spell.id ? null : spell.id);
                  }
                }}
                style={styles.spellRow}
                aria-expanded={expandedSpellId === spell.id}
              >
                <span style={styles.spellName}>{spell.name}</span>
                <span style={styles.rowMeta}>Lvl {spell.level}</span>
                <span style={styles.rowMeta}>{spell.characterClass}</span>
                <span style={styles.rowMeta}>{spell.schools.concat(spell.spheres).filter(Boolean).join(', ') || 'Unaligned'}</span>
                <span style={styles.rowMeta}>{spell.castingTime ? `Cast ${spell.castingTime}` : 'Cast --'}</span>
                <span style={styles.cost}>{formatMagicPointCost(spell.magicPointCost)}</span>
                <button type="button" onClick={(event) => { event.stopPropagation(); handleCastSpell(spell); }} style={styles.castButton}>
                  Cast
                </button>
                <button type="button" onClick={(event) => { event.stopPropagation(); handleRemoveSpell(spell); }} style={styles.removeButton}>
                  Remove
                </button>
                <span style={styles.toggle}>{expandedSpellId === spell.id ? '-' : '+'}</span>
              </div>

              {expandedSpellId === spell.id && (
                <div style={styles.expandedPanel}>
                  <div style={styles.detailGrid}>
                    <div style={styles.detailCell}><span style={styles.detailLabel}>Components</span><span style={styles.detailValue}>{spell.components.join(', ') || 'None'}</span></div>
                    <div style={styles.detailCell}><span style={styles.detailLabel}>Casting Time</span><span style={styles.detailValue}>{spell.castingTime || 'None'}</span></div>
                    <div style={styles.detailCell}><span style={styles.detailLabel}>Casting Word</span><span style={styles.detailValue}>{spell.castingWord || 'None'}</span></div>
                    <div style={styles.detailCell}><span style={styles.detailLabel}>Word Meaning</span><span style={styles.detailValue}>{spell.castNameMeaning || 'None'}</span></div>
                    <div style={styles.detailCell}><span style={styles.detailLabel}>Range</span><span style={styles.detailValue}>{spell.range || 'Self'}</span></div>
                    <div style={styles.detailCell}><span style={styles.detailLabel}>Area</span><span style={styles.detailValue}>{spell.areaOfEffect || 'None'}</span></div>
                    <div style={styles.detailCell}><span style={styles.detailLabel}>Save</span><span style={styles.detailValue}>{spell.save || 'None'}</span></div>
                  </div>
                  <section style={styles.descriptionPanel}>
                    <h4 style={styles.descriptionTitle}>Description</h4>
                    <p style={styles.description}>{spell.description}</p>
                  </section>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </ImageBackgroundWrapper>
  );
}

const styles: Record<string, React.CSSProperties> = {
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    marginTop: 24,
  },
  title: {
    margin: 0,
    fontSize: 32,
  },
  subtitle: {
    color: '#cbd5e1',
    margin: '6px 0 0',
  },
  count: {
    color: '#d4af37',
    fontWeight: 800,
    whiteSpace: 'nowrap',
  },
  filters: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    marginTop: 16,
    flexWrap: 'wrap',
  },
  control: {
    minHeight: 42,
    borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.18)',
    padding: '0 12px',
    background: 'rgba(15,23,42,0.92)',
    color: '#f8fafc',
    outline: 'none',
  },
  spellList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginTop: 16,
    paddingBottom: 48,
  },
  spellItem: {
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    background: 'rgba(15,23,42,0.88)',
    overflowX: 'auto',
    overflowY: 'hidden',
    boxShadow: '0 16px 40px rgba(0,0,0,0.24)',
  },
  spellRow: {
    width: '100%',
    minWidth: 960,
    minHeight: 54,
    display: 'grid',
    gridTemplateColumns: 'minmax(210px, 1.5fr) 72px 110px minmax(170px, 1fr) minmax(110px, 0.7fr) 80px 76px 92px 32px',
    alignItems: 'center',
    gap: 12,
    color: '#f8fafc',
    cursor: 'pointer',
    padding: '10px 14px',
  },
  spellName: {
    fontSize: 16,
    fontWeight: 800,
  },
  rowMeta: {
    color: '#cbd5e1',
    fontSize: 14,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  cost: {
    border: '1px solid rgba(212,175,55,0.45)',
    borderRadius: 999,
    color: '#facc15',
    padding: '3px 9px',
    whiteSpace: 'nowrap',
    fontWeight: 700,
    textAlign: 'center',
    fontSize: 13,
  },
  castButton: {
    border: '1px solid rgba(74,222,128,0.42)',
    borderRadius: 6,
    background: 'rgba(20,83,45,0.42)',
    color: '#bbf7d0',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 800,
    padding: '7px 10px',
  },
  removeButton: {
    border: '1px solid rgba(248,113,113,0.45)',
    borderRadius: 6,
    background: 'rgba(127,29,29,0.38)',
    color: '#fecaca',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 800,
    padding: '7px 10px',
  },
  toggle: {
    color: '#d4af37',
    fontSize: 22,
    fontWeight: 800,
    textAlign: 'center',
  },
  expandedPanel: {
    borderTop: '1px solid rgba(255,255,255,0.1)',
    padding: 18,
    background: 'rgba(2,6,23,0.38)',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: 10,
  },
  detailCell: {
    border: '1px solid rgba(148,163,184,0.18)',
    borderRadius: 6,
    background: 'rgba(15,23,42,0.72)',
    display: 'grid',
    gap: 4,
    minHeight: 64,
    padding: '10px 12px',
  },
  detailLabel: {
    color: '#d4af37',
    fontSize: 12,
    fontWeight: 800,
    textTransform: 'uppercase',
  },
  detailValue: {
    color: '#e2e8f0',
    fontSize: 14,
    lineHeight: 1.35,
  },
  descriptionPanel: {
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    background: 'rgba(0,0,0,0.18)',
    marginTop: 14,
    padding: '14px 16px',
  },
  descriptionTitle: {
    color: '#d4af37',
    fontSize: 13,
    margin: '0 0 8px',
    textTransform: 'uppercase',
  },
  description: {
    color: '#e5e7eb',
    lineHeight: 1.6,
    margin: 0,
    whiteSpace: 'pre-line',
  },
  notice: {
    color: '#dbeafe',
    background: 'rgba(30,64,175,0.42)',
    border: '1px solid rgba(96,165,250,0.38)',
    borderRadius: 8,
    padding: 12,
  },
  empty: {
    color: '#cbd5e1',
  },
};
