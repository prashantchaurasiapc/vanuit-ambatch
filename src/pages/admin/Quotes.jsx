import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import api from '../../api/apiClient';
import { useLanguage } from '../../context/LanguageContext';
import { downloadQuotePdf, downloadDirectPdfFile } from '../../utils/pdfGenerator';
import BookkeepingHeader from '../../components/admin/BookkeepingHeader';


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
  { id: 'p1', description: 'Thermo Fraké Outdoor Kitchen Cabinet (240x80cm)', unitPrice: 2450 },
  { id: 'p2', description: 'Solid Teak Wood Outdoor Kitchen Cabinet (300x90cm)', unitPrice: 3200 },
  { id: 'p3', description: 'Big Green Egg Large Cutout & Base Support', unitPrice: 450 },
  { id: 'p4', description: 'Black Polished Concrete Cire Countertop (8cm)', unitPrice: 850 },
  { id: 'p5', description: 'Stainless Steel Built-in Outdoor Fridge Premium 80L', unitPrice: 890 },
  { id: 'p6', description: 'Stainless Steel Sink & Mixer Tap Built-in Set', unitPrice: 390 },
  { id: 'p7', description: 'Heavy Duty Terrace Caster Wheels Set (4x)', unitPrice: 190 },
  { id: 'p8', description: 'Delivery & Professional On-site Placement', unitPrice: 0 }
];

// Helper to map backend QuoteDto into table row representation
const mapBackendQuoteToRow = (q) => {
  const activeVer = q.activeVersion;
  const totalAmount = activeVer?.totalInclVat != null ? Number(activeVer.totalInclVat) : 0;
  const formattedAmt = `€ ${Math.round(totalAmount).toLocaleString('nl-NL')}`;

  let displayStatus = 'Concept';
  if (q.status === 'sent') displayStatus = 'Verzonden';
  else if (q.status === 'approved') displayStatus = 'Geaccepteerd';
  else if (q.status === 'declined') displayStatus = 'Afgewezen';
  else if (q.status === 'expired') displayStatus = 'Verlopen';
  else if (q.status === 'draft') displayStatus = 'Concept';

  const customerInfo = activeVer?.optionsConfig?.customerInfo;
  const custName = q.customerName || customerInfo?.name || (q.customer ? `${q.customer.firstName || ''} ${q.customer.lastName || ''}`.trim() : 'Onbekend');
  const custEmail = q.customerEmail || customerInfo?.email || '';
  const custCity = q.customerCity || customerInfo?.city || '';
  const custPhone = q.customerPhone || customerInfo?.phone || '';
  const custAddress = q.customerAddress || customerInfo?.address || '';
  const projectName = activeVer?.coverTitleLine1 || (q.productType ? q.productType.replace(/_/g, ' ') : 'Maatwerk Keuken');

  return {
    id: q.quoteNumber || q.id,
    backendId: q.id,
    quoteNumber: q.quoteNumber,
    publicToken: q.publicToken,
    publicUrl: q.publicUrl,
    customer: custName,
    customerEmail: custEmail,
    customerCity: custCity,
    customerPhone: custPhone,
    customerAddress: custAddress,
    project: projectName,
    amount: formattedAmt,
    numericAmount: totalAmount,
    status: displayStatus,
    rawStatus: q.status,
    date: q.issueDate || (q.createdAt ? q.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
    validUntil: q.validUntil,
    discountPercent: 0,
    productType: q.productType,
    items: activeVer?.items?.map(it => ({
      description: it.title,
      quantity: it.quantity,
      unitPrice: it.priceInclVat || it.unitPriceInclVat || 0,
      vatRate: it.vatRate || 21,
    })) || [],
    activeVersion: activeVer,
    rawQuote: q,
  };
};

export default function Quotes() {
  const { t, language } = useLanguage();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter States
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const [modalOpen, setModalOpen] = useState(false);
  const [pdfPreviewQuote, setPdfPreviewQuote] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null); // null = adding, object = editing
  const [toastMsg, setToastMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [leadsList, setLeadsList] = useState([]);
  const [customersList, setCustomersList] = useState([]);
  const [backendCounters, setBackendCounters] = useState(null);

  // Multi-item Form State
  const [form, setForm] = useState({
    customer: '',
    project: '',
    discountPercent: 0,
    status: 'Draft',
    items: [
      { description: 'Outdoor Kitchen Frame (Teak Wood)', quantity: 1, unitPrice: 8500 },
      { description: 'Concrete Countertop & Installation', quantity: 1, unitPrice: 2800 }
    ]
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Load quotes, leads and customers from real backend APIs
  const fetchQuotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const [quotesRes, leadsRes, customersRes] = await Promise.all([
        api.get('/quotes?limit=100'),
        api.get('/leads?limit=100'),
        api.get('/customers?limit=100'),
      ]);

      let backendRows = [];
      if (quotesRes.success && quotesRes.data) {
        backendRows = (quotesRes.data.items || []).map(mapBackendQuoteToRow);
        if (quotesRes.data.counters) {
          setBackendCounters(quotesRes.data.counters);
        }
      }

      // Authoritative database rows directly from PostgreSQL
      setQuotes(backendRows);

      // Clean up legacy localStorage array so it never conflicts with real DB
      try {
        localStorage.removeItem('app_quotes_v2');
      } catch (e) {}

      if (!quotesRes.success && backendRows.length === 0) {
        setError(quotesRes.error?.message || 'Failed to load quotes from server');
      }

      if (leadsRes.success && leadsRes.data) {
        setLeadsList(leadsRes.data.items || leadsRes.data || []);
      }
      if (customersRes.success && customersRes.data) {
        setCustomersList(customersRes.data.items || customersRes.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch quotes from backend:', err);
      setError(err.message || 'Network error fetching quotes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
    window.addEventListener('app_data_changed', fetchQuotes);
    return () => window.removeEventListener('app_data_changed', fetchQuotes);
  }, []);

  const [customerSelect, setCustomerSelect] = useState('Other');
  const [projectSelect, setProjectSelect] = useState('Exclusieve Buitenkeuken');

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeEditorStep, setActiveEditorStep] = useState(1);
  const [activeEditorQuote, setActiveEditorQuote] = useState(null);

  // Auto-restore editor on page load / browser refresh (F5)
  useEffect(() => {
    const urlQuoteId = searchParams.get('quoteId') || searchParams.get('edit');
    const urlStep = parseInt(searchParams.get('step') || '1', 10);

    if (urlQuoteId) {
      if (urlQuoteId === 'new') {
        const localNewDraft = JSON.parse(localStorage.getItem('quote_editor_draft_new') || 'null');
        const defaultLead = leadsList[0] || null;
        const newModel = localNewDraft || createDefaultQuote(defaultLead, {
          id: `OF-${new Date().getFullYear()}-032`,
          backendId: null,
          status: 'Concept'
        });
        setActiveEditorStep(urlStep);
        setActiveEditorQuote(newModel);
      } else if (!activeEditorQuote || (activeEditorQuote.backendId !== urlQuoteId && activeEditorQuote.id !== urlQuoteId)) {
        handleOpenEditModal({ backendId: urlQuoteId, id: urlQuoteId }, urlStep);
      }
    } else {
      // User navigated to Quotes list overview (/admin/quotes without quoteId)
      // ALWAYS display the Quotes table overview and do NOT auto-redirect to an old session
      if (activeEditorQuote) {
        setActiveEditorQuote(null);
      }
      localStorage.removeItem('vanuit_active_quote_session');
    }
  }, [searchParams, leadsList]);

  // Handle autosave or manual save of 6-step proposal draft to backend
  const handleSaveEditorQuote = async (updatedQuote, showToastFlag = false) => {
    let targetId = updatedQuote.backendId;

    // Create quote on the backend on first save if not yet created
    if (!targetId) {
      try {
        const pType = (updatedQuote.productType || 'outdoor_kitchen').toLowerCase().includes('garden')
          ? 'garden_room'
          : 'outdoor_kitchen';

        let leadIdToUse = undefined;
        if (updatedQuote.customer?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(updatedQuote.customer.id))) {
          leadIdToUse = updatedQuote.customer.id;
        } else if (updatedQuote.customer?.name && updatedQuote.customer.name.trim()) {
          try {
            const leadRes = await api.post('/leads', {
              name: updatedQuote.customer.name.trim(),
              email: updatedQuote.customer.email?.trim() || undefined,
              phone: updatedQuote.customer.phone?.trim() || undefined,
              city: updatedQuote.customer.city?.trim() || undefined,
              address: updatedQuote.customer.address?.trim() || undefined,
              productType: pType,
            });
            if (leadRes.success && leadRes.data) {
              leadIdToUse = leadRes.data.id;
              updatedQuote.customer = { ...updatedQuote.customer, id: leadIdToUse };
            }
          } catch (e) {
            console.warn('Auto-create lead failed:', e);
          }
        }

        const createRes = await api.post('/quotes', {
          leadId: leadIdToUse,
          productType: pType
        });
        if (createRes.success && createRes.data) {
          targetId = createRes.data.id;
          updatedQuote.backendId = createRes.data.id;
          updatedQuote.publicToken = createRes.data.publicToken;
          updatedQuote.id = createRes.data.quoteNumber || updatedQuote.id;

          try {
            localStorage.removeItem('quote_editor_draft_new');
            localStorage.removeItem(`quote_editor_draft_${targetId}`);
            localStorage.removeItem('vanuit_active_quote_session');
          } catch (e) {}
          setSearchParams({ quoteId: targetId, step: String(activeEditorStep) });

          setActiveEditorQuote({ ...updatedQuote });
          fetchQuotes();
        }
      } catch (err) {
        console.error('Error creating backend quote on first save:', err);
      }
    }

    targetId = targetId || updatedQuote.id;
    if (!targetId) return;

    // Also update lead record if customer details were modified
    if (updatedQuote.customer && typeof updatedQuote.customer === 'object') {
      const cust = updatedQuote.customer;
      if (cust.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(cust.id))) {
        api.patch(`/leads/${cust.id}`, {
          name: cust.name,
          email: cust.email,
          phone: cust.phone,
          city: cust.city,
          address: cust.address,
        }).catch(() => {});
      } else if (cust.name && cust.name.trim()) {
        api.post('/leads', {
          name: cust.name.trim(),
          email: cust.email?.trim() || undefined,
          phone: cust.phone?.trim() || undefined,
          city: cust.city?.trim() || undefined,
          address: cust.address?.trim() || undefined,
          productType: (updatedQuote.productType || 'outdoor_kitchen').toLowerCase().includes('garden') ? 'garden_room' : 'outdoor_kitchen',
        }).then(res => {
          if (res.success && res.data) {
            api.patch(`/quotes/${targetId}`, { leadId: res.data.id }).catch(() => {});
          }
        }).catch(() => {});
      }
    }

    try {
      const lineItems = (updatedQuote.investment?.lineItems || []).map((it, idx) => ({
        position: idx + 1,
        title: it.title || 'Onderdeel',
        description: it.description || '',
        quantity: Number(it.quantity) || 1,
        priceInclVat: Number(it.priceInclVat) || 0,
        vatRate: Number(it.vatRate) || 21,
        isIncluded: Boolean(it.isIncluded),
        isStelpost: Boolean(it.isStelpost),
      }));

      const draftPayload = {
        coverTitleLine1: updatedQuote.cover?.titleLine1,
        coverTitleLine2: updatedQuote.cover?.titleLine2,
        customSubtitle: updatedQuote.cover?.customSubtitle,
        coverPhotos: updatedQuote.cover?.photos,
        dimensionsText: updatedQuote.configuration?.dimensions,
        woodType: updatedQuote.configuration?.woodType,
        woodLifespan: updatedQuote.configuration?.woodLifespan,
        optionsTitle: updatedQuote.configuration?.optionsTitle,
        optionsSubtext: updatedQuote.configuration?.optionsSubtext,
        deliveryTimeText: updatedQuote.configuration?.deliveryTime,
        deliverySubtext: updatedQuote.configuration?.deliverySubtext,
        costPrice: updatedQuote.investment?.costPrice ? Number(updatedQuote.investment.costPrice) : undefined,
        marginPercent: updatedQuote.investment?.marginPercent ? Number(updatedQuote.investment.marginPercent) : undefined,
        marginAmount: updatedQuote.investment?.marginAmount ? Number(updatedQuote.investment.marginAmount) : undefined,
        finishTreatment: updatedQuote.investment?.finishTreatment,
        lineItems,
        instalmentsConfig: (() => {
          const inst = updatedQuote.investment?.instalments;
          if (!inst) return undefined;
          if (Array.isArray(inst)) {
            return {
              count: inst.length,
              percentages: inst.map(i => Number(i.percentage) || 50),
              labels: inst.map(i => i.label || 'Termijn'),
              subtexts: inst.map(i => i.subtext || ''),
            };
          }
          if (typeof inst === 'object') {
            return {
              count: Number(inst.count) || (Array.isArray(inst.percentages) ? inst.percentages.length : 2),
              percentages: Array.isArray(inst.percentages) ? inst.percentages.map(Number) : [50, 50],
              labels: Array.isArray(inst.labels) ? inst.labels.map(String) : ['Bij akkoord', 'Bij levering'],
              subtexts: Array.isArray(inst.subtexts) ? inst.subtexts.map(String) : [],
            };
          }
          return undefined;
        })(),
        diagramConfig: updatedQuote.configuration?.diagram ? {
          show: Boolean(updatedQuote.configuration.diagram.show ?? true),
          totalWidth: Number(updatedQuote.configuration.diagram.totalWidth) || 240,
          segments: (updatedQuote.configuration.diagram.segments || []).map(s => ({
            id: String(s.id || Math.random()),
            type: String(s.type || 'CABINET'),
            label: String(s.label || 'kastje'),
            width: Number(s.width) || 60,
          })),
        } : undefined,
        specificationsOverview: Array.isArray(updatedQuote.configuration?.specifications) ? updatedQuote.configuration.specifications.map(sec => ({
          id: String(sec.id || Math.random()),
          title: String(sec.title || 'SPECIFICATIES'),
          lines: (sec.lines || []).map(l => ({
            id: String(l.id || Math.random()),
            text: String(l.text || ''),
            isOption: Boolean(l.isOption),
          })),
        })) : undefined,
        letterConfig: updatedQuote.letterAndProcess ? {
          salutation: updatedQuote.letterAndProcess.salutation ? String(updatedQuote.letterAndProcess.salutation).trim() : undefined,
          letterParagraphs: Array.isArray(updatedQuote.letterAndProcess.letterParagraphs)
            ? updatedQuote.letterAndProcess.letterParagraphs.map(p => String(p || '').trim()).filter(Boolean)
            : undefined,
          signoffName: updatedQuote.letterAndProcess.signoffName ? String(updatedQuote.letterAndProcess.signoffName).trim() : undefined,
          signoffRole: updatedQuote.letterAndProcess.signoffRole ? String(updatedQuote.letterAndProcess.signoffRole).trim() : undefined,
          uspCards: Array.isArray(updatedQuote.letterAndProcess.uspCards)
            ? updatedQuote.letterAndProcess.uspCards.map((c, i) => ({
                id: Number(c.id) || i + 1,
                title: String(c.title || `USP ${i + 1}`).trim(),
                desc: String(c.desc || c.description || '').trim(),
              }))
            : undefined,
          processSteps: Array.isArray(updatedQuote.letterAndProcess.processSteps)
            ? updatedQuote.letterAndProcess.processSteps.map((st, i) => ({
                step: String(st.step || st.stepNumber || i + 1),
                title: String(st.title || `Stap ${i + 1}`).trim(),
                desc: String(st.desc || st.description || (
                  i === 0 ? 'Bevestig eenvoudig per mail of WhatsApp, of onderteken de akkoordpagina. Vanaf dat moment nemen wij alles uit handen.' :
                  i === 1 ? 'Je ontvangt het definitieve ontwerp met technische tekening ter bevestiging. Zo weet je precies wat er gebouwd wordt vóór de bouw start.' :
                  i === 2 ? 'Jouw buitenverblijf of buitenkeuken wordt op locatie gebouwd door een gecertificeerde vakspecialist.' :
                  i === 3 ? 'We leveren en monteren op locatie op een moment dat jou uitkomt.' :
                  'We leveren pas op als alles naar wens is. Blijvende garantie en nazorg.'
                )).trim(),
                badge: String(st.badge || st.badgeText || '').trim(),
              }))
            : undefined,
          approvalTitle: updatedQuote.letterAndProcess.approvalTitle ? String(updatedQuote.letterAndProcess.approvalTitle).trim() : undefined,
          approvalSubheading: updatedQuote.letterAndProcess.approvalSubheading ? String(updatedQuote.letterAndProcess.approvalSubheading).trim() : undefined,
          approvalText: updatedQuote.letterAndProcess.approvalText ? String(updatedQuote.letterAndProcess.approvalText).trim() : undefined,
          closingQuote: updatedQuote.letterAndProcess.closingQuote ? String(updatedQuote.letterAndProcess.closingQuote).trim() : undefined,
          closingAuthor: updatedQuote.letterAndProcess.closingAuthor ? String(updatedQuote.letterAndProcess.closingAuthor).trim() : undefined,
        } : undefined,
        optionsConfig: {
          ...(updatedQuote.configuration?.options || {}),
          customerInfo: typeof updatedQuote.customer === 'object' ? updatedQuote.customer : { name: updatedQuote.customer }
        },
      };

      const res = await api.put(`/quotes/${targetId}/versions/draft`, draftPayload);
      if (res.success) {
        try {
          localStorage.removeItem(`quote_editor_draft_${targetId}`);
        } catch (e) {}
        setActiveEditorQuote({ ...updatedQuote });
        if (showToastFlag) {
          showToast(language === 'EN' ? `Quote ${updatedQuote.id} saved to database!` : `Offerte ${updatedQuote.id} succesvol opgeslagen in database!`);
        }
        window.dispatchEvent(new Event('app_data_changed'));
      } else if (showToastFlag) {
        showToast(res.error?.message || 'Error saving draft');
      }
      return res;
    } catch (err) {
      console.error('Error saving quote draft:', err);
      if (showToastFlag) {
        showToast(err.message || 'Error saving draft');
      }
      return { success: false, error: err };
    }
  };

  // Handle publishing official quote
  const handlePublishEditorQuote = async (quoteToPublish) => {
    const targetId = quoteToPublish.backendId || quoteToPublish.id;
    if (!targetId) return;

    try {
      await handleSaveEditorQuote(quoteToPublish, false);
      const res = await api.post(`/quotes/${targetId}/publish`, { sendEmail: false });
      if (res.success && res.data) {
        showToast(language === 'EN' ? `Quote ${res.data.quoteNumber} published & sent!` : `Offerte ${res.data.quoteNumber} gepubliceerd & verzonden!`);
        await fetchQuotes();
      } else {
        showToast(res.error?.message || 'Failed to publish quote');
      }
    } catch (err) {
      showToast(err.message || 'Error publishing quote');
    }
  };

  // Handle duplicating quote via backend
  const handleDuplicateEditorQuote = async (quoteToDup) => {
    const targetId = quoteToDup.backendId || quoteToDup.id;
    if (!targetId) return;

    try {
      const res = await api.post(`/quotes/${targetId}/duplicate`);
      if (res.success && res.data) {
        showToast(language === 'EN' ? `Quote duplicated as ${res.data.quoteNumber} (Concept)!` : `Offerte gekopieerd als ${res.data.quoteNumber} (Concept)!`);
        await fetchQuotes();
        setActiveEditorQuote(null);
      } else {
        showToast(res.error?.message || 'Failed to duplicate quote');
      }
    } catch (err) {
      showToast(err.message || 'Error duplicating quote');
    }
  };

  const handleOpenAddModal = () => {
    const defaultLead = leadsList[0] || null;
    const newQuoteModel = createDefaultQuote(defaultLead, {
      id: `OF-${new Date().getFullYear()}-${String(quotes.length + 1).padStart(3, '0')}`,
      backendId: null,
      customer: defaultLead ? { id: defaultLead.id, name: defaultLead.name, email: defaultLead.email, phone: defaultLead.phone, city: defaultLead.city } : { name: '', email: '', phone: '', city: '', address: '' },
      productType: 'outdoor_kitchen',
      status: 'Concept'
    });
    setSearchParams({ quoteId: 'new', step: '1' });
    localStorage.setItem('vanuit_active_quote_session', JSON.stringify({ quoteId: 'new', step: 1 }));
    localStorage.setItem('quote_editor_draft_new', JSON.stringify(newQuoteModel));
    setActiveEditorStep(1);
    setActiveEditorQuote(newQuoteModel);
  };

  const handleOpenEditModal = async (quoteRow, targetStep = 1) => {
    const targetId = quoteRow.backendId || quoteRow.id;
    const initialStep = targetStep || parseInt(searchParams.get('step') || '1', 10) || 1;
    setActiveEditorStep(initialStep);
    setSearchParams({ quoteId: targetId, step: String(initialStep) });

    try {
      const res = await api.get(`/quotes/${targetId}`);
      if (res.success && res.data) {
        const qData = res.data;
        const ver = qData.activeVersion;
        const customerInfo = ver?.optionsConfig?.customerInfo;
        const fullQuoteModel = createDefaultQuote(null, {
          ...qData,
          id: qData.quoteNumber,
          backendId: qData.id,
          publicToken: qData.publicToken,
          customer: {
            id: qData.leadId || customerInfo?.id,
            name: customerInfo?.name || qData.customerName || (typeof quoteRow.customer === 'object' ? quoteRow.customer?.name : quoteRow.customer) || '',
            email: customerInfo?.email || qData.customerEmail || '',
            phone: customerInfo?.phone || qData.customerPhone || '',
            city: customerInfo?.city || qData.customerCity || '',
            address: customerInfo?.address || qData.customerAddress || '',
          },
          status: qData.status === 'draft' ? 'Concept' : qData.status === 'sent' ? 'Verzonden' : qData.status === 'approved' ? 'Geaccepteerd' : qData.status,
          date: qData.issueDate,
          validUntil: qData.validUntil,
          cover: ver ? {
            titleLine1: ver.coverTitleLine1 || 'EEN BUITENKEUKEN OP MAAT',
            titleLine2: ver.coverTitleLine2 || '',
            customSubtitle: ver.customSubtitle || '',
            photos: ver.coverPhotos || ['/cover_img1.png', '/cover_img2.png', '/cover_img3.png']
          } : undefined,
          configuration: ver ? {
            dimensions: ver.dimensionsText || '240 × 80',
            woodType: ver.woodType || 'Thermo Fraké',
            woodLifespan: ver.woodLifespan || '20 tot 25 jaar',
            optionsTitle: ver.optionsTitle || 'Kamado / BBQ integratie',
            optionsSubtext: ver.optionsSubtext || 'Rechts van het midden',
            deliveryTime: ver.deliveryTimeText || '3 tot 5 weken',
            deliverySubtext: ver.deliverySubtext || 'na technisch akkoord',
            specifications: ver.specificationsOverview || [],
            diagram: ver.diagramConfig || { show: true, totalWidth: 240, segments: [] },
            options: ver.optionsConfig || {}
          } : undefined,
          investment: ver ? {
            costPrice: ver.costPrice,
            marginPercent: ver.marginPercent,
            marginAmount: ver.marginAmount,
            lineItems: [...(ver.items || [])]
              .sort((a, b) => (Number(a.position) || 0) - (Number(b.position) || 0))
              .map((it, idx) => ({
                id: it.id || `item-${idx + 1}`,
                position: it.position ?? idx + 1,
                title: it.title,
                description: it.description || '',
                quantity: it.quantity,
                priceInclVat: it.priceInclVat ?? it.unitPriceInclVat ?? 0,
                vatRate: it.vatRate || 21,
                isIncluded: it.isIncluded,
                isStelpost: it.isStelpost,
              })),
            finishTreatment: ver.finishTreatment,
            instalmentsConfig: ver.instalmentsConfig,
          } : undefined,
          letterAndProcess: ver?.letterConfig || undefined,
        });
        fullQuoteModel.backendId = qData.id;
        fullQuoteModel.publicToken = qData.publicToken;
        setActiveEditorQuote(fullQuoteModel);
      } else {
        const fallback = createDefaultQuote(null, quoteRow);
        fallback.backendId = targetId;
        setActiveEditorQuote(fallback);
      }
    } catch (err) {
      console.warn('Load quote from backend error, using default quote model:', err);
      const fallback = createDefaultQuote(null, quoteRow);
      fallback.backendId = targetId;
      setActiveEditorQuote(fallback);
    }
  };

  const handleDeleteQuote = async (id, customer, backendId) => {
    const targetId = backendId || id;
    const confirmText = language === 'EN'
      ? `Are you sure you want to delete quote "${id}" for "${customer}"?`
      : `Weet je zeker dat je offerte "${id}" voor "${customer}" wilt verwijderen?`;
    if (!window.confirm(confirmText)) return;

    try {
      const res = await api.delete(`/quotes/${targetId}`);
      if (res.success) {
        showToast(language === 'EN' ? `Quote "${id}" deleted successfully!` : `Offerte "${id}" succesvol verwijderd!`);
        await fetchQuotes();
      } else {
        showToast(res.error?.message || 'Failed to delete quote');
      }
    } catch (err) {
      showToast(err.message || 'Error deleting quote');
    }
  };

  // Module 3.3 Sub-Item 1: Duplicate Quotation Handler
  const handleDuplicateQuote = async (row) => {
    const targetId = row.backendId || row.id;
    try {
      const res = await api.post(`/quotes/${targetId}/duplicate`);
      if (res.success && res.data) {
        showToast(language === 'EN' ? `Quote duplicated as ${res.data.quoteNumber} (Concept)!` : `Offerte gekopieerd als ${res.data.quoteNumber} (Concept)!`);
        await fetchQuotes();
      } else {
        showToast(res.error?.message || 'Failed to duplicate quote');
      }
    } catch (err) {
      showToast(err.message || 'Error duplicating quote');
    }
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

  const calculateSubtotal = (items) => {
    return items.reduce((acc, item) => acc + (parseFloat(item.quantity || 0) * parseFloat(item.unitPrice || 0)), 0);
  };

  const calculateFinalTotal = (items, discountPercent) => {
    const subtotal = calculateSubtotal(items);
    const discountAmount = subtotal * ((parseFloat(discountPercent) || 0) / 100);
    return subtotal - discountAmount;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const finalCustomer = customerSelect === 'Other' ? form.customer : customerSelect;
    const finalProject = projectSelect === 'Other' ? form.project : projectSelect;

    if (!finalCustomer.trim() || !finalProject.trim()) {
      showToast("Please provide valid Customer and Project details.");
      return;
    }

    setIsSaving(true);
    try {
      if (selectedQuote) {
        // Editing Mode
        const targetId = selectedQuote.backendId || selectedQuote.id;
        const draftPayload = {
          coverTitleLine1: finalProject,
          lineItems: form.items.map((it, idx) => ({
            position: idx + 1,
            title: it.description || 'Onderdeel',
            quantity: Number(it.quantity) || 1,
            priceInclVat: Number(it.unitPrice) || 0,
            vatRate: 21,
            isIncluded: false,
            isStelpost: false,
          })),
        };
        await api.put(`/quotes/${targetId}/versions/draft`, draftPayload);
        if (form.status === 'Geaccepteerd' || form.status === 'Accepted') {
          await api.post(`/quotes/${targetId}/accept-and-convert`, { note: 'Direct acceptance via modal' });
        }
        showToast(`Quote "${selectedQuote.id}" updated successfully!`);
      } else {
        // Adding Mode
        const matchedLead = leadsList.find(l => l.name === finalCustomer);
        const matchedCust = customersList.find(c => `${c.firstName || ''} ${c.lastName || ''}`.trim() === finalCustomer || c.companyName === finalCustomer);

        const createRes = await api.post('/quotes', {
          leadId: matchedLead?.id,
          customerId: matchedCust?.id,
          productType: 'outdoor_kitchen',
        });

        if (createRes.success && createRes.data) {
          const newQ = createRes.data;
          const draftPayload = {
            coverTitleLine1: finalProject,
            lineItems: form.items.map((it, idx) => ({
              position: idx + 1,
              title: it.description || 'Onderdeel',
              quantity: Number(it.quantity) || 1,
              priceInclVat: Number(it.unitPrice) || 0,
              vatRate: 21,
              isIncluded: false,
              isStelpost: false,
            })),
          };
          await api.put(`/quotes/${newQ.id}/versions/draft`, draftPayload);
          if (form.status === 'Geaccepteerd' || form.status === 'Accepted') {
            await api.post(`/quotes/${newQ.id}/accept-and-convert`, { note: 'Direct acceptance via modal' });
          }
          showToast(language === 'EN' ? `Quote "${newQ.quoteNumber}" created successfully!` : `Offerte "${newQ.quoteNumber}" succesvol aangemaakt!`);
        } else {
          showToast(createRes.error?.message || 'Failed to create quote');
        }
      }
      await fetchQuotes();
      setModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Error saving quote');
    } finally {
      setIsSaving(false);
    }
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
    if (!st) return st;
    if (language === 'NL') {
      switch (st) {
        case 'Draft': return 'Concept';
        case 'Sent': return 'Verzonden';
        case 'Coordinated': return 'Gecoördineerd';
        case 'Accepted': return 'Geaccepteerd';
        case 'Rejected': return 'Afgewezen';
        default: return st;
      }
    } else {
      switch (st) {
        case 'Concept': case 'Draft': return 'Draft';
        case 'Verzonden': case 'Sent': return 'Sent';
        case 'Gecoördineerd': case 'Coordinated': return 'Coordinated';
        case 'Geaccepteerd': case 'Accepted': return 'Accepted';
        case 'Afgewezen': case 'Rejected': return 'Rejected';
        default: return st;
      }
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

  const handleConvertToProject = async (quote) => {
    const targetId = quote.backendId || quote.id;
    try {
      const res = await api.post(`/quotes/${targetId}/accept-and-convert`, {
        note: `Approved via Quotes Admin UI by ${quote.customer}`
      });
      if (res.success) {
        showToast(language === 'EN' ? `Quote converted to Project for ${getCustomerName(quote.customer)}!` : `Offerte omgezet naar Project voor ${getCustomerName(quote.customer)}!`);
        await fetchQuotes();
      } else {
        showToast(res.error?.message || 'Failed to convert quote to project');
      }
    } catch (err) {
      showToast(err.message || 'Error converting quote');
    }
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
              const shareToken = row.publicToken || row.quoteNumber || row.id;
              const publicUrl = `${window.location.origin}/offerte/${shareToken}`;
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
            href={`/offerte/${row.publicToken || row.quoteNumber || row.id}`}
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
            onClick={() => handleDeleteQuote(row.id, getCustomerName(row.customer), row.backendId)}
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
        initialStep={activeEditorStep}
        onStepChange={(newStep) => {
          setActiveEditorStep(newStep);
          const currentId = activeEditorQuote.backendId || activeEditorQuote.id || 'new';
          setSearchParams({ quoteId: currentId, step: String(newStep) });
          localStorage.setItem('vanuit_active_quote_session', JSON.stringify({ quoteId: currentId, step: newStep }));
        }}
        leadsList={leadsList}
        onClose={() => {
          setSearchParams({});
          localStorage.removeItem('vanuit_active_quote_session');
          setActiveEditorQuote(null);
          fetchQuotes();
        }}
        onSaveQuote={(updated, showToastFlag) => handleSaveEditorQuote(updated, showToastFlag)}
        onPublishQuote={(quote) => handlePublishEditorQuote(quote)}
        onDuplicateQuote={(quote) => handleDuplicateEditorQuote(quote)}
      />
    );
  }

  return (
    <div className="space-y-6 font-body">
      {/* BOOKKEEPING HEADER NAVIGATION */}
      <BookkeepingHeader activeTab="quotes" />

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
          {language === 'EN' ? 'Create New Quote' : 'Nieuwe Offerte'}
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
                  <label className="block text-xs font-semibold text-dark/60 mb-1.5 font-body uppercase tracking-wider">{language === 'EN' ? 'Sort By' : 'Sorteren Op'}</label>
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

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center justify-between font-body">
            <span>⚠️ {error}</span>
            <button onClick={fetchQuotes} className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 cursor-pointer">
              {language === 'EN' ? 'Retry' : 'Opnieuw proberen'}
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center space-y-3 font-body">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-semibold text-primary">
              {language === 'EN' ? 'Loading quotes...' : 'Offertes laden...'}
            </p>
          </div>
        ) : (
          <Table columns={columns} data={processedQuotes} />
        )}
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
                      <option value="Buitenverblijf / Garden Room">{language === 'EN' ? 'Garden Room / Luxury Canopy' : 'Buitenverblijf / Garden Room'}</option>
                      <option value="Luxe Veranda">{language === 'EN' ? 'Luxury Veranda' : 'Luxe Veranda'}</option>
                      <option value="Poolhouse">{language === 'EN' ? 'Poolhouse' : 'Poolhouse'}</option>
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
                      const downloadedName = downloadQuotePdf({ ...pdfPreviewQuote, language });
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
                <Offerte6PagePDF quote={pdfPreviewQuote} language={language} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 100% CLEAN PDF PRINT PORTAL ATTACHED DIRECTLY TO DOCUMENT BODY */}
      {pdfPreviewQuote && !selectedQuote && createPortal(
        <div id="printable-offerte-portal">
          <Offerte6PagePDF quote={pdfPreviewQuote} language={language} />
        </div>,
        document.body
      )}
    </div>
  );
}
