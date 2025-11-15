import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

export function setupTestDatabase() {
  console.log('Setting up test database...');

  try {
    // Run migrations
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
      stdio: 'inherit'
    });

    console.log('Test database setup complete');
  } catch (error) {
    console.error('Failed to setup test database:', error);
    throw error;
  }
}

export function teardownTestDatabase() {
  console.log('Tearing down test database...');

  try {
    // Clean up database
    execSync('npx prisma migrate reset --force --skip-seed', {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
      stdio: 'inherit'
    });

    console.log('Test database teardown complete');
  } catch (error) {
    console.error('Failed to teardown test database:', error);
    // Don't throw - we want tests to continue even if cleanup fails
  }
}
