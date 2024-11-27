import { Controller, Get, Post, Param, Body, ParseIntPipe, Delete } from '@nestjs/common';
import {SpellsService} from './spells.service'

@Controller('spells')
export class SpellsController {
    constructor(private readonly spellService: SpellsService){}

    @Get()
    async getAllSpells() {
        return await this.spellService.getAllSpells()

    }

    @Post(':spellbookId/add-spell')
    async addSpellToSpellbook(
        @Param('spellbookId', ParseIntPipe) spellbookId: number,
        @Body() {spellId}: {spellId: number},

    ){
        return this.spellService.addSpellToSpellbook(spellbookId, spellId)

    }

    @Get('spellbook/:spellbookId')
    async getSpellbook(@Param('spellbookId', ParseIntPipe) spellbookId: number) {
        return this.spellService.getSpellsForSpellbook(spellbookId)
    }

    @Delete('spellbook/:spellbookId/:id')
    async removeSpell(
        @Param('spellbookId', ParseIntPipe) spellbookId: number,
        @Param('id', ParseIntPipe) id: number
    ){
        return this.spellService.removeSpellFromSpellbook(spellbookId, id)
    }

}
