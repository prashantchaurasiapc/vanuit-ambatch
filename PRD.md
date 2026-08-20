# PRD – Vanuit Ambacht SaaS Management Portal

## Project Overview

**Vanuit Ambacht** is an enterprise-grade SaaS Portal specifically designed for luxury bespoke outdoor kitchens, Kliko bin enclosures, and handcrafted wooden joinery products (`Buitenkeukens`, `Kliko-ombouw`, `Snijplanken`).

The portal provides end-to-end management for two distinct user roles:
1. **Admin Team**: Oversees incoming leads, creates and sends quotes, assigns projects to craftsmen partners, manages invoices & financial reports, and handles document vaults.
2. **Craftsmen Partners**: Tracks assigned installation projects, manages daily planning & calendar agenda, views site blueprints, and updates progress percentages.

---

## Technical Stack & Architecture

- **Core Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS 3.4 (Strict Custom Design System)
- **Routing**: React Router DOM 7
- **Icons**: Lucide React Icons
- **State Management**: React Context (`AuthContext` with persistent local state)
- **Animation**: Framer Motion 12
- **Build Output**: Production-ready static web application with Vite bundler (`dist/`)

---

## Brand Identity & Design System

### Personality & Design Principles
- **Atmospheric & Premium**: Warm luxury aesthetic tailored for high-end wood craftsmanship.
- **Zero Pure White Rule**: All backgrounds utilize warm beige and muted cream tones to maintain visual harmony.
- **High Contrast & Sharp Typography**: Clear text hierarchy utilizing modern Google Fonts.

### Color Palette (Tailwind Tokens)
- **Primary Color (Forest Green)**: `var(--primary-color)` / `#3E4E36` (Sidebar, Primary CTA Buttons, Active Nav)
- **Accent Color (Wood Brown)**: `var(--accent-color)` / `#70624F` (Secondary badges, subtitled highlights)
- **Page Background (Warm Beige)**: `var(--background-color)` / `#D6CFC2` (Main app layout background)
- **Card & Input Background (Cream)**: `#EDE8DF` (Card backgrounds, table rows, input fields)
- **Secondary Border / Accent**: `#C4BEB3` (Borders, card dividers)
- **Dark Neutral Text**: `#4A4A43` (Body text, headings, data labels)

### Typography
- **Heading Font**: `Outfit` (`font-heading`)
- **Body Font**: `Plus Jakarta Sans` (`font-body`)

### Official Brand Asset Registry
- **Sidebar Header Logo**: `/logo_green_cropped.png` (Single-line horizontal `VA VANUIT AMBACHT` logo, cropped tightly for high-definition rendering)
- **Browser Favicon & Mobile Toggle**: `/mini_logo1.png` & `/mini logo2.png` (Cream & Green Monogram Icons)
- **Login Brand Logo**: `/logo_brand.png`
- **Category Division Logos**: `/logo_buitenkeukens.png`, `/logo_snijplanken.png` (High-resolution transparent PNG badges)

---

## User Roles & Portal Architecture

```
                       ┌─────────────────────────┐
                       │    Authentication       │
                       │    (/login Route)       │
                       └────────────┬────────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
      ┌───────────────────────┐           ┌───────────────────────┐
      │      ADMIN PORTAL     │           │    PARTNER PORTAL     │
      │    (role: 'admin')    │           │   (role: 'partner')   │
      └───────────┬───────────┘           └───────────┬───────────┘
                  │                                   │
      ├─ Dashboard (/admin/dashboard)     ├─ Dashboard (/partner/dashboard)
      ├─ Leads (/admin/leads)             ├─ My Projects (/partner/projects)
      ├─ Quotes (/admin/quotes)           ├─ Planning (/partner/planning)
      ├─ Projects (/admin/projects)       ├─ Documents (/partner/documents)
      ├─ Partners (/admin/partners)       └─ Profile (/partner/profile)
      ├─ Documents (/admin/documents)
      ├─ Finance (/admin/finance)
      ├─ Reports (/admin/reports)
      └─ Settings (/admin/settings)
```

---

## Core Feature Specifications

### 1. Authentication & Role-Based Access
- **Login Screen**: High-res background image (`outdoor_living_login.png`) with translucent cream login card.
- **Role Switching**: Support for Admin (`admin@vanuitambacht.nl`) and Partner (`partner@vanuitambacht.nl`) login sessions with auto-redirection.

### 2. Admin Management Modules
- **Admin Dashboard**: Overview KPI cards (Active Leads, Active Quotes, Active Projects, Monthly Revenue), Recent Activity Feed, Lead Status Distribution.
- **Leads Management & Interactive Lead Card**:
  - **Lead Table Overview**: Filterable table of incoming client inquiries, multi-column interactive header filters (`Product Type`, `Source/Campaign`, `Status`, `Assignee: Tim/Bram`, `Last Contact: 3-Day Warning Alert`), 1-click table row auto-open to Lead Card view, easy sidebar navigation return to overview.
  - **Lead Card & Workflow Tracker**: Interactive 8-step progress bar, Step 2 renamed to **"Partner Price Request"** with 100% **Editable Free-Text Fields** for Product Type & Preferred Dimensions (`Gewenste Maat`), **Smart Green Color Logic** (Step 2 turns Green ONLY when a price request is explicitly sent to a partner), Step 3 renamed to **"Partner Quote"**, Step 4 renamed to **"Create Quote for Lead/Customer"** featuring a **Direct Multi-Item Quotation Generator** (pre-saved product catalog dropdown, itemized line pricing table, 21% VAT calculation, and 1-click 6-Page PDF viewer), **Auto-Convert to Live Project & Customer Directory** (auto-generates Active Project `#P-2003` in `/admin/projects` and populates Client Directory upon quote approval & partner assignment), auto-message templates (Email/WhatsApp/Call) with prefilled client details.
  - **Commercial Actions Log**: Free-text conversation note logger positioned directly above Activity History with user badges and timestamps.
  - **Multiple Project Photos Upload**: Multiple file upload picker (`multiple`) rendering a Thumbnail Gallery Grid (preview images, filenames, individual `X` delete buttons).
  - **Plaud AI Audio Import Integration**: Audio file/transcript import modal, Plaud AI Voice Notes card with audio playback controls (`▶️`/`⏸️`), recording duration, timestamp, and AI transcript summary.
  - **Claude AI Draft Proposal Engine**: Automated proposal generator analyzing voice call transcripts to craft itemized draft quotations (€13.600 total) in Vanuit Ambacht's warm Dutch craftsman brand tone with 1-click export to official PDF quotes (`#Q-4002`).
  - **Submitted Quotation Visibility**: Direct visibility of linked proposal (`#Q-4001` - €12,500) both on the Leads Table Overview column (`📄 #Q-4001`) and inside the Lead Card with 1-click **`👁️ View Official 6-Page PDF Quotation`** viewer modal.
- **Quotes System**: Multi-item pricing calculator, discount options, PDF export/download trigger, approval status tracker (`Draft`, `Sent`, `Approved`, `Rejected`).
- **Projects Management**: Detailed list of active installations, category badges (`Buitenkeukens`, `Kliko-ombouw`, `Snijplanken`), assigned partner dropdown, progress tracker (0%-100%), project detail popup modal.
- **Partners Directory**: Craftsmanship partner profiles, active assigned projects count, contact details, performance rating.
- **Finance & Invoicing**: Revenue summaries, outstanding vs paid invoices (`INV-902`), payment due dates, financial reports.
- **Documents Vault**: Centralized cloud document repository for blueprints, site photos, contracts, and material specs.

### 3. Partner Craftsman Portal
- **Partner Dashboard**: Assigned project metrics, upcoming site visits, compact 48px slim status pills (`Assigned Projects`, `In Progress`, `Completed`).
- **My Projects**: Card-based project view with high-res cover photos (`outdoor_project_card.png`), completion progress bar, client contact details, site address, and blueprint viewer modal.
- **Planning & Calendar Agenda**: Day/Week agenda view of material deliveries, site review appointments, installation milestones.
- **Partner Documents**: Access to project blueprints and assembly instructions.
- **Partner Profile**: Craftsman contact info, company details, specialization tags.

---

## Global Responsiveness & Layout Architecture

1. **Sidebar Navigation (`Sidebar.jsx`)**:
   - **Compact Width**: Fixed `w-56` (224px) globally on desktop and mobile drawer.
   - **Mobile Behavior**: Hidden on mobile (`<lg`), toggled via floating hamburger button (`top-2.5 left-3`) with dark backdrop overlay.

2. **Top Header Bar (`TopNav.jsx`)**:
   - **Height**: Fixed 56px (`h-14`) with background `#EDE8DF` and bottom border `#D6CFC2`.
   - **Mobile Breadcrumbs**: Left margin `ml-[72px]` ensures 10px clear separation from mobile button; includes `truncate min-w-0` text safety for 320px screens.
   - **Responsive Notification Popup**: Viewport-anchored dropdown (`w-[calc(100vw-24px)] max-w-xs sm:w-80`) preventing mobile screen overflow.

3. **Data Tables (`Table.jsx`)**:
   - Wrapped inside `overflow-x-auto` container with no-wrap whitespace rules for seamless mobile scrolling.

4. **Summary Filter Cards**:
   - Compact 48px slim stat pills with horizontal flex layout, color-coded badges, and zero padding.

---

## Verification & Build Compliance

- All code builds cleanly with Vite bundler (`npm run build`).
- Zero syntax, linting, or broken asset reference errors.
- 100% Mobile, Tablet, and Desktop responsive layout.
