import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Create role master data
  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      description: '一般ユーザー',
      sortOrder: 1,
    },
  })

  const powerUserRole = await prisma.role.upsert({
    where: { name: 'powerUser' },
    update: {},
    create: {
      name: 'powerUser',
      description: 'パワーユーザー',
      sortOrder: 2,
    },
  })

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: '管理者',
      sortOrder: 3,
    },
  })

  console.log('Seeded roles:', { userRole, powerUserRole, adminRole })

  // Create default tenant for OAuth users
  const defaultTenant = await prisma.tenant.upsert({
    where: { slug: 'T0001' },
    update: {},
    create: {
      name: 'Default Tenant',
      slug: 'T0001',
      isActive: true,
    },
  })

  console.log('Seeded default tenant:', defaultTenant)

  // Create demo tenants
  const tenant1 = await prisma.tenant.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Corporation',
      slug: 'acme-corp',
      isActive: true,
    },
  })

  console.log('Seeded tenant:', tenant1)

  const tenant2 = await prisma.tenant.upsert({
    where: { slug: 'demo-inc' },
    update: {},
    create: {
      name: 'Demo Inc.',
      slug: 'demo-inc',
      isActive: true,
    },
  })

  console.log('Seeded tenant:', tenant2)

  // Create users for tenant1 (Acme Corp)
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const adminUser = await prisma.user.upsert({
    where: {
      email_tenantId: {
        email: 'admin@example.com',
        tenantId: tenant1.id,
      },
    },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      isActive: true,
      emailVerified: new Date(),
      tenantId: tenant1.id,
    },
  })

  // Assign admin role
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  })

  console.log('Seeded admin user:', adminUser)

  const regularUserPassword = await bcrypt.hash('user123', 10)

  const regularUser = await prisma.user.upsert({
    where: {
      email_tenantId: {
        email: 'user@example.com',
        tenantId: tenant1.id,
      },
    },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Regular User',
      password: regularUserPassword,
      isActive: true,
      emailVerified: new Date(),
      tenantId: tenant1.id,
    },
  })

  // Assign user role
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: regularUser.id,
        roleId: userRole.id,
      },
    },
    update: {},
    create: {
      userId: regularUser.id,
      roleId: userRole.id,
    },
  })

  console.log('Seeded regular user:', regularUser)

  // Create users for tenant2 (Demo Inc)
  const managerPassword = await bcrypt.hash('manager123', 10)

  const managerUser = await prisma.user.upsert({
    where: {
      email_tenantId: {
        email: 'manager@example.com',
        tenantId: tenant2.id,
      },
    },
    update: {},
    create: {
      email: 'manager@example.com',
      name: 'Manager User',
      password: managerPassword,
      isActive: true,
      emailVerified: new Date(),
      tenantId: tenant2.id,
    },
  })

  // Assign powerUser and user roles
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: managerUser.id,
        roleId: powerUserRole.id,
      },
    },
    update: {},
    create: {
      userId: managerUser.id,
      roleId: powerUserRole.id,
    },
  })
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: managerUser.id,
        roleId: userRole.id,
      },
    },
    update: {},
    create: {
      userId: managerUser.id,
      roleId: userRole.id,
    },
  })

  console.log('Seeded manager user:', managerUser)

  const superAdminPassword = await bcrypt.hash('super123', 10)

  const superAdmin = await prisma.user.upsert({
    where: {
      email_tenantId: {
        email: 'super@example.com',
        tenantId: tenant2.id,
      },
    },
    update: {},
    create: {
      email: 'super@example.com',
      name: 'Super Admin',
      password: superAdminPassword,
      isActive: true,
      emailVerified: new Date(),
      tenantId: tenant2.id,
    },
  })

  // Assign admin, powerUser, and user roles
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: superAdmin.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: superAdmin.id,
      roleId: adminRole.id,
    },
  })
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: superAdmin.id,
        roleId: powerUserRole.id,
      },
    },
    update: {},
    create: {
      userId: superAdmin.id,
      roleId: powerUserRole.id,
    },
  })
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: superAdmin.id,
        roleId: userRole.id,
      },
    },
    update: {},
    create: {
      userId: superAdmin.id,
      roleId: userRole.id,
    },
  })

  console.log('Seeded super admin:', superAdmin)

  // Create UserTenant relationships
  await prisma.userTenant.upsert({
    where: {
      userId_tenantId: {
        userId: adminUser.id,
        tenantId: tenant1.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      tenantId: tenant1.id,
      role: 'admin',
      isCurrentTenant: true,
    },
  })

  // Add adminUser to tenant2 as well (multi-tenant user)
  await prisma.userTenant.upsert({
    where: {
      userId_tenantId: {
        userId: adminUser.id,
        tenantId: tenant2.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      tenantId: tenant2.id,
      role: 'power-user', // Different role in tenant2
      isCurrentTenant: false,
    },
  })

  await prisma.userTenant.upsert({
    where: {
      userId_tenantId: {
        userId: regularUser.id,
        tenantId: tenant1.id,
      },
    },
    update: {},
    create: {
      userId: regularUser.id,
      tenantId: tenant1.id,
      role: 'user',
      isCurrentTenant: true,
    },
  })

  await prisma.userTenant.upsert({
    where: {
      userId_tenantId: {
        userId: managerUser.id,
        tenantId: tenant2.id,
      },
    },
    update: {},
    create: {
      userId: managerUser.id,
      tenantId: tenant2.id,
      role: 'power-user',
      isCurrentTenant: true,
    },
  })

  await prisma.userTenant.upsert({
    where: {
      userId_tenantId: {
        userId: superAdmin.id,
        tenantId: tenant2.id,
      },
    },
    update: {},
    create: {
      userId: superAdmin.id,
      tenantId: tenant2.id,
      role: 'admin',
      isCurrentTenant: true,
    },
  })

  console.log('Seeded user-tenant relationships')

  // Create sample companies for tenant1
  const company1 = await prisma.company.upsert({
    where: { code: 'COMP001-1' },
    update: {},
    create: {
      code: 'COMP001-1',
      name: 'Sample Company 1-1',
      address: '123 Main St, Tokyo',
      phone: '03-1111-5678',
      tenantId: tenant1.id,
    },
  })
  const company1_2 = await prisma.company.upsert({
    where: { code: 'COMP001-2' },
    update: {},
    create: {
      code: 'COMP001-2',
      name: 'Sample Company 1-2',
      address: '123 Main St, Tokyo',
      phone: '03-2222-5678',
      tenantId: tenant1.id,
    },
  })
  const company1_3 = await prisma.company.upsert({
    where: { code: 'COMP001-3' },
    update: {},
    create: {
      code: 'COMP001-3',
      name: 'Sample Company 1-3',
      address: '123 Main St, Tokyo',
      phone: '03-3333-5678',
      tenantId: tenant1.id,
    },
  })
  const company1_4 = await prisma.company.upsert({
    where: { code: 'COMP001-4' },
    update: {},
    create: {
      code: 'COMP001-4',
      name: 'Sample Company 1-4',
      address: '123 Main St, Tokyo',
      phone: '03-4444-5678',
      tenantId: tenant1.id,
    },
  })

  console.log('Seeded company:', company1)

  // Create sample companies for tenant2
  const company2 = await prisma.company.upsert({
    where: { code: 'COMP002' },
    update: {},
    create: {
      code: 'COMP002',
      name: 'Sample Company 2',
      address: '456 Business Ave, Osaka',
      phone: '06-9876-5432',
      tenantId: tenant2.id,
    },
  })

  console.log('Seeded company:', company2)

  // ====================================
  // ビジネスデータのシード
  // ====================================

  // 顧客マスタデータ (tenant1用)
  const customer1_1 = await prisma.customer.upsert({
    where: {
      tenantId_customerName: {
        tenantId: tenant1.id,
        customerName: 'ABC Corporation',
      },
    },
    update: {},
    create: {
      tenantId: tenant1.id,
      customerName: 'ABC Corporation',
      contactEmail: 'contact@abc-corp.example.com',
      contactPhone: '03-1234-5678',
    },
  })

  const customer1_2 = await prisma.customer.upsert({
    where: {
      tenantId_customerName: {
        tenantId: tenant1.id,
        customerName: 'XYZ Industries',
      },
    },
    update: {},
    create: {
      tenantId: tenant1.id,
      customerName: 'XYZ Industries',
      contactEmail: 'info@xyz-ind.example.com',
      contactPhone: '03-9876-5432',
    },
  })

  const customer1_3 = await prisma.customer.upsert({
    where: {
      tenantId_customerName: {
        tenantId: tenant1.id,
        customerName: 'Tech Solutions Ltd',
      },
    },
    update: {},
    create: {
      tenantId: tenant1.id,
      customerName: 'Tech Solutions Ltd',
      contactEmail: 'support@techsol.example.com',
      contactPhone: '03-5555-1111',
    },
  })

  console.log('Seeded customers for tenant1:', {
    customer1_1,
    customer1_2,
    customer1_3,
  })

  // 顧客マスタデータ (tenant2用)
  const customer2_1 = await prisma.customer.upsert({
    where: {
      tenantId_customerName: {
        tenantId: tenant2.id,
        customerName: 'Global Systems Inc',
      },
    },
    update: {},
    create: {
      tenantId: tenant2.id,
      customerName: 'Global Systems Inc',
      contactEmail: 'contact@globalsys.example.com',
      contactPhone: '06-1111-2222',
    },
  })

  const customer2_2 = await prisma.customer.upsert({
    where: {
      tenantId_customerName: {
        tenantId: tenant2.id,
        customerName: 'Enterprise Partners',
      },
    },
    update: {},
    create: {
      tenantId: tenant2.id,
      customerName: 'Enterprise Partners',
      contactEmail: 'info@entpartners.example.com',
      contactPhone: '06-3333-4444',
    },
  })

  console.log('Seeded customers for tenant2:', { customer2_1, customer2_2 })

  // 製品データ (tenant1用)
  const product1_1 = await prisma.product.upsert({
    where: {
      tenantId_productName_vendorName: {
        tenantId: tenant1.id,
        productName: 'Linux Kernel',
        vendorName: 'Linux Foundation',
      },
    },
    update: {},
    create: {
      tenantId: tenant1.id,
      productName: 'Linux Kernel',
      vendorName: 'Linux Foundation',
    },
  })

  const product1_2 = await prisma.product.upsert({
    where: {
      tenantId_productName_vendorName: {
        tenantId: tenant1.id,
        productName: 'Apache HTTP Server',
        vendorName: 'Apache Software Foundation',
      },
    },
    update: {},
    create: {
      tenantId: tenant1.id,
      productName: 'Apache HTTP Server',
      vendorName: 'Apache Software Foundation',
    },
  })

  const product1_3 = await prisma.product.upsert({
    where: {
      tenantId_productName_vendorName: {
        tenantId: tenant1.id,
        productName: 'PostgreSQL',
        vendorName: 'PostgreSQL Global Development Group',
      },
    },
    update: {},
    create: {
      tenantId: tenant1.id,
      productName: 'PostgreSQL',
      vendorName: 'PostgreSQL Global Development Group',
    },
  })

  const product1_4 = await prisma.product.upsert({
    where: {
      tenantId_productName_vendorName: {
        tenantId: tenant1.id,
        productName: 'Node.js',
        vendorName: 'OpenJS Foundation',
      },
    },
    update: {},
    create: {
      tenantId: tenant1.id,
      productName: 'Node.js',
      vendorName: 'OpenJS Foundation',
    },
  })

  console.log('Seeded products for tenant1:', {
    product1_1,
    product1_2,
    product1_3,
    product1_4,
  })

  // 製品データ (tenant2用)
  const product2_1 = await prisma.product.upsert({
    where: {
      tenantId_productName_vendorName: {
        tenantId: tenant2.id,
        productName: 'nginx',
        vendorName: 'F5, Inc.',
      },
    },
    update: {},
    create: {
      tenantId: tenant2.id,
      productName: 'nginx',
      vendorName: 'F5, Inc.',
    },
  })

  const product2_2 = await prisma.product.upsert({
    where: {
      tenantId_productName_vendorName: {
        tenantId: tenant2.id,
        productName: 'MySQL',
        vendorName: 'Oracle Corporation',
      },
    },
    update: {},
    create: {
      tenantId: tenant2.id,
      productName: 'MySQL',
      vendorName: 'Oracle Corporation',
    },
  })

  const product2_3 = await prisma.product.upsert({
    where: {
      tenantId_productName_vendorName: {
        tenantId: tenant2.id,
        productName: 'Redis',
        vendorName: 'Redis Ltd.',
      },
    },
    update: {},
    create: {
      tenantId: tenant2.id,
      productName: 'Redis',
      vendorName: 'Redis Ltd.',
    },
  })

  console.log('Seeded products for tenant2:', {
    product2_1,
    product2_2,
    product2_3,
  })

  // 製品バージョンデータ (tenant1用)
  const version1_1_1 = await prisma.productVersion.upsert({
    where: {
      productId_version_customerId: {
        productId: product1_1.id,
        version: '5.15.0',
        customerId: customer1_1.id,
      },
    },
    update: {},
    create: {
      productId: product1_1.id,
      version: '5.15.0',
      customerId: customer1_1.id,
      memo: '本番環境で使用中。セキュリティパッチ適用予定。',
      eolDate: new Date('2026-10-31'),
      eolStatus: 'active',
      eolSourceUrl: 'https://www.kernel.org/category/releases.html',
      eolLastChecked: new Date(),
    },
  })

  const version1_1_2 = await prisma.productVersion.upsert({
    where: {
      productId_version_customerId: {
        productId: product1_1.id,
        version: '6.1.0',
        customerId: customer1_2.id,
      },
    },
    update: {},
    create: {
      productId: product1_1.id,
      version: '6.1.0',
      customerId: customer1_2.id,
      memo: '最新LTS版。2024年12月に移行予定。',
      eolDate: new Date('2027-12-31'),
      eolStatus: 'active',
      eolSourceUrl: 'https://www.kernel.org/category/releases.html',
      eolLastChecked: new Date(),
    },
  })

  const version1_2_1 = await prisma.productVersion.upsert({
    where: {
      productId_version_customerId: {
        productId: product1_2.id,
        version: '2.4.54',
        customerId: customer1_1.id,
      },
    },
    update: {},
    create: {
      productId: product1_2.id,
      version: '2.4.54',
      customerId: customer1_1.id,
      eolDate: new Date('2025-06-30'),
      eolStatus: 'active',
      eolSourceUrl: 'https://httpd.apache.org/security/vulnerabilities_24.html',
      eolLastChecked: new Date(),
    },
  })

  const version1_3_1 = await prisma.productVersion.upsert({
    where: {
      productId_version_customerId: {
        productId: product1_3.id,
        version: '14.5',
        customerId: customer1_3.id,
      },
    },
    update: {},
    create: {
      productId: product1_3.id,
      version: '14.5',
      customerId: customer1_3.id,
      memo: '開発環境で使用中。バージョン15へのアップグレード検討中。',
      eolDate: new Date('2024-11-09'),
      eolStatus: 'eol',
      eolSourceUrl: 'https://www.postgresql.org/support/versioning/',
      eolLastChecked: new Date(),
    },
  })

  const version1_4_1 = await prisma.productVersion.upsert({
    where: {
      productId_version_customerId: {
        productId: product1_4.id,
        version: '18.17.0',
        customerId: customer1_2.id,
      },
    },
    update: {},
    create: {
      productId: product1_4.id,
      version: '18.17.0',
      customerId: customer1_2.id,
      eolDate: new Date('2025-04-30'),
      eolStatus: 'active',
      eolSourceUrl: 'https://github.com/nodejs/Release',
      eolLastChecked: new Date(),
    },
  })

  console.log('Seeded product versions for tenant1:', {
    version1_1_1,
    version1_1_2,
    version1_2_1,
    version1_3_1,
    version1_4_1,
  })

  // 製品バージョンデータ (tenant2用)
  const version2_1_1 = await prisma.productVersion.upsert({
    where: {
      productId_version_customerId: {
        productId: product2_1.id,
        version: '1.24.0',
        customerId: customer2_1.id,
      },
    },
    update: {},
    create: {
      productId: product2_1.id,
      version: '1.24.0',
      customerId: customer2_1.id,
      memo: 'リバースプロキシとして本番運用中。安定稼働している。',
      eolDate: new Date('2025-04-30'),
      eolStatus: 'active',
      eolSourceUrl: 'https://nginx.org/en/CHANGES',
      eolLastChecked: new Date(),
    },
  })

  const version2_2_1 = await prisma.productVersion.upsert({
    where: {
      productId_version_customerId: {
        productId: product2_2.id,
        version: '8.0.34',
        customerId: customer2_2.id,
      },
    },
    update: {},
    create: {
      productId: product2_2.id,
      version: '8.0.34',
      customerId: customer2_2.id,
      memo: 'メインDBとして使用。定期バックアップ実施中。',
      eolDate: new Date('2026-04-30'),
      eolStatus: 'active',
      eolSourceUrl: 'https://endoflife.date/mysql',
      eolLastChecked: new Date(),
    },
  })

  const version2_3_1 = await prisma.productVersion.upsert({
    where: {
      productId_version_customerId: {
        productId: product2_3.id,
        version: '7.0.12',
        customerId: customer2_1.id,
      },
    },
    update: {},
    create: {
      productId: product2_3.id,
      version: '7.0.12',
      customerId: customer2_1.id,
      eolDate: new Date('2024-12-31'),
      eolStatus: 'deprecated',
      eolSourceUrl: 'https://endoflife.date/redis',
      eolLastChecked: new Date(),
    },
  })

  console.log('Seeded product versions for tenant2:', {
    version2_1_1,
    version2_2_1,
    version2_3_1,
  })

  // 追加の製品バージョンデータ (より多くのバリエーション)

  // tenant1: 追加のLinux Kernelバージョン (EOL済み)
  const version1_1_3 = await prisma.productVersion.upsert({
    where: {
      productId_version_customerId: {
        productId: product1_1.id,
        version: '4.19.0',
        customerId: customer1_3.id,
      },
    },
    update: {},
    create: {
      productId: product1_1.id,
      version: '4.19.0',
      customerId: customer1_3.id,
      memo: '旧システムで使用中。EOL済みのため早急にアップグレード必要。',
      eolDate: new Date('2024-12-31'),
      eolStatus: 'eol',
      eolSourceUrl: 'https://www.kernel.org/category/releases.html',
      eolLastChecked: new Date(),
    },
  })

  // tenant1: Apache 2.2 (EOL済み、セキュリティリスク高)
  const version1_2_2 = await prisma.productVersion.upsert({
    where: {
      productId_version_customerId: {
        productId: product1_2.id,
        version: '2.2.34',
        customerId: customer1_2.id,
      },
    },
    update: {},
    create: {
      productId: product1_2.id,
      version: '2.2.34',
      customerId: customer1_2.id,
      memo: 'レガシーシステム。2017年にEOL。緊急でアップグレード必要。',
      eolDate: new Date('2017-07-20'),
      eolStatus: 'eol',
      eolSourceUrl: 'https://httpd.apache.org/security/vulnerabilities_22.html',
      eolLastChecked: new Date(),
    },
  })

  // tenant1: PostgreSQL 15.3 (Active)
  const version1_3_2 = await prisma.productVersion.upsert({
    where: {
      productId_version_customerId: {
        productId: product1_3.id,
        version: '15.3',
        customerId: customer1_1.id,
      },
    },
    update: {},
    create: {
      productId: product1_3.id,
      version: '15.3',
      customerId: customer1_1.id,
      memo: '本番環境。2027年までサポート予定。',
      eolDate: new Date('2027-11-11'),
      eolStatus: 'active',
      eolSourceUrl: 'https://www.postgresql.org/support/versioning/',
      eolLastChecked: new Date(),
    },
  })

  // tenant1: PostgreSQL 12.15 (近日EOL)
  const version1_3_3 = await prisma.productVersion.upsert({
    where: {
      productId_version_customerId: {
        productId: product1_3.id,
        version: '12.15',
        customerId: customer1_2.id,
      },
    },
    update: {},
    create: {
      productId: product1_3.id,
      version: '12.15',
      customerId: customer1_2.id,
      memo: 'テスト環境。2024年11月にEOL予定。アップグレード計画中。',
      eolDate: new Date('2024-11-14'),
      eolStatus: 'deprecated',
      eolSourceUrl: 'https://www.postgresql.org/support/versioning/',
      eolLastChecked: new Date(),
    },
  })

  // tenant1: Node.js 16.20.2 (EOL済み)
  const version1_4_2 = await prisma.productVersion.upsert({
    where: {
      productId_version_customerId: {
        productId: product1_4.id,
        version: '16.20.2',
        customerId: customer1_1.id,
      },
    },
    update: {},
    create: {
      productId: product1_4.id,
      version: '16.20.2',
      customerId: customer1_1.id,
      memo: 'マイクロサービスで使用。2023年9月にEOL。',
      eolDate: new Date('2023-09-11'),
      eolStatus: 'eol',
      eolSourceUrl: 'https://github.com/nodejs/Release',
      eolLastChecked: new Date(),
    },
  })

  // tenant1: Node.js 20.9.0 (Active LTS)
  const version1_4_3 = await prisma.productVersion.upsert({
    where: {
      productId_version_customerId: {
        productId: product1_4.id,
        version: '20.9.0',
        customerId: customer1_3.id,
      },
    },
    update: {},
    create: {
      productId: product1_4.id,
      version: '20.9.0',
      customerId: customer1_3.id,
      memo: '新規プロジェクト用。LTS版で長期サポート。',
      eolDate: new Date('2026-04-30'),
      eolStatus: 'active',
      eolSourceUrl: 'https://github.com/nodejs/Release',
      eolLastChecked: new Date(),
    },
  })

  // tenant2: nginx 1.18.0 (EOL済み)
  const version2_1_2 = await prisma.productVersion.upsert({
    where: {
      productId_version_customerId: {
        productId: product2_1.id,
        version: '1.18.0',
        customerId: customer2_2.id,
      },
    },
    update: {},
    create: {
      productId: product2_1.id,
      version: '1.18.0',
      customerId: customer2_2.id,
      memo: '古いリバースプロキシ設定。2023年にEOL。',
      eolDate: new Date('2023-06-30'),
      eolStatus: 'eol',
      eolSourceUrl: 'https://nginx.org/en/CHANGES',
      eolLastChecked: new Date(),
    },
  })

  // tenant2: MySQL 5.7.44 (EOL済み)
  const version2_2_2 = await prisma.productVersion.upsert({
    where: {
      productId_version_customerId: {
        productId: product2_2.id,
        version: '5.7.44',
        customerId: customer2_1.id,
      },
    },
    update: {},
    create: {
      productId: product2_2.id,
      version: '5.7.44',
      customerId: customer2_1.id,
      memo: 'レガシーアプリケーション用DB。2023年10月にEOL。移行計画必要。',
      eolDate: new Date('2023-10-31'),
      eolStatus: 'eol',
      eolSourceUrl: 'https://endoflife.date/mysql',
      eolLastChecked: new Date(),
    },
  })

  // tenant2: MySQL 8.4.0 (Innovation)
  const version2_2_3 = await prisma.productVersion.upsert({
    where: {
      productId_version_customerId: {
        productId: product2_2.id,
        version: '8.4.0',
        customerId: customer2_1.id,
      },
    },
    update: {},
    create: {
      productId: product2_2.id,
      version: '8.4.0',
      customerId: customer2_1.id,
      memo: '最新イノベーションリリース。新機能テスト中。',
      eolDate: new Date('2026-07-31'),
      eolStatus: 'active',
      eolSourceUrl: 'https://endoflife.date/mysql',
      eolLastChecked: new Date(),
    },
  })

  // tenant2: Redis 6.2.14 (EOL間近)
  const version2_3_2 = await prisma.productVersion.upsert({
    where: {
      productId_version_customerId: {
        productId: product2_3.id,
        version: '6.2.14',
        customerId: customer2_2.id,
      },
    },
    update: {},
    create: {
      productId: product2_3.id,
      version: '6.2.14',
      customerId: customer2_2.id,
      memo: 'キャッシュサーバー。2024年12月にEOL予定。',
      eolDate: new Date('2024-12-31'),
      eolStatus: 'deprecated',
      eolSourceUrl: 'https://endoflife.date/redis',
      eolLastChecked: new Date(),
    },
  })

  // tenant2: Redis 7.2.4 (Active)
  const version2_3_3 = await prisma.productVersion.upsert({
    where: {
      productId_version_customerId: {
        productId: product2_3.id,
        version: '7.2.4',
        customerId: customer2_2.id,
      },
    },
    update: {},
    create: {
      productId: product2_3.id,
      version: '7.2.4',
      customerId: customer2_2.id,
      memo: '新規セットアップ。長期サポート版。',
      eolDate: new Date('2026-12-31'),
      eolStatus: 'active',
      eolSourceUrl: 'https://endoflife.date/redis',
      eolLastChecked: new Date(),
    },
  })

  console.log('Seeded additional product versions with varied EOL statuses:', {
    tenant1_additional: {
      version1_1_3,
      version1_2_2,
      version1_3_2,
      version1_3_3,
      version1_4_2,
      version1_4_3,
    },
    tenant2_additional: {
      version2_1_2,
      version2_2_2,
      version2_2_3,
      version2_3_2,
      version2_3_3,
    },
  })

  // EOL情報が未確定のバージョン (eol_dateがnull)

  // tenant1: Apache 2.4.58 (最新版、EOL未定)
  const version1_2_3 = await prisma.productVersion.upsert({
    where: {
      productId_version_customerId: {
        productId: product1_2.id,
        version: '2.4.58',
        customerId: customer1_3.id,
      },
    },
    update: {},
    create: {
      productId: product1_2.id,
      version: '2.4.58',
      customerId: customer1_3.id,
      memo: '最新版。EOL日付は未定。',
      eolDate: null,
      eolStatus: 'active',
      eolSourceUrl: 'https://httpd.apache.org/security/vulnerabilities_24.html',
      eolLastChecked: new Date(),
    },
  })

  // tenant1: PostgreSQL 16.1 (最新版、EOL未定)
  const version1_3_4 = await prisma.productVersion.upsert({
    where: {
      productId_version_customerId: {
        productId: product1_3.id,
        version: '16.1',
        customerId: customer1_3.id,
      },
    },
    update: {},
    create: {
      productId: product1_3.id,
      version: '16.1',
      customerId: customer1_3.id,
      memo: '最新メジャーバージョン。長期サポート予定だがEOL日未公表。',
      eolDate: null,
      eolStatus: 'active',
      eolSourceUrl: 'https://www.postgresql.org/support/versioning/',
      eolLastChecked: new Date(),
    },
  })

  // tenant1: Node.js 21.5.0 (Current版、EOL情報なし)
  const version1_4_4 = await prisma.productVersion.upsert({
    where: {
      productId_version_customerId: {
        productId: product1_4.id,
        version: '21.5.0',
        customerId: customer1_1.id,
      },
    },
    update: {},
    create: {
      productId: product1_4.id,
      version: '21.5.0',
      customerId: customer1_1.id,
      memo: 'Current版（非LTS）。実験的機能テスト用。',
      eolDate: null,
      eolStatus: 'active',
      eolSourceUrl: 'https://github.com/nodejs/Release',
      eolLastChecked: new Date(),
    },
  })

  // tenant1: Linux Kernel 6.6.0 (EOL情報取得失敗)
  const version1_1_4 = await prisma.productVersion.upsert({
    where: {
      productId_version_customerId: {
        productId: product1_1.id,
        version: '6.6.0',
        customerId: customer1_2.id,
      },
    },
    update: {},
    create: {
      productId: product1_1.id,
      version: '6.6.0',
      customerId: customer1_2.id,
      memo: '新規導入予定。EOL情報の取得に失敗。',
      eolDate: null,
      eolStatus: 'unknown',
      eolSourceUrl: null,
      eolLastChecked: new Date(),
    },
  })

  // tenant2: nginx 1.25.3 (Mainline、EOL未定)
  const version2_1_3 = await prisma.productVersion.upsert({
    where: {
      productId_version_customerId: {
        productId: product2_1.id,
        version: '1.25.3',
        customerId: customer2_1.id,
      },
    },
    update: {},
    create: {
      productId: product2_1.id,
      version: '1.25.3',
      customerId: customer2_1.id,
      memo: 'Mainlineブランチ。最新機能を使用中。',
      eolDate: null,
      eolStatus: 'active',
      eolSourceUrl: 'https://nginx.org/en/CHANGES',
      eolLastChecked: new Date(),
    },
  })

  // tenant2: MySQL 9.0.0 (Innovation、EOL情報未確定)
  const version2_2_4 = await prisma.productVersion.upsert({
    where: {
      productId_version_customerId: {
        productId: product2_2.id,
        version: '9.0.0',
        customerId: customer2_2.id,
      },
    },
    update: {},
    create: {
      productId: product2_2.id,
      version: '9.0.0',
      customerId: customer2_2.id,
      memo: '最新のイノベーションリリース。EOL情報待ち。',
      eolDate: null,
      eolStatus: 'unknown',
      eolSourceUrl: 'https://endoflife.date/mysql',
      eolLastChecked: new Date(),
    },
  })

  // tenant2: Redis 8.0-rc1 (RC版、EOL情報なし)
  const version2_3_4 = await prisma.productVersion.upsert({
    where: {
      productId_version_customerId: {
        productId: product2_3.id,
        version: '8.0-rc1',
        customerId: customer2_1.id,
      },
    },
    update: {},
    create: {
      productId: product2_3.id,
      version: '8.0-rc1',
      customerId: customer2_1.id,
      memo: 'リリース候補版。テスト環境で評価中。',
      eolDate: null,
      eolStatus: null,
      eolSourceUrl: null,
      eolLastChecked: null,
    },
  })

  console.log('Seeded product versions with unknown/null EOL dates:', {
    tenant1_unknown: {
      version1_2_3,
      version1_3_4,
      version1_4_4,
      version1_1_4,
    },
    tenant2_unknown: {
      version2_1_3,
      version2_2_4,
      version2_3_4,
    },
  })

  // スキャン履歴データ (tenant1用)
  const scan1_1 = await prisma.scanHistory.create({
    data: {
      tenantId: tenant1.id,
      productVersionId: version1_1_1.id,
      scanDate: new Date('2024-10-15T10:30:00Z'),
      status: 'completed',
      vulnerabilitiesFound: 3,
      eolDate: new Date('2026-12-31'),
      sourceData: {
        url: 'https://endoflife.date/api/linux/5.15.json',
        retrievedAt: '2024-10-15T10:30:00Z',
        apiResponse: {
          cycle: '5.15',
          eol: '2026-12-31',
          support: true,
          lts: true,
        },
      },
    },
  })

  const scan1_2 = await prisma.scanHistory.create({
    data: {
      tenantId: tenant1.id,
      productVersionId: version1_1_2.id,
      scanDate: new Date('2024-10-20T14:45:00Z'),
      status: 'completed',
      vulnerabilitiesFound: 1,
      eolDate: new Date('2028-06-30'),
      sourceData: {
        url: 'https://www.kernel.org/releases.html',
        retrievedAt: '2024-10-20T14:45:00Z',
        note: 'Kernel.org official release page',
      },
    },
  })

  const scan1_3 = await prisma.scanHistory.create({
    data: {
      tenantId: tenant1.id,
      productVersionId: version1_2_1.id,
      scanDate: new Date('2024-10-22T09:15:00Z'),
      status: 'completed',
      vulnerabilitiesFound: 5,
      eolDate: new Date('2025-03-31'),
      sourceData: {
        url: 'https://endoflife.date/api/apache/2.4.json',
        retrievedAt: '2024-10-22T09:15:00Z',
        apiResponse: {
          cycle: '2.4',
          eol: '2025-03-31',
        },
      },
    },
  })

  const scan1_4 = await prisma.scanHistory.create({
    data: {
      tenantId: tenant1.id,
      productVersionId: version1_3_1.id,
      scanDate: new Date('2024-10-25T16:20:00Z'),
      status: 'in_progress',
      vulnerabilitiesFound: 0,
    },
  })

  const scan1_5 = await prisma.scanHistory.create({
    data: {
      tenantId: tenant1.id,
      productVersionId: version1_4_1.id,
      scanDate: new Date('2024-10-28T11:00:00Z'),
      status: 'completed',
      vulnerabilitiesFound: 2,
      eolDate: new Date('2025-10-31'),
      sourceData: {
        url: 'https://endoflife.date/api/nodejs/18.json',
        retrievedAt: '2024-10-28T11:00:00Z',
        apiResponse: {
          cycle: '18',
          eol: '2025-10-31',
          lts: '2023-10-24',
        },
      },
    },
  })

  console.log('Seeded scan history for tenant1:', {
    scan1_1,
    scan1_2,
    scan1_3,
    scan1_4,
    scan1_5,
  })

  // スキャン履歴データ (tenant2用)
  const scan2_1 = await prisma.scanHistory.create({
    data: {
      tenantId: tenant2.id,
      productVersionId: version2_1_1.id,
      scanDate: new Date('2024-10-18T13:30:00Z'),
      status: 'completed',
      vulnerabilitiesFound: 2,
      eolDate: new Date('2027-04-30'),
      sourceData: {
        url: 'https://endoflife.date/api/nginx/1.24.json',
        retrievedAt: '2024-10-18T13:30:00Z',
        apiResponse: {
          cycle: '1.24',
          eol: '2027-04-30',
        },
      },
    },
  })

  const scan2_2 = await prisma.scanHistory.create({
    data: {
      tenantId: tenant2.id,
      productVersionId: version2_2_1.id,
      scanDate: new Date('2024-10-21T10:00:00Z'),
      status: 'completed',
      vulnerabilitiesFound: 4,
      eolDate: new Date('2026-07-31'),
      sourceData: {
        url: 'https://endoflife.date/api/mysql/8.0.json',
        retrievedAt: '2024-10-21T10:00:00Z',
        apiResponse: {
          cycle: '8.0',
          eol: '2026-07-31',
          lts: true,
        },
      },
    },
  })

  const scan2_3 = await prisma.scanHistory.create({
    data: {
      tenantId: tenant2.id,
      productVersionId: version2_3_1.id,
      scanDate: new Date('2024-10-24T15:45:00Z'),
      status: 'failed',
      vulnerabilitiesFound: 0,
    },
  })

  console.log('Seeded scan history for tenant2:', {
    scan2_1,
    scan2_2,
    scan2_3,
  })

  // 脆弱性データ (tenant1用)
  await prisma.vulnerability.create({
    data: {
      tenantId: tenant1.id,
      scanId: scan1_1.id,
      cveId: 'CVE-2023-12345',
      severity: 'high',
      description:
        'A critical vulnerability allowing remote code execution in Linux kernel versions prior to 5.16.0',
      publishedDate: new Date('2023-08-15'),
      cvssScore: 8.5,
      sourceData: {
        url: 'https://nvd.nist.gov/vuln/detail/CVE-2023-12345',
        retrievedAt: '2024-10-15T10:30:00Z',
        source: 'NVD',
        apiResponse: {
          id: 'CVE-2023-12345',
          sourceIdentifier: 'cve@mitre.org',
          published: '2023-08-15T12:00:00.000',
          lastModified: '2023-08-20T18:30:00.000',
          vulnStatus: 'Analyzed',
        },
      },
    },
  })

  await prisma.vulnerability.create({
    data: {
      tenantId: tenant1.id,
      scanId: scan1_1.id,
      cveId: 'CVE-2023-23456',
      severity: 'medium',
      description: 'Memory leak issue affecting system performance',
      publishedDate: new Date('2023-09-10'),
      cvssScore: 5.3,
      sourceData: {
        url: 'https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2023-23456',
        retrievedAt: '2024-10-15T10:31:00Z',
        source: 'MITRE CVE',
      },
    },
  })

  await prisma.vulnerability.create({
    data: {
      tenantId: tenant1.id,
      scanId: scan1_1.id,
      cveId: 'CVE-2023-34567',
      severity: 'low',
      description: 'Minor information disclosure vulnerability',
      publishedDate: new Date('2023-10-05'),
      cvssScore: 3.1,
    },
  })

  await prisma.vulnerability.create({
    data: {
      tenantId: tenant1.id,
      scanId: scan1_2.id,
      cveId: 'CVE-2024-11111',
      severity: 'critical',
      description:
        'Zero-day vulnerability allowing privilege escalation in kernel 6.1.0',
      publishedDate: new Date('2024-01-20'),
      cvssScore: 9.8,
      sourceData: {
        url: 'https://nvd.nist.gov/vuln/detail/CVE-2024-11111',
        retrievedAt: '2024-10-20T14:45:00Z',
        source: 'NVD',
        apiResponse: {
          id: 'CVE-2024-11111',
          cvssV3: {
            baseScore: 9.8,
            baseSeverity: 'CRITICAL',
            vectorString: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
          },
        },
      },
    },
  })

  await prisma.vulnerability.create({
    data: {
      tenantId: tenant1.id,
      scanId: scan1_3.id,
      cveId: 'CVE-2023-45678',
      severity: 'critical',
      description:
        'Remote code execution vulnerability in Apache HTTP Server',
      publishedDate: new Date('2023-11-01'),
      cvssScore: 9.4,
    },
  })

  await prisma.vulnerability.create({
    data: {
      tenantId: tenant1.id,
      scanId: scan1_3.id,
      cveId: 'CVE-2023-56789',
      severity: 'high',
      description: 'Directory traversal vulnerability in Apache',
      publishedDate: new Date('2023-11-15'),
      cvssScore: 7.8,
    },
  })

  await prisma.vulnerability.create({
    data: {
      tenantId: tenant1.id,
      scanId: scan1_3.id,
      cveId: 'CVE-2023-67890',
      severity: 'high',
      description: 'Authentication bypass in certain configurations',
      publishedDate: new Date('2023-12-01'),
      cvssScore: 8.1,
    },
  })

  await prisma.vulnerability.create({
    data: {
      tenantId: tenant1.id,
      scanId: scan1_3.id,
      cveId: 'CVE-2024-00001',
      severity: 'medium',
      description: 'Cross-site scripting (XSS) vulnerability',
      publishedDate: new Date('2024-01-10'),
      cvssScore: 6.5,
    },
  })

  await prisma.vulnerability.create({
    data: {
      tenantId: tenant1.id,
      scanId: scan1_3.id,
      cveId: 'CVE-2024-00002',
      severity: 'low',
      description: 'Minor denial of service possibility',
      publishedDate: new Date('2024-02-05'),
      cvssScore: 4.2,
    },
  })

  await prisma.vulnerability.create({
    data: {
      tenantId: tenant1.id,
      scanId: scan1_5.id,
      cveId: 'CVE-2024-22222',
      severity: 'high',
      description: 'Prototype pollution vulnerability in Node.js',
      publishedDate: new Date('2024-03-15'),
      cvssScore: 7.5,
    },
  })

  await prisma.vulnerability.create({
    data: {
      tenantId: tenant1.id,
      scanId: scan1_5.id,
      cveId: 'CVE-2024-33333',
      severity: 'medium',
      description: 'HTTP request smuggling vulnerability',
      publishedDate: new Date('2024-04-20'),
      cvssScore: 6.1,
    },
  })

  console.log('Seeded vulnerabilities for tenant1')

  // 脆弱性データ (tenant2用)
  await prisma.vulnerability.create({
    data: {
      tenantId: tenant2.id,
      scanId: scan2_1.id,
      cveId: 'CVE-2024-44444',
      severity: 'high',
      description: 'Buffer overflow vulnerability in nginx',
      publishedDate: new Date('2024-05-10'),
      cvssScore: 8.2,
    },
  })

  await prisma.vulnerability.create({
    data: {
      tenantId: tenant2.id,
      scanId: scan2_1.id,
      cveId: 'CVE-2024-55555',
      severity: 'medium',
      description: 'Integer overflow in request parsing',
      publishedDate: new Date('2024-06-01'),
      cvssScore: 5.9,
    },
  })

  await prisma.vulnerability.create({
    data: {
      tenantId: tenant2.id,
      scanId: scan2_2.id,
      cveId: 'CVE-2024-66666',
      severity: 'critical',
      description: 'SQL injection vulnerability in MySQL',
      publishedDate: new Date('2024-07-15'),
      cvssScore: 9.9,
    },
  })

  await prisma.vulnerability.create({
    data: {
      tenantId: tenant2.id,
      scanId: scan2_2.id,
      cveId: 'CVE-2024-77777',
      severity: 'high',
      description: 'Authentication bypass in MySQL',
      publishedDate: new Date('2024-08-01'),
      cvssScore: 8.8,
    },
  })

  await prisma.vulnerability.create({
    data: {
      tenantId: tenant2.id,
      scanId: scan2_2.id,
      cveId: 'CVE-2024-88888',
      severity: 'medium',
      description: 'Information disclosure vulnerability',
      publishedDate: new Date('2024-08-20'),
      cvssScore: 6.3,
    },
  })

  await prisma.vulnerability.create({
    data: {
      tenantId: tenant2.id,
      scanId: scan2_2.id,
      cveId: 'CVE-2024-99999',
      severity: 'low',
      description: 'Minor logging vulnerability',
      publishedDate: new Date('2024-09-05'),
      cvssScore: 3.7,
    },
  })

  console.log('Seeded vulnerabilities for tenant2')

  // スキャンスケジュールデータ (tenant1用)
  const schedule1_1 = await prisma.scanSchedule.create({
    data: {
      tenantId: tenant1.id,
      name: 'Daily Security Scan',
      description: 'Daily automated security scan for all products',
      isActive: true,
      scheduleType: 'daily',
      timeOfDay: '02:00',
      targetType: 'all',
      nextRunAt: new Date('2024-11-11T02:00:00Z'),
      lastRunAt: new Date('2024-11-10T02:00:00Z'),
    },
  })

  const schedule1_2 = await prisma.scanSchedule.create({
    data: {
      tenantId: tenant1.id,
      name: 'Weekly Full Scan',
      description: 'Comprehensive weekly scan on weekends',
      isActive: true,
      scheduleType: 'weekly',
      dayOfWeek: '[0,6]', // Sunday and Saturday
      timeOfDay: '03:00',
      targetType: 'all',
      nextRunAt: new Date('2024-11-16T03:00:00Z'),
      lastRunAt: new Date('2024-11-09T03:00:00Z'),
    },
  })

  const schedule1_3 = await prisma.scanSchedule.create({
    data: {
      tenantId: tenant1.id,
      name: 'Monthly Critical Scan',
      description: 'Monthly scan on the 1st and 15th',
      isActive: true,
      scheduleType: 'monthly',
      dayOfMonth: '[1,15]',
      timeOfDay: '01:00',
      targetType: 'products',
      targetProductIds: `["${product1_1.id}","${product1_2.id}"]`,
      nextRunAt: new Date('2024-11-15T01:00:00Z'),
      lastRunAt: new Date('2024-11-01T01:00:00Z'),
    },
  })

  const schedule1_4 = await prisma.scanSchedule.create({
    data: {
      tenantId: tenant1.id,
      name: 'One-time Emergency Scan',
      description: 'Emergency scan for critical customers',
      isActive: false,
      scheduleType: 'once',
      scheduledAt: new Date('2024-11-12T10:00:00Z'),
      timeOfDay: '10:00',
      targetType: 'customers',
      targetCustomerIds: `["${customer1_1.id}"]`,
    },
  })

  console.log('Seeded scan schedules for tenant1:', {
    schedule1_1,
    schedule1_2,
    schedule1_3,
    schedule1_4,
  })

  // スキャンスケジュールデータ (tenant2用)
  const schedule2_1 = await prisma.scanSchedule.create({
    data: {
      tenantId: tenant2.id,
      name: 'Enterprise Daily Scan',
      description: 'Daily scan for enterprise customers',
      isActive: true,
      scheduleType: 'daily',
      timeOfDay: '04:00',
      targetType: 'customers',
      targetCustomerIds: `["${customer2_1.id}","${customer2_2.id}"]`,
      nextRunAt: new Date('2024-11-11T04:00:00Z'),
      lastRunAt: new Date('2024-11-10T04:00:00Z'),
    },
  })

  const schedule2_2 = await prisma.scanSchedule.create({
    data: {
      tenantId: tenant2.id,
      name: 'Bi-weekly Product Scan',
      description: 'Scan specific products every two weeks',
      isActive: true,
      scheduleType: 'weekly',
      dayOfWeek: '[1,4]', // Monday and Thursday
      timeOfDay: '22:00',
      targetType: 'products',
      targetProductIds: `["${product2_1.id}","${product2_2.id}","${product2_3.id}"]`,
      nextRunAt: new Date('2024-11-11T22:00:00Z'),
      lastRunAt: new Date('2024-11-07T22:00:00Z'),
    },
  })

  console.log('Seeded scan schedules for tenant2:', {
    schedule2_1,
    schedule2_2,
  })

  console.log('\n✅ All seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
