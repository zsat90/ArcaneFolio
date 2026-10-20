import { HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FilterSpellsDto } from './dto/spells.dto';


@Injectable()
export class SpellsService {
  constructor(private readonly prisma: PrismaService) {}

  async filterSpells(characterClass: string, filterSpellsDto: FilterSpellsDto) {
    try {
      const {level, search, spellbookId} = filterSpellsDto

      const where: any = {}

      if(spellbookId){
        where.spellbookId = spellbookId
      }

      if(level !== undefined){
        where.level = level
      }

      if(search){
        where.name = {
          contains: search,
          mode: 'insensitive'
        }
      }

      if(characterClass){
        where.characterClass = characterClass
      }
      
      return this.prisma.spell.findMany({
        orderBy: {
          name: 'asc'
        },
        where,
      })
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async removeSpellFromSpellbook(spellbookId: number, spellId: number, userId: number) {
    try {
      const result = await this.prisma.spell.updateMany({
        where: {
          spellbookId,
          id: spellId,
          spellbook: { character: { is: { userId } } },
        },
        data: {
          spellbookId: null,
        },
      });

      if (result.count === 0) {
        throw new NotFoundException('Spell not found in this spellbook.');
      }

      return this.prisma.spell.findUnique({ where: { id: spellId } });
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new InternalServerErrorException(err);
    }
  }

  async getSpellsForSpellbook(spellbookId: number, userId: number) {
    try {
      const spellbook = await this.prisma.spellbook.findFirst({
        where: {
          id: spellbookId,
          character: { is: { userId } },
        },
        include: {
          spells: {
            orderBy: [
              { level: 'asc' },
              { name: 'asc' }, 
            ],
          },
        },
      });

      if (!spellbook) {
        throw new NotFoundException('Spellbook not found.');
      }

      return spellbook;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new InternalServerErrorException(err);
    }
  }

  async getAllSpells(filterSpellsDto?: FilterSpellsDto) {
    try {
      const {level, search} = filterSpellsDto ?? {}
      const where: any = {}

      if(level !== undefined){
        where.level = level
      }

      if(search){
        where.name = {
          contains: search,
          mode: 'insensitive'
        }
      }

      return await this.prisma.spell.findMany({
        where,
        orderBy: [
        {
          name: 'asc',
        },
        {
          level: 'asc',
        },
      ]
      });
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async getSpellsByClass(characterClass: string){
    try{
      return await this.prisma.spell.findMany({
        where: {
          characterClass: characterClass
        },
        orderBy: [
          {
            name: 'asc',
          },
          {
            level: 'asc',
          },
        ]

      })

    }catch(err){
      throw new InternalServerErrorException(err)
    }

  }

  async getSpellsBySchool(school: string) {
    try {
      return await this.prisma.spell.findMany({
        where: {
          schools: {
            hasSome: [school],
          },
        },
        orderBy: [
          { name: 'asc' },
          { level: 'asc' },
        ],
      });
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(err);
    }
  }

  async getSpellsBySphere(sphere: string) {
    try {
      return await this.prisma.spell.findMany({
        where: {
          spheres: {
            hasSome: [sphere],
          }
        },
        orderBy: [
          { name: 'asc' },
          { level: 'asc' },
        ],
      });
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async addSpellToSpellbook(spellbookId: number, spellId: number, userId: number) {
    try {
      const spellbook = await this.prisma.spellbook.findFirst({
        where: {
          id: spellbookId,
          character: { is: { userId } },
        },
        include: { spells: true },
      });

      if (!spellbook) {
        throw new NotFoundException('Spellbook not found.');
      }

      const existingSpell = spellbook.spells.find(
        (spell) => spell.id === spellId,
      );

      if (existingSpell) {
        return {
          success: false,
          message: 'Spell already exists in the spellbook',
        };
      }

      const spell = await this.prisma.spell.findUnique({ where: { id: spellId } });

      if (!spell) {
        throw new NotFoundException('Spell not found.');
      }

      if (spell.spellbookId !== null && spell.spellbookId !== spellbookId) {
        return {
          success: false,
          message: 'Spell is already assigned to another spellbook',
        };
      }

      const updatedSpellbook = await this.prisma.spellbook.update({
        where: { id: spellbookId },
        data: {
          spells: { connect: { id: spellId } },
        },
        include: { spells: true },
      });

      return { success: true, updatedSpellbook: updatedSpellbook.spells };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new InternalServerErrorException(err);
    }
  }
}
