import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
  Delete,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { SpellsService } from './spells.service';
import { AddSpellToSpellbookDto, FilterSpellsDto } from './dto/spells.dto';
import { JwtAuthGuard } from 'src/auth/auth.guard';

@Controller('spells')
export class SpellsController {
  constructor(private readonly spellService: SpellsService) {}

  @Get()
  async getAllSpells(@Query() filterSpellsDto: FilterSpellsDto) {
    if(filterSpellsDto.level !== undefined) {
        filterSpellsDto.level = parseInt(filterSpellsDto.level as unknown as string, 10)
    }
    return await this.spellService.getAllSpells(filterSpellsDto);
  }

  @Get('school/:school')
  async getSpellsBySchool(
    @Param('school') school: string
  ) {
    if (!school || !school.trim()) {
      return [];
    }
  
    return await this.spellService.getSpellsBySchool(
      school.trim()
    );
  }

  @Get('sphere/:sphere')
  async getSpellsBySphere(
    @Param('sphere') sphere: string
  ) {
    return await this.spellService.getSpellsBySphere(sphere)
  }

  @Post(':spellbookId/add-spell')
  @UseGuards(JwtAuthGuard)
  async addSpellToSpellbook(
    @Param('spellbookId', ParseIntPipe) spellbookId: number,
    @Body() { spellId }: AddSpellToSpellbookDto,
    @Request() req,
  ) {
    return this.spellService.addSpellToSpellbook(spellbookId, spellId, req.user.id);
  }

  @Get('spellbook/:spellbookId')
  @UseGuards(JwtAuthGuard)
  async getSpellbook(
    @Param('spellbookId', ParseIntPipe) spellbookId: number,
    @Request() req,
  ) {
    return this.spellService.getSpellsForSpellbook(spellbookId, req.user.id);
  }

  @Delete('spellbook/:spellbookId/:id')
  @UseGuards(JwtAuthGuard)
  async removeSpell(
    @Param('spellbookId', ParseIntPipe) spellbookId: number,
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.spellService.removeSpellFromSpellbook(spellbookId, id, req.user.id);
  }

  @Get(':characterClass/filter')
  async filterSpells(
    @Param('characterClass') characterClass: string,
    @Query() filterSpellsDto: FilterSpellsDto) {
    if(filterSpellsDto.level !== undefined) {
        filterSpellsDto.level = parseInt(filterSpellsDto.level as unknown as string, 10)
    }
    if(filterSpellsDto.spellbookId) {
      filterSpellsDto.spellbookId = parseInt(filterSpellsDto.spellbookId as unknown as string, 10)
    }
    return this.spellService.filterSpells(characterClass, filterSpellsDto);
  }

  @Get(':characterClass')
    async getSpellsByClass(
      @Param('characterClass') characterClass: string
    ) {
      return await this.spellService.getSpellsByClass(characterClass)
    
  }

}
