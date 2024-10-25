import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private readonly usersService: UsersService) {}


    async validateUser(email: string, password: string){
        try{
            const user = await this.usersService.findByEmail(email);
            if(user && (await bcrypt.compare(password, user.password))){
                const { password, ...result } = user;
                return result;
            }
            return null;
        }catch(err){
            throw new InternalServerErrorException(err);
        }
    }

    async login(user: any){
        try{
            

        }catch(err){
            throw new InternalServerErrorException(err);
        }


}


}
