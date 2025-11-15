# TTS App Template

A template application for building new TTS (Text-to-Speech) applications.

<img width="1502" alt="Application Screenshot" src="https://github.com/user-attachments/assets/0b9a8ba3-30af-4767-ac8e-e7ff92f1a4ab" />

## Tech Stack

The application is built using the following technologies:

- Next.js
- Prisma
- PostgreSQL
- TypeScript
- Tailwind CSS
- NextAuth
- Lucide Icons
- Shadcn UI

## Prerequisites

Before you begin, ensure you have the following software installed:

- [Rancher Desktop](https://rancherdesktop.io/) - Container management platform
- [Node.js](https://nodejs.org/en) (v22 or higher) - JavaScript runtime
- [VSCode](https://code.visualstudio.com/) or [Cursor](https://www.cursor.com/) - Code editor

## Setup Instructions

### 1. Environment Configuration

1. Obtain the `.env` file from your team
2. Place it in the project root directory
3. Verify the database connection string:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app_db"
```

### 2. Database Setup

Initialize the database by running:

```bash
npm run setup
```

### 3. Development Server

Start the development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Docker Deployment

For quick deployment using Docker:

```bash
docker compose up
```

Visit [http://localhost:4000](http://localhost:4000) in your browser to view the application.

## Project Structure

```
.
├── src/                   # Source directory
│   ├── app/              # Next.js App Router directory
│   │   ├── api/         # API route handlers
│   │   ├── main/        # Main application pages
│   │   └── components/  # Page-specific components
│   ├── components/       # Shared UI components
│   │   ├── navigation/  # Navigation components
│   │   └── ui/         # Base UI components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions and configurations
│   ├── server/          # Server-side logic
│   │   ├── controllers/ # API controllers
│   │   ├── models/     # Data models
│   │   ├── services/   # Business logic services
│   │   └── utils/      # Server utilities
│   └── types/           # TypeScript type definitions
├── prisma/               # Database schema and migrations
│   ├── migrations/      # Database migration files
│   └── schema.prisma    # Prisma schema file
├── public/              # Static files
├── .storybook/         # Storybook configuration
├── docker-compose.yml   # Docker compose configuration
├── Dockerfile          # Docker configuration
├── .env                # Environment variables
└── package.json        # Project dependencies and scripts
```

The project follows a modular structure where:

- `src/`: Contains all source code

  - `app/`: Next.js App Router directory
    - `api/`: API route handlers using Next.js API routes
    - `main/`: Main application pages and layouts
    - `components/`: Page-specific components
  - `components/`: Shared UI components
    - `navigation/`: Navigation-related components
    - `ui/`: Base UI components using Shadcn UI
  - `hooks/`: Custom React hooks for reusable logic
  - `lib/`: Utility functions, configurations, and shared code
  - `server/`: Server-side implementation
    - `controllers/`: API request handlers
    - `models/`: Data models and types
    - `services/`: Business logic and service layer
    - `utils/`: Server-side utilities

- `prisma/`: Database-related files

  - `migrations/`: Database migration history
  - `schema.prisma`: Database schema definition

- `.storybook/`: Storybook configuration for component development
- `public/`: Static assets like images and fonts

This structure follows Next.js App Router conventions and promotes clean code organization.
