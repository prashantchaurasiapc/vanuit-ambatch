import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import {
  FileText, Send, Calendar, Banknote, Clock, CheckCircle2, ChevronDown,
  ChevronUp, MessageSquare, AlertCircle, Inbox, Loader2, RotateCcw,
  XCircle, Download, Paperclip
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/apiClient';

export default function PartnerPriceRequests() {
  const { language } = useLanguage();
  const [expanded, setExpanded] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState([]);
  const [open, setOpen] = useState([]);
  const [toastMsg, setToastMsg] = useState('');
  const [activeTab, setActiveTab] = useState('open');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic breakdown schema configured in admin settings (UI layout preference)
  const [partnerBreakdownSchema, setPartnerBreakdownSchema] = useState([
    {
      id: 'sec-materials',
      title: 'Material Cost (Timber & Raw Materials)',
      icon: '🪵',
      fields: [
        { id: 'f-mat-1', label: 'Timber & Raw Materials Cost (€)', required: true },
        { id: 'f-mat-2', label: 'Countertop & Finishing (€)', required: true }
      ]
    },
      {
        id: 'sec-labor',
        title: 'Labour Cost (Craftsmanship & Assembly)',
        icon: '🔨',
        fields: [
          { id: 'f-lab-1', label: 'Workshop Fabrication & Hours (€)', required: true }
        ]
      },
      {
        id: 'sec-transport',
        title: 'Transport Cost (Delivery & Freight)',
        icon: '🚚',
        fields: [
          { id: 'f-tra-1', label: 'Freight & Delivery Cost (€)', required: true }
        ]
      },
      {
        id: 'sec-installation',
        title: 'Installation Cost (Montage & Plaatsing)',
        icon: '🏗️',
        fields: [
          { id: 'f-ins-1', label: 'Montage op Locatie (€)', required: true }
        ]
      },
      {
        id: 'sec-other',
        title: 'Other Cost (Overige Kosten & Vergunning)',
        icon: '💼',
        fields: [
          { id: 'f-oth-1', label: 'Overige Werkzaamheden (€)', required: false }
        ]
      }
    ]);

  // Load dynamic breakdown schema from Platform Settings
  const loadBreakdownConfig = useCallback(async () => {
    try {
      const res = await api.get('/settings/company');
      if (res.success && res.data?.partnerBreakdownConfig && Array.isArray(res.data.partnerBreakdownConfig) && res.data.partnerBreakdownConfig.length > 0) {
        setPartnerBreakdownSchema(res.data.partnerBreakdownConfig);
      }
    } catch (err) {
      console.warn('Could not load partnerBreakdownConfig in PartnerPriceRequests:', err);
    }
  }, []);

  useEffect(() => {
    loadBreakdownConfig();
    window.addEventListener('app_data_changed', loadBreakdownConfig);
    return () => window.removeEventListener('app_data_changed', loadBreakdownConfig);
  }, [loadBreakdownConfig]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Helper to format specs string from request object
  const formatSpecs = (r) => {
    const parts = [];
    if (r.dimensions) {
      if (r.dimensions.rawText) parts.push(r.dimensions.rawText);
      else if (r.dimensions.lengthCm) parts.push(`${r.dimensions.lengthCm} × ${r.dimensions.widthCm} × ${r.dimensions.heightCm} cm`);
    }
    if (r.materials?.woodType) parts.push(r.materials.woodType);
    if (r.materials?.countertop) parts.push(r.materials.countertop);
    if (r.materials?.notes) parts.push(r.materials.notes);
    if (r.locationAccess?.siteAccess) parts.push(r.locationAccess.siteAccess);
    return parts.join(' · ') || r.productInfo || 'Specificaties op aanvraag';
  };

  // Fetch partner price requests from backend API
  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.get('/partner-requests?limit=100');
      if (res.success) {
        const items = res.data?.items || res.data || [];

        const openList = [];
        const submittedList = [];

        items.forEach((item) => {
          const formattedDeadline = item.expectedResponseDate
            ? new Date(item.expectedResponseDate).toLocaleDateString(language === 'NL' ? 'nl-NL' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—';

          const anonymizedCustomer = item.customerName
            ? item.customerName
            : item.locationAccess?.city
            ? (language === 'NL' ? `Klant (${item.locationAccess.city})` : `Client (${item.locationAccess.city})`)
            : (language === 'NL' ? 'Klant' : 'Client');

          const baseObj = {
            id: item.requestNumber || item.id,
            rawId: item.id,
            projectNL: item.productInfo || item.category || 'Maatwerk Project',
            projectEN: item.productInfo || item.category || 'Custom Project',
            customer: anonymizedCustomer,
            divisionNL: item.category === 'garden_room' ? 'Buitenverblijven' : item.category === 'canopy' ? 'Overkappingen' : 'Buitenkeukens',
            divisionEN: item.category || 'Outdoor Kitchens',
            deadlineNL: formattedDeadline,
            deadlineEN: formattedDeadline,
            dueDateNL: formattedDeadline,
            dueDateEN: formattedDeadline,
            specsNL: formatSpecs(item),
            specsEN: formatSpecs(item),
            status: item.status,
            attachments: item.attachmentIds || [],
            activeOffer: item.activeOffer,
            raw: item,
          };

          if (item.activeOffer || item.status === 'offers_received' || item.status === 'selected') {
            const offer = item.activeOffer || {};
            const isAccepted = item.status === 'selected' || offer.status === 'accepted';
            submittedList.push({
              ...baseObj,
              offerId: offer.offerNumber || baseObj.id,
              submittedOn: offer.createdAt
                ? new Date(offer.createdAt).toLocaleDateString(language === 'NL' ? 'nl-NL' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' })
                : '—',
              price: offer.costPrice != null ? `€ ${Number(offer.costPrice).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}` : '—',
              numericPrice: Number(offer.costPrice) || 0,
              validityNL: offer.validUntil || '30 dagen',
              validityEN: offer.validUntil || '30 days',
              leadTimeNL: offer.leadTimeWeeks ? `${offer.leadTimeWeeks} weken` : '4 weken',
              leadTimeEN: offer.leadTimeWeeks ? `${offer.leadTimeWeeks} weeks` : '4 weeks',
              remarksNL: offer.notes || '—',
              remarksEN: offer.notes || '—',
              adminStatus: isAccepted ? 'Accepted' : 'In Review',
              breakdownItems: offer.breakdown?.items || [],
            });
          } else if (item.status !== 'declined' && item.status !== 'cancelled') {
            openList.push(baseObj);
          }
        });

        setOpen(openList);
        setSubmitted(submittedList);
      } else {
        setError(res.error?.message || 'Failed to load partner price requests.');
      }
    } catch {
      setError('Unable to reach the server. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchRequests();
    window.addEventListener('app_data_changed', fetchRequests);
    return () => window.removeEventListener('app_data_changed', fetchRequests);
  }, [fetchRequests]);

  const handleInput = (reqId, field, value) => {
    setFormData(prev => {
      const currentForm = { ...(prev[reqId] || {}), [field]: value };

      // Auto-calculate Total Build Price sum from all dynamic section fields
      let calculatedTotal = 0;
      let hasFieldCost = false;

      (partnerBreakdownSchema || []).forEach(sec => {
        if (sec.fields) {
          sec.fields.forEach(f => {
            const val = parseFloat(currentForm[f.id]);
            if (!isNaN(val) && val > 0) {
              calculatedTotal += val;
              hasFieldCost = true;
            }
          });
        } else {
          const val = parseFloat(currentForm[sec.id]);
          if (!isNaN(val) && val > 0) {
            calculatedTotal += val;
            hasFieldCost = true;
          }
        }
      });

      if (hasFieldCost && field !== 'price') {
        currentForm.price = calculatedTotal;
      }

      return { ...prev, [reqId]: currentForm };
    });
  };

  // Submit Partner Offer to Backend API
  const handleSubmit = async (req) => {
    const form = formData[req.id] || {};
    if (!form.price || !form.validity || !form.leadTime) {
      showToast(language === 'NL' ? '⚠️ Vul alle verplichte velden in.' : '⚠️ Please fill all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const breakdownItems = [];
      let transportCost = 0;
      let installationCost = 0;
      let otherCost = 0;

      (partnerBreakdownSchema || []).forEach(sec => {
        if (sec.fields) {
          sec.fields.forEach(f => {
            const val = parseFloat(form[f.id]);
            if (!isNaN(val) && val > 0) {
              breakdownItems.push({
                sectionTitle: sec.title || 'General',
                label: f.label,
                amount: val
              });
              const lowerTitle = (sec.title || '').toLowerCase();
              if (lowerTitle.includes('transport') || lowerTitle.includes('freight')) transportCost += val;
              else if (lowerTitle.includes('install') || lowerTitle.includes('montage')) installationCost += val;
              else if (lowerTitle.includes('other') || lowerTitle.includes('overig')) otherCost += val;
            }
          });
        } else {
          const val = parseFloat(form[sec.id]);
          if (!isNaN(val) && val > 0) {
            breakdownItems.push({
              sectionTitle: sec.title || 'General',
              label: sec.label || sec.title,
              amount: val
            });
          }
        }
      });

      // Calculate validUntil in YYYY-MM-DD
      const days = parseInt(form.validity) || (form.validity.includes('14') ? 14 : form.validity.includes('60') ? 60 : form.validity.includes('45') ? 45 : 30);
      const validDate = new Date();
      validDate.setDate(validDate.getDate() + days);
      const validUntilStr = validDate.toISOString().split('T')[0];

      const leadTimeWeeks = parseInt(form.leadTime) || 4;

      const payload = {
        costPrice: parseFloat(form.price),
        laborHours: 0,
        validUntil: validUntilStr,
        leadTimeWeeks: leadTimeWeeks,
        notes: form.remarks || null,
        breakdown: {
          transportCost: transportCost || null,
          installationCost: installationCost || null,
          otherCost: otherCost || null,
          items: breakdownItems.length > 0 ? breakdownItems : undefined
        }
      };

      const res = await api.post(`/partner-requests/${req.rawId || req.id}/offers`, payload);
      if (res.success) {
        showToast(language === 'NL' ? `✅ Offerte ${req.id} succesvol ingediend!` : `✅ Offer ${req.id} submitted successfully!`);
        setExpanded(null);
        fetchRequests();
        window.dispatchEvent(new Event('app_data_changed'));
      } else {
        showToast(res.error?.message || 'Failed to submit offer.');
      }
    } catch {
      showToast('Network error while submitting offer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Decline Partner Price Request
  const handleDecline = async (req) => {
    if (!window.confirm(language === 'NL' ? 'Weet u zeker dat u deze prijsaanvraag wilt afwijzen?' : 'Are you sure you want to decline this price request?')) {
      return;
    }
    try {
      const res = await api.post(`/partner-requests/${req.rawId || req.id}/decline`, {
        declineReason: 'Not available for requested timeline'
      });
      if (res.success) {
        showToast(language === 'NL' ? 'Aanvraag afgewezen.' : 'Inquiry declined.');
        setExpanded(null);
        fetchRequests();
        window.dispatchEvent(new Event('app_data_changed'));
      } else {
        showToast(res.error?.message || 'Failed to decline inquiry.');
      }
    } catch {
      showToast('Network error while declining inquiry.');
    }
  };

  return (
    <div className="space-y-6 font-body text-[#4A4A43] relative">
      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 80 }}
            className="fixed top-20 right-4 z-[9999] flex items-center gap-2 bg-primary text-cream px-4 py-3 rounded-xl shadow-lg text-xs font-body"
          >
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Inbox className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-heading font-bold text-primary">
            {language === 'NL' ? 'Prijsaanvragen Inbox' : 'Price Requests Inbox'}
          </h2>
        </div>
        <p className="text-dark/50 text-sm mt-1">
          {language === 'NL'
            ? 'Bekijk open aanvragen en dien uw bouwprijs, geldigheidsduur, levertijd en opmerkingen in.'
            : 'Review open requests and submit your build price, validity, lead time, and remarks.'}
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-body">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
          <Button size="sm" variant="outline" icon={RotateCcw} onClick={fetchRequests}>
            {language === 'EN' ? 'Retry' : 'Opnieuw proberen'}
          </Button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#D6CFC2]">
        <button
          onClick={() => setActiveTab('open')}
          className={`pb-2 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'open' ? 'border-primary text-primary' : 'border-transparent text-dark/50 hover:text-dark'}`}
        >
          <AlertCircle className="w-4 h-4" />
          {language === 'NL' ? 'Openstaand' : 'Open Requests'}
          {open.length > 0 && (
            <span className="bg-accent/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{open.length}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('submitted')}
          className={`pb-2 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'submitted' ? 'border-primary text-primary' : 'border-transparent text-dark/50 hover:text-dark'}`}
        >
          <CheckCircle2 className="w-4 h-4" />
          {language === 'NL' ? 'Ingediende Offertes' : 'Submitted Offers'}
          {submitted.length > 0 && (
            <span className="bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{submitted.length}</span>
          )}
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-dark/50">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-body">{language === 'EN' ? 'Loading price requests...' : 'Prijsaanvragen laden...'}</p>
        </div>
      ) : (
        <>
          {/* OPEN REQUESTS TAB */}
          {activeTab === 'open' && (
            <div className="space-y-4">
              {open.length === 0 ? (
                <div className="text-center py-12 text-dark/40 text-sm font-body">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-400" />
                  {language === 'NL' ? 'Alle aanvragen zijn ingediend.' : 'All requests have been submitted.'}
                </div>
              ) : (
                open.map(req => {
                  const isOpen = expanded === req.id;
                  const form = formData[req.id] || {};
                  const title = language === 'EN' ? (req.projectEN || req.projectNL) : (req.projectNL || req.projectEN);
                  const division = language === 'EN' ? (req.divisionEN || req.divisionNL) : (req.divisionNL || req.divisionEN);
                  const deadline = language === 'EN' ? (req.deadlineEN || req.deadlineNL) : (req.deadlineNL || req.deadlineEN);
                  const dueDate = language === 'EN' ? (req.dueDateEN || req.dueDateNL) : (req.dueDateNL || req.dueDateEN);
                  const specs = language === 'EN' ? (req.specsEN || req.specsNL) : (req.specsNL || req.specsEN);

                  return (
                    <Card key={req.id} className="overflow-hidden" p="p-0">
                      {/* Card Header */}
                      <div
                        className="flex items-center justify-between p-5 cursor-pointer hover:bg-[#F8F7F4] transition-colors"
                        onClick={() => setExpanded(isOpen ? null : req.id)}
                      >
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-accent" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono font-bold text-accent">{req.id}</span>
                              <Badge variant="warning">{language === 'NL' ? 'Openstaand' : 'Open'}</Badge>
                              <Badge variant="primary">{division}</Badge>
                            </div>
                            <h3 className="font-bold text-primary font-heading text-base mt-0.5 truncate">{title}</h3>
                            <p className="text-xs text-dark/50">{language === 'NL' ? 'Klant:' : 'Customer:'} {req.customer} · {language === 'NL' ? 'Deadline klant:' : 'Client deadline:'} <strong className="text-primary">{deadline}</strong></p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right hidden sm:block">
                            <span className="block text-[10px] text-dark/40 font-bold uppercase">{language === 'NL' ? 'Indienen voor' : 'Submit by'}</span>
                            <span className="text-xs font-bold text-primary flex items-center gap-1"><Calendar className="w-3 h-3 text-accent" />{dueDate}</span>
                          </div>
                          {isOpen
                            ? <ChevronUp className="w-5 h-5 text-dark/40" />
                            : <ChevronDown className="w-5 h-5 text-dark/40" />
                          }
                        </div>
                      </div>

                      {/* Expandable Form */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-5 space-y-4 border-t border-[#D6CFC2]/60 pt-4">
                              {/* Specs */}
                              <div className="p-3 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2]/40">
                                <p className="text-[10px] font-bold uppercase text-dark/40 mb-1">{language === 'NL' ? 'Projectspecificaties' : 'Project Specs'}</p>
                                <p className="text-sm text-dark font-body">{specs}</p>
                              </div>

                              {/* Document Downloads (if any blueprints/attachments attached) */}
                              {req.attachments && req.attachments.length > 0 && (
                                <div className="flex flex-wrap gap-2 items-center p-3 bg-white rounded-xl border border-[#D6CFC2]">
                                  <Paperclip className="w-4 h-4 text-primary" />
                                  <span className="text-xs font-bold text-dark">{language === 'NL' ? 'Bijlagen / Bouwtekeningen:' : 'Attachments & Blueprints:'}</span>
                                  {req.attachments.map((docId, idx) => (
                                    <a
                                      key={docId}
                                      href={`/api/documents/${docId}/download`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg hover:bg-primary/20 transition-colors"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                      {language === 'NL' ? `Document #${idx + 1}` : `Blueprint #${idx + 1}`}
                                    </a>
                                  ))}
                                </div>
                              )}

                              {/* NESTED DYNAMIC PARTNER SECTIONS & FIELDS */}
                              {partnerBreakdownSchema && partnerBreakdownSchema.length > 0 && (
                                <div className="space-y-3">
                                  <p className="text-[10px] font-bold uppercase text-primary tracking-wider flex items-center justify-between">
                                    <span>{language === 'NL' ? 'Gedetailleerde Prijsopbouw per Sectie' : 'Detailed Cost Breakdown per Section'}</span>
                                    <span className="text-[9px] text-dark/40 font-mono">Configured by Admin ⚙️</span>
                                  </p>
                                  <div className="space-y-3">
                                    {partnerBreakdownSchema.map((sec) => (
                                      <div key={sec.id || sec.title} className="p-3.5 bg-white rounded-xl border border-[#D6CFC2] space-y-2 shadow-2xs">
                                        <h5 className="text-xs font-bold text-primary font-heading flex items-center gap-1.5 border-b border-[#D6CFC2]/50 pb-1.5">
                                          <span>{sec.icon || '📦'}</span>
                                          <span>{sec.title || sec.label}</span>
                                        </h5>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                          {sec.fields ? (
                                            sec.fields.map((field) => (
                                              <div key={field.id}>
                                                <label className="block text-[10px] font-bold text-dark/60 mb-0.5">{field.label}</label>
                                                <input
                                                  type="number"
                                                  value={form[field.id] || ''}
                                                  onChange={e => handleInput(req.id, field.id, e.target.value)}
                                                  placeholder="€ 0.00"
                                                  className="w-full px-2.5 py-1.5 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary/20"
                                                />
                                              </div>
                                            ))
                                          ) : (
                                            <div>
                                              <label className="block text-[10px] font-bold text-dark/60 mb-0.5">{sec.label}</label>
                                              <input
                                                type="number"
                                                value={form[sec.id] || ''}
                                                onChange={e => handleInput(req.id, sec.id, e.target.value)}
                                                placeholder="€ 0.00"
                                                className="w-full px-2.5 py-1.5 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary/20"
                                              />
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Form Fields */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Price */}
                                <div>
                                  <label className="block text-[10px] uppercase font-bold text-dark/50 mb-1">
                                    {language === 'NL' ? 'Uw bouwprijs (€) *' : 'Your Build Price (€) *'}
                                  </label>
                                  <div className="relative">
                                    <Banknote className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/30" />
                                    <input
                                      type="number"
                                      value={form.price || ''}
                                      onChange={e => handleInput(req.id, 'price', e.target.value)}
                                      placeholder={language === 'NL' ? 'bijv. 4500' : 'e.g. 4500'}
                                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#D6CFC2] rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                  </div>
                                </div>

                                {/* Validity */}
                                <div>
                                  <label className="block text-[10px] uppercase font-bold text-dark/50 mb-1">
                                    {language === 'NL' ? 'Geldigheid *' : 'Validity *'}
                                  </label>
                                  <select
                                    value={form.validity || ''}
                                    onChange={e => handleInput(req.id, 'validity', e.target.value)}
                                    className="w-full px-3 py-2.5 bg-white border border-[#D6CFC2] rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                                  >
                                    <option value="">{language === 'NL' ? 'Selecteer...' : 'Select...'}</option>
                                    <option value={language === 'NL' ? '14 dagen' : '14 days'}>{language === 'NL' ? '14 dagen' : '14 days'}</option>
                                    <option value={language === 'NL' ? '30 dagen' : '30 days'}>{language === 'NL' ? '30 dagen' : '30 days'}</option>
                                    <option value={language === 'NL' ? '45 dagen' : '45 days'}>{language === 'NL' ? '45 dagen' : '45 days'}</option>
                                    <option value={language === 'NL' ? '60 dagen' : '60 days'}>{language === 'NL' ? '60 dagen' : '60 days'}</option>
                                  </select>
                                </div>

                                {/* Lead Time */}
                                <div>
                                  <label className="block text-[10px] uppercase font-bold text-dark/50 mb-1">
                                    {language === 'NL' ? 'Levertijd (weken) *' : 'Lead Time (weeks) *'}
                                  </label>
                                  <div className="relative">
                                    <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/30" />
                                    <input
                                      type="number"
                                      value={form.leadTime || ''}
                                      onChange={e => handleInput(req.id, 'leadTime', e.target.value)}
                                      placeholder={language === 'NL' ? 'bijv. 4' : 'e.g. 4'}
                                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#D6CFC2] rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Remarks */}
                              <div>
                                <label className="block text-[10px] uppercase font-bold text-dark/50 mb-1 flex items-center gap-1">
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  {language === 'NL' ? 'Opmerkingen (optioneel)' : 'Remarks (optional)'}
                                </label>
                                <textarea
                                  value={form.remarks || ''}
                                  onChange={e => handleInput(req.id, 'remarks', e.target.value)}
                                  rows={3}
                                  placeholder={language === 'NL' ? 'bijv. prijs incl. levering, montage op locatie...' : 'e.g. price incl. delivery, on-site assembly...'}
                                  className="w-full px-3 py-2.5 bg-white border border-[#D6CFC2] rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                />
                              </div>

                              {/* Action Buttons: Submit Offer & Decline Inquiry */}
                              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                                <button
                                  type="button"
                                  onClick={() => handleDecline(req)}
                                  disabled={isSubmitting}
                                  className="w-full sm:w-auto px-4 py-3 border border-red-300 text-red-700 hover:bg-red-50 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer"
                                >
                                  <XCircle className="w-4 h-4 text-red-500" />
                                  {language === 'NL' ? 'Aanvraag Afwijzen' : 'Decline Inquiry'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSubmit(req)}
                                  disabled={isSubmitting}
                                  className="w-full sm:flex-1 py-3 bg-primary text-cream rounded-xl flex items-center justify-center gap-2 font-bold font-body hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md cursor-pointer"
                                >
                                  {isSubmitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-cream" />
                                  ) : (
                                    <>
                                      <Send className="w-4 h-4" />
                                      {language === 'NL' ? `Offerte Indienen voor ${title}` : `Submit Offer for ${title}`}
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  );
                })
              )}
            </div>
          )}

          {/* SUBMITTED OFFERS LOG TAB */}
          {activeTab === 'submitted' && (
            <div className="space-y-4">
              {submitted.length === 0 ? (
                <div className="text-center py-12 text-dark/40 text-sm">
                  <Inbox className="w-10 h-10 mx-auto mb-3 text-dark/20" />
                  {language === 'NL' ? 'Nog geen offertes ingediend.' : 'No offers submitted yet.'}
                </div>
              ) : (
                submitted.map(offer => {
                  const title = language === 'EN' ? (offer.projectEN || offer.projectNL) : (offer.projectNL || offer.projectEN);
                  const validity = language === 'EN' ? (offer.validityEN || offer.validityNL) : (offer.validityNL || offer.validityEN);
                  const leadTime = language === 'EN' ? (offer.leadTimeEN || offer.leadTimeNL) : (offer.leadTimeNL || offer.leadTimeEN);
                  const remarks = language === 'EN' ? (offer.remarksEN || offer.remarksNL) : (offer.remarksNL || offer.remarksEN);
                  const isAccepted = offer.adminStatus === 'Geaccepteerd' || offer.adminStatus === 'Accepted';

                  return (
                    <Card key={offer.offerId || offer.id} className="border border-green-200/60 bg-[#F8FFF8]/60">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              <span className="text-xs font-mono font-bold text-green-600">{offer.offerId || offer.id}</span>
                              <Badge variant="success">{language === 'NL' ? 'Ingediend' : 'Submitted'}</Badge>
                              <Badge variant={isAccepted ? 'success' : offer.adminStatus === 'In Review' ? 'warning' : 'primary'}>
                                {language === 'NL'
                                  ? (isAccepted ? 'Geaccepteerd' : offer.adminStatus === 'In Review' ? 'In beoordeling' : offer.adminStatus)
                                  : (isAccepted ? 'Accepted' : offer.adminStatus === 'In Review' ? 'In Review' : offer.adminStatus)}
                              </Badge>
                            </div>
                            <h3 className="font-heading font-bold text-primary text-base">{title}</h3>
                            <p className="text-xs text-dark/50">{language === 'NL' ? 'Klant:' : 'Customer:'} {offer.customer}</p>
                          </div>
                          <div className="text-right">
                            <span className="block text-[10px] text-dark/40 font-bold uppercase">{language === 'NL' ? 'Ingediend op' : 'Submitted On'}</span>
                            <span className="text-sm font-bold text-primary">{offer.submittedOn}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="p-2.5 bg-white rounded-lg border border-[#D6CFC2]/40">
                            <p className="text-[10px] text-dark/40 font-bold uppercase mb-0.5">{language === 'NL' ? 'Bouwprijs' : 'Build Price'}</p>
                            <p className="font-bold text-primary text-sm">{offer.price}</p>
                          </div>
                          <div className="p-2.5 bg-white rounded-lg border border-[#D6CFC2]/40">
                            <p className="text-[10px] text-dark/40 font-bold uppercase mb-0.5">{language === 'NL' ? 'Geldigheid' : 'Validity'}</p>
                            <p className="font-bold text-dark">{validity}</p>
                          </div>
                          <div className="p-2.5 bg-white rounded-lg border border-[#D6CFC2]/40">
                            <p className="text-[10px] text-dark/40 font-bold uppercase mb-0.5">{language === 'NL' ? 'Levertijd' : 'Lead Time'}</p>
                            <p className="font-bold text-dark">{leadTime}</p>
                          </div>
                          <div className="p-2.5 bg-white rounded-lg border border-[#D6CFC2]/40">
                            <p className="text-[10px] text-dark/40 font-bold uppercase mb-0.5">{language === 'NL' ? 'Status Admin' : 'Admin Status'}</p>
                            <p className="font-bold text-accent">
                              {language === 'NL'
                                ? (isAccepted ? 'Geaccepteerd' : offer.adminStatus === 'In Review' ? 'In beoordeling' : offer.adminStatus)
                                : (isAccepted ? 'Accepted' : offer.adminStatus === 'In Review' ? 'In Review' : offer.adminStatus)}
                            </p>
                          </div>
                        </div>

                        {offer.breakdownItems && offer.breakdownItems.length > 0 && (
                          <div className="pt-2 border-t border-[#D6CFC2]/40 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-dark/60 block">Breakdown Items:</span>
                            <div className="flex flex-wrap gap-2">
                              {offer.breakdownItems.map((b, idx) => (
                                <span key={idx} className="bg-white text-dark/80 px-2 py-0.5 rounded text-[10px] font-mono border border-[#D6CFC2]/50">
                                  {b.label}: €{Number(b.amount).toLocaleString('nl-NL')}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {remarks && remarks !== '—' && (
                          <div className="p-3 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2]/40 text-xs">
                            <p className="text-[10px] font-bold uppercase text-dark/40 mb-1">{language === 'NL' ? 'Opmerkingen' : 'Remarks'}</p>
                            <p className="text-dark/70">{remarks}</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
