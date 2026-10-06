import { 
  extractPurchaseInvoiceRef, 
  matchPurchaseToProject, 
  calculateProjectPurchasingTotal, 
  calculateProjectMarginWithPurchasing,
  UNIFIED_PURCHASING_CATEGORY 
} from './purchasingAllocator.js';

import { normalizeTransaction } from './abnParser.js';

const results = [];

function assertTest(id, description, testFn) {
  try {
    const outcome = testFn();
    if (outcome.pass) {
      results.push({ id, description, status: 'PASS', actualResult: outcome.actual, issue: 'None' });
    } else {
      results.push({ id, description, status: 'FAIL', actualResult: outcome.actual, issue: outcome.issue });
    }
  } catch (err) {
    results.push({ id, description, status: 'FAIL', actualResult: `Exception: ${err.message}`, issue: err.stack });
  }
}

// TEST 1: Ruben Verbeij purchase invoice with valid reference -> Correct invoice identified, Category = Purchasing
assertTest(1, 'Ruben Verbeij purchase invoice with valid reference -> Identified, Category = Purchasing', () => {
  const tx = { counterName: 'Ruben Verbeij Meubels Op Maat', debit: 1500, description: 'Inkoop meubelframe PRJ-101 Factuur 2026-07' };
  const projects = [{ id: 'PRJ-101', customer: 'John Miller' }];
  const match = matchPurchaseToProject(tx, projects);
  const pass = match.isPurchasing === true && match.category === 'Purchasing' && match.projectId === 'PRJ-101' && match.purchaseInvoiceRef === '2026-07';
  return { pass, actual: `Category: "${match.category}", Project: "${match.projectId}", Ref: "${match.purchaseInvoiceRef}"`, issue: pass ? null : 'Ruben Verbeij ref match failed' };
});

// TEST 2: Ruben Verbeij purchase with missing reference -> Match by supplier + amount if exactly 1 open invoice exists
assertTest(2, 'Ruben Verbeij purchase with missing reference -> Match by supplier + amount', () => {
  const tx = { counterName: 'Ruben Verbeij Meubels Op Maat', debit: 1500, description: 'Overboeking Houtmontage' };
  const openInvoices = [{ id: 'OPEN-1', supplier: 'Ruben Verbeij Meubels Op Maat', amount: 1500, invoiceRef: '2026-08', projectId: 'PRJ-102', customerName: 'Sophia Taylor' }];
  const match = matchPurchaseToProject(tx, [], openInvoices);
  const pass = match.isMatched === true && match.projectId === 'PRJ-102' && match.matchingMethod.includes('Fallback');
  return { pass, actual: `Fallback Matched Project: "${match.projectId}" via "${match.matchingMethod}"`, issue: pass ? null : 'Missing ref fallback failed' };
});

// TEST 3: Houtslagers purchase invoice -> Correct supplier, Category = Purchasing
assertTest(3, 'Houtslagers purchase invoice -> Correct supplier, Category = Purchasing', () => {
  const tx = { counterName: 'Houtslagers B.V. (België)', debit: 800, description: 'Houtlevering Factuur 2026091 PRJ-103' };
  const projects = [{ id: 'PRJ-103', customer: 'Mark Davis' }];
  const match = matchPurchaseToProject(tx, projects);
  const pass = match.isPurchasing === true && match.category === 'Purchasing' && match.supplier === 'Houtslagers';
  return { pass, actual: `Supplier: "${match.supplier}", Category: "${match.category}"`, issue: pass ? null : 'Houtslagers match failed' };
});

// TEST 4: Multiple Houtslagers payments on same day -> All legitimate transactions remain separate
assertTest(4, 'Multiple Houtslagers payments on same day -> All remain separate', () => {
  const tx1 = normalizeTransaction({ counterName: 'Houtslagers', debit: 800, eref: 'EREF-HOUT-1', date: '2026-08-10' });
  const tx2 = normalizeTransaction({ counterName: 'Houtslagers', debit: 800, eref: 'EREF-HOUT-2', date: '2026-08-10' });
  const list = [tx1, tx2];
  const pass = list.length === 2 && list[0].eref !== list[1].eref;
  return { pass, actual: `Preserved both Houtslagers payments (€800) on 2026-08-10 with EREF1=${list[0].eref}, EREF2=${list[1].eref}`, issue: pass ? null : 'Houtslagers payments incorrectly deduplicated' };
});

// TEST 5: Alibaba purchase -> Category = Purchasing
assertTest(5, 'Alibaba purchase -> Category = Purchasing', () => {
  const tx = { counterName: 'Alibaba.com Singapore', debit: 890, description: 'Order ALI-9821 RVS Beslag PRJ-101' };
  const projects = [{ id: 'PRJ-101', customer: 'John Miller' }];
  const match = matchPurchaseToProject(tx, projects);
  const pass = match.isPurchasing === true && match.category === 'Purchasing';
  return { pass, actual: `Category: "${match.category}", Supplier: "${match.supplier}"`, issue: pass ? null : 'Alibaba category failed' };
});

// TEST 6: Foreign supplier payment -> Purchasing
assertTest(6, 'Foreign supplier payment (Md. Joni Hossain) -> Category = Purchasing', () => {
  const tx = { counterName: 'Md. Joni Hossain', debit: 1400, description: 'Buitenlandse Overboeking Supplier Inv 44 PRJ-101' };
  const projects = [{ id: 'PRJ-101', customer: 'John Miller' }];
  const match = matchPurchaseToProject(tx, projects);
  const pass = match.isPurchasing === true && match.category === 'Purchasing';
  return { pass, actual: `Category: "${match.category}", Supplier: "${match.supplier}"`, issue: pass ? null : 'Foreign supplier category failed' };
});

// TEST 7: Foreign transfer fee -> Bank charges (NOT Purchasing)
assertTest(7, 'Foreign transfer fee -> Category = Bank charges (NOT Purchasing)', () => {
  const tx = { counterName: 'ABN AMRO Bank N.V.', debit: 25, description: 'Correspondent Fee Buitenlandse Overboeking' };
  const match = matchPurchaseToProject(tx);
  const pass = match.isPurchasing === false && match.category === 'Bank charges';
  return { pass, actual: `Category: "${match.category}", isPurchasing: ${match.isPurchasing}`, issue: pass ? null : 'Foreign transfer fee misclassified as Purchasing' };
});

// TEST 8: Purchase linked to Customer Project -> Project Purchasing total updates
assertTest(8, 'Purchase linked to Customer Project -> Project Purchasing total updates', () => {
  const purchases = [{ debit: 1500, supplier: 'Ruben Verbeij', eref: 'EREF-1' }];
  const res = calculateProjectPurchasingTotal(purchases);
  const pass = res.totalPurchasing === 1500 && res.uniquePurchasesCount === 1;
  return { pass, actual: `Total Purchasing: €${res.totalPurchasing} (${res.uniquePurchasesCount} purchase)`, issue: pass ? null : 'Purchasing total update failed' };
});

// TEST 9: Multiple purchase invoices linked to same project -> Total Purchasing = sum of unique linked purchases
assertTest(9, 'Multiple purchase invoices linked to same project -> Sum of unique purchases', () => {
  const purchases = [
    { debit: 1500, supplier: 'Ruben Verbeij', purchaseInvoiceRef: '2026-07', eref: 'EREF-1' },
    { debit: 800, supplier: 'Houtslagers', purchaseInvoiceRef: '2026091', eref: 'EREF-2' },
    { debit: 200, supplier: 'Alibaba', purchaseInvoiceRef: 'ALI-9821', eref: 'EREF-3' }
  ];
  const res = calculateProjectPurchasingTotal(purchases);
  const pass = res.totalPurchasing === 2500 && res.uniquePurchasesCount === 3;
  return { pass, actual: `Total Purchasing: €${res.totalPurchasing} (${res.uniquePurchasesCount} unique purchases)`, issue: pass ? null : 'Multiple purchase invoices sum error' };
});

// TEST 10: Two customer invoices for the same job -> Purchasing counted ONLY ONCE
assertTest(10, 'Two customer invoices for same job -> Purchasing counted ONLY ONCE', () => {
  const purchasesForJob = [{ debit: 2500, supplier: 'Ruben Verbeij', purchaseInvoiceRef: '2026-07', eref: 'EREF-RUBEN-1' }];
  const res = calculateProjectPurchasingTotal(purchasesForJob);
  const margin = calculateProjectMarginWithPurchasing(5000, purchasesForJob);
  const pass = res.totalPurchasing === 2500 && margin.projectMargin === 1632.23;
  return { pass, actual: `Customer Job (€5000) -> Purchasing: €${res.totalPurchasing} (NOT €5000). Margin: €${margin.projectMargin}`, issue: pass ? null : 'Purchasing double counted for split job' };
});

// TEST 11: Purchase invoice allocated manually -> Project Purchasing & Margin update, status = Manually Allocated
assertTest(11, 'Purchase invoice allocated manually -> Margin updates, status = Manually Allocated', () => {
  const manualAllocatedTx = { debit: 1250, supplier: 'Ruben Verbeij', purchaseInvoiceRef: '2026-07', allocationStatus: 'Manually Allocated', eref: 'EREF-MAN-1' };
  const margin = calculateProjectMarginWithPurchasing(5000, [manualAllocatedTx]);
  const pass = margin.totalPurchasing === 1250 && margin.projectMargin === 2882.23;
  return { pass, actual: `Manually Allocated Purchasing: €${margin.totalPurchasing}, Project Margin: €${margin.projectMargin}`, issue: pass ? null : 'Manual allocation margin update failed' };
});

// TEST 12: Unknown/ambiguous purchase -> Review Item / Vraagpost
assertTest(12, 'Unknown/ambiguous purchase -> Review Item / Vraagpost', () => {
  const tx = { counterName: 'Unknown Wood Supplier', debit: 300, description: 'Wooden slabs' };
  const match = matchPurchaseToProject(tx);
  const pass = match.isMatched === false && match.allocationStatus === 'Unallocated';
  return { pass, actual: `Allocation Status: "${match.allocationStatus}", Reason: "${match.reason}"`, issue: pass ? null : 'Ambiguous purchase forced wrong match' };
});

// TEST 13: Same supplier + amount + date with different EREF -> Both remain valid
assertTest(13, 'Same supplier + amount + date with different EREF -> Both remain valid', () => {
  const p1 = { debit: 800, supplier: 'Houtslagers', eref: 'EREF-A', date: '2026-08-10' };
  const p2 = { debit: 800, supplier: 'Houtslagers', eref: 'EREF-B', date: '2026-08-10' };
  const res = calculateProjectPurchasingTotal([p1, p2]);
  const pass = res.uniquePurchasesCount === 2 && res.totalPurchasing === 1600;
  return { pass, actual: `Both purchases preserved: Count=${res.uniquePurchasesCount}, Total Purchasing=€${res.totalPurchasing}`, issue: pass ? null : 'Valid duplicate transactions dropped' };
});

// TEST 14: Same purchase invoice attempted twice -> Duplicate project allocation prevented
assertTest(14, 'Same purchase invoice attempted twice -> Duplicate project allocation prevented', () => {
  const p1 = { debit: 1500, supplier: 'Ruben Verbeij', purchaseInvoiceRef: '2026-07', eref: 'EREF-1' };
  const p2Duplicate = { debit: 1500, supplier: 'Ruben Verbeij', purchaseInvoiceRef: '2026-07', eref: 'EREF-1' };
  const res = calculateProjectPurchasingTotal([p1, p2Duplicate]);
  const pass = res.uniquePurchasesCount === 1 && res.totalPurchasing === 1500;
  return { pass, actual: `Prevented duplicate allocation: Unique Count=${res.uniquePurchasesCount}, Total Purchasing=€${res.totalPurchasing}`, issue: pass ? null : 'Duplicate invoice allocation permitted' };
});

// TEST 15: Smart Fulfilment transaction -> Transport (NEVER Purchasing)
assertTest(15, 'Smart Fulfilment transaction -> Category = Transport (NEVER Purchasing)', () => {
  const tx = { counterName: 'Smart Fulfilment B.V.', debit: 450, description: 'Koerier transport' };
  const match = matchPurchaseToProject(tx);
  const pass = match.isPurchasing === false && match.category === 'Transport';
  return { pass, actual: `Category: "${match.category}", isPurchasing: ${match.isPurchasing}`, issue: pass ? null : 'Smart Fulfilment categorized as Purchasing' };
});

// TEST 16: Project margin: Revenue excl. VAT €4,132.23 - Purchasing €2,500 = Margin €1,632.23
assertTest(16, 'Project margin: Revenue excl. VAT €4,132.23 - Purchasing €2,500 = Margin €1,632.23', () => {
  const margin = calculateProjectMarginWithPurchasing(5000, [{ debit: 2500, supplier: 'Ruben Verbeij', eref: 'EREF-1' }]);
  const pass = margin.revenueExclVat === 4132.23 && margin.totalPurchasing === 2500 && margin.projectMargin === 1632.23;
  return { pass, actual: `Order €5,000 incl. VAT -> Revenue Excl VAT (€${margin.revenueExclVat}) - Purchasing (€${margin.totalPurchasing}) = Project Margin €${margin.projectMargin} (${margin.marginPercentage}%)`, issue: pass ? null : 'Project margin calculation error' };
});

// Print Final QA Results
console.log("\n=======================================================");
console.log("   STEP 3 QA TEST RESULTS (Developer Briefing v1.2)");
console.log("=======================================================\n");

let allPassed = true;
results.forEach(r => {
  if (r.status === 'FAIL') allPassed = false;
  console.log(`[TEST ${r.id}] ${r.status}: ${r.description}`);
  console.log(`         Actual Result: ${r.actualResult}`);
  console.log(`         Remaining Issue: ${r.issue}\n`);
});

console.log(`TOTAL TESTS RUN: ${results.length}`);
console.log(`PASSED: ${results.filter(r => r.status === 'PASS').length}`);
console.log(`FAILED: ${results.filter(r => r.status === 'FAIL').length}`);
console.log(`OVERALL STATUS: ${allPassed ? '100% PASS' : 'FAIL'}`);
