import React, { useEffect, useMemo, useState } from 'react';
import { Spell } from '../../types/spellTypes';
import { AllowedSpellType, formatAllowedSpellTypeLabel } from '../../utils/character/spellAccess';
import { getSpellMagicPointCost } from '../../utils/spells/spellCastingService';
import { loadSpells } from '../../utils/spells/spellService';

export type SpellPickerTargetType = 'character' | 'npc';
export type SpellPickerMode = 'add' | 'cast';

type SpellPickerProps = {
  targetType: SpellPickerTargetType;
  targetId: string | number;
  allowedSpellType?: AllowedSpellType | null;
  allowedSpellRules?: (spell: Spell) => boolean;
  mode: SpellPickerMode;
  selectedLevel?: number;
  knownSpellIds?: number[];
  onAddSpell?: (spell: Spell) => void | Promise<void>;
  onCastSpell?: (spell: Spell) => void | Promise<void>;
};

const LEVEL_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

export const formatSpellMagicPointCost = (spell: Spell) => {
  const cost = getSpellMagicPointCost(spell);
  return `${cost} MP`;
};

export function SpellDetailModal({
  spell,
  mode,
  actionLabel,
  onAction,
  onClose,
}: {
  spell: Spell | null;
  mode: SpellPickerMode;
  actionLabel?: string;
  onAction?: (spell: Spell) => void | Promise<void>;
  onClose: () => void;
}) {
  if (!spell) {
    return null;
  }

  return (
    <div style={styles.modalBackdrop} role="presentation" onClick={onClose}>
      <section
        style={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={spell.name}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={styles.modalHeader}>
          <div>
            <h3 style={styles.modalTitle}>{spell.name}</h3>
            <p style={styles.modalSubtitle}>Level {spell.level} {spell.characterClass}</p>
          </div>
          <button type="button" style={styles.closeButton} onClick={onClose}>Close</button>
        </div>

        <div style={styles.detailGrid}>
          <Detail label="School/Sphere" value={spell.schools.concat(spell.spheres).filter(Boolean).join(', ') || 'None'} />
          <Detail label="Components" value={spell.components.join(', ') || 'None'} />
          <Detail label="Casting Time" value={spell.castingTime || 'None'} />
          <Detail label="Range" value={spell.range || 'Self'} />
          <Detail label="Duration" value={spell.duration || 'Instantaneous'} />
          <Detail label="MP Cost" value={formatSpellMagicPointCost(spell)} />
        </div>

        <div style={styles.descriptionPanel}>
          <h4 style={styles.descriptionTitle}>Description</h4>
          <p style={styles.description}>{spell.description}</p>
        </div>

        {onAction && (
          <button type="button" style={styles.primaryButton} onClick={() => onAction(spell)}>
            {actionLabel ?? (mode === 'add' ? 'Add Spell' : 'Cast Spell')}
          </button>
        )}
      </section>
    </div>
  );
}

export default function SpellPicker({
  targetType,
  targetId,
  allowedSpellType,
  allowedSpellRules,
  mode,
  selectedLevel = 1,
  knownSpellIds = [],
  onAddSpell,
  onCastSpell,
}: SpellPickerProps) {
  const [spells, setSpells] = useState<Spell[]>([]);
  const [level, setLevel] = useState(String(selectedLevel || 1));
  const [search, setSearch] = useState('');
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const allowedSpellClass = allowedSpellType ? formatAllowedSpellTypeLabel(allowedSpellType) : '';

  useEffect(() => {
    let active = true;

    setIsLoading(true);
    setError('');

    void loadSpells(allowedSpellClass ? { characterClass: allowedSpellClass } : undefined)
      .then((loadedSpells) => {
        if (active) {
          setSpells(loadedSpells);
        }
      })
      .catch((loadError) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load spells.');
          setSpells([]);
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [allowedSpellClass]);

  useEffect(() => {
    setLevel(String(selectedLevel || 1));
  }, [selectedLevel]);

  const filteredSpells = useMemo(() => {
    const query = search.trim().toLowerCase();
    const selectedLevelNumber = Number(level);

    return spells
      .filter((spell) => spell.level === selectedLevelNumber)
      .filter((spell) => !allowedSpellRules || allowedSpellRules(spell))
      .filter((spell) => !query || spell.name.toLowerCase().includes(query));
  }, [allowedSpellRules, level, search, spells]);

  const runAction = async (spell: Spell) => {
    if (mode === 'add') {
      await onAddSpell?.(spell);
      return;
    }

    await onCastSpell?.(spell);
  };

  return (
    <section style={styles.picker} aria-label={`${targetType} ${targetId} spell picker`}>
      <div style={styles.stickyControls}>
        <select value={level} onChange={(event) => setLevel(event.target.value)} style={styles.control}>
          {LEVEL_OPTIONS.map((option) => (
            <option key={option} value={option}>Level {option}</option>
          ))}
        </select>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={`Search Level ${level} spells`}
          style={styles.control}
        />
      </div>

      {error && <p style={styles.error}>{error}</p>}
      {isLoading && <p style={styles.mutedText}>Loading spells...</p>}

      <div style={styles.results}>
        {!isLoading && filteredSpells.length === 0 && (
          <p style={styles.mutedText}>No spells match this level and search.</p>
        )}

        {filteredSpells.map((spell) => {
          const isKnown = knownSpellIds.includes(spell.id);
          const disabled = mode === 'add' && isKnown;

          return (
            <div
              key={spell.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedSpell(spell)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setSelectedSpell(spell);
                }
              }}
              style={styles.spellRow}
            >
              <strong style={styles.spellName}>{spell.name}</strong>
              <span style={styles.rowMeta}>Level {spell.level}</span>
              <span style={styles.rowMeta}>{formatSpellMagicPointCost(spell)}</span>
              <button
                type="button"
                disabled={disabled}
                onClick={(event) => {
                  event.stopPropagation();
                  runAction(spell);
                }}
                style={disabled ? styles.disabledButton : styles.actionButton}
              >
                {disabled ? 'Added' : mode === 'add' ? 'Add' : 'Cast'}
              </button>
            </div>
          );
        })}
      </div>

      <SpellDetailModal
        spell={selectedSpell}
        mode={mode}
        actionLabel={mode === 'add' && selectedSpell && knownSpellIds.includes(selectedSpell.id) ? 'Already Added' : undefined}
        onAction={selectedSpell && mode === 'add' && knownSpellIds.includes(selectedSpell.id) ? undefined : runAction}
        onClose={() => setSelectedSpell(null)}
      />
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.detailCell}>
      <span style={styles.detailLabel}>{label}</span>
      <span style={styles.detailValue}>{value}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  picker: {
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    display: 'grid',
    gap: 10,
    overflow: 'hidden',
  },
  stickyControls: {
    background: 'rgba(15,23,42,0.96)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'grid',
    gap: 8,
    gridTemplateColumns: '150px minmax(160px, 1fr)',
    padding: 10,
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  control: {
    background: 'rgba(2,6,23,0.68)',
    border: '1px solid rgba(255,255,255,0.16)',
    borderRadius: 6,
    color: '#f8fafc',
    minHeight: 38,
    padding: '0 10px',
  },
  results: {
    display: 'grid',
    gap: 6,
    maxHeight: 420,
    overflowY: 'auto',
    padding: 10,
  },
  spellRow: {
    alignItems: 'center',
    background: 'rgba(15,23,42,0.62)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 6,
    cursor: 'pointer',
    display: 'grid',
    gap: 8,
    gridTemplateColumns: 'minmax(140px, 1fr) 70px 70px auto',
    minHeight: 44,
    padding: '7px 8px',
  },
  spellName: {
    color: '#f8fafc',
    fontSize: 14,
  },
  rowMeta: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  actionButton: {
    background: '#a9fff7',
    border: '1px solid rgba(169,255,247,0.8)',
    borderRadius: 6,
    color: '#0f172a',
    cursor: 'pointer',
    fontWeight: 900,
    minHeight: 30,
    padding: '0 10px',
  },
  disabledButton: {
    background: 'rgba(148,163,184,0.18)',
    border: '1px solid rgba(148,163,184,0.25)',
    borderRadius: 6,
    color: '#94a3b8',
    cursor: 'not-allowed',
    fontWeight: 900,
    minHeight: 30,
    padding: '0 10px',
  },
  mutedText: {
    color: '#94a3b8',
    margin: 0,
  },
  error: {
    color: '#fecaca',
    margin: 0,
    padding: '0 10px',
  },
  modalBackdrop: {
    alignItems: 'center',
    background: 'rgba(2,6,23,0.72)',
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    left: 0,
    padding: 16,
    position: 'fixed',
    right: 0,
    top: 0,
    zIndex: 50,
  },
  modal: {
    background: '#0f172a',
    border: '1px solid rgba(255,255,255,0.16)',
    borderRadius: 8,
    boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
    color: '#f8fafc',
    display: 'grid',
    gap: 14,
    maxHeight: 'min(86vh, 760px)',
    maxWidth: 760,
    overflowY: 'auto',
    padding: 16,
    width: 'min(100%, 760px)',
  },
  modalHeader: {
    alignItems: 'flex-start',
    display: 'flex',
    gap: 12,
    justifyContent: 'space-between',
  },
  modalTitle: {
    color: '#fde68a',
    fontSize: 22,
    margin: 0,
  },
  modalSubtitle: {
    color: '#cbd5e1',
    margin: '4px 0 0',
  },
  closeButton: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.16)',
    borderRadius: 6,
    color: '#f8fafc',
    cursor: 'pointer',
    fontWeight: 800,
    minHeight: 34,
    padding: '0 10px',
  },
  detailGrid: {
    display: 'grid',
    gap: 8,
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
  },
  detailCell: {
    background: 'rgba(2,6,23,0.34)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 6,
    display: 'grid',
    gap: 3,
    padding: 8,
  },
  detailLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 900,
  },
  detailValue: {
    color: '#f8fafc',
    fontSize: 13,
  },
  descriptionPanel: {
    display: 'grid',
    gap: 6,
  },
  descriptionTitle: {
    color: '#fde68a',
    fontSize: 14,
    margin: 0,
  },
  description: {
    color: '#e2e8f0',
    lineHeight: 1.5,
    margin: 0,
    whiteSpace: 'pre-wrap',
  },
  primaryButton: {
    background: '#a9fff7',
    border: '1px solid rgba(169,255,247,0.8)',
    borderRadius: 6,
    color: '#0f172a',
    cursor: 'pointer',
    fontWeight: 900,
    minHeight: 40,
    padding: '0 14px',
  },
};
