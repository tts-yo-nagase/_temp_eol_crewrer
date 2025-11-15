import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateCompanyDto {
  @ApiProperty({
    description: 'The name of the company',
    example: 'Acme Corporation',
    required: false
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'The unique code of the company',
    example: 'ACME001',
    required: false
  })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({
    description: 'The address of the company',
    example: '123 Main St, New York, NY 10001',
    required: false
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'The phone number of the company',
    example: '+1-555-123-4567',
    required: false
  })
  @IsString()
  @IsOptional()
  phone?: string;
}
