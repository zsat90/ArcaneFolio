import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from "../../utils/axiosInstance";
import API_ENDPOINTS from "../../utils/apiConfig";
import * as SecureStore from "expo-secure-store";
import { CharacterParams } from '../../utils/Character/characterTypes';
import Toast from 'react-native-toast-message'

// Utility to get the token
const getToken = async () => {
  return await SecureStore.getItemAsync("token");
};

interface Character {
  id: number;
  name: string;
  characterClass: string;
  level: number;
  magicPoints: number;
  spellbookId: number;
}

interface CharacterState {
  selectedCharacter: Character | null;
  characterList: Character[];
  loading: boolean;
  error: string | null
}

const initialState: CharacterState = {
  selectedCharacter: null,
  characterList: [],
  loading: false,
  error: null
};


//Async Actions

// Fetches all characters for user
export const fetchUserCharacters = createAsyncThunk(
  "character/fetchUserCharacters",
  async (_, { rejectWithValue }) => {
    try{
      const token = await getToken()
      if(!token) throw new Error('No Auth found')

      const response = await axiosInstance.get(API_ENDPOINTS.GET_CHARACTERS);
      return response.data

    }catch(err: any){
      return rejectWithValue(err.message)
    }
}
)

// Add Character
export const addCharacter = createAsyncThunk(
  'characters/addCharacter',
  async (characterParams: CharacterParams, {rejectWithValue}) => {
    try{
      const {name, characterClass, level, magicPoints} = characterParams;

      const response = await axiosInstance.post(API_ENDPOINTS.ADD_CHARACTER, {
        name,
        characterClass,
        level,
        magicPoints,
      });

      if(response.status === 201){
        return response.data
      }

    }catch(err: any){
      return rejectWithValue(err.message)
    }
  }
)

// Edit character
export const editCharacter = createAsyncThunk(
  "character/editCharacter",
  async (
    { characterId, characterParams }: { characterId: number; characterParams: CharacterParams },
    { rejectWithValue }
  ) => {
    try {
      const { name, level, magicPoints, characterClass } = characterParams;

      const endpoint = API_ENDPOINTS.EDIT_CHARACTER.replace(
        ":id",
        characterId.toString()
      );

      const response = await axiosInstance.put(endpoint, {
        id: characterId,
        name,
        level,
        magicPoints,
        characterClass,
      });

      if (response.status === 200) {
        return response.data;
      }
      throw new Error("Failed to edit character");
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete character
export const deleteCharacter = createAsyncThunk(
  "character/deleteCharacter",
  async (characterId: number, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.DELETE_CHARACTER.replace(
        ":id",
        characterId.toString()
      );

      const response = await axiosInstance.delete(endpoint);

      if (response.status === 200) {
        return characterId;
      }
      throw new Error("Failed to delete character");
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Reset Magic Points
export const resetMagicPoints = createAsyncThunk(
  "character/resetMagicPoints",
  async (characterId: number, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.RESET_MAGIC_POINTS.replace(":id", characterId.toString());
      const response = await axiosInstance.put(endpoint);

      if (response.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Magic Points Reset',
          visibilityTime: 3000
        })
        return { characterId, magicPoints: response.data.magicPoints };
      }
      throw new Error("Failed to reset magic points");
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to reset magic points',
        text2: error.message,
        visibilityTime: 3000
      })
      return rejectWithValue(error.message);
    }
  }
);

// Add Magic Points
export const addMagicPoints = createAsyncThunk(
  "character/addMagicPoints",
  async (
    { characterId, magicPoints }: { characterId: number; magicPoints: number },
    { rejectWithValue }
  ) => {
    try {
      const endpoint = API_ENDPOINTS.ADD_MAGIC_POINTS.replace(":id", characterId.toString());
      const response = await axiosInstance.put(endpoint, { magicPoints });

      if (response.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Magic Points Added',
          visibilityTime: 3000
        })
        return { characterId, magicPoints: response.data.magicPoints };
      }
      throw new Error("Failed to add magic points");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Failed to Add Magic Points",
        text2: error.message,
        visibilityTime: 3000,
      });
      return rejectWithValue(error.message);
    }
  }
);

const characterSlice = createSlice({
  name: 'character',
  initialState,
  reducers: {
    selectCharacter(state, action: PayloadAction<Character>) {
      state.selectedCharacter = action.payload;
    },
    updatedMagicPoints(state, action: PayloadAction<number>) {
      if(state.selectedCharacter){
        state.selectedCharacter.magicPoints = action.payload
      }
  }
    
  },
  extraReducers: (builder) => {
    // Fetch characters
    builder
      .addCase(fetchUserCharacters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserCharacters.fulfilled, (state, action) => {
        state.loading = false;
        state.characterList = action.payload
      })
      .addCase(fetchUserCharacters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string
      });

    // Add character
    builder
      .addCase(addCharacter.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addCharacter.fulfilled, (state, action) => {
        state.loading = false
        state.characterList.push(action.payload)
        state.selectedCharacter = action.payload;
      })
      .addCase(addCharacter.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Edit character
    builder
      .addCase(editCharacter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editCharacter.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.characterList.findIndex(
          (char) => char.id === action.payload.id
        );
        if (index !== -1) {
          state.characterList[index] = action.payload;
        }
      })
      .addCase(editCharacter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete character
    builder
      .addCase(deleteCharacter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCharacter.fulfilled, (state, action) => {
        state.loading = false;
        state.characterList = state.characterList.filter(
          (char) => char.id !== action.payload
        );
      })
      .addCase(deleteCharacter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
      builder
      .addCase(resetMagicPoints.fulfilled, (state, action) => {
        const { characterId, magicPoints } = action.payload;
        if (state.selectedCharacter && state.selectedCharacter.id === characterId) {
          state.selectedCharacter.magicPoints = magicPoints;
        }
        const characterIndex = state.characterList.findIndex(
          (char) => char.id === characterId
        );
        if (characterIndex !== -1) {
          state.characterList[characterIndex].magicPoints = magicPoints;
        }
      })
      .addCase(resetMagicPoints.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Add Magic Points
    builder
      .addCase(addMagicPoints.fulfilled, (state, action) => {
        const { characterId, magicPoints } = action.payload;
        if (state.selectedCharacter && state.selectedCharacter.id === characterId) {
          state.selectedCharacter.magicPoints = magicPoints;
        }
        const characterIndex = state.characterList.findIndex(
          (char) => char.id === characterId
        );
        if (characterIndex !== -1) {
          state.characterList[characterIndex].magicPoints = magicPoints;
        }
      })
      .addCase(addMagicPoints.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },

  
});

export const {
  selectCharacter,
  updatedMagicPoints
} = characterSlice.actions;

export default characterSlice.reducer;
