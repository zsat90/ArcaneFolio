import React, { ChangeEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { logout } from '../../utils/auth/authService';
import {
  clearSessionCharacterState,
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
  const [activeAction, setActiveAction] = useState<'damage' | 'heal' | 'rest' | ''>('');

  const flashAction = (action: 'damage' | 'heal' | 'rest') => {
    setActiveAction(action);
    window.setTimeout(() => setActiveAction((current) => (current === action ? '' : current)), 700);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('[logout] Firebase signOut failed', error);
      return;
    }

    clearSessionCharacterState();
    await router.replace('/login');
  };

  const handleRest = async () => {
    flashAction('rest');
    await restSelectedCharacter();
  };

  const parseAmount = (value: string) => {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const handleDamage = async () => {
    const amount = parseAmount(damageAmount);
    if (amount <= 0) return;

    flashAction('damage');
    await damageSelectedCharacter(amount);
    setDamageAmount('');
  };

  const handleHeal = async () => {
    const amount = parseAmount(healAmount);
    if (amount <= 0) return;

    flashAction('heal');
    await healSelectedCharacter(amount);
    setHealAmount('');
  };

  const updateDamageAmount = (event: ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;

    if (!rawValue.trim()) {
      setDamageAmount('');
      return;
    }

    const parsed = Number(rawValue);
    setDamageAmount(Number.isFinite(parsed) ? String(Math.max(0, parsed)) : rawValue);
  };

  const updateHealAmount = (event: ChangeEvent<HTMLInputElement>) => {
    const maxHitPoints = selectedCharacter?.maxHitPoints ?? selectedCharacter?.hitPoints ?? 0;
    const currentHitPoints = selectedCharacter?.hitPoints ?? 0;
    const missingHitPoints = Math.max(0, maxHitPoints - currentHitPoints);
    const rawValue = event.target.value;

    if (!rawValue.trim()) {
      setHealAmount('');
      return;
    }

    const parsed = Number(rawValue);

    if (!Number.isFinite(parsed)) {
      setHealAmount(rawValue);
      return;
    }

    setHealAmount(String(Math.min(Math.max(0, parsed), missingHitPoints)));
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
                <button type="button" onClick={handleDamage} style={activeAction === 'damage' ? styles.activeDamageButton : styles.damageButton}>
                  {activeAction === 'damage' ? 'Damaged' : 'Damage'}
                </button>
                <input
                  aria-label="Healing amount"
                  inputMode="numeric"
                  onChange={updateHealAmount}
                  pattern="[0-9]*"
                  placeholder="Heal"
                  style={styles.resourceInput}
                  value={healAmount}
                />
                <button type="button" onClick={handleHeal} style={activeAction === 'heal' ? styles.activeHealButton : styles.healButton}>
                  {activeAction === 'heal' ? 'Healed' : 'Heal'}
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
            </div>
            <button type="button" onClick={handleRest} style={activeAction === 'rest' ? styles.activeRestButton : styles.restButton}>
              {activeAction === 'rest' ? 'Rested' : 'Rest'}
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
  activeDamageButton: {
    border: '1px solid rgba(254,202,202,0.9)',
    borderRadius: 6,
    background: 'rgba(185,28,28,0.72)',
    boxShadow: '0 0 0 2px rgba(248,113,113,0.22)',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 900,
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
  activeHealButton: {
    border: '1px solid rgba(187,247,208,0.9)',
    borderRadius: 6,
    background: 'rgba(21,128,61,0.72)',
    boxShadow: '0 0 0 2px rgba(74,222,128,0.2)',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 900,
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
  activeRestButton: {
    border: '1px solid rgba(187,247,208,0.9)',
    borderRadius: 6,
    background: 'rgba(21,128,61,0.72)',
    boxShadow: '0 0 0 2px rgba(74,222,128,0.2)',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 900,
    minHeight: 38,
    padding: '0 12px',
  },
};

export default NavDrawer;
