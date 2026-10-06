# 03 · Relational Database Schema — Vanuit Ambacht (PostgreSQL + Drizzle)

## 1. Architectural Principles
* **Internal UUID Primary Keys:** Every entity utilizes a cryptographic `UUID` PK (`gen_random_uuid()`).
* **Human-Readable Business Numbers:** Sequenced business identifiers (`lead_number`, `quote_number`, `project_number`, `invoice_number`, `task_number`) are stored as separate indexed `UNIQUE` columns.
* **No Circular Foreign Keys:** Multi-revision proposals use `quote_versions(quote_id)` with a partial unique index `is_current = true`, completely eliminating chicken-and-egg insertion locks.
* **No Redundant Stored Derived Totals:** Customer lifetime spend, project counts, and unpaid invoice balances are calculated via SQL views/aggregates.
* **Double-Entry Integrity:** Vouchers are balanced at the line level: `SUM(debit) = SUM(credit)`.
* **Strong Foreign Keys for Documents:** The `documents` table uses explicit nullable foreign key columns (`project_id`, `quote_id`, `partner_id`, `lead_id`, `invoice_id`) with check constraints, avoiding loose polymorphic typing.

---

## 2. Complete Entity Specifications

### 2.1. Authentication & Master Profiles
1. **`users`**
   * `id`: `UUID` (PK)
   * `email`: `VARCHAR(255)` (UNIQUE, NOT NULL)
   * `password_hash`: `VARCHAR(255)` (NOT NULL)
   * `role`: `ENUM('admin', 'partner', 'customer')` (NOT NULL)
   * `full_name`: `VARCHAR(150)` (NOT NULL)
   * `phone`: `VARCHAR(50)`
   * `is_active`: `BOOLEAN` (DEFAULT `true`)
   * `created_at`, `updated_at`: `TIMESTAMPTZ`

2. **`customers`**
   * `id`: `UUID` (PK)
   * `user_id`: `UUID` (FK -> `users.id`, NULLABLE)
   * `customer_number`: `VARCHAR(50)` (UNIQUE, NOT NULL, e.g. `'CUST-101'`)
   * `company_name`: `VARCHAR(150)` (NULLABLE)
   * `first_name`: `VARCHAR(100)` (NOT NULL)
   * `last_name`: `VARCHAR(100)` (NOT NULL)
   * `email`: `VARCHAR(255)` (NOT NULL)
   * `phone`: `VARCHAR(50)` (NOT NULL)
   * `street_address`: `VARCHAR(255)`
   * `postal_code`: `VARCHAR(20)`
   * `city`: `VARCHAR(100)` (NOT NULL)
   * `country`: `VARCHAR(50)` (DEFAULT `'NL'`)
   * `notes`: `TEXT`
   * `created_at`, `updated_at`: `TIMESTAMPTZ`

3. **`partners`**
   * `id`: `UUID` (PK)
   * `user_id`: `UUID` (FK -> `users.id`, NULLABLE)
   * `partner_code`: `VARCHAR(50)` (UNIQUE, NOT NULL, e.g. `'PART-000B'`)
   * `company_name`: `VARCHAR(150)` (NOT NULL, e.g. `'Hoek Bouw'`)
   * `contact_person`: `VARCHAR(150)` (NOT NULL)
   * `email`: `VARCHAR(255)` (NOT NULL)
   * `phone`: `VARCHAR(50)` (NOT NULL)
   * `kvk_number`: `VARCHAR(50)`
   * `btw_number`: `VARCHAR(50)`
   * `region`: `VARCHAR(100)` (e.g. `'Utrecht'`)
   * `workload_status`: `ENUM('available', 'busy', 'fully_booked', 'inactive')` (DEFAULT `'available'`)
   * `rating`: `NUMERIC(3,2)` (DEFAULT 5.00)
   * `specialties`: `TEXT[]`
   * `product_types`: `TEXT[]`
   * `is_active`: `BOOLEAN` (DEFAULT `true`)
   * `created_at`, `updated_at`: `TIMESTAMPTZ`

---

### 2.2. Leads & Sales Intake
4. **`leads`**
   * `id`: `UUID` (PK)
   * `lead_number`: `VARCHAR(50)` (UNIQUE, NOT NULL, e.g. `'L-1001'`)
   * `customer_id`: `UUID` (FK -> `customers.id`, NULLABLE)
   * `name`: `VARCHAR(150)` (NOT NULL)
   * `email`: `VARCHAR(255)`
   * `phone`: `VARCHAR(50)`
   * `address`: `VARCHAR(255)`
   * `city`: `VARCHAR(100)`
   * `product_type`: `ENUM('outdoor_kitchen', 'garden_room', 'canopy', 'bin_storage')` (NOT NULL)
   * `dimensions_inquiry`: `VARCHAR(100)`
   * `source`: `VARCHAR(100)`
   * `status`: `ENUM('new', 'in_conversation', 'price_requested', 'price_received', 'quote_sent', 'won', 'lost')` (DEFAULT `'new'`)
   * `workflow_step`: `SMALLINT` (DEFAULT 1, CHECK `1 <= workflow_step <= 8`)
   * `assigned_to_user_id`: `UUID` (FK -> `users.id`, NOT NULL)
   * `lost_reason`: `TEXT`
   * `created_at`, `updated_at`: `TIMESTAMPTZ`

5. **`lead_voice_notes`**
   * `id`: `UUID` (PK)
   * `lead_id`: `UUID` (FK -> `leads.id`, CASCADE, NOT NULL)
   * `uploaded_by_user_id`: `UUID` (FK -> `users.id`, NOT NULL)
   * `file_name`: `VARCHAR(255)` (NOT NULL)
   * `file_url`: `TEXT` (NOT NULL)
   * `duration_seconds`: `INTEGER`
   * `recording_date`: `TIMESTAMPTZ` (NOT NULL)
   * `transcript_text`: `TEXT`
   * `ai_summary`: `TEXT`
   * `extracted_specs`: `JSONB`
   * `created_at`: `TIMESTAMPTZ` (DEFAULT `NOW()`)

6. **`commercial_actions`**
   * `id`: `UUID` (PK)
   * `lead_id`: `UUID` (FK -> `leads.id`, CASCADE, NULLABLE)
   * `project_id`: `UUID` (FK -> `projects.id`, CASCADE, NULLABLE)
   * `created_by_user_id`: `UUID` (FK -> `users.id`, NOT NULL)
   * `action_type`: `VARCHAR(50)` (DEFAULT `'consultation_note'`)
   * `note`: `TEXT` (NOT NULL)
   * `action_date`: `TIMESTAMPTZ` (DEFAULT `NOW()`)
   * `linked_task_id`: `UUID` (FK -> `tasks.id`, NULLABLE)
   * `created_at`: `TIMESTAMPTZ`
   * *Constraint:* `CHECK ((lead_id IS NOT NULL AND project_id IS NULL) OR (lead_id IS NULL AND project_id IS NOT NULL))`

7. **`tasks`**
   * `id`: `UUID` (PK)
   * `task_number`: `VARCHAR(50)` (UNIQUE, NOT NULL, e.g. `'TSK-101'`)
   * `title`: `VARCHAR(255)` (NOT NULL)
   * `description`: `TEXT`
   * `lead_id`: `UUID` (FK -> `leads.id`, SET NULL, NULLABLE)
   * `project_id`: `UUID` (FK -> `projects.id`, SET NULL, NULLABLE)
   * `assigned_to_user_id`: `UUID` (FK -> `users.id`, NOT NULL)
   * `created_by_user_id`: `UUID` (FK -> `users.id`, NOT NULL)
   * `priority`: `ENUM('low', 'medium', 'high', 'urgent')` (DEFAULT `'medium'`)
   * `status`: `ENUM('pending', 'in_progress', 'completed', 'cancelled')` (DEFAULT `'pending'`)
   * `due_date`: `DATE` (NOT NULL)
   * `completed_at`: `TIMESTAMPTZ`
   * `created_at`, `updated_at`: `TIMESTAMPTZ`

---

### 2.3. Partner Price Requests & Bids
8. **`partner_price_requests`**
   * `id`: `UUID` (PK)
   * `request_number`: `VARCHAR(50)` (UNIQUE, NOT NULL, e.g. `'REQ-2026-042'`)
   * `lead_id`: `UUID` (FK -> `leads.id`, RESTRICT, NOT NULL)
   * `partner_id`: `UUID` (FK -> `partners.id`, RESTRICT, NOT NULL)
   * `created_by_user_id`: `UUID` (FK -> `users.id`, NOT NULL)
   * `category`: `VARCHAR(100)`
   * `product_info`: `TEXT`
   * `dimensions`: `JSONB`
   * `materials`: `JSONB`
   * `location_access`: `JSONB`
   * `requested_at`: `TIMESTAMPTZ` (DEFAULT `NOW()`)
   * `expected_response_date`: `DATE` (NOT NULL)
   * `status`: `ENUM('requested', 'offers_received', 'selected', 'declined', 'cancelled')` (DEFAULT `'requested'`)
   * `created_at`, `updated_at`: `TIMESTAMPTZ`

9. **`partner_offers`**
   * `id`: `UUID` (PK)
   * `offer_number`: `VARCHAR(50)` (UNIQUE, NOT NULL, e.g. `'OFF-2026-089'`)
   * `request_id`: `UUID` (FK -> `partner_price_requests.id`, CASCADE, NOT NULL)
   * `partner_id`: `UUID` (FK -> `partners.id`, RESTRICT, NOT NULL)
   * `revision_number`: `INTEGER` (NOT NULL, DEFAULT 1)
   * `cost_price`: `NUMERIC(12,2)` (NOT NULL)
   * `labor_hours`: `NUMERIC(8,2)`
   * `materials_cost`: `NUMERIC(12,2)`
   * `labor_cost`: `NUMERIC(12,2)`
   * `estimated_lead_time_weeks`: `INTEGER`
   * `partner_notes`: `TEXT`
   * `status`: `ENUM('submitted', 'under_review', 'accepted', 'rejected', 'superseded')` (DEFAULT `'submitted'`)
   * `submitted_at`: `TIMESTAMPTZ` (DEFAULT `NOW()`)
   * *Constraint:* `UNIQUE(request_id, revision_number)`

---

### 2.4. Quotes & Revisions
10. **`quotes`**
    * `id`: `UUID` (PK)
    * `quote_number`: `VARCHAR(50)` (UNIQUE, NOT NULL, e.g. `'OF-2026418'`)
    * `public_token`: `VARCHAR(64)` (UNIQUE, NOT NULL)
    * `lead_id`: `UUID` (FK -> `leads.id`, SET NULL, NULLABLE)
    * `customer_id`: `UUID` (FK -> `customers.id`, RESTRICT, NOT NULL)
    * `accepted_partner_offer_id`: `UUID` (FK -> `partner_offers.id`, SET NULL, NULLABLE)
    * `status`: `ENUM('draft', 'sent', 'approved', 'declined', 'expired')` (DEFAULT `'draft'`)
    * `product_type`: `VARCHAR(100)` (NOT NULL)
    * `issue_date`: `DATE` (NOT NULL)
    * `valid_until`: `DATE` (NOT NULL)
    * `created_at`, `updated_at`: `TIMESTAMPTZ`

11. **`quote_versions`**
    * `id`: `UUID` (PK)
    * `quote_id`: `UUID` (FK -> `quotes.id`, CASCADE, NOT NULL)
    * `version_number`: `INTEGER` (NOT NULL, DEFAULT 1)
    * `is_current`: `BOOLEAN` (NOT NULL, DEFAULT true)
    * `created_by_user_id`: `UUID` (FK -> `users.id`, NOT NULL)
    * `cover_title_line1`: `VARCHAR(150)`
    * `cover_title_line2`: `VARCHAR(150)`
    * `custom_subtitle`: `TEXT`
    * `cover_photos`: `TEXT[]`
    * `dimensions_text`: `VARCHAR(100)`
    * `wood_type`: `VARCHAR(100)`
    * `wood_lifespan`: `VARCHAR(100)`
    * `options_title`: `VARCHAR(150)`
    * `options_subtext`: `VARCHAR(150)`
    * `delivery_time_text`: `VARCHAR(100)`
    * `delivery_subtext`: `VARCHAR(150)`
    * `subtotal_excl_vat`: `NUMERIC(12,2)` (NOT NULL)
    * `vat_amount`: `NUMERIC(12,2)` (NOT NULL)
    * `total_incl_vat`: `NUMERIC(12,2)` (NOT NULL)
    * `finish_treatment`: `VARCHAR(255)`
    * `stelpost_disclaimer`: `TEXT`
    * `vat_disclaimer`: `TEXT`
    * `validity_text`: `TEXT`
    * `instalments_config`: `JSONB`
    * `diagram_config`: `JSONB`
    * `specifications_overview`: `JSONB`
    * `status`: `ENUM('draft', 'sent', 'approved', 'superseded')` (DEFAULT `'draft'`)
    * `digital_signature`: `JSONB`
    * `approved_at`: `TIMESTAMPTZ`
    * `created_at`: `TIMESTAMPTZ`
    * *Constraints:* `UNIQUE(quote_id, version_number)`
    * *Partial Unique Index:* `CREATE UNIQUE INDEX idx_current_quote_version ON quote_versions(quote_id) WHERE is_current = true;`

12. **`quote_items`**
    * `id`: `UUID` (PK)
    * `quote_version_id`: `UUID` (FK -> `quote_versions.id`, CASCADE, NOT NULL)
    * `position`: `INTEGER` (NOT NULL, DEFAULT 1)
    * `title`: `VARCHAR(255)` (NOT NULL)
    * `description`: `TEXT`
    * `quantity`: `NUMERIC(10,2)` (NOT NULL, DEFAULT 1)
    * `unit_price_incl_vat`: `NUMERIC(12,2)` (NOT NULL)
    * `vat_rate`: `NUMERIC(5,2)` (NOT NULL, DEFAULT 21.00)
    * `line_total_incl_vat`: `NUMERIC(12,2)` (NOT NULL)
    * `is_included`: `BOOLEAN` (DEFAULT `false`)
    * `is_stelpost`: `BOOLEAN` (DEFAULT `false`)
    * `created_at`: `TIMESTAMPTZ`

---

### 2.5. Projects, Milestones, Photos & Planning
13. **`projects`**
    * `id`: `UUID` (PK)
    * `project_number`: `VARCHAR(50)` (UNIQUE, NOT NULL, e.g. `'PRJ-101'`)
    * `quote_id`: `UUID` (FK -> `quotes.id`, RESTRICT, NULLABLE)
    * `quote_version_id`: `UUID` (FK -> `quote_versions.id`, RESTRICT, NULLABLE)
    * `customer_id`: `UUID` (FK -> `customers.id`, RESTRICT, NOT NULL)
    * `partner_id`: `UUID` (FK -> `partners.id`, RESTRICT, NULLABLE)
    * `project_type`: `ENUM('outdoor_kitchen', 'garden_room')` (NOT NULL)
    * `name`: `VARCHAR(255)` (NOT NULL)
    * `status`: `ENUM('pending', 'in_progress', 'completed', 'on_hold', 'cancelled')` (DEFAULT `'pending'`)
    * `order_status`: `VARCHAR(100)`
    * `agreed_build_price`: `NUMERIC(12,2)`
    * `contract_value`: `NUMERIC(12,2)`
    * `progress_percentage`: `INTEGER` (DEFAULT 0, CHECK `0 <= progress_percentage <= 100`)
    * `delivery_address`: `VARCHAR(255)` (NOT NULL)
    * `postal_code`: `VARCHAR(20)`
    * `city`: `VARCHAR(100)` (NOT NULL)
    * `delivery_slot`: `JSONB`
    * `technical_specs`: `JSONB`
    * `created_at`, `updated_at`: `TIMESTAMPTZ`

14. **`project_milestones`**
    * `id`: `UUID` (PK)
    * `project_id`: `UUID` (FK -> `projects.id`, CASCADE, NOT NULL)
    * `milestone_code`: `VARCHAR(50)` (NOT NULL)
    * `title`: `VARCHAR(150)` (NOT NULL)
    * `description`: `TEXT`
    * `sequence_order`: `INTEGER` (NOT NULL)
    * `status`: `ENUM('pending', 'in_progress', 'completed')` (DEFAULT `'pending'`)
    * `scheduled_start_date`: `DATE`
    * `scheduled_end_date`: `DATE`
    * `completed_at`: `TIMESTAMPTZ`
    * `verified_by_user_id`: `UUID` (FK -> `users.id`, NULLABLE)
    * `created_at`, `updated_at`: `TIMESTAMPTZ`

15. **`project_photos`** *(Sole Authoritative Photo Entity)*
    * `id`: `UUID` (PK)
    * `project_id`: `UUID` (FK -> `projects.id`, CASCADE, NOT NULL)
    * `uploaded_by_user_id`: `UUID` (FK -> `users.id`, NOT NULL)
    * `photo_url`: `TEXT` (NOT NULL)
    * `caption`: `VARCHAR(255)`
    * `tag`: `VARCHAR(50)` (e.g. `'workshop'`, `'foundation'`, `'timber_framing'`, `'final_delivery'`)
    * `visible_to_customer`: `BOOLEAN` (DEFAULT `true`)
    * `created_at`: `TIMESTAMPTZ` (DEFAULT `NOW()`)

16. **`planning_events`**
    * `id`: `UUID` (PK)
    * `event_number`: `VARCHAR(50)` (UNIQUE, NOT NULL, e.g. `'EVT-1001'`)
    * `project_id`: `UUID` (FK -> `projects.id`, CASCADE, NULLABLE)
    * `milestone_id`: `UUID` (FK -> `project_milestones.id`, SET NULL, NULLABLE)
    * `partner_id`: `UUID` (FK -> `partners.id`, SET NULL, NULLABLE)
    * `created_by_user_id`: `UUID` (FK -> `users.id`, NOT NULL)
    * `event_type`: `ENUM('single_day_delivery', 'multi_day_bouw', 'workshop_production', 'site_survey', 'service_aftercare')` (NOT NULL)
    * `title`: `VARCHAR(255)` (NOT NULL)
    * `description`: `TEXT`
    * `start_time`: `TIMESTAMPTZ` (NOT NULL)
    * `end_time`: `TIMESTAMPTZ` (NOT NULL)
    * `is_all_day`: `BOOLEAN` (DEFAULT `false`)
    * `calendar_lane`: `ENUM('delivery_lane', 'bouw_lane', 'workshop_lane')` (NOT NULL)
    * `status`: `ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'rescheduled', 'cancelled')` (DEFAULT `'scheduled'`)
    * `location`: `VARCHAR(255)`
    * `created_at`, `updated_at`: `TIMESTAMPTZ`

---

### 2.6. Invoices, Items, Payments & Settlement Allocations
17. **`invoices`**
    * `id`: `UUID` (PK)
    * `invoice_number`: `VARCHAR(50)` (UNIQUE, NOT NULL, e.g. `'INV-4001-A'`)
    * `project_id`: `UUID` (FK -> `projects.id`, RESTRICT, NOT NULL)
    * `customer_id`: `UUID` (FK -> `customers.id`, RESTRICT, NOT NULL)
    * `quote_id`: `UUID` (FK -> `quotes.id`, SET NULL, NULLABLE)
    * `invoice_type`: `ENUM('down_payment_upfront', 'final_completion', 'interim_progress', 'full_amount')` (NOT NULL)
    * `status`: `ENUM('draft', 'sent', 'paid', 'partially_paid', 'overdue', 'credited')` (DEFAULT `'draft'`)
    * `subtotal_excl_vat`: `NUMERIC(12,2)` (NOT NULL)
    * `total_vat_amount`: `NUMERIC(12,2)` (NOT NULL)
    * `total_incl_vat`: `NUMERIC(12,2)` (NOT NULL)
    * `issue_date`: `DATE` (NOT NULL)
    * `due_date`: `DATE` (NOT NULL)
    * `paid_date`: `DATE`
    * `payment_terms_days`: `INTEGER` (DEFAULT 14)
    * `notes`: `TEXT`
    * `created_at`, `updated_at`: `TIMESTAMPTZ`

18. **`invoice_items`** *(Authoritative Item-Level VAT)*
    * `id`: `UUID` (PK)
    * `invoice_id`: `UUID` (FK -> `invoices.id`, CASCADE, NOT NULL)
    * `position`: `INTEGER` (NOT NULL, DEFAULT 1)
    * `description`: `TEXT` (NOT NULL)
    * `quantity`: `NUMERIC(10,2)` (NOT NULL, DEFAULT 1)
    * `unit_price_excl_vat`: `NUMERIC(12,2)` (NOT NULL)
    * `vat_rate`: `NUMERIC(5,2)` (NOT NULL, DEFAULT 21.00)
    * `line_total_excl_vat`: `NUMERIC(12,2)` (NOT NULL)
    * `line_total_incl_vat`: `NUMERIC(12,2)` (NOT NULL)
    * `created_at`: `TIMESTAMPTZ`

19. **`payments`**
    * `id`: `UUID` (PK)
    * `payment_number`: `VARCHAR(50)` (UNIQUE, NOT NULL, e.g. `'PAY-2026-001'`)
    * `invoice_id`: `UUID` (FK -> `invoices.id`, RESTRICT, NOT NULL)
    * `amount`: `NUMERIC(12,2)` (NOT NULL)
    * `payment_method`: `ENUM('ideal_mollie', 'bank_transfer_abn', 'credit_card', 'cash')` (NOT NULL)
    * `payment_reference`: `VARCHAR(150)`
    * `status`: `ENUM('pending', 'succeeded', 'failed', 'refunded')` (DEFAULT `'succeeded'`)
    * `paid_at`: `TIMESTAMPTZ` (NOT NULL, DEFAULT `NOW()`)
    * `gateway_response`: `JSONB`
    * `created_at`: `TIMESTAMPTZ`

20. **`payment_allocations`** *(M:N Bank Settlement Table)*
    * `id`: `UUID` (PK)
    * `payment_id`: `UUID` (FK -> `payments.id`, CASCADE, NOT NULL)
    * `bank_transaction_id`: `UUID` (FK -> `bank_transactions.id`, RESTRICT, NOT NULL)
    * `allocated_amount`: `NUMERIC(12,2)` (NOT NULL, CHECK `allocated_amount > 0`)
    * `allocated_at`: `TIMESTAMPTZ` (DEFAULT `NOW()`)
    * `notes`: `TEXT`
    * *Constraint:* `UNIQUE(payment_id, bank_transaction_id)`

---

### 2.7. Double-Entry Bookkeeping Ledger
21. **`chart_of_accounts`**
    * `id`: `UUID` (PK)
    * `account_code`: `VARCHAR(10)` (UNIQUE, NOT NULL, e.g. `'1000'`, `'1300'`, `'1500'`, `'7000'`, `'8000'`)
    * `account_name`: `VARCHAR(150)` (NOT NULL)
    * `account_type`: `ENUM('Asset', 'Liability', 'Equity', 'Revenue', 'Expense')` (NOT NULL)
    * `standard_vat_rule`: `VARCHAR(50)`
    * `is_active`: `BOOLEAN` (DEFAULT `true`)
    * `created_at`: `TIMESTAMPTZ`

22. **`bank_transactions`**
    * `id`: `UUID` (PK)
    * `bank_tx_id`: `VARCHAR(100)` (UNIQUE, NOT NULL)
    * `account_iban`: `VARCHAR(34)` (NOT NULL)
    * `transaction_date`: `DATE` (NOT NULL)
    * `value_date`: `DATE`
    * `counter_iban`: `VARCHAR(34)`
    * `counter_name`: `VARCHAR(255)`
    * `amount`: `NUMERIC(12,2)` (NOT NULL)
    * `direction`: `ENUM('credit', 'debit')` (NOT NULL)
    * `description`: `TEXT`
    * `remittance_info`: `TEXT`
    * `reconciliation_status`: `ENUM('unmatched', 'matched_invoice', 'matched_expense', 'manual_reconciled')` (DEFAULT `'unmatched'`)
    * `created_at`: `TIMESTAMPTZ`

23. **`journal_entries`**
    * `id`: `UUID` (PK)
    * `entry_number`: `VARCHAR(50)` (UNIQUE, NOT NULL, e.g. `'JRN-2026-0001'`)
    * `bank_transaction_id`: `UUID` (FK -> `bank_transactions.id`, SET NULL, NULLABLE)
    * `invoice_id`: `UUID` (FK -> `invoices.id`, SET NULL, NULLABLE)
    * `payment_id`: `UUID` (FK -> `payments.id`, SET NULL, NULLABLE)
    * `entry_date`: `DATE` (NOT NULL)
    * `entry_type`: `ENUM('sales_invoice', 'bank_receipt', 'bol_reconciliation', 'purchase_invoice', 'general_journal')` (NOT NULL)
    * `description`: `TEXT` (NOT NULL)
    * `created_by_user_id`: `UUID` (FK -> `users.id`, SET NULL, NULLABLE)
    * `created_at`: `TIMESTAMPTZ`

24. **`journal_entry_lines`**
    * `id`: `UUID` (PK)
    * `journal_entry_id`: `UUID` (FK -> `journal_entries.id`, CASCADE, NOT NULL)
    * `account_id`: `UUID` (FK -> `chart_of_accounts.id`, RESTRICT, NOT NULL)
    * `debit`: `NUMERIC(12,2)` (NOT NULL, DEFAULT 0.00)
    * `credit`: `NUMERIC(12,2)` (NOT NULL, DEFAULT 0.00)
    * `vat_rule`: `VARCHAR(50)`
    * `line_description`: `TEXT`
    * `created_at`: `TIMESTAMPTZ`
    * *Constraint:* `CHECK (debit >= 0 AND credit >= 0 AND (debit > 0 OR credit > 0))`

---

### 2.8. Strong-FK Documents & Conversations
25. **`documents`** *(Strong Relational FKs)*
    * `id`: `UUID` (PK)
    * `document_number`: `VARCHAR(50)` (UNIQUE, NOT NULL, e.g. `'DOC-2026-001'`)
    * `document_type`: `ENUM('cad_blueprint', 'werkorder_pdf', 'offerte_pdf', 'factuur_pdf', 'opleverrapport_pdf', 'bank_statement')` (NOT NULL)
    * `file_name`: `VARCHAR(255)` (NOT NULL)
    * `file_url`: `TEXT` (NOT NULL)
    * `file_size_bytes`: `BIGINT`
    * `mime_type`: `VARCHAR(100)`
    * `project_id`: `UUID` (FK -> `projects.id`, CASCADE, NULLABLE)
    * `quote_id`: `UUID` (FK -> `quotes.id`, CASCADE, NULLABLE)
    * `partner_id`: `UUID` (FK -> `partners.id`, CASCADE, NULLABLE)
    * `lead_id`: `UUID` (FK -> `leads.id`, CASCADE, NULLABLE)
    * `invoice_id`: `UUID` (FK -> `invoices.id`, CASCADE, NULLABLE)
    * `is_public_for_customer`: `BOOLEAN` (DEFAULT `false`)
    * `is_public_for_partner`: `BOOLEAN` (DEFAULT `true`)
    * `uploaded_by_user_id`: `UUID` (FK -> `users.id`, NOT NULL)
    * *Constraint:* `CHECK (num_nonnulls(project_id, quote_id, partner_id, lead_id, invoice_id) = 1)`

26. **`conversations`**, **`conversation_participants`**, **`messages`**
    * Decoupled multi-party communication threads for Admin, Partner, and Customer with read-receipt timestamps.
