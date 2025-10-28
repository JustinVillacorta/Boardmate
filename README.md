# Boardmate

Boardmate is a boarding house management system (MERN stack) with separate Backend (Express + MongoDB) and Frontend (React + Vite + TypeScript) apps.

## Monorepo layout
```
Boardmate/
├── Backend/   # Express API, MongoDB (Mongoose), cron jobs, receipts, notifications
└── Frontend/  # React + Vite + TS app (Admin, Staff, Tenant dashboards)
```

• Backend docs: see `Backend/README.md`
• Frontend docs: see `Frontend/README.md`

## Features at a glance
- Authentication for Admin/Staff and Tenants (JWT)
- Room management (CRUD, assignment, occupancy, stats)
- Payments (records, monthly generation, receipts, stats)
- Reports (maintenance/complaints with status + follow‑ups)
- Notifications (report status, payment reminders)

## Tech stack
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, PDFKit, node-cron
- Frontend: React 18, Vite 5, TypeScript, Tailwind CSS, Axios, React Router, Recharts

## Quick start (development)

1) Backend
```bash
cd Backend
npm install
copy .env.example .env   # if available, else create and fill values as below
npm run dev
```

Minimal Backend `.env` (example):
```env
NODE_ENV=development
PORT=8000
MONGODB_URI=mongodb://localhost:27017/boardmate
JWT_SECRET=change_me
JWT_EXPIRE=30d
BCRYPT_SALT_ROUNDS=12
CLIENT_URL=http://localhost:5173
```

2) Frontend
```bash
cd Frontend
npm install
echo VITE_API_URL=http://localhost:8000/api > .env
npm run dev
```

The frontend dev server runs on http://localhost:5173 (default). The backend on http://localhost:8000.

## Project structure highlights
- `Backend/controllers` – route handlers for auth, rooms, payments, reports, notifications
- `Backend/models` – Mongoose schemas (User, Tenant, Room, Payment, Report, Notification)
- `Backend/routes` – API route definitions
- `Backend/utils` – errors, receipts, notifications, cron jobs
- `Frontend/src/components` – reusable UI (dashboard cards, layout, tenant widgets, loading state)
- `Frontend/src/pages` – Admin/Staff/Tenant dashboards
- `Frontend/src/services` – Axios-based API services
- `Frontend/src/config/api.ts` – Axios instance and JWT interceptors

## Scripts
- Backend: `npm run dev` (nodemon), `npm start` (production)
- Frontend: `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`

## Notes
- Update `VITE_API_URL` to point to your backend `/api` base.
- Ensure CORS allows the frontend origin when running locally.
