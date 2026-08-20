import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { Building2, Upload, Palette, Bell, Save, CheckCircle, Users, Plus, Trash2, Edit2, Shield, Sliders, Hash, Percent, X, UserPlus, ToggleLeft, ToggleRight, FileText, MessageSquare, Layers, Wrench, FileCode, FolderPlus, DollarSign, TrendingUp, PieChart, Eye, EyeOff, Lock, Key } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Settings() {
  const { t, language } = useLanguage();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('Company'); // 'Company' | 'Users' | 'FieldSet' | 'Templates'
  const [toastMsg, setToastMsg] = useState('');

  const getDisplayValue = (key, val) => {
    if (language !== 'EN') return val;
    if (key === 'name' && val === 'Vanuit Ambacht') return 'Craftsmanship Co.';
    if (key === 'address' && val === 'Herengracht 1, Amsterdam') return '123 Main St, London';
    if (key === 'kvk' && val === 'KVK-88741029') return 'REG-88741029';
    if (key === 'vatNumber' && val === 'NL88741029B01') return 'UK88741029B01';
    return val;
  };

  // -------------------------------------------------------------
  // 4. AUTO-MESSAGE TEMPLATES STATE (SECTION 2.3)
  // -------------------------------------------------------------
  const [messageTemplates, setMessageTemplates] = useState(() => {
    const saved = localStorage.getItem('app_auto_templates_v1');
    return saved ? JSON.parse(saved) : {
      template1: "Dear {client_name}, thank you for reaching out to Vanuit Ambacht regarding your {product_category} inquiry. We would love to discuss your requirements in detail. When would it suit you to talk? Kind regards, Tim & Bram - Vanuit Ambacht",
      template2: "Dear {client_name}, we wanted to follow up regarding your {product_category} inquiry. Please let us know if you have any questions or when you would be available for a brief phone call. Kind regards, Tim & Bram - Vanuit Ambacht",
    };
  });
  const [addTemplateModalOpen, setAddTemplateModalOpen] = useState(false);
  const [templateForm, setTemplateForm] = useState({ title: '', text: '' });

  const handleAddTemplateSubmit = (e) => {
    e.preventDefault();
    if (!templateForm.text.trim()) return showToast('Vul een berichtsjabloon in.');
    const key = `template_${Date.now()}`;
    const updated = { ...messageTemplates, [key]: templateForm.text.trim() };
    setMessageTemplates(updated);
    localStorage.setItem('app_auto_templates_v1', JSON.stringify(updated));
    showToast(language === 'EN' ? 'New message template added!' : 'Nieuw berichtsjabloon toegevoegd!');
    setTemplateForm({ title: '', text: '' });
    setAddTemplateModalOpen(false);
  };

  // -------------------------------------------------------------
  // 1. COMPANY DETAILS & NUMBERING STATE
  // -------------------------------------------------------------
  const [logo, setLogo] = useState(() => localStorage.getItem('brand_logo') || null);

  const [companyInfo, setCompanyInfo] = useState(() => {
    const saved = localStorage.getItem('company_info');
    return saved ? JSON.parse(saved) : {
      name: 'Vanuit Ambacht',
      website: 'www.vanuitambacht.nl',
      email: 'info@vanuitambacht.nl',
      phone: '+31 6 12345678',
      address: 'Herengracht 1, Amsterdam',
      country: 'Netherlands',
      kvk: 'KVK-88741029',
      vatNumber: 'NL88741029B01',
      standardVatRate: '21',
      lowVatRate: '9',
      quotePrefix: '#Q-2004',
      invoicePrefix: '#INV-902'
    };
  });

  const [colors, setColors] = useState({
    primary: '#3E4E36',
    accent: '#70624F',
    background: '#D6CFC2',
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notification_settings');
    return saved ? JSON.parse(saved) : [
      { id: 'lead', label: 'Nieuwe lead ontvangen', desc: 'Ontvang een melding bij een nieuwe binnengekomen aanvraag', enabled: true },
      { id: 'quote', label: 'Offerte geaccepteerd', desc: 'Ontvang een melding wanneer een klant de offerte accepteert', enabled: true },
      { id: 'project', label: 'Project status gewijzigd', desc: 'Melding bij voortgangs-updates van projecten', enabled: true },
      { id: 'payment', label: 'Betaling ontvangen', desc: 'Melding wanneer een factuur als betaald wordt gemarkeerd', enabled: true },
    ];
  });

  // -------------------------------------------------------------
  // 2. USER MANAGEMENT STATE (PRD 4.12)
  // -------------------------------------------------------------
  const [usersList, setUsersList] = useState(() => {
    const saved = localStorage.getItem('app_system_users');
    return saved ? JSON.parse(saved) : [
      { id: 'USR-001', name: 'Admin User', email: 'admin@vanuitambacht.nl', role: 'admin', status: 'Actief', joinedDate: '2025-01-10' },
      { id: 'USR-002', name: 'Sven Hoek', email: 'sven@hoekbouw.nl', role: 'partner', status: 'Actief', joinedDate: '2025-03-15' },
      { id: 'USR-003', name: 'Lars Jansen', email: 'lars@jansen.nl', role: 'partner', status: 'Actief', joinedDate: '2025-04-20' },
      { id: 'USR-004', name: 'Jan de Vries', email: 'jan@devries.nl', role: 'customer', status: 'Actief', joinedDate: '2026-02-12' },
      { id: 'USR-005', name: 'Sanne Visser', email: 'sanne@visser.nl', role: 'customer', status: 'Inactief', joinedDate: '2026-05-01' },
    ];
  });

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [showPasswordInModal, setShowPasswordInModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    role: 'customer',
    password: ''
  });

  // -------------------------------------------------------------
  // 3. FIELD-SET CONFIGURATION STATE (PRD 4.12)
  // -------------------------------------------------------------
  const [selectedProductType, setSelectedProductType] = useState('buitenkeuken'); // 'buitenkeuken' | 'buitenverblijf' | 'overkapping' | 'poolhouse'
  
  const [fieldSets, setFieldSets] = useState(() => {
    const saved = localStorage.getItem('app_fieldset_config');
    return saved ? JSON.parse(saved) : {
      buitenkeuken: [
        { id: 'f-001', label: 'Werkblad Type & Afwerking', type: 'select', options: ['Gepolijst Beton Cire (8cm Zwart)', 'Graniet Zwart Mat', 'RVS Werkblad', 'Massief Teak Hout'], required: true },
        { id: 'f-002', label: 'Houtsoort Onderstel', type: 'select', options: ['Thermo Fraké Hout (Recommended)', 'Massief Teakhout', 'Eikenhout', 'Zwart Gepoedercoat Staal'], required: true },
        { id: 'f-003', label: 'Inbouw Kamado Cutout', type: 'select', options: ['Big Green Egg Large', 'Kamado Joe Classic III', 'Bastard Large', 'Geen Kamado Cutout'], required: true },
        { id: 'f-004', label: 'Inbouw RVS Spoelbak & Kraan', type: 'select', options: ['Zwarte Mengkraan + RVS Spoelbak', 'Koperen Kraan + Keramische Bak', 'Geen spoelbak'], required: false }
      ],
      buitenverblijf: [
        { id: 'f-101', label: 'Isolatie Type (Dak & Wand)', type: 'select', options: ['PIR 80mm', 'Steenwol 100mm', 'Geen isolatie'], required: true },
        { id: 'f-102', label: 'Glaswand Optie', type: 'select', options: ['Glazen schuifwanden (5-rail)', 'Vaste glazen wanden', 'Geen glas'], required: true },
        { id: 'f-103', label: 'Houtsoort Frame', type: 'select', options: ['Massief Teakhout', 'Douglas Hout', 'Eikenhout'], required: true },
        { id: 'f-104', label: 'Elektra & Verlichting Pakket', type: 'select', options: ['Inbouw LED spots + 4 stopcontacten', 'Standaard elektra', 'Geen'], required: false }
      ],
      overkapping: [
        { id: 'f-201', label: 'Lamellendak Besturing', type: 'select', options: ['Elektrisch Somfy motor', 'Handmatig zwengel', 'Vast dak'], required: true },
        { id: 'f-202', label: 'Sneeuwbelasting Klasse', type: 'select', options: ['Klasse A (High 120kg/m²)', 'Klasse B (Standard)'], required: true },
        { id: 'f-203', label: 'Geïntegreerde Regenafvoer', type: 'select', options: ['Verborgen in staander', 'Zichtbare zinken pijp'], required: true }
      ],
      poolhouse: [
        { id: 'f-301', label: 'Techniekruimte Zwembad', type: 'select', options: ['Geïsoleerd pomphuis vak', 'Geen techniekruimte'], required: true },
        { id: 'f-302', label: 'Sauna Module Integratie', type: 'select', options: ['Infrarood cabine', 'Traditionele Fins sauna', 'Geen sauna'], required: false },
        { id: 'f-303', label: 'Buitendouche Aansluiting', type: 'select', options: ['Warm & Koud water', 'Alleen koud water', 'Geen'], required: false }
      ]
    };
  });

  const [addFieldModalOpen, setAddFieldModalOpen] = useState(false);
  const [newFieldForm, setNewFieldForm] = useState({
    label: '',
    type: 'select',
    optionsStr: '',
    required: true
  });

  // -------------------------------------------------------------
  // 5. DYNAMIC CATEGORIES MANAGEMENT STATE
  // -------------------------------------------------------------
  const [dynamicCategories, setDynamicCategories] = useState(() => {
    const saved = localStorage.getItem('app_dynamic_categories');
    return saved ? JSON.parse(saved) : [
      { id: 'cat-1', name: 'Buitenkeukens', icon: '🔥', description: 'Maatwerk houten & beton buitenkeukens', status: 'Actief' },
      { id: 'cat-2', name: 'Kliko-ombouw', icon: '🗑️', description: 'Duurzame bergingen voor afvalcontainers', status: 'Actief' },
      { id: 'cat-3', name: 'Snijplanken', icon: '🪵', description: 'Luxe houten snijplanken & hakblokken', status: 'Actief' },
      { id: 'cat-4', name: 'Overkappingen', icon: '☂️', description: 'Eiken gebint & lamellen overkappingen', status: 'Actief' }
    ];
  });
  const [addCategoryModalOpen, setAddCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', icon: '🪵', description: '' });

  const handleAddCategorySubmit = (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return showToast('Vul een categorienaam in.');
    const newCat = {
      id: `cat-${Date.now()}`,
      name: categoryForm.name.trim(),
      icon: categoryForm.icon || '📦',
      description: categoryForm.description || 'Nieuwe product categorie',
      status: 'Actief'
    };
    const updated = [...dynamicCategories, newCat];
    setDynamicCategories(updated);
    localStorage.setItem('app_dynamic_categories', JSON.stringify(updated));
    window.dispatchEvent(new Event('app_data_changed'));
    showToast(`Nieuwe categorie "${newCat.name}" aangemaakt!`);
    setCategoryForm({ name: '', icon: '🪵', description: '' });
    setAddCategoryModalOpen(false);
  };

  const handleDeleteCategory = (catId) => {
    const updated = dynamicCategories.filter(c => c.id !== catId);
    setDynamicCategories(updated);
    localStorage.setItem('app_dynamic_categories', JSON.stringify(updated));
    window.dispatchEvent(new Event('app_data_changed'));
    showToast('Categorie verwijderd.');
  };

  // -------------------------------------------------------------
  // 6. PARTNER PRICE BREAKDOWN CONFIGURATION STATE (NESTED SECTIONS & FIELDS)
  // -------------------------------------------------------------
  const [partnerBreakdownConfig, setPartnerBreakdownConfig] = useState(() => {
    const saved = localStorage.getItem('app_partner_breakdown_sections_v2');
    return saved ? JSON.parse(saved) : [
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

  // -------------------------------------------------------------
  // 7. PROFIT & LOSS CONFIGURATION & TARGET MARGINS STATE
  // -------------------------------------------------------------
  const [plConfig, setPlConfig] = useState(() => {
    const saved = localStorage.getItem('app_pl_config_v1') || localStorage.getItem('app_pl_settings');
    return saved ? JSON.parse(saved) : {
      targetMargin: 30,
      warningMargin: 15,
      monthlyOverhead: 2500,
      categoryTargets: {
        'Outdoor Kitchens': 35,
        'Canopies': 30,
        'Bin Storage': 25,
        'Poolhouse': 40,
        'Terraces': 28
      }
    };
  });

  const savePlConfig = () => {
    localStorage.setItem('app_pl_config_v1', JSON.stringify(plConfig));
    localStorage.setItem('app_pl_settings', JSON.stringify(plConfig));
    window.dispatchEvent(new Event('app_data_changed'));
    showToast(language === 'EN' ? 'Profit & Loss target margins & overhead saved!' : 'Winst & Verlies doelstellingen & parameters opgeslagen!');
  };

  const [addSectionModalOpen, setAddSectionModalOpen] = useState(false);
  const [sectionForm, setSectionForm] = useState({ title: '', icon: '🪵' });
  const [addFieldToSectionModalOpen, setAddFieldToSectionModalOpen] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState(null);
  const [sectionFieldForm, setSectionFieldForm] = useState({ label: '', required: true });

  const handleAddSectionSubmit = (e) => {
    e.preventDefault();
    if (!sectionForm.title.trim()) return showToast('Vul een sectienaam in.');
    const newSec = {
      id: `sec-${Date.now()}`,
      title: sectionForm.title.trim(),
      icon: sectionForm.icon || '📦',
      fields: [
        { id: `f-${Date.now()}`, label: 'Standaard Koste (€)', required: true }
      ]
    };
    const updated = [...partnerBreakdownConfig, newSec];
    setPartnerBreakdownConfig(updated);
    localStorage.setItem('app_partner_breakdown_sections_v2', JSON.stringify(updated));
    localStorage.setItem('app_partner_breakdown_config', JSON.stringify(updated));
    window.dispatchEvent(new Event('app_data_changed'));
    showToast(`Nieuwe Prijsopbouw Sectie "${newSec.title}" toegevoegd!`);
    setSectionForm({ title: '', icon: '🪵' });
    setAddSectionModalOpen(false);
  };

  const handleAddFieldToSectionSubmit = (e) => {
    e.preventDefault();
    if (!sectionFieldForm.label.trim() || !targetSectionId) return showToast('Vul een veldnaam in.');
    const newField = {
      id: `f-${Date.now()}`,
      label: sectionFieldForm.label.trim(),
      required: sectionFieldForm.required
    };
    const updated = partnerBreakdownConfig.map(sec => {
      if (sec.id === targetSectionId) {
        return { ...sec, fields: [...(sec.fields || []), newField] };
      }
      return sec;
    });
    setPartnerBreakdownConfig(updated);
    localStorage.setItem('app_partner_breakdown_sections_v2', JSON.stringify(updated));
    localStorage.setItem('app_partner_breakdown_config', JSON.stringify(updated));
    window.dispatchEvent(new Event('app_data_changed'));
    showToast(`Nieuw veld "${newField.label}" toegevoegd aan sectie!`);
    setSectionFieldForm({ label: '', required: true });
    setAddFieldToSectionModalOpen(false);
    setTargetSectionId(null);
  };

  const handleDeleteSection = (secId) => {
    const updated = partnerBreakdownConfig.filter(s => s.id !== secId);
    setPartnerBreakdownConfig(updated);
    localStorage.setItem('app_partner_breakdown_sections_v2', JSON.stringify(updated));
    localStorage.setItem('app_partner_breakdown_config', JSON.stringify(updated));
    window.dispatchEvent(new Event('app_data_changed'));
    showToast('Sectie verwijderd.');
  };

  const handleDeleteFieldFromSection = (secId, fieldId) => {
    const updated = partnerBreakdownConfig.map(sec => {
      if (sec.id === secId) {
        return { ...sec, fields: sec.fields.filter(f => f.id !== fieldId) };
      }
      return sec;
    });
    setPartnerBreakdownConfig(updated);
    localStorage.setItem('app_partner_breakdown_sections_v2', JSON.stringify(updated));
    localStorage.setItem('app_partner_breakdown_config', JSON.stringify(updated));
    window.dispatchEvent(new Event('app_data_changed'));
    showToast('Veld uit sectie verwijderd.');
  };

  // Sync colors to CSS variables
  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', colors.primary);
    document.documentElement.style.setProperty('--accent-color', colors.accent);
    document.documentElement.style.setProperty('--background-color', colors.background);
  }, [colors]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Save Handlers
  const saveCompanyInfo = () => {
    localStorage.setItem('company_info', JSON.stringify(companyInfo));
    showToast('Bedrijfsgegevens & Nummering formats opgeslagen! (#Q-2004 / #INV-902)');
  };

  const saveBrandSettings = () => {
    localStorage.setItem('notification_settings', JSON.stringify(notifications));
    if (logo) localStorage.setItem('brand_logo', logo);
    else localStorage.removeItem('brand_logo');
    showToast('Merkinstellingen opgeslagen!');
  };

  const saveMessageTemplates = () => {
    localStorage.setItem('app_auto_templates_v1', JSON.stringify(messageTemplates));
    showToast(language === 'EN' ? 'Message templates saved successfully!' : 'Berichtsjablonen succesvol opgeslagen!');
  };

  const handleCompanyChange = (key, value) => {
    setCompanyInfo(prev => ({ ...prev, [key]: value }));
  };

  // User Management Handlers
  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) {
      showToast(language === 'EN' ? 'Please enter a valid name and email address.' : 'Vul een geldige naam en e-mailadres in.');
      return;
    }
    if (!inviteForm.password.trim()) {
      showToast(language === 'EN' ? 'Please specify a account password.' : 'Vul een wachtwoord in voor de gebruiker.');
      return;
    }
    const newUser = {
      id: `USR-${usersList.length + 101}`,
      name: inviteForm.name.trim(),
      email: inviteForm.email.trim().toLowerCase(),
      role: inviteForm.role,
      password: inviteForm.password.trim(),
      status: 'Actief',
      joinedDate: new Date().toISOString().split('T')[0]
    };
    const updated = [newUser, ...usersList];
    setUsersList(updated);
    localStorage.setItem('app_system_users', JSON.stringify(updated));
    window.dispatchEvent(new Event('app_data_changed'));
    showToast(language === 'EN' 
      ? `User "${newUser.name}" created successfully (Role: ${newUser.role.toUpperCase()})!` 
      : `Gebruiker "${newUser.name}" succesvol aangemaakt (Rol: ${newUser.role.toUpperCase()})!`);
    setInviteForm({ name: '', email: '', role: 'customer', password: '' });
    setInviteModalOpen(false);
  };

  const handleToggleUserStatus = (userId) => {
    const updated = usersList.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'Actief' ? 'Inactief' : 'Actief';
        showToast(`Gebruiker ${u.name} status gewijzigd naar ${nextStatus}.`);
        return { ...u, status: nextStatus };
      }
      return u;
    });
    setUsersList(updated);
    localStorage.setItem('app_system_users', JSON.stringify(updated));
  };

  const handleRoleChange = (userId, newRole) => {
    const updated = usersList.map(u => u.id === userId ? { ...u, role: newRole } : u);
    setUsersList(updated);
    localStorage.setItem('app_system_users', JSON.stringify(updated));
    showToast(`Rol gewijzigd naar ${newRole.toUpperCase()}`);
  };

  // Field-Set Configurator Handlers
  const handleAddFieldSubmit = (e) => {
    e.preventDefault();
    if (!newFieldForm.label.trim()) {
      showToast('Vul een veldnaam in.');
      return;
    }
    const optsArr = newFieldForm.optionsStr.split(',').map(s => s.trim()).filter(Boolean);
    const newField = {
      id: `f-${Date.now()}`,
      label: newFieldForm.label,
      type: newFieldForm.type,
      options: optsArr.length > 0 ? optsArr : ['Optie 1', 'Optie 2'],
      required: newFieldForm.required
    };

    const updatedSets = {
      ...fieldSets,
      [selectedProductType]: [...(fieldSets[selectedProductType] || []), newField]
    };

    setFieldSets(updatedSets);
    localStorage.setItem('app_fieldset_config', JSON.stringify(updatedSets));
    showToast(`Nieuw veld "${newFieldForm.label}" toegevoegd aan ${selectedProductType.toUpperCase()}!`);
    setAddFieldModalOpen(false);
  };

  const handleDeleteField = (fieldId) => {
    const updatedSets = {
      ...fieldSets,
      [selectedProductType]: fieldSets[selectedProductType].filter(f => f.id !== fieldId)
    };
    setFieldSets(updatedSets);
    localStorage.setItem('app_fieldset_config', JSON.stringify(updatedSets));
    showToast(`Formulierveld verwijderd.`);
  };

  return (
    <div className="space-y-6 relative font-body text-[#4A4A43]">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 80 }} className="fixed top-20 right-4 z-[9999] flex items-center gap-2 bg-primary text-cream px-4 py-3 rounded-xl shadow-lg border border-[#D6CFC2]/20 text-xs">
            <CheckCircle className="w-4 h-4 text-green-400" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h2 className="text-2xl font-heading font-bold text-primary">
          {language === 'EN' ? 'Platform Settings' : 'Platform Instellingen'}
        </h2>
        <p className="text-dark/60 text-sm">
          {language === 'EN' 
            ? 'Manage company details, VAT rates, numbering formats, user permissions, and dynamic product fields.' 
            : 'Beheer bedrijfsgegevens, btw-tarieven, nummeringsindelingen, gebruikersrechten en dynamische productvelden.'}
        </p>
      </div>

      {/* TOP TABS SWITCHER BAR (PRD 4.12) */}
      <div className="flex gap-2 border-b border-[#D6CFC2] pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('Company')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold font-body transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
            activeTab === 'Company' ? 'bg-primary text-cream shadow-sm' : 'bg-white/80 text-dark/70 hover:bg-[#EDE8DF]'
          }`}
        >
          <Building2 className="w-4 h-4 flex-shrink-0 text-primary" />
          <span>{language === 'EN' ? 'Company Details' : 'Bedrijfsgegevens & Nummering'}</span>
        </button>
        <button
          onClick={() => setActiveTab('Categories')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold font-body transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
            activeTab === 'Categories' ? 'bg-primary text-cream shadow-sm' : 'bg-white/80 text-dark/70 hover:bg-[#EDE8DF]'
          }`}
        >
          <Layers className="w-4 h-4 flex-shrink-0 text-primary" />
          <span>{language === 'EN' ? 'Categories Manager' : 'Product Categorieën'}</span>
        </button>
        <button
          onClick={() => setActiveTab('FieldSet')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold font-body transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
            activeTab === 'FieldSet' ? 'bg-primary text-cream shadow-sm' : 'bg-white/80 text-dark/70 hover:bg-[#EDE8DF]'
          }`}
        >
          <Sliders className="w-4 h-4 flex-shrink-0 text-primary" />
          <span>{language === 'EN' ? 'Product Fields Configurator' : 'Veldinstellingen Configuratie'}</span>
        </button>
        <button
          onClick={() => setActiveTab('PartnerBreakdown')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold font-body transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
            activeTab === 'PartnerBreakdown' ? 'bg-primary text-cream shadow-sm' : 'bg-white/80 text-dark/70 hover:bg-[#EDE8DF]'
          }`}
        >
          <Wrench className="w-4 h-4 flex-shrink-0 text-primary" />
          <span>{language === 'EN' ? 'Partner Cost Breakdown' : 'Partner Prijsopbouw'}</span>
        </button>
        <button
          onClick={() => setActiveTab('ProfitLossConfig')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold font-body transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
            activeTab === 'ProfitLossConfig' ? 'bg-primary text-cream shadow-sm' : 'bg-white/80 text-dark/70 hover:bg-[#EDE8DF]'
          }`}
        >
          <TrendingUp className="w-4 h-4 flex-shrink-0 text-primary" />
          <span>{language === 'EN' ? 'P&L Target Margins' : 'Winst & Verlies Marges'}</span>
        </button>
        <button
          onClick={() => setActiveTab('Users')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold font-body transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
            activeTab === 'Users' ? 'bg-primary text-cream shadow-sm' : 'bg-white/80 text-dark/70 hover:bg-[#EDE8DF]'
          }`}
        >
          <Users className="w-4 h-4 flex-shrink-0 text-primary" />
          <span>{language === 'EN' ? 'User Management' : 'Gebruikersbeheer'}</span>
        </button>
        <button
          onClick={() => setActiveTab('QuoteTemplate')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold font-body transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
            activeTab === 'QuoteTemplate' ? 'bg-primary text-cream shadow-sm' : 'bg-white/80 text-dark/70 hover:bg-[#EDE8DF]'
          }`}
        >
          <FileText className="w-4 h-4 flex-shrink-0 text-primary" />
          <span>{language === 'EN' ? 'Quote Template Fields' : 'Offerte Sjabloon Velden'}</span>
        </button>
        <button
          onClick={() => setActiveTab('Templates')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold font-body transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
            activeTab === 'Templates' ? 'bg-primary text-cream shadow-sm' : 'bg-white/80 text-dark/70 hover:bg-[#EDE8DF]'
          }`}
        >
          <MessageSquare className="w-4 h-4 flex-shrink-0 text-primary" />
          <span>{language === 'EN' ? 'Message Templates' : 'Berichtsjablonen'}</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: BEDRIJFSGEGEVENS, BTW & NUMMERING FORMATS (PRD 4.12) */}
      {/* ========================================================= */}
      {activeTab === 'Company' && (
        <div className="space-y-6">
          {/* Company Details & VAT Rates */}
          <Card title={language === 'EN' ? 'Company Details & VAT Rates' : 'Bedrijfsgegevens & BTW Tarieven'} icon={Building2}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-dark/60 mb-1 uppercase">{language === 'EN' ? 'Company Name' : 'Bedrijfsnaam'}</label>
                  <input type="text" value={getDisplayValue('name', companyInfo.name)} onChange={e => handleCompanyChange('name', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg font-bold text-primary" />
                </div>
                <div>
                  <label className="block font-semibold text-dark/60 mb-1 uppercase">{language === 'EN' ? 'Website URL' : 'Website URL'}</label>
                  <input type="text" value={companyInfo.website} onChange={e => handleCompanyChange('website', e.target.value)} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg" />
                </div>
                <div>
                  <label className="block font-semibold text-dark/60 mb-1 uppercase">{language === 'EN' ? 'Email Address' : 'E-mailadres'}</label>
                  <input type="email" value={companyInfo.email} onChange={e => handleCompanyChange('email', e.target.value)} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg" />
                </div>
                <div>
                  <label className="block font-semibold text-dark/60 mb-1 uppercase">{language === 'EN' ? 'Phone Number' : 'Telefoonnummer'}</label>
                  <input type="text" value={companyInfo.phone} onChange={e => handleCompanyChange('phone', e.target.value)} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg" />
                </div>
                <div>
                  <label className="block font-semibold text-dark/60 mb-1 uppercase">{language === 'EN' ? 'Address & City' : 'Adres & Woonplaats'}</label>
                  <input type="text" value={getDisplayValue('address', companyInfo.address)} onChange={e => handleCompanyChange('address', e.target.value)} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg" />
                </div>
                <div>
                  <label className="block font-semibold text-dark/60 mb-1 uppercase">{language === 'EN' ? 'CoC & VAT Number' : 'KVK & BTW Nummer'}</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input type="text" value={getDisplayValue('kvk', companyInfo.kvk)} onChange={e => handleCompanyChange('kvk', e.target.value)} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg font-mono font-bold text-primary text-sm" />
                    <input type="text" value={getDisplayValue('vatNumber', companyInfo.vatNumber)} onChange={e => handleCompanyChange('vatNumber', e.target.value)} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg font-mono font-bold text-primary text-sm" />
                  </div>
                </div>
              </div>

              {/* VAT Rates Configuration */}
              <div className="pt-4 border-t border-[#D6CFC2] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2]/60">
                  <label className="block font-bold text-primary mb-1 uppercase text-[10px] flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5" /> {language === 'EN' ? 'Standard VAT Rate (%)' : 'Standaard BTW Tarief (%)'}
                  </label>
                  <input type="number" value={companyInfo.standardVatRate} onChange={e => handleCompanyChange('standardVatRate', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg font-bold text-primary" />
                  <span className="text-[10px] text-dark/50 mt-1 block">
                    {language === 'EN' ? 'Standard 21% VAT rate for deliveries and assembly.' : 'Standaard 21% btw tarief voor leveringen en montage.'}
                  </span>
                </div>
                <div className="p-3 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2]/60">
                  <label className="block font-bold text-primary mb-1 uppercase text-[10px] flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5" /> {language === 'EN' ? 'Reduced VAT Rate (%)' : 'Verlaagd BTW Tarief (%)'}
                  </label>
                  <input type="number" value={companyInfo.lowVatRate} onChange={e => handleCompanyChange('lowVatRate', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg font-bold text-primary" />
                  <span className="text-[10px] text-dark/50 mt-1 block">
                    {language === 'EN' ? 'Reduced 9% VAT rate for specific services.' : 'Laag 9% btw tarief voor specifieke diensten.'}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Quote & Invoice Numbering Format Customizer (PRD 4.12) */}
          <Card title={language === 'EN' ? 'Quote & Invoice Numbering Formats (#Q-2004, #INV-902)' : 'Offerte & Factuur Nummering Formats (#Q-2004, #INV-902)'} icon={Hash}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-white rounded-xl border border-[#D6CFC2] space-y-2">
                <label className="block font-bold text-primary uppercase text-[10px] flex items-center gap-1">
                  <Hash className="w-4 h-4 text-accent" /> {language === 'EN' ? 'Quote Number Format (Quote Prefix)' : 'Offerte Nummer Formaat (Quote Prefix)'}
                </label>
                <input
                  type="text"
                  value={companyInfo.quotePrefix}
                  onChange={e => handleCompanyChange('quotePrefix', e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg font-mono font-bold text-primary text-sm"
                  placeholder="#Q-2004"
                />
                <p className="text-[10px] text-dark/60">{language === 'EN' ? 'Example on quote PDFs:' : 'Voorbeeld op offerte PDFs:'} <strong className="font-mono text-primary">{companyInfo.quotePrefix}-801</strong></p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-[#D6CFC2] space-y-2">
                <label className="block font-bold text-primary uppercase text-[10px] flex items-center gap-1">
                  <Hash className="w-4 h-4 text-accent" /> {language === 'EN' ? 'Invoice Number Format (Invoice Prefix)' : 'Factuur Nummer Formaat (Invoice Prefix)'}
                </label>
                <input
                  type="text"
                  value={companyInfo.invoicePrefix}
                  onChange={e => handleCompanyChange('invoicePrefix', e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg font-mono font-bold text-primary text-sm"
                  placeholder="#INV-902"
                />
                <p className="text-[10px] text-dark/60">{language === 'EN' ? 'Example on invoice PDFs:' : 'Voorbeeld op factuur PDFs:'} <strong className="font-mono text-primary">{companyInfo.invoicePrefix}-902</strong></p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[#D6CFC2]/60 mt-4">
              <Button icon={Save} onClick={saveCompanyInfo}>
                {language === 'EN' ? 'Save Company Info & Formats' : 'Bedrijfsgegevens & Formats Opslaan'}
              </Button>
            </div>
          </Card>

          {/* Brand Logo & Colors */}
          <Card title={language === 'EN' ? 'Brand Identity & Style' : 'Merkidentiteit & Huisstijl'} icon={Palette}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block font-semibold text-dark/60 mb-2 uppercase">{language === 'EN' ? 'Company Logo' : 'Bedrijfslogo'}</label>
                <div className="p-4 bg-[#F8F7F4] border-2 border-dashed border-[#D6CFC2] rounded-xl text-center cursor-pointer hover:bg-[#EDE8DF]/40 transition-colors" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="font-bold text-dark">{language === 'EN' ? 'Click to upload logo' : 'Klik om logo te uploaden'}</p>
                  <p className="text-[10px] text-dark/50 mt-1">{language === 'EN' ? 'PNG, SVG or JPG (max 2MB)' : 'PNG, SVG of JPG (max 2MB)'}</p>
                  <input type="file" ref={fileInputRef} onChange={e => { if(e.target.files[0]) { setLogo(URL.createObjectURL(e.target.files[0])); showToast('Logo geladen!'); } }} className="hidden" accept="image/*" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="block font-semibold text-dark/60 uppercase">{language === 'EN' ? 'Theme Colors' : 'Thema Kleuren'}</label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-[#F8F7F4] rounded-lg border text-center">
                    <span className="text-[10px] font-bold block mb-1">Primary</span>
                    <div className="w-full h-8 rounded bg-primary border"></div>
                  </div>
                  <div className="p-2 bg-[#F8F7F4] rounded-lg border text-center">
                    <span className="text-[10px] font-bold block mb-1">Accent</span>
                    <div className="w-full h-8 rounded bg-accent border"></div>
                  </div>
                  <div className="p-2 bg-[#F8F7F4] rounded-lg border text-center">
                    <span className="text-[10px] font-bold block mb-1">Warm Cream</span>
                    <div className="w-full h-8 rounded bg-[#EDE8DF] border"></div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* DYNAMIC CATEGORIES MANAGER TAB                            */}
      {/* ========================================================= */}
      {activeTab === 'Categories' && (
        <div className="space-y-6 font-body text-[#4A4A43]">
          <div className="bg-[#EDE8DF]/60 p-4 rounded-xl border border-[#D6CFC2] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-heading font-bold text-primary text-base">
                {language === 'EN' ? 'Dynamic Product Categories Manager' : 'Product Categorieën Beheerder'}
              </h3>
              <p className="text-dark/60 text-xs">
                {language === 'EN'
                  ? 'Add or remove product categories dynamically without updating code. Changes update all lead filters & forms.'
                  : 'Voeg productcategorieën toe of verwijder ze zonder code. Wijzigingen worden overal direct bijgewerkt.'}
              </p>
            </div>
            <Button icon={Plus} onClick={() => setAddCategoryModalOpen(true)}>
              {language === 'EN' ? '+ Add Category' : '+ Categorie Toevoegen'}
            </Button>
          </div>

          <Card title={language === 'EN' ? 'Active Product Categories' : 'Actieve Product Categorieën'} icon={Layers} p="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dynamicCategories.map((cat) => (
                <div key={cat.id} className="p-4 bg-white border border-[#D6CFC2] rounded-xl flex items-start justify-between gap-3 shadow-2xs">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl p-2 bg-[#EDE8DF] rounded-xl">{cat.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-primary text-sm font-heading">{cat.name}</h4>
                        <Badge variant="success" className="text-[9px]">{cat.status || 'Actief'}</Badge>
                      </div>
                      <p className="text-xs text-dark/60 mt-1 font-body">{cat.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* DYNAMIC PARTNER COST BREAKDOWN CONFIGURATOR TAB (NESTED SECTIONS & FIELDS) */}
      {/* ========================================================= */}
      {activeTab === 'PartnerBreakdown' && (
        <div className="space-y-6 font-body text-[#4A4A43]">
          <div className="bg-[#EDE8DF]/60 p-4 rounded-xl border border-[#D6CFC2] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-heading font-bold text-primary text-base">
                {language === 'EN' ? 'Dynamic Partner Price Breakdown Configurator' : 'Partner Prijsopbouw Secties & Velden'}
              </h3>
              <p className="text-dark/60 text-xs">
                {language === 'EN'
                  ? 'Define dynamic cost breakdown sections and specific cost input fields for craftsman partners.'
                  : 'Beheer dynamische kostensecties en specifieke invulvelden voor partner prijsaanvragen.'}
              </p>
            </div>
            <Button icon={Plus} onClick={() => setAddSectionModalOpen(true)}>
              {language === 'EN' ? '+ Add New Section' : '+ Nieuwe Sectie Toevoegen'}
            </Button>
          </div>

          <div className="space-y-4">
            {partnerBreakdownConfig.map((sec) => (
              <Card 
                key={sec.id} 
                title={`${sec.icon || '📦'} ${sec.title}`} 
                icon={Wrench} 
                p="p-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#D6CFC2]/60 pb-2">
                    <span className="text-xs font-bold text-dark/60 uppercase">
                      {language === 'EN' ? 'Configured Fields in Section:' : 'Velden in deze Sectie:'}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        icon={Plus}
                        onClick={() => {
                          setTargetSectionId(sec.id);
                          setAddFieldToSectionModalOpen(true);
                        }}
                        className="text-xs py-1 px-2.5 bg-white text-primary border-primary/30 hover:bg-primary/5"
                      >
                        {language === 'EN' ? '+ Add Field' : '+ Veld Toevoegen'}
                      </Button>
                      <button
                        onClick={() => handleDeleteSection(sec.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Entire Section"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {sec.fields && sec.fields.map((field) => (
                      <div key={field.id} className="p-3 bg-[#F8F7F4] border border-[#D6CFC2] rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-3.5 h-3.5 text-primary/70" />
                          <div>
                            <span className="font-bold text-dark">{field.label}</span>
                            {field.required && <Badge variant="warning" className="text-[8px] ml-1.5">Required (€)</Badge>}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteFieldFromSection(sec.id, field.id)}
                          className="p-1 text-red-400 hover:text-red-600 rounded"
                          title="Delete Field"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: GEBRUIKERSBEHEER & ROLES MANAGEMENT (PRD 4.12) */}
      {/* ========================================================= */}
      {activeTab === 'Users' && (
        <div className="space-y-6 font-body">
          <div className="flex justify-between items-center bg-[#EDE8DF]/60 p-4 rounded-xl border border-[#D6CFC2]">
            <div>
              <h3 className="font-heading font-bold text-primary text-base">
                {language === 'EN' ? 'User Management & Role Assignment' : 'Gebruikersbeheer & Rol Toewijzing'}
              </h3>
              <p className="text-dark/60 text-xs">
                {language === 'EN' 
                  ? 'Invite new users, assign roles (Admin / Partner / Customer), and manage access.' 
                  : 'Nieuwe gebruikers uitnodigen, rollen toewijzen (Admin / Partner / Customer) en toegang beheren.'}
              </p>
            </div>
            <Button icon={UserPlus} onClick={() => setInviteModalOpen(true)}>
              {language === 'EN' ? '+ Invite User' : '+ Gebruiker Uitnodigen'}
            </Button>
          </div>

          <Card p="p-4">
            <div className="space-y-3">
              {usersList.map((usr) => (
                <div key={usr.id} className="p-3.5 bg-white border border-[#D6CFC2] rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      {usr.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-dark text-sm">{usr.name}</h4>
                        <span className="text-[10px] font-mono text-dark/40">({usr.id})</span>
                      </div>
                      <p className="text-dark/60 text-xs">{usr.email}</p>
                      <div className="flex items-center gap-2 text-[10px] text-dark/50 mt-0.5 font-mono">
                        <span>{language === 'EN' ? 'Joined:' : 'Lid sinds:'} {usr.joinedDate}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-primary font-bold">
                          <Lock className="w-3 h-3 text-accent" />
                          {usr.password ? `Password: ••••••••` : 'Password: Protected'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {/* Role Assignment Dropdown */}
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-accent" />
                      <select
                        value={usr.role}
                        onChange={(e) => handleRoleChange(usr.id, e.target.value)}
                        className="px-2.5 py-1 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs font-bold text-primary focus:outline-none cursor-pointer"
                      >
                        <option value="admin">👑 Admin</option>
                        <option value="partner">🤝 Partner</option>
                        <option value="customer">👤 Customer</option>
                      </select>
                    </div>

                    {/* Status Badge & Toggle Button */}
                    <button
                      onClick={() => handleToggleUserStatus(usr.id)}
                      className={`px-3 py-1 rounded-lg font-bold text-[10px] border transition-all flex items-center gap-1 ${
                        usr.status === 'Actief'
                          ? 'bg-green-100 text-green-800 border-green-300 hover:bg-red-50 hover:text-red-700 hover:border-red-300'
                          : 'bg-red-100 text-red-800 border-red-300 hover:bg-green-50 hover:text-green-700 hover:border-green-300'
                      }`}
                    >
                      {usr.status === 'Actief' 
                        ? (language === 'EN' ? '🟢 Active (Deactivate)' : '🟢 Actief (Deactiveren)') 
                        : (language === 'EN' ? '🔴 Inactive (Activate)' : '🔴 Inactief (Activeren)')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: FIELD-SET CONFIGURATOR PER PRODUCT TYPE (PRD 4.12) */}
      {/* ========================================================= */}
      {activeTab === 'FieldSet' && (
        <div className="space-y-6 font-body">
          <div className="bg-[#EDE8DF]/60 p-4 rounded-xl border border-[#D6CFC2] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-heading font-bold text-primary text-base">
                {language === 'EN' ? 'Dynamic Field-Set Configurator' : 'Dynamic Field-Set Configurator'}
              </h3>
              <p className="text-dark/60 text-xs">
                {language === 'EN' 
                  ? 'Manage dynamic form fields per product type (outdoor living, canopy, poolhouse).' 
                  : 'Beheer dynamische formuliervelden per product type (buitenverblijf, overkapping, poolhouse).'}
              </p>
            </div>
            <Button icon={Plus} onClick={() => setAddFieldModalOpen(true)}>
              {language === 'EN' ? '+ Add New Field' : '+ Nieuw Veld Toevoegen'}
            </Button>
          </div>

          {/* Product Type Sub-Tabs */}
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'buitenkeuken', label: language === 'EN' ? '🍳 Outdoor Kitchens' : '🍳 Buitenkeukens' },
              { id: 'buitenverblijf', label: language === 'EN' ? '🏡 Outdoor Buildings' : '🏡 Buitenverblijven' },
              { id: 'overkapping', label: language === 'EN' ? '☂️ Canopy' : '☂️ Overkappingen' },
              { id: 'poolhouse', label: language === 'EN' ? '🏊 Poolhouse' : '🏊 Poolhouse' }
            ].map((pt) => (
              <button
                key={pt.id}
                onClick={() => setSelectedProductType(pt.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  selectedProductType === pt.id
                    ? 'bg-primary text-cream border-primary shadow-xs'
                    : 'bg-white text-dark/70 border-[#D6CFC2] hover:bg-[#EDE8DF]'
                }`}
              >
                {pt.label}
              </button>
            ))}
          </div>

          {/* Configured Fields Table */}
          <Card title={language === 'EN' ? `Configured Fields for "${selectedProductType.toUpperCase()}"` : `Geconfigureerde Velden voor "${selectedProductType.toUpperCase()}"`} icon={Sliders} p="p-4">
            <div className="space-y-2.5">
              {(fieldSets[selectedProductType] || []).map((field) => (
                <div key={field.id} className="p-3.5 bg-white border border-[#D6CFC2] rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-dark">{field.label}</h4>
                      {field.required && <Badge variant="danger" className="text-[8px]">{language === 'EN' ? 'Required' : 'Verplicht'}</Badge>}
                    </div>
                    <p className="text-[10px] text-dark/50 mt-0.5">Type: <span className="font-mono font-bold text-primary">{field.type}</span></p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {field.options && field.options.map((opt, i) => (
                        <span key={i} className="text-[9px] font-bold bg-[#EDE8DF] text-primary px-2 py-0.5 rounded">
                          {opt}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteField(field.id)}
                    className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                    title={language === 'EN' ? 'Delete field' : 'Verwijder veld'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {(!fieldSets[selectedProductType] || fieldSets[selectedProductType].length === 0) && (
                <div className="text-center py-8 text-xs text-dark/40 italic">
                  {language === 'EN' ? 'No custom fields configured for this product type.' : 'Geen aangepaste velden geconfigureerd voor dit product type.'}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB: OFFERTE SJABLOON DYNAMIC FIELDS CONFIGURATOR         */}
      {/* ========================================================= */}
      {activeTab === 'QuoteTemplate' && (
        <div className="space-y-6 font-body">
          <Card 
            title={language === 'EN' ? 'Quote Proposal Dynamic Field Defaults' : 'Offerte Sjabloon Dynamische Velden & Standaardwaarden'} 
            icon={FileText}
            topRightAction={{
              label: language === 'EN' ? '+ Add Presets' : '+ Standaardopties Beheren',
              icon: Plus,
              onClick: () => showToast(language === 'EN' ? 'Template presets saved automatically!' : 'Sjabloon opties automatisch opgeslagen!')
            }}
          >
            <div className="space-y-6 text-xs text-dark">
              <p className="text-dark/60">
                {language === 'EN'
                  ? 'Configure the dynamic specifications (Wood Types, BBQ Integrations, Build Times, Payment Terms) that render inside the 6-Page Branded PDF Proposal.'
                  : 'Beheer de dynamische specificaties (Houtsoorten, BBQ Inbouw, Bouwtijden, Betalingstermijnen) die automatisch in de 6-Pagina Merkofferte worden geladen.'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2] space-y-2">
                  <label className="font-bold text-primary text-xs uppercase tracking-wider block">🪵 Houtsoorten & Materiaal Opties</label>
                  <input
                    type="text"
                    defaultValue="Douglas, Thermo Fraké, Eikenhout, Padouk, Massief Teak"
                    onChange={(e) => {
                      localStorage.setItem('app_wood_types_config', e.target.value);
                      showToast('Houtsoorten opgeslagen!');
                    }}
                    className="w-full p-2.5 bg-white border border-[#D6CFC2] rounded-lg text-xs font-semibold"
                  />
                  <p className="text-[10px] text-dark/50">Komma gescheiden lijst van beschikbare houtsoorten voor offertes.</p>
                </div>

                <div className="p-4 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2] space-y-2">
                  <label className="font-bold text-primary text-xs uppercase tracking-wider block">🔥 BBQ & Apparatuur Integratie Presets</label>
                  <input
                    type="text"
                    defaultValue="Big Green Egg Large, Kamado Joe Classic, Weber Genesis, RVS Spoelbak & Kraan"
                    onChange={(e) => {
                      localStorage.setItem('app_bbq_presets_config', e.target.value);
                      showToast('BBQ inbouw opties opgeslagen!');
                    }}
                    className="w-full p-2.5 bg-white border border-[#D6CFC2] rounded-lg text-xs font-semibold"
                  />
                  <p className="text-[10px] text-dark/50">Inbouwopties voor keukens en buitenverblijven.</p>
                </div>

                <div className="p-4 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2] space-y-2">
                  <label className="font-bold text-primary text-xs uppercase tracking-wider block">⏱️ Standaard Levertijd & Bouwtijd</label>
                  <input
                    type="text"
                    defaultValue="2 tot 3 weken op locatie, na schouw"
                    onChange={(e) => {
                      localStorage.setItem('app_buildtime_config', e.target.value);
                      showToast('Standaard levertijd opgeslagen!');
                    }}
                    className="w-full p-2.5 bg-white border border-[#D6CFC2] rounded-lg text-xs font-semibold"
                  />
                  <p className="text-[10px] text-dark/50">Wordt getoond in het specificatieblok op pagina 3 van de offerte.</p>
                </div>

                <div className="p-4 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2] space-y-2">
                  <label className="font-bold text-primary text-xs uppercase tracking-wider block">💶 Betalingsschema (Termijnen)</label>
                  <select
                    defaultValue="50/50"
                    onChange={(e) => {
                      localStorage.setItem('app_payment_scheme_config', e.target.value);
                      showToast(`Betalingsschema gewijzigd naar ${e.target.value}!`);
                    }}
                    className="w-full p-2.5 bg-white border border-[#D6CFC2] rounded-lg text-xs font-bold text-primary"
                  >
                    <option value="50/50">50% Bij Akkoord & 50% Bij Levering</option>
                    <option value="40/40/20">40% Bij Akkoord, 40% Bij Start Bouw, 20% Bij Oplevering</option>
                  </select>
                  <p className="text-[10px] text-dark/50">Bepaalt de termijnkaartjes op pagina 4 van de offerte.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: AUTO-MESSAGE TEMPLATES MANAGER (SECTION 2.3)       */}
      {/* ========================================================= */}
      {activeTab === 'Templates' && (
        <div className="space-y-6">
          {/* Consistent Top Action Header Banner */}
          <div className="bg-[#EDE8DF]/60 p-4 rounded-xl border border-[#D6CFC2] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-heading font-bold text-primary text-base">
                {language === 'EN' ? 'Auto-Message Templates Manager' : 'Berichtsjablonen Beheerder'}
              </h3>
              <p className="text-dark/60 text-xs">
                {language === 'EN'
                  ? 'Configure automated WhatsApp & Email message templates for client communication.'
                  : 'Beheer automatische WhatsApp & E-mail berichtsjablonen voor klantomgang.'}
              </p>
            </div>
            <Button icon={Plus} onClick={() => setAddTemplateModalOpen(true)}>
              {language === 'EN' ? '+ Add New Template' : '+ Nieuw Sjabloon Toevoegen'}
            </Button>
          </div>

          <Card 
            title={language === 'EN' ? 'Auto-Message Templates Manager' : 'Berichtsjablonen Beheerder'} 
            icon={MessageSquare}
          >
            <div className="space-y-6 font-body text-xs">
              <div className="p-3.5 bg-primary/10 border border-primary/20 rounded-xl text-primary font-body">
                <p className="font-bold text-xs">💡 {language === 'EN' ? 'Dynamic Template Variables Guide' : 'Handleiding Dynamische Variabelen'}</p>
                <p className="text-[11px] mt-1 text-dark/70">
                  {language === 'EN'
                    ? 'Use the following tags in your templates. They will automatically be replaced with real lead data when launching WhatsApp or Email:'
                    : 'Gebruik de volgende tags in uw sjablonen. Deze worden automatisch vervangen door echte leadgegevens bij het starten van WhatsApp of E-mail:'}
                </p>
                <div className="flex flex-wrap gap-2 mt-2 font-mono text-[10px]">
                  <span className="bg-white px-2 py-1 rounded border border-primary/20 font-bold text-primary">{'{client_name}'}</span>
                  <span className="bg-white px-2 py-1 rounded border border-primary/20 font-bold text-primary">{'{product_category}'}</span>
                  <span className="bg-white px-2 py-1 rounded border border-primary/20 font-bold text-primary">{'{company_name}'}</span>
                </div>
              </div>

              {/* TEMPLATE 1 */}
              <div className="space-y-2 bg-[#F8F7F4] p-4 rounded-xl border border-[#D6CFC2]">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-dark text-sm flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">1</span>
                    {language === 'EN' ? 'Template 1: Initial Inquiry Response' : 'Sjabloon 1: Eerste Aanvraag Reactie'}
                  </label>
                  <Badge variant="info">Auto-Load</Badge>
                </div>
                <textarea
                  rows={3}
                  value={messageTemplates.template1}
                  onChange={e => setMessageTemplates(prev => ({ ...prev, template1: e.target.value }))}
                  className="w-full p-3 bg-white border border-[#D6CFC2] rounded-lg text-xs font-body focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* TEMPLATE 2 */}
              <div className="space-y-2 bg-[#F8F7F4] p-4 rounded-xl border border-[#D6CFC2]">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-dark text-sm flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">2</span>
                    {language === 'EN' ? 'Template 2: 1st Follow-up Message' : 'Sjabloon 2: 1e Vervolgbericht'}
                  </label>
                  <Badge variant="warning">Follow-up</Badge>
                </div>
                <textarea
                  rows={3}
                  value={messageTemplates.template2}
                  onChange={e => setMessageTemplates(prev => ({ ...prev, template2: e.target.value }))}
                  className="w-full p-3 bg-white border border-[#D6CFC2] rounded-lg text-xs font-body focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* TEMPLATE 3 */}
              <div className="space-y-2 bg-[#F8F7F4] p-4 rounded-xl border border-[#D6CFC2]">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-dark text-sm flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">3</span>
                    {language === 'EN' ? 'Template 3: 2nd Follow-up Message' : 'Sjabloon 3: 2e Vervolgbericht'}
                  </label>
                  <Badge variant="primary">Final Call</Badge>
                </div>
                <textarea
                  rows={3}
                  value={messageTemplates.template3}
                  onChange={e => setMessageTemplates(prev => ({ ...prev, template3: e.target.value }))}
                  className="w-full p-3 bg-white border border-[#D6CFC2] rounded-lg text-xs font-body focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* SAVE BUTTON */}
              <div className="flex justify-end pt-2 border-t border-[#D6CFC2]">
                <Button variant="primary" icon={Save} onClick={saveMessageTemplates}>
                  {language === 'EN' ? 'Save All Templates' : 'Alle Sjablonen Opslaan'}
                </Button>
              </div>

            </div>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 8: PROFIT & LOSS TARGETS & OVERHEAD PARAMETERS */}
      {/* ========================================================= */}
      {activeTab === 'ProfitLossConfig' && (
        <div className="space-y-6">
          <Card title={language === 'EN' ? 'Profit & Loss Configuration & Target Margins' : 'Winst & Verlies Configuratie & Marge Doelstellingen'} icon={TrendingUp}>
            <div className="space-y-4 text-xs font-body">
              <p className="text-dark/60">
                {language === 'EN'
                  ? 'Configure target profit margins, warning thresholds, and fixed monthly overhead. Changes here dynamically update Profit & Loss calculations across the system.'
                  : 'Stel hier de gewenste winstmarge doelen, waarschuwingsdrempels en vaste overheadkosten in. Wijzigingen werken direct door op alle Winst & Verlies berekeningen.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-xl border border-[#D6CFC2] space-y-2">
                  <label className="block font-bold text-primary uppercase text-[10px] flex items-center gap-1">
                    <Percent className="w-4 h-4 text-emerald-700" /> {language === 'EN' ? 'Target Gross Margin (%)' : 'Streef Winstmarge (%)'}
                  </label>
                  <input
                    type="number"
                    value={plConfig.targetMargin}
                    onChange={e => setPlConfig(prev => ({ ...prev, targetMargin: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg font-bold text-emerald-800 text-sm"
                  />
                  <p className="text-[10px] text-dark/50">{language === 'EN' ? 'Projects at or above this margin are marked Healthy.' : 'Projecten met deze marge worden als gezond aangemerkt.'}</p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-[#D6CFC2] space-y-2">
                  <label className="block font-bold text-primary uppercase text-[10px] flex items-center gap-1">
                    <Percent className="w-4 h-4 text-amber-600" /> {language === 'EN' ? 'Warning Margin Threshold (%)' : 'Waarschuwing Marge Drempel (%)'}
                  </label>
                  <input
                    type="number"
                    value={plConfig.warningMargin}
                    onChange={e => setPlConfig(prev => ({ ...prev, warningMargin: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg font-bold text-amber-800 text-sm"
                  />
                  <p className="text-[10px] text-dark/50">{language === 'EN' ? 'Margins below this threshold trigger a warning badge.' : 'Marges onder deze drempel geven een waarschuwing.'}</p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-[#D6CFC2] space-y-2">
                  <label className="block font-bold text-primary uppercase text-[10px] flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-primary" /> {language === 'EN' ? 'Monthly Fixed Overhead (€)' : 'Maandelijkse Overhead (€)'}
                  </label>
                  <input
                    type="number"
                    value={plConfig.monthlyOverhead}
                    onChange={e => setPlConfig(prev => ({ ...prev, monthlyOverhead: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg font-bold text-primary text-sm"
                  />
                  <p className="text-[10px] text-dark/50">{language === 'EN' ? 'Fixed monthly operating expenses deducted from gross profit.' : 'Vaste maandelijkse kosten voor netto berekeningen.'}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#D6CFC2] flex justify-end">
                <Button icon={Save} onClick={savePlConfig}>{language === 'EN' ? 'Save P&L Settings' : 'Winst & Verlies Instellingen Opslaan'}</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* INVITE USER MODAL */}
      <AnimatePresence>
        {inviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={() => setInviteModalOpen(false)} />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative w-full max-w-md bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-cream-dark/60 pb-3">
                <h3 className="text-lg font-heading font-bold text-primary">{language === 'EN' ? 'Invite New User' : 'Nieuwe Gebruiker Uitnodigen'}</h3>
                <button onClick={() => setInviteModalOpen(false)} className="p-1 text-dark/40 hover:text-dark"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleInviteSubmit} className="space-y-3 font-body">
                <div>
                  <label className="block font-semibold text-dark/60 mb-1 uppercase">{language === 'EN' ? 'Name' : 'Naam'}</label>
                  <input type="text" required value={inviteForm.name} onChange={e => setInviteForm(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs" placeholder="e.g. Prashant Kumar" />
                </div>
                <div>
                  <label className="block font-semibold text-dark/60 mb-1 uppercase">{language === 'EN' ? 'Email Address' : 'E-mailadres'}</label>
                  <input type="email" required value={inviteForm.email} onChange={e => setInviteForm(prev => ({ ...prev, email: e.target.value }))} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs" placeholder="e.g. sarah123@gmail.com" />
                </div>
                <div>
                  <label className="block font-semibold text-dark/60 mb-1 uppercase">{language === 'EN' ? 'Password' : 'Wachtwoord'}</label>
                  <div className="relative">
                    <input 
                      type={showPasswordInModal ? "text" : "password"} 
                      required 
                      value={inviteForm.password} 
                      onChange={e => setInviteForm(prev => ({ ...prev, password: e.target.value }))} 
                      className="w-full pl-3 pr-10 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs font-mono" 
                      placeholder="••••••••" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordInModal(!showPasswordInModal)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dark/40 hover:text-dark p-1"
                      title={showPasswordInModal ? "Hide Password" : "Show Password"}
                    >
                      {showPasswordInModal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-dark/60 mb-1 uppercase">{language === 'EN' ? 'System Role' : 'Systeem Rol'}</label>
                  <select value={inviteForm.role} onChange={e => setInviteForm(prev => ({ ...prev, role: e.target.value }))} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg font-bold text-xs">
                    <option value="admin">👑 Admin Portal</option>
                    <option value="partner">🤝 Partner Portal</option>
                    <option value="customer">👤 Customer Portal</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-cream-dark/60">
                  <Button type="button" variant="outline" onClick={() => setInviteModalOpen(false)}>{t('common.cancel')}</Button>
                  <Button type="submit">{language === 'EN' ? 'Send Invitation / Create User' : 'Verstuur Uitnodiging / Aanmaken'}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD CUSTOM FIELD MODAL */}
      <AnimatePresence>
        {addFieldModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={() => setAddFieldModalOpen(false)} />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative w-full max-w-md bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-cream-dark/60 pb-3">
                <h3 className="text-lg font-heading font-bold text-primary">{language === 'EN' ? `Add Custom Field (${selectedProductType.toUpperCase()})` : `Aangepast Veld Toevoegen (${selectedProductType.toUpperCase()})`}</h3>
                <button onClick={() => setAddFieldModalOpen(false)} className="p-1 text-dark/40 hover:text-dark"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleAddFieldSubmit} className="space-y-3 font-body">
                <div>
                  <label className="block font-semibold text-dark/60 mb-1 uppercase">{language === 'EN' ? 'Field Name / Label' : 'Veld Naam / Label'}</label>
                  <input type="text" required value={newFieldForm.label} onChange={e => setNewFieldForm(prev => ({ ...prev, label: e.target.value }))} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg" placeholder="e.g. Sauna Module Integratie" />
                </div>
                <div>
                  <label className="block font-semibold text-dark/60 mb-1 uppercase">{language === 'EN' ? 'Options (comma separated)' : 'Opties (komma gescheiden)'}</label>
                  <input type="text" value={newFieldForm.optionsStr} onChange={e => setNewFieldForm(prev => ({ ...prev, optionsStr: e.target.value }))} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg" placeholder="Infrarood, Fins sauna, Geen" />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-cream-dark/60">
                  <Button type="button" variant="outline" onClick={() => setAddFieldModalOpen(false)}>{t('common.cancel')}</Button>
                  <Button type="submit">{language === 'EN' ? 'Save Field' : 'Veld Opslaan'}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* ADD CATEGORY MODAL */}
      <AnimatePresence>
        {addCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={() => setAddCategoryModalOpen(false)} />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative w-full max-w-md bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-[#D6CFC2] pb-3">
                <h3 className="text-lg font-heading font-bold text-primary">{language === 'EN' ? 'Add New Category' : 'Nieuwe Categorie Toevoegen'}</h3>
                <button onClick={() => setAddCategoryModalOpen(false)} className="p-1 text-dark/40 hover:text-dark"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleAddCategorySubmit} className="space-y-3 font-body">
                <div>
                  <label className="block font-semibold text-dark/60 mb-1 uppercase">{language === 'EN' ? 'Category Name' : 'Categorienaam'}</label>
                  <input type="text" required value={categoryForm.name} onChange={e => setCategoryForm(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg" placeholder="b.v. Luxe Pergola / Tuinkamer" />
                </div>
                <div>
                  <label className="block font-semibold text-dark/60 mb-1 uppercase">{language === 'EN' ? 'Icon Emoji' : 'Icoon Emoji'}</label>
                  <input type="text" value={categoryForm.icon} onChange={e => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg font-mono text-base" placeholder="🏡" />
                </div>
                <div>
                  <label className="block font-semibold text-dark/60 mb-1 uppercase">{language === 'EN' ? 'Description' : 'Omschrijving'}</label>
                  <textarea value={categoryForm.description} onChange={e => setCategoryForm(prev => ({ ...prev, description: e.target.value }))} rows={2} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg resize-none" placeholder="Korte toelichting over dit product type..." />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#D6CFC2]">
                  <Button type="button" variant="outline" onClick={() => setAddCategoryModalOpen(false)}>{t('common.cancel')}</Button>
                  <Button type="submit">{language === 'EN' ? 'Save Category' : 'Categorie Opslaan'}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD NEW SECTION MODAL */}
      <AnimatePresence>
        {addSectionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={() => setAddSectionModalOpen(false)} />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative w-full max-w-md bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-[#D6CFC2] pb-3">
                <h3 className="text-lg font-heading font-bold text-primary">{language === 'EN' ? 'Add Cost Breakdown Section' : 'Nieuwe Prijsopbouw Sectie'}</h3>
                <button onClick={() => setAddSectionModalOpen(false)} className="p-1 text-dark/40 hover:text-dark"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleAddSectionSubmit} className="space-y-3 font-body">
                <div>
                  <label className="block font-semibold text-dark/60 mb-1 uppercase">{language === 'EN' ? 'Section Title' : 'Sectienaam'}</label>
                  <input type="text" required value={sectionForm.title} onChange={e => setSectionForm(prev => ({ ...prev, title: e.target.value }))} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg" placeholder="b.v. Fundering & Grondwerk" />
                </div>
                <div>
                  <label className="block font-semibold text-dark/60 mb-1 uppercase">{language === 'EN' ? 'Section Icon Emoji' : 'Pictogram Emoji'}</label>
                  <input type="text" value={sectionForm.icon} onChange={e => setSectionForm(prev => ({ ...prev, icon: e.target.value }))} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg" placeholder="🏗️" />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#D6CFC2]">
                  <Button type="button" variant="outline" onClick={() => setAddSectionModalOpen(false)}>{t('common.cancel')}</Button>
                  <Button type="submit">{language === 'EN' ? 'Save Section' : 'Sectie Opslaan'}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD FIELD TO SECTION MODAL */}
      <AnimatePresence>
        {addFieldToSectionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={() => setAddFieldToSectionModalOpen(false)} />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative w-full max-w-md bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-[#D6CFC2] pb-3">
                <h3 className="text-lg font-heading font-bold text-primary">{language === 'EN' ? 'Add Cost Field to Section' : 'Nieuw Kostenveld Toevoegen'}</h3>
                <button onClick={() => setAddFieldToSectionModalOpen(false)} className="p-1 text-dark/40 hover:text-dark"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleAddFieldToSectionSubmit} className="space-y-3 font-body">
                <div>
                  <label className="block font-semibold text-dark/60 mb-1 uppercase">{language === 'EN' ? 'Cost Field Label (€)' : 'Veld Omschrijving (€)'}</label>
                  <input type="text" required value={sectionFieldForm.label} onChange={e => setSectionFieldForm(prev => ({ ...prev, label: e.target.value }))} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg" placeholder="b.v. Graafwerkzaamheden (€)" />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#D6CFC2]">
                  <Button type="button" variant="outline" onClick={() => setAddFieldToSectionModalOpen(false)}>{t('common.cancel')}</Button>
                  <Button type="submit">{language === 'EN' ? 'Save Field' : 'Veld Opslaan'}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* ADD NEW TEMPLATE MODAL */}
      <AnimatePresence>
        {addTemplateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={() => setAddTemplateModalOpen(false)} />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative w-full max-w-md bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-[#D6CFC2] pb-3">
                <h3 className="text-lg font-heading font-bold text-primary">{language === 'EN' ? 'Add Message Template' : 'Nieuw Berichtsjabloon Toevoegen'}</h3>
                <button onClick={() => setAddTemplateModalOpen(false)} className="p-1 text-dark/40 hover:text-dark"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleAddTemplateSubmit} className="space-y-3 font-body">
                <div>
                  <label className="block font-semibold text-dark/60 mb-1 uppercase">{language === 'EN' ? 'Template Text' : 'Sjabloon Tekst'}</label>
                  <textarea
                    required
                    rows={4}
                    value={templateForm.text}
                    onChange={e => setTemplateForm(prev => ({ ...prev, text: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs"
                    placeholder="Dear {client_name}, ..."
                  />
                  <p className="text-[10px] text-dark/50 mt-1">Available tags: <code className="font-bold text-primary">{'{client_name}'}</code>, <code className="font-bold text-primary">{'{product_category}'}</code>, <code className="font-bold text-primary">{'{company_name}'}</code></p>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#D6CFC2]">
                  <Button type="button" variant="outline" onClick={() => setAddTemplateModalOpen(false)}>{t('common.cancel')}</Button>
                  <Button type="submit">{language === 'EN' ? 'Save Template' : 'Sjabloon Opslaan'}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
