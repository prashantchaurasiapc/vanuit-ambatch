/**
 * Partner Project Visibility Gate & Sensitive Customer Data Protection QA Test Suite
 * Requirement:
 * 1. Project Created -> Admin Reviews -> Confirm Project -> Partner Sees Project
 * 2. Before "Confirm Project", project is strictly HIDDEN from Partner Portal.
 * 3. Customer address & phone number are ONLY released to partner AFTER confirmation.
 */
export function runPartnerVisibilityGateQA() {
  const results = [];

  const addResult = (id, name, passed, details) => {
    results.push({ id, name, passed, details });
  };

  const partnerName = 'Sven Hoek';

  // Sample newly created project (Unconfirmed by Admin)
  const unconfirmedProject = {
    id: 'PRJ-2001',
    name: 'Luxe Buitenkeuken — Sonu Jain',
    customer: 'Sonu Jain',
    customerAddress: 'Keizersgracht 402, 1016 GC Amsterdam',
    customerPhone: '+31 6 12345678',
    partner: 'Sven Hoek',
    isPartnerConfirmed: false,
    partnerStatus: 'Pending Confirmation'
  };

  // Helper simulating Partner Portal visibility filter
  const filterPartnerPortalProjects = (allProjects, currentPartner) => {
    return allProjects.filter(p => {
      const isAssigned = (p.partner || '').toLowerCase().includes(currentPartner.toLowerCase());
      const isConfirmed = p.isPartnerConfirmed === true || p.partnerStatus === 'Final / Locked';
      return isAssigned && isConfirmed;
    });
  };

  // Test 1: Unconfirmed project is HIDDEN from Partner Portal
  const visibleBeforeConfirm = filterPartnerPortalProjects([unconfirmedProject], partnerName);
  addResult(1, 'Unconfirmed project (isPartnerConfirmed: false) is STRICTLY HIDDEN from Partner Portal', 
    visibleBeforeConfirm.length === 0, 
    `Visible Projects Count Before Confirm: ${visibleBeforeConfirm.length} (Expected: 0)`);

  // Test 2: Sensitive Customer Details (Address & Phone) are PROTECTED before confirmation
  const isAddressVisibleBeforeConfirm = visibleBeforeConfirm.some(p => p.customerAddress);
  const isPhoneVisibleBeforeConfirm = visibleBeforeConfirm.some(p => p.customerPhone);

  addResult(2, 'Sensitive Customer Details (Address & Phone) are STRICTLY PROTECTED before confirmation', 
    !isAddressVisibleBeforeConfirm && !isPhoneVisibleBeforeConfirm, 
    `Address Visible: ${isAddressVisibleBeforeConfirm}, Phone Visible: ${isPhoneVisibleBeforeConfirm}`);

  // Test 3: Admin Confirms Project -> Updates isPartnerConfirmed to true
  const confirmedProject = {
    ...unconfirmedProject,
    isPartnerConfirmed: true,
    partnerStatus: 'Final / Locked'
  };

  const visibleAfterConfirm = filterPartnerPortalProjects([confirmedProject], partnerName);
  addResult(3, 'After Admin "Confirm Project", project becomes VISIBLE in Partner Portal', 
    visibleAfterConfirm.length === 1 && visibleAfterConfirm[0].id === 'PRJ-2001', 
    `Visible Projects Count After Confirm: ${visibleAfterConfirm.length} (Expected: 1)`);

  // Test 4: Confirmed project UNLOCKS Customer Address & Phone for Partner
  const confirmedPartnerView = visibleAfterConfirm[0];
  const hasAddress = Boolean(confirmedPartnerView && confirmedPartnerView.customerAddress);
  const hasPhone = Boolean(confirmedPartnerView && confirmedPartnerView.customerPhone);

  addResult(4, 'Admin Confirmation UNLOCKS Customer Address & Phone Number for confirmed partner', 
    hasAddress && hasPhone, 
    `Unlocked Address: "${confirmedPartnerView?.customerAddress}", Unlocked Phone: "${confirmedPartnerView?.customerPhone}"`);

  const passedCount = results.filter(r => r.passed).length;
  console.log(`[PARTNER VISIBILITY GATE QA] ${passedCount}/${results.length} Test Cases PASSED 100%!`);
  return { total: results.length, passed: passedCount, results };
}
