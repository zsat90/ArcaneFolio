import { ConflictException, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService registration', () => {
  it('continues to accept longer legacy passwords at login validation', async () => {
    const pipe = new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    });

    const result = await pipe.transform({
      email: 'legacy-account',
      password: 'a'.repeat(24),
    }, { type: 'body', metatype: LoginDto });

    expect(result.password).toHaveLength(24);
  });

  it('preserves the conflict response for an existing email', async () => {
    const createUser = jest.fn();
    const usersService = {
      findByEmail: jest.fn().mockResolvedValue({ id: 1 }),
      createUser,
    } as unknown as UsersService;
    const jwtService = { sign: jest.fn() } as unknown as JwtService;
    const service = new AuthService(usersService, jwtService);

    await expect(service.register({
      name: 'Adventurer',
      email: 'player@example.com',
      password: 'password123',
    })).rejects.toBeInstanceOf(ConflictException);
    expect(createUser).not.toHaveBeenCalled();
  });

  it('stores and logs in with the normalized email address', async () => {
    const createUser = jest.fn();
    const usersService = {
      findByEmail: jest.fn().mockResolvedValue(null),
      createUser,
    } as unknown as UsersService;
    const service = new AuthService(usersService, { sign: jest.fn() } as unknown as JwtService);
    const login = jest.spyOn(service, 'login').mockResolvedValue({ accessToken: 'token' });

    await service.register({
      name: 'Adventurer',
      email: 'Player@Example.com',
      password: 'password123',
    });

    expect(createUser).toHaveBeenCalledWith(expect.objectContaining({ email: 'player@example.com' }));
    expect(login).toHaveBeenCalledWith({ email: 'player@example.com', password: 'password123' });
  });
});