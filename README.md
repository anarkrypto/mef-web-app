# GovBot Web Application

A decentralized governance platform for managing proposals and grants on the Mina Protocol blockchain. Built with Next.js 14, TypeScript, and Prisma.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.0-black)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.7-white)](https://www.prisma.io/)

## Features

- 🔐 Multi-source authentication (Discord, Telegram, Wallet)
- 🔗 Account linking across auth providers
- 📝 Proposal creation and management
- 🎨 Modern UI with shadcn/ui components
- 🌐 Server-side rendering with Next.js
- 🔒 Type-safe database operations with Prisma
- 🐳 Docker support for development

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL 17
- **ORM**: Prisma
- **UI**: shadcn/ui + Tailwind CSS
- **Authentication**: Custom JWT implementation
- **Container**: Docker + Docker Compose

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- npm

### Environment Setup

Create a `.env` file in the root directory:

```env
# Authentication
JWT_PRIVATE_KEY_RS512="-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----"

JWT_PUBLIC_KEY_RS512="-----BEGIN PUBLIC KEY-----
...
-----END PUBLIC KEY-----"

# Discord Bot Configuration
DISCORD_TOKEN="your-bot-token"        # Bot token from Discord Developer Portal
CLIENT_ID="your-client-id"           # Application ID from Developer Portal
GUILD_ID="your-guild-id"             # Server ID where bot will operate
PUBLIC_KEY="your-public-key"         # Application public key from Developer Portal

# Application URL
NEXT_APP_URL="http://localhost:3000"  # Used for Discord embed links

# PGAdmin Configuration
PGADMIN_EMAIL=admin@example.com
PGADMIN_PASSWORD=pgadmin_password

# Database Configuration
POSTGRES_DB=govbot
POSTGRES_PASSWORD=your_secure_password_here
DATABASE_URL="postgresql://postgres:your_secure_password_here@db:5432/govbot?schema=public"
```

### Development with Docker

1. Start the development environment:

```bash
docker-compose up
```

This will start:

- Next.js development server at http://localhost:3000
- PostgreSQL database at localhost:5432
- PgAdmin at http://localhost:5050

2. Access the application:

- Frontend: http://localhost:3000
- PgAdmin: http://localhost:5050

### Local Development

1. Install dependencies:

```bash
npm install
```

2. Start PostgreSQL:

```bash
docker-compose up db
```

3. Run migrations:

```bash
npx prisma migrate dev
```

4. Start development server:

```bash
npm run dev
```

OR

```bash
docker compose up --build
```

## Architecture

### Authentication System

The platform supports multiple authentication sources:

1. **Auth Sources**:

   - Discord (via bot)
   - Telegram (via bot)
   - Mina Protocol Wallet

2. **JWT Implementation**:

   - Short-lived access tokens (15 minutes)
   - Refresh tokens (7 days)
   - Secure httpOnly cookies
   - Token rotation on refresh

3. **User Resolution**:
   ```typescript
   // User ID derivation
   userId = UUIDv5(authSource.type + authSource.id);
   ```

### Account Linking

Users can link multiple authentication sources:

1. **Linking Process**:

   - Each user has a `linkId`
   - Linked accounts share the same `linkId`
   - All linked accounts can access shared resources

2. **Implementation**:
   ```typescript
   interface User {
     id: string; // Derived from auth source
     linkId: string; // Shared between linked accounts
     metadata: Json; // Auth source info
   }
   ```

### Background Jobs with Bree.js

Bree.js is for running background tasks in separate threads:

1. **Worker Structure**:
   ```
   src/
     tasks/           # TypeScript worker files
       discord-notify-proposal-submission.ts
     scripts/
       build-workers.ts
   dist/
     tasks/          # Compiled JavaScript workers
   ```

2. **Build Process**:
   - Workers are compiled from TypeScript to JavaScript
   - ESM compatibility layer is added for module support
   - Dependencies are bundled with the worker
   - Output is placed in `dist/tasks/`

3. **Available Scripts**:
   ```bash
   # Build workers only
   npm run build:workers

   # Build everything (Next.js + workers)
   npm run build
   ```

4. **Implementation**:
   - Workers are initialized in API routes
   - Each worker runs in isolation
   - Communication via worker_threads
   - Proper error handling and recovery

5. **Development Flow**:
   - Workers are automatically built in development
   - Hot reload of workers **NOT** supported via `npm run dev`
   - Production builds include worker compilation


## API Routes

### Authentication

```typescript
POST /api/auth/exchange
- Exchange initial token for access/refresh tokens

POST /api/auth/refresh
- Refresh access token

POST /api/auth/logout
- Clear auth tokens
```

### Proposals

```typescript
GET /api/proposals
- List user's proposals

POST /api/proposals
- Create new proposal

GET /api/proposals/:id
- Get proposal details

PUT /api/proposals/:id
- Update proposal

DELETE /api/proposals/:id
- Delete draft proposal
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development Guidelines

1. **TypeScript**:

   - Enable strict mode
   - Use proper type inference
   - Define clear interfaces

2. **Components**:

   - Use Server Components by default
   - Implement proper error boundaries
   - Follow accessibility guidelines

3. **Styling**:
   - Use Tailwind CSS classes
   - Follow shadcn/ui patterns
   - Maintain consistent theming

## Deployment

1. **Production Build**:

```bash
npm run build
```

2. **Docker Production**:

```bash
docker-compose -f docker-compose.prod.yml up
```

## Contributing

To contribute, follow these steps:

1. Make an issue that includes details about the feature or bug or something else.
2. Get that issue tested by: Cristina Echeverry.
3. Get that issue approved by the product owners: Cristina Echeverry (CristinaEche) & Illya Gerasymchuk (iluxonchik)
4. Write a PR and get it approved by the code owners and Mina devops: Illya Gerasymchuk (developer & code-owner), johnmarcou (Mina devops). Each PR must correspond to an approved issue. By default, PRs should be merged by the PR submitter, though in some cases if changes are needed, they can be merged by code owners.
