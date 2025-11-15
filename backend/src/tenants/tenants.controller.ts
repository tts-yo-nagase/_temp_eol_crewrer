import { Controller, Get, Param, UseGuards, HttpException, HttpStatus, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { TenantResponseDto } from './dto/tenant-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from '../types/auth.interface';

@ApiTags('tenants')
@Controller('tenants')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant by ID' })
  @ApiParam({
    name: 'id',
    description: 'Tenant ID',
    example: 'cm123abc456def789'
  })
  @ApiResponse({
    status: 200,
    description: 'Tenant retrieved successfully',
    type: TenantResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only access own tenant'
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest): Promise<TenantResponseDto> {
    // Security: Users can only access their own tenant
    if (req.user.tenantId !== id) {
      throw new HttpException('You can only access your own tenant information', HttpStatus.FORBIDDEN);
    }

    return await this.tenantsService.findOne(id);
  }
}
