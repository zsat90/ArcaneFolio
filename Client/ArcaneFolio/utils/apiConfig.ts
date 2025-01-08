

const API_ENDPOINTS = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    GET_CHARACTERS: '/characters',
    ADD_CHARACTER: '/characters/create', 
    SPELLS: '/spells',
    ADD_SPELLS: '/spells/:spellbookId/add-spell',
    SPELLBOOK: '/spells/spellbook/:spellbookId',
    REMOVE_SPELL: '/spells/spellbook',
    FETCH_SPELLS: '/spells/spellbook/:id',
    FILTER: 'spells/:characterClass/filter',
    ADD_MAGIC_POINTS: 'characters/:id/add',
    RESET_MAGIC_POINTS: 'characters/:id/reset',
    EDIT_CHARACTER: 'characters/update/:id',
    DELETE_CHARACTER: 'characters/delete/:id'

}


export default API_ENDPOINTS