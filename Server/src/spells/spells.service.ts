import { Injectable, InternalServerErrorException} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SpellsService {
    constructor(private readonly prisma: PrismaService) {}

    //TODO: Add a method to search and filter based on level and search query

    async removeSpellFromSpellbook(spellbookId: number, spellId: number) {
        try{
          return await this.prisma.spell.update({
            where: {spellbookId: spellbookId, id: spellId},
            data: {
              spellbookId: null,
            },
            
          })
        }catch(err){
          throw new InternalServerErrorException(err)

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
                orderBy: {
                  name: 'asc',
                },
              },
            },
          });
        } catch (err) {
          throw new InternalServerErrorException(err);
        }
      }

    async getAllSpells(){
        try{
            return await this.prisma.spell.findMany({
                orderBy: {
                    name: 'asc',
                    
                }
            })

        }catch(err){
            throw new InternalServerErrorException(err)
        }

    }


    async addSpellToSpellbook(spellbookId: number, spellId: number){
        
        try{
        
            const spellbook = await this.prisma.spellbook.findUnique({
                where: {id: spellbookId},
                include: {spells: true}
            })

            if(!spellbook){
                throw new Error('Spellbook not found')
            }

            const existingSpell = spellbook.spells.find(spell => spell.id === spellId)

            if(existingSpell){
                return { success: false, message: "Spell already exists in the spellbook" };
            }

            const updatedSpellbook = await this.prisma.spellbook.update({
                where: {id: spellbookId},
                data: {
                   spells: { connect: {id: spellId} }
                },
                include: {spells: true}
            })

            return {success: true, updatedSpellbook: updatedSpellbook.spells}
            

        }catch(err){
            throw new InternalServerErrorException(err)
        }
    }






}
