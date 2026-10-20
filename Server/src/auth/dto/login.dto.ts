import { IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
    @IsNotEmpty({message: 'Email cannot be empty'})
    @IsString()
    email: string;

    @IsNotEmpty({message: "Password cannot by empty"})
    @IsString()
    password: string;
} 