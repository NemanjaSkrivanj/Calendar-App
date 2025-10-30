## Prerequisites

- Node.js 18+
- PostgreSQL 13+
- Google Cloud project with OAuth 2.0 Client (Web)
  - Authorized redirect URI: `http://localhost:4000/auth/google/callback`

## Setup

### 1) Install

```bash
cd backend && npm install
cd frontend && npm install
```

### 2) Env vars

Backend `backend/.env`:

```
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:5173
SESSION_SECRET=replace_with_strong_secret
# Note: postgres:postgres = username:password (the second 'postgres' is the password).
# You can replace these with your own DB username/password if you use custom credentials.
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/calendar_db?schema=public
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:4000/auth/google/callback
```

Frontend `frontend/.env` (optional):

```
VITE_API_URL=http://localhost:4000
```

### 3) DB & Prisma

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### 4) Run

```bash
cd backend
npm run dev

cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend health: http://localhost:4000/health

## API

- GET `/auth/google` – begin OAuth
- GET `/auth/google/callback` – OAuth callback
- GET `/auth/me` – session check
- GET `/api/events?rangeDays=7&start=ISO_DATE` – list events
- POST `/api/events` – create event `{ title, date, startTime, endTime }`
- POST `/api/events/refresh` – re-sync from Google
