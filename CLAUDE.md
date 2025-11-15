# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack TypeScript monorepo with Next.js frontend, NestJS backend, and PostgreSQL database. Uses pnpm workspaces with shared Prisma schema at root level.

## Quick Start

```bash
# Complete automated setup (recommended)
pnpm run setup

# Start development servers (after setup)
pnpm run dev

# Cleanup (stop containers, optionally remove files)
pnpm run cleanup
```

## Development Commands

### Root-Level Commands

```bash
# Development
pnpm run dev          # Start both frontend and backend
pnpm run lint         # Run linters on both projects

# Database (from root)
pnpm run prisma:generate  # Generate Prisma client
pnpm run prisma:migrate   # Run database migrations
pnpm run prisma:seed      # Seed database with test data

# Setup
pnpm run setup        # Full automated setup
pnpm run setup:env    # Generate environment files only
pnpm run setup:db     # Start database only
pnpm run cleanup      # Stop containers and cleanup
```

### Frontend (Next.js)

```bash
cd frontend
pnpm run dev         # Start development server (port 3000)
pnpm run build       # Build for production
pnpm run start       # Start production server
pnpm run lint        # Run ESLint
pnpm run test        # Run Jest tests
pnpm run test:watch  # Run Jest in watch mode
pnpm run test:e2e    # Run Playwright e2e tests
```

### Backend (NestJS)

```bash
cd backend
pnpm run start:dev     # Start development server (port 3010)
pnpm run build         # Build for production
pnpm run start:prod    # Start production server
pnpm run lint          # Run ESLint with auto-fix
pnpm run format        # Run Prettier
pnpm run test          # Run Jest unit tests
pnpm run test:watch    # Run Jest in watch mode
pnpm run test:e2e      # Run E2E tests (starts test DB automatically)
pnpm run test:e2e:watch # Run E2E tests in watch mode
pnpm run test:db:up    # Start test database container
pnpm run test:db:down  # Stop test database container
pnpm run test:db:setup # Run Prisma migrations on test DB
```

## Architecture

### Monorepo Structure

- **pnpm workspaces**: Frontend and backend are separate workspace packages
- **Shared Prisma schema**: Located at `prisma/schema.prisma` (root level)
- Both projects reference the same schema via relative paths in their package.json

### Database Architecture

**IMPORTANT**: The Prisma schema is at the ROOT level (`/prisma/schema.prisma`), not in backend or frontend directories.

```
app-template/
├── prisma/
│   ├── schema.prisma    # Shared schema
│   └── seed.ts          # Seed data
├── frontend/            # References ../prisma/schema.prisma
└── backend/             # References ../prisma/schema.prisma
```

When running Prisma commands:
- From root: Use `pnpm run prisma:*` commands
- From backend: Prisma automatically uses `../prisma/schema.prisma`
- From frontend: Prisma automatically uses `./prisma/schema.prisma` (symlink or reference)

### Authentication Flow

**Critical Pattern**: Frontend and backend use different auth systems but share JWT tokens.

1. **Frontend (NextAuth.js)**:
   - Handles user login (credentials, OAuth providers)
   - Generates JWT tokens signed with `NEXTAUTH_SECRET`
   - Stores session in cookies (`authjs.session-token`)
   - Token includes: user id, email, roles, custom fields

2. **Token Exchange**:
   - Frontend endpoint: `/api/auth/token` extracts session token from cookies
   - Returns JWT to client for API requests

3. **Backend (NestJS + Passport JWT)**:
   - Verifies JWT tokens using same secret (`NEXTAUTH_SECRET` or `JWT_SECRET`)
   - `JwtStrategy` validates token and extracts user info
   - `JwtAuthGuard` protects routes requiring authentication
   - `RolesGuard` enforces role-based access control

**CRITICAL**: `NEXTAUTH_SECRET` (frontend) and `NEXTAUTH_SECRET`/`JWT_SECRET` (backend) MUST be identical for token verification to work.

### API Communication

Frontend uses `fetchWithAuth` helper (in `lib/auth-utils.ts`) for authenticated requests:

```typescript
// Automatically includes JWT token in Authorization header
const data = await fetchWithAuth('/users');
```

Backend expects JWT in `Authorization: Bearer <token>` header.

### CORS Configuration

Backend allows requests from:

- `http://localhost:3000` (Next.js dev server)
- `http://127.0.0.1:3000`

Credentials: enabled (required for cookie-based auth).

### Multi-Tenancy

**Critical Pattern**: All data queries must be scoped to the user's tenant.

JWT token contains `tenantId` which MUST be used in all database queries:

```typescript
// In controllers
@Get()
async findAll(@Request() req: AuthenticatedRequest) {
  const tenantId = req.user.tenantId;
  if (!tenantId) {
    throw new HttpException('Tenant ID not found in token', HttpStatus.UNAUTHORIZED);
  }
  return await this.service.findAll(tenantId);
}

// In services
async findAll(tenantId: string) {
  return this.prisma.company.findMany({
    where: { tenantId },  // Always filter by tenantId
  });
}
```

**NEVER** query without tenant filtering in production code (except for global resources like roles).

### Role-Based Access Control

**Database Structure**: Roles are stored in a master table with many-to-many relationship:
- `Role` model: Contains role definitions (user, powerUser, admin)
- `UserRole` junction table: Links users to roles
- API responses return `roles: string[]` for compatibility

**Available Roles** (defined in seed data):
- `user` - General user (default)
- `powerUser` - Power user with elevated permissions
- `admin` - Administrator with full access

Backend uses:
- `@UseGuards(JwtAuthGuard)` - Require authentication
- `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(Role.User, Role.Admin)` - Require specific roles
- Roles are checked via `RolesGuard` which reads from JWT token

**Important**: When adding `@Roles()` decorator, always include `Role.Admin` unless explicitly excluding admins from that endpoint

## Key Technologies

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Radix UI, NextAuth.js v5
- **Backend**: NestJS, TypeScript, Passport JWT
- **Database**: PostgreSQL 15 (Docker), Prisma ORM
- **Testing**: Jest, Testing Library, Playwright
- **Styling**: Tailwind CSS, Shadcn/ui components
- **State Management**: Zustand
- **API Docs**: OpenAPI/Swagger at `http://localhost:3010/api-docs`

## Important Files and Patterns

### Environment Variables

**Frontend (.env.local)**:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
NEXT_PUBLIC_API_URL=http://localhost:3010
```

**Backend (.env)**:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:15432/app_db
JWT_SECRET=your-secret-here
NEXTAUTH_SECRET=your-secret-here  # MUST match frontend
```

### Authentication Configuration

- **Frontend**: `frontend/src/lib/auth-config.ts` - NextAuth.js configuration
- **Backend**: `backend/src/auth/jwt.strategy.ts` - JWT verification strategy
- **Shared Secret**: Both must use the same secret for JWT signing/verification

**CRITICAL NextAuth Pattern**: The `authorize` function in credentials provider MUST return `tenantId` and `roles`:

```typescript
// In auth-config.ts credentials provider
async authorize(credentials) {
  const user = await apiClient.validateUser({
    email: credentials.email,
    password: credentials.password,
  });

  if (!user) return null;

  // MUST return tenantId and roles
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    roles: user.roles,      // Required
    tenantId: user.tenantId, // Required
  };
}
```

The JWT callback then propagates these to the token. **DO NOT** call authenticated endpoints in JWT callback (chicken-and-egg problem).

### API Client

Frontend uses `lib/api-client.ts` for backend communication:
- Public endpoints: Direct fetch calls
- Protected endpoints: Dynamic import of `fetchWithAuth` to avoid circular dependencies

### Database Seeding

Default test users (password: `password`):

- `admin@example.com` - Admin role
- `user@example.com` - User role

### Backend Testing

Backend uses Jest with E2E testing infrastructure:

**Test Database**:

- Runs in separate Docker container (`postgres-test` on port 5433)
- Uses tmpfs (in-memory storage) for fast test execution
- Automatically started by `pnpm run test:e2e`

**Test Files**:

- `backend/test/setup.ts` - Database setup and teardown helpers
- `backend/test/test-helpers.ts` - JWT token generation, database seeding
- `backend/test/jest-setup.ts` - Global test setup (runs before all tests)
- `backend/.env.test` - Test environment configuration

**Writing E2E Tests**:

```typescript
import { seedTestData, cleanDatabase } from './test-helpers';

describe('MyController (e2e)', () => {
  let app: INestApplication;
  let testData: any;
  let userToken: string;

  beforeAll(async () => {
    // App setup
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    // Seed test data
    testData = await seedTestData();
    userToken = testData.tokens.user;
  });

  it('should test endpoint', () => {
    return request(app.getHttpServer())
      .get('/endpoint')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
  });
});
```

## API Documentation

Interactive OpenAPI/Swagger documentation available at:
- **URL**: http://localhost:3010/api-docs
- **Authentication**: Click "Authorize" and enter JWT token from frontend login
- **Format**: `Bearer <token>`

## Docker Services

PostgreSQL databases run in Docker:
```bash
docker compose up -d postgres       # Start dev database (port 15432)
docker compose up -d postgres-test  # Start test database (port 5433)
docker compose down                 # Stop all services
docker compose down -v              # Stop and remove volumes
```

**Database Containers**:

- `postgres` (port 15432): Development database with persistent volume
- `postgres-test` (port 5433): Test database with tmpfs (in-memory) for speed

Frontend and backend run as local processes (not containerized in development).

## Common Development Tasks

### Adding New API Endpoints

1. Create controller in `backend/src/[module]/[module].controller.ts`
2. Add OpenAPI decorators (`@ApiTags`, `@ApiOperation`, `@ApiBearerAuth`)
3. Use `@UseGuards(JwtAuthGuard)` for protected routes
4. Update `frontend/src/lib/api-client.ts` with new methods

### Database Schema Changes

1. Edit `prisma/schema.prisma` (at root level)
2. Run `pnpm run prisma:migrate` to create and apply migration
3. Run `pnpm run prisma:generate` to update Prisma Client
4. Update TypeScript types if needed

### Working with Roles

**Backend Pattern** (in services):

When querying users, always use the helper pattern from `UsersService`:

```typescript
// Include userRoles with role data
private readonly userInclude = {
  userRoles: {
    include: {
      role: true
    }
  }
};

// Transform to return roles as string array
private transformUserWithRoles(user: any) {
  const { userRoles, ...userData } = user;
  return {
    ...userData,
    roles: userRoles?.map((ur: any) => ur.role.name) || []
  };
}

// Use in queries
const user = await this.prisma.user.findUnique({
  where: { id },
  include: this.userInclude
});
return this.transformUserWithRoles(user);
```

**Frontend Pattern**:

Fetch available roles dynamically from `/roles` endpoint instead of hardcoding:

```typescript
const roles = await apiClient.getRoles();
// Returns: [{ id, name, description, sortOrder }, ...]
```

### Adding Authentication to Routes

**Frontend** (Next.js):

```typescript
import { auth } from '@/auth';

export default async function ProtectedPage() {
  const session = await auth();
  if (!session) redirect('/login');
  // ...
}
```

**Backend** (NestJS):

```typescript
import { Role } from 'src/auth/role.enum';

// Authentication only
@UseGuards(JwtAuthGuard)
@Get()
findAll() { /* ... */ }

// Authentication + Role-based access
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.User, Role.PowerUser, Role.Admin)  // Remember to include Admin
@Get(':id')
findOne() { /* ... */ }
```

## Troubleshooting

### Authentication Errors

If backend returns 401 Unauthorized:
1. Check that `NEXTAUTH_SECRET` matches in both `.env` files
2. Verify JWT token format: `Authorization: Bearer <token>`
3. Check backend logs for JWT validation errors
4. Ensure user is logged in on frontend
5. Clear browser cookies and re-login

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps

# View database logs
docker logs eol-postgres

# Restart database
docker compose restart postgres
```

### Prisma Client Issues

```bash
# Regenerate Prisma client
pnpm run prisma:generate

# Reset database (warning: deletes all data)
pnpm --filter backend prisma migrate reset
```
