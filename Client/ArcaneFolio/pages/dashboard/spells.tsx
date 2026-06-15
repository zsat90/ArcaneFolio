import React, { useEffect, useMemo, useState } from 'react';
import ImageBackgroundWrapper from '../../components/imageBackground';
import NavDrawer from '../../components/Navigation/navDrawer';
import { Spell } from '../../types/spellTypes';
import { getSpells, PRIEST_SPELL_SPHERE_OPTIONS, SPELL_SCHOOL_FILTER_OPTIONS } from '../../utils/spells/spellsService';
import {
  addSpellToSelectedSpellbook,
  useSelectedCharacter,
  useSpellbookIds,
} from '../../utils/character/characterState';

export default function SpellsPage() {
  const [spellSearch, setSpellSearch] = useState('');
  const [selectedSpellClass, setSelectedSpellClass] = useState('Wizard');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedSchool, setSelectedSchool] = useState('All');
  const [spells, setSpells] = useState<Spell[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedSpellId, setExpandedSpellId] = useState<number | null>(null);
  const [notice, setNotice] = useState('');
  const selectedCharacter = useSelectedCharacter();
  const spellbookIds = useSpellbookIds();

  const levels = ['All', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  const spellClasses = ['Wizard', 'Priest'];
  const schoolOptions = selectedSpellClass === 'Priest' ? PRIEST_SPELL_SPHERE_OPTIONS : SPELL_SCHOOL_FILTER_OPTIONS;

  useEffect(() => {
    setSelectedSchool('All');
  }, [selectedSpellClass]);

  useEffect(() => {
    let isCurrent = true;
    const timeout = window.setTimeout(async () => {
      setIsLoading(true);
      setError('');

      try {
        const characterClass = selectedSpellClass || undefined;
        const level = selectedLevel === 'All' ? undefined : Number(selectedLevel);
        const school = selectedSchool === 'All' ? undefined : selectedSchool;
        const spellResults = await getSpells({ characterClass, level, school, search: spellSearch });

        if (isCurrent) {
          setSpells(spellResults);
        }
      } catch (err) {
        if (isCurrent) {
          setError(err instanceof Error ? err.message : 'Unable to load spells.');
          setSpells([]);
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }, 250);

    return () => {
      isCurrent = false;
      window.clearTimeout(timeout);
    };
  }, [selectedSpellClass, selectedLevel, selectedSchool, spellSearch]);

  const spellCountLabel = useMemo(() => {
    if (isLoading) {
      return 'Loading spells';
    }

    return `${spells.length} ${spells.length === 1 ? 'spell' : 'spells'}`;
  }, [isLoading, spells.length]);

  const handleAddSpell = (spell: Spell) => {
    if (!selectedCharacter) {
      setNotice('Select a character before adding spells.');
      return;
    }

    const characterClass = selectedCharacter.characterClass || selectedCharacter.class;

    if (spell.characterClass && characterClass && spell.characterClass !== characterClass) {
      setNotice(`${spell.name} was not added. ${selectedCharacter.name} is a ${characterClass}.`);
      return;
    }

    if (spellbookIds.includes(spell.id)) {
      setNotice(`${spell.name} is already in ${selectedCharacter.name}'s spellbook.`);
      return;
    }

    addSpellToSelectedSpellbook(spell.id);
    setNotice(`${spell.name} added to ${selectedCharacter.name}'s spellbook.`);
  };

  const formatMagicPointCost = (magicPointCost: Spell['magicPointCost']) => (
    magicPointCost === null ? 'MPC TBD' : `${magicPointCost} MP`
  );

  return (
    <ImageBackgroundWrapper>
      <div style={{ padding: 16, maxWidth: 1100, margin: '0 auto', color: '#f8fafc' }}>
        <NavDrawer />

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12, flexWrap: 'wrap' }}>
          <select value={selectedSpellClass} onChange={(e) => setSelectedSpellClass(e.target.value)} style={styles.control}>
            {spellClasses.map((spellClass) => (
              <option key={spellClass} value={spellClass}>{spellClass}</option>
            ))}
          </select>

          <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} style={styles.control}>
            {levels.map((l) => (
              <option key={l} value={l}>{l === 'All' ? 'All Levels' : `Level ${l}`}</option>
            ))}
          </select>

          <select value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)} style={styles.control}>
            {schoolOptions.map((school) => (
              <option key={school} value={school}>{school === 'All' ? 'All Schools/Spheres' : school}</option>
            ))}
          </select>

          <input
            placeholder="Search Spells"
            value={spellSearch}
            onChange={(e) => setSpellSearch(e.target.value)}
            style={{ ...styles.control, flex: '1 1 240px' }}
          />
        </div>

        <div style={styles.summaryRow}>
          <h1 style={styles.title}>Spells</h1>
          <span style={styles.count}>{spellCountLabel}</span>
        </div>

        {error && <p style={styles.error}>{error}</p>}
        {notice && <p style={styles.notice}>{notice}</p>}

        {!error && !isLoading && spells.length === 0 && (
          <p style={styles.empty}>No spells match your filters yet.</p>
        )}

        <div style={styles.spellList}>
          {spells.map((spell) => (
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
                aria-label={`${expandedSpellId === spell.id ? 'Close' : 'Open'} ${spell.name}`}
              >
                <span style={styles.spellName}>{spell.name}</span>
                <span style={styles.rowMeta}>Lvl {spell.level}</span>
                <span style={styles.rowMeta}>{spell.characterClass}</span>
                <span style={styles.rowMeta}>{spell.schools.concat(spell.spheres).filter(Boolean).join(', ') || 'Unaligned'}</span>
                <span style={styles.rowMeta}>{spell.castingTime ? `Cast ${spell.castingTime}` : 'Cast --'}</span>
                <span style={styles.cost}>{formatMagicPointCost(spell.magicPointCost)}</span>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleAddSpell(spell);
                  }}
                  style={{
                    ...styles.addSpellButton,
                    ...(spellbookIds.includes(spell.id) ? styles.addedSpellButton : {}),
                  }}
                >
                  {spellbookIds.includes(spell.id) ? 'Added' : 'Add'}
                </button>
                <span style={styles.toggle}>{expandedSpellId === spell.id ? '-' : '+'}</span>
              </div>

              {expandedSpellId === spell.id && (
                <div style={styles.expandedPanel}>
                  <div style={styles.expandedHeader}>
                    <div>
                      <h3 style={styles.expandedTitle}>{spell.name}</h3>
                      <p style={styles.expandedSubtitle}>
                        Level {spell.level} {spell.characterClass}
                      </p>
                    </div>
                    <span style={styles.expandedCost}>{formatMagicPointCost(spell.magicPointCost)}</span>
                  </div>

                  <div style={styles.detailGrid}>
                    <div style={styles.detailCell}>
                      <span style={styles.detailLabel}>Schools/Spheres</span>
                      <span style={styles.detailValue}>{spell.schools.concat(spell.spheres).filter(Boolean).join(', ') || 'Unaligned'}</span>
                    </div>
                    <div style={styles.detailCell}>
                      <span style={styles.detailLabel}>Components</span>
                      <span style={styles.detailValue}>{spell.components.join(', ') || 'None'}</span>
                    </div>
                    <div style={styles.detailCell}>
                      <span style={styles.detailLabel}>Casting Time</span>
                      <span style={styles.detailValue}>{spell.castingTime || 'None'}</span>
                    </div>
                    <div style={styles.detailCell}>
                      <span style={styles.detailLabel}>Casting Word</span>
                      <span style={styles.detailValue}>{spell.castingWord || 'None'}</span>
                    </div>
                    <div style={styles.detailCell}>
                      <span style={styles.detailLabel}>Word Meaning</span>
                      <span style={styles.detailValue}>{spell.castNameMeaning || 'None'}</span>
                    </div>
                    <div style={styles.detailCell}>
                      <span style={styles.detailLabel}>Range</span>
                      <span style={styles.detailValue}>{spell.range || 'Self'}</span>
                    </div>
                    <div style={styles.detailCell}>
                      <span style={styles.detailLabel}>Area</span>
                      <span style={styles.detailValue}>{spell.areaOfEffect || 'None'}</span>
                    </div>
                    <div style={styles.detailCell}>
                      <span style={styles.detailLabel}>Duration</span>
                      <span style={styles.detailValue}>{spell.duration || 'Instantaneous'}</span>
                    </div>
                    <div style={styles.detailCell}>
                      <span style={styles.detailLabel}>Save</span>
                      <span style={styles.detailValue}>{spell.save || 'None'}</span>
                    </div>
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
  control: {
    minHeight: 42,
    borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.18)',
    padding: '0 12px',
    background: 'rgba(15,23,42,0.92)',
    color: '#f8fafc',
    outline: 'none',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    marginTop: 24,
  },
  title: {
    margin: 0,
    fontSize: 32,
  },
  count: {
    color: '#d4af37',
    fontWeight: 700,
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
    minWidth: 880,
    minHeight: 54,
    display: 'grid',
    gridTemplateColumns: 'minmax(210px, 1.5fr) 72px 110px minmax(170px, 1fr) minmax(110px, 0.7fr) 80px 76px 32px',
    alignItems: 'center',
    gap: 12,
    border: 0,
    background: 'transparent',
    color: '#f8fafc',
    cursor: 'pointer',
    padding: '10px 14px',
    textAlign: 'left',
  },
  spellName: {
    margin: 0,
    fontSize: 16,
    fontWeight: 800,
    minWidth: 0,
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
  toggle: {
    color: '#d4af37',
    fontSize: 22,
    fontWeight: 800,
    textAlign: 'center',
  },
  addSpellButton: {
    border: '1px solid rgba(74,222,128,0.42)',
    borderRadius: 6,
    background: 'rgba(20,83,45,0.42)',
    color: '#bbf7d0',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 800,
    padding: '7px 10px',
    textAlign: 'center',
  },
  addedSpellButton: {
    borderColor: 'rgba(148,163,184,0.25)',
    background: 'rgba(71,85,105,0.44)',
    color: '#cbd5e1',
  },
  expandedPanel: {
    borderTop: '1px solid rgba(255,255,255,0.1)',
    padding: 18,
    background: 'rgba(2,6,23,0.38)',
  },
  expandedHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 14,
  },
  expandedTitle: {
    margin: 0,
    color: '#f8fafc',
    fontSize: 22,
  },
  expandedSubtitle: {
    margin: '4px 0 0',
    color: '#cbd5e1',
  },
  expandedCost: {
    border: '1px solid rgba(212,175,55,0.45)',
    borderRadius: 999,
    color: '#facc15',
    padding: '5px 11px',
    whiteSpace: 'nowrap',
    fontWeight: 800,
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
  error: {
    color: '#fecaca',
    background: 'rgba(127,29,29,0.5)',
    border: '1px solid rgba(248,113,113,0.4)',
    borderRadius: 8,
    padding: 12,
  },
  empty: {
    color: '#cbd5e1',
  },
  notice: {
    color: '#dbeafe',
    background: 'rgba(30,64,175,0.42)',
    border: '1px solid rgba(96,165,250,0.38)',
    borderRadius: 8,
    padding: 12,
  },
};
