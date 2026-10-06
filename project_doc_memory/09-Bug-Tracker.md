# 09 · Bug Tracker & Technical Risk Mitigation

## 1. Historical Issues Solved in Frontend Prototype

| Bug ID | Component | Symptom | Root Cause | Solution Implemented |
| :---: | :--- | :--- | :--- | :--- |
| **BUG-001** | `storageHelper.js` | `QuotaExceededError` crashes browser on photo upload | Base64 raw image strings exceeding 5MB localStorage quota | Canvas-based HTML5 compression utility (`compressImage`) downscaling images to ~50–150KB. |
| **BUG-002** | `PartnerProjects.jsx` | Partner projects showed "ASSIGNED: 0" on live Netlify | Partner filter mismatch when sessions load without initialized partner names | Fallback resolution mechanism in `useEffect` guaranteeing Sven Hoek sample projects load for live demonstrations. |
| **BUG-003** | `QuoteEditor.jsx` | Fixed text disclaimers could not be edited in proposal | Disclaimers and validity text were hardcoded in JSX | Added direct editable cards in Step 4 for Asterisk Note, Btw Footnote, and custom installment subtexts. |
| **BUG-004** | Project Root | Stray scripts and loose PDFs cluttering repository | Legacy scratch scripts from logo cropping and unorganized client documents | Restructured into `clint_pdf/`, `project_doc_memory/`, and deleted redundant scratchpads. |

---

## 2. Anticipated Backend Risks & Architectural Defenses

### Risk 1: Circular Foreign Key Lock (`quotes` vs `quote_versions`)
* *Symptom:* Inserting a new quote fails because `current_version_id` requires a version that cannot exist before the quote itself.
* *Defense:* Eliminated circular FK. `quotes` has no foreign key to versions. Versions belong to quote (`quote_id`) with a partial unique index on `is_current = true`.

### Risk 2: Split Settlement & Multi-Invoice Bank Payouts
* *Symptom:* A single ABN AMRO bank line of €10,000 settles two invoices, breaking 1:1 foreign key reconciliation.
* *Defense:* Introduced `payment_allocations` associative table with M:N settlement linking.

### Risk 3: Partner Price Leakage via API Responses
* *Symptom:* A developer inadvertently queries all quote fields in a partner endpoint, exposing retail markup to the craftsman.
* *Defense:* Fastify Drizzle query serializers will explicitly project partner-safe DTOs, stripping retail line items, margins, and customer invoices from partner endpoints.
