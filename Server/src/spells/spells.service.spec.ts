import { NotFoundException, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FilterSpellsDto } from './dto/spells.dto';
import { SpellsService } from './spells.service';

describe('SpellsService ownership', () => {
  it('converts numeric query parameters before validation', async () => {
    const pipe = new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    });

    const result = await pipe.transform({ level: '2' }, {
      type: 'query',
      metatype: FilterSpellsDto,
    });

    expect(result.level).toBe(2);
  });

  it('does not return a spellbook outside the requesting user scope', async () => {
    const findFirst = jest.fn().mockResolvedValue(null);
    const prisma = {
      spellbook: { findFirst },
    } as unknown as PrismaService;
    const service = new SpellsService(prisma);

    await expect(service.getSpellsForSpellbook(12, 34)).rejects.toBeInstanceOf(NotFoundException);
    expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 12, character: { is: { userId: 34 } } },
    }));
  });
});