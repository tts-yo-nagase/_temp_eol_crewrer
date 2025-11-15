import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyResponseDto } from './dto/company-response.dto';
import { SearchCompanyDto } from './dto/search-company.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { consola } from 'consola';
import { AuthenticatedRequest } from '../types/auth.interface';

// Prisma error interface
interface PrismaError {
  code: string;
  message: string;
}

function isPrismaError(error: unknown): error is PrismaError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  );
}

@ApiTags('companies')
@Controller('companies')
@ApiBearerAuth('JWT-auth')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  @ApiOperation({ summary: 'Get all companies' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term to filter companies by name, code, address, or phone',
    example: 'acme'
  })
  @ApiResponse({
    status: 200,
    description: 'List of companies retrieved successfully',
    type: [CompanyResponseDto]
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findMany(
    @Request() req: AuthenticatedRequest,
    @Query() query: SearchCompanyDto
  ): Promise<CompanyResponseDto[]> {
    try {
      const tenantId = req.user.tenantId;
      if (!tenantId) {
        throw new HttpException('Tenant ID not found in token', HttpStatus.UNAUTHORIZED);
      }
      return await this.companyService.findAll(tenantId, query.search);
    } catch (error: unknown) {
      consola.error('Controller error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to fetch companies', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a company by ID' })
  @ApiParam({
    name: 'id',
    description: 'Company ID',
    example: 'cm123abc456def789'
  })
  @ApiResponse({
    status: 200,
    description: 'Company retrieved successfully',
    type: CompanyResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.PowerUser, Role.Admin)
  async findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest): Promise<CompanyResponseDto> {
    try {
      const tenantId = req.user.tenantId;
      if (!tenantId) {
        throw new HttpException('Tenant ID not found in token', HttpStatus.UNAUTHORIZED);
      }
      const company = await this.companyService.findOne(id, tenantId);
      if (!company) {
        throw new HttpException(`Company with ID ${id} not found`, HttpStatus.NOT_FOUND);
      }
      return company;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to fetch company', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new company' })
  @ApiBody({
    type: CreateCompanyDto,
    description: 'Company data to create'
  })
  @ApiResponse({
    status: 201,
    description: 'Company created successfully',
    type: CompanyResponseDto
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(
    @Body() createCompanyDto: CreateCompanyDto,
    @Request() req: AuthenticatedRequest
  ): Promise<CompanyResponseDto> {
    try {
      const tenantId = req.user.tenantId;
      if (!tenantId) {
        throw new HttpException('Tenant ID not found in token', HttpStatus.UNAUTHORIZED);
      }
      return await this.companyService.create(createCompanyDto, tenantId);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (isPrismaError(error)) {
        if (error.code === 'P2002') {
          throw new HttpException('Company code already exists', HttpStatus.CONFLICT);
        }
      }
      throw new HttpException('Failed to create company', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a company by ID' })
  @ApiParam({
    name: 'id',
    description: 'Company ID',
    example: 'cm123abc456def789'
  })
  @ApiBody({
    type: UpdateCompanyDto,
    description: 'Company data to update'
  })
  @ApiResponse({
    status: 200,
    description: 'Company updated successfully',
    type: CompanyResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiResponse({ status: 409, description: 'Company code already exists' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Admin, Role.PowerUser)
  async update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @Request() req: AuthenticatedRequest
  ): Promise<CompanyResponseDto> {
    try {
      const tenantId = req.user.tenantId;
      if (!tenantId) {
        throw new HttpException('Tenant ID not found in token', HttpStatus.UNAUTHORIZED);
      }
      const result = await this.companyService.update(id, updateCompanyDto, tenantId);
      if (!result) {
        throw new HttpException(`Company with ID ${id} not found`, HttpStatus.NOT_FOUND);
      }
      return result;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (isPrismaError(error)) {
        if (error.code === 'P2002') {
          throw new HttpException('Company code already exists', HttpStatus.CONFLICT);
        }
        if (error.code === 'P2025') {
          throw new HttpException(`Company with ID ${id} not found`, HttpStatus.NOT_FOUND);
        }
      }
      throw new HttpException('Failed to update company', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a company by ID' })
  @ApiParam({
    name: 'id',
    description: 'Company ID',
    example: 'cm123abc456def789'
  })
  @ApiResponse({
    status: 200,
    description: 'Company deleted successfully',
    type: CompanyResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Admin, Role.PowerUser)
  async remove(@Param('id') id: string, @Request() req: AuthenticatedRequest): Promise<{ count: number }> {
    try {
      const tenantId = req.user.tenantId;
      if (!tenantId) {
        throw new HttpException('Tenant ID not found in token', HttpStatus.UNAUTHORIZED);
      }
      const result = await this.companyService.remove(id, tenantId);
      if (result.count === 0) {
        throw new HttpException(`Company with ID ${id} not found`, HttpStatus.NOT_FOUND);
      }
      return result;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (isPrismaError(error)) {
        if (error.code === 'P2025') {
          throw new HttpException(`Company with ID ${id} not found`, HttpStatus.NOT_FOUND);
        }
      }
      throw new HttpException('Failed to delete company', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
