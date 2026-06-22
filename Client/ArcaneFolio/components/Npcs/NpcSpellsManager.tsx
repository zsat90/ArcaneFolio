import React, { useEffect, useMemo, useState } from 'react';
import { Npc, NpcSpellbook } from '../../types/npcTypes';
import { Spell } from '../../types/spellTypes';
import SpellPicker, { SpellDetailModal, formatSpellMagicPointCost } from '../Spells/SpellPicker';
import {
  SPELLBOOK_UNAVAILABLE_MESSAGE,
  canUseSpellbook,
  getAllowedSpellType,
  validateSpellAddition,
} from '../../utils/character/spellAccess';
import type { SpellbookTarget } from '../../utils/npc/npcSpellbookService';
import { castSpellForTarget, restoreMagicPoints } from '../../utils/spells/spellCastingService';
import { addSpellToTargetSpellbook, loadTargetSpellbook, removeSpellFromTargetSpellbook } from '../../utils/spells/spellbookService';
import { loadSpells } from '../../utils/spells/spellService';

type NpcSpellsManagerProps = {
  npcs: Npc[];
  onNpcUpdated: (npc: Npc) => void;
};

const formatSpellGroups = (spell: Spell) => (
  spell.schools.concat(spell.spheres).filter(Boolean).join(', ') || 'Unaligned'
);

export default function NpcSpellsManager({ npcs, onNpcUpdated }: NpcSpellsManagerProps) {
  const spellcastingNpcs = useMemo(
    () => npcs.filter((npc) => canUseSpellbook(npc.class, npc.level)),
    [npcs],
  );
  const [selectedNpcId, setSelectedNpcId] = useState('');
  const selectedNpc = spellcastingNpcs.find((npc) => npc.id === selectedNpcId) ?? null;
  const [spellbook, setSpellbook] = useState<NpcSpellbook | null>(null);
  const [knownSpells, setKnownSpells] = useState<Spell[]>([]);
  const [selectedKnownSpell, setSelectedKnownSpell] = useState<Spell | null>(null);
  const [notice, setNotice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!selectedNpcId && spellcastingNpcs.length) {
      setSelectedNpcId(spellcastingNpcs[0].id);
    }
  }, [selectedNpcId, spellcastingNpcs]);

  useEffect(() => {
    let active = true;

    if (!selectedNpc) {
      setSpellbook(null);
      setKnownSpells([]);
      return;
    }

    const target: SpellbookTarget = { targetType: 'npc', targetId: selectedNpc.id };

    setIsLoading(true);
    setNotice('');
    setSelectedKnownSpell(null);

    void Promise.all([
      loadTargetSpellbook(target, selectedNpc.ownerId),
      loadSpells(),
    ])
      .then(([loadedSpellbook, allSpells]) => {
        if (!active) return;

        setSpellbook(loadedSpellbook as NpcSpellbook);
        setKnownSpells(allSpells.filter((spell) => loadedSpellbook.spellIds.includes(spell.id)));
      })
      .catch((error) => {
        if (active) {
          setNotice(error instanceof Error ? error.message : 'Unable to load NPC spells.');
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
  }, [selectedNpc]);

  const target: SpellbookTarget | null = selectedNpc
    ? { targetType: 'npc', targetId: selectedNpc.id }
    : null;
  const knownSpellIds = spellbook?.spellIds ?? [];
  const allowedSpellType = selectedNpc ? getAllowedSpellType(selectedNpc.class, selectedNpc.level) : null;

  const reloadSpellbook = async (npc: Npc) => {
    const nextTarget: SpellbookTarget = { targetType: 'npc', targetId: npc.id };
    const [nextSpellbook, allSpells] = await Promise.all([
      loadTargetSpellbook(nextTarget, npc.ownerId),
      loadSpells(),
    ]);

    setSpellbook(nextSpellbook as NpcSpellbook);
    setKnownSpells(allSpells.filter((spell) => nextSpellbook.spellIds.includes(spell.id)));
  };

  const handleAddSpell = async (spell: Spell) => {
    if (!selectedNpc || !target) return;

    const validation = validateSpellAddition(selectedNpc.class, spell.characterClass);

    if (!validation.ok) {
      setNotice(validation.error);
      return;
    }

    if (knownSpellIds.includes(spell.id)) {
      setNotice(`${spell.name} is already known.`);
      return;
    }

    await addSpellToTargetSpellbook(target, spell.id, selectedNpc.ownerId);
    await reloadSpellbook(selectedNpc);
    setNotice(`${spell.name} added to ${selectedNpc.name || 'NPC'}.`);
  };

  const handleRemoveSpell = async (spell: Spell) => {
    if (!selectedNpc || !target) return;

    await removeSpellFromTargetSpellbook(target, spell.id, selectedNpc.ownerId);
    await reloadSpellbook(selectedNpc);
    setNotice(`${spell.name} removed.`);
  };

  const handleCastSpell = async (spell: Spell) => {
    if (!selectedNpc || !target) return;

    const result = await castSpellForTarget(target, spell, { npc: selectedNpc });

    if (!result.success) {
      setNotice(result.error);
      return;
    }

    if (result.npc) {
      onNpcUpdated(result.npc);
    }

    setNotice(`${spell.name} cast.`);
  };

  const handleResetMp = async () => {
    if (!selectedNpc || !target) return;

    if ((selectedNpc.magicPoints ?? 0) >= (selectedNpc.maxMagicPoints ?? 0)) {
      setNotice('Already at full MP.');
      return;
    }

    const result = await restoreMagicPoints(target, { npc: selectedNpc });

    if (!result.success) {
      setNotice(result.error);
      return;
    }

    if (result.npc) {
      onNpcUpdated(result.npc);
    }

    setNotice('Magic Points reset.');
  };

  return (
    <div style={styles.layout}>
      <aside style={styles.leftPanel}>
        <h2 style={styles.panelTitle}>NPC List</h2>
        {spellcastingNpcs.length === 0 && <p style={styles.mutedText}>No spellcasting NPCs saved yet.</p>}
        <div style={styles.npcList}>
          {spellcastingNpcs.map((npc) => (
            <button
              key={npc.id}
              type="button"
              onClick={() => setSelectedNpcId(npc.id)}
              style={npc.id === selectedNpcId ? styles.activeNpcButton : styles.npcButton}
            >
              <strong>{npc.name || 'Unnamed NPC'}</strong>
              <span>{npc.class} | Level {npc.level}</span>
            </button>
          ))}
        </div>
      </aside>

      <section style={styles.rightPanel}>
        {!selectedNpc && <p style={styles.mutedText}>{SPELLBOOK_UNAVAILABLE_MESSAGE}</p>}

        {selectedNpc && (
          <>
            <div style={styles.headerRow}>
              <div>
                <h2 style={styles.panelTitle}>{selectedNpc.name || 'Unnamed NPC'} Spells</h2>
                <p style={styles.mutedText}>{selectedNpc.class} | Level {selectedNpc.level}</p>
              </div>
              <div style={styles.resourceRow}>
                <span>HP: {selectedNpc.hitPoints} / {selectedNpc.hitPoints}</span>
                <span>MP: {selectedNpc.magicPoints ?? 0} / {selectedNpc.maxMagicPoints ?? 0}</span>
                <button
                  type="button"
                  onClick={handleResetMp}
                  disabled={(selectedNpc.magicPoints ?? 0) >= (selectedNpc.maxMagicPoints ?? 0)}
                  style={(selectedNpc.magicPoints ?? 0) >= (selectedNpc.maxMagicPoints ?? 0) ? styles.disabledButton : styles.smallButton}
                >
                  Reset MP
                </button>
              </div>
            </div>

            {notice && <p style={styles.notice}>{notice}</p>}
            {isLoading && <p style={styles.mutedText}>Loading spells...</p>}

            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>Known Spells</h3>
              {knownSpells.length === 0 && !isLoading && <p style={styles.mutedText}>No known spells yet.</p>}
              <div style={styles.spellList}>
                {knownSpells.map((spell) => (
                  <SpellRow
                    key={spell.id}
                    spell={spell}
                    onOpen={() => setSelectedKnownSpell(spell)}
                    onCast={() => handleCastSpell(spell)}
                    onRemove={() => handleRemoveSpell(spell)}
                  />
                ))}
              </div>
            </section>

            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>Add Spells</h3>
              {selectedNpc && allowedSpellType && (
                <SpellPicker
                  targetType="npc"
                  targetId={selectedNpc.id}
                  allowedSpellType={allowedSpellType}
                  mode="add"
                  selectedLevel={1}
                  knownSpellIds={knownSpellIds}
                  onAddSpell={handleAddSpell}
                />
              )}
            </section>

            <SpellDetailModal
              spell={selectedKnownSpell}
              mode="cast"
              onAction={selectedKnownSpell ? handleCastSpell : undefined}
              onClose={() => setSelectedKnownSpell(null)}
            />
          </>
        )}
      </section>
    </div>
  );
}

function SpellRow({
  spell,
  onOpen,
  onCast,
  onRemove,
}: {
  spell: Spell;
  onOpen: () => void;
  onCast: () => void;
  onRemove: () => void;
}) {
  return (
    <article style={styles.spellCard}>
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onOpen();
          }
        }}
        style={styles.knownSpellRow}
      >
        <span style={styles.spellNameText}>{spell.name}</span>
        <span style={styles.rowMeta}>Level {spell.level}</span>
        <span style={styles.rowMeta}>{formatSpellGroups(spell)}</span>
        <span style={styles.rowMeta}>{formatSpellMagicPointCost(spell)}</span>
        <button type="button" onClick={(event) => { event.stopPropagation(); onCast(); }} style={styles.smallButton}>Cast Spell</button>
        <button type="button" onClick={(event) => { event.stopPropagation(); onRemove(); }} style={styles.removeButton}>Remove</button>
      </div>
    </article>
  );
}

const styles: Record<string, React.CSSProperties> = {
  layout: {
    display: 'grid',
    gap: 14,
    gridTemplateColumns: 'minmax(220px, 300px) 1fr',
  },
  leftPanel: {
    background: 'rgba(2,6,23,0.34)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    display: 'grid',
    gap: 10,
    alignSelf: 'start',
    padding: 12,
  },
  rightPanel: {
    background: 'rgba(2,6,23,0.34)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    display: 'grid',
    gap: 14,
    padding: 12,
  },
  panelTitle: {
    color: '#a9fff7',
    fontSize: 20,
    margin: 0,
  },
  npcList: {
    display: 'grid',
    gap: 8,
  },
  npcButton: {
    background: 'rgba(15,23,42,0.82)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 6,
    color: '#f8fafc',
    cursor: 'pointer',
    display: 'grid',
    gap: 3,
    padding: 10,
    textAlign: 'left',
  },
  activeNpcButton: {
    background: 'rgba(169,255,247,0.14)',
    border: '1px solid rgba(169,255,247,0.45)',
    borderRadius: 6,
    color: '#f8fafc',
    cursor: 'pointer',
    display: 'grid',
    gap: 3,
    padding: 10,
    textAlign: 'left',
  },
  headerRow: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  resourceRow: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    color: '#fde68a',
    fontWeight: 900,
  },
  section: {
    display: 'grid',
    gap: 10,
  },
  sectionTitle: {
    color: '#fde68a',
    fontSize: 14,
    margin: 0,
  },
  mutedText: {
    color: '#94a3b8',
    margin: 0,
  },
  notice: {
    color: '#a9fff7',
    margin: 0,
  },
  spellList: {
    display: 'grid',
    gap: 8,
  },
  spellCard: {
    background: 'rgba(15,23,42,0.62)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    display: 'grid',
    gap: 8,
    padding: 10,
  },
  knownSpellRow: {
    alignItems: 'center',
    cursor: 'pointer',
    display: 'grid',
    gap: 8,
    gridTemplateColumns: 'minmax(150px, 1.2fr) 70px minmax(130px, 1fr) 100px 70px auto auto',
  },
  addSpellRow: {
    alignItems: 'center',
    background: 'rgba(15,23,42,0.62)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 6,
    cursor: 'pointer',
    display: 'grid',
    gap: 8,
    gridTemplateColumns: 'minmax(150px, 1fr) 80px 80px 80px auto',
    padding: 10,
  },
  spellNameButton: {
    background: 'transparent',
    border: 0,
    color: '#f8fafc',
    cursor: 'pointer',
    font: 'inherit',
    fontWeight: 900,
    padding: 0,
    textAlign: 'left',
  },
  spellNameText: {
    color: '#f8fafc',
    fontWeight: 900,
  },
  rowMeta: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  controls: {
    display: 'grid',
    gap: 8,
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
  },
  control: {
    background: 'rgba(2,6,23,0.68)',
    border: '1px solid rgba(255,255,255,0.16)',
    borderRadius: 6,
    color: '#f8fafc',
    minHeight: 36,
    padding: '0 10px',
  },
  smallButton: {
    background: '#a9fff7',
    border: '1px solid rgba(169,255,247,0.8)',
    borderRadius: 6,
    color: '#0f172a',
    cursor: 'pointer',
    fontWeight: 900,
    minHeight: 32,
    padding: '0 10px',
  },
  disabledButton: {
    background: 'rgba(148,163,184,0.18)',
    border: '1px solid rgba(148,163,184,0.25)',
    borderRadius: 6,
    color: '#94a3b8',
    cursor: 'not-allowed',
    fontWeight: 900,
    minHeight: 32,
    padding: '0 10px',
  },
  removeButton: {
    background: 'rgba(127,29,29,0.38)',
    border: '1px solid rgba(248,113,113,0.45)',
    borderRadius: 6,
    color: '#fecaca',
    cursor: 'pointer',
    fontWeight: 800,
    minHeight: 32,
    padding: '0 10px',
  },
  expandedPanel: {
    borderTop: '1px solid rgba(255,255,255,0.1)',
    display: 'grid',
    gap: 10,
    paddingTop: 10,
  },
  expandedHeader: {
    alignItems: 'flex-start',
    display: 'flex',
    gap: 12,
    justifyContent: 'space-between',
  },
  expandedTitle: {
    color: '#fde68a',
    fontSize: 18,
    margin: 0,
  },
  expandedSubtitle: {
    color: '#cbd5e1',
    fontSize: 13,
    margin: '4px 0 0',
  },
  expandedCost: {
    color: '#a9fff7',
    fontWeight: 900,
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
  description: {
    color: '#e2e8f0',
    lineHeight: 1.5,
    margin: 0,
  },
};
