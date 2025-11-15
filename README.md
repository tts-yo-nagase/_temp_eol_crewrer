# App Template

A modern full-stack application template built with Next.js, NestJS, and PostgreSQL. This template provides a robust foundation for building scalable web applications with authentication, role-based access control, and a modern UI.

## 🚀 Features

- **Full-Stack TypeScript**: End-to-end type safety with TypeScript
- **Modern UI**: Beautiful, responsive interface built with Tailwind CSS and Radix UI
- **Authentication**: Secure authentication with NextAuth.js and JWT
- **Role-Based Access Control**: Granular permissions system
- **Database**: PostgreSQL with Prisma ORM
- **Testing**: Comprehensive testing setup with Jest and Testing Library
- **Storybook**: Component development and documentation
- **Docker**: Containerized database setup
- **Monorepo**: Organized workspace structure

## 🛠 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **NextAuth.js** - Authentication solution
- **Zustand** - State management
- **React Hook Form** - Form handling
- **Recharts** - Data visualization

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **JWT** - JSON Web Tokens for authentication
- **Passport** - Authentication middleware
- **OpenAPI/Swagger** - API documentation and testing

### Development Tools
- **pnpm** - Package manager
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **Docker** - Containerization
- **Turbopack** - Fast bundler
- **Consola** - Enhanced logging with structured output

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) (v8 or higher)
- [Docker](https://www.docker.com/) and Docker Compose
- [Git](https://git-scm.com/)

## 🚀 Quick Start

### Automated Setup (Recommended)

Get up and running with a single command:

```bash
# Clone the repository
git clone <repository-url>
cd app-template

# Run the automated setup
pnpm run setup
```

This command will automatically:

1. 📦 Install all dependencies
2. 🔧 Generate environment files from templates
3. 🐘 Start PostgreSQL database
4. ⏳ Wait for database connection
5. 🗄️ Run Prisma migrations and seed data
6. 🚀 Start both frontend and backend servers

The application will be available at:

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:3010](http://localhost:3010)
- **API Docs**: [http://localhost:3010/api-docs](http://localhost:3010/api-docs)

### Individual Setup Commands

If you prefer to run setup steps individually:

```bash
pnpm run setup:env    # Generate environment files only
pnpm run setup:db     # Start database only
pnpm run dev          # Start development servers (after setup)
pnpm run cleanup      # Clean up environment (stop containers, optionally remove files)
```

### Manual Setup (Alternative)

If you prefer manual setup or need more control:

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd app-template
```

#### 2. Install Dependencies

```bash
pnpm install
```

#### 3. Environment Setup

Create environment files:

```bash
# Backend environment
cp backend/.env.example backend/.env

# Frontend environment
cp frontend/.env.sample frontend/.env.local
```

#### 4. Start the Database

```bash
docker compose up -d postgres
```

#### 5. Database Setup

```bash
# Run migrations and seed data
pnpm --filter backend run setup
```

#### 6. Start the Development Server

```bash
# From the root directory
pnpm dev
```

The application will be available at:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:3010](http://localhost:3010)

## 📁 Project Structure

```text
app-template/
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── auth/           # Authentication modules
│   │   ├── company/        # Company management
│   │   ├── types/          # TypeScript type definitions
│   │   └── main.ts         # Application entry point
│   ├── prisma/             # Database schema and migrations
│   └── test/               # E2E tests
├── frontend/               # Next.js frontend application
│   ├── src/
│   │   ├── app/            # Next.js app router pages
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and configurations
│   │   └── types/          # TypeScript type definitions
│   ├── public/             # Static assets
│   └── prisma/             # Frontend Prisma schema
├── docker-compose.yml      # Docker services configuration
└── package.json           # Workspace configuration
```

## 🔧 Development Workflow

### Running Individual Services

```bash
# Frontend only
cd frontend && pnpm dev

# Backend only
cd backend && pnpm start:dev
```

### Database Management

```bash
# Generate Prisma client (backend)
pnpm --filter backend prisma generate

# Run migrations (development)
pnpm --filter backend prisma migrate dev

# Reset database
pnpm --filter backend prisma migrate reset

# Seed database
pnpm --filter backend prisma db seed
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run e2e tests
pnpm test:e2e
```

### Storybook

```bash
# Start Storybook
cd frontend && pnpm storybook

# Build Storybook
pnpm build-storybook
```

### Viewing Logs

```bash
# View combined logs
tail -f frontend/logs/combined.log

# View error logs only
tail -f frontend/logs/error.log

# View logs with filtering
grep "ERROR" frontend/logs/combined.log
```

### API Documentation

```bash
# Start backend with API documentation
cd backend && pnpm start:dev

# Access interactive API documentation
open http://localhost:3010/api-docs

# Test API endpoints with authentication
# Use JWT token from frontend login
```

## 📚 API Documentation (OpenAPI)

The backend API is fully documented using OpenAPI (Swagger) specification, providing interactive documentation and testing capabilities.

### Features

- **Interactive Documentation**: Test API endpoints directly from the browser
- **Schema Validation**: Automatic request/response validation
- **Authentication Support**: JWT Bearer token authentication
- **Type Safety**: TypeScript DTOs with validation decorators
- **Role-Based Access**: Documented endpoint permissions

### Accessing API Documentation

Once the backend is running, access the interactive API documentation at:

**🌐 [http://localhost:3010/api-docs](http://localhost:3010/api-docs)**

### API Endpoints

The API includes the following documented endpoints:

#### Companies API (`/companies`)
- `GET /companies` - Get all companies (User, PowerUser roles)
- `GET /companies/:id` - Get company by ID (User, PowerUser roles)
- `POST /companies` - Create new company (Admin role)
- `PUT /companies/:id` - Update company (Admin role)
- `DELETE /companies/:id` - Delete company (Admin role)

#### Authentication
- All endpoints require JWT Bearer token authentication
- Role-based access control enforced
- Automatic token validation

### Using the API Documentation

1. **Start the backend server**: `cd backend && pnpm start:dev`
2. **Open API docs**: Navigate to `http://localhost:3010/api-docs`
3. **Authenticate**: Click "Authorize" and enter your JWT token
4. **Test endpoints**: Use the "Try it out" feature to test API calls
5. **View schemas**: Explore request/response models in the schemas section

### JWT Token Authentication

To use the API documentation with authentication:

1. Obtain a JWT token from your frontend authentication
2. Click the "Authorize" button in the API documentation
3. Enter your token in the format: `Bearer <your-jwt-token>`
4. All subsequent API calls will include the authorization header

### Response Examples

All endpoints include detailed response examples:

```json
{
  "id": "cm123abc456def789",
  "name": "Acme Corporation",
  "code": "ACME001",
  "address": "123 Main St, New York, NY 10001",
  "phone": "+1-555-123-4567",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Error Handling

The API documentation includes comprehensive error responses:

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

## 🔐 Authentication

The application uses NextAuth.js for authentication with support for:

- Email/Password authentication
- OAuth providers (Google, GitHub, etc.)
- JWT tokens
- Role-based access control

### Default Users

After running the seed command, you can use these test accounts:

- Admin: `admin@example.com` / `password`
- User: `user@example.com` / `password`

## 📊 Logging

The application uses [Consola](https://github.com/unjs/consola) for structured logging across both frontend and backend.

### Features

- **Structured Output**: JSON-formatted logs in production
- **Log Levels**: Configurable verbosity (0-5 and silent/verbose modes)
- **Colored Output**: Enhanced readability in development
- **File Logging**: Automatic log file generation
- **Context Logging**: User and request context in API logs

### Log Levels

```
0: Fatal and Error
1: Warnings  
2: Normal logs
3: Informational logs (success, fail, ready, start)
4: Debug logs
5: Trace logs
-999: Silent
+999: Verbose logs
```

### Configuration

**Frontend Logger** (`frontend/src/lib/logger.ts`):

- Development: Level 5 (trace) with colored console output
- Production: Level 3 (info) with JSON formatting

**Backend Logger**:

- Direct Consola usage with emoji indicators
- User context logging (🎭 roles, 🏢 company, 👤 user info)
- API operation logging (🔍 findOne, 🆕 create, 🔄 update, 🗑️ delete)

### Log Files

Log files are automatically generated in `frontend/logs/`:

- `combined.log` - All application logs
- `error.log` - Error-level logs only

### Usage Examples

```typescript
// Frontend
import logger from '@/lib/logger'

logger.info('User action completed')
logger.error('API call failed', { error })
logger.debug('Debug information', { data })

// Backend
import { consola } from 'consola'

consola.info('🔍 findOne called for company ID:', id)
consola.error('Controller error:', error)
```

## 🏗 Architecture

### Frontend Architecture

- **App Router**: Next.js 13+ app directory structure
- **Component Library**: Reusable UI components with Radix UI
- **State Management**: Zustand for global state
- **Authentication**: NextAuth.js with session management
- **Styling**: Tailwind CSS with custom design system

### Backend Architecture

- **Modular Design**: Feature-based module organization
- **Guards**: Authentication and authorization guards
- **Pipes**: Request validation and transformation
- **Interceptors**: Response transformation and logging
- **Database**: Prisma ORM with PostgreSQL

## 🚢 Deployment

### Production Build

```bash
# Build frontend
cd frontend && pnpm build

# Build backend
cd backend && pnpm build
```

### Environment Variables

Ensure the following environment variables are set in production:

**Backend (.env)**

```env
DATABASE_URL=postgresql://user:password@localhost:5432/app_db
JWT_SECRET=your-jwt-secret
```

**Frontend (.env.local)**

```env
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [documentation](./docs)
2. Search existing [issues](https://github.com/your-repo/issues)
3. Create a new [issue](https://github.com/your-repo/issues/new)

## 🎯 Roadmap

- [x] Add API documentation with OpenAPI ✅
- [ ] Add more authentication providers
- [ ] Implement real-time notifications
- [ ] Implement file upload functionality
- [ ] Add internationalization (i18n)
- [ ] Performance optimization
- [ ] Mobile responsiveness improvements
