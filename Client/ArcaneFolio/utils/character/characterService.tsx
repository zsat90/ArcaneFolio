import API_ENDPOINTS from "../apiConfig";
import * as SecureStore from "expo-secure-store";
import axiosInstance from "../axiosInstance";
import {CreateCharacterParams} from '../Character/characterTypes'

const getToken = async () => {
  return await SecureStore.getItemAsync("token");
};

export const fetchUserCharacters = async () => {
  const token = await getToken();
  if (!token) throw new Error("No auth found");

  try {
    const response = await axiosInstance.get(API_ENDPOINTS.GET_CHARACTERS);

    if (!response) throw new Error("Failed to fetch characters");

    return await response.data;
  } catch (err) {
    throw new Error(err);
  }
};

export const handleCreateCharacter = async (createCharacterParams: CreateCharacterParams) => {
    const {name, characterClass, level, magicPoints, setName, setCharacterClass, setLevel, navigation, setMagicPoints} = createCharacterParams;

    try {
        const response = await axiosInstance.post(API_ENDPOINTS.ADD_CHARACTER, {
            name,
            characterClass,
            level,
            magicPoints
        })

        if (response.status === 201) {
            setName({ value: "", error: "" });
            setCharacterClass(null);
            setLevel(null);
            setMagicPoints(null);

            const createdCharacter = {name, characterClass, level, magicPoints}

            navigation.navigate('Dashboard', {selectedCharacter: createdCharacter})
        }

    }catch(err){
        console.error("Add Character Error", err)
    }



}
