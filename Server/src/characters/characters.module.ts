import { Module } from '@nestjs/common';
import { CharactersService } from './characters.service';
import { CharactersController } from './characters.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [CharactersService, PrismaService],
  controllers: [CharactersController]
})
export class CharactersModule {}
