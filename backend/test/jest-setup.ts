import { setupTestDatabase } from './setup';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load test environment
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

beforeAll(() => {
  setupTestDatabase();
});
