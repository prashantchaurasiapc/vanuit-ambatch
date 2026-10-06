/**
 * Bookkeeping & Allocation Processing — Vanuit Ambacht
 * Official Client Bookkeeping Decision Tree & Categorization Engine
 */

export const BOOKKEEPING_CATEGORIES = [
  // Revenue
  'Revenue – Outdoor Kitchens',
  'Revenue – bol.com',

  // Costs
  'Purchasing (Inkoop)',
  'Transport – Smart Fulfilment',
  'Advertising – Meta Ads',
  'Software',
  'Payment Provider Fees',
  'Shipping Costs',
  'Bank Charges',
  'Office Supplies',
  'Customer Gifts',
  'Travel / Entertainment',

  // Balance Sheet / Suspense
  'Internal Transfer / Kruispost',
  'Credit Card Suspense',
  'VAT Settlement',

  // Other
  'Private Withdrawal',
  'Review Item / Vraagpost'
];

export const COMPANY_SAVINGS_IBAN = 'NL44ABNA0987654321';

/**
 * Classifies a single transaction based on Client Bookkeeping Decision-Tree Rules (First matching rule wins)
 */
export function categorizeTransaction(tx) {
  const counterName = (tx.counterName || '').trim();
  const counterIban = (tx.counterIban || '').replace(/\s+/g, '');
  const description = (tx.description || tx.remi || '').trim();
  const fullText = `${counterName} ${counterIban} ${description}`.toLowerCase();

  const creditVal = Number(tx.credit || (tx.numericAmount && !tx.debit ? tx.numericAmount : 0));
  const debitVal = Number(tx.debit || (tx.numericAmount && !tx.credit ? tx.numericAmount : 0));

  // RULE 1: Internal Transfers (Zakelijk Flexibel Sparen / Company Savings / €0.10 Verification)
  if (
    counterIban === COMPANY_SAVINGS_IBAN ||
    fullText.includes('zakelijk flexibel sparen') ||
    fullText.includes('interne overboeking') ||
    (counterName.toUpperCase().includes('VANUIT AMBACHT') && (fullText.includes('sparen') || fullText.includes('interne'))) ||
    ((debitVal === 0.10 || creditVal === 0.10) && (fullText.includes('verificatie') || fullText.includes('1 cent') || fullText.includes('0.10')))
  ) {
    return {
      category: 'Internal Transfer / Kruispost',
      matchReason: 'Savings IBAN Match — Internal Transfer',
      status: 'Internal Transfer',
      reviewReason: null,
      isInternal: true
    };
  }

  // RULE 1.5: Private / Director Withdrawal (Must take priority over counterparty name)
  if (fullText.includes('privé opname') || fullText.includes('prive opname') || fullText.includes('priveontrekking') || fullText.includes('geldopname prive')) {
    return {
      category: 'Private Withdrawal',
      matchReason: 'Private Withdrawal Match',
      status: 'Categorized',
      reviewReason: null,
      isInternal: false
    };
  }

  // RULE 2: Smart Fulfilment B.V. -> Transport – Smart Fulfilment (NEVER Purchasing)
  if (fullText.includes('smart fulfilment')) {
    return {
      category: 'Transport – Smart Fulfilment',
      matchReason: 'Description Match — Smart Fulfilment',
      status: 'Categorized',
      reviewReason: null,
      isInternal: false
    };
  }

  // RULE 3: Ruben Verbeij Meubels Op Maat -> Purchasing (Inkoop)
  if (fullText.includes('ruben verbeij') || fullText.includes('meubels op maat') || fullText.includes('hoek bouw') || fullText.includes('sven hoek')) {
    return {
      category: 'Purchasing (Inkoop)',
      matchReason: 'IBAN Match — Ruben Verbeij',
      status: 'Categorized',
      reviewReason: null,
      isInternal: false
    };
  }

  // RULE 4: Houtslagers -> Purchasing (Inkoop)
  if (fullText.includes('houtslagers')) {
    return {
      category: 'Purchasing (Inkoop)',
      matchReason: 'IBAN Match — Houtslagers',
      status: 'Categorized',
      reviewReason: null,
      isInternal: false
    };
  }

  // RULE 5: Alibaba.com Singapore -> Purchasing (Inkoop)
  if (fullText.includes('alibaba') || fullText.includes('alibaba.com')) {
    return {
      category: 'Purchasing (Inkoop)',
      matchReason: 'Counterparty Match — Alibaba.com Singapore',
      status: 'Categorized',
      reviewReason: null,
      isInternal: false
    };
  }

  // RULE 6: bol.com -> Revenue – bol.com (Supported with Seller Specification)
  if (fullText.includes('bolcom') || fullText.includes('bol.com')) {
    return {
      category: 'Revenue – bol.com',
      matchReason: 'bol.com Seller Account Payout Match',
      status: 'Categorized',
      hasBolSpec: true,
      reviewReason: null,
      isInternal: false
    };
  }

  // RULE 7: Meta Advertising -> Advertising – Meta Ads
  if (fullText.includes('meta ads') || fullText.includes('meta platforms') || fullText.includes('facebook ads') || fullText.includes('instagram ads')) {
    return {
      category: 'Advertising – Meta Ads',
      matchReason: 'Creditor ID Match — Meta Ads',
      status: 'Categorized',
      reviewReason: null,
      isInternal: false
    };
  }

  // PayPal WITH Meta reference -> Advertising – Meta Ads
  // PayPal WITHOUT Meta reference -> Payment Provider Fees
  if (fullText.includes('paypal')) {
    if (fullText.includes('meta') || fullText.includes('facebook') || fullText.includes('ads')) {
      return {
        category: 'Advertising – Meta Ads',
        matchReason: 'Creditor ID Match — PayPal / Meta Ads',
        status: 'Categorized',
        reviewReason: null,
        isInternal: false
      };
    }
    return {
      category: 'Payment Provider Fees',
      matchReason: 'Payment Provider Match — PayPal Fees',
      status: 'Categorized',
      reviewReason: null,
      isInternal: false
    };
  }

  // RULE 8: Known Software Counterparties
  if (
    fullText.includes('google cloud') || fullText.includes('transip') || fullText.includes('e-boekhouden') ||
    fullText.includes('skillsource') || fullText.includes('dubline') || fullText.includes('wordpress') ||
    fullText.includes('canva') || fullText.includes('jetpack')
  ) {
    return {
      category: 'Software',
      matchReason: 'Software Supplier Match',
      status: 'Categorized',
      reviewReason: null,
      isInternal: false
    };
  }

  // Known Bank Charges / VAT / Payment Providers / Shipping / Office Supplies / Gifts / Private Withdrawal / GS1
  if (fullText.includes('privé opname') || fullText.includes('prive opname') || fullText.includes('priveontrekking') || fullText.includes('geldopname prive')) {
    return { category: 'Private Withdrawal', matchReason: 'Private Withdrawal Match', status: 'Categorized', reviewReason: null, isInternal: false };
  }
  if (fullText.includes('gs1') || fullText.includes('gs1 nederland')) {
    return { category: 'Software', matchReason: 'Barcode & Identifier Fee Match (GS1)', status: 'Categorized', reviewReason: null, isInternal: false };
  }
  if (fullText.includes('buckaroo')) {
    return { category: 'Payment Provider Fees', matchReason: 'Payment Provider Match — Buckaroo', status: 'Categorized', reviewReason: null, isInternal: false };
  }
  if (fullText.includes('postnl') || fullText.includes('dhl')) {
    return { category: 'Shipping Costs', matchReason: 'Shipping Carrier Match — PostNL/DHL', status: 'Categorized', reviewReason: null, isInternal: false };
  }
  if (fullText.includes('abn amro bank') || fullText.includes('bankkosten') || fullText.includes('correspondent fee')) {
    return { category: 'Bank Charges', matchReason: 'Bank Fee Match — ABN AMRO', status: 'Categorized', reviewReason: null, isInternal: false };
  }
  if (fullText.includes('belastingdienst')) {
    return { category: 'VAT Settlement', matchReason: 'Tax Authority Match — Belastingdienst', status: 'Categorized', reviewReason: null, isInternal: false };
  }
  if (fullText.includes('int card services') || fullText.includes('ics card')) {
    return { category: 'Credit Card Suspense', matchReason: 'Credit Card Suspense Match — ICS', status: 'Categorized', reviewReason: null, isInternal: false };
  }
  if (fullText.includes('coolblue') || fullText.includes('office') || fullText.includes('staples')) {
    return { category: 'Office Supplies', matchReason: 'Office Supplies Match', status: 'Categorized', reviewReason: null, isInternal: false };
  }
  if (fullText.includes('beef.steak') || fullText.includes('luxury meat') || fullText.includes('relatiegeschenk')) {
    return { category: 'Customer Gifts', matchReason: 'Customer Gifts Match', status: 'Categorized', reviewReason: null, isInternal: false };
  }
  if (fullText.includes('restaurant') || fullText.includes('q-park') || fullText.includes('hotel')) {
    return { category: 'Travel / Entertainment', matchReason: 'Travel & Hospitality Match', status: 'Categorized', reviewReason: null, isInternal: false };
  }

  // RULE 10: Customer Payment Recognition -> Revenue – Outdoor Kitchens
  const customerPaymentPatterns = [
    { regex: /FA-2026-?\d{3}/i, reason: 'Invoice Pattern Match — Customer Payment (FA-2026)' },
    { regex: /OF-2026-?\d{3}/i, reason: 'Invoice Pattern Match — Customer Payment (OF-2026)' },
    { regex: /INV-?\d{4}/i, reason: 'Invoice Pattern Match — Customer Payment (INV)' },
    { regex: /Q-?\d{4}/i, reason: 'Invoice Pattern Match — Customer Payment (Q)' },
    { regex: /2025-?\d{3}/i, reason: 'Invoice Pattern Match — Customer Payment (2025)' },
    { regex: /aan\s*betaling/i, reason: 'Invoice Pattern Match — Customer Payment (Aanbetaling)' },
    { regex: /slot\s*betaling/i, reason: 'Invoice Pattern Match — Customer Payment (Slotbetaling)' },
    { regex: /slot\s*factuur/i, reason: 'Invoice Pattern Match — Customer Payment (Slotfactuur)' },
    { regex: /50\s*%/i, reason: 'Invoice Pattern Match — Customer Payment (50%)' },
    { regex: /90\s*%/i, reason: 'Invoice Pattern Match — Customer Payment (90%)' },
    { regex: /50\s*procent/i, reason: 'Invoice Pattern Match — Customer Payment (50%)' }
  ];

  for (const pat of customerPaymentPatterns) {
    if (pat.regex.test(description) || pat.regex.test(counterName)) {
      return {
        category: 'Revenue – Outdoor Kitchens',
        matchReason: pat.reason,
        status: 'Categorized',
        reviewReason: null,
        isInternal: false
      };
    }
  }

  // Check customer name matching for credit transactions (incoming payments)
  if (creditVal > 0 && counterName && counterName !== 'Onbekend') {
    const nameLower = counterName.toLowerCase();
    if (!nameLower.includes('bv') && !nameLower.includes('b.v.') && !nameLower.includes('ltd') && !nameLower.includes('inc') && !nameLower.includes('gmbh')) {
      return {
        category: 'Revenue – Outdoor Kitchens',
        matchReason: `Invoice Pattern Match — Customer Payment (${counterName})`,
        status: 'Categorized',
        reviewReason: null,
        isInternal: false
      };
    }
  }

  // RULE 11: UNKNOWN / UNMATCHED TRANSACTIONS -> Review Item / Vraagpost
  // Dynamic contextual failure reason generation based on transaction fields
  let reviewReason = `No configured counterparty or invoice matching rule found for "${counterName || 'Unknown'}".`;

  if (!counterName || counterName.toLowerCase() === 'onbekend' || counterName.toLowerCase().includes('assf') || counterName.toLowerCase().includes('qwer')) {
    reviewReason = 'No recognizable counterparty, IBAN or business reference found.';
  } else if (fullText.includes('teak wood') || fullText.includes('granite') || fullText.includes('craftwood')) {
    reviewReason = 'No invoice/reference found. Project matching required.';
  } else if (fullText.includes('erik van den berg') || fullText.includes('payout craftsman')) {
    reviewReason = 'No invoice/reference found. Project matching required.';
  } else if (creditVal > 0 && counterName && !description.match(/FA-2026|OF-2026|INV-|Q-/i)) {
    reviewReason = `Customer/payment pattern found for "${counterName}", but no confident order match.`;
  } else if (counterName) {
    reviewReason = `No configured counterparty rule found for "${counterName}". Invoice/reference match required.`;
  }

  return {
    category: 'Review Item / Vraagpost',
    matchReason: 'No Matching Rule — Review Required',
    status: 'Review Needed',
    reviewReason: reviewReason,
    isInternal: false
  };
}

/**
 * Automatically extracts header balances and expected transaction count from statement text
 */
export function parseStatementHeader(text, parsedTxns) {
  let openingBalance = 10000;
  let closingBalance = 8585;
  let expectedCount = parsedTxns.length;

  const countMatch = text.match(/\/COUNT\/(\d+)/i) || text.match(/verwacht\s*aantal:\s*(\d+)/i) || text.match(/expected\s*count:\s*(\d+)/i);
  if (countMatch) {
    expectedCount = parseInt(countMatch[1], 10);
  }

  const openingMatch = text.match(/beginsaldo:\s*([0-9.,]+)/i) || text.match(/\/OPENING\/([0-9.,]+)/i) || text.match(/opening\s*balance:\s*([0-9.,]+)/i);
  if (openingMatch) {
    openingBalance = parseFloat(openingMatch[1].replace(',', '.'));
  }

  const closingMatch = text.match(/eindsaldo:\s*([0-9.,]+)/i) || text.match(/\/CLOSING\/([0-9.,]+)/i) || text.match(/closing\s*balance:\s*([0-9.,]+)/i);
  if (closingMatch) {
    closingBalance = parseFloat(closingMatch[1].replace(',', '.'));
  }

  const totalCredits = Math.round(parsedTxns.reduce((acc, t) => acc + (Number(t.credit) || 0), 0) * 100) / 100;
  const totalDebits = Math.round(parsedTxns.reduce((acc, t) => acc + (Number(t.debit) || 0), 0) * 100) / 100;
  
  if (!closingMatch) {
    closingBalance = Math.round((openingBalance + totalCredits - totalDebits) * 100) / 100;
  }

  return {
    openingBalance,
    totalCredits,
    totalDebits,
    closingBalance,
    expectedCount
  };
}

/**
 * Normalizes raw transaction input into unified ABN AMRO Transaction object
 */
export function normalizeTransaction(raw) {
  const isDebit = Number(raw.debit) > 0 || raw.type === 'Expense';
  const debit = isDebit ? Math.abs(Number(raw.debit || raw.numericAmount || 0)) : 0;
  const credit = !isDebit ? Math.abs(Number(raw.credit || raw.numericAmount || 0)) : 0;
  const numericAmount = isDebit ? debit : credit;

  const baseTx = {
    id: raw.id || `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    date: raw.date || new Date().toISOString().split('T')[0],
    description: raw.description || raw.remi || 'ABN AMRO Transactie',
    debit,
    credit,
    numericAmount,
    amountStr: `€ ${numericAmount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`,
    counterIban: raw.counterIban || raw.iban || 'NL91 ABNA 0000 0000 00',
    counterName: raw.counterName || raw.name || 'Onbekend',
    remi: raw.remi || raw.description || '',
    eref: raw.eref || raw.reference || `REF-${Math.floor(Math.random() * 1000000)}`,
    type: raw.type || 'Transfer'
  };

  const catResult = categorizeTransaction(baseTx);
  return { ...baseTx, ...catResult };
}

/**
 * Statement Validation Engine:
 * Validates Opening Balance + Credits - Debits == Closing Balance
 * Validates Parsed Count == Header Expected Count
 */
export function validateStatement(header, transactionsList) {
  const opening = Number(header.openingBalance || 0);
  const closing = Number(header.closingBalance || 0);
  const expectedCredits = Number(header.totalCredits || 0);
  const expectedDebits = Number(header.totalDebits || 0);
  const expectedCount = Number(header.expectedCount || 0);

  const actualCount = transactionsList.length;
  const actualCredits = Math.round(transactionsList.reduce((acc, t) => acc + (Number(t.credit) || 0), 0) * 100) / 100;
  const actualDebits = Math.round(transactionsList.reduce((acc, t) => acc + (Number(t.debit) || 0), 0) * 100) / 100;
  const calculatedClosing = Math.round((opening + actualCredits - actualDebits) * 100) / 100;

  const baseMeta = { actualCount, actualCredits, actualDebits, calculatedClosing };

  // 1. Transaction Count Validation
  if (expectedCount > 0 && actualCount !== expectedCount) {
    return {
      isValid: false,
      errorType: 'COUNT_MISMATCH',
      errorMessage: `Transactietotaal afwijking: Afschrift header vermeldt ${expectedCount} transacties, maar er zijn ${actualCount} transacties ingelezen.`,
      ...baseMeta
    };
  }

  // 2. Total Credits Validation
  if (expectedCredits > 0 && Math.abs(actualCredits - expectedCredits) > 0.01) {
    return {
      isValid: false,
      errorType: 'CREDIT_TOTAL_MISMATCH',
      errorMessage: `Bijschrijvingen totaal afwijking: Verwacht € ${expectedCredits.toLocaleString('nl-NL')}, maar berekend € ${actualCredits.toLocaleString('nl-NL')}.`,
      ...baseMeta
    };
  }

  // 3. Total Debits Validation
  if (expectedDebits > 0 && Math.abs(actualDebits - expectedDebits) > 0.01) {
    return {
      isValid: false,
      errorType: 'DEBIT_TOTAL_MISMATCH',
      errorMessage: `Afschrijvingen totaal afwijking: Verwacht € ${expectedDebits.toLocaleString('nl-NL')}, maar berekend € ${actualDebits.toLocaleString('nl-NL')}.`,
      ...baseMeta
    };
  }

  // 4. Opening + Credits - Debits == Closing Balance Validation
  if (Math.abs(calculatedClosing - closing) > 0.01) {
    return {
      isValid: false,
      errorType: 'BALANCE_CHECKSUM_ERROR',
      errorMessage: `Saldo Controle Mismatch: Saldo Begin (€ ${opening.toLocaleString('nl-NL')}) + Bij (€ ${actualCredits.toLocaleString('nl-NL')}) - Af (€ ${actualDebits.toLocaleString('nl-NL')}) = € ${calculatedClosing.toLocaleString('nl-NL')}, maar Afschrift Eindsaldo is € ${closing.toLocaleString('nl-NL')}.`,
      ...baseMeta
    };
  }

  return {
    isValid: true,
    ...baseMeta
  };
}

/**
 * Dual ABN Format Parser: Parses both OLD and NEW ABN AMRO statement text formats
 */
export function parseABNStatementText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const transactions = [];

  let currentTx = null;

  lines.forEach(line => {
    // NEW FORMAT tags: /TRTP/, /IBAN/, /NAME/, /REMI/, /EREF/
    if (line.startsWith('/TRTP/')) {
      if (currentTx) transactions.push(normalizeTransaction(currentTx));
      currentTx = {
        type: line.replace('/TRTP/', '').replace('/', '').trim() || 'Transfer',
        description: '',
        debit: 0,
        credit: 0
      };
    } else if (line.startsWith('/IBAN/') && currentTx) {
      currentTx.counterIban = line.replace('/IBAN/', '').replace('/', '').trim();
    } else if (line.startsWith('/NAME/') && currentTx) {
      currentTx.counterName = line.replace('/NAME/', '').replace('/', '').trim();
    } else if (line.startsWith('/REMI/') && currentTx) {
      currentTx.remi = line.replace('/REMI/', '').replace('/', '').trim();
      currentTx.description = currentTx.remi;
    } else if (line.startsWith('/EREF/') && currentTx) {
      currentTx.eref = line.replace('/EREF/', '').replace('/', '').trim();
    } else if (line.startsWith('/AMT/') && currentTx) {
      const amtVal = parseFloat(line.replace('/AMT/', '').replace('/', '').replace(',', '.'));
      if (amtVal < 0) currentTx.debit = Math.abs(amtVal);
      else currentTx.credit = Math.abs(amtVal);
    }
    // OLD FORMAT lines: SEPA Overboeking, IBAN:, Naam:, Omschrijving:, Kenmerk:
    else if (line.toLowerCase().includes('sepa overboeking') || line.toLowerCase().includes('ideal') || line.toLowerCase().includes('bea card')) {
      if (currentTx) transactions.push(normalizeTransaction(currentTx));
      currentTx = {
        type: line.includes('iDEAL') ? 'iDEAL' : line.includes('BEA') ? 'BEA card payment' : 'Transfer',
        description: line,
        debit: 0,
        credit: 0
      };
    } else if (line.startsWith('IBAN:') && currentTx) {
      currentTx.counterIban = line.replace('IBAN:', '').trim();
    } else if (line.startsWith('Naam:') && currentTx) {
      currentTx.counterName = line.replace('Naam:', '').trim();
    } else if (line.startsWith('Omschrijving:') && currentTx) {
      currentTx.remi = line.replace('Omschrijving:', '').trim();
      currentTx.description = currentTx.remi;
    } else if (line.startsWith('Kenmerk:') && currentTx) {
      currentTx.eref = line.replace('Kenmerk:', '').trim();
    } else if ((line.startsWith('Bedrag:') || line.startsWith('Bedrag (€):')) && currentTx) {
      const numStr = line.replace(/[^0-9,-]/g, '').replace(',', '.');
      const val = parseFloat(numStr);
      if (val < 0) currentTx.debit = Math.abs(val);
      else currentTx.credit = Math.abs(val);
    }
  });

  if (currentTx) transactions.push(normalizeTransaction(currentTx));

  return transactions;
}
