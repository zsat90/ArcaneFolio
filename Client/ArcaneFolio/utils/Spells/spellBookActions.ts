
import { Alert } from "react-native";


type Spell = {
  id: number;
  name: string;
  magicPointCost: number;
};

export const castSpell = async (
  spell: Spell,
  currentMagicPoints: number
): Promise<number> => {
  const { magicPointCost } = spell;

  if (currentMagicPoints < magicPointCost) {
    Alert.alert("Not enough Magic Points to cast spell");
    return currentMagicPoints;
  }

  const updatedMagicPoints = currentMagicPoints - magicPointCost;

  Alert.alert("Spell Cast");
  return updatedMagicPoints;
};

// Function to load character magic points from AsyncStorage
// export const loadMagicPoints = async (
//     characterId: number,
//     setSelectedCharacter: React.Dispatch<React.SetStateAction<Character | null>>
//   ) => {
//     try {
//       const storedMagicPoints = await AsyncStorage.getItem(
//         `magicPoints_${characterId}`
//       );
//       if (storedMagicPoints) {
//         const magicPoints = JSON.parse(storedMagicPoints);
//         setSelectedCharacter((prevCharacter) => {
//           if (prevCharacter && prevCharacter.id === characterId) {
//             return { ...prevCharacter, magicPoints };
//           }
//           return prevCharacter;
//         });

//       }
//     } catch (err) {
//       console.error("Failed to load magic points:", err);
//     }
//   };
