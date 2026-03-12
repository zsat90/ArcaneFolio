
import Toast from 'react-native-toast-message'


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
    Toast.show({
      type: 'error',
      text1: 'Not enough Magic Points to cast spell',
      visibilityTime: 3000
    })
    return currentMagicPoints;
  }

  const updatedMagicPoints = currentMagicPoints - magicPointCost;

  Toast.show({
    type: 'success',
    text1: 'Spell Cast',
    visibilityTime: 3000
  })
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
