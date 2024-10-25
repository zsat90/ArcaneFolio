import { Controller, Get } from '@nestjs/common';

@Controller('users')
export class UsersController {
    constructor() {}

    @Get()
    getAllUsers() {
        return 'All users';
    }
}
