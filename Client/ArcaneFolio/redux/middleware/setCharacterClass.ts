import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { fetchSpellsByClass, setCharacterClass } from "../slices/spellSlice";

const listenerMiddlware = createListenerMiddleware();

// Add a listener to trigger fetchspellsbyclass when setCharacterClass is dispatched
listenerMiddlware.startListening({
  actionCreator: setCharacterClass, // Listens for the action
  effect: async (action, listenerApi) => {
    const { payload: characterClass } = action; // Get the class from the action and set it
    if (characterClass) {
      try {
        // Dispatch the fetch by class action
        await listenerApi.dispatch(fetchSpellsByClass(characterClass));
      } catch (err) {
        console.error("middleware listener", err);
      }
    }
  },
});

export default listenerMiddlware;
