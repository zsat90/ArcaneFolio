import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    async findByEmail(email: string) {
        try{
            return await this.prisma.user.findUnique({where: {email: email.toLowerCase()}});
        }catch(err){
            throw new InternalServerErrorException(err);
        }
    }

    async createUser(userDto: UserDto) {
        try{
            return await this.prisma.user.create({data: userDto})

        }catch(err){
            throw new InternalServerErrorException(err);
        }
    }

    async findUser(id: number){
        try{
            return await this.prisma.user.findUnique({where: {id}})

        }catch(err){
            throw new InternalServerErrorException(err)
        }
    }





}
