import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
    constructor() {}

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        
    }
}
