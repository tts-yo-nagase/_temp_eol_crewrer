import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesService } from './roles.service';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({
    status: 200,
    description: 'List of all available roles',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'cmhj2ha2v0000nxpmc3yunuhr' },
          name: { type: 'string', example: 'user' },
          description: { type: 'string', example: '一般ユーザー' },
          sortOrder: { type: 'number', example: 1 }
        }
      }
    }
  })
  async findAll() {
    return this.rolesService.findAll();
  }
}
