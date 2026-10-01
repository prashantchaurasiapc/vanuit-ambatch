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
import { calculateTotals, calculateInstalments, validateQuoteForSend, createDefaultQuote } from '../utils/quoteSchema';
import { useLanguage } from '../context/LanguageContext';
import projectImg from '../assets/outdoor_project_card.png';
import heroImg from '/dasbordes images.png';
import { downloadQuotePdf, generateFull6PagePdf } from '../utils/pdfGenerator';
import { compressImage } from '../utils/storageHelper';

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
      style={{ height: `${scaledHeight + 12}px` }}
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
  const [quote, setQuote] = useState(() => {
    if (quoteData && quoteData.investment && quoteData.configuration && Array.isArray(quoteData.investment.lineItems) && quoteData.investment.lineItems.length > 0) {
      return quoteData;
    }
    return createDefaultQuote(quoteData?.customer || quoteData, quoteData);
  });

  useEffect(() => {
    if (quoteData) {
      if (quoteData.investment && quoteData.configuration && Array.isArray(quoteData.investment.lineItems) && quoteData.investment.lineItems.length > 0) {
        setQuote(quoteData);
      } else {
        setQuote(createDefaultQuote(quoteData?.customer || quoteData, quoteData));
      }
    }
  }, [quoteData]);

  // Auto-heal missing or empty cover photos
  useEffect(() => {
    if (quote) {
      const photos = quote.cover?.photos;
      const isValid = Array.isArray(photos) && photos.length === 3 && photos.every(p => typeof p === 'string' && p.trim().length > 3);
      if (!isValid) {
        setQuote(prev => ({
          ...prev,
          cover: {
            ...prev.cover,
            photos: [
              (photos?.[0] && String(photos[0]).trim().length > 3) ? photos[0] : '/cover_img1.png',
              (photos?.[1] && String(photos[1]).trim().length > 3) ? photos[1] : '/cover_img2.png',
              (photos?.[2] && String(photos[2]).trim().length > 3) ? photos[2] : '/cover_img3.png'
            ]
          }
        }));
      }
    }
  }, [quote?.id]);
  const [lastSavedTime, setLastSavedTime] = useState(new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }));
  const [toastMsg, setToastMsg] = useState('');
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [letterExpanded, setLetterExpanded] = useState(false);
  const [uspExpanded, setUspExpanded] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [previewPage, setPreviewPage] = useState(1);
  const [mobileTab, setMobileTab] = useState('editor');
  const [showPreview, setShowPreview] = useState(false);
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
  const productTypeLower = String(quote?.productType || '').toLowerCase();
  const isGardenRoom = productTypeLower.includes('garden') ||
    productTypeLower.includes('buitenverblijf') ||
    productTypeLower.includes('veranda') ||
    productTypeLower.includes('poolhouse');
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

    setQuote(prev => {
      const updated = {
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
      };

      if (defaults.configuration) {
        updated.configuration = {
          ...prev.configuration,
          ...defaults.configuration,
          infobox: defaults.configuration.infobox ? { ...defaults.configuration.infobox } : prev.configuration?.infobox,
          specifications: defaults.configuration.specifications ? defaults.configuration.specifications.map(s => ({ ...s, lines: s.lines.map(l => ({ ...l })) })) : prev.configuration?.specifications
        };
      }

      if (defaults.lineItems && defaults.lineItems.length > 0) {
        updated.investment = {
          ...prev.investment,
          lineItems: defaults.lineItems.map(item => ({ ...item }))
        };
      }

      return updated;
    });

    showToast(pType === 'Garden room' ? '✓ Garden Room velden en items geladen!' : `✓ ${pType} template geladen!`);
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

  // Checklist helpers in Step 4
  const handleChecklistChange = (index, val) => {
    if (isApproved) return;
    const currentList = [...(quote.investment?.checklist || [
      'Volledig maatwerk, gebouwd door een gecertificeerde vakspecialist',
      'Digitale tekening vooraf ter goedkeuring',
      'Olieafwerking in twee lagen (naturel)',
      `Gratis bezorging in ${quote.customer?.city || 'Dongen'}`,
      'Garantie en nazorg na levering'
    ])];
    currentList[index] = val;
    updateInvestmentField('checklist', currentList);
  };

  const handleAddChecklistItem = () => {
    if (isApproved) return;
    const currentList = [...(quote.investment?.checklist || [
      'Volledig maatwerk, gebouwd door een gecertificeerde vakspecialist',
      'Digitale tekening vooraf ter goedkeuring',
      'Olieafwerking in twee lagen (naturel)',
      `Gratis bezorging in ${quote.customer?.city || 'Dongen'}`,
      'Garantie en nazorg na levering'
    ])];
    updateInvestmentField('checklist', [...currentList, 'Nieuw inbegrepen onderdeel']);
  };

  const handleRemoveChecklistItem = (index) => {
    if (isApproved) return;
    const currentList = [...(quote.investment?.checklist || [])].filter((_, i) => i !== index);
    updateInvestmentField('checklist', currentList);
  };

  const handleResetChecklistDefaults = () => {
    if (isApproved) return;
    const defaultList = [
      'Volledig maatwerk, gebouwd door een gecertificeerde vakspecialist',
      'Digitale tekening vooraf ter goedkeuring',
      'Olieafwerking in twee lagen (naturel)',
      `Gratis bezorging in ${quote.customer?.city || 'Dongen'}`,
      'Garantie en nazorg na levering'
    ];
    updateInvestmentField('checklist', defaultList);
    showToast('Checklist hersteld naar standaard!');
  };

  // Instalment labels helper
  const handleUpdateInstalmentLabel = (index, label) => {
    if (isApproved) return;
    const inst = quote.investment?.instalments || { count: 2, percentages: [50, 50], labels: ['Bij akkoord', 'Bij levering'] };
    const currentLabels = [...(inst.labels || ['Bij akkoord', 'Bij levering', 'Na montage'])];
    currentLabels[index] = label;
    updateInvestmentField('instalments', { ...inst, labels: currentLabels });
  };

  // Instalment subtexts helper
  const handleUpdateInstalmentSubtext = (index, subtext) => {
    if (isApproved) return;
    const inst = quote.investment?.instalments || { count: 2, percentages: [50, 50], labels: ['Bij akkoord', 'Bij levering'] };
    const defaultSubtexts = (inst.count === 3)
      ? ['Na akkoord op de technische tekening.', 'Vlak vóór de startdatum op locatie.', 'Pas als alles naar wens is opgeleverd.']
      : ['Na akkoord op de technische tekening.', 'Pas als alles naar wens is opgeleverd.'];
    const currentSubtexts = [...(inst.subtexts || defaultSubtexts)];
    currentSubtexts[index] = subtext;
    updateInvestmentField('instalments', { ...inst, subtexts: currentSubtexts });
  };

  // Process Steps helpers in Step 5
  const handleProcessStepChange = (index, field, val) => {
    if (isApproved) return;
    const currentSteps = [...(quote.letterAndProcess?.processSteps || [
      { step: '1', title: 'Akkoord op de offerte', desc: 'Bevestig eenvoudig per mail of WhatsApp, of onderteken de akkoordpagina. Vanaf dat moment nemen wij alles uit handen.', badge: '' },
      { step: '2', title: 'Digitale tekening ter bevestiging', desc: 'Je ontvangt het definitieve ontwerp met technische tekening ter bevestiging. Zo weet je precies wat er gebouwd wordt vóór de bouw start.', badge: '' },
      { step: '3', title: 'Productie door onze vakspecialist', desc: 'Jouw keuken wordt met de hand gemaakt door een gecertificeerde vakspecialist. Tussentijds houden we je op de hoogte.', badge: '3 TOT 5 WEKEN' },
      { step: '4', title: `Bezorging in ${quote.customer?.city || 'Dongen'}`, desc: `We leveren de keuken op een moment dat jou uitkomt in ${quote.customer?.city || 'Dongen'}. Dankzij de zes zwenkwielen staat hij direct op de juiste plek.`, badge: 'GRATIS' },
      { step: '5', title: 'Garantie & nazorg', desc: 'We leveren pas op als alles naar wens is. Ook daarna blijven wij je vaste aanspreekpunt, met garantie op de constructie.', badge: '' }
    ])];
    currentSteps[index] = { ...currentSteps[index], [field]: val };
    updateLetterField('processSteps', currentSteps);
  };

  const handleAddProcessStep = () => {
    if (isApproved) return;
    const currentSteps = [...(quote.letterAndProcess?.processSteps || [])];
    const newStepNum = String(currentSteps.length + 1);
    updateLetterField('processSteps', [
      ...currentSteps,
      { step: newStepNum, title: 'Nieuwe processtap', desc: 'Beschrijving van deze stap.', badge: '' }
    ]);
  };

  const handleRemoveProcessStep = (index) => {
    if (isApproved) return;
    const currentSteps = [...(quote.letterAndProcess?.processSteps || [])].filter((_, i) => i !== index);
    updateLetterField('processSteps', currentSteps);
  };

  const handleResetProcessStepDefaults = () => {
    if (isApproved) return;
    const defaultSteps = [
      { step: '1', title: 'Akkoord op de offerte', desc: 'Bevestig eenvoudig per mail of WhatsApp, of onderteken de akkoordpagina. Vanaf dat moment nemen wij alles uit handen.', badge: '' },
      { step: '2', title: 'Digitale tekening ter bevestiging', desc: 'Je ontvangt het definitieve ontwerp met technische tekening ter bevestiging. Zo weet je precies wat er gebouwd wordt vóór de bouw start.', badge: '' },
      { step: '3', title: 'Productie door onze vakspecialist', desc: 'Jouw keuken wordt met de hand gemaakt door een gecertificeerde vakspecialist. Tussentijds houden we je op de hoogte.', badge: '3 TOT 5 WEKEN' },
      { step: '4', title: `Bezorging in ${quote.customer?.city || 'Dongen'}`, desc: `We leveren de keuken op een moment dat jou uitkomt in ${quote.customer?.city || 'Dongen'}. Dankzij de zes zwenkwielen staat hij direct op de juiste plek.`, badge: 'GRATIS' },
      { step: '5', title: 'Garantie & nazorg', desc: 'We leveren pas op als alles naar wens is. Ook daarna blijven wij je vaste aanspreekpunt, met garantie op de constructie.', badge: '' }
    ];
    updateLetterField('processSteps', defaultSteps);
    showToast('Processtappen hersteld naar standaard!');
  };

  // Spec section title helper
  const handleSpecSectionTitleChange = (secIndex, val) => {
    if (isApproved) return;
    setQuote(prev => {
      const specs = [...(prev.configuration?.specifications || [])];
      specs[secIndex] = { ...specs[secIndex], title: val };
      return { ...prev, configuration: { ...prev.configuration, specifications: specs } };
    });
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
    <div className="w-full h-full flex flex-col font-body text-[#4A4A43] overflow-hidden">
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
      <div className="flex-shrink-0 bg-white px-3 sm:px-4 py-2.5 rounded-2xl border border-[#D6CFC2] shadow-xs flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-white hover:bg-[#EDE8DF] text-primary border border-[#D6CFC2] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Quotes</span>
            <span className="inline sm:hidden">Back</span>
          </button>
          <div className="h-5 w-[1px] bg-[#D6CFC2] hidden sm:block flex-shrink-0"></div>
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-sans font-semibold text-xs sm:text-sm text-dark truncate">Quote Editor</span>
            <span className="font-mono text-[10px] sm:text-xs text-[#D97706] bg-[#FEF3C7] border border-[#FDE68A] px-2 py-0.5 rounded-lg font-bold flex-shrink-0 tracking-wide">{quote.id}</span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg flex-shrink-0 border ${
              quote.status === 'Approved' || quote.status === 'Geaccepteerd'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                : quote.status === 'Sent' || quote.status === 'Verzonden'
                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                  : 'bg-[#F8F7F4] text-dark/60 border-[#D6CFC2]'
            }`}>{quote.status || 'Draft'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-dark/60 bg-[#F8F7F4] px-3 py-1.5 rounded-xl border border-[#D6CFC2] whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
            <span>Draft · {lastSavedTime}</span>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN LAYOUT: Left Step Nav + Right Content (+ optional Live Preview) */}
      <div className="flex-1 flex gap-3 items-start min-h-0 overflow-hidden">

        {/* ========================================================= */}
        {/* ZONE 1: LEFT STEP NAVIGATION (fixed width)               */}
        {/* ========================================================= */}
        <div className="w-[180px] flex-shrink-0 overflow-y-auto max-h-[calc(100vh-175px)] no-scrollbar space-y-3">
          <div className="bg-white rounded-2xl p-2.5 border border-[#D6CFC2] shadow-xs space-y-1.5">
            <div className="flex items-baseline justify-between">
              <h3 className="font-sans font-bold text-sm text-dark tracking-tight">Quote {quote.id}</h3>
            </div>

            <nav className="space-y-0.5">
              {STEPS.map((step) => {
                const isActive = activeStep === step.id;
                const isCompleted = activeStep > step.id;
                const dynamicSub = step.id === 1
                  ? `${quote.customer?.name || 'Bjorn Valk'} · ${quote.customer?.city || 'Dongen'}`
                  : step.desc;

                return (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(step.id)}
                    className={`w-full text-left py-1.5 px-3 rounded-xl transition-all flex items-center gap-3 cursor-pointer ${
                      isActive
                        ? 'bg-[#1C2B1A] text-[#FDFBF7] shadow-md'
                        : 'hover:bg-[#F8F7F4] text-dark'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full text-[10px] font-mono font-bold flex items-center justify-center flex-shrink-0 border ${
                      isActive
                        ? 'bg-white text-[#1C2B1A] border-white/40'
                        : isCompleted
                          ? 'bg-[#33422C] text-white border-[#33422C]'
                          : 'border-[#C4BEB3] text-dark/50'
                    }`}>
                      {isCompleted ? '✓' : step.number}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-semibold leading-tight ${
                        isActive ? 'text-white' : isCompleted ? 'text-dark' : 'text-dark/80'
                      }`}>{step.title}</p>
                      <p className={`text-[10px] truncate mt-0.5 leading-tight ${
                        isActive ? 'text-white/70' : 'text-dark/45'
                      }`}>{dynamicSub}</p>
                    </div>
                  </button>
                );
              })}
            </nav>

            <div className="pt-1.5 border-t border-[#E8E3DB] text-[10px] font-mono text-dark/50 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Auto-saved as draft · {lastSavedTime}</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ZONE 2: MIDDLE COLUMN - ACTIVE STEP FORM (6 Cols)          */}
        {/* ========================================================= */}
        <div ref={stepFormRef} className="flex-1 min-w-0 space-y-4 overflow-y-auto max-h-[calc(100vh-175px)] pr-1 no-scrollbar">

          {/* Main Title & Subtitle (Only on Step 1) */}
          {activeStep === 1 && (
            <div className="space-y-1 mb-4">
              <h2 className="font-serif font-bold text-3xl text-primary">{STEPS[activeStep - 1].title}</h2>
              <p className="text-xs text-dark/60 font-body">
                Everything here returns automatically on every page of the quote — choose once, never retype.
              </p>
            </div>
          )}

          {/* STEP 1: CUSTOMER & DETAILS */}
          {activeStep === 1 && (
            <div className="space-y-4">

              {/* CARD 1: CUSTOMER */}
              <div className="bg-white rounded-2xl p-5 border border-[#D6CFC2] shadow-2xs space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-dark/80 font-mono block">CUSTOMER DETAILS</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">EDITABLE</span>
                </div>

                {/* Pre-fill from Leads Selector */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono">QUICK SELECT FROM LEADS</label>
                    <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono">OPTIONAL PRE-FILL</span>
                  </div>
                  <select
                    value={quote.customer?.name || ''}
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
                            ...(prev.customer || {}),
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
                            ...(prev.customer || {}),
                            name: 'Bjorn Valk',
                            firstName: 'Bjorn',
                            city: 'Dongen',
                            address: 'Dongeheuvel 3, 5101 WE Dongen',
                            phone: '+31 6 53562542',
                            email: 'bjorn@mail.nl'
                          }
                        }));
                      } else if (selectedName) {
                        updateCustomerField('name', selectedName);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-[#F8F7F4] border border-[#D6CFC2] rounded-xl text-xs font-bold text-dark focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="">-- Choose lead or enter details below --</option>
                    <option value="Bjorn Valk">Bjorn Valk (Lead)</option>
                    {leadsList.filter(l => l.name !== 'Bjorn Valk').map((lead, idx) => (
                      <option key={idx} value={lead.name}>{lead.name} (Lead)</option>
                    ))}
                  </select>
                  <p className="text-[11px] text-dark/50 italic mt-1 font-body">Selecting a lead pre-fills the fields below; all fields remain freely editable</p>
                </div>

                {/* Direct Editable Customer Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 border-t border-[#D6CFC2]/60">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono block mb-1">CUSTOMER NAME (FULL)</label>
                    <input
                      type="text"
                      value={quote.customer?.name || ''}
                      onFocus={() => setHighlightField('customer')}
                      onBlur={() => setHighlightField(null)}
                      onChange={(e) => {
                        const val = e.target.value;
                        const first = val.trim().split(' ')[0] || '';
                        setQuote(prev => ({
                          ...prev,
                          customer: {
                            ...(prev.customer || {}),
                            name: val,
                            firstName: prev.customer?.firstName && prev.customer.firstName !== (prev.customer.name || '').split(' ')[0] ? prev.customer.firstName : first
                          }
                        }));
                      }}
                      placeholder="e.g. Bjorn Valk"
                      className="w-full px-3.5 py-2 bg-white border border-[#D6CFC2] rounded-xl font-bold text-dark text-xs focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono block mb-1">FIRST NAME (FOR SALUTATION)</label>
                    <input
                      type="text"
                      value={quote.customer?.firstName || ''}
                      onChange={(e) => updateCustomerField('firstName', e.target.value)}
                      placeholder="e.g. Bjorn"
                      className="w-full px-3.5 py-2 bg-white border border-[#D6CFC2] rounded-xl font-bold text-dark text-xs focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono block mb-1">ADDRESS / STREET</label>
                    <input
                      type="text"
                      value={quote.customer?.address || ''}
                      onChange={(e) => updateCustomerField('address', e.target.value)}
                      placeholder="e.g. Dongeheuvel 3, 5101 WE"
                      className="w-full px-3.5 py-2 bg-white border border-[#D6CFC2] rounded-xl text-dark text-xs focus:outline-none focus:border-primary font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono block mb-1">CITY / DELIVERY LOCATION</label>
                    <input
                      type="text"
                      value={quote.customer?.city || ''}
                      onChange={(e) => updateCustomerField('city', e.target.value)}
                      placeholder="e.g. Dongen"
                      className="w-full px-3.5 py-2 bg-white border border-[#D6CFC2] rounded-xl font-bold text-dark text-xs focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono block mb-1">PHONE NUMBER</label>
                    <input
                      type="text"
                      value={quote.customer?.phone || ''}
                      onChange={(e) => updateCustomerField('phone', e.target.value)}
                      placeholder="e.g. +31 6 53562542"
                      className="w-full px-3.5 py-2 bg-white border border-[#D6CFC2] rounded-xl text-dark text-xs focus:outline-none focus:border-primary font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono block mb-1">EMAIL ADDRESS</label>
                    <input
                      type="email"
                      value={quote.customer?.email || ''}
                      onChange={(e) => updateCustomerField('email', e.target.value)}
                      placeholder="e.g. bjorn@mail.nl"
                      className="w-full px-3.5 py-2 bg-white border border-[#D6CFC2] rounded-xl text-dark text-xs focus:outline-none focus:border-primary font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 2: QUOTE */}
              <div className="bg-white rounded-2xl p-5 border border-[#D6CFC2] shadow-2xs space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-dark/80 font-mono block">QUOTE METADATA</span>

                {/* Row 1: Quote Number & Project Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono">QUOTE NUMBER</label>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">EDITABLE</span>
                    </div>
                    <input
                      type="text"
                      value={quote.id || ''}
                      onChange={(e) => setQuote(prev => ({ ...prev, id: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#D6CFC2] rounded-xl font-bold font-mono text-dark text-xs focus:outline-none focus:border-primary"
                    />
                    <p className="text-[10px] text-dark/50 mt-1 font-body">Quote reference code shown on all pages of the proposal</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono">PROJECT TITLE</label>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">EDITABLE</span>
                    </div>
                    <input
                      type="text"
                      value={quote.project || ''}
                      onChange={(e) => setQuote(prev => ({ ...prev, project: e.target.value }))}
                      placeholder="e.g. Maatwerk Buitenkeuken Thermo Fraké"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#D6CFC2] rounded-xl font-bold text-dark text-xs focus:outline-none focus:border-primary"
                    />
                    <p className="text-[10px] text-dark/50 mt-1 font-body">Internal project name shown in the quotes table and dashboard</p>
                  </div>
                </div>

                {/* Row 2: Quote Date, Valid Until, Product Type */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono">QUOTE DATE</label>
                      <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono">EDITABLE</span>
                    </div>
                    <input
                      type="date"
                      value={quote.date}
                      onFocus={() => setHighlightField('date')}
                      onBlur={() => setHighlightField(null)}
                      onChange={(e) => setQuote(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl font-bold text-dark"
                    />
                    <p className="text-[10px] text-dark/50 mt-1 font-body">Default today</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono">VALID UNTIL</label>
                      <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono">EDITABLE</span>
                    </div>
                    <input
                      type="date"
                      value={quote.validUntil}
                      onFocus={() => setHighlightField('date')}
                      onBlur={() => setHighlightField(null)}
                      onChange={(e) => setQuote(prev => ({ ...prev, validUntil: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl font-bold text-dark"
                    />
                    <p className="text-[10px] text-dark/50 mt-1 font-body">Default +30 days</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono">PRODUCT TYPE</label>
                      <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono">SELECT</span>
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
                    <p className="text-[10px] text-dark/50 mt-1 font-body">Selects template + default texts</p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 2: COVER */}
          {activeStep === 2 && (
            <div className="space-y-4">

              {/* CARD 1: DYNAMIC SUBTITLE CONFIGURATION */}
              <div className="bg-white rounded-2xl p-4 border border-[#D6CFC2] shadow-2xs space-y-3">
                {(() => {
                  const woodVal = quote.configuration?.woodType || 'Thermo Fraké';
                  const dimVal = (quote.configuration?.dimensions || '240 × 80').replace(/\s*cm$/i, '').trim();
                  const cutoutVal = quote.configuration?.optionsTitle || 'Big Green Egg Large';
                  const autoSubString = `${woodVal} · ${dimVal} cm · ${cutoutVal}`;
                  const isOverride = quote.cover?.subtitleOverrideEnabled || false;

                  return (
                    <>
                      {isOverride ? (
                        <input
                          type="text"
                          value={quote.cover?.customSubtitle !== undefined ? quote.cover.customSubtitle : ''}
                          onFocus={() => setHighlightField('wood')}
                          onBlur={() => setHighlightField(null)}
                          onChange={(e) => updateCoverField('customSubtitle', e.target.value)}
                          className="w-full px-4 py-3.5 bg-white border border-amber-400 rounded-xl font-mono font-bold text-dark text-xs focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                          placeholder={autoSubString}
                        />
                      ) : (
                        <div className="w-full px-4 py-3.5 bg-[#F8F7F4] border border-[#E2DDD3] rounded-xl flex items-center justify-between">
                          <span className="font-mono font-bold text-dark text-xs">{autoSubString}</span>
                          <span className="text-[11px] text-dark/50 italic font-body">Follows Step 3</span>
                        </div>
                      )}
                      
                      <label className="flex items-center gap-2.5 cursor-pointer pt-1 px-1">
                        <input 
                          type="checkbox" 
                          checked={isOverride}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            updateCoverField('subtitleOverrideEnabled', checked);
                            if (!checked) {
                              updateCoverField('customSubtitle', '');
                            }
                          }}
                          className="w-4 h-4 rounded border-[#D6CFC2] text-primary focus:ring-primary cursor-pointer"
                        />
                        <span className="text-[13px] text-dark/70 font-body">Enable Custom Subtitle Override (manual text entry)</span>
                      </label>
                    </>
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
                      updateCoverField('photos', ['/cover_img1.png', '/cover_img2.png', '/cover_img3.png']);
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
                    { slot: 0, label: 'Hero Photo (Left)', defaultImg: '/cover_img1.png' },
                    { slot: 1, label: 'Project Photo (Center)', defaultImg: '/cover_img2.png' },
                    { slot: 2, label: 'Detail Photo (Right)', defaultImg: '/cover_img3.png' }
                  ].map(({ slot, label, defaultImg }) => {
                    const photosArr = (Array.isArray(quote.cover?.photos) && quote.cover.photos.length === 3)
                      ? quote.cover.photos
                      : ['/cover_img1.png', '/cover_img2.png', '/cover_img3.png'];
                    const photoVal = photosArr[slot];
                    const currentPhoto = (photoVal && typeof photoVal === 'string' && photoVal.trim().length > 3)
                      ? photoVal.trim()
                      : defaultImg;
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
                        <div className="aspect-[4/3] w-full rounded-lg overflow-hidden border border-[#D6CFC2] bg-[#EDE8DF] relative group flex items-center justify-center">
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
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              try {
                                showToast(`⏳ Uploading & optimizing Photo ${slot + 1}...`);
                                const compressedDataUrl = await compressImage(file, 1200, 0.85);
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
                                    showToast(`✓ Photo ${slot + 1} updated & optimized!`);
                                  }
                                  const baseArr = (Array.isArray(quote.cover?.photos) && quote.cover.photos.length === 3)
                                    ? quote.cover.photos
                                    : ['/cover_img1.png', '/cover_img2.png', '/cover_img3.png'];
                                  const newPhotos = [...baseArr];
                                  newPhotos[slot] = compressedDataUrl;
                                  updateCoverField('photos', newPhotos);
                                };
                                imgObj.src = compressedDataUrl;
                              } catch (err) {
                                console.error('Error uploading photo:', err);
                                showToast('⚠️ Photo upload error');
                              }
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
                              const baseArr = (Array.isArray(quote.cover?.photos) && quote.cover.photos.length === 3)
                                ? quote.cover.photos
                                : ['/cover_img1.png', '/cover_img2.png', '/cover_img3.png'];
                              const newPhotos = [...baseArr];
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
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-dark/60 font-mono block">STAT TILES (ALWAYS 4)</span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">

                  {/* Tile 1: Dimensions */}
                  <div className="p-4 bg-[#F8F7F4] rounded-2xl border border-[#E2DDD3] space-y-2.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-dark/55 font-mono">DIMENSIONS</label>
                      <span className="bg-[#FEF3C7] text-[#92400E] text-[9px] font-bold px-2 py-0.5 rounded-full font-mono uppercase border border-[#FDE68A]">MANUAL</span>
                    </div>
                    <input
                      type="text"
                      value={quote.configuration?.dimensions || '240 × 80'}
                      onChange={(e) => updateConfigField('dimensions', e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-[#D6CFC2] rounded-lg font-bold text-dark text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="e.g. 4x1.2m"
                    />
                    <input
                      type="text"
                      value={quote.configuration?.dimensionsUnit || 'centimeter'}
                      onChange={(e) => updateConfigField('dimensionsUnit', e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#EFECE8] border border-[#D6CFC2] rounded-lg text-xs font-medium text-dark/70"
                      placeholder="e.g. centimeter"
                    />
                    <p className="text-[10px] text-dark/40 font-body italic">
                      value: {(quote.configuration?.dimensions || '240 × 80').length}/{16} chars
                    </p>
                  </div>

                  {/* Tile 2: Wood Type */}
                  <div className="p-4 bg-[#F8F7F4] rounded-2xl border border-[#E2DDD3] space-y-2.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-dark/55 font-mono">WOOD TYPE</label>
                      <span className="bg-[#EFF6FF] text-[#1E40AF] text-[9px] font-bold px-2 py-0.5 rounded-full font-mono uppercase border border-[#BFDBFE]">LIBRARY OR FREE TEXT</span>
                    </div>
                    <select
                      value={WOOD_LIBRARY.some(w => w.name === (quote.configuration?.woodType || 'Thermo Fraké')) ? (quote.configuration?.woodType || 'Thermo Fraké') : 'custom'}
                      onChange={(e) => {
                        if (e.target.value !== 'custom') {
                          handleWoodTypeSelect(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-[#D6CFC2] rounded-lg font-bold text-dark text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {WOOD_LIBRARY.map((w) => (
                        <option key={w.id} value={w.name}>{w.name}</option>
                      ))}
                      <option value="custom">Aangepaste houtsoort (vrije tekst)</option>
                    </select>
                    <input
                      type="text"
                      value={quote.configuration?.woodLifespan !== undefined ? quote.configuration.woodLifespan : (language === 'EN' ? '20 to 25 years' : '20 tot 25 jaar')}
                      onChange={(e) => updateConfigField('woodLifespan', e.target.value)}
                      placeholder="lifespan e.g. 20 to 25 years"
                      className="w-full px-3 py-1.5 bg-[#EFECE8] border border-[#D6CFC2] rounded-lg text-xs font-medium text-dark/70"
                    />
                    <p className="text-[10px] text-dark/40 font-body italic">
                      a library choice fills the infobox + subtitle + line item automatically · custom wood type can be filled manually
                    </p>
                  </div>

                  {/* Tile 3: Cutout (Kitchen) OR Roof & Wall (Garden room) */}
                  <div className="p-4 bg-[#F8F7F4] rounded-2xl border border-[#E2DDD3] space-y-2.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-dark/55 font-mono">
                        {isGardenRoom ? (language === 'EN' ? 'ROOF & WALLS' : 'DAK & WANDEN') : (language === 'EN' ? 'CUTOUT' : 'UITSPARING')}
                      </label>
                      <span className="bg-[#F0FDF4] text-[#166534] text-[9px] font-bold px-2 py-0.5 rounded-full font-mono uppercase border border-[#BBF7D0]">
                        {isGardenRoom ? 'GARDEN ROOM' : 'FOLLOWS OPTIONS'}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={quote.configuration?.optionsTitle || (isGardenRoom ? 'Plat dak met EPDM' : 'Big Green Egg')}
                      onChange={(e) => updateConfigField('optionsTitle', e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-[#D6CFC2] rounded-lg font-bold text-dark text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder={isGardenRoom ? 'e.g. Plat dak met EPDM' : 'e.g. Big Green Egg'}
                    />
                    <input
                      type="text"
                      value={quote.configuration?.optionsSubtext !== undefined ? quote.configuration.optionsSubtext : (isGardenRoom ? 'Glazen schuifwand 4-rail' : (language === 'EN' ? 'Large, right of center' : 'Large, rechts van het midden'))}
                      onChange={(e) => updateConfigField('optionsSubtext', e.target.value)}
                      placeholder={isGardenRoom ? 'e.g. Glazen schuifwand 4-rail' : 'e.g. Large, right of center'}
                      className="w-full px-3 py-1.5 bg-[#EFECE8] border border-[#D6CFC2] rounded-lg text-xs font-medium text-dark/70"
                    />
                    <p className="text-[10px] text-dark/40 font-body italic">
                      {isGardenRoom 
                        ? 'dakconstructie & wanden van het buitenverblijf · vult automatisch de ondertitel' 
                        : 'filled from the "Options & features" block below · freely editable afterwards'}
                    </p>
                  </div>

                  {/* Tile 4: Delivery Time */}
                  <div className="p-4 bg-[#F8F7F4] rounded-2xl border border-[#E2DDD3] space-y-2.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-dark/55 font-mono">DELIVERY TIME</label>
                      <span className="bg-[#FEF3C7] text-[#92400E] text-[9px] font-bold px-2 py-0.5 rounded-full font-mono uppercase border border-[#FDE68A]">MANUAL</span>
                    </div>
                    <input
                      type="text"
                      value={quote.configuration?.deliveryTime || (language === 'EN' ? '3 to 5 weeks' : '3 tot 5 weken')}
                      onChange={(e) => updateConfigField('deliveryTime', e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-[#D6CFC2] rounded-lg font-bold text-dark text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <input
                      type="text"
                      value={quote.configuration?.deliverySubtext !== undefined ? quote.configuration.deliverySubtext : (language === 'EN' ? 'upon drawing approval' : 'na akkoord op tekening')}
                      onChange={(e) => updateConfigField('deliverySubtext', e.target.value)}
                      placeholder="e.g. upon drawing approval"
                      className="w-full px-3 py-1.5 bg-[#EFECE8] border border-[#D6CFC2] rounded-lg text-xs font-medium text-dark/70"
                    />
                    <p className="text-[10px] text-dark/40 font-body italic">
                      also appears as the badge at process step "Production" (p6)
                    </p>
                  </div>

                </div>
              </div>

              {/* CARD 2: OPTIONS & FEATURES (ADAPTIVE: OUTDOOR KITCHEN VS GARDEN ROOM) */}
              {isGardenRoom ? (
                <div className="bg-white rounded-2xl p-5 border border-[#D6CFC2] shadow-2xs space-y-4 font-body">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-dark/80 font-mono">
                        {language === 'EN' ? 'GARDEN ROOM SPECIFICS (ROOF, WALLS, FLOOR & FOUNDATION)' : 'BUITENVERBLIJF KENMERKEN (DAK, WANDEN, VLOER & FUNDERING)'}
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">GARDEN ROOM</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-dark/50 uppercase">CONFIGURATIE</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                    {/* Dak (Roof) */}
                    <div className="p-3 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2]/70 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono">1. DAKCONSTRUCTIE (ROOF)</label>
                        <span className="text-[9px] font-mono text-primary font-bold">EPDM / PANNEN</span>
                      </div>
                      <select
                        value={quote.configuration?.roofType || 'Plat dak met EPDM'}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateConfigField('roofType', val);
                          updateConfigField('optionsTitle', val);
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#D6CFC2] rounded-lg font-bold text-xs"
                      >
                        <option value="Plat dak met EPDM">Plat dak met EPDM & aluminium daktrim</option>
                        <option value="Zadeldak met dakpannen">Zadeldak met keramische pannen</option>
                        <option value="Kapschuur model">Kapschuur model (asymmetrisch dak)</option>
                        <option value="Lessenaarsdak met EPDM">Lessenaarsdak met EPDM</option>
                        <option value="Glazen dakconstructie">Glazen overkapping / veranda dak</option>
                      </select>
                      <input
                        type="text"
                        value={quote.configuration?.roofSubtext !== undefined ? quote.configuration.roofSubtext : 'Inclusief aluminium daktrim en hemelwaterafvoer'}
                        onChange={(e) => updateConfigField('roofSubtext', e.target.value)}
                        placeholder="Dak details e.g. Daktrim & HWA"
                        className="w-full px-2.5 py-1 bg-white border border-[#D6CFC2] rounded-md text-[11px]"
                      />
                    </div>

                    {/* Wanden & Glas (Walls & Glass) */}
                    <div className="p-3 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2]/70 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono">2. WANDEN & GLAS (WALLS)</label>
                        <span className="text-[9px] font-mono text-primary font-bold">SCHUIFWANDEN</span>
                      </div>
                      <select
                        value={quote.configuration?.wallType || 'Glazen schuifwanden (4-rail)'}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateConfigField('wallType', val);
                          updateConfigField('optionsSubtext', val);
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#D6CFC2] rounded-lg font-bold text-xs"
                      >
                        <option value="Glazen schuifwanden (4-rail)">Glazen schuifwanden (4-rail gehard glas)</option>
                        <option value="Glazen schuifwanden (5-rail)">Glazen schuifwanden (5-rail gehard glas)</option>
                        <option value="Zweeds rabat zwarte wanden">Zweeds rabat zwarte achter- en zijwanden</option>
                        <option value="Gesloten houten wanden">Volledig gesloten houten wanden</option>
                        <option value="Open constructie (geen wanden)">Open overkapping (geen wanden)</option>
                      </select>
                      <input
                        type="text"
                        value={quote.configuration?.wallSubtext !== undefined ? quote.configuration.wallSubtext : '10mm gehard veiligheidsglas met tochtborstels'}
                        onChange={(e) => updateConfigField('wallSubtext', e.target.value)}
                        placeholder="Wand details e.g. Tochtborstels & handgrepen"
                        className="w-full px-2.5 py-1 bg-white border border-[#D6CFC2] rounded-md text-[11px]"
                      />
                    </div>

                    {/* Vloer (Flooring) */}
                    <div className="p-3 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2]/70 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono">3. VLOER (FLOORING)</label>
                        <span className="text-[9px] font-mono text-primary font-bold">TERRAS</span>
                      </div>
                      <select
                        value={quote.configuration?.floorType || 'Geen vloer (op terras)'}
                        onChange={(e) => updateConfigField('floorType', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#D6CFC2] rounded-lg font-bold text-xs"
                      >
                        <option value="Geen vloer (op terras)">Geen vloer (plaatsing op bestaande verharding)</option>
                        <option value="Douglas vlonderterras">Douglas vlonderterras (28mm geschaafd)</option>
                        <option value="Hardhouten vlonder">Hardhouten terras (Bangkirai)</option>
                        <option value="Keramische buitentegels">Keramische buitentegels</option>
                      </select>
                      <input
                        type="text"
                        value={quote.configuration?.floorSubtext !== undefined ? quote.configuration.floorSubtext : 'Onderbalken en rvs schroeven'}
                        onChange={(e) => updateConfigField('floorSubtext', e.target.value)}
                        placeholder="Vloer details"
                        className="w-full px-2.5 py-1 bg-white border border-[#D6CFC2] rounded-md text-[11px]"
                      />
                    </div>

                    {/* Fundering (Foundation) */}
                    <div className="p-3 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2]/70 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono">4. FUNDERING (FOUNDATION)</label>
                        <span className="text-[9px] font-mono text-primary font-bold">BETONPOEREN</span>
                      </div>
                      <select
                        value={quote.configuration?.foundationType || 'Betonpoeren met stelplaat'}
                        onChange={(e) => updateConfigField('foundationType', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#D6CFC2] rounded-lg font-bold text-xs"
                      >
                        <option value="Betonpoeren met stelplaat">Betonpoeren antraciet met verstelbare rvs stelplaat</option>
                        <option value="Schroeffundering">Schroeffundatie (zonder graafwerk)</option>
                        <option value="Gewapende betonvloer">Volledig gewapende betonplaat vorstrand</option>
                        <option value="Bestaande fundering">Bestaande fundering / terras</option>
                      </select>
                      <input
                        type="text"
                        value={quote.configuration?.foundationSubtext !== undefined ? quote.configuration.foundationSubtext : 'Vorstvrij verankerd incl. snelbeton'}
                        onChange={(e) => updateConfigField('foundationSubtext', e.target.value)}
                        placeholder="Fundering details"
                        className="w-full px-2.5 py-1 bg-white border border-[#D6CFC2] rounded-md text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              ) : (
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
                      <div className="flex flex-wrap items-center gap-2">
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
                          value={quote.configuration?.optionsSubtext !== undefined ? quote.configuration.optionsSubtext : (language === 'EN' ? 'Large, right of center' : 'Large, rechts van het midden')}
                          onChange={(e) => updateConfigField('optionsSubtext', e.target.value)}
                          className="px-3 py-1.5 bg-white border border-[#D6CFC2] rounded-lg text-xs font-semibold text-dark/80 w-48 max-w-full"
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
              )}

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
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={sec.title}
                            onChange={(e) => handleSpecSectionTitleChange(secIdx, e.target.value)}
                            className="font-bold text-xs text-dark/80 font-mono uppercase tracking-wider bg-transparent border-b border-transparent hover:border-[#D6CFC2] focus:border-primary focus:outline-none px-1 py-0.5"
                            placeholder="SECTION TITLE"
                          />
                          {sec.title === 'BEZORGING' && (
                            <span className="bg-[#EFECE6] text-dark/70 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">DEFAULT</span>
                          )}
                        </div>
                        {(quote.configuration?.specifications || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const specs = [...(quote.configuration?.specifications || [])].filter((_, idx) => idx !== secIdx);
                              updateConfigField('specifications', specs);
                              showToast('Sectie verwijderd');
                            }}
                            className="p-1 text-dark/30 hover:text-red-600 transition-colors"
                            title="Sectie verwijderen"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
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
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-dark/80 font-mono whitespace-nowrap">
                      {language === 'EN' ? 'CONFIGURATION PHOTO (PAGE 3)' : 'CONFIGURATIE FOTO (PAGINA 3)'}
                    </span>
                    <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase whitespace-nowrap">CUSTOM PHOTO</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-dark/50 uppercase whitespace-nowrap">APPEARS ON PROPOSAL PAGE 3</span>
                </div>

                <div className="flex flex-wrap items-center gap-4 bg-[#F8F7F4] p-4 rounded-xl border border-[#D6CFC2]/70">
                  <div className="relative w-full sm:w-60 h-40 rounded-xl overflow-hidden border border-[#D6CFC2] flex-shrink-0 bg-[#EAE5DC] flex items-center justify-center p-1.5 shadow-inner">
                    <img
                      src={quote.configuration?.configPhoto || projectImg}
                      alt="Configuration Preview"
                      className="w-full h-full object-cover object-center rounded-lg shadow-2xs"
                      onError={(e) => { e.target.onerror = null; e.target.src = projectImg; }}
                    />
                  </div>

                  <div className="space-y-2 flex-1 text-xs min-w-[250px]">
                    <p className="font-bold text-dark text-xs">
                      {language === 'EN' ? 'Upload Custom 3D / Project Photo' : 'Upload Aangepaste 3D / Projectfoto'}
                    </p>
                    <p className="text-[11px] text-dark/60">
                      {language === 'EN'
                        ? 'This photo is shown on Page 3 of the proposal next to the specifications and front-view diagram.'
                        : 'Deze foto wordt getoond op Pagina 3 van de offerte naast de specificaties en het vooraanzicht.'}
                    </p>

                    <div className="flex flex-col items-start gap-2 pt-2">
                      <input
                        type="file"
                        id="config-photo-uploader"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            try {
                              showToast('⏳ Uploading & optimizing configuration photo...');
                              const compressedDataUrl = await compressImage(file, 1200, 0.85);
                              updateConfigField('configPhoto', compressedDataUrl);
                              showToast('✓ Configuration photo updated & optimized!');
                            } catch (err) {
                              console.error('Error uploading configuration photo:', err);
                              showToast('⚠️ Photo upload error');
                            }
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

              {/* CARD 5: FRONT-VIEW LAYOUT (DIAGRAM BUILDER VS GARDEN ROOM SCHEMATIC) */}
              <div className="bg-white rounded-2xl p-5 border border-[#D6CFC2] shadow-2xs space-y-4">
                <div className="flex justify-between items-center border-b border-[#D6CFC2]/60 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-dark/80 font-mono">
                    {isGardenRoom ? (language === 'EN' ? 'GARDEN ROOM STRUCTURAL SCHEMATIC' : 'BUITENVERBLIJF MAATVOERING & OPZET') : (language === 'EN' ? 'FRONT-VIEW LAYOUT' : 'VOORAANZICHT INDELING')}
                  </span>
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

                {isGardenRoom ? (
                  <div className="p-4 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2] space-y-3 font-body">
                    <div className="flex justify-between items-center text-xs font-mono font-bold text-dark/70">
                      <span>ARCHITECTONISCHE OPZET ({quote.configuration?.dimensions || '600 × 350'} CM)</span>
                      <span className="text-primary font-bold">{quote.configuration?.roofType || 'Plat dak met EPDM'}</span>
                    </div>

                    <div className="w-full bg-[#2C3827] rounded-xl p-4 text-white flex flex-col justify-between border border-[#45543D] shadow-inner font-mono text-[11px] space-y-3">
                      <div className="flex justify-between items-center text-[#D6CFC2] border-b border-[#45543D] pb-1.5">
                        <span>◀── {quote.configuration?.dimensions ? quote.configuration.dimensions.split('×')[0]?.trim() : '600'} cm (Breedte) ──▶</span>
                        <span className="bg-[#45543D] px-2.5 py-0.5 rounded text-white font-bold">{quote.configuration?.woodType || 'Douglas'}</span>
                      </div>
                      <div className="border border-dashed border-[#7E9672]/70 h-20 rounded-lg flex items-center justify-around px-3 text-[#E8E4DC]">
                        <div className="border border-[#7E9672] px-2 py-1 bg-[#3A4A33] rounded text-center">
                          <span className="block text-[9px] text-[#A8B4A2]">Staander</span>
                          150×150 mm
                        </div>
                        <div className="text-center font-sans italic text-xs text-[#C4A47C] font-semibold px-4">
                          {quote.configuration?.wallType || 'Glazen schuifwand (4-rail gehard glas)'}
                        </div>
                        <div className="border border-[#7E9672] px-2 py-1 bg-[#3A4A33] rounded text-center">
                          <span className="block text-[9px] text-[#A8B4A2]">Staander</span>
                          150×150 mm
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-[#D6CFC2] text-[10px] pt-1 border-t border-[#45543D]">
                        <span>Diepte: {quote.configuration?.dimensions && quote.configuration.dimensions.includes('×') ? quote.configuration.dimensions.split('×')[1]?.trim() : '350'} cm</span>
                        <span>Hoogte: 260 cm (Doorloop: 230 cm)</span>
                        <span>Fundering: {quote.configuration?.foundationType || 'Betonpoeren'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <DiagramBuilder
                    diagram={quote.configuration?.diagram}
                    onChange={(updatedDiagram) => updateConfigField('diagram', updatedDiagram)}
                  />
                )}
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
                      <div className="flex flex-wrap xl:flex-nowrap items-center gap-2.5 text-xs">
                        <input
                          type="text"
                          value={item.title || ''}
                          onChange={(e) => handleLineItemChange(idx, 'title', e.target.value)}
                          placeholder="Line item title"
                          className="w-full xl:flex-1 px-3.5 py-2 bg-white border border-[#D6CFC2] rounded-xl font-bold text-dark text-xs focus:outline-none focus:border-primary min-w-[200px]"
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

              {/* CARD: STELPOST & ASTERISK DISCLAIMER */}
              <div className="bg-white rounded-2xl p-5 border border-[#D6CFC2] shadow-2xs space-y-3">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-dark/80 font-mono">ASTERISK / STELPOST DISCLAIMER NOTE</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">EDITABLE IN PDF P4</span>
                </div>
                <textarea
                  rows={2}
                  value={quote.investment?.stelpostDisclaimer !== undefined ? quote.investment.stelpostDisclaimer : '* Stelpost: dit bedrag is een zorgvuldige inschatting. We rekenen af op basis van de werkelijke kosten, altijd in overleg vooraf.'}
                  onChange={(e) => updateInvestmentField('stelpostDisclaimer', e.target.value)}
                  disabled={isApproved}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D6CFC2] rounded-xl text-xs text-dark focus:outline-none focus:border-primary disabled:opacity-60"
                  placeholder="* Stelpost toelichting..."
                />
                <p className="text-[10px] text-dark/50 font-body">Verschijnt direct onder de specificatietabel op pagina 4 van de offerte.</p>
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

              {/* CARD 3: CHECKLIST INBEGREPEN — FULLY EDITABLE */}
              <div className="bg-white rounded-2xl p-5 border border-[#D6CFC2] shadow-2xs space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-dark/80 font-mono">CHECKLIST "INBEGREPEN BIJ JOUW INVESTERING"</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">EDITABLE</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddChecklistItem}
                      disabled={isApproved}
                      className="px-3 py-1 bg-[#33422C] text-white text-xs font-bold rounded-lg font-mono hover:bg-[#283523] cursor-pointer shadow-2xs disabled:opacity-40"
                    >
                      + item
                    </button>
                    <button
                      type="button"
                      onClick={handleResetChecklistDefaults}
                      disabled={isApproved}
                      className="px-3 py-1 bg-white border border-[#D6CFC2] text-dark/70 text-xs font-bold rounded-lg font-mono hover:bg-[#EFECE6] cursor-pointer disabled:opacity-40"
                    >
                      ↺ Reset
                    </button>
                  </div>
                </div>

                {/* Editable checklist title */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono block mb-1">SECTION HEADING (in PDF)</label>
                  <input
                    type="text"
                    value={quote.investment?.checklistTitle || 'Inbegrepen bij jouw investering'}
                    onChange={(e) => updateInvestmentField('checklistTitle', e.target.value)}
                    disabled={isApproved}
                    className="w-full px-3.5 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs font-bold text-dark focus:outline-none focus:border-primary disabled:opacity-60"
                    placeholder="Inbegrepen bij jouw investering"
                  />
                </div>

                <div className="space-y-2 text-xs">
                  {(quote.investment?.checklist || [
                    'Volledig maatwerk, gebouwd door een gecertificeerde vakspecialist',
                    'Digitale tekening vooraf ter goedkeuring',
                    `Gratis bezorging in ${quote.customer?.city || 'Dongen'}`,
                    'Garantie en nazorg na levering'
                  ]).map((cLine, cIdx) => (
                    <div key={cIdx} className="flex items-center gap-2.5 p-3 bg-white border border-[#D6CFC2] rounded-xl shadow-2xs hover:border-primary/40 transition-all">
                      <span className="text-[#33422C] font-bold flex-shrink-0">✓</span>
                      <input
                        type="text"
                        value={cLine}
                        onChange={(e) => handleChecklistChange(cIdx, e.target.value)}
                        disabled={isApproved}
                        className="flex-1 bg-transparent border-none focus:outline-none text-xs text-dark font-body font-medium disabled:opacity-70"
                        placeholder="Checklist item..."
                      />
                      {String(cLine).includes('{city}') && (
                        <span className="text-[9px] font-mono text-dark/40 italic flex-shrink-0">{'{city} token'}</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveChecklistItem(cIdx)}
                        disabled={isApproved || (quote.investment?.checklist || []).length <= 1}
                        className="p-1 text-dark/30 hover:text-red-600 transition-colors flex-shrink-0 disabled:opacity-20"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-dark/50 font-body">
                  Use <code className="bg-[#EFECE6] px-1 rounded">{'{city}'}</code> and <code className="bg-[#EFECE6] px-1 rounded">{'{finish}'}</code> tokens — they are replaced automatically in the PDF.
                </p>
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

              {/* CARD: GELDIGHEID & BTW FOOTNOTE */}
              <div className="bg-white rounded-2xl p-5 border border-[#D6CFC2] shadow-2xs space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-dark/80 font-mono">GELDIGHEID & BTW FOOTNOTE</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono block">Geldigheidstermijn tekst (in PDF)</label>
                    <input
                      type="text"
                      value={quote.investment?.validityText !== undefined ? quote.investment.validityText : 'Deze offerte is geldig tot en met {date}'}
                      onChange={(e) => updateInvestmentField('validityText', e.target.value)}
                      disabled={isApproved}
                      className="w-full px-3.5 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs text-dark focus:outline-none focus:border-primary disabled:opacity-60 font-body"
                      placeholder="Deze offerte is geldig tot en met {date}"
                    />
                    <p className="text-[10px] text-dark/50 font-body">Gebruik <code className="bg-[#EFECE6] px-1 rounded">{'{date}'}</code> om de dynamische datum in te vullen.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono block">Btw toelichting (in groen totaalblok)</label>
                    <input
                      type="text"
                      value={quote.investment?.vatDisclaimer !== undefined ? quote.investment.vatDisclaimer : 'Alle bedragen inclusief btw'}
                      onChange={(e) => updateInvestmentField('vatDisclaimer', e.target.value)}
                      disabled={isApproved}
                      className="w-full px-3.5 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs text-dark focus:outline-none focus:border-primary disabled:opacity-60 font-body"
                      placeholder="Alle bedragen inclusief btw"
                    />
                    <p className="text-[10px] text-dark/50 font-body">Verschijnt in het donkergroene totaalblok op pagina 4.</p>
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
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-dark/80 font-mono">PAYMENT INSTALMENTS</span>
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <button
                            type="button"
                            onClick={() => handleSetCount(2)}
                            className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${count === 2 ? 'bg-[#33422C] text-white' : 'bg-[#EFECE6] text-dark/70 hover:bg-[#E2DDD3]'
                              }`}
                          >
                            2 Instalments (50/50)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetCount(3)}
                            className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${count === 3 ? 'bg-[#33422C] text-white' : 'bg-[#EFECE6] text-dark/70 hover:bg-[#E2DDD3]'
                              }`}
                          >
                            3 Instalments (30/40/30)
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className={`inline-block text-xs font-mono font-bold px-2.5 py-1 rounded-md ${isSumValid ? 'text-emerald-800 bg-emerald-100' : 'text-red-800 bg-red-100'
                          }`}>
                          SUM = {pSum}% {isSumValid ? '✓' : '⚠️ Must equal 100%'}
                        </span>
                      </div>
                    </div>

                    <div className={`grid grid-cols-1 ${count === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4`}>
                      {instCards.map((inst, idx) => {
                        const currentLabels = quote.investment?.instalments?.labels || (count === 3 ? ['Bij akkoord', 'Bij start bouw', 'Bij levering'] : ['Bij akkoord', 'Bij levering']);
                        const currentLabel = currentLabels[idx] !== undefined ? currentLabels[idx] : inst.label;

                        const defaultSubtexts = count === 3
                          ? ['Na akkoord op de technische tekening.', 'Vlak vóór de startdatum op locatie.', 'Pas als alles naar wens is opgeleverd.']
                          : ['Na akkoord op de technische tekening.', 'Pas als alles naar wens is opgeleverd.'];
                        const currentSubtexts = quote.investment?.instalments?.subtexts || defaultSubtexts;
                        const currentSubtext = currentSubtexts[idx] !== undefined ? currentSubtexts[idx] : (defaultSubtexts[idx] || '');

                        return (
                          <div key={idx} className="p-4 bg-white border border-[#D6CFC2] rounded-xl space-y-3 shadow-2xs">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-dark/70 font-mono block">
                              INSTALMENT {idx + 1}
                            </span>
                            {/* Editable label */}
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-dark/60 font-mono block">LABEL</label>
                              <input
                                type="text"
                                value={currentLabel}
                                onChange={(e) => handleUpdateInstalmentLabel(idx, e.target.value)}
                                disabled={isApproved}
                                className="w-full px-2.5 py-1.5 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs font-bold text-dark focus:outline-none focus:border-primary disabled:opacity-60"
                                placeholder={idx === 0 ? 'Bij akkoord' : idx === 1 && count === 3 ? 'Bij start bouw' : 'Bij levering'}
                              />
                            </div>

                            {/* Editable subtext */}
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-dark/60 font-mono block">TOELICHTING / SUBTEXT</label>
                              <input
                                type="text"
                                value={currentSubtext}
                                onChange={(e) => handleUpdateInstalmentSubtext(idx, e.target.value)}
                                disabled={isApproved}
                                className="w-full px-2.5 py-1.5 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs text-dark/80 focus:outline-none focus:border-primary disabled:opacity-60"
                                placeholder={defaultSubtexts[idx] || 'Toelichting termijn...'}
                              />
                            </div>

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
                        );
                      })}
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
                              { id: 1, title: 'Gecertificeerde vakmensen', desc: 'De bouw ligt altijd bij gecertificeerde vakspecialisten uit ons landelijke netwerk. Vakwerk, van fundering tot afwerking.' },
                              { id: 2, title: 'Eén vast aanspreekpunt', desc: 'Je schakelt rechtstreeks met Tim of Bram, via WhatsApp, mail of telefoon. Korte lijnen, snelle antwoorden.' },
                              { id: 3, title: 'Garantie én nazorg', desc: 'Garantie op de constructie en nazorg na oplevering. Ook als het verblijf er staat, blijven wij je aanspreekpunt.' },
                              { id: 4, title: 'Eerlijke prijs, bewust online', desc: 'Geen showroom is een bewuste keuze. Zo betaal je voor vakwerk en materiaal, niet voor overhead.' }
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
                          { id: 1, title: 'Gecertificeerde vakmensen', desc: 'De bouw ligt altijd bij gecertificeerde vakspecialisten uit ons landelijke netwerk. Vakwerk, van fundering tot afwerking.' },
                          { id: 2, title: 'Eén vast aanspreekpunt', desc: 'Je schakelt rechtstreeks met Tim of Bram, via WhatsApp, mail of telefoon. Korte lijnen, snelle antwoorden.' },
                          { id: 3, title: 'Garantie én nazorg', desc: 'Garantie op de constructie en nazorg na oplevering. Ook als het verblijf er staat, blijven wij je aanspreekpunt.' },
                          { id: 4, title: 'Eerlijke prijs, bewust online', desc: 'Geen showroom is een bewuste keuze. Zo betaal je voor vakwerk en materiaal, niet voor overhead.' }
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

              {/* CARD 2: PROCESS STEPS (P6) — FULLY EDITABLE */}
              <div className="bg-white rounded-2xl p-5 border border-[#D6CFC2] shadow-2xs space-y-3.5">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-dark/80 font-mono">PROCESS STEPS (P6, 4-6 STEPS)</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">EDITABLE</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddProcessStep}
                      disabled={isApproved}
                      className="px-3 py-1 bg-[#33422C] text-white text-xs font-bold rounded-lg font-mono hover:bg-[#283523] cursor-pointer shadow-2xs disabled:opacity-40"
                    >
                      + step
                    </button>
                    <button
                      type="button"
                      onClick={handleResetProcessStepDefaults}
                      disabled={isApproved}
                      className="px-3 py-1 bg-white border border-[#D6CFC2] text-dark/70 text-xs font-bold rounded-lg font-mono hover:bg-[#EFECE6] cursor-pointer disabled:opacity-40"
                    >
                      ↺ Reset
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  {(quote.letterAndProcess?.processSteps || [
                    { step: '1', title: 'Akkoord op de offerte', desc: 'Bevestig eenvoudig per mail of WhatsApp, of onderteken de akkoordpagina. Vanaf dat moment nemen wij alles uit handen.', badge: '' },
                    { step: '2', title: 'Digitale tekening ter bevestiging', desc: 'Je ontvangt het definitieve ontwerp met technische tekening ter bevestiging. Zo weet je precies wat er gebouwd wordt vóór de bouw start.', badge: '' },
                    { step: '3', title: 'Productie door onze vakspecialist', desc: 'Jouw keuken wordt met de hand gemaakt door een gecertificeerde vakspecialist. Tussentijds houden we je op de hoogte.', badge: '3 TOT 5 WEKEN' },
                    { step: '4', title: `Bezorging in ${quote.customer?.city || 'Dongen'}`, desc: `We leveren de keuken op een moment dat jou uitkomt in ${quote.customer?.city || 'Dongen'}. Dankzij de zes zwenkwielen staat hij direct op de juiste plek.`, badge: 'GRATIS' },
                    { step: '5', title: 'Garantie & nazorg', desc: 'We leveren pas op als alles naar wens is. Ook daarna blijven wij je vaste aanspreekpunt, met garantie op de constructie.', badge: '' }
                  ]).map((ps, psIdx) => (
                    <div key={psIdx} className="p-3.5 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2]/70 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 font-mono font-bold text-dark/70 text-xs">
                          <span className="w-5 h-5 bg-[#33422C] text-white rounded-full flex items-center justify-center text-[10px] flex-shrink-0">{ps.step}</span>
                          <input
                            type="text"
                            value={ps.title}
                            onChange={(e) => handleProcessStepChange(psIdx, 'title', e.target.value)}
                            disabled={isApproved}
                            placeholder="Step title"
                            className="flex-1 px-2 py-1 bg-white border border-[#D6CFC2] rounded-lg text-xs font-bold text-dark focus:outline-none focus:border-primary disabled:opacity-60"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveProcessStep(psIdx)}
                          disabled={isApproved || (quote.letterAndProcess?.processSteps || []).length <= 1}
                          className="p-1 text-dark/30 hover:text-red-600 transition-colors flex-shrink-0 disabled:opacity-20"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <textarea
                          rows={2}
                          value={ps.desc}
                          onChange={(e) => handleProcessStepChange(psIdx, 'desc', e.target.value)}
                          disabled={isApproved}
                          placeholder="Step description..."
                          className="flex-1 px-2.5 py-1.5 bg-white border border-[#D6CFC2] rounded-lg text-xs text-dark focus:outline-none font-body disabled:opacity-60"
                        />
                        <input
                          type="text"
                          value={ps.badge}
                          onChange={(e) => handleProcessStepChange(psIdx, 'badge', e.target.value)}
                          disabled={isApproved}
                          placeholder="Badge (optional)"
                          className="w-28 px-2 py-1 bg-white border border-[#D6CFC2] rounded-lg text-xs font-bold text-dark uppercase focus:outline-none disabled:opacity-60"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-dark/50 font-body">Title, description, and badge are all editable. Leave badge empty to hide it.</p>
              </div>

              {/* CARD 3: APPROVAL PAGE (P5) */}
              <div className="bg-white rounded-2xl p-5 border border-[#D6CFC2] shadow-2xs space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-dark/80 font-mono">APPROVAL PAGE (P5)</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">EDITABLE</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono block mb-1">APPROVAL TITLE</label>
                    <input
                      type="text"
                      value={quote.letterAndProcess?.approvalTitle || 'Akkoord op de offerte'}
                      onChange={(e) => updateLetterField('approvalTitle', e.target.value)}
                      disabled={isApproved}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl font-bold text-dark text-xs focus:outline-none focus:border-primary disabled:opacity-60"
                      placeholder="Akkoord op de offerte"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono block mb-1">APPROVAL SUBHEADING</label>
                    <input
                      type="text"
                      value={quote.letterAndProcess?.approvalSubheading || 'Zo geeft u akkoord'}
                      onChange={(e) => updateLetterField('approvalSubheading', e.target.value)}
                      disabled={isApproved}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl font-bold text-dark text-xs focus:outline-none focus:border-primary disabled:opacity-60"
                      placeholder="Zo geeft u akkoord"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono block mb-1">APPROVAL TEXT</label>
                  <textarea
                    rows={3}
                    value={quote.letterAndProcess?.approvalText || 'Geef akkoord via de handtekeningpagina, per e-mail, of via WhatsApp. Na uw bevestiging nemen wij het volledig over.'}
                    onChange={(e) => updateLetterField('approvalText', e.target.value)}
                    disabled={isApproved}
                    className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs text-dark focus:outline-none font-body disabled:opacity-60"
                    placeholder="Approval text..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1 border-t border-[#D6CFC2]/60">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono block mb-1">SIGN-OFF NAME</label>
                    <input
                      type="text"
                      value={quote.letterAndProcess?.signoffName || 'Tim & Bram'}
                      onChange={(e) => updateLetterField('signoffName', e.target.value)}
                      disabled={isApproved}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl font-bold text-dark text-xs focus:outline-none focus:border-primary disabled:opacity-60"
                      placeholder="Tim & Bram"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono block mb-1">SIGN-OFF ROLE</label>
                    <input
                      type="text"
                      value={quote.letterAndProcess?.signoffRole || 'Vanuit Ambacht'}
                      onChange={(e) => updateLetterField('signoffRole', e.target.value)}
                      disabled={isApproved}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl font-bold text-dark text-xs focus:outline-none focus:border-primary disabled:opacity-60"
                      placeholder="Vanuit Ambacht"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 4: CLOSING QUOTE (P6 BOTTOM) */}
              <div className="bg-white rounded-2xl p-5 border border-[#D6CFC2] shadow-2xs space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-dark/80 font-mono">CLOSING QUOTE (P6 BOTTOM)</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">EDITABLE</span>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono block mb-1">QUOTE TEXT</label>
                  <textarea
                    rows={2}
                    value={quote.letterAndProcess?.closingQuote || '"Wij bouwen niet alleen buitenkeukens. Wij bouwen ervaringen."'}
                    onChange={(e) => updateLetterField('closingQuote', e.target.value)}
                    disabled={isApproved}
                    className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs text-dark focus:outline-none font-body disabled:opacity-60"
                    placeholder='"Wij bouwen niet alleen buitenkeukens..."'
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-dark/60 font-mono block mb-1">QUOTE AUTHOR</label>
                  <input
                    type="text"
                    value={quote.letterAndProcess?.closingAuthor || '— Tim & Bram, Vanuit Ambacht'}
                    onChange={(e) => updateLetterField('closingAuthor', e.target.value)}
                    disabled={isApproved}
                    className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl font-bold text-dark text-xs focus:outline-none focus:border-primary disabled:opacity-60"
                    placeholder="— Tim & Bram, Vanuit Ambacht"
                  />
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
                    disabled={quote?.status === 'Draft' || quote?.status === 'Concept' || quote?.status === 'DRAFT'}
                    onClick={() => {
                      if (quote?.status === 'Draft' || quote?.status === 'Concept' || quote?.status === 'DRAFT') return;
                      const shareToken = quote?.publicToken || quote?.id;
                      const publicUrl = `${window.location.origin}/offerte/${shareToken}`;
                      navigator.clipboard.writeText(publicUrl);
                      showToast(language === 'EN' ? 'Public quote approval link copied!' : 'Publieke offerte akkoord-link gekopieerd!');
                    }}
                    className={`px-4 py-2.5 font-bold text-xs rounded-xl shadow-xs transition-all font-mono flex items-center gap-2 ${
                      (quote?.status === 'Draft' || quote?.status === 'Concept' || quote?.status === 'DRAFT')
                        ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-60'
                        : 'bg-white border border-[#D6CFC2] text-dark hover:bg-[#EDE8DF] cursor-pointer'
                    }`}
                    title={(quote?.status === 'Draft' || quote?.status === 'Concept' || quote?.status === 'DRAFT')
                      ? (language === 'EN' ? 'Draft quote — Approve quote internally to enable send buttons' : 'Concept offerte — Keur offerte intern goed om verzendopties te ontgrendelen')
                      : 'Copy Public Digital Approval Link'}
                  >
                    <span className="text-emerald-700">🔗</span>
                    <span>Copy approval link</span>
                  </button>
                </div>

                {(quote?.status === 'Draft' || quote?.status === 'Concept' || quote?.status === 'DRAFT') && (
                  <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs flex items-center gap-2 font-body">
                    <span className="font-bold font-mono text-[10px] bg-amber-200 px-2 py-0.5 rounded text-amber-900">🔒 DRAFT GATED</span>
                    <span>
                      {language === 'EN'
                        ? 'Draft quote — WhatsApp & E-mail send channels are disabled until quote is approved internally.'
                        : 'Concept offerte — WhatsApp & E-mail verzendopties zijn vergrendeld totdat de offerte intern goedgekeurd is.'}
                    </span>
                  </div>
                )}

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
                  Filename: <strong className="font-bold text-dark">Quote-{quote.id} {typeof quote.customer === 'object' ? (quote.customer?.name || 'Jan de Vries') : (quote.customer || 'Jan de Vries')}.pdf</strong> · draft saving is non-blocking
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
        {/* ZONE 3: LIVE PREVIEW - always visible                     */}
        {/* ========================================================= */}
        <div className="w-[180px] flex-shrink-0 overflow-y-auto max-h-[calc(100vh-175px)] pr-1 no-scrollbar">
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
