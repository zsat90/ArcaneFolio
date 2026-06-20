import React, { useState } from 'react';
import type { MagicalItem } from '../../types/magicalItemTypes';
import { useSelectedCharacter } from '../../utils/character/characterState';
import { getCharacterSheet, setCharacterSheet } from '../../utils/character/characterSheetState';
import {
  formatMagicalItemLine,
  MAGICAL_ITEM_CATEGORIES,
  MAGICAL_ITEMS_BY_CATEGORY,
} from '../../utils/magicalItems/magicalItems';

type MagicalItemsListPanelProps = {
  onAddItem?: (itemLine: string, itemName: string) => string | void;
  actionLabel?: string;
};

export default function MagicalItemsListPanel({
  onAddItem,
  actionLabel = 'Add',
}: MagicalItemsListPanelProps) {
  const [activeCategory, setActiveCategory] = useState<string>(MAGICAL_ITEM_CATEGORIES[0]);
  const [notice, setNotice] = useState('');
  const selectedCharacter = useSelectedCharacter();
  const activeItems = MAGICAL_ITEMS_BY_CATEGORY[activeCategory as keyof typeof MAGICAL_ITEMS_BY_CATEGORY] ?? [];
  const noticeIsError = notice.toLowerCase().includes('select or create');

  const addMagicalItemLine = (item: MagicalItem, itemLine: string) => {
    if (onAddItem) {
      const errorMessage = onAddItem(itemLine, item.name);

      if (errorMessage) {
        setNotice(errorMessage);
        return;
      }

      setNotice(`${item.name} added to magical items.`);
      return;
    }

    if (!selectedCharacter) {
      setNotice('Select or create a character before adding magical items.');
      return;
    }

    const characterId = Number(selectedCharacter.id);
    const sheet = getCharacterSheet(characterId);
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

  const handleAddItem = (item: MagicalItem) => {
    addMagicalItemLine(item, formatMagicalItemLine(item));
  };

  return (
    <section style={styles.layout}>
      <aside style={styles.menuPanel}>
        {MAGICAL_ITEM_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => {
              setActiveCategory(category);
              setNotice('');
            }}
            style={{
              ...styles.menuButton,
              ...(activeCategory === category ? styles.menuButtonActive : {}),
            }}
          >
            {category}
          </button>
        ))}
      </aside>

      <section style={styles.listPanel}>
        <div style={styles.listHeader}>
          <div>
            <h2 style={styles.categoryTitle}>{activeCategory}</h2>
            <p style={styles.categorySubtitle}>Magical item reference list</p>
          </div>
        </div>

        {notice && (
          <p style={{ ...styles.notice, ...(noticeIsError ? styles.noticeError : styles.noticeSuccess) }}>
            {notice}
          </p>
        )}

        <div style={styles.tableShell}>
          <div style={styles.tableHeader}>Item</div>
          <div style={styles.tableHeader}>Category</div>
          <div style={styles.tableHeader}>Action</div>

          {!activeItems.length && (
            <p style={styles.emptyRow}>Items for this category will be added soon.</p>
          )}

          {activeItems.map((item) => (
            <React.Fragment key={item.id}>
              <div style={styles.tableCell}>{item.name}</div>
              <div style={styles.tableCell}>{item.category}</div>
              <div style={styles.actionCell}>
                <button type="button" onClick={() => handleAddItem(item)} style={styles.addButton}>
                  {actionLabel}
                </button>
              </div>
            </React.Fragment>
          ))}
        </div>
      </section>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  layout: {
    alignItems: 'start',
    display: 'grid',
    gap: 16,
    gridTemplateColumns: 'minmax(190px, 0.35fr) minmax(0, 1fr)',
  },
  menuPanel: {
    background: 'rgba(15,23,42,0.88)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    display: 'grid',
    gap: 8,
    padding: 10,
  },
  menuButton: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 6,
    color: '#cbd5e1',
    cursor: 'pointer',
    fontWeight: 800,
    minHeight: 38,
    padding: '0 10px',
    textAlign: 'left',
  },
  menuButtonActive: {
    background: 'rgba(169,255,247,0.12)',
    borderColor: 'rgba(169,255,247,0.42)',
    color: '#a9fff7',
  },
  listPanel: {
    background: 'rgba(15,23,42,0.88)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    boxShadow: '0 18px 42px rgba(0,0,0,0.24)',
    display: 'grid',
    gap: 12,
    padding: 14,
  },
  listHeader: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  categoryTitle: {
    color: '#a9fff7',
    fontSize: 24,
    fontWeight: 900,
    margin: 0,
  },
  categorySubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: 800,
    margin: '4px 0 0',
  },
  notice: {
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 900,
    margin: 0,
    padding: '10px 12px',
    textAlign: 'center',
  },
  noticeSuccess: {
    background: 'rgba(20,83,45,0.94)',
    border: '1px solid rgba(74,222,128,0.62)',
    color: '#dcfce7',
  },
  noticeError: {
    background: 'rgba(127,29,29,0.94)',
    border: '1px solid rgba(248,113,113,0.68)',
    color: '#fee2e2',
  },
  tableShell: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: 'minmax(180px, 1.1fr) minmax(220px, 1.4fr) minmax(86px, 0.4fr)',
    overflowX: 'auto',
  },
  tableHeader: {
    background: 'rgba(169,255,247,0.12)',
    color: '#dffcff',
    fontSize: 12,
    fontWeight: 900,
    minHeight: 30,
    padding: '7px 8px',
  },
  tableCell: {
    alignItems: 'center',
    background: 'rgba(255,255,255,0.05)',
    color: '#f8fafc',
    display: 'flex',
    fontSize: 14,
    minHeight: 38,
    padding: '8px',
  },
  actionCell: {
    alignItems: 'center',
    background: 'rgba(255,255,255,0.05)',
    display: 'flex',
    minHeight: 38,
    padding: '6px 8px',
  },
  addButton: {
    background: 'rgba(20,83,45,0.38)',
    border: '1px solid rgba(74,222,128,0.42)',
    borderRadius: 6,
    color: '#bbf7d0',
    cursor: 'pointer',
    fontWeight: 800,
    minHeight: 30,
    padding: '0 10px',
  },
  emptyRow: {
    background: 'rgba(255,255,255,0.05)',
    color: '#94a3b8',
    fontSize: 14,
    gridColumn: '1 / -1',
    margin: 0,
    minHeight: 42,
    padding: '12px 8px',
  },
};
