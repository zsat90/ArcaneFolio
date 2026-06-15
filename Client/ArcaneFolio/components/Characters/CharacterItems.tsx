import React from "react";
import {handleCharacterSelect} from '../../utils/character/CharacterActions'

const CharacterItem = ({ item, navigation, setSelectedCharacter, onDelete }) => {
  return (
    <div style={styles.characterItem}>
      <div style={styles.textContainer}>
        <div>
          <strong style={styles.characterName}>{item.name}</strong>
          <span style={styles.characterClass}>{item.class}</span>
        </div>
        <div style={styles.metaRow}>
          {item.level && <span style={styles.metaPill}>Level {item.level}</span>}
          <span style={styles.metaPill}>{item.magicPoints ?? 0}/{item.maxMagicPoints ?? item.magicPoints ?? 0} MP</span>
          <span style={styles.metaPill}>{item.hitPoints ?? 0}/{item.maxHitPoints ?? item.hitPoints ?? 0} HP</span>
        </div>
      </div>
      <div style={styles.actions}>
        <button type="button" style={styles.button} onClick={() => handleCharacterSelect(item, navigation, setSelectedCharacter)}>
          Select
        </button>
        <button type="button" style={styles.killButton} onClick={() => onDelete?.(item)}>
          Kill
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  characterItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    padding: 18,
    backgroundColor: "rgba(15,23,42,0.88)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 8,
    boxShadow: "0 14px 36px rgba(0,0,0,0.22)",
    alignItems: "center",
  },

  textContainer: {
    flex: 1,
    paddingRight: 10,
    display: "grid",
    gap: 12,
  },
  characterName: {
    color: "#f8fafc",
    display: "block",
    fontSize: 22,
    fontWeight: "bold",
  },
  characterClass: {
    color: "#a9fff7",
    display: "block",
    fontSize: 14,
    fontWeight: 800,
    marginTop: 4,
  },
  button: {
    backgroundColor: "rgba(169,255,247,0.12)",
    border: "1px solid rgba(169,255,247,0.38)",
    borderRadius: 6,
    color: "#a9fff7",
    cursor: "pointer",
    fontWeight: 800,
    minHeight: 40,
    padding: "0 16px",
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "flex-end",
  },
  killButton: {
    backgroundColor: "rgba(127,29,29,0.38)",
    border: "1px solid rgba(248,113,113,0.45)",
    borderRadius: 6,
    color: "#fecaca",
    cursor: "pointer",
    fontWeight: 800,
    minHeight: 40,
    padding: "0 14px",
  },
  metaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  metaPill: {
    border: "1px solid rgba(212,175,55,0.32)",
    borderRadius: 999,
    color: "#fde68a",
    fontSize: 13,
    fontWeight: 800,
    padding: "5px 9px",
  },
};

export default CharacterItem;
