# 01 · Business Requirements — Vanuit Ambacht ERP / CRM

## 1. Executive Summary & Company Profile
**Vanuit Ambacht** is a premier Dutch luxury carpentry and bespoke outdoor living brand founded by craftsmen Tim and Bram. The company specializes in two core high-ticket custom products:
1. **Buitenkeukens (Luxury Outdoor Kitchens):** Bespoke wooden kitchen counters crafted with Teak, Thermo Fraké, or Douglas timber, integrated with premium ceramic/Dekton/polished concrete cire countertops, Kamado BBQ cutouts (Big Green Egg, Kamado Joe), bar fridges, and soft-close storage.
2. **Buitenverblijven & Overkappingen (Garden Rooms, Poolhouses & Canopies):** Heavy timber architectural constructions featuring massive Oak/Douglas beams (15×15 cm), insulated walls, EPDM roofing with zinc trimmings, and multi-panel steel-look glass sliding doors.

The ERP/CRM system unifies lead intake, tender pricing with certified external craftsmen (partners), luxury digital quotation generation, on-site construction tracking, milestone billing, and Dutch statutory double-entry bookkeeping into a cohesive platform.

---

## 2. Core Stakeholders & Portals
1. **Admin Portal (`/admin/*`):** Used by company founders (Tim & Bram) to manage sales pipelines, dispatch price requests to partners, build 6-page digital proposals, schedule installation calendars, issue VAT invoices, and monitor financial P&L.
2. **Partner Portal (`/partner/*`):** Used by certified external craftsmen (e.g., Sven Hoek of *Hoek Bouw*, Ruben Verbeij of *RV Meubels*) to receive technical inquiries, submit cost bids, access technical CAD blueprints and work orders (`Werkorder`), upload workshop progress photos, and generate handover sign-off certificates (`Opleverrapport`).
3. **Customer Portal (`/customer/*` & `/offerte/:token`):** A client-facing portal and public proposal link allowing homeowners to inspect interactive 3D renders, review investment specifications, execute legal digital signatures, track project build milestones, and confirm delivery time slots.

---

## 3. End-to-End Sales & Project Lifecycle

### 3.1. Lead Intake & 8-Step Sales Funnel
Every customer engagement progresses through an 8-step pipeline tracked in `WorkflowTracker`:
* **Step 1 — New Lead:** Inquiries originate via website forms, referrals, or phone consultations.
* **Step 2 — Partner Price Request:** Routing decision:
  * *Tender Routing:* Opens the **7-Step Partner Price Request Wizard** (Category → Info → Dimensions → Materials → Location Access → Photos → Dispatch) to request build costs from craftsmen.
  * *Direct Bypass:* Standard models skip partner bidding and proceed immediately to quotation.
* **Step 3 — Partner Price Received:** Partner submits cost price (labor hours + material expenditure). Admin reviews wholesale margins.
* **Step 4 — Build the Quote:** 6-Step Quote Editor compiles wholesale costs, margin additions, 2D interactive layouts, line items, and Dutch installment terms.
* **Step 5 — Review & Send:** Generates the official 6-Page Offerte PDF. Dispatches public token link via WhatsApp or Email.
* **Step 6 — Customer Approval:** Homeowner reviews proposal on `/offerte/:token` and applies digital signature. Advance deposit is scheduled. Status becomes `Won`.
* **Step 7 — Create Project:** Automatically provisions a new Project (`PRJ-xxx`) and generates workshop work orders (`WO-xxx`).
* **Step 8 — Planning & Delivery:** Locks site installation dates into the planning calendar. Handover sign-off generates the completion report (`OP-xxx`).

### 3.2. Plaud AI Voice Note Sync
Founders record on-site consultations and phone calls via Plaud AI voice hardware. The audio file (`.mp3`) is synced to the lead. Plaud AI transcribes the conversation, generates an executive summary, and automatically schedules follow-up tasks assigned to Tim or Bram.

---

## 4. Distinct Product Lifecycles

| Dimension | Outdoor Kitchen (Buitenkeuken) | Garden Room (Buitenverblijf / Poolhouse) |
| :--- | :--- | :--- |
| **Prefabrication** | 90% built in workshop | Modular components prefabricated in workshop |
| **Delivery Model** | **Single-Day Delivery Slot:** 1–2 hours placement & explanation | **Multi-Week On-Site Construction:** 4 sequential phases |
| **Phases** | Workshop Build → Delivery & Placement | 1. Groundwork & Foundation<br>2. Timber Framing & Beams<br>3. Roof System & EPDM<br>4. Glass Walls & Finishing |
| **Customer Approval** | 1-Click delivery time slot confirmation | Milestone progress tracker + live photo updates |

---

## 5. Invoicing & Dutch Bookkeeping Requirements
* **Installment Billing (Termijnfacturen):**
  * Typically 50% upfront down payment upon quote approval, 50% upon delivery/completion.
  * Alternatively 3-part: 30% upon approval, 60% upon start of construction, 10% upon final delivery.
* **Dutch Tax Compliance (Belastingdienst):**
  * 21% standard VAT on materials, furniture, and appliances.
  * 9% reduced VAT or 0% reverse-charge (*btw verlegd*) for subcontracted construction labor where applicable.
* **Double-Entry Accounting:** Full compatibility with Dutch Chart of Accounts (*Grootboekrekeningen* 1000 Bank, 1300 Debiteuren, 1500 BTW, 7000 Inkoop, 8000 Omzet).
* **3-Way Reconciliation:** Multi-channel payouts (e.g., Bol.com gross revenue vs commission fees vs net bank payout).
