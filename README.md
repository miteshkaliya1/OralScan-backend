# OralScan

OralScan is split into two applications:

- Frontend at the repository root: React, Vite, TypeScript, Tailwind CSS
- Backend in `backend/`: Node.js, Express, Prisma, PostgreSQL, S3-compatible uploads, Razorpay, WhatsApp, AI inference proxy

The frontend talks to the backend only through `/api` endpoints. In local development, Vite proxies `/api` requests to the backend server on port `8080`.

## Stack

- React 19
- Vite
- TypeScript
- Tailwind CSS v4
- jsPDF

## Frontend

Run the frontend from the repository root:

```bash
npm install
cp .env.example .env
npm run dev
```

Default frontend environment:

```bash
VITE_API_BASE_URL=/api
```

## Backend

Node backend is available under `backend/` with JWT auth, role-based access, PostgreSQL (Prisma), S3-compatible storage, AI cloud inference API proxy, Razorpay, and WhatsApp APIs.

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

Default backend origin allowlist:

```bash
CORS_ORIGIN=http://localhost:5173
```

## Notes

- Only `vite.config.ts` is required. `vite.config.js` and `vite.config.d.ts` are generated artifacts and should not be kept.
- Configure production credentials and allowed frontend origins in the frontend and backend env files before deployment.# OralScan
