import React from 'react';
import MagicalItemsListPanel from '../../components/MagicalItems/MagicalItemsListPanel';
import RandomMagicalItemGenerator from '../../components/MagicalItems/RandomMagicalItemGenerator';
import ImageBackgroundWrapper from '../../components/imageBackground';
import NavDrawer from '../../components/Navigation/navDrawer';

export default function MagicalItemsPage() {
  return (
    <ImageBackgroundWrapper>
      <main style={styles.page}>
        <NavDrawer />

        <section style={styles.header}>
          <p style={styles.eyebrow}>Treasure Reference</p>
          <h1 style={styles.title}>Magical Items</h1>
          <p style={styles.subtitle}>
            Browse magical item categories and generate random loot for the selected character.
          </p>
        </section>

        <RandomMagicalItemGenerator />
        <MagicalItemsListPanel />
      </main>
    </ImageBackgroundWrapper>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    color: '#f8fafc',
    margin: '0 auto',
    maxWidth: 1180,
    padding: '16px 16px 56px',
  },
  header: {
    display: 'grid',
    gap: 8,
    margin: '24px 0 18px',
  },
  eyebrow: {
    color: '#d4af37',
    fontSize: 14,
    fontWeight: 800,
    margin: 0,
  },
  title: {
    fontSize: 38,
    margin: 0,
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 16,
    lineHeight: 1.5,
    margin: 0,
    maxWidth: 760,
  },
};
