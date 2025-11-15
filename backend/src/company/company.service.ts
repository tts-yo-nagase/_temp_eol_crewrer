import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}
  async findAll(tenantId: string, search?: string) {
    try {
      const where: Prisma.CompanyWhereInput = {
        tenantId
      };

      // Add search filter if search term is provided
      if (search && search.trim()) {
        where.OR = [
          {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            code: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            address: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            phone: {
              contains: search,
              mode: 'insensitive'
            }
          }
        ];
      }

      const result = await this.prisma.company.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        }
      });
      return result;
    } catch (error) {
      console.error('❌ CompanyService.findAll error:', error);
      throw error;
    }
  }

  async findOne(id: string, tenantId: string) {
    return await this.prisma.company.findFirst({
      where: {
        id,
        tenantId
      }
    });
  }

  async create(data: CreateCompanyDto, tenantId: string) {
    return await this.prisma.company.create({
      data: {
        ...data,
        tenantId
      }
    });
  }

  async update(id: string, data: UpdateCompanyDto, tenantId: string) {
    const result = await this.prisma.company.updateMany({
      where: {
        id,
        tenantId
      },
      data
    });

    if (result.count === 0) {
      return null;
    }

    // Return updated company
    return await this.prisma.company.findFirst({
      where: {
        id,
        tenantId
      }
    });
  }

  async remove(id: string, tenantId: string) {
    return await this.prisma.company.deleteMany({
      where: {
        id,
        tenantId
      }
    });
  }
}
