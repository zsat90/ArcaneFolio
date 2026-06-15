import { Character } from "@/types/characterTypes";
import { setSelectedCharacter as persistSelectedCharacter } from './characterState';

// handle character selection and navigation
export const handleCharacterSelect = (
    item: Character, 
    navigation: any, 
    setSelectedCharacter: React.Dispatch<React.SetStateAction<Character | null>>
  ) => {
    setSelectedCharacter(item);
    persistSelectedCharacter(item);
    const params = new URLSearchParams({ selectedCharacter: item.name, characterId: String(item.id) });
    navigation.navigate(`/dashboard?${params.toString()}`);
  };
  
