# OralScan Backend

Backend API for OralScan patient and doctor workflows.

## Features

- JWT authentication
- Role-based access control for PATIENT, DOCTOR, ADMIN
- Prisma + PostgreSQL data layer
- S3-compatible uploads with local fallback in development
- AI classification proxy endpoint
- Razorpay order and webhook endpoints
- WhatsApp notification endpoint

## Setup

1. Go to backend directory

```bash
cd backend
```

2. Configure environment

```bash
cp .env.example .env
```

3. Install dependencies and prepare database

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

4. Start backend

```bash
npm run dev
```

Health check:

```text
GET http://localhost:8080/health
```

## Scripts

```bash
npm run dev
npm run start
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
npm run seed
```

## Seeded Accounts (Development)

- Patient identifier: patient@oralscan.test or 9876543210
- Patient password: Pass@1234
- Doctor identifier: doctor@oralscan.test or 9898989898
- Doctor password: Pass@1234

## Key API Endpoints

Auth:
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

Uploads:
- POST /api/uploads (multipart form-data field: image, oral image upload route)
- POST /api/uploads/document (multipart form-data field: file, supports PDF and image uploads for supporting reports)

Cases:
- POST /api/cases
- GET /api/cases/me
- GET /api/cases/:id
- PATCH /api/cases/:id/review

AI:
- POST /api/ai/classify

Payments:
- POST /api/payments/order
- POST /api/payments/webhook

WhatsApp:
- POST /api/whatsapp/send

## Local Development Notes

- Set CORS_ORIGIN to include frontend origin, usually http://localhost:5173 in local development.
- Local file fallback is served from uploads-local when development upload to S3 is unavailable.
- When AI_INFERENCE_URL is missing in development, API classification falls back to a local mock result using model cnn-oral-lesion-v1.
- Use strong JWT_SECRET and real provider credentials in production.
- If port 8080 is already in use, stop the existing backend process before running npm run start.
