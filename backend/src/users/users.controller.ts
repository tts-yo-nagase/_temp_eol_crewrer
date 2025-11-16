import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthUserDto } from './dto/auth-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { AuthenticatedRequest } from '../types/auth.interface';
import { consola } from 'consola';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.PowerUser)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async create(@Body() createUserDto: CreateUserDto, @Request() req: AuthenticatedRequest) {
    try {
      const tenantId = req.user.tenantId;
      if (!tenantId) {
        throw new HttpException('Tenant ID not found in token', HttpStatus.UNAUTHORIZED);
      }
      return await this.usersService.create(createUserDto, tenantId);
    } catch (error: unknown) {
      consola.error('UsersController.create error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to create user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Admin, Role.PowerUser)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully'
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findMany(@Request() req: AuthenticatedRequest) {
    try {
      const tenantId = req.user.tenantId;
      if (!tenantId) {
        throw new HttpException('Tenant ID not found in token', HttpStatus.UNAUTHORIZED);
      }
      return await this.usersService.findMany(tenantId);
    } catch (error: unknown) {
      consola.error('UsersController.findMany error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to fetch users', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getMyProfile(@Request() req: AuthenticatedRequest) {
    try {
      const userId = req.user.id;
      const tenantId = req.user.tenantId;
      if (!tenantId) {
        throw new HttpException('Tenant ID not found in token', HttpStatus.UNAUTHORIZED);
      }
      return await this.usersService.findOne(userId, tenantId);
    } catch (error: unknown) {
      consola.error('UsersController.getMyProfile error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to fetch profile', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateMyProfile(@Body() updateProfileDto: UpdateProfileDto, @Request() req: AuthenticatedRequest) {
    try {
      const userId = req.user.id;
      return await this.usersService.updateOwnProfile(userId, updateProfileDto);
    } catch (error: unknown) {
      consola.error('UsersController.updateMyProfile error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to update profile', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Admin, Role.PowerUser)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'cm123abc456def789'
  })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    try {
      const tenantId = req.user.tenantId;
      if (!tenantId) {
        throw new HttpException('Tenant ID not found in token', HttpStatus.UNAUTHORIZED);
      }
      return await this.usersService.findOne(id, tenantId);
    } catch (error: unknown) {
      consola.error('UsersController.findOne error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to fetch user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.PowerUser)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'cm123abc456def789'
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req: AuthenticatedRequest) {
    try {
      const tenantId = req.user.tenantId;
      if (!tenantId) {
        throw new HttpException('Tenant ID not found in token', HttpStatus.UNAUTHORIZED);
      }
      return await this.usersService.update(id, updateUserDto, tenantId);
    } catch (error: unknown) {
      consola.error('UsersController.update error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to update user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.PowerUser)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'cm123abc456def789'
  })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    try {
      const tenantId = req.user.tenantId;
      if (!tenantId) {
        throw new HttpException('Tenant ID not found in token', HttpStatus.UNAUTHORIZED);
      }
      return await this.usersService.remove(id, tenantId);
    } catch (error: unknown) {
      consola.error('UsersController.remove error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to delete user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Auth endpoints for NextAuth
  // NOTE: This endpoint is intentionally not protected by JwtAuthGuard as it's used for initial authentication
  // Rate limiting: 5 requests per minute to prevent brute force attacks
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per 60 seconds
  @Post('auth/validate')
  @ApiOperation({ summary: 'Validate user credentials (for NextAuth)' })
  @ApiBody({ type: AuthUserDto })
  @ApiResponse({ status: 200, description: 'User validated successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async validateUser(@Body() authUserDto: AuthUserDto) {
    try {
      console.log('⭐️UsersController.validateUser called with:', authUserDto);
      const user = await this.usersService.validateUser(authUserDto);
      if (!user) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }
      return user;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      consola.error('UsersController.validateUser error:', error);
      throw new HttpException('Authentication failed', HttpStatus.UNAUTHORIZED);
    }
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per 60 seconds
  @Post('auth/upsert')
  @ApiOperation({ summary: 'Upsert user (for OAuth providers)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        name: { type: 'string', example: 'John Doe' },
        image: { type: 'string', example: 'https://example.com/avatar.jpg' },
        tenantId: {
          type: 'string',
          description: 'Tenant ID (optional, defaults to T0001 if not provided)',
          example: 'cm123abc456def789'
        }
      },
      required: ['email']
    }
  })
  @ApiResponse({ status: 200, description: 'User upserted successfully' })
  @ApiResponse({ status: 404, description: 'Default tenant not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async upsertUser(
    @Body()
    body: {
      email: string;
      name?: string;
      image?: string;
      tenantId?: string;
    }
  ) {
    try {
      return await this.usersService.upsertUser(
        body.email,
        {
          name: body.name,
          image: body.image
        },
        body.tenantId
      );
    } catch (error: unknown) {
      consola.error('UsersController.upsertUser error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to upsert user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('email/:email')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.PowerUser)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user by email' })
  @ApiParam({
    name: 'email',
    description: 'User email address',
    example: 'user@example.com'
  })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findByEmail(@Param('email') email: string, @Request() req: AuthenticatedRequest) {
    try {
      const tenantId = req.user.tenantId;
      if (!tenantId) {
        throw new HttpException('Tenant ID not found in token', HttpStatus.UNAUTHORIZED);
      }
      const user = await this.usersService.findByEmail(email, tenantId);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error: unknown) {
      consola.error('UsersController.findByEmail error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to fetch user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Tenant management endpoints
  @Get('me/tenants')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all tenants that the current user belongs to' })
  @ApiResponse({
    status: 200,
    description: 'List of tenants with roles',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          role: { type: 'string' },
          isCurrentTenant: { type: 'boolean' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserTenants(@Request() req: AuthenticatedRequest) {
    try {
      const userId = req.user.id;
      return await this.usersService.getUserTenants(userId);
    } catch (error: unknown) {
      consola.error('UsersController.getUserTenants error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to fetch user tenants', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('me/switch-tenant')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Switch to a different tenant' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tenantId: {
          type: 'string',
          description: 'Tenant ID to switch to',
          example: 'cm123abc456def789'
        }
      },
      required: ['tenantId']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Tenant switched successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        name: { type: 'string' },
        tenantId: { type: 'string' },
        roles: { type: 'array', items: { type: 'string' } },
        tenantRole: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User does not belong to this tenant' })
  async switchTenant(
    @Body() body: { tenantId: string },
    @Request() req: AuthenticatedRequest
  ) {
    try {
      const userId = req.user.id;
      return await this.usersService.switchTenant(userId, body.tenantId);
    } catch (error: unknown) {
      consola.error('UsersController.switchTenant error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to switch tenant', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
