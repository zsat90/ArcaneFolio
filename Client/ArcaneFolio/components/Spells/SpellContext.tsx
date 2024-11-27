import React, {createContext, useContext, useState} from 'react'

interface Spell {
    id: number;
    characterClass: string;
    name: string;
    level: number;
    components: string[];
    range: string;
    areaOfEffect: string;
    save: string;
    castingTime: number;
    magicPointCost: number;
    duration: string;
    description: string;
}

interface Spellbook {
    id: number | null
    spells: Spell[]
}

interface SpellbookContextType {
    spellbook: Spellbook;
    setSpellbook: React.Dispatch<React.SetStateAction<Spellbook>>;
}


export const SpellbookContext = createContext<SpellbookContextType| null>(null)

export const SpellbookProvider = ({children}) => {
    const [spellbook, setSpellbook] = useState<Spellbook>({id: null, spells: []})

    return (
        <SpellbookContext.Provider value={{spellbook, setSpellbook}}>
            {children}
        </SpellbookContext.Provider>
    )
}

export const useSpellbook = (): SpellbookContextType => {
    const context = useContext(SpellbookContext);
    if (!context) {
        throw new Error('useSpellbook must be used within a SpellbookProvider');
    }
    return context;
};

