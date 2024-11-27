import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CharactersModule } from './characters/characters.module';
import { SpellsModule } from './spells/spells.module';

@Module({
  imports: [UsersModule, AuthModule, CharactersModule, SpellsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
