import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { onAuthStateChanged } from 'firebase/auth';
import ImageBackgroundWrapper from '../../components/imageBackground';
import CharacterItems from '../../components/Characters/CharacterItems';
import Buttons from '../../components/Login/Button';
import { Character } from '../../types/characterTypes';
import { getFirebaseAuth } from '../../utils/auth/authService';
import { getCharacters, hydrateSelectedCharacter, removeCharacter } from '../../utils/character/characterState';

export default function CharactersPage() {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;

    const loadCharacters = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const items = await getCharacters();

        if (active) {
          setCharacters(items);
          await hydrateSelectedCharacter(items);
        }
      } catch (error) {
        if (active) {
          setCharacters([]);
          setLoadError(
            error instanceof Error
              ? error.message
              : 'Unable to load characters from Firestore.',
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadCharacters();
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), () => {
      loadCharacters();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const handleDeleteCharacter = async (character: Character) => {
    const confirmed = window.confirm(`Kill and remove ${character.name}? This removes their spellbook, magic points, and character sheet data.`);

    if (!confirmed) {
      return;
    }

    try {
      await removeCharacter(character.id);
      setCharacters(await getCharacters());
      setLoadError('');
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : 'Unable to delete character from Firestore.',
      );
    }
  };

  return (
    <ImageBackgroundWrapper>
      <main style={styles.page}>
        <section style={styles.header}>
          <p style={styles.eyebrow}>Adventurer's Codex</p>
          <h1 style={styles.title}>Choose Character</h1>
          <p style={styles.subtitle}>Pick the character whose spells, spellbook, and magic points you want to manage.</p>
        </section>

        {loadError && <p style={styles.error}>{loadError}</p>}

        {isLoading && <p style={styles.empty}>Loading characters...</p>}

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

        {characters.length === 0 && !isLoading && !loadError && (
          <p style={styles.empty}>No characters remain. Add a character to continue.</p>
        )}

        <div style={styles.actions}>
          <Buttons mode="outlined" onPress={() => router.push('/dashboard')}>Dashboard</Buttons>
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
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    marginTop: 24,
  },
  empty: {
    color: '#cbd5e1',
    marginTop: 18,
  },
  error: {
    backgroundColor: 'rgba(127, 29, 29, 0.45)',
    border: '1px solid #b91c1c',
    borderRadius: 10,
    color: '#fecaca',
    marginBottom: 16,
    padding: '12px 14px',
  },
};
