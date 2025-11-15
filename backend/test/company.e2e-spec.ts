/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { cleanDatabase, seedTestData, createTestingApp, closeTestingApp, TestData } from './test-helpers';
import { JwtService } from '@nestjs/jwt';

describe('CompanyController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let testData: TestData;
  let adminToken: string;

  beforeAll(async () => {
    // Create app
    app = await createTestingApp({
      imports: [AppModule]
    });

    jwtService = app.get(JwtService);

    // Clean and seed database
    await cleanDatabase();
    testData = await seedTestData();

    // Generate tokens for testing
    adminToken = jwtService.sign({
      sub: testData.users.admin.id,
      id: testData.users.admin.id,
      email: testData.users.admin.email,
      name: testData.users.admin.name,
      roles: ['admin'],
      tenantId: testData.tenant.id
    });
  });

  afterAll(async () => {
    await closeTestingApp(app);
  });

  describe('GET /companies', () => {
    it('should return all companies for authenticated user', () => {
      return request(app.getHttpServer())
        .get('/companies')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('code');
          expect(res.body[0]).toHaveProperty('name');
        });
    });

    it('should return 401 when not authenticated', () => {
      return request(app.getHttpServer()).get('/companies').expect(401);
    });

    it('should filter companies by search term', () => {
      return request(app.getHttpServer())
        .get('/companies?search=Test')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0].name).toContain('Test');
        });
    });
  });

  describe('GET /companies/:id', () => {
    it('should return a company by ID', () => {
      return request(app.getHttpServer())
        .get(`/companies/${testData.company.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', testData.company.id);
          expect(res.body).toHaveProperty('code', testData.company.code);
          expect(res.body).toHaveProperty('name', testData.company.name);
        });
    });

    it('should return 404 for non-existent company', () => {
      return request(app.getHttpServer())
        .get('/companies/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 401 when not authenticated', () => {
      return request(app.getHttpServer()).get(`/companies/${testData.company.id}`).expect(401);
    });
  });

  describe('POST /companies', () => {
    it('should create a new company', () => {
      const newCompany = {
        code: 'NEW001',
        name: 'New Test Company',
        address: '456 New St',
        phone: '098-765-4321'
      };

      return request(app.getHttpServer())
        .post('/companies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newCompany)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('code', newCompany.code);
          expect(res.body).toHaveProperty('name', newCompany.name);
          expect(res.body).toHaveProperty('address', newCompany.address);
        });
    });

    it('should return 409 when company code already exists', () => {
      const duplicateCompany = {
        code: testData.company.code,
        name: 'Duplicate Company'
      };

      return request(app.getHttpServer())
        .post('/companies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(duplicateCompany)
        .expect(409);
    });

    it('should return 400 for invalid data', () => {
      const invalidCompany = {
        name: 'Invalid Company'
        // Missing required 'code' field
      };

      return request(app.getHttpServer())
        .post('/companies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidCompany)
        .expect(400);
    });

    it('should return 401 when not authenticated', () => {
      const newCompany = {
        code: 'AUTH001',
        name: 'Auth Test Company'
      };

      return request(app.getHttpServer()).post('/companies').send(newCompany).expect(401);
    });
  });

  describe('PUT /companies/:id', () => {
    it('should update an existing company', () => {
      const updateData = {
        name: 'Updated Test Company',
        address: '789 Updated St'
      };

      return request(app.getHttpServer())
        .put(`/companies/${testData.company.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', testData.company.id);
          expect(res.body).toHaveProperty('name', updateData.name);
          expect(res.body).toHaveProperty('address', updateData.address);
        });
    });

    it('should return 404 for non-existent company', () => {
      const updateData = {
        name: 'Updated Company'
      };

      return request(app.getHttpServer())
        .put('/companies/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);
    });

    it('should return 401 when not authenticated', () => {
      const updateData = {
        name: 'Updated Company'
      };

      return request(app.getHttpServer()).put(`/companies/${testData.company.id}`).send(updateData).expect(401);
    });
  });

  describe('DELETE /companies/:id', () => {
    it('should delete an existing company', async () => {
      // Create a company to delete
      const companyToDelete = await request(app.getHttpServer())
        .post('/companies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'DEL001',
          name: 'Company to Delete'
        })
        .expect(201);

      return request(app.getHttpServer())
        .delete(`/companies/${companyToDelete.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('count', 1);
        });
    });

    it('should return 404 for non-existent company', () => {
      return request(app.getHttpServer())
        .delete('/companies/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 401 when not authenticated', () => {
      return request(app.getHttpServer()).delete(`/companies/${testData.company.id}`).expect(401);
    });
  });
});
