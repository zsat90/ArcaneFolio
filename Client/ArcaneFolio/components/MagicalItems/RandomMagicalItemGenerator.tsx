import React, { useState } from 'react';
import type { MagicalItem } from '../../types/magicalItemTypes';
import { useSelectedCharacter } from '../../utils/character/characterState';
import { getCharacterSheet, setCharacterSheet } from '../../utils/character/characterSheetState';
import { formatMagicalItemLine, generateRandomMagicalItems } from '../../utils/magicalItems/magicalItems';

export default function RandomMagicalItemGenerator() {
  const selectedCharacter = useSelectedCharacter();
  const [itemCount, setItemCount] = useState('3');
  const [generatedItems, setGeneratedItems] = useState<MagicalItem[]>([]);
  const [notice, setNotice] = useState('');

  const handleGenerate = () => {
    const count = Math.max(1, Number(itemCount) || 1);

    setItemCount(String(count));
    setGeneratedItems(generateRandomMagicalItems(count));
    setNotice('');
  };

  const addItemToCharacter = (item: MagicalItem) => {
    if (!selectedCharacter) {
      setNotice('Select or create a character before adding magical items.');
      return;
    }

    const characterId = Number(selectedCharacter.id);
    const sheet = getCharacterSheet(characterId);
    const itemLine = formatMagicalItemLine(item);
    const currentItems = sheet.equipmentDetails.Magical?.trim();
    const nextSheet = {
      ...sheet,
      equipmentDetails: {
        ...sheet.equipmentDetails,
        Magical: currentItems ? `${currentItems}\n${itemLine}` : itemLine,
      },
    };

    setCharacterSheet(characterId, nextSheet);
    setNotice(`${item.name} added to ${selectedCharacter.name}'s magical items.`);
  };

  const handleAddAll = () => {
    if (!selectedCharacter) {
      setNotice('Select or create a character before adding magical items.');
      return;
    }

    if (!generatedItems.length) {
      return;
    }

    const characterId = Number(selectedCharacter.id);
    const sheet = getCharacterSheet(characterId);
    const newLines = generatedItems.map((item) => formatMagicalItemLine(item));
    const currentItems = sheet.equipmentDetails.Magical?.trim();
    const nextSheet = {
      ...sheet,
      equipmentDetails: {
        ...sheet.equipmentDetails,
        Magical: currentItems
          ? `${currentItems}\n${newLines.join('\n')}`
          : newLines.join('\n'),
      },
    };

    setCharacterSheet(characterId, nextSheet);
    setNotice(`${generatedItems.length} magical items added to ${selectedCharacter.name}.`);
  };

  return (
    <section style={styles.panel}>
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.title}>Random Magical Item Generator</h2>
          <p style={styles.subtitle}>Enter how many items to roll, then add results to the selected character.</p>
        </div>
      </div>

      <div style={styles.controls}>
        <label style={styles.field}>
          <span style={styles.label}>Number of Items</span>
          <input
            type="number"
            min={1}
            max={100}
            value={itemCount}
            onChange={(event) => setItemCount(event.target.value)}
            style={styles.control}
          />
        </label>

        <button type="button" onClick={handleGenerate} style={styles.generateButton}>
          Generate
        </button>
      </div>

      {notice && <p style={styles.notice}>{notice}</p>}

      <div style={styles.resultHeader}>
        <h3 style={styles.resultTitle}>Generated Items</h3>
        <div style={styles.resultActions}>
          <span style={styles.count}>{generatedItems.length} items</span>
          <button type="button" onClick={handleAddAll} style={styles.addAllButton} disabled={!generatedItems.length}>
            Add All
          </button>
        </div>
      </div>

      {!generatedItems.length && (
        <p style={styles.empty}>Generate magical items to see results.</p>
      )}

      <div style={styles.itemList}>
        {generatedItems.map((item) => (
          <article key={item.id} style={styles.itemRow}>
            <span style={styles.itemName}>{item.name}</span>
            <span style={styles.itemMeta}>{item.category}</span>
            <span style={styles.itemMeta}>{item.notes || item.category}</span>
            <button type="button" onClick={() => addItemToCharacter(item)} style={styles.addButton}>
              Add
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    background: 'rgba(15,23,42,0.9)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    boxShadow: '0 18px 42px rgba(0,0,0,0.24)',
    display: 'grid',
    gap: 16,
    marginBottom: 20,
    padding: 18,
  },
  headerRow: {
    display: 'grid',
    gap: 6,
  },
  title: {
    color: '#a9fff7',
    fontSize: 24,
    fontWeight: 900,
    margin: 0,
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 1.5,
    margin: 0,
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
  notice: {
    background: 'rgba(30,64,175,0.42)',
    border: '1px solid rgba(96,165,250,0.38)',
    borderRadius: 8,
    color: '#dbeafe',
    margin: 0,
    padding: 12,
  },
  resultHeader: {
    alignItems: 'center',
    display: 'flex',
    gap: 16,
    justifyContent: 'space-between',
  },
  resultTitle: {
    fontSize: 18,
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
  itemList: {
    display: 'grid',
    gap: 8,
  },
  itemRow: {
    alignItems: 'center',
    background: 'rgba(15,23,42,0.88)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    display: 'grid',
    gap: 12,
    gridTemplateColumns: 'minmax(180px, 1.2fr) minmax(120px, 0.7fr) minmax(180px, 1fr) 72px',
    minHeight: 52,
    minWidth: 720,
    overflowX: 'auto',
    padding: '10px 14px',
  },
  itemName: {
    fontWeight: 800,
  },
  itemMeta: {
    color: '#cbd5e1',
    fontSize: 14,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
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
  empty: {
    color: '#cbd5e1',
    margin: 0,
  },
};
