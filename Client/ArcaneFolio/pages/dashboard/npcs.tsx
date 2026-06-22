import React, { ChangeEvent, FocusEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import NavDrawer from '../../components/Navigation/navDrawer';
import ImageBackgroundWrapper from '../../components/imageBackground';
import NpcSpellsManager from '../../components/Npcs/NpcSpellsManager';
import { ALL_RACE_OPTIONS, isRaceAllowedForClass } from '../../utils/character/classRules';
import {
  getDefaultWeaponDamage,
  getDefaultWeaponSpeedFactor,
  getWeaponOptionNames,
} from '../../utils/character/weaponCatalog';
import { Npc, NpcAbilityKey, NpcInput } from '../../types/npcTypes';
import {
  createBlankNpcInput,
  NPC_ALIGNMENT_OPTIONS,
  NPC_ARMOR_OPTIONS,
  NPC_CLASS_OPTIONS,
  NPC_PROFICIENCY_SLOT_OPTIONS,
  clampNpcArmorMagicBonus,
  clampNpcWeaponMagicBonus,
  recalculateNpcCombat,
} from '../../utils/npc/npcGeneratorService';
import {
  createNpcDocument,
  deleteNpcDocument,
  loadNpcDocuments,
  updateNpcDocument,
} from '../../utils/npc/npcFirestoreService';

const ABILITY_FIELDS: Array<{ key: NpcAbilityKey; label: string; short: string }> = [
  { key: 'strength', label: 'Strength', short: 'STR' },
  { key: 'dexterity', label: 'Dexterity', short: 'DEX' },
  { key: 'constitution', label: 'Constitution', short: 'CON' },
  { key: 'intelligence', label: 'Intelligence', short: 'INT' },
  { key: 'wisdom', label: 'Wisdom', short: 'WIS' },
  { key: 'charisma', label: 'Charisma', short: 'CHA' },
  { key: 'comeliness', label: 'Comeliness', short: 'COM' },
  { key: 'piety', label: 'Piety', short: 'PIETY' },
];

const numberFromInput = (value: string, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const raceOptionsForClass = (characterClass: string) => (
  ALL_RACE_OPTIONS.map((race) => ({
    race,
    disabled: !isRaceAllowedForClass(characterClass, race),
  }))
);

const toEditableNpc = (npc: Npc): NpcInput => ({ ...npc });

const WEAPON_OPTIONS = getWeaponOptionNames();

export default function NpcsPage() {
  const router = useRouter();
  const [manualNpc, setManualNpc] = useState<NpcInput>(() => createBlankNpcInput());
  const [editingNpc, setEditingNpc] = useState<NpcInput | null>(null);
  const [viewingNpc, setViewingNpc] = useState<Npc | null>(null);
  const [npcs, setNpcs] = useState<Npc[]>([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const requestedView = Array.isArray(router.query.view) ? router.query.view[0] : router.query.view;
  const activeView = requestedView === 'create'
    ? 'generator'
    : requestedView === 'spells' ? 'spells' : 'manager';

  useEffect(() => {
    setViewingNpc(null);
    setEditingNpc(null);
  }, [activeView]);

  const refreshNpcs = async () => {
    setIsLoading(true);
    setError('');

    try {
      setNpcs(await loadNpcDocuments());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load NPCs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshNpcs();
  }, []);

  const setNpcField = (
    setter: React.Dispatch<React.SetStateAction<NpcInput>>,
    field: keyof NpcInput,
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const rawValue = event.target.value;
    const numericFields = new Set<keyof NpcInput>([
      'level',
      'strength',
      'dexterity',
      'constitution',
      'intelligence',
      'wisdom',
      'charisma',
      'comeliness',
      'piety',
      'hitPoints',
      'armorMagicBonus',
      'proficiencySlots',
      'weaponMagicBonus',
      'weaponSpeedFactor',
    ]);

    setter((current) => {
      const nextValue = field === 'weaponMagicBonus'
        ? clampNpcWeaponMagicBonus(numberFromInput(rawValue))
        : field === 'armorMagicBonus'
          ? clampNpcArmorMagicBonus(numberFromInput(rawValue))
        : numericFields.has(field) ? numberFromInput(rawValue) : rawValue;
      if (field === 'weapon') {
        return recalculateNpcCombat(applyNpcWeaponSelection(current, String(nextValue)));
      }

      const next = { ...current, [field]: nextValue } as NpcInput;

      if (field === 'class' && !isRaceAllowedForClass(next.class, next.race)) {
        next.race = '';
      }

      return recalculateNpcCombat(next);
    });
  };

  const setEditingNpcField = (field: keyof NpcInput) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    if (!editingNpc) return;

    const rawValue = event.target.value;
    const numericFields = new Set<keyof NpcInput>([
      'level',
      'strength',
      'dexterity',
      'constitution',
      'intelligence',
      'wisdom',
      'charisma',
      'comeliness',
      'piety',
      'hitPoints',
      'armorMagicBonus',
      'proficiencySlots',
      'weaponMagicBonus',
      'weaponSpeedFactor',
    ]);

    setEditingNpc((current) => {
      if (!current) return current;

      const nextValue = field === 'weaponMagicBonus'
        ? clampNpcWeaponMagicBonus(numberFromInput(rawValue))
        : field === 'armorMagicBonus'
          ? clampNpcArmorMagicBonus(numberFromInput(rawValue))
        : numericFields.has(field) ? numberFromInput(rawValue) : rawValue;
      const next = { ...current, [field]: nextValue } as NpcInput;

      if (field === 'weapon') {
        return recalculateNpcCombat(applyNpcWeaponSelection(current, String(nextValue)));
      }

      if (field === 'class' && !isRaceAllowedForClass(next.class, next.race)) {
        next.race = '';
      }

      return recalculateNpcCombat(next);
    });
  };

  const saveManualNpc = async () => {
    try {
      const savedNpc = await createNpcDocument(manualNpc);
      setStatus(`Saved ${savedNpc.name || 'NPC'}.`);
      setManualNpc(createBlankNpcInput());
      await refreshNpcs();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save NPC.');
    }
  };

  const saveEditingNpc = async () => {
    if (!editingNpc) return;

    try {
      const savedNpc = await updateNpcDocument(editingNpc);
      setStatus(`Updated ${savedNpc.name || 'NPC'}.`);
      setEditingNpc(null);
      setViewingNpc(savedNpc);
      await refreshNpcs();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to update NPC.');
    }
  };

  const handleDeleteNpc = async (npc: Npc) => {
    if (!window.confirm(`Delete ${npc.name || 'this NPC'}?`)) return;

    try {
      await deleteNpcDocument(npc.id);
      setStatus(`Deleted ${npc.name || 'NPC'}.`);
      setViewingNpc((current) => (current?.id === npc.id ? null : current));
      setEditingNpc((current) => (current?.id === npc.id ? null : current));
      await refreshNpcs();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete NPC.');
    }
  };

  return (
    <ImageBackgroundWrapper>
      <div style={styles.page}>
        <NavDrawer />
        <header style={styles.header}>
          <p style={styles.eyebrow}>DM Tools</p>
          <h1 style={styles.title}>NPCs</h1>
        </header>

        <nav style={styles.sectionMenu} aria-label="NPC tools">
          <Link href="/dashboard/npcs?view=create" legacyBehavior>
            <a style={activeView === 'generator' ? styles.activeMenuLink : styles.menuLink}>NPC Generator</a>
          </Link>
          <Link href="/dashboard/npcs" legacyBehavior>
            <a style={activeView === 'manager' ? styles.activeMenuLink : styles.menuLink}>NPC Manager</a>
          </Link>
          <Link href="/dashboard/npcs?view=spells" legacyBehavior>
            <a style={activeView === 'spells' ? styles.activeMenuLink : styles.menuLink}>NPC Spells</a>
          </Link>
        </nav>

        {(status || error) && (
          <div style={error ? styles.errorBanner : styles.statusBanner}>
            {error || status}
          </div>
        )}

        <section>
          {activeView === 'generator' && (
            <article style={styles.card}>
            <h2 style={styles.cardTitle}>Create NPC Manually</h2>
            <NpcForm npc={manualNpc} onFieldChange={(field) => setNpcField(setManualNpc, field)} />
            <div style={styles.actionRow}>
              <button type="button" style={styles.primaryButton} onClick={saveManualNpc}>Save NPC</button>
            </div>
            </article>
          )}

          {activeView === 'manager' && (
            <article style={styles.card}>
            <h2 style={styles.cardTitle}>NPC Manager</h2>
            {isLoading && <p style={styles.mutedText}>Loading NPCs...</p>}
            {!isLoading && npcs.length === 0 && <p style={styles.mutedText}>No NPCs saved yet.</p>}
            <div style={styles.managerList}>
              {npcs.map((npc) => (
                <div key={npc.id} style={styles.npcCard}>
                  <div>
                    <strong style={styles.npcName}>{npc.name || 'Unnamed NPC'}</strong>
                    <p style={styles.npcSummary}>{npc.race} {npc.class} | Level {npc.level} | {npc.alignment}</p>
                  </div>
                  <div style={styles.smallActionRow}>
                    <button type="button" style={styles.smallButton} onClick={() => { setViewingNpc(npc); setEditingNpc(null); }}>View</button>
                    <button type="button" style={styles.smallButton} onClick={() => { setEditingNpc(toEditableNpc(npc)); setViewingNpc(null); }}>Edit</button>
                    <button type="button" style={styles.deleteButton} onClick={() => handleDeleteNpc(npc)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
            </article>
          )}

          {activeView === 'spells' && (
            <article style={styles.card}>
              <NpcSpellsManager
                npcs={npcs}
                onNpcUpdated={(updatedNpc) => {
                  setNpcs((current) => current.map((npc) => (npc.id === updatedNpc.id ? updatedNpc : npc)));
                  setViewingNpc((current) => (current?.id === updatedNpc.id ? updatedNpc : current));
                  setEditingNpc((current) => (current?.id === updatedNpc.id ? { ...current, ...updatedNpc } : current));
                }}
              />
            </article>
          )}
        </section>

        {activeView === 'manager' && viewingNpc && (
          <section style={styles.detailCard}>
            <div style={styles.detailHeader}>
              <div>
                <h2 style={styles.detailTitle}>{viewingNpc.name || 'Unnamed NPC'}</h2>
                <p style={styles.npcSummary}>
                  {viewingNpc.race} {viewingNpc.class} | Level {viewingNpc.level} | {viewingNpc.alignment}
                </p>
              </div>
              <div style={styles.smallActionRow}>
                <button type="button" style={styles.smallButton} onClick={() => { setEditingNpc(toEditableNpc(viewingNpc)); setViewingNpc(null); }}>Edit</button>
                <button type="button" style={styles.smallButton} onClick={() => setViewingNpc(null)}>Close</button>
              </div>
            </div>

            <NpcForm npc={viewingNpc} onFieldChange={() => noopFieldChange} readOnly />
          </section>
        )}

        {activeView === 'manager' && editingNpc && (
          <section style={styles.detailCard}>
            <div style={styles.detailHeader}>
              <div>
                <h2 style={styles.detailTitle}>{editingNpc.name || 'Unnamed NPC'}</h2>
                <p style={styles.npcSummary}>
                  {editingNpc.race} {editingNpc.class} | Level {editingNpc.level} | {editingNpc.alignment}
                </p>
              </div>
              <button type="button" style={styles.smallButton} onClick={() => setEditingNpc(null)}>Close</button>
            </div>

            <NpcForm npc={editingNpc} onFieldChange={setEditingNpcField} />
            <div style={styles.actionRow}>
              <button type="button" style={styles.primaryButton} onClick={saveEditingNpc}>Save NPC</button>
            </div>
          </section>
        )}
      </div>
    </ImageBackgroundWrapper>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  disabled?: boolean;
};

const applyNpcWeaponSelection = (current: NpcInput, nextWeapon: string): NpcInput => {
  const previousDefaultDamage = getDefaultWeaponDamage(current.weapon);
  const currentDamage = current.weaponDamage?.trim() ?? '';
  const hasCustomizedDamage = Boolean(
    currentDamage
    && (!previousDefaultDamage || currentDamage !== previousDefaultDamage),
  );
  const nextDefaultDamage = getDefaultWeaponDamage(nextWeapon);
  const shouldReplaceDamage = !hasCustomizedDamage
    || window.confirm('Replace this NPC custom weapon damage with the selected weapon default?');
  const nextSpeedFactor = Number(getDefaultWeaponSpeedFactor(nextWeapon));

  return {
    ...current,
    weapon: nextWeapon,
    weaponDamage: shouldReplaceDamage ? nextDefaultDamage : current.weaponDamage,
    weaponSpeedFactor: Number.isFinite(nextSpeedFactor) ? nextSpeedFactor : current.weaponSpeedFactor,
  };
};

function SelectField({ label, value, onChange, children, disabled = false }: SelectFieldProps) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>
      <select value={value} onChange={onChange} disabled={disabled} style={disabled ? styles.readonlyInput : styles.input}>
        {children}
      </select>
    </label>
  );
}

const noopFieldChange = () => {};

type NpcFormProps = {
  npc: NpcInput;
  onFieldChange: (field: keyof NpcInput) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  readOnly?: boolean;
};

function NpcForm({ npc, onFieldChange, readOnly = false }: NpcFormProps) {
  const raceOptions = raceOptionsForClass(npc.class);
  const weaponOptions = npc.weapon && !WEAPON_OPTIONS.includes(npc.weapon)
    ? [...WEAPON_OPTIONS, npc.weapon]
    : WEAPON_OPTIONS;

  return (
    <div style={styles.formStack}>
      <h3 style={styles.sectionTitle}>Basic Information</h3>
      <div style={styles.formGrid}>
        <TextField label="Name" value={npc.name} onChange={onFieldChange('name')} readOnly={readOnly} />
        <SelectField label="Race" value={npc.race} onChange={onFieldChange('race')} disabled={readOnly}>
          <option value="">Select race</option>
          {raceOptions.map(({ race, disabled }) => <option key={race} value={race} disabled={disabled}>{race}</option>)}
        </SelectField>
        <SelectField label="Class" value={npc.class} onChange={onFieldChange('class')} disabled={readOnly}>
          {NPC_CLASS_OPTIONS.map((className) => <option key={className} value={className}>{className}</option>)}
        </SelectField>
        <TextField label="Level" type="number" value={String(npc.level)} onChange={onFieldChange('level')} readOnly={readOnly} />
        <SelectField label="Alignment" value={npc.alignment} onChange={onFieldChange('alignment')} disabled={readOnly}>
          {NPC_ALIGNMENT_OPTIONS.map((alignment) => <option key={alignment} value={alignment}>{alignment}</option>)}
        </SelectField>
      </div>

      <h3 style={styles.sectionTitle}>Description</h3>
      <TextAreaField label="Appearance Description" value={npc.appearanceDescription} onChange={onFieldChange('appearanceDescription')} readOnly={readOnly} />
      <TextAreaField label="Personality Traits" value={npc.personalityTraits} onChange={onFieldChange('personalityTraits')} readOnly={readOnly} />

      <h3 style={styles.sectionTitle}>Ability Scores</h3>
      <div style={styles.abilityInputGrid}>
        {ABILITY_FIELDS.map(({ key, label }) => (
          <TextField key={key} label={label} type="number" value={String(npc[key])} onChange={onFieldChange(key)} readOnly={readOnly} />
        ))}
      </div>

      <h3 style={styles.sectionTitle}>Combat</h3>
      <div style={styles.combatFormSections}>
        <section style={styles.compactResourceSection}>
          <div style={styles.compactResourceBox}>
            <h4 style={styles.subsectionTitle}>HP</h4>
            <TextField label="Hit Points" type="number" value={String(npc.hitPoints)} onChange={onFieldChange('hitPoints')} readOnly={readOnly} highlight={readOnly} />
          </div>
          <div style={styles.compactResourceBox}>
            <h4 style={styles.subsectionTitle}>MP</h4>
            <TextField label="Magic Points" type="number" value={String(npc.maxMagicPoints ?? 0)} onChange={onFieldChange('maxMagicPoints')} readOnly highlight={readOnly} />
          </div>
        </section>

        <section style={styles.formSubsection}>
          <h4 style={styles.subsectionTitle}>Armor</h4>
          <div style={styles.formGrid}>
            <SelectField label="Armor" value={npc.armor} onChange={onFieldChange('armor')} disabled={readOnly}>
              {NPC_ARMOR_OPTIONS.map((armor) => <option key={armor} value={armor}>{armor}</option>)}
            </SelectField>
            <TextField label="Armor Magic Bonus" type="number" value={String(npc.armorMagicBonus ?? 0)} onChange={onFieldChange('armorMagicBonus')} readOnly={readOnly} />
            <TextField label="Armor Class" type="number" value={String(npc.armorClass)} onChange={onFieldChange('armorClass')} readOnly highlight={readOnly} />
          </div>
        </section>

        <section style={styles.formSubsection}>
          <h4 style={styles.subsectionTitle}>Weapon</h4>
          <div style={styles.formGrid}>
            <SelectField label="Weapon" value={npc.weapon} onChange={onFieldChange('weapon')} disabled={readOnly}>
              <option value="">Select weapon</option>
              {weaponOptions.map((weaponName) => (
                <option key={weaponName} value={weaponName}>{weaponName}</option>
              ))}
            </SelectField>
            <TextField label="Damage" value={npc.weaponDamage} onChange={onFieldChange('weaponDamage')} readOnly={readOnly} />
            <TextField label="Weapon Magic Bonus" type="number" value={String(npc.weaponMagicBonus ?? 0)} onChange={onFieldChange('weaponMagicBonus')} readOnly={readOnly} />
            <SelectField label="Weapon Proficiency Slots" value={String(npc.proficiencySlots)} onChange={onFieldChange('proficiencySlots')} disabled={readOnly}>
              {NPC_PROFICIENCY_SLOT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </SelectField>
            <TextField label="THAC0" type="number" value={String(npc.realThac0 ?? npc.baseThac0)} onChange={onFieldChange('realThac0')} readOnly highlight={readOnly} />
            <TextField label="Speed Factor" type="number" value={String(npc.weaponSpeedFactor ?? 0)} onChange={onFieldChange('weaponSpeedFactor')} readOnly={readOnly} />
            <TextField label="WAC" type="number" value={String(npc.weaponWac ?? 0)} onChange={onFieldChange('weaponWac')} readOnly highlight={readOnly} />
          </div>
        </section>

      </div>

      <h3 style={styles.sectionTitle}>Equipment</h3>
      <TextAreaField label="Basic Equipment Notes" value={npc.equipmentNotes} onChange={onFieldChange('equipmentNotes')} readOnly={readOnly} />
    </div>
  );
}

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  readOnly?: boolean;
  highlight?: boolean;
};

function TextField({ label, value, onChange, type = 'text', readOnly = false, highlight = false }: TextFieldProps) {
  const isNumeric = type === 'number';
  const [draftValue, setDraftValue] = useState(value);
  const inputStyle = highlight
    ? styles.highlightReadonlyInput
    : readOnly ? styles.readonlyInput : styles.input;
  const labelStyle = highlight ? styles.highlightLabel : styles.label;

  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isNumeric) {
      onChange(event);
      return;
    }

    const nextValue = event.target.value;
    setDraftValue(nextValue);

    if (!nextValue.trim() || nextValue === '-') {
      return;
    }

    onChange(event);
  };

  const handleBlur = (_event: FocusEvent<HTMLInputElement>) => {
    if (isNumeric && !draftValue.trim()) {
      setDraftValue(value);
    }
  };

  return (
    <label style={styles.field}>
      <span style={labelStyle}>{label}</span>
      <input
        value={isNumeric ? draftValue : value}
        type={isNumeric ? 'text' : type}
        inputMode={isNumeric ? 'numeric' : undefined}
        pattern={isNumeric ? '[0-9-]*' : undefined}
        onBlur={handleBlur}
        onChange={handleChange}
        readOnly={readOnly}
        style={inputStyle}
      />
    </label>
  );
}

type TextAreaFieldProps = {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  readOnly?: boolean;
};

function TextAreaField({ label, value, onChange, readOnly = false }: TextAreaFieldProps) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>
      <textarea value={value} onChange={onChange} readOnly={readOnly} style={readOnly ? styles.readonlyTextarea : styles.textarea} />
    </label>
  );
}

function NpcDetail({ npc }: { npc: Npc }) {
  return (
    <div style={styles.detailGrid}>
      <section style={styles.detailSection}>
        <h3 style={styles.sectionTitle}>Description</h3>
        <p style={styles.detailText}>{npc.appearanceDescription || 'No appearance noted.'}</p>
        <p style={styles.detailText}>{npc.personalityTraits || 'No personality traits noted.'}</p>
      </section>

      <section style={styles.detailSection}>
        <h3 style={styles.sectionTitle}>Ability Scores</h3>
        <div style={styles.abilityScoreRow}>
          {ABILITY_FIELDS.map(({ key, short }) => (
            <div key={key} style={styles.abilityScoreBox}>
              <span style={styles.abilityLabel}>{short}</span>
              <strong>{npc[key]}</strong>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.combatGrid}>
        <div style={styles.detailSection}>
          <h3 style={styles.sectionTitle}>Armor Information</h3>
          <p style={styles.detailText}>Armor: {npc.armor}</p>
          <p style={styles.detailText}>Final AC: {npc.armorClass}</p>
        </div>
        <div style={styles.detailSection}>
          <h3 style={styles.sectionTitle}>Weapon Information</h3>
          <p style={styles.detailText}>Weapon: {npc.weapon}</p>
          <p style={styles.detailText}>Proficiency Slots: {npc.proficiencySlots}</p>
          <p style={styles.detailText}>Magic Bonus: +{npc.weaponMagicBonus ?? 0}</p>
          <p style={styles.detailText}>Speed Factor: {npc.weaponSpeedFactor ?? 0}</p>
          <p style={styles.detailText}>WAC: {npc.weaponWac ?? 0}</p>
          <p style={styles.detailText}>Damage: {npc.weaponDamage || 'Not set'}</p>
        </div>
      </section>

      <section style={styles.detailSection}>
        <h3 style={styles.sectionTitle}>THAC0</h3>
        <p style={styles.detailText}>Base THAC0: {npc.baseThac0}</p>
        <p style={styles.detailText}>Weapon THAC0: {npc.realThac0 ?? npc.baseThac0}</p>
        <div style={styles.thacoChart}>
          {npc.weaponThac0Chart.map((entry) => (
            <div key={entry.armorClass} style={styles.thacoCell}>
              <span style={styles.abilityLabel}>AC {entry.armorClass}</span>
              <strong>{entry.target}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    color: '#f8fafc',
    display: 'grid',
    gap: 18,
    margin: '0 auto',
    maxWidth: 1180,
    padding: '24px 16px 48px',
  },
  header: {
    display: 'grid',
    gap: 4,
  },
  eyebrow: {
    color: '#d4af37',
    fontSize: 13,
    fontWeight: 900,
    letterSpacing: 0,
    margin: 0,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 38,
    margin: 0,
  },
  card: {
    background: 'rgba(15,23,42,0.92)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    display: 'grid',
    gap: 14,
    padding: 18,
  },
  cardTitle: {
    color: '#a9fff7',
    fontSize: 20,
    margin: 0,
  },
  sectionMenu: {
    alignItems: 'center',
    background: 'rgba(15,23,42,0.86)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    padding: 10,
  },
  menuLink: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 6,
    color: '#cbd5e1',
    fontWeight: 800,
    minHeight: 36,
    padding: '8px 10px',
    textDecoration: 'none',
  },
  activeMenuLink: {
    background: 'rgba(169,255,247,0.14)',
    border: '1px solid rgba(169,255,247,0.45)',
    borderRadius: 6,
    color: '#a9fff7',
    fontWeight: 900,
    minHeight: 36,
    padding: '8px 10px',
    textDecoration: 'none',
  },
  formStack: {
    display: 'grid',
    gap: 12,
  },
  combatFormSections: {
    display: 'grid',
    gap: 12,
  },
  formSubsection: {
    background: 'rgba(2,6,23,0.3)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    display: 'grid',
    gap: 10,
    padding: 12,
  },
  compactFormSubsection: {
    background: 'rgba(2,6,23,0.3)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    display: 'grid',
    gap: 10,
    justifySelf: 'start',
    maxWidth: 220,
    padding: 12,
    width: '100%',
  },
  compactResourceSection: {
    display: 'grid',
    gap: 12,
    gridTemplateColumns: 'repeat(2, minmax(0, 180px))',
    justifyContent: 'start',
  },
  compactResourceBox: {
    background: 'rgba(2,6,23,0.3)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    display: 'grid',
    gap: 10,
    padding: 12,
  },
  compactFormGrid: {
    display: 'grid',
    gap: 12,
    gridTemplateColumns: '1fr',
  },
  subsectionTitle: {
    color: '#a9fff7',
    fontSize: 13,
    fontWeight: 900,
    letterSpacing: 0,
    margin: 0,
    textTransform: 'uppercase',
  },
  formGrid: {
    display: 'grid',
    gap: 12,
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 170px), 1fr))',
  },
  abilityInputGrid: {
    display: 'grid',
    gap: 10,
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 118px), 1fr))',
  },
  field: {
    display: 'grid',
    gap: 6,
    minWidth: 0,
  },
  label: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: 800,
  },
  highlightLabel: {
    color: '#fde68a',
    fontSize: 12,
    fontWeight: 900,
  },
  input: {
    background: 'rgba(2,6,23,0.68)',
    border: '1px solid rgba(255,255,255,0.16)',
    borderRadius: 6,
    boxSizing: 'border-box',
    color: '#f8fafc',
    minHeight: 38,
    padding: '0 10px',
    width: '100%',
  },
  readonlyInput: {
    background: 'rgba(15,23,42,0.72)',
    border: '1px solid rgba(169,255,247,0.2)',
    borderRadius: 6,
    boxSizing: 'border-box',
    color: '#a9fff7',
    minHeight: 38,
    padding: '0 10px',
    width: '100%',
  },
  highlightReadonlyInput: {
    background: 'rgba(212,175,55,0.14)',
    border: '1px solid rgba(253,230,138,0.55)',
    borderRadius: 6,
    boxShadow: '0 0 0 1px rgba(253,230,138,0.08) inset',
    boxSizing: 'border-box',
    color: '#fde68a',
    fontSize: 18,
    fontWeight: 900,
    minHeight: 44,
    padding: '0 10px',
    textAlign: 'center',
    width: '100%',
  },
  textarea: {
    background: 'rgba(2,6,23,0.68)',
    border: '1px solid rgba(255,255,255,0.16)',
    borderRadius: 6,
    boxSizing: 'border-box',
    color: '#f8fafc',
    minHeight: 76,
    padding: 10,
    resize: 'vertical',
    width: '100%',
  },
  readonlyTextarea: {
    background: 'rgba(15,23,42,0.72)',
    border: '1px solid rgba(169,255,247,0.2)',
    borderRadius: 6,
    boxSizing: 'border-box',
    color: '#a9fff7',
    minHeight: 76,
    padding: 10,
    resize: 'vertical',
    width: '100%',
  },
  sectionTitle: {
    color: '#fde68a',
    fontSize: 14,
    margin: 0,
  },
  actionRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
  },
  primaryButton: {
    background: '#a9fff7',
    border: '1px solid rgba(169,255,247,0.8)',
    borderRadius: 6,
    color: '#0f172a',
    cursor: 'pointer',
    fontWeight: 900,
    minHeight: 38,
    padding: '0 14px',
  },
  managerList: {
    display: 'grid',
    gap: 10,
  },
  npcCard: {
    alignItems: 'center',
    background: 'rgba(2,6,23,0.42)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    display: 'flex',
    gap: 12,
    justifyContent: 'space-between',
    padding: 12,
  },
  npcName: {
    color: '#f8fafc',
    display: 'block',
    fontSize: 16,
  },
  npcSummary: {
    color: '#cbd5e1',
    fontSize: 13,
    margin: '4px 0 0',
  },
  smallActionRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-end',
  },
  smallButton: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.16)',
    borderRadius: 6,
    color: '#f8fafc',
    cursor: 'pointer',
    fontWeight: 800,
    minHeight: 32,
    padding: '0 10px',
  },
  deleteButton: {
    background: 'rgba(127,29,29,0.38)',
    border: '1px solid rgba(248,113,113,0.45)',
    borderRadius: 6,
    color: '#fecaca',
    cursor: 'pointer',
    fontWeight: 800,
    minHeight: 32,
    padding: '0 10px',
  },
  detailCard: {
    background: 'rgba(15,23,42,0.94)',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 8,
    display: 'grid',
    gap: 16,
    padding: 18,
  },
  detailHeader: {
    alignItems: 'center',
    display: 'flex',
    gap: 12,
    justifyContent: 'space-between',
  },
  detailTitle: {
    color: '#a9fff7',
    fontSize: 24,
    margin: 0,
  },
  detailGrid: {
    display: 'grid',
    gap: 16,
  },
  detailSection: {
    display: 'grid',
    gap: 8,
  },
  detailText: {
    color: '#e2e8f0',
    lineHeight: 1.5,
    margin: 0,
  },
  abilityScoreRow: {
    display: 'grid',
    gap: 8,
    gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))',
  },
  abilityScoreBox: {
    background: 'rgba(2,6,23,0.5)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 6,
    display: 'grid',
    gap: 3,
    justifyItems: 'center',
    minHeight: 54,
    padding: 8,
  },
  abilityLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 900,
  },
  combatGrid: {
    display: 'grid',
    gap: 16,
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
  },
  thacoChart: {
    display: 'grid',
    gap: 6,
    gridTemplateColumns: 'repeat(auto-fit, minmax(64px, 1fr))',
  },
  thacoCell: {
    background: 'rgba(2,6,23,0.5)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 6,
    display: 'grid',
    gap: 3,
    justifyItems: 'center',
    padding: 8,
  },
  statusBanner: {
    background: 'rgba(20,83,45,0.42)',
    border: '1px solid rgba(74,222,128,0.4)',
    borderRadius: 8,
    color: '#bbf7d0',
    padding: 12,
  },
  errorBanner: {
    background: 'rgba(127,29,29,0.42)',
    border: '1px solid rgba(248,113,113,0.45)',
    borderRadius: 8,
    color: '#fecaca',
    padding: 12,
  },
  mutedText: {
    color: '#94a3b8',
    margin: 0,
  },
};
