import API_ENDPOINTS from "../apiConfig";
import * as SecureStore from "expo-secure-store";
import axiosInstance from "../axiosInstance";
import { CharacterParams } from "../Character/characterTypes";


const getToken = async () => {
  return await SecureStore.getItemAsync("token");
};

// export const fetchUserCharacters = async () => {
//   const token = await getToken();
//   if (!token) throw new Error("No auth found");

//   try {
//     const response = await axiosInstance.get(API_ENDPOINTS.GET_CHARACTERS);

//     if (!response) throw new Error("Failed to fetch characters");

//     return await response.data;
//   } catch (err) {
//     throw new Error(err);
//   }
// };

export const handleCreateCharacter = async (
  createCharacterParams: CharacterParams
) => {
  const {
    name,
    characterClass,
    level,
    magicPoints,
    setName,
    setCharacterClass,
    setLevel,
    navigation,
    setMagicPoints,
    setSelectedCharacter
  } = createCharacterParams;

  try {
    const response = await axiosInstance.post(API_ENDPOINTS.ADD_CHARACTER, {
      name,
      characterClass,
      level,
      magicPoints,
    });

    if (response.status === 201) {
      setName({ value: "", error: "" });
      setCharacterClass(null);
      setLevel(null);
      setMagicPoints(null);

      const createdCharacter = response.data;

      setSelectedCharacter(createdCharacter)

      navigation.navigate("Dashboard", { selectedCharacter: createdCharacter });
    }
  } catch (err) {
    console.error("Add Character Error", err);
  }
};

export const handleEditCharacter = async (
  editCharacterParams: CharacterParams,
  characterId: number
) => {
  const {
    name,
    magicPoints,
    level,
    navigation,
    setSelectedCharacter,
    characterClass,
  } = editCharacterParams;

  try {
    const endpoint = API_ENDPOINTS.EDIT_CHARACTER.replace(
      ":id",
      characterId.toString()
    );

    const response = await axiosInstance.put(endpoint, {
      id: characterId,
      name,
      magicPoints,
      level,
      characterClass,
    });

    if (!response || response.status !== 200) {
      throw new Error("Failed to edit character");
    }

    const updatedCharacter = {
      id: characterId,
      name,
      magicPoints,
      level,
      characterClass,
    };

    setSelectedCharacter(updatedCharacter);

    navigation.navigate("Dashboard", { selectedCharacter: updatedCharacter });
  } catch (err) {
    console.error("Edit character Error", err);
  }
};

export const handleDeleteCharacter = async (characterId: number) => {
  try {
    const endpoint = API_ENDPOINTS.DELETE_CHARACTER.replace(
      ":id",
      characterId.toString()
    );

    const response = await axiosInstance.delete(endpoint);

    if (!response) {
      throw new Error("Failed to delete character");
    }
  } catch (err) {
    console.error("Unable to Delete character", err);
  }
};
