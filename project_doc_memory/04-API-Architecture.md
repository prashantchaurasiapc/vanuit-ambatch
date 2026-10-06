# 04 · API Architecture & REST Specifications (Fastify + TypeScript)

## 1. Stack & Architecture Overview
* **Runtime & Framework:** Node.js (v20+) with Fastify for high-throughput async processing.
* **Language:** TypeScript with strict type checking.
* **ORM & Query Builder:** Drizzle ORM paired with `postgres` (or `pg` pool).
* **Validation & Schemas:** Zod schemas shared across request validation and TypeScript inferred types.
* **Authentication:** Fastify JWT plugin (`@fastify/jwt`) with HttpOnly secure cookie or Bearer token header.

---

## 2. API Endpoints Catalog

### 2.1. Authentication (`/api/auth`)
* `POST /api/auth/login` — Authenticates credentials, returns `{ token, user: { id, email, role, full_name } }`.
* `POST /api/auth/logout` — Invalidates session.
* `GET /api/auth/me` — Returns current authenticated profile.

### 2.2. Leads & Sales Pipeline (`/api/leads`)
* `GET /api/leads` — Query leads with filters (`status`, `workflow_step`, `assigned_to`).
* `POST /api/leads` — Create initial intake lead.
* `GET /api/leads/:id` — Full details including voice notes, commercial actions, and tender requests.
* `PATCH /api/leads/:id/workflow-step` — Advance step (1 through 8).
* `POST /api/leads/:id/voice-notes` — Upload Plaud AI audio (`.mp3`), transcript, and AI summary.
* `POST /api/leads/:id/commercial-actions` — Append sales consultation note and optional follow-up task.

### 2.3. Partner Tendering & Wizard (`/api/partner-requests`)
* `POST /api/partner-requests` — Admin dispatches 7-step wizard payload to a craftsman.
* `GET /api/partner/requests` — Partner views pending price inquiries.
* `POST /api/partner/requests/:id/offers` — Partner submits cost price, labor hours, and notes (Revision v1, v2).
* `PATCH /api/partner-requests/:id/select-offer` — Admin accepts specific partner offer for quotation compilation.

### 2.4. Quotes & Public Offerte (`/api/quotes`)
* `GET /api/quotes` — Admin quote overview.
* `POST /api/quotes` — Initialize quote draft from Lead or Customer.
* `POST /api/quotes/:id/versions` — Publish new immutable revision from 6-step quote editor.
* `GET /api/offerte/:token` — **Public endpoint** serving 6-page proposal payload for customer review.
* `POST /api/offerte/:token/approve` — Executes digital signature SVG capture, sets status to `Approved`, and triggers project creation.

### 2.5. Projects & Planning (`/api/projects`, `/api/planning`)
* `GET /api/projects` — Master project inbox (query by `project_type`: `outdoor_kitchen` vs `garden_room`).
* `GET /api/projects/:id` — Comprehensive project dossier (specs, milestones, photos, documents).
* `PATCH /api/projects/:id/production-status` — Craftsman or Admin updates production state.
* `POST /api/projects/:id/photos` — Craftsman uploads workshop progress photo with customer visibility toggle.
* `POST /api/projects/:id/approve-delivery` — Customer 1-click delivery date approval.
* `GET /api/planning/events` — Calendar events partitioned by lane (`delivery_lane`, `bouw_lane`, `workshop_lane`).
* `POST /api/planning/events` — Create calendar entry.

### 2.6. Invoices, Payments & Ledger (`/api/invoices`, `/api/bank`)
* `GET /api/invoices` — List invoices with calculated VAT breakdown.
* `POST /api/invoices` — Issue milestone invoice (50% upfront or final).
* `POST /api/payments` — Log payment receipt (Mollie iDEAL or bank transfer).
* `POST /api/bank/import-statement` — Parse MT940 / CAMT.053 file and insert `bank_transactions`.
* `POST /api/bank/reconcile` — Match bank credit with invoice payment and generate balanced `journal_entries`.
* `GET /api/reports/taxes` — Quarterly Dutch BTW (VAT) report (Rubrieken 1a, 1b, 5b).
* `GET /api/reports/profit-loss` — Real-time P&L per project.

---

## 3. Standard JSON Response Formats

### Success Response:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 20
  }
}
```

### Error Response:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Invalid investment line item values",
    "details": [
      { "field": "unit_price_incl_vat", "issue": "Must be greater than 0" }
    ]
  }
}
```
