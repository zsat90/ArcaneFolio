import React, { ChangeEvent } from 'react';

type EquipmentItemRowProps = {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  inputStyle?: React.CSSProperties;
};

export default function EquipmentItemRow({
  value,
  onChange,
  onRemove,
  inputStyle,
}: EquipmentItemRowProps) {
  return (
    <div style={styles.row}>
      <input value={value} onChange={onChange} style={{ ...styles.input, ...inputStyle }} />
      <button type="button" onClick={onRemove} aria-label="Remove item" style={styles.removeButton}>
        ×
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  row: {
    alignItems: 'center',
    breakInside: 'avoid',
    display: 'flex',
    gap: 6,
    marginBottom: 7,
    width: '100%',
  },
  input: {
    background: 'rgba(255,248,221,0.24)',
    border: 0,
    borderBottom: '1px solid rgba(62,37,17,0.34)',
    boxSizing: 'border-box',
    color: '#24180f',
    flex: 1,
    fontFamily: '"Palatino Linotype", "Book Antiqua", Georgia, serif',
    fontSize: 14,
    fontWeight: 800,
    minHeight: 28,
    minWidth: 0,
    outline: 'none',
    padding: '3px 5px',
  },
  removeButton: {
    background: 'rgba(127, 29, 29, 0.12)',
    border: '1px solid rgba(127, 29, 29, 0.34)',
    borderRadius: 4,
    color: '#7f1d1d',
    cursor: 'pointer',
    flexShrink: 0,
    fontSize: 18,
    fontWeight: 900,
    lineHeight: 1,
    minHeight: 28,
    minWidth: 28,
    padding: 0,
  },
};
