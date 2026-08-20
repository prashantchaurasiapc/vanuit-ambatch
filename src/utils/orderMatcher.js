/**
 * Bookkeeping & Allocation Processing — Vanuit Ambacht
 * STEP 2: Customer Payment & Order / Project Allocation Engine (Developer Briefing v1.2)
 */

/**
 * Normalizes customer/payer names by removing partner titles & prefixes (e/o, eo, Hr, Mw, B.V., Ltd)
 */
export function normalizeCustomerName(nameStr) {
  if (!nameStr) return [];
  let clean = nameStr
    .replace(/\b(hr|mw|dhr|mvr|ing|dr|ir)\b/gi, '')
    .replace(/\b(e\/o|eo|and|en|\&)\b/gi, '|')
    .replace(/\b(b\.?v\.?|ltd\.?|n\.?v\.?|gmbh)\b/gi, '')
    .trim();

  return clean
    .split('|')
    .map(part => part.replace(/[^a-zA-Z0-9\s]/g, '').trim())
    .filter(part => part.length > 2);
}

/**
 * Extracts invoice or quote numbers from text description/REMI
 */
export function extractInvoiceOrQuoteNumber(text) {
  if (!text) return null;
  const str = text.replace(/\s+/g, '');

  // Patterns: FA-2026-108, FA2026108, OF-2026-003, OF2026003, 2025102, Q-4002, INV-4001
  const matchFA = str.match(/FA-?2026-?\d{3}/i);
  if (matchFA) return matchFA[0].toUpperCase().replace(/(\w{2})(\d{4})(\d{3})/, '$1-$2-$3');

  const matchOF = str.match(/OF-?2026-?\d{3}/i);
  if (matchOF) return matchOF[0].toUpperCase().replace(/(\w{2})(\d{4})(\d{3})/, '$1-$2-$3');

  const match2025 = str.match(/2025-?\d{3}/i);
  if (match2025) return match2025[0].toUpperCase();

  const matchQ = str.match(/Q-?\d{4}/i);
  if (matchQ) return matchQ[0].toUpperCase();

  const matchINV = str.match(/INV-?\d{4}/i);
  if (matchINV) return matchINV[0].toUpperCase();

  return null;
}

/**
 * Checks whether description contains percentage or deposit/final keywords (typo tolerant)
 */
export function detectPaymentTypeKeyword(text) {
  if (!text) return 'Standard Payment';
  const lower = text.toLowerCase();

  if (
    lower.includes('aanbetaling') || 
    lower.includes('aan betaling') || 
    lower.includes('50 procent') || 
    lower.includes('50%') || 
    lower.includes('10 procent') || 
    lower.includes('10%') ||
    lower.includes('deposit')
  ) {
    return 'Deposit';
  }

  if (
    lower.includes('slotbetaling') || 
    lower.includes('slot betaling') || 
    lower.includes('slotfactuur') || 
    lower.includes('slot factuur') || 
    lower.includes('90 procent') || 
    lower.includes('90 pocent') || // Typo tolerant
    lower.includes('90%') || 
    lower.includes('final')
  ) {
    return 'Final Payment';
  }

  return 'Payment';
}

/**
 * Payment-to-Order Matching Engine:
 * Attempts to automatically link a bank transaction to an Order/Invoice object
 */
export function matchPaymentToOrder(tx, ordersList) {
  const description = tx.description || tx.remi || '';
  const counterName = tx.counterName || tx.name || '';
  const creditAmount = Number(tx.credit || tx.numericAmount || 0);

  if (creditAmount <= 0) {
    return { isMatched: false, reason: 'Not a credit receipt' };
  }

  // 1. PRIMARY MATCHING SIGNAL: Invoice / Quote Number in description
  const extractedRef = extractInvoiceOrQuoteNumber(description) || extractInvoiceOrQuoteNumber(counterName);
  if (extractedRef) {
    const matchedOrder = ordersList.find(ord => {
      const orderRef = (ord.id || ord.invoiceNumber || ord.quoteNumber || '').toUpperCase().replace(/\s+/g, '');
      const cleanRef = extractedRef.replace(/\s+/g, '');
      return orderRef.includes(cleanRef) || cleanRef.includes(orderRef);
    });

    if (matchedOrder) {
      const pType = detectPaymentTypeKeyword(description);
      return {
        isMatched: true,
        matchingMethod: 'Automatic (Invoice Ref)',
        order: matchedOrder,
        orderId: matchedOrder.id,
        invoiceRef: extractedRef,
        customerName: matchedOrder.customer || counterName,
        paymentType: pType,
        allocatedAmount: creditAmount,
        allocationStatus: 'Allocated'
      };
    }
  }

  // 2. SECONDARY MATCHING SIGNAL (Fallback): Account holder name + Expected outstanding amount
  const counterTokens = normalizeCustomerName(counterName);
  
  const candidateMatches = ordersList.filter(ord => {
    const custTokens = normalizeCustomerName(ord.customer || '');
    const hasNameMatch = counterTokens.some(ct => custTokens.some(st => st.toLowerCase().includes(ct.toLowerCase()) || ct.toLowerCase().includes(st.toLowerCase())));
    
    // Check if amount matches total order, 50% deposit, 10% deposit, or current outstanding
    const totalVal = Number(ord.totalAmount || ord.amount || 0);
    const outstandingVal = Number(ord.outstanding !== undefined ? ord.outstanding : totalVal);
    
    const isAmountMatch = 
      Math.abs(creditAmount - outstandingVal) < 1 ||
      Math.abs(creditAmount - totalVal) < 1 ||
      Math.abs(creditAmount - totalVal * 0.5) < 1 ||
      Math.abs(creditAmount - totalVal * 0.1) < 1 ||
      Math.abs(creditAmount - totalVal * 0.9) < 1;

    return hasNameMatch && isAmountMatch;
  });

  if (candidateMatches.length === 1) {
    const matchedOrder = candidateMatches[0];
    const pType = detectPaymentTypeKeyword(description);
    return {
      isMatched: true,
      matchingMethod: 'Automatic (Name + Amount Fallback)',
      order: matchedOrder,
      orderId: matchedOrder.id,
      invoiceRef: matchedOrder.invoiceNumber || matchedOrder.id,
      customerName: matchedOrder.customer,
      paymentType: pType,
      allocatedAmount: creditAmount,
      allocationStatus: 'Allocated'
    };
  }

  // 3. UNCERTAIN OR THIRD-PARTY PAYER (Payer != Customer or Multiple Candidates) -> Review Item / Vraagpost
  return {
    isMatched: false,
    reason: candidateMatches.length > 1 
      ? `Meerdere kandidaten gevonden voor "${counterName}" (€ ${creditAmount})` 
      : `Onbekende betaler "${counterName}" zonder match op factuurkenmerk.`
  };
}

/**
 * Calculates Order Settlement & Payment Status
 */
export function calculateOrderSettlement(order, linkedTransactionsList = []) {
  const orderTotal = Number(order.totalAmount || order.numericAmount || order.amount || 0);
  
  // Sum up all allocated credit transactions for this order
  const linkedTxs = linkedTransactionsList.filter(t => t.orderId === order.id || t.invoiceRef === order.id || t.invoiceRef === order.invoiceNumber);
  const totalReceived = Math.round(linkedTxs.reduce((acc, t) => acc + (Number(t.credit || t.allocatedAmount || 0)), 0) * 100) / 100;
  
  const rawOutstanding = orderTotal - totalReceived;
  const outstanding = Math.max(0, Math.round(rawOutstanding * 100) / 100);

  let paymentStatus = 'Unpaid';
  if (totalReceived > 0) {
    if (outstanding <= 0.5) {
      paymentStatus = 'Paid / Settled';
    } else {
      paymentStatus = 'Partially Paid';
    }
  }

  // VAT 21% Breakdown
  const revenueExclVat = Math.round((orderTotal / 1.21) * 100) / 100;
  const vatPayable = Math.round((orderTotal - revenueExclVat) * 100) / 100;

  return {
    orderId: order.id,
    orderTotal,
    totalReceived,
    outstanding,
    paymentStatus,
    revenueExclVat,
    vatPayable,
    linkedTransactions: linkedTxs
  };
}

/**
 * Calculates Project Margin with Linked Purchasing
 */
export function calculateProjectMargin(orderTotalInclVat, linkedPurchasingList = []) {
  const revenueExclVat = Math.round((orderTotalInclVat / 1.21) * 100) / 100;
  const totalPurchasing = Math.round(linkedPurchasingList.reduce((acc, p) => acc + (Number(p.debit || p.numericAmount || p.amount || 0)), 0) * 100) / 100;
  const projectMargin = Math.round((revenueExclVat - totalPurchasing) * 100) / 100;
  const marginPercentage = revenueExclVat > 0 ? Math.round((projectMargin / revenueExclVat) * 100) : 0;

  return {
    orderTotalInclVat,
    revenueExclVat,
    totalPurchasing,
    projectMargin,
    marginPercentage
  };
}
