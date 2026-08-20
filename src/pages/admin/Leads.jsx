import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import WorkflowTracker from '../../components/WorkflowTracker';
import { Plus, Search, Filter, X, CheckCircle, Trash2, Edit2, RotateCcw, AlertTriangle, ChevronDown, Download, Upload, GitCommit, Send, FileText, Sparkles } from 'lucide-react';
import { mockLeads as defaultLeads } from '../../utils/mockData';
import { useLanguage } from '../../context/LanguageContext';
import { tValue } from '../../utils/translator';

export default function Leads() {
  const { t, language } = useLanguage();
  const [leads, setLeads] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeWorkflowLead, setActiveWorkflowLead] = useState(null);
  
  // Filter States
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [productTypeFilter, setProductTypeFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [assigneeFilter, setAssigneeFilter] = useState('All');
  const [lastContactFilter, setLastContactFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Dynamic Categories state
  const [dynamicCategoriesList, setDynamicCategoriesList] = useState(() => {
    try {
      const saved = localStorage.getItem('app_dynamic_categories');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'cat-1', name: 'Buitenkeukens' },
      { id: 'cat-2', name: 'Kliko-ombouw' },
      { id: 'cat-3', name: 'Snijplanken' },
      { id: 'cat-4', name: 'Overkappingen' }
    ];
  });

  const loadCategoriesData = () => {
    try {
      const saved = localStorage.getItem('app_dynamic_categories');
      if (saved) setDynamicCategoriesList(JSON.parse(saved));
    } catch (e) {}
  };

  useEffect(() => {
    loadCategoriesData();
    window.addEventListener('app_data_changed', loadCategoriesData);
    return () => window.removeEventListener('app_data_changed', loadCategoriesData);
  }, []);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [csvDropdownOpen, setCsvDropdownOpen] = useState(false);
  const csvFileInputRef = useRef(null);
  const csvDropdownRef = useRef(null);

  // Custom Dropdown States for Modal (Guaranteed Downward Expansion)
  const [sizeDropdownOpen, setSizeDropdownOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [productTypeDropdownOpen, setProductTypeDropdownOpen] = useState(false);
  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  // React Portal Status Dropdown state
  const [statusPortalPos, setStatusPortalPos] = useState(null);

  // Red Warning Alert 1-Click Follow-up Modal State
  const [redAlertModalLead, setRedAlertModalLead] = useState(null);

  // 7-Step Partner Price Request Wizard State
  const [partnerWizardLead, setPartnerWizardLead] = useState(null);
  const [partnerWizardStep, setPartnerWizardStep] = useState(1);
  const [wizardForm, setWizardForm] = useState({
    category: 'Outdoor Kitchen',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    address: '',
    lengthCm: '240',
    widthCm: '80',
    heightCm: '95',
    woodType: 'Thermo Fraké Wood (Recommended)',
    countertop: 'Zwart Polijst Beton Cire (8cm)',
    appliances: ['Kamado Big Green Egg Large', 'RVS Sink & Tap'],
    siteAccess: 'Ground floor backyard access via side gate',
    gardenPhotoName: 'garden_site_photo.jpg',
    render3dName: '3d_outdoor_kitchen_render.png',
    craftsmanPartner: 'CraftWood Veluwe (Recommended)'
  });

  const handleOpenPartnerWizard = (lead) => {
    setPartnerWizardLead(lead);
    setPartnerWizardStep(1);
    setWizardForm({
      category: lead.productType || lead.category || 'Outdoor Kitchen',
      customerName: lead.name || '',
      customerEmail: lead.email || `${(lead.name || 'client').toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      customerPhone: lead.phone || '+31 6 12345678',
      address: lead.location || 'Amsterdam, Netherlands',
      lengthCm: '240',
      widthCm: '80',
      heightCm: '95',
      woodType: 'Thermo Fraké Wood (Recommended)',
      countertop: 'Zwart Polijst Beton Cire (8cm)',
      appliances: ['Kamado Big Green Egg Large', 'RVS Sink & Tap'],
      siteAccess: 'Ground floor backyard access via side gate',
      gardenPhotoName: 'garden_site_photo.jpg',
      render3dName: '3d_outdoor_kitchen_render.png',
      craftsmanPartner: 'CraftWood Veluwe (Recommended)'
    });
  };

  useEffect(() => {
    const handleResetLeadsView = () => {
      setActiveWorkflowLead(null);
    };
    window.addEventListener('app_reset_leads_view', handleResetLeadsView);
    return () => window.removeEventListener('app_reset_leads_view', handleResetLeadsView);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (csvDropdownRef.current && !csvDropdownRef.current.contains(e.target)) {
        setCsvDropdownOpen(false);
      }
      if (!e.target.closest('.status-portal-menu') && !e.target.closest('.status-dropdown-btn')) {
        setStatusPortalPos(null);
      }
    };
    const handleScroll = () => setStatusPortalPos(null);

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  // Lost Reason Modal State
  const [lostReasonModalOpen, setLostReasonModalOpen] = useState(false);
  const [lostReasonText, setLostReasonText] = useState('');
  const [pendingFormSubmit, setPendingFormSubmit] = useState(null);

  // Form State
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    productType: 'buitenkeuken',
    size: '',
    source: 'Direct',
    status: 'Nieuw'
  });

  // Load leads from localStorage on mount & listen to app_data_changed
  const loadLeadsData = () => {
    const savedLeads = localStorage.getItem('app_leads_v5');
    if (savedLeads) {
      try {
        const parsed = JSON.parse(savedLeads);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLeads(parsed);
          return;
        }
      } catch (e) {}
    }
    setLeads(defaultLeads);
    localStorage.setItem('app_leads_v5', JSON.stringify(defaultLeads));
  };

  useEffect(() => {
    loadLeadsData();
    window.addEventListener('app_data_changed', loadLeadsData);
    return () => window.removeEventListener('app_data_changed', loadLeadsData);
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleOpenAddModal = () => {
    setSelectedLead(null);
    setForm({ name: '', phone: '', email: '', location: '', productType: 'buitenkeuken', size: '', source: 'Direct', status: 'Nieuw', notes: '' });
    setModalOpen(true);
  };

  const handleOpenEditModal = (lead) => {
    setSelectedLead(lead);
    setForm({
      name: lead.name,
      phone: lead.phone || '',
      email: lead.email || '',
      location: lead.location || lead.city || '',
      productType: lead.productType || 'buitenkeuken',
      size: lead.size || '',
      source: lead.source || 'Direct',
      status: lead.status || 'Nieuw',
      notes: lead.notes || lead.intakeNotes || ''
    });
    setModalOpen(true);
  };

  const saveLeadsToStorage = (updated) => {
    localStorage.setItem('app_leads_v5', JSON.stringify(updated));
    localStorage.setItem('app_leads_v3', JSON.stringify(updated));
    localStorage.setItem('app_leads_v2', JSON.stringify(updated));
    localStorage.setItem('app_leads', JSON.stringify(updated));
    window.dispatchEvent(new Event('app_data_changed'));
  };

  const handleDeleteLead = (id, name) => {
    const updatedLeads = leads.filter(l => l.id !== id);
    setLeads(updatedLeads);
    saveLeadsToStorage(updatedLeads);
    showToast(`Lead "${name}" deleted successfully!`);
  };

  const handleDirectStatusChange = (leadId, newStatus) => {
    setLeads(prevLeads => {
      const updated = prevLeads.map(l => {
        if (l.id === leadId) {
          if (newStatus === 'Verloren' || newStatus === 'Lost') {
            setPendingFormSubmit({ ...l, status: newStatus });
            setLostReasonModalOpen(true);
          }
          return { ...l, status: newStatus };
        }
        return l;
      });
      saveLeadsToStorage(updated);
      return updated;
    });
    setStatusPortalPos(null);
    showToast(language === 'NL' ? `Status bijgewerkt naar "${newStatus}"` : `Status updated to "${newStatus}"`);
  };

  const handleToggleAssignee = (leadId) => {
    setLeads(prevLeads => {
      const updated = prevLeads.map(l => {
        if (l.id === leadId) {
          const next = l.assignedTo === 'Bram' ? 'Tim' : 'Bram';
          return { ...l, assignedTo: next };
        }
        return l;
      });
      saveLeadsToStorage(updated);
      return updated;
    });
    showToast(language === 'NL' ? 'Toegewezen eigenaar gewijzigd' : 'Assignee updated');
  };

  const handleSendRedAlertFollowUp = (lead, method) => {
    const msgText = language === 'EN'
      ? `Dear ${lead.name}, we would love to know if you have any questions regarding your outdoor living inquiry. When would it suit you to talk over the phone? Best regards, Tim & Bram - Vanuit Ambacht`
      : `Beste ${lead.name}, graag horen we of u nog vragen heeft over uw buitenkeuken aanvraag. Wanneer schikt het u om hier even over te bellen? Met vriendelijke groet, Tim & Bram - Vanuit Ambacht`;

    if (method === 'whatsapp') {
      const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msgText)}`, '_blank');
      showToast(language === 'EN' ? 'WhatsApp 1st Follow-up opened!' : 'WhatsApp 1st Follow-up geopend!');
    } else if (method === 'email') {
      const mailtoUrl = `mailto:${lead.email}?subject=${encodeURIComponent(language === 'EN' ? 'Follow-up Outdoor Kitchen Inquiry' : 'Opvolging Buitenkeuken Aanvraag')}&body=${encodeURIComponent(msgText)}`;
      const link = document.createElement('a');
      link.href = mailtoUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(language === 'EN' ? 'Email draft opened!' : 'E-mail draft geopend!');
    } else {
      navigator.clipboard.writeText(msgText);
      showToast(language === 'EN' ? '📋 Follow-up message copied to clipboard!' : '📋 Follow-up bericht gekopieerd naar klembord!');
      setRedAlertModalLead(null);
      return; // Do NOT clear red warning on copy only!
    }

    // Only update lastContactDate when actually sending via WhatsApp or Email!
    const todayStr = new Date().toISOString().split('T')[0];
    setLeads(prevLeads => {
      const updated = prevLeads.map(l => {
        if (l.id === lead.id) {
          return { ...l, lastContactDate: todayStr, status: 'Bericht verstuurd' };
        }
        return l;
      });
      saveLeadsToStorage(updated);
      return updated;
    });

    setRedAlertModalLead(null);
  };

  const handleFormSubmitClick = (e) => {
    e.preventDefault();
    if (form.status === 'Verloren' && (!selectedLead || selectedLead.status !== 'Verloren')) {
      // Intercept and ask for reason
      setPendingFormSubmit(form);
      setLostReasonText('');
      setLostReasonModalOpen(true);
    } else {
      executeSubmit(form);
    }
  };

  const executeSubmit = (finalForm, reason = '') => {
    let updatedLeads = [];
    
    if (selectedLead) {
      // Editing Mode
      updatedLeads = leads.map(l => {
        if (l.id === selectedLead.id) {
          return {
            ...l,
            name: finalForm.name,
            phone: finalForm.phone || '-',
            email: finalForm.email || '-',
            location: finalForm.location || '-',
            city: finalForm.location || '-',
            productType: finalForm.productType,
            size: finalForm.size || '-',
            source: finalForm.source,
            status: finalForm.status,
            notes: finalForm.notes || '',
            intakeNotes: finalForm.notes || '',
            lostReason: reason || l.lostReason,
            lastContactDate: new Date().toISOString().split('T')[0] // Update contact date on edit
          };
        }
        return l;
      });
      showToast(`Lead "${finalForm.name}" updated successfully!`);
    } else {
      // Adding Mode
      const newLead = {
        id: `L-${leads.length + 1001}`,
        name: finalForm.name,
        phone: finalForm.phone || '-',
        email: finalForm.email || '-',
        location: finalForm.location || 'Amsterdam, NL',
        city: finalForm.location || 'Amsterdam',
        productType: finalForm.productType,
        size: finalForm.size || '-',
        source: finalForm.source,
        status: finalForm.status,
        notes: finalForm.notes || '',
        intakeNotes: finalForm.notes || '',
        lostReason: reason,
        assignedTo: 'Admin',
        date: new Date().toISOString().split('T')[0],
        lastContactDate: new Date().toISOString().split('T')[0]
      };
      updatedLeads = [newLead, ...leads];
      showToast(`Lead "${finalForm.name}" created successfully!`);
    }

    setLeads(updatedLeads);
    saveLeadsToStorage(updatedLeads);
    setModalOpen(false);
    setLostReasonModalOpen(false);
    setPendingFormSubmit(null);
    // Also update workflowStep data if lead is new, reset to step 1
  };

  const handleResetFilters = () => {
    setStatusFilter('All');
    setProductTypeFilter('All');
    setSourceFilter('All');
    setAssigneeFilter('All');
    setLastContactFilter('All');
    setSortBy('newest');
    setSearchQuery('');
  };

  const handleCSVExport = () => {
    if (leads.length === 0) return showToast("No leads to export.");
    
    const sep = ';'; // Semicolon for Excel compatibility (European locale)
    const headers = ['ID', 'Naam', 'Telefoon', 'Email', 'Product Type', 'Gewenste Maat', 'Bron', 'Status', 'Laatste Contact', 'Verloren Reden'];
    const csvRows = leads.map(l => [
      l.id, l.name, l.phone || '', l.email || '', l.productType, l.size || '', 
      l.source, l.status, l.lastContactDate || '', l.lostReason || ''
    ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(sep));
    
    const CRLF = '\r\n';
    const BOM = '\uFEFF'; // UTF-8 BOM so Excel opens it correctly
    const csvString = BOM + [headers.join(sep), ...csvRows].join(CRLF);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    showToast("CSV Exported Successfully! Open in Excel.");
  };

  const handleCSVImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result.replace(/\r/g, '');
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) return showToast('CSV file is empty or invalid.');
        const rows = lines.slice(1); // Skip header row
        const newLeads = rows.map((line, idx) => {
          const cols = line.split(';').map(c => c.replace(/^"|"$/g, '').trim());
          return {
            id: cols[0] || `L-IMP-${Date.now().toString().slice(-4)}-${idx}`,
            name: cols[1] || 'Imported Lead',
            phone: cols[2] || '-',
            email: cols[3] || '-',
            productType: cols[4] || 'buitenkeuken',
            size: cols[5] || '-',
            source: cols[6] || 'CSV Import',
            status: cols[7] || 'Nieuw',
            lastContactDate: cols[8] || new Date().toISOString().split('T')[0],
            lostReason: cols[9] || '',
            date: new Date().toISOString().split('T')[0]
          };
        });

        const updatedLeads = [...newLeads, ...leads];
        setLeads(updatedLeads);
        saveLeadsToStorage(updatedLeads);
        showToast(`✅ ${newLeads.length} leads imported successfully!`);
      } catch (err) {
        showToast('Import failed. Please check your CSV format.');
      }
      e.target.value = ''; // Reset for re-use
    };
    reader.readAsText(file);
    setCsvDropdownOpen(false);
  };

  // Filter & Sort Logic
  const processedLeads = [...leads]
    .filter(lead => {
      // 1. Search filter (Name or Phone)
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.phone && lead.phone.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // 2. Status filter
      const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
      
      // 3. Product filter
      const matchesProduct = productTypeFilter === 'All' || lead.productType === productTypeFilter;

      // 4. Source filter
      const matchesSource = sourceFilter === 'All' || lead.source === sourceFilter;

      // 5. Assignee filter
      const matchesAssignee = assigneeFilter === 'All' || (lead.assignedTo || 'Tim') === assigneeFilter;

      // 6. Last Contact filter
      let matchesLastContact = true;
      if (lastContactFilter === 'RedFlag') {
        const diffDays = Math.floor(Math.abs(new Date() - new Date(lead.lastContactDate)) / (1000 * 60 * 60 * 24));
        matchesLastContact = diffDays >= 2;
      } else if (lastContactFilter === 'Recent') {
        const diffDays = Math.floor(Math.abs(new Date() - new Date(lead.lastContactDate)) / (1000 * 60 * 60 * 24));
        matchesLastContact = diffDays < 2;
      }

      return matchesSearch && matchesStatus && matchesProduct && matchesSource && matchesAssignee && matchesLastContact;
    })
    .sort((a, b) => {
      // Sorting
      if (sortBy === 'newest') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      return 0;
    });

  const getProductTypeLabel = (type) => {
    return tValue(type, language);
  };

  const getStatusLabel = (st) => {
    return tValue(st, language);
  };

  const columns = [
    { 
      header: language === 'EN' ? 'Customer Name' : 'Klantnaam', 
      accessor: 'name', 
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-dark">{row.name}</span>
          <span className="inline-flex items-center gap-1 text-[9.5px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded w-max">
            📄 #Q-4001 (€12.5k)
          </span>
        </div>
      ) 
    },
    { 
      header: (
        <button onClick={() => setShowFilterPanel(prev => !prev)} className="flex items-center gap-1.5 font-bold hover:text-primary transition-colors text-left focus:outline-none cursor-pointer" title="Filter by Product Type">
          <span>{language === 'EN' ? 'Product Type' : 'Product Type'}</span>
          <Filter className={`w-3 h-3 ${productTypeFilter !== 'All' ? 'text-primary fill-primary' : 'text-dark/40'}`} />
        </button>
      ), 
      accessor: 'productType',
      render: (row) => {
        const type = row.productType || row.category || 'buitenkeuken';
        const logoSrc = type.toLowerCase().includes('kliko')
          ? '/logo_kliko.png'
          : type.toLowerCase().includes('snijplanken')
          ? '/logo_snijplanken.png'
          : '/logo_buitenkeukens.png';
        return (
          <div className="flex items-center gap-2 py-0.5">
            <img src={logoSrc} alt={type} className="h-5 max-w-[60px] object-contain mix-blend-multiply flex-shrink-0" />
            <span className="text-[10px] font-bold text-primary font-body bg-primary/10 px-2 py-0.5 rounded-md whitespace-nowrap capitalize">
              {getProductTypeLabel(type)}
            </span>
          </div>
        );
      }
    },
    { header: language === 'EN' ? 'Desired Size' : 'Gewenste Maat', accessor: 'size', render: (row) => <span className="text-dark/70 text-xs">{row.size}</span> },
    { 
      header: (
        <button onClick={() => setShowFilterPanel(prev => !prev)} className="flex items-center gap-1.5 font-bold hover:text-primary transition-colors text-left focus:outline-none cursor-pointer" title="Filter by Source">
          <span>{language === 'EN' ? 'Source / Campaign' : 'Bron / Campagne'}</span>
          <Filter className={`w-3 h-3 ${sourceFilter !== 'All' ? 'text-primary fill-primary' : 'text-dark/40'}`} />
        </button>
      ), 
      accessor: 'source', 
      render: (row) => {
        const src = row.source || 'Direct';
        const isMeta = src.toLowerCase().includes('meta') || src.toLowerCase().includes('facebook') || src.toLowerCase().includes('instagram');
        return (
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
            isMeta ? 'bg-pink-50 text-pink-700 border-pink-200' : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            {isMeta ? 'Meta Ads' : src}
          </span>
        );
      } 
    },
    { 
      header: (
        <button onClick={() => setShowFilterPanel(prev => !prev)} className="flex items-center gap-1.5 font-bold hover:text-primary transition-colors text-left focus:outline-none cursor-pointer" title="Filter by Status">
          <span>{language === 'EN' ? 'Status' : 'Status'}</span>
          <Filter className={`w-3 h-3 ${statusFilter !== 'All' ? 'text-primary fill-primary' : 'text-dark/40'}`} />
        </button>
      ), 
      accessor: 'status',
      render: (row) => {
        let variant = 'default';
        if(row.status === 'Nieuw' || row.status === 'New') variant = 'info';
        else if(row.status === 'Gewonnen' || row.status === 'Won') variant = 'success';
        else if(row.status === 'Verloren' || row.status === 'Lost') variant = 'danger';
        else if(row.status === 'Offerte verstuurd' || row.status === 'Quote Sent') variant = 'primary';
        else if(row.status === 'In gesprek' || row.status === 'In Conversation' || row.status === 'Bericht verstuurd') variant = 'warning';
        
        return (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              if (statusPortalPos && statusPortalPos.leadId === row.id) {
                setStatusPortalPos(null);
              } else {
                const dropdownHeight = 240;
                const spaceBelow = window.innerHeight - rect.bottom;
                const showAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight;
                const calculatedTop = showAbove ? Math.max(10, rect.top - dropdownHeight - 6) : rect.bottom + 6;
                const calculatedLeft = Math.min(Math.max(10, rect.left), window.innerWidth - 200);

                setStatusPortalPos({
                  top: calculatedTop,
                  left: calculatedLeft,
                  leadId: row.id,
                  currentStatus: row.status
                });
              }
            }}
            className="status-dropdown-btn inline-flex items-center gap-1.5 focus:outline-none hover:opacity-85 transition-opacity cursor-pointer"
            title={language === 'NL' ? 'Klik om status direct te wijzigen' : 'Click to change status'}
          >
            <Badge variant={variant}>{getStatusLabel(row.status)}</Badge>
            <ChevronDown className="w-3 h-3 text-dark/40" />
          </button>
        );
      }
    },
    {
      header: (
        <button onClick={() => setShowFilterPanel(prev => !prev)} className="flex items-center gap-1.5 font-bold hover:text-primary transition-colors text-left focus:outline-none cursor-pointer" title="Filter by Assignee">
          <span>{language === 'NL' ? 'Eigenaar' : 'Assignee'}</span>
          <Filter className={`w-3 h-3 ${assigneeFilter !== 'All' ? 'text-primary fill-primary' : 'text-dark/40'}`} />
        </button>
      ),
      accessor: 'assignedTo',
      render: (row) => {
        const owner = row.assignedTo === 'Bram' ? 'Bram' : 'Tim';
        return (
          <button
            onClick={() => handleToggleAssignee(row.id)}
            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cream text-primary border border-primary/20 hover:bg-primary/10 transition-colors cursor-pointer"
            title={language === 'NL' ? 'Klik om te wisselen tussen Tim & Bram' : 'Click to toggle assignee'}
          >
            <span className="w-3.5 h-3.5 rounded-full bg-primary text-white text-[9px] flex items-center justify-between justify-center font-bold">
              {owner[0]}
            </span>
            {owner}
          </button>
        );
      }
    },
    { 
      header: (
        <button onClick={() => setShowFilterPanel(prev => !prev)} className="flex items-center gap-1.5 font-bold hover:text-primary transition-colors text-left focus:outline-none cursor-pointer" title="Filter by Follow-up Alert">
          <span>{language === 'NL' ? 'Laatste Contact' : 'Last Contact'}</span>
          <Filter className={`w-3 h-3 ${lastContactFilter !== 'All' ? 'text-primary fill-primary' : 'text-dark/40'}`} />
        </button>
      ), 
      accessor: 'lastContactDate',
      render: (row) => {
        if (!row.lastContactDate) return <span className="text-dark/40">-</span>;
        const diffTime = Math.abs(new Date() - new Date(row.lastContactDate));
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const isRedFlag = diffDays >= 3;
        
        return (
          <button
            onClick={() => isRedFlag && setRedAlertModalLead(row)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors whitespace-nowrap flex-shrink-0 ${
              isRedFlag 
                ? 'bg-red-50 text-red-700 font-bold border border-red-200 hover:bg-red-100 cursor-pointer animate-pulse' 
                : 'text-dark/60 font-medium bg-[#EDE8DF]/50 border border-[#D6CFC2]/40'
            }`}
            title={isRedFlag ? (language === 'NL' ? 'Klik om direct 1st Follow-up te sturen' : 'Click to send 1st follow-up') : ''}
          >
            {isRedFlag && <AlertTriangle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />}
            <span>{diffDays === 0 ? 'Today' : `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`}</span>
            {isRedFlag && <span className="text-[9px] underline ml-0.5 whitespace-nowrap flex-shrink-0">{language === 'NL' ? 'Volg op' : 'Follow up'}</span>}
          </button>
        );
      }
    },
    {
      header: t('common.actions'),
      render: (row) => (
        <div className="flex flex-wrap md:flex-nowrap items-center justify-end gap-1.5 md:whitespace-nowrap max-w-full">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              handleOpenPartnerWizard(row);
            }}
            className="text-primary hover:bg-primary/10 flex-shrink-0"
            title={language === 'EN' ? 'Partner Price Request Wizard' : 'Partner Prijsaanvraag Wizard'}
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              setActiveWorkflowLead({ ...row, requiresPartner: false, workflowStep: 2 });
            }}
            className="text-amber-700 hover:bg-amber-100/60 flex-shrink-0"
            title={language === 'EN' ? 'Direct Customer Quote (Bypass Partner)' : 'Directe Klantofferte (Sla Partner Over)'}
          >
            <FileText className="w-3.5 h-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleOpenEditModal(row)}
            className="text-dark/70 hover:bg-black/5 flex-shrink-0"
            title="Edit Lead"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button 
            variant="custom" 
            size="sm" 
            onClick={() => handleDeleteLead(row.id, row.name)}
            className="text-red-600 hover:bg-red-50 flex-shrink-0"
            title="Delete Lead"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      )
    }
  ];

  const hasActiveFilters = statusFilter !== 'All' || productTypeFilter !== 'All' || sourceFilter !== 'All' || assigneeFilter !== 'All' || lastContactFilter !== 'All' || sortBy !== 'newest' || searchQuery !== '';

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            className="fixed top-20 right-4 z-[9999] flex items-center gap-2 bg-primary text-cream px-4 py-3 rounded-xl shadow-lg border border-[#D6CFC2]/20 font-body text-xs"
          >
            <CheckCircle className="w-4 h-4 text-green-400" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* WORKFLOW TRACKER VIEW (Full Page Replace) */}
      {activeWorkflowLead ? (
        <WorkflowTracker
          lead={activeWorkflowLead}
          onClose={() => setActiveWorkflowLead(null)}
          onOpenPartnerWizard={(targetLead) => {
            const target = targetLead || activeWorkflowLead;
            handleOpenPartnerWizard(target);
          }}
          onUpdateStatus={(id, newStep) => {
            const updatedLeads = leads.map(l => l.id === id ? { 
              ...l, 
              workflowStep: newStep, 
              status: newStep === 5 ? (language === 'EN' ? 'Won' : 'Gewonnen') : l.status 
            } : l);
            setLeads(updatedLeads);
            saveLeadsToStorage(updatedLeads);
            showToast(newStep === 5 
              ? (language === 'EN' ? 'Lead successfully converted to Project!' : 'Lead succesvol omgezet naar Project!')
              : `Workflow updated to Step ${newStep}!`);
          }}
        />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 className="text-2xl font-heading font-bold text-primary">Leads Management</h2>
            <div className="flex gap-2 items-center">
              {/* Combined CSV Dropdown */}
              <div className="relative" ref={csvDropdownRef}>
                <button
                  onClick={() => setCsvDropdownOpen(!csvDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold font-body border border-[#D6CFC2] rounded-xl bg-white text-dark/70 hover:bg-[#F8F7F4] hover:border-primary/30 transition-all duration-200 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  CSV
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${csvDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {csvDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-[#D6CFC2] rounded-xl shadow-xl z-30 overflow-hidden"
                    >
                      <button
                        onClick={() => { handleCSVExport(); setCsvDropdownOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-medium font-body text-dark/70 hover:bg-[#F8F7F4] hover:text-primary transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-primary" />
                        Export as CSV
                      </button>
                      <div className="border-t border-[#D6CFC2]/50" />
                      <button
                        onClick={() => csvFileInputRef.current?.click()}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-medium font-body text-dark/70 hover:bg-[#F8F7F4] hover:text-primary transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5 text-primary" />
                        Import from CSV
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
                <input
                  ref={csvFileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleCSVImport}
                />
              </div>
              <Button icon={Plus} onClick={handleOpenAddModal}>{language === 'EN' ? '+ New Lead' : '+ Nieuwe lead'}</Button>
            </div>
          </div>

      <Card>
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/40" />
              <input 
                type="text" 
                placeholder="Search by name or phone..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#EDE8DF]/30 border border-[#D6CFC2] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-[#4A4A43]"
              />
            </div>
            <Button 
              variant={showFilterPanel ? 'primary' : 'outline'} 
              icon={Filter} 
              onClick={() => setShowFilterPanel(!showFilterPanel)}
            >
              Filters
            </Button>
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                icon={RotateCcw} 
                onClick={handleResetFilters}
                className="text-xs text-dark/65"
              >
                Reset
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
                className="overflow-hidden border-t border-[#D6CFC2]/50 pt-4 grid grid-cols-1 xs:grid-cols-2 md:grid-cols-5 gap-3"
              >
                {/* Status Filter */}
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-dark/60 mb-1.5 font-body uppercase tracking-wider">Status</label>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs font-body focus:outline-none text-[#4A4A43]"
                  >
                    <option value="All">{language === 'NL' ? 'Alle (All)' : 'All Statuses'}</option>
                    <option value="Nieuw">{language === 'NL' ? 'Nieuw' : 'New'}</option>
                    <option value="In gesprek">{language === 'NL' ? 'In gesprek' : 'In Conversation'}</option>
                    <option value="Offerte verstuurd">{language === 'NL' ? 'Offerte verstuurd' : 'Quote Sent'}</option>
                    <option value="Gewonnen">{language === 'NL' ? 'Gewonnen' : 'Won'}</option>
                    <option value="Verloren">{language === 'NL' ? 'Verloren' : 'Lost'}</option>
                  </select>
                </div>

                {/* Product Type Filter */}
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-dark/60 mb-1.5 font-body uppercase tracking-wider">Product Type</label>
                  <select
                    value={productTypeFilter}
                    onChange={e => setProductTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs font-body focus:outline-none text-[#4A4A43]"
                  >
                    <option value="All">{language === 'NL' ? 'Alle (All)' : 'All Products'}</option>
                    {dynamicCategoriesList.map((cat) => (
                      <option key={cat.id || cat.name} value={cat.name.toLowerCase()}>
                        {(cat.icon ? `${cat.icon} ` : '') + cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Source Filter */}
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-dark/60 mb-1.5 font-body uppercase tracking-wider">{language === 'EN' ? 'Source / Campaign' : 'Bron / Campagne'}</label>
                  <select
                    value={sourceFilter}
                    onChange={e => setSourceFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs font-body focus:outline-none text-[#4A4A43]"
                  >
                    <option value="All">{language === 'NL' ? 'Alle (All)' : 'All Sources'}</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Meta Ads">Meta Ads</option>
                    <option value="Direct">Direct</option>
                    <option value="Referral">Referral</option>
                  </select>
                </div>

                {/* Assignee Filter */}
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-dark/60 mb-1.5 font-body uppercase tracking-wider">{language === 'NL' ? 'Eigenaar' : 'Assignee'}</label>
                  <select
                    value={assigneeFilter}
                    onChange={e => setAssigneeFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs font-body focus:outline-none text-[#4A4A43]"
                  >
                    <option value="All">{language === 'NL' ? 'Alle Eigenaren (All)' : 'All Assignees'}</option>
                    <option value="Tim">Tim</option>
                    <option value="Bram">Bram</option>
                  </select>
                </div>

                {/* Last Contact Filter */}
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-dark/60 mb-1.5 font-body uppercase tracking-wider">{language === 'NL' ? 'Laatste Contact' : 'Last Contact'}</label>
                  <select
                    value={lastContactFilter}
                    onChange={e => setLastContactFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs font-body focus:outline-none text-[#4A4A43]"
                  >
                    <option value="All">{language === 'NL' ? 'Alle Contact Datums' : 'All Contact Dates'}</option>
                    <option value="RedFlag">{language === 'NL' ? '⚠️ Follow-up Nodig (3+ dagen)' : '⚠️ Needs Follow-up (3+ days)'}</option>
                    <option value="Recent">{language === 'NL' ? '🟢 Recent Gecontacteerd' : '🟢 Contacted Recently'}</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Table 
          columns={columns} 
          data={processedLeads} 
          onRowClick={(row) => setActiveWorkflowLead(row)}
          getRowClassName={(row) => statusPortalPos?.leadId === row.id ? 'z-50 relative hover:bg-[#EDE8DF]/60' : 'z-1 relative hover:bg-[#EDE8DF]/60'}
          getRowStyle={(row) => statusPortalPos?.leadId === row.id ? { zIndex: 50, position: 'relative' } : { zIndex: 1, position: 'relative' }}
        />
      </Card>

      {/* LEAD FORM MODAL (ADD & EDIT) */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 pt-10 sm:pt-6">
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
              className="relative w-full max-w-lg bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-cream-dark/60 pb-3">
                <h3 className="text-lg font-heading font-bold text-primary">
                  {selectedLead 
                    ? (language === 'EN' ? 'Edit Lead Details' : 'Lead Details Bewerken') 
                    : (language === 'EN' ? 'Add New Lead' : 'Nieuwe Lead Toevoegen')}
                </h3>
                <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg text-dark/40 hover:bg-cream-dark/20 hover:text-dark transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmitClick} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-dark/60 mb-1 font-body uppercase tracking-wider">{language === 'EN' ? 'Customer Name' : 'Klantnaam'}</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 text-[#4A4A43]"
                      placeholder={language === 'EN' ? 'e.g. John Doe' : 'b.v. Jan de Vries'}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-dark/60 mb-1 font-body uppercase tracking-wider">{language === 'EN' ? 'Phone Number' : 'Telefoonnummer'}</label>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 text-[#4A4A43]"
                      placeholder="+31 6 123..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-dark/60 mb-1 font-body uppercase tracking-wider">{language === 'EN' ? 'Email Address' : 'E-mailadres'}</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 text-[#4A4A43]"
                      placeholder="john@outdoors.nl"
                    />
                  </div>
                  {/* LOCATION / CITY CUSTOM DROPDOWN */}
                  <div className="relative">
                    <label className="block text-xs font-semibold text-dark/60 mb-1 font-body uppercase tracking-wider">{language === 'EN' ? 'Location / City' : 'Locatie / Stad'}</label>
                    <button
                      type="button"
                      onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs sm:text-sm font-body focus:outline-none text-[#4A4A43] flex items-center justify-between shadow-xs"
                    >
                      <span className="truncate">{form.location || (language === 'EN' ? '— Select City —' : '— Selecteer Stad —')}</span>
                      <ChevronDown className={`w-4 h-4 text-dark/40 transition-transform ${cityDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {cityDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setCityDropdownOpen(false)} />
                        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg shadow-xl max-h-48 overflow-y-auto divide-y divide-[#EDE8DF]">
                          {['', 'Amsterdam', 'Rotterdam', 'Den Haag', 'Utrecht', 'Eindhoven', 'Haarlem', 'Groningen', 'Breda', 'Tilburg', 'Almere', 'Nijmegen', 'Arnhem', 'Apeldoorn', 'Zwolle', 'Maastricht', 'Delft', 'Leiden', 'Dordrecht', 'Anders / Other'].map((city, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                setForm(prev => ({ ...prev, location: city }));
                                setCityDropdownOpen(false);
                              }}
                              className={`px-3 py-2 text-xs cursor-pointer hover:bg-primary/10 transition-colors ${form.location === city ? 'bg-primary/15 font-bold text-primary' : 'text-dark'}`}
                            >
                              {city === '' ? (language === 'EN' ? '— Select City —' : '— Selecteer Stad —') : city}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* PRODUCT TYPE CUSTOM DROPDOWN */}
                  <div className="relative">
                    <label className="block text-xs font-semibold text-dark/60 mb-1 font-body uppercase tracking-wider">{language === 'EN' ? 'Product Type' : 'Product Type'}</label>
                    <button
                      type="button"
                      onClick={() => setProductTypeDropdownOpen(!productTypeDropdownOpen)}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs sm:text-sm font-body focus:outline-none text-[#4A4A43] flex items-center justify-between shadow-xs"
                    >
                      <span className="truncate">
                        {form.productType === 'buitenkeuken' ? (language === 'EN' ? 'Outdoor Kitchen' : 'Buitenkeuken') :
                         form.productType === 'buitenverblijf' ? (language === 'EN' ? 'Garden / Outdoor Building' : 'Buitenverblijf / Tuinkamer') :
                         form.productType === 'overkapping' ? (language === 'EN' ? 'Canopy / Pergola' : 'Overkapping / Pergola') :
                         form.productType === 'poolhouse' ? 'Poolhouse' :
                         (form.productType || (language === 'EN' ? 'Outdoor Kitchen' : 'Buitenkeuken'))}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-dark/40 transition-transform ${productTypeDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {productTypeDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setProductTypeDropdownOpen(false)} />
                        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg shadow-xl max-h-48 overflow-y-auto divide-y divide-[#EDE8DF]">
                          {[
                            { val: 'buitenkeuken', label: language === 'EN' ? 'Outdoor Kitchen' : 'Buitenkeuken' },
                            { val: 'buitenverblijf', label: language === 'EN' ? 'Garden / Outdoor Building' : 'Buitenverblijf / Tuinkamer' },
                            { val: 'overkapping', label: language === 'EN' ? 'Canopy / Pergola' : 'Overkapping / Pergola' },
                            { val: 'poolhouse', label: 'Poolhouse' },
                            ...(() => {
                              try {
                                const dynCats = JSON.parse(localStorage.getItem('app_dynamic_categories') || '[]');
                                return dynCats
                                  .filter(c => !['buitenkeuken','buitenverblijf','overkapping','poolhouse'].includes((c.name||'').toLowerCase()))
                                  .map(c => ({ val: c.name, label: c.name }));
                              } catch(e) { return []; }
                            })()
                          ].map((pt, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                setForm(prev => ({ ...prev, productType: pt.val }));
                                setProductTypeDropdownOpen(false);
                              }}
                              className={`px-3 py-2 text-xs cursor-pointer hover:bg-primary/10 transition-colors ${form.productType === pt.val ? 'bg-primary/15 font-bold text-primary' : 'text-dark'}`}
                            >
                              {pt.label}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* DESIRED SIZE CUSTOM DROPDOWN (GUARANTEED DOWNWARDS ONLY) */}
                  <div className="relative">
                    <label className="block text-xs font-semibold text-dark/60 mb-1 font-body uppercase tracking-wider">{language === 'EN' ? 'Desired Size' : 'Gewenste Maat'}</label>
                    <button
                      type="button"
                      onClick={() => setSizeDropdownOpen(!sizeDropdownOpen)}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs sm:text-sm font-body focus:outline-none text-[#4A4A43] flex items-center justify-between shadow-xs"
                    >
                      <span className="truncate">{form.size || (language === 'EN' ? '— Select Size —' : '— Selecteer Maat —')}</span>
                      <ChevronDown className={`w-4 h-4 text-dark/40 transition-transform ${sizeDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {sizeDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setSizeDropdownOpen(false)} />
                        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg shadow-xl max-h-48 overflow-y-auto divide-y divide-[#EDE8DF]">
                          {[
                            { val: '', label: language === 'EN' ? '— Select Size —' : '— Selecteer Maat —' },
                            { val: '1x2m', label: '1 × 2 m' },
                            { val: '2x2m', label: '2 × 2 m' },
                            { val: '2x3m', label: '2 × 3 m' },
                            { val: '3x2m', label: '3 × 2 m' },
                            { val: '3x3m', label: '3 × 3 m' },
                            { val: '3x4m', label: '3 × 4 m' },
                            { val: '4x3m', label: '4 × 3 m' },
                            { val: '4x4m', label: '4 × 4 m' },
                            { val: '5x3m', label: '5 × 3 m' },
                            { val: '5x4m', label: '5 × 4 m' },
                            { val: '6x4m', label: '6 × 4 m' },
                            { val: '8x4m', label: '8 × 4 m' },
                            { val: '10x4m', label: '10 × 4 m' },
                            { val: 'Op maat / Custom', label: 'Op maat / Custom' }
                          ].map((sz, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                setForm(prev => ({ ...prev, size: sz.val }));
                                setSizeDropdownOpen(false);
                              }}
                              className={`px-3 py-2 text-xs cursor-pointer hover:bg-primary/10 transition-colors ${form.size === sz.val ? 'bg-primary/15 font-bold text-primary' : 'text-dark'}`}
                            >
                              {sz.label}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* SOURCE / CAMPAIGN CUSTOM DROPDOWN */}
                  <div className="relative">
                    <label className="block text-xs font-semibold text-dark/60 mb-1 font-body uppercase tracking-wider">{language === 'EN' ? 'Source / Campaign' : 'Bron / Campagne'}</label>
                    <button
                      type="button"
                      onClick={() => setSourceDropdownOpen(!sourceDropdownOpen)}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs sm:text-sm font-body focus:outline-none text-[#4A4A43] flex items-center justify-between shadow-xs"
                    >
                      <span className="truncate">{form.source || 'Google Ads'}</span>
                      <ChevronDown className={`w-4 h-4 text-dark/40 transition-transform ${sourceDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {sourceDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setSourceDropdownOpen(false)} />
                        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg shadow-xl max-h-48 overflow-y-auto divide-y divide-[#EDE8DF]">
                          {[
                            { val: 'Google Ads', label: 'Google Ads' },
                            { val: 'Facebook', label: 'Facebook / Instagram' },
                            { val: 'Direct', label: 'Direct / Telefonisch' },
                            { val: 'Referral', label: 'Referral / Aanbeveling' },
                            { val: 'Website', label: 'Website Contact Form' },
                            { val: 'Email', label: 'Email Campagne' },
                            { val: 'Beurs', label: 'Beurs / Event' },
                            { val: 'Anders', label: 'Anders / Other' }
                          ].map((src, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                setForm(prev => ({ ...prev, source: src.val }));
                                setSourceDropdownOpen(false);
                              }}
                              className={`px-3 py-2 text-xs cursor-pointer hover:bg-primary/10 transition-colors ${form.source === src.val ? 'bg-primary/15 font-bold text-primary' : 'text-dark'}`}
                            >
                              {src.label}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* STATUS CUSTOM DROPDOWN */}
                  <div className="relative">
                    <label className="block text-xs font-semibold text-dark/60 mb-1 font-body uppercase tracking-wider">{language === 'EN' ? 'Status' : 'Status'}</label>
                    <button
                      type="button"
                      onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs sm:text-sm font-body focus:outline-none text-[#4A4A43] flex items-center justify-between shadow-xs"
                    >
                      <span className="truncate">
                        {form.status === 'Nieuw' ? (language === 'EN' ? 'New' : 'Nieuw') :
                         form.status === 'In gesprek' ? (language === 'EN' ? 'In Conversation' : 'In gesprek') :
                         form.status === 'Offerte verstuurd' ? (language === 'EN' ? 'Quote Sent' : 'Offerte verstuurd') :
                         form.status === 'Gewonnen' ? (language === 'EN' ? 'Won' : 'Gewonnen') :
                         form.status === 'Verloren' ? (language === 'EN' ? 'Lost' : 'Verloren') :
                         (form.status || (language === 'EN' ? 'New' : 'Nieuw'))}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-dark/40 transition-transform ${statusDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {statusDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setStatusDropdownOpen(false)} />
                        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg shadow-xl max-h-48 overflow-y-auto divide-y divide-[#EDE8DF]">
                          {[
                            { val: 'Nieuw', label: language === 'EN' ? 'New' : 'Nieuw' },
                            { val: 'In gesprek', label: language === 'EN' ? 'In Conversation' : 'In gesprek' },
                            { val: 'Offerte verstuurd', label: language === 'EN' ? 'Quote Sent' : 'Offerte verstuurd' },
                            { val: 'Gewonnen', label: language === 'EN' ? 'Won' : 'Gewonnen' },
                            { val: 'Verloren', label: language === 'EN' ? 'Lost' : 'Verloren' }
                          ].map((st, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                setForm(prev => ({ ...prev, status: st.val }));
                                setStatusDropdownOpen(false);
                              }}
                              className={`px-3 py-2 text-xs cursor-pointer hover:bg-primary/10 transition-colors ${form.status === st.val ? 'bg-primary/15 font-bold text-primary' : 'text-dark'}`}
                            >
                              {st.label}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dark/60 mb-1 font-body uppercase tracking-wider">{language === 'EN' ? 'Initial Notes & Requirements' : 'Eerste Opmerkingen & Wensen'}</label>
                  <textarea
                    rows={3}
                    value={form.notes || ''}
                    onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs sm:text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 text-[#4A4A43] resize-none"
                    placeholder={language === 'EN' ? 'e.g. Customer requested 4m teak wood outdoor kitchen with gas grill...' : 'b.v. Klant wil een 4m teakhouten buitenkeuken...'}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-cream-dark/60">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>{language === 'EN' ? 'Cancel' : 'Annuleren'}</Button>
                  <Button type="submit">{language === 'EN' ? 'Save Lead' : 'Lead Opslaan'}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LOST REASON MODAL */}
      <AnimatePresence>
        {lostReasonModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-dark/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white border border-red-200 rounded-2xl p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center gap-3 text-red-600 mb-2">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-heading font-bold text-dark">Reason for Loss?</h3>
              </div>
              <p className="text-sm text-dark/60 font-body">Please specify why this deal was lost. This helps improve future sales strategies.</p>
              
              <textarea
                autoFocus
                value={lostReasonText}
                onChange={e => setLostReasonText(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-red-500/20 text-[#4A4A43] min-h-[80px] resize-none"
                placeholder="e.g., Price too high, chose competitor..."
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => {
                  setLostReasonModalOpen(false);
                  setPendingFormSubmit(null);
                }}>Cancel</Button>
                <Button type="button" variant="custom" className="bg-red-600 text-white hover:bg-red-700" onClick={() => {
                  if(!lostReasonText.trim()) return showToast("Please enter a reason.");
                  executeSubmit(pendingFormSubmit, lostReasonText);
                }}>
                  Confirm Loss
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3-DAY RED WARNING ALERT 1-CLICK FOLLOW-UP MODAL */}
      <AnimatePresence>
        {redAlertModalLead && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-dark/80 backdrop-blur-sm"
              onClick={() => setRedAlertModalLead(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#EDE8DF] border border-red-300 rounded-2xl p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-red-200 pb-3">
                <div className="flex items-center gap-2 text-red-700 font-heading font-bold text-base">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span>
                    {language === 'EN' ? '3-Day Follow-Up Reminder (1st Follow-up)' : '3-Dagen Opvolging Herinnering (1st Follow-up)'}
                  </span>
                </div>
                <button onClick={() => setRedAlertModalLead(null)} className="p-1 rounded-lg text-dark/40 hover:bg-cream-dark/20 hover:text-dark">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 font-body text-xs text-dark/80">
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800">
                  <p className="font-bold">⚠️ Lead: {redAlertModalLead.name} ({getProductTypeLabel(redAlertModalLead.productType)})</p>
                  <p className="text-[11px] mt-0.5">
                    {language === 'EN'
                      ? 'No contact for more than 3 days. Send a 1st follow-up message immediately to maintain conversion chance!'
                      : 'Er is al meer dan 3 dagen geen contact geweest met deze lead. Verstuur direct een 1st follow-up bericht om de kans op conversie te behouden!'}
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-dark/60 uppercase tracking-wider mb-1">
                    {language === 'EN' ? 'Ready-to-Send Message:' : 'Kant-en-klaar Bericht:'}
                  </label>
                  <textarea 
                    readOnly
                    rows={4}
                    value={language === 'EN'
                      ? `Dear ${redAlertModalLead.name}, we would love to know if you have any questions regarding your outdoor living inquiry. When would it suit you to talk over the phone? Best regards, Tim & Bram - Vanuit Ambacht`
                      : `Beste ${redAlertModalLead.name}, graag horen we of u nog vragen heeft over uw buitenkeuken aanvraag. Wanneer schikt het u om hier even over te bellen? Met vriendelijke groet, Tim & Bram - Vanuit Ambacht`
                    }
                    className="w-full p-3 bg-white border border-[#D6CFC2] rounded-xl text-xs font-body text-dark/90 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-[#D6CFC2]">
                <Button variant="outline" onClick={() => setRedAlertModalLead(null)} size="sm">
                  {language === 'EN' ? 'Cancel' : 'Annuleren'}
                </Button>
                <Button 
                  variant="custom" 
                  size="sm" 
                  onClick={() => handleSendRedAlertFollowUp(redAlertModalLead, 'copy')}
                  className="bg-white text-dark border border-[#D6CFC2] hover:bg-gray-50 text-xs"
                >
                  {language === 'EN' ? '📋 Copy Message' : '📋 Kopieer Bericht'}
                </Button>
                <Button 
                  variant="custom" 
                  size="sm" 
                  onClick={() => handleSendRedAlertFollowUp(redAlertModalLead, 'email')}
                  className="bg-blue-600 text-white hover:bg-blue-700 text-xs"
                >
                  {language === 'EN' ? '✉️ Send Email' : '✉️ Stuur E-mail'}
                </Button>
                <Button 
                  variant="custom" 
                  size="sm" 
                  onClick={() => handleSendRedAlertFollowUp(redAlertModalLead, 'whatsapp')}
                  className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold"
                >
                  {language === 'EN' ? '💬 Send via WhatsApp' : '💬 Verstuur via WhatsApp'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </>
      )}

      {/* SIMPLIFIED 7-STEP PARTNER PRICE REQUEST WIZARD MODAL */}
      <AnimatePresence>
        {partnerWizardLead && (
          <div className="fixed inset-0 z-[85] flex items-center justify-center p-2 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-dark/80 backdrop-blur-xs"
              onClick={() => setPartnerWizardLead(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white border border-[#D6CFC2] rounded-2xl p-5 sm:p-7 shadow-2xl z-10 space-y-5 max-h-[92vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-start border-b border-[#D6CFC2] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/10 text-primary font-bold text-xs font-mono px-2.5 py-0.5 rounded-md">
                      {language === 'EN' ? `Step ${partnerWizardStep} of 7` : `Stap ${partnerWizardStep} van 7`}
                    </span>
                    <h3 className="text-lg font-heading font-bold text-primary">
                      {language === 'EN' ? 'Partner Price Request Wizard' : 'Prijsaanvraag Partner Wizard'}
                    </h3>
                  </div>
                  <p className="text-xs text-dark/60 font-body mt-1">
                    {language === 'EN' ? `Inquiry request for ${partnerWizardLead.name}` : `Prijsaanvraag voor ${partnerWizardLead.name}`}
                  </p>
                </div>
                <button onClick={() => setPartnerWizardLead(null)} className="p-1 text-dark/40 hover:text-dark rounded-lg hover:bg-dark/5">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 7-Step Horizontal Progress Bar */}
              <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2 border-b border-[#D6CFC2]/60 text-[10px] font-mono font-bold">
                {[
                  { step: 1, label: language === 'EN' ? '1. Category' : '1. Categorie' },
                  { step: 2, label: language === 'EN' ? '2. Info' : '2. Gegevens' },
                  { step: 3, label: language === 'EN' ? '3. Dimensions' : '3. Maten' },
                  { step: 4, label: language === 'EN' ? '4. Materials' : '4. Materialen' },
                  { step: 5, label: language === 'EN' ? '5. Location' : '5. Locatie' },
                  { step: 6, label: language === 'EN' ? '6. Photos' : '6. Foto\'s' },
                  { step: 7, label: language === 'EN' ? '7. Review' : '7. Verstuur' }
                ].map((s) => (
                  <button
                    key={s.step}
                    onClick={() => setPartnerWizardStep(s.step)}
                    className={`px-2 py-1 rounded-md transition-all whitespace-nowrap ${
                      partnerWizardStep === s.step 
                        ? 'bg-primary text-cream shadow-xs' 
                        : partnerWizardStep > s.step 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-[#EDE8DF] text-dark/40'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Step Dynamic Content */}
              <div className="py-2 text-xs font-body">
                
                {/* STEP 1: CATEGORY */}
                {partnerWizardStep === 1 && (
                  <div className="space-y-3">
                    <label className="block font-bold text-dark text-sm mb-2">
                      {language === 'EN' ? 'Step 1: Select Product Category' : 'Stap 1: Selecteer Product Categorie'}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { titleNL: 'Buitenkeuken', titleEN: 'Outdoor Kitchen', descNL: 'Maatwerk Teak / Buitenkeuken', descEN: 'Custom Teak / Outdoor Kitchen' },
                        { titleNL: 'Overkapping', titleEN: 'Wooden Canopy', descNL: 'Eiken / Douglas Houten Overkapping', descEN: 'Oak / Douglas Wooden Canopy' },
                        { titleNL: 'Kliko-ombouw', titleEN: 'Bin Storage Unit', descNL: 'Kliko Ombouw Triple 240L', descEN: 'Bin Storage Triple 240L' },
                        { titleNL: 'Buitenverblijf', titleEN: 'Garden Building', descNL: 'Terras & Tuin Buitenverblijf', descEN: 'Terrace & Garden Building' }
                      ].map((item) => {
                        const displayTitle = language === 'EN' ? item.titleEN : item.titleNL;
                        const displayDesc = language === 'EN' ? item.descEN : item.descNL;
                        return (
                          <div 
                            key={item.titleNL}
                            onClick={() => setWizardForm(prev => ({ ...prev, category: item.titleNL }))}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${
                              wizardForm.category === item.titleNL
                                ? 'border-primary bg-primary/5 text-primary font-bold shadow-xs' 
                                : 'border-[#D6CFC2] hover:border-primary/40 text-dark/80'
                            }`}
                          >
                            <p className="font-bold text-xs">{displayTitle}</p>
                            <p className="text-[10px] text-dark/50 mt-0.5">{displayDesc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 2: BASIC DETAILS */}
                {partnerWizardStep === 2 && (
                  <div className="space-y-3">
                    <label className="block font-bold text-dark text-sm mb-2">
                      {language === 'EN' ? 'Step 2: Customer Contact & Delivery Details' : 'Stap 2: Klantgegevens en Leveradres'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">Customer Name</label>
                        <input 
                          type="text" 
                          value={wizardForm.customerName}
                          onChange={e => setWizardForm(prev => ({ ...prev, customerName: e.target.value }))}
                          className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">Email</label>
                        <input 
                          type="text" 
                          value={wizardForm.customerEmail}
                          onChange={e => setWizardForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                          className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">Phone</label>
                        <input 
                          type="text" 
                          value={wizardForm.customerPhone}
                          onChange={e => setWizardForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                          className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">Address / City</label>
                        <input 
                          type="text" 
                          value={wizardForm.address}
                          onChange={e => setWizardForm(prev => ({ ...prev, address: e.target.value }))}
                          className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: DIMENSIONS */}
                {partnerWizardStep === 3 && (
                  <div className="space-y-3">
                    <label className="block font-bold text-dark text-sm mb-2">
                      {language === 'EN' ? 'Step 3: Design & Dimensions (cm)' : 'Stap 3: Afmetingen en Ontwerp (cm)'}
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">Length (cm)</label>
                        <input 
                          type="number" 
                          value={wizardForm.lengthCm}
                          onChange={e => setWizardForm(prev => ({ ...prev, lengthCm: e.target.value }))}
                          className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs font-mono font-bold text-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">Width (cm)</label>
                        <input 
                          type="number" 
                          value={wizardForm.widthCm}
                          onChange={e => setWizardForm(prev => ({ ...prev, widthCm: e.target.value }))}
                          className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs font-mono font-bold text-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">Height (cm)</label>
                        <input 
                          type="number" 
                          value={wizardForm.heightCm}
                          onChange={e => setWizardForm(prev => ({ ...prev, heightCm: e.target.value }))}
                          className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs font-mono font-bold text-primary"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: MATERIALS */}
                {partnerWizardStep === 4 && (
                  <div className="space-y-3">
                    <label className="block font-bold text-dark text-sm mb-2">
                      {language === 'EN' ? 'Step 4: Wood Type & Countertop Material' : 'Stap 4: Houtsoort en Werkblad Materiaal'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">
                          {language === 'EN' ? 'Primary Wood Spec' : 'Houtsoort'}
                        </label>
                        <select
                          value={wizardForm.woodType || 'Thermo Fraké'}
                          onChange={e => setWizardForm(prev => ({ ...prev, woodType: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-bold text-primary"
                        >
                          <option value="Thermo Fraké">{language === 'EN' ? 'Thermo Fraké Wood' : 'Thermo Fraké Hout'}</option>
                          <option value="Massief Teakhout">{language === 'EN' ? 'Solid Teak Wood' : 'Massief Teakhout'}</option>
                          <option value="Eikenhout">{language === 'EN' ? 'Oak Wood' : 'Eikenhout'}</option>
                          <option value="Douglas Hout">{language === 'EN' ? 'Douglas Timber' : 'Douglas Hout'}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">
                          {language === 'EN' ? 'Worktop Finish' : 'Werkblad Afwerking'}
                        </label>
                        <select
                          value={wizardForm.countertop || 'Zwart Beton Cire 8cm'}
                          onChange={e => setWizardForm(prev => ({ ...prev, countertop: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-bold text-primary"
                        >
                          <option value="Zwart Beton Cire 8cm">{language === 'EN' ? 'Black Polished Concrete Cire (8cm)' : 'Zwart Beton Cire (8cm)'}</option>
                          <option value="Belgisch Hardsteen">{language === 'EN' ? 'Belgian Hardstone Granite' : 'Belgisch Hardsteen'}</option>
                          <option value="Massief Teak Werkblad">{language === 'EN' ? 'Solid Teak Top' : 'Massief Teak Werkblad'}</option>
                          <option value="RVS RVS Blad">{language === 'EN' ? 'Stainless Steel Top' : 'RVS Werkblad'}</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">
                        {language === 'EN' ? 'Special Hardware & Cutout Instructions' : 'Inbouw & Hardware Instructies'}
                      </label>
                      <textarea
                        value={wizardForm.materialNotes || (language === 'EN' ? 'Includes Big Green Egg Kamado cutout & stainless sink connections.' : 'Inclusief Kamado BBQ uitsparing & RVS spoelbak aansluiting.')}
                        onChange={e => setWizardForm(prev => ({ ...prev, materialNotes: e.target.value }))}
                        className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs min-h-[70px] resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 5: LOCATION */}
                {partnerWizardStep === 5 && (
                  <div className="space-y-3">
                    <label className="block font-bold text-dark text-sm mb-2">
                      {language === 'EN' ? 'Step 5: Site Access & Installation Location' : 'Stap 5: Locatie en Toegankelijkheid'}
                    </label>
                    <div>
                      <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">Garden Access Notes</label>
                      <textarea 
                        value={wizardForm.siteAccess}
                        onChange={e => setWizardForm(prev => ({ ...prev, siteAccess: e.target.value }))}
                        className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs min-h-[80px] resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 6: PHOTOS */}
                {partnerWizardStep === 6 && (
                  <div className="space-y-3">
                    <label className="block font-bold text-dark text-sm mb-2">
                      {language === 'EN' ? 'Step 6: Photos & 3D Render Attachments' : 'Stap 6: Foto\'s en 3D Ontwerp Bijlagen'}
                    </label>
                    <div className="p-4 bg-[#EDE8DF]/50 border border-dashed border-primary/30 rounded-xl text-center space-y-2">
                      <Upload className="w-6 h-6 text-primary mx-auto" />
                      <p className="font-bold text-xs text-primary">2 Files Attached</p>
                      <p className="text-[10px] text-dark/50">existing_garden_photo_01.jpg • 3d_render_model_v2.png</p>
                    </div>
                  </div>
                )}

                {/* STEP 7: REVIEW & DISPATCH */}
                {partnerWizardStep === 7 && (
                  <div className="space-y-3">
                    <label className="block font-bold text-dark text-sm mb-2">
                      {language === 'EN' ? 'Step 7: Review & Assign Partner' : 'Stap 7: Overzicht en Partner Toewijzen'}
                    </label>
                    <div className="p-3.5 bg-primary/5 border border-primary/20 rounded-xl space-y-2 text-xs">
                      <p className="font-bold text-primary">Inquiry Summary:</p>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div><span className="text-dark/50">Client:</span> <span className="font-bold">{wizardForm.customerName}</span></div>
                        <div><span className="text-dark/50">Category:</span> <span className="font-bold">{wizardForm.category}</span></div>
                        <div><span className="text-dark/50">Dimensions:</span> <span className="font-bold">{wizardForm.lengthCm}x{wizardForm.widthCm}x{wizardForm.heightCm} cm</span></div>
                        <div><span className="text-dark/50">Wood:</span> <span className="font-bold">{wizardForm.woodType}</span></div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">Select Craftsman Partner</label>
                      <select 
                        value={wizardForm.craftsmanPartner}
                        onChange={e => setWizardForm(prev => ({ ...prev, craftsmanPartner: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-bold text-primary"
                      >
                        <option value="CraftWood Veluwe">CraftWood Veluwe</option>
                        <option value="Timmerbedrijf Brabant">Timmerbedrijf Brabant</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Navigation */}
              <div className="flex justify-between items-center pt-3 border-t border-[#D6CFC2]">
                <Button variant="outline" onClick={() => partnerWizardStep > 1 ? setPartnerWizardStep(prev => prev - 1) : setPartnerWizardLead(null)}>
                  {partnerWizardStep > 1 ? '← Back' : 'Cancel'}
                </Button>
                {partnerWizardStep < 7 ? (
                  <Button onClick={() => setPartnerWizardStep(prev => prev + 1)}>Next Step →</Button>
                ) : (
                  <Button onClick={() => { showToast("Price request sent!"); setPartnerWizardLead(null); }} className="bg-emerald-600">Send Request 🚀</Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REACT PORTAL STATUS DROPDOWN — Rendered at body level (z-[99999]) to guarantee 100% ZERO clipping or table row overlapping */}
      {statusPortalPos && createPortal(
        <div 
          className="status-portal-menu fixed w-48 bg-white border border-[#C4BEB3] rounded-xl shadow-2xl z-[99999] py-1.5 font-body text-xs max-h-[240px] overflow-y-auto"
          style={{ top: `${statusPortalPos.top}px`, left: `${statusPortalPos.left}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 text-[10px] font-bold text-dark/50 uppercase tracking-wider border-b border-[#D6CFC2]/40 bg-[#F8F7F4] mb-1">
            {language === 'NL' ? 'Direct Status Wijzigen' : 'Change Status'}
          </div>
          {[
            { value: 'Nieuw', label: language === 'EN' ? 'New' : 'Nieuw' },
            { value: 'Bericht verstuurd', label: language === 'EN' ? 'Message Sent' : 'Bericht verstuurd' },
            { value: 'In gesprek', label: language === 'EN' ? 'In Conversation' : 'In gesprek' },
            { value: 'Offerte verstuurd', label: language === 'EN' ? 'Quote Sent' : 'Offerte verstuurd' },
            { value: 'Gewonnen', label: language === 'EN' ? 'Won' : 'Gewonnen' },
            { value: 'Verloren', label: language === 'EN' ? 'Lost' : 'Verloren' }
          ].map(item => (
            <button
              key={item.value}
              onClick={(e) => {
                e.stopPropagation();
                handleDirectStatusChange(statusPortalPos.leadId, item.value);
                setStatusPortalPos(null);
              }}
              className={`w-full text-left px-3 py-2 hover:bg-[#F8F7F4] flex items-center justify-between transition-colors cursor-pointer ${
                statusPortalPos.currentStatus === item.value ? 'bg-primary/10 font-bold text-primary' : 'text-dark/80'
              }`}
            >
              <span>{item.label}</span>
              {statusPortalPos.currentStatus === item.value && <CheckCircle className="w-3.5 h-3.5 text-primary" />}
            </button>
          ))}
        </div>,
        document.body
      )}

    </div>
  );
}
