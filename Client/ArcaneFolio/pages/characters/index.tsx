import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ImageBackgroundWrapper from '../../components/imageBackground';
import CharacterItems from '../../components/Characters/CharacterItems';
import Buttons from '../../components/Login/Button';
import { Character } from '../../types/characterTypes';
import { getCharacters, removeCharacter } from '../../utils/character/characterState';

export default function CharactersPage() {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);

  useEffect(() => {
    setCharacters(getCharacters());
  }, []);

  const handleDeleteCharacter = (character: Character) => {
    const confirmed = window.confirm(`Kill and remove ${character.name}? This removes their spellbook, magic points, and character sheet data.`);

    if (!confirmed) {
      return;
    }

    removeCharacter(character.id);
    setCharacters(getCharacters());
  };

  return (
    <ImageBackgroundWrapper>
      <main style={styles.page}>
        <section style={styles.header}>
          <p style={styles.eyebrow}>Arcane Folio</p>
          <h1 style={styles.title}>Choose Character</h1>
          <p style={styles.subtitle}>Pick the character whose spells, spellbook, and magic points you want to manage.</p>
        </section>

        <section style={styles.characterGrid}>
          {characters.map((item) => (
            <CharacterItems
              key={item.id}
              item={item}
              navigation={{ navigate: (r: string) => router.push(r) }}
              setSelectedCharacter={() => {}}
              onDelete={handleDeleteCharacter}
            />
          ))}
        </section>

        {characters.length === 0 && (
          <p style={styles.empty}>No characters remain. Add a character to continue.</p>
        )}

        <div style={styles.actions}>
          <Buttons mode="contained" onPress={() => router.push('/characters/add')}>Add Character</Buttons>
        </div>
      </main>
    </ImageBackgroundWrapper>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    color: '#f8fafc',
    margin: '0 auto',
    maxWidth: 980,
    padding: '32px 16px 56px',
  },
  header: {
    marginBottom: 24,
  },
  eyebrow: {
    color: '#d4af37',
    fontSize: 14,
    fontWeight: 800,
    margin: '0 0 8px',
  },
  title: {
    fontSize: 38,
    margin: 0,
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 17,
    lineHeight: 1.5,
    maxWidth: 620,
  },
  characterGrid: {
    display: 'grid',
    gap: 14,
  },
  actions: {
    marginTop: 24,
    maxWidth: 220,
  },
  empty: {
    color: '#cbd5e1',
    marginTop: 18,
  },
};
