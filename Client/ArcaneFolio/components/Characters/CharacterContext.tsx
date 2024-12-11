import React, {useContext, useState, createContext} from 'react'

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
    selectCharacter: (character: Character) =>  void
    setSelectedCharacter: React.Dispatch<React.SetStateAction<Character | null>>;
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined)

export const useCharacterContext = () => useContext(CharacterContext);

export const CharacterProvider = ({children}) => {
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)

    const selectCharacter = (character: Character) => {
        setSelectedCharacter(character)

    }

    return(
        <CharacterContext.Provider value={{selectCharacter, selectedCharacter, setSelectedCharacter}}>
            {children}
        </CharacterContext.Provider>
    )
}
