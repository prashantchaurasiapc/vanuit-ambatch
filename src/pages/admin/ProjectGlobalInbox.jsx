import React, { useState, useEffect, useRef } from 'react';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { 
  Plus, Search, Filter, Trash2, Edit2, X, CheckCircle, RotateCcw, 
  MapPin, Calendar, UserCheck, Layers, FileText, CheckSquare, 
  Sparkles, Truck, ShoppingBag, Download, Camera, Image as ImageIcon,
  Lock, Check, ChevronDown, FolderOpen
} from 'lucide-react';
import { downloadBlueprintPdf } from '../../utils/pdfGenerator';
import { useNavigate } from 'react-router-dom';
import { mockProjects, mockLeads, mockPartners } from '../../utils/mockData';
import { compressImage } from '../../utils/storageHelper';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { detectProjectType } from '../../utils/projectType';

export default function ProjectGlobalInbox({ onSelectProject }) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const directFileInputRef = useRef(null);
  const [projects, setProjects] = useState([]);
  const [leadsList, setLeadsList] = useState([]);
  const [partnersList, setPartnersList] = useState([]);

  // Direct Upload Popup Modal State
  const [directUploadProject, setDirectUploadProject] = useState(null);
  const [selectedUploadFiles, setSelectedUploadFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    captionCategory: 'Initial Construction',
    title: '',
    desc: '',
    isShared: true
  });

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('deadline');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  
  // Toast & Modal State
  const [toastMsg, setToastMsg] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
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
    status: 'In Progress'
  });

  // Load initial data
  useEffect(() => {
    const loadProjectsData = () => {
      const savedProjects = localStorage.getItem('app_projects');
      if (savedProjects) {
        try {
          const parsed = JSON.parse(savedProjects);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProjects(parsed);
          } else setProjects(mockProjects);
        } catch(e) { setProjects(mockProjects); }
      } else {
        setProjects(mockProjects);
        localStorage.setItem('app_projects', JSON.stringify(mockProjects));
      }
    };

    loadProjectsData();

    // Leads
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

    // Partners
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

    window.addEventListener('storage', loadProjectsData);
    window.addEventListener('app_data_changed', loadProjectsData);

    return () => {
      window.removeEventListener('storage', loadProjectsData);
      window.removeEventListener('app_data_changed', loadProjectsData);
    };
  }, [modalOpen]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Inline partner re-assignment in table
  const handleInlinePartnerChange = (projectId, newPartner) => {
    const updatedProjects = projects.map(p => p.id === projectId ? { ...p, partner: newPartner } : p);
    setProjects(updatedProjects);
    localStorage.setItem('app_projects', JSON.stringify(updatedProjects));
    window.dispatchEvent(new Event('app_data_changed'));
    showToast(`Partner updated to "${newPartner}" for project ${projectId}!`);
  };

  // Category type change dropdown
  const handleCategoryTypeChange = (projectId, newType) => {
    const categoryName = newType === 'outdoor_kitchen' ? 'Outdoor Kitchen Project' : newType === 'garden_room' ? 'Garden Room Project' : 'Field Mapping';
    const updatedProjects = projects.map(p => p.id === projectId ? { ...p, projectType: newType, category: categoryName } : p);
    setProjects(updatedProjects);
    localStorage.setItem('app_projects', JSON.stringify(updatedProjects));
    window.dispatchEvent(new Event('app_data_changed'));
    showToast(`Project type updated to "${categoryName}"!`);
  };

  // Confirm Partner for Good inside table
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
    showToast(`Partner assignment confirmed and locked for project ${projectId}!`);
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

  const handleOpenAddModal = () => {
    setSelectedProject(null);
    const defaultCust = leadsList[0]?.name || 'Other';
    const defaultPart = partnersList[0]?.name || 'Unassigned';

    setForm({
      name: '',
      customer: defaultCust === 'Other' ? '' : defaultCust,
      partner: defaultPart,
      progress: 10,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'In Progress'
    });
    setCustomerSelect(defaultCust);
    setPartnerSelect(defaultPart);
    setModalOpen(true);
  };

  const handleOpenEditModal = (proj) => {
    setSelectedProject(proj);
    setCustomerSelect(proj.customer || 'Other');
    setPartnerSelect(proj.partner || 'Unassigned');

    setForm({
      name: proj.name,
      customer: proj.customer,
      partner: proj.partner || 'Unassigned',
      progress: proj.progress || 0,
      deadline: proj.deadline || '',
      status: proj.status || 'In Progress'
    });
    setModalOpen(true);
  };

  const handleDeleteProject = (id, name) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem('app_projects', JSON.stringify(updated));
    window.dispatchEvent(new Event('app_data_changed'));
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
      const nextId = `P-${projects.length + 2001}`;
      const newProj = {
        id: nextId,
        name: form.name,
        customer: finalCustomer,
        partner: finalPartner,
        progress: parseInt(form.progress) || 10,
        deadline: form.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: form.status,
        orderStatus: 'In production',
        numericAmount: 15180,
        amount: '€ 15.180,00'
      };
      updatedList = [newProj, ...projects];
      showToast(`Project "${form.name}" created successfully!`);
    }

    setProjects(updatedList);
    localStorage.setItem('app_projects', JSON.stringify(updatedList));
    window.dispatchEvent(new Event('app_data_changed'));
    setModalOpen(false);
  };

  // Direct Upload Dialog Handlers
  const handleDirectFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setIsUploading(true);
    try {
      const compressedFiles = [];
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          const compressed = await compressImage(file, 1200, 0.85);
          compressedFiles.push({ file, preview: compressed, name: file.name });
        }
      }
      setSelectedUploadFiles(prev => [...prev, ...compressedFiles]);
      showToast(`Added ${compressedFiles.length} photo(s) for upload!`);
    } catch(err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveDirectUpload = () => {
    if (!selectedUploadFiles.length) {
      showToast('Please select at least one photo.');
      return;
    }
    const currentPhotos = JSON.parse(localStorage.getItem('app_project_photos') || '[]');
    const newItems = selectedUploadFiles.map((item, idx) => ({
      id: `P-${Date.now()}-${idx}`,
      projectId: directUploadProject.id,
      projectName: directUploadProject.name,
      customer: directUploadProject.customer,
      title: uploadForm.title.trim() || `Progress: ${uploadForm.captionCategory}`,
      description: uploadForm.desc.trim() || 'Photo uploaded by admin team.',
      img: item.preview,
      phase: uploadForm.captionCategory,
      craftsman: directUploadProject.partner || 'Hoek Bouw',
      uploaderRole: 'admin',
      isShared: uploadForm.isShared,
      date: new Date().toISOString().split('T')[0]
    }));

    const updatedPhotos = [...newItems, ...currentPhotos];
    localStorage.setItem('app_project_photos', JSON.stringify(updatedPhotos));
    window.dispatchEvent(new Event('app_data_changed'));
    showToast(`✓ Published ${newItems.length} photo(s) to Customer Portal & Media gallery!`);
    setDirectUploadProject(null);
    setSelectedUploadFiles([]);
    setUploadForm({ captionCategory: 'Initial Construction', title: '', desc: '', isShared: true });
  };

  // Process & Filter Projects
  const filteredProjects = projects.filter(p => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      (p.name || '').toLowerCase().includes(query) ||
      (p.customer || '').toLowerCase().includes(query) ||
      (p.id || '').toLowerCase().includes(query) ||
      (p.partner || '').toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'deadline') return new Date(a.deadline || 0) - new Date(b.deadline || 0);
    if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
    if (sortBy === 'progress-desc') return (b.progress || 0) - (a.progress || 0);
    if (sortBy === 'progress-asc') return (a.progress || 0) - (b.progress || 0);
    return 0;
  });

  return (
    <div className="space-y-6 font-body text-[#4A4A43] max-w-full mx-auto w-full px-1 sm:px-2">
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
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-primary">
            {language === 'NL' ? 'Projecten & Installatie Beheer' : 'Projects & Installation Management'}
          </h2>
          <p className="text-xs text-dark/70 mt-1 font-body">
            {language === 'NL' 
              ? 'Beheer actieve installaties, koppel vakmannen en bekijk bouwtekeningen.' 
              : 'Manage active installations, partner assignments, and technical blueprints.'}
          </p>
        </div>

        <Button icon={Plus} onClick={handleOpenAddModal} className="w-full sm:w-auto">
          {language === 'NL' ? 'Nieuw Project' : 'New Project'}
        </Button>
      </div>

      {/* Main Content Area Container matching screenshot */}
      <div className="bg-[#EAE4D9] border border-[#D6CFC2] rounded-3xl p-4 sm:p-6 space-y-4 shadow-sm">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/40" />
            <input
              type="text"
              placeholder={language === 'NL' ? 'Zoek op project, klant of order ID...' : 'Search by project, customer or order ID...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D6CFC2] rounded-xl text-xs font-body focus:outline-none focus:ring-2 focus:ring-primary/20 text-[#4A4A43] shadow-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={showFilterPanel ? 'primary' : 'outline'} 
              icon={Filter} 
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              size="sm"
              className="text-xs border-[#D6CFC2] bg-white shadow-2xs"
            >
              {language === 'NL' ? 'Filters' : 'Filters'}
            </Button>
            {(searchQuery || statusFilter !== 'All') && (
              <Button 
                variant="ghost" 
                icon={RotateCcw} 
                onClick={() => { setSearchQuery(''); setStatusFilter('All'); }}
                size="sm"
                className="text-xs text-dark/65"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Collapsible Filter Panel */}
        <AnimatePresence>
          {showFilterPanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-[#D6CFC2]/60 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs"
            >
              <div>
                <label className="block text-[11px] font-bold text-dark/60 mb-1.5 uppercase tracking-wider">Status Filter</label>
                <div className="flex flex-wrap gap-2">
                  {['All', 'In Progress', 'Completed'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        statusFilter === st
                          ? 'bg-primary text-cream border-primary shadow-xs'
                          : 'bg-white text-dark/70 border-[#D6CFC2] hover:bg-[#EDE8DF]/60'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-dark/60 mb-1.5 uppercase tracking-wider">Sort By</label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="w-full max-w-xs px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-semibold focus:outline-none shadow-xs"
                >
                  <option value="deadline">Deadline (Earliest)</option>
                  <option value="name">Project Name (A-Z)</option>
                  <option value="progress-desc">Progress (Highest)</option>
                  <option value="progress-asc">Progress (Lowest)</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================================ */}
        {/* ROW-CARD TABLE (Exact Screenshot Match with Explicit Widths) */}
        {/* ============================================================ */}
        <div className="w-full overflow-x-auto pb-4 pt-1">
          <table className="w-full text-left text-xs border-separate border-spacing-y-3.5 min-w-[1600px]">
            <thead>
              <tr className="text-[11px] font-heading font-bold text-dark/50 uppercase tracking-wider">
                <th className="py-2 px-4 w-[110px] min-w-[110px]">PROJECT NO.</th>
                <th className="py-2 px-4 w-[210px] min-w-[210px]">CATEGORY</th>
                <th className="py-2 px-4 w-[280px] min-w-[280px]">PROJECT</th>
                <th className="py-2 px-4 w-[150px] min-w-[150px]">CUSTOMER</th>
                <th className="py-2 px-4 w-[270px] min-w-[270px]">PARTNER</th>
                <th className="py-2 px-4 w-[140px] min-w-[140px]">STATUS</th>
                <th className="py-2 px-4 w-[150px] min-w-[150px]">VALUE (INCL. VAT)</th>
                <th className="py-2 px-4 w-[140px] min-w-[140px]">COMPLETION</th>
                <th className="py-2 px-4 w-[220px] min-w-[220px] text-left">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-xs font-body text-dark/40 bg-white rounded-2xl border border-[#D6CFC2]/60 shadow-xs">
                    No projects found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((row) => {
                  const isConfirmed = row.isPartnerConfirmed || row.partnerStatus === 'Final / Locked';
                  const pType = detectProjectType(row);
                  const numericVal = Number(row.numericAmount || (typeof row.amount === 'string' ? parseFloat(row.amount.replace(/[^\d.-]/g, '')) : row.amount) || 15180);

                  return (
                    <tr 
                      key={row.id}
                      className="bg-white shadow-xs hover:shadow-md hover:bg-[#FAF8F5]/80 transition-all group cursor-pointer"
                    >
                      {/* 1. Project No. (Clickable to open project overview) */}
                      <td 
                        onClick={() => onSelectProject ? onSelectProject(row) : (pType === 'field_mapping' ? navigate('/admin/projects/field-mapping') : pType === 'garden_room' ? navigate('/admin/projects/garden-rooms') : navigate('/admin/projects/outdoor-kitchens'))}
                        className="py-4 px-4 rounded-l-2xl border-y border-l border-[#E2DDD3] font-mono font-bold text-xs text-primary whitespace-nowrap"
                        title="Click to open project overview & tabs"
                      >
                        <span className="inline-flex items-center gap-1 bg-[#EAE4D9] group-hover:bg-[#33422C] group-hover:text-white text-[#33422C] px-2.5 py-1 rounded-md text-xs font-bold transition-all shadow-2xs">
                          {row.id}
                        </span>
                      </td>

                      {/* 2. Category Dropdown Pill (Explicit width, will NEVER shrink) */}
                      <td 
                        className="py-4 px-4 border-y border-[#E2DDD3]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={pType}
                          onChange={(e) => handleCategoryTypeChange(row.id, e.target.value)}
                          className="w-[200px] min-w-[200px] px-3.5 py-2 bg-white border border-[#D6CFC2] rounded-full text-xs font-semibold text-dark/80 focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer shadow-2xs hover:border-primary transition-colors"
                        >
                          <option value="outdoor_kitchen">Outdoor Kitchen Project</option>
                          <option value="garden_room">Garden Room Project</option>
                          <option value="field_mapping">Field Mapping</option>
                        </select>
                      </td>

                      {/* 3. Project Name (Clickable to open project overview) */}
                      <td 
                        onClick={() => onSelectProject ? onSelectProject(row) : (pType === 'field_mapping' ? navigate('/admin/projects/field-mapping') : pType === 'garden_room' ? navigate('/admin/projects/garden-rooms') : navigate('/admin/projects/outdoor-kitchens'))}
                        className="py-4 px-4 border-y border-[#E2DDD3] font-bold text-dark text-xs whitespace-nowrap"
                        title="Click to open project overview & tabs"
                      >
                        <span className="hover:underline font-bold text-dark group-hover:text-primary transition-colors">
                          {row.name}
                        </span>
                      </td>

                      {/* 4. Customer */}
                      <td 
                        onClick={() => onSelectProject ? onSelectProject(row) : (pType === 'field_mapping' ? navigate('/admin/projects/field-mapping') : pType === 'garden_room' ? navigate('/admin/projects/garden-rooms') : navigate('/admin/projects/outdoor-kitchens'))}
                        className="py-4 px-4 border-y border-[#E2DDD3] text-dark/80 text-xs font-medium whitespace-nowrap"
                      >
                        {row.customer}
                      </td>

                      {/* 5. Partner Assignment (Explicit width, will NEVER shrink) */}
                      <td className="py-4 px-4 border-y border-[#E2DDD3]" onClick={(e) => e.stopPropagation()}>
                        <div className="w-[240px] min-w-[240px] space-y-1.5">
                          {isConfirmed ? (
                            <div className="flex items-center justify-between gap-1.5 bg-emerald-50 border border-emerald-300 px-3 py-2 rounded-xl text-xs">
                              <span className="font-bold text-emerald-900 truncate">🔒 {row.partner}</span>
                              <button
                                onClick={() => handleUnlockPartnerAssignment(row.id)}
                                className="text-[10px] text-emerald-700 hover:text-emerald-900 underline font-semibold cursor-pointer flex-shrink-0"
                              >
                                Edit
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <select
                                value={row.partner || 'Unassigned'}
                                onChange={(e) => handleInlinePartnerChange(row.id, e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs font-semibold text-dark/80 focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer shadow-2xs"
                              >
                                <option value="Unassigned">Unassigned</option>
                                {partnersList.map((p, idx) => (
                                  <option key={idx} value={p.name}>{p.name}</option>
                                ))}
                              </select>
                              {row.partner && row.partner !== 'Unassigned' && (
                                <button
                                  onClick={() => handleConfirmPartnerForGood(row.id)}
                                  className="w-full py-2 px-3 bg-[#0F5132] hover:bg-[#0c4128] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
                                >
                                  ✓ Confirm Partner
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 6. Status Badge */}
                      <td className="py-4 px-4 border-y border-[#E2DDD3] whitespace-nowrap">
                        <span className={`inline-block px-3 py-1.5 rounded-full text-[11px] font-bold ${
                          row.status === 'Completed' ? 'bg-[#D1E7DD] text-[#0F5132]' : isConfirmed ? 'bg-emerald-100 text-emerald-900' : 'bg-[#FFF3CD] text-[#664D03]'
                        }`}>
                          {row.buildStatus || (isConfirmed ? 'In production' : 'To confirm')}
                        </span>
                      </td>

                      {/* 7. Value */}
                      <td className="py-4 px-4 border-y border-[#E2DDD3] font-mono font-bold text-dark text-xs whitespace-nowrap">
                        € {numericVal.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                      </td>

                      {/* 8. Completion */}
                      <td className="py-4 px-4 border-y border-[#E2DDD3] font-mono text-dark/70 text-xs whitespace-nowrap">
                        {row.deadline || '2026-09-15'}
                      </td>

                      {/* 9. Actions (Aligned directly under ACTIONS header) */}
                      <td className="py-4 px-4 rounded-r-2xl border-y border-r border-[#E2DDD3] whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setDirectUploadProject(row)}
                            className="text-primary hover:text-dark px-2 py-1.5 text-xs font-semibold cursor-pointer flex items-center gap-1 transition-colors"
                            title="Upload Project Photos"
                          >
                            <Camera className="w-3.5 h-3.5 text-dark/60" /> 
                            <span>Photos</span>
                          </button>
                          <button 
                            onClick={() => handleOpenEditModal(row)}
                            className="text-dark/50 hover:text-dark p-1.5 rounded-lg transition-colors cursor-pointer"
                            title="Edit Project Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProject(row.id, row.name)}
                            className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-xl border border-red-200 transition-colors cursor-pointer"
                            title="Delete Project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DIRECT UPLOAD POPUP MODAL (Exact match to second screenshot) */}
      <AnimatePresence>
        {directUploadProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-xs font-body">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#EDE8DF] border border-[#D6CFC2] rounded-3xl shadow-2xl max-w-xl w-full p-6 space-y-4 text-xs max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#D6CFC2]/70 pb-3">
                <div>
                  <p className="text-[10px] font-bold text-dark/40 uppercase tracking-wider font-mono">
                    PROJECT PHOTO MANAGEMENT
                  </p>
                  <h3 className="text-base font-heading font-bold text-primary flex items-center gap-2 mt-0.5">
                    <Camera className="w-4 h-4 text-primary" />
                    <span>Upload Project Progress Photos</span>
                  </h3>
                </div>
                <button 
                  onClick={() => setDirectUploadProject(null)} 
                  className="p-1 text-dark/40 hover:text-dark rounded-lg hover:bg-white/40 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Selected Project Card Box */}
              <div className="bg-white border border-[#D6CFC2] rounded-2xl p-4 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-dark/40 uppercase tracking-wider font-mono">
                    SELECTED PROJECT
                  </span>
                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-mono text-[11px] font-bold">
                    {directUploadProject.id}
                  </span>
                </div>
                <p className="font-bold text-dark text-sm">
                  {directUploadProject.name} — {directUploadProject.customer}
                </p>
                <div className="flex items-center justify-between text-xs text-dark/70 pt-0.5 font-mono">
                  <span>Customer: <strong className="text-dark font-body">{directUploadProject.customer}</strong></span>
                  <span>Delivery: <strong>{directUploadProject.deadline || '2026-09-15'}</strong></span>
                </div>
              </div>

              {/* Drag & Drop File Zone */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-dark/60 uppercase tracking-wider">
                  SELECT PHOTO FILES (DRAG & DROP OR BROWSE) *
                </label>
                <div 
                  onClick={() => directFileInputRef.current && directFileInputRef.current.click()}
                  className="border-2 border-dashed border-[#D6CFC2] hover:border-primary/60 bg-white/70 hover:bg-white p-6 rounded-2xl text-center cursor-pointer space-y-1.5 transition-colors shadow-2xs"
                >
                  <Camera className="w-8 h-8 text-primary mx-auto opacity-70" />
                  <p className="font-bold text-dark text-xs">
                    Click or drag & drop multiple photo files here
                  </p>
                  <p className="text-[10px] text-dark/50 font-body">
                    PNG, JPG, WEBP · Multiple files supported
                  </p>
                  <input 
                    type="file" 
                    ref={directFileInputRef} 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleDirectFileSelect} 
                  />
                </div>
              </div>

              {/* Previews if any */}
              {selectedUploadFiles.length > 0 && (
                <div className="space-y-1.5 bg-white p-3 rounded-2xl border border-[#D6CFC2]">
                  <p className="font-bold text-dark text-xs">Selected Photos ({selectedUploadFiles.length}):</p>
                  <div className="flex gap-2 overflow-x-auto py-1">
                    {selectedUploadFiles.map((item, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#D6CFC2] flex-shrink-0 group">
                        <img src={item.preview} alt="preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUploadFiles(prev => prev.filter((_, i) => i !== idx));
                          }}
                          className="absolute top-1 right-1 p-0.5 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form Two Columns: Progress Category & Photo Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-dark/60 mb-1 uppercase tracking-wider">
                    PROGRESS CATEGORY / PHASE
                  </label>
                  <select
                    value={uploadForm.captionCategory}
                    onChange={e => setUploadForm(prev => ({ ...prev, captionCategory: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-white border border-[#D6CFC2] rounded-xl text-xs font-semibold text-dark focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                  >
                    <option value="Initial Construction">🔨 1. Initial Construction (Houtbewerking)</option>
                    <option value="Frame & Cabinets">🪚 2. Frame & Cabinets (Kasten / Frame)</option>
                    <option value="Countertop Installation">🏗️ 3. Countertop Installation (Werkblad)</option>
                    <option value="Finishing & Inspection">✨ 4. Finishing & Inspection (Afwerking)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-dark/60 mb-1 uppercase tracking-wider">
                    PHOTO TITLE / CAPTION
                  </label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={e => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Massief Teakhout Frame Gezaagd..."
                    className="w-full px-3 py-2.5 bg-white border border-[#D6CFC2] rounded-xl text-xs text-dark focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                  />
                </div>
              </div>

              {/* Description & Notes */}
              <div>
                <label className="block text-[11px] font-bold text-dark/60 mb-1 uppercase tracking-wider">
                  DESCRIPTION & NOTES FOR CUSTOMER
                </label>
                <textarea
                  rows={2}
                  value={uploadForm.desc}
                  onChange={e => setUploadForm(prev => ({ ...prev, desc: e.target.value }))}
                  placeholder="e.g. Solid teak frame assembled and ready for countertop polishing..."
                  className="w-full px-3 py-2.5 bg-white border border-[#D6CFC2] rounded-xl text-xs text-dark focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs resize-none"
                />
              </div>

              {/* Customer Portal Share Card */}
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3 flex items-center justify-between shadow-2xs">
                <span className="text-xs font-bold text-emerald-950">
                  Share in Customer Portal Immediately
                </span>
                <input
                  type="checkbox"
                  id="shareCustomerCheck"
                  checked={uploadForm.isShared}
                  onChange={e => setUploadForm(prev => ({ ...prev, isShared: e.target.checked }))}
                  className="w-4 h-4 accent-emerald-700 cursor-pointer rounded"
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#D6CFC2]/70">
                <button
                  type="button"
                  onClick={() => setDirectUploadProject(null)}
                  className="px-4 py-2 bg-white border border-[#D6CFC2] hover:bg-[#EDE8DF] text-xs font-semibold text-dark/80 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveDirectUpload}
                  disabled={!selectedUploadFiles.length}
                  className="px-5 py-2 bg-[#6B7E62] hover:bg-[#57684E] disabled:bg-gray-400 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Publish Photos</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD / EDIT PROJECT MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-xs font-body">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-cream border border-[#D6CFC2] rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-[#D6CFC2] pb-3">
                <h3 className="text-base font-heading font-bold text-primary">
                  {selectedProject ? 'Edit Project' : 'Create New Project'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="p-1 text-dark/40 hover:text-dark">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">Project Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Luxury Teak Outdoor Kitchen 4m"
                    className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-bold text-dark"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">Customer Name *</label>
                    <input
                      type="text"
                      required
                      value={form.customer}
                      onChange={e => setForm(prev => ({ ...prev, customer: e.target.value }))}
                      placeholder="e.g. John Miller"
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs text-dark"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">Assigned Partner</label>
                    <select
                      value={partnerSelect}
                      onChange={e => setPartnerSelect(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-semibold text-dark"
                    >
                      <option value="Unassigned">Unassigned</option>
                      {partnersList.map((p, idx) => (
                        <option key={idx} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">Completion Deadline</label>
                    <input
                      type="date"
                      value={form.deadline}
                      onChange={e => setForm(prev => ({ ...prev, deadline: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs text-dark font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">Status</label>
                    <select
                      value={form.status}
                      onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-semibold text-dark"
                    >
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#D6CFC2]">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                  <Button type="submit">{selectedProject ? 'Save Changes' : 'Create Project'}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
