# 10 · Deployment & Environment Configuration Guide

## 1. Architecture Deployment Topology

```text
┌─────────────────────────────────┐
│     Client Browsers            │
│  (Desktop, Tablet, Mobile)      │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│   Netlify / Cloudflare Pages    │
│  - Hosts: frontend/dist/        │
│  - SPA rewrite: /* -> /index.html│
└──────────────┬──────────────────┘
               │ HTTPS API Requests (/api/*)
               ▼
┌─────────────────────────────────┐
│   Backend Application Host      │
│  (Fastify Node.js / Docker)     │
│  - Port: 3001                   │
│  - Hosts: REST API & Auth JWT   │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│     PostgreSQL 16 Database      │
│  (Supabase / Neon / AWS RDS)    │
│  - Managed Connection Pooling   │
└─────────────────────────────────┘
```

---

## 2. Environment Variables Checklist

### Backend Environment Variables (`backend/.env`):
```ini
# Server Configuration
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://ambatch.netlify.app

# Database Connection (PostgreSQL)
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/vanuit_ambacht?sslmode=require

# Authentication & Security
JWT_SECRET=super-secret-jwt-key-min-32-chars
JWT_EXPIRATION=7d

# Third-Party Integrations
MOLLIE_API_KEY=live_xxxxxxxxxxxx
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=xxxxxxxxxxxx
RESEND_API_KEY=re_xxxxxxxxxxxx
PLAUD_AI_API_KEY=xxxxxxxxxxxx

# File Upload Storage (Local or Cloud S3)
STORAGE_DRIVER=local
UPLOAD_DIR=./uploads
```

### Frontend Environment Variables (`frontend/.env`):
```ini
VITE_API_BASE_URL=https://api.vanuitambacht.nl
```

---

## 3. Frontend Deployment (Netlify)
The root `netlify.toml` automatically points Netlify to the `frontend` subfolder:
```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
Every git push to `main` automatically triggers a zero-downtime rebuild and deploy.
