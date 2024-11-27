import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as argon2 from 'argon2'
import {JwtService} from '@nestjs/jwt'
import {RegisterDto} from './dto/register.dto'
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService) {}


    async validateUser(loginDto: LoginDto){
        try{
            const user = await this.usersService.findByEmail(loginDto.email.toLowerCase());
            if(user && (await argon2.verify(user.password, loginDto.password))){
                const { password, ...result } = user;
                return result;
            }
            return null;
        }catch(err){
            throw new InternalServerErrorException(err);
        }
    }

    async login(loginDto: LoginDto){
        const user = await this.validateUser(loginDto)
        if(!user){
            throw new UnauthorizedException('Invalid Credentials')
        }

        try{
            const payload = {email: user.email, sub: user.id};
            return{
                accessToken: this.jwtService.sign(payload)
            }
        }catch(err){
            throw new InternalServerErrorException(err);
        }


}

    async register(registerDto: RegisterDto){
        try{
            const email = registerDto.email.toLowerCase()
            // check to see if user already exists
            const existingUser = await this.usersService.findByEmail(email)
            if(existingUser){
                console.log('User with this email already exists')
                throw new ConflictException('User with this email already exists')
            }

            //Hash password before storing
            const hashedPassword = await argon2.hash(registerDto.password)
            
            await this.usersService.createUser({...registerDto, password: hashedPassword});

            return this.login({email: registerDto.email, password: registerDto.password})

        }catch(err){
            throw new InternalServerErrorException(err)
        }
    }


}
