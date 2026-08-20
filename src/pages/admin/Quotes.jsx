import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Offerte6PagePDF from '../../components/Offerte6PagePDF';
import QuoteEditor from '../../components/QuoteEditor';
import { createDefaultQuote, calculateTotals } from '../../utils/quoteSchema';
import { Plus, Search, Filter, X, Check, CheckCircle, Trash2, Edit2, RotateCcw, FileText, Download, Printer, PlusCircle, MinusCircle, Briefcase, Share2, ExternalLink, Copy, ShoppingBag } from 'lucide-react';
import { mockQuotes as defaultQuotes } from '../../utils/mockData';
import { useLanguage } from '../../context/LanguageContext';
import { safeSetItem } from '../../utils/storageHelper';
import { downloadQuotePdf, downloadDirectPdfFile } from '../../utils/pdfGenerator';


// Helper to get raw numeric value from formatted amount string (e.g. "€ 12,500" -> 12500)
const getNumericAmount = (amtStr) => {
  if (!amtStr) return 0;
  const val = parseFloat(String(amtStr).replace(/[^\d.-]/g, ''));
  return isNaN(val) ? 0 : val;
};

// Helper to safely extract customer name string (customer can be string OR object from QuoteEditor)
const getCustomerName = (customer) => {
  if (!customer) return '';
  if (typeof customer === 'object') return customer.name || customer.firstName || '';
  return String(customer);
};

// Bulletproof Clipboard Copy Helper with execCommand fallback
const copyTextToClipboard = async (text) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    // Fallback
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch (err) {
    return false;
  }
};

// Pre-saved Fixed Product Library for Outdoor Kitchens
const PRESET_PRODUCT_LIBRARY = [
  { id: 'p1', description: 'Thermo Fraké Buitenkeuken Cabinet (240x80cm)', unitPrice: 2450 },
  { id: 'p2', description: 'Massief Teak Hout Buitenkeuken Cabinet (300x90cm)', unitPrice: 3200 },
  { id: 'p3', description: 'Big Green Egg Large Uitsparing & Base Support', unitPrice: 450 },
  { id: 'p4', description: 'Zwart Polijst Beton Cire Werkblad (8cm)', unitPrice: 850 },
  { id: 'p5', description: 'RVS Inbouw Buitenkoelkast Premium 80L', unitPrice: 890 },
  { id: 'p6', description: 'RVS Spoelbak & Mengkraan Inbouwset', unitPrice: 390 },
  { id: 'p7', description: 'Heavy Duty Terras Wielen Set (4x)', unitPrice: 190 },
  { id: 'p8', description: 'Bezorging & Professionele Inhuizen', unitPrice: 0 }
];

// Sequential Quote Number Generator: OF-{year}{sequence} (e.g. OF-2026331)
const generateNextQuoteId = (quotesList) => {
  const year = new Date().getFullYear();
  const prefix = `OF-${year}`;
  let maxSeq = 330; // base sequence starts before 331

  if (Array.isArray(quotesList)) {
    quotesList.forEach((q) => {
      if (q && q.id && typeof q.id === 'string') {
        const match = q.id.match(/OF-\d{4}(\d+)/i) || q.id.match(/OF-\d{4}-(\d+)/i) || q.id.match(/OF-(\d+)/i);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxSeq) {
            maxSeq = num;
          }
        }
      }
    });
  }

  const nextSeq = maxSeq + 1;
  return `${prefix}${nextSeq}`;
};

export default function Quotes() {
  const { t, language } = useLanguage();
  const [quotes, setQuotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter States
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const [modalOpen, setModalOpen] = useState(false);
  const [pdfPreviewQuote, setPdfPreviewQuote] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null); // null = adding, object = editing
  const [toastMsg, setToastMsg] = useState('');

  // Multi-item Form State
  const [form, setForm] = useState({
    customer: '',
    project: '',
    discountPercent: 0,
    status: 'Concept',
    items: [
      { description: 'Buitenkeuken Frame (Teak Hout)', quantity: 1, unitPrice: 8500 },
      { description: 'Beton Aanrechtblad & Installatie', quantity: 1, unitPrice: 2800 }
    ]
  });

  // Load quotes from localStorage on mount with bulletproof fallback
  useEffect(() => {
    try {
      const savedQuotes = localStorage.getItem('app_quotes_v2') || localStorage.getItem('app_quotes');
      if (savedQuotes) {
        const parsed = JSON.parse(savedQuotes);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const safeQuotes = parsed.map(q => ({
            ...q,
            id: q.id || `Q-${Math.floor(4000 + Math.random() * 1000)}`,
            customer: q.customer || 'Onbekend',
            project: q.project || 'Maatwerk Keuken',
            amount: q.amount || '€ 5,000',
            date: q.date || new Date().toISOString().split('T')[0],
            status: q.status === 'Draft' ? 'Concept' : q.status === 'Accepted' ? 'Geaccepteerd' : (q.status || 'Concept'),
            discountPercent: q.discountPercent || 0,
            items: Array.isArray(q.items) && q.items.length > 0 ? q.items : [
              { description: `${q.project || 'Maatwerk Keuken'} Specs`, quantity: 1, unitPrice: getNumericAmount(q.amount) || 5000 }
            ]
          }));
          setQuotes(safeQuotes);
          localStorage.setItem('app_quotes_v2', JSON.stringify(safeQuotes));
          localStorage.setItem('app_quotes', JSON.stringify(safeQuotes));
          return;
        }
      }
    } catch (e) {
      console.error("Error loading quotes:", e);
    }
    
    // Fallback default quotes
    const enrichedDefaults = defaultQuotes.map(q => ({
      ...q,
      status: q.status === 'Draft' ? 'Concept' : q.status === 'Accepted' ? 'Geaccepteerd' : q.status,
      discountPercent: 0,
      items: Array.isArray(q.items) ? q.items : [
        { description: `${q.project} Main Specs`, quantity: 1, unitPrice: getNumericAmount(q.amount) || 5000 }
      ]
    }));
    setQuotes(enrichedDefaults);
    localStorage.setItem('app_quotes_v2', JSON.stringify(enrichedDefaults));
    localStorage.setItem('app_quotes', JSON.stringify(enrichedDefaults));
  }, []);

  const [leadsList, setLeadsList] = useState([]);
  const [customerSelect, setCustomerSelect] = useState('Other');
  const [projectSelect, setProjectSelect] = useState('Exclusieve Buitenkeuken');

  useEffect(() => {
    if (modalOpen) {
      const savedLeads = localStorage.getItem('app_leads_v2') || localStorage.getItem('app_leads');
      if (savedLeads) {
        try { setLeadsList(JSON.parse(savedLeads)); } catch(e){}
      }
    }
  }, [modalOpen]);

  const [activeEditorQuote, setActiveEditorQuote] = useState(null);

  const handleSaveEditorQuote = (updatedQuote, showToastFlag = false) => {
    const totals = calculateTotals(updatedQuote.investment?.lineItems || []);
    const formattedAmt = `€ ${Math.round(totals.totalInclVat).toLocaleString('nl-NL')}`;
    
    const processedQuote = {
      ...updatedQuote,
      customer: updatedQuote.customer?.name || updatedQuote.customer || 'Bjorn Valk',
      project: `Buitenkeuken ${updatedQuote.configuration?.woodType || 'Thermo Fraké'}`,
      amount: formattedAmt
    };

    setQuotes(prevQuotes => {
      const exists = prevQuotes.some(q => q.id === processedQuote.id);
      let updatedList = [];
      if (exists) {
        updatedList = prevQuotes.map(q => q.id === processedQuote.id ? processedQuote : q);
      } else {
        updatedList = [processedQuote, ...prevQuotes];
      }
      safeSetItem('app_quotes_v2', updatedList);
      safeSetItem('app_quotes', updatedList);
      return updatedList;
    });

    window.dispatchEvent(new Event('app_data_changed'));

    if (showToastFlag) {
      showToast(language === 'EN' ? `Quote ${processedQuote.id} saved successfully!` : `Offerte ${processedQuote.id} succesvol opgeslagen!`);
    }
  };

  const handleOpenAddModal = () => {
    let freshLeads = leadsList;
    const savedLeads = localStorage.getItem('app_leads_v2') || localStorage.getItem('app_leads');
    if (savedLeads) {
      try {
        freshLeads = JSON.parse(savedLeads);
        setLeadsList(freshLeads);
      } catch(e){}
    }

    const nextId = generateNextQuoteId(quotes);
    const newQuote = createDefaultQuote(freshLeads[0] || null, null);
    newQuote.id = nextId;
    setActiveEditorQuote(newQuote);
  };

  const handleOpenEditModal = (quoteRow) => {
    const fullQuoteModel = createDefaultQuote(null, quoteRow);
    setActiveEditorQuote(fullQuoteModel);
  };

  const handleDeleteQuote = (id, customer) => {
    const updatedQuotes = quotes.filter(q => q.id !== id);
    setQuotes(updatedQuotes);
    safeSetItem('app_quotes_v2', updatedQuotes);
    safeSetItem('app_quotes', updatedQuotes);
    window.dispatchEvent(new Event('app_data_changed'));
    showToast(`Quote "${id}" for "${customer}" deleted successfully!`);
  };

  // Module 3.3 Sub-Item 1: Duplicate Quotation Handler
  const handleDuplicateQuote = (row) => {
    const nextId = generateNextQuoteId(quotes);
    const duplicatedObj = {
      ...row,
      id: nextId,
      date: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Concept',
      signerName: '',
      approvedAt: null
    };

    const updatedList = [duplicatedObj, ...quotes];
    setQuotes(updatedList);
    safeSetItem('app_quotes_v2', updatedList);
    safeSetItem('app_quotes', updatedList);
    window.dispatchEvent(new Event('app_data_changed'));
    showToast(language === 'EN' ? `Quote duplicated as ${nextId} (Concept)!` : `Offerte gekopieerd als ${nextId} (Concept)!`);
  };

  // Module 3.3 Sub-Item 3: Product Library Item Selector Handler
  const handleSelectFromLibrary = (productId) => {
    const preset = PRESET_PRODUCT_LIBRARY.find(p => p.id === productId);
    if (!preset) return;
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { description: preset.description, quantity: 1, unitPrice: preset.unitPrice }]
    }));
    showToast(language === 'EN' ? `Added "${preset.description}" from Product Library!` : `"${preset.description}" toegevoegd uit Bibliotheek!`);
  };

  // Auto-generate Invoices and Projects if Quote is Accepted
  const autoGenerateInvoicesAndProjectForAcceptedQuote = (quote) => {
    const totalAmount = getNumericAmount(quote.amount);
    const halfAmount = totalAmount / 2;
    const inv1 = {
      id: `INV-${Date.now().toString().slice(-4)}-A`,
      quoteId: quote.id,
      customer: quote.customer,
      type: '50% Aanbetaling (Upfront)',
      amount: `€ ${halfAmount.toLocaleString()}`,
      numericAmount: halfAmount,
      status: 'Openstaand', // Pending
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdDate: new Date().toISOString().split('T')[0]
    };
    const inv2 = {
      id: `INV-${Date.now().toString().slice(-4)}-B`,
      quoteId: quote.id,
      customer: quote.customer,
      type: '50% Eindfactuur (Completion)',
      amount: `€ ${halfAmount.toLocaleString()}`,
      numericAmount: halfAmount,
      status: 'Openstaand',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdDate: new Date().toISOString().split('T')[0]
    };

    const existingInvoices = JSON.parse(localStorage.getItem('app_invoices') || '[]');
    // Filter out previous generated for this quote to avoid duplicates
    const filteredInvoices = existingInvoices.filter(i => i.quoteId !== quote.id);
    const updatedInvoices = [inv1, inv2, ...filteredInvoices];
    localStorage.setItem('app_invoices', JSON.stringify(updatedInvoices));

    // Auto Create / Update Project (Prevent duplicates)
    const existingProjects = JSON.parse(localStorage.getItem('app_projects') || '[]');
    const totalVal = getNumericAmount(quote.amount);
    const existingIdx = existingProjects.findIndex(p => p.quoteId === quote.id || (p.customer === quote.customer && p.name === quote.project));

    const projectPayload = {
      id: existingIdx >= 0 ? existingProjects[existingIdx].id : `PRJ-${Math.floor(100 + Math.random() * 900)}`,
      name: quote.project,
      customer: quote.customer,
      partner: quote.partner || existingProjects[existingIdx]?.partner || 'Unassigned',
      partnerCost: quote.partnerCost || Math.round(totalVal * 0.65),
      margin: quote.margin || Math.round(totalVal * 0.35),
      products: quote.items || quote.products || [],
      progress: existingIdx >= 0 ? existingProjects[existingIdx].progress : 0,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'In Progress',
      orderStatus: 'In voorbereiding',
      quoteId: quote.id,
      value: quote.amount,
      numericAmount: totalVal,
      isPartnerConfirmed: existingIdx >= 0 ? (existingProjects[existingIdx].isPartnerConfirmed || false) : false,
      partnerStatus: existingIdx >= 0 ? (existingProjects[existingIdx].partnerStatus || 'Pending Confirmation') : 'Pending Confirmation'
    };

    let updatedProjectsList = [];
    if (existingIdx >= 0) {
      updatedProjectsList = existingProjects.map((p, i) => i === existingIdx ? { ...p, ...projectPayload } : p);
    } else {
      updatedProjectsList = [projectPayload, ...existingProjects];
    }
    localStorage.setItem('app_projects', JSON.stringify(updatedProjectsList));

    // Auto Update Lead Status to Gewonnen
    const savedLeads = localStorage.getItem('app_leads_v2') || localStorage.getItem('app_leads');
    if (savedLeads) {
      try {
        const leads = JSON.parse(savedLeads);
        const updatedLeads = leads.map(l => l.name === quote.customer ? { ...l, status: 'Gewonnen' } : l);
        localStorage.setItem('app_leads_v2', JSON.stringify(updatedLeads));
        localStorage.setItem('app_leads', JSON.stringify(updatedLeads));
      } catch(e){}
    }

    // Trigger app data change event across windows/components
    window.dispatchEvent(new Event('app_data_changed'));
  };

  const calculateSubtotal = (items) => {
    return items.reduce((acc, item) => acc + (parseFloat(item.quantity || 0) * parseFloat(item.unitPrice || 0)), 0);
  };

  const calculateFinalTotal = (items, discountPercent) => {
    const subtotal = calculateSubtotal(items);
    const discountAmount = subtotal * ((parseFloat(discountPercent) || 0) / 100);
    return subtotal - discountAmount;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const finalCustomer = customerSelect === 'Other' ? form.customer : customerSelect;
    const finalProject = projectSelect === 'Other' ? form.project : projectSelect;

    if (!finalCustomer.trim() || !finalProject.trim()) {
      showToast("Please provide valid Customer and Project details.");
      return;
    }

    const finalAmountVal = calculateFinalTotal(form.items, form.discountPercent);
    const formattedAmount = `€ ${finalAmountVal.toLocaleString()}`;
    
    let updatedQuotes = [];

    if (selectedQuote) {
      // Editing Mode
      const updatedQuoteObj = {
        ...selectedQuote,
        customer: finalCustomer,
        project: finalProject,
        amount: formattedAmount,
        discountPercent: parseFloat(form.discountPercent) || 0,
        status: form.status,
        showFrontView: form.showFrontView,
        woodType: form.woodType,
        totalWidth: form.totalWidth,
        frontViewElements: form.frontViewElements,
        finishTreatment: form.finishTreatment,
        deliveryLocation: form.deliveryLocation,
        deliveryPrice: Number(form.deliveryPrice) || 0,
        paymentTerm1Percent: Number(form.paymentTerm1Percent) || 50,
        paymentTerm2Percent: Number(form.paymentTerm2Percent) || 50,
        items: form.items
      };

      updatedQuotes = quotes.map(q => q.id === selectedQuote.id ? updatedQuoteObj : q);
      showToast(`Quote "${selectedQuote.id}" updated successfully!`);

      if (form.status === 'Geaccepteerd' || form.status === 'Accepted') {
        autoGenerateInvoicesAndProjectForAcceptedQuote(updatedQuoteObj);
      }
    } else {
      // Adding Mode (Auto Quote Counter: OF-{year}-{sequence})
      const nextId = generateNextQuoteId(quotes);
      const newQuote = {
        id: nextId,
        customer: finalCustomer,
        project: finalProject,
        amount: formattedAmount,
        discountPercent: parseFloat(form.discountPercent) || 0,
        status: form.status,
        showFrontView: form.showFrontView,
        woodType: form.woodType,
        totalWidth: form.totalWidth,
        frontViewElements: form.frontViewElements,
        finishTreatment: form.finishTreatment,
        deliveryLocation: form.deliveryLocation,
        deliveryPrice: Number(form.deliveryPrice) || 0,
        paymentTerm1Percent: Number(form.paymentTerm1Percent) || 50,
        paymentTerm2Percent: Number(form.paymentTerm2Percent) || 50,
        items: form.items,
        date: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      updatedQuotes = [newQuote, ...quotes];
      showToast(language === 'EN' ? `Quote "${nextId}" created successfully!` : `Offerte "${nextId}" succesvol aangemaakt!`);

      if (form.status === 'Geaccepteerd' || form.status === 'Accepted') {
        autoGenerateInvoicesAndProjectForAcceptedQuote(newQuote);
      } else {
        // Update Lead status to Offerte if it was Nieuw/In gesprek
        const savedLeads = localStorage.getItem('app_leads_v2') || localStorage.getItem('app_leads');
        if (savedLeads) {
          try {
            const leads = JSON.parse(savedLeads);
            const updatedLeads = leads.map(l => (l.name === finalCustomer && l.status !== 'Gewonnen') ? { ...l, status: 'Offerte' } : l);
            localStorage.setItem('app_leads_v2', JSON.stringify(updatedLeads));
            localStorage.setItem('app_leads', JSON.stringify(updatedLeads));
          } catch(e){}
        }
      }
    }

    setQuotes(updatedQuotes);
    safeSetItem('app_quotes_v2', updatedQuotes);
    safeSetItem('app_quotes', updatedQuotes);
    window.dispatchEvent(new Event('app_data_changed'));
    setModalOpen(false);
  };

  const handleAddItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0 }]
    }));
  };

  const handleRemoveItem = (index) => {
    if (form.items.length === 1) return;
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index, field, val) => {
    setForm(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: val };
      return { ...prev, items: newItems };
    });
  };

  const handleAddFrontViewElement = () => {
    setForm(prev => ({
      ...prev,
      frontViewElements: [
        ...(prev.frontViewElements || []),
        { name: 'kastje', width: '60 cm', isDark: false, flex: 1 }
      ]
    }));
  };

  const handleRemoveFrontViewElement = (index) => {
    setForm(prev => ({
      ...prev,
      frontViewElements: (prev.frontViewElements || []).filter((_, i) => i !== index)
    }));
  };

  const handleMoveFrontViewElement = (index, direction) => {
    setForm(prev => {
      const list = [...(prev.frontViewElements || [])];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      return { ...prev, frontViewElements: list };
    });
  };

  const handleFrontViewElementChange = (index, field, val) => {
    setForm(prev => {
      const list = [...(prev.frontViewElements || [])];
      list[index] = { ...list[index], [field]: val };
      return { ...prev, frontViewElements: list };
    });
  };

  const handleResetFilters = () => {
    setStatusFilter('All');
    setSortBy('newest');
    setSearchQuery('');
  };

  // Process and sort quotes list
  const processedQuotes = [...quotes]
    .filter(quote => {
      const custName = getCustomerName(quote.customer).toLowerCase();
      const projName = (quote.project || '').toLowerCase();
      const qId = (quote.id || '').toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchesSearch = custName.includes(query) || projName.includes(query) || qId.includes(query);
      const matchesStatus = statusFilter === 'All' || quote.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date || 0) - new Date(a.date || 0);
      if (sortBy === 'oldest') return new Date(a.date || 0) - new Date(b.date || 0);
      if (sortBy === 'amount-desc') return getNumericAmount(b.amount) - getNumericAmount(a.amount);
      if (sortBy === 'amount-asc') return getNumericAmount(a.amount) - getNumericAmount(b.amount);
      if (sortBy === 'customer-asc') return getCustomerName(a.customer).localeCompare(getCustomerName(b.customer));
      return 0;
    });

  // Dynamic counter stats
  const totalCount = quotes.length;
  const conceptCount = quotes.filter(q => q.status === 'Concept' || q.status === 'Draft').length;
  const sentCount = quotes.filter(q => q.status === 'Verzonden' || q.status === 'Sent').length;
  const acceptedCount = quotes.filter(q => q.status === 'Geaccepteerd' || q.status === 'Accepted' || q.status === 'Gecoördineerd').length;
  const getTranslatedStatus = (st) => {
    if (language !== 'EN') return st;
    switch (st) {
      case 'Concept': case 'Draft': return 'Draft';
      case 'Verzonden': case 'Sent': return 'Sent';
      case 'Gecoördineerd': case 'Coordinated': return 'Coordinated';
      case 'Geaccepteerd': case 'Accepted': return 'Accepted';
      case 'Afgewezen': case 'Rejected': return 'Rejected';
      default: return st;
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Concept':
      case 'Draft':
        return 'default';
      case 'Verzonden':
      case 'Sent':
        return 'info';
      case 'Gecoördineerd':
        return 'warning';
      case 'Geaccepteerd':
      case 'Accepted':
      case 'Paid':
        return 'success';
      case 'Afgewezen':
      case 'Rejected':
        return 'danger';
      default:
        return 'primary';
    }
  };

  const handleConvertToProject = (quote) => {
    const updatedQuoteObj = { ...quote, status: 'Geaccepteerd' };
    const updatedQuotes = quotes.map(q => q.id === quote.id ? updatedQuoteObj : q);
    setQuotes(updatedQuotes);
    localStorage.setItem('app_quotes', JSON.stringify(updatedQuotes));
    autoGenerateInvoicesAndProjectForAcceptedQuote(updatedQuoteObj);
    showToast(language === 'EN' ? `Quote converted to Project for ${getCustomerName(quote.customer)}!` : `Offerte omgezet naar Project voor ${getCustomerName(quote.customer)}!`);
  };

  const translateProjectName = (name) => {
    if (language !== 'EN' || !name) return name;
    return name
      .replace(/Luxe Teak Buitenkeuken 4m/g, 'Luxury Teak Outdoor Kitchen 4m')
      .replace(/Kliko Ombouw Triple Antraciet/g, 'Triple Bin Storage Anthracite')
      .replace(/Eiken Houten Overkapping 6x4m/g, 'Oak Wooden Canopy 6x4m')
      .replace(/Buitenkeuken/g, 'Outdoor Kitchen')
      .replace(/Kliko Ombouw/g, 'Bin Storage')
      .replace(/Overkapping/g, 'Canopy');
  };

  const columns = [
    { header: language === 'EN' ? 'Quote ID' : 'Offerte ID', accessor: 'id' },
    { 
      header: language === 'EN' ? 'Category' : 'Categorie',
      style: { minWidth: '200px' },
      render: (row) => {
        const proj = (row.project || '').toLowerCase();
        const cat = row.category || (proj.includes('snijplanken') || proj.includes('decking') ? 'Snijplanken' : 'Buitenkeukens');
        const logoSrc = cat.includes('Snijplanken')
          ? '/logo_snijplanken.png'
          : '/logo_buitenkeukens.png';
        const displayCat = language === 'EN' 
          ? (cat.includes('Snijplanken') ? 'Cutting Boards' : 'Outdoor Kitchens')
          : cat;
        return (
          <div className="flex items-center gap-2 py-0.5">
            <img 
              src={logoSrc} 
              alt={cat} 
              className="h-6 max-w-[70px] object-contain mix-blend-multiply flex-shrink-0"
            />
            <span className="text-[10px] font-bold text-primary font-body bg-primary/10 px-2 py-0.5 rounded-md whitespace-nowrap">
              {displayCat}
            </span>
          </div>
        );
      }
    },
    { header: language === 'EN' ? 'Customer' : 'Klantnaam', render: (row) => <span>{getCustomerName(row.customer)}</span> },
    { header: language === 'EN' ? 'Project' : 'Project', render: (row) => <span>{translateProjectName(row.project)}</span> },
    { header: language === 'EN' ? 'Amount' : 'Bedrag', accessor: 'amount' },
    { 
      header: language === 'EN' ? 'Status' : 'Status', 
      render: (row) => (
        <Badge variant={getStatusBadgeVariant(row.status)}>
          {getTranslatedStatus(row.status)}
        </Badge>
      )
    },
    { header: language === 'EN' ? 'Date' : 'Datum', accessor: 'date' },
    {
      header: language === 'EN' ? 'Actions' : 'Acties',
      style: { minWidth: '420px', textAlign: 'right' },
      render: (row) => (
        <div className="flex items-center justify-start sm:justify-end flex-wrap sm:flex-nowrap gap-1 sm:gap-1.5 max-w-full py-0.5">
          {row.status !== 'Geaccepteerd' && row.status !== 'Accepted' && (
            <button 
              onClick={() => handleConvertToProject(row)}
              className="px-2 py-1 sm:px-2.5 sm:py-1 bg-primary text-cream hover:bg-primary-dark rounded-lg text-[10px] sm:text-[11px] font-bold inline-flex items-center gap-1 transition-all shadow-xs flex-shrink-0 cursor-pointer"
              title={language === 'EN' ? 'Accept & Convert to Project' : 'Accepteer & Omzetten naar Project'}
            >
              <Briefcase className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Project</span>
            </button>
          )}

          <button 
            disabled={row.status === 'Concept' || row.status === 'Draft'}
            onClick={async () => {
              if (row.status === 'Concept' || row.status === 'Draft') return;
              const publicUrl = `${window.location.origin}/offerte/${row.id}`;
              await copyTextToClipboard(publicUrl);
              setToastMsg(language === 'EN' ? `Public Offerte link copied: ${publicUrl}` : `Offerte link gekopieerd: ${publicUrl}`);
            }}
            className={`px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-bold inline-flex items-center gap-1 transition-colors flex-shrink-0 ${
              (row.status === 'Concept' || row.status === 'Draft')
                ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-60'
                : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 cursor-pointer'
            }`}
            title={(row.status === 'Concept' || row.status === 'Draft') ? (language === 'EN' ? 'Draft quote — Approve quote internally to enable send buttons' : 'Concept offerte — Keur offerte intern goed om verzendopties te ontgrendelen') : 'Copy Public Digital Approval Link'}
          >
            <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Link
          </button>
          <a
            href={`/offerte/${row.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 sm:p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors inline-flex items-center justify-center flex-shrink-0 cursor-pointer"
            title="Open Customer Online View"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button 
            onClick={() => handleDuplicateQuote(row)}
            className="px-2 py-1 sm:px-2.5 sm:py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-[10px] sm:text-[11px] font-bold inline-flex items-center gap-1 transition-colors flex-shrink-0 cursor-pointer"
            title={language === 'EN' ? 'Duplicate Quote (Create copy)' : 'Offerte Kopiëren'}
          >
            <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-700" /> Copy
          </button>
          <button 
            onClick={() => handleOpenEditModal(row)}
            className="p-1 sm:p-1.5 text-dark/70 hover:text-dark hover:bg-dark/10 rounded-lg transition-colors inline-flex items-center justify-center flex-shrink-0 cursor-pointer"
            title="Edit Quote"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => handleDeleteQuote(row.id, getCustomerName(row.customer))}
            className="p-1 sm:p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center justify-center flex-shrink-0 cursor-pointer"
            title="Delete Quote"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  const hasActiveFilters = statusFilter !== 'All' || sortBy !== 'newest' || searchQuery !== '';

  if (activeEditorQuote) {
    return (
      <QuoteEditor
        quoteData={activeEditorQuote}
        leadsList={leadsList}
        onClose={() => setActiveEditorQuote(null)}
        onSaveQuote={(updated, showToastFlag) => handleSaveEditorQuote(updated, showToastFlag)}
      />
    );
  }

  return (
    <div className="space-y-6 font-body">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }} 
            className="fixed top-20 right-4 z-[99999] flex items-center gap-2 bg-[#33422C] text-white px-4 py-3 rounded-xl shadow-xl text-xs font-body font-semibold"
          >
            <CheckCircle className="w-4 h-4 text-[#D97706]" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-primary">
            {language === 'EN' ? 'Quotes & Proposals' : 'Offerte Beheer'}
          </h2>
          <p className="text-xs text-dark/70 mt-1 font-body">
            {language === 'EN' ? 'Create, track and manage commercial quotes and multi-item proposals.' : 'Beheer offertes, kortingen en zet offertes direct om in facturen.'}
          </p>
        </div>

        <Button icon={Plus} onClick={handleOpenAddModal}>
          {language === 'EN' ? '+ Create New Quote' : '+ Nieuwe Offerte'}
        </Button>
      </div>

      {/* Stats Counter Widgets — Ultra Compact Sleek Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <Card noPadding className="p-2.5 sm:p-3 border-l-4 border-l-primary">
          <div className="text-[10px] font-bold text-dark/50 uppercase tracking-wider truncate">{language === 'EN' ? 'Total Quotes' : 'Totaal Offertes'}</div>
          <div className="text-lg sm:text-xl font-bold text-primary mt-0.5 font-heading">{totalCount}</div>
        </Card>
        <Card noPadding className="p-2.5 sm:p-3 border-l-4 border-l-blue-500">
          <div className="text-[10px] font-bold text-dark/50 uppercase tracking-wider truncate">{language === 'EN' ? 'Draft / Concept' : 'Concept Offertes'}</div>
          <div className="text-lg sm:text-xl font-bold text-blue-600 mt-0.5 font-heading">{conceptCount}</div>
        </Card>
        <Card noPadding className="p-2.5 sm:p-3 border-l-4 border-l-amber-500">
          <div className="text-[10px] font-bold text-dark/50 uppercase tracking-wider truncate">{language === 'EN' ? 'Sent Quotes' : 'Verzonden Offertes'}</div>
          <div className="text-lg sm:text-xl font-bold text-amber-600 mt-0.5 font-heading">{sentCount}</div>
        </Card>
        <Card noPadding className="p-2.5 sm:p-3 border-l-4 border-l-green-500">
          <div className="text-[10px] font-bold text-dark/50 uppercase tracking-wider truncate">{language === 'EN' ? 'Accepted' : 'Geaccepteerd'}</div>
          <div className="text-lg sm:text-xl font-bold text-green-600 mt-0.5 font-heading">{acceptedCount}</div>
        </Card>
      </div>

      {/* Main Content Area */}
      <Card>
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/40" />
              <input 
                type="text" 
                placeholder={language === 'EN' ? 'Search by customer, project or quote no...' : 'Zoek op klant, project of offerte nr...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-xl text-xs font-body focus:outline-none focus:ring-2 focus:ring-primary/20 text-[#4A4A43]"
              />
            </div>
            <Button 
              variant="outline" 
              icon={Filter} 
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="text-xs text-dark/75 border-[#D6CFC2]"
            >
              {language === 'EN' ? 'Filters' : 'Filters'}
            </Button>
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                icon={RotateCcw} 
                onClick={handleResetFilters}
                className="text-xs text-dark/65"
              >
                {language === 'EN' ? 'Reset' : 'Herstellen'}
              </Button>
            )}
          </div>

          {/* Collapsible Filter Panel */}
          <AnimatePresence>
            {showFilterPanel && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-[#D6CFC2]/50 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-dark/60 mb-1.5 font-body uppercase tracking-wider">{language === 'EN' ? 'Status Filter' : 'Status Filter'}</label>
                  <div className="flex flex-wrap gap-2">
                    {['All', 'Concept', 'Verzonden', 'Gecoördineerd', 'Geaccepteerd', 'Afgewezen'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium font-body border transition-all duration-200 ${
                          statusFilter === status
                            ? 'bg-primary text-cream border-primary shadow-sm'
                            : 'bg-[#EDE8DF]/30 text-dark/70 border-[#D6CFC2] hover:bg-[#EDE8DF]/60'
                        }`}
                      >
                        {status === 'All' ? (language === 'EN' ? 'All' : 'Alle') : getTranslatedStatus(status)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dark/60 mb-1.5 font-body uppercase tracking-wider">{language === 'EN' ? 'Sort By' : 'Sorteren op'}</label>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="w-full max-w-xs px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs font-body focus:outline-none focus:ring-2 focus:ring-primary/20 text-[#4A4A43]"
                  >
                    <option value="newest">{language === 'EN' ? 'Date Created (Newest)' : 'Datum Aangemaakt (Nieuwste)'}</option>
                    <option value="oldest">{language === 'EN' ? 'Date Created (Oldest)' : 'Datum Aangemaakt (Oudste)'}</option>
                    <option value="amount-desc">{language === 'EN' ? 'Amount (Highest First)' : 'Bedrag (Hoogste eerst)'}</option>
                    <option value="amount-asc">{language === 'EN' ? 'Amount (Lowest First)' : 'Bedrag (Laagste eerst)'}</option>
                    <option value="customer-asc">{language === 'EN' ? 'Customer Name (A to Z)' : 'Klantnaam (A tot Z)'}</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <Table columns={columns} data={processedQuotes} />
      </Card>

      {/* CREATE/EDIT MULTI-ITEM QUOTE BUILDER MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
              onClick={() => setModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-cream-dark/60 pb-3">
                <h3 className="text-lg font-heading font-bold text-primary">
                  {selectedQuote 
                    ? (language === 'EN' ? 'Edit Quote' : 'Offerte Bewerken') 
                    : (language === 'EN' ? 'Create New Quote' : 'Nieuwe Offerte Maken')}
                </h3>
                <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg text-dark/40 hover:bg-cream-dark/20 hover:text-dark transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Customer & Project */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-dark/60 mb-1 font-body uppercase tracking-wider">{language === 'EN' ? 'Customer' : 'Klant'}</label>
                    <select
                      value={customerSelect}
                      onChange={e => {
                        const val = e.target.value;
                        setCustomerSelect(val);
                        if (val !== 'Other') {
                          setForm(prev => ({ ...prev, customer: val }));
                        } else {
                          setForm(prev => ({ ...prev, customer: '' }));
                        }
                      }}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs font-body text-[#4A4A43] mb-2"
                    >
                      {leadsList.map((lead, idx) => (
                        <option key={idx} value={lead.name}>{lead.name} (Lead)</option>
                      ))}
                      <option value="Other">{language === 'EN' ? 'Custom Customer...' : 'Aangepaste Klant...'}</option>
                    </select>
                    {customerSelect === 'Other' && (
                      <input
                        type="text"
                        required
                        value={form.customer}
                        onChange={e => setForm(prev => ({ ...prev, customer: e.target.value }))}
                        className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs font-body text-[#4A4A43]"
                        placeholder={language === 'EN' ? 'Enter customer name...' : 'Klantnaam invullen...'}
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-dark/60 mb-1 font-body uppercase tracking-wider">{language === 'EN' ? 'Project Type' : 'Project Type'}</label>
                    <select
                      value={projectSelect}
                      onChange={e => {
                        const val = e.target.value;
                        setProjectSelect(val);
                        if (val !== 'Other') {
                          setForm(prev => ({ ...prev, project: val }));
                        } else {
                          setForm(prev => ({ ...prev, project: '' }));
                        }
                      }}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs font-body text-[#4A4A43] mb-2"
                    >
                      <option value="Exclusieve Buitenkeuken">{language === 'EN' ? 'Bespoke Outdoor Kitchen' : 'Exclusieve Buitenkeuken'}</option>
                      <option value="Exclusieve Kliko-ombouw">{language === 'EN' ? 'Premium Bin Storage' : 'Exclusieve Kliko-ombouw'}</option>
                      <option value="Houten Pergola">{language === 'EN' ? 'Wooden Pergola' : 'Houten Pergola'}</option>
                      <option value="Tuinterras">{language === 'EN' ? 'Garden Terrace' : 'Tuinterras'}</option>
                      <option value="Other">{language === 'EN' ? 'Other...' : 'Anders...'}</option>
                    </select>
                    {projectSelect === 'Other' && (
                      <input
                        type="text"
                        required
                        value={form.project}
                        onChange={e => setForm(prev => ({ ...prev, project: e.target.value }))}
                        className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs font-body text-[#4A4A43]"
                        placeholder={language === 'EN' ? 'Custom project type...' : 'Aangepast project type...'}
                      />
                    )}
                  </div>
                </div>

                {/* Status & Discount */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-dark/60 mb-1 font-body uppercase tracking-wider">{language === 'EN' ? 'Approval Status' : 'Goedkeuringsstatus'}</label>
                    <select
                      value={form.status}
                      onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs font-body text-[#4A4A43]"
                    >
                      <option value="Concept">{language === 'EN' ? 'Draft' : 'Concept'}</option>
                      <option value="Verzonden">{language === 'EN' ? 'Sent' : 'Verzonden'}</option>
                      <option value="Gecoördineerd">{language === 'EN' ? 'Coordinated' : 'Gecoördineerd'}</option>
                      <option value="Geaccepteerd">{language === 'EN' ? 'Accepted (Auto-generates Invoices & Project)' : 'Geaccepteerd (Auto-genereert Facturen & Project)'}</option>
                      <option value="Afgewezen">{language === 'EN' ? 'Rejected' : 'Afgewezen'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-dark/60 mb-1 font-body uppercase tracking-wider">{language === 'EN' ? 'Discount %' : 'Korting %'}</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={form.discountPercent}
                      onChange={e => setForm(prev => ({ ...prev, discountPercent: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs font-body text-[#4A4A43]"
                      placeholder="e.g. 5"
                    />
                  </div>
                </div>

                {/* Multi-Item Line Pricing */}
                <div className="space-y-3 pt-2 border-t border-[#D6CFC2]">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <label className="text-xs font-bold text-primary font-body uppercase tracking-wider">{language === 'EN' ? 'Quote Items' : 'Offerte Artikelen'}</label>
                    
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark transition-colors bg-white px-3 py-1.5 border border-[#D6CFC2] rounded-lg shadow-2xs cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4 text-primary" /> {language === 'EN' ? 'Add Item' : '+ Artikel Toevoegen'}
                    </button>
                  </div>

                  {form.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-[#F8F7F4] p-2.5 rounded-xl border border-[#D6CFC2]/60">
                      <div className="flex-1">
                        <input
                          type="text"
                          required
                          placeholder={language === 'EN' ? 'Item description...' : 'Omschrijving artikel...'}
                          value={item.description}
                          onChange={e => handleItemChange(idx, 'description', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#D6CFC2] rounded-lg text-xs font-body"
                        />
                      </div>
                      <div className="w-16">
                        <input
                          type="number"
                          min="1"
                          required
                          placeholder={language === 'EN' ? 'Qty' : 'Aantal'}
                          value={item.quantity}
                          onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-[#D6CFC2] rounded-lg text-xs font-body text-center"
                        />
                      </div>
                      <div className="w-28">
                        <input
                          type="number"
                          required
                          placeholder={language === 'EN' ? 'Price (€)' : 'Prijs (€)'}
                          value={item.unitPrice}
                          onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#D6CFC2] rounded-lg text-xs font-body text-right"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={form.items.length === 1}
                        className="text-red-500 hover:text-red-700 disabled:opacity-30 p-1"
                      >
                        <MinusCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Calculations Summary */}
                  <div className="p-3 bg-white/70 rounded-xl border border-[#D6CFC2]/60 text-xs space-y-1.5">
                    <div className="flex justify-between text-dark/70">
                      <span>{language === 'EN' ? 'Subtotal:' : 'Subtotaal:'}</span>
                      <span>€ {calculateSubtotal(form.items).toLocaleString()}</span>
                    </div>
                    {parseFloat(form.discountPercent) > 0 && (
                      <div className="flex justify-between text-red-600 font-semibold">
                        <span>{language === 'EN' ? `Discount (${form.discountPercent}%):` : `Korting (${form.discountPercent}%):`}</span>
                        <span>- € {(calculateSubtotal(form.items) * (parseFloat(form.discountPercent) / 100)).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-primary text-sm pt-1 border-t border-[#D6CFC2]/60">
                      <span>{language === 'EN' ? 'Total Amount (Incl. VAT):' : 'Totaalbedrag (Incl. BTW):'}</span>
                      <span>€ {calculateFinalTotal(form.items, form.discountPercent).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-cream-dark/60">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>{language === 'EN' ? 'Cancel' : 'Annuleren'}</Button>
                  <Button type="submit">{selectedQuote ? (language === 'EN' ? 'Save Changes' : 'Offerte Opslaan') : (language === 'EN' ? 'Save Quote' : 'Offerte Opslaan')}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULL 6-PAGE DUTCH BRANDED PDF PROPOSAL PREVIEW MODAL */}
      <AnimatePresence>
        {pdfPreviewQuote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-dark/75 backdrop-blur-xs" 
              onClick={() => setPdfPreviewQuote(null)} 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="relative w-full max-w-3xl bg-white border border-[#D6CFC2] rounded-2xl p-4 sm:p-6 shadow-2xl z-10 space-y-6 max-h-[92vh] overflow-y-auto"
            >
              {/* Modal Top Control Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#D6CFC2] pb-3 print:hidden">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-heading font-bold text-base sm:text-lg text-primary truncate">
                      {language === 'EN' ? `Official 6-Page Proposal PDF (${pdfPreviewQuote.id})` : `Officiële 6-Pagina Offerte PDF (${pdfPreviewQuote.id})`}
                    </h3>
                    <p className="text-[11px] text-dark/50 font-body">Vanuit Ambacht • Custom Outdoor Craftsmen</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                  <Button 
                    size="sm" 
                    icon={Download} 
                    onClick={() => {
                      const downloadedName = downloadQuotePdf(pdfPreviewQuote);
                      showToast(language === 'EN' ? `✓ Downloaded ${downloadedName}!` : `✓ ${downloadedName} gedownload!`);
                    }} 
                    className="text-xs font-bold bg-[#D97706] hover:bg-[#B45309] text-white shadow-sm cursor-pointer"
                  >
                    {language === 'EN' ? 'Download PDF File' : 'Download PDF Bestand'}
                  </Button>
                  <Button size="sm" icon={Printer} onClick={() => window.print()} className="text-xs bg-[#EDE8DF] text-dark hover:bg-[#D6CFC2]">
                    {language === 'EN' ? 'Print' : 'Afdrukken'}
                  </Button>
                  <button onClick={() => setPdfPreviewQuote(null)} className="p-1.5 text-dark/40 hover:text-dark rounded-lg hover:bg-dark/5 transition-colors cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* 6-PAGE DOCUMENT CONTAINER */}
              <div className="bg-[#EBE6DD] p-3 sm:p-6 rounded-2xl border border-[#C4BEB3]">
                <Offerte6PagePDF quote={pdfPreviewQuote} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 100% CLEAN PDF PRINT PORTAL ATTACHED DIRECTLY TO DOCUMENT BODY */}
      {pdfPreviewQuote && !selectedQuote && createPortal(
        <div id="printable-offerte-portal">
          <Offerte6PagePDF quote={pdfPreviewQuote} />
        </div>,
        document.body
      )}
    </div>
  );
}
