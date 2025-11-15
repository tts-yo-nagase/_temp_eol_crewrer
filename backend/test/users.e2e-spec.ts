/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { cleanDatabase, seedTestData, createTestingApp, closeTestingApp, TestData } from './test-helpers';
import { JwtService } from '@nestjs/jwt';

describe('UsersController (e2e) - /users/me endpoints', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let testData: TestData;
  let adminToken: string;
  let userToken: string;

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

    userToken = jwtService.sign({
      sub: testData.users.regular.id,
      id: testData.users.regular.id,
      email: testData.users.regular.email,
      name: testData.users.regular.name,
      roles: ['user'],
      tenantId: testData.tenant.id
    });
  });

  afterAll(async () => {
    await closeTestingApp(app);
  });

  describe('GET /users/me', () => {
    it('should return current user profile for authenticated user', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', testData.users.regular.id);
          expect(res.body).toHaveProperty('email', testData.users.regular.email);
          expect(res.body).toHaveProperty('name', testData.users.regular.name);
          expect(res.body).toHaveProperty('roles');
          expect(res.body).toHaveProperty('tenantId', testData.tenant.id);
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should return current user profile for admin', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', testData.users.admin.id);
          expect(res.body).toHaveProperty('email', testData.users.admin.email);
          expect(res.body).toHaveProperty('name', testData.users.admin.name);
          expect(res.body).toHaveProperty('roles');
          expect(Array.isArray(res.body.roles)).toBe(true);
        });
    });

    it('should return 401 when not authenticated', () => {
      return request(app.getHttpServer()).get('/users/me').expect(401);
    });

    it('should return 401 with invalid token', () => {
      return request(app.getHttpServer()).get('/users/me').set('Authorization', 'Bearer invalid-token').expect(401);
    });
  });

  describe('PATCH /users/me', () => {
    it('should update current user profile (name)', () => {
      const updateData = {
        name: 'Updated User Name'
      };

      return request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', testData.users.regular.id);
          expect(res.body).toHaveProperty('name', updateData.name);
          expect(res.body).toHaveProperty('email', testData.users.regular.email);
        });
    });

    it('should update admin profile', () => {
      const updateData = {
        name: 'Updated Admin Name'
      };

      return request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', testData.users.admin.id);
          expect(res.body).toHaveProperty('name', updateData.name);
        });
    });

    it('should allow empty update (no changes)', () => {
      const updateData = {};

      return request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', testData.users.regular.id);
        });
    });

    it('should return 401 when not authenticated', () => {
      const updateData = {
        name: 'New Name'
      };

      return request(app.getHttpServer()).patch('/users/me').send(updateData).expect(401);
    });

    it('should return 401 with invalid token', () => {
      const updateData = {
        name: 'New Name'
      };

      return request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .send(updateData)
        .expect(401);
    });

    it('should verify profile was updated by fetching again', async () => {
      const newName = 'Final Updated Name';

      // Update profile
      await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: newName })
        .expect(200);

      // Verify by fetching profile
      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('name', newName);
        });
    });
  });

  describe('Profile update security', () => {
    it('should not allow updating other user fields via /users/me', async () => {
      // Try to update fields that should be protected
      const maliciousUpdate = {
        name: 'Legitimate Name',
        email: 'hacker@example.com',
        roles: ['admin'],
        isActive: false,
        tenantId: 'different-tenant'
      };

      const response = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send(maliciousUpdate)
        .expect(200);

      // Verify that only name was updated, other fields should remain unchanged
      expect(response.body.name).toBe('Legitimate Name');
      expect(response.body.email).toBe(testData.users.regular.email); // Should NOT change
      expect(response.body.tenantId).toBe(testData.tenant.id); // Should NOT change
    });
  });
});
