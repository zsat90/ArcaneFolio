import { IsEmail, IsNotEmpty, Length } from "class-validator";

export class LoginDto {
    @IsNotEmpty({message: 'Email cannot be empty'})
    @IsEmail({}, {message: "Must be a valid email"})
    email: string;

    @IsNotEmpty({message: "Password cannot by empty"})
    @Length(8,20, {message: "Password must be between 8 and 20 characters"})
    password: string;
} 