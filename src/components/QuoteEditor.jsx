import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Check, AlertTriangle, ArrowLeft, ArrowRight, Download, Share2, Copy, Send,
  Plus, Trash2, RotateCcw, Upload, FileText, CheckCircle, Eye, HelpCircle, Layout, Sparkles, User, Briefcase
} from 'lucide-react';
import Button from './Button';
import Card from './Card';
import Badge from './Badge';
import DiagramBuilder from './DiagramBuilder';
import Offerte6PagePDF from './Offerte6PagePDF';
import { WOOD_LIBRARY, PRESET_PRODUCT_LIBRARY, PRODUCT_TYPE_DEFAULTS } from '../utils/quoteLibraries';
import { calculateTotals, calculateInstalments, validateQuoteForSend } from '../utils/quoteSchema';
import { useLanguage } from '../context/LanguageContext';
import projectImg from '../assets/outdoor_project_card.png';
import heroImg from '/dasbordes images.png';
import { downloadQuotePdf, generateFull6PagePdf } from '../utils/pdfGenerator';

const STEPS = [
  { id: 1, number: 1, title: 'Customer & details', desc: 'customer, address, date & validity' },
  { id: 2, number: 2, title: 'Cover', desc: 'title, subtitle & 3 cover photos' },
  { id: 3, number: 3, title: 'Configuration', desc: 'tiles, specs & layout diagram' },
  { id: 4, number: 4, title: 'Investment', desc: 'line items, totals & 2 termijnen' },
  { id: 5, number: 5, title: 'Letter & process', desc: 'intro letter & 5 process steps' },
  { id: 6, number: 6, title: 'Review & send', desc: 'completeness check & approval link' }
];

// Dynamic Responsive PDF Preview Scaler that fits 100% full-width in Zone 3 card
function ScaledPDFPreview({ quote, activePage, highlightField }) {
  const containerRef = React.useRef(null);
  const [scale, setScale] = useState(0.40);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateScale = () => {
      if (containerRef.current) {
        const totalWidth = containerRef.current.clientWidth;
        const availableWidth = Math.max(100, totalWidth - 12);
        if (availableWidth > 0) {
          setScale(availableWidth / 794);
        }
      }
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Fit inside right card cleanly without pushing page height
  const scaledHeight = 1050 * scale;

  return (
    <div
      ref={containerRef}
      className="w-full bg-[#EDE8DF] p-1.5 rounded-xl border border-[#D6CFC2]/70 overflow-hidden shadow-inner relative"
      style={{ height: `${Math.min(490, scaledHeight + 12)}px` }}
    >
      <div
        style={{
          width: '794px',
          height: '1050px',
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          position: 'absolute',
          top: '6px',
          left: '50%',
          marginLeft: '-397px'
        }}
        className="shadow-md rounded-lg overflow-hidden bg-white"
      >
        <Offerte6PagePDF quote={quote} activePage={activePage} highlightField={highlightField} />
      </div>
    </div>
  );
}

export default function QuoteEditor({ quoteData, onClose, onSaveQuote, leadsList = [] }) {
  const { language } = useLanguage();
  const [activeStep, setActiveStep] = useState(1);
  const [quote, setQuote] = useState(quoteData);
  const [lastSavedTime, setLastSavedTime] = useState(new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }));
  const [toastMsg, setToastMsg] = useState('');
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [letterExpanded, setLetterExpanded] = useState(false);
  const [uspExpanded, setUspExpanded] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [previewPage, setPreviewPage] = useState(1);
  const [mobileTab, setMobileTab] = useState('editor');
  const [highlightField, setHighlightField] = useState(null);
  const [showFieldLabels, setShowFieldLabels] = useState(true);
  const [photoWarnings, setPhotoWarnings] = useState({});

  const stepFormRef = useRef(null);

  const handleStepClick = (stepId) => {
    setActiveStep(stepId);
    setMobileTab('editor');
    setTimeout(() => {
      if (stepFormRef.current) {
        stepFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  // Auto-sync preview page to active step
  useEffect(() => {
    switch (activeStep) {
      case 1: setPreviewPage(1); break;
      case 2: setPreviewPage(1); break;
      case 3: setPreviewPage(3); break;
      case 4: setPreviewPage(4); break;
      case 5: setPreviewPage(2); break;
      case 6: setPreviewPage(6); break;
      default: setPreviewPage(1); break;
    }
  }, [activeStep]);

  // Auto-save effect whenever quote state updates
  useEffect(() => {
    if (!quote) return;
    const saveTimer = setTimeout(() => {
      onSaveQuote(quote, false); // silent save
      setLastSavedTime(new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }));
    }, 400);
    return () => clearTimeout(saveTimer);
  }, [quote]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const isApproved = quote?.status === 'Approved' || quote?.status === 'Geaccepteerd';
  const totals = calculateTotals(quote?.investment?.lineItems || []);

  // State update helpers
  const updateCustomerField = (field, val) => {
    if (isApproved) return;
    setQuote(prev => ({
      ...prev,
      customer: { ...prev.customer, [field]: val }
    }));
  };

  const updateCoverField = (field, val) => {
    if (isApproved) return;
    setQuote(prev => ({
      ...prev,
      cover: { ...prev.cover, [field]: val }
    }));
  };

  const updateConfigField = (field, val) => {
    if (isApproved) return;
    setQuote(prev => {
      const nextConfig = { ...prev.configuration, [field]: val };
      const nextInvestment = { ...(prev.investment || {}) };
      const lineItems = [...(nextInvestment.lineItems || [])];

      if ((field === 'dimensions' || field === 'woodType') && lineItems.length > 0) {
        const item1 = lineItems[0];
        if (!item1.isCustomTitle && (item1.title.startsWith('Buitenkeuken') || item1.title.startsWith('Outdoor Kitchen'))) {
          const wood = field === 'woodType' ? val : (nextConfig.woodType || 'Thermo Fraké');
          const dim = field === 'dimensions' ? val : (nextConfig.dimensions || '240 × 80');
          const cleanDim = String(dim).replace(/\s*cm$/i, '').trim();
          lineItems[0] = {
            ...item1,
            title: `Buitenkeuken ${wood} · ${cleanDim} cm`
          };
          nextInvestment.lineItems = lineItems;
        }
      }

      return {
        ...prev,
        configuration: nextConfig,
        investment: nextInvestment
      };
    });
  };

  const updateInvestmentField = (field, val) => {
    if (isApproved) return;
    setQuote(prev => ({
      ...prev,
      investment: { ...prev.investment, [field]: val }
    }));
  };

  const updateLetterField = (field, val) => {
    if (isApproved) return;
    setQuote(prev => ({
      ...prev,
      letterAndProcess: { ...prev.letterAndProcess, [field]: val }
    }));
  };

  // Wood Type Selection Propagation
  const handleWoodTypeSelect = (woodName) => {
    if (isApproved) return;
    const woodObj = WOOD_LIBRARY.find(w => w.name === woodName);
    if (woodObj) {
      setQuote(prev => {
        const nextItems = [...(prev.investment?.lineItems || [])];
        if (nextItems.length > 0) {
          nextItems[0] = {
            ...nextItems[0],
            title: `Buitenkeuken ${woodObj.name} · ${prev.configuration?.dimensions || '240 × 80 cm'}`
          };
        }
        return {
          ...prev,
          configuration: {
            ...prev.configuration,
            woodType: woodObj.name,
            woodLifespan: woodObj.lifespan,
            infobox: {
              ...prev.configuration.infobox,
              title: woodObj.infoboxTitle,
              text: woodObj.infoboxText
            }
          },
          investment: {
            ...prev.investment,
            lineItems: nextItems
          }
        };
      });
    } else {
      updateConfigField('woodType', woodName);
    }
  };

  // Options & Features On/Off Propagation Handler
  const handleOptionToggle = (optionKey, enabled) => {
    if (isApproved) return;
    setQuote(prev => {
      const config = prev.configuration || {};
      const options = config.options || {};
      const updatedOptions = {
        ...options,
        [optionKey]: { ...(options[optionKey] || {}), enabled }
      };

      // Recalculate optionsTitle for Stat tile 3 & cover subtitle
      let titleParts = [];
      if (updatedOptions.bbqCutout?.enabled !== false) {
        titleParts.push(updatedOptions.bbqCutout?.type || config.optionsTitle || 'Big Green Egg Large');
      }
      if (updatedOptions.fridge?.enabled) titleParts.push('RVS Koelkast');
      if (updatedOptions.sink?.enabled) titleParts.push('Spoelbak met Kraan');

      const newOptionsTitle = titleParts.length > 0 ? titleParts.join(' + ') : 'Standaard uitvoering';

      // Update diagram segments automatically
      let nextSegments = [...(config.diagram?.segments || [])];
      if (optionKey === 'fridge') {
        if (enabled && !nextSegments.some(s => s.type === 'FRIDGE')) {
          nextSegments.push({ id: `fridge-${Date.now()}`, type: 'FRIDGE', label: 'RVS Koelkast', width: 50 });
        } else if (!enabled) {
          nextSegments = nextSegments.filter(s => s.type !== 'FRIDGE');
        }
      }
      if (optionKey === 'sink') {
        if (enabled && !nextSegments.some(s => s.type === 'SINK')) {
          nextSegments.push({ id: `sink-${Date.now()}`, type: 'SINK', label: 'Spoelbak', width: 40 });
        } else if (!enabled) {
          nextSegments = nextSegments.filter(s => s.type !== 'SINK');
        }
      }

      // Update specifications line list on Page 3
      let specs = [...(config.specifications || [])];
      if (specs.length > 0) {
        let topLines = [...(specs[0].lines || [])];
        if (optionKey === 'fridge') {
          if (enabled && !topLines.some(l => l.text.toLowerCase().includes('koelkast'))) {
            topLines.push({ id: `l-fridge-${Date.now()}`, text: 'Inbouw RVS koelkast met temperatuurregeling' });
          } else if (!enabled) {
            topLines = topLines.filter(l => !l.text.toLowerCase().includes('koelkast'));
          }
        }
        if (optionKey === 'sink') {
          if (enabled && !topLines.some(l => l.text.toLowerCase().includes('spoelbak'))) {
            topLines.push({ id: `l-sink-${Date.now()}`, text: 'RVS spoelbak met mengkraan en wateraansluiting' });
          } else if (!enabled) {
            topLines = topLines.filter(l => !l.text.toLowerCase().includes('spoelbak'));
          }
        }
        specs[0] = { ...specs[0], lines: topLines };
      }

      return {
        ...prev,
        configuration: {
          ...config,
          optionsTitle: newOptionsTitle,
          options: updatedOptions,
          specifications: specs,
          diagram: {
            ...config.diagram,
            segments: nextSegments
          }
        }
      };
    });
  };

  // Product Type Change Handler
  const handleProductTypeChange = (pType) => {
    if (isApproved) return;
    const defaults = PRODUCT_TYPE_DEFAULTS[pType];
    if (!defaults) return;

    setQuote(prev => ({
      ...prev,
      productType: pType,
      cover: {
        ...prev.cover,
        titleLine1: defaults.titleLine1,
        titleLine2: defaults.titleLine2
      },
      letterAndProcess: {
        ...prev.letterAndProcess,
        letterParagraphs: [...defaults.letterParagraphs],
        checklist: [...defaults.checklist],
        processSteps: [...defaults.processSteps]
      }
    }));
  };

  // Specification Line Repeater Actions
  const handleAddSpecLine = (secIndex) => {
    if (isApproved) return;
    setQuote(prev => {
      const specs = [...(prev.configuration?.specifications || [])];
      specs[secIndex] = {
        ...specs[secIndex],
        lines: [...specs[secIndex].lines, { id: `l-${Date.now()}`, text: 'Nieuwe specificatie regel' }]
      };
      return { ...prev, configuration: { ...prev.configuration, specifications: specs } };
    });
  };

  const handleRemoveSpecLine = (secIndex, lineIndex) => {
    if (isApproved) return;
    setQuote(prev => {
      const specs = [...(prev.configuration?.specifications || [])];
      const nextLines = specs[secIndex].lines.filter((_, i) => i !== lineIndex);
      specs[secIndex] = { ...specs[secIndex], lines: nextLines };
      return { ...prev, configuration: { ...prev.configuration, specifications: specs } };
    });
  };

  const handleSpecLineTextChange = (secIndex, lineIndex, text) => {
    if (isApproved) return;
    setQuote(prev => {
      const specs = [...(prev.configuration?.specifications || [])];
      const nextLines = [...specs[secIndex].lines];
      nextLines[lineIndex] = { ...nextLines[lineIndex], text };
      specs[secIndex] = { ...specs[secIndex], lines: nextLines };
      return { ...prev, configuration: { ...prev.configuration, specifications: specs } };
    });
  };

  // Line Item Repeater Actions
  const handleAddLineItem = () => {
    if (isApproved) return;
    const newItem = {
      id: `item-${Date.now()}`,
      title: 'Nieuw product / optie',
      description: 'Omschrijving van het product',
      quantity: 1,
      priceInclVat: 250,
      vatRate: 21,
      isIncluded: false
    };
    updateInvestmentField('lineItems', [...(quote.investment?.lineItems || []), newItem]);
  };

  const handleRemoveLineItem = (index) => {
    if (isApproved) return;
    const items = (quote.investment?.lineItems || []).filter((_, i) => i !== index);
    updateInvestmentField('lineItems', items);
  };

  const handleLineItemChange = (index, field, val) => {
    if (isApproved) return;
    const items = [...(quote.investment?.lineItems || [])];
    items[index] = { ...items[index], [field]: val };

    if (field === 'priceInclVat') {
      const numVal = Number(val) || 0;
      if (numVal > 0) {
        items[index].isIncluded = false;
      } else if (numVal === 0) {
        items[index].isIncluded = true;
      }
    }
    updateInvestmentField('lineItems', items);
  };

  const handleAddFromLibrary = (libItem) => {
    if (isApproved) return;
    const newItem = {
      id: `lib-${Date.now()}`,
      title: libItem.title,
      description: libItem.description,
      quantity: 1,
      priceInclVat: libItem.priceInclVat,
      vatRate: libItem.vatRate || 21,
      isIncluded: libItem.isIncluded || false
    };
    updateInvestmentField('lineItems', [...(quote.investment?.lineItems || []), newItem]);
    setShowLibraryModal(false);
    showToast(`"${libItem.title}" toegevoegd uit bibliotheek!`);
  };

  // Validation
  const validation = validateQuoteForSend(quote);

  // Calculate Spec Total Lines
  const totalSpecLines = (quote.configuration?.specifications || []).reduce((acc, s) => acc + (s.lines || []).length, 0);

  const getStepNextTitle = (stepId) => {
    switch (stepId) {
      case 1: return 'Cover';
      case 2: return 'Configuration';
      case 3: return 'Investment';
      case 4: return 'Letter & process';
      case 5: return 'Review & send';
      default: return 'Finish';
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between font-body text-[#4A4A43] overflow-hidden">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-20 right-4 z-[999999] flex items-center gap-2 bg-[#3E4E36] text-white px-4 py-3 rounded-xl shadow-2xl text-xs">
            <CheckCircle className="w-4 h-4 text-green-400" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP EDITOR NAVIGATION / STATUS BAR */}
      <div className="flex-shrink-0 bg-white p-2 sm:p-3 rounded-2xl border border-[#D6CFC2] shadow-xs flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onClose}
            className="px-2.5 sm:px-3 py-1.5 bg-[#EDE8DF] hover:bg-[#E2DDD3] text-primary rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer flex-shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Back to Quotes</span>
            <span className="inline sm:hidden">Back</span>
          </button>
          <div className="h-4 w-[1px] bg-[#D6CFC2] hidden sm:block"></div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-serif font-bold text-xs sm:text-base text-primary truncate">Quote Editor</span>
            <span className="font-mono text-[10px] sm:text-xs text-amber-800 bg-amber-100 px-1.5 sm:px-2 py-0.5 rounded-md font-bold flex-shrink-0">{quote.id}</span>
            <Badge variant={quote.status === 'Approved' || quote.status === 'Geaccepteerd' ? 'success' : quote.status === 'Sent' || quote.status === 'Verzonden' ? 'info' : 'default'}>
              {quote.status}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[9.5px] sm:text-[11px] font-mono text-dark/60 bg-[#F8F7F4] px-2 sm:px-3 py-1 rounded-xl border border-[#D6CFC2] whitespace-nowrap">
            🟢 Draft · {lastSavedTime}
          </span>
        </div>
      </div>

      {/* MOBILE / TABLET TAB SWITCHER (< lg) */}
      <div className="flex lg:hidden bg-white p-1 rounded-xl border border-[#D6CFC2] gap-1 shadow-xs mb-2">
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-1.5 text-xs font-bold font-mono rounded-lg transition-all cursor-pointer ${mobileTab === 'editor' ? 'bg-[#33422C] text-white shadow-xs' : 'text-dark/70 hover:bg-[#F8F7F4]'
            }`}
        >
          📝 Form Editor
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-1.5 text-xs font-bold font-mono rounded-lg transition-all cursor-pointer ${mobileTab === 'preview' ? 'bg-[#33422C] text-white shadow-xs' : 'text-dark/70 hover:bg-[#F8F7F4]'
            }`}
        >
          👁️ Live Preview (Page {previewPage}/6)
        </button>
      </div>

      {/* THREE-ZONE MAIN GRID LAYOUT */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start min-h-0 overflow-visible lg:overflow-hidden">

        {/* ========================================================= */}
        {/* ZONE 1: LEFT COLUMN - STEP NAVIGATION (3 Cols)            */}
        {/* ========================================================= */}
        <div className={`lg:col-span-3 space-y-3 lg:overflow-y-auto lg:max-h-[calc(100vh-210px)] pr-1 ${mobileTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
          <div className="bg-white rounded-2xl p-3.5 border border-[#D6CFC2] shadow-xs space-y-2.5">
            <h3 className="font-serif font-bold text-lg text-primary whitespace-nowrap">Quote {quote.id}</h3>

            <nav className="space-y-1.5">
              {STEPS.map((step) => {
                const isActive = activeStep === step.id;
                const isCompleted = activeStep > step.id;
                const dynamicSub = step.id === 1 ? `${quote.customer?.name || 'Bjorn Valk'} · ${quote.customer?.city || 'Dongen'}` : step.desc;

                return (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(step.id)}
                    className={`w-full text-left py-2 px-2.5 rounded-xl transition-all flex items-center gap-2.5 cursor-pointer ${isActive
                      ? 'bg-[#33422C] text-[#FDFBF7] shadow-sm font-bold'
                      : 'hover:bg-[#F8F7F4] text-dark border border-transparent'
                      }`}
                  >
                    <span className={`w-5 h-5 rounded-full text-[11px] font-mono font-bold flex items-center justify-center flex-shrink-0 ${isActive
                      ? 'bg-white text-[#33422C]'
                      : isCompleted
                        ? 'bg-[#33422C] text-white'
                        : 'border border-[#D6CFC2] text-dark/60'
                      }`}>
                      {isCompleted ? '✓' : step.number}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-bold leading-tight whitespace-nowrap ${isActive ? 'text-white' : 'text-dark'}`}>{step.title}</p>
                      <p className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-white/80' : 'text-dark/50'}`}>{dynamicSub}</p>
                    </div>
                  </button>
                );
              })}
            </nav>

            <div className="pt-2 border-t border-[#D6CFC2]/60 text-[10px] font-mono text-dark/60 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Auto-saved as draft · {lastSavedTime}</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ZONE 2: MIDDLE COLUMN - ACTIVE STEP FORM (6 Cols)          */}
        {/* ========================================================= */}
        <div ref={stepFormRef} className={`lg:col-span-6 space-y-4 lg:overflow-y-auto lg:max-h-[calc(100vh-210px)] pr-2 ${mobileTab === 'preview' ? 'hidden lg:block' : 'block'}`}>

          {/* Main Title & Subtitle */}
          <div className="space-y-1">
            <h2 className="font-serif font-bold text-3xl text-primary">{STEPS[activeStep - 1].title}</h2>
            <p className="text-xs text-dark/60 font-body">
              {activeStep === 1
                ? 'Everything here returns automatically on every page of the quote — choose once, never retype.'
                : activeStep === 2
                  ? 'Page 1 of the quote. The subtitle writes itself based on step 3.'
                  : activeStep === 3
                    ? 'Page 3 — the most dynamic page. Everything here differs per quote.'
                    : activeStep === 4
                      ? 'Page 4. Totals and instalment amounts calculate themselves — try it: change a price.'
                      : STEPS[activeStep - 1].desc}
            </p>
          </div>

          {/* STEP 1: CUSTOMER & DETAILS */}
          {activeStep === 1 && (
            <div className="space-y-4">

              {/* CARD 1: CUSTOMER */}
              <div className="bg-white rounded-2xl p-5 border border-[#D6CFC2] shadow-2xs space-y-3.5">
                <span className="text-xs font-bold uppercase tracking-wider text-dark/80 font-mono block">CUSTOMER</span>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono">CUSTOMER</label>
                    <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-2 py-0.5 rounded font-mono">AUTOMATIC</span>
                  </div>
                  <select
                    value={quote.customer?.name || 'Bjorn Valk'}
                    onFocus={() => setHighlightField('customer')}
                    onBlur={() => setHighlightField(null)}
                    onChange={(e) => {
                      const selectedName = e.target.value;
                      const leadObj = leadsList.find(l => l.name === selectedName);
                      if (leadObj) {
                        const fullName = leadObj.name;
                        const first = leadObj.firstName || fullName.split(' ')[0];
                        const cityVal = leadObj.city || leadObj.location || 'Dongen';
                        const emailVal = leadObj.email || leadObj.customerEmail || `${first.toLowerCase()}@mail.nl`;
                        const phoneVal = leadObj.phone || leadObj.customerPhone || '+31 6 53562542';
                        const addrVal = leadObj.address || 'Dongeheuvel 3, 5101 WE Dongen';

                        setQuote(prev => ({
                          ...prev,
                          customer: {
                            name: fullName,
                            firstName: first,
                            city: cityVal,
                            email: emailVal,
                            phone: phoneVal,
                            address: addrVal
                          }
                        }));
                      } else if (selectedName === 'Bjorn Valk') {
                        setQuote(prev => ({
                          ...prev,
                          customer: {
                            name: 'Bjorn Valk',
                            firstName: 'Bjorn',
                            city: 'Dongen',
                            address: 'Dongeheuvel 3, 5101 WE Dongen',
                            phone: '+31 6 53562542',
                            email: 'bjorn@mail.nl'
                          }
                        }));
                      } else {
                        updateCustomerField('name', selectedName);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-[#F8F7F4] border border-[#D6CFC2] rounded-xl text-xs font-bold text-dark focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="Bjorn Valk">Bjorn Valk (Lead)</option>
                    {leadsList.filter(l => l.name !== 'Bjorn Valk').map((lead, idx) => (
                      <option key={idx} value={lead.name}>{lead.name} (Lead)</option>
                    ))}
                  </select>
                  <p className="text-[11px] text-dark/50 italic mt-1 font-body">Fills name, first name, address, city and email throughout the quote</p>
                </div>

                {/* Grey Customer Card Summary */}
                <div className="p-4 bg-[#EFECE6] rounded-xl border border-[#D6CFC2]/70 space-y-1.5 text-xs text-dark/80 font-body">
                  <p className="font-semibold text-dark">
                    {quote.customer?.name || 'Bjorn Valk'} · {quote.customer?.address || 'Dongeheuvel 3'}, <strong className="font-bold text-primary">{quote.customer?.city || 'Dongen'}</strong> · {quote.customer?.phone || '+31 6 53562542'} · {quote.customer?.email || 'bjorn@mail.nl'}
                  </p>
                  <div className="flex justify-between items-center text-[11px] pt-0.5">
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <span>✓</span> email present (needed for the approval link)
                    </span>
                    <span className="text-dark/60 underline cursor-pointer hover:text-dark">edit in customer record</span>
                  </div>
                </div>
              </div>

              {/* CARD 2: QUOTE */}
              <div className="bg-white rounded-2xl p-5 border border-[#D6CFC2] shadow-2xs space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-dark/80 font-mono block">QUOTE</span>

                {/* Row 1: Quote Number & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono">QUOTE NUMBER</label>
                      <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-2 py-0.5 rounded font-mono">AUTOMATIC</span>
                    </div>
                    <input
                      type="text"
                      disabled
                      value={quote.id}
                      className="w-full px-3.5 py-2.5 bg-[#EFECE6] border border-[#D6CFC2] rounded-xl font-bold font-mono text-dark"
                    />
                    <p className="text-[10px] text-dark/50 mt-1 font-body">🔒 automatic counter — not editable</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono">STATUS</label>
                      <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-2 py-0.5 rounded font-mono">AUTOMATIC</span>
                    </div>
                    <div className="pt-0.5">
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#EFECE6] text-dark text-xs font-bold rounded-full border border-[#D6CFC2]">
                        <span className="w-2 h-2 rounded-full bg-dark"></span>
                        <span>{quote.status}</span>
                      </span>
                    </div>
                    <p className="text-[10px] text-dark/50 mt-1.5 font-body">becomes Verzonden (sent) / Akkoord (approved) / Verlopen (expired) via the flow</p>
                  </div>
                </div>

                {/* Row 2: Quote Date, Valid Until, Product Type */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono">QUOTE DATE</label>
                      <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono">AUTOMATIC</span>
                    </div>
                    <input
                      type="date"
                      value={quote.date}
                      onFocus={() => setHighlightField('date')}
                      onBlur={() => setHighlightField(null)}
                      onChange={(e) => setQuote(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl font-bold text-dark"
                    />
                    <p className="text-[10px] text-dark/50 mt-1 font-body">default today</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono">VALID UNTIL</label>
                      <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono">AUTOMATIC</span>
                    </div>
                    <input
                      type="date"
                      value={quote.validUntil}
                      onFocus={() => setHighlightField('date')}
                      onBlur={() => setHighlightField(null)}
                      onChange={(e) => setQuote(prev => ({ ...prev, validUntil: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl font-bold text-dark"
                    />
                    <p className="text-[10px] text-dark/50 mt-1 font-body">default +30 days - also drives the badge on p4, the terms line on p5 and the approval-link expiry</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono">PRODUCT TYPE</label>
                      <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono">MANUAL</span>
                    </div>
                    <select
                      value={quote.productType || 'Outdoor kitchen'}
                      onFocus={() => setHighlightField('wood')}
                      onBlur={() => setHighlightField(null)}
                      onChange={(e) => handleProductTypeChange(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl font-bold text-dark"
                    >
                      <option value="Outdoor kitchen">Outdoor kitchen</option>
                      <option value="Garden room">Garden room</option>
                      <option value="Veranda">Veranda</option>
                      <option value="Poolhouse">Poolhouse</option>
                    </select>
                    <p className="text-[10px] text-dark/50 mt-1 font-body">selects template + default texts</p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 2: COVER */}
          {activeStep === 2 && (
            <div className="space-y-4">

              {/* CARD 1: TITLE & SUBTITLE */}
              <div className="bg-white rounded-2xl p-5 border border-[#D6CFC2] shadow-2xs space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-dark/80 font-mono block">COVER TITLES & SUBTITLE</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase">PAGE 1 COVER</span>
                </div>

                {/* Title Line 1 & Title Line 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono">TITLE LINE 1</label>
                      <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono">EDITABLE</span>
                    </div>
                    <input
                      type="text"
                      value={quote.cover?.titleLine1 !== undefined ? quote.cover.titleLine1 : 'Uw buitenkeuken,'}
                      onFocus={() => setHighlightField('title')}
                      onBlur={() => setHighlightField(null)}
                      onChange={(e) => updateCoverField('titleLine1', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#D6CFC2] rounded-xl font-bold text-dark text-xs focus:outline-none focus:border-primary"
                      placeholder="Uw buitenkeuken,"
                    />
                    <p className="text-[10px] text-dark/50 mt-1 font-body">Main cover title (top line)</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono">TITLE LINE 2</label>
                      <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono">EDITABLE</span>
                    </div>
                    <input
                      type="text"
                      value={quote.cover?.titleLine2 !== undefined ? quote.cover.titleLine2 : 'op maat gemaakt.'}
                      onFocus={() => setHighlightField('title')}
                      onBlur={() => setHighlightField(null)}
                      onChange={(e) => updateCoverField('titleLine2', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#D6CFC2] rounded-xl font-bold text-dark text-xs focus:outline-none focus:border-primary"
                      placeholder="op maat gemaakt."
                    />
                    <p className="text-[10px] text-dark/50 mt-1 font-body">Main cover title (italic bottom line)</p>
                  </div>
                </div>

                {/* Subtitle Section */}
                {(() => {
                  const woodVal = quote.configuration?.woodType || 'Thermo Fraké';
                  const dimVal = (quote.configuration?.dimensions || '240 × 80').replace(/\s*cm$/i, '').trim();
                  const cutoutVal = quote.configuration?.optionsTitle || 'Big Green Egg Large';
                  const autoSubString = `${woodVal} · ${dimVal} cm · ${cutoutVal}`;
                  const isOverride = quote.cover?.subtitleOverrideEnabled || false;

                  return (
                    <div className="space-y-2 pt-2 border-t border-[#D6CFC2]/60">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono">SUBTITLE</label>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase ${isOverride ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                            {isOverride ? 'CUSTOM OVERRIDE' : 'AUTOMATIC (STEP 3)'}
                          </span>
                        </div>
                      </div>

                      {isOverride ? (
                        <div>
                          <input
                            type="text"
                            value={quote.cover?.customSubtitle || ''}
                            onFocus={() => setHighlightField('wood')}
                            onBlur={() => setHighlightField(null)}
                            onChange={(e) => updateCoverField('customSubtitle', e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-amber-400 rounded-xl font-bold text-dark text-xs focus:outline-none focus:ring-2 focus:ring-amber-300"
                            placeholder={autoSubString}
                          />
                          <p className="text-[10px] text-amber-800 mt-1 font-body">Custom override active — replaces automatic configuration string in preview & PDF</p>
                        </div>
                      ) : (
                        <div className="p-3.5 bg-[#EFECE6] rounded-xl border border-[#D6CFC2]/70 font-semibold text-xs text-dark flex items-center justify-between">
                          <span className="font-mono text-xs">{autoSubString}</span>
                          <span className="text-[10px] text-dark/50 italic font-body">Follows Step 3</span>
                        </div>
                      )}

                      <label className="flex items-center gap-2 cursor-pointer text-[11px] text-dark/70 pt-1">
                        <input
                          type="checkbox"
                          checked={isOverride}
                          onChange={(e) => updateCoverField('subtitleOverrideEnabled', e.target.checked)}
                          className="w-4 h-4 rounded text-primary border-[#D6CFC2] focus:ring-primary/20 cursor-pointer"
                        />
                        <span className="font-medium">Enable Custom Subtitle Override (manual text entry)</span>
                      </label>
                    </div>
                  );
                })()}
              </div>

              {/* CARD 2: COVER PHOTOS (3 SLOTS) */}
              <div className="bg-white rounded-2xl p-5 border border-[#D6CFC2] shadow-2xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-dark/80 font-mono block">COVER PHOTOS (3 SLOTS)</span>
                    <p className="text-[11px] text-dark/50 font-body">Select or upload 3 high-resolution photos for the Cover Page footer strip</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updateCoverField('photos', ['/outdoor_project_card.png', '/dasbordes images.png', '/outdoor_project_card.png']);
                      updateCoverField('titleLine1', 'Uw buitenkeuken,');
                      updateCoverField('titleLine2', 'op maat gemaakt.');
                      updateCoverField('subtitleOverrideEnabled', false);
                      updateCoverField('customSubtitle', '');
                      setPhotoWarnings({});
                      showToast('✓ Cover defaults restored!');
                    }}
                    className="px-3 py-1.5 bg-[#EFECE6] hover:bg-[#E5DFD5] border border-[#D6CFC2] text-dark/80 font-mono text-[10px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>↺ Restore Cover Defaults</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { slot: 0, label: 'Hero Photo (Left)', defaultImg: '/outdoor_project_card.png' },
                    { slot: 1, label: 'Project Photo (Center)', defaultImg: '/dasbordes images.png' },
                    { slot: 2, label: 'Detail Photo (Right)', defaultImg: '/outdoor_project_card.png' }
                  ].map(({ slot, label, defaultImg }) => {
                    const photosArr = quote.cover?.photos || ['/outdoor_project_card.png', '/dasbordes images.png', '/outdoor_project_card.png'];
                    const currentPhoto = photosArr[slot] || defaultImg;
                    const warning = photoWarnings[slot];

                    return (
                      <div
                        key={slot}
                        className="bg-[#F8F7F4] border border-[#D6CFC2] rounded-xl p-3 space-y-2 relative"
                        onMouseEnter={() => setHighlightField('photos')}
                        onMouseLeave={() => setHighlightField(null)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-dark/70 font-mono">{label}</span>
                          <span className="text-[9px] font-bold font-mono px-1.5 py-0.2 bg-[#EDE8DF] text-dark/60 rounded">SLOT {slot + 1}</span>
                        </div>

                        {/* Image Preview Box */}
                        <div className="h-28 w-full rounded-lg overflow-hidden border border-[#D6CFC2] bg-white relative group">
                          <img
                            src={currentPhoto}
                            alt={label}
                            className="w-full h-full object-cover object-center"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = defaultImg;
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                            <label
                              htmlFor={`cover-photo-input-${slot}`}
                              className="px-2.5 py-1 bg-white text-dark text-[10px] font-bold font-mono rounded shadow-xs cursor-pointer hover:bg-cream"
                            >
                              Replace
                            </label>
                          </div>
                        </div>

                        {/* Low Resolution Warning Badge if uploaded image < 600px */}
                        {warning && (
                          <div className="bg-amber-50 border border-amber-300 text-amber-900 p-1.5 rounded-md text-[10px] font-body flex items-center gap-1">
                            <span className="text-amber-600 font-bold">⚠️</span>
                            <span>Low resolution ({warning.width}×{warning.height}px)</span>
                          </div>
                        )}

                        <input
                          type="file"
                          id={`cover-photo-input-${slot}`}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (evt) => {
                                const dataUrl = evt.target.result;
                                const imgObj = new Image();
                                imgObj.onload = () => {
                                  const isLow = imgObj.width < 600 || imgObj.height < 600;
                                  if (isLow) {
                                    setPhotoWarnings(prev => ({ ...prev, [slot]: { width: imgObj.width, height: imgObj.height } }));
                                    showToast(`⚠️ Photo ${slot + 1} updated (${imgObj.width}×${imgObj.height}px) - low resolution warning`);
                                  } else {
                                    setPhotoWarnings(prev => {
                                      const next = { ...prev };
                                      delete next[slot];
                                      return next;
                                    });
                                    showToast(`✓ Photo ${slot + 1} updated (${imgObj.width}×${imgObj.height}px)!`);
                                  }
                                  const newPhotos = [...(quote.cover?.photos || ['/outdoor_project_card.png', '/dasbordes images.png', '/outdoor_project_card.png'])];
                                  newPhotos[slot] = dataUrl;
                                  updateCoverField('photos', newPhotos);
                                };
                                imgObj.src = dataUrl;
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />

                        <div className="flex items-center justify-between text-[10px] pt-0.5">
                          <label htmlFor={`cover-photo-input-${slot}`} className="text-primary font-bold hover:underline cursor-pointer">
                            📁 Upload Photo
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const newPhotos = [...(quote.cover?.photos || ['/outdoor_project_card.png', '/dasbordes images.png', '/outdoor_project_card.png'])];
                              newPhotos[slot] = defaultImg;
                              updateCoverField('photos', newPhotos);
                              setPhotoWarnings(prev => {
                                const next = { ...prev };
                                delete next[slot];
                                return next;
                              });
                              showToast(`Photo ${slot + 1} reset to default`);
                            }}
                            className="text-dark/50 hover:text-dark underline"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* STEP 3: CONFIGURATION */}
          {activeStep === 3 && (
            <div className="space-y-4">

              {/* CARD 1: STAT TILES (ALWAYS 4) */}
              <div className="bg-white rounded-2xl p-5 border border-[#D6CFC2] shadow-2xs space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-dark/80 font-mono block">STAT TILES (ALWAYS 4)</span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Tile 1: Dimensions */}
                  <div className="p-3.5 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2]/70 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono">DIMENSIONS</label>
                      <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">MANUAL</span>
                    </div>
                    <input
                      type="text"
                      value={quote.configuration?.dimensions || '240 × 80'}
                      onChange={(e) => updateConfigField('dimensions', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl font-bold text-dark text-xs"
                      placeholder="e.g. 240 × 80"
                    />
                    <input
                      type="text"
                      value="centimeter"
                      disabled
                      className="w-full px-3 py-1.5 bg-[#EFECE6] border border-[#D6CFC2]/60 rounded-lg text-xs font-semibold text-dark/70"
                    />
                    <p className="text-[10px] text-dark/50 font-body">value: {(quote.configuration?.dimensions || '').length}/16 chars</p>
                  </div>

                  {/* Tile 2: Wood Type */}
                  <div className="p-3.5 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2]/70 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono">WOOD TYPE</label>
                      <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">LIBRARY OR FREE TEXT</span>
                    </div>
                    <select
                      value={quote.configuration?.woodType || 'Thermo Fraké'}
                      onChange={(e) => handleWoodTypeSelect(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl font-bold text-dark text-xs cursor-pointer"
                    >
                      {WOOD_LIBRARY.map((w) => (
                        <option key={w.id} value={w.name}>{w.name}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={`lifespan ${quote.configuration?.woodLifespan || (language === 'EN' ? '20 to 25 years' : '20 tot 25 jaar')}`}
                      disabled
                      className="w-full px-3 py-1.5 bg-[#EFECE6] border border-[#D6CFC2]/60 rounded-lg text-xs font-semibold text-dark/70"
                    />
                    <p className="text-[10px] text-dark/50 font-body">a library choice fills the infobox + subtitle + line item automatically · custom wood type = fill in yourself</p>
                  </div>

                  {/* Tile 3: Cutout */}
                  <div className="p-3.5 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2]/70 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono">{language === 'EN' ? 'CUTOUT' : 'UITSPARING'}</label>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">FOLLOWS OPTIONS</span>
                    </div>
                    <input
                      type="text"
                      value={quote.configuration?.optionsTitle || 'Big Green Egg'}
                      onChange={(e) => updateConfigField('optionsTitle', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl font-bold text-dark text-xs"
                    />
                    <input
                      type="text"
                      value={language === 'EN' ? 'Large, right of center' : 'Large, rechts van het midden'}
                      disabled
                      className="w-full px-3 py-1.5 bg-[#EFECE6] border border-[#D6CFC2]/60 rounded-lg text-xs font-semibold text-dark/70"
                    />
                    <p className="text-[10px] text-dark/50 font-body">filled from the "Options & features" block below · freely editable afterwards</p>
                  </div>

                  {/* Tile 4: Delivery Time */}
                  <div className="p-3.5 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2]/70 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono">DELIVERY TIME</label>
                      <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">MANUAL</span>
                    </div>
                    <input
                      type="text"
                      value={quote.configuration?.deliveryTime || (language === 'EN' ? '3 to 5 weeks' : '3 tot 5 weken')}
                      onChange={(e) => updateConfigField('deliveryTime', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl font-bold text-dark text-xs"
                    />
                    <input
                      type="text"
                      value={language === 'EN' ? 'upon drawing approval' : 'na akkoord op tekening'}
                      disabled
                      className="w-full px-3 py-1.5 bg-[#EFECE6] border border-[#D6CFC2]/60 rounded-lg text-xs font-semibold text-dark/70"
                    />
                    <p className="text-[10px] text-dark/50 font-body">also appears as the badge at process step "Production" (p6)</p>
                  </div>
                </div>
              </div>

              {/* CARD 2: OPTIONS & FEATURES */}
              <div className="bg-white rounded-2xl p-5 border border-[#D6CFC2] shadow-2xs space-y-3.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-dark/80 font-mono">OPTIONS & FEATURES</span>
                    <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">MANUAL</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-dark/50 uppercase">ON/OFF PER QUOTE</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {/* Option 1: BBQ Cutout (with brand dropdown & detail subtext) */}
                  <div className="p-3 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2]/70 flex flex-wrap items-center justify-between gap-2">
                    <label className="flex items-center gap-2 font-bold text-dark cursor-pointer">
                      <input
                        type="checkbox"
                        checked={quote.configuration?.options?.bbqCutout?.enabled !== false}
                        onChange={(e) => handleOptionToggle('bbqCutout', e.target.checked)}
                        className="w-4 h-4 text-primary rounded border-[#D6CFC2]"
                      />
                      <span>BBQ Cutout</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={quote.configuration?.options?.bbqCutout?.type || 'Big Green Egg'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQuote(prev => {
                            const updatedDiagram = { ...(prev.configuration?.diagram || {}) };
                            if (updatedDiagram.segments) {
                              updatedDiagram.segments = updatedDiagram.segments.map(seg =>
                                seg.type === 'CUTOUT' ? { ...seg, label: val } : seg
                              );
                            }
                            return {
                              ...prev,
                              configuration: {
                                ...prev.configuration,
                                optionsTitle: val,
                                diagram: updatedDiagram,
                                options: {
                                  ...prev.configuration?.options,
                                  bbqCutout: { ...prev.configuration?.options?.bbqCutout, type: val }
                                }
                              }
                            };
                          });
                        }}
                        className="px-2.5 py-1.5 bg-white border border-[#D6CFC2] rounded-lg font-bold text-xs"
                      >
                        <option value="Big Green Egg">Big Green Egg</option>
                        <option value="Kamado Joe">Kamado Joe</option>
                        <option value="Bastard">Bastard</option>
                      </select>
                      <input
                        type="text"
                        value={language === 'EN' ? 'Large, right of center' : 'Large, rechts van het midden'}
                        disabled
                        className="px-3 py-1.5 bg-white border border-[#D6CFC2] rounded-lg text-xs font-semibold text-dark/80"
                      />
                    </div>
                  </div>

                  {/* Additional Data-Driven Options */}
                  {[
                    { key: 'fridge', label: 'Fridge (built-in)', hint: '→ specification line + optional line item + diagram segment' },
                    { key: 'sink', label: 'Sink with tap', hint: '→ specification line + optional line item + diagram segment' }
                  ].map((optItem) => (
                    <div key={optItem.key} className="p-3 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2]/70 flex flex-wrap items-center justify-between gap-2">
                      <label className="flex items-center gap-2 font-bold text-dark cursor-pointer">
                        <input
                          type="checkbox"
                          checked={quote.configuration?.options?.[optItem.key]?.enabled || false}
                          onChange={(e) => handleOptionToggle(optItem.key, e.target.checked)}
                          className="w-4 h-4 text-primary rounded border-[#D6CFC2]"
                        />
                        <span>{optItem.label}</span>
                      </label>
                      <span className="text-[11px] font-mono text-dark/50">{optItem.hint}</span>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-dark/60 font-body">
                  Every enabled option automatically lands in: stat tile 3 · cover subtitle · a specification line (p3). Off = removed everywhere. An option is priced via a line item in step 4 (library).
                </p>
              </div>

              {/* CARD 3: SPECIFICATIONS */}
              <div className="bg-white rounded-2xl p-5 border border-[#D6CFC2] shadow-2xs space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-dark/80 font-mono">SPECIFICATIONS</span>
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded ${totalSpecLines > 12 ? 'bg-red-100 text-red-800 border border-red-300' : 'text-dark/50'
                      }`}>
                      {totalSpecLines} / 12 LINES {totalSpecLines > 12 ? '⚠️ OVERFLOW' : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        handleAddSpecLine(0);
                        showToast('New specification line added!');
                      }}
                      className="px-3 py-1 bg-[#33422C] text-white text-xs font-bold rounded-lg font-mono hover:bg-[#283523] cursor-pointer shadow-2xs"
                    >
                      + line
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const specs = [...(quote.configuration?.specifications || [])];
                        specs.push({
                          id: `sec-${Date.now()}`,
                          title: 'NIEUWE SECTIE',
                          lines: [{ id: `l-${Date.now()}`, text: 'Nieuwe specificatie regel' }]
                        });
                        updateConfigField('specifications', specs);
                        showToast('New section added!');
                      }}
                      className="px-3 py-1 bg-white border border-[#33422C] text-dark text-xs font-bold rounded-lg font-mono hover:bg-[#EDE8DF] cursor-pointer shadow-2xs"
                    >
                      + section
                    </button>
                  </div>
                </div>

                {totalSpecLines > 12 && (
                  <div className="bg-amber-50 border border-amber-300 text-amber-900 p-2.5 rounded-xl text-xs flex items-center gap-2 font-body font-medium">
                    <span className="text-amber-600 font-bold text-sm">⚠️</span>
                    <span>Warning: {totalSpecLines} lines configured. Page 3 proposal template fits max 12 lines — content will overflow!</span>
                  </div>
                )}

                <div className="space-y-4">
                  {(quote.configuration?.specifications || []).map((sec, secIdx) => (
                    <div key={sec.id || secIdx} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-dark/80 font-mono uppercase tracking-wider">{sec.title}</span>
                        {sec.title === 'BEZORGING' && (
                          <span className="bg-[#EFECE6] text-dark/70 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">DEFAULT</span>
                        )}
                      </div>

                      <div className="space-y-2">
                        {(sec.lines || []).map((line, lineIdx) => (
                          <div key={line.id || lineIdx} className="flex items-center gap-2.5 p-3 bg-white border border-[#D6CFC2] rounded-xl text-xs shadow-2xs hover:border-primary/40 transition-all">
                            <span className="text-dark/40 font-mono cursor-grab text-xs tracking-tighter flex-shrink-0">::</span>
                            <span className="text-[#33422C] font-bold text-xs flex-shrink-0">✓</span>
                            <input
                              type="text"
                              value={line.text}
                              onChange={(e) => handleSpecLineTextChange(secIdx, lineIdx, e.target.value)}
                              className="flex-1 bg-transparent border-none focus:outline-none text-xs text-dark font-body font-medium"
                            />
                            {line.isOption && (
                              <span className="text-[10px] font-mono text-dark/40 italic flex-shrink-0">← option</span>
                            )}
                            {sec.title === 'BEZORGING' && (
                              <span className="text-[10px] font-mono text-dark/50 flex-shrink-0">{`{city} automatic`}</span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                handleRemoveSpecLine(secIdx, lineIdx);
                                showToast('Specification line deleted');
                              }}
                              className="p-1 text-dark/40 hover:text-red-600 font-bold transition-colors flex-shrink-0"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD 4: CONFIGURATION PHOTO (PAGE 3 HERO PHOTO) */}
              <div className="bg-white rounded-2xl p-5 border border-[#D6CFC2] shadow-2xs space-y-3.5 font-body">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-dark/80 font-mono">
                      {language === 'EN' ? 'CONFIGURATION PHOTO (PAGE 3)' : 'CONFIGURATIE FOTO (PAGINA 3)'}
                    </span>
                    <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">CUSTOM PHOTO</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-dark/50 uppercase">APPEARS ON PROPOSAL PAGE 3</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#F8F7F4] p-4 rounded-xl border border-[#D6CFC2]/70">
                  <div className="relative w-full sm:w-60 h-40 rounded-xl overflow-hidden border border-[#D6CFC2] flex-shrink-0 bg-[#EAE5DC] flex items-center justify-center p-1.5 shadow-inner">
                    <img
                      src={quote.configuration?.configPhoto || projectImg}
                      alt="Configuration Preview"
                      className="max-h-full max-w-full object-contain rounded-lg shadow-2xs"
                      onError={(e) => { e.target.onerror = null; e.target.src = projectImg; }}
                    />
                  </div>

                  <div className="space-y-2 flex-1 text-xs">
                    <p className="font-bold text-dark text-xs">
                      {language === 'EN' ? 'Upload Custom 3D / Project Photo' : 'Upload Aangepaste 3D / Projectfoto'}
                    </p>
                    <p className="text-[11px] text-dark/60">
                      {language === 'EN'
                        ? 'This photo is shown on Page 3 of the proposal next to the specifications and front-view diagram.'
                        : 'Deze foto wordt getoond op Pagina 3 van de offerte naast de specificaties en het vooraanzicht.'}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <input
                        type="file"
                        id="config-photo-uploader"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              updateConfigField('configPhoto', evt.target.result);
                              showToast('Configuration photo updated successfully!');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label
                        htmlFor="config-photo-uploader"
                        className="px-3 py-1.5 bg-[#33422C] text-white font-bold rounded-lg font-mono text-xs hover:bg-[#283523] cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
                      >
                        <span>📷 {language === 'EN' ? 'Upload New Photo' : 'Nieuwe Foto Uploaden'}</span>
                      </label>

                      {quote.configuration?.configPhoto && (
                        <button
                          type="button"
                          onClick={() => {
                            updateConfigField('configPhoto', null);
                            showToast('Configuration photo reset to default');
                          }}
                          className="px-3 py-1.5 bg-white border border-[#D6CFC2] text-dark/70 font-bold rounded-lg font-mono text-xs hover:bg-gray-100 cursor-pointer"
                        >
                          {language === 'EN' ? 'Restore Default' : 'Standaard Herstellen'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 5: FRONT-VIEW LAYOUT (DIAGRAM BUILDER) */}
              <div className="bg-white rounded-2xl p-5 border border-[#D6CFC2] shadow-2xs space-y-4">
                <div className="flex justify-between items-center border-b border-[#D6CFC2]/60 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-dark/80 font-mono">FRONT-VIEW LAYOUT</span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-primary">
                    <input
                      type="checkbox"
                      checked={quote.configuration?.diagram?.show !== false}
                      onChange={(e) => {
                        const show = e.target.checked;
                        updateConfigField('diagram', { ...quote.configuration?.diagram, show });
                      }}
                      className="w-3.5 h-3.5 rounded text-primary border-[#D6CFC2]"
                    />
                    <span>show on quote</span>
                  </label>
                </div>

                <DiagramBuilder
                  diagram={quote.configuration?.diagram}
                  onChange={(updatedDiagram) => updateConfigField('diagram', updatedDiagram)}
                />
              </div>

              {/* CARD 5: INFOBOX */}
              <div className="bg-white rounded-2xl p-5 border border-[#D6CFC2] shadow-2xs space-y-4">
                <div className="flex justify-between items-center border-b border-[#D6CFC2]/60 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-dark/80 font-mono">INFOBOX</span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-primary">
                    <input
                      type="checkbox"
                      checked={quote.configuration?.infobox?.show !== false}
                      onChange={(e) => {
                        const show = e.target.checked;
                        updateConfigField('infobox', { ...quote.configuration?.infobox, show });
                      }}
                      className="w-3.5 h-3.5 rounded text-primary border-[#D6CFC2]"
                    />
                    <span>show on quote</span>
                  </label>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono">TITLE</label>
                      <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">FOLLOWS WOOD TYPE</span>
                    </div>
                    <input
                      type="text"
                      value={quote.configuration?.infobox?.title || (language === 'EN' ? 'About Thermo Fraké' : 'Over Thermo Fraké')}
                      onChange={(e) => updateConfigField('infobox', { ...quote.configuration?.infobox, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#D6CFC2] rounded-xl font-bold text-dark text-xs focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono">TEXT</label>
                        <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">FOLLOWS WOOD TYPE</span>
                      </div>
                      <span className="text-[10px] font-mono text-dark/50">{(quote.configuration?.infobox?.text || '').length}/220</span>
                    </div>
                    <textarea
                      rows={3}
                      value={quote.configuration?.infobox?.text || ''}
                      onChange={(e) => updateConfigField('infobox', { ...quote.configuration?.infobox, text: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#D6CFC2] rounded-xl text-xs text-dark focus:outline-none focus:border-primary font-body"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* STEP 4: INVESTMENT */}
          {activeStep === 4 && (
            <div className="space-y-4 font-body">

              {/* CARD 1: LINE ITEMS */}
              <div className="bg-white rounded-2xl p-5 border border-[#D6CFC2] shadow-2xs space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-dark/80 font-mono">LINE ITEMS</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleAddLineItem();
                        showToast('New line item added!');
                      }}
                      className="px-3 py-1 bg-[#33422C] text-white text-xs font-bold rounded-lg font-mono hover:bg-[#283523] cursor-pointer shadow-2xs"
                    >
                      + line
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowLibraryModal(true)}
                      className="px-3 py-1 bg-white border border-[#33422C] text-dark text-xs font-bold rounded-lg font-mono hover:bg-[#EDE8DF] cursor-pointer shadow-2xs flex items-center gap-1"
                    >
                      <span>+ from library</span>
                      <span className="text-[10px]">▼</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {(quote.investment?.lineItems || []).map((item, idx) => (
                    <div key={item.id || idx} className="p-4 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2]/70 space-y-2.5">
                      {/* Row 1: Title, Qty, Price, VAT, Included */}
                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 text-xs">
                        <input
                          type="text"
                          value={item.title || ''}
                          onChange={(e) => handleLineItemChange(idx, 'title', e.target.value)}
                          placeholder="Line item title"
                          className="w-full sm:flex-1 px-3.5 py-2 bg-white border border-[#D6CFC2] rounded-xl font-bold text-dark text-xs focus:outline-none focus:border-primary"
                        />

                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity || 1}
                            onChange={(e) => handleLineItemChange(idx, 'quantity', Math.max(1, Number(e.target.value) || 1))}
                            className="w-14 px-2 py-2 bg-white border border-[#D6CFC2] rounded-xl font-bold text-center font-mono text-xs focus:outline-none"
                          />
                          <span className="text-dark/50 font-bold">×</span>
                          <div className="flex items-center gap-1 bg-white border border-[#D6CFC2] rounded-xl px-3 py-2 font-mono font-bold text-xs text-dark">
                            <span>€</span>
                            <input
                              type="number"
                              step="0.01"
                              value={item.priceInclVat ?? 0}
                              onChange={(e) => handleLineItemChange(idx, 'priceInclVat', e.target.value === '' ? 0 : Number(e.target.value))}
                              className="w-20 bg-transparent border-none focus:outline-none font-bold text-dark"
                            />
                          </div>
                        </div>

                        <select
                          value={item.vatRate || 21}
                          onChange={(e) => handleLineItemChange(idx, 'vatRate', Number(e.target.value))}
                          className="px-2.5 py-2 bg-white border border-[#D6CFC2] rounded-xl font-bold font-mono text-xs text-dark"
                        >
                          <option value={21}>21%</option>
                          <option value={9}>9%</option>
                          <option value={0}>0%</option>
                        </select>

                        <label className="flex items-center gap-1.5 cursor-pointer font-bold text-xs text-dark font-mono">
                          <input
                            type="checkbox"
                            checked={item.isIncluded || false}
                            onChange={(e) => handleLineItemChange(idx, 'isIncluded', e.target.checked)}
                            className="w-4 h-4 text-primary rounded border-[#D6CFC2]"
                          />
                          <span>included</span>
                        </label>

                        <button
                          type="button"
                          disabled={(quote.investment?.lineItems || []).length <= 1}
                          onClick={() => {
                            handleRemoveLineItem(idx);
                            showToast('Line item removed');
                          }}
                          className="p-1.5 text-dark/40 hover:text-red-600 font-bold transition-colors disabled:opacity-20 ml-auto"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Row 2: Description with live char counter */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-dark/50 font-mono">
                          <span>DESCRIPTION</span>
                          <span>{(item.description || '').length} / 220 chars</span>
                        </div>
                        <input
                          type="text"
                          maxLength={220}
                          value={item.description || ''}
                          onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                          placeholder="Description text"
                          className="w-full px-3.5 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs text-dark/80 focus:outline-none font-body"
                        />
                      </div>

                      {(item.isIncluded || item.priceInclVat === 0) && (
                        <div className="space-y-1 pt-1">
                          <span className="inline-block bg-emerald-100 text-emerald-900 font-bold text-[10px] px-2.5 py-0.5 rounded-md font-mono uppercase">
                            Inbegrepen
                          </span>
                          {item.title?.includes('Bezorging') && (
                            <p className="text-[11px] text-dark/60 font-body">
                              title = "Bezorging &#123;city&#125;" automatic · price € 0 → label "Inbegrepen" on p4 plus GRATIS badge on p3/p6. Try setting the price to 150 and watch the right side.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD 2: FINISH / TREATMENT */}
              <div className="bg-white rounded-2xl p-5 border border-[#D6CFC2] shadow-2xs space-y-3">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-dark/80 font-mono">FINISH / TREATMENT</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-dark/50 uppercase">FREE TEXT FIELD — BECOMES A CHECKLIST LINE</span>
                    <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">MANUAL</span>
                  </div>
                </div>

                <input
                  type="text"
                  value={quote.investment?.finishTreatment || 'Olieafwerking in twee lagen (naturel)'}
                  onChange={(e) => updateInvestmentField('finishTreatment', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D6CFC2] rounded-xl text-xs font-bold text-dark focus:outline-none focus:border-primary"
                />
                <p className="text-[10px] text-dark/50 font-body">leave empty = the line disappears from the checklist</p>
              </div>

              {/* CARD 3: CHECKLIST INBEGREPEN */}
              <div className="bg-white rounded-2xl p-5 border border-[#D6CFC2] shadow-2xs space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-dark/80 font-mono">CHECKLIST "INBEGREPEN BIJ JOUW INVESTERING" (3-6 LINES)</span>
                  <span className="bg-[#EFECE6] text-dark/70 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">DEFAULT</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-white border border-[#D6CFC2] rounded-xl flex items-center gap-2.5 shadow-2xs">
                    <span className="text-[#33422C] font-bold">✓</span>
                    <span className="font-medium text-dark">Volledig maatwerk, gebouwd door een gecertificeerde vakspecialist</span>
                  </div>

                  <div className="p-3 bg-white border border-[#D6CFC2] rounded-xl flex items-center gap-2.5 shadow-2xs">
                    <span className="text-[#33422C] font-bold">✓</span>
                    <span className="font-medium text-dark">Digitale tekening vooraf ter goedkeuring</span>
                  </div>

                  {quote.investment?.finishTreatment && (
                    <div className="p-3 bg-white border border-[#D6CFC2] rounded-xl flex items-center justify-between gap-2.5 shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[#33422C] font-bold">✓</span>
                        <span className="font-medium text-dark">{quote.investment?.finishTreatment}</span>
                      </div>
                      <span className="text-[10px] font-mono text-dark/40 italic">← finish field</span>
                    </div>
                  )}

                  <div className="p-3 bg-white border border-[#D6CFC2] rounded-xl flex items-center justify-between gap-2.5 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[#33422C] font-bold">✓</span>
                      <span className="font-medium text-dark">Gratis bezorging in {quote.customer?.city || 'Dongen'}</span>
                    </div>
                    <span className="text-[10px] font-mono text-dark/50">{`{city} automatic`}</span>
                  </div>

                  <div className="p-3 bg-white border border-[#D6CFC2] rounded-xl flex items-center gap-2.5 shadow-2xs">
                    <span className="text-[#33422C] font-bold">✓</span>
                    <span className="font-medium text-dark">Garantie en nazorg na levering</span>
                  </div>
                </div>
              </div>

              {/* CARD 4: TOTALS */}
              <div className="bg-white rounded-2xl p-5 border border-[#D6CFC2] shadow-2xs space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-dark/80 font-mono">TOTALS</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">CALCULATED — NO INPUT</span>
                </div>

                <div className="bg-[#33422C] text-[#FDFBF7] p-5 rounded-2xl space-y-3 font-mono border border-[#283523] shadow-md">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-[#FDFBF7]/80">Subtotal excl. VAT</span>
                    <span className="font-bold">€ {totals.subtotalExclVat.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-[#FDFBF7]/80">VAT 21%</span>
                    <span className="font-bold">€ {totals.vatAmount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="border-t border-[#46573e] pt-3 flex justify-between items-center">
                    <span className="font-serif font-bold text-base text-[#FDFBF7]">Total incl. VAT</span>
                    <span className="font-serif font-bold text-xl text-[#FDFBF7]">€ {totals.totalInclVat.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* CARD 5: PAYMENT INSTALMENTS */}
              {(() => {
                const count = quote.investment?.instalments?.count || 2;
                const pArr = quote.investment?.instalments?.percentages || (count === 3 ? [30, 40, 30] : [50, 50]);
                const pSum = pArr.reduce((a, b) => a + (Number(b) || 0), 0);
                const isSumValid = pSum === 100;
                const instCards = calculateInstalments(totals.totalInclVat, count, pArr);

                const handleSetCount = (newCount) => {
                  if (isApproved) return;
                  const newPercentages = newCount === 3 ? [30, 40, 30] : [50, 50];
                  updateInvestmentField('instalments', { count: newCount, percentages: newPercentages });
                };

                const handleUpdatePct = (index, val) => {
                  if (isApproved) return;
                  const newArr = [...pArr];
                  newArr[index] = Math.max(0, Math.min(100, Number(val) || 0));
                  updateInvestmentField('instalments', { count, percentages: newArr });
                };

                return (
                  <div className="bg-white rounded-2xl p-5 border border-[#D6CFC2] shadow-2xs space-y-4">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-dark/80 font-mono">PAYMENT INSTALMENTS</span>
                        <div className="flex items-center gap-1 font-mono text-[10px]">
                          <button
                            type="button"
                            onClick={() => handleSetCount(2)}
                            className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${count === 2 ? 'bg-[#33422C] text-white' : 'bg-[#EFECE6] text-dark/70 hover:bg-[#E2DDD3]'
                              }`}
                          >
                            2 Instalments (50/50)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetCount(3)}
                            className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${count === 3 ? 'bg-[#33422C] text-white' : 'bg-[#EFECE6] text-dark/70 hover:bg-[#E2DDD3]'
                              }`}
                          >
                            3 Instalments (30/40/30)
                          </button>
                        </div>
                      </div>

                      <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-md ${isSumValid ? 'text-emerald-800 bg-emerald-100' : 'text-red-800 bg-red-100'
                        }`}>
                        SUM = {pSum}% {isSumValid ? '✓' : '⚠️ Must equal 100%'}
                      </span>
                    </div>

                    <div className={`grid grid-cols-1 ${count === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4`}>
                      {instCards.map((inst, idx) => (
                        <div key={idx} className="p-4 bg-white border border-[#D6CFC2] rounded-xl space-y-3 shadow-2xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-dark/70 font-mono block">
                            INSTALMENT {idx + 1} · {idx === 0 ? 'BIJ AKKOORD (ON APPROVAL)' : idx === 1 ? (count === 3 ? 'BIJ START BOUW (PRODUCTION)' : 'BIJ LEVERING (ON DELIVERY)') : 'BIJ LEVERING (ON DELIVERY)'}
                          </span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={pArr[idx] ?? inst.percentage}
                              onChange={(e) => handleUpdatePct(idx, e.target.value)}
                              className="w-16 px-2.5 py-1.5 bg-white border border-[#D6CFC2] rounded-lg text-xs font-bold text-center font-mono text-dark focus:outline-none focus:border-primary"
                            />
                            <span className="font-bold text-xs font-mono text-dark">%</span>
                          </div>
                          <p className="text-sm font-bold font-mono text-primary">
                            € {inst.amount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      ))}
                    </div>

                    <p className="text-[11px] text-dark/60 font-body">
                      percentages adjustable · amounts recalculate automatically · last instalment = remainder (exact to the cent)
                    </p>
                  </div>
                );
              })()}

            </div>
          )}

          {/* STEP 5: LETTER & PROCESS */}
          {activeStep === 5 && (
            <div className="space-y-4 font-body">

              {/* CARD 1: PERSONAL LETTER (P2) */}
              <div className="bg-white rounded-2xl p-5 border border-[#D6CFC2] shadow-2xs space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-dark/80 font-mono block">PERSONAL LETTER (P2)</span>

                {/* SALUTATION */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono">SALUTATION</label>
                    <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">AUTOMATIC</span>
                  </div>
                  <input
                    type="text"
                    value={quote.letterAndProcess?.salutation || (quote.customer?.firstName ? `Beste ${quote.customer.firstName},` : 'Beste Bjorn,')}
                    onChange={(e) => updateLetterField('salutation', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#EFECE6] border border-[#D6CFC2] rounded-xl font-bold text-xs text-dark focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Accordion 1: Letter text (4 paragraphs) — default, click to edit */}
                <div className="space-y-2">
                  <div
                    onClick={() => setLetterExpanded(!letterExpanded)}
                    className="bg-white border border-[#D6CFC2] rounded-xl p-3.5 flex items-center justify-between cursor-pointer hover:border-primary/40 transition-all shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`text-xs text-dark transition-transform duration-200 inline-block ${letterExpanded ? 'rotate-90' : ''}`}>▶</span>
                      <span className="font-bold text-xs text-dark">Letter text (4 paragraphs) — default, click to edit</span>
                    </div>
                    <span className="bg-gray-200 text-gray-700 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">DEFAULT</span>
                  </div>

                  {letterExpanded && (
                    <div className="p-4 bg-[#F8F7F4] border border-[#D6CFC2] rounded-xl space-y-3 text-xs">
                      <div className="flex justify-between items-center pb-1 border-b border-[#D6CFC2]/60">
                        <span className="font-bold text-dark font-mono text-[11px] uppercase">LETTER PARAGRAPHS</span>
                        <button
                          type="button"
                          onClick={() => {
                            const pDefaults = PRODUCT_TYPE_DEFAULTS[quote.productType || 'Outdoor kitchen']?.letterParagraphs || [
                              'Hartelijk dank voor je aanvraag en het prettige gesprek. Met veel plezier presenteren wij deze persoonlijke offerte voor jouw maatwerk buitenkeuken.',
                              'Bij Vanuit Ambacht geloven we in duurzame materialen, ambachtelijke afwerking en oog voor detail. Wij maken al onze buitenkeukens met de hand in onze werkplaats.',
                              'In dit document vind je het volledige overzicht van jouw gekozen configuratie, inclusief specificaties, vooraanzicht tekening en transparante investering.',
                              'Heb je vragen of wens je nog aanpassingen? Wij denken graag met je mee!'
                            ];
                            updateLetterField('letterParagraphs', [...pDefaults]);
                            showToast('Letter text defaults restored!');
                          }}
                          className="text-[10px] font-mono font-bold text-dark/60 hover:text-dark underline cursor-pointer"
                        >
                          restore defaults
                        </button>
                      </div>

                      {(quote.letterAndProcess?.letterParagraphs || [
                        'Hartelijk dank voor je aanvraag en het prettige gesprek. Met veel plezier presenteren wij deze persoonlijke offerte voor jouw maatwerk buitenkeuken.',
                        'Bij Vanuit Ambacht geloven we in duurzame materialen, ambachtelijke afwerking en oog voor detail. Wij maken al onze buitenkeukens met de hand in onze werkplaats.',
                        'In dit document vind je het volledige overzicht van jouw gekozen configuratie, inclusief specificaties, vooraanzicht tekening en transparante investering.',
                        'Heb je vragen of wens je nog aanpassingen? Wij denken graag met je mee!'
                      ]).map((para, pIdx) => (
                        <div key={pIdx} className="space-y-1">
                          <label className="text-[10px] font-bold text-dark/60 font-mono">PARAGRAPH {pIdx + 1}</label>
                          <textarea
                            rows={2}
                            value={para}
                            onChange={(e) => {
                              const newParas = [...(quote.letterAndProcess?.letterParagraphs || [])];
                              newParas[pIdx] = e.target.value;
                              updateLetterField('letterParagraphs', newParas);
                            }}
                            className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs text-dark focus:outline-none font-body"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Accordion 2: USP cards (4) — only change when the proposition changes */}
                <div className="space-y-2">
                  <div
                    onClick={() => setUspExpanded(!uspExpanded)}
                    className="bg-white border border-[#D6CFC2] rounded-xl p-3.5 flex items-center justify-between cursor-pointer hover:border-primary/40 transition-all shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`text-xs text-dark transition-transform duration-200 inline-block ${uspExpanded ? 'rotate-90' : ''}`}>▶</span>
                      <span className="font-bold text-xs text-dark">USP cards (4) — only change when the proposition changes</span>
                    </div>
                    <span className="bg-gray-200 text-gray-700 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">DEFAULT</span>
                  </div>

                  {uspExpanded && (
                    <div className="p-4 bg-[#F8F7F4] border border-[#D6CFC2] rounded-xl space-y-3 text-xs">
                      <div className="flex justify-between items-center pb-1 border-b border-[#D6CFC2]/60">
                        <span className="font-bold text-dark font-mono text-[11px] uppercase">USP CARDS</span>
                        <button
                          type="button"
                          onClick={() => {
                            const defaultUsps = [
                              { id: 1, title: 'VAKSPECIALISTEN', desc: 'Met de hand gebouwd in onze eigen werkplaats met oog voor detail.' },
                              { id: 2, title: 'ÉÉN AANSPREEKPUNT', desc: 'Direct contact met Tim & Bram vanaf ontwerp tot bezorging.' },
                              { id: 3, title: 'GARANTIE & NAZORG', desc: 'Productgarantie en persoonlijke nazorg bij u aan huis.' },
                              { id: 4, title: 'BEWUST ONLINE', desc: 'Geen dure showroom, maar de scherpste prijs voor topkwaliteit.' }
                            ];
                            updateLetterField('uspCards', defaultUsps);
                            showToast('USP defaults restored!');
                          }}
                          className="text-[10px] font-mono font-bold text-dark/60 hover:text-dark underline cursor-pointer"
                        >
                          restore defaults
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(quote.letterAndProcess?.uspCards || [
                          { id: 1, title: 'VAKSPECIALISTEN', desc: 'Met de hand gebouwd in onze eigen werkplaats met oog voor detail.' },
                          { id: 2, title: 'ÉÉN AANSPREEKPUNT', desc: 'Direct contact met Tim & Bram vanaf ontwerp tot bezorging.' },
                          { id: 3, title: 'GARANTIE & NAZORG', desc: 'Productgarantie en persoonlijke nazorg bij u aan huis.' },
                          { id: 4, title: 'BEWUST ONLINE', desc: 'Geen dure showroom, maar de scherpste prijs voor topkwaliteit.' }
                        ]).map((usp, uIdx) => (
                          <div key={usp.id || uIdx} className="p-3 bg-white border border-[#D6CFC2] rounded-xl space-y-2">
                            <input
                              type="text"
                              value={usp.title}
                              onChange={(e) => {
                                const newUsps = [...(quote.letterAndProcess?.uspCards || [])];
                                newUsps[uIdx] = { ...newUsps[uIdx], title: e.target.value };
                                updateLetterField('uspCards', newUsps);
                              }}
                              className="w-full px-2.5 py-1.5 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg font-bold text-xs text-dark"
                              placeholder="USP Title"
                            />
                            <textarea
                              rows={2}
                              value={usp.desc}
                              onChange={(e) => {
                                const newUsps = [...(quote.letterAndProcess?.uspCards || [])];
                                newUsps[uIdx] = { ...newUsps[uIdx], desc: e.target.value };
                                updateLetterField('uspCards', newUsps);
                              }}
                              className="w-full px-2.5 py-1.5 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs text-dark/80"
                              placeholder="USP Description"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* CARD 2: PROCESS STEPS (P6, 4-6 STEPS) */}
              <div className="bg-white rounded-2xl p-5 border border-[#D6CFC2] shadow-2xs space-y-3.5">
                <span className="text-xs font-bold uppercase tracking-wider text-dark/80 font-mono block">PROCESS STEPS (P6, 4-6 STEPS)</span>

                <div className="space-y-2">
                  {/* Step 1 */}
                  <div className="bg-white border border-[#D6CFC2] rounded-xl p-3.5 flex items-center justify-between text-xs shadow-2xs">
                    <div className="flex items-center gap-3 font-bold text-dark">
                      <span className="w-5 font-mono text-center">1</span>
                      <span>Akkoord op de offerte</span>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-white border border-[#D6CFC2] rounded-xl p-3.5 flex items-center justify-between text-xs shadow-2xs">
                    <div className="flex items-center gap-3 font-bold text-dark">
                      <span className="w-5 font-mono text-center">2</span>
                      <span>Digitale tekening ter bevestiging</span>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-white border border-[#D6CFC2] rounded-xl p-3.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 text-xs shadow-2xs">
                    <div className="flex items-center gap-3 font-bold text-dark">
                      <span className="w-5 font-mono text-center">3</span>
                      <span>Productie door onze vakspecialist</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-[#EFECE6] border border-[#D6CFC2] text-dark/80 font-mono font-bold text-[10px] px-2.5 py-1 rounded-md uppercase">
                        {quote.configuration?.deliveryTime?.toUpperCase() || '3 TOT 5 WEKEN'}
                      </span>
                      <span className="text-[10px] font-mono text-dark/50">← delivery time from step 3</span>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="bg-white border border-[#D6CFC2] rounded-xl p-3.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 text-xs shadow-2xs">
                    <div className="flex items-center gap-3 font-bold text-dark">
                      <span className="w-5 font-mono text-center">4</span>
                      <span>Bezorging in {quote.customer?.city || 'Dongen'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {((quote.investment?.lineItems || []).find(i => (i.title || i.description || '').toLowerCase().includes('bezorging'))?.priceInclVat === 0 ||
                        (quote.investment?.lineItems || []).find(i => (i.title || i.description || '').toLowerCase().includes('bezorging'))?.isIncluded !== false) && (
                          <span className="bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] px-2.5 py-1 rounded-md uppercase">
                            GRATIS
                          </span>
                        )}
                      <span className="text-[10px] font-mono text-dark/50">badge only when the delivery price is € 0</span>
                    </div>
                  </div>
                  {/* Step 5 */}
                  <div className="bg-white border border-[#D6CFC2] rounded-xl p-3.5 flex items-center justify-between text-xs shadow-2xs">
                    <div className="flex items-center gap-3 font-bold text-dark">
                      <span className="w-5 font-mono text-center">5</span>
                      <span>Garantie & nazorg</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* STEP 6: REVIEW & SEND */}
          {activeStep === 6 && (
            <div className="space-y-4 font-body">

              {/* SUMMARY REVIEW CARDS */}
              <div className="bg-white rounded-2xl p-5 border border-[#D6CFC2] shadow-2xs space-y-4">
                <div className="flex justify-between items-center border-b border-[#D6CFC2]/60 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-dark/80 font-mono">QUOTE OVERVIEW & SUMMARY</span>
                  <span className="bg-[#EFECE6] text-dark/70 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">FINAL REVIEW</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Customer Card */}
                  <div className="p-3 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2]/70 space-y-1">
                    <span className="text-[10px] font-mono font-bold text-dark/50 uppercase">CUSTOMER</span>
                    <p className="font-bold text-dark">{quote.customer?.name || '—'}</p>
                    <p className="text-dark/70">{quote.customer?.address || '—'}, {quote.customer?.city || '—'}</p>
                    <p className="text-dark/70 font-mono">{quote.customer?.email || '—'} · {quote.customer?.phone || '—'}</p>
                  </div>

                  {/* Quote Metadata */}
                  <div className="p-3 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2]/70 space-y-1">
                    <span className="text-[10px] font-mono font-bold text-dark/50 uppercase">QUOTE DETAILS</span>
                    <p className="font-bold text-primary font-mono">{quote.id} · {quote.productType || 'Outdoor kitchen'}</p>
                    <p className="text-dark/70">Date: {quote.date} · Valid: {quote.validUntil}</p>
                    <p className="text-dark/70 font-mono">Status: <strong className="text-[#D97706] uppercase">{quote.status || 'Draft'}</strong></p>
                  </div>

                  {/* Configuration Summary */}
                  <div className="p-3 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2]/70 space-y-1">
                    <span className="text-[10px] font-mono font-bold text-dark/50 uppercase">CONFIGURATION</span>
                    <p className="font-bold text-dark">{quote.configuration?.woodType || 'Thermo Fraké'} · {quote.configuration?.dimensions || '240 × 80'} cm</p>
                    <p className="text-dark/70">Cutout: {quote.configuration?.optionsTitle || 'Big Green Egg Large'}</p>
                    <p className="text-dark/70 font-mono">Delivery Time: {quote.configuration?.deliveryTime || '3 tot 5 weken'}</p>
                  </div>

                  {/* Investment Summary */}
                  <div className="p-3 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2]/70 space-y-1">
                    <span className="text-[10px] font-mono font-bold text-dark/50 uppercase">INVESTMENT</span>
                    <p className="font-bold text-primary text-sm font-mono">€ {totals.totalInclVat.toLocaleString('nl-NL', { minimumFractionDigits: 2 })} (incl. VAT)</p>
                    <p className="text-dark/70 font-mono">Excl. VAT: € {totals.subtotalExclVat.toLocaleString('nl-NL', { minimumFractionDigits: 2 })} · VAT: € {totals.vatAmount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</p>
                    <p className="text-dark/70 font-mono">Installments: {quote.investment?.instalments?.count || 2} termijnen ({(quote.investment?.instalments?.percentages || [50, 50]).join('/')}%)</p>
                  </div>
                </div>
              </div>

              {/* CARD 2: COMPLETENESS VALIDATION CHECKLIST */}
              <div className="bg-white rounded-2xl p-5 border border-[#D6CFC2] shadow-2xs space-y-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-dark/80 font-mono">COMPLETENESS & VALIDATION CHECKLIST</span>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded uppercase ${validation.errors.length === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                    {validation.errors.length === 0 ? '✓ Ready to Send' : '⚠️ Validation Warnings'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {/* Check 1: Customer Name & City */}
                  <div className="p-3 bg-white border border-[#D6CFC2] rounded-xl flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <span className={`font-bold font-mono ${quote.customer?.name && quote.customer?.city ? 'text-[#33422C]' : 'text-amber-600'}`}>
                        {quote.customer?.name && quote.customer?.city ? '✓' : '⚠️'}
                      </span>
                      <span className="font-medium text-dark">Customer name and city defined</span>
                    </div>
                    <span className="font-mono text-dark/50">{quote.customer?.name} ({quote.customer?.city})</span>
                  </div>

                  {/* Check 2: Customer Email */}
                  <div className="p-3 bg-white border border-[#D6CFC2] rounded-xl flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <span className={`font-bold font-mono ${quote.customer?.email ? 'text-[#33422C]' : 'text-red-600'}`}>
                        {quote.customer?.email ? '✓' : '✗'}
                      </span>
                      <span className="font-medium text-dark">Customer email address for approval link</span>
                    </div>
                    <span className="font-mono text-dark/50">{quote.customer?.email || 'Missing email!'}</span>
                  </div>

                  {/* Check 3: Line Items */}
                  <div className="p-3 bg-white border border-[#D6CFC2] rounded-xl flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <span className={`font-bold font-mono ${(quote.investment?.lineItems || []).length > 0 ? 'text-[#33422C]' : 'text-red-600'}`}>
                        {(quote.investment?.lineItems || []).length > 0 ? '✓' : '✗'}
                      </span>
                      <span className="font-medium text-dark">Investment line items & calculations</span>
                    </div>
                    <span className="font-mono text-dark/50">{(quote.investment?.lineItems || []).length} items</span>
                  </div>

                  {/* Check 4: Installments Sum */}
                  {(() => {
                    const instCount = quote.investment?.instalments?.count || 2;
                    const instP = quote.investment?.instalments?.percentages || [50, 50];
                    const instSum = instP.reduce((a, b) => a + Number(b || 0), 0);
                    const isSum100 = instSum === 100;
                    return (
                      <div className="p-3 bg-white border border-[#D6CFC2] rounded-xl flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-2.5">
                          <span className={`font-bold font-mono ${isSum100 ? 'text-[#33422C]' : 'text-red-600'}`}>
                            {isSum100 ? '✓' : '✗'}
                          </span>
                          <span className="font-medium text-dark">Payment installments sum equals 100%</span>
                        </div>
                        <span className={`font-mono font-bold ${isSum100 ? 'text-emerald-800' : 'text-red-800'}`}>{instSum}%</span>
                      </div>
                    );
                  })()}

                  {/* Check 5: Specifications Height */}
                  <div className="p-3 bg-white border border-[#D6CFC2] rounded-xl flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <span className={`font-bold font-mono ${totalSpecLines <= 12 ? 'text-[#33422C]' : 'text-amber-600'}`}>
                        {totalSpecLines <= 12 ? '✓' : '⚠️'}
                      </span>
                      <span className="font-medium text-dark">Specifications fit Page 3 (max 12 lines)</span>
                    </div>
                    <span className="font-mono text-dark/50">{totalSpecLines} / 12 lines</span>
                  </div>
                </div>
              </div>

              {/* CARD 3: SEND & EXPORT ACTIONS */}
              <div className="bg-white rounded-2xl p-5 border border-[#D6CFC2] shadow-2xs space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-dark/80 font-mono block">SEND & EXPORT ACTIONS</span>

                {/* Row 1: Action buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={async () => {
                      showToast(language === 'EN' ? '⏳ Generating 6-page PDF proposal...' : '⏳ 6-pagina offerte PDF wordt gegenereerd...');
                      const fileName = await generateFull6PagePdf(quote);
                      showToast(language === 'EN' ? `✅ PDF downloaded: ${fileName}` : `✅ PDF gedownload: ${fileName}`);
                    }}
                    className="px-4 py-2.5 bg-[#33422C] text-[#FDFBF7] font-bold text-xs rounded-xl shadow-xs hover:bg-[#283523] transition-all cursor-pointer font-mono flex items-center gap-2"
                  >
                    <span>↓ Download PDF Proposal</span>
                  </button>

                  <button
                    type="button"
                    disabled={validation.errors.length > 0 || quote?.status === 'Verzonden' || quote?.status === 'Approved' || quote?.status === 'Geaccepteerd'}
                    onClick={() => setShowSendModal(true)}
                    className={`px-4 py-2.5 font-bold text-xs rounded-xl shadow-xs transition-all font-mono flex items-center gap-2 ${quote?.status === 'Verzonden' || quote?.status === 'Approved' || quote?.status === 'Geaccepteerd'
                      ? 'bg-emerald-700 text-white cursor-not-allowed opacity-80'
                      : validation.errors.length > 0
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed border border-gray-400'
                        : 'bg-[#33422C] text-[#FDFBF7] hover:bg-[#283523] cursor-pointer'
                      }`}
                  >
                    <span>{quote?.status === 'Verzonden' ? '✅ Sent' : quote?.status === 'Approved' || quote?.status === 'Geaccepteerd' ? '✅ Approved' : '✈ Confirm & Send Quote'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const publicUrl = `${window.location.origin}/offerte/${quote.id}`;
                      navigator.clipboard.writeText(publicUrl);
                      showToast('Approval link copied to clipboard!');
                    }}
                    className="px-4 py-2.5 bg-white border border-[#D6CFC2] text-dark font-bold text-xs rounded-xl shadow-xs hover:bg-[#EDE8DF] transition-all cursor-pointer font-mono flex items-center gap-2"
                  >
                    <span className="text-emerald-700">🔗</span>
                    <span>Copy approval link</span>
                  </button>
                </div>

                {validation.errors.length > 0 && (
                  <div className="p-3 bg-red-50 border border-red-300 text-red-800 rounded-xl text-xs space-y-1 font-body">
                    <p className="font-bold font-mono uppercase text-[10px]">⚠️ Cannot Send Quote Yet:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {validation.errors.map((err, errIdx) => (
                        <li key={errIdx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Row 2: Duplicate button */}
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      const savedQuotes = JSON.parse(localStorage.getItem('app_quotes_v2') || localStorage.getItem('app_quotes') || '[]');
                      const nextNum = savedQuotes.length + 332;
                      const newId = `OF-${new Date().getFullYear()}${nextNum}`;
                      const dupQuote = {
                        ...quote,
                        id: newId,
                        status: 'Draft',
                        date: new Date().toISOString().split('T')[0]
                      };
                      const updated = [dupQuote, ...savedQuotes];
                      localStorage.setItem('app_quotes_v2', JSON.stringify(updated));
                      localStorage.setItem('app_quotes', JSON.stringify(updated));
                      window.dispatchEvent(new Event('app_data_changed'));
                      showToast(`Quote duplicated as ${newId}!`);
                    }}
                    className="px-4 py-2 bg-white border border-[#D6CFC2] text-dark font-bold text-xs rounded-xl shadow-xs hover:bg-[#EDE8DF] transition-all cursor-pointer font-mono flex items-center gap-2"
                  >
                    <span className="text-dark/70">❐</span>
                    <span>Duplicate Quote</span>
                  </button>
                </div>

                {/* Filename & notice */}
                <p className="text-xs text-dark/70 font-body pt-1">
                  Filename: <strong className="font-bold text-dark">Offerte-{quote.id}-{(quote.customer?.name || 'Bjorn Valk').replace(/\s+/g, '-')}.pdf</strong> · draft saving is non-blocking
                </p>
              </div>
            </div>
          )}

          {/* BOTTOM ACTION BAR MATCHING SCREENSHOT 2 */}
          <div className="flex justify-between items-center pt-3">
            {activeStep > 1 ? (
              <button
                onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                className="px-4 py-2 bg-white border border-[#D6CFC2] text-dark font-bold text-xs rounded-xl shadow-xs hover:bg-[#EDE8DF] transition-all cursor-pointer font-mono"
              >
                ← Back
              </button>
            ) : <div></div>}

            {activeStep < 6 && (
              <button
                onClick={() => setActiveStep(prev => Math.min(6, prev + 1))}
                className="px-6 py-2.5 bg-[#33422C] hover:bg-[#283523] text-[#FDFBF7] font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 font-mono cursor-pointer"
              >
                <span>Next: {getStepNextTitle(activeStep)} →</span>
              </button>
            )}
          </div>

        </div>

        {/* ========================================================= */}
        {/* ZONE 3: RIGHT COLUMN - MANDATORY LIVE PREVIEW (3 Cols)    */}
        {/* ========================================================= */}
        <div className={`lg:col-span-3 overflow-y-auto max-h-[calc(100vh-210px)] pr-1 ${mobileTab === 'editor' ? 'hidden lg:block' : 'block'}`}>
          <div className="bg-white rounded-2xl p-3 border border-[#D6CFC2] shadow-xs space-y-2 font-body relative">
            {/* Live Preview Header */}
            <div className="flex justify-between items-center border-b border-[#D6CFC2]/80 pb-2.5">
              <span className="text-xs font-mono font-bold tracking-wider text-dark/80 uppercase">LIVE PREVIEW</span>
              <div className="text-xs font-mono font-bold text-dark/70 bg-[#F8F7F4] px-2.5 py-1 rounded-md border border-[#E2DDD3]">
                PAGE <span className="text-[#33422C] font-extrabold">{previewPage}</span> / 6
              </div>
            </div>

            {/* Scaled Full-Width Responsive PDF Preview */}
            <ScaledPDFPreview quote={quote} activePage={previewPage} highlightField={highlightField} />
          </div>
        </div>

      </div>

      {/* SEND CONFIRMATION MODAL */}
      <AnimatePresence>
        {showSendModal && (
          <div className="fixed inset-0 z-[999999] bg-dark/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 w-full max-w-md space-y-5 shadow-2xl"
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-serif font-bold text-lg text-primary">Send Quotation</h3>
                  <p className="text-xs text-dark/60 font-body mt-0.5">Confirm before sending</p>
                </div>
                <button onClick={() => setShowSendModal(false)} className="text-dark/40 hover:text-dark cursor-pointer"><X className="w-5 h-5" /></button>
              </div>

              {/* Quote Summary */}
              <div className="bg-white rounded-xl border border-[#D6CFC2] p-4 space-y-2.5 text-xs font-body">
                <div className="flex justify-between items-center">
                  <span className="text-dark/60 font-mono uppercase text-[10px] font-bold">Quote ID</span>
                  <span className="font-bold text-primary font-mono">{quote.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-dark/60 font-mono uppercase text-[10px] font-bold">Client</span>
                  <span className="font-bold text-dark">{quote.customer?.name || 'Bjorn Valk'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-dark/60 font-mono uppercase text-[10px] font-bold">E-mail</span>
                  <span className="font-bold text-dark">{quote.customer?.email || '—'}</span>
                </div>
                <div className="flex justify-between items-center border-t border-[#D6CFC2] pt-2 mt-1">
                  <span className="text-dark/60 font-mono uppercase text-[10px] font-bold">Total incl. VAT</span>
                  <span className="font-bold text-primary text-sm">€ {calculateTotals(quote?.investment?.lineItems || []).totalInclVat.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Approval link preview */}
              <div className="bg-[#F8F7F4] rounded-xl border border-[#D6CFC2] p-3.5 space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-dark/60 uppercase tracking-wider block">Approval Link (for client)</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-primary truncate flex-1 bg-white border border-[#D6CFC2] rounded-lg px-2.5 py-1.5">
                    {window.location.origin}/offerte/{quote.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/offerte/${quote.id}`);
                      showToast('Link copied!');
                    }}
                    className="px-2.5 py-1.5 bg-white border border-[#D6CFC2] rounded-lg text-xs font-bold text-dark hover:bg-[#EDE8DF] cursor-pointer font-mono"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>

              {/* What happens info */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 space-y-1 font-body">
                <p className="font-bold">✅ What happens after confirming:</p>
                <ul className="space-y-0.5 text-emerald-800">
                  <li>• Status changes from <strong>Draft → Sent</strong></li>
                  <li>• Quote is saved in the system</li>
                  <li>• Client can view the proposal via the approval link</li>
                  <li>• Quote is locked after client approval</li>
                </ul>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowSendModal(false)}
                  className="flex-1 px-4 py-2.5 bg-white border border-[#D6CFC2] text-dark font-bold text-xs rounded-xl hover:bg-[#EDE8DF] cursor-pointer font-mono"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const updatedQuote = { ...quote, status: 'Verzonden' };
                    setQuote(updatedQuote);
                    onSaveQuote(updatedQuote, true);
                    setShowSendModal(false);
                    showToast(`✅ Quote ${quote.id} sent to ${quote.customer?.name || 'client'}!`);
                  }}
                  className="flex-1 px-4 py-2.5 bg-[#33422C] text-[#FDFBF7] font-bold text-xs rounded-xl hover:bg-[#283523] cursor-pointer font-mono flex items-center justify-center gap-2"
                >
                  <span>✈ Confirm & Send</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PRODUCT LIBRARY MODAL */}
      <AnimatePresence>
        {showLibraryModal && (
          <div className="fixed inset-0 z-[999999] bg-dark/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-[#D6CFC2] pb-2">
                <h3 className="font-heading font-bold text-base text-primary">Product Library</h3>
                <button onClick={() => setShowLibraryModal(false)} className="text-dark/40 hover:text-dark"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-2 text-xs max-h-80 overflow-y-auto pr-1">
                {PRESET_PRODUCT_LIBRARY.map((item) => (
                  <div key={item.id} className="p-3 bg-white border border-[#D6CFC2] rounded-xl flex justify-between items-center hover:border-primary/50 transition-all">
                    <div>
                      <h4 className="font-bold text-primary">{item.title}</h4>
                      <p className="text-[11px] text-dark/60">{item.description}</p>
                      <span className="font-mono text-xs font-bold text-amber-700">€ {item.priceInclVat.toFixed(2)}</span>
                    </div>
                    <Button size="sm" onClick={() => handleAddFromLibrary(item)} className="text-xs">
                      + Insert
                    </Button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 100% CLEAN PDF PRINT PORTAL ATTACHED DIRECTLY TO DOCUMENT BODY */}
      {quote && createPortal(
        <div id="printable-offerte-portal">
          <Offerte6PagePDF quote={quote} />
        </div>,
        document.body
      )}
    </div>
  );
}
