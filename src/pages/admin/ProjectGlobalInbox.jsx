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
import { compressImage } from '../../utils/storageHelper';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { detectProjectType } from '../../utils/projectType';
import api from '../../api/apiClient';

export default function ProjectGlobalInbox({ onSelectProject }) {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const directFileInputRef = useRef(null);
  const [projects, setProjects] = useState([]);
  const [leadsList, setLeadsList] = useState([]);
  const [customersList, setCustomersList] = useState([]);
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
  const [activeTab, setActiveTab] = useState('All');
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

  // Load initial data from real API
  const loadProjectsData = async () => {
    try {
      const res = await api.get('/projects?limit=50');
      const localProjects = JSON.parse(localStorage.getItem('app_projects_v2') || '[]');
      const projectsArr = res.success
        ? (Array.isArray(res.data) ? res.data : (res.data?.items || res.data?.projects || []))
        : [];
      if (projectsArr.length > 0) {
        const merged = [
          ...projectsArr,
          ...localProjects.filter(lp => !projectsArr.some(bp => bp.id === lp.id || bp.projectNumber === lp.projectNumber || (lp.quoteId && bp.quoteId === lp.quoteId)))
        ];
        setProjects(merged);
      } else if (localProjects.length > 0) {
        setProjects(localProjects);
      } else if (res.success && Array.isArray(projectsArr)) {
        setProjects([]);
      }
    } catch {
      const localProjects = JSON.parse(localStorage.getItem('app_projects_v2') || '[]');
      if (localProjects.length > 0) setProjects(localProjects);
    }
  };

  useEffect(() => {
    loadProjectsData();
    window.addEventListener('app_data_changed', loadProjectsData);

    // Leads list for dropdowns (handles both { items: [...] } and [...])
    api.get('/leads?limit=100').then(res => {
      if (res.success) {
        const items = res.data?.items || (Array.isArray(res.data) ? res.data : []);
        setLeadsList(items);
      }
    }).catch(() => {});

    // Customers list for customer matching
    api.get('/customers?limit=100').then(res => {
      if (res.success) {
        const items = res.data?.items || (Array.isArray(res.data) ? res.data : []);
        setCustomersList(items);
      }
    }).catch(() => {});

    // Partners list for dropdowns (handles { items: [...] }, { partners: [...] }, or flat array)
    api.get('/partners?limit=100').then(res => {
      if (res.success) {
        const items = res.data?.items || res.data?.partners || (Array.isArray(res.data) ? res.data : []);
        setPartnersList(items);
      }
    }).catch(err => console.error('Failed to load partners:', err));

    return () => {
      window.removeEventListener('app_data_changed', loadProjectsData);
    };
  }, [modalOpen]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Inline partner re-assignment in table
  const handleInlinePartnerChange = async (projectId, newPartner) => {
    const partner = partnersList.find(p =>
      p.id === newPartner ||
      (p.companyName && p.companyName === newPartner) ||
      (p.contactPerson && p.contactPerson === newPartner) ||
      (p.name && p.name === newPartner)
    );
    if (!partner) {
      if (newPartner === 'Unassigned') {
        await api.put(`/projects/${projectId}`, { partnerId: null });
        await loadProjectsData();
        showToast('Partner unassigned.');
      } else {
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, partner: newPartner, partnerName: newPartner } : p));
        showToast(`Partner updated to "${newPartner}" for project ${projectId}!`);
      }
      return;
    }
    const res = await api.patch(`/projects/${projectId}/assign-partner`, {
      partnerId: partner.id,
      agreedBuildPrice: 0
    });
    if (res.success) {
      await loadProjectsData();
      showToast(`Partner updated to "${partner.companyName || partner.contactPerson}"!`);
    } else {
      showToast(`⚠ Failed to update partner: ${res.error?.message || 'Unknown error'}`);
    }
  };

  // Category type change dropdown (local display only — type is set at creation)
  const handleCategoryTypeChange = async (projectId, newType) => {
    const categoryName = newType === 'outdoor_kitchen' ? 'Outdoor Kitchen Project' : newType === 'garden_room' ? 'Garden Room Project' : 'Field Mapping';
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, projectType: newType, category: categoryName } : p));
    showToast(`Project type updated to "${categoryName}"!`);
  };

  // Confirm Partner for Good — PATCH assign-partner with lock flag
  const handleConfirmPartnerForGood = async (projectId) => {
    const project = projects.find(p => p.id === projectId);
    const partnerId = project?.partnerId;
    if (!partnerId) {
      showToast('⚠ No partner assigned yet — please assign a partner first.');
      return;
    }
    const res = await api.patch(`/projects/${projectId}/assign-partner`, {
      partnerId,
      agreedBuildPrice: project?.agreedBuildPrice || 0
    });
    if (res.success) {
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, isPartnerConfirmed: true, partnerStatus: 'Final / Locked' } : p));
      showToast(`Partner assignment confirmed and locked for project ${projectId}!`);
    } else {
      showToast(`⚠ ${res.error?.message || 'Failed to confirm partner'}`);
    }
  };

  const handleUnlockPartnerAssignment = (projectId) => {
    // Local UI unlock only — no direct backend endpoint for unlocking
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, isPartnerConfirmed: false, partnerStatus: 'Pending Confirmation' } : p));
    showToast(`Partner assignment unlocked for project ${projectId}.`);
  };

  const handleOpenAddModal = () => {
    setSelectedProject(null);
    const defaultCust = leadsList[0]?.name || '';

    setForm({
      name: '',
      customer: defaultCust,
      partner: 'Unassigned',
      progress: 10,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'In Progress'
    });
    setCustomerSelect(defaultCust || 'Other');
    setPartnerSelect('Unassigned');
    setModalOpen(true);
  };

  const handleOpenEditModal = (proj) => {
    setSelectedProject(proj);
    const cust = proj.customerName || (typeof proj.customer === 'string' ? proj.customer : proj.customer?.name) || 'Other';
    setCustomerSelect(cust);

    let partnerVal = 'Unassigned';
    if (proj.partnerId) {
      partnerVal = proj.partnerId;
    } else if (proj.partnerName || proj.partner) {
      const pName = (proj.partnerName || proj.partner || '').toLowerCase();
      const matched = partnersList.find(p =>
        (p.companyName && p.companyName.toLowerCase() === pName) ||
        (p.contactPerson && p.contactPerson.toLowerCase() === pName) ||
        (p.name && p.name.toLowerCase() === pName)
      );
      if (matched) partnerVal = matched.id;
    }
    setPartnerSelect(partnerVal);

    setForm({
      name: proj.name || '',
      customer: cust,
      partner: partnerVal,
      progress: proj.progress || proj.progressPercentage || 0,
      deadline: proj.deadline || '',
      status: proj.status || 'In Progress'
    });
    setModalOpen(true);
  };

  const handleDeleteProject = async (id, name) => {
    const res = await api.delete(`/projects/${id}`);
    if (res.success) {
      setProjects(prev => prev.filter(p => p.id !== id));
      showToast(`Project "${name}" deleted successfully.`);
    } else {
      showToast(`⚠ Failed to delete: ${res.error?.message || 'Unknown error'}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalCustomer = (customerSelect === 'Other' || !customerSelect ? form.customer : customerSelect).trim();
    const finalPartner = partnerSelect;

    if (!form.name.trim() || !finalCustomer) {
      showToast("Please enter valid Project and Customer names.");
      return;
    }

    // Resolve partnerId (UUID or null)
    let partnerId = null;
    if (finalPartner && finalPartner !== 'Unassigned') {
      const matchedPartner = partnersList.find(p =>
        p.id === finalPartner ||
        (p.companyName && p.companyName.toLowerCase() === finalPartner.toLowerCase()) ||
        (p.contactPerson && p.contactPerson.toLowerCase() === finalPartner.toLowerCase()) ||
        (p.name && p.name.toLowerCase() === finalPartner.toLowerCase())
      );
      partnerId = matchedPartner ? matchedPartner.id : (finalPartner.length === 36 ? finalPartner : null);
    }

    if (selectedProject) {
      // Edit existing project — PUT /api/projects/:id
      const body = {
        name: form.name,
        progressPercentage: parseInt(form.progress) || 0,
        orderStatus: form.status === 'Completed' ? 'voltooid' : 'in_voorbereiding',
        partnerId: partnerId,
      };
      const res = await api.put(`/projects/${selectedProject.id}`, body);
      if (res.success) {
        await loadProjectsData();
        showToast(`Project "${form.name}" updated successfully!`);
      } else {
        showToast(`⚠ ${res.error?.message || 'Failed to update project'}`);
      }
    } else {
      // Create new project — POST /api/projects
      // Resolve customerId
      let customerId = null;
      let deliveryAddress = 'Address not set';
      let city = 'Amsterdam';

      // 1. Try matching from leadsList
      const matchedLead = leadsList.find(l =>
        (l.name && l.name.toLowerCase() === finalCustomer.toLowerCase()) ||
        (l.fullName && l.fullName.toLowerCase() === finalCustomer.toLowerCase())
      );
      if (matchedLead) {
        customerId = matchedLead.customerId || matchedLead.id;
        if (matchedLead.address) deliveryAddress = matchedLead.address;
        if (matchedLead.city) city = matchedLead.city;
      }

      // 2. Try matching from customersList
      if (!customerId) {
        const matchedCust = customersList.find(c => {
          const fullName = `${c.firstName || ''} ${c.lastName || ''}`.trim();
          return (
            (c.companyName && c.companyName.toLowerCase() === finalCustomer.toLowerCase()) ||
            (fullName && fullName.toLowerCase() === finalCustomer.toLowerCase()) ||
            (c.name && c.name.toLowerCase() === finalCustomer.toLowerCase())
          );
        });
        if (matchedCust) {
          customerId = matchedCust.id;
          if (matchedCust.streetAddress) deliveryAddress = matchedCust.streetAddress;
          if (matchedCust.city) city = matchedCust.city;
        }
      }

      // 3. If still no customer found, auto-create customer in DB
      if (!customerId) {
        const parts = finalCustomer.split(/\s+/);
        const firstName = parts[0] || 'Klant';
        const lastName = parts.slice(1).join(' ') || (parts[0] ? 'Klant' : 'Onbekend');
        const cleanName = finalCustomer.toLowerCase().replace(/[^a-z0-9]/g, '');
        const newCustRes = await api.post('/customers', {
          firstName,
          lastName,
          email: `${cleanName || 'klant'}@vanuitambacht.nl`,
          phone: '+31 6 12345678',
          city: 'Amsterdam',
          streetAddress: deliveryAddress
        });
        if (newCustRes.success && newCustRes.data?.id) {
          customerId = newCustRes.data.id;
        }
      }

      if (!customerId) {
        showToast('⚠ Kon klant niet koppelen of aanmaken.');
        return;
      }

      const body = {
        name: form.name,
        projectType: 'outdoor_kitchen',
        customerId,
        partnerId,
        deliveryAddress,
        city,
        orderStatus: 'in_voorbereiding',
      };
      const res = await api.post('/projects', body);
      if (res.success) {
        await loadProjectsData();
        showToast(`Project "${form.name}" created successfully!`);
      } else {
        showToast(`⚠ ${res.error?.message || 'Failed to create project'}`);
      }
    }

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
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveDirectUpload = async () => {
    if (!selectedUploadFiles.length) {
      showToast('Please select at least one photo.');
      return;
    }
    const projectId = directUploadProject.id;
    let successCount = 0;
    for (const item of selectedUploadFiles) {
      const res = await api.post(`/projects/${projectId}/photos`, {
        photoUrl: item.preview,
        title: uploadForm.title.trim() || `Progress: ${uploadForm.captionCategory}`,
        caption: uploadForm.desc.trim() || 'Photo uploaded by admin team.',
        phase: uploadForm.captionCategory,
        craftsman: directUploadProject.partner || 'Admin team',
        tag: 'workshop',
        visibleToCustomer: uploadForm.isShared
      });
      if (res.success) successCount++;
    }
    if (successCount > 0) {
      showToast(`✓ Published ${successCount} photo(s) to Customer Portal & Media gallery!`);
    } else {
      showToast('⚠ Failed to upload photos. Please try again.');
    }
    setDirectUploadProject(null);
    setSelectedUploadFiles([]);
    setUploadForm({ captionCategory: 'Initial Construction', title: '', desc: '', isShared: true });
  };

  // Process & Filter Projects
  const filteredProjects = projects.filter(p => {
    const query = searchQuery.toLowerCase();
    const resolvedPartnerName =
      p.partnerName ||
      (p.partner && p.partner !== 'Unassigned' ? p.partner : '') ||
      (p.partnerId && partnersList.find(pt => pt.id === p.partnerId)?.companyName) ||
      '';

    const matchesSearch =
      (p.name || '').toLowerCase().includes(query) ||
      (p.customerName || (typeof p.customer === 'string' ? p.customer : p.customer?.name) || '').toLowerCase().includes(query) ||
      (p.id || '').toLowerCase().includes(query) ||
      (p.projectNumber || '').toLowerCase().includes(query) ||
      resolvedPartnerName.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;

    const pType = detectProjectType(p);
    let matchesTab = true;
    if (activeTab === 'Outdoor Kitchens' && pType !== 'outdoor_kitchen') matchesTab = false;
    if (activeTab === 'Outdoor Living Spaces' && pType !== 'garden_room') matchesTab = false;

    return matchesSearch && matchesStatus && matchesTab;
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
            {t('projects.title')}
          </h2>
          <p className="text-xs text-dark/70 mt-1 font-body">
            {t('projects.subtitle')}
          </p>
        </div>

        <Button icon={Plus} onClick={handleOpenAddModal} className="w-full sm:w-auto">
          {language === 'NL' ? 'Nieuw Project' : 'New Project'}
        </Button>
      </div>

      {/* Main Content Area Container matching screenshot */}
      <div className="bg-[#EAE4D9] border border-[#D6CFC2] rounded-3xl p-4 sm:p-5 space-y-2 sm:space-y-3 shadow-sm">

        {/* Top Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-[#D6CFC2]/60">
          {[
            { id: 'All', label: t('projects.allProjects') },
            { id: 'Outdoor Kitchens', label: t('projects.outdoorKitchens') },
            { id: 'Outdoor Living Spaces', label: t('projects.gardenRooms') }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-[#283523] text-white shadow-md'
                  : 'bg-white text-dark/70 border border-[#D6CFC2] hover:bg-[#FAF8F5]'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/40" />
            <input
              type="text"
              placeholder={t('projects.searchPlaceholder')}
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
              {t('common.filters')}
            </Button>
            {(searchQuery || statusFilter !== 'All') && (
              <Button
                variant="ghost"
                icon={RotateCcw}
                onClick={() => { setSearchQuery(''); setStatusFilter('All'); }}
                size="sm"
                className="text-xs text-dark/65"
              >
                {t('common.reset')}
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
                <label className="block text-[11px] font-bold text-dark/60 mb-1.5 uppercase tracking-wider">{t('leads.statusFilter')}</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'All', label: t('common.all') },
                    { id: 'In Progress', label: t('projects.inProgress') },
                    { id: 'Completed', label: t('common.completed') }
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setStatusFilter(st.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${statusFilter === st.id
                          ? 'bg-primary text-cream border-primary shadow-xs'
                          : 'bg-white text-dark/70 border-[#D6CFC2] hover:bg-[#EDE8DF]/60'
                        }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-dark/60 mb-1.5 uppercase tracking-wider">{t('invoices.sortBy')}</label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="w-full max-w-xs px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-semibold focus:outline-none shadow-xs"
                >
                  <option value="deadline">Deadline</option>
                  <option value="name">{t('common.name')}</option>
                  <option value="progress-desc">{t('common.progress')}</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ROW-CARD TABLE */}
        <div className="w-full overflow-x-auto pb-2 pt-0.5">
          <table className="w-full text-left text-xs border-separate border-spacing-y-2 min-w-[1000px]">
            <thead>
              <tr className="text-[11px] font-heading font-bold text-dark/50 uppercase tracking-wider">
                <th className="py-1.5 px-3 w-[100px] min-w-[100px]">{t('projects.project')}</th>
                <th className="py-1.5 px-3 w-[180px] min-w-[180px]">{t('projects.client')}</th>
                <th className="py-1.5 px-3 w-[170px] min-w-[170px]">{t('projects.type')}</th>
                <th className="py-1.5 px-3 w-[120px] min-w-[120px]">{t('projects.phase')}</th>
                <th className="py-1.5 px-3 w-[140px] min-w-[140px]">{t('projects.nextMilestone')}</th>
                <th className="py-1.5 px-3 w-[180px] min-w-[180px]">{t('projects.partner')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-xs font-body text-dark/40 bg-white rounded-2xl border border-[#D6CFC2]/60 shadow-xs">
                    {t('common.noResults')}
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
                      {/* 1. Project No. */}
                      <td
                        onClick={() => onSelectProject ? onSelectProject(row) : (pType === 'field_mapping' ? navigate('/admin/projects/field-mapping') : pType === 'garden_room' ? navigate('/admin/projects/garden-rooms') : navigate('/admin/projects/outdoor-kitchens'))}
                        className="py-3 px-3 rounded-l-xl border-y border-l border-[#E2DDD3] font-mono font-bold text-[11px] text-primary whitespace-nowrap"
                        title="Click to open project overview & tabs"
                      >
                        <span className="inline-flex items-center gap-1 bg-[#EAE4D9] group-hover:bg-[#33422C] group-hover:text-white text-[#33422C] px-2 py-1 rounded text-[11px] font-bold transition-all shadow-2xs">
                          {row.projectNumber || row.id || '–'}
                        </span>
                      </td>

                      {/* 2. Customer */}
                      <td
                        onClick={() => onSelectProject ? onSelectProject(row) : (pType === 'field_mapping' ? navigate('/admin/projects/field-mapping') : pType === 'garden_room' ? navigate('/admin/projects/garden-rooms') : navigate('/admin/projects/outdoor-kitchens'))}
                        className="py-3 px-3 border-y border-[#E2DDD3] text-dark text-[11px] font-bold"
                      >
                        <div className="flex flex-col">
                          <span>{row.customerName || (typeof row.customer === 'string' ? row.customer : row.customer?.name) || '–'}</span>
                          <span className="text-[9px] text-dark/60 font-medium leading-tight">{row.city || row.deliveryAddress || '–'}</span>
                        </div>
                      </td>

                      {/* 3. Type (Category + Value) */}
                      <td className="py-3 px-3 border-y border-[#E2DDD3] whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-dark text-[11px]">
                            {pType === 'garden_room' ? t('leads.gardenRoom') : pType === 'outdoor_kitchen' ? t('leads.outdoorKitchen') : 'Field Mapping'}
                          </span>
                          <span className="text-dark/60 font-mono text-[10px] leading-tight">
                            € {numericVal.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </td>

                      {/* 4. Phase (Status) */}
                      <td className="py-3 px-3 border-y border-[#E2DDD3] whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${row.status === 'Completed' ? 'bg-[#D1E7DD] text-[#0F5132]' : isConfirmed ? 'bg-emerald-100 text-emerald-900' : 'bg-[#FFF3CD] text-[#664D03]'
                          }`}>
                          {row.status === 'Completed' ? t('common.completed') : isConfirmed ? t('projects.toConfirm') : t('projects.toConfirm')}
                        </span>
                      </td>

                      {/* 5. Next Milestone */}
                      <td className="py-3 px-3 border-y border-[#E2DDD3] text-dark/70 text-[11px] font-mono">
                        {row.deadline || row.deliverySlot?.proposedDate || '–'}
                      </td>

                      {/* 6. Partner */}
                      <td className="py-3 px-3 rounded-r-xl border-y border-r border-[#E2DDD3] text-[11px]">
                        <div className="flex flex-col">
                          <span className="font-bold text-dark">
                            {row.partnerName ||
                             (row.partner && row.partner !== 'Unassigned' ? row.partner : null) ||
                             (row.partnerId && (partnersList.find(p => p.id === row.partnerId)?.companyName || partnersList.find(p => p.id === row.partnerId)?.contactPerson)) ||
                             t('projects.unassigned')}
                          </span>
                          <span className="text-[9px] text-dark/50">{t('projects.inProgress')}</span>
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
                    {language === 'NL' ? 'PROJECT FOTO BEHEER' : 'PROJECT PHOTO MANAGEMENT'}
                  </p>
                  <h3 className="text-base font-heading font-bold text-primary flex items-center gap-2 mt-0.5">
                    <Camera className="w-4 h-4 text-primary" />
                    <span>{language === 'NL' ? "Project Voortgangsfoto's Uploaden" : 'Upload Project Progress Photos'}</span>
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
                    {language === 'NL' ? 'GESELECTEERD PROJECT' : 'SELECTED PROJECT'}
                  </span>
                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-mono text-[11px] font-bold">
                    {directUploadProject.id}
                  </span>
                </div>
                <p className="font-bold text-dark text-sm">
                  {directUploadProject.name} — {directUploadProject.customer}
                </p>
                <div className="flex items-center justify-between text-xs text-dark/70 pt-0.5 font-mono">
                  <span>{language === 'NL' ? 'Klant:' : 'Customer:'} <strong className="text-dark font-body">{directUploadProject.customer}</strong></span>
                  <span>{language === 'NL' ? 'Oplevering:' : 'Delivery:'} <strong>{directUploadProject.deadline || directUploadProject.deliverySlot?.proposedDate || '–'}</strong></span>
                </div>
              </div>

              {/* Drag & Drop File Zone */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-dark/60 uppercase tracking-wider">
                  {language === 'NL' ? 'SELECTEER FOTOBESTANDEN (SLEEP OF BLADER) *' : 'SELECT PHOTO FILES (DRAG & DROP OR BROWSE) *'}
                </label>
                <div
                  onClick={() => directFileInputRef.current && directFileInputRef.current.click()}
                  className="border-2 border-dashed border-[#D6CFC2] hover:border-primary/60 bg-white/70 hover:bg-white p-6 rounded-2xl text-center cursor-pointer space-y-1.5 transition-colors shadow-2xs"
                >
                  <Camera className="w-8 h-8 text-primary mx-auto opacity-70" />
                  <p className="font-bold text-dark text-xs">
                    {language === 'NL' ? 'Klik of sleep meerdere fotobestanden hierheen' : 'Click or drag & drop multiple photo files here'}
                  </p>
                  <p className="text-[10px] text-dark/50 font-body">
                    {language === 'NL' ? 'PNG, JPG, WEBP · Meerdere bestanden ondersteund' : 'PNG, JPG, WEBP · Multiple files supported'}
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
                  <p className="font-bold text-dark text-xs">{language === 'NL' ? "Geselecteerde Foto's" : 'Selected Photos'} ({selectedUploadFiles.length}):</p>
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
                    {language === 'NL' ? 'VOORTGANGSCATEGORIE / FASE' : 'PROGRESS CATEGORY / PHASE'}
                  </label>
                  <select
                    value={uploadForm.captionCategory}
                    onChange={e => setUploadForm(prev => ({ ...prev, captionCategory: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-white border border-[#D6CFC2] rounded-xl text-xs font-semibold text-dark focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                  >
                    <option value="Initial Construction">{language === 'NL' ? '🔨 1. Constructie & Houtbewerking' : '🔨 1. Initial Construction (Houtbewerking)'}</option>
                    <option value="Frame & Cabinets">{language === 'NL' ? '🪚 2. Kasten & Frame' : '🪚 2. Frame & Cabinets (Kasten / Frame)'}</option>
                    <option value="Countertop Installation">{language === 'NL' ? '🏗️ 3. Werkblad Montage' : '🏗️ 3. Countertop Installation (Werkblad)'}</option>
                    <option value="Finishing & Inspection">{language === 'NL' ? '✨ 4. Afwerking & Inspectie' : '✨ 4. Finishing & Inspection (Afwerking)'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-dark/60 mb-1 uppercase tracking-wider">
                    {language === 'NL' ? 'FOTOTITEL / BESCHRIJVING' : 'PHOTO TITLE / CAPTION'}
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
                  {language === 'NL' ? 'OMSCHRIJVING & NOTITIES VOOR KLANT' : 'DESCRIPTION & NOTES FOR CUSTOMER'}
                </label>
                <textarea
                  rows={2}
                  value={uploadForm.desc}
                  onChange={e => setUploadForm(prev => ({ ...prev, desc: e.target.value }))}
                  placeholder={language === 'NL' ? 'bijv. Massief teakhouten frame geassembleerd en klaar voor werkblad...' : 'e.g. Solid teak frame assembled and ready for countertop polishing...'}
                  className="w-full px-3 py-2.5 bg-white border border-[#D6CFC2] rounded-xl text-xs text-dark focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs resize-none"
                />
              </div>

              {/* Customer Portal Share Card */}
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3 flex items-center justify-between shadow-2xs">
                <span className="text-xs font-bold text-emerald-950">
                  {language === 'NL' ? 'Direct zichtbaar in Klantportaal' : 'Share in Customer Portal Immediately'}
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
                  {language === 'NL' ? 'Annuleren' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveDirectUpload}
                  disabled={!selectedUploadFiles.length}
                  className="px-5 py-2 bg-[#6B7E62] hover:bg-[#57684E] disabled:bg-gray-400 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>{language === 'NL' ? "Foto's Publiceren" : 'Publish Photos'}</span>
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
                  {selectedProject
                    ? (language === 'NL' ? 'Project Bewerken' : 'Edit Project')
                    : (language === 'NL' ? 'Nieuw Project Aanmaken' : 'Create New Project')}
                </h3>
                <button onClick={() => setModalOpen(false)} className="p-1 text-dark/40 hover:text-dark">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">
                    {language === 'NL' ? 'Projectnaam *' : 'Project Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={language === 'NL' ? 'bijv. Luxe Teak Buitenkeuken 4m' : 'e.g. Luxury Teak Outdoor Kitchen 4m'}
                    className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-bold text-dark"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">
                      {language === 'NL' ? 'Klantnaam *' : 'Customer Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={form.customer}
                      onChange={e => setForm(prev => ({ ...prev, customer: e.target.value }))}
                      placeholder={language === 'NL' ? 'bijv. Jan Jansen' : 'e.g. John Miller'}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs text-dark"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">
                      {language === 'NL' ? 'Toegewezen Partner' : 'Assigned Partner'}
                    </label>
                    <select
                      value={partnerSelect}
                      onChange={e => setPartnerSelect(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-semibold text-dark"
                    >
                      <option value="Unassigned">{language === 'NL' ? 'Niet toegewezen' : 'Unassigned'}</option>
                      {partnersList.map((p, idx) => {
                        const displayName = p.companyName || p.contactPerson || p.name || `Partner ${idx + 1}`;
                        const contact = p.contactPerson && p.contactPerson !== p.companyName ? ` (${p.contactPerson})` : '';
                        return (
                          <option key={p.id || idx} value={p.id}>
                            {displayName}{contact}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">
                      {language === 'NL' ? 'Opleverdatum' : 'Completion Deadline'}
                    </label>
                    <input
                      type="date"
                      value={form.deadline}
                      onChange={e => setForm(prev => ({ ...prev, deadline: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs text-dark font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">
                      {language === 'NL' ? 'Status' : 'Status'}
                    </label>
                    <select
                      value={form.status}
                      onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-semibold text-dark"
                    >
                      <option value="In Progress">{language === 'NL' ? 'In uitvoering' : 'In Progress'}</option>
                      <option value="Completed">{language === 'NL' ? 'Voltooid' : 'Completed'}</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#D6CFC2]">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                    {language === 'NL' ? 'Annuleren' : 'Cancel'}
                  </Button>
                  <Button type="submit">
                    {selectedProject
                      ? (language === 'NL' ? 'Wijzigingen Opslaan' : 'Save Changes')
                      : (language === 'NL' ? 'Project Aanmaken' : 'Create Project')}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
