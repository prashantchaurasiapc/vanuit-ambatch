# WIREFRAME & APPLICATION BLUEPRINT – Vanuit Ambacht SaaS Management Portal

> **Full Application Layout & Architectural Blueprint**
>
> Version: 2.0 (Updated 3 August 2026)
> This document specifies the complete page hierarchy, layout structure, component blueprints, design system tokens, and responsive breakpoints for the **Vanuit Ambacht SaaS Portal**.

---

## 1. GLOBAL APPLICATION FLOW

```
                            Visitor
                               │
                               ▼
                       ┌───────────────┐
                       │  Login Page   │
                       │   (/login)    │
                       └───────┬───────┘
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
       ┌─────────────────┐           ┌─────────────────┐
       │   Admin Role    │           │  Partner Role   │
       │   (/admin/*)    │           │   (/partner/*)  │
       └────────┬────────┘           └────────┬────────┘
                │                             │
    ┌───────────┴───────────┐     ┌───────────┴───────────┐
    │ Admin Modules         │     │ Partner Modules       │
    ├─ Dashboard (Hero+KPIs)│     ├─ Dashboard            │
    ├─ Leads & 7-Step Wizard│     ├─ My Projects          │
    ├─ Dynamic Quotes PDF   │     ├─ Price Requests Inbox │
    ├─ Projects Tracker     │     ├─ Planning Calendar    │
    ├─ Partner Directory    │     └─ Company Profile      │
    ├─ Plaud AI Tasks       │     └───────────────────────┘
    ├─ Accounting & Bank    │
    └─ Settings & Templates │
    └───────────────────────┘
```

---

## 2. DETAILED MODULE WIREFRAME DESCRIPTIONS

### 2.1 Admin Dashboard (`/admin/dashboard`)
```
┌────────────────────────────────────────────────────────────────────────┐
│  Widescreen Hero Banner (h-[300px] / aspect-[16/5])                    │
│  Image: Luxury outdoor kitchen photo (dasbordes images.png)            │
│  Title: Beheerdersdashboard | Subtitle: Overzicht van uw activiteiten  │
│  [Top-Right Corner]: [+ Nieuwe lead]  [+ Offerte Maken] (Compact)       │
└────────────────────────────────────────────────────────────────────────┘
│  Date Range Filter Bar: [Last 7 days | Last 30 days | Current Month...]│
├────────────────────────────────────────────────────────────────────────┤
│  7 KPI Cards Grid:                                                     │
│  [Total Leads] [Cost/Lead] [Quotes Sent] [Quote %] [Won] [Conv %] [Meta]│
└────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Leads Management & 7-Step Wizard (`/admin/leads`)
```
┌────────────────────────────────────────────────────────────────────────┐
│  Leads Table with Direct Dropdown Status & Source Tags                 │
│  Columns: Klantnaam | Product Type | Bron/Meta | Status [▼] | Actions   │
├────────────────────────────────────────────────────────────────────────┤
│  Quick Action Choices:                                                 │
│  [Prijsaanvraag partner] ➔ Opens Simplified 7-Step Wizard             │
│  [Offerte maken]         ➔ Opens 6-Page Dynamic PDF Quote Generator    │
├────────────────────────────────────────────────────────────────────────┤
│  7-Step Project Wizard Steps (Planning/Dates Removed):                 │
│  1. Projecttype ➔ 2. Basisgegevens ➔ 3. Ontwerp & Maten ➔            │
│  4. Materialen ➔ 5. Locatie ➔ 6. Foto's & Render ➔ 7. Controleren     │
├────────────────────────────────────────────────────────────────────────┤
│  Lead Details Modal:                                                   │
│  Workflow Step Tracker ➔ Process Section ➔ Repositioned Action Buttons:│
│  [WhatsApp]  [Bellen]  [E-mail] (below process section)                │
│  + 3 Pre-filled Dutch Message Templates (Initial, Follow-up 1, 2)      │
│  + 3-Day Red Warning Alert Badge ("3 days ago")                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Dynamic 6-Page Quotation (Offerte) Builder (`/admin/quotes`)
```
┌────────────────────────────────────────────────────────────────────────┐
│  Quotation Builder Form & Live Preview Dual-Pane Layout                │
│  [Form Inputs] ➔ Realtime Iframe Preview ➔ [Download PDF / Link]       │
├────────────────────────────────────────────────────────────────────────┤
│  6-Page Pixel-Perfect A4 Dutch PDF Blueprint:                          │
│  Page 1: Cover Page (Dark Green #3E4E36, Title, 3-Photo Strip, Footer)  │
│  Page 2: Intro Letter ("Beste Bjorn,") + Founders Card + 4 USP Cards   │
│  Page 3: Uw Configuratie (4 Stat Tiles, Specs, Photo Frame, 2D Diagram)│
│  Page 4: Investering (Pricing Table, "Inbegrepen", 50/50 Payment Terms)│
│  Page 5: 5-Step Process Timeline + Guarantee Policy Cards              │
│  Page 6: Akkoord Page (WhatsApp/Email CTAs + 2 Signature Boxes + KvK)  │
├────────────────────────────────────────────────────────────────────────┤
│  Digital Approval Link Flow (.../offerte/{token}):                    │
│  Online View ➔ Floating [Akkoord geven] ➔ T&C Consent ➔ Auto Status   │
│  Akkoord + Stamp PDF + Email Customer + Alert info@vanuitambacht.nl    │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.4 Plaud AI Task Management (`/admin/tasks`)
```
┌────────────────────────────────────────────────────────────────────────┐
│  Plaud AI Meeting Audio & Transcript Manager                           │
│  [Upload / Record Plaud Audio] ➔ [AI Analyze Conversation]             │
├────────────────────────────────────────────────────────────────────────┤
│  Auto-Generated Tasks Board:                                           │
│  Column: Open Taken | In Behandeling | Afgerond                       │
│  Cards: Title, Assignee (Tim/Bram), Due Date, Priority Tag             │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.5 Accounting & Bank Statement Import (`/admin/accounting`)
```
┌────────────────────────────────────────────────────────────────────────┐
│  Accounting Navigation Tabs: [Overzicht | Facturen | Bank | Btw]       │
├────────────────────────────────────────────────────────────────────────┤
│  Bank Section Header: [Import Bank Statements] Button                  │
│  Format Selector Dropdown (Bestandsformaat):                           │
│  - PDF                                                                 │
│  - Excel (TXT)                                                         │
│  - Excel (XLS)                                                         │
├────────────────────────────────────────────────────────────────────────┤
│  Parsed Bank Transactions Table & Ledger Reconciliation                │
└────────────────────────────────────────────────────────────────────────┘
```
