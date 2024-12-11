import { Body, Controller, UseGuards, Request, Post, Get, Param, ParseIntPipe, Put } from '@nestjs/common';
import { CharactersService } from './characters.service';
import { CharacterDto } from './dto/characters.dto';
import { JwtAuthGuard } from 'src/auth/auth.guard';

@Controller('characters')
export class CharactersController {
    constructor(private readonly characterService: CharactersService) {}

    // Routes for getting and adding the list of characters for each user
    @UseGuards(JwtAuthGuard)
    @Get()
    async getCharacters(@Request() req){
        const userId = req.user.id
        return this.characterService.getCharactersByUserId(userId)
    }

    @UseGuards(JwtAuthGuard)
    @Post('create')
    async createCharacter(@Body() characterDto: CharacterDto, @Request() req){
        const userId = req.user.id
        return this.characterService.createCharacter(characterDto, userId)
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async updateCharacter(
        @Param('id', ParseIntPipe) characterId: number,
        @Body() updateData: Partial<CharacterDto>
    ) {
        return this.characterService.updateCharacter(characterId, updateData)
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id/add')
    async addMagicPoints(
        @Param('id', ParseIntPipe) characterId: number,
        @Body() body: {magicPoints: number}
    ) {
        const {magicPoints} = body
        return this.characterService.addMagicPoints(characterId, magicPoints)
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id/reset')
    async resetMagicPoints(
        @Param('id', ParseIntPipe) characterId: number,
    ) {

        return this.characterService.resetMagicPoints(characterId)
    }

}
