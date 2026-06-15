import { Injectable, InternalServerErrorException } from '@nestjs/common';
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

  async removeSpellFromSpellbook(spellbookId: number, spellId: number) {
    try {
      return await this.prisma.spell.update({
        where: { spellbookId: spellbookId, id: spellId },
        data: {
          spellbookId: null,
        },
      });
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async getSpellsForSpellbook(spellbookId: number) {
    try {
      return await this.prisma.spellbook.findUnique({
        where: {
          id: spellbookId,
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
    } catch (err) {
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

  async addSpellToSpellbook(spellbookId: number, spellId: number) {
    try {
      const spellbook = await this.prisma.spellbook.findUnique({
        where: { id: spellbookId },
        include: { spells: true },
      });

      if (!spellbook) {
        throw new Error('Spellbook not found');
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

      const updatedSpellbook = await this.prisma.spellbook.update({
        where: { id: spellbookId },
        data: {
          spells: { connect: { id: spellId } },
        },
        include: { spells: true },
      });

      return { success: true, updatedSpellbook: updatedSpellbook.spells };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
}
