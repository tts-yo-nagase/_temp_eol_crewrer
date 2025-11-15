import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { PrismaClient, User, Tenant, Role, Company } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export interface TestData {
  tenant: Tenant;
  users: {
    admin: User;
    regular: User;
  };
  roles: {
    user: Role;
    admin: Role;
    powerUser: Role;
  };
  company: Company;
}

let prisma: PrismaClient;

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
  }
  return prisma;
}

export async function cleanDatabase() {
  const prisma = getPrismaClient();

  // Delete in correct order to respect foreign key constraints
  await prisma.userRole.deleteMany();
  await prisma.company.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.role.deleteMany();
}

export async function seedTestData(): Promise<TestData> {
  const prisma = getPrismaClient();

  // Create roles
  const userRole = await prisma.role.create({
    data: {
      name: 'user',
      description: 'Test User',
      sortOrder: 1
    }
  });

  const adminRole = await prisma.role.create({
    data: {
      name: 'admin',
      description: 'Test Admin',
      sortOrder: 3
    }
  });

  const powerUserRole = await prisma.role.create({
    data: {
      name: 'powerUser',
      description: 'Test Power User',
      sortOrder: 2
    }
  });

  // Create test tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Test Tenant',
      slug: 'test-tenant',
      isActive: true
    }
  });

  // Create test users
  const hashedPassword = await bcrypt.hash('testpassword', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      name: 'Admin User',
      password: hashedPassword,
      isActive: true,
      tenantId: tenant.id
    }
  });

  await prisma.userRole.create({
    data: {
      userId: adminUser.id,
      roleId: adminRole.id
    }
  });

  const regularUser = await prisma.user.create({
    data: {
      email: 'user@test.com',
      name: 'Regular User',
      password: hashedPassword,
      isActive: true,
      tenantId: tenant.id
    }
  });

  await prisma.userRole.create({
    data: {
      userId: regularUser.id,
      roleId: userRole.id
    }
  });

  // Create test company
  const company = await prisma.company.create({
    data: {
      code: 'TEST001',
      name: 'Test Company',
      address: '123 Test St',
      phone: '123-456-7890',
      tenantId: tenant.id
    }
  });

  return {
    tenant,
    users: { admin: adminUser, regular: regularUser },
    roles: { user: userRole, admin: adminRole, powerUser: powerUserRole },
    company
  };
}

export async function createTestingApp(module: { imports: any[] }): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule(module).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe());

  await app.init();
  return app;
}

export async function closeTestingApp(app: INestApplication) {
  const prismaService = app.get(PrismaService);
  await prismaService.$disconnect();
  await app.close();
}
