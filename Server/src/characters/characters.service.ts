import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { CharacterDto } from './dto/characters.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Character } from '@prisma/client';

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

  // Add Magic Points to Character
  async addMagicPoints(characterId: number, magicPointsToAdd: number): Promise<Character>{
    try{
      if (magicPointsToAdd <= 0) {
        throw new BadRequestException("Magic points to add must be greater than zero.");
      }

      const updatedCharacter = await this.prisma.character.update({
        where: { id: characterId},
        data: {
          magicPoints: {
            increment: magicPointsToAdd
          }
        }

      })
      return updatedCharacter

    }catch(err){
      throw new InternalServerErrorException(err)
    }
  }

  // Magic Points reset
  async resetMagicPoints(characterId: number): Promise<Character> {
    try{
      // find the character's original magic points
      const character = await this.prisma.character.findUnique({
        where: {id: characterId}
      })

      if(!character){
        throw new Error('Character not found')
      }

      const resetCharacter = await this.prisma.character.update({
        where: {id: characterId},
        data: {
          magicPoints: character.magicPoints
        }
      })
      return resetCharacter

    }catch(err){
      throw new InternalServerErrorException(err)
    }
  }
  
}

