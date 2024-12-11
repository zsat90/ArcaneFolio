import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
  Delete,
  Query,
} from '@nestjs/common';
import { SpellsService } from './spells.service';
import { FilterSpellsDto } from './dto/spells.dto';

@Controller('spells')
export class SpellsController {
  constructor(private readonly spellService: SpellsService) {}

  @Get()
  async getAllSpells() {
    return await this.spellService.getAllSpells();
  }

  @Get(':characterClass')
    async getSpellsByClass(
      @Param('characterClass') characterClass: string
    ) {
      return await this.spellService.getSpellsByClass(characterClass)
    
  }

  @Post(':spellbookId/add-spell')
  async addSpellToSpellbook(
    @Param('spellbookId', ParseIntPipe) spellbookId: number,
    @Body() { spellId }: { spellId: number },
  ) {
    return this.spellService.addSpellToSpellbook(spellbookId, spellId);
  }

  @Get('spellbook/:spellbookId')
  async getSpellbook(@Param('spellbookId', ParseIntPipe) spellbookId: number) {
    return this.spellService.getSpellsForSpellbook(spellbookId);
  }

  @Delete('spellbook/:spellbookId/:id')
  async removeSpell(
    @Param('spellbookId', ParseIntPipe) spellbookId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.spellService.removeSpellFromSpellbook(spellbookId, id);
  }

  @Get(':characterClass/filter')
  async filterSpells(
    @Param('characterClass') characterClass: string,
    @Query() filterSpellsDto: FilterSpellsDto) {
    if(filterSpellsDto.level) {
        filterSpellsDto.level = parseInt(filterSpellsDto.level as unknown as string, 10)
    }
    if(filterSpellsDto.spellbookId) {
      filterSpellsDto.spellbookId = parseInt(filterSpellsDto.spellbookId as unknown as string, 10)
    }
    return this.spellService.filterSpells(characterClass, filterSpellsDto);
  }

}
