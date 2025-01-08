import {configureStore} from '@reduxjs/toolkit'
import characterReducer from './slices/characterSlice'
import spellbookReducer from './slices/spellbookSlice'
import spellsReducer from './slices/spellSlice'
import listenerMiddlware from './middleware/setCharacterClass'



export const store = configureStore({
    reducer: {
        character: characterReducer,
        spellbook: spellbookReducer,
        spells: spellsReducer
    },
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware().concat(listenerMiddlware.middleware)
    }
})



export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch
