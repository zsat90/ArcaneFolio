import { IsOptional, IsString, IsInt } from 'class-validator';

export class FilterSpellsDto {
  @IsOptional()
  @IsInt()
  level?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  spellbookId?: number

  @IsOptional()
  @IsString()
  characterClass?: string
}
