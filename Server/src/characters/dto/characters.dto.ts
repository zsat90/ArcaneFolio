import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CharacterDto {
    @IsString()
    @IsNotEmpty({message: "Name is Required"})
    name: string;

    @IsString()
    @IsNotEmpty({message: 'Class is Required'})
    characterClass: string;

    @IsInt()
    @IsNotEmpty({message: 'Level is Required'})
    level: number;

    @IsInt()
    @IsNotEmpty({message: 'Magic Points is Required'})
    magicPoints: number;

    @IsOptional()
    @IsInt()
    maxMagicPoints?: number;
}

export class UpdateCharacterDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    characterClass?: string;

    @IsOptional()
    @IsInt()
    level?: number;

    @IsOptional()
    @IsInt()
    magicPoints?: number;

    @IsOptional()
    @IsInt()
    maxMagicPoints?: number;
}

export class AddMagicPointsDto {
    @IsInt()
    magicPoints: number;
}