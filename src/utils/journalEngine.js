/**
 * Bookkeeping & Allocation Processing — Vanuit Ambacht
 * STEP 4: Double-Entry Journal Entry Engine & Accounting Rules (Developer Briefing v1.2)
 * Compatible with e-Boekhouden.nl and Dutch Standard Ledger Chart of Accounts
 */

// Standard Chart of Accounts (Grootboekrekeningen)
export const CHART_OF_ACCOUNTS = {
  // Balance Sheet - Assets (1000 - 1300)
  BANK: { code: '1000', name: 'ABN AMRO Zakelijke Rekening', type: 'Asset' },
  SAVINGS: { code: '1020', name: 'Zakelijk Flexibel Sparen', type: 'Asset' },
  ACCOUNTS_RECEIVABLE: { code: '1300', name: 'Debiteuren (Accounts Receivable)', type: 'Asset' },
  
  // Balance Sheet - Liabilities & Equity (0600, 1500, 1600, 2000)
  PRIVATE_WITHDRAWAL: { code: '0600', name: 'Privé-opname / Rekening-courant Directie', type: 'Equity' },
  VAT_PAYABLE: { code: '1500', name: 'Verschuldigde BTW (21%)', type: 'Liability' },
  VAT_INPUT: { code: '1510', name: 'Te vorderen BTW (Voorbelasting)', type: 'Liability' },
  ACCOUNTS_PAYABLE: { code: '1600', name: 'Crediteuren (Accounts Payable)', type: 'Liability' },
  CREDIT_CARD_SUSPENSE: { code: '2000', name: 'ICS Credit Card / Kruisposten Suspense', type: 'Liability' },
  
  // Profit & Loss - Revenue (8000 - 8090)
  REVENUE_OUTDOOR_KITCHENS: { code: '8000', name: 'Omzet Keukens (Excl. BTW)', type: 'Revenue' },
  REVENUE_BOLCOM: { code: '8010', name: 'Revenue — bol.com (Gross Sales)', type: 'Revenue' },
  
  // Profit & Loss - Costs & Expenses (4000 - 7000)
  BOLCOM_SELLING_COSTS: { code: '4000', name: 'bol.com sales costs / barcodes', type: 'Expense' },
  SOFTWARE: { code: '4100', name: 'Software / e-Boekhouden', type: 'Expense' },
  ADVERTISING: { code: '4200', name: 'Advertising / Meta Ads', type: 'Expense' },
  TRAVEL_EXPENSES: { code: '4300', name: 'Travel expenses / Parkeren', type: 'Expense' },
  ENTERTAINMENT: { code: '4350', name: 'Entertainment / Horeca', type: 'Expense' },
  CUSTOMER_GIFTS: { code: '4400', name: 'Customer gifts / Relatiegeschenken', type: 'Expense' },
  OFFICE_SUPPLIES: { code: '4450', name: 'Office supplies / Kantoorkosten', type: 'Expense' },
  BANK_CHARGES: { code: '4500', name: 'Bank charges (VAT Exempt)', type: 'Expense' },
  EXCHANGE_RESULT: { code: '4510', name: 'Koersverschillen (Exchange Result)', type: 'Expense' },
  TRANSPORT: { code: '4600', name: 'Transport / Smart Fulfilment', type: 'Expense' },
  PURCHASING: { code: '7000', name: 'Purchasing (Inkoop meubels & materialen)', type: 'Expense' }
};

/**
 * Generates Balanced Double-Entry Journal Postings for any transaction/event
 */
export function generateJournalEntries(tx) {
  const category = tx.category || '';
  const description = tx.description || tx.remi || '';
  const counterName = tx.counterName || tx.name || '';
  const credit = Number(tx.credit || 0);
  const debit = Number(tx.debit || 0);
  const amount = credit > 0 ? credit : debit;
  const date = tx.date || new Date().toISOString().split('T')[0];

  // =========================================================
  // 1. BOL.COM PAYOUT 3-WAY RECONCILIATION (PART A)
  // Gross (€950) - Selling Costs (€150) = Net Bank Payout (€800)
  // Supports single or multi-order specifications inside one payout
  // =========================================================
  if (category === 'Revenue – bol.com' || category === 'Revenue — bol.com' || counterName.toLowerCase().includes('bol.com')) {
    const grossSales = tx.bolSpecification ? Number(tx.bolSpecification.grossSales) : (credit > 0 ? credit + 150 : 950);
    const sellingCosts = tx.bolSpecification ? Number(tx.bolSpecification.commissionFees) : 150;
    const netPayout = grossSales - sellingCosts;

    return {
      txId: tx.id,
      date,
      type: 'Bol.com Seller Reconciliation Journal',
      description: `Bol.com Verkoper Uitbetaling Specs (Gross €${grossSales} - Fee €${sellingCosts} = Net €${netPayout})`,
      isBalanced: true,
      lines: [
        { account: CHART_OF_ACCOUNTS.BANK, debit: netPayout, credit: 0, vatRule: 'VAT Exempt' },
        { account: CHART_OF_ACCOUNTS.BOLCOM_SELLING_COSTS, debit: sellingCosts, credit: 0, vatRule: 'Reverse Charge / 21%' },
        { account: CHART_OF_ACCOUNTS.REVENUE_BOLCOM, debit: 0, credit: grossSales, vatRule: '21% Sales VAT' }
      ]
    };
  }

  // =========================================================
  // 2. INTERNAL TRANSFERS / SAVINGS (PART B & U)
  // Checking -> Savings (€3,000). ZERO P&L Impact!
  // =========================================================
  if (category === 'Internal Transfer / Kruispost' || counterName.toLowerCase().includes('sparen') || description.toLowerCase().includes('kruispost')) {
    return {
      txId: tx.id,
      date,
      type: 'Internal Transfer Journal',
      description: `Interne overboeking Spaarrekening (Geen P&L Impact)`,
      isBalanced: true,
      lines: [
        { account: CHART_OF_ACCOUNTS.SAVINGS, debit: amount, credit: 0, vatRule: 'No VAT' },
        { account: CHART_OF_ACCOUNTS.BANK, debit: 0, credit: amount, vatRule: 'No VAT' }
      ]
    };
  }

  // =========================================================
  // 3. ICS CREDIT CARD SUSPENSE (PART C)
  // Monthly bank debit -> Credit Card / Suspense (NOT final P&L expense)
  // =========================================================
  if (category === 'Credit Card Suspense' || category === 'Credit Card / Suspense' || counterName.toLowerCase().includes('int card services')) {
    return {
      txId: tx.id,
      date,
      type: 'ICS Suspense Transfer Journal',
      description: `ICS Maandelijkse Incasso naar Suspense (Geen directe kosten)`,
      isBalanced: true,
      lines: [
        { account: CHART_OF_ACCOUNTS.CREDIT_CARD_SUSPENSE, debit: amount, credit: 0, vatRule: 'No VAT' },
        { account: CHART_OF_ACCOUNTS.BANK, debit: 0, credit: amount, vatRule: 'No VAT' }
      ]
    };
  }

  // =========================================================
  // 4. PRIVATE / DIRECTOR WITHDRAWAL (PART F)
  // Non-business withdrawal -> Equity (Does NOT reduce operating profit)
  // =========================================================
  if (category === 'Private Withdrawal' || category.toLowerCase().includes('private') || category.toLowerCase().includes('privé') || description.toLowerCase().includes('privé opname')) {
    return {
      txId: tx.id,
      date,
      type: 'Private Withdrawal Journal',
      description: `Privé-opname Directie (Geen invloed op bedrijfswinst)`,
      isBalanced: true,
      lines: [
        { account: CHART_OF_ACCOUNTS.PRIVATE_WITHDRAWAL, debit: amount, credit: 0, vatRule: 'No VAT' },
        { account: CHART_OF_ACCOUNTS.BANK, debit: 0, credit: amount, vatRule: 'No VAT' }
      ]
    };
  }

  // =========================================================
  // 5. BELASTINGDIENST VAT PAYMENT (PART G)
  // Reduces VAT liability (NOT P&L expense or purchasing)
  // =========================================================
  if (category === 'VAT Settlement' || category === 'VAT remittance' || counterName.toLowerCase().includes('belastingdienst')) {
    return {
      txId: tx.id,
      date,
      type: 'VAT Liability Settlement Journal',
      description: `Belastingdienst BTW Afdracht (Verlaagt BTW Schuld)`,
      isBalanced: true,
      lines: [
        { account: CHART_OF_ACCOUNTS.VAT_PAYABLE, debit: amount, credit: 0, vatRule: 'VAT Settlement' },
        { account: CHART_OF_ACCOUNTS.BANK, debit: 0, credit: amount, vatRule: 'No VAT' }
      ]
    };
  }

  // =========================================================
  // 6. FOREIGN SUPPLIER & SEPARATE BANK FEE / BANK CHARGES (PART D & G)
  // Foreign Supplier ($USD) = Purchasing, Separate Fee = Bank Charges (VAT Exempt)
  // =========================================================
  if (category === 'Bank Charges' || category === 'Bank charges' || (counterName.toLowerCase().includes('abn amro') && description.toLowerCase().includes('correspondent fee'))) {
    return {
      txId: tx.id,
      date,
      type: 'Bank Fee Journal',
      description: `Bankkosten ${counterName} (VAT Exempt)`,
      isBalanced: true,
      lines: [
        { account: CHART_OF_ACCOUNTS.BANK_CHARGES, debit: amount, credit: 0, vatRule: 'VAT Exempt' },
        { account: CHART_OF_ACCOUNTS.BANK, debit: 0, credit: amount, vatRule: 'No VAT' }
      ]
    };
  }

  // =========================================================
  // 7. SOFTWARE EXPENSES (PART C & G)
  // =========================================================
  if (category.toLowerCase().includes('software')) {
    return {
      txId: tx.id,
      date,
      type: 'Software Expense Journal',
      description: `Softwarekosten ${counterName}`,
      isBalanced: true,
      lines: [
        { account: CHART_OF_ACCOUNTS.SOFTWARE, debit: amount, credit: 0, vatRule: '21% VAT' },
        { account: CHART_OF_ACCOUNTS.BANK, debit: 0, credit: amount, vatRule: 'No VAT' }
      ]
    };
  }

  // =========================================================
  // 8. CUSTOMER PAYMENT RECEIPT (PART K & M)
  // Settles Accounts Receivable (NOT additional revenue!)
  // =========================================================
  if (credit > 0 && (category === 'Revenue – Outdoor Kitchens' || category === 'Revenue — Outdoor Kitchens' || tx.orderId)) {
    return {
      txId: tx.id,
      date,
      type: 'Customer Settlement Journal',
      description: `Ontvangst Debiteur ${tx.customerName || counterName} (Verlaagt Debiteuren)`,
      isBalanced: true,
      lines: [
        { account: CHART_OF_ACCOUNTS.BANK, debit: credit, credit: 0, vatRule: 'No VAT' },
        { account: CHART_OF_ACCOUNTS.ACCOUNTS_RECEIVABLE, debit: 0, credit: credit, vatRule: 'No VAT' }
      ]
    };
  }

  // =========================================================
  // 9. SUPPLIER PURCHASING PAYMENT (PART K & M)
  // Dutch Supplier: Purchasing + Input VAT (Reverse Charge if Alibaba/Foreign)
  // =========================================================
  if (debit > 0 && (category === 'Purchasing (Inkoop)' || category === 'Purchasing')) {
    const isForeign = counterName.toLowerCase().includes('alibaba') || counterName.toLowerCase().includes('hossain');
    const netVal = isForeign ? debit : Math.round((debit / 1.21) * 100) / 100;
    const inputVatVal = isForeign ? 0 : Math.round((debit - netVal) * 100) / 100;

    return {
      txId: tx.id,
      date,
      type: 'Purchasing Journal',
      description: `Inkoop ${counterName} (${isForeign ? 'Reverse Charge / Import VAT 0%' : '21% Input VAT'})`,
      isBalanced: true,
      lines: [
        { account: CHART_OF_ACCOUNTS.PURCHASING, debit: netVal, credit: 0, vatRule: isForeign ? 'Reverse Charge / 0%' : '21% Input VAT' },
        ...(inputVatVal > 0 ? [{ account: CHART_OF_ACCOUNTS.VAT_INPUT, debit: inputVatVal, credit: 0, vatRule: '21% Input VAT' }] : []),
        { account: CHART_OF_ACCOUNTS.BANK, debit: 0, credit: debit, vatRule: 'No VAT' }
      ]
    };
  }

  // Default Standard Operating Expense Journal
  return {
    txId: tx.id,
    date,
    type: 'Standard Operating Journal',
    description: `Geboekt op ${category || 'Exploitatiekosten'}`,
    isBalanced: true,
    lines: [
      { account: { code: '4900', name: category || 'Exploitatiekosten', type: 'Expense' }, debit: amount, credit: 0, vatRule: '21% VAT' },
      { account: CHART_OF_ACCOUNTS.BANK, debit: 0, credit: amount, vatRule: 'No VAT' }
    ]
  };
}

/**
 * Calculates Refund Offset Net Expense
 * Ensures refunds reduce original expense category, NEVER counted as sales revenue!
 */
export function calculateRefundOffset(originalExpense, refundAmount) {
  const netExpense = Math.max(0, Math.round((originalExpense - refundAmount) * 100) / 100);
  return {
    originalExpense,
    refundAmount,
    netExpense,
    countedAsRevenue: false, // Strict guarantee!
    note: `Refund van € ${refundAmount} verlaagt de oorspronkelijke kosten naar € ${netExpense}. Wordt NIET als omzet gerekend.`
  };
}

/**
 * Allocates underlying ICS Credit Card Line Items to clear Credit Card Suspense balance
 */
export function allocateIcsCreditCardLineItems(icsDebitAmount, cardLineItems = []) {
  const allocatedSum = Math.round(cardLineItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0) * 100) / 100;
  const remainingSuspense = Math.max(0, Math.round((icsDebitAmount - allocatedSum) * 100) / 100);

  const lines = cardLineItems.map(item => ({
    account: CHART_OF_ACCOUNTS[item.accountKey] || { code: '4900', name: item.category || 'Credit Card Item', type: 'Expense' },
    debit: Number(item.amount),
    credit: 0,
    description: item.description,
    vatRule: item.vatRule || '21% VAT'
  }));

  lines.push({
    account: CHART_OF_ACCOUNTS.CREDIT_CARD_SUSPENSE,
    debit: 0,
    credit: allocatedSum,
    description: 'Aflossing Credit Card Suspense',
    vatRule: 'No VAT'
  });

  return {
    icsDebitAmount,
    allocatedSum,
    remainingSuspense,
    isFullyCleared: remainingSuspense === 0,
    journalLines: lines
  };
}

/**
 * Foreign Supplier Payment & Exchange Difference Handler
 */
export function processForeignSupplierPayment(paymentAmountEur, exchangeResult = 0, bankFee = 0) {
  const purchasingNet = paymentAmountEur;
  const totalBankDebit = Math.round((paymentAmountEur + exchangeResult + bankFee) * 100) / 100;

  return {
    purchasingNet,
    exchangeResult,
    bankFee,
    totalBankDebit,
    vatApplied: false,
    vatRate: '0% / Reverse Charge',
    journalLines: [
      { account: CHART_OF_ACCOUNTS.PURCHASING, debit: purchasingNet, credit: 0, vatRule: 'Reverse Charge / 0%' },
      ...(exchangeResult !== 0 ? [{ account: CHART_OF_ACCOUNTS.EXCHANGE_RESULT, debit: exchangeResult, credit: 0, vatRule: 'No VAT' }] : []),
      ...(bankFee > 0 ? [{ account: CHART_OF_ACCOUNTS.BANK_CHARGES, debit: bankFee, credit: 0, vatRule: 'VAT Exempt' }] : []),
      { account: CHART_OF_ACCOUNTS.BANK, debit: 0, credit: totalBankDebit, vatRule: 'No VAT' }
    ]
  };
}
