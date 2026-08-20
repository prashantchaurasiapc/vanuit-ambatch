import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from './Card';
import Button from './Button';
import Badge from './Badge';
import { useLanguage } from '../context/LanguageContext';
import { 
  UserPlus, MessageSquare, FileText, CheckCircle2, CheckCircle, Briefcase, 
  UserCheck, Calendar, Award, ArrowRight, Check, Clock, Phone, 
  Mail, MapPin, DollarSign, Wrench, ShieldCheck, Download, ChevronRight,
  AlertCircle, X, Sparkles, Send, FileSpreadsheet, CheckSquare, MessageCircle, Paperclip,
  Mic, Play, Pause, FileAudio, Volume2, Sliders, Globe, PhoneCall
} from 'lucide-react';
import { convertLeadToCustomerOnInvoiceSent } from '../utils/customerConversion';
import { safeSetItem } from '../utils/storageHelper';
import { downloadDirectPdfFile } from '../utils/pdfGenerator';

export const WORKFLOW_STEPS = [
  { id: 1, name: 'New lead', desc: 'Contact & first intake', icon: UserPlus, statusKey: 'new', color: 'blue' },
  { id: 2, name: 'Partner price request', desc: 'Specs + choose partner', icon: MessageSquare, statusKey: 'inConversation', color: 'amber' },
  { id: 3, name: 'Partner price received', desc: 'Record cost price', icon: FileText, statusKey: 'priceReceived', color: 'emerald' },
  { id: 4, name: 'Build the quote', desc: 'Margin + line items', icon: CheckCircle2, statusKey: 'quoteSent', color: 'green' },
  { id: 5, name: 'Review & send', desc: 'Preview & send PDF', icon: Send, statusKey: 'quoteSent', color: 'blue' },
  { id: 6, name: 'Customer approval', desc: 'Deposit & confirmed', icon: UserCheck, statusKey: 'won', color: 'purple' },
  { id: 7, name: 'Create project', desc: 'Work order setup', icon: Briefcase, statusKey: 'won', color: 'cyan' },
  { id: 8, name: 'Planning & delivery', desc: 'Site schedule & completion', icon: Calendar, statusKey: 'won', color: 'emerald' }
];

export default function WorkflowTracker({ lead, onClose, onUpdateStatus, onOpenPartnerWizard }) {
  const { t, tStatus, language } = useLanguage();
  const initialStep = lead?.workflowStep || 1;
  const [currentStep, setCurrentStep] = useState(initialStep);
  const isLeadCompleted = currentStep === 8;
  const [autoModalType, setAutoModalType] = useState(null); // 'quote' | 'project' | 'partner' | 'invoice' | null
  const [toastMsg, setToastMsg] = useState('');

  // Commercial Actions State
  const [commercialActions, setCommercialActions] = useState(() => {
    try {
      const saved = localStorage.getItem(`app_commercial_actions_${lead?.id || 'default'}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      {
        id: 1,
        date: '2026-08-05 14:30',
        user: 'Tim (Admin)',
        note: 'Initial phone consultation completed. Client confirmed interest in luxury teak wood finish and 3.5m length.'
      }
    ];
  });
  const [commercialModalOpen, setCommercialModalOpen] = useState(false);
  const [newCommercialNote, setNewCommercialNote] = useState('');
  const [commercialTaskForm, setCommercialTaskForm] = useState({
    createTask: true,
    assignee: 'Bram', // 'Bram' | 'Tim'
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const handleSaveCommercialAction = (e) => {
    e.preventDefault();
    if (!newCommercialNote.trim()) return;
    const newAction = {
      id: Date.now(),
      date: new Date().toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' }),
      user: 'Tim (Admin)',
      note: newCommercialNote.trim(),
      assignee: commercialTaskForm.createTask ? commercialTaskForm.assignee : null,
      dueDate: commercialTaskForm.createTask ? commercialTaskForm.dueDate : null
    };
    const updated = [newAction, ...commercialActions];
    setCommercialActions(updated);
    localStorage.setItem(`app_commercial_actions_${lead?.id || 'default'}`, JSON.stringify(updated));

    // Automatically create and sync related task to Task Board (app_tasks_v2 & app_tasks)
    if (commercialTaskForm.createTask) {
      try {
        const savedTasks = localStorage.getItem('app_tasks_v2') || localStorage.getItem('app_tasks');
        let tasksList = [];
        if (savedTasks) {
          try { tasksList = JSON.parse(savedTasks); } catch (err) {}
        }
        
        const customerName = lead?.name || lead?.customerName || 'Klant';
        const newTask = {
          id: `TSK-COMM-${Date.now().toString().slice(-4)}`,
          title: `[Commercial Action] ${newCommercialNote.trim().slice(0, 45)}${newCommercialNote.trim().length > 45 ? '...' : ''}`,
          linkedType: 'Lead',
          linkedId: `${customerName} (${lead?.id || 'Lead'})`,
          assignee: commercialTaskForm.assignee,
          assignedTo: commercialTaskForm.assignee,
          priority: 'Medium',
          dueDate: commercialTaskForm.dueDate,
          completed: false,
          createdDate: new Date().toISOString().split('T')[0]
        };

        const updatedTasksList = [newTask, ...tasksList];
        localStorage.setItem('app_tasks_v2', JSON.stringify(updatedTasksList));
        localStorage.setItem('app_tasks', JSON.stringify(updatedTasksList));
        window.dispatchEvent(new Event('app_data_changed'));
      } catch (err) {}
    }

    setNewCommercialNote('');
    setCommercialModalOpen(false);
    showToast(commercialTaskForm.createTask
      ? (language === 'EN' ? `Commercial action & task assigned to ${commercialTaskForm.assignee}!` : `Commerciële actie & taak toegewezen aan ${commercialTaskForm.assignee}!`)
      : (language === 'EN' ? 'Commercial action recorded successfully!' : 'Commerciële actie succesvol opgeslagen!'));
  };

  // Plaud AI Audio Recordings State
  const [plaudRecordings, setPlaudRecordings] = useState(() => {
    try {
      const saved = localStorage.getItem(`app_plaud_audio_${lead?.id || 'default'}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      {
        id: 1,
        title: 'Call Recording — Teak Wood & Concrete Countertop Discussion',
        duration: '03:42 min',
        date: '2026-08-05 15:10',
        user: 'Plaud AI Note',
        summary: 'Plaud AI Summary: Client confirmed 3.5m length for teak wood kitchen with dark polished concrete cire countertop. Requested site visit next week.',
        fileName: 'plaud_rec_mark_davis_05082026.mp3'
      }
    ];
  });
  const [plaudModalOpen, setPlaudModalOpen] = useState(false);
  const [plaudAudioForm, setPlaudAudioForm] = useState({
    title: '',
    duration: '03:15 min',
    summary: '',
    fileName: 'plaud_voice_recording.mp3'
  });
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const audioFileInputRef = useRef(null);

  const handleAudioFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPlaudAudioForm(prev => ({
        ...prev,
        title: prev.title || `Voice Note: ${file.name.replace(/\.[^/.]+$/, "")}`,
        fileName: file.name
      }));
      showToast(`Plaud AI audio file "${file.name}" loaded!`);
    }
  };

  const handleSavePlaudAudio = (e) => {
    e.preventDefault();
    const newRecording = {
      id: Date.now(),
      title: plaudAudioForm.title || 'Plaud AI Call Note',
      duration: plaudAudioForm.duration || '02:45 min',
      date: new Date().toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' }),
      user: 'Plaud AI Import',
      summary: plaudAudioForm.summary || 'Recorded phone call auto-imported via Plaud AI. Conversation summary and key specs logged.',
      fileName: plaudAudioForm.fileName
    };
    const updated = [newRecording, ...plaudRecordings];
    setPlaudRecordings(updated);
    localStorage.setItem(`app_plaud_audio_${lead?.id || 'default'}`, JSON.stringify(updated));
    setPlaudModalOpen(false);
    setPlaudAudioForm({ title: '', duration: '03:15 min', summary: '', fileName: 'plaud_voice_recording.mp3' });
    showToast(language === 'EN' ? 'Plaud AI Audio Note imported & saved!' : 'Plaud AI Spraakopname geïmporteerd!');
  };

  // Claude AI Draft Proposal Engine State
  const [claudeProposalModalOpen, setClaudeProposalModalOpen] = useState(false);
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
  const [generatedProposal, setGeneratedProposal] = useState(null);
  const [quoteViewModalOpen, setQuoteViewModalOpen] = useState(false);

  // Dual Path Workflow Branching State ('partner' vs 'direct')
  const [workflowPath, setWorkflowPath] = useState(lead?.requiresPartner === false ? 'direct' : 'partner');

  // Dynamic Category Specification Fields (Synced live with Settings -> Veldinstellingen)
  const [dynamicFieldSets, setDynamicFieldSets] = useState(() => {
    try {
      const saved = localStorage.getItem('app_fieldset_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      buitenkeuken: [
        { id: 'f-001', label: 'Werkblad Type & Afwerking', type: 'select', options: ['Gepolijst Beton Cire (8cm Zwart)', 'Graniet Zwart Mat', 'RVS Werkblad', 'Massief Teak Hout'], required: true },
        { id: 'f-002', label: 'Houtsoort Onderstel', type: 'select', options: ['Thermo Fraké Hout (Recommended)', 'Massief Teakhout', 'Eikenhout', 'Zwart Gepoedercoat Staal'], required: true },
        { id: 'f-003', label: 'Inbouw Kamado Cutout', type: 'select', options: ['Big Green Egg Large', 'Kamado Joe Classic III', 'Bastard Large', 'Geen Kamado Cutout'], required: true }
      ],
      buitenverblijf: [
        { id: 'f-101', label: 'Isolatie Type (Dak & Wand)', type: 'select', options: ['PIR 80mm', 'Steenwol 100mm', 'Geen isolatie'], required: true },
        { id: 'f-102', label: 'Glaswand Optie', type: 'select', options: ['Glazen schuifwanden (5-rail)', 'Vaste glazen wanden', 'Geen glas'], required: true },
        { id: 'f-103', label: 'Houtsoort Frame', type: 'select', options: ['Massief Teakhout', 'Douglas Hout', 'Eikenhout'], required: true }
      ]
    };
  });

  const [specFormValues, setSpecFormValues] = useState({});

  useEffect(() => {
    const loadFieldSets = () => {
      try {
        const saved = localStorage.getItem('app_fieldset_config');
        if (saved) setDynamicFieldSets(JSON.parse(saved));
      } catch (e) {}
    };
    loadFieldSets();
    window.addEventListener('app_data_changed', loadFieldSets);
    return () => window.removeEventListener('app_data_changed', loadFieldSets);
  }, []);

  const getCategoryKey = (catStr) => {
    const s = (catStr || '').toLowerCase();
    if (s.includes('verblijf') || s.includes('building') || s.includes('garden') || s.includes('tuinkamer')) return 'buitenverblijf';
    if (s.includes('overkapping') || s.includes('canopy') || s.includes('pergola')) return 'overkapping';
    if (s.includes('poolhouse')) return 'poolhouse';
    return 'buitenkeuken';
  };

  const activeCategoryKey = getCategoryKey(lead?.productType || customerCategory);

  // Step 2 Editable Free-Text Fields & Smart Green Logic State
  const [step2ProductType, setStep2ProductType] = useState(lead?.productType || customerCategory || '');
  const [step2Size, setStep2Size] = useState(lead?.size || lead?.dimensions || '');
  const [step2Notes, setStep2Notes] = useState(lead?.notes || '');
  const [step2RequestedDate, setStep2RequestedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [step2ExpectedDate, setStep2ExpectedDate] = useState(() => new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [step2Material, setStep2Material] = useState('Douglas');
  const [isPriceRequestSent, setIsPriceRequestSent] = useState(false);

  // Partner Form State (Declared early so all step handlers can access it)
  const [partnerForm, setPartnerForm] = useState({
    partnerName: 'Ruben Verbeij — RV Meubels',
    company: 'RV Meubels',
    buildPrice: '8500',
    deliveryWeek: 'Week 49 (Dec 2023)'
  });

  // Step 3 — Partner Price Received (Internal Cost — NEVER shown to customer or partner)
  const [partnerCostPrice, setPartnerCostPrice] = useState('');
  const [partnerValidUntil, setPartnerValidUntil] = useState(() => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [partnerLeadTime, setPartnerLeadTime] = useState('4–5 weken');
  const [partnerPriceNotes, setPartnerPriceNotes] = useState('');
  const [marginPercent, setMarginPercent] = useState(35);
  const [partnerPriceLocked, setPartnerPriceLocked] = useState(false);

  // Dynamic Available Partners List State
  const [availablePartners, setAvailablePartners] = useState([]);
  const [submittedPartnerOffer, setSubmittedPartnerOffer] = useState(null);

  useEffect(() => {
    const loadPartners = () => {
      let combined = [];

      // 1. Load from app_partners_v4 / app_partners
      try {
        const saved = localStorage.getItem('app_partners_v4') || localStorage.getItem('app_partners');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            parsed.forEach(p => {
              const name = p.name || p.company || p.contactPerson;
              if (name && !combined.some(c => c.name === name)) {
                combined.push({ id: p.id || name, name: name, company: p.company || name });
              }
            });
          }
        }
      } catch (e) {}

      // 2. Load from app_system_users (role === 'partner')
      try {
        const savedUsers = localStorage.getItem('app_system_users');
        if (savedUsers) {
          const parsedUsers = JSON.parse(savedUsers);
          if (Array.isArray(parsedUsers)) {
            parsedUsers.filter(u => u.role === 'partner' && u.status !== 'Inactief').forEach(u => {
              if (u.name && !combined.some(c => c.name === u.name || c.name.includes(u.name))) {
                combined.push({ id: u.id, name: u.name, company: u.name });
              }
            });
          }
        }
      } catch (e) {}

      // 3. Defaults fallback
      if (combined.length === 0) {
        combined = [
          { id: '1', name: 'Ruben Verbeij — RV Meubels', company: 'RV Meubels' },
          { id: '2', name: 'Sven Hoek (Hoek Bouw)', company: 'Hoek Bouw' },
          { id: '3', name: 'Lars Jansen (Jansen Houtwerk)', company: 'Jansen Houtwerk' },
          { id: '4', name: 'Theo Mulder (Mulder Tuinen)', company: 'Mulder Tuinen' }
        ];
      }

      setAvailablePartners(combined);
      
      // Auto-set initial selected partner if not set
      if (!partnerForm.partnerName && combined.length > 0) {
        setPartnerForm(prev => ({ ...prev, partnerName: combined[0].name, company: combined[0].company || combined[0].name }));
      }
    };

    loadPartners();
    window.addEventListener('storage', loadPartners);
    window.addEventListener('app_data_changed', loadPartners);
    return () => {
      window.removeEventListener('storage', loadPartners);
      window.removeEventListener('app_data_changed', loadPartners);
    };
  }, []);

  // Check if partner submitted an offer for this lead
  useEffect(() => {
    const checkSubmittedOffer = () => {
      try {
        const submitted = JSON.parse(localStorage.getItem('app_partner_submitted_offers') || '[]');
        if (Array.isArray(submitted) && submitted.length > 0) {
          const custNameLower = (lead?.name || lead?.customerName || '').toLowerCase();
          const match = submitted.find(s => 
            (s.leadId && s.leadId === lead?.id) || 
            (custNameLower && s.customer && s.customer.toLowerCase().includes(custNameLower)) ||
            (s.partnerName && partnerForm.partnerName && (s.partnerName.includes(partnerForm.partnerName) || partnerForm.partnerName.includes(s.partnerName)))
          );
          if (match) {
            setSubmittedPartnerOffer(match);
            const numVal = parseFloat(String(match.price).replace(/[^0-9,/.-]/g, '').replace(/\./g, '').replace(',', '.'));
            if (!isNaN(numVal) && numVal > 0) {
              setPartnerCostPrice(String(numVal));
            }
            if (match.leadTimeEN || match.leadTimeNL) {
              setPartnerLeadTime(match.leadTimeEN || match.leadTimeNL);
            }
          }
        }
      } catch (e) {}
    };

    checkSubmittedOffer();
    window.addEventListener('storage', checkSubmittedOffer);
    window.addEventListener('app_data_changed', checkSubmittedOffer);
    return () => {
      window.removeEventListener('storage', checkSubmittedOffer);
      window.removeEventListener('app_data_changed', checkSubmittedOffer);
    };
  }, [lead?.id, partnerForm.partnerName]);


  // Helper to construct STRICT Privacy-Sanitized Partner Payload (NO customerName, phone, email, address, budget)
  const buildSanitizedPartnerPayload = () => {
    return {
      partnerName: partnerForm.partnerName || 'Ruben Verbeij — RV Meubels',
      requestedOn: step2RequestedDate,
      responseExpected: step2ExpectedDate,
      town: lead?.city || (lead?.location ? lead.location.split(',')[0].trim() : 'Amsterdam'),
      category: activeCategoryKey,
      dimensions: step2Size || '8,00 × 4,00 m · h 2,80 m',
      material: step2Material,
      roofBaseWalls: 'flat · existing concrete · part glazed',
      electrics: 'yes',
      lighting: 'yes',
      heating: 'none',
      siteAccess: 'good — rear access 1.20 m',
      notes: step2Notes || 'connect to existing services',
      approvedPhotos: ['3 photos', '1 sketch']
      // EXPLICITLY STRIPPED / DELETED FOR PRIVACY: customerName, customerPhone, customerEmail, customerAddress, customerBudget
    };
  };

  // Step 4 Direct Multi-Item Quotation Generator State
  const PRESET_PRODUCTS = [
    { desc: 'Thermo Fraké Buitenkeuken Cabinet (Maatwerk)', unitPrice: 8500 },
    { desc: 'Massief Teak Hout Buitenkeuken Frame', unitPrice: 9200 },
    { desc: 'Gepolijst Beton Cire Aanrechtblad (Zwart)', unitPrice: 2800 },
    { desc: 'Big Green Egg Large Inbouw Uitsparing Kit', unitPrice: 1200 },
    { desc: 'RVS Buitenkoelkast Dubbeldeurs', unitPrice: 1450 },
    { desc: 'RVS Spoelbak & Zwarte Mengkraan Set', unitPrice: 650 },
    { desc: 'Transport, Plaatsing & Locatie Montage', unitPrice: 850 }
  ];

  const [quoteLineItems, setQuoteLineItems] = useState([
    { id: 1, desc: 'Maatwerk Thermo Fraké Hout Frame (3.5m)', qty: 1, unitPrice: 8500 },
    { id: 2, desc: 'Gepolijst Beton Cire Aanrechtblad (8cm Zwart)', qty: 1, unitPrice: 2800 },
    { id: 3, desc: 'Inbouw Kamado Big Green Egg Cutout & RVS Kraan', qty: 1, unitPrice: 1200 }
  ]);

  const handleGenerateClaudeProposal = (recording) => {
    setIsGeneratingProposal(true);
    setClaudeProposalModalOpen(true);
    
    // Simulate Claude AI generating draft proposal in Vanuit Ambacht brand tone
    setTimeout(() => {
      setGeneratedProposal({
        quoteId: `Q-${Math.floor(4000 + Math.random() * 900)}`,
        customerName: customerName,
        productCategory: lead?.productType || customerCategory,
        date: new Date().toISOString().split('T')[0],
        introText: `Beste ${customerName},\n\nHartelijk dank voor het prettige telefoongesprek via Vanuit Ambacht. Op basis van onze bespreking in de audio-opname hebben wij met genoegen deze maatofferte voor uw ${translateCategory(customerCategory)} opgesteld. Wij garanderen ambachtelijke topkwaliteit en een duurzame afwerking met oog voor elk detail.`,
        items: [
          { desc: `Maatwerk ${translateCategory(customerCategory)} (3.5m Teak Hout Frame)`, price: '€ 8.500' },
          { desc: 'Gepolijst Beton Cire Aanrechtblad (Zwart Polijst 8cm)', price: '€ 2.800' },
          { desc: 'Inbouw Kamado Big Green Egg Large + RVS Kraan & Spoelbak', price: '€ 1.450' },
          { desc: 'Transport, Plaatsing & Locatie Montage op Locatie (Amsterdam)', price: '€ 850' }
        ],
        totalAmount: '€ 13.600',
        brandNote: 'Vanuit Ambacht — Ambachtelijk Meesterschap & Duurzaam Buitenleven'
      });
      setIsGeneratingProposal(false);
      showToast(language === 'EN' ? 'Claude AI Draft Proposal generated successfully!' : 'Claude AI Concept Offerte succesvol gegenereerd!');
    }, 1100);
  };

  const handleExportProposalToQuote = () => {
    if (!generatedProposal) return;
    const newQuote = {
      id: generatedProposal.quoteId,
      customer: generatedProposal.customerName,
      project: generatedProposal.productCategory,
      amount: generatedProposal.totalAmount,
      status: 'Sent',
      date: generatedProposal.date
    };

    const savedQuotes = JSON.parse(localStorage.getItem('app_quotes') || '[]');
    localStorage.setItem('app_quotes', JSON.stringify([newQuote, ...savedQuotes]));

    showToast(language === 'EN' ? `Official Quote ${newQuote.id} created & saved to Quotes!` : `Officiële Offerte ${newQuote.id} aangemaakt & opgeslagen!`);
    setClaudeProposalModalOpen(false);
  };

  // Update currentStep when selected lead changes & scroll main view to top
  useEffect(() => {
    if (lead?.workflowStep) {
      setCurrentStep(lead.workflowStep);
    }
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.scrollTop = 0;
  }, [lead?.id]);

  // Prefilled State Inherited from Lead (Zero Dead Data Entry & Exact Match)
  const customerName = lead?.name || lead?.customerName || 'Sonu Jain';
  const customerEmail = lead?.email || `${(lead?.name || 'sonu.jain').toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`;
  const customerPhone = lead?.phone || '+31 6 12345678';
  const customerCategory = lead?.category || (lead?.company?.toLowerCase().includes('snijplanken') ? 'Snijplanken' : 'Buitenkeukens');
  
  const translateCategory = (cat) => {
    if (language !== 'EN' || !cat) return cat;
    return cat
      .replace(/Buitenkeukens/gi, 'Outdoor Kitchens')
      .replace(/Buitenkeuken/gi, 'Outdoor Kitchen')
      .replace(/Kliko/gi, 'Bin Storage')
      .replace(/Overkappingen/gi, 'Canopies')
      .replace(/Overkapping/gi, 'Canopy')
      .replace(/Snijplanken/gi, 'Cutting Boards');
  };

  const translatedCat = translateCategory(lead?.productType || customerCategory);

  // Derived margin calculations (internal use only)
  const partnerCostNum = parseFloat((partnerCostPrice || '0').replace(/[^0-9.]/g, '')) || 0;
  const grossMarginAmount = Math.round(partnerCostNum * (marginPercent / 100));
  const customerSellPrice = partnerCostNum + grossMarginAmount;

  // Step 4 — Build the Quote State (Two-Way Margin Synchronization & Calculated Totals)
  const effectivePartnerCost = partnerCostNum > 0 ? partnerCostNum : 28500; // Auto carry-forward from Step 3 (or default €28,500)
  const [step4MarginPercent, setStep4MarginPercent] = useState(20);
  const [step4MarginAmount, setStep4MarginAmount] = useState(() => Math.round(28500 * 0.20)); // €5,700
  const [step4VatRate, setStep4VatRate] = useState(21);
  const [quoteSavedAsDraft, setQuoteSavedAsDraft] = useState(false);

  // Two-way synchronization handlers
  const handleMarginPercentChange = (val) => {
    const p = Math.max(0, Math.min(100, parseFloat(val) || 0));
    setStep4MarginPercent(p);
    setStep4MarginAmount(Math.round(effectivePartnerCost * (p / 100)));
  };

  const handleMarginAmountChange = (val) => {
    const amt = Math.max(0, parseFloat(val) || 0);
    setStep4MarginAmount(amt);
    if (effectivePartnerCost > 0) {
      setStep4MarginPercent(Math.round((amt / effectivePartnerCost) * 100 * 100) / 100);
    }
  };

  // Derived calculations (Step 4 — READ-ONLY / CALCULATED TOTALS)
  const step4CustomerPriceExclVat = Math.round(effectivePartnerCost + step4MarginAmount);
  const step4VatAmount = Math.round(step4CustomerPriceExclVat * (step4VatRate / 100));
  const step4TotalInclVat = step4CustomerPriceExclVat + step4VatAmount;

  // Step 5 — Review & Send State (Approval Gate & Confirmed Send Flow)
  const [step5ApprovalStatus, setStep5ApprovalStatus] = useState('DRAFT'); // 'DRAFT' | 'APPROVED'
  const [step5ApprovedBy, setStep5ApprovedBy] = useState('');
  const [step5ApprovedAt, setStep5ApprovedAt] = useState('');
  const [step5ConfirmModalOpen, setStep5ConfirmModalOpen] = useState(false);
  const [step5SelectedChannel, setStep5SelectedChannel] = useState(null); // 'WHATSAPP' | 'EMAIL'
  const [step5SendConfirmed, setStep5SendConfirmed] = useState(false);
  const [step5SendChannelLabel, setStep5SendChannelLabel] = useState(''); // 'E-mail Sent' | 'WhatsApp Sent'
  const [step5PreviewPage, setStep5PreviewPage] = useState(1);
  const [step5EditableMsg, setStep5EditableMsg] = useState(
    `Beste ${customerName},\n\nHierbij ontvangt u onze maatofferte voor uw ${customerCategory}. Bekijk de specificaties en accordeer eenvoudig via onderstaande link:\nhttps://vanuitambacht.nl/offerte/OF-2026331/bekijken\n\nMet vriendelijke groet,\nTeam Vanuit Ambacht`
  );

  // Dynamic PDF Filename matching exact customer slug
  const formattedCustomerSlug = (customerName || 'Sonu-Jain').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-');
  const quoteFileName = `Quote-OF-2026331-${formattedCustomerSlug}.pdf`;

  // UNIFIED QUOTE DATA MODEL (Single Source of Truth for Preview & Real PDF Download)
  const quoteDataModel = {
    quoteId: 'OF-2026331',
    customerName,
    customerEmail,
    customerPhone,
    category: customerCategory,
    priceExclVat: step4CustomerPriceExclVat,
    vatAmount: step4VatAmount,
    totalInclVat: step4TotalInclVat,
    approvalStatus: step5ApprovalStatus,
    approvedBy: step5ApprovedBy,
    approvedAt: step5ApprovedAt,
    size: step2Size || '8,00 × 4,00 m',
    material: step2Material,
    fileName: quoteFileName
  };

  const handleRealPdfDownload = (isDraft = false) => {
    const downloadedFileName = downloadDirectPdfFile({
      quoteId: 'OF-2026331',
      customerName,
      customerEmail,
      category: customerCategory,
      size: step2Size || '8,00 × 4,00 m',
      material: step2Material || 'Douglas wood with concrete countertop',
      priceExclVat: step4CustomerPriceExclVat,
      vatRate: step4VatRate,
      vatAmount: step4VatAmount,
      totalInclVat: step4TotalInclVat,
      isDraft
    });

    showToast(isDraft 
      ? `✓ PDF file downloaded directly to Downloads folder: ${downloadedFileName}`
      : `✓ Official PDF file downloaded directly to Downloads folder: ${downloadedFileName}`
    );
  };

  const handleSaveDraftStep4 = () => {
    const draftData = {
      leadId: lead?.id || 'LEAD-1001',
      customerName,
      partnerCost: effectivePartnerCost,
      marginPercent: step4MarginPercent,
      marginAmount: step4MarginAmount,
      customerPriceExclVat: step4CustomerPriceExclVat,
      vatRate: step4VatRate,
      vatAmount: step4VatAmount,
      totalInclVat: step4TotalInclVat,
      status: 'DRAFT — NOT SENT',
      savedAt: new Date().toISOString()
    };
    safeSetItem(`quote_draft_${lead?.id || 'LEAD-1001'}`, JSON.stringify(draftData));
    setQuoteSavedAsDraft(true);
    showToast(language === 'EN'
      ? `✓ Draft saved locally! Status: DRAFT — NOT SENT.`
      : `✓ Concept lokaal opgeslagen! Status: CONCEPT — NIET VERZONDEN.`
    );
  };

  const handleApproveQuoteStep5 = () => {
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('nl-NL')} ${now.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}`;
    setStep5ApprovalStatus('APPROVED');
    setStep5ApprovedBy('Bram (Admin)');
    setStep5ApprovedAt(formattedDate);
    showToast(language === 'EN' ? '✓ Quote Approved internally! Send channels unlocked.' : '✓ Offerte intern goedgekeurd! Verzendaopties ontgrendeld.');
  };

  const handleExecuteSendStep5 = () => {
    setStep5SendConfirmed(true);
    setStep5ConfirmModalOpen(false);
    const channelLabel = step5SelectedChannel === 'EMAIL' ? 'E-mail Sent' : 'WhatsApp Sent';
    setStep5SendChannelLabel(channelLabel);
    showToast(step5SelectedChannel === 'EMAIL'
      ? (language === 'EN' ? `✓ Quote sent via E-mail to ${customerEmail}! (${quoteFileName} attached)` : `✓ Offerte verzonden via E-mail naar ${customerEmail}! (${quoteFileName} bijgevoegd)`)
      : (language === 'EN' ? `✓ Quote sent via WhatsApp to ${customerPhone}! (Approval link attached)` : `✓ Offerte verzonden via WhatsApp naar ${customerPhone}! (Accoord-link bijgevoegd)`)
    );
  };

  // Step 6 — Customer Approval State (Two Approval Routes & Automatic Project Creation)
  const [step6Approved, setStep6Approved] = useState(false);
  const [step6ApprovalRoute, setStep6ApprovalRoute] = useState(null); // 'ROUTE_A_ONLINE' | 'ROUTE_B_MANUAL'
  const [step6ApprovalMetaData, setStep6ApprovalMetaData] = useState(null);
  const [step6ManualModalOpen, setStep6ManualModalOpen] = useState(false);
  const [step6ManualForm, setStep6ManualForm] = useState({
    date: new Date().toISOString().split('T')[0],
    channel: 'Phone', // 'Phone' | 'WhatsApp' | 'E-mail' | 'In person'
    recordedBy: 'Bram (Admin)',
    notes: 'Approved via telephone conversation by customer',
    evidenceFile: null
  });

  // Automatic consequence helper function: Project created immediately upon approval & appears in Projects tab
  const autoCreateProjectOnApproval = (meta) => {
    const projId = `P-${lead?.id?.replace('LEAD', 'L') || '2001'}`;
    const projTitle = `Luxe ${customerCategory || 'Buitenkeuken'} — ${customerName}`;
    
    const newProject = {
      id: projId,
      name: projTitle,
      projectName: projTitle,
      customer: customerName,
      customerEmail,
      customerPhone,
      quoteId: 'OF-2026331',
      value: `€ ${step4TotalInclVat.toLocaleString('nl-NL')}`,
      numericAmount: step4TotalInclVat,
      category: customerCategory || 'Buitenkeukens',
      dimensions: step2Size || '8,00 × 4,00 m',
      woodType: step2Material || 'Thermo Fraké',
      material: step2Material || 'Thermo Fraké with concrete countertop',
      products: [
        { 
          description: `Maatwerk ${customerCategory || 'Buitenkeuken'} (${step2Size || '8,00 × 4,00 m'})`, 
          quantity: 1, 
          unitPrice: step4CustomerPriceExclVat 
        }
      ],
      partner: 'Ruben Verbeij — RV Meubels',
      partnerCost: effectivePartnerCost,
      margin: step4MarginAmount,
      marginPercent: step4MarginPercent,
      isPartnerConfirmed: false,
      partnerStatus: 'Pending Confirmation',
      progress: 10,
      deadline: '2026-09-27',
      totalAmount: `€ ${step4TotalInclVat.toLocaleString('nl-NL')}`,
      status: 'In uitvoering',
      approvalRoute: meta.route,
      approvedAt: meta.dateTime,
      createdAt: new Date().toISOString()
    };

    const savedProjects = JSON.parse(localStorage.getItem('app_projects') || '[]');
    const filteredProjects = savedProjects.filter(p => p.id !== newProject.id);
    const updatedProjects = [newProject, ...filteredProjects];
    
    localStorage.setItem('app_projects', JSON.stringify(updatedProjects));
    window.dispatchEvent(new Event('app_data_changed'));
  };

  const handleRouteAOnlineApproval = () => {
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('nl-NL')} ${now.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}`;
    const meta = {
      route: 'ROUTE_A_ONLINE',
      customerName,
      dateTime: formattedDate,
      ipAddress: '84.112.45.198 (Amsterdam, NL)',
      quoteVersion: 'Quote #OF-2026331 v1.0',
      statusLabel: '✓ Customer Approved (Online Link)'
    };
    setStep6Approved(true);
    setStep6ApprovalRoute('ROUTE_A_ONLINE');
    setStep6ApprovalMetaData(meta);

    // AUTOMATIC CONSEQUENCE: Project Created Immediately
    autoCreateProjectOnApproval(meta);

    showToast(language === 'EN' ? `✓ Quote approved online by ${customerName}! Project auto-created.` : `✓ Offerte online goedgekeurd door ${customerName}! Project automatisch aangemaakt.`);
  };

  const handleRouteBManualApproval = (e) => {
    if (e) e.preventDefault();
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('nl-NL')} ${now.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}`;
    const meta = {
      route: 'ROUTE_B_MANUAL',
      customerName,
      dateTime: `${step6ManualForm.date} (${formattedDate.split(' ')[1] || '17:26'})`,
      channel: step6ManualForm.channel,
      recordedBy: step6ManualForm.recordedBy || 'Bram (Admin)',
      notes: step6ManualForm.notes,
      evidenceFile: step6ManualForm.evidenceFile ? step6ManualForm.evidenceFile.name : null,
      statusLabel: `✓ Approved — recorded manually by ${step6ManualForm.recordedBy || 'Bram'} (via ${step6ManualForm.channel})`
    };
    setStep6Approved(true);
    setStep6ApprovalRoute('ROUTE_B_MANUAL');
    setStep6ApprovalMetaData(meta);
    setStep6ManualModalOpen(false);

    // AUTOMATIC CONSEQUENCE: Project Created Immediately
    autoCreateProjectOnApproval(meta);

    showToast(language === 'EN' ? `✓ Manual approval recorded (${step6ManualForm.channel})! Project auto-created.` : `✓ Handmatige akkoord geregistreerd (${step6ManualForm.channel})! Project automatisch aangemaakt.`);
  };

  // Step 7 — Create Project State (Final Check & Partner Privacy Unlock)
  const initialStep2Partner = partnerForm?.partnerName || lead?.partner || 'Ruben Verbeij — RV Meubels';
  const [step7SelectedPartner, setStep7SelectedPartner] = useState(initialStep2Partner);
  const [step7PartnerChangeReason, setStep7PartnerChangeReason] = useState('');
  const [step7StartDate, setStep7StartDate] = useState('2026-09-02');
  const [step7CompletionDate, setStep7CompletionDate] = useState('2026-09-27');
  const [step7InternalNote, setStep7InternalNote] = useState('Workshop pre-assembly scheduled. Site installation date agreed.');
  const [step7Confirmed, setStep7Confirmed] = useState(false);

  // Sync Step 2 partner to Step 7 when partnerForm updates
  useEffect(() => {
    if (partnerForm?.partnerName) {
      setStep7SelectedPartner(partnerForm.partnerName);
    }
  }, [partnerForm?.partnerName]);

  const handleConfirmProjectStep7 = () => {
    const originalPartner = partnerForm?.partnerName || lead?.partner || 'Ruben Verbeij — RV Meubels';
    if (step7SelectedPartner !== originalPartner && !step7PartnerChangeReason.trim()) {
      showToast(language === 'EN' 
        ? `Why are you changing the partner? Please specify a mandatory reason before confirming.` 
        : `Waarom verander je van partner? Geef een verplichte reden op voordat u bevestigt.`);
      return;
    }

    // Sync confirmed project to localStorage for Projects Tab
    const projId = `P-${lead?.id?.replace('LEAD', 'L') || '2525'}`;
    const projTitle = `Luxe ${customerCategory || 'Buitenkeuken'} — ${customerName}`;
    const confirmedProject = {
      id: projId,
      name: projTitle,
      projectName: projTitle,
      customer: customerName,
      customerEmail,
      customerPhone,
      category: customerCategory || 'Buitenkeukens',
      partner: step7SelectedPartner,
      partnerReason: step7PartnerChangeReason,
      isPartnerConfirmed: true,
      partnerStatus: 'Final / Locked',
      partnerCost: effectivePartnerCost,
      margin: step4MarginAmount,
      startDate: step7StartDate,
      deadline: step7CompletionDate,
      progress: 25,
      totalAmount: `€ ${step4TotalInclVat.toLocaleString('nl-NL')}`,
      numericAmount: step4TotalInclVat,
      status: 'In execution',
      internalNote: step7InternalNote,
      confirmedAt: new Date().toISOString()
    };

    const savedProjects = JSON.parse(localStorage.getItem('app_projects') || '[]');
    const filteredProjects = savedProjects.filter(p => p.id !== confirmedProject.id && p.customer !== customerName);
    const updatedProjects = [confirmedProject, ...filteredProjects];
    
    localStorage.setItem('app_projects', JSON.stringify(updatedProjects));
    window.dispatchEvent(new Event('app_data_changed'));

    setStep7Confirmed(true);
    showToast(language === 'EN'
      ? `✓ Project confirmed! Released to ${step7SelectedPartner}. Partner now sees customer address & phone.`
      : `✓ Project bevestigd! Vrijgegeven aan ${step7SelectedPartner}. Partner ziet nu adres & telefoonnummer.`
    );
  };

  // Section 2.3: Auto-Loaded Message Templates & Multiple WhatsApp Photo Attachments
  const [selectedTemplate, setSelectedTemplate] = useState('template1');
  const [attachPhotos, setAttachPhotos] = useState(false);
  const [attachedPhotos, setAttachedPhotos] = useState([
    { id: 1, name: '3d_outdoor_kitchen_render.png', url: '/dasbordes images.png' },
    { id: 2, name: 'garden_site_photo.jpg', url: '/outdoor_project_card.png' }
  ]);
  const fileInputRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newPhotos = files.map((file, idx) => ({
        id: Date.now() + idx,
        name: file.name,
        url: URL.createObjectURL(file)
      }));
      setAttachedPhotos(prev => [...prev, ...newPhotos]);
      setAttachPhotos(true);
      showToast(language === 'EN' ? `${files.length} photo(s) attached!` : `${files.length} foto('s) bijgevoegd!`);
    }
  };

  const handleRemovePhoto = (photoId) => {
    const updated = attachedPhotos.filter(p => p.id !== photoId);
    setAttachedPhotos(updated);
    if (updated.length === 0) setAttachPhotos(false);
    showToast(language === 'EN' ? 'Photo removed' : 'Foto verwijderd');
  };

  const getTemplateText = (tmplId) => {
    let savedTemplates = null;
    try {
      const stored = localStorage.getItem('app_auto_templates_v1');
      if (stored) savedTemplates = JSON.parse(stored);
    } catch(e) {}

    let rawText = (savedTemplates && savedTemplates[tmplId]) 
      ? savedTemplates[tmplId] 
      : (tmplId === 'template1'
        ? `Dear {client_name}, thank you for reaching out to Vanuit Ambacht regarding your {product_category} inquiry. We would love to discuss your requirements in detail. When would it suit you to talk? Kind regards, Tim & Bram - Vanuit Ambacht`
        : tmplId === 'template2'
        ? `Dear {client_name}, we wanted to follow up regarding your {product_category} inquiry. Please let us know if you have any questions or when you would be available for a brief phone call. Kind regards, Tim & Bram - Vanuit Ambacht`
        : `Dear {client_name}, following up regarding your {product_category} project with Vanuit Ambacht. We are happy to help you finalize the specifications whenever you are ready. Best regards, Tim & Bram - Vanuit Ambacht`);

    return rawText
      .replace(/\{client_name\}/g, customerName)
      .replace(/\{product_category\}/g, translatedCat)
      .replace(/\{company_name\}/g, 'Vanuit Ambacht');
  };

  const [customMessageText, setCustomMessageText] = useState(() => getTemplateText('template1'));

  useEffect(() => {
    setCustomMessageText(getTemplateText(selectedTemplate));
  }, [selectedTemplate, lead, language]);
  
  // Interactive Auto-Fill Modal Forms
  const [quoteForm, setQuoteForm] = useState({
    customer: customerName,
    email: customerEmail,
    phone: customerPhone,
    product: customerCategory,
    amount: '12500',
    notes: 'Bespoke teak wood frame with polished concrete countertop (3.5m width)'
  });

  const [projectForm, setProjectForm] = useState({
    projectName: `Luxury ${customerCategory} — ${customerName}`,
    customer: customerName,
    partner: 'Sven Hoek (Hoek Bouw)',
    deadline: '2023-12-12',
  });

  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    customer: customerName,
    amount: '12500',
  });

  // Event-driven dynamic activity timeline strictly reflecting past/current events
  const getDynamicTimeline = () => {
    let events = [
      { id: 1, title: 'Lead Ingestion', desc: `Inquiry received for ${customerCategory}`, time: '10:15 AM (Day 1)', user: 'System' },
      { id: 2, title: 'Partner Price Request Sent', desc: 'Sanitized request sent to partner (no contact data)', time: '10:20 AM (Day 1)', user: 'Tim (Admin)' },
      { id: 3, title: 'Partner Price Received', desc: 'Partner cost recorded for internal pricing', time: '11:45 AM (Day 2)', user: 'Ruben Verbeij' },
      { id: 4, title: 'Quote Draft Created', desc: 'Draft quotation created for internal review. Nothing sent to customer.', time: '02:30 PM (Day 3)', user: 'Tim (Admin)' }
    ];

    if (currentStep >= 5) {
      if (step5ApprovalStatus === 'APPROVED') {
        events.push({ id: 5, title: 'Quote Approved Internally', desc: `Approved by ${step5ApprovedBy || 'Bram (Admin)'} on ${step5ApprovedAt || 'Today'}`, time: '04:10 PM', user: step5ApprovedBy || 'Bram (Admin)' });
      }
      if (step5SendConfirmed) {
        events.push({ id: 6, title: `Customer Quote Sent (${step5SelectedChannel === 'EMAIL' ? 'E-mail' : 'WhatsApp'})`, desc: `Formal proposal sent to ${step5SelectedChannel === 'EMAIL' ? customerEmail : customerPhone}`, time: '04:15 PM', user: 'Tim (Admin)' });
      }
    }

    if (currentStep >= 6) {
      events.push({ id: 7, title: 'Quote Approved & Deposit Paid', desc: `Client accepted proposal & paid 50% deposit`, time: '09:00 AM (Day 5)', user: customerName });
    }

    if (currentStep >= 7) {
      events.push({ id: 8, title: 'Project Created', desc: `Work order setup for ${customerCategory}`, time: '10:00 AM (Day 6)', user: 'Tim (Admin)' });
    }

    if (currentStep >= 8) {
      events.push({ id: 9, title: 'Planning & Delivery Completed', desc: 'Final inspection passed & 100% invoice paid', time: '04:00 PM (Day 8)', user: 'Bram (Admin)' });
    }

    return events;
  };

  const visibleTimeline = getDynamicTimeline();

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleNextStep = () => {
    if (currentStep === 2 || currentStep === 3) {
      setAutoModalType('quote');
    } else if (currentStep === 4) {
      autoConvertProjectAndCustomer(projectForm.partner);
      advanceStep();
    } else {
      advanceStep();
    }
  };

  const advanceStep = () => {
    if (currentStep < 8) {
      const next = currentStep + 1;
      setCurrentStep(next);
      if (lead) {
        lead.workflowStep = next;
      }
      if (next >= 5) {
        autoConvertProjectAndCustomer(projectForm.partner);
      }
      if (onUpdateStatus) {
        onUpdateStatus(lead?.id, next);
      }
    }
  };

  const handleSaveAutoQuote = (e) => {
    e.preventDefault();
    const calculatedTotal = quoteLineItems.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
    const newQuote = {
      id: `Q-${Math.floor(4000 + Math.random() * 1000)}`,
      customer: quoteForm.customer || customerName,
      project: quoteForm.product || translatedCat,
      amount: `€ ${calculatedTotal.toLocaleString()}`,
      status: 'Verzonden',
      date: new Date().toISOString().split('T')[0],
      items: quoteLineItems
    };

    const savedQuotes = JSON.parse(localStorage.getItem('app_quotes_v1') || localStorage.getItem('app_quotes') || '[]');
    const updated = [newQuote, ...savedQuotes];
    safeSetItem('app_quotes', updated);
    window.dispatchEvent(new Event('app_data_changed'));

    showToast(language === 'EN' 
      ? `Quotation ${newQuote.id} sent to ${newQuote.customer} via Email & delivered to Customer Portal!` 
      : `Offerte ${newQuote.id} verzonden per E-mail & direct geleverd in Klantenportaal!`);
    setAutoModalType(null);
    setQuoteViewModalOpen(true);
    advanceStep();
  };

  const autoConvertProjectAndCustomer = (assignedPartner) => {
    const projName = projectForm.projectName || `Bespoke ${translatedCat}`;
    const custName = projectForm.customer || customerName;
    const partnerName = assignedPartner || projectForm.partner || 'Sven Hoek (Hoek Bouw)';

    const newProject = {
      id: `P-${Math.floor(2000 + Math.random() * 1000)}`,
      name: projName,
      customer: custName,
      partner: partnerName,
      progress: 25,
      deadline: projectForm.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'In Progress'
    };

    const savedProjects = JSON.parse(localStorage.getItem('app_projects') || '[]');
    const exists = savedProjects.some(p => p.customer === custName && p.name === projName);
    if (!exists) {
      localStorage.setItem('app_projects', JSON.stringify([newProject, ...savedProjects]));
    }

    // Auto-Convert to Customers Directory
    const newCustomer = {
      id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      name: custName,
      email: customerEmail,
      phone: lead?.phone || '+31 6 12345678',
      location: lead?.location || 'Amsterdam, NL',
      category: translatedCat,
      totalSpent: '€ 12,500',
      status: 'Active Client',
      dateAdded: new Date().toISOString().split('T')[0]
    };
    const savedCustomers = JSON.parse(localStorage.getItem('app_customers') || '[]');
    const custExists = savedCustomers.some(c => c.name === custName);
    if (!custExists) {
      localStorage.setItem('app_customers', JSON.stringify([newCustomer, ...savedCustomers]));
    }

    // Trigger global event for real-time synchronization
    window.dispatchEvent(new Event('app_data_changed'));
    return newProject;
  };

  const handleSaveAutoProject = (e) => {
    e.preventDefault();
    const newProject = autoConvertProjectAndCustomer(projectForm.partner);
    showToast(`🚀 Project ${newProject.id} & Client ${newProject.customer} auto-converted to Live Projects & Customers!`);
    setAutoModalType(null);
    advanceStep();
  };

  const handleSaveAutoPartner = (e) => {
    e.preventDefault();
    const newProject = autoConvertProjectAndCustomer(partnerForm.partnerName);
    showToast(`🚀 Partner ${partnerForm.partnerName} assigned! Project ${newProject.id} auto-converted to Live Projects!`);
    setAutoModalType(null);
    advanceStep();
  };

  const handleSaveAutoInvoice = (e) => {
    e.preventDefault();
    const newInvoice = {
      id: invoiceForm.invoiceNumber,
      customer: invoiceForm.customer,
      amount: `€ ${parseInt(invoiceForm.amount).toLocaleString()}`,
      status: 'Openstaand',
      date: new Date().toISOString().split('T')[0]
    };

    const savedInvoices = JSON.parse(localStorage.getItem('app_invoices') || '[]');
    const updatedInvoices = [newInvoice, ...savedInvoices];
    localStorage.setItem('app_invoices', JSON.stringify(updatedInvoices));

    // Auto-convert Lead to Customer on Invoice Creation
    convertLeadToCustomerOnInvoiceSent(newInvoice, lead);

    showToast(language === 'EN'
      ? `Invoice ${newInvoice.id} sent! Lead ${lead?.name || newInvoice.customer} converted to Customer!`
      : `Factuur ${newInvoice.id} verzonden! Lead ${lead?.name || newInvoice.customer} omgezet naar Klant!`);
    setAutoModalType(null);
    advanceStep();
  };

  const getStepStatus = (stepId) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'upcoming';
  };

  const getBadgeVariant = (stepId) => {
    switch (stepId) {
      case 1: return { variant: 'info', label: tStatus('New') };
      case 2: return { variant: 'warning', label: tStatus('In Conversation') };
      case 3: return { variant: 'success', label: language === 'EN' ? '✓ Partner Price Received' : '✓ Partnerprijs Ontvangen' };
      case 4: return { variant: 'warning', label: language === 'EN' ? 'Draft — Not Sent' : 'Concept — Niet Verzonden' };
      case 5: return { variant: 'info', label: language === 'EN' ? 'Review & Send' : 'Controleren & Verzenden' };
      case 6: return { variant: 'success', label: language === 'EN' ? 'Customer Approved' : 'Klant Akkoord' };
      case 7: return { variant: 'purple', label: language === 'EN' ? 'Project Created' : 'Project Aangemaakt' };
      case 8: return { variant: 'success', label: language === 'EN' ? 'Completed' : 'Afgerond' };
      default: return { variant: 'default', label: 'Active' };
    }
  };

  const currentBadge = getBadgeVariant(currentStep);

  return (
    <div className="space-y-6 text-[#4A4A43] font-body relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            className="fixed top-20 right-4 z-[9999] flex items-center gap-2 bg-primary text-cream px-4 py-3 rounded-xl shadow-lg text-xs font-bold"
          >
            <CheckCircle className="w-4 h-4 text-green-400" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clean Sticky Header with Interactive Stepper Progress Bar */}
      <div className="sticky -top-3 sm:-top-4 lg:-top-6 z-40 bg-[#EDE8DF] shadow-md -mt-3 sm:-mt-4 lg:-mt-6 pt-3 sm:pt-4 lg:pt-6 pb-3 border-b border-[#D6CFC2] -mx-3 px-3 sm:-mx-4 sm:px-4 lg:-mx-6 lg:px-6">

        {/* Row 1: Name + meta + Close */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            {/* Meta badges & Back button */}
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-xs font-bold text-primary hover:bg-white/80 flex items-center gap-1 bg-white/50 px-2.5 py-1 rounded-lg border border-[#D6CFC2] transition-colors cursor-pointer shadow-2xs"
                  title="Return to full Leads overview table"
                >
                  ← {language === 'EN' ? 'Back to Leads Overview' : 'Terug naar Leads Overzicht'}
                </button>
              )}
              <span className="text-[10px] font-bold text-accent tracking-wider uppercase font-body">Workflow</span>
              <Badge variant="info">{language === 'EN' ? `Step ${currentStep}/${WORKFLOW_STEPS.length}` : `Stap ${currentStep}/${WORKFLOW_STEPS.length}`}</Badge>
              <span className="text-[10px] font-bold text-primary font-body bg-primary/10 px-1.5 py-0.5 rounded-md capitalize">
                {translateCategory(lead?.productType || customerCategory)}
              </span>
            </div>
            {/* Customer name & Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-lg font-heading font-bold text-primary leading-tight truncate">
                {customerName}
              </h2>

              <div className="flex items-center gap-2 flex-wrap">
                <Button 
                  size="sm" 
                  variant="primary" 
                  icon={Send} 
                  onClick={() => {
                    const el = document.getElementById('auto-message-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                    showToast(language === 'EN' ? 'Initial inquiry response ready to send below' : 'Eerste reactie sjabloon gereed hieronder');
                  }}
                  className="text-xs py-1 px-2.5 shadow-xs"
                >
                  {language === 'EN' ? 'Send Message' : 'Bericht Versturen'}
                </Button>
                {!isLeadCompleted && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    icon={MessageSquare} 
                    onClick={() => setCommercialModalOpen(true)}
                    className="text-xs py-1 px-2.5 border-primary/40 text-primary hover:bg-primary/10 shadow-xs font-bold"
                  >
                    {language === 'EN' ? '+ Add Commercial Action' : '+ Commerciële Actie Toevoegen'}
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="outline" 
                  icon={Mic} 
                  onClick={() => setPlaudModalOpen(true)}
                  className="text-xs py-1 px-2.5 border-purple-500/40 text-purple-900 bg-purple-100/70 hover:bg-purple-200 shadow-xs font-bold"
                  title="Import Plaud AI Voice Recorder call notes & transcripts"
                >
                  🎙️ {language === 'EN' ? 'Plaud AI Import' : 'Plaud AI Import'}
                </Button>
              </div>
            </div>
          </div>
          {/* Close button — always top-right */}
          {onClose && (
            <button
              onClick={onClose}
              className="flex-shrink-0 mt-0.5 text-dark/40 hover:text-dark hover:bg-[#D6CFC2]/40 rounded-lg p-1.5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Row 2: Horizontal Connected Stepper Line Bar (Exact Match with User's Latest Screenshot) */}
        <div className="overflow-x-auto pt-3 pb-2" style={{ scrollbarWidth: 'none' }}>
          <div className="flex items-center min-w-[720px] justify-between relative px-4">
            {/* Background Track Line */}
            <div className="absolute top-4 left-8 right-8 h-0.5 bg-[#D6CFC2] z-0" />
            
            {/* Active Progress Line */}
            <div
              className="absolute top-4 left-8 h-0.5 bg-[#3E4E36] transition-all duration-300 z-0"
              style={{ width: `${((currentStep - 1) / (WORKFLOW_STEPS.length - 1)) * 95}%` }}
            />

            {WORKFLOW_STEPS.map((step) => {
              const status = getStepStatus(step.id);
              const StepIcon = step.icon;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    setCurrentStep(step.id);
                    if (lead) lead.workflowStep = step.id;
                    if (onUpdateStatus) onUpdateStatus(lead?.id, step.id);
                  }}
                  title={`Step ${step.id}: ${step.name}`}
                  className="flex flex-col items-center group relative z-10 focus:outline-none cursor-pointer"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    status === 'completed'
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-sm'
                      : status === 'current'
                      ? 'bg-[#3E4E36] text-white ring-4 ring-blue-300/80 shadow-md scale-105'
                      : 'bg-[#F4F1EA] text-dark/40 border border-[#D6CFC2] hover:border-primary/50'
                  }`}>
                    {status === 'completed' ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <StepIcon className="w-4 h-4" />
                    )}
                  </div>
                  
                  <span className={`text-[10px] font-semibold mt-1.5 max-w-[95px] sm:max-w-[105px] text-center line-clamp-2 leading-tight ${
                    status === 'current'
                      ? 'text-[#3E4E36] font-bold'
                      : status === 'completed'
                      ? 'text-emerald-700 font-semibold'
                      : 'text-dark/40'
                  }`}>
                    {step.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Layout: Dynamic Stage Content Card (2/3) + Real-Time Activity Timeline (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Dynamic Step-Specific Content Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-l-4 border-l-primary shadow-card">
            
            {/* Stage Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#D6CFC2]/60">
              <div>
                <span className="text-[11px] font-bold text-dark/50 uppercase tracking-widest font-body">
                  {language === 'NL' ? 'Huidige Fase Details' : 'Current Stage Details'}
                </span>
                <h3 className="text-xl font-heading font-bold text-primary flex items-center gap-2">
                  <span>Step {currentStep}: {WORKFLOW_STEPS[currentStep - 1].name}</span>
                </h3>
              </div>
              {currentStep === 8 ? (
                <span className="bg-[#DCFCE7] text-[#15803D] font-bold text-xs px-3 py-1 rounded-full border border-emerald-200/60 shadow-2xs">
                  Completed
                </span>
              ) : currentStep === 7 ? (
                <span className="bg-[#FEF9C3] text-[#713F12] font-semibold text-xs px-3 py-1 rounded-full border border-amber-200/60 shadow-2xs">
                  In Progress
                </span>
              ) : currentStep === 4 ? (
                <span className="bg-[#FEF3C7] text-[#92400E] font-semibold text-xs px-3 py-1 rounded-full border border-amber-200/60 shadow-2xs">
                  Draft — Not Sent
                </span>
              ) : currentStep === 3 ? (
                <span className="bg-[#DCFCE7] text-[#15803D] font-bold text-xs px-3 py-1 rounded-full border border-emerald-200/60 shadow-2xs">
                  ✓ Partner Price Received
                </span>
              ) : currentStep === 2 ? (
                <span className="bg-[#FEF3C7] text-[#92400E] font-semibold text-xs px-3 py-1 rounded-full border border-amber-200/60 shadow-2xs">
                  In Conversation
                </span>
              ) : (
                <span className="text-xs text-dark/60 font-body font-medium">
                  {currentStep === 5 ? 'Active' : (currentStep === 6 ? 'In Progress' : currentBadge.label)}
                </span>
              )}
            </div>

            {/* Stage Specific Dynamic Content Controlled by Selected Step */}
            <div className="py-5 space-y-5 text-xs text-dark/80">
              
              {/* STEP 1: NEW LEAD */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#EDE8DF]/50 rounded-xl border border-[#D6CFC2]/60">
                    <div className="flex items-center gap-2.5">
                      <UserPlus className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-[10px] text-dark/50 font-bold uppercase">Customer Name</p>
                        <p className="font-semibold text-dark">{customerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-[10px] text-dark/50 font-bold uppercase">Phone Number</p>
                        <p className="font-semibold text-dark">{customerPhone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-[10px] text-dark/50 font-bold uppercase">Email Address</p>
                        <p className="font-semibold text-dark">{customerEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-[10px] text-dark/50 font-bold uppercase">Location & Product</p>
                        <p className="font-semibold text-dark">{lead?.location || lead?.city || 'Amsterdam, NL'} ({translateCategory(customerCategory)})</p>
                      </div>
                    </div>
                  </div>

                  {/* DYNAMIC CATEGORY SPECIFICATIONS CARD (Synced live with Settings -> Veldinstellingen) */}
                  <div className="p-4 bg-white rounded-xl border border-[#D6CFC2] space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-[#D6CFC2]/60 pb-2">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-primary" />
                        <span className="font-bold text-xs text-primary font-heading uppercase tracking-wider">
                          {language === 'EN' 
                            ? `Category Dynamic Specs: ${translateCategory(customerCategory)}` 
                            : `Categorie Specificaties: ${customerCategory}`}
                        </span>
                      </div>
                      <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded font-mono font-bold">
                        Settings Configured ⚙️
                      </span>
                    </div>

                    {dynamicFieldSets[activeCategoryKey] && dynamicFieldSets[activeCategoryKey].length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {dynamicFieldSets[activeCategoryKey].map((field) => (
                          <div key={field.id} className="space-y-1">
                            <label className="block text-[10px] font-bold text-dark/60 uppercase">
                              {field.label} {field.required && <span className="text-red-500">*</span>}
                            </label>
                            {field.type === 'select' ? (
                              <select
                                value={specFormValues[field.id] || field.options[0]}
                                onChange={(e) => setSpecFormValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                                className="w-full px-2.5 py-1.5 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs font-semibold focus:ring-1 focus:ring-primary/20 outline-none"
                              >
                                {field.options.map((opt, i) => (
                                  <option key={i} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={specFormValues[field.id] || ''}
                                onChange={(e) => setSpecFormValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                                placeholder={`Vul ${field.label} in...`}
                                className="w-full px-2.5 py-1.5 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs font-semibold focus:ring-1 focus:ring-primary/20 outline-none"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-dark/50 text-xs italic">
                        {language === 'EN' ? 'No custom fields configured for this category in Settings.' : 'Geen specifieke velden geconfigureerd in Settings.'}
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-dark mb-1">Initial Intake Notes</h4>
                    <p className="p-3 bg-white/60 rounded-lg border border-[#D6CFC2]/40 text-dark/70 italic">
                      {lead?.notes || lead?.intakeNotes || (language === 'EN' ? 'No initial notes provided during lead intake.' : 'Geen intake opmerkingen ingevoerd.')}
                    </p>
                  </div>

                  {/* SUBMITTED QUOTATION VISIBILITY CARD — Only show if a quote has actually been generated */}
                  {(lead?.quoteAmount || lead?.quoteId || currentStep >= 4) ? (
                    <div className="p-4 bg-white rounded-xl border border-[#D6CFC2] space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-[#D6CFC2]/50 pb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <span className="font-bold text-xs text-primary font-heading uppercase tracking-wider">
                            {language === 'EN' ? 'Submitted Quotation / Proposal' : 'Gekoppelde Offerte'}
                          </span>
                          <span className="font-mono text-xs font-bold bg-[#EDE8DF] text-primary px-2 py-0.5 rounded-md">
                            {lead?.quoteId || '#Q-NEW'}
                          </span>
                        </div>
                        <Badge variant="success">
                          {language === 'EN' ? 'Quote Generated' : 'Offerte verstuurd'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] text-dark/50 uppercase font-bold block">Product & Specs</span>
                          <span className="font-semibold text-dark truncate block">{translateCategory(customerCategory)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-dark/50 uppercase font-bold block">Total Amount</span>
                          <span className="font-bold text-primary text-sm">{lead?.quoteAmount || '€ 12,500'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-dark/50 uppercase font-bold block">Issue Date</span>
                          <span className="font-mono text-dark/70">{new Date().toISOString().split('T')[0]}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#D6CFC2]/40 flex justify-end">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setQuoteViewModalOpen(true)}
                          className="text-xs py-1.5 px-3 border-primary/40 text-primary hover:bg-primary/10 font-bold flex items-center gap-1.5 shadow-2xs"
                        >
                          👁️ {language === 'EN' ? 'View Official 6-Page PDF Quotation' : 'Bekijk Officiële 6-Page Offerte'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-[#EDE8DF]/40 rounded-xl border border-[#D6CFC2]/60 text-xs text-dark/60 flex items-center gap-2 font-mono">
                      <FileText className="w-4 h-4 text-dark/40" />
                      <span>{language === 'EN' ? 'No quote generated yet. Complete partner pricing before creating the quote.' : 'Nog geen offerte aangemaakt. Voltooi eerst de partner prijsaanvraag.'}</span>
                    </div>
                  )}

                  {/* Card 2: Auto-Message Templates & Contact Actions (Middle) */}
                  <div id="auto-message-section" className="p-5 bg-[#F8F7F4] rounded-2xl border border-[#D6CFC2]/70 space-y-3 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-primary font-heading uppercase tracking-wider">
                          Auto-Message Templates & Contact Actions
                        </span>
                      </div>
                      <select
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-[#D6CFC2] rounded-lg text-xs font-body text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium shadow-2xs"
                      >
                        <option value="template1">Template 1: Initial Inquiry Response</option>
                        <option value="template2">Template 2: 1st Follow-up Message</option>
                        <option value="template3">Template 3: 2nd Follow-up Message</option>
                      </select>
                    </div>

                    <div>
                      <textarea
                        value={customMessageText}
                        onChange={(e) => setCustomMessageText(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#D6CFC2] rounded-xl text-xs font-body text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[72px] resize-none leading-relaxed"
                        placeholder="Message content..."
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <label className="flex items-center gap-2 text-[11px] text-dark/70 cursor-pointer select-none font-semibold">
                        <input
                          type="checkbox"
                          checked={attachPhotos}
                          onChange={(e) => setAttachPhotos(e.target.checked)}
                          className="rounded border-[#D6CFC2] text-primary focus:ring-primary/20"
                        />
                        <Paperclip className="w-3.5 h-3.5 text-primary" />
                        <span>{language === 'EN' ? 'Attach project photo / 3D render (WhatsApp)' : 'Projectfoto / 3D-render bijvoegen (WhatsApp)'}</span>
                      </label>

                      <div className="flex gap-2 flex-wrap">
                        <a
                          href={`https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(customMessageText)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-2xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                        </a>
                        <a
                          href={`tel:${customerPhone}`}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2196F3] hover:bg-[#1e87db] text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-2xs"
                        >
                          <Phone className="w-3.5 h-3.5" /> Call
                        </a>
                        <a
                          href={`mailto:${customerEmail}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#3E4E36] hover:bg-[#2e3a28] text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-2xs"
                        >
                          <Mail className="w-3.5 h-3.5" /> E-mail
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Recommended Next Action Banner (Bottom) */}
                  <div className="p-4 bg-[#EDE8DF] border border-[#D6CFC2] rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-wider block">RECOMMENDED NEXT ACTION</span>
                      <span className="text-xs font-bold text-primary">Request partner pricing & send specifications</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => advanceStep()}
                      className="px-5 py-2.5 bg-[#3E4E36] hover:bg-[#2F3C29] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-2 whitespace-nowrap"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>Request Partner Pricing →</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: PRIJSAANVRAAG VERSTUREN OF DIRECTE OFFERTE */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  {/* DUAL PATH ROUTING SWITCHER BANNER */}
                  <div className="p-3 bg-white rounded-xl border border-[#D6CFC2] shadow-xs space-y-2">
                    <span className="text-[10px] font-bold uppercase text-dark/50 tracking-wider block">
                      {language === 'EN' ? 'Choose Project Workflow Routing:' : 'Kies Project Workflow Route:'}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setWorkflowPath('partner')}
                        className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                          workflowPath === 'partner'
                            ? 'bg-primary/10 border-primary text-primary font-bold shadow-2xs ring-1 ring-primary/30'
                            : 'bg-[#EDE8DF]/40 border-[#D6CFC2] text-dark/70 hover:bg-[#EDE8DF]'
                        }`}
                      >
                        <Wrench className={`w-4 h-4 ${workflowPath === 'partner' ? 'text-primary' : 'text-dark/40'}`} />
                        <div>
                          <div className="text-xs font-bold font-heading">
                            {language === 'EN' ? '1. Partner Price Request Flow' : '1. Partner Prijsaanvraag Route'}
                          </div>
                          <div className="text-[10px] text-dark/60 font-normal">
                            {language === 'EN' ? 'For custom craftsman projects requiring partner build price' : 'Voor maatwerk met partner bouwprijs aanvraag'}
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setWorkflowPath('direct')}
                        className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                          workflowPath === 'direct'
                            ? 'bg-amber-100/70 border-amber-500 text-amber-900 font-bold shadow-2xs ring-1 ring-amber-400'
                            : 'bg-[#EDE8DF]/40 border-[#D6CFC2] text-dark/70 hover:bg-[#EDE8DF]'
                        }`}
                      >
                        <Sparkles className={`w-4 h-4 ${workflowPath === 'direct' ? 'text-amber-600' : 'text-dark/40'}`} />
                        <div>
                          <div className="text-xs font-bold font-heading flex items-center gap-1">
                            <span>{language === 'EN' ? '2. Direct Customer Quote Bypass' : '2. Directe Klantofferte (Geen Partner)'}</span>
                            <span className="text-[9px] bg-amber-600 text-white font-mono px-1.5 py-0.2 rounded-full font-bold">Fast</span>
                          </div>
                          <div className="text-[10px] text-dark/60 font-normal">
                            {language === 'EN' ? 'Bypass partner phase & generate customer quote immediately' : 'Sla partner over & maak direct de klantofferte aan'}
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* PATH A: PARTNER PRICE REQUEST FORM (Briefing V1.0 Match) */}
                  {workflowPath === 'partner' ? (
                    <div className="p-5 bg-[#F8F7F4] rounded-2xl border border-[#D6CFC2]/70 space-y-4 shadow-2xs font-body">
                      
                      {/* Section Title & 7-Step Partner Wizard Launch Button */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D6CFC2]/60 pb-3">
                        <h4 className="font-bold text-dark flex items-center gap-2 text-sm sm:text-base font-heading">
                          <Send className="w-4 h-4 text-primary" />
                          <span>{language === 'EN' ? 'Send Price Request to Partner' : 'Prijsaanvraag Versturen naar Partner'}</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenPartnerWizard) {
                              onOpenPartnerWizard(lead);
                            } else {
                              showToast(language === 'EN' ? 'Opening 7-Step Partner Price Request Wizard...' : '7-Staps Prijsaanvraag Partner Wizard geopend...');
                            }
                          }}
                          className="px-3.5 py-2 bg-[#3E4E36] hover:bg-[#2F3C29] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                        >
                          <span>🚀 {language === 'EN' ? 'Open 7-Step Partner Price Request Wizard' : 'Open 7-Staps Prijsaanvraag Partner Wizard'}</span>
                        </button>
                      </div>

                      {/* Top Row: Partner Selector & Dates */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-4 border-b border-[#D6CFC2]/60">
                        <div>
                          <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">PARTNER</label>
                          <select 
                            value={partnerForm.partnerName} 
                            onChange={(e) => {
                              const selectedVal = e.target.value;
                              const partnerObj = availablePartners.find(p => p.name === selectedVal || p.id === selectedVal);
                              setPartnerForm(prev => ({ 
                                ...prev, 
                                partnerName: selectedVal,
                                company: partnerObj?.company || selectedVal
                              }));
                            }}
                            className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs"
                          >
                            {availablePartners.map((p) => (
                              <option key={p.id || p.name} value={p.name}>
                                {p.name} ▾
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">Requested on</label>
                          <input
                            type="date"
                            value={step2RequestedDate}
                            onChange={(e) => setStep2RequestedDate(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">Response expected</label>
                          <input
                            type="date"
                            value={step2ExpectedDate}
                            onChange={(e) => setStep2ExpectedDate(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>

                      {/* Section Header */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-bold font-heading text-primary uppercase tracking-wider">
                          DECISIVE AUTOMATIC SPECIFICATIONS (SENT TO THE PARTNER)
                        </span>
                        <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">
                          Partner Quote Input
                        </span>
                      </div>

                      {/* 2-Column Specifications Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">Category</label>
                          <select 
                            value={activeCategoryKey}
                            onChange={() => {}}
                            className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl font-semibold text-dark cursor-pointer focus:ring-2 focus:ring-primary/20"
                          >
                            <option value="buitenkeuken">Outdoor kitchen ▾</option>
                            <option value="buitenverblijf">Garden room ▾</option>
                            <option value="poolhouse">Poolhouse ▾</option>
                            <option value="overkapping">Canopy ▾</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">Dimensions</label>
                          <input 
                            type="text" 
                            value={step2Size || '8,00 × 4,00 m · h 2,80 m'} 
                            onChange={(e) => setStep2Size(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl font-semibold text-dark focus:ring-2 focus:ring-primary/20" 
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">Timber / Material</label>
                          <select 
                            value={step2Material}
                            onChange={(e) => setStep2Material(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl font-semibold text-dark cursor-pointer focus:ring-2 focus:ring-primary/20"
                          >
                            <option value="Douglas">Douglas ▾</option>
                            <option value="Thermo Fraké Hout">Thermo Fraké Hout ▾</option>
                            <option value="Massief Teakhout">Massief Teakhout ▾</option>
                            <option value="Eikenhout">Eikenhout ▾</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">Roof · Base · Walls</label>
                          <input 
                            type="text" 
                            defaultValue="flat · existing concrete · part glazed"
                            className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl font-semibold text-dark focus:ring-2 focus:ring-primary/20" 
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">Electrics, Lighting, Heating</label>
                          <input 
                            type="text" 
                            defaultValue="yes · yes · none"
                            className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl font-semibold text-dark focus:ring-2 focus:ring-primary/20" 
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">Site Access</label>
                          <input 
                            type="text" 
                            defaultValue="good — rear access 1.20 m"
                            className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl font-semibold text-dark focus:ring-2 focus:ring-primary/20" 
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">Notes</label>
                        <textarea
                          value={step2Notes || 'connect to existing services'}
                          onChange={(e) => setStep2Notes(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs text-dark focus:ring-2 focus:ring-primary/20 min-h-[60px] resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">Attachments</label>
                        <div className="p-3 bg-white rounded-xl border border-[#D6CFC2] flex items-center justify-between text-xs">
                          <span className="font-semibold text-dark">3 photos · 1 sketch</span>
                          {isPriceRequestSent ? (
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              ✓ Sent to Partner
                            </span>
                          ) : (
                            <span className="text-[10px] text-dark/70 font-bold bg-[#EDE8DF] px-2 py-0.5 rounded border border-[#D6CFC2]">
                              Not yet sent
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 🔴 STRICT PRIVACY NOTICE BOX (DO NOT SEND TO PARTNER) */}
                      <div className="p-4 bg-[#FDF2F2] border border-[#F87171]/40 rounded-2xl space-y-3 text-xs">
                        <div className="flex items-center justify-between border-b border-[#F87171]/20 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="bg-red-700 text-white font-bold text-[10px] px-2.5 py-0.5 rounded uppercase tracking-wider">
                              DO NOT SEND
                            </span>
                            <span className="font-bold text-red-950 text-xs">Customer Contact & Budget Security</span>
                          </div>
                          <span className="text-[10px] font-mono bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded uppercase">
                            INTERNAL — INTERNAL
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-2.5 bg-white rounded-xl border border-red-200/80">
                            <span className="text-[10px] text-red-700/80 font-bold uppercase block mb-0.5">Customer Address, Phone & Email</span>
                            <span className="font-bold text-red-900 text-xs italic">hidden until project confirmed</span>
                          </div>
                          <div className="p-2.5 bg-white rounded-xl border border-red-200/80">
                            <span className="text-[10px] text-red-700/80 font-bold uppercase block mb-0.5">Customer Budget</span>
                            <span className="font-bold text-red-900 text-xs italic">hidden until project confirmed</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-red-900/80 italic font-body leading-relaxed pt-0.5">
                          "The partner sees the town, the specifications and the photos — no address, no phone number, no email, no customer budget. Those fields only unlock once the project is confirmed in step 7."
                        </p>
                      </div>

                      {/* Form Action Buttons */}
                      <div className="flex justify-start items-center gap-3 pt-2 border-t border-[#D6CFC2]/60">
                        <button
                          type="button"
                          onClick={() => showToast(language === 'EN' ? 'Draft saved successfully!' : 'Concept succesvol opgeslagen!')}
                          className="px-4 py-2 bg-white/80 hover:bg-white text-dark border border-[#D6CFC2] font-bold text-xs rounded-xl shadow-2xs cursor-pointer"
                        >
                          Save as draft
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* PATH B: DIRECT CUSTOMER QUOTE BYPASS CARD */
                    <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50/40 rounded-xl border border-amber-200 space-y-4 text-xs">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-5 h-5 text-amber-700" />
                        </div>
                        <div>
                          <h4 className="font-heading font-bold text-amber-950 text-sm">
                            {language === 'EN' ? 'Direct Customer Quote Mode Active' : 'Directe Klantofferte Modus Actief'}
                          </h4>
                          <p className="text-amber-900/80 text-xs mt-0.5 font-body">
                            {language === 'EN'
                              ? 'This project does not require a partner price request. You can create the official 6-page PDF quotation directly using pre-saved catalog items or custom line pricing.'
                              : 'Voor dit project is geen partner aanvraag nodig. Maak direct de officiële 6-pagina PDF offerte aan via de catalogus calculator.'}
                          </p>
                        </div>
                      </div>

                      <div className="p-3.5 bg-white/80 rounded-lg border border-amber-200/80 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-dark">{language === 'EN' ? 'Client Name:' : 'Klantnaam:'}</span>
                          <span className="font-semibold text-primary">{customerName}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-dark">{language === 'EN' ? 'Product Category:' : 'Product Categorie:'}</span>
                          <span className="font-mono text-dark/80 capitalize">{translatedCat} ({step2Size || 'Standaard Maat'})</span>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <Button
                          type="button"
                          variant="primary"
                          onClick={() => {
                            setCurrentStep(4);
                            setAutoModalType('quote');
                            showToast(language === 'EN' ? 'Partner bypassed! Opening Direct Quote Generator...' : 'Partner overgeslagen! Directe Offerte Generator geopend...');
                          }}
                          className="py-2.5 px-5 bg-amber-600 hover:bg-amber-700 text-white font-bold font-body text-xs shadow-md flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          <span>{language === 'EN' ? '⚡ Generate Direct Customer Quote (Step 4)' : '⚡ Direct Klantofferte Genereren (Stap 4)'}</span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Card 2: Auto-Message Templates & Contact Actions (Middle) */}
                  <div id="auto-message-section" className="p-5 bg-[#F8F7F4] rounded-2xl border border-[#D6CFC2]/70 space-y-3 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-primary font-heading uppercase tracking-wider">
                          Auto-Message Templates & Contact Actions
                        </span>
                      </div>
                      <select
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-[#D6CFC2] rounded-lg text-xs font-body text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium shadow-2xs"
                      >
                        <option value="template1">Template 1: Initial Inquiry Response</option>
                        <option value="template2">Template 2: 1st Follow-up Message</option>
                        <option value="template3">Template 3: 2nd Follow-up Message</option>
                      </select>
                    </div>

                    <div>
                      <textarea
                        value={customMessageText}
                        onChange={(e) => setCustomMessageText(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#D6CFC2] rounded-xl text-xs font-body text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[72px] resize-none leading-relaxed"
                        placeholder="Message content..."
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <label className="flex items-center gap-2 text-[11px] text-dark/70 cursor-pointer select-none font-semibold">
                        <input
                          type="checkbox"
                          checked={attachPhotos}
                          onChange={(e) => setAttachPhotos(e.target.checked)}
                          className="rounded border-[#D6CFC2] text-primary focus:ring-primary/20"
                        />
                        <Paperclip className="w-3.5 h-3.5 text-primary" />
                        <span>{language === 'EN' ? 'Attach project photo / 3D render (WhatsApp)' : 'Projectfoto / 3D-render bijvoegen (WhatsApp)'}</span>
                      </label>

                      <div className="flex gap-2 flex-wrap">
                        <a
                          href={`https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(customMessageText)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-2xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                        </a>
                        <a
                          href={`tel:${customerPhone}`}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2196F3] hover:bg-[#1e87db] text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-2xs"
                        >
                          <Phone className="w-3.5 h-3.5" /> Call
                        </a>
                        <a
                          href={`mailto:${customerEmail}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#3E4E36] hover:bg-[#2e3a28] text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-2xs"
                        >
                          <Mail className="w-3.5 h-3.5" /> E-mail
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Recommended Next Action Banner (Bottom) */}
                  <div className="p-4 bg-[#EDE8DF] border border-[#D6CFC2] rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-wider block">RECOMMENDED NEXT ACTION</span>
                      <span className="text-xs font-bold text-primary">Send price request to selected partner</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const sanitizedPayload = buildSanitizedPartnerPayload();
                        const newReq = {
                          id: `PR-2026-${Math.floor(100 + Math.random() * 900)}`,
                          leadId: lead?.id || 'LEAD-101',
                          projectNL: `${lead?.productType || customerCategory || 'Maatwerk Project'} - ${step2Material}`,
                          projectEN: `${lead?.productType || customerCategory || 'Custom Project'} - ${step2Material}`,
                          customer: `${customerName} (${lead?.city || (lead?.location ? lead.location.split(',')[0].trim() : 'Amsterdam')})`,
                          partnerName: partnerForm.partnerName || 'Ruben Verbeij — RV Meubels',
                          divisionNL: activeCategoryKey === 'buitenverblijf' ? 'Buitenverblijven' : activeCategoryKey === 'overkapping' ? 'Overkappingen' : 'Buitenkeukens',
                          divisionEN: activeCategoryKey,
                          deadlineNL: step2ExpectedDate,
                          deadlineEN: step2ExpectedDate,
                          dueDateNL: step2ExpectedDate,
                          dueDateEN: step2ExpectedDate,
                          specsNL: `Categorie: ${activeCategoryKey}, Afmetingen: ${step2Size || '8x4m'}, Materiaal: ${step2Material}. Opmerkingen: ${step2Notes || 'Geen'}`,
                          specsEN: `Category: ${activeCategoryKey}, Dimensions: ${step2Size || '8x4m'}, Material: ${step2Material}. Notes: ${step2Notes || 'None'}`,
                          requestedDate: step2RequestedDate,
                          status: 'Open'
                        };

                        try {
                          const existingReqs = JSON.parse(localStorage.getItem('app_partner_requests') || '[]');
                          const updatedReqs = [newReq, ...existingReqs];
                          localStorage.setItem('app_partner_requests', JSON.stringify(updatedReqs));
                          window.dispatchEvent(new Event('app_data_changed'));
                        } catch (e) {}

                        setIsPriceRequestSent(true);
                        showToast(language === 'EN' ? `Price request sent to ${newReq.partnerName}!` : `Prijsaanvraag verzonden naar ${newReq.partnerName}!`);
                        advanceStep();
                      }}
                      className="px-5 py-2.5 bg-[#3E4E36] hover:bg-[#2F3C29] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-2 whitespace-nowrap"
                    >
                      <Send className="w-4 h-4 text-emerald-200" />
                      <span>Send Price Request →</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PARTNER PRICE RECEIVED (Internal Cost — CONFIDENTIAL) */}
              {currentStep === 3 && (
                <div className="space-y-4 font-body">

                  {/* 🔴 STRICT INTERNAL CONFIDENTIALITY BANNER */}
                  <div className="flex items-center gap-3 p-3.5 bg-red-50 border border-red-200 rounded-2xl">
                    <div className="w-8 h-8 rounded-lg bg-red-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-black">🔒</span>
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-red-900 uppercase tracking-wider">INTERNAL COST RECORD — STRICTLY CONFIDENTIAL</p>
                      <p className="text-[10px] text-red-700/90 mt-0.5">Partner cost price is <strong>never shown</strong> to the customer or included in any customer-facing document. Margin is internal only.</p>
                    </div>
                  </div>

                  {/* Card 1: Partner & Price Info */}
                  <div className="p-5 bg-[#F8F7F4] rounded-2xl border border-[#D6CFC2]/70 space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-[#D6CFC2]/60 pb-3">
                      <h4 className="font-bold text-dark text-sm flex items-center gap-2 font-heading">
                        <UserCheck className="w-4 h-4 text-primary" />
                        {language === 'EN' ? 'Partner Price Received' : 'Partner Prijs Ontvangen'}
                      </h4>
                      {partnerPriceLocked && (
                        <span className="text-[10px] font-mono font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                          🔒 Locked & Confirmed
                        </span>
                      )}
                    </div>

                    {/* Partner Name & Submitted Offer Banner */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-white rounded-xl border border-[#D6CFC2]/80">
                        <span className="text-[10px] font-bold text-dark/50 uppercase block mb-1">Partner</span>
                        <span className="font-bold text-primary text-sm">{partnerForm?.partnerName || 'Ruben Verbeij — RV Meubels'}</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-[#D6CFC2]/80">
                        <span className="text-[10px] font-bold text-dark/50 uppercase block mb-1">{language === 'EN' ? 'Price Request Sent' : 'Prijsaanvraag Verstuurd'}</span>
                        <span className="font-bold text-dark text-sm">{step2RequestedDate}</span>
                      </div>
                    </div>

                    {/* LIVE SUBMITTED OFFER FROM PARTNER PORTAL */}
                    {submittedPartnerOffer && (
                      <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2">
                        <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                          <span className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            {language === 'EN' 
                              ? `✓ Partner Offer Submitted by ${submittedPartnerOffer.partnerName || partnerForm?.partnerName}!`
                              : `✓ Partner Offerte Ingediend door ${submittedPartnerOffer.partnerName || partnerForm?.partnerName}!`}
                          </span>
                          <span className="font-mono text-xs font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300">
                            {submittedPartnerOffer.submittedOn}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-body">
                          <div>
                            <span className="text-[10px] text-dark/50 uppercase block font-bold">Build Price</span>
                            <strong className="text-sm font-mono text-emerald-900">{submittedPartnerOffer.price}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-dark/50 uppercase block font-bold">Lead Time</span>
                            <strong className="text-xs font-semibold text-dark">{submittedPartnerOffer.leadTimeEN || submittedPartnerOffer.leadTimeNL || '—'}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-dark/50 uppercase block font-bold">Validity</span>
                            <strong className="text-xs font-semibold text-dark">{submittedPartnerOffer.validityEN || submittedPartnerOffer.validityNL || '—'}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-dark/50 uppercase block font-bold">Remarks</span>
                            <strong className="text-xs font-semibold text-dark truncate block" title={submittedPartnerOffer.remarksEN || submittedPartnerOffer.remarksNL}>{submittedPartnerOffer.remarksEN || submittedPartnerOffer.remarksNL || '—'}</strong>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Internal Cost Price Entry */}
                    <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-xl space-y-3">
                      <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-amber-600 text-white font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">INTERN</span>
                          <span className="text-xs font-bold text-amber-950">{language === 'EN' ? 'Partner Cost Price (Internal)' : 'Partner Kostprijs (Intern)'}</span>
                        </div>
                        {partnerPriceLocked && <span className="text-xs text-amber-800 font-bold">🔒 Locked</span>}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Cost Price Input */}
                        <div>
                          <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1 flex items-center gap-1">
                            <span>{language === 'EN' ? 'Partner Cost Price (excl. BTW)' : 'Partner Kostprijs (excl. BTW)'}</span>
                            {partnerPriceLocked && <span>🔒</span>}
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-dark/50">€</span>
                            <input
                              type="number"
                              value={partnerCostPrice}
                              onChange={(e) => setPartnerCostPrice(e.target.value)}
                              disabled={partnerPriceLocked}
                              placeholder="0.00"
                              className="w-full pl-7 pr-3 py-2 bg-white border border-amber-300 rounded-xl text-sm font-bold text-primary focus:outline-none focus:ring-2 focus:ring-amber-400/30 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                          </div>
                          <span className="text-[9px] text-dark/50 italic block mt-1">
                            {language === 'EN'
                              ? 'Internal cost received from selected partner. Never shown to customer.'
                              : 'Interne kostprijs van partner. Wordt nooit aan klant getoond.'}
                          </span>
                        </div>

                        {/* Valid Until */}
                        <div>
                          <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1 flex items-center gap-1">
                            <span>{language === 'EN' ? 'Offer Valid Until' : 'Offerte Geldig Tot'}</span>
                            {partnerPriceLocked && <span>🔒</span>}
                          </label>
                          <input
                            type="date"
                            value={partnerValidUntil}
                            onChange={(e) => setPartnerValidUntil(e.target.value)}
                            disabled={partnerPriceLocked}
                            className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          />
                        </div>

                        {/* Lead Time */}
                        <div>
                          <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1 flex items-center gap-1">
                            <span>{language === 'EN' ? 'Build Lead Time' : 'Bouwtijd'}</span>
                            {partnerPriceLocked && <span>🔒</span>}
                          </label>
                          <select
                            value={partnerLeadTime}
                            onChange={(e) => setPartnerLeadTime(e.target.value)}
                            disabled={partnerPriceLocked}
                            className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs font-bold text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <option>2–3 weken</option>
                            <option>4–5 weken</option>
                            <option>6–8 weken</option>
                            <option>8–10 weken</option>
                            <option>10–12 weken</option>
                            <option>12+ weken</option>
                          </select>
                        </div>
                      </div>

                      {/* Partner Notes */}
                      <div>
                        <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1 flex items-center gap-1">
                          <span>{language === 'EN' ? 'Partner Remarks (Internal)' : 'Partner Opmerkingen (Intern)'}</span>
                          {partnerPriceLocked && <span>🔒</span>}
                        </label>
                        <textarea
                          value={partnerPriceNotes}
                          onChange={(e) => setPartnerPriceNotes(e.target.value)}
                          disabled={partnerPriceLocked}
                          placeholder={language === 'EN' ? 'e.g. Teak available. Extra 2 weeks for concrete worktop. Price excl. BTW...' : 'b.v. Teak beschikbaar. Extra 2 weken voor betonnen aanrechtblad. Prijs excl. BTW...'}
                          className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[56px] resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Internal Margin Calculator */}
                    {partnerCostNum > 0 && (
                      <div className="p-4 bg-[#EDE8DF]/50 border border-[#D6CFC2]/80 rounded-xl space-y-3">
                        <div className="flex items-center justify-between border-b border-[#D6CFC2]/60 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="bg-[#3E4E36] text-white font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">INTERN</span>
                            <span className="text-xs font-bold text-dark">{language === 'EN' ? 'Margin Calculator (Internal Only)' : 'Marge Calculator (Intern)'}</span>
                          </div>
                          {partnerPriceLocked && <span className="text-xs font-bold text-[#3E4E36]">🔒 Locked</span>}
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="text-[10px] font-bold text-dark/60 uppercase whitespace-nowrap flex items-center gap-1">
                            <span>{language === 'EN' ? 'Target Gross Margin %' : 'Doel Bruto Marge %'}</span>
                            {partnerPriceLocked && <span>🔒</span>}
                          </label>
                          <input
                            type="range"
                            min="10" max="60" step="1"
                            value={marginPercent}
                            onChange={(e) => setMarginPercent(Number(e.target.value))}
                            disabled={partnerPriceLocked}
                            className="flex-1 accent-[#3E4E36] h-2 rounded-full disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                          <span className="text-sm font-black text-primary w-10 text-right">{marginPercent}%</span>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="p-2.5 bg-white rounded-xl border border-[#D6CFC2]/80">
                            <span className="text-[10px] text-dark/50 font-bold uppercase block mb-0.5">
                              {language === 'EN' ? 'Partner Cost' : 'Kostprijs'} {partnerPriceLocked && '🔒'}
                            </span>
                            <span className="font-black text-sm text-red-700">€ {partnerCostNum.toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="p-2.5 bg-white rounded-xl border border-[#D6CFC2]/80">
                            <span className="text-[10px] text-dark/50 font-bold uppercase block mb-0.5">
                              {language === 'EN' ? 'Gross Margin' : 'Bruto Marge'} {partnerPriceLocked && '🔒'}
                            </span>
                            <span className="font-black text-sm text-amber-700">€ {grossMarginAmount.toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="p-2.5 bg-[#3E4E36] rounded-xl border border-[#3E4E36]">
                            <span className="text-[10px] text-white/80 font-bold uppercase block mb-0.5">
                              {language === 'EN' ? 'Customer Selling Price' : 'Klant Verkoopprijs'} {partnerPriceLocked && '🔒'}
                            </span>
                            <span className="font-black text-sm text-white">€ {customerSellPrice.toLocaleString('nl-NL')}</span>
                            <span className="text-[8px] text-white/70 block mt-0.5">Final price for customer quotation</span>
                          </div>
                        </div>

                        <p className="text-[10px] text-dark/50 italic">
                          {language === 'EN'
                            ? '⚠ This customer selling price suggestion is for internal reference only. The customer never sees the partner cost price.'
                            : '⚠ Deze klant verkoopprijs is uitsluitend voor intern gebruik. De klant ziet de kostprijs van de partner nooit.'}
                        </p>
                      </div>
                    )}

                    {/* Lock / Unlock Button */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (!partnerCostPrice || partnerCostNum <= 0) {
                            showToast(language === 'EN' ? 'Please enter partner cost price first.' : 'Voer eerst de partner kostprijs in.');
                            return;
                          }
                          setPartnerPriceLocked(!partnerPriceLocked);
                          showToast(partnerPriceLocked
                            ? (language === 'EN' ? 'Price record unlocked for editing.' : 'Prijsregistratie ontgrendeld voor bewerking.')
                            : (language === 'EN' ? '✓ Partner price locked & confirmed.' : '✓ Partner prijs vergrendeld & bevestigd.')
                          );
                        }}
                        className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-2 ${
                          partnerPriceLocked
                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                            : 'bg-[#3E4E36] hover:bg-[#2F3C29] text-white shadow-md'
                        }`}
                      >
                        {partnerPriceLocked ? '🔓 Unlock & Edit' : '🔒 Lock & Confirm Partner Price'}
                      </button>
                      {partnerPriceLocked && partnerCostNum > 0 && (
                        <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                          ✓ Cost: €{partnerCostNum.toLocaleString('nl-NL')} · Gross Margin: {marginPercent}% · Customer Selling Price: €{customerSellPrice.toLocaleString('nl-NL')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card 2: Auto-Message Templates & Contact Actions (Middle) */}
                  <div id="auto-message-section" className="p-5 bg-[#F8F7F4] rounded-2xl border border-[#D6CFC2]/70 space-y-3 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-primary font-heading uppercase tracking-wider">
                          {language === 'EN' ? 'Manual Customer Contact Actions' : 'Handmatige Klant Contact Acties'}
                        </span>
                        <span className="text-[9px] bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-full">
                          Nothing sent automatically
                        </span>
                      </div>
                      <select
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-[#D6CFC2] rounded-lg text-xs font-body text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium shadow-2xs"
                      >
                        <option value="template1">Template 1: Initial Inquiry Response</option>
                        <option value="template2">Template 2: 1st Follow-up Message</option>
                        <option value="template3">Template 3: Quote Ready Notification</option>
                      </select>
                    </div>

                    <div>
                      <textarea
                        value={customMessageText}
                        onChange={(e) => setCustomMessageText(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#D6CFC2] rounded-xl text-xs font-body text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[72px] resize-none leading-relaxed"
                        placeholder={language === 'EN' ? 'Message to customer (manual send only)...' : 'Bericht aan klant (alleen handmatig verzenden)...'}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <label className="flex items-center gap-2 text-[11px] text-dark/70 cursor-pointer select-none font-semibold">
                        <input
                          type="checkbox"
                          checked={attachPhotos}
                          onChange={(e) => setAttachPhotos(e.target.checked)}
                          className="rounded border-[#D6CFC2] text-primary focus:ring-primary/20"
                        />
                        <Paperclip className="w-3.5 h-3.5 text-primary" />
                        <span>{language === 'EN' ? 'Attach project photo / 3D render (WhatsApp)' : 'Projectfoto / 3D-render bijvoegen (WhatsApp)'}</span>
                      </label>

                      <div className="flex gap-2 flex-wrap">
                        <a
                          href={`https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(customMessageText)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-2xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                        </a>
                        <a
                          href={`tel:${customerPhone}`}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2196F3] hover:bg-[#1e87db] text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-2xs"
                        >
                          <Phone className="w-3.5 h-3.5" /> Call
                        </a>
                        <a
                          href={`mailto:${customerEmail}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#3E4E36] hover:bg-[#2e3a28] text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-2xs"
                        >
                          <Mail className="w-3.5 h-3.5" /> E-mail
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Recommended Next Action Banner (Bottom) */}
                  <div className="p-4 bg-[#EDE8DF] border border-[#D6CFC2] rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-wider block">RECOMMENDED NEXT ACTION</span>
                      <span className="text-xs font-bold text-primary">
                        {partnerPriceLocked
                          ? (language === 'EN' ? 'Partner price confirmed — proceed to create customer quote' : 'Partnerprijs bevestigd — ga verder met klantofferte maken')
                          : (language === 'EN' ? 'Lock the partner price first to continue' : 'Vergrendel eerst de partnerprijs om verder te gaan')}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (!partnerPriceLocked) {
                            showToast(language === 'EN' ? 'Please lock the partner price before proceeding.' : 'Vergrendel eerst de partnerprijs voordat u verder gaat.');
                            return;
                          }
                          advanceStep();
                        }}
                        className={`px-5 py-2.5 font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-2 whitespace-nowrap transition-all ${
                          partnerPriceLocked
                            ? 'bg-[#3E4E36] hover:bg-[#2F3C29] text-white'
                            : 'bg-[#D6CFC2] text-dark/40 cursor-not-allowed'
                        }`}
                      >
                        <ArrowRight className="w-4 h-4" />
                        <span>{language === 'EN' ? 'Proceed to Quote →' : 'Ga Naar Offerte →'}</span>
                      </button>
                      {!partnerPriceLocked && (
                        <span className="text-[10px] font-semibold text-amber-800 italic">
                          🔒 Lock the partner price first to continue
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: BUILD THE QUOTE (Internal Calculation & Draft Only — NOTHING SENT) */}
              {currentStep === 4 && (
                <div className="space-y-4 font-body">

                  {/* 🟢 STEP HEADER BANNER */}
                  <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-xs">
                        4
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-emerald-950 text-sm flex items-center gap-2">
                          <span>Build the Quote</span>
                          <span className="text-[10px] font-mono bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full uppercase">
                            DRAFT MODE ONLY
                          </span>
                        </h4>
                        <p className="text-[11px] text-emerald-900/80 mt-0.5">
                          Build customer quotation from approved internal pricing. Nothing is sent to customer or partner from this step.
                        </p>
                      </div>
                    </div>
                    {quoteSavedAsDraft && (
                      <span className="text-xs font-bold text-emerald-800 bg-white border border-emerald-300 px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-1.5 whitespace-nowrap">
                        ✓ Saved as Draft
                      </span>
                    )}
                  </div>

                  {/* Card 1: Internal Pricing Input & Two-Way Synchronized Margin */}
                  <div className="p-5 bg-[#F8F7F4] rounded-2xl border border-[#D6CFC2]/70 space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-[#D6CFC2]/60 pb-3">
                      <h4 className="font-bold text-dark text-sm flex items-center gap-2 font-heading">
                        <FileText className="w-4 h-4 text-primary" />
                        {language === 'EN' ? 'Internal Pricing Input' : 'Interne Prijs Invoer'}
                      </h4>
                      <span className="text-[10px] font-mono font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full uppercase">
                        🔒 INTERNAL ONLY
                      </span>
                    </div>

                    {/* Partner Cost Carry-Forward */}
                    <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-amber-900/70 uppercase block mb-0.5">
                          🔒 Internal Partner Cost (Auto Carried from Step 3)
                        </span>
                        <span className="text-xs text-amber-950 font-medium">
                          Partner: {partnerForm?.partnerName || 'Ruben Verbeij — RV Meubels'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-amber-900">€ {effectivePartnerCost.toLocaleString('nl-NL')}</span>
                        <span className="text-[9px] text-red-700 font-bold block">Never shown to customer</span>
                      </div>
                    </div>

                    {/* Two-Way Synchronized Margin Inputs */}
                    <div className="p-4 bg-white rounded-xl border border-[#D6CFC2]/80 space-y-3">
                      <div className="flex items-center justify-between border-b border-[#D6CFC2]/50 pb-2">
                        <span className="text-xs font-bold text-dark flex items-center gap-1.5">
                          <span>🔄 Two-Way Synchronized Margin Calculation</span>
                        </span>
                        <span className="text-[10px] text-dark/50 italic">
                          Change % or € — both stay synchronized
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Method A: Margin Percentage */}
                        <div>
                          <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">
                            Margin % (Percentage)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.5"
                              value={step4MarginPercent}
                              onChange={(e) => handleMarginPercentChange(e.target.value)}
                              className="w-full px-3 py-2 pr-8 bg-[#F8F7F4] border border-[#D6CFC2] rounded-xl text-sm font-bold text-primary focus:ring-2 focus:ring-primary/20"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-dark/50">%</span>
                          </div>
                          <span className="text-[9px] text-dark/50 block mt-1">Updates Margin Amount automatically</span>
                        </div>

                        {/* Method B: Margin Amount € */}
                        <div>
                          <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">
                            Margin Amount € (Fixed Amount)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-dark/50">€</span>
                            <input
                              type="number"
                              min="0"
                              step="50"
                              value={step4MarginAmount}
                              onChange={(e) => handleMarginAmountChange(e.target.value)}
                              className="w-full pl-7 pr-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-xl text-sm font-bold text-primary focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                          <span className="text-[9px] text-dark/50 block mt-1">Updates Margin Percentage automatically</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Quote Calculation Summary */}
                  <div className="p-5 bg-white rounded-2xl border border-[#D6CFC2]/80 space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-[#D6CFC2]/60 pb-3">
                      <h4 className="font-bold text-dark text-sm font-heading flex items-center gap-2">
                        <span>📊 Internal Quote Calculation Summary</span>
                      </h4>
                      <span className="text-[10px] font-bold text-dark/50 uppercase">Calculated Breakdown</span>
                    </div>

                    <div className="space-y-2 text-xs font-body">
                      {/* Partner Cost */}
                      <div className="flex justify-between items-center p-2.5 bg-red-50/50 rounded-xl border border-red-100">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-red-900">Partner Cost</span>
                          <span className="text-[9px] bg-red-700 text-white px-1.5 py-0.2 rounded font-bold uppercase">🔒 Internal</span>
                        </div>
                        <span className="font-black text-red-900 text-sm">€ {effectivePartnerCost.toLocaleString('nl-NL')}</span>
                      </div>

                      {/* Margin */}
                      <div className="flex justify-between items-center p-2.5 bg-amber-50/50 rounded-xl border border-amber-100">
                        <span className="font-bold text-amber-900">Gross Margin ({step4MarginPercent}%)</span>
                        <span className="font-black text-amber-900 text-sm">+ € {step4MarginAmount.toLocaleString('nl-NL')}</span>
                      </div>

                      <div className="border-t border-[#D6CFC2]/60 my-1" />

                      {/* Customer Price Excl VAT (Read-Only) */}
                      <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="font-bold text-dark">Customer Price excl. VAT</span>
                        <span className="font-black text-primary text-base">€ {step4CustomerPriceExclVat.toLocaleString('nl-NL')}</span>
                      </div>

                      {/* VAT 21% */}
                      <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-dark">VAT ({step4VatRate}%)</span>
                          <select
                            value={step4VatRate}
                            onChange={(e) => setStep4VatRate(Number(e.target.value))}
                            className="text-[10px] bg-white border border-[#D6CFC2] rounded px-1.5 py-0.5 font-bold cursor-pointer"
                          >
                            <option value={21}>21% (Standard)</option>
                            <option value={9}>9% (Reduced)</option>
                            <option value={0}>0% (Exempt)</option>
                          </select>
                        </div>
                        <span className="font-bold text-dark">+ € {step4VatAmount.toLocaleString('nl-NL')}</span>
                      </div>

                      {/* TOTAL INCL VAT (Prominent & Read-Only) */}
                      <div className="flex justify-between items-center p-4 bg-[#3E4E36] text-white rounded-xl shadow-md">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-emerald-200 block tracking-wider">TOTAL INCL. VAT (CALCULATED)</span>
                          <span className="text-xs text-white/80">Read-only total for customer quotation</span>
                        </div>
                        <span className="text-2xl font-black text-white">€ {step4TotalInclVat.toLocaleString('nl-NL')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Customer Quote Preview (Strictly Hides Partner Cost & Internal Margin) */}
                  <div className="p-5 bg-[#F6F4EE] rounded-2xl border border-[#D6CFC2] space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-[#D6CFC2]/70 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#3E4E36] text-white font-bold text-[10px] px-2 py-0.5 rounded uppercase">PREVIEW</span>
                        <h4 className="font-bold text-dark text-xs font-heading">Customer Quote Preview</h4>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        🔒 Partner cost & margin hidden
                      </span>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-[#D6CFC2]/80 space-y-2 text-xs font-body shadow-2xs">
                      <div className="flex justify-between items-center">
                        <span className="text-dark/70">Bespoke {lead?.productType || customerCategory} Quotation</span>
                        <span className="font-semibold text-dark">€ {step4CustomerPriceExclVat.toLocaleString('nl-NL')}</span>
                      </div>
                      <div className="flex justify-between items-center text-dark/70">
                        <span>VAT ({step4VatRate}%)</span>
                        <span>€ {step4VatAmount.toLocaleString('nl-NL')}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-[#D6CFC2] font-bold text-primary text-sm">
                        <span>Total (incl. VAT)</span>
                        <span className="text-base text-primary">€ {step4TotalInclVat.toLocaleString('nl-NL')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Step 4 Main Action Bar (STRICTLY NOTHING SENT — Save as Draft) */}
                  <div className="p-4 bg-[#EDE8DF] border border-[#D6CFC2] rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-wider block">RECOMMENDED NEXT ACTION</span>
                      <span className="text-xs font-bold text-primary">Save quote draft — no messages or emails will be sent</span>
                      <span className="text-[10px] text-dark/60 block font-medium">Continue to Step 5 for review. Nothing is sent from Step 4.</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex flex-col items-center gap-0.5">
                        <button
                          type="button"
                          onClick={handleSaveDraftStep4}
                          className="px-4 py-2.5 bg-white hover:bg-slate-50 text-dark border border-[#D6CFC2] font-bold text-xs rounded-xl shadow-2xs cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
                        >
                          <span>💾 Save as Draft</span>
                        </button>
                      </div>

                      <div className="flex flex-col items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleRealPdfDownload(true)}
                          className="px-4 py-2.5 bg-[#EDE8DF] hover:bg-[#D6CFC2]/50 text-dark font-bold text-xs rounded-xl border border-[#D6CFC2] cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
                        >
                          <FileText className="w-3.5 h-3.5 text-primary" />
                          <span>Download Draft PDF</span>
                        </button>
                        <span className="text-[9px] text-dark/50 italic">Internal draft only — not sent</span>
                      </div>

                      <div className="flex flex-col items-end gap-0.5">
                        <button
                          type="button"
                          onClick={() => advanceStep()}
                          className="px-5 py-2.5 bg-[#3E4E36] hover:bg-[#2F3C29] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-2 whitespace-nowrap"
                        >
                          <ArrowRight className="w-4 h-4" />
                          <span>Proceed to Review & Send (Step 5) →</span>
                        </button>
                        <span className="text-[9px] text-dark/50 italic">Navigate to Step 5 (nothing sent yet)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: REVIEW & SEND (Preview, Real PDF, Approval Gate & Confirmed Sending) */}
              {currentStep === 5 && (
                <div className="space-y-5 font-body">

                  {/* 🟢 STEP HEADER BANNER */}
                  <div className="p-4 bg-[#F8F7F4] border border-[#D6CFC2] rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-xs">
                        5
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-primary text-sm flex items-center gap-2">
                          <span>Review & Send</span>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                            step5SendConfirmed
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : (step5ApprovalStatus === 'APPROVED' ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-amber-100 text-amber-900 border border-amber-300')
                          }`}>
                            {step5SendConfirmed
                              ? `✓ ${step5SendChannelLabel}`
                              : (step5ApprovalStatus === 'APPROVED' ? '✓ APPROVED & READY' : 'APPROVAL GATED')}
                          </span>
                        </h4>
                        <p className="text-[11px] text-dark/70 mt-0.5">
                          Preview quotation page-by-page, download official PDF, approve internally, and send via confirmed channel.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action 1: Page-by-Page Quotation Preview */}
                  <div className="p-5 bg-white rounded-2xl border border-[#D6CFC2] space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-[#D6CFC2]/60 pb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <h4 className="font-bold text-dark text-sm font-heading">
                          1. Page-by-Page Quotation Preview
                        </h4>
                      </div>
                      <div className="flex items-center gap-1 bg-[#F8F7F4] p-1 rounded-xl border border-[#D6CFC2]/60">
                        <button
                          type="button"
                          onClick={() => setStep5PreviewPage(1)}
                          className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                            step5PreviewPage === 1 ? 'bg-primary text-white shadow-xs' : 'text-dark/60 hover:text-dark'
                          }`}
                        >
                          Page 1: Summary
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep5PreviewPage(2)}
                          className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                            step5PreviewPage === 2 ? 'bg-primary text-white shadow-xs' : 'text-dark/60 hover:text-dark'
                          }`}
                        >
                          Page 2: Specs
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep5PreviewPage(3)}
                          className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                            step5PreviewPage === 3 ? 'bg-primary text-white shadow-xs' : 'text-dark/60 hover:text-dark'
                          }`}
                        >
                          Page 3: Terms
                        </button>
                      </div>
                    </div>

                    {/* Preview Page Document Container */}
                    <div className="p-6 bg-[#FBF9F5] border border-[#D6CFC2]/80 rounded-xl space-y-4 shadow-inner">
                      <div className="flex justify-between items-start border-b border-[#D6CFC2] pb-4">
                        <div>
                          <span className="font-heading font-black text-lg text-primary block">VANUIT AMBACHT</span>
                          <span className="text-[10px] text-dark/50 uppercase font-mono tracking-wider">OFFICIËLE MAATOFFERTE #OF-2026331</span>
                        </div>
                        <div className="text-right text-xs">
                          <span className="font-bold text-dark block">{customerName}</span>
                          <span className="text-dark/60 text-[11px] block">{customerEmail}</span>
                          <span className="text-dark/60 text-[11px] block">{step2RequestedDate}</span>
                        </div>
                      </div>

                      {step5PreviewPage === 1 && (
                        <div className="space-y-3 text-xs">
                          <p className="text-dark/80 italic bg-white p-3 rounded-lg border border-[#D6CFC2]/50">
                            "Beste {customerName}, bedankt voor uw aanvraag bij Vanuit Ambacht. Op basis van uw wensen hebben wij onderstaande maatofferte voor uw {customerCategory} opgesteld."
                          </p>
                          <div className="space-y-2 bg-white p-4 rounded-xl border border-[#D6CFC2]/60">
                            <div className="flex justify-between font-medium"><span>Maatwerk {customerCategory} Frame (3.5m)</span><span>€ {step4CustomerPriceExclVat.toLocaleString('nl-NL')}</span></div>
                            <div className="flex justify-between font-medium"><span>BTW (21%)</span><span>€ {step4VatAmount.toLocaleString('nl-NL')}</span></div>
                            <div className="flex justify-between font-black text-primary text-sm pt-2 border-t border-[#D6CFC2]">
                              <span>Totaal incl. BTW</span>
                              <span className="text-base text-primary">€ {step4TotalInclVat.toLocaleString('nl-NL')}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {step5PreviewPage === 2 && (
                        <div className="space-y-2 text-xs bg-white p-4 rounded-xl border border-[#D6CFC2]/60">
                          <span className="font-bold text-primary block uppercase text-[10px]">Project Specificaties</span>
                          <div className="grid grid-cols-2 gap-2 text-dark/80">
                            <div><strong>Categorie:</strong> {customerCategory}</div>
                            <div><strong>Afmetingen:</strong> {step2Size || '8,00 × 4,00 m'}</div>
                            <div><strong>Hout / Materiaal:</strong> {step2Material}</div>
                            <div><strong>Montage & Transport:</strong> Inbegrepen</div>
                          </div>
                        </div>
                      )}

                      {step5PreviewPage === 3 && (
                        <div className="space-y-2 text-xs bg-white p-4 rounded-xl border border-[#D6CFC2]/60">
                          <span className="font-bold text-primary block uppercase text-[10px]">Garantie & Betalingsvoorwaarden</span>
                          <ul className="list-disc pl-4 space-y-1 text-dark/70">
                            <li>50% aanbetaling bij opdracht, 50% bij oplevering</li>
                            <li>10 jaar garantie op de houten constructie</li>
                            <li>Offerte is 30 dagen geldig na dagtekening</li>
                          </ul>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-[10px] text-dark/40 pt-2 border-t border-[#D6CFC2]/50 font-mono">
                        <span>🔒 Partner cost & internal margin hidden from preview</span>
                        <span>Page {step5PreviewPage} of 3</span>
                      </div>
                    </div>

                    {/* Action 2: Real PDF Download */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-[#EDE8DF]/60 border border-[#D6CFC2] rounded-xl">
                      <div>
                        <span className="text-xs font-bold text-primary block">2. Real PDF File Download</span>
                        <span className="text-[10px] text-dark/60">Downloads file matching exact preview: <strong>{quoteFileName}</strong></span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRealPdfDownload}
                        className="px-4 py-2 bg-white hover:bg-slate-50 text-primary border border-[#D6CFC2] font-bold text-xs rounded-xl shadow-2xs cursor-pointer flex items-center gap-2 whitespace-nowrap"
                      >
                        <Download className="w-4 h-4 text-primary" />
                        <span>Download PDF ({quoteFileName})</span>
                      </button>
                    </div>
                  </div>

                  {/* Action 3: Internal Approval Gate */}
                  <div className="p-5 bg-[#F8F7F4] rounded-2xl border border-[#D6CFC2] space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-[#D6CFC2]/60 pb-2">
                      <h4 className="font-bold text-dark text-sm font-heading flex items-center gap-2">
                        <span>3. Internal Approval Gate</span>
                      </h4>
                      <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        step5ApprovalStatus === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        {step5ApprovalStatus === 'APPROVED' ? '✓ APPROVED' : 'UNAPPROVED (DRAFT)'}
                      </span>
                    </div>

                    {step5ApprovalStatus !== 'APPROVED' ? (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <p className="text-xs font-bold text-amber-950">Quote is currently in DRAFT state.</p>
                          <p className="text-[11px] text-amber-800 mt-0.5">Approval is required before WhatsApp or E-mail sending buttons can be unlocked.</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleApproveQuoteStep5}
                          className="px-5 py-2.5 bg-[#3E4E36] hover:bg-[#2F3C29] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-2 whitespace-nowrap"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                          <span>Approve Quote (Internal)</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                            ✓
                          </div>
                          <div>
                            <p className="text-xs font-black text-emerald-950 uppercase tracking-wider">APPROVED BY: {step5ApprovedBy}</p>
                            <p className="text-[11px] text-emerald-800 mt-0.5">Approved on {step5ApprovedAt} · Send channels unlocked</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-emerald-800 bg-white border border-emerald-300 px-3 py-1 rounded-lg">
                          Unlocked
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action 4 & 5: Send via WhatsApp or E-mail (Disabled until Approved) */}
                  <div className="p-5 bg-white rounded-2xl border border-[#D6CFC2] space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-[#D6CFC2]/60 pb-3">
                      <h4 className="font-bold text-dark text-sm font-heading flex items-center gap-2">
                        <span>4. Send Quotation — Choose Channel</span>
                      </h4>
                      {step5ApprovalStatus !== 'APPROVED' && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          🔒 Locked until Approved
                        </span>
                      )}
                    </div>

                    {/* Recipient Details & Editable Message */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-body">
                      <div className="p-3 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2]/70">
                        <span className="text-[10px] font-bold text-dark/50 uppercase block mb-1">Recipient E-mail (with PDF)</span>
                        <span className="font-bold text-primary">{customerEmail}</span>
                      </div>
                      <div className="p-3 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2]/70">
                        <span className="text-[10px] font-bold text-dark/50 uppercase block mb-1">Recipient Phone (WhatsApp Approval Link)</span>
                        <span className="font-bold text-primary">{customerPhone}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">Editable Message Body</label>
                      <textarea
                        value={step5EditableMsg}
                        onChange={(e) => setStep5EditableMsg(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#F8F7F4] border border-[#D6CFC2] rounded-xl text-xs font-body text-dark focus:ring-2 focus:ring-primary/20 min-h-[80px] resize-none"
                      />
                    </div>

                    {/* Send Buttons (Disabled when Draft) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {/* WhatsApp Button */}
                      <button
                        type="button"
                        disabled={step5ApprovalStatus !== 'APPROVED'}
                        onClick={() => {
                          setStep5SelectedChannel('WHATSAPP');
                          setStep5ConfirmModalOpen(true);
                        }}
                        className={`p-3.5 rounded-xl font-bold text-xs flex items-center justify-between transition-all ${
                          step5ApprovalStatus === 'APPROVED'
                            ? 'bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-md cursor-pointer'
                            : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4" />
                          <span>Send via WhatsApp</span>
                        </div>
                        <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded uppercase">Approval Link Only</span>
                      </button>

                      {/* E-mail Button */}
                      <button
                        type="button"
                        disabled={step5ApprovalStatus !== 'APPROVED'}
                        onClick={() => {
                          setStep5SelectedChannel('EMAIL');
                          setStep5ConfirmModalOpen(true);
                        }}
                        className={`p-3.5 rounded-xl font-bold text-xs flex items-center justify-between transition-all ${
                          step5ApprovalStatus === 'APPROVED'
                            ? 'bg-[#3E4E36] hover:bg-[#2F3C29] text-white shadow-md cursor-pointer'
                            : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>Send via E-mail</span>
                        </div>
                        <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded uppercase">+ PDF Attachment</span>
                      </button>
                    </div>
                  </div>

                  {/* Step 5 Navigation Bar */}
                  <div className="p-4 bg-[#EDE8DF] border border-[#D6CFC2] rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-wider block">RECOMMENDED NEXT ACTION</span>
                      <span className="text-xs font-bold text-primary">
                        {step5SendConfirmed
                          ? 'Quote sent! Proceed to Step 6 (Customer Approval)'
                          : (step5ApprovalStatus === 'APPROVED' ? 'Quote approved — select channel to send' : 'Approve quote to unlock send channels')}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <button
                        type="button"
                        disabled={!step5SendConfirmed}
                        onClick={() => {
                          if (!step5SendConfirmed) {
                            showToast(language === 'EN' ? 'Please send the quotation via WhatsApp or E-mail before proceeding.' : 'Verzend eerst de offerte via WhatsApp of E-mail voordat u verder gaat.');
                            return;
                          }
                          advanceStep();
                        }}
                        className={`px-5 py-2.5 font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-2 whitespace-nowrap transition-all ${
                          step5SendConfirmed
                            ? 'bg-[#3E4E36] hover:bg-[#2F3C29] text-white'
                            : 'bg-[#D6CFC2] text-dark/40 cursor-not-allowed'
                        }`}
                      >
                        <ArrowRight className="w-4 h-4" />
                        <span>Proceed to Customer Approval (Step 6) →</span>
                      </button>
                      {!step5SendConfirmed && (
                        <span className="text-[10px] font-semibold text-amber-800 italic">
                          🔒 Send quotation via WhatsApp or E-mail first to unlock Step 6
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: CUSTOMER APPROVAL (Two Approval Routes & Automatic Project Creation) */}
              {currentStep === 6 && (
                <div className="space-y-5 font-body">

                  {/* 🟢 STEP HEADER BANNER */}
                  <div className="p-4 bg-[#F8F7F4] border border-[#D6CFC2] rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-xs">
                        6
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-primary text-sm flex items-center gap-2">
                          <span>Customer Approval</span>
                          <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase ${
                            step6Approved
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}>
                            {step6Approved
                              ? (step6ApprovalRoute === 'ROUTE_A_ONLINE' ? '✓ Accepted (Online Link)' : `✓ Accepted (Manual by ${step6ApprovalMetaData?.recordedBy || 'Bram'})`)
                              : 'Pending Customer Approval'}
                          </span>
                        </h4>
                        <p className="text-[11px] text-dark/70 mt-0.5">
                          Two approval routes lead to the same status. Both work, and the screen shows which route was used.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* UNAPPROVED STATE: CHOICE OF ROUTE A OR ROUTE B */}
                  {!step6Approved ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* ROUTE A: ONLINE APPROVAL */}
                      <div className="p-5 bg-white rounded-2xl border border-[#D6CFC2] space-y-4 shadow-2xs flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-[#D6CFC2]/60 pb-2">
                            <span className="font-bold text-primary text-xs uppercase font-heading tracking-wider flex items-center gap-1.5">
                              <Globe className="w-3.5 h-3.5 text-primary" /> ROUTE A — ONLINE APPROVAL
                            </span>
                            <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                              Customer Link
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-dark/50 uppercase block mb-0.5">Customer Approval Portal URL</span>
                            <span className="text-xs font-mono font-bold text-primary bg-[#F8F7F4] px-2.5 py-1 rounded border border-[#D6CFC2] block truncate">
                              https://vanuitambacht.nl/offerte/OF-2026331/bekijken
                            </span>
                          </div>
                          <div className="p-3 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2]/60 text-xs space-y-1 text-dark/80">
                            <p className="font-bold text-dark text-[11px]">What the customer sees:</p>
                            <p className="text-[11px] text-dark/70">Quote in browser + "Approve Quote & Pay Deposit" button</p>
                            <div className="pt-2 border-t border-[#D6CFC2]/50 text-[10px] text-dark/60 space-y-0.5">
                              <div>• <strong>Recorded:</strong> Customer name ({customerName})</div>
                              <div>• <strong>Recorded:</strong> Date / time & IP (84.112.45.198)</div>
                              <div>• <strong>Recorded:</strong> Quote version (#OF-2026331 v1.0)</div>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleRouteAOnlineApproval}
                          className="w-full py-2.5 bg-[#3E4E36] hover:bg-[#2F3C29] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 mt-2"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                          <span>Simulate Customer Online Approval (Route A)</span>
                        </button>
                      </div>

                      {/* ROUTE B: MANUAL APPROVAL */}
                      <div className="p-5 bg-white rounded-2xl border border-[#D6CFC2] space-y-4 shadow-2xs flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-[#D6CFC2]/60 pb-2">
                            <span className="font-bold text-primary text-xs uppercase font-heading tracking-wider flex items-center gap-1.5">
                              <PhoneCall className="w-3.5 h-3.5 text-primary" /> ROUTE B — RECORD MANUALLY
                            </span>
                            <span className="text-[9px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                              Phone / WhatsApp / Email / In Person
                            </span>
                          </div>
                          <p className="text-xs text-dark/70 leading-relaxed">
                            If the customer approved via telephone call, WhatsApp message, email, or face-to-face meeting, record the approval manually with optional evidence upload.
                          </p>
                          <div className="p-3 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2]/60 text-xs space-y-1 text-dark/80">
                            <p className="font-bold text-dark text-[11px]">Manual Record Details:</p>
                            <div className="text-[10px] text-dark/60 space-y-0.5">
                              <div>• <strong>Required:</strong> Date & Channel (Phone / WhatsApp / Email / In Person)</div>
                              <div>• <strong>Optional:</strong> Screenshot or Email evidence attachment</div>
                              <div>• <strong>Status:</strong> Approved — noted as "recorded manually by Bram"</div>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setStep6ManualModalOpen(true)}
                          className="w-full py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 mt-2"
                        >
                          <FileText className="w-4 h-4 text-amber-200" />
                          <span>Record Approval Manually (Route B)</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* APPROVED STATE DISPLAY */
                    <div className="space-y-4">
                      <div className="p-5 bg-emerald-50/90 border border-emerald-300 rounded-2xl space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-base shadow-xs">
                              ✓
                            </div>
                            <div>
                              <h4 className="font-bold text-emerald-950 text-sm font-heading">
                                {step6ApprovalRoute === 'ROUTE_A_ONLINE'
                                  ? '✓ Customer Approved via Online Portal (Route A)'
                                  : `✓ Approved — recorded manually by ${step6ApprovalMetaData?.recordedBy || 'Bram'} (Route B)`}
                              </h4>
                              <span className="text-[11px] text-emerald-900 font-medium">
                                Approved on {step6ApprovalMetaData?.dateTime} · Customer: {customerName}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-emerald-900 bg-white border border-emerald-300 px-3 py-1 rounded-xl">
                            {step6ApprovalRoute === 'ROUTE_A_ONLINE' ? 'Route A — Online' : `Route B — ${step6ApprovalMetaData?.channel}`}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                          <div className="p-3 bg-white/80 rounded-xl border border-emerald-200/80">
                            <span className="text-[10px] font-bold text-emerald-900/60 uppercase block mb-0.5">Approved By</span>
                            <span className="font-bold text-emerald-950">{customerName}</span>
                          </div>
                          <div className="p-3 bg-white/80 rounded-xl border border-emerald-200/80">
                            <span className="text-[10px] font-bold text-emerald-900/60 uppercase block mb-0.5">
                              {step6ApprovalRoute === 'ROUTE_A_ONLINE' ? 'IP Address' : 'Channel'}
                            </span>
                            <span className="font-bold text-emerald-950">
                              {step6ApprovalRoute === 'ROUTE_A_ONLINE' ? step6ApprovalMetaData?.ipAddress : step6ApprovalMetaData?.channel}
                            </span>
                          </div>
                          <div className="p-3 bg-white/80 rounded-xl border border-emerald-200/80">
                            <span className="text-[10px] font-bold text-emerald-900/60 uppercase block mb-0.5">Quote Version</span>
                            <span className="font-mono font-bold text-emerald-950">#OF-2026331 v1.0</span>
                          </div>
                        </div>

                        {step6ApprovalRoute === 'ROUTE_B_MANUAL' && (
                          <div className="p-3 bg-white/80 rounded-xl border border-emerald-200/80 text-xs space-y-1">
                            <span className="text-[10px] font-bold text-emerald-900/60 uppercase block">Manual Notes & Evidence</span>
                            <p className="text-emerald-950 font-medium">{step6ApprovalMetaData?.notes}</p>
                            {step6ApprovalMetaData?.evidenceFile && (
                              <span className="text-[10px] text-emerald-800 font-mono block pt-0.5">📎 Attachment: {step6ApprovalMetaData.evidenceFile}</span>
                            )}
                          </div>
                        )}

                        <div className="p-2.5 bg-emerald-100/70 border border-emerald-300/80 rounded-xl text-[11px] text-emerald-900 font-semibold flex items-center justify-between">
                          <span>🔒 Quotation is locked — changes allowed only via a new quote version</span>
                          <span className="text-[10px] font-mono">STATUS: ACCEPTED</span>
                        </div>
                      </div>

                      {/* AUTOMATIC CONSEQUENCE BANNER (Project Auto-Created in Step 7) */}
                      <div className="p-4 bg-[#EDE8DF] border border-[#D6CFC2] rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#3E4E36] text-white flex items-center justify-center font-bold text-xs">
                            🚀
                          </div>
                          <div>
                            <span className="text-xs font-bold text-primary font-heading block">
                              Active Project P-{lead?.id?.replace('LEAD', 'L') || '2001'} Automatically Created (Step 7)
                            </span>
                            <span className="text-[10px] text-dark/70 block">
                              Work order setup complete · Notification sent to info@vanuitambacht.nl
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full uppercase">
                          ✓ Auto-Created
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Step 6 Navigation Bar */}
                  <div className="p-4 bg-[#EDE8DF] border border-[#D6CFC2] rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-wider block">RECOMMENDED NEXT ACTION</span>
                      <span className="text-xs font-bold text-primary">
                        {step6Approved
                          ? 'Customer approved! Proceed to Step 7 (Create Project)'
                          : 'Select Route A or Route B to record customer approval'}
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={!step6Approved}
                      onClick={() => advanceStep()}
                      className={`px-5 py-2.5 font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-2 whitespace-nowrap transition-all ${
                        step6Approved
                          ? 'bg-[#3E4E36] hover:bg-[#2F3C29] text-white'
                          : 'bg-[#D6CFC2] text-dark/40 cursor-not-allowed'
                      }`}
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>Proceed to Create Project (Step 7) →</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 7: CREATE PROJECT (Final Check & Partner Privacy Release) */}
              {currentStep === 7 && (
                <div className="space-y-5 font-body">

                  {/* 🟢 STEP HEADER BANNER */}
                  <div className="p-4 bg-[#F8F7F4] border border-[#D6CFC2] rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-xs">
                        7
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-primary text-sm flex items-center gap-2">
                          <span>Create Project</span>
                          <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase ${
                            step7Confirmed
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}>
                            {step7Confirmed ? '✓ CONFIRMED & RELEASED' : 'STATUS: TO CONFIRM'}
                          </span>
                        </h4>
                        <p className="text-[11px] text-dark/70 mt-0.5">
                          The project already exists in system (created on approval in Step 6). This screen is the final check: confirm partner, fill in dates, and confirm. Nobody retypes anything.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card 1: Carried Over From Flow — Read Only */}
                  <div className="p-5 bg-white rounded-2xl border border-[#D6CFC2] space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-[#D6CFC2]/60 pb-3">
                      <h4 className="font-bold text-dark text-sm font-heading flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-primary" />
                        <span>Carried Over From Flow — Read Only (No Retyping)</span>
                      </h4>
                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase font-mono">
                        AUTOMATIC DATA
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      {/* Project Number */}
                      <div className="p-3 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2]/70">
                        <span className="text-[10px] font-bold text-dark/50 uppercase block mb-1">Project Number</span>
                        <span className="font-mono font-bold text-primary text-sm">
                          PRJ-{lead?.id?.replace('LEAD', 'L') || '103'}
                        </span>
                        <span className="text-[9px] text-dark/50 block font-mono">Auto-generated Step 6</span>
                      </div>

                      {/* Customer & Location */}
                      <div className="p-3 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2]/70">
                        <span className="text-[10px] font-bold text-dark/50 uppercase block mb-1">Customer & Location</span>
                        <span className="font-bold text-dark block">{customerName}</span>
                        <span className="text-[11px] text-dark/60 block">{lead?.city || 'Amsterdam'}</span>
                        <span className="text-[9px] text-dark/50 block font-mono">From Step 1</span>
                      </div>

                      {/* Linked Quote */}
                      <div className="p-3 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2]/70">
                        <span className="text-[10px] font-bold text-dark/50 uppercase block mb-1">Linked Quotation</span>
                        <span className="font-bold text-primary block">OF-2026331</span>
                        <span className="font-bold text-emerald-800 text-xs block">€ {step4TotalInclVat.toLocaleString('nl-NL')} incl. VAT</span>
                        <span className="text-[9px] text-dark/50 block font-mono">From Step 4/5</span>
                      </div>

                      {/* Internal Partner Price & Margin */}
                      <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80">
                        <span className="text-[10px] font-bold text-amber-900/70 uppercase block mb-1">🔒 Partner Cost & Margin</span>
                        <span className="font-bold text-amber-950 block">€ {effectivePartnerCost.toLocaleString('nl-NL')} Cost</span>
                        <span className="font-bold text-emerald-900 text-xs block">€ {step4MarginAmount.toLocaleString('nl-NL')} Margin ({step4MarginPercent}%)</span>
                        <span className="text-[9px] text-red-700 font-bold block font-mono">INTERNAL ONLY</span>
                      </div>
                    </div>

                    {/* Specifications Copied in Full from Step 2 */}
                    <div className="p-3.5 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2]/70 space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-dark/50 uppercase">Full Specifications (Copied from Step 2)</span>
                        <span className="text-[9px] font-bold text-primary font-mono">Copied in full</span>
                      </div>
                      <p className="font-semibold text-dark">
                        Bespoke {customerCategory} ({step2Size || '8,00 × 4,00 m'}) — {step2Material || 'Teak Wood frame with polished concrete countertop'}
                      </p>
                    </div>
                  </div>

                  {/* Card 2: To Be Filled In & Partner Confirmation */}
                  <div className="p-5 bg-white rounded-2xl border border-[#D6CFC2] space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-[#D6CFC2]/60 pb-3">
                      <h4 className="font-bold text-dark text-sm font-heading flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-primary" />
                        <span>To Be Filled In & Partner Confirmation</span>
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      {/* Confirm Partner Dropdown */}
                      <div className="sm:col-span-3 bg-[#F8F7F4] p-3.5 rounded-xl border border-[#D6CFC2]/70 space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="block text-[10px] font-bold text-dark/70 uppercase">
                            Confirm Partner (Pre-filled from Step 2) *
                          </label>
                          <span className="text-[10px] text-primary font-bold">Pre-filled from Step 2</span>
                        </div>
                        <select
                          value={step7SelectedPartner}
                          onChange={(e) => setStep7SelectedPartner(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl font-bold text-dark text-xs"
                        >
                          <option value="Ruben Verbeij — RV Meubels">Ruben Verbeij — RV Meubels (Preferred Partner)</option>
                          <option value="Sven Hoek — Hoek Bouw">Sven Hoek — Hoek Bouw</option>
                          <option value="Kees van der Meer — De Zaagtafel">Kees van der Meer — De Zaagtafel</option>
                        </select>

                        {/* Mandatory Reason if selecting another partner */}
                        {step7SelectedPartner !== (partnerForm?.partnerName || lead?.partner || 'Ruben Verbeij — RV Meubels') && (
                          <div className="pt-2 animate-fade-in space-y-1">
                            <label className="block text-[10px] font-bold text-amber-900 uppercase">
                              Why are you changing the partner? * (Mandatory Reason)
                            </label>
                            <input
                              type="text"
                              required
                              value={step7PartnerChangeReason}
                              onChange={(e) => setStep7PartnerChangeReason(e.target.value)}
                              placeholder="Why are you changing the partner? (e.g. Schedule conflict, capacity limit...)"
                              className="w-full px-3 py-2 bg-amber-50 border border-amber-300 rounded-xl text-xs font-semibold text-amber-950 focus:ring-2 focus:ring-amber-500/20"
                            />
                          </div>
                        )}
                      </div>

                      {/* Preferred Start Date */}
                      <div>
                        <label className="block text-[10px] font-bold text-dark/70 uppercase mb-1">
                          Preferred Start Date *
                        </label>
                        <input
                          type="date"
                          value={step7StartDate}
                          onChange={(e) => setStep7StartDate(e.target.value)}
                          className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-xl font-bold text-dark text-xs"
                        />
                      </div>

                      {/* Expected Completion Date */}
                      <div>
                        <label className="block text-[10px] font-bold text-dark/70 uppercase mb-1">
                          Expected Completion Date *
                        </label>
                        <input
                          type="date"
                          value={step7CompletionDate}
                          onChange={(e) => setStep7CompletionDate(e.target.value)}
                          className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-xl font-bold text-dark text-xs"
                        />
                      </div>

                      {/* Internal Note */}
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold text-dark/70 uppercase mb-1">
                          Internal Note (Not visible to partner)
                        </label>
                        <textarea
                          value={step7InternalNote}
                          onChange={(e) => setStep7InternalNote(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-[#F8F7F4] border border-[#D6CFC2] rounded-xl font-medium text-dark text-xs min-h-[60px] resize-none"
                          placeholder="Internal notes for company team only..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Partner Privacy Release Status Banner */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    step7Confirmed
                      ? 'bg-emerald-50 border-emerald-300 shadow-2xs'
                      : 'bg-amber-50 border-amber-200 shadow-2xs'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          step7Confirmed ? 'bg-emerald-700 text-white' : 'bg-amber-700 text-white'
                        }`}>
                          {step7Confirmed ? '✓' : '🔒'}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs uppercase font-heading tracking-wider">
                            {step7Confirmed
                              ? 'Partner Access & Customer Contact Details UNLOCKED'
                              : 'Partner Privacy Protection Active'}
                          </h4>
                          <p className="text-[11px] mt-0.5">
                            {step7Confirmed
                              ? `Customer address (${lead?.location || 'Keizersgracht 402, Amsterdam'}) & phone (${customerPhone}) are now visible to ${step7SelectedPartner}.`
                              : `Customer address and phone number remain HIDDEN from partner until you click "Confirm Project".`}
                          </p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg ${
                        step7Confirmed
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        {step7Confirmed ? 'UNLOCKED TO PARTNER' : 'HIDDEN FROM PARTNER'}
                      </span>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="p-4 bg-[#EDE8DF] border border-[#D6CFC2] rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-wider block">RECOMMENDED NEXT ACTION</span>
                      <span className="text-xs font-bold text-primary">
                        {step7Confirmed
                          ? 'Project confirmed! Proceed to Step 8 (Planning & Delivery)'
                          : 'Confirm project details to release to partner portal'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => showToast(language === 'EN' ? 'Project details saved as draft.' : 'Projectgegevens opgeslagen als concept.')}
                        className="px-4 py-2.5 bg-white hover:bg-slate-50 text-dark border border-[#D6CFC2] font-bold text-xs rounded-xl shadow-2xs cursor-pointer"
                      >
                        Save without confirming
                      </button>

                      <button
                        type="button"
                        onClick={handleConfirmProjectStep7}
                        className="px-5 py-2.5 bg-[#3E4E36] hover:bg-[#2F3C29] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-2 whitespace-nowrap"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                        <span>Confirm Project</span>
                      </button>

                      <button
                        type="button"
                        disabled={!step7Confirmed}
                        onClick={() => advanceStep()}
                        className={`px-5 py-2.5 font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-2 whitespace-nowrap transition-all ${
                          step7Confirmed
                            ? 'bg-[#3E4E36] hover:bg-[#2F3C29] text-white'
                            : 'bg-[#D6CFC2] text-dark/40 cursor-not-allowed'
                        }`}
                      >
                        <ArrowRight className="w-4 h-4" />
                        <span>Proceed to Planning & Delivery (Step 8) →</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 8: COMPLETED */}
              {currentStep === 8 && (
                <div className="space-y-4 font-body">
                  {/* Card 1: Dark Forest Green Banner */}
                  <div className="p-5 bg-[#185334] text-white rounded-2xl space-y-2 shadow-sm">
                    <div className="flex items-center gap-2 font-bold text-base text-white">
                      <Award className="w-5 h-5 text-amber-400 flex-shrink-0" />
                      <span>Project Completed & Archived</span>
                    </div>
                    <p className="text-xs text-[#EDE8DF]/90 font-normal leading-relaxed">
                      Final inspection passed, 100% invoice paid (€12,500), customer signature received for {customerName}.
                    </p>
                  </div>

                  {/* Card 2: Auto-Message Templates & Contact Actions (Middle) */}
                  <div id="auto-message-section" className="p-5 bg-[#F8F7F4] rounded-2xl border border-[#D6CFC2]/70 space-y-3 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-primary font-heading uppercase tracking-wider">
                          Auto-Message Templates & Contact Actions
                        </span>
                      </div>
                      <select
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-[#D6CFC2] rounded-lg text-xs font-body text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium shadow-2xs"
                      >
                        <option value="template1">Template 1: Initial Inquiry Response</option>
                        <option value="template2">Template 2: 1st Follow-up Message</option>
                        <option value="template3">Template 3: 2nd Follow-up Message</option>
                      </select>
                    </div>

                    <div>
                      <textarea
                        value={customMessageText}
                        onChange={(e) => setCustomMessageText(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#D6CFC2] rounded-xl text-xs font-body text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[72px] resize-none leading-relaxed"
                        placeholder="Message content..."
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <label className="flex items-center gap-2 text-[11px] text-dark/70 cursor-pointer select-none font-semibold">
                        <input
                          type="checkbox"
                          checked={attachPhotos}
                          onChange={(e) => setAttachPhotos(e.target.checked)}
                          className="rounded border-[#D6CFC2] text-primary focus:ring-primary/20"
                        />
                        <Paperclip className="w-3.5 h-3.5 text-primary" />
                        <span>{language === 'EN' ? 'Attach project photo / 3D render (WhatsApp)' : 'Projectfoto / 3D-render bijvoegen (WhatsApp)'}</span>
                      </label>

                      <div className="flex gap-2 flex-wrap">
                        <a
                          href={`https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(customMessageText)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-2xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                        </a>
                        <a
                          href={`tel:${customerPhone}`}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2196F3] hover:bg-[#1e87db] text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-2xs"
                        >
                          <Phone className="w-3.5 h-3.5" /> Call
                        </a>
                        <a
                          href={`mailto:${customerEmail}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#3E4E36] hover:bg-[#2e3a28] text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-2xs"
                        >
                          <Mail className="w-3.5 h-3.5" /> E-mail
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Recommended Next Action Banner (Bottom) */}
                  <div className="p-4 bg-[#EDE8DF] border border-[#D6CFC2] rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-wider block">RECOMMENDED NEXT ACTION</span>
                      <span className="text-xs font-bold text-primary">Archive project & save documents</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        showToast('Project archived successfully!');
                        if (onClose) onClose();
                      }}
                      className="px-4 py-2 bg-white/80 hover:bg-white text-dark border border-[#D6CFC2] font-bold text-xs rounded-xl shadow-2xs cursor-pointer flex items-center gap-2 whitespace-nowrap"
                    >
                      <Award className="w-4 h-4 text-dark/70" />
                      <span>Archive Project</span>
                    </button>
                  </div>
                </div>
              )}

              {/* End of Workflow Step Content */}
            </div>
          </Card>
        </div>

        {/* Right Column: Commercial Actions + Activity Lifecycle History Timeline (1 Col) */}
        <div className="space-y-4">

          {/* NEW COMMERCIAL ACTIONS SECTION (Positioned directly ABOVE Activity History per PDF spec) */}
          <Card>
            <div className="flex items-center justify-between mb-3 border-b border-[#D6CFC2]/60 pb-2">
              <h3 className="font-heading font-bold text-sm sm:text-base text-primary flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span>{language === 'EN' ? 'Commercial Actions' : 'Commerciële Acties'}</span>
              </h3>
              {!isLeadCompleted && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setCommercialModalOpen(true)}
                  className="py-1 px-2 text-[10px] border-primary/40 text-primary hover:bg-primary/10 font-bold"
                >
                  + {language === 'EN' ? 'Add Action' : 'Actie Toevoegen'}
                </Button>
              )}
            </div>

            {isLeadCompleted && (
              <div className="p-2.5 mb-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 font-medium flex items-center gap-1.5 shadow-2xs">
                <span>🔒 {language === 'EN' ? 'Lead is converted & completed. Further commercial actions & follow-ups are handled in Project Detail.' : 'Lead is geconverteerd & afgerond. Verdere commerciële acties & follow-ups beheer je bij het Project.'}</span>
              </div>
            )}

            {commercialActions.length > 0 ? (
              <div className="space-y-2.5 text-xs max-h-[300px] overflow-y-auto pr-1">
                {commercialActions.map((item) => (
                  <div key={item.id} className="p-3 bg-[#F8F7F4] border border-[#D6CFC2]/70 rounded-xl space-y-1 shadow-2xs">
                    <div className="flex justify-between items-center text-[10px] text-dark/50 font-mono border-b border-[#D6CFC2]/30 pb-1">
                      <span className="font-bold text-primary">{item.user}</span>
                      <div className="flex items-center gap-1.5">
                        {item.assignee && (
                          <span className="bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded font-bold">
                            👤 Taak: {item.assignee} {item.dueDate ? `(${item.dueDate})` : ''}
                          </span>
                        )}
                        <span>{item.date}</span>
                      </div>
                    </div>
                    <p className="text-dark/85 font-body leading-relaxed pt-0.5">{item.note}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-dark/40 italic text-center py-4">
                {language === 'EN' ? 'No commercial actions recorded yet.' : 'Nog geen commerciële acties vastgelegd.'}
              </p>
            )}
          </Card>

          {/* PLAUD AI VOICE RECORDINGS & CALL TRANSCRIPTS SECTION */}
          <Card>
            <div className="flex items-center justify-between mb-3 border-b border-[#D6CFC2]/60 pb-2">
              <h3 className="font-heading font-bold text-sm sm:text-base text-primary flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-purple-700" />
                <span>{language === 'EN' ? 'Plaud AI Voice Notes & Call Recordings' : 'Plaud AI Spraaknotities & Opnames'}</span>
              </h3>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setPlaudModalOpen(true)}
                className="py-1 px-2 text-[10px] border-purple-400 text-purple-900 bg-purple-50 hover:bg-purple-100 font-bold"
              >
                🎙️ + {language === 'EN' ? 'Import Audio' : 'Audio Importeren'}
              </Button>
            </div>

            {plaudRecordings.length > 0 ? (
              <div className="space-y-2.5 text-xs max-h-[300px] overflow-y-auto pr-1">
                {plaudRecordings.map((rec) => (
                  <div key={rec.id} className="p-3 bg-purple-50/60 border border-purple-200/80 rounded-xl space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between gap-2 border-b border-purple-200/50 pb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <button 
                          type="button"
                          onClick={() => {
                            setPlayingAudioId(playingAudioId === rec.id ? null : rec.id);
                            showToast(playingAudioId === rec.id ? 'Playback paused' : `Playing audio: ${rec.title}`);
                          }}
                          className="w-7 h-7 rounded-full bg-purple-700 text-white flex items-center justify-center flex-shrink-0 hover:bg-purple-800 transition-colors shadow-xs"
                          title="Play Audio Recording"
                        >
                          {playingAudioId === rec.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                        </button>
                        <div className="min-w-0">
                          <p className="font-bold text-dark truncate text-xs">{rec.title}</p>
                          <p className="text-[10px] text-purple-900 font-mono">📁 {rec.fileName} • ⏱️ {rec.duration}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-dark/50 font-mono flex-shrink-0">{rec.date}</span>
                    </div>

                    <div className="bg-white/90 p-2.5 rounded-lg border border-purple-100 text-[#4A4A43] leading-relaxed text-[11px] space-y-2">
                      <div>
                        <p className="font-bold text-purple-950 text-[10px] uppercase mb-0.5 tracking-wider">🤖 Plaud AI Transcript Summary</p>
                        {rec.summary}
                      </div>

                      <div className="pt-1 border-t border-purple-100 flex justify-end">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleGenerateClaudeProposal(rec)}
                          className="text-[10px] py-1 px-2.5 bg-gradient-to-r from-purple-100 to-indigo-100 border-purple-300 text-purple-950 hover:bg-purple-200 font-bold flex items-center gap-1 shadow-2xs"
                        >
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          {language === 'EN' ? 'Generate Claude AI Proposal' : 'Claude AI Offerte Genereren'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-dark/40 italic text-center py-4">
                {language === 'EN' ? 'No Plaud AI audio recordings imported yet.' : 'Nog geen Plaud AI spraakopnames geïmporteerd.'}
              </p>
            )}
          </Card>

          {/* Activity Lifecycle History Timeline */}
          <Card>
            <h3 className="font-heading font-bold text-base text-primary mb-4 flex items-center justify-between">
              <span>{language === 'NL' ? 'Activiteitenhistorie' : 'Activity Lifecycle History'}</span>
              <Clock className="w-4 h-4 text-dark/40" />
            </h3>

            <div className="relative pl-6 space-y-4 text-xs before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D6CFC2]">
              {visibleTimeline.map((item) => (
                <div key={item.id} className="relative">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-[#EDE8DF]" />
                  <div className="font-semibold text-dark">{item.title}</div>
                  <div className="text-dark/60 text-[11px] mt-0.5">{translateCategory(item.desc)}</div>
                  <div className="flex justify-between items-center text-[10px] text-dark/40 mt-1 font-mono">
                    <span>{item.time}</span>
                    <span>{item.user}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>

      {/* PLAUD AI AUDIO IMPORT MODAL */}
      <AnimatePresence>
        {plaudModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-xs">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#EDE8DF] border border-[#D6CFC2] rounded-2xl shadow-card p-6 w-full max-w-lg space-y-4">
              <div className="flex justify-between items-center border-b border-[#D6CFC2] pb-3">
                <h3 className="font-heading font-bold text-lg text-purple-950 flex items-center gap-2">
                  <Mic className="w-5 h-5 text-purple-700" />
                  <span>🎙️ {language === 'EN' ? 'Import Plaud AI Audio Recording' : 'Plaud AI Audio-Opname Importeren'}</span>
                </h3>
                <button onClick={() => setPlaudModalOpen(false)} className="text-dark/40 hover:text-dark">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePlaudAudio} className="space-y-4">
                <div className="p-3 bg-purple-100/60 border border-purple-200 rounded-xl text-purple-950 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileAudio className="w-5 h-5 text-purple-700 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold truncate">{plaudAudioForm.fileName}</p>
                      <p className="text-[10px] text-purple-800 font-mono">Plaud AI Voice Recorder Sync • 128kbps MP3</p>
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => audioFileInputRef.current?.click()}
                    className="text-[11px] py-1 px-2.5 bg-white border-purple-300 text-purple-900 font-bold flex-shrink-0"
                  >
                    📁 {language === 'EN' ? 'Browse Audio' : 'Audio Kiezen'}
                  </Button>
                  <input 
                    type="file" 
                    ref={audioFileInputRef} 
                    onChange={handleAudioFileUpload} 
                    accept="audio/*" 
                    className="hidden" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark/60 uppercase tracking-wider mb-1">
                    {language === 'EN' ? 'Recording Title / Subject' : 'Titel / Onderwerp Opname'}
                  </label>
                  <input
                    required
                    type="text"
                    value={plaudAudioForm.title}
                    onChange={(e) => setPlaudAudioForm({ ...plaudAudioForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs font-body text-dark focus:outline-none focus:ring-2 focus:ring-purple-600/20"
                    placeholder={language === 'EN' ? 'e.g. Client Phone Call — Materials & Size Confirmation' : 'b.v. Telefoongesprek Klant — Materialen & Afmetingen'}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark/60 uppercase tracking-wider mb-1">
                    {language === 'EN' ? 'Plaud AI Transcript Summary & Key Notes' : 'Plaud AI Transcript Samenvatting'}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={plaudAudioForm.summary}
                    onChange={(e) => setPlaudAudioForm({ ...plaudAudioForm, summary: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs font-body text-dark focus:outline-none focus:ring-2 focus:ring-purple-600/20"
                    placeholder={language === 'EN' ? 'Paste Plaud AI transcript summary or recorded audio notes here...' : 'Plak hier de Plaud AI transcritsamenvatting of spraaknotities...'}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#D6CFC2]">
                  <Button type="button" variant="outline" onClick={() => setPlaudModalOpen(false)}>
                    {language === 'EN' ? 'Cancel' : 'Annuleren'}
                  </Button>
                  <Button type="submit" variant="primary" className="bg-purple-800 hover:bg-purple-900 border-purple-800 text-white">
                    🎙️ {language === 'EN' ? 'Import & Save to Lead Card' : 'Importeren & Opslaan'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD COMMERCIAL ACTION FREE-TEXT MODAL */}
      <AnimatePresence>
        {commercialModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-xs">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#EDE8DF] border border-[#D6CFC2] rounded-2xl shadow-card p-6 w-full max-w-lg space-y-4">
              <div className="flex justify-between items-center border-b border-[#D6CFC2] pb-3">
                <h3 className="font-heading font-bold text-lg text-primary flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <span>{language === 'EN' ? 'Add Commercial Action / Note' : 'Commerciële Actie / Notitie Toevoegen'}</span>
                </h3>
                <button onClick={() => setCommercialModalOpen(false)} className="text-dark/40 hover:text-dark">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCommercialAction} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-dark/60 uppercase tracking-wider mb-1">
                    {language === 'EN' ? 'Action / Conversation Details (Free-text)' : 'Actie / Gespreksnotities (Vrije tekst)'}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newCommercialNote}
                    onChange={(e) => setNewCommercialNote(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs font-body text-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder={language === 'EN' ? 'e.g. Called customer regarding quote Q-4001, agreed to schedule site intake next Tuesday...' : 'b.v. Klant gebeld over offerte Q-4001, afgesproken om volgende week dinsdag in te meten...'}
                  />
                </div>

                {/* Related Task Creation Options */}
                <div className="p-3.5 bg-white rounded-xl border border-[#D6CFC2] space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-primary">
                      <input 
                        type="checkbox" 
                        checked={commercialTaskForm.createTask} 
                        onChange={(e) => setCommercialTaskForm(prev => ({ ...prev, createTask: e.target.checked }))}
                        className="w-4 h-4 text-primary rounded border-[#D6CFC2] focus:ring-primary" 
                      />
                      <span>📌 {language === 'EN' ? 'Create Related Task in Task Board' : 'Koppel Gerelateerde Taak in Takenlijst'}</span>
                    </label>
                  </div>

                  {commercialTaskForm.createTask && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#D6CFC2]/50 text-xs">
                      <div>
                        <label className="block font-bold text-dark/60 uppercase text-[10px] mb-1">
                          👤 {language === 'EN' ? 'Assign To (Bram / Tim)' : 'Toewijzen Aan (Bram / Tim)'}
                        </label>
                        <select 
                          value={commercialTaskForm.assignee} 
                          onChange={(e) => setCommercialTaskForm(prev => ({ ...prev, assignee: e.target.value }))}
                          className="w-full px-2.5 py-1.5 bg-[#EDE8DF]/60 border border-[#D6CFC2] rounded-lg font-bold text-dark text-xs focus:outline-none"
                        >
                          <option value="Bram">👤 Bram</option>
                          <option value="Tim">👤 Tim</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-dark/60 uppercase text-[10px] mb-1">
                          📅 {language === 'EN' ? 'Due Date' : 'Vervaldatum (Due Date)'}
                        </label>
                        <input 
                          type="date" 
                          value={commercialTaskForm.dueDate} 
                          onChange={(e) => setCommercialTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                          className="w-full px-2.5 py-1.5 bg-[#EDE8DF]/60 border border-[#D6CFC2] rounded-lg font-bold text-dark text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#D6CFC2]">
                  <Button type="button" variant="outline" onClick={() => setCommercialModalOpen(false)}>
                    {language === 'EN' ? 'Cancel' : 'Annuleren'}
                  </Button>
                  <Button type="submit" variant="primary">
                    {language === 'EN' ? 'Save Commercial Action & Task' : 'Commerciële Actie & Taak Opslaan'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CLAUDE AI DRAFT PROPOSAL GENERATION MODAL */}
      <AnimatePresence>
        {claudeProposalModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/70 backdrop-blur-xs">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#EDE8DF] border border-[#D6CFC2] rounded-2xl shadow-2xl p-6 w-full max-w-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-[#D6CFC2] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-700 to-indigo-800 text-white flex items-center justify-center shadow-xs">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-primary leading-tight">
                      🤖 Claude AI Draft Proposal Engine
                    </h3>
                    <p className="text-[11px] text-dark/60 font-mono">
                      Vanuit Ambacht Brand Tone • Auto-Generated from Voice Call
                    </p>
                  </div>
                </div>
                <button onClick={() => setClaudeProposalModalOpen(false)} className="text-dark/40 hover:text-dark">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isGeneratingProposal ? (
                <div className="py-12 text-center space-y-3">
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    className="w-10 h-10 border-3 border-purple-700 border-t-transparent rounded-full mx-auto"
                  />
                  <p className="text-sm font-bold text-primary">
                    {language === 'EN' ? 'Claude AI is analyzing voice transcript & generating proposal in Vanuit Ambacht brand tone...' : 'Claude AI analyseert audio-transcript & genereert concept offerte in Vanuit Ambacht stijl...'}
                  </p>
                </div>
              ) : generatedProposal ? (
                <div className="space-y-4 text-xs font-body text-dark">
                  <div className="p-4 bg-white rounded-xl border border-[#D6CFC2] space-y-3 shadow-2xs">
                    <div className="flex justify-between items-center border-b border-[#D6CFC2]/50 pb-2">
                      <span className="font-mono text-xs font-bold text-primary">{generatedProposal.quoteId}</span>
                      <span className="text-[10px] bg-purple-100 text-purple-900 px-2 py-0.5 rounded-md font-bold uppercase">
                        Claude AI Draft
                      </span>
                    </div>

                    <div className="p-3 bg-[#F8F7F4] rounded-lg border border-[#D6CFC2]/60 whitespace-pre-line text-dark/85 text-[11px] italic leading-relaxed">
                      "{generatedProposal.introText}"
                    </div>

                    <div className="space-y-2">
                      <span className="font-bold text-xs text-primary uppercase tracking-wider block">Proposed Itemized Pricing</span>
                      <div className="space-y-1.5 border border-[#D6CFC2]/60 rounded-lg p-2.5 bg-white">
                        {generatedProposal.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-[#D6CFC2]/30 last:border-0">
                            <span className="text-dark/80">{item.desc}</span>
                            <span className="font-bold text-dark">{item.price}</span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center text-sm font-bold text-primary pt-2 border-t border-[#D6CFC2]">
                          <span>{language === 'EN' ? 'Total (Incl. VAT)' : 'Totaalbedrag (Incl. BTW)'}</span>
                          <span className="text-base text-primary font-heading">{generatedProposal.totalAmount}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-primary/5 rounded-lg border border-primary/20 text-center text-[10px] font-semibold text-primary">
                      {generatedProposal.brandNote}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-[#D6CFC2]">
                    <Button type="button" variant="outline" onClick={() => setClaudeProposalModalOpen(false)}>
                      {language === 'EN' ? 'Close Preview' : 'Sluiten'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="primary" 
                      icon={FileText} 
                      onClick={handleExportProposalToQuote}
                      className="bg-primary text-cream hover:bg-primary/90 font-bold shadow-md"
                    >
                      ✨ {language === 'EN' ? `Convert to Official Quote (${generatedProposal.quoteId})` : `Omzetten naar Officiële Offerte (${generatedProposal.quoteId})`}
                    </Button>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AUTO-PREFILLED MODALS */}
      <AnimatePresence>
        {autoModalType === 'quote' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/70 backdrop-blur-xs">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#EDE8DF] border border-[#D6CFC2] rounded-2xl shadow-2xl p-6 w-full max-w-3xl space-y-5 max-h-[92vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-[#D6CFC2] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary text-cream flex items-center justify-center shadow-xs">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-primary leading-tight">
                      📑 Direct Multi-Item Quotation Generator
                    </h3>
                    <p className="text-[11px] text-dark/60 font-mono">
                      Lead Card Step 4 • Official Quotation Builder (#OF-2026-002)
                    </p>
                  </div>
                </div>
                <button onClick={() => setAutoModalType(null)} className="text-dark/40 hover:text-dark">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAutoQuote} className="space-y-4 text-xs font-body text-dark">
                {/* Client Metadata Header Card */}
                <div className="p-4 bg-white rounded-xl border border-[#D6CFC2] space-y-3 shadow-2xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-dark/50 uppercase mb-1">Customer Name</label>
                      <input type="text" readOnly value={quoteForm.customer} className="w-full px-3 py-2 bg-[#EDE8DF]/60 border border-[#D6CFC2] rounded-lg font-bold text-dark" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-dark/50 uppercase mb-1">Email Address</label>
                      <input type="text" readOnly value={quoteForm.email} className="w-full px-3 py-2 bg-[#EDE8DF]/60 border border-[#D6CFC2] rounded-lg text-dark/70" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-dark/50 uppercase mb-1">Phone Number</label>
                      <input type="text" readOnly value={quoteForm.phone} className="w-full px-3 py-2 bg-[#EDE8DF]/60 border border-[#D6CFC2] rounded-lg text-dark/70" />
                    </div>
                  </div>
                </div>

                {/* Pre-saved Product Library Dropdown */}
                <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>+ Product Bibliotheek (Pre-saved Library)</span>
                  </div>
                  <select 
                    onChange={(e) => {
                      if (!e.target.value) return;
                      const selected = PRESET_PRODUCTS.find(p => p.desc === e.target.value);
                      if (selected) {
                        setQuoteLineItems(prev => [
                          ...prev,
                          { id: Date.now(), desc: selected.desc, qty: 1, unitPrice: selected.unitPrice }
                        ]);
                        showToast(`Inserted: ${selected.desc}`);
                      }
                      e.target.value = '';
                    }}
                    className="w-full sm:w-auto px-3 py-1.5 bg-white border border-[#D6CFC2] rounded-lg text-xs font-body text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 font-semibold"
                  >
                    <option value="">-- Select Product from Catalog --</option>
                    {PRESET_PRODUCTS.map((prod, idx) => (
                      <option key={idx} value={prod.desc}>{prod.desc} (€{prod.unitPrice})</option>
                    ))}
                  </select>
                </div>

                {/* Line Items Table */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-primary uppercase tracking-wider">Itemized Line Items</span>
                    <button 
                      type="button"
                      onClick={() => setQuoteLineItems(prev => [...prev, { id: Date.now(), desc: 'Custom Craftsman Item', qty: 1, unitPrice: 500 }])}
                      className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      + Add Line Item
                    </button>
                  </div>

                  <div className="border border-[#D6CFC2] rounded-xl overflow-hidden bg-white shadow-2xs">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-[#EDE8DF] text-dark/70 text-[10px] font-bold uppercase border-b border-[#D6CFC2]">
                        <tr>
                          <th className="p-2.5">Omschrijving</th>
                          <th className="p-2.5 w-16 text-center">Aantal</th>
                          <th className="p-2.5 w-28 text-right">Prijs p.st (€)</th>
                          <th className="p-2.5 w-28 text-right">Totaal (€)</th>
                          <th className="p-2.5 w-10 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D6CFC2]/40 text-xs">
                        {quoteLineItems.map((item) => (
                          <tr key={item.id}>
                            <td className="p-2">
                              <input 
                                type="text" 
                                value={item.desc}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setQuoteLineItems(prev => prev.map(i => i.id === item.id ? { ...i, desc: val } : i));
                                }}
                                className="w-full px-2 py-1 bg-white border border-[#D6CFC2]/60 rounded focus:outline-none focus:ring-1 focus:ring-primary/30"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <input 
                                type="number" 
                                value={item.qty}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 1;
                                  setQuoteLineItems(prev => prev.map(i => i.id === item.id ? { ...i, qty: val } : i));
                                }}
                                className="w-12 text-center py-1 bg-white border border-[#D6CFC2]/60 rounded font-semibold"
                              />
                            </td>
                            <td className="p-2 text-right">
                              <input 
                                type="number" 
                                value={item.unitPrice}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  setQuoteLineItems(prev => prev.map(i => i.id === item.id ? { ...i, unitPrice: val } : i));
                                }}
                                className="w-24 text-right py-1 bg-white border border-[#D6CFC2]/60 rounded font-semibold text-dark"
                              />
                            </td>
                            <td className="p-2 text-right font-bold text-dark">
                              € {(item.qty * item.unitPrice).toLocaleString()}
                            </td>
                            <td className="p-2 text-center">
                              <button 
                                type="button"
                                onClick={() => setQuoteLineItems(prev => prev.filter(i => i.id !== item.id))}
                                className="text-red-500 hover:text-red-700 font-bold text-xs"
                              >
                                ×
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Totals Summary Footer */}
                    <div className="p-3 bg-[#EDE8DF]/80 border-t border-[#D6CFC2] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <span className="text-[11px] font-semibold text-dark/70">
                        Total Items: {quoteLineItems.length} | Inclusief 21% BTW & Ambachtelijke Garantie
                      </span>
                      <div className="text-right">
                        <span className="text-[10px] text-dark/50 font-bold uppercase block">Quotation Total (Incl. VAT)</span>
                        <span className="text-lg font-heading font-bold text-primary">
                          € {quoteLineItems.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#D6CFC2]">
                  <button
                    type="button"
                    onClick={() => setAutoModalType(null)}
                    className="px-4 py-2 bg-transparent hover:bg-white/60 text-dark border border-[#D6CFC2] font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#3E4E36] hover:bg-[#2F3C29] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate & Save Official Quotation →</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {autoModalType === 'project' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-xs">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#EDE8DF] border border-[#D6CFC2] rounded-2xl shadow-card p-6 w-full max-w-lg space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-heading font-bold text-primary mt-1">Auto-Create Active Project</h3>
                </div>
                <button onClick={() => setAutoModalType(null)} className="text-dark/40 hover:text-dark"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSaveAutoProject} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-dark/70 mb-1">Project Name</label>
                  <input type="text" readOnly value={projectForm.projectName} className="w-full px-3 py-2 bg-white/80 border border-[#D6CFC2] rounded-lg font-semibold text-dark" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-dark/70 mb-1">Customer</label>
                    <input type="text" readOnly value={projectForm.customer} className="w-full px-3 py-2 bg-white/80 border border-[#D6CFC2] rounded-lg text-dark/70" />
                  </div>
                  <div>
                    <label className="block font-semibold text-dark/70 mb-1">Target Delivery Date</label>
                    <input type="date" value={projectForm.deadline} onChange={e => setProjectForm(prev => ({ ...prev, deadline: e.target.value }))} className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg font-semibold text-dark" />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#D6CFC2]">
                  <Button type="button" variant="outline" onClick={() => setAutoModalType(null)}>Cancel</Button>
                  <Button type="submit" icon={Briefcase}>Save & Create Active Project →</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {autoModalType === 'partner' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-xs">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#EDE8DF] border border-[#D6CFC2] rounded-2xl shadow-card p-6 w-full max-w-lg space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-heading font-bold text-primary mt-1">Assign Craftsman Partner</h3>
                </div>
                <button onClick={() => setAutoModalType(null)} className="text-dark/40 hover:text-dark"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSaveAutoPartner} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-dark/70 mb-1">Select Craftsman Partner</label>
                  <select value={partnerForm.partnerName} onChange={e => setPartnerForm(prev => ({ ...prev, partnerName: e.target.value }))} className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg font-semibold text-dark">
                    <option value="Sven Hoek">Sven Hoek (Hoek Bouw) — 2 Active Projects</option>
                    <option value="Lars Jansen">Lars Jansen (Jansen Houtwerk) — 1 Active Project</option>
                    <option value="Theo Mulder">Theo Mulder (Mulder Tuinen) — 3 Active Projects</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-dark/70 mb-1">Agreed Build Price (€)</label>
                    <input type="number" value={partnerForm.buildPrice} onChange={e => setPartnerForm(prev => ({ ...prev, buildPrice: e.target.value }))} className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg font-bold text-primary" />
                  </div>
                  <div>
                    <label className="block font-semibold text-dark/70 mb-1">Target Delivery Week</label>
                    <input type="text" value={partnerForm.deliveryWeek} onChange={e => setPartnerForm(prev => ({ ...prev, deliveryWeek: e.target.value }))} className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-dark" />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#D6CFC2]">
                  <Button type="button" variant="outline" onClick={() => setAutoModalType(null)}>Cancel</Button>
                  <Button type="submit" icon={UserCheck}>Confirm Partner Work Order →</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {autoModalType === 'invoice' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-xs">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#EDE8DF] border border-[#D6CFC2] rounded-2xl shadow-2xl p-6 w-full max-w-lg space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-heading font-serif font-bold text-[#3E4E36] mt-1">Auto-Generate Final Invoice</h3>
                </div>
                <button onClick={() => setAutoModalType(null)} className="text-dark/40 hover:text-dark cursor-pointer"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSaveAutoInvoice} className="space-y-4 text-xs font-body">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">Invoice #</label>
                    <input type="text" readOnly value={invoiceForm.invoiceNumber || 'INV-1369'} className="w-full px-3.5 py-2.5 bg-white border border-[#D6CFC2] rounded-xl font-mono font-bold text-dark text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">Customer</label>
                    <input type="text" readOnly value={customerName || 'Mark Davis'} className="w-full px-3.5 py-2.5 bg-white border border-[#D6CFC2] rounded-xl font-semibold text-dark text-xs" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">Total Paid Amount (€)</label>
                  <input type="text" value={invoiceForm.amount || '12500'} onChange={e => setInvoiceForm(prev => ({ ...prev, amount: e.target.value }))} className="w-full px-3.5 py-2.5 bg-white border border-[#D6CFC2] rounded-xl font-mono font-bold text-[#15803D] text-base" />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-[#D6CFC2]/60">
                  <button type="button" onClick={() => setAutoModalType(null)} className="px-4 py-2 bg-transparent hover:bg-white/60 text-dark border border-[#D6CFC2] font-bold text-xs rounded-xl cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2.5 bg-[#3E4E36] hover:bg-[#2F3C29] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Generate & Store Invoice →</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* 6-PAGE BRANDED PDF PROPOSAL VIEWER MODAL */}
        {quoteViewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/70 backdrop-blur-xs">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#EDE8DF] border border-[#D6CFC2] rounded-2xl shadow-2xl p-6 w-full max-w-3xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-[#D6CFC2] pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-heading font-bold text-lg text-primary leading-tight">
                      📄 Gekoppelde Offerte #Q-4001
                    </h3>
                    <p className="text-[11px] text-dark/60 font-mono">
                      Vanuit Ambacht Official PDF Quotation Proposal • Client: {customerName}
                    </p>
                  </div>
                </div>
                <button onClick={() => setQuoteViewModalOpen(false)} className="text-dark/40 hover:text-dark">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Pixel-Perfect 6-Page Proposal Summary */}
              <div className="bg-[#FDFBF7] p-6 rounded-xl border border-[#C4BEB3] shadow-inner space-y-4 text-[#4A4A43]">
                {/* Green Status Toast Banner (Screenshot 3 Match) */}
                <div className="p-3 bg-[#15803D] text-white rounded-xl font-bold text-xs flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-200 flex-shrink-0" />
                    <span>Quotation Q-4294 sent to {customerName} via Email & delivered to Customer Portal!</span>
                  </div>
                </div>

                {/* Header Banner */}
                <div className="bg-[#3E4E36] text-[#FDFBF7] p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#70624F] bg-[#EDE8DF] px-2 py-0.5 rounded">OFFERTE PROPOSAL</span>
                    <h4 className="text-lg font-heading font-bold mt-1 text-white">Uw buitenkeuken, op maat gemaakt</h4>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <p className="font-bold text-cream">#Q-4001</p>
                    <p className="text-white/70">Datum: 04-08-2026</p>
                  </div>
                </div>

                {/* Cover Letter */}
                <div className="p-4 bg-white rounded-lg border border-[#D6CFC2]/60 space-y-2 text-xs leading-relaxed">
                  <p className="font-semibold text-dark">Beste {customerName},</p>
                  <p className="text-dark/80">
                    Hartelijk dank voor uw aanvraag bij Vanuit Ambacht. Wij hebben met genoegen deze maatofferte voor uw {translateCategory(customerCategory)} opgesteld. Onze vakmensen garanderen duurzame topkwaliteit met oog voor elk detail.
                  </p>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-[#EDE8DF]/60 rounded-lg border border-[#D6CFC2]/40">
                    <span className="text-[10px] text-dark/50 uppercase font-bold block">Afmeting</span>
                    <span className="font-semibold text-dark">350 x 80 x 95 cm</span>
                  </div>
                  <div className="p-3 bg-[#EDE8DF]/60 rounded-lg border border-[#D6CFC2]/40">
                    <span className="text-[10px] text-dark/50 uppercase font-bold block">Houtsoort</span>
                    <span className="font-semibold text-dark">Thermo Fraké Hout</span>
                  </div>
                  <div className="p-3 bg-[#EDE8DF]/60 rounded-lg border border-[#D6CFC2]/40">
                    <span className="text-[10px] text-dark/50 uppercase font-bold block">Aanrechtblad</span>
                    <span className="font-semibold text-dark">Beton Cire Zwart</span>
                  </div>
                  <div className="p-3 bg-[#EDE8DF]/60 rounded-lg border border-[#D6CFC2]/40">
                    <span className="text-[10px] text-dark/50 uppercase font-bold block">Levertijd</span>
                    <span className="font-semibold text-primary font-mono">Week 49 (2026)</span>
                  </div>
                </div>

                {/* Pricing Table */}
                <div className="space-y-2">
                  <h5 className="font-bold text-xs text-primary uppercase tracking-wider">Investeringsingoverzicht (Pricing Breakdown)</h5>
                  <div className="border border-[#D6CFC2] rounded-lg overflow-hidden bg-white text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-[#3E4E36] text-[#FDFBF7] uppercase text-[10px]">
                        <tr>
                          <th className="p-2.5">Omschrijving Item</th>
                          <th className="p-2.5 text-right">Bedrag</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D6CFC2]/40">
                        <tr><td className="p-2.5">Maatwerk Buitenkeuken Frame (Thermo Fraké Hout)</td><td className="p-2.5 text-right font-semibold">€ 8,500.00</td></tr>
                        <tr><td className="p-2.5">Gepolijst Beton Cire Aanrechtblad (8cm Zwart)</td><td className="p-2.5 text-right font-semibold">€ 2,800.00</td></tr>
                        <tr><td className="p-2.5">Inbouw Kamado Big Green Egg Cutout & RVS Kraan</td><td className="p-2.5 text-right font-semibold">€ 1,200.00</td></tr>
                      </tbody>
                    </table>
                    <div className="p-3 bg-[#EDE8DF]/80 border-t border-[#D6CFC2] flex justify-between items-center font-bold text-primary text-sm">
                      <span>Totaalbedrag (Incl. 21% BTW)</span>
                      <span className="text-base font-heading">€ 12,500.00</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#D6CFC2]">
                <button
                  type="button"
                  onClick={() => setQuoteViewModalOpen(false)}
                  className="px-4 py-2 bg-transparent hover:bg-white/60 text-dark border border-[#D6CFC2] font-bold text-xs rounded-xl cursor-pointer"
                >
                  Close Preview
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    showToast(`Downloading Official PDF Quote #Q-4001 for ${customerName}...`);
                    setQuoteViewModalOpen(false);
                  }}
                  className="px-5 py-2.5 bg-[#3E4E36] hover:bg-[#2F3C29] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-emerald-200" />
                  <span>Download PDF Proposal</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Step 5 Send Confirmation Dialog Modal */}
        {step5ConfirmModalOpen && (
          <div className="fixed inset-0 bg-dark/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-[#D6CFC2] space-y-4 font-body">
              <div className="flex justify-between items-center border-b border-[#D6CFC2] pb-3">
                <h3 className="font-heading font-bold text-primary text-base flex items-center gap-2">
                  <span>Confirm Quote Delivery ({step5SelectedChannel})</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setStep5ConfirmModalOpen(false)}
                  className="text-dark/40 hover:text-dark p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2]/70">
                  <span className="text-[10px] text-dark/50 uppercase font-bold block mb-0.5">Recipient</span>
                  <span className="font-bold text-dark">
                    {step5SelectedChannel === 'EMAIL' ? customerEmail : customerPhone} ({customerName})
                  </span>
                </div>

                <div className="p-3 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2]/70">
                  <span className="text-[10px] text-dark/50 uppercase font-bold block mb-0.5">Payload & Attachments</span>
                  <span className="font-bold text-primary block">
                    {step5SelectedChannel === 'EMAIL'
                      ? `Message + Approval Link + PDF Attachment (${quoteFileName})`
                      : 'Message + Approval Link (No PDF attachment on WhatsApp)'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-dark/50 uppercase font-bold block mb-1">Message Preview</span>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-dark/80 text-[11px] whitespace-pre-wrap leading-relaxed">
                    {step5EditableMsg}
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-bold flex items-center gap-2">
                  <span>⚠ Are you sure you want to send this official quotation to the customer?</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-[#D6CFC2]/60">
                <button
                  type="button"
                  onClick={() => setStep5ConfirmModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-dark/70 hover:text-dark border border-[#D6CFC2] rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteSendStep5}
                  className="px-5 py-2 text-xs font-bold bg-[#3E4E36] hover:bg-[#2F3C29] text-white rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Yes, Send Quotation</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 6 Route B Manual Approval Modal */}
        {step6ManualModalOpen && (
          <div className="fixed inset-0 bg-dark/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-[#D6CFC2] space-y-4 font-body">
              <div className="flex justify-between items-center border-b border-[#D6CFC2] pb-3">
                <h3 className="font-heading font-bold text-primary text-base flex items-center gap-2">
                  <span>Record Approval Manually (Route B)</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setStep6ManualModalOpen(false)}
                  className="text-dark/40 hover:text-dark p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRouteBManualApproval} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-dark/70 uppercase text-[10px] mb-1">Approval Date *</label>
                    <input
                      type="date"
                      required
                      value={step6ManualForm.date}
                      onChange={(e) => setStep6ManualForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-xl font-bold text-dark text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-dark/70 uppercase text-[10px] mb-1">Approval Channel *</label>
                    <select
                      value={step6ManualForm.channel}
                      onChange={(e) => setStep6ManualForm(prev => ({ ...prev, channel: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-xl font-bold text-dark text-xs"
                    >
                      <option value="Phone">Phone Call</option>
                      <option value="WhatsApp">WhatsApp Message</option>
                      <option value="E-mail">E-mail Confirmation</option>
                      <option value="In person">In Person / Face-to-Face</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-dark/70 uppercase text-[10px] mb-1">Recorded By (Admin Name) *</label>
                  <input
                    type="text"
                    required
                    value={step6ManualForm.recordedBy}
                    onChange={(e) => setStep6ManualForm(prev => ({ ...prev, recordedBy: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-xl font-semibold text-dark text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-dark/70 uppercase text-[10px] mb-1">Approval Notes / Summary</label>
                  <textarea
                    value={step6ManualForm.notes}
                    onChange={(e) => setStep6ManualForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-xl font-medium text-dark text-xs min-h-[60px] resize-none"
                    placeholder="e.g., Customer confirmed agreement over telephone call..."
                  />
                </div>

                <div>
                  <label className="block font-bold text-dark/70 uppercase text-[10px] mb-1">Upload Screenshot or Email Evidence (Optional)</label>
                  <input
                    type="file"
                    accept="image/*,.pdf,.eml,.msg"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setStep6ManualForm(prev => ({ ...prev, evidenceFile: e.target.files[0] }));
                      }
                    }}
                    className="w-full px-3 py-1.5 bg-[#F8F7F4] border border-[#D6CFC2] rounded-xl text-xs font-medium text-dark/70 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#3E4E36] file:text-white"
                  />
                  {step6ManualForm.evidenceFile && (
                    <span className="text-[10px] text-emerald-700 font-bold block mt-1">✓ File attached: {step6ManualForm.evidenceFile.name}</span>
                  )}
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] font-semibold">
                  ⚡ Saving will update status to Accepted ("recorded manually by {step6ManualForm.recordedBy || 'Bram'}") and automatically create Project Step 7.
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-[#D6CFC2]">
                  <button
                    type="button"
                    onClick={() => setStep6ManualModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-dark/70 hover:text-dark border border-[#D6CFC2] rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold bg-[#3E4E36] hover:bg-[#2F3C29] text-white rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Save & Confirm Manual Approval</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
