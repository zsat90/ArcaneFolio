import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CharactersService } from './characters.service';

describe('CharactersService ownership', () => {
  it('does not update a character outside the requesting user scope', async () => {
    const updateMany = jest.fn().mockResolvedValue({ count: 0 });
    const prisma = {
      character: { updateMany },
    } as unknown as PrismaService;
    const service = new CharactersService(prisma);

    await expect(service.updateCharacter(12, 34, { name: 'Changed' })).rejects.toBeInstanceOf(NotFoundException);
    expect(updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 12, userId: 34 },
    }));
  });

  it('resets magic points to the stored maximum for the owner', async () => {
    const character = {
      id: 12,
      userId: 34,
      magicPoints: 3,
      maxMagicPoints: 8,
    };
    const findUnique = jest.fn().mockResolvedValue(character);
    const update = jest.fn().mockResolvedValue({ ...character, magicPoints: 8 });
    const prisma = {
      character: { findUnique, update },
    } as unknown as PrismaService;
    const service = new CharactersService(prisma);

    await service.resetMagicPoints(12, 34);

    expect(findUnique).toHaveBeenCalledWith({ where: { id: 12, userId: 34 } });
    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 12, userId: 34 },
      data: { magicPoints: 8 },
    }));
  });
});