import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";
import API_ENDPOINTS from "../../utils/apiConfig";
import { addSpellsToSpellbook, removeSpellsFromSpellbook, filterSpells } from "../../utils/Spells/spellsService";


interface SpellbookState {
  spellbookId: number;
  spellIds: number[];
  filteredSpells: any[];
  loading: boolean;
  error: string | null;
}

const initialState: SpellbookState = {
  spellbookId: null,
  spellIds: [],
  filteredSpells: [],
  loading: false,
  error: null,
};

interface AddRemoveSpellParams {
  spellbookId: number;
  spellId: number;
}

interface FetchFilteredSpellsParams {
    characterClass: string;
    level?: string;
    search?: string;
    spellbookId?: number;
  }

// Async Actions

// Add spells to spellbook
export const handleAddSpell = createAsyncThunk(
  "spellbook/addSpell",
  async ({ spellbookId, spellId }: AddRemoveSpellParams, { rejectWithValue }) => {
    try {
      const result = await addSpellsToSpellbook(spellbookId, spellId);
      if (result.success) {
        return{
          success: result.success,
          spellId: spellId,
          spell: result.spell
        }
      } else {
        return rejectWithValue(result.message);
      }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Gets Spellbook
export const fetchSpellbook = createAsyncThunk(
  "spellbook/fetchSpellbook",
  async (spellbookId: number, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.FETCH_SPELLS.replace(
        ":id",
        spellbookId.toString()
      );
      const response = await axiosInstance.get(endpoint);

      if (!response) throw new Error("Failed to fetch spells");
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Filter spells based on criteria
export const fetchFilteredSpells = createAsyncThunk(
  "spellbook/filterSpells",
  async (
    {
      characterClass,
      level,
      search,
      spellbookId,
    }: FetchFilteredSpellsParams,
    { rejectWithValue }
  ) => {
    try {
      const response = await filterSpells(characterClass, level, search, spellbookId)
      return response

    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Handles remove spells from spellbook
export const handleRemoveSpells = createAsyncThunk(
    'spellbook/removeSpell',
    async({ spellbookId, spellId }: AddRemoveSpellParams, { rejectWithValue }) => {
        try{
            const result = await removeSpellsFromSpellbook(spellbookId, spellId);
            if (result.success) {
              return {success: result.success, spellId}
            } else {
              return rejectWithValue(result.message);
            }

        }catch(err){
            rejectWithValue(err.message)
        }
    }
)

const spellbookSlice = createSlice({
  name: "spellbook",
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSpellbook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSpellbook.fulfilled, (state, action) => {
        state.loading = false;
        state.spellbookId = action.payload.id
        state.spellIds = action.payload.spells
      })
      .addCase(fetchSpellbook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Handle filtering spells
      .addCase(fetchFilteredSpells.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFilteredSpells.fulfilled, (state, action) => {
        state.loading = false;
        state.spellbookId = action.payload.id
        state.filteredSpells = action.payload // Store filtered spells
      })
      .addCase(fetchFilteredSpells.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(handleAddSpell.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(handleAddSpell.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          console.log('before:',state.filteredSpells)
          console.log('payload', action.payload.spell)
          state.filteredSpells = [...action.payload.spell]
            .sort((a,b) => a.name.localeCompare(b.name))
          
        }
        
      })
      .addCase(handleAddSpell.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(handleRemoveSpells.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(handleRemoveSpells.fulfilled, (state, action) => {
        state.loading = false
        const {spellId} = action.payload
        state.filteredSpells = state.filteredSpells.filter(spell => spell.id !== spellId)

      })
      .addCase(handleRemoveSpells.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
});

export const {  } = spellbookSlice.actions;
export default spellbookSlice.reducer;
