# EventRent

Event equipment rental platform with web frontend and Next.js backend.

## Project Structure

```
EventRent/
├── RaadArenda/       # Backend (Next.js API + Admin Panel)
├── eventrent-web/    # Frontend Website (Vite + React)
└── README.md
```

## Backend (RaadArenda)

Next.js application serving as API backend and admin panel.

### Setup
```bash
cd RaadArenda
npm install
npm run dev
```

Runs on `http://localhost:3001`

### Environment Variables
See `RaadArenda/.env.example` for required variables.

## Frontend (eventrent-web)

Modern React website built with Vite, Tailwind CSS, and Framer Motion.

### Setup
```bash
cd eventrent-web
npm install
npm run dev
```

Runs on `http://localhost:3000`

### Environment Variables
- `VITE_API_URL` - Backend API URL (default: `/api` with proxy in dev)

## Deployment (Railway)

Both services can be deployed from this monorepo:

1. **Backend Service**: Set Root Directory to `RaadArenda`
2. **Frontend Service**: Set Root Directory to `eventrent-web`

Configure `FRONTEND_URL` on backend for CORS.
Configure `VITE_API_URL` on frontend pointing to backend URL.
