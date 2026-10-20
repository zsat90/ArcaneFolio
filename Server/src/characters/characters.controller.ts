import { Body, Controller, UseGuards, Request, Post, Get, Param, ParseIntPipe, Put, Delete } from '@nestjs/common';
import { CharactersService } from './characters.service';
import { AddMagicPointsDto, CharacterDto, UpdateCharacterDto } from './dto/characters.dto';
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
        @Body() updateData: UpdateCharacterDto,
        @Request() req,
    ) {
        return this.characterService.updateCharacter(characterId, req.user.id, updateData)
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id/add')
    async addMagicPoints(
        @Param('id', ParseIntPipe) characterId: number,
        @Body() body: AddMagicPointsDto,
        @Request() req,
    ) {
        const {magicPoints} = body
        return this.characterService.addMagicPoints(characterId, req.user.id, magicPoints)
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id/reset')
    async resetMagicPoints(
        @Param('id', ParseIntPipe) characterId: number,
        @Request() req,
    ) {

        return this.characterService.resetMagicPoints(characterId, req.user.id)
    }

    @UseGuards(JwtAuthGuard)
    @Put('update/:id')
    async editCharacter(
        @Param('id', ParseIntPipe) characterId: number,
        @Body() updateData: UpdateCharacterDto,
        @Request() req,
    ){
        return this.characterService.updateCharacter(characterId, req.user.id, updateData)

    }

    @UseGuards(JwtAuthGuard)
    @Delete('delete/:id')
    async deleteCharacter(
        @Param('id', ParseIntPipe) characterId: number,
        @Request() req,
    ){
        return this.characterService.deleteCharacter(characterId, req.user.id)

    }

}
