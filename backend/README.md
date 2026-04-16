# OralScan Backend (Node.js)

Backend API for OralScan with:

- JWT authentication
- Role-based access control (PATIENT, DOCTOR, ADMIN)
- PostgreSQL via Prisma
- S3-compatible image storage
- CNN cloud inference API proxy
- Razorpay order + webhook handling
- WhatsApp Cloud API messaging

## 1. Setup

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

Health check: `GET http://localhost:8080/health`

## 2. API Summary

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Uploads (S3-compatible)

- `POST /api/uploads` (multipart form-data: `image`)

### Cases

- `POST /api/cases` (PATIENT/ADMIN)
- `GET /api/cases/me`
- `GET /api/cases/:id`
- `PATCH /api/cases/:id/review` (DOCTOR/ADMIN)

### AI (CNN cloud inference)

- `POST /api/ai/classify` (DOCTOR/ADMIN)

### Payments (Razorpay)

- `POST /api/payments/order`
- `POST /api/payments/webhook`

### WhatsApp

- `POST /api/whatsapp/send` (DOCTOR/ADMIN)

## 3. Notes

- AI URL, Razorpay, and WhatsApp env vars are required for full production behavior.
- Configure `S3_PUBLIC_BASE_URL` to serve uploaded case images directly.
- Use a strong `JWT_SECRET` in production.
