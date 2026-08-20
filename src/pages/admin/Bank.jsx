import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { 
  Plus, Search, Filter, X, CheckCircle, RotateCcw, ArrowDownRight, ArrowUpRight, 
  Landmark, Percent, UploadCloud, FileSpreadsheet, FileText, Sparkles, Check, 
  FolderOpen, ChevronDown, AlertTriangle, ShieldCheck, Tag, Eye, RefreshCw
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { mockBankTransactions as defaultTransactions } from '../../utils/mockData';
import { parseABNStatementText, validateStatement, normalizeTransaction, categorizeTransaction, BOOKKEEPING_CATEGORIES, parseStatementHeader } from '../../utils/abnParser';
import { matchPaymentToOrder, calculateOrderSettlement, calculateProjectMargin } from '../../utils/orderMatcher';
import { matchPurchaseToProject, calculateProjectMarginWithPurchasing, UNIFIED_PURCHASING_CATEGORY } from '../../utils/purchasingAllocator';
import { generateJournalEntries } from '../../utils/journalEngine';
import { mockInvoices, mockProjects } from '../../utils/mockData';

export default function Bank() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' | 'import' | 'review'
  
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [reviewStatusFilter, setReviewStatusFilter] = useState('All');

  const [modalOpen, setModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Dropdown & Allocation UI states
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [reclassifyModalTx, setReclassifyModalTx] = useState(null);
  const [newSelectedCategory, setNewSelectedCategory] = useState('');
  const [bolSpecModalTx, setBolSpecModalTx] = useState(null);
  const [manualAllocateTx, setManualAllocateTx] = useState(null);
  const [selectedTargetOrderId, setSelectedTargetOrderId] = useState('');
  const [journalModalTx, setJournalModalTx] = useState(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // =========================================================
  // STATEMENT IMPORT ENGINE STATE (ABN AMRO DUAL FORMAT)
  // =========================================================
  const [fileFormat, setFileFormat] = useState('PDF');
  const [importFile, setImportFile] = useState(null);
  const [rawTextContent, setRawTextContent] = useState('');
  const [parsedStatementTxns, setParsedStatementTxns] = useState([]);
  const [validationResult, setValidationResult] = useState(null);

  // Statement Header Controls (Default Sample)
  const [headerInfo, setHeaderInfo] = useState({
    openingBalance: 10000,
    totalCredits: 3495,
    totalDebits: 4910,
    closingBalance: 8585,
    expectedCount: 6
  });

  const importFileInputRef = useRef(null);

  // Pre-configured Sample ABN AMRO Statement Texts for Instant Testing
  const SAMPLE_OLD_FORMAT_TEXT = `SEPA Overboeking
IBAN: NL91 ABNA 0412 3456 78
Naam: Bjorn Valk
Omschrijving: 50% Aanbetaling Keuken Bjorn Valk (FA-2026-108)
Bedrag (€): +3495,00
Kenmerk: EREF-2026-9001

SEPA Overboeking
IBAN: NL44 ABNA 0987 6543 21
Naam: VANUIT AMBACHT
Omschrijving: Interne Overboeking Zakelijk Flexibel Sparen
Bedrag (€): -2000,00
Kenmerk: EREF-2026-9002

SEPA Overboeking
IBAN: NL12 ABNA 0555 4443 22
Naam: Ruben Verbeij Meubels Op Maat
Omschrijving: Houtbewerking eiken frame PRJ-101
Bedrag (€): -1250,00
Kenmerk: EREF-2026-9003

SEPA Overboeking
IBAN: NL88 INGB 0001 2345 67
Naam: Smart Fulfilment B.V.
Omschrijving: Transport & Koerier Levering Dongen
Bedrag (€): -450,00
Kenmerk: EREF-2026-9004

iDEAL
IBAN: NL03 RABO 0111 2223 33
Naam: Alibaba.com Singapore
Omschrijving: Order ALI-9821 RVS Beslag
Bedrag (€): -890,00
Kenmerk: EREF-2026-9005

BEA card payment
IBAN: GB99 BARK 1234 5678 90
Naam: Global Trading Direct Ltd
Omschrijving: Consulting Services Invoice 901
Bedrag (€): -320,00
Kenmerk: EREF-2026-9006`;

  const SAMPLE_NEW_FORMAT_TEXT = `/TRTP/SEPA OVERBOEKING/
/IBAN/NL91ABNA0412345678/
/NAME/Bjorn Valk/
/REMI/50% Aanbetaling Keuken Bjorn Valk (FA-2026-108)/
/AMT/3495,00/
/EREF/EREF-2026-9001/

/TRTP/SEPA OVERBOEKING/
/IBAN/NL44ABNA0987654321/
/NAME/VANUIT AMBACHT/
/REMI/Interne Overboeking Zakelijk Flexibel Sparen/
/AMT/-2000,00/
/EREF/EREF-2026-9002/

/TRTP/SEPA OVERBOEKING/
/IBAN/NL12ABNA0555444322/
/NAME/Ruben Verbeij Meubels Op Maat/
/REMI/Houtbewerking eiken frame PRJ-101/
/AMT/-1250,00/
/EREF/EREF-2026-9003/

/TRTP/SEPA OVERBOEKING/
/IBAN/NL88INGB0001234567/
/NAME/Smart Fulfilment B.V./
/REMI/Transport & Koerier Levering Dongen/
/AMT/-450,00/
/EREF/EREF-2026-9004/

/TRTP/iDEAL/
/IBAN/NL03RABO0111222333/
/NAME/Alibaba.com Singapore/
/REMI/Order ALI-9821 RVS Beslag/
/AMT/-890,00/
/EREF/EREF-2026-9005/

/TRTP/BEA card payment/
/IBAN/GB99BARK1234567890/
/NAME/Global Trading Direct Ltd/
/REMI/Consulting Services Invoice 901/
/AMT/-320,00/
/EREF/EREF-2026-9006/`;

  // Load Transactions from LocalStorage on mount & run strict data migration
  useEffect(() => {
    let sourceTxns = defaultTransactions;
    try {
      const savedTxns = localStorage.getItem('app_bank_txns_v2');
      if (savedTxns) {
        const parsed = JSON.parse(savedTxns);
        if (Array.isArray(parsed) && parsed.length > 0) {
          sourceTxns = parsed;
        }
      }
    } catch (e) {}

    // Strict Migration & Categorization Re-evaluation Engine
    const migrated = sourceTxns.map(tx => {
      const counterLower = (tx.counterName || '').toLowerCase();
      const descLower = (tx.description || tx.remi || '').toLowerCase();
      const fullText = `${counterLower} ${descLower}`;

      const isReviewedAlready = tx.status === 'Reviewed' || tx.status === 'Manually Reclassified';

      // 1. SPECIFIC UNMATCHED OVERRIDES WITH EXACT REASON CODES
      if (fullText.includes('global trading direct')) {
        return {
          ...tx,
          category: isReviewedAlready ? tx.category : 'Review Item / Vraagpost',
          status: isReviewedAlready ? tx.status : 'Review Needed',
          matchReason: isReviewedAlready ? tx.matchReason : 'No Matching Rule — Review Required',
          projectRef: tx.projectRef || '-',
          reviewReason: 'No configured counterparty or invoice matching rule found.'
        };
      }
      if (fullText.includes('assf') || fullText.includes('qwer')) {
        return {
          ...tx,
          category: isReviewedAlready ? tx.category : 'Review Item / Vraagpost',
          status: isReviewedAlready ? tx.status : 'Review Needed',
          matchReason: isReviewedAlready ? tx.matchReason : 'No Matching Rule — Review Required',
          projectRef: tx.projectRef || '-',
          reviewReason: 'No recognizable counterparty, IBAN or business reference found.'
        };
      }
      if (fullText.includes('craftwood') || fullText.includes('teak wood')) {
        return {
          ...tx,
          category: isReviewedAlready ? tx.category : 'Review Item / Vraagpost',
          status: isReviewedAlready ? tx.status : 'Review Needed',
          matchReason: isReviewedAlready ? tx.matchReason : 'No Matching Rule — Review Required',
          projectRef: tx.projectRef || '-',
          reviewReason: 'No invoice/reference found. Project matching required.'
        };
      }
      if (fullText.includes('erik van den berg')) {
        return {
          ...tx,
          category: isReviewedAlready ? tx.category : 'Review Item / Vraagpost',
          status: isReviewedAlready ? tx.status : 'Review Needed',
          matchReason: isReviewedAlready ? tx.matchReason : 'No Matching Rule — Review Required',
          projectRef: tx.projectRef || '-',
          reviewReason: 'No invoice/reference found. Project matching required.'
        };
      }
      if (fullText.includes('mark davis') && fullText.includes('canopy')) {
        return {
          ...tx,
          category: isReviewedAlready ? tx.category : 'Review Item / Vraagpost',
          status: isReviewedAlready ? tx.status : 'Review Needed',
          matchReason: isReviewedAlready ? tx.matchReason : 'No Matching Rule — Review Required',
          projectRef: tx.projectRef || '-',
          reviewReason: 'Customer/payment pattern found, but no confident order match.'
        };
      }

      // 2. Re-evaluate decision tree for exact rule & matchReason match
      const ruleResult = categorizeTransaction(tx);

      // 3. Extract project / order reference
      let projectRef = tx.projectRef || tx.orderId || tx.projectId || '-';
      if (projectRef === '-') {
        if (fullText.includes('prj-101') || fullText.includes('bjorn valk') || fullText.includes('john miller')) projectRef = 'PRJ-101';
        else if (fullText.includes('prj-102') || fullText.includes('sophia taylor')) projectRef = 'PRJ-102';
        else if (fullText.includes('prj-103')) projectRef = 'PRJ-103';
        else if (fullText.includes('fa-2026-108')) projectRef = 'FA-2026-108';
      }

      // 4. Derive correct status
      let finalStatus = tx.status;
      if (ruleResult.category === 'Review Item / Vraagpost') {
        finalStatus = isReviewedAlready ? tx.status : 'Review Needed';
      } else if (!isReviewedAlready) {
        finalStatus = projectRef !== '-' ? 'Matched' : ruleResult.status;
      }

      return {
        ...tx,
        category: isReviewedAlready ? tx.category : ruleResult.category,
        matchReason: isReviewedAlready ? tx.matchReason : (ruleResult.matchReason || tx.matchReason),
        status: finalStatus,
        projectRef: projectRef
      };
    });

    setTransactions(migrated);
    localStorage.setItem('app_bank_txns_v2', JSON.stringify(migrated));
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const [reviewNotes, setReviewNotes] = useState('');

  // Re-run statement parsing & validation whenever raw text changes
  const processStatementParsing = (text) => {
    if (!text || !text.trim()) {
      setParsedStatementTxns([]);
      setValidationResult(null);
      return;
    }

    const parsed = parseABNStatementText(text);
    setParsedStatementTxns(parsed);

    // Automatically extract statement header info & expected transaction count
    const extractedHeader = parseStatementHeader(text, parsed);
    setHeaderInfo(extractedHeader);

    const val = validateStatement(extractedHeader, parsed);
    setValidationResult(val);
  };

  const handleTextChange = (txt) => {
    setRawTextContent(txt);
    processStatementParsing(txt);
  };

  const handleHeaderChange = (field, val) => {
    const updatedHeader = { ...headerInfo, [field]: Number(val) || 0 };
    setHeaderInfo(updatedHeader);
    const valRes = validateStatement(updatedHeader, parsedStatementTxns);
    setValidationResult(valRes);
  };

  const handleLoadSampleStatement = (formatType) => {
    const textToLoad = formatType === 'OLD' ? SAMPLE_OLD_FORMAT_TEXT : SAMPLE_NEW_FORMAT_TEXT;
    setRawTextContent(textToLoad);
    processStatementParsing(textToLoad);
    showToast(language === 'EN' ? `Loaded valid ABN AMRO statement (${formatType} format)!` : `Gepaste ABN AMRO afschrift (${formatType} formaat) geladen!`);
  };

  // Commit Parsed Statement to Bank Transactions Ledger
  const handleCommitStatement = () => {
    if (!validationResult || !validationResult.isValid) {
      showToast(language === 'EN' ? 'Cannot commit statement: Validation failed!' : 'Kan niet verwerken: Saldo- of aantalcontrole is mislukt!');
      return;
    }

    if (parsedStatementTxns.length === 0) {
      showToast(language === 'EN' ? 'No transactions to commit.' : 'Geen transacties om te verwerken.');
      return;
    }

    // Robust Deduplication: EREF Primary + Reconciled Period Key Fallback (Date + Amount + IBAN + Desc)
    const generateTxKey = (t) => {
      if (t.eref && t.eref.trim()) return `EREF:${t.eref.trim()}`;
      const amt = Number(t.credit || t.debit || t.numericAmount || 0).toFixed(2);
      const iban = (t.counterIban || '').replace(/\s+/g, '');
      const desc = (t.description || t.remi || '').trim().toLowerCase().slice(0, 30);
      return `KEY:${t.date}_${amt}_${iban}_${desc}`;
    };

    const existingKeys = new Set(transactions.map(t => generateTxKey(t)));
    const newUniqueTxns = parsedStatementTxns.filter(t => !existingKeys.has(generateTxKey(t)));

    const updated = [...newUniqueTxns, ...transactions];
    setTransactions(updated);
    localStorage.setItem('app_bank_txns_v2', JSON.stringify(updated));
    window.dispatchEvent(new Event('app_data_changed'));

    showToast(language === 'EN'
      ? `Successfully committed ${newUniqueTxns.length} verified transactions to Bank Ledger!`
      : `${newUniqueTxns.length} gevalideerde transacties succesvol verwerkt in de Bankadministratie!`);

    setRawTextContent('');
    setParsedStatementTxns([]);
    setValidationResult(null);
    setActiveTab('transactions');
  };

  // Handle Manual Reclassification & Review of Review Items / Vraagposten
  const handleSaveReclassification = () => {
    if (!reclassifyModalTx || !newSelectedCategory) return;

    const targetProjectRef = selectedTargetOrderId || reclassifyModalTx.projectRef || '-';
    const isMatched = targetProjectRef && targetProjectRef !== '-';

    const updated = transactions.map(tx => {
      if (tx.id === reclassifyModalTx.id) {
        return {
          ...tx,
          category: newSelectedCategory,
          status: isMatched ? 'Matched' : 'Reviewed',
          matchReason: `Manual Review — ${newSelectedCategory}`,
          projectRef: targetProjectRef,
          orderId: isMatched ? targetProjectRef : tx.orderId,
          reviewNotes: reviewNotes || null,
          reviewReason: null
        };
      }
      return tx;
    });

    setTransactions(updated);
    localStorage.setItem('app_bank_txns_v2', JSON.stringify(updated));
    window.dispatchEvent(new Event('app_data_changed'));

    showToast(`Transaction "${reclassifyModalTx.counterName || reclassifyModalTx.id}" reviewed and updated to ${newSelectedCategory}!`);

    setReclassifyModalTx(null);
    setNewSelectedCategory('');
    setSelectedTargetOrderId('');
    setReviewNotes('');
  };

  // Handle Manual Order Allocation from Review Items (STEP 2)
  const handleSaveManualOrderAllocation = () => {
    if (!manualAllocateTx) return;

    let invoicesList = mockInvoices;
    try {
      const savedInvoices = localStorage.getItem('app_invoices');
      if (savedInvoices) {
        const parsed = JSON.parse(savedInvoices);
        if (Array.isArray(parsed) && parsed.length > 0) invoicesList = parsed;
      }
    } catch (e) {}

    let targetOrder = invoicesList.find(o => o.id === selectedTargetOrderId);
    if (!targetOrder && invoicesList.length > 0) {
      targetOrder = invoicesList[0];
    }
    if (!targetOrder) return;

    const creditVal = Number(manualAllocateTx.credit || 0);
    const debitVal = Number(manualAllocateTx.debit || 0);
    const isDebitPurchasing = debitVal > 0;

    const updatedTxns = transactions.map(tx => {
      if (tx.id === manualAllocateTx.id) {
        return {
          ...tx,
          category: isDebitPurchasing ? 'Purchasing (Inkoop)' : 'Revenue – Outdoor Kitchens',
          status: 'Matched',
          projectRef: targetOrder.id,
          orderId: targetOrder.id,
          projectId: targetOrder.id,
          invoiceRef: targetOrder.id,
          customerName: targetOrder.customer,
          allocatedAmount: isDebitPurchasing ? debitVal : creditVal,
          allocationStatus: 'Manually Allocated',
          matchReason: isDebitPurchasing ? `Manual Link — Project ${targetOrder.id}` : `Manual Link — Order ${targetOrder.id}`,
          matchingMethod: 'Manual',
          reviewReason: null
        };
      }
      return tx;
    });

    setTransactions(updatedTxns);
    localStorage.setItem('app_bank_txns_v2', JSON.stringify(updatedTxns));

    // Update order settlement & project margin status in localStorage
    const updatedInvoices = invoicesList.map(ord => {
      if (ord.id === targetOrder.id) {
        const settlement = calculateOrderSettlement(ord, updatedTxns);
        const linkedPurchasing = updatedTxns.filter(t => t.category === UNIFIED_PURCHASING_CATEGORY && (t.orderId === ord.id || t.projectId === ord.id));
        const marginInfo = calculateProjectMarginWithPurchasing(ord.numericAmount || getNumericAmount(ord.amount), linkedPurchasing);

        return {
          ...ord,
          totalReceived: settlement.totalReceived,
          outstanding: settlement.outstanding,
          status: settlement.paymentStatus === 'Paid / Settled' ? 'Betaald' : 'Openstaand',
          paymentStatus: settlement.paymentStatus,
          totalPurchasing: marginInfo.totalPurchasing,
          projectMargin: marginInfo.projectMargin
        };
      }
      return ord;
    });

    localStorage.setItem('app_invoices', JSON.stringify(updatedInvoices));
    window.dispatchEvent(new Event('app_data_changed'));

    showToast(isDebitPurchasing 
      ? `Inkoop van € ${debitVal.toLocaleString('nl-NL')} (${manualAllocateTx.counterName}) succesvol gekoppeld aan Project ${targetOrder.id} (${targetOrder.customer})!`
      : `Betaling van € ${creditVal.toLocaleString('nl-NL')} succesvol toegewezen aan Order ${targetOrder.id} (${targetOrder.customer})!`);

    setManualAllocateTx(null);
    setSelectedTargetOrderId('');
  };

  // Manual Transaction Form Submit
  const [form, setForm] = useState({
    description: '',
    category: 'Purchasing',
    type: 'Expense',
    amount: '',
    counterName: '',
    counterIban: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!form.description || !form.amount) return showToast('Vul alle verplichte velden in.');

    const numVal = parseFloat(form.amount) || 0;
    const isExpense = form.type === 'Expense';

    const rawTx = {
      id: `TXN-MAN-${Date.now().toString().slice(-4)}`,
      date: form.date,
      description: form.description,
      debit: isExpense ? numVal : 0,
      credit: !isExpense ? numVal : 0,
      counterName: form.counterName || 'Handmatige Invoer',
      counterIban: form.counterIban || 'NL91 ABNA 0000 0000 00',
      type: 'Transfer',
      category: form.category
    };

    const normalized = normalizeTransaction(rawTx);
    const updated = [normalized, ...transactions];

    setTransactions(updated);
    localStorage.setItem('app_bank_txns_v2', JSON.stringify(updated));
    window.dispatchEvent(new Event('app_data_changed'));
    showToast(language === 'EN' ? 'Transaction added successfully!' : 'Transactie succesvol opgeslagen!');
    setModalOpen(false);
  };

  // Calculated Stats
  const totalIncome = transactions.reduce((acc, t) => acc + (Number(t.credit) || 0), 0);
  const totalExpense = transactions.reduce((acc, t) => acc + (Number(t.debit) || 0), 0);
  const bankBalance = totalIncome - totalExpense;
  const reviewItemsCount = transactions.filter(t => t.category === 'Review Item / Vraagpost' || t.status === 'Review Needed').length;

  // Filtered Transactions for Tab 1
  const filteredTransactions = transactions.filter(t => {
    const desc = (t.description || '').toLowerCase();
    const name = (t.counterName || '').toLowerCase();
    const iban = (t.counterIban || '').toLowerCase();
    const eref = (t.eref || '').toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesSearch = desc.includes(q) || name.includes(q) || iban.includes(q) || eref.includes(q);
    const matchesType = typeFilter === 'All' 
      ? true 
      : typeFilter === 'Debit' ? (t.debit > 0)
      : typeFilter === 'Credit' ? (t.credit > 0)
      : t.isInternal;

    const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
    const matchesReview = reviewStatusFilter === 'All' || t.status === reviewStatusFilter;

    return matchesSearch && matchesType && matchesCategory && matchesReview;
  });

  // Filtered Review Items for Tab 3
  const reviewItemsList = transactions.filter(t => t.category === 'Review Item / Vraagpost' || t.status === 'Review Needed');

  // Status Badge Rendering Helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Categorized':
      case 'Recognized':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-bold border border-emerald-300"><Check className="w-3 h-3" /> Categorized</span>;
      case 'Matched':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 text-[10px] font-bold border border-blue-300"><Check className="w-3 h-3" /> Matched</span>;
      case 'Internal Transfer':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-900 text-[10px] font-bold border border-cyan-300"><RefreshCw className="w-3 h-3" /> Internal Transfer</span>;
      case 'Review Needed':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold shadow-xs"><AlertTriangle className="w-3 h-3" /> Review Needed</span>;
      case 'Manually Reclassified':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 text-[10px] font-bold border border-purple-300"><Tag className="w-3 h-3" /> Reclassified</span>;
      default:
        return <Badge variant="secondary">{status || 'Pending'}</Badge>;
    }
  };

  // Category Badge Rendering Helper (Full Text Visible, No Text Clipping)
  const renderCategoryBadge = (category) => {
    if (category === 'Revenue – Outdoor Kitchens') return <span className="px-2 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold rounded-md whitespace-nowrap">Revenue – Outdoor Kitchens 💰</span>;
    if (category === 'Revenue – bol.com') return <span className="px-2 py-1 bg-teal-100 text-teal-900 border border-teal-300 text-[10px] font-bold rounded-md whitespace-nowrap">Revenue – bol.com 📦</span>;
    if (category === 'Purchasing (Inkoop)') return <span className="px-2 py-1 bg-blue-100 text-blue-900 border border-blue-300 text-[10px] font-bold rounded-md whitespace-nowrap">Purchasing (Inkoop) 🔨</span>;
    if (category === 'Transport – Smart Fulfilment') return <span className="px-2 py-1 bg-purple-100 text-purple-900 border border-purple-300 text-[10px] font-bold rounded-md whitespace-nowrap">Transport – Smart Fulfilment 🚚</span>;
    if (category === 'Advertising – Meta Ads') return <span className="px-2 py-1 bg-pink-100 text-pink-900 border border-pink-300 text-[10px] font-bold rounded-md whitespace-nowrap">Advertising – Meta Ads 📣</span>;
    if (category === 'Software') return <span className="px-2 py-1 bg-indigo-100 text-indigo-900 border border-indigo-300 text-[10px] font-bold rounded-md whitespace-nowrap">Software 💻</span>;
    if (category === 'Payment Provider Fees') return <span className="px-2 py-1 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold rounded-md whitespace-nowrap">Payment Provider Fees 💳</span>;
    if (category === 'Shipping Costs') return <span className="px-2 py-1 bg-cyan-100 text-cyan-900 border border-cyan-300 text-[10px] font-bold rounded-md whitespace-nowrap">Shipping Costs 📮</span>;
    if (category === 'Bank Charges') return <span className="px-2 py-1 bg-[#EDE8DF] text-dark/80 border border-[#D6CFC2] text-[10px] font-bold rounded-md whitespace-nowrap">Bank Charges 🏦</span>;
    if (category === 'Office Supplies') return <span className="px-2 py-1 bg-slate-100 text-slate-900 border border-slate-300 text-[10px] font-bold rounded-md whitespace-nowrap">Office Supplies 📎</span>;
    if (category === 'Customer Gifts') return <span className="px-2 py-1 bg-rose-100 text-rose-900 border border-rose-300 text-[10px] font-bold rounded-md whitespace-nowrap">Customer Gifts 🎁</span>;
    if (category === 'Travel / Entertainment') return <span className="px-2 py-1 bg-orange-100 text-orange-900 border border-orange-300 text-[10px] font-bold rounded-md whitespace-nowrap">Travel / Entertainment 🍽️</span>;
    if (category === 'Internal Transfer / Kruispost') return <span className="px-2 py-1 bg-gray-200 text-gray-900 border border-gray-400 text-[10px] font-bold rounded-md whitespace-nowrap">Internal Transfer / Kruispost 🔄</span>;
    if (category === 'Credit Card Suspense') return <span className="px-2 py-1 bg-violet-100 text-violet-900 border border-violet-300 text-[10px] font-bold rounded-md whitespace-nowrap">Credit Card Suspense 💳</span>;
    if (category === 'VAT Settlement') return <span className="px-2 py-1 bg-sky-100 text-sky-900 border border-sky-300 text-[10px] font-bold rounded-md whitespace-nowrap">VAT Settlement 🏛️</span>;
    if (category === 'Private Withdrawal') return <span className="px-2 py-1 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold rounded-md whitespace-nowrap">Private Withdrawal 👤</span>;
    if (category === 'Review Item / Vraagpost') return <span className="px-2 py-1 bg-amber-500 text-white font-bold text-[10px] rounded-md whitespace-nowrap">Review Item / Vraagpost ⚠️</span>;
    return <span className="px-2 py-1 bg-[#EDE8DF] text-primary font-bold text-[10px] rounded-md whitespace-nowrap">{category}</span>;
  };

  // Bank Transactions Table Columns (Tab 1)
  const columns = [
    { 
      header: 'Date & Type', 
      style: { minWidth: '100px' },
      render: (row) => (
        <div className="space-y-0.5 whitespace-nowrap">
          <p className="font-mono text-xs font-bold text-dark">{row.date}</p>
          <span className="text-[9px] font-bold uppercase text-dark/60 bg-[#EDE8DF] px-1.5 py-0.5 rounded border border-[#D6CFC2]">
            {row.type}
          </span>
        </div>
      ) 
    },
    { 
      header: 'Counterparty / IBAN', 
      style: { minWidth: '150px', maxWidth: '200px' },
      render: (row) => (
        <div className="min-w-[140px]">
          <p className="font-bold text-dark text-xs truncate max-w-[180px]" title={row.counterName}>{row.counterName}</p>
          <p className="text-[10px] text-dark/50 font-mono truncate">{row.counterIban}</p>
        </div>
      ) 
    },
    { 
      header: 'Description / Reference', 
      style: { minWidth: '220px', maxWidth: '320px' },
      render: (row) => (
        <div className="space-y-0.5">
          <p className="font-medium text-dark text-xs leading-snug">{row.description}</p>
          <p className="text-[9.5px] text-dark/50 font-mono">EREF: {row.eref}</p>
          {row.bolSpecification && (
            <button
              onClick={() => setBolSpecModalTx(row)}
              className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-bold rounded-md hover:bg-blue-100 transition-colors"
            >
              <FileText className="w-3 h-3 text-blue-600" />
              <span>bol.com Payout Spec (Gross €{row.bolSpecification.grossSales} - Fee €{row.bolSpecification.commissionFees} = Net €{row.bolSpecification.netPayout})</span>
            </button>
          )}
        </div>
      ) 
    },
    { 
      header: 'Amount (€)', 
      style: { minWidth: '100px' },
      render: (row) => (
        <div className="font-mono font-bold text-xs whitespace-nowrap">
          {row.credit > 0 && <span className="text-emerald-700">+ € {Number(row.credit).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>}
          {row.debit > 0 && <span className="text-red-600">- € {Number(row.debit).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>}
        </div>
      ) 
    },
    { header: 'Category', style: { minWidth: '170px' }, render: (row) => renderCategoryBadge(row.category) },
    { 
      header: 'Recognition / Match Reason', 
      style: { minWidth: '210px' },
      render: (row) => (
        <span className={`text-[10px] font-bold px-2 py-1 rounded-md border inline-block max-w-full text-left leading-tight break-words sm:whitespace-nowrap ${
          row.status === 'Review Needed' || row.category === 'Review Item / Vraagpost'
            ? 'bg-amber-100 text-amber-900 border-amber-300 font-sans'
            : 'bg-[#EDE8DF] text-dark/80 border-[#D6CFC2]'
        }`}>
          ⚡ {row.matchReason || 'No Matching Rule — Review Required'}
        </span>
      )
    },
    { 
      header: 'Project / Order', 
      style: { minWidth: '110px' },
      render: (row) => (
        <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded-md border whitespace-nowrap ${
          row.projectRef && row.projectRef !== '-'
            ? 'text-primary bg-primary/10 border-primary/20'
            : 'text-dark/40 bg-gray-100 border-gray-200'
        }`}>
          {row.projectRef || row.orderId || row.projectId || '-'}
        </span>
      )
    },
    { header: 'Status', style: { minWidth: '110px' }, render: (row) => renderStatusBadge(row.status) },
    { 
      header: 'Actions', 
      style: { minWidth: '130px' },
      render: (row) => (
        <div className="flex items-center justify-end gap-1 whitespace-nowrap">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setReclassifyModalTx(row)}
            className="text-primary hover:bg-[#D6CFC2]/40 text-[10px] py-1 px-2 font-bold"
            title="Review / Reclassify Category"
          >
            <Tag className="w-3 h-3 mr-1 text-accent" /> Review
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => { setManualAllocateTx(row); setSelectedTargetOrderId(row.projectRef && row.projectRef !== '-' ? row.projectRef : ''); }}
            className="text-dark/70 hover:bg-[#D6CFC2]/40 text-[10px] py-1 px-1.5 font-bold"
            title="Link to Project / Order"
          >
            <FolderOpen className="w-3.5 h-3.5 mr-1 text-primary" /> Link
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 relative font-body text-[#4A4A43]">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 80 }} className="fixed top-20 right-4 z-[9999] flex items-center gap-2 bg-primary text-cream px-4 py-3 rounded-xl shadow-lg text-xs font-bold">
            <CheckCircle className="w-4 h-4 text-green-400" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Main Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#D6CFC2] pb-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-primary">Bank & Statements (ABN AMRO)</h2>
          <p className="text-dark/60 text-xs mt-0.5">Manage bank transactions, import ABN AMRO statements with balance validation and reclassify review items.</p>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-[#EDE8DF] p-1.5 rounded-xl border border-[#C4BEB3] w-full md:w-auto overflow-x-auto max-w-full no-scrollbar">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap flex-1 sm:flex-none justify-center ${
              activeTab === 'transactions' ? 'bg-primary text-cream shadow-sm' : 'text-dark/70 hover:text-primary'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Transactions</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap flex-1 sm:flex-none justify-center ${
              activeTab === 'import' ? 'bg-primary text-cream shadow-sm' : 'text-dark/70 hover:text-primary'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Import Statement</span>
          </button>

          <button
            onClick={() => setActiveTab('review')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap flex-1 sm:flex-none justify-center relative ${
              activeTab === 'review' ? 'bg-primary text-cream shadow-sm' : 'text-dark/70 hover:text-primary'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Review Items</span>
            {reviewItemsCount > 0 && (
              <span className="ml-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {reviewItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Financial Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card noPadding className="p-3 bg-[#F8F7F4]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-dark/50 uppercase tracking-wider">Total Bank Balance</span>
            <Landmark className="w-4 h-4 text-primary" />
          </div>
          <p className="text-lg font-heading font-bold text-primary mt-1 font-mono">
            € {bankBalance.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
          </p>
        </Card>

        <Card noPadding className="p-3 bg-[#F8F7F4]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-dark/50 uppercase tracking-wider">Total Credits</span>
            <ArrowDownRight className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-lg font-heading font-bold text-emerald-800 mt-1 font-mono">
            € {totalIncome.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
          </p>
        </Card>

        <Card noPadding className="p-3 bg-[#F8F7F4]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-dark/50 uppercase tracking-wider">Total Debits</span>
            <ArrowUpRight className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-lg font-heading font-bold text-red-700 mt-1 font-mono">
            € {totalExpense.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
          </p>
        </Card>

        <Card noPadding className="p-3 bg-[#F8F7F4]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-dark/50 uppercase tracking-wider">Review Items (Pending)</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg font-heading font-bold text-amber-800 mt-1 font-mono">
            {reviewItemsCount} Transactions
          </p>
        </Card>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: BANK TRANSACTIONS LIST WITH FILTERS                */}
      {/* ========================================================= */}
      {activeTab === 'transactions' && (
        <Card p="p-4" className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 bg-[#EDE8DF]/40 p-3 rounded-xl border border-[#D6CFC2]">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/40" />
              <input 
                type="text" 
                placeholder="Search by name, IBAN, description or reference (EREF)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-[#4A4A43]"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 text-xs w-full lg:w-auto">
              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="w-full sm:w-auto px-2.5 py-1.5 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg font-semibold text-dark text-xs focus:outline-none"
              >
                <option value="All">All Types (Credit/Debit)</option>
                <option value="Credit">Credit (+)</option>
                <option value="Debit">Debit (-)</option>
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full sm:w-auto px-2.5 py-1.5 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg font-semibold text-dark text-xs focus:outline-none max-w-full sm:max-w-[200px] truncate"
              >
                <option value="All">All Categories</option>
                {BOOKKEEPING_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={reviewStatusFilter}
                onChange={e => setReviewStatusFilter(e.target.value)}
                className="w-full sm:w-auto px-2.5 py-1.5 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg font-semibold text-dark text-xs focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Recognized">Recognized</option>
                <option value="Internal Transfer">Internal Transfer</option>
                <option value="Review Needed">Review Needed</option>
                <option value="Manually Reclassified">Manually Reclassified</option>
              </select>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button size="sm" icon={Plus} onClick={() => setModalOpen(true)} className="flex-1 sm:flex-none py-1.5 text-xs font-bold justify-center">
                  + Transaction
                </Button>
                <Button size="sm" icon={UploadCloud} onClick={() => setImportModalOpen(true)} className="flex-1 sm:flex-none py-1.5 text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white border-0 justify-center">
                  Import Statement
                </Button>
              </div>
            </div>
          </div>

          <Table columns={columns} data={filteredTransactions} />
        </Card>
      )}

      {/* ========================================================= */}
      {/* IMPORT BANK STATEMENTS MODAL                             */}
      {/* ========================================================= */}
      <AnimatePresence>
        {importModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9990] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setImportModalOpen(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              className="w-full max-w-lg bg-[#EDE8DF] rounded-2xl shadow-2xl border border-[#D6CFC2] font-body overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between p-5 border-b border-[#D6CFC2]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center flex-shrink-0">
                    <UploadCloud className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-bold text-lg text-primary">Import Bank Statements</h3>
                      <span className="px-2 py-0.5 bg-emerald-800 text-white text-[10px] font-bold rounded-md tracking-wider">BOOKKEEPING</span>
                    </div>
                    <p className="text-dark/60 text-xs mt-0.5">Parse Rabobank, ING & ABN AMRO bank exports directly into accounting ledger & VAT.</p>
                  </div>
                </div>
                <button
                  onClick={() => setImportModalOpen(false)}
                  className="w-7 h-7 rounded-lg bg-[#D6CFC2] hover:bg-[#C4BEB3] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-dark/70" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4">
                {/* File Format Selector */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-dark/50 tracking-wider mb-2">
                    FILE FORMAT SELECTOR
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <select
                        value={fileFormat}
                        onChange={e => setFileFormat(e.target.value)}
                        className="w-full appearance-none pl-8 pr-3 py-2.5 bg-white border border-[#D6CFC2] rounded-xl text-xs font-bold text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                      >
                        <option value="PDF">PDF (.pdf Bank Statement)</option>
                        <option value="TXT">TXT / CSV (ABN AMRO Export)</option>
                        <option value="MT940">MT940 (.sta)</option>
                        <option value="CAMT">CAMT.053 (.xml)</option>
                      </select>
                      <FileText className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dark/40" />
                    </div>
                    <button
                      onClick={() => importFileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-[#D6CFC2] rounded-xl text-xs font-bold text-dark hover:bg-[#F8F7F4] transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-dark/50" />
                      Browse Bank Export File...
                    </button>
                    <input
                      ref={importFileInputRef}
                      type="file"
                      accept=".pdf,.txt,.csv,.sta,.xml"
                      className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        setImportFile(f);
                        const reader = new FileReader();
                        reader.onload = (ev) => handleTextChange(ev.target.result);
                        reader.readAsText(f);
                      }}
                    />
                  </div>
                </div>

                {/* Drag & Drop Zone */}
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => {
                    e.preventDefault();
                    setDragOver(false);
                    const f = e.dataTransfer.files?.[0];
                    if (!f) return;
                    setImportFile(f);
                    const reader = new FileReader();
                    reader.onload = (ev) => handleTextChange(ev.target.result);
                    reader.readAsText(f);
                  }}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
                    dragOver
                      ? 'border-emerald-600 bg-emerald-50'
                      : importFile
                      ? 'border-emerald-400 bg-emerald-50/60'
                      : 'border-[#C4BEB3] bg-[#F8F7F4] hover:border-primary/40 hover:bg-white'
                  }`}
                  onClick={() => importFileInputRef.current?.click()}
                >
                  {importFile ? (
                    <>
                      <CheckCircle className="w-8 h-8 text-emerald-600" />
                      <div className="text-center">
                        <p className="text-sm font-bold text-emerald-800">{importFile.name}</p>
                        <p className="text-xs text-dark/50 mt-0.5">{(importFile.size / 1024).toFixed(1)} KB loaded</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                        <FileSpreadsheet className="w-6 h-6 text-emerald-700" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-dark">
                          Drag & drop your {fileFormat === 'PDF' ? 'Rabobank/ING PDF' : 'ABN AMRO'} statement here
                        </p>
                        <p className="text-xs text-dark/50 mt-0.5">
                          Format selected: {fileFormat} (Max 25MB)
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Paste raw text fallback */}
                {rawTextContent && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                    <div className="flex items-center gap-2 font-bold text-emerald-800">
                      <Check className="w-4 h-4" />
                      {parsedStatementTxns.length} transactions parsed and ready for validation
                    </div>
                  </div>
                )}

                {/* Validation Result */}
                {validationResult && (
                  <div className={`p-3 rounded-xl border text-xs font-body ${
                    validationResult.isValid
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-red-50 border-red-300 text-red-900'
                  }`}>
                    <div className="flex items-center gap-2 font-bold">
                      {validationResult.isValid
                        ? <><ShieldCheck className="w-4 h-4 text-emerald-600" /> Balance checksum passed!</>
                        : <><AlertTriangle className="w-4 h-4 text-red-600" /> Validation failed — import blocked!</>}
                    </div>
                    <p className="mt-1">{validationResult.errorMessage || 'All balances and counts match.'}</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between px-5 pb-5">
                <button
                  onClick={() => {
                    handleLoadSampleStatement('NEW');
                    setImportModalOpen(false);
                    setActiveTab('import');
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Or Load Sample Rabobank Export (Q3 2026)
                </button>
                <Button
                  variant="primary"
                  icon={Sparkles}
                  onClick={() => {
                    if (!rawTextContent.trim()) {
                      showToast('No file or text loaded. Please load a bank statement first.');
                      return;
                    }
                    setImportModalOpen(false);
                    setActiveTab('import');
                  }}
                  className="text-xs font-bold"
                >
                  Parse PDF Statement
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* ========================================================= */}
      {/* TAB 2: ABN AMRO STATEMENT IMPORT & SALDO CONTROLE         */}
      {/* ========================================================= */}
      {activeTab === 'import' && (
        <Card p="p-5" className="space-y-6">
          <div>
            <h3 className="text-lg font-heading font-bold text-primary flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-emerald-800" />
              Upload ABN AMRO Statement
            </h3>
            <p className="text-dark/60 text-xs mt-1">
              Supports both Old ABN AMRO text format (`SEPA Overboeking`, `IBAN`, `Kenmerk`) and New slash format (`/TRTP/`, `/IBAN/`, `/REMI/`, `/EREF/`).
            </p>
          </div>

          {/* Production Drag & Drop Upload Container */}
          <div className="border-2 border-dashed border-[#C4BEB3] hover:border-primary/60 bg-[#F8F7F4] rounded-2xl p-8 text-center transition-colors space-y-3 cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold font-heading text-primary">Drag & Drop your ABN AMRO bank statement file here</p>
              <p className="text-xs text-dark/50 mt-0.5">Supports MT940, CAMT.053, CSV or ABN Statement Exports</p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <label className="px-4 py-2 bg-primary text-cream font-bold text-xs rounded-xl shadow-sm hover:bg-primary/90 cursor-pointer transition-colors inline-flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> Choose File
                <input
                  type="file"
                  accept=".txt,.csv,.MT940,.xml"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files && e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        handleTextChange(evt.target.result || '');
                        showToast(`Uploaded ${file.name} successfully!`);
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() => handleLoadSampleStatement('NEW')}
                className="px-4 py-2 bg-[#EDE8DF] text-primary border border-[#D6CFC2] font-bold text-xs rounded-xl hover:bg-[#D6CFC2]/50 transition-colors inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Load Sample Statement
              </button>
            </div>
          </div>

          {/* Raw Text Fallback Option */}
          <div className="space-y-1">
            <label className="block font-bold text-dark/70 text-xs">
              Statement Text Content (Automatic Parsing & Checksum Engine):
            </label>
            <textarea
              rows={5}
              value={rawTextContent}
              onChange={e => handleTextChange(e.target.value)}
              placeholder="Paste or inspect raw ABN AMRO statement text here..."
              className="w-full p-3 bg-white border border-[#D6CFC2] rounded-xl font-mono text-xs text-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Statement Validation Feedback & Preview Summary Card */}
          {validationResult && (
            <div className={`p-5 rounded-2xl border font-body text-xs space-y-4 ${
              validationResult.isValid
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                : 'bg-red-50/80 border-red-300 text-red-950'
            }`}>
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
                <div className="flex items-center gap-2 font-bold text-sm">
                  {validationResult.isValid ? (
                    <>
                      <ShieldCheck className="w-5 h-5 text-emerald-700" />
                      <span>✓ Statement Validated & Balance Checksum Passed!</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <span>✕ Validation Failure: Checksum or Count Mismatch</span>
                    </>
                  )}
                </div>
                <span className="font-mono text-xs font-bold px-2.5 py-1 bg-white rounded-lg border border-emerald-300 text-emerald-900">
                  Opening: € {headerInfo.openingBalance.toLocaleString('nl-NL')} ➔ Closing: € {headerInfo.closingBalance.toLocaleString('nl-NL')}
                </span>
              </div>

              {/* Import Preview Breakdown */}
              {validationResult.isValid && (
                <div className="space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-900">Import Preview Summary</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs text-center">
                    <div className="p-2.5 bg-white rounded-xl border border-emerald-200">
                      <span className="text-[10px] text-dark/50 font-sans block uppercase font-bold">Total Found</span>
                      <strong className="text-base text-dark">{parsedStatementTxns.length}</strong>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-emerald-200">
                      <span className="text-[10px] text-emerald-700 font-sans block uppercase font-bold">Categorized</span>
                      <strong className="text-base text-emerald-800">{parsedStatementTxns.filter(t => t.status === 'Categorized').length}</strong>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-emerald-200">
                      <span className="text-[10px] text-blue-700 font-sans block uppercase font-bold">Matched Order</span>
                      <strong className="text-base text-blue-800">{parsedStatementTxns.filter(t => t.status === 'Matched' || (t.projectRef && t.projectRef !== '-')).length}</strong>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-emerald-200">
                      <span className="text-[10px] text-amber-700 font-sans block uppercase font-bold">Review Needed</span>
                      <strong className="text-base text-amber-800">{parsedStatementTxns.filter(t => t.status === 'Review Needed' || t.category === 'Review Item / Vraagpost').length}</strong>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-emerald-200">
                      <span className="text-[10px] text-purple-700 font-sans block uppercase font-bold">Duplicates</span>
                      <strong className="text-base text-purple-800">
                        {parsedStatementTxns.filter(t => t.eref && transactions.some(existing => existing.eref === t.eref)).length}
                      </strong>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      onClick={handleCommitStatement}
                      className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs py-2.5 px-6 shadow-md"
                    >
                      ✓ Confirm Import
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* ========================================================= */}
      {/* TAB 3: REVIEW ITEMS / VRAAGPOSTEN BEOORDELEN              */}
      {/* ========================================================= */}
      {activeTab === 'review' && (
        <Card p="p-5" className="space-y-4">
          <div className="flex justify-between items-center bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-900 text-xs">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-sm font-heading">Review Needed Transactions</h3>
                <p className="text-amber-800">
                  Transactions without a reliable automated recognition rule require manual admin verification before ledger entry.
                </p>
              </div>
            </div>
            <span className="font-bold text-sm bg-amber-200 px-3 py-1 rounded-lg font-mono">
              {reviewItemsList.length} Items Pending Review
            </span>
          </div>

          {reviewItemsList.length === 0 ? (
            <div className="p-8 text-center bg-[#F8F7F4] rounded-xl border border-[#D6CFC2] space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-primary text-base">All Transactions Reviewed!</h4>
              <p className="text-xs text-dark/60">Every bank entry has been verified, categorized and assigned correctly.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-body text-xs">
                <thead>
                  <tr className="border-b border-[#D6CFC2] bg-[#EDE8DF] text-[10px] uppercase text-dark/60 font-bold tracking-wider">
                    <th className="py-3 px-3">Date & Type</th>
                    <th className="py-3 px-3">Counterparty & IBAN</th>
                    <th className="py-3 px-3">Description & Reference</th>
                    <th className="py-3 px-3 text-right">Amount (€)</th>
                    <th className="py-3 px-3">Review Reason</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D6CFC2]/50 bg-white">
                  {reviewItemsList.map(tx => (
                    <tr key={tx.id} className="align-top hover:bg-cream/20">
                      <td className="py-3 px-3 whitespace-nowrap">
                        <p className="font-bold text-dark font-mono text-xs">{tx.date}</p>
                        <span className="text-[9px] uppercase font-mono text-dark/50 bg-[#EDE8DF] px-1 py-0.5 rounded">{tx.type}</span>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-dark">{tx.counterName}</p>
                        <p className="text-[10px] font-mono text-dark/50">{tx.counterIban}</p>
                      </td>
                      <td className="py-3 px-3 space-y-0.5 max-w-[240px]">
                        <p className="font-medium text-dark leading-snug">{tx.description}</p>
                        <p className="text-[9.5px] font-mono text-dark/40">Ref: {tx.eref}</p>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold whitespace-nowrap">
                        {tx.credit > 0 && <span className="text-emerald-700">+ € {Number(tx.credit).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>}
                        {tx.debit > 0 && <span className="text-red-600">- € {Number(tx.debit).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>}
                      </td>
                      <td className="py-3 px-3 text-amber-900 text-[11px] leading-tight max-w-[200px]">
                        {tx.reviewReason || 'No configured counterparty or invoice matching rule found.'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex flex-col sm:flex-row gap-1.5 justify-center">
                          <Button
                            size="sm"
                            onClick={() => {
                              setManualAllocateTx(tx);
                              const defaultTarget = (tx.projectRef && tx.projectRef !== '-') ? tx.projectRef : (mockInvoices[0]?.id || 'INV-4001-A');
                              setSelectedTargetOrderId(defaultTarget);
                            }}
                            className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-[10px] py-1 px-2.5 whitespace-nowrap"
                          >
                            <FolderOpen className="w-3 h-3 mr-1" /> Link Project / Order
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setReclassifyModalTx(tx);
                              setNewSelectedCategory(tx.category && tx.category !== 'Review Item / Vraagpost' ? tx.category : 'Purchasing (Inkoop)');
                              setSelectedTargetOrderId(tx.projectRef && tx.projectRef !== '-' ? tx.projectRef : '');
                            }}
                            className="bg-amber-700 hover:bg-amber-800 text-white font-bold text-[10px] py-1 px-2.5 whitespace-nowrap"
                          >
                            <Tag className="w-3 h-3 mr-1" /> Assign Category
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* RECLASSIFY & REVIEW MODAL FOR VRAAGPOSTEN */}
      <AnimatePresence>
        {reclassifyModalTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-dark/70 backdrop-blur-sm" onClick={() => setReclassifyModalTx(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-4 text-xs font-body max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start border-b border-[#D6CFC2] pb-3">
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    reclassifyModalTx.status === 'Review Needed' || reclassifyModalTx.category === 'Review Item / Vraagpost'
                      ? 'text-amber-800 bg-amber-100 border-amber-300'
                      : 'text-primary bg-primary/10 border-primary/20'
                  }`}>
                    {reclassifyModalTx.status === 'Review Needed' || reclassifyModalTx.category === 'Review Item / Vraagpost'
                      ? '⚠️ Vraagpost / Review Item Beoordeling'
                      : '🏷️ Transactie Categorie Beoordeling'}
                  </span>
                  <h3 className="text-base font-heading font-bold text-primary mt-1">{reclassifyModalTx.counterName}</h3>
                </div>
                <button onClick={() => setReclassifyModalTx(null)} className="p-1 text-dark/40 hover:text-dark"><X className="w-5 h-5" /></button>
              </div>

              {/* Transaction Detail Card */}
              <div className="bg-white p-4 rounded-xl border border-[#D6CFC2] space-y-2 text-dark/80 font-mono text-[11px]">
                <div className="grid grid-cols-2 gap-2 border-b border-[#D6CFC2]/50 pb-2">
                  <p><strong>Datum:</strong> {reclassifyModalTx.date}</p>
                  <p><strong>Type:</strong> {reclassifyModalTx.type}</p>
                  <p><strong>Tegenpartij:</strong> {reclassifyModalTx.counterName}</p>
                  <p><strong>IBAN:</strong> {reclassifyModalTx.counterIban}</p>
                </div>
                <p><strong>Omschrijving:</strong> {reclassifyModalTx.description}</p>
                <p><strong>EREF Kenmerk:</strong> {reclassifyModalTx.eref}</p>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#D6CFC2]/50">
                  <p><strong>Bedrag:</strong> <span className={reclassifyModalTx.credit > 0 ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>€ {Number(reclassifyModalTx.credit || reclassifyModalTx.debit || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span></p>
                  <p><strong>Huidige Categorie:</strong> <span className="font-bold text-primary">{reclassifyModalTx.category}</span></p>
                </div>
                <p className="text-[10px] text-amber-900 bg-amber-50 p-2 rounded border border-amber-200 font-sans">
                  ⚡ <strong>Match / Herkenningsreden:</strong> {reclassifyModalTx.matchReason || reclassifyModalTx.reviewReason || 'Geen automatische regel gematcht'}
                </p>
              </div>

              {/* Category Selection */}
              <div className="space-y-1">
                <label className="block font-bold text-primary uppercase text-[10px] tracking-wider">Handmatige Categorie Selectie *</label>
                <select
                  value={newSelectedCategory || reclassifyModalTx.category}
                  onChange={e => setNewSelectedCategory(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#D6CFC2] rounded-xl font-bold text-dark text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {BOOKKEEPING_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Project / Order Selection */}
              <div className="space-y-1">
                <label className="block font-bold text-primary uppercase text-[10px] tracking-wider">Koppel aan Project / Order (Optioneel)</label>
                <select
                  value={selectedTargetOrderId}
                  onChange={e => setSelectedTargetOrderId(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#D6CFC2] rounded-xl font-bold text-dark text-xs focus:outline-none"
                >
                  <option value="">-- Geen Project Koppeling --</option>
                  {mockProjects.map(p => (
                    <option key={p.id} value={p.id}>{p.id} - {p.name} ({p.customer})</option>
                  ))}
                  {mockInvoices.map(inv => (
                    <option key={inv.id} value={inv.id}>Factuur {inv.id} - {inv.customer} ({inv.amount})</option>
                  ))}
                </select>
              </div>

              {/* Review Notes (Optional) */}
              <div className="space-y-1">
                <label className="block font-bold text-primary uppercase text-[10px] tracking-wider">Review Notes (Optioneel)</label>
                <textarea
                  rows={2}
                  value={reviewNotes}
                  onChange={e => setReviewNotes(e.target.value)}
                  placeholder="Voeg optionele toelichting of opmerking toe voor accountant..."
                  className="w-full p-2.5 bg-white border border-[#D6CFC2] rounded-xl font-body text-xs text-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#D6CFC2]">
                <Button variant="outline" size="sm" onClick={() => setReclassifyModalTx(null)}>Annuleren</Button>
                <Button size="sm" onClick={handleSaveReclassification} className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs py-2 px-5 shadow-sm">
                  ✓ Confirm Review
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MANUAL TRANSACTION ADD MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-4">
              <div className="flex items-center justify-between border-b border-[#D6CFC2] pb-3">
                <h3 className="text-lg font-heading font-bold text-primary">Handmatige Transactie Toevoegen</h3>
                <button onClick={() => setModalOpen(false)} className="p-1 text-dark/40 hover:text-dark"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-dark/70 mb-1">Tegenpartij Naam *</label>
                  <input type="text" required value={form.counterName} onChange={e => setForm(prev => ({ ...prev, counterName: e.target.value }))} className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg" placeholder="e.g. Ruben Verbeij" />
                </div>
                <div>
                  <label className="block font-bold text-dark/70 mb-1">Omschrijving *</label>
                  <input type="text" required value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg" placeholder="e.g. Houtinkoop Thermo Fraké" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-dark/70 mb-1">Type *</label>
                    <select value={form.type} onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))} className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg font-bold">
                      <option value="Expense">Afschrijving (-)</option>
                      <option value="Income">Bijschrijving (+)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-dark/70 mb-1">Bedrag (€) *</label>
                    <input type="number" step="0.01" required value={form.amount} onChange={e => setForm(prev => ({ ...prev, amount: e.target.value }))} className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg font-mono font-bold" placeholder="0.00" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-dark/70 mb-1">Categorie *</label>
                  <select value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))} className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg font-bold">
                    {BOOKKEEPING_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#D6CFC2]">
                  <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>Annuleren</Button>
                  <Button type="submit" size="sm" className="bg-primary text-cream font-bold">Opslaan</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* BOL.COM SELLER ACCOUNT SPECIFICATION BREAKDOWN MODAL */}
      <AnimatePresence>
        {bolSpecModalTx && bolSpecModalTx.bolSpecification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-dark/70 backdrop-blur-sm" onClick={() => setBolSpecModalTx(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-4 text-xs font-body">
              <div className="flex justify-between items-start border-b border-[#D6CFC2] pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-blue-800">Bol.com Partner Specificatie</span>
                  <h3 className="text-base font-heading font-bold text-primary">Verkoopaccount Specificatie Opsplitsing</h3>
                </div>
                <button onClick={() => setBolSpecModalTx(null)} className="p-1 text-dark/40 hover:text-dark"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 leading-snug">
                <strong>Boekhoudkundige Richtlijn Briefing v1.2:</strong>
                <p className="mt-0.5 text-[11px]">Het bankontvangstbedrag is de **netto uitbetaling**. De werkelijke omzet bedraagt de bruto verkopen min de ingehouden bol.com commissie/verkoperkosten.</p>
              </div>

              <div className="space-y-3 bg-white p-4 rounded-xl border border-[#D6CFC2]">
                <div className="flex justify-between items-center pb-2 border-b border-[#EDE8DF]">
                  <div>
                    <span className="font-bold text-dark text-xs block">1. Bruto Verkopen (Gross Sales)</span>
                    <span className="text-[10px] text-dark/50">Geboekt op categorie: <strong>Revenue — bol.com</strong></span>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    + € {Number(bolSpecModalTx.bolSpecification.grossSales).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-[#EDE8DF]">
                  <div>
                    <span className="font-bold text-dark text-xs block">2. Bol.com Commissie & Verkoperkosten</span>
                    <span className="text-[10px] text-dark/50">Geboekt op categorie: <strong>bol.com sales costs / barcodes</strong></span>
                  </div>
                  <span className="font-mono font-bold text-red-600 text-sm">
                    - € {Number(bolSpecModalTx.bolSpecification.commissionFees).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-1 font-bold">
                  <div>
                    <span className="text-primary text-xs block">3. Netto Bank Ontvangst (Bank Payout)</span>
                    <span className="text-[10px] text-dark/50">Ref: {bolSpecModalTx.bolSpecification.sellerAccountRef}</span>
                  </div>
                  <span className="font-mono font-bold text-primary text-base">
                    = € {Number(bolSpecModalTx.bolSpecification.netPayout).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-[#D6CFC2]">
                <Button size="sm" onClick={() => setBolSpecModalTx(null)} className="bg-primary text-cream font-bold">
                  Sluiten
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* MANUAL ORDER ALLOCATION MODAL (STEP 2) */}
      <AnimatePresence>
        {manualAllocateTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-dark/70 backdrop-blur-sm" onClick={() => setManualAllocateTx(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-4 text-xs font-body">
              <div className="flex justify-between items-start border-b border-[#D6CFC2] pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-800">Handmatige Order Koppeling</span>
                  <h3 className="text-base font-heading font-bold text-primary">Koppel Bankontvangst aan Klant Order</h3>
                </div>
                <button onClick={() => setManualAllocateTx(null)} className="p-1 text-dark/40 hover:text-dark"><X className="w-5 h-5" /></button>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#D6CFC2] space-y-1 text-dark/80 font-mono">
                <p><strong>Bank Transactie ID:</strong> {manualAllocateTx.id}</p>
                <p><strong>Tegenpartij / Betaler:</strong> {manualAllocateTx.counterName} ({manualAllocateTx.counterIban})</p>
                <p><strong>Omschrijving:</strong> {manualAllocateTx.description}</p>
                <p><strong>Ontvangen Bedrag:</strong> € {Number(manualAllocateTx.credit || manualAllocateTx.numericAmount || 0).toLocaleString('nl-NL')}</p>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-primary">Selecteer Klant Order / Factuur *</label>
                <select
                  value={selectedTargetOrderId || mockInvoices[0]?.id}
                  onChange={e => setSelectedTargetOrderId(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#D6CFC2] rounded-xl font-bold text-dark text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {mockInvoices.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.id} — {inv.customer} (Totaal: {inv.amount})
                    </option>
                  ))}
                  {mockProjects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.id} — {p.name} ({p.customer})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#D6CFC2]">
                <Button variant="outline" size="sm" onClick={() => setManualAllocateTx(null)}>Annuleren</Button>
                <Button size="sm" onClick={handleSaveManualOrderAllocation} className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold">
                  ✓ Koppel Betaling aan Order & Update Status
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* JOURNAL ENTRY (BOEKING) PREVIEW MODAL (STEP 4) */}
      <AnimatePresence>
        {journalModalTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-dark/70 backdrop-blur-sm" onClick={() => setJournalModalTx(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-xl bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-4 text-xs font-body">
              <div className="flex justify-between items-start border-b border-[#D6CFC2] pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-primary">e-Boekhouden Journal Entry</span>
                  <h3 className="text-base font-heading font-bold text-primary">Boeking Details & Grootboekrekeningen</h3>
                </div>
                <button onClick={() => setJournalModalTx(null)} className="p-1 text-dark/40 hover:text-dark"><X className="w-5 h-5" /></button>
              </div>

              {(() => {
                const journal = generateJournalEntries(journalModalTx);
                return (
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-xl border border-[#D6CFC2] text-xs font-mono space-y-1">
                      <p><strong>Boeking Type:</strong> {journal.type}</p>
                      <p><strong>Omschrijving:</strong> {journal.description}</p>
                      <p><strong>Transactie Datum:</strong> {journal.date}</p>
                      <p><strong>Status:</strong> <span className="text-emerald-700 font-bold">✓ In balans (Debit = Credit)</span></p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-mono border-collapse border border-[#D6CFC2] bg-white text-xs">
                        <thead>
                          <tr className="bg-[#EDE8DF] text-[10px] uppercase font-bold text-dark/60">
                            <th className="p-2 border border-[#D6CFC2]">Code</th>
                            <th className="p-2 border border-[#D6CFC2]">Grootboekrekening</th>
                            <th className="p-2 border border-[#D6CFC2] text-right">Debet (€)</th>
                            <th className="p-2 border border-[#D6CFC2] text-right">Credit (€)</th>
                            <th className="p-2 border border-[#D6CFC2]">BTW Regel</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#D6CFC2]">
                          {journal.lines.map((line, idx) => (
                            <tr key={idx} className="hover:bg-cream/20">
                              <td className="p-2 font-bold text-dark border border-[#D6CFC2]">{line.account.code}</td>
                              <td className="p-2 font-medium text-dark border border-[#D6CFC2]">{line.account.name}</td>
                              <td className="p-2 text-right font-bold text-emerald-800 border border-[#D6CFC2]">
                                {line.debit > 0 ? `€ ${line.debit.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}` : '-'}
                              </td>
                              <td className="p-2 text-right font-bold text-blue-900 border border-[#D6CFC2]">
                                {line.credit > 0 ? `€ ${line.credit.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}` : '-'}
                              </td>
                              <td className="p-2 text-[10px] font-bold text-dark/60 border border-[#D6CFC2]">{line.vatRule}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end pt-2 border-t border-[#D6CFC2]">
                <Button size="sm" onClick={() => setJournalModalTx(null)} className="bg-primary text-cream font-bold">
                  Sluiten
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BOL.COM SELLER SPECIFICATION RECONCILIATION MODAL */}
      <AnimatePresence>
        {bolSpecModalTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-dark/70 backdrop-blur-sm" onClick={() => setBolSpecModalTx(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-4 text-xs font-body">
              <div className="flex justify-between items-start border-b border-[#D6CFC2] pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100 px-2 py-0.5 rounded border border-teal-300">
                    📦 bol.com Verkoper Specificatie (3-Way Split)
                  </span>
                  <h3 className="text-base font-heading font-bold text-primary mt-1">bol.com Uitbetaling Reconciliatie</h3>
                </div>
                <button onClick={() => setBolSpecModalTx(null)} className="p-1 text-dark/40 hover:text-dark"><X className="w-5 h-5" /></button>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#D6CFC2] space-y-3">
                <div className="text-dark/70 space-y-1 font-mono text-[11px]">
                  <p><strong>Verkoper Referentie:</strong> {bolSpecModalTx.bolSpecification?.sellerAccountRef || 'SPEC-2026-BOL-99'}</p>
                  <p><strong>Bank Inschrijving:</strong> {bolSpecModalTx.description}</p>
                  <p><strong>Transactie Datum:</strong> {bolSpecModalTx.date}</p>
                </div>

                <div className="p-3 bg-[#F8F7F4] rounded-lg border border-[#D6CFC2] space-y-2 font-mono text-xs">
                  <div className="flex justify-between text-emerald-800">
                    <span>Bruto Verkopen (Gross Sales):</span>
                    <span className="font-bold">+ € {Number(bolSpecModalTx.bolSpecification?.grossSales || 950).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-rose-700">
                    <span>bol.com Commissie & Barcodes:</span>
                    <span className="font-bold">- € {Number(bolSpecModalTx.bolSpecification?.commissionFees || 150).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#D6CFC2] pt-2 text-primary font-bold text-sm">
                    <span>Netto Bank Uitbetaling:</span>
                    <span>€ {Number(bolSpecModalTx.bolSpecification?.netPayout || bolSpecModalTx.credit || 800).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <p className="text-[10px] text-teal-900 bg-teal-50 p-2 rounded border border-teal-200">
                  ✓ <strong>Boekhoudregel Borging:</strong> Netto bankontvangst is niet rechtstreeks als omzet geboekt, maar opgesplitst in Bruto Omzet (€950) min Verkoopkosten (€150).
                </p>
              </div>

              <div className="flex justify-end pt-2 border-t border-[#D6CFC2]">
                <Button size="sm" onClick={() => setBolSpecModalTx(null)} className="bg-primary text-cream font-bold">
                  Sluiten
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
