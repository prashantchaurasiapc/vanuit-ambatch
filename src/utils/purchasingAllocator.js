/**
 * Bookkeeping & Allocation Processing — Vanuit Ambacht
 * STEP 3: Purchasing Invoice & Project Allocation Engine (Developer Briefing v1.2)
 */

// Unified Purchasing Category Name
export const UNIFIED_PURCHASING_CATEGORY = 'Purchasing';

// Recognized Supplier Definitions
export const SUPPLIERS = [
  { name: 'Ruben Verbeij Meubels Op Maat', keywords: ['Ruben Verbeij', 'Meubels Op Maat'], invoicePattern: /2026-\d{2}/i },
  { name: 'Houtslagers', keywords: ['Houtslagers'], invoicePattern: /2026\d{3}/i, isBelgian: true },
  { name: 'Alibaba.com Singapore', keywords: ['Alibaba', 'Alibaba.com'], invoicePattern: /ALI-\d+/i },
  { name: 'Md. Joni Hossain', keywords: ['Md. Joni Hossain', 'Joni Hossain'], invoicePattern: /INV-\d+/i, isForeign: true }
];

/**
 * Extracts purchase invoice reference from description/REMI
 */
export function extractPurchaseInvoiceRef(text) {
  if (!text) return null;
  const str = text.replace(/\s+/g, '');

  // Ruben Verbeij pattern: 2026-07, 2026-08
  const matchRuben = str.match(/2026-\d{2}/i);
  if (matchRuben) return matchRuben[0].toUpperCase();

  // Houtslagers pattern: 2026091, 2026095
  const matchHoutslagers = str.match(/202609\d/i);
  if (matchHoutslagers) return matchHoutslagers[0].toUpperCase();

  // Alibaba pattern: ALI-9821
  const matchAli = str.match(/ALI-?\d{4}/i);
  if (matchAli) return matchAli[0].toUpperCase();

  return null;
}

/**
 * Purchasing-to-Project Matching Engine:
 * Attempts to automatically link a supplier purchase transaction to a Customer Project/Order
 */
export function matchPurchaseToProject(tx, projectsList = [], openPurchaseInvoices = []) {
  const counterName = (tx.counterName || tx.name || '').trim();
  const description = (tx.description || tx.remi || '').trim();
  const debitAmount = Number(tx.debit || tx.numericAmount || 0);

  // 1. SAFETY CHECK: Smart Fulfilment is NOT Purchasing (it is Transport)
  if (counterName.toLowerCase().includes('smart fulfilment')) {
    return {
      isPurchasing: false,
      category: 'Transport',
      reason: 'Smart Fulfilment is Transport, NEVER Purchasing'
    };
  }

  // 2. SAFETY CHECK: Foreign transfer fee is Bank charges (NOT Purchasing)
  if (counterName.toLowerCase().includes('abn amro') && description.toLowerCase().includes('correspondent fee')) {
    return {
      isPurchasing: false,
      category: 'Bank charges',
      reason: 'Foreign transfer fee is Bank charges, NOT Purchasing'
    };
  }

  // Find supplier definition
  const supplierDef = SUPPLIERS.find(s => s.keywords.some(kw => counterName.toLowerCase().includes(kw.toLowerCase()) || description.toLowerCase().includes(kw.toLowerCase())));

  // Extract purchase invoice reference if available
  const purchaseInvoiceRef = extractPurchaseInvoiceRef(description) || extractPurchaseInvoiceRef(tx.eref);

  // 3. PRIMARY MATCH: Explicit Customer Project reference in transaction (e.g. PRJ-101, FA-2026-108)
  const projectRefMatch = description.match(/(PRJ-\d{3}|FA-2026-?\d{3}|OF-2026-?\d{3})/i);
  if (projectRefMatch) {
    const cleanProjRef = projectRefMatch[0].toUpperCase().replace(/\s+/g, '');
    const targetProject = projectsList.find(p => (p.id || p.invoiceNumber || '').toUpperCase().replace(/\s+/g, '').includes(cleanProjRef));

    if (targetProject) {
      return {
        isPurchasing: true,
        category: UNIFIED_PURCHASING_CATEGORY,
        isMatched: true,
        matchingMethod: 'Automatic (Project Ref)',
        supplier: supplierDef ? supplierDef.name : counterName,
        purchaseInvoiceRef: purchaseInvoiceRef || 'N/A',
        projectId: targetProject.id,
        customerName: targetProject.customer,
        debitAmount,
        allocationStatus: 'Automatically Allocated'
      };
    }
  }

  // 4. SECONDARY MATCH: Match purchase invoice reference against open purchase invoices
  if (purchaseInvoiceRef && openPurchaseInvoices.length > 0) {
    const matchingInvoices = openPurchaseInvoices.filter(inv => inv.invoiceRef === purchaseInvoiceRef && inv.supplier === (supplierDef?.name || counterName));
    if (matchingInvoices.length === 1 && matchingInvoices[0].projectId) {
      const openInv = matchingInvoices[0];
      return {
        isPurchasing: true,
        category: UNIFIED_PURCHASING_CATEGORY,
        isMatched: true,
        matchingMethod: 'Automatic (Purchase Invoice Ref)',
        supplier: supplierDef ? supplierDef.name : counterName,
        purchaseInvoiceRef,
        projectId: openInv.projectId,
        customerName: openInv.customerName,
        debitAmount,
        allocationStatus: 'Automatically Allocated'
      };
    }
  }

  // 5. FALLBACK MATCH: Match supplier + exact amount against open purchase invoices
  if (supplierDef && debitAmount > 0 && openPurchaseInvoices.length > 0) {
    const matchingByAmount = openPurchaseInvoices.filter(inv => 
      inv.supplier === supplierDef.name && Math.abs(Number(inv.amount) - debitAmount) < 0.5
    );

    if (matchingByAmount.length === 1 && matchingByAmount[0].projectId) {
      const openInv = matchingByAmount[0];
      return {
        isPurchasing: true,
        category: UNIFIED_PURCHASING_CATEGORY,
        isMatched: true,
        matchingMethod: 'Automatic (Supplier + Amount Fallback)',
        supplier: supplierDef.name,
        purchaseInvoiceRef: openInv.invoiceRef || purchaseInvoiceRef || 'N/A',
        projectId: openInv.projectId,
        customerName: openInv.customerName,
        debitAmount,
        allocationStatus: 'Automatically Allocated'
      };
    }

    if (matchingByAmount.length > 1) {
      return {
        isPurchasing: true,
        category: UNIFIED_PURCHASING_CATEGORY,
        isMatched: false,
        supplier: supplierDef.name,
        debitAmount,
        allocationStatus: 'Review Required',
        reason: `Meerdere openstaande inkoopfacturen met hetzelfde bedrag (€ ${debitAmount}) voor ${supplierDef.name}.`
      };
    }
  }

  // 6. UNCERTAIN OR UNALLOCATED PURCHASING -> Review Item / Vraagpost
  return {
    isPurchasing: true,
    category: UNIFIED_PURCHASING_CATEGORY,
    isMatched: false,
    supplier: supplierDef ? supplierDef.name : counterName,
    purchaseInvoiceRef: purchaseInvoiceRef || 'N/A',
    debitAmount,
    allocationStatus: 'Unallocated',
    reason: `Onbekend project voor inkoop ${supplierDef ? supplierDef.name : counterName} (€ ${debitAmount}).`
  };
}

/**
 * Calculates Total Linked Purchasing for a Customer Project
 * Guarantees duplicate purchase invoices & split customer job invoices are NOT double-counted.
 */
export function calculateProjectPurchasingTotal(linkedPurchasingList = []) {
  const seenErefs = new Set();
  const seenInvoiceRefs = new Set();

  let totalPurchasing = 0;
  const uniquePurchases = [];

  linkedPurchasingList.forEach(p => {
    // Unique EREF check
    const eref = p.eref || p.id;
    // Invoice Ref check to prevent double-linking exact same purchase invoice
    const invKey = `${p.supplier || p.counterName}_${p.purchaseInvoiceRef || p.eref || p.id}`;

    if (!seenErefs.has(eref) && (!p.purchaseInvoiceRef || p.purchaseInvoiceRef === 'N/A' || !seenInvoiceRefs.has(invKey))) {
      seenErefs.add(eref);
      if (p.purchaseInvoiceRef && p.purchaseInvoiceRef !== 'N/A') seenInvoiceRefs.add(invKey);

      const val = Number(p.debit || p.allocatedAmount || p.numericAmount || p.amount || 0);
      totalPurchasing += val;
      uniquePurchases.push(p);
    }
  });

  return {
    totalPurchasing: Math.round(totalPurchasing * 100) / 100,
    uniquePurchasesCount: uniquePurchases.length,
    uniquePurchases
  };
}

/**
 * Calculates Project Margin (Excluding VAT)
 * Revenue Excl. VAT (21%) - Total Linked Purchasing = Project Margin
 */
export function calculateProjectMarginWithPurchasing(orderTotalInclVat, linkedPurchasingList = []) {
  const revenueExclVat = Math.round((orderTotalInclVat / 1.21) * 100) / 100;
  const { totalPurchasing, uniquePurchases } = calculateProjectPurchasingTotal(linkedPurchasingList);
  
  const projectMargin = Math.round((revenueExclVat - totalPurchasing) * 100) / 100;
  const marginPercentage = revenueExclVat > 0 ? Math.round((projectMargin / revenueExclVat) * 100) : 0;

  return {
    orderTotalInclVat,
    revenueExclVat,
    totalPurchasing,
    projectMargin,
    marginPercentage,
    linkedPurchases: uniquePurchases
  };
}
