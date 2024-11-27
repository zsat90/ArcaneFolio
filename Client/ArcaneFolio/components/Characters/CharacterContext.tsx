import React, {useContext, useState, createContext} from 'react'

interface CharacterContextType {
    selectedCharacter: any;
    selectCharacter: (character: any) =>  void
    setSelectedCharacter: React.Dispatch<React.SetStateAction<any>>;
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined)

export const useCharacterContext = () => useContext(CharacterContext);

export const CharacterProvider = ({children}) => {
    const [selectedCharacter, setSelectedCharacter] = useState<any>(null)

    const selectCharacter = (character: any) => {
        setSelectedCharacter(character)

    }

    return(
        <CharacterContext.Provider value={{selectCharacter, selectedCharacter, setSelectedCharacter}}>
            {children}
        </CharacterContext.Provider>
    )
}
