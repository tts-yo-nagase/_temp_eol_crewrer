import { ApiProperty } from '@nestjs/swagger';

export class TenantResponseDto {
  @ApiProperty({ description: 'Tenant ID', example: 'cm123abc456def789' })
  id: string;

  @ApiProperty({ description: 'Tenant name', example: 'Acme Corporation' })
  name: string;

  @ApiProperty({
    description: 'URL-friendly tenant identifier',
    example: 'acme-corp'
  })
  slug: string;

  @ApiProperty({
    description: 'Custom domain (optional)',
    example: 'acme.example.com',
    required: false
  })
  domain?: string | null;

  @ApiProperty({ description: 'Whether the tenant is active', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Tenant creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Tenant last update timestamp' })
  updatedAt: Date;
}
