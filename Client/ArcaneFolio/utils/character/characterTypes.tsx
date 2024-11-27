import React from 'react'

export type CreateCharacterParams = {
    name: string;
    characterClass: string;
    level: number;
    magicPoints: number;
    setName: React.Dispatch<React.SetStateAction<{value: string, error: string}>>;
    setCharacterClass: React.Dispatch<React.SetStateAction<{value: string, error: string}>>
    setLevel: React.Dispatch<React.SetStateAction<{value: number, error: string}>>
    setMagicPoints: React.Dispatch<React.SetStateAction<{value: number, error: string}>>
    navigation: any
}