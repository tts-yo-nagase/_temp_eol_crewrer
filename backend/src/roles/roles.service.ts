import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({
      orderBy: {
        sortOrder: 'asc'
      },
      select: {
        id: true,
        name: true,
        description: true,
        sortOrder: true
      }
    });
  }

  async findByName(name: string) {
    return this.prisma.role.findUnique({
      where: { name }
    });
  }
}
