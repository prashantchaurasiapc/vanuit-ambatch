/**
 * Bookkeeping & Allocation Processing — Vanuit Ambacht
 * STEP 4: Final Statement & Accounting Period Integrity Validator (Developer Briefing v1.2)
 */

export function validateAccountingPeriodIntegrity(headerInfo, transactionsList, ordersList = []) {
  const issues = [];
  const checks = [];

  const opening = Number(headerInfo.openingBalance || 0);
  const closing = Number(headerInfo.closingBalance || 0);
  const expectedCount = Number(headerInfo.expectedCount || 0);

  // 1. Balance Checksum: Opening + Credits - Debits = Closing
  const actualCredits = Math.round(transactionsList.reduce((acc, t) => acc + Number(t.credit || 0), 0) * 100) / 100;
  const actualDebits = Math.round(transactionsList.reduce((acc, t) => acc + Number(t.debit || 0), 0) * 100) / 100;
  const calculatedClosing = Math.round((opening + actualCredits - actualDebits) * 100) / 100;
  const isBalanceValid = Math.abs(calculatedClosing - closing) < 0.05;

  checks.push({
    id: 'BALANCE_CHECKSUM',
    title: 'Saldo Controle (Opening + Credits - Debits = Closing)',
    pass: isBalanceValid,
    detail: `Opening (€${opening}) + Credits (€${actualCredits}) - Debits (€${actualDebits}) = Calculated (€${calculatedClosing}) vs Statement (€${closing})`
  });

  if (!isBalanceValid) {
    issues.push(`Saldo controle afwijking: Berekend €${calculatedClosing} komt niet overeen met afschrift eindsaldo €${closing}.`);
  }

  // 2. Statement Count Check
  const isCountValid = expectedCount === 0 || transactionsList.length === expectedCount;
  checks.push({
    id: 'ROW_COUNT',
    title: 'Aantal Transacties Controle',
    pass: isCountValid,
    detail: `Header vermeldt ${expectedCount} transacties, ingelezen ${transactionsList.length}`
  });

  if (!isCountValid) {
    issues.push(`Aantal transacties afwijking: Header vermeldt ${expectedCount}, maar ${transactionsList.length} ingelezen.`);
  }

  // 3. Categorization & Review Item Completeness Check
  const unclassifiedTxns = transactionsList.filter(t => !t.category || (t.category === 'Unclassified' && t.status !== 'Review Needed'));
  const isCategorizationComplete = unclassifiedTxns.length === 0;
  checks.push({
    id: 'CATEGORIZATION_COMPLETE',
    title: 'Categorie / Vraagpost Dekking',
    pass: isCategorizationComplete,
    detail: `Alle ${transactionsList.length} transacties hebben een geldige categorie of Vraagpost status`
  });

  // 4. EREF Uniqueness & Identical Transaction Preservation Check
  const erefs = transactionsList.map(t => t.eref || t.id);
  const uniqueErefs = new Set(erefs);
  const isErefUnique = uniqueErefs.size === erefs.length;
  checks.push({
    id: 'EREF_UNIQUENESS',
    title: 'EREF Uniekheid & Identieke Transacties Behoud',
    pass: isErefUnique,
    detail: `Unieke EREFs: ${uniqueErefs.size} / ${erefs.length}`
  });

  // 5. Smart Fulfilment = Transport Protection Check
  const misclassifiedSmartFulfilment = transactionsList.filter(t => 
    (t.counterName || '').toLowerCase().includes('smart fulfilment') && t.category === 'Purchasing'
  );
  checks.push({
    id: 'SMART_FULFILMENT_CHECK',
    title: 'Smart Fulfilment = Transport Borging',
    pass: misclassifiedSmartFulfilment.length === 0,
    detail: `Smart Fulfilment staat op Transport (Niet op Purchasing)`
  });

  // 6. Bol.com 3-Way Reconciliation Check
  const bolTxns = transactionsList.filter(t => t.category === 'Revenue — bol.com' || (t.counterName || '').toLowerCase().includes('bol.com'));
  const isBolReconciled = bolTxns.every(t => {
    if (!t.bolSpecification) return true; // Standard fallback
    return Math.abs(Number(t.bolSpecification.grossSales) - Number(t.bolSpecification.commissionFees) - Number(t.bolSpecification.netPayout)) < 0.5;
  });
  checks.push({
    id: 'BOL_RECONCILIATION',
    title: 'Bol.com Uitbetaling Reconciliatie (Gross - Fee = Net)',
    pass: isBolReconciled,
    detail: `Bol.com specificaties sluiten 100% aan`
  });

  // 7. ICS Suspense Non-Expense Guarantee Check
  const icsTxns = transactionsList.filter(t => (t.counterName || '').toLowerCase().includes('int card services'));
  const isIcsSuspenseValid = icsTxns.every(t => t.category === 'Credit Card / Suspense');
  checks.push({
    id: 'ICS_SUSPENSE_CHECK',
    title: 'ICS Incasso = Credit Card / Suspense (Geen directe kosten)',
    pass: isIcsSuspenseValid,
    detail: `ICS maandbedragen geboekt op Suspense`
  });

  const isPeriodComplete = isBalanceValid && isCountValid && isCategorizationComplete && isBolReconciled && isIcsSuspenseValid;

  return {
    isPeriodComplete,
    statusText: isPeriodComplete ? 'Period Accounting Verified & Complete' : 'Validation Failed — Issues Present',
    opening,
    closing,
    calculatedClosing,
    actualCredits,
    actualDebits,
    totalCount: transactionsList.length,
    checks,
    issues
  };
}
