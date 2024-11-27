import axiosInstance from "../axiosInstance";
import API_ENDPOINTS from '../apiConfig'



export const fetchAllSpells = async () => {
    try{
        const response = await axiosInstance.get(API_ENDPOINTS.SPELLS)

        if(!response) throw new Error('Failed to fetch spells')

        return await response.data

    }catch(err){
        throw new Error(err)
    }
}

export const removeSpellsFromSpellbook = async (spellbookId: number, spellId: number) => {
    try{
        const response = await axiosInstance.delete(`${API_ENDPOINTS.REMOVE_SPELL}/${spellbookId}/${spellId}`)

        if(response.status === 200){
            return {success: true, message: 'Spell Removed Successfully'}
        }else{
            return {success: false, message: 'Failed to remove spell'}
        }

    }catch(err){
        console.error("Error in removing spell", err);
        return { success: false, message: 'An error occurred while removing the spell' };
    }
}

export const addSpellsToSpellbook = async (spellbookId: number, spellId: number) => {
    try {
        const endpoint = API_ENDPOINTS.ADD_SPELLS.replace(":spellbookId", spellbookId.toString());

        const response = await axiosInstance.post(endpoint, { spellId });

        if (response.status === 201) {
            return { success: true, message: 'Spell added successfully' };
        } else if (response.status === 400) {
            return { success: false, message: 'Spell already exists in Spellbook' };
        } else {
            return { success: false, message: 'Failed to add spell' };
        }

    } catch (err) {
        console.error("Error in adding spell", err);
        return { success: false, message: 'An error occurred while adding the spell' };
    }
};


export const fetchSpellbook = async(spellbookId: number) => {
    try{
        const response = await axiosInstance.get(`/spells/spellbook/${spellbookId}`)
        
        if(!response) throw new Error('Failed to fetch spells')

        return response.data


    }catch(err){
        console.error('Error', err)
    }
}
