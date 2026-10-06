# 02 · Roles & Permissions Matrix — Vanuit Ambacht

## 1. Overview of User Roles
The system enforces strict role-based access control (RBAC) across three authenticated roles and one unauthenticated public scope:
1. **`admin`:** Full administrative access (Founders Tim & Bram).
2. **`partner`:** Certified external craftsmen (Sven Hoek, Ruben Verbeij, etc.).
3. **`customer`:** Homeowner clients with an active or completed build.
4. **`public`:** Unauthenticated access restricted strictly to tokenized proposal approval (`/offerte/:token`).

---

## 2. Granular Permissions Matrix

| Functional Area / Entity | `admin` | `partner` | `customer` | `public` |
| :--- | :---: | :---: | :---: | :---: |
| **Leads & Pipeline** | Full CRUD | ❌ None | ❌ None | ❌ None |
| **Plaud AI Audio & Transcripts** | Full CRUD | ❌ None | ❌ None | ❌ None |
| **Commercial Actions** | Full CRUD | ❌ None | ❌ None | ❌ None |
| **Tasks Board** | Full CRUD | ❌ None | ❌ None | ❌ None |
| **Partner Price Requests** | Full CRUD | Read assigned only | ❌ None | ❌ None |
| **Partner Price Bids (Offers)** | Read & Accept/Decline | Create & Revise own bids | ❌ None | ❌ None |
| **Quotes & Quote Versions** | Full CRUD | ❌ None | Read accepted only | Read via token |
| **Digital Proposal Signing** | View signatures | ❌ None | Execute signature | Execute signature |
| **Projects (Master View)** | Full CRUD | ❌ None | ❌ None | ❌ None |
| **Projects (Assigned Scope)** | Full CRUD | Read assigned & update production status | Read own project only | ❌ None |
| **CAD Blueprints & Technical Specs** | Full CRUD | Read & Download assigned | Read approved only | ❌ None |
| **Werkorders (`WO-xxx`)** | Full CRUD | Read & Download assigned | ❌ None | ❌ None |
| **Opleverrapport (`OP-xxx`)** | Full CRUD | Generate & Sign assigned | Read own signed copy | ❌ None |
| **Workshop & Site Photos** | Full CRUD | Upload & View assigned | View customer-flagged only | ❌ None |
| **Planning Calendar (All Lanes)** | Full CRUD | View & Update workshop/bouw lanes | View own delivery slot only | ❌ None |
| **Invoices (`Factuur`)** | Full CRUD | ❌ None | Read & Pay own invoices | ❌ None |
| **Bank Statements & Ledger** | Full CRUD | ❌ None | ❌ None | ❌ None |
| **Profit & Loss / Margins** | Full CRUD | ❌ None (Confidential) | ❌ None | ❌ None |
| **Internal Messages / Chat** | Full CRUD | Chat in assigned projects | Chat in own project | ❌ None |

---

## 3. Strict Confidentiality & Visibility Gates

### Rule 1: Partner Pricing Confidentiality
* **Partners must NEVER see:**
  * Retail customer quotation totals (`quotes.total_incl_vat`).
  * Vanuit Ambacht gross profit margins or markup percentages.
  * Customer payment status or customer invoices.
* **Partners can ONLY see:**
  * Agreed wholesale construction compensation (`projects.agreed_build_price`).
  * Technical delivery specifications, dimensions, site access restrictions, and CAD blueprints.

### Rule 2: Customer Visibility Isolation
* **Customers must NEVER see:**
  * Wholesale partner bids (`partner_offers`).
  * Internal commercial sales notes or Plaud AI consultation audio.
  * Work orders designated for subcontractors (`Werkorder`).
* **Customers can ONLY see:**
  * Approved 3D renders and 2D layouts.
  * Publicly flagged progress photos from the workshop.
  * Their own milestones, delivery confirmation button, invoices, and signed proposal.
