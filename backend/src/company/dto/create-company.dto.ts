import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({
    description: 'The name of the company',
    example: 'Acme Corporation'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The unique code of the company',
    example: 'ACME001'
  })
  @IsString()
  @IsNotEmpty()
  code: string;

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
