import React, { useContext, useState, createContext } from 'react';

interface Character {
  id: number;
  name: string;
  characterClass: string;
  level: number;
  magicPoints: number;
  spellbookId: number;
}

interface CharacterContextType {
  selectedCharacter: Character | null;
  selectCharacter: (character: Character) => void;
  setSelectedCharacter: React.Dispatch<React.SetStateAction<Character | null>>;
  characterList: Character[];
  setCharacterList: React.Dispatch<React.SetStateAction<Character[]>>;
  deleteCharacter: (characterId: number) => void;
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export const useCharacterContext = () => {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacterContext must be used within a CharacterProvider');
  }
  return context;
};

export const CharacterProvider = ({ children }) => {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [characterList, setCharacterList] = useState<Character[]>([]);

  const selectCharacter = (character: Character) => {
    setSelectedCharacter(character);
  };

  const deleteCharacter = (characterId: number) => {
    setCharacterList((prevList) => prevList.filter((character) => character.id !== characterId));
  };

  return (
    <CharacterContext.Provider
      value={{
        selectedCharacter,
        selectCharacter,
        setSelectedCharacter,
        characterList,
        setCharacterList,
        deleteCharacter,
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
};
