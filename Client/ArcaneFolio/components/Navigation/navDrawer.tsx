import React, { ChangeEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { logout } from '../../utils/auth/authService';
import {
  addMagicPoints,
  damageSelectedCharacter,
  healSelectedCharacter,
  restSelectedCharacter,
  useSelectedCharacter,
} from '../../utils/character/characterState';

const NavDrawer = () => {
  const router = useRouter();
  const selectedCharacter = useSelectedCharacter();
  const [damageAmount, setDamageAmount] = useState('');
  const [healAmount, setHealAmount] = useState('');
  const [magicAmount, setMagicAmount] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Route away even if Firebase is unavailable in the current environment.
    }

    router.push('/login');
  };

  const handleRest = () => {
    restSelectedCharacter();
  };

  const parseAmount = (value: string) => {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const handleDamage = () => {
    damageSelectedCharacter(parseAmount(damageAmount));
    setDamageAmount('');
  };

  const handleHeal = () => {
    healSelectedCharacter(parseAmount(healAmount));
    setHealAmount('');
  };

  const handleAddMagic = () => {
    addMagicPoints(parseAmount(magicAmount));
    setMagicAmount('');
  };

  const updateDamageAmount = (event: ChangeEvent<HTMLInputElement>) => {
    setDamageAmount(event.target.value);
  };

  const updateHealAmount = (event: ChangeEvent<HTMLInputElement>) => {
    setHealAmount(event.target.value);
  };

  const updateMagicAmount = (event: ChangeEvent<HTMLInputElement>) => {
    setMagicAmount(event.target.value);
  };

  return (
    <nav style={styles.nav} aria-label="Dashboard navigation">
      <Link href="/dashboard" legacyBehavior><a style={styles.brand}>Home</a></Link>

      <div style={styles.links}>
        <Link href="/dashboard/character-sheet" legacyBehavior><a style={styles.link}>Sheet</a></Link>
        <Link href="/dashboard/spells" legacyBehavior><a style={styles.link}>Spells</a></Link>
        <Link href="/dashboard/spellbook" legacyBehavior><a style={styles.link}>Spellbook</a></Link>
      </div>

      <div style={styles.characterTools}>
        {selectedCharacter && (
          <>
            <div style={styles.resourcePanel}>
              <div style={styles.resourceSummary}>
                <span style={styles.resourceLabel}>HP</span>
                <strong style={styles.resourceValue}>
                  {selectedCharacter.hitPoints ?? 0}/{selectedCharacter.maxHitPoints ?? selectedCharacter.hitPoints ?? 0}
                </strong>
              </div>
              <div style={styles.resourceActions}>
                <input
                  aria-label="Damage amount"
                  inputMode="numeric"
                  onChange={updateDamageAmount}
                  placeholder="Dmg"
                  style={styles.resourceInput}
                  value={damageAmount}
                />
                <button type="button" onClick={handleDamage} style={styles.damageButton}>
                  Damage
                </button>
                <input
                  aria-label="Healing amount"
                  inputMode="numeric"
                  onChange={updateHealAmount}
                  placeholder="Heal"
                  style={styles.resourceInput}
                  value={healAmount}
                />
                <button type="button" onClick={handleHeal} style={styles.healButton}>
                  Heal
                </button>
              </div>
            </div>
            <div style={styles.resourcePanel}>
              <div style={styles.resourceSummary}>
                <span style={styles.resourceLabel}>MP</span>
                <strong style={styles.resourceValue}>
                  {selectedCharacter.magicPoints ?? 0}/{selectedCharacter.maxMagicPoints ?? selectedCharacter.magicPoints ?? 0}
                </strong>
              </div>
              <div style={styles.resourceActions}>
                <input
                  aria-label="Magic point amount"
                  inputMode="numeric"
                  onChange={updateMagicAmount}
                  placeholder="MP"
                  style={styles.resourceInput}
                  value={magicAmount}
                />
                <button type="button" onClick={handleAddMagic} style={styles.magicButton}>
                  Add MP
                </button>
              </div>
            </div>
            <button type="button" onClick={handleRest} style={styles.restButton}>
              Rest
            </button>
          </>
        )}

        <button type="button" onClick={handleLogout} style={styles.logout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    background: 'rgba(15,23,42,0.9)',
    boxShadow: '0 14px 36px rgba(0,0,0,0.22)',
    padding: '12px 14px',
    flexWrap: 'wrap',
  },
  brand: {
    color: '#f8fafc',
    fontWeight: 800,
    textDecoration: 'none',
    letterSpacing: 0,
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  link: {
    color: '#a9fff7',
    textDecoration: 'none',
    fontWeight: 700,
    padding: '8px 10px',
    borderRadius: 6,
    background: 'rgba(255,255,255,0.05)',
  },
  logout: {
    border: '1px solid rgba(248,113,113,0.45)',
    borderRadius: 6,
    background: 'rgba(127,29,29,0.38)',
    color: '#fecaca',
    cursor: 'pointer',
    fontWeight: 800,
    minHeight: 38,
    padding: '0 12px',
  },
  characterTools: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  resourcePanel: {
    alignItems: 'center',
    background: 'rgba(2,6,23,0.32)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    display: 'flex',
    gap: 8,
    minHeight: 42,
    padding: '6px 8px',
  },
  resourceSummary: {
    alignItems: 'baseline',
    border: '1px solid rgba(212,175,55,0.35)',
    borderRadius: 6,
    display: 'flex',
    gap: 6,
    minHeight: 30,
    padding: '4px 8px',
    whiteSpace: 'nowrap',
  },
  resourceLabel: {
    color: '#fde68a',
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 0,
  },
  resourceValue: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: 900,
  },
  resourceActions: {
    alignItems: 'center',
    display: 'flex',
    gap: 4,
  },
  resourceInput: {
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 6,
    background: 'rgba(2,6,23,0.54)',
    color: '#f8fafc',
    minHeight: 30,
    padding: '0 8px',
    width: 54,
  },
  damageButton: {
    border: '1px solid rgba(248,113,113,0.45)',
    borderRadius: 6,
    background: 'rgba(127,29,29,0.32)',
    color: '#fecaca',
    cursor: 'pointer',
    fontWeight: 800,
    minHeight: 30,
    padding: '0 8px',
  },
  healButton: {
    border: '1px solid rgba(74,222,128,0.42)',
    borderRadius: 6,
    background: 'rgba(20,83,45,0.3)',
    color: '#bbf7d0',
    cursor: 'pointer',
    fontWeight: 800,
    minHeight: 30,
    padding: '0 8px',
  },
  magicButton: {
    border: '1px solid rgba(169,255,247,0.35)',
    borderRadius: 6,
    background: 'rgba(8,47,73,0.46)',
    color: '#a9fff7',
    cursor: 'pointer',
    fontWeight: 800,
    minHeight: 30,
    padding: '0 8px',
  },
  restButton: {
    border: '1px solid rgba(74,222,128,0.42)',
    borderRadius: 6,
    background: 'rgba(20,83,45,0.38)',
    color: '#bbf7d0',
    cursor: 'pointer',
    fontWeight: 800,
    minHeight: 38,
    padding: '0 12px',
  },
  addButton: {
    border: '1px solid rgba(169,255,247,0.35)',
    borderRadius: 6,
    background: 'rgba(8,47,73,0.46)',
    color: '#a9fff7',
    cursor: 'pointer',
    fontWeight: 800,
    minHeight: 38,
    padding: '0 10px',
  },
  magicInput: {
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 6,
    background: 'rgba(2,6,23,0.54)',
    color: '#f8fafc',
    minHeight: 38,
    padding: '0 10px',
    width: 70,
  },
};

export default NavDrawer;
