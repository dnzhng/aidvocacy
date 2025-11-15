# Advocacy Call Agent

An AI-powered advocacy calling system that helps users overcome phone anxiety by letting AI agents make calls to their government representatives on their behalf.

## Features

- **Multi-step Call Flow**: Users can select issues or representatives, then choose scripts and personas
- **AI-Powered Calls**: Uses Twilio and OpenAI to make automated calls with natural voice
- **Script Customization**: Scripts are modified based on selected persona (tone, formality, emotion)
- **Menu Navigation**: AI agent can navigate phone menus automatically
- **Call Tracking**: Track call status, get transcripts and recordings
- **Extensible Architecture**: Built with future features in mind (auth, rate limiting, paid tiers)

## Architecture

This is a monorepo with the following packages:

- **`packages/database`**: Prisma schema and database utilities
- **`packages/shared`**: Shared TypeScript types and utilities
- **`packages/api`**: Backend API (Express + TypeScript)
- **`packages/agent-service`**: AI calling agent service (Twilio + OpenAI)
- **`packages/frontend`**: React frontend (Vite + TypeScript)

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **AI Calling**: Twilio Programmable Voice
- **Voice**: Twilio Text-to-Speech (Polly voices)
- **Testing**: Jest (backend), Vitest (frontend)

## Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL 14+
- Twilio account with phone number
- OpenAI API key (optional, for future enhancements)

## Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd callrep
npm install
```

### 2. Set Up Database

```bash
# Create a PostgreSQL database
createdb callrep

# Set up environment variables
cp packages/database/.env.example packages/database/.env
# Edit packages/database/.env and set DATABASE_URL

# Run migrations
cd packages/database
npm run migrate

# Seed the database
npm run seed
```

### 3. Configure Services

```bash
# API configuration
cp packages/api/.env.example packages/api/.env
# Edit packages/api/.env and set:
# - DATABASE_URL (same as database package)
# - AGENT_SERVICE_URL (http://localhost:3002)

# Agent service configuration
cp packages/agent-service/.env.example packages/agent-service/.env
# Edit packages/agent-service/.env and set:
# - TWILIO_ACCOUNT_SID
# - TWILIO_AUTH_TOKEN
# - TWILIO_PHONE_NUMBER
# - PUBLIC_URL (your ngrok or public URL for webhooks)
# - API_BASE_URL (http://localhost:3001)
```

### 4. Set Up Twilio Webhooks

The agent service needs to be publicly accessible for Twilio webhooks. Use ngrok:

```bash
ngrok http 3002
```

Copy the ngrok URL and set it as `PUBLIC_URL` in `packages/agent-service/.env`.

### 5. Start Development Servers

```bash
# From the root directory, start all services:
npm run dev

# Or start individually:
npm run dev:api        # API on port 3001
npm run dev:agent      # Agent service on port 3002
npm run dev:frontend   # Frontend on port 3000
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **Agent Service**: http://localhost:3002

## Usage

1. Open http://localhost:3000
2. Choose to start with an issue or representative
3. Select an issue you care about
4. Select a representative to contact
5. Choose a script that represents your message
6. Pick a persona/tone for the AI agent
7. Confirm and submit - the AI will make the call!
8. Track the call status and get transcripts/recordings

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests for specific package
npm test -w @callrep/api
npm test -w @callrep/agent-service
npm test -w @callrep/frontend
```

### Database Management

```bash
# Open Prisma Studio
npm run db:studio

# Create a new migration
cd packages/database
npm run migrate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Project Structure

```
callrep/
├── packages/
│   ├── database/           # Prisma schema and migrations
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── index.ts
│   ├── shared/             # Shared types
│   │   └── src/
│   │       └── types.ts
│   ├── api/                # Backend API
│   │   └── src/
│   │       ├── routes/     # API routes
│   │       ├── services/   # Business logic
│   │       ├── middleware/ # Express middleware
│   │       └── utils/      # Utilities
│   ├── agent-service/      # AI calling agent
│   │   └── src/
│   │       ├── services/   # Twilio & callback services
│   │       └── app.ts      # Express app
│   └── frontend/           # React frontend
│       └── src/
│           ├── pages/      # Page components
│           ├── services/   # API client
│           └── styles/     # CSS styles
├── package.json
└── README.md
```

## API Endpoints

### Representatives
- `GET /api/representatives` - List all representatives
- `GET /api/representatives/:id` - Get representative details

### Issues
- `GET /api/issues` - List all issues
- `GET /api/issues/:id` - Get issue details

### Scripts
- `GET /api/scripts` - List all scripts
- `GET /api/scripts/:id` - Get script details

### Personas
- `GET /api/personas` - List all personas
- `GET /api/personas/:id` - Get persona details

### Calls
- `POST /api/calls` - Create a new call
- `GET /api/calls/:id` - Get call status
- `POST /api/calls/:id/status` - Update call status (internal)

## Future Features

The application is designed to support these future enhancements:

1. **User Authentication**
   - User accounts and login
   - Call history per user
   - Saved preferences

2. **Rate Limiting**
   - Limit calls per user
   - Prevent abuse

3. **Batch Calls**
   - Allow users to make multiple calls at once
   - Queue management

4. **Paid Tiers**
   - Free tier with limits
   - Paid tier with higher limits
   - Subscription management

5. **Enhanced Transcripts**
   - Email transcripts to users
   - SMS notifications
   - Call analytics

## Testing Notes

**IMPORTANT**: The seed data includes fake phone numbers (+15555550100, etc.). These are for testing only and won't actually connect calls. To test real calls:

1. Replace phone numbers in the database with real representative numbers
2. Ensure your Twilio account is fully configured
3. Monitor Twilio console for call logs

## Troubleshooting

### Calls Not Being Made

1. Check that `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER` are set correctly
2. Verify `PUBLIC_URL` is accessible from the internet (use ngrok)
3. Check Twilio console for error logs

### Database Connection Issues

1. Verify PostgreSQL is running: `psql -U postgres`
2. Check `DATABASE_URL` in `.env` files
3. Run migrations: `npm run db:migrate`

### Frontend Not Loading Data

1. Ensure API is running on port 3001
2. Check browser console for errors
3. Verify database is seeded: `npm run db:seed`

## Contributing

This project follows TDD principles:

1. Write tests first
2. Implement features
3. Refactor
4. Ensure all tests pass before committing

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
