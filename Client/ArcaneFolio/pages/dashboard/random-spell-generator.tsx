import React, { useEffect, useMemo, useState } from 'react';
import ImageBackgroundWrapper from '../../components/imageBackground';
import NavDrawer from '../../components/Navigation/navDrawer';
import { Spell } from '../../types/spellTypes';
import { addSpellToSelectedSpellbook, useSelectedCharacter } from '../../utils/character/characterState';
import { getSpells } from '../../utils/spells/spellsService';
import {
  GeneratorClass,
  GeneratorMode,
  generateProgressionSpellbook,
  generateRandomSpellbook,
  getCumulativeProgression,
} from '../../utils/spells/randomSpellbook';

const GENERATOR_CLASSES: GeneratorClass[] = ['Wizard', 'Runeist', 'Bard'];

export default function RandomSpellGeneratorPage() {
  const selectedCharacter = useSelectedCharacter();
  const [spells, setSpells] = useState<Spell[]>([]);
  const [generatedSpells, setGeneratedSpells] = useState<Spell[]>([]);
  const [generatorClass, setGeneratorClass] = useState<GeneratorClass>('Wizard');
  const [mode, setMode] = useState<GeneratorMode>('progression');
  const [casterLevel, setCasterLevel] = useState('1');
  const [randomCount, setRandomCount] = useState('10');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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
          setError(err instanceof Error ? err.message : 'Unable to load spells.');
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const progressionTotals = useMemo(() => {
    return getCumulativeProgression(generatorClass, Number(casterLevel) || 1);
  }, [casterLevel, generatorClass]);

  const groupedGeneratedSpells = useMemo(() => {
    return generatedSpells.reduce<Record<number, Spell[]>>((groups, spell) => {
      groups[spell.level] = groups[spell.level] ?? [];
      groups[spell.level].push(spell);
      return groups;
    }, {});
  }, [generatedSpells]);

  const progressionSummary = useMemo(() => {
    return progressionTotals
      .map((count, index) => count ? `L${index + 1}: ${count}` : '')
      .filter(Boolean)
      .join('  |  ');
  }, [progressionTotals]);

  const handleGenerate = () => {
    setNotice('');
    setError('');

    if (!spells.length) {
      setError('Spells are still loading.');
      return;
    }

    if (mode === 'progression') {
      const level = Math.max(1, Math.min(20, Number(casterLevel) || 1));
      setCasterLevel(String(level));
      setGeneratedSpells(generateProgressionSpellbook(spells, generatorClass, level));
      return;
    }

    const count = Math.max(1, Number(randomCount) || 1);
    setRandomCount(String(count));
    setGeneratedSpells(generateRandomSpellbook(spells, count));
  };

  const handleAddSpell = (spell: Spell) => {
    if (!selectedCharacter) {
      setNotice('Select a character before adding spells.');
      return;
    }

    addSpellToSelectedSpellbook(spell.id);
    setNotice(`${spell.name} added to ${selectedCharacter.name}'s spellbook.`);
  };

  const handleAddAll = () => {
    if (!selectedCharacter) {
      setNotice('Select a character before adding spells.');
      return;
    }

    generatedSpells.forEach((spell) => addSpellToSelectedSpellbook(spell.id));
    setNotice(`${generatedSpells.length} generated spells sent to ${selectedCharacter.name}'s spellbook.`);
  };

  const formatMagicPointCost = (magicPointCost: Spell['magicPointCost']) => (
    magicPointCost === null ? 'MPC TBD' : `${magicPointCost} MP`
  );

  return (
    <ImageBackgroundWrapper>
      <main style={styles.page}>
        <NavDrawer />

        <section style={styles.header}>
          <p style={styles.eyebrow}>Spellbook Tools</p>
          <h1 style={styles.title}>Random Spell Generator</h1>
        </section>

        <section style={styles.panel}>
          <div style={styles.modeRow}>
            <button
              type="button"
              onClick={() => setMode('progression')}
              style={{ ...styles.modeButton, ...(mode === 'progression' ? styles.modeButtonActive : {}) }}
            >
              Level Chart
            </button>
            <button
              type="button"
              onClick={() => setMode('random')}
              style={{ ...styles.modeButton, ...(mode === 'random' ? styles.modeButtonActive : {}) }}
            >
              Custom Count
            </button>
          </div>

          <div style={styles.controls}>
            <label style={styles.field}>
              <span style={styles.label}>Class</span>
              <select
                value={generatorClass}
                onChange={(event) => setGeneratorClass(event.target.value as GeneratorClass)}
                style={styles.control}
              >
                {GENERATOR_CLASSES.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>

            {mode === 'progression' ? (
              <label style={styles.field}>
                <span style={styles.label}>Magic User Level</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={casterLevel}
                  onChange={(event) => setCasterLevel(event.target.value)}
                  style={styles.control}
                />
              </label>
            ) : (
              <label style={styles.field}>
                <span style={styles.label}>Number of Spells</span>
                <input
                  type="number"
                  min={1}
                  value={randomCount}
                  onChange={(event) => setRandomCount(event.target.value)}
                  style={styles.control}
                />
              </label>
            )}

            <button type="button" onClick={handleGenerate} style={styles.generateButton} disabled={isLoading}>
              Generate
            </button>
          </div>

          {mode === 'progression' && <p style={styles.summary}>{progressionSummary || 'No spells at this level.'}</p>}
        </section>

        {error && <p style={styles.error}>{error}</p>}
        {notice && <p style={styles.notice}>{notice}</p>}

        <section style={styles.resultHeader}>
          <h2 style={styles.sectionTitle}>Generated Spellbook</h2>
          <div style={styles.resultActions}>
            <span style={styles.count}>{generatedSpells.length} spells</span>
            <button type="button" onClick={handleAddAll} style={styles.addAllButton} disabled={!generatedSpells.length}>
              Add All
            </button>
          </div>
        </section>

        {!generatedSpells.length && <p style={styles.empty}>Generate a spellbook to see results.</p>}

        <div style={styles.spellGroups}>
          {Object.entries(groupedGeneratedSpells)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([level, levelSpells]) => (
              <section key={level} style={styles.levelGroup}>
                <h3 style={styles.levelTitle}>Level {level}</h3>
                <div style={styles.spellList}>
                  {levelSpells.map((spell) => (
                    <article key={spell.id} style={styles.spellRow}>
                      <span style={styles.spellName}>{spell.name}</span>
                      <span style={styles.rowMeta}>{spell.schools.join(', ')}</span>
                      <span style={styles.rowMeta}>{spell.castingTime ? `Cast ${spell.castingTime}` : 'Cast --'}</span>
                      <span style={styles.cost}>{formatMagicPointCost(spell.magicPointCost)}</span>
                      <button type="button" onClick={() => handleAddSpell(spell)} style={styles.addButton}>
                        Add
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            ))}
        </div>
      </main>
    </ImageBackgroundWrapper>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    color: '#f8fafc',
    margin: '0 auto',
    maxWidth: 1100,
    padding: '16px 16px 56px',
  },
  header: {
    marginTop: 18,
  },
  eyebrow: {
    color: '#d4af37',
    fontSize: 14,
    fontWeight: 800,
    margin: '0 0 8px',
  },
  title: {
    fontSize: 34,
    margin: 0,
  },
  panel: {
    background: 'rgba(15,23,42,0.9)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    boxShadow: '0 18px 42px rgba(0,0,0,0.24)',
    display: 'grid',
    gap: 16,
    marginTop: 20,
    padding: 18,
  },
  modeRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  modeButton: {
    background: 'rgba(15,23,42,0.72)',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 6,
    color: '#cbd5e1',
    cursor: 'pointer',
    fontWeight: 800,
    minHeight: 38,
    padding: '0 14px',
  },
  modeButtonActive: {
    background: 'rgba(169,255,247,0.12)',
    borderColor: 'rgba(169,255,247,0.44)',
    color: '#a9fff7',
  },
  controls: {
    alignItems: 'end',
    display: 'grid',
    gap: 12,
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
  },
  field: {
    display: 'grid',
    gap: 8,
  },
  label: {
    color: '#d4af37',
    fontSize: 12,
    fontWeight: 800,
    textTransform: 'uppercase',
  },
  control: {
    background: 'rgba(2,6,23,0.84)',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 6,
    color: '#f8fafc',
    minHeight: 42,
    outline: 'none',
    padding: '0 12px',
  },
  generateButton: {
    background: '#4A6FA5',
    border: 0,
    borderRadius: 6,
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 800,
    minHeight: 42,
    padding: '0 16px',
  },
  summary: {
    color: '#cbd5e1',
    margin: 0,
  },
  resultHeader: {
    alignItems: 'center',
    display: 'flex',
    gap: 16,
    justifyContent: 'space-between',
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 24,
    margin: 0,
  },
  resultActions: {
    alignItems: 'center',
    display: 'flex',
    gap: 10,
  },
  count: {
    color: '#facc15',
    fontWeight: 800,
    whiteSpace: 'nowrap',
  },
  addAllButton: {
    background: 'rgba(20,83,45,0.56)',
    border: '1px solid rgba(74,222,128,0.42)',
    borderRadius: 6,
    color: '#bbf7d0',
    cursor: 'pointer',
    fontWeight: 800,
    minHeight: 38,
    padding: '0 14px',
  },
  spellGroups: {
    display: 'grid',
    gap: 16,
    marginTop: 16,
  },
  levelGroup: {
    display: 'grid',
    gap: 8,
  },
  levelTitle: {
    color: '#d4af37',
    fontSize: 16,
    margin: 0,
  },
  spellList: {
    display: 'grid',
    gap: 8,
  },
  spellRow: {
    alignItems: 'center',
    background: 'rgba(15,23,42,0.88)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    display: 'grid',
    gap: 12,
    gridTemplateColumns: 'minmax(190px, 1.5fr) minmax(150px, 1fr) minmax(110px, 0.7fr) 80px 72px',
    minHeight: 52,
    minWidth: 760,
    overflowX: 'auto',
    padding: '10px 14px',
  },
  spellName: {
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
    fontSize: 13,
    fontWeight: 700,
    padding: '3px 9px',
    textAlign: 'center',
    whiteSpace: 'nowrap',
  },
  addButton: {
    background: 'rgba(20,83,45,0.42)',
    border: '1px solid rgba(74,222,128,0.42)',
    borderRadius: 6,
    color: '#bbf7d0',
    cursor: 'pointer',
    fontWeight: 800,
    minHeight: 34,
  },
  error: {
    background: 'rgba(127,29,29,0.5)',
    border: '1px solid rgba(248,113,113,0.4)',
    borderRadius: 8,
    color: '#fecaca',
    padding: 12,
  },
  notice: {
    background: 'rgba(30,64,175,0.42)',
    border: '1px solid rgba(96,165,250,0.38)',
    borderRadius: 8,
    color: '#dbeafe',
    padding: 12,
  },
  empty: {
    color: '#cbd5e1',
  },
};
