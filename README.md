# OralScan

OralScan is a full-stack oral screening MVP with separate patient and doctor workflows.

It includes:
- Patient onboarding (mobile or email login)
- Guided oral image upload and supporting document upload (biopsy and consultation reports)
- AI triage pipeline with multilingual summaries
- Payment step before final analysis
- Doctor review workflow with structured notes
- In-app notification bell for patient and doctor dashboards

## Repository Structure

- frontend/: React 19 + Vite + TypeScript + Tailwind CSS v4
- backend/: Express + Prisma + PostgreSQL + JWT + S3/local uploads + Razorpay + WhatsApp

## Tech Stack

Frontend:
- React 19
- Vite
- TypeScript
- Tailwind CSS v4
- React Router
- jsPDF

Backend:
- Node.js + Express
- Prisma + PostgreSQL
- JWT auth + role-based access control
- Multer upload handling
- S3-compatible object storage (with local fallback in development)

## Quick Start

Prerequisites:
- Node.js 20+
- npm
- PostgreSQL running locally

1. Install dependencies at root

```bash
npm install
```

2. Configure env files

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

3. Backend setup

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

4. Run apps (from repository root)

```bash
npm run dev
```

This starts:
- Frontend: http://localhost:5173
- Backend: http://localhost:8080

## Scripts

From repository root:

```bash
npm run dev
npm run dev:frontend
npm run dev:backend
npm run build
npm run lint
```

From backend/:

```bash
npm run dev
npm run start
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

From frontend/:

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Seeded Accounts (Development)

- Patient identifier: patient@oralscan.test or 9876543210
- Patient password: Pass@1234
- Doctor identifier: doctor@oralscan.test or 9898989898
- Doctor password: Pass@1234

## Notification Behavior

Header bell notifications are role-based:

- Doctor receives notification when patient submits a case for review.
- Patient receives notification when doctor adds review content or marks case reviewed.

Notifications are derived from case state and refreshed periodically while logged in.

## Key Backend Endpoints

Auth:
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

Uploads:
- POST /api/uploads (form field: image, oral images)
- POST /api/uploads/document (form field: file, supports PDF/images)

Cases:
- POST /api/cases
- GET /api/cases/me
- GET /api/cases/:id
- PATCH /api/cases/:id/review

System:
- GET /health

## Local Development Notes

- Frontend uses Vite proxy to reach backend via /api.
- Backend serves local uploaded files in development from /uploads-local.
- Backend uses a development AI fallback response when AI inference URL is not configured.
- If backend start fails with EADDRINUSE on 8080, another backend process is already running.
