# Partner & User Integration Documentation (3 Steps)

Yeh document 3-step partner integration workflow ka live tracking aur complete record hai. Koi bhi naya database table create nahi kiya gaya hai aur existing forms ki fields ko bina chede pura flow seamlessly connect kiya gaya hai.

---

## 📌 STEP 1: User & Partner Table Link (Settings -> Partners Menu Sync)
- **Status**: ✅ **COMPLETED**
- **Objective**: Jab bhi Admin *Settings > User Management* me kisi naye user ko `Partner` role ke saath add kare, to wo automatic backend me `partners` table me sync ho jaye aur turant *Partners* menu (`/admin/partners`) tatha *Leads Step 2 dropdown* me display ho.
- **Backend File**: [`backend/src/modules/settings/settings.service.ts`](file:///d:/kiaan/vanuit-ambatch/vanuit-ambatch/backend/src/modules/settings/settings.service.ts)
- **Actions Performed**:
  1. **`createUser` Hook**: Jab bhi `role === 'partner'` create hota hai:
     - Sequential partner code auto-generate hota hai (jaise `PRT-ABCK-01`, `PRT-TEST-01`).
     - `partners` table me row create hoti hai jisme `userId = user.id`, `companyName`, `contactPerson`, `email`, `workloadStatus = 'available'`, `rating = '5.00'`, aur `isActive = true` set hota hai.
  2. **Customer Sync**: `role === 'customer'` create hone par `customers` table me bhi customer record sync hota hai.
  3. **`updateUserStatus` Hook**: User active/inactive toggle hone par `partners.isActive` bhi live synchronize hota hai.
  4. **`updateUserRole` Hook**: Existing user ko `partner` role me switch karne par partner profile auto-generate ho jati hai.
  5. **Existing Unlinked Accounts Synchronized**: Pehle se database me bane huye partner accounts (`abc kumar` aur `Inactive Test User`) ko `partners` table se successfully link kiya gaya.
- **Verification & Test Results**:
  - API se `Test Partner Pro` (`testpro@partner.nl`) create karke check kiya gaya:
    - Auto-assigned Partner Code: `PRT-TEST-01`
    - Linked User ID: `aa1670c5-a394-400c-9181-aba1dd94b1d7`
    - Live Query: `GET /api/partners` me bina kisi delay ke live show ho gaya.

---

## 📌 STEP 2: Leads Step 2 ka Request Trigger Connect Karna
- **Status**: ✅ **COMPLETED**
- **Objective**: Leads ke Step 2 ("Partner price request") me Admin jab partner select kare aur "Send Price Request →" button click kare, to database table `partner_price_requests` me actual inquiry record save ho.
- **Frontend Files**: 
  - [`frontend/src/components/WorkflowTracker.jsx`](file:///d:/kiaan/vanuit-ambatch/vanuit-ambatch/frontend/src/components/WorkflowTracker.jsx)
  - [`frontend/src/pages/admin/Leads.jsx`](file:///d:/kiaan/vanuit-ambatch/vanuit-ambatch/frontend/src/pages/admin/Leads.jsx)
- **Actions Performed**:
  1. **Selected Partner Binding**: Step 2 ke dropdown se select hone wale partner ki UUID (`selectedPartner.id`) ko fetch aur bind kiya gaya.
  2. **API Payload Alignment**: `POST /api/partner-requests` ke schema ke mutabik:
     - `leadId`: Valid UUID (`lead.id`)
     - `partnerId`: Selected partner UUID
     - `category`: Selected category key (e.g. `buitenkeuken`, `buitenverblijf`)
     - `productInfo`: Lead item description
     - `dimensions`: Dimensions object
     - `materials`: Material selections
     - `locationAccess`: City aur site access notes
     - `expectedResponseDate`: Valid YYYY-MM-DD date
  3. **Form State Integrity**: `step2SiteAccess` state input ke sath clean two-way bind kiya gaya taki koi runtime reference error na aaye.
  4. **Event Dispatch**: Request successfully post hone par `window.dispatchEvent(new Event('app_data_changed'))` trigger hota hai taki dashboard aur pipeline real-time refresh ho sake.
- **Verification & Test Results**:
  - Lead `LEAD-2026-003` par Partner `abc kumar` ko price request bheji gayi: Request Number `PR-2026-001` successfully database me create hua.
  - Lead `LEAD-2026-002` par Partner `Test Partner Pro` ko price request bheji gayi: Request Number `PR-2026-002` successfully database me create hua.

---

## 📌 STEP 3: Partner Portal Login & Verification
- **Status**: ✅ **COMPLETED**
- **Objective**: Partner apne credentials se `/login` page par login kare aur uska Partner Portal (`/partner/price-requests` aur `/partner/dashboard`) open ho, jisme Step 2 me bheji gayi price request uske inbox me live display ho.
- **Files Verified**:
  - [`backend/src/modules/auth/auth.service.ts`](file:///d:/kiaan/vanuit-ambatch/vanuit-ambatch/backend/src/modules/auth/auth.service.ts)
  - [`backend/src/modules/partner-requests/partner-request.service.ts`](file:///d:/kiaan/vanuit-ambatch/vanuit-ambatch/backend/src/modules/partner-requests/partner-request.service.ts)
  - [`frontend/src/pages/partner/PartnerPriceRequests.jsx`](file:///d:/kiaan/vanuit-ambatch/vanuit-ambatch/frontend/src/pages/partner/PartnerPriceRequests.jsx)
  - [`frontend/src/pages/partner/PartnerDashboard.jsx`](file:///d:/kiaan/vanuit-ambatch/vanuit-ambatch/frontend/src/pages/partner/PartnerDashboard.jsx)
- **Actions Performed & Tested**:
  1. **Authentication Token Enrichment**: Partner login karte hi backend JWT payload me `role: 'partner'` aur `profileId: '<PARTNER_UUID>'` attach karta hai.
  2. **Multi-Tenant Partner Isolation**: Partner inquiry list (`GET /api/partner-requests`) automatically logged-in partner ke ID par filter hoti hai. Ek partner ko dusre partner ki inquiry ya quotation nahi dikhti.
  3. **Privacy Masking**: Partner portal me customer ka confidential contact info (naam, direct phone, budget) automatically hidden rehta hai jab tak project confirm na ho.
- **Verification & Test Results**:
  - **Account 1 (`abc@gmail.com` / `123456`)**:
    - Login: Successful (Role: `partner`, Profile: `4c382eb2-12df-4470-9548-5a7ff7d61718`)
    - Inbox (`/partner/price-requests`): Step 2 me create hui request **`PR-2026-001` ("Luxe Buitenkeuken - Thermo Frake")** live dikhayi de rahi hai.
  - **Account 2 (`testpro@partner.nl` / `password123`)**:
    - Login: Successful (Role: `partner`, Profile: `aabb4eae-5dd4-48a1-8281-a4a35fd334e1`)
    - Inbox (`/partner/price-requests`): Request **`PR-2026-002` ("Luxe Buitenverblijf met Glazen Schuifwand")** live dikhayi de rahi hai.
    - Security Isolation: Is account ko `PR-2026-001` nahi dikhti, sirf apna assign hua request dikhta hai.

---

## 🔑 Credentials Summary for Testing

| Role | Email | Password | Assigned Requests Visible in Portal |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@vanuitambacht.nl` | `admin123` | Can view all leads, partners & send price requests |
| **Partner 1** | `abc@gmail.com` | `123456` | `PR-2026-001` (Luxe Buitenkeuken) |
| **Partner 2** | `testpro@partner.nl` | `password123` | `PR-2026-002` (Luxe Buitenverblijf) |
| **Partner 3** | `partner@vanuitambacht.nl` | `partner123` | Sven Hoek (Hoek Ambachtelijke Houtbouw) |
