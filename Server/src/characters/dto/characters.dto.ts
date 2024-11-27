import { IsNotEmpty } from "class-validator";

export class CharacterDto {
    @IsNotEmpty({message: "Name is Required"})
    name: string;

    @IsNotEmpty({message: 'Class is Required'})
    characterClass: string;

    @IsNotEmpty({message: 'Level is Required'})
    level: number;

    @IsNotEmpty({message: 'Magic Points is Required'})
    magicPoints: number;

}