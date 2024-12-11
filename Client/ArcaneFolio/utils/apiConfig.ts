

const API_ENDPOINTS = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    GET_CHARACTERS: '/characters',
    ADD_CHARACTER: '/characters/create', 
    SPELLS: '/spells',
    ADD_SPELLS: '/spells/:spellbookId/add-spell',
    SPELLBOOK: '/spells/spellbook/:spellbookId',
    REMOVE_SPELL: '/spells/spellbook',
    FILTER: 'spells/:characterClass/filter',
    ADD_MAGIC_POINTS: 'characters/:id/add',
    RESET_MAGIC_POINTS: 'characters/:id/reset'

}


export default API_ENDPOINTS