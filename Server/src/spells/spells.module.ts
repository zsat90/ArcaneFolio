import { Module } from '@nestjs/common';
import { SpellsService } from './spells.service';
import { SpellsController } from './spells.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [SpellsService, PrismaService],
  controllers: [SpellsController],
  exports: [PrismaService]
})
export class SpellsModule {}
