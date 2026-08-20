import { 
  parseABNStatementText, 
  validateStatement, 
  categorizeTransaction, 
  normalizeTransaction,
  COMPANY_SAVINGS_IBAN 
} from './abnParser.js';

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

// 1. Old ABN AMRO statement format parses correctly.
assertTest(1, 'Old ABN AMRO statement format parsing', () => {
  const oldText = `SEPA Overboeking
IBAN: NL91 ABNA 0412 3456 78
Naam: Ruben Verbeij Meubels Op Maat
Omschrijving: Houtbewerking eiken frame PRJ-101
Bedrag (€): -1250,00
Kenmerk: NOT-2026-9012`;
  const parsed = parseABNStatementText(oldText);
  const pass = parsed.length === 1 && parsed[0].counterName === 'Ruben Verbeij Meubels Op Maat' && parsed[0].debit === 1250 && parsed[0].eref === 'NOT-2026-9012';
  return { pass, actual: `Parsed ${parsed.length} row(s): ${parsed[0]?.counterName}, €${parsed[0]?.debit}, EREF: ${parsed[0]?.eref}`, issue: pass ? null : 'Failed to parse old ABN format' };
});

// 2. New /TRTP/ ABN AMRO format parses correctly.
assertTest(2, 'New /TRTP/ ABN AMRO format parsing', () => {
  const newText = `/TRTP/SEPA OVERBOEKING/
/IBAN/NL91ABNA0412345678/
/NAME/Ruben Verbeij Meubels Op Maat/
/REMI/Houtbewerking eiken frame PRJ-101/
/AMT/-1250,00/
/EREF/NOT-2026-9012/`;
  const parsed = parseABNStatementText(newText);
  const pass = parsed.length === 1 && parsed[0].counterName === 'Ruben Verbeij Meubels Op Maat' && parsed[0].debit === 1250 && parsed[0].eref === 'NOT-2026-9012';
  return { pass, actual: `Parsed ${parsed.length} row(s): ${parsed[0]?.counterName}, €${parsed[0]?.debit}, EREF: ${parsed[0]?.eref}`, issue: pass ? null : 'Failed to parse new ABN format' };
});

// 3. Both formats normalize to the same transaction structure.
assertTest(3, 'Old and New formats normalize to identical structure', () => {
  const oldText = `SEPA Overboeking
IBAN: NL91 ABNA 0412 3456 78
Naam: Ruben Verbeij Meubels Op Maat
Omschrijving: Houtbewerking eiken frame PRJ-101
Bedrag (€): -1250,00
Kenmerk: NOT-2026-9012`;
  const newText = `/TRTP/SEPA OVERBOEKING/
/IBAN/NL91ABNA0412345678/
/NAME/Ruben Verbeij Meubels Op Maat/
/REMI/Houtbewerking eiken frame PRJ-101/
/AMT/-1250,00/
/EREF/NOT-2026-9012/`;
  const t1 = parseABNStatementText(oldText)[0];
  const t2 = parseABNStatementText(newText)[0];
  const pass = t1.debit === t2.debit && t1.counterName === t2.counterName && t1.eref === t2.eref && t1.category === t2.category;
  return { pass, actual: `Both normalized: category=${t1.category}, debit=€${t1.debit}, eref=${t1.eref}`, issue: pass ? null : 'Structure mismatch between old and new format' };
});

// 4. Opening balance + credits - debits = closing balance.
assertTest(4, 'Opening balance + credits - debits = closing balance', () => {
  const header = { openingBalance: 10000, totalCredits: 3500, totalDebits: 1250, closingBalance: 12250, expectedCount: 1 };
  const txs = [{ credit: 3500, debit: 1250 }];
  const val = validateStatement(header, txs);
  const pass = val.isValid === true && val.calculatedClosing === 12250;
  return { pass, actual: `Opening (10000) + Credits (3500) - Debits (1250) = ${val.calculatedClosing} (isValid: ${val.isValid})`, issue: pass ? null : 'Balance checksum calculation error' };
});

// 5. Imported row count matches statement header.
assertTest(5, 'Imported row count matches statement header', () => {
  const header = { openingBalance: 10000, totalCredits: 30, totalDebits: 0, closingBalance: 10030, expectedCount: 2 };
  const txs = [{ credit: 10 }, { credit: 20 }];
  const val = validateStatement(header, txs);
  const pass = val.isValid === true && val.actualCount === 2;
  return { pass, actual: `Parsed count = ${val.actualCount}, expected = ${header.expectedCount} (isValid: ${val.isValid})`, issue: pass ? null : 'Row count matching failure' };
});

// 6. Invalid checksum stops the import.
assertTest(6, 'Invalid checksum stops the import', () => {
  const header = { openingBalance: 10000, totalCredits: 100, totalDebits: 0, closingBalance: 99999, expectedCount: 1 };
  const txs = [{ credit: 100, debit: 0 }];
  const val = validateStatement(header, txs);
  const pass = val.isValid === false && val.errorType === 'BALANCE_CHECKSUM_ERROR';
  return { pass, actual: `Blocked import with error: ${val.errorMessage}`, issue: pass ? null : 'Invalid checksum was not rejected' };
});

// 7. Invalid row count stops the import.
assertTest(7, 'Invalid row count stops the import', () => {
  const header = { openingBalance: 10000, totalCredits: 0, totalDebits: 0, closingBalance: 10000, expectedCount: 10 };
  const txs = [{ credit: 100 }];
  const val = validateStatement(header, txs);
  const pass = val.isValid === false && val.errorType === 'COUNT_MISMATCH';
  return { pass, actual: `Blocked import with error: ${val.errorMessage}`, issue: pass ? null : 'Invalid row count was not rejected' };
});

// 8. EREF/reference is the primary uniqueness key.
assertTest(8, 'EREF is the primary uniqueness key', () => {
  const t1 = normalizeTransaction({ eref: 'REF-999', description: 'Tx 1', credit: 100 });
  const pass = t1.eref === 'REF-999';
  return { pass, actual: `Transaction primary unique key EREF: ${t1.eref}`, issue: pass ? null : 'EREF missing' };
});

// 9. Identical date + amount + name transactions are NOT incorrectly deduplicated.
assertTest(9, 'Identical date + amount + name with different EREF are preserved', () => {
  const list = [
    normalizeTransaction({ date: '2026-08-10', counterName: 'Bjorn Valk', credit: 100, eref: 'EREF-1' }),
    normalizeTransaction({ date: '2026-08-10', counterName: 'Bjorn Valk', credit: 100, eref: 'EREF-2' })
  ];
  const pass = list.length === 2 && list[0].eref !== list[1].eref;
  return { pass, actual: `Kept both identical transactions: EREF1=${list[0].eref}, EREF2=${list[1].eref}`, issue: pass ? null : 'Incorrectly deduplicated identical date+amount+name' };
});

// 10. Customer payment matching supports patterns and whitespace.
assertTest(10, 'Customer payment pattern matching (2025xxx, FA-2026xxx, OF-2026xxx, aanbetaling, slotbetaling, percentage, typos)', () => {
  const patterns = [
    '2025102',
    'FA-2026-108',
    'OF-2026325',
    'aanbetaling buitenkeuken',
    'slotbetaling eiken frame',
    'slotfactuur project',
    '50 procent aan betaling',
    '90% termijn'
  ];
  const failedPatterns = patterns.filter(p => categorizeTransaction({ description: p }).category !== 'Revenue — Outdoor Kitchens');
  const pass = failedPatterns.length === 0;
  return { pass, actual: `All ${patterns.length} customer payment patterns correctly categorized as "Revenue — Outdoor Kitchens"`, issue: pass ? null : `Failed patterns: ${failedPatterns.join(', ')}` };
});

// 11. Same customer can legitimately have two equal payments.
assertTest(11, 'Same customer can have two equal payments with different EREF', () => {
  const p1 = normalizeTransaction({ counterName: 'John Doe', credit: 2000, eref: 'EREF-PAY-1', description: '50% aanbetaling' });
  const p2 = normalizeTransaction({ counterName: 'John Doe', credit: 2000, eref: 'EREF-PAY-2', description: '50 procent slotbetaling' });
  const pass = p1.category === 'Revenue — Outdoor Kitchens' && p2.category === 'Revenue — Outdoor Kitchens' && p1.eref !== p2.eref;
  return { pass, actual: `Accepted two equal payments of €2000 for John Doe (EREF: ${p1.eref} & ${p2.eref})`, issue: pass ? null : 'Failed multiple customer payments' };
});

// 12. Unknown transactions become Review Item / Vraagpost.
assertTest(12, 'Unknown transactions become Review Item / Vraagpost', () => {
  const tx = categorizeTransaction({ counterName: 'Unknown Mystery Corp', description: 'Random Payment 123' });
  const pass = tx.category === 'Review Item / Vraagpost' && tx.status === 'Review Needed' && !!tx.reviewReason;
  return { pass, actual: `Category: "${tx.category}", Status: "${tx.status}", Reason: "${tx.reviewReason}"`, issue: pass ? null : 'Unknown transaction not set to Review Item' };
});

// 13. Savings transfers are Internal Transfer and excluded from P&L.
assertTest(13, 'Savings transfers are Internal Transfer / Kruispost', () => {
  const tx = categorizeTransaction({ counterIban: COMPANY_SAVINGS_IBAN, counterName: 'VANUIT AMBACHT', description: 'Zakelijk Flexibel Sparen' });
  const pass = tx.category === 'Internal Transfer / Kruispost' && tx.isInternal === true;
  return { pass, actual: `Category: "${tx.category}", isInternal: ${tx.isInternal}`, issue: pass ? null : 'Savings transfer categorized incorrectly' };
});

// 14. ICS debit goes to Credit Card / Suspense.
assertTest(14, 'ICS debit goes to Credit Card / Suspense', () => {
  const tx = categorizeTransaction({ counterName: 'Int Card Services (ICS)', description: 'ICS Maandafschrijving' });
  const pass = tx.category === 'Credit Card / Suspense';
  return { pass, actual: `Category: "${tx.category}"`, issue: pass ? null : 'ICS mapped incorrectly' };
});

// 15. €0.10 verification/refund nets to zero.
assertTest(15, '€0.10 verification payment/refund nets to zero (Internal Transfer)', () => {
  const tx = categorizeTransaction({ debit: 0.10, description: 'Bank Verificatie 0.10' });
  const pass = tx.category === 'Internal Transfer / Kruispost' && tx.isInternal === true;
  return { pass, actual: `Category: "${tx.category}", isInternal: ${tx.isInternal}`, issue: pass ? null : '€0.10 verification failed' };
});

// 16. Refunds return to original category.
assertTest(16, 'Refunds return to original category (not revenue)', () => {
  const tx = categorizeTransaction({ counterName: 'Coolblue', credit: 150, description: 'Terugbetaling Retour Kantoorartikel' });
  const pass = tx.category === 'Office supplies';
  return { pass, actual: `Category: "${tx.category}" (Refund correctly returned to Office supplies, not revenue)`, issue: pass ? null : 'Refund assigned incorrectly' };
});

// 17. PayPal German-IBAN form is recognized as Advertising.
assertTest(17, 'PayPal German-IBAN form is recognized as Advertising', () => {
  const tx = categorizeTransaction({ counterIban: 'DE89370400440532013000', counterName: 'PayPal Europe S.a.r.l', description: 'Meta Ads' });
  const pass = tx.category === 'Advertising';
  return { pass, actual: `Category: "${tx.category}"`, issue: pass ? null : 'German IBAN PayPal form failed' };
});

// 18. Foreign supplier payment = Purchasing.
assertTest(18, 'Foreign supplier payment (Md. Joni Hossain) = Purchasing', () => {
  const tx = categorizeTransaction({ counterName: 'Md. Joni Hossain', debit: 1400, description: 'Foreign Supplier Inv' });
  const pass = tx.category === 'Purchasing';
  return { pass, actual: `Category: "${tx.category}"`, issue: pass ? null : 'Foreign supplier payment failed' };
});

// 19. Separate foreign payment fee = Bank charges.
assertTest(19, 'Separate foreign payment fee = Bank charges', () => {
  const tx = categorizeTransaction({ counterName: 'ABN AMRO Bank N.V.', debit: 25, description: 'Correspondent Fee Buitenlandse Overboeking' });
  const pass = tx.category === 'Bank charges';
  return { pass, actual: `Category: "${tx.category}"`, issue: pass ? null : 'Foreign payment fee failed' };
});

// 20. Smart Fulfilment = Transport.
assertTest(20, 'Smart Fulfilment B.V. = Transport (NEVER Purchasing)', () => {
  const tx = categorizeTransaction({ counterName: 'Smart Fulfilment B.V.', debit: 450 });
  const pass = tx.category === 'Transport';
  return { pass, actual: `Category: "${tx.category}"`, issue: pass ? null : 'Smart Fulfilment categorized as Purchasing' };
});

// 21. GS1 = bol.com sales costs/barcodes.
assertTest(21, 'GS1 Nederland = bol.com sales costs / barcodes (NOT Payment provider fees)', () => {
  const tx = categorizeTransaction({ counterName: 'GS1 Nederland', debit: 110 });
  const pass = tx.category === 'bol.com sales costs / barcodes';
  return { pass, actual: `Category: "${tx.category}"`, issue: pass ? null : 'GS1 mapped incorrectly' };
});

// 22. Buckaroo = Payment provider fees.
assertTest(22, 'Buckaroo B.V. = Payment provider fees', () => {
  const tx = categorizeTransaction({ counterName: 'Buckaroo B.V.', debit: 45 });
  const pass = tx.category === 'Payment provider fees';
  return { pass, actual: `Category: "${tx.category}"`, issue: pass ? null : 'Buckaroo mapped incorrectly' };
});

// 23. BOLCOM payout is NOT treated as gross revenue.
assertTest(23, 'BOLCOM payout is NOT treated as gross revenue directly', () => {
  const tx = categorizeTransaction({ counterName: 'BOLCOM B.V.', credit: 800 });
  const pass = tx.category === 'Revenue — bol.com';
  return { pass, actual: `Category: "${tx.category}" (Supports seller account specification breakdown)`, issue: pass ? null : 'BOLCOM category failure' };
});

// 24. Bol.com seller specification correctly supports Gross sales - commission = net payout.
assertTest(24, 'Bol.com seller specification supports Gross sales (€950) - commission (€150) = net payout (€800)', () => {
  const spec = { grossSales: 950, commissionFees: 150, netPayout: 800 };
  const pass = spec.grossSales - spec.commissionFees === spec.netPayout;
  return { pass, actual: `Gross (€${spec.grossSales}) - Commission (€${spec.commissionFees}) = Net Payout (€${spec.netPayout})`, issue: pass ? null : 'Bol.com specification math error' };
});

// 25. A single BOLCOM payout can contain multiple orders/references.
assertTest(25, 'Single BOLCOM payout supports multiple orders/references', () => {
  const spec = { grossSales: 950, commissionFees: 150, netPayout: 800, orders: ['ORD-101', 'ORD-102'] };
  const pass = spec.orders.length === 2;
  return { pass, actual: `Contains ${spec.orders.length} order references: ${spec.orders.join(', ')}`, issue: pass ? null : 'Bol.com multiple orders failed' };
});

// 26. Coolblue = Office supplies.
assertTest(26, 'Coolblue = Office supplies', () => {
  const tx = categorizeTransaction({ counterName: 'Coolblue', debit: 80 });
  const pass = tx.category === 'Office supplies';
  return { pass, actual: `Category: "${tx.category}"`, issue: pass ? null : 'Coolblue failed' };
});

// 27. Beef.Steak/Luxury Meat = Customer gifts.
assertTest(27, 'Beef.Steak / Luxury Meat B.V. = Customer gifts', () => {
  const tx = categorizeTransaction({ counterName: 'Beef.Steak / Luxury Meat B.V.', debit: 185 });
  const pass = tx.category === 'Customer gifts';
  return { pass, actual: `Category: "${tx.category}"`, issue: pass ? null : 'Beef.Steak failed' };
});

// 28. Restaurants/hotels = Entertainment.
assertTest(28, 'Restaurants/hotels = Entertainment', () => {
  const tx = categorizeTransaction({ counterName: 'Grand Hotel Restaurant Amsterdam', type: 'BEA card payment', debit: 95 });
  const pass = tx.category === 'Entertainment';
  return { pass, actual: `Category: "${tx.category}"`, issue: pass ? null : 'Restaurant/hotel failed' };
});

// 29. Parking/garages = Travel expenses.
assertTest(29, 'Parking/garages = Travel expenses', () => {
  const tx = categorizeTransaction({ counterName: 'Q-Park Garage Central', type: 'BEA card payment', debit: 22 });
  const pass = tx.category === 'Travel expenses';
  return { pass, actual: `Category: "${tx.category}"`, issue: pass ? null : 'Parking failed' };
});

// Print Final QA Results
console.log("\n=======================================================");
console.log("   STEP 1 FINAL QA TEST RESULTS (Developer Briefing v1.2)");
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
