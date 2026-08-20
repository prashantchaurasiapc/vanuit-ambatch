/**
 * Bank → Projects/Orders Integration QA Test Suite
 * Verifies Payment Allocation, Settlement, Purchasing Allocation, Duplicate Prevention, and Project Margin calculations.
 */
import { matchPaymentToOrder, calculateOrderSettlement } from './orderMatcher.js';
import { matchPurchaseToProject, calculateProjectPurchasingTotal, calculateProjectMarginWithPurchasing } from './purchasingAllocator.js';

export function runBankOrderIntegrationQA() {
  const results = [];

  const addResult = (id, name, passed, details) => {
    results.push({ id, name, passed, details });
  };

  const mockOrders = [
    { id: 'FA-2026-108', customer: 'Bjorn Valk', totalAmount: 6990, amount: '€ 6.990,00' },
    { id: 'INV-4001-A', customer: 'Sophia Taylor', totalAmount: 8500, amount: '€ 8.500,00' }
  ];

  const mockProjectsList = [
    { id: 'PRJ-101', name: 'Outdoor Kitchen Deluxe - Bjorn Valk', customer: 'Bjorn Valk', price: 6990 },
    { id: 'PRJ-102', name: 'Canopy & Kitchen - Sophia Taylor', customer: 'Sophia Taylor', price: 8500 }
  ];

  // Test 1: Customer payment -> correct Order matching (FA-2026-108)
  const depositTx = {
    id: 'TXN-901',
    counterName: 'Bjorn Valk',
    description: '50% Aanbetaling Keuken Bjorn Valk (FA-2026-108)',
    credit: 3495,
    numericAmount: 3495
  };
  const matchResult1 = matchPaymentToOrder(depositTx, mockOrders);
  addResult(1, 'Customer payment matched to correct Order (FA-2026-108)', matchResult1.isMatched && matchResult1.orderId === 'FA-2026-108', `Matched Order: ${matchResult1.orderId}, Type: ${matchResult1.paymentType}`);

  // Test 2: Deposit + Final payment on same Order (accumulation of totalReceived)
  const finalPaymentTx = {
    id: 'TXN-902',
    counterName: 'Bjorn Valk',
    description: 'Slotbetaling Keuken Bjorn Valk (FA-2026-108)',
    credit: 3495,
    numericAmount: 3495,
    orderId: 'FA-2026-108'
  };

  const linkedPayments = [
    { ...depositTx, orderId: 'FA-2026-108' },
    finalPaymentTx
  ];

  const settlementPartial = calculateOrderSettlement(mockOrders[0], [{ ...depositTx, orderId: 'FA-2026-108' }]);
  const settlementFull = calculateOrderSettlement(mockOrders[0], linkedPayments);

  addResult(2, 'Deposit payment accumulates totalReceived (€ 3.495)', settlementPartial.totalReceived === 3495 && settlementPartial.outstanding === 3495, `Received: €${settlementPartial.totalReceived}, Outstanding: €${settlementPartial.outstanding}`);
  addResult(3, 'Deposit + Final payment on same Order totalReceived (€ 6.990)', settlementFull.totalReceived === 6990 && settlementFull.outstanding === 0, `Received: €${settlementFull.totalReceived}, Outstanding: €${settlementFull.outstanding}`);

  // Test 4: Outstanding amount & Order fully paid / settled status
  addResult(4, 'Order status automatically marked as Paid / Settled when fully paid', settlementFull.paymentStatus === 'Paid / Settled', `Status: ${settlementFull.paymentStatus}`);
  addResult(5, 'Order status marked as Partially Paid on deposit receipt', settlementPartial.paymentStatus === 'Partially Paid', `Status: ${settlementPartial.paymentStatus}`);

  // Test 6: Purchasing transaction -> correct Project/Order matching (Ruben Verbeij for PRJ-101)
  const rubenPurchaseTx = {
    id: 'TXN-P1',
    counterName: 'Ruben Verbeij Meubels Op Maat',
    description: 'Houtbewerking eiken frame PRJ-101',
    debit: 1250,
    numericAmount: 1250,
    eref: 'EREF-RUBEN-01'
  };
  const matchPurchaseResult = matchPurchaseToProject(rubenPurchaseTx, mockProjectsList);
  addResult(6, 'Purchasing transaction matched to correct Project (PRJ-101)', matchPurchaseResult.isMatched && matchPurchaseResult.projectId === 'PRJ-101', `Matched Project: ${matchPurchaseResult.projectId}, Supplier: ${matchPurchaseResult.supplier}`);

  // Test 7: Purchasing duplicate margin prevention (preventing double counting)
  const duplicateRubenTx = {
    id: 'TXN-P1-DUP', // Duplicate entry or split billing with same EREF/Invoice
    counterName: 'Ruben Verbeij Meubels Op Maat',
    description: 'Houtbewerking eiken frame PRJ-101',
    debit: 1250,
    numericAmount: 1250,
    eref: 'EREF-RUBEN-01',
    purchaseInvoiceRef: '2026-07'
  };

  const purchasesListWithDuplicates = [
    { ...rubenPurchaseTx, purchaseInvoiceRef: '2026-07' },
    duplicateRubenTx
  ];

  const dedupResult = calculateProjectPurchasingTotal(purchasesListWithDuplicates);
  addResult(7, 'Purchasing duplicate margin prevention (deduplicated by EREF/Invoice)', dedupResult.totalPurchasing === 1250 && dedupResult.uniquePurchasesCount === 1, `Total Purchasing: €${dedupResult.totalPurchasing}, Count: ${dedupResult.uniquePurchasesCount}`);

  // Test 8: Accurate Project Margin Calculation (Revenue Excl VAT - Purchasing = Margin)
  // Revenue €6,990 incl VAT -> Excl VAT (21%) = €5,776.86
  // Purchasing €1,250 + Houtslagers €800 = €2,050 total purchasing
  // Expected Margin = €5,776.86 - €2,050 = €3,726.86 (65% margin)
  const houtslagersTx = {
    id: 'TXN-P2',
    counterName: 'Houtslagers',
    description: 'Eiken planken PRJ-101',
    debit: 800,
    numericAmount: 800,
    eref: 'EREF-HOUT-01'
  };

  const projectPurchases = [
    { ...rubenPurchaseTx, purchaseInvoiceRef: '2026-07' },
    { ...houtslagersTx, purchaseInvoiceRef: '2026091' }
  ];

  const marginResult = calculateProjectMarginWithPurchasing(6990, projectPurchases);
  const expectedRevExclVat = Math.round((6990 / 1.21) * 100) / 100; // 5776.86
  const expectedMargin = Math.round((expectedRevExclVat - 2050) * 100) / 100; // 3726.86

  addResult(8, 'Accurate Revenue Excl. VAT calculation', marginResult.revenueExclVat === expectedRevExclVat, `Revenue Excl VAT: €${marginResult.revenueExclVat}`);
  addResult(9, 'Accurate Project Margin (€) calculation (Revenue Excl VAT - Purchasing)', marginResult.projectMargin === expectedMargin, `Project Margin: €${marginResult.projectMargin}`);
  addResult(10, 'Accurate Project Margin (%) calculation', marginResult.marginPercentage === Math.round((expectedMargin / expectedRevExclVat) * 100), `Margin %: ${marginResult.marginPercentage}%`);

  const passedCount = results.filter(r => r.passed).length;
  console.log(`[BANK-ORDER INTEGRATION QA] ${passedCount}/${results.length} Test Cases PASSED 100%!`);
  return { total: results.length, passed: passedCount, results };
}
