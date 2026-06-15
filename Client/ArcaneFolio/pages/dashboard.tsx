import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelectedCharacter } from '../utils/character/characterState';

export default function DashboardPage() {
  const router = useRouter();
  const persistedCharacter = useSelectedCharacter();
  const selectedCharacterParam = router.query.selectedCharacter;
  const selectedCharacter = Array.isArray(selectedCharacterParam)
    ? selectedCharacterParam[0]
    : selectedCharacterParam;
  const characterName = selectedCharacter || persistedCharacter?.name || 'Select a Character';
  const characterClass = persistedCharacter?.characterClass || persistedCharacter?.class;
  const magicPoints = persistedCharacter
    ? `${persistedCharacter.magicPoints ?? 0}/${persistedCharacter.maxMagicPoints ?? persistedCharacter.magicPoints ?? 0} MP`
    : null;
  const hitPoints = persistedCharacter
    ? `${persistedCharacter.hitPoints ?? 0}/${persistedCharacter.maxHitPoints ?? persistedCharacter.hitPoints ?? 0} HP`
    : null;

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0B1120', color: '#fff' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px' }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <span style={{ color: '#A9FFF7', fontWeight: 800 }}>Arcane Folio</span>
          <div style={styles.headerActions}>
            <Link href="/characters" legacyBehavior>
              <a style={styles.switchLink}>Switch Character</a>
            </Link>
            <Link href="/login" legacyBehavior>
              <a style={styles.logoutLink}>Logout</a>
            </Link>
          </div>
        </nav>

        <section style={{ marginBottom: 28 }}>
          <p style={{ color: '#D4AF37', fontSize: 14, fontWeight: 700, margin: '0 0 8px' }}>Character Dashboard</p>
          <h1 style={{ fontSize: 40, margin: 0 }}>{characterName}</h1>
          {persistedCharacter && (
            <div style={styles.statRow}>
              {characterClass && <span style={styles.statPill}>{characterClass}</span>}
              {persistedCharacter.level && <span style={styles.statPill}>Level {persistedCharacter.level}</span>}
              {magicPoints && <span style={styles.statPill}>{magicPoints}</span>}
              {hitPoints && <span style={styles.statPill}>{hitPoints}</span>}
            </div>
          )}
          <p style={{ color: '#CBD5E1', fontSize: 18, maxWidth: 680 }}>
            Manage this character's spell resources, spellbook, and upcoming character details from one place.
          </p>
        </section>

        <section style={styles.cardGrid}>
          <Link href="/dashboard/character-sheet" legacyBehavior>
            <a style={styles.dashboardCard}>
              <span style={styles.cardTitle}>Character Sheet</span>
              <span style={styles.cardText}>Edit this character's core stats, saves, gear, and notes.</span>
            </a>
          </Link>
          <Link href="/dashboard/spells" legacyBehavior>
            <a style={styles.dashboardCard}>
              <span style={styles.cardTitle}>Browse Spells</span>
              <span style={styles.cardText}>Search and filter the spell list.</span>
            </a>
          </Link>
          <Link href="/dashboard/spellbook" legacyBehavior>
            <a style={styles.dashboardCard}>
              <span style={styles.cardTitle}>Spell Book</span>
              <span style={styles.cardText}>Review this character's prepared spells.</span>
            </a>
          </Link>
          <Link href="/dashboard/random-spell-generator" legacyBehavior>
            <a style={styles.dashboardCard}>
              <span style={styles.cardTitle}>Random Spell Generator</span>
              <span style={styles.cardText}>Roll a class-based spellbook and add it to this character.</span>
            </a>
          </Link>
          <Link href="/dashboard/equipment" legacyBehavior>
            <a style={styles.dashboardCard}>
              <span style={styles.cardTitle}>Equipment List</span>
              <span style={styles.cardText}>Browse weapons, armor, provisions, transport, animals, services, and adventuring gear.</span>
            </a>
          </Link>
        </section>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  headerActions: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-end',
  },
  switchLink: {
    border: '1px solid rgba(169,255,247,0.35)',
    borderRadius: 6,
    color: '#A9FFF7',
    fontWeight: 800,
    padding: '8px 10px',
    textDecoration: 'none',
  },
  logoutLink: {
    color: '#FCA5A5',
    fontWeight: 700,
    textDecoration: 'none',
  },
  cardGrid: {
    display: 'grid',
    gap: 16,
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
  },
  dashboardCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#fff',
    display: 'grid',
    gap: 8,
    minHeight: 130,
    padding: 20,
    textDecoration: 'none',
  },
  cardTitle: {
    color: '#A9FFF7',
    fontSize: 20,
    fontWeight: 700,
  },
  cardText: {
    color: '#CBD5E1',
    fontSize: 15,
    lineHeight: 1.5,
  },
  statRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 12,
  },
  statPill: {
    border: '1px solid rgba(212,175,55,0.35)',
    borderRadius: 999,
    color: '#FDE68A',
    fontSize: 13,
    fontWeight: 800,
    padding: '6px 10px',
  },
};
