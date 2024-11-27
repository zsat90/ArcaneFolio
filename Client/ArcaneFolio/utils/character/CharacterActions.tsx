import React from 'react'
import { Character } from "../../types/characterTypes";

// handle character selection and navigation
export const handleCharacterSelect = (
    item: Character, 
    navigation: any, 
    setSelectedCharacter: React.Dispatch<React.SetStateAction<Character | null>>
  ) => {
    setSelectedCharacter(item);
    navigation.navigate('Dashboard', { selectedCharacter: item });
  };
  