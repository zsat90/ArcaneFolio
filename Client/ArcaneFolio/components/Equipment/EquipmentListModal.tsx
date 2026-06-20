import React, { useEffect, useRef } from 'react';
import EquipmentListPanel from './EquipmentListPanel';

type EquipmentListModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onEquipLine: (itemLine: string, itemName: string, equipmentBucket?: string, itemCost?: string) => string | void;
  actionLabel?: string;
};

export default function EquipmentListModal({ isOpen, onClose, onEquipLine, actionLabel }: EquipmentListModalProps) {
  const scrollTopRef = useRef(0);

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') {
      return;
    }

    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyLeft = body.style.left;
    const previousBodyRight = body.style.right;
    const previousBodyWidth = body.style.width;
    const previousHtmlOverflow = documentElement.style.overflow;

    scrollTopRef.current = window.scrollY || window.pageYOffset || 0;

    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollTopRef.current}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    documentElement.style.overflow = 'hidden';

    return () => {
      body.style.overflow = previousBodyOverflow;
      body.style.position = previousBodyPosition;
      body.style.top = previousBodyTop;
      body.style.left = previousBodyLeft;
      body.style.right = previousBodyRight;
      body.style.width = previousBodyWidth;
      documentElement.style.overflow = previousHtmlOverflow;
      window.scrollTo(0, scrollTopRef.current);
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={styles.backdrop}
    >
      <section
        aria-label="Equipment List"
        aria-modal="true"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
        style={styles.dialog}
      >
        <div style={styles.header}>
          <div>
            <p style={styles.eyebrow}>Gear Reference</p>
            <h2 style={styles.title}>Equipment List</h2>
          </div>
          <button type="button" onClick={onClose} style={styles.closeButton} aria-label="Close equipment list">
            Close
          </button>
        </div>

        <div style={styles.contentScroll}>
          <EquipmentListPanel onEquipLine={onEquipLine} actionLabel={actionLabel} />
        </div>
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    alignItems: 'center',
    background: 'rgba(2,6,23,0.74)',
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    left: 0,
    padding: 16,
    position: 'fixed',
    right: 0,
    top: 0,
    overscrollBehavior: 'contain',
    zIndex: 50,
  },
  dialog: {
    background: 'rgba(15,23,42,0.98)',
    border: '1px solid rgba(255,255,255,0.16)',
    borderRadius: 8,
    boxShadow: '0 24px 70px rgba(0,0,0,0.48)',
    color: '#f8fafc',
    display: 'grid',
    gap: 16,
    gridTemplateRows: 'auto minmax(0, 1fr)',
    maxHeight: 'calc(100vh - 32px)',
    maxWidth: 1080,
    overflow: 'hidden',
    padding: 16,
    width: 'min(1080px, 100%)',
  },
  contentScroll: {
    minHeight: 0,
    overflowX: 'hidden',
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    WebkitOverflowScrolling: 'touch',
  },
  header: {
    alignItems: 'center',
    display: 'flex',
    gap: 12,
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: '#d4af37',
    fontSize: 13,
    fontWeight: 900,
    margin: 0,
  },
  title: {
    fontSize: 28,
    margin: '2px 0 0',
  },
  closeButton: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 6,
    color: '#f8fafc',
    cursor: 'pointer',
    fontWeight: 900,
    minHeight: 36,
    padding: '0 12px',
  },
};
