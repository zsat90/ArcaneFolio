import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class AddSpellToSpellbookDto {
  @IsInt()
  @Min(1)
  spellId: number;
}

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

  @IsOptional()
  @IsString()
  school?: string

  @IsOptional()
  @IsString()
  sphere?: string
}
