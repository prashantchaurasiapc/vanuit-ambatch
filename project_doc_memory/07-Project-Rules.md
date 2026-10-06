# 07 · Golden Project Rules & Engineering Guidelines

## Rule 1: Non-Destructive Frontend Principle
* **Do NOT modify existing UI layouts, PDF templates, or typography.**
* The frontend React prototype is mature and visually client-approved. Any backend integration must adapt to the frontend contracts, not vice versa.
* Never break existing PDF generators (`Offerte6PagePDF`, `FactuurPDFTemplate`, `PartnerPdfTemplates`, `pdfGenerator.js`).

## Rule 2: Strict Foreign Key Referential Integrity
* Never use hardcoded user name strings (e.g., `'Tim'`, `'Bram'`). Always reference `users.id` foreign keys.
* Never link entities loosely via string parsing. Use UUID primary keys and proper foreign key constraints.

## Rule 3: Single Source of Truth & Zero Derived Storage
* Never store calculated derived figures (such as customer total lifetime spend, active project counts, or invoice balance due) as authoritative database columns.
* Storing derived totals leads to data drift and reconciliation bugs. Always compute aggregates via SQL queries or database views.

## Rule 4: Partner & Commercial Confidentiality
* Partner views and API responses must NEVER leak retail customer quotation totals, retail margins, or sales commission percentages.
* Subcontracted craftsmen only see their agreed build price and technical carpentry specifications.

## Rule 5: Double-Entry Immutable Accounting Rule
* Journal vouchers must never be manually marked as balanced.
* Every journal entry must enforce the fundamental accounting equation at the line level:
  $$\sum \text{Debit} = \sum \text{Credit}$$
* Financial entries are append-only. To correct an error, create a reversing journal entry; never mutate historical closed periods.

## Rule 6: Gradual Transition from Mock Data
* Do NOT delete `mockData.js` or wipe `localStorage` fallback logic until backend endpoints and database seed scripts have been fully tested and validated.
* Initial database seeding will use `mockData.js` records (`PRJ-101`, `OF-2026418`, `OF-2026-014`, `Sven Hoek`, `Ruben Verbeij`) to ensure smooth continuity.
