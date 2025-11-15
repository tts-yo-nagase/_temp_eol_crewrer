import { ApiProperty } from '@nestjs/swagger';

export class CompanyResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the company',
    example: 'cm123abc456def789'
  })
  id: string;

  @ApiProperty({
    description: 'The name of the company',
    example: 'Acme Corporation'
  })
  name: string;

  @ApiProperty({
    description: 'The unique code of the company',
    example: 'ACME001'
  })
  code: string;

  @ApiProperty({
    description: 'The address of the company',
    example: '123 Main St, New York, NY 10001',
    nullable: true
  })
  address: string | null;

  @ApiProperty({
    description: 'The phone number of the company',
    example: '+1-555-123-4567',
    nullable: true
  })
  phone: string | null;

  @ApiProperty({
    description: 'The date when the company was created',
    example: '2024-01-15T10:30:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The date when the company was last updated',
    example: '2024-01-15T10:30:00.000Z'
  })
  updatedAt: Date;
}
