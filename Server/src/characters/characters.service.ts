import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CharacterDto } from './dto/characters.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CharactersService {
  constructor(private readonly prisma: PrismaService) {}

  // Gets characters by userId
  async getCharactersByUserId(userId: number) {
    try {
      return await this.prisma.character.findMany({
        where: {
          userId: userId,
        },
      });
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  // creates Character
  async createCharacter(characterDto: CharacterDto, userId: number) {
    try {
      const newCharacterWithSpellBook = await this.prisma.$transaction(async (prisma) => {
        const spellbook = await prisma.spellbook.create({
          data: {}

        })
      

       const createdCharacter = await prisma.character.create({
        data: {
          name: characterDto.name,
          characterClass: characterDto.characterClass,
          level: characterDto.level,
          magicPoints: characterDto.magicPoints,
          user: { connect: { id: userId } },
          spellbook: { connect: { id: spellbook.id } },
        },

      });
      return createdCharacter

    })

    return newCharacterWithSpellBook
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(err);
    }
  }
  
  // update character
  async updateCharacter(characterId: number, updateData: Partial<CharacterDto>){
    try{
      const updatedCharacter = await this.prisma.character.update({
        where: {id: characterId},
        data: {
          name: updateData.name,
          characterClass: updateData.characterClass,
          level: updateData.level,
          magicPoints: updateData.magicPoints,

        }
      })

      return updatedCharacter

    }catch(err){
      throw new InternalServerErrorException(err)
    }
  
  }
}

