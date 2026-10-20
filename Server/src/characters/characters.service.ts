import { Injectable, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
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
        orderBy: {
          name: 'asc'
        }
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
          maxMagicPoints: characterDto.maxMagicPoints ?? characterDto.magicPoints,
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
  async updateCharacter(characterId: number, userId: number, updateData: Partial<CharacterDto>){
    try{
      const result = await this.prisma.character.updateMany({
        where: { id: characterId, userId },
        data: {
          name: updateData.name,
          characterClass: updateData.characterClass,
          level: updateData.level,
          magicPoints: updateData.magicPoints,
          maxMagicPoints: updateData.maxMagicPoints,

        }
      })

      if (result.count === 0) {
        throw new NotFoundException('Character not found.')
      }

      return this.prisma.character.findFirst({ where: { id: characterId, userId } })

    }catch(err){
      if (err instanceof NotFoundException) {
        throw err
      }
      throw new InternalServerErrorException(err)
    }
  
  }

  // Delete character
  async deleteCharacter(characterId: number, userId: number) {
    try{
      const result = await this.prisma.character.deleteMany({
        where: { id: characterId, userId },
      })

      if (result.count === 0) {
        throw new NotFoundException('Character not found.')
      }

    }catch(err){
      if (err instanceof NotFoundException) {
        throw err
      }
      throw new InternalServerErrorException(err)
    }
  }

  // Add Magic Points to Character
  async addMagicPoints(characterId: number, userId: number, magicPointsToAdd: number): Promise<Character>{
    try{
      if (magicPointsToAdd <= 0) {
        throw new BadRequestException("Magic points to add must be greater than zero.");
      }

      const result = await this.prisma.character.updateMany({
        where: { id: characterId, userId },
        data: {
          magicPoints: {
            increment: magicPointsToAdd
          }
        }

      })

      if (result.count === 0) {
        throw new NotFoundException('Character not found.')
      }

      const updatedCharacter = await this.prisma.character.findFirst({ where: { id: characterId, userId } })

      if (!updatedCharacter) {
        throw new NotFoundException('Character not found.')
      }

      return updatedCharacter

    }catch(err){
      if (err instanceof BadRequestException || err instanceof NotFoundException) {
        throw err
      }
      throw new InternalServerErrorException(err)
    }
  }

  // Magic Points reset
  async resetMagicPoints(characterId: number, userId: number): Promise<Character> {
    try{
      // find the character's original magic points
      const character = await this.prisma.character.findUnique({
        where: { id: characterId, userId }
      })

      if(!character){
        throw new NotFoundException('Character not found.')
      }

      const resetCharacter = await this.prisma.character.update({
        where: { id: characterId, userId },
        data: {
          magicPoints: character.maxMagicPoints,
        }
      })
      return resetCharacter

    }catch(err){
      if (err instanceof NotFoundException) {
        throw err
      }
      throw new InternalServerErrorException(err)
    }
  }
  
}

