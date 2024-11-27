import {IsEmail, IsNotEmpty, Length} from 'class-validator'

export class RegisterDto {
    @IsNotEmpty({message: "Name is Required"})
    name: string;

    @IsNotEmpty({message: "Email is Required"})
    @IsEmail({}, {message: "Invalid email"})
    email: string;

    @IsNotEmpty({message: "Password is Required"})
    @Length(8,20, {message: "Password must be between 8 and 20 characters"})
    password: string;
    
}