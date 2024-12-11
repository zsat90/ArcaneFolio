import axiosInstance from "../axiosInstance";
import API_ENDPOINTS from "../apiConfig";
import { Alert } from "react-native";
import { Character } from "@/types/characterTypes";

// Function to reset magic points
export const resetMagicPoints = async(characterId: number, setSelectedCharacter: React.Dispatch<React.SetStateAction<Character | null>>) => {
  try{
    const endpoint = API_ENDPOINTS.RESET_MAGIC_POINTS.replace(':id', characterId.toString());

    const response = await axiosInstance.put(endpoint)

    if (!response || !response.data) throw new Error("Failed to reset magic points");

    setSelectedCharacter((prevCharacter) => {
      if(prevCharacter && prevCharacter.id === characterId){
        return {...prevCharacter, magicPoints: response.data.magicPoints}
      }
      return prevCharacter;

    })

    Alert.alert('Magic Points Reset')
    return response.data
  }catch(err){
    throw new Error(err)
}
}


// Function to add magic points to character
export const addMagicPoints = async (
  characterId: number,
  magicPoints: number,
  setSelectedCharacter: React.Dispatch<React.SetStateAction<Character | null>>
) => {
  try {
    const endpoint = API_ENDPOINTS.ADD_MAGIC_POINTS.replace(
      ":id",
      characterId.toString()
    );

    const response = await axiosInstance.put(endpoint, {
      magicPoints: magicPoints,
    });

    if (!response || !response.data) throw new Error("Failed to add magic points");

    setSelectedCharacter((prevCharacter) => {
        if (prevCharacter && prevCharacter.id === characterId) {
            // Increment the magic points
            const updatedMagicPoints = prevCharacter.magicPoints + magicPoints;

            return { ...prevCharacter, magicPoints: updatedMagicPoints };
        }

        return prevCharacter;
      });
    

    Alert.alert("Magic Points Added");
    return await response.data;
  } catch (err) {
    throw new Error(err);
  }
};
