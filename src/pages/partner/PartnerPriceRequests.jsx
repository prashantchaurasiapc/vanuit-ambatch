import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { FileText, Send, Calendar, Banknote, Clock, CheckCircle2, ChevronDown, ChevronUp, MessageSquare, AlertCircle, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_OPEN_REQUESTS = [
  {
    id: 'PR-2026-081',
    projectNL: 'Luxe Teak Buitenkeuken 3.5m - Thermo Fraké',
    projectEN: 'Luxury Teak Outdoor Kitchen 3.5m - Thermo Fraké',
    customer: 'Bjorn Valk (Utrecht)',
    divisionNL: 'Buitenkeukens',
    divisionEN: 'Outdoor Kitchens',
    deadlineNL: '25 Augustus 2026',
    deadlineEN: '25 August 2026',
    dueDateNL: '12 Aug 2026',
    dueDateEN: '12 Aug 2026',
    specsNL: 'Massief Teakhouten onderstel (350x85x92cm), 8cm Zwart Polijst Beton Cire werkblad, RVS Kamado cutout, spoelbak & kraan aansluiting.',
    specsEN: 'Solid Teak wood base (350x85x92cm), 8cm Black Polished Concrete Worktop, Stainless Kamado cutout, sink & tap connections.'
  },
  {
    id: 'PR-2026-084',
    projectNL: 'Eiken Houten Overkapping 6x4m met Glaswand',
    projectEN: 'Oak Wooden Canopy 6x4m with Glass Wall',
    customer: 'Mark Davis (Amsterdam)',
    divisionNL: 'Overkappingen',
    divisionEN: 'Canopies',
    deadlineNL: '10 September 2026',
    deadlineEN: '10 September 2026',
    dueDateNL: '15 Aug 2026',
    dueDateEN: '15 Aug 2026',
    specsNL: 'Rustiek Eiken gebint constructie (600x400cm), EPDM daksysteem, zinken hemelwaterafvoer, glazen schuifwand 4-delig.',
    specsEN: 'Rustic Oak truss construction (600x400cm), EPDM roofing system, zinc rainwater drainage, 4-piece sliding glass wall.'
  }
];

const DEFAULT_SUBMITTED_LOG = [
  {
    id: 'PR-2026-079',
    projectNL: 'Kliko Ombouw Triple Antraciet (240L)',
    projectEN: 'Bin Storage Triple Anthracite (240L)',
    customer: 'Sophia Taylor (Rotterdam)',
    divisionNL: 'Kliko Ombouw',
    divisionEN: 'Bin Storage',
    deadlineNL: '15 Augustus 2026',
    deadlineEN: '15 August 2026',
    submittedOn: '04 Aug 2026',
    price: '€ 1.450,00',
    validityNL: '30 dagen',
    validityEN: '30 days',
    leadTimeNL: '2 weken',
    leadTimeEN: '2 weeks',
    remarksNL: 'Inclusief gasveren en gepoedercoat stalen frame.',
    remarksEN: 'Includes gas struts and powder-coated steel frame.',
    adminStatus: 'Accepted'
  }
];

export default function PartnerPriceRequests() {
  const { language } = useLanguage();
  const [expanded, setExpanded] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState([]);
  const [open, setOpen] = useState([]);
  const [toastMsg, setToastMsg] = useState('');
  const [activeTab, setActiveTab] = useState('open');

  const [partnerBreakdownSchema, setPartnerBreakdownSchema] = useState(() => {
    try {
      const saved = localStorage.getItem('app_partner_breakdown_sections_v2') || localStorage.getItem('app_partner_breakdown_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'sec-materials',
        title: 'Material Cost (Hout & Grondstoffen)',
        icon: '🪵',
        fields: [
          { id: 'f-mat-1', label: 'Hout & Grondstoffen Koste (€)', required: true },
          { id: 'f-mat-2', label: 'Aanrechtblad & Afwerking (€)', required: true }
        ]
      },
      {
        id: 'sec-labor',
        title: 'Labour Cost (Arbeid & Ambacht)',
        icon: '🔨',
        fields: [
          { id: 'f-lab-1', label: 'Werkplaats Fabricage & Uren (€)', required: true }
        ]
      },
      {
        id: 'sec-transport',
        title: 'Transport Cost (Transport & Logistiek)',
        icon: '🚚',
        fields: [
          { id: 'f-tra-1', label: 'Vracht & Leveringskoste (€)', required: true }
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
    ];
  });

  // Load from localStorage or fallback defaults
  useEffect(() => {
    const loadRequests = () => {
      const savedOpen = localStorage.getItem('app_partner_requests');
      const savedSubmitted = localStorage.getItem('app_partner_submitted_offers');
      const savedBreakdown = localStorage.getItem('app_partner_breakdown_sections_v2') || localStorage.getItem('app_partner_breakdown_config');

      if (savedBreakdown) {
        try { setPartnerBreakdownSchema(JSON.parse(savedBreakdown)); } catch(e) {}
      }

      if (savedOpen) {
        try { setOpen(JSON.parse(savedOpen)); } catch (e) { setOpen(DEFAULT_OPEN_REQUESTS); }
      } else {
        setOpen(DEFAULT_OPEN_REQUESTS);
        localStorage.setItem('app_partner_requests', JSON.stringify(DEFAULT_OPEN_REQUESTS));
      }

      if (savedSubmitted) {
        try { setSubmitted(JSON.parse(savedSubmitted)); } catch (e) { setSubmitted(DEFAULT_SUBMITTED_LOG); }
      } else {
        setSubmitted(DEFAULT_SUBMITTED_LOG);
        localStorage.setItem('app_partner_submitted_offers', JSON.stringify(DEFAULT_SUBMITTED_LOG));
      }
    };

    loadRequests();
    window.addEventListener('storage', loadRequests);
    window.addEventListener('app_data_changed', loadRequests);
    return () => {
      window.removeEventListener('storage', loadRequests);
      window.removeEventListener('app_data_changed', loadRequests);
    };
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

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

  const handleSubmit = (req) => {
    const form = formData[req.id] || {};
    if (!form.price || !form.validity || !form.leadTime) {
      showToast(language === 'NL' ? '⚠️ Vul alle verplichte velden in.' : '⚠️ Please fill all required fields.');
      return;
    }
    const submittedOffer = {
      ...req,
      submittedOn: new Date().toLocaleDateString(language === 'NL' ? 'nl-NL' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
      price: `€ ${parseFloat(form.price).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`,
      validityNL: form.validity,
      validityEN: form.validity,
      leadTimeNL: `${form.leadTime} weken`,
      leadTimeEN: `${form.leadTime} weeks`,
      remarksNL: form.remarks || '—',
      remarksEN: form.remarks || '—',
      adminStatus: 'In Review',
    };

    const newSubmitted = [submittedOffer, ...submitted];
    const newOpen = open.filter(r => r.id !== req.id);

    setSubmitted(newSubmitted);
    setOpen(newOpen);
    localStorage.setItem('app_partner_submitted_offers', JSON.stringify(newSubmitted));
    localStorage.setItem('app_partner_requests', JSON.stringify(newOpen));
    window.dispatchEvent(new Event('app_data_changed'));

    setExpanded(null);
    showToast(language === 'NL' ? `✅ Offerte ${req.id} succesvol ingediend!` : `✅ Offer ${req.id} submitted!`);
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

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#D6CFC2]">
        <button
          onClick={() => setActiveTab('open')}
          className={`pb-2 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'open' ? 'border-primary text-primary' : 'border-transparent text-dark/50 hover:text-dark'}`}
        >
          <AlertCircle className="w-4 h-4" />
          {language === 'NL' ? 'Openstaand' : 'Open Requests'}
          {open.length > 0 && (
            <span className="bg-accent/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{open.length}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('submitted')}
          className={`pb-2 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'submitted' ? 'border-primary text-primary' : 'border-transparent text-dark/50 hover:text-dark'}`}
        >
          <CheckCircle2 className="w-4 h-4" />
          {language === 'NL' ? 'Ingediende Offertes' : 'Submitted Offers'}
          {submitted.length > 0 && (
            <span className="bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{submitted.length}</span>
          )}
        </button>
      </div>

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
              const title = language === 'EN' ? (req.projectEN || req.project) : (req.projectNL || req.project);
              const division = language === 'EN' ? (req.divisionEN || req.division) : (req.divisionNL || req.division);
              const deadline = language === 'EN' ? (req.deadlineEN || req.deadline) : (req.deadlineNL || req.deadline);
              const dueDate = language === 'EN' ? (req.dueDateEN || req.dueDate) : (req.dueDateNL || req.dueDate);
              const specs = language === 'EN' ? (req.specsEN || req.specs) : (req.specsNL || req.specs);

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

                          {/* NESTED DYNAMIC PARTNER SECTIONS & FIELDS (Configured from Admin Settings) */}
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
                                className="w-full px-3 py-2.5 bg-white border border-[#D6CFC2] rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
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

                          {/* Submit Button */}
                          <button
                            onClick={() => handleSubmit(req)}
                            className="w-full py-3 bg-primary text-cream rounded-xl flex items-center justify-center gap-2 font-bold font-body hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md"
                          >
                            <Send className="w-4 h-4" />
                            {language === 'NL' ? `Offerte Indienen voor ${title}` : `Submit Offer for ${title}`}
                          </button>
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
              const title = language === 'EN' ? (offer.projectEN || offer.project) : (offer.projectNL || offer.project);
              const validity = language === 'EN' ? (offer.validityEN || offer.validity) : (offer.validityNL || offer.validity);
              const leadTime = language === 'EN' ? (offer.leadTimeEN || offer.leadTime) : (offer.leadTimeNL || offer.leadTime);
              const remarks = language === 'EN' ? (offer.remarksEN || offer.remarks) : (offer.remarksNL || offer.remarks);
              const isAccepted = offer.adminStatus === 'Geaccepteerd' || offer.adminStatus === 'Accepted';

              return (
                <Card key={offer.id} className="border border-green-200/60 bg-[#F8FFF8]/60">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-xs font-mono font-bold text-green-600">{offer.id}</span>
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
    </div>
  );
}
