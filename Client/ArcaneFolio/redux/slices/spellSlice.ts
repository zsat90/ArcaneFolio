import { createSlice, createAsyncThunk, PayloadAction, asyncThunkCreator } from '@reduxjs/toolkit';
import { getSpellsByClass, filterSpells } from '@/utils/Spells/spellsService';


interface Spell {
    id: number;
    characterClass: string;
    name: string;
    level: number;
    components: string[]
    range: string;
    areaOfEffect: string;
    save: string;
    castingTime: number;
    magicPointCost: number;
    duration: string;
    description: string;
}

interface SpellState {
    spells: Spell[]
    filteredSpells: Spell[]
    characterClass: string
    loading: boolean;
    error: string | null
}

const initialState: SpellState = {
    spells: [],
    filteredSpells: [],
    characterClass: null,
    loading: false,
    error: null
}

interface FetchFilteredSpellsParams {
    characterClass: string;
    level?: string;
    search?: string;
    spellbookId?: number;
  }

// Async Actions

// Get spells by class
export const fetchSpellsByClass = createAsyncThunk(
    "spells/fetchSpells",
    async(characterClass: string, {rejectWithValue}) => {
        try{
            const data = await getSpellsByClass(characterClass)
            return data

        }catch(err){
            return rejectWithValue(err.message)
        }
    }
)

// Filter spells
export const fetchFilteredSpells = createAsyncThunk(
    'spells/fetchFitleredSpells',
    async({characterClass, level, search, spellbookId}: FetchFilteredSpellsParams, {rejectWithValue}) => {
        try{
            
            const data = await filterSpells(characterClass, level, search, spellbookId);
            return data;

        }catch(err){
            return rejectWithValue(err.message)
        }
    }
)



const spellsSlice = createSlice({
    name: "spells",
    initialState,
    reducers: {
        setSpells(state, action: PayloadAction<Spell[]>) {
            state.spells = action.payload;
        },
        setCharacterClass(state, action: PayloadAction<string | null>) {
            state.characterClass = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchSpellsByClass.pending, (state) => {
            state.loading = true;
            state.error = null
        })
        .addCase(fetchSpellsByClass.fulfilled, (state, action) => {
            state.loading = false;
            state.spells = action.payload
        })
        .addCase(fetchSpellsByClass.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload as string
        })
        .addCase(fetchFilteredSpells.pending, (state) => {
            state.loading = true;
          })
          .addCase(fetchFilteredSpells.fulfilled, (state, action) => {
            state.loading = false;
            state.spells = action.payload;
          })
          .addCase(fetchFilteredSpells.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
          })
    }

})


export const { setSpells, setCharacterClass} = spellsSlice.actions;
export default spellsSlice.reducer;