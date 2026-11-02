# Technical Assessment & Dependency Specification: Plaud AI & Meta Integrations
**Document Version:** 1.0  
**Project:** Vanuit Ambacht Custom Craftsmanship Platform  
**Target Audience:** Tim, Bram & Development Team  
**Scope:** Phase 4 Third-Party External Integrations Assessment & Prerequisites  

---

## Executive Summary
This document provides an official update on the technical feasibility, integration pathways, and client prerequisites for **Plaud AI** (audio consultation recording & transcription) and **Meta** (Facebook & Instagram Lead Ads ingestion), in strict adherence to Section 3.8 and Section 7 of `NewClientRequirement.md`.

In accordance with our core delivery principle, **no third-party integration is connected into production until account ownership, API scopes, and security protocols are approved and provided by the business owners.**

---

## 1. Plaud AI Integration Assessment

### 1.1 Intended Business Use Case
Vanuit Ambacht craftsmen and sales representatives (Tim & Bram) regularly conduct:
1. **Onsite garden surveys & site visits** (measuring outdoor kitchen footprints, canopy foundations, wall conditions).
2. **Phone/Video design consultations** with prospective customers.

**Goal:** Automatically capture voice memos, meeting transcriptions, and generated action items from the Plaud device/mobile app directly into the Vanuit Ambacht CRM as a **Lead Note** or a **Project Activity Logbook Entry**.

---

### 1.2 Current Implementation Status
* **Status:** `Awaiting Client Account & API Access` (Technical design ready; awaiting credentials).
* **Codebase Readiness:** Backend schema already supports `documents`, `project_activity_logs`, and `conversations`. A dedicated ingestion endpoint (`POST /api/integrations/plaud/webhook`) is designed to parse incoming audio/transcripts.

---

### 1.3 Technical Integration Paths

| Integration Method | Feasibility | How It Works | Recommended? |
| :--- | :--- | :--- | :--- |
| **Option A: Plaud Cloud Webhook (Plaud Pro / Web)** | High | Plaud Web automatically triggers a POST webhook with audio transcript + summary whenever a recording finishes processing. | **Yes (Fastest & most autonomous)** |
| **Option B: Zapier / Make Webhook Relay** | High | Plaud connects natively to Zapier. Zapier forwards the processed transcript JSON to `https://api.vanuitambacht.nl/api/integrations/plaud`. | **Yes (Zero-code connection)** |
| **Option C: Direct REST API** | Medium | Periodic synchronization using a secret API token from `web.plaud.ai`. | Awaiting Plaud Developer Beta approval |

---

### 1.4 Data Privacy & Dutch GDPR (AVG) Compliance
> [!IMPORTANT]
> Under Dutch privacy law (Algemene Verordening Gegevensbescherming - AVG), recording phone calls or in-person meetings with private consumers requires:
> 1. **Prior Notification / Consent:** Customers must be informed that the consultation is being recorded for design specifications.
> 2. **Data Minimization:** Only project-relevant notes (e.g., dimensions, appliance choices, materials) should be permanently stored; raw biometric audio should have an automatic retention expiry (e.g., 60 days).

---

### 1.5 Client Action Items (What is needed from Tim & Bram)
To activate this integration, please provide the following details:
- [ ] **Plaud Account Tier:** Confirm if your Plaud account is registered at `web.plaud.ai`.
- [ ] **Preferred Output:**
  - *Option 1 (Recommended):* Text summary with bullet points and action items.
  - *Option 2:* Full verbatim transcript text.
  - *Option 3:* Full transcript + MP3 audio file attachment.
- [ ] **Target Destination:** Should recordings create a new Lead, or attach to an existing active Project?
- [ ] **API Access / Webhook Key:** Generate a webhook URL or API token from the Plaud Web portal. *(Share securely via environment variables or 1Password; never via plain chat).*

---

## 2. Meta (Facebook & Instagram) Integration Assessment

### 2.1 Intended Business Use Case
Vanuit Ambacht runs paid advertising campaigns across **Instagram** and **Facebook** showcasing luxury outdoor kitchens, louvered verandas, and bespoke garden rooms. When prospects click an ad:
1. They complete an on-platform **Meta Instant Form** (Name, Phone, Email, Postcode, Product Preference, Dimensions).
2. **Goal:** The submitted form must instantly stream into the Vanuit Ambacht CRM as a new record in `http://localhost:5173/admin/leads`, triggering an instant internal bell notification for Tim & Bram.

---

### 2.2 Current Implementation Status
* **Status:** `Awaiting Client Meta Business Manager Assets` (Architecture designed; awaiting App registration).
* **Codebase Readiness:** Backend `leads` table and Lead conversion pipelines are 100% operational. A dedicated webhook receiver (`POST /api/webhooks/meta-leads`) has been architected to parse Meta Real-Time Webhooks.

---

### 2.3 Technical Architecture & Permissions Needed

```
Instagram / Facebook User
        ↓ (Submits Instant Lead Form)
Meta Graph API Webhook
        ↓ (POST /api/webhooks/meta-leads)
Vanuit Ambacht Backend (HMAC SHA256 Signature Verified)
        ↓
Drizzle ORM Insert ➔ `leads` table (status: 'new')
        ↓
Admin Real-time Bell Notification + Lead Inbox
```

#### Required Meta Graph API Permissions:
1. `leads_retrieval`: Permission to fetch user data submitted through lead ads.
2. `pages_manage_ads`: Permission to associate ads with forms.
3. `pages_show_list` & `pages_read_engagement`: Permission to read the official Vanuit Ambacht Facebook/Instagram pages.

---

### 2.4 Security & App Review Requirements
> [!WARNING]
> Meta mandates that apps retrieving production lead data undergo **Meta Business Verification**.
> - Individual personal accounts cannot generate permanent production tokens.
> - A **System User** under the Vanuit Ambacht Meta Business Manager must be generated with permanent token access to prevent token expiration every 60 days.

---

### 2.5 Client Action Items (What is needed from Tim & Bram)
To connect Meta Lead Ads into your Vanuit Ambacht CRM:
- [ ] **Meta Business Manager Ownership:** Ensure Tim or Bram is the Business Admin of the Vanuit Ambacht Business Manager.
- [ ] **Facebook Page & Instagram Account Link:** Ensure the official Instagram page is linked to the primary Facebook Business Page.
- [ ] **App Registration:** Create an App in `developers.facebook.com` (App Type: Business).
- [ ] **Credentials to supply to developer via `.env`:**
  - `META_APP_ID`: Your Facebook App ID.
  - `META_APP_SECRET`: Your App Secret (used to verify HMAC SHA256 signatures).
  - `META_VERIFY_TOKEN`: A custom secret string configured in the Webhooks dashboard.
  - `META_PAGE_ACCESS_TOKEN` / `SYSTEM_USER_TOKEN`: A long-lived or permanent token.
- [ ] **Public Privacy Policy URL:** Required by Meta for form data collection (e.g. `https://vanuitambacht.nl/privacybeleid`).

---

## 3. Summary & Next Steps

| Integration | Immediate Blocker | Next Milestone |
| :--- | :--- | :--- |
| **Plaud AI** | Client export method & account confirmation | Provide Plaud Web account key or webhook URL |
| **Meta Ads** | Client Business Manager permissions & Page token | Generate System User Access Token in Business Manager |
| **Internal Chat** | None (Fully self-contained within Vanuit Ambacht DB) | Proceed with DB pool connection keepalive & UI validation |
