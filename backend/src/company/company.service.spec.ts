import { Test, TestingModule } from '@nestjs/testing';
import { CompanyService } from './company.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

describe('CompanyService', () => {
  let service: CompanyService;

  const mockTenantId = 'tenant-123';
  const mockCompanyId = 'company-123';

  const mockCompany = {
    id: mockCompanyId,
    code: 'COMP001',
    name: 'Test Company',
    address: '123 Test St',
    phone: '123-456-7890',
    tenantId: mockTenantId,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockPrismaService = {
    company: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn()
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ]
    }).compile();

    service = module.get<CompanyService>(CompanyService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all companies for a tenant', async () => {
      const companies = [mockCompany];
      mockPrismaService.company.findMany.mockResolvedValue(companies);

      const result = await service.findAll(mockTenantId);

      expect(result).toEqual(companies);
      expect(mockPrismaService.company.findMany).toHaveBeenCalledWith({
        where: { tenantId: mockTenantId },
        orderBy: { createdAt: 'desc' }
      });
    });

    it('should filter companies by search term', async () => {
      const companies = [mockCompany];
      const searchTerm = 'Test';
      mockPrismaService.company.findMany.mockResolvedValue(companies);

      const result = await service.findAll(mockTenantId, searchTerm);

      expect(result).toEqual(companies);
      expect(mockPrismaService.company.findMany).toHaveBeenCalledWith({
        where: {
          tenantId: mockTenantId,
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { code: { contains: searchTerm, mode: 'insensitive' } },
            { address: { contains: searchTerm, mode: 'insensitive' } },
            { phone: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        orderBy: { createdAt: 'desc' }
      });
    });

    it('should not add OR filter for empty search term', async () => {
      const companies = [mockCompany];
      mockPrismaService.company.findMany.mockResolvedValue(companies);

      await service.findAll(mockTenantId, '   ');

      expect(mockPrismaService.company.findMany).toHaveBeenCalledWith({
        where: { tenantId: mockTenantId },
        orderBy: { createdAt: 'desc' }
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockPrismaService.company.findMany.mockRejectedValue(error);

      await expect(service.findAll(mockTenantId)).rejects.toThrow('Database error');
    });
  });

  describe('findOne', () => {
    it('should return a company by id and tenantId', async () => {
      mockPrismaService.company.findFirst.mockResolvedValue(mockCompany);

      const result = await service.findOne(mockCompanyId, mockTenantId);

      expect(result).toEqual(mockCompany);
      expect(mockPrismaService.company.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockCompanyId,
          tenantId: mockTenantId
        }
      });
    });

    it('should return null if company not found', async () => {
      mockPrismaService.company.findFirst.mockResolvedValue(null);

      const result = await service.findOne('non-existent-id', mockTenantId);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new company', async () => {
      const createDto: CreateCompanyDto = {
        code: 'COMP001',
        name: 'Test Company',
        address: '123 Test St',
        phone: '123-456-7890'
      };

      mockPrismaService.company.create.mockResolvedValue(mockCompany);

      const result = await service.create(createDto, mockTenantId);

      expect(result).toEqual(mockCompany);
      expect(mockPrismaService.company.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          tenantId: mockTenantId
        }
      });
    });

    it('should handle creation errors', async () => {
      const createDto: CreateCompanyDto = {
        code: 'COMP001',
        name: 'Test Company'
      };
      const error = new Error('Duplicate key error');
      mockPrismaService.company.create.mockRejectedValue(error);

      await expect(service.create(createDto, mockTenantId)).rejects.toThrow('Duplicate key error');
    });
  });

  describe('update', () => {
    it('should update a company', async () => {
      const updateDto: UpdateCompanyDto = {
        name: 'Updated Company',
        address: '456 New St'
      };

      const updatedCompany = {
        ...mockCompany,
        ...updateDto
      };

      mockPrismaService.company.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.company.findFirst.mockResolvedValue(updatedCompany);

      const result = await service.update(mockCompanyId, updateDto, mockTenantId);

      expect(result).toEqual(updatedCompany);
      expect(mockPrismaService.company.updateMany).toHaveBeenCalledWith({
        where: {
          id: mockCompanyId,
          tenantId: mockTenantId
        },
        data: updateDto
      });
      expect(mockPrismaService.company.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockCompanyId,
          tenantId: mockTenantId
        }
      });
    });

    it('should return null if company not found', async () => {
      const updateDto: UpdateCompanyDto = {
        name: 'Updated Company'
      };

      mockPrismaService.company.updateMany.mockResolvedValue({ count: 0 });

      const result = await service.update('non-existent-id', updateDto, mockTenantId);

      expect(result).toBeNull();
      expect(mockPrismaService.company.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a company', async () => {
      mockPrismaService.company.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.remove(mockCompanyId, mockTenantId);

      expect(result).toEqual({ count: 1 });
      expect(mockPrismaService.company.deleteMany).toHaveBeenCalledWith({
        where: {
          id: mockCompanyId,
          tenantId: mockTenantId
        }
      });
    });

    it('should return count 0 if company not found', async () => {
      mockPrismaService.company.deleteMany.mockResolvedValue({ count: 0 });

      const result = await service.remove('non-existent-id', mockTenantId);

      expect(result).toEqual({ count: 0 });
    });
  });
});
