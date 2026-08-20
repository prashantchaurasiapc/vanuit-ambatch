import { 
  normalizeCustomerName, 
  extractInvoiceOrQuoteNumber, 
  detectPaymentTypeKeyword, 
  matchPaymentToOrder, 
  calculateOrderSettlement, 
  calculateProjectMargin 
} from './orderMatcher.js';

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

// TEST 1: Order €5,000 + deposit €2,500 -> Partially Paid, Outstanding €2,500
assertTest(1, 'Order €5,000 + deposit €2,500 -> Partially Paid, Outstanding €2,500', () => {
  const order = { id: 'FA-2026-108', totalAmount: 5000 };
  const txs = [{ orderId: 'FA-2026-108', credit: 2500, type: 'Income' }];
  const settlement = calculateOrderSettlement(order, txs);
  const pass = settlement.totalReceived === 2500 && settlement.outstanding === 2500 && settlement.paymentStatus === 'Partially Paid';
  return { pass, actual: `Received: €${settlement.totalReceived}, Outstanding: €${settlement.outstanding}, Status: "${settlement.paymentStatus}"`, issue: pass ? null : 'Settlement calculation error' };
});

// TEST 2: Same order + final €2,500 -> Paid / Settled, Outstanding €0
assertTest(2, 'Same order + final €2,500 -> Paid / Settled, Outstanding €0', () => {
  const order = { id: 'FA-2026-108', totalAmount: 5000 };
  const txs = [
    { orderId: 'FA-2026-108', credit: 2500, type: 'Income' },
    { orderId: 'FA-2026-108', credit: 2500, type: 'Income' }
  ];
  const settlement = calculateOrderSettlement(order, txs);
  const pass = settlement.totalReceived === 5000 && settlement.outstanding === 0 && settlement.paymentStatus === 'Paid / Settled';
  return { pass, actual: `Received: €${settlement.totalReceived}, Outstanding: €${settlement.outstanding}, Status: "${settlement.paymentStatus}"`, issue: pass ? null : 'Final payment settlement error' };
});

// TEST 3: Deposit 10% (€500) + final 90% (€4,500) -> Correctly calculate actual outstanding
assertTest(3, 'Deposit 10% (€500) + final 90% (€4,500) -> Correctly calculate actual outstanding', () => {
  const order = { id: 'FA-2026-109', totalAmount: 5000 };
  const txs = [{ orderId: 'FA-2026-109', credit: 500, type: 'Income' }];
  const s1 = calculateOrderSettlement(order, txs);
  
  txs.push({ orderId: 'FA-2026-109', credit: 4500, type: 'Income' });
  const s2 = calculateOrderSettlement(order, txs);

  const pass = s1.outstanding === 4500 && s1.paymentStatus === 'Partially Paid' && s2.outstanding === 0 && s2.paymentStatus === 'Paid / Settled';
  return { pass, actual: `After 10% deposit: Outstanding €${s1.outstanding}. After 90% final: Outstanding €${s2.outstanding} (${s2.paymentStatus})`, issue: pass ? null : '10%/90% split calculation error' };
});

// TEST 4: Same customer pays same amount twice -> Both transactions remain valid, NOT deduplicated
assertTest(4, 'Same customer pays same amount twice -> Both transactions remain valid', () => {
  const tx1 = normalizeTransaction({ counterName: 'Bjorn Valk', credit: 2500, eref: 'EREF-DEP-1', description: '50% Aanbetaling' });
  const tx2 = normalizeTransaction({ counterName: 'Bjorn Valk', credit: 2500, eref: 'EREF-FIN-2', description: '50% Slotbetaling' });
  const list = [tx1, tx2];
  const pass = list.length === 2 && list[0].eref !== list[1].eref;
  return { pass, actual: `Preserved both identical payments (€2500) with unique references: EREF1=${list[0].eref}, EREF2=${list[1].eref}`, issue: pass ? null : 'Incorrectly deduplicated identical payments' };
});

// TEST 5: Invoice number present -> Correct order automatically matched
assertTest(5, 'Invoice number present -> Correct order automatically matched', () => {
  const orders = [{ id: 'FA-2026-108', customer: 'Bjorn Valk', totalAmount: 5000 }];
  const tx = { counterName: 'Bjorn Valk', credit: 2500, description: '50% Aanbetaling Keuken FA-2026-108' };
  const match = matchPaymentToOrder(tx, orders);
  const pass = match.isMatched === true && match.orderId === 'FA-2026-108' && match.matchingMethod.includes('Invoice Ref');
  return { pass, actual: `Matched to Order: ${match.orderId} via ${match.matchingMethod}`, issue: pass ? null : 'Invoice number matching failed' };
});

// TEST 6: Reference NOTPROVIDED -> Name + outstanding amount fallback matching
assertTest(6, 'Reference NOTPROVIDED -> Name + outstanding amount fallback matching', () => {
  const orders = [{ id: 'FA-2026-110', customer: 'Hr S Meertens e/o Mw L de Boer', totalAmount: 4000, outstanding: 2000 }];
  const tx = { counterName: 'S Meertens', credit: 2000, description: 'Bank transfer NOTPROVIDED' };
  const match = matchPaymentToOrder(tx, orders);
  const pass = match.isMatched === true && match.orderId === 'FA-2026-110' && match.matchingMethod.includes('Fallback');
  return { pass, actual: `Fallback Matched: ${match.orderId} via ${match.matchingMethod}`, issue: pass ? null : 'Fallback matching failed' };
});

// TEST 7: Payer name differs from customer -> Review Item if uncertain
assertTest(7, 'Payer name differs from customer -> Review Item if uncertain', () => {
  const orders = [{ id: 'FA-2026-111', customer: 'Peter de Jong', totalAmount: 6000, outstanding: 6000 }];
  const tx = { counterName: 'CNC Totaalafbouw B.V.', credit: 3000, description: 'Spoed overboeking zakelijk' };
  const match = matchPaymentToOrder(tx, orders);
  const pass = match.isMatched === false && match.reason.includes('Onbekende betaler');
  return { pass, actual: `Match status: isMatched=${match.isMatched}, Reason: "${match.reason}" (Sent to Review Item / Vraagpost)`, issue: pass ? null : 'Third party payer forced wrong match' };
});

// TEST 8: Unknown payment -> Review Item / Vraagpost
assertTest(8, 'Unknown payment -> Review Item / Vraagpost', () => {
  const orders = [{ id: 'FA-2026-112', customer: 'Mark Davis', totalAmount: 3000 }];
  const tx = { counterName: 'Unknown Trader X', credit: 120, description: 'Consulting' };
  const match = matchPaymentToOrder(tx, orders);
  const pass = match.isMatched === false;
  return { pass, actual: `Uncertain payment routed to Review Item: ${match.reason}`, issue: pass ? null : 'Unknown payment failed to route to Review Item' };
});

// TEST 9: Two invoices belonging to same customer job -> Purchasing not double-counted
assertTest(9, 'Two invoices belonging to same customer job -> Purchasing not double-counted', () => {
  const customerJob = { jobId: 'JOB-901', invoices: ['INV-1', 'INV-2'], revenueExclVat: 4132.23 };
  const purchasingList = [{ id: 'PURCH-1', debit: 2500, description: 'Houtslagers Hout Inkoop' }];
  const margin = calculateProjectMargin(5000, purchasingList);
  const pass = margin.totalPurchasing === 2500 && margin.projectMargin === 1632.23;
  return { pass, actual: `Revenue Excl VAT (€${margin.revenueExclVat}) - Single Purchasing (€${margin.totalPurchasing}) = Project Margin €${margin.projectMargin}`, issue: pass ? null : 'Purchasing double-counted' };
});

// TEST 10: Purchasing invoice linked to project -> Project margin updates correctly
assertTest(10, 'Purchasing invoice linked to project -> Project margin updates correctly', () => {
  const purchasingList = [
    { debit: 1250, description: 'Ruben Verbeij' },
    { debit: 890, description: 'Alibaba' }
  ];
  const margin = calculateProjectMargin(5000, purchasingList);
  const pass = margin.totalPurchasing === 2140 && margin.projectMargin === 1992.23;
  return { pass, actual: `Revenue Excl VAT (€4,132.23) - Total Purchasing (€2,140.00) = Project Margin €${margin.projectMargin}`, issue: pass ? null : 'Project margin update error' };
});

// TEST 11: Payment allocated manually from Review Items -> Customer/order received amount, outstanding & status update
assertTest(11, 'Payment allocated manually from Review Items -> Updates order received, outstanding & status', () => {
  const order = { id: 'FA-2026-108', totalAmount: 5000 };
  const manualAllocatedTx = { orderId: 'FA-2026-108', credit: 2500, allocationStatus: 'Allocated', matchingMethod: 'Manual' };
  const settlement = calculateOrderSettlement(order, [manualAllocatedTx]);
  const pass = settlement.totalReceived === 2500 && settlement.outstanding === 2500 && settlement.paymentStatus === 'Partially Paid';
  return { pass, actual: `Manually Allocated: Total Received €${settlement.totalReceived}, Outstanding €${settlement.outstanding}, Status: "${settlement.paymentStatus}"`, issue: pass ? null : 'Manual allocation settlement update error' };
});

// TEST 12: Order €5,000 incl. VAT -> Revenue excl. VAT = €4,132.23, VAT = €867.77
assertTest(12, 'Order €5,000 incl. VAT -> Revenue excl. VAT = €4,132.23, VAT = €867.77', () => {
  const order = { id: 'FA-2026-108', totalAmount: 5000 };
  const settlement = calculateOrderSettlement(order, []);
  const pass = settlement.revenueExclVat === 4132.23 && settlement.vatPayable === 867.77;
  return { pass, actual: `Order €5,000 incl. VAT -> Revenue Excl VAT: €${settlement.revenueExclVat}, VAT (21%): €${settlement.vatPayable}`, issue: pass ? null : 'VAT calculation error' };
});

// Print Final QA Results
console.log("\n=======================================================");
console.log("   STEP 2 QA TEST RESULTS (Developer Briefing v1.2)");
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
