import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchCompanyDto {
  @ApiPropertyOptional({
    description: 'Search term to filter companies by name, code, address, or phone',
    example: 'acme',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
