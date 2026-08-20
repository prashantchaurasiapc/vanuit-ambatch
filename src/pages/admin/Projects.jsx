import React, { useState, useEffect, useRef } from 'react';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import ProjectTracker from '../../components/ProjectTracker';
import { Plus, Search, Filter, Trash2, Edit2, X, CheckCircle, RotateCcw, Compass, MapPin, Calendar, UserCheck, Layers, FileText, CheckSquare, Sparkles, Truck, ShoppingBag, Download, Camera, Image as ImageIcon } from 'lucide-react';
import { downloadBlueprintPdf } from '../../utils/pdfGenerator';

import { useNavigate } from 'react-router-dom';
import { mockProjects, mockLeads, mockPartners } from '../../utils/mockData';
import { safeSetItem, compressImage } from '../../utils/storageHelper';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { tValue } from '../../utils/translator';
import { calculateOrderSettlement } from '../../utils/orderMatcher';
import { calculateProjectMarginWithPurchasing, UNIFIED_PURCHASING_CATEGORY } from '../../utils/purchasingAllocator';
import { detectProjectType } from '../../utils/projectType';


export default function Projects({ defaultCategoryFilter, titleOverride }) {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const directFileInputRef = useRef(null);
  const [projects, setProjects] = useState([]);
  const [bankTxns, setBankTxns] = useState([]);
  const [leadsList, setLeadsList] = useState([]);
  const [partnersList, setPartnersList] = useState([]);
  const [activeProjectDetail, setActiveProjectDetail] = useState(null);

  // Direct Upload Popup Modal State (for Actions column click)
  const [directUploadProject, setDirectUploadProject] = useState(null);
  const [selectedUploadFiles, setSelectedUploadFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    captionCategory: 'Initial Construction',
    title: '',
    desc: '',
    isShared: true
  });

  useEffect(() => {
    const handleResetProjectsView = () => {
      setActiveProjectDetail(null);
    };
    window.addEventListener('app_reset_projects_view', handleResetProjectsView);
    return () => window.removeEventListener('app_reset_projects_view', handleResetProjectsView);
  }, []);
  
  // Search & Filters State — Default to 'projects' so All Projects tab with full columns is shown by default
  const [activeTab, setActiveTab] = useState('projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(defaultCategoryFilter ? defaultCategoryFilter : 'All');
  const [sortBy, setSortBy] = useState('deadline');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  
  // Toast & Modal State
  const [toastMsg, setToastMsg] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [blueprintModalProject, setBlueprintModalProject] = useState(null); // Project object for technical blueprint modal
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Select values for dropdown bindings
  const [customerSelect, setCustomerSelect] = useState('Other');
  const [partnerSelect, setPartnerSelect] = useState('Unassigned');

  // Form State
  const [form, setForm] = useState({
    name: '',
    customer: '',
    partner: 'Unassigned',
    progress: 0,
    deadline: '',
    status: 'Pending'
  });

  // Load initial data & listen for dynamic quote-to-project conversions
  useEffect(() => {
    const loadProjectsData = () => {
      const savedProjects = localStorage.getItem('app_projects');
      if (savedProjects) {
        try {
          const parsed = JSON.parse(savedProjects);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const cleaned = parsed.filter(p => !((p.name || '').toLowerCase().includes('kliko') || (p.name || '').toLowerCase().includes('bin storage')));
            setProjects(cleaned.length > 0 ? cleaned : mockProjects);
          } else setProjects(mockProjects);
        } catch(e) { setProjects(mockProjects); }
      } else {
        setProjects(mockProjects);
        localStorage.setItem('app_projects', JSON.stringify(mockProjects));
      }
    };

    loadProjectsData();
    const loadBankTxnsData = () => {
      try {
        const savedBank = localStorage.getItem('app_bank_txns_v2') || localStorage.getItem('app_bank_txns');
        if (savedBank) setBankTxns(JSON.parse(savedBank));
      } catch(e) {}
    };
    loadBankTxnsData();

    window.addEventListener('storage', loadProjectsData);
    window.addEventListener('storage', loadBankTxnsData);
    window.addEventListener('app_data_changed', loadProjectsData);
    window.addEventListener('app_data_changed', loadBankTxnsData);

    // Leads (for customer selection dropdown)
    const savedLeads = localStorage.getItem('app_leads_v2') || localStorage.getItem('app_leads');
    if (savedLeads) {
      try {
        const parsed = JSON.parse(savedLeads);
        if (Array.isArray(parsed) && parsed.length > 0) setLeadsList(parsed);
        else setLeadsList(mockLeads);
      } catch(e) { setLeadsList(mockLeads); }
    } else {
      setLeadsList(mockLeads);
    }

    // Partners (for assignment dropdown)
    const savedPartners = localStorage.getItem('app_partners_v2') || localStorage.getItem('app_partners');
    if (savedPartners) {
      try {
        const parsed = JSON.parse(savedPartners);
        if (Array.isArray(parsed) && parsed.length > 0) setPartnersList(parsed);
        else setPartnersList(mockPartners);
      } catch(e) { setPartnersList(mockPartners); }
    } else {
      setPartnersList(mockPartners);
    }

    return () => {
      window.removeEventListener('storage', loadProjectsData);
      window.removeEventListener('app_data_changed', loadProjectsData);
    };
  }, [modalOpen]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Quick inline partner re-assignment in table
  const handleInlinePartnerChange = (projectId, newPartner) => {
    const updatedProjects = projects.map(p => p.id === projectId ? { ...p, partner: newPartner } : p);
    setProjects(updatedProjects);
    localStorage.setItem('app_projects', JSON.stringify(updatedProjects));
    window.dispatchEvent(new Event('app_data_changed'));
    showToast(`Partner updated to "${newPartner}" for project ${projectId}!`);
  };

  // Confirm Partner for Good inside Projects tab
  const handleConfirmPartnerForGood = (projectId) => {
    const updatedProjects = projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          isPartnerConfirmed: true,
          partnerStatus: 'Final / Locked'
        };
      }
      return p;
    });
    setProjects(updatedProjects);
    localStorage.setItem('app_projects', JSON.stringify(updatedProjects));
    window.dispatchEvent(new Event('app_data_changed'));
    showToast(`Partner assignment confirmed for good and locked for project ${projectId}!`);
  };

  const handleUnlockPartnerAssignment = (projectId) => {
    const updatedProjects = projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          isPartnerConfirmed: false,
          partnerStatus: 'Pending Confirmation'
        };
      }
      return p;
    });
    setProjects(updatedProjects);
    localStorage.setItem('app_projects', JSON.stringify(updatedProjects));
    window.dispatchEvent(new Event('app_data_changed'));
    showToast(`Partner assignment unlocked for project ${projectId}.`);
  };

  // Quick inline status update for Kliko Order
  const handleOrderStatusChange = (projectId, newStatus) => {
    const updatedProjects = projects.map(p => p.id === projectId ? { ...p, orderStatus: newStatus } : p);
    setProjects(updatedProjects);
    localStorage.setItem('app_projects', JSON.stringify(updatedProjects));
    window.dispatchEvent(new Event('app_data_changed'));
    showToast(`Order status update: "${newStatus}"!`);
  };

  // Quick inline progress update
  const handleProgressUpdate = (projectId, newProgress) => {
    const pVal = Math.min(100, Math.max(0, parseInt(newProgress) || 0));
    const newStatus = pVal === 100 ? 'Completed' : pVal > 0 ? 'In Progress' : 'Pending';
    const updatedProjects = projects.map(p => p.id === projectId ? { ...p, progress: pVal, status: newStatus } : p);
    setProjects(updatedProjects);
    localStorage.setItem('app_projects', JSON.stringify(updatedProjects));
    window.dispatchEvent(new Event('app_data_changed'));
    showToast(`Progress updated to ${pVal}%!`);
  };

  const handleOpenAddModal = () => {
    setSelectedProject(null);

    // Dynamic fresh reload of leads & partners for modal
    let freshLeads = leadsList;
    const savedLeads = localStorage.getItem('app_leads_v2') || localStorage.getItem('app_leads');
    if (savedLeads) {
      try { freshLeads = JSON.parse(savedLeads); setLeadsList(freshLeads); } catch(e){}
    }

    let freshPartners = partnersList;
    const savedPartners = localStorage.getItem('app_partners_v2') || localStorage.getItem('app_partners');
    if (savedPartners) {
      try { freshPartners = JSON.parse(savedPartners); setPartnersList(freshPartners); } catch(e){}
    }

    const defaultCust = freshLeads[0]?.name || 'Other';
    const defaultPart = freshPartners[0]?.name || 'Unassigned';

    setForm({
      name: '',
      customer: defaultCust === 'Other' ? '' : defaultCust,
      partner: defaultPart,
      progress: 0,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Pending'
    });
    setCustomerSelect(defaultCust);
    setPartnerSelect(defaultPart);
    setModalOpen(true);
  };

  const handleOpenEditModal = (proj) => {
    setSelectedProject(proj);
    
    const hasMatchingLead = leadsList.some(l => l.name === proj.customer);
    setCustomerSelect(hasMatchingLead ? proj.customer : 'Other');

    const hasMatchingPartner = partnersList.some(p => p.name === proj.partner) || proj.partner === 'Unassigned';
    setPartnerSelect(hasMatchingPartner ? proj.partner : 'Unassigned');

    setForm({
      name: proj.name,
      customer: proj.customer,
      partner: proj.partner,
      progress: proj.progress,
      deadline: proj.deadline,
      status: proj.status
    });
    setModalOpen(true);
  };

  const handleDeleteProject = (id, name) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem('app_projects', JSON.stringify(updated));
    showToast(`Project "${name}" deleted successfully.`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const finalCustomer = customerSelect === 'Other' ? form.customer : customerSelect;
    const finalPartner = partnerSelect;

    if (!form.name.trim() || !finalCustomer.trim()) {
      showToast("Please enter valid Project and Customer names.");
      return;
    }

    let updatedList = [];
    if (selectedProject) {
      // Edit mode
      updatedList = projects.map(p => {
        if (p.id === selectedProject.id) {
          return {
            ...p,
            name: form.name,
            customer: finalCustomer,
            partner: finalPartner,
            progress: parseInt(form.progress) || 0,
            deadline: form.deadline,
            status: form.status
          };
        }
        return p;
      });
      showToast(`Project "${form.name}" updated successfully!`);
    } else {
      // Add mode
      const newProj = {
        id: `P-${projects.length + 2001}`,
        name: form.name,
        customer: finalCustomer,
        partner: finalPartner,
        progress: parseInt(form.progress) || 0,
        deadline: form.deadline,
        status: form.status
      };
      updatedList = [newProj, ...projects];
      showToast(`Project "${form.name}" created successfully!`);
    }

    setProjects(updatedList);
    localStorage.setItem('app_projects', JSON.stringify(updatedList));
    window.dispatchEvent(new Event('app_data_changed'));
    setModalOpen(false);
  };

  // Handlers for Direct Upload Popup Modal (from Table Actions Click)
  const handleQuickSelectFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      try {
        const compressedSrc = await compressImage(file, 1200, 0.82);
        setSelectedUploadFiles(prev => [...prev, {
          name: file.name,
          src: compressedSrc
        }]);
      } catch (err) {
        console.warn('Compress image error:', err);
      }
    }
  };

  const handleQuickDropFiles = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      try {
        const compressedSrc = await compressImage(file, 1200, 0.82);
        setSelectedUploadFiles(prev => [...prev, {
          name: file.name,
          src: compressedSrc
        }]);
      } catch (err) {
        console.warn('Compress image error:', err);
      }
    }
  };

  const handleCategoryTypeChange = (projectId, newType) => {
    const updated = projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          projectType: newType,
          division: newType === 'outdoor_kitchen' ? 'Buitenkeukens op maat' : 'Buitenverblijven op maat',
          category: newType === 'outdoor_kitchen' ? 'Buitenkeukens' : newType === 'poolhouse' ? 'Poolhouse' : newType === 'canopy' ? 'Overkappingen' : 'Buitenverblijf'
        };
      }
      return p;
    });
    setProjects(updated);
    try {
      localStorage.setItem('app_projects', JSON.stringify(updated));
      window.dispatchEvent(new Event('app_data_changed'));
    } catch(e) {}
    showToast(language === 'EN' ? `Updated project type to ${newType}` : `Projecttype bijgewerkt naar ${newType}`);
  };

  const handleQuickRemoveFile = (idx) => {
    setSelectedUploadFiles(prev => prev.filter((_, i) => i !== idx));
  };


  const handleQuickUploadSubmit = async (e) => {
    e.preventDefault();
    if (!directUploadProject || selectedUploadFiles.length === 0) {
      return showToast(language === 'EN' ? 'Please select at least one photo file.' : 'Selecteer alstublieft minimaal één fotobestand.');
    }

    setIsUploading(true);

    const newPhotoEntries = selectedUploadFiles.map((fileObj, index) => ({
      id: `P-PRJ-${Date.now().toString().slice(-4)}-${index + 1}`,
      projectId: directUploadProject.id,
      projectName: directUploadProject.name,
      customer: directUploadProject.customer || 'Customer',
      title: uploadForm.title.trim() || `${uploadForm.captionCategory}: ${fileObj.name.replace(/\.[^/.]+$/, "")}`,
      phase: `${uploadForm.captionCategory} — ${new Date().toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' })}`,
      description: uploadForm.desc.trim() || `Project progress photo uploaded by Admin for ${directUploadProject.name}.`,
      img: fileObj.src,
      craftsman: 'Tim & Bram (Admin)',
      uploaderRole: 'admin',
      isShared: uploadForm.isShared,
      date: new Date().toISOString().split('T')[0]
    }));

    try {
      const savedPhotos = JSON.parse(localStorage.getItem('app_project_photos') || '[]');
      const updatedPhotos = [...newPhotoEntries, ...savedPhotos];
      safeSetItem('app_project_photos', updatedPhotos);
      window.dispatchEvent(new Event('app_data_changed'));
    } catch (err) {}

    setIsUploading(false);
    showToast(
      language === 'EN'
        ? `🚀 ${newPhotoEntries.length} photo(s) uploaded & delivered live to ${directUploadProject.customer}'s Customer Portal!`
        : `🚀 ${newPhotoEntries.length} foto('s) geüpload en verzonden naar het Klantenportaal van ${directUploadProject.customer}!`
    );

    setDirectUploadProject(null);
    setSelectedUploadFiles([]);
    setUploadForm({ captionCategory: 'Initial Construction', title: '', desc: '', isShared: true });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setSortBy('deadline');
  };

  // Filter & Search logic
  const filteredProjects = [...projects]
    .filter(p => {
      // Filter out any Kliko/Bin Storage item
      if ((p.name || '').toLowerCase().includes('kliko') || (p.name || '').toLowerCase().includes('bin storage')) return false;

      const nameMatch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const custMatch = (p.customer || '').toLowerCase().includes(searchQuery.toLowerCase());
      const partMatch = (p.partner || '').toLowerCase().includes(searchQuery.toLowerCase());
      const idMatch = (p.id || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSearch = nameMatch || custMatch || partMatch || idMatch;
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter || p.buildStatus === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'deadline') return new Date(a.deadline || 0) - new Date(b.deadline || 0);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'progress-desc') return (b.progress || 0) - (a.progress || 0);
      if (sortBy === 'progress-asc') return (a.progress || 0) - (b.progress || 0);
      return 0;
    });

  const translateProjectName = (name) => {
    if (language !== 'EN' || !name) return name;
    return name
      .replace(/Luxe Teak Buitenkeuken 4m/g, 'Luxury Teak Outdoor Kitchen 4m')
      .replace(/Eiken Houten Overkapping 6x4m/g, 'Oak Wooden Canopy 6x4m')
      .replace(/Buitenkeuken/g, 'Outdoor Kitchen')
      .replace(/Overkapping/g, 'Canopy');
  };

  const translateCategory = (cat) => {
    if (language !== 'EN' || !cat) return cat;
    return cat
      .replace(/Buitenkeukens/g, 'Outdoor Kitchens')
      .replace(/Overkappingen/g, 'Canopies')
      .replace(/Overkapping/g, 'Canopy')
      .replace(/Poolhouse/g, 'Poolhouse')
      .replace(/Snijplanken/g, 'Cutting Boards');
  };

  // Client Briefing Page 8/11 Exact Table Columns Schema
  const mainColumns = [
    { 
      header: language === 'EN' ? 'PROJECT NO.' : 'PROJECT NR.', 
      render: (row) => (
        <span className="font-mono text-xs font-bold text-primary">
          {row.id}
        </span>
      ) 
    },
    { 
      header: language === 'EN' ? 'CATEGORY' : 'CATEGORIE',
      style: { minWidth: '180px' },
      render: (row) => {
        const pType = detectProjectType(row);
        return (
          <select
            value={pType}
            onChange={(e) => handleCategoryTypeChange(row.id, e.target.value)}
            className="w-full px-2 py-1 bg-white border border-[#D6CFC2] rounded-lg text-[11px] font-bold text-primary focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer shadow-2xs"
            title="Change Project Type for Customer Portal"
          >
            <option value="outdoor_kitchen">Outdoor Kitchens</option>
            <option value="garden_room">Garden Rooms</option>
            <option value="poolhouse">Poolhouse</option>
            <option value="canopy">Canopy / Overkapping</option>
          </select>
        );
      }
    },

    { 
      header: language === 'EN' ? 'PROJECT' : 'PROJECT', 
      render: (row) => (
        <span className="font-bold text-primary text-xs flex items-center gap-1">
          {translateProjectName(row.name)}
        </span>
      )
    },
    { header: language === 'EN' ? 'CUSTOMER' : 'KLANT', accessor: 'customer' },
    { 
      header: language === 'EN' ? 'PARTNER' : 'PARTNER', 
      style: { minWidth: '200px' },
      render: (row) => {
        const isConfirmed = row.isPartnerConfirmed || row.partnerStatus === 'Final / Locked';
        return (
          <div className="space-y-1">
            {isConfirmed ? (
              <div className="flex items-center justify-between gap-1 bg-emerald-50 border border-emerald-300 p-1.5 rounded-lg text-xs">
                <span className="font-bold text-emerald-900 truncate" title="Partner confirmed for good">🔒 {row.partner}</span>
                <button
                  onClick={() => handleUnlockPartnerAssignment(row.id)}
                  className="text-[10px] text-emerald-700 hover:text-emerald-900 underline font-semibold flex-shrink-0 cursor-pointer"
                  title="Unlock partner selection"
                >
                  {language === 'EN' ? 'Edit' : 'Wijzigen'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-1 w-full min-w-0">
                <select
                  value={row.partner || 'Unassigned'}
                  onChange={(e) => handleInlinePartnerChange(row.id, e.target.value)}
                  className="w-full min-w-0 truncate px-2 py-1 bg-white border border-[#D6CFC2] rounded-lg text-xs font-body font-semibold text-dark/80 focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer"
                >
                  <option value="Unassigned">{language === 'EN' ? 'Unassigned' : 'Niet toegewezen'}</option>
                  {partnersList.map((p, idx) => (
                    <option key={idx} value={p.name}>{p.name} ({p.company})</option>
                  ))}
                </select>
                {row.partner && row.partner !== 'Unassigned' && (
                  <button
                    onClick={() => handleConfirmPartnerForGood(row.id)}
                    className="w-full py-1 px-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10px] font-bold shadow-xs cursor-pointer flex items-center justify-center gap-1"
                    title="Confirm Partner for Good & Lock"
                  >
                    ✓ {language === 'EN' ? 'Confirm Partner' : 'Bevestig Partner'}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      }
    },
    { 
      header: language === 'EN' ? 'STATUS' : 'STATUS', 
      render: (row) => {
        const buildSt = row.buildStatus || (row.status === 'Completed' || row.status === 'Afgerond' ? 'Completed' : row.status === 'In Progress' || row.status === 'In uitvoering' ? 'In production' : 'To confirm');
        return (
          <Badge variant={buildSt === 'Completed' || buildSt === 'Afgerond' ? 'success' : buildSt === 'In production' ? 'primary' : buildSt === 'On site' ? 'accent' : 'warning'}>
            {language === 'EN' 
              ? (buildSt === 'To confirm' ? 'To confirm' : buildSt === 'In production' ? 'In production' : buildSt === 'On site' ? 'On site' : 'Completed')
              : (buildSt === 'To confirm' ? 'Nog te bevestigen' : buildSt === 'In production' ? 'In productie' : buildSt === 'On site' ? 'Op locatie' : 'Afgerond')}
          </Badge>
        );
      }
    },
    {
      header: language === 'EN' ? 'VALUE (INCL. VAT)' : 'WAARDE (INCL. BTW)',
      style: { minWidth: '150px' },
      render: (row) => {
        const numericVal = Number(row.numericAmount || row.amount || row.price || 15180);
        return (
          <span className="font-mono text-xs font-bold text-primary">
            € {numericVal.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
          </span>
        );
      }
    },
    { header: language === 'EN' ? 'COMPLETION' : 'OPLEVERING', accessor: 'deadline' },
    {
      header: language === 'EN' ? 'ACTIONS' : 'ACTIES',
      render: (row) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setDirectUploadProject(row)}
            className="text-primary hover:bg-[#D6CFC2]/40 font-bold cursor-pointer"
            title="Upload Project Photos & Share with Customer"
          >
            <Camera className="w-3.5 h-3.5 mr-1 text-accent" /> {language === 'EN' ? 'Upload Photos' : 'Foto\'s Uploaden'}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleOpenEditModal(row)}
            className="text-dark/70 hover:bg-[#D6CFC2]/40"
            title="Edit Project Details"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button 
            variant="custom" 
            size="sm" 
            onClick={() => handleDeleteProject(row.id, row.name)}
            className="text-red-600 bg-red-50 hover:bg-red-100 border border-red-200"
            title="Delete Project"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      )
    }
  ];

  const columns = mainColumns;

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'All' || sortBy !== 'deadline';

  // Real Branded PDF Blueprint Document — direct download via jsPDF (no print dialog)
  const handleDownloadBlueprintPdf = (project) => {
    if (!project) return;
    const fileName = downloadBlueprintPdf(project);
    showToast(`Blueprint PDF gedownload: ${fileName}`);
  };

  const [adminNotifs, setAdminNotifs] = useState([]);

  useEffect(() => {
    const loadNotifs = () => {
      try {
        const saved = localStorage.getItem('app_admin_notifications');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setAdminNotifs(parsed);
        }
      } catch (e) {}
    };
    loadNotifs();
    window.addEventListener('storage', loadNotifs);
    window.addEventListener('app_data_changed', loadNotifs);
    return () => {
      window.removeEventListener('storage', loadNotifs);
      window.removeEventListener('app_data_changed', loadNotifs);
    };
  }, []);

  const unreadPhotoNotifs = adminNotifs.filter(n => n.type === 'partner_photo_upload');

  return (
    <div className="space-y-6 text-[#4A4A43] font-body relative">
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

      {/* DEDICATED PROJECT DETAIL TRACKER VIEW (Full Page Replace) */}
      {activeProjectDetail ? (
        <ProjectTracker
          project={activeProjectDetail}
          partnersList={partnersList}
          onClose={() => setActiveProjectDetail(null)}
          onUpdateProject={(updated) => {
            setActiveProjectDetail(updated);
            const updatedProjects = projects.map(p => p.id === updated.id ? updated : p);
            setProjects(updatedProjects);
            localStorage.setItem('app_projects', JSON.stringify(updatedProjects));
          }}
        />
      ) : (
        <>
          {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-primary">
            {language === 'EN' ? 'Projects & Installation Management' : 'Projecten & Installatie Beheer'}
          </h2>
          <p className="text-xs text-dark/70 mt-1 font-body">
            {language === 'EN' ? 'Manage active installations, partner assignments, and technical blueprints.' : 'Beheer actieve installaties, koppel vakmannen en bekijk bouwtekeningen.'}
          </p>
        </div>

        <Button icon={Plus} onClick={handleOpenAddModal}>
          {language === 'EN' ? '+ New Project' : '+ Nieuw Project'}
        </Button>
      </div>

      {/* Admin Notification Banner for Partner Photo Uploads */}
      <AnimatePresence>
        {unreadPhotoNotifs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-xl text-amber-950 text-xs flex flex-wrap items-center justify-between gap-3 shadow-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                📸
              </div>
              <div className="min-w-0">
                <span className="font-bold block truncate">
                  {unreadPhotoNotifs[0].title} — {unreadPhotoNotifs[0].message}
                </span>
                <span className="text-[10px] text-amber-900/80 font-mono">
                  {unreadPhotoNotifs[0].date} om {unreadPhotoNotifs[0].time} • Vakman {unreadPhotoNotifs[0].partnerName}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                const cleared = adminNotifs.filter(n => n.id !== unreadPhotoNotifs[0].id);
                setAdminNotifs(cleared);
                localStorage.setItem('app_admin_notifications', JSON.stringify(cleared));
                showToast('Melding gemarkeerd als gelezen.');
              }}
              className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-lg text-[11px] flex-shrink-0"
            >
              ✓ Marker als Gelezen
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <Card>
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/40" />
              <input
                type="text"
                placeholder={language === 'EN' ? 'Search by project, customer or order ID...' : 'Zoek op project, klant of order ID...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#EDE8DF]/30 border border-[#D6CFC2] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-[#4A4A43]"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={showFilterPanel ? 'primary' : 'outline'} 
                icon={Filter} 
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                size="sm"
              >
                {language === 'EN' ? 'Filters' : 'Filters'}
              </Button>
              {hasActiveFilters && (
                <Button 
                  variant="ghost" 
                  icon={RotateCcw} 
                  onClick={handleResetFilters}
                  size="sm"
                  className="text-xs text-dark/65"
                >
                  {language === 'EN' ? 'Reset' : 'Herstellen'}
                </Button>
              )}
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilterPanel && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-[#D6CFC2]/50 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-dark/60 mb-1.5 uppercase tracking-wider">{language === 'EN' ? 'Status Filter' : 'Status Filter'}</label>
                  <div className="flex flex-wrap gap-2">
                    {['All', 'Pending', 'In Progress', 'Completed'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          statusFilter === st
                            ? 'bg-primary text-cream border-primary shadow-sm'
                            : 'bg-[#EDE8DF]/30 text-dark/70 border-[#D6CFC2] hover:bg-[#EDE8DF]/60'
                        }`}
                      >
                        {st === 'All' ? (language === 'EN' ? 'All' : 'Alle') : st}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dark/60 mb-1.5 uppercase tracking-wider">{language === 'EN' ? 'Sort By' : 'Sorteren op'}</label>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="w-full max-w-xs px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs focus:outline-none"
                  >
                    <option value="deadline">{language === 'EN' ? 'Deadline (Earliest)' : 'Deadline (Eerst)'}</option>
                    <option value="name">{language === 'EN' ? 'Project Name (A-Z)' : 'Projectnaam (A-Z)'}</option>
                    <option value="progress-desc">{language === 'EN' ? 'Progress (Highest)' : 'Voortgang (Hoogste)'}</option>
                    <option value="progress-asc">{language === 'EN' ? 'Progress (Lowest)' : 'Voortgang (Laagste)'}</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================================================ */}
        {/* MOBILE CARD VIEW — 100% custom, no Table.jsx, no overflow   */}
        {/* ============================================================ */}
        <div className="md:hidden space-y-4">
          {filteredProjects.length === 0 ? (
            <div className="p-8 text-center text-xs font-body text-dark/40 rounded-2xl border border-[#C4BEB3]/35 bg-[#F8F7F4]">
              {language === 'EN' ? 'No projects found.' : 'Geen projecten gevonden.'}
            </div>
          ) : filteredProjects.map((row) => {
            const isConfirmed = row.isPartnerConfirmed || row.partnerStatus === 'Final / Locked';
            const projName = (row.name || '').toLowerCase();
            const cat = row.category || (projName.includes('kliko') ? 'Kliko-ombouw' : projName.includes('snijplanken') ? 'Snijplanken' : 'Buitenkeukens');
            const logoSrc = cat.includes('Kliko') ? '/logo_kliko.png' : cat.includes('Snijplanken') ? '/logo_snijplanken.png' : '/logo_buitenkeukens.png';
            const orderVal = Number(row.numericAmount || row.amount || row.price || 6990);
            const settlement = calculateOrderSettlement({ id: row.id, totalAmount: orderVal }, bankTxns);
            const linkedPurchasing = bankTxns.filter(t => t.category === UNIFIED_PURCHASING_CATEGORY && (t.projectRef === row.id || t.orderId === row.id || t.projectId === row.id || (t.customerName && (row.customer || '').toLowerCase().includes(t.customerName.toLowerCase()))));
            const marginInfo = calculateProjectMarginWithPurchasing(orderVal, linkedPurchasing);

            return (
              <div
                key={row.id}
                className="bg-[#F8F7F4] border border-[#C4BEB3]/60 rounded-2xl p-4 space-y-3 shadow-xs hover:border-primary/40 transition-colors w-full"
              >
                {/* Card Header: ID + Status */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#C4BEB3]/40">
                  <span className="font-mono text-xs font-bold text-primary">{row.id}</span>
                  <Badge variant={row.status === 'Completed' || row.status === 'Afgerond' ? 'success' : row.status === 'In Progress' || row.status === 'In uitvoering' ? 'primary' : 'warning'}>
                    {tValue(row.status, language)}
                  </Badge>
                </div>

                {/* Category */}
                <div className="flex items-center gap-2">
                  <img src={logoSrc} alt={cat} className="h-5 max-w-[60px] object-contain mix-blend-multiply flex-shrink-0" />
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{translateCategory(cat)}</span>
                </div>

                {/* Project Name */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-dark/50 block mb-0.5">Project Name</span>
                  <span className="font-bold text-primary text-xs">{translateProjectName(row.name)}</span>
                </div>

                {/* Customer */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-dark/50 block mb-0.5">Customer</span>
                  <span className="text-xs text-dark/80 font-medium">{row.customer}</span>
                </div>

                {/* Assigned Partner & Confirmation — 100% vertical, no flex-row */}
                <div className="w-full">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-dark/50 block mb-1.5">Assigned Partner</span>
                  {isConfirmed ? (
                    <div className="flex items-center justify-between gap-2 bg-emerald-50 border border-emerald-300 p-2 rounded-lg text-xs">
                      <span className="font-bold text-emerald-900 truncate">🔒 {row.partner}</span>
                      <button
                        onClick={() => handleUnlockPartnerAssignment(row.id)}
                        className="text-[10px] text-emerald-700 hover:text-emerald-900 underline font-semibold flex-shrink-0 cursor-pointer"
                      >
                        Wijzigen
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 w-full">
                      <select
                        value={row.partner}
                        onChange={(e) => handleInlinePartnerChange(row.id, e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-body font-semibold text-dark/80 focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer"
                      >
                        <option value="Unassigned">{language === 'EN' ? 'Unassigned' : 'Niet toegewezen'}</option>
                        {partnersList.map((p, idx) => (
                          <option key={idx} value={p.name}>{p.name} ({p.company})</option>
                        ))}
                      </select>
                      {row.partner && row.partner !== 'Unassigned' && (
                        <button
                          onClick={() => handleConfirmPartnerForGood(row.id)}
                          className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          ✓ Bevestig Partner Definitief
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Progress */}
                <div className="w-full">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-dark/50 block mb-1.5">Progress</span>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0" max="100" step="5"
                      value={row.progress || 0}
                      onChange={(e) => handleProgressUpdate(row.id, e.target.value)}
                      className="flex-1 accent-primary cursor-pointer h-1.5 bg-[#EDE8DF] rounded-lg"
                    />
                    <span className="text-[11px] font-bold text-primary font-mono w-9 text-right">{row.progress || 0}%</span>
                  </div>
                </div>

                {/* Deadline */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-dark/50 block mb-0.5">Deadline</span>
                  <span className="text-xs text-dark/80 font-medium font-mono">{row.deadline}</span>
                </div>

                {/* Payments */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-dark/50 block mb-1">Klantenbetalingen</span>
                  <div className="font-mono text-xs leading-tight space-y-0.5">
                    <p className="text-emerald-700 font-bold">Ontvangen: € {settlement.totalReceived.toLocaleString('nl-NL')}</p>
                    <p className={`font-bold ${settlement.outstanding > 0 ? 'text-amber-800' : 'text-emerald-900'}`}>
                      {settlement.outstanding > 0 ? `Open: € ${settlement.outstanding.toLocaleString('nl-NL')}` : '✓ Betaald / Settled'}
                    </p>
                  </div>
                </div>

                {/* Margin */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-dark/50 block mb-1">Inkoop &amp; Project Marge</span>
                  <div className="text-xs font-mono space-y-0.5">
                    <p className="text-blue-950 font-medium">Inkoop: € {marginInfo.totalPurchasing.toLocaleString('nl-NL')}</p>
                    <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-900 font-bold rounded-md">
                      Marge: € {marginInfo.projectMargin.toLocaleString('nl-NL')} ({marginInfo.marginPercentage}%)
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-[#C4BEB3]/40 flex flex-wrap items-center gap-2">
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => setDirectUploadProject(row)}
                    className="flex-1 min-w-[120px] text-primary hover:bg-[#D6CFC2]/40 font-bold cursor-pointer justify-center"
                  >
                    <Camera className="w-3.5 h-3.5 mr-1 text-accent" />
                    {language === 'EN' ? 'Upload Photos' : "Foto's Uploaden"}
                  </Button>
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => handleOpenEditModal(row)}
                    className="text-dark/70 hover:bg-[#D6CFC2]/40"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="custom" size="sm"
                    onClick={() => handleDeleteProject(row.id, row.name)}
                    className="text-red-600 bg-red-50 hover:bg-red-100 border border-red-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ============================================================ */}
        {/* DESKTOP TABLE VIEW — shown only >= md                        */}
        {/* ============================================================ */}
        <div className="hidden md:block">
          <Table columns={columns} data={filteredProjects} />
        </div>
      </Card>

      {/* PROJECT DETAIL TECHNICAL BLUEPRINT POPUP MODAL */}
      <AnimatePresence>
        {blueprintModalProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-dark/70 backdrop-blur-xs" onClick={() => setBlueprintModalProject(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-2xl bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start border-b border-[#D6CFC2] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-primary" />
                    <span className="text-xs font-bold text-accent uppercase tracking-wider font-mono">Technical Blueprint Spec</span>
                    <Badge variant="primary">{blueprintModalProject.id}</Badge>
                  </div>
                  <h3 className="text-xl font-heading font-bold text-primary mt-1">{blueprintModalProject.name}</h3>
                </div>
                <button onClick={() => setBlueprintModalProject(null)} className="p-1 text-dark/40 hover:text-dark"><X className="w-5 h-5" /></button>
              </div>

              {/* TECHNICAL SPECIFICATIONS & BLUEPRINT DETAILS */}
              <div className="space-y-4 text-xs font-body">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-[#D6CFC2]">
                    <span className="text-[10px] text-dark/50 font-bold uppercase block">{language === 'EN' ? 'Customer' : 'Klantnaam (Customer)'}</span>
                    <span className="font-bold text-dark text-sm">{blueprintModalProject.customer || 'Onbekend'}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#D6CFC2]">
                    <span className="text-[10px] text-dark/50 font-bold uppercase block">{language === 'EN' ? 'Assigned Craftsman' : 'Toegewezen Vakman'}</span>
                    <span className="font-bold text-primary text-sm">{blueprintModalProject.partner || 'Niet toegewezen'}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#D6CFC2]">
                    <span className="text-[10px] text-dark/50 font-bold uppercase block">{language === 'EN' ? 'Target Deadline' : 'Target Opleverdeadline'}</span>
                    <span className="font-bold text-dark text-sm flex items-center gap-1 mt-0.5"><Calendar className="w-3.5 h-3.5 text-accent" /> {blueprintModalProject.deadline || '2026-08-15'}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#D6CFC2]">
                    <span className="text-[10px] text-dark/50 font-bold uppercase block">{language === 'EN' ? 'Completion Progress' : 'Voortgang Status'}</span>
                    <span className="font-bold text-primary text-sm">{blueprintModalProject.progress || 0}% {language === 'EN' ? 'Completed' : 'Compleet'}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-[#D6CFC2] space-y-2.5">
                  <h4 className="font-bold text-primary uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-accent" /> {language === 'EN' ? 'Technical Materials & Dimensions' : 'Technische Materialen & Afmetingen'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-dark/50 font-semibold block text-[10px]">{language === 'EN' ? 'Dimensions:' : 'Afmetingen:'}</span>
                      <span className="font-mono font-bold text-dark">{blueprintModalProject.dimensions || '350cm x 90cm x 95cm'}</span>
                    </div>
                    <div>
                      <span className="text-dark/50 font-semibold block text-[10px]">{language === 'EN' ? 'Frame Material:' : 'Hout Frame:'}</span>
                      <span className="font-semibold text-dark">{blueprintModalProject.frameMaterial || 'Massief Teak Hout (FSC Certificaat)'}</span>
                    </div>
                    <div>
                      <span className="text-dark/50 font-semibold block text-[10px]">{language === 'EN' ? 'Countertop Material:' : 'Aanrechtblad:'}</span>
                      <span className="font-semibold text-dark">{blueprintModalProject.topMaterial || 'Polijst Beton (Dark Grey)'}</span>
                    </div>
                    <div>
                      <span className="text-dark/50 font-semibold block text-[10px]">{language === 'EN' ? 'Delivery Address:' : 'Opleverlocatie:'}</span>
                      <span className="font-semibold text-dark flex items-center gap-1"><MapPin className="w-3 h-3 text-primary flex-shrink-0" /> {blueprintModalProject.deliveryAddress || 'Keizersgracht 420, Amsterdam'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#F8F7F4] rounded-xl border border-[#D6CFC2] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <span className="font-bold text-dark text-xs block">BLU-{blueprintModalProject.id || '2001'}-SPEC.pdf</span>
                      <span className="text-[10px] text-dark/50">CAD Blueprint & Constructie Tekening (2.4 MB)</span>
                    </div>
                  </div>
                  <Button size="sm" icon={Download} onClick={() => handleDownloadBlueprintPdf(blueprintModalProject)}>
                    Download PDF
                  </Button>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-[#D6CFC2]/60">
                <Button variant="outline" onClick={() => setBlueprintModalProject(null)}>{language === 'EN' ? 'Close Blueprint' : 'Sluiten Blueprint'}</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE / EDIT FORM MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-4">
              <div className="flex items-center justify-between border-b border-cream-dark/60 pb-3">
                <h3 className="text-lg font-heading font-bold text-primary">
                  {selectedProject 
                    ? (language === 'EN' ? 'Edit Project Details' : 'Project Details Bewerken') 
                    : (language === 'EN' ? 'Create New Project' : 'Nieuw Project Aanmaken')}
                </h3>
                <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg text-dark/40 hover:text-dark"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-dark/60 mb-1 uppercase">{language === 'EN' ? 'Project Name' : 'Projectnaam'}</label>
                  <input type="text" required value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg" placeholder="e.g. Luxury Outdoor Kitchen" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-dark/60 mb-1 uppercase">{language === 'EN' ? 'Customer Name' : 'Klantnaam'}</label>
                    <select value={customerSelect} onChange={e => { setCustomerSelect(e.target.value); if(e.target.value !== 'Other') setForm(prev => ({ ...prev, customer: e.target.value })); }} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg">
                      {leadsList.map((l, idx) => (
                        <option key={idx} value={l.name}>{l.name}</option>
                      ))}
                      <option value="Other">{language === 'EN' ? 'Custom Customer...' : 'Aangepaste Klant...'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-dark/60 mb-1 uppercase">{language === 'EN' ? 'Assigned Craftsman' : 'Partner Vakman'}</label>
                    <select value={partnerSelect} onChange={e => setPartnerSelect(e.target.value)} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg">
                      <option value="Unassigned">{language === 'EN' ? 'Unassigned' : 'Niet toegewezen'}</option>
                      {partnersList.map((p, idx) => (
                        <option key={idx} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-dark/60 mb-1 uppercase">{language === 'EN' ? 'Progress (%)' : 'Voortgang (%)'}</label>
                    <input type="number" min="0" max="100" value={form.progress} onChange={e => setForm(prev => ({ ...prev, progress: e.target.value }))} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg font-bold text-primary" />
                  </div>
                  <div>
                    <label className="block font-semibold text-dark/60 mb-1 uppercase">{language === 'EN' ? 'Target Deadline' : 'Target Deadline'}</label>
                    <input type="date" value={form.deadline} onChange={e => setForm(prev => ({ ...prev, deadline: e.target.value }))} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg" />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-cream-dark/60">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>{language === 'EN' ? 'Cancel' : 'Annuleren'}</Button>
                  <Button type="submit">{selectedProject ? (language === 'EN' ? 'Save Changes' : 'Wijzigingen Opslaan') : (language === 'EN' ? 'Save Project' : 'Project Opslaan')}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIRECT UPLOAD PROJECT PROGRESS PHOTOS POPUP MODAL (MATCHES SCREENSHOT PRECISELY) */}
      <AnimatePresence>
        {directUploadProject && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-dark/75 backdrop-blur-xs z-[99999]" onClick={() => setDirectUploadProject(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-xl bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-[100000] space-y-4 text-xs font-body max-h-[90vh] overflow-y-auto my-auto text-[#4A4A43]">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b border-[#D6CFC2] pb-3">
                <div>
                  <span className="text-[10px] font-bold text-dark/50 uppercase font-mono tracking-wider">PROJECT PHOTO MANAGEMENT</span>
                  <h3 className="font-heading font-bold text-primary text-base flex items-center gap-2 mt-0.5">
                    <Camera className="w-5 h-5 text-accent" />
                    <span>{language === 'EN' ? 'Upload Project Progress Photos' : 'Upload Project Progress Photos'}</span>
                  </h3>
                </div>
                <button onClick={() => setDirectUploadProject(null)} className="p-1 text-dark/40 hover:text-dark cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Selected Project Card Banner */}
              <div className="p-3.5 bg-white rounded-xl border border-[#D6CFC2] space-y-1.5 shadow-2xs">
                <div className="flex justify-between items-center text-[10px] text-dark/50">
                  <span className="font-bold uppercase tracking-wider">SELECTED PROJECT</span>
                  <Badge variant="info" className="font-mono font-bold text-xs">{directUploadProject.id}</Badge>
                </div>
                <p className="font-heading font-bold text-primary text-sm truncate">
                  {directUploadProject.name} — {directUploadProject.customer}
                </p>
                <div className="flex justify-between items-center text-[11px] text-dark/60 font-mono pt-0.5">
                  <span>Customer: <strong className="text-primary font-bold">{directUploadProject.customer}</strong></span>
                  <span>Delivery: <strong className="text-dark/80 font-bold">{directUploadProject.deadline || '2026-12-12'}</strong></span>
                </div>
              </div>

              <form onSubmit={handleQuickUploadSubmit} className="space-y-4">
                {/* Select Photo Files (Drag & Drop Zone) */}
                <div>
                  <label className="block font-bold text-dark/70 mb-1 uppercase tracking-wider text-[10px]">
                    SELECT PHOTO FILES (DRAG & DROP OR BROWSE) *
                  </label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleQuickDropFiles}
                    onClick={() => directFileInputRef.current?.click()}
                    className={`border-2 border-dashed p-6 rounded-2xl text-center cursor-pointer transition-all ${
                      isDragging ? 'border-primary bg-primary/10' : 'border-[#D6CFC2] bg-white hover:bg-[#F8F7F4]'
                    }`}
                  >
                    <Camera className="w-8 h-8 text-primary mx-auto mb-2 opacity-80" />
                    <p className="text-xs font-bold text-primary">
                      Click or drag & drop multiple photo files here
                    </p>
                    <p className="text-[10px] text-dark/50 mt-0.5">PNG, JPG, WEBP • Multiple files supported</p>
                    <input
                      type="file"
                      ref={directFileInputRef}
                      multiple
                      accept="image/*"
                      onChange={handleQuickSelectFiles}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Selected Photo Previews Grid with Remove (X) button */}
                {selectedUploadFiles.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-dark/60 uppercase">Selected Previews ({selectedUploadFiles.length}):</span>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1.5 bg-white rounded-xl border border-[#D6CFC2]">
                      {selectedUploadFiles.map((fileObj, idx) => (
                        <div key={idx} className="relative group rounded-lg overflow-hidden border border-[#D6CFC2] h-20 bg-black/10">
                          <img src={fileObj.src} alt={fileObj.name} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleQuickRemoveFile(idx); }}
                            className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors shadow-xs cursor-pointer z-10"
                            title="Remove Photo"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] truncate px-1 py-0.5">
                            {fileObj.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grid: Category / Phase & Caption */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-dark/60 mb-1 uppercase text-[10px]">
                      PROGRESS CATEGORY / PHASE
                    </label>
                    <select
                      value={uploadForm.captionCategory}
                      onChange={e => setUploadForm(prev => ({ ...prev, captionCategory: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs font-bold text-primary"
                    >
                      <option value="Initial Construction">🔨 1. Initial Construction (Houtbewerking)</option>
                      <option value="Frame Completed">📐 2. Frame Completed (Frame Gemonteerd)</option>
                      <option value="Countertop Installation">✨ 3. Countertop Installation (Betonblad)</option>
                      <option value="Final Installation">🏆 4. Final Installation & Inspection (Eindkeuring)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-dark/60 mb-1 uppercase text-[10px]">
                      PHOTO TITLE / CAPTION
                    </label>
                    <input
                      type="text"
                      value={uploadForm.title}
                      onChange={e => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs font-bold text-dark"
                      placeholder="e.g. Massief Teakhout Frame Gezaagd"
                    />
                  </div>
                </div>

                {/* Description & Notes */}
                <div>
                  <label className="block font-bold text-dark/60 mb-1 uppercase text-[10px]">
                    DESCRIPTION & NOTES FOR CUSTOMER
                  </label>
                  <textarea
                    rows={2}
                    value={uploadForm.desc}
                    onChange={e => setUploadForm(prev => ({ ...prev, desc: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs text-dark"
                    placeholder="e.g. Solid teak frame assembled and ready for countertop polishing..."
                  />
                </div>

                {/* Share Banner Checkbox */}
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950">
                    Share in Customer Portal Immediately
                  </span>
                  <input
                    type="checkbox"
                    checked={uploadForm.isShared}
                    onChange={e => setUploadForm(prev => ({ ...prev, isShared: e.target.checked }))}
                    className="w-4 h-4 accent-emerald-600 cursor-pointer"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-2 pt-3 border-t border-[#D6CFC2]">
                  <Button type="button" variant="outline" onClick={() => setDirectUploadProject(null)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={selectedUploadFiles.length === 0 || isUploading}
                    className={`font-bold transition-all ${
                      selectedUploadFiles.length > 0 ? 'bg-primary text-cream hover:bg-primary/90' : 'bg-dark/20 text-dark/40 cursor-not-allowed'
                    }`}
                  >
                    {isUploading ? 'Uploading...' : `🚀 Save & Share ${selectedUploadFiles.length} Photos`}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
        </>
      )}
    </div>
  );
}
