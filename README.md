# 4Event Backend

Event equipment rental platform with web frontend and Next.js backend.

## Project Structure

```
4event-backend/
├── 4event-server/    # Backend (Next.js API + Admin Panel)
├── 4event-web/       # Frontend Website (Vite + React)
└── README.md
```

## Backend (4event-server)

Next.js application serving as API backend and admin panel.

### Setup
```bash
cd 4event-server
pnpm install
pnpm run dev
```

Runs on `http://localhost:3001`

### Environment Variables
See `4event-server/.env.example` for required variables.

## Frontend (4event-web)

Modern React website built with Vite, Tailwind CSS, and Framer Motion.

### Setup
```bash
cd 4event-web
pnpm install
pnpm run dev
```

Runs on `http://localhost:3000`

### Environment Variables
- `VITE_API_URL` - Backend API URL (default: `/api` with proxy in dev)

## Deployment (Railway)

Both services can be deployed from this monorepo:

1. **Backend Service**: Set Root Directory to `4event-server`
2. **Frontend Service**: Set Root Directory to `4event-web`

Configure `FRONTEND_URL` on backend for CORS.
Configure `VITE_API_URL` on frontend pointing to backend URL.
