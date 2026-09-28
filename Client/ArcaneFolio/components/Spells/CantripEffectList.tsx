import React from 'react';
import { Spell } from '../../types/spellTypes';

export default function CantripEffectList({ effects }: { effects: Spell[] }) {
  if (effects.length === 0) {
    return null;
  }

  return (
    <details style={styles.group}>
      <summary style={styles.groupSummary}>Cantrip effects <span>{effects.length}</span></summary>
      <ul style={styles.list}>
        {effects.map((effect) => (
          <li key={effect.id} style={styles.item}>
            <details>
              <summary style={styles.effectSummary}>{effect.name}</summary>
              <p style={styles.description}>{effect.description}</p>
            </details>
          </li>
        ))}
      </ul>
    </details>
  );
}

const styles: Record<string, React.CSSProperties> = {
  group: {
    marginTop: 16,
    borderTop: '1px solid rgba(255,255,255,0.14)',
    paddingTop: 12,
  },
  groupSummary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    cursor: 'pointer',
    fontWeight: 700,
  },
  list: {
    listStyle: 'none',
    margin: '8px 0 0',
    padding: 0,
  },
  item: {
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    padding: '8px 0',
  },
  effectSummary: {
    cursor: 'pointer',
    fontWeight: 600,
  },
  description: {
    margin: '8px 0 4px 16px',
    color: '#cbd5e1',
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
  },
};