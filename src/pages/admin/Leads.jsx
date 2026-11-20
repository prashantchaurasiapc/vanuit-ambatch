import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import WorkflowTracker from '../../components/WorkflowTracker';
import {
  Plus, Search, Filter, X, CheckCircle, Trash2, Edit2, RotateCcw,
  AlertTriangle, ChevronDown, Download, Upload, Send, FileText,
  Loader2, AlertCircle, Paperclip
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { tValue } from '../../utils/translator';
import api from '../../api/apiClient';
import { getActiveCategories, getActiveWoodTypes, getActiveMaterials } from '../../utils/productConfigManager';
import { parseAndNormalizeLeadsCSV } from '../../utils/csvParser';
import { useDataSync } from '../../hooks/useDataSync';

// Helper to map backend product enum to frontend UI string
function mapBackendProductToUI(pt) {
  switch (pt) {
    case 'outdoor_kitchen': return 'Buitenkeukens';
    case 'garden_room': return 'Buitenverblijven';
    case 'canopy': return 'Overkappingen';
    case 'bin_storage': return 'Kliko-ombouw';
    default: return pt || 'Buitenkeukens';
  }
}

// Helper to map UI product string to backend enum
function mapUIToBackendProduct(pt) {
  if (!pt) return 'outdoor_kitchen';
  const lower = pt.toLowerCase();
  if (lower.includes('buitenverblijf') || lower.includes('garden') || lower.includes('tuinkamer') || lower.includes('poolhouse')) {
    return 'garden_room';
  }
  if (lower.includes('overkapping') || lower.includes('canopy') || lower.includes('pergola') || lower.includes('veranda')) {
    return 'canopy';
  }
  if (lower.includes('kliko') || lower.includes('bin') || lower.includes('storage') || lower.includes('snijplank')) {
    return 'bin_storage';
  }
  return 'outdoor_kitchen';
}

// Helper to map backend status to frontend display string
function mapBackendStatusToUI(status) {
  switch (status) {
    case 'new': return 'Nieuw';
    case 'in_conversation': return 'In gesprek';
    case 'price_requested': return 'Prijsaanvraag';
    case 'price_received': return 'Prijs ontvangen';
    case 'quote_sent': return 'Offerte verstuurd';
    case 'won': return 'Gewonnen';
    case 'lost': return 'Verloren';
    default: return status || 'Nieuw';
  }
}

// Brief 2.1: Derive status strictly from workflow step across entire portal
function deriveStatusFromWorkflow(step, isLost = false, rawStatus = '') {
  if (isLost || rawStatus === 'lost') return 'Verloren';
  const s = Number(step) || 1;
  if (s <= 1) return 'Nieuw';
  if (s <= 3) return 'In behandeling';
  if (s === 4) return 'Offerte in concept';
  if (s === 5) return 'Offerte verstuurd';
  if (s === 6) return 'Gewonnen';
  return 'Project loopt';
}

// Helper to map frontend UI status to backend enum
function mapUIToBackendStatus(status) {
  switch (status) {
    case 'Nieuw':
    case 'New':
    case 'new':
      return 'new';
    case 'In gesprek':
    case 'In Conversation':
    case 'Bericht verstuurd':
    case 'Message Sent':
    case 'in_conversation':
      return 'in_conversation';
    case 'Prijsaanvraag':
    case 'Price Requested':
    case 'price_requested':
      return 'price_requested';
    case 'Prijs ontvangen':
    case 'Price Received':
    case 'price_received':
      return 'price_received';
    case 'Offerte verstuurd':
    case 'Quote Sent':
    case 'quote_sent':
      return 'quote_sent';
    case 'Gewonnen':
    case 'Won':
    case 'won':
      return 'won';
    case 'Verloren':
    case 'Lost':
    case 'lost':
      return 'lost';
    default:
      return 'new';
  }
}

export default function Leads() {
  const { t, language } = useLanguage();
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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

  // Dynamic Categories state from Platform Settings
  const [dynamicCategoriesList, setDynamicCategoriesList] = useState(() => {
    const active = getActiveCategories();
    return active.length > 0 ? active : [
      { id: 'cat-bk', name: 'Buitenkeukens', icon: '🍳', status: 'Actief', description: 'Ambachtelijke maatwerk buitenkeukens' },
      { id: 'cat-bv', name: 'Buitenverblijven', icon: '🏡', status: 'Actief', description: 'Poolhouse, Tuinkamer, Tuinhuis' },
      { id: 'cat-ov', name: 'Overkappingen', icon: '☂️', status: 'Actief', description: 'Veranda, Vrijstaande overkapping, Pergola' }
    ];
  });

  // Load dynamic categories configured in Platform Settings
  const loadSettings = useCallback(async () => {
    const fallback = [
      { id: 'cat-bk', name: 'Buitenkeukens', icon: '🍳', status: 'Actief', description: 'Ambachtelijke maatwerk buitenkeukens' },
      { id: 'cat-bv', name: 'Buitenverblijven', icon: '🏡', status: 'Actief', description: 'Poolhouse, Tuinkamer, Tuinhuis' },
      { id: 'cat-ov', name: 'Overkappingen', icon: '☂️', status: 'Actief', description: 'Veranda, Vrijstaande overkapping, Pergola' }
    ];
    try {
      const active = getActiveCategories();
      if (active.length > 0) setDynamicCategoriesList(active);

      const res = await api.get('/settings/company');
      if (res.success && res.data?.categoriesConfig) {
        const cfg = res.data.categoriesConfig;
        const cats = Array.isArray(cfg) ? cfg : (Array.isArray(cfg?.categories) ? cfg.categories : []);
        const activeCats = cats.filter(c => c.status !== 'Inactief');
        setDynamicCategoriesList(activeCats.length > 0 ? activeCats : (active.length > 0 ? active : fallback));
      } else {
        setDynamicCategoriesList(active.length > 0 ? active : fallback);
      }
    } catch (err) {
      console.warn('Failed to load settings categories in Leads:', err);
    }
  }, []);

  useEffect(() => {
    loadSettings();
    window.addEventListener('app_data_changed', loadSettings);
    window.addEventListener('app_product_config_changed', loadSettings);
    window.addEventListener('storage', loadSettings);
    return () => {
      window.removeEventListener('app_data_changed', loadSettings);
      window.removeEventListener('app_product_config_changed', loadSettings);
      window.removeEventListener('storage', loadSettings);
    };
  }, [loadSettings]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [csvDropdownOpen, setCsvDropdownOpen] = useState(false);
  const csvFileInputRef = useRef(null);
  const csvDropdownRef = useRef(null);

  // Custom Dropdown States for Modal
  const [sizeDropdownOpen, setSizeDropdownOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [productTypeDropdownOpen, setProductTypeDropdownOpen] = useState(false);
  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [isCustomSize, setIsCustomSize] = useState(false);
  const [customSizeValue, setCustomSizeValue] = useState('');



  // Red Warning Alert 1-Click Follow-up Modal State
  const [redAlertModalLead, setRedAlertModalLead] = useState(null);

  // Direct Partner Price Request Modal State
  const [partnerWizardLead, setPartnerWizardLead] = useState(null);
  const [partnerWizardStep, setPartnerWizardStep] = useState(1);
  const [wizardAttachments, setWizardAttachments] = useState([]);
  const [partnersList, setPartnersList] = useState([]);
  const [wizardForm, setWizardForm] = useState({
    category: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    address: '',
    lengthCm: '240',
    widthCm: '80',
    heightCm: '95',
    woodType: '',
    countertop: '',
    appliances: ['Kamado Big Green Egg Large', 'RVS Sink & Tap'],
    siteAccess: 'Ground floor backyard access via side gate',
    gardenPhotoName: 'garden_site_photo.jpg',
    render3dName: '3d_outdoor_kitchen_render.png',
    craftsmanPartner: '',
    partnerId: ''
  });

  // Lost Reason Modal State
  const [lostReasonModalOpen, setLostReasonModalOpen] = useState(false);
  const [lostReasonText, setLostReasonText] = useState('');
  const [pendingFormSubmit, setPendingFormSubmit] = useState(null);

  // Form State
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    productType: '',
    size: '',
    source: '',
    status: 'Nieuw',
    assignedTo: 'Tim',
    notes: ''
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Normalise backend lead record to UI shape
  const normaliseLead = useCallback((l) => {
    const backendStatus = l.status || 'new';
    const backendProductType = l.productType || 'outdoor_kitchen';

    // Resolve assignedTo strictly: check assignedTo or assignedToName
    const rawAssignee = l.assignedTo || l.assignedToName || '';
    const isBram = typeof rawAssignee === 'string' && rawAssignee.toLowerCase().includes('bram') && !rawAssignee.toLowerCase().includes('tim');
    const resolvedOwner = isBram ? 'Bram' : 'Tim';

    return {
      id: l.id,
      leadNumber: l.leadNumber || '',
      name: l.name || '',
      phone: l.phone || '-',
      email: l.email || '-',
      location: l.city || l.address || 'Amsterdam, NL',
      city: l.city || l.address || 'Amsterdam',
      address: l.address || l.city || '',
      productType: mapBackendProductToUI(backendProductType),
      backendProductType: backendProductType,
      size: l.dimensionsInquiry || '-',
      source: l.source || 'Direct',
      status: deriveStatusFromWorkflow(l.workflowStep, backendStatus === 'lost', backendStatus),
      backendStatus: backendStatus,
      workflowStep: l.workflowStep || 1,
      assignedTo: resolvedOwner,
      assignedToUserId: l.assignedToUserId,
      lastContactDate: l.updatedAt
        ? l.updatedAt.split('T')[0]
        : (l.createdAt ? l.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
      date: l.createdAt ? l.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
      lostReason: l.lostReason || '',
      notes: l.notes || '',
      intakeNotes: l.notes || '',
      _raw: l,
    };
  }, []);

  // Fetch leads from backend API
  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.get('/leads?limit=100');
      if (res.success) {
        const items = res.data?.items || res.data || [];
        setLeads(items.map(normaliseLead));
      } else {
        setError(res.error?.message || 'Failed to load leads from server.');
      }
    } catch {
      setError('Unable to reach the server. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [normaliseLead]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Tim & Bram real-time multi-user data synchronization
  useDataSync({
    onSyncEntity: (entity) => {
      if (entity === 'leads') {
        fetchLeads();
      }
    },
  });

  useEffect(() => {
    const handleSync = (e) => {
      if (e.detail?.entity === 'leads') {
        fetchLeads();
      }
    };
    window.addEventListener('app_sync_entity', handleSync);
    window.addEventListener('app_data_changed', fetchLeads);
    return () => {
      window.removeEventListener('app_sync_entity', handleSync);
      window.removeEventListener('app_data_changed', fetchLeads);
    };
  }, [fetchLeads]);

  // Fetch partners list for Partner Price Request Wizard
  useEffect(() => {
    api.get('/partners?limit=100').then((res) => {
      if (res.success) {
        const list = res.data?.partners || res.data?.items || res.data || [];
        setPartnersList(list);
      }
    }).catch(() => {});
  }, []);

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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOpenPartnerWizard = (lead) => {
    setPartnerWizardLead(lead);
    setWizardAttachments([]);
    const defaultPartner = partnersList[0];
    const activeWoods = getActiveWoodTypes();
    const activeMats = getActiveMaterials();
    const activeCats = getActiveCategories();
    const defaultWood = activeWoods.length > 0 ? activeWoods[0].name : '';
    const defaultMat = activeMats.length > 0 ? activeMats[0].name : '';
    const defaultCat = activeCats.length > 0 ? activeCats[0].name : '';

    const rawDims = lead.size || lead.dimensions || '240 × 80 cm';
    let length = '240', width = '80', height = '95';
    if (typeof rawDims === 'string' && (rawDims.includes('x') || rawDims.includes('×'))) {
      const parts = rawDims.replace(/cm/gi, '').split(/x|×/).map(p => p.trim());
      if (parts[0]) length = parts[0];
      if (parts[1]) width = parts[1];
      if (parts[2]) height = parts[2];
    }

    setWizardForm({
      category: lead.productType || lead.category || defaultCat,
      customerName: lead.name || '',
      customerEmail: lead.email || '',
      customerPhone: lead.phone || '',
      address: lead.location || 'Nederland',
      dimensionsText: rawDims,
      lengthCm: length,
      widthCm: width,
      heightCm: height,
      woodType: lead.woodType || defaultWood,
      countertop: lead.countertop || defaultMat,
      materialNotes: lead.notes || '',
      siteAccess: '',
      partnerInstructions: '',
      craftsmanPartner: defaultPartner ? (defaultPartner.companyName || defaultPartner.contactName) : '',
      partnerId: defaultPartner ? defaultPartner.id : '',
      responsiblePerson: lead.assignedTo || 'Tim & Bram',
      deadlineDays: '7'
    });
  };

  const handleOpenAddModal = () => {
    setSelectedLead(null);
    setIsCustomSize(false);
    setCustomSizeValue('');
    setForm({ name: '', phone: '', email: '', location: '', productType: '', size: '', source: '', status: 'Nieuw', assignedTo: 'Tim', notes: '' });
    setProductTypeDropdownOpen(false);
    setSourceDropdownOpen(false);
    setModalOpen(true);
  };

  const handleOpenEditModal = (lead) => {
    setSelectedLead(lead);
    const standardSizes = [
      '1x2m', '2x2m', '2x3m', '3x2m', '3x3m', '3x4m', '4x3m', '4x4m', '5x3m', '5x4m', '6x4m', '8x4m', '10x4m',
      '1 × 2 m', '2 × 2 m', '2 × 3 m', '3 × 2 m', '3 × 3 m', '3 × 4 m', '4 × 3 m', '4 × 4 m', '5 × 3 m', '5 × 4 m', '6 × 4 m', '8 × 4 m', '10 × 4 m'
    ];
    const rawSize = lead.size && lead.size !== '-' ? lead.size : '';
    const isCustom = Boolean(rawSize && !standardSizes.includes(rawSize));
    setIsCustomSize(isCustom);
    setCustomSizeValue(isCustom ? rawSize.replace(/^(Custom|Op maat)\s*:\s*/i, '') : '');
    setForm({
      name: lead.name,
      phone: lead.phone && lead.phone !== '-' ? lead.phone : '',
      email: lead.email && lead.email !== '-' ? lead.email : '',
      location: lead.location || lead.city || '',
      productType: lead.productType || '',
      size: rawSize,
      source: lead.source || '',
      status: lead.status || 'Nieuw',
      assignedTo: lead.assignedTo || 'Tim',
      notes: lead.notes || lead.intakeNotes || ''
    });
    setProductTypeDropdownOpen(false);
    setSourceDropdownOpen(false);
    setModalOpen(true);
  };

  // Delete Lead
  const handleDeleteLead = async (id, name) => {
    if (!window.confirm(language === 'EN' ? `Are you sure you want to delete lead "${name}"?` : `Weet u zeker dat u lead "${name}" wilt verwijderen?`)) {
      return;
    }
    try {
      const res = await api.delete(`/leads/${id}`);
      if (res.success) {
        setLeads(prev => prev.filter(l => l.id !== id));
        showToast(language === 'EN' ? `Lead "${name}" deleted successfully!` : `Lead "${name}" succesvol verwijderd!`);
      } else {
        showToast(res.error?.message || 'Failed to delete lead.');
      }
    } catch {
      showToast('Network error while deleting lead.');
    }
  };

  // Status Change via Portal
  const handleDirectStatusChange = async (leadId, newStatus, reason = '') => {
    const backendStatus = mapUIToBackendStatus(newStatus);
    try {
      const res = await api.patch(`/leads/${leadId}/status`, {
        status: backendStatus,
        lostReason: reason || null
      });
      if (res.success) {
        setLeads(prev => prev.map(l => {
          if (l.id === leadId) {
            return {
              ...l,
              status: newStatus,
              backendStatus: backendStatus,
              lostReason: reason || l.lostReason
            };
          }
          return l;
        }));
        showToast(language === 'NL' ? `Status bijgewerkt naar "${newStatus}"` : `Status updated to "${newStatus}"`);
      } else {
        showToast(res.error?.message || 'Failed to update status.');
      }
    } catch {
      showToast('Failed to update status.');
    }
  };

  const handleToggleAssignee = async (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    const nextOwner = lead.assignedTo === 'Bram' ? 'Tim' : 'Bram';
    const prevOwner = lead.assignedTo;

    // Optimistically update UI
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, assignedTo: nextOwner } : l));
    showToast(language === 'NL' ? `Toegewezen aan ${nextOwner}` : `Assigned to ${nextOwner}`);

    try {
      const res = await api.patch(`/leads/${leadId}`, {
        assignedTo: nextOwner,
        assignee: nextOwner,
      });
      if (!res.success) {
        // Revert on server error
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, assignedTo: prevOwner } : l));
        showToast(res.error?.message || 'Failed to update assignee on server.');
      }
    } catch {
      // Revert on network error
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, assignedTo: prevOwner } : l));
      showToast('Network error while updating assignee.');
    }
  };

  // Follow-up handler
  const handleSendRedAlertFollowUp = async (lead, method) => {
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
      return;
    }

    try {
      await api.post(`/leads/${lead.id}/commercial-actions`, {
        note: `1st Follow-up sent via ${method}`,
        actionType: 'follow_up'
      });
      fetchLeads();
    } catch {}

    setRedAlertModalLead(null);
  };

  const handleFormSubmitClick = (e) => {
    e.preventDefault();
    if (!form.name || !form.name.trim()) {
      showToast(language === 'EN' ? 'Please enter customer name.' : 'Vul een klantnaam in.');
      return;
    }
    if (!form.productType) {
      showToast(language === 'EN' ? 'Please select a product category.' : 'Selecteer een productcategorie.');
      return;
    }
    if (form.status === 'Verloren' && (!selectedLead || selectedLead.status !== 'Verloren')) {
      setPendingFormSubmit(form);
      setLostReasonText('');
      setLostReasonModalOpen(true);
    } else {
      executeSubmit(form);
    }
  };

  const executeSubmit = async (finalForm, reason = '') => {
    setIsSaving(true);
    try {
      if (selectedLead) {
        // Editing Mode: PATCH /api/leads/:id
        const payload = {
          name: finalForm.name.trim(),
          phone: finalForm.phone?.trim() || null,
          email: finalForm.email?.trim() || null,
          city: finalForm.location?.trim() || null,
          address: finalForm.location?.trim() || null,
          productType: mapUIToBackendProduct(finalForm.productType),
          dimensionsInquiry: finalForm.size?.trim() || null,
          source: finalForm.source || 'Direct',
          status: mapUIToBackendStatus(finalForm.status),
          assignedTo: finalForm.assignedTo || 'Tim',
          assignee: finalForm.assignedTo || 'Tim',
          notes: finalForm.notes?.trim() || null,
        };
        const res = await api.patch(`/leads/${selectedLead.id}`, payload);
        if (res.success) {
          showToast(`Lead "${finalForm.name}" updated successfully!`);
          fetchLeads();
          setModalOpen(false);
          setLostReasonModalOpen(false);
          setPendingFormSubmit(null);
        } else {
          showToast(res.error?.message || 'Failed to update lead.');
        }
      } else {
        // Adding Mode: POST /api/leads
        const payload = {
          name: finalForm.name.trim(),
          phone: finalForm.phone?.trim() || null,
          email: finalForm.email?.trim() || null,
          city: finalForm.location?.trim() || null,
          address: finalForm.location?.trim() || null,
          productType: mapUIToBackendProduct(finalForm.productType),
          dimensionsInquiry: finalForm.size?.trim() || null,
          source: finalForm.source || 'Direct',
          status: mapUIToBackendStatus(finalForm.status),
          assignedTo: finalForm.assignedTo || 'Tim',
          assignee: finalForm.assignedTo || 'Tim',
          workflowStep: 1,
          notes: finalForm.notes?.trim() || null,
        };
        const res = await api.post('/leads', payload);
        if (res.success) {
          showToast(`Lead "${finalForm.name}" created successfully!`);
          fetchLeads();
          setModalOpen(false);
          setLostReasonModalOpen(false);
          setPendingFormSubmit(null);
        } else {
          showToast(res.error?.message || 'Failed to create lead.');
        }
      }
    } catch {
      showToast('Network error while saving lead.');
    } finally {
      setIsSaving(false);
    }
  };

  // Dispatch Partner Price Request via API
  const handleSendPartnerPriceRequest = async () => {
    if (!partnerWizardLead) return;
    try {
      const selectedPartner = partnersList.find(
        p => p.id === wizardForm.partnerId || p.companyName === wizardForm.craftsmanPartner
      ) || partnersList[0];

      if (!selectedPartner) {
        showToast(language === 'NL' ? 'Selecteer een actieve vakman partner.' : 'Please select an active craftsman partner.');
        return;
      }

      setIsSaving(true);

      const daysToAdd = Number(wizardForm.deadlineDays) || 7;
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysToAdd);
      const expDateStr = futureDate.toISOString().split('T')[0];

      const payload = {
        leadId: partnerWizardLead.id,
        partnerId: selectedPartner.id,
        category: wizardForm.category,
        productInfo: `${wizardForm.category} (${wizardForm.woodType}, ${wizardForm.countertop})`,
        dimensions: {
          rawText: wizardForm.dimensionsText || `${wizardForm.lengthCm || 240} × ${wizardForm.widthCm || 80} cm`,
          lengthCm: Number(wizardForm.lengthCm) || 240,
          widthCm: Number(wizardForm.widthCm) || 80,
          heightCm: Number(wizardForm.heightCm) || 95,
        },
        materials: {
          woodType: wizardForm.woodType,
          countertop: wizardForm.countertop,
          notes: wizardForm.materialNotes || '',
        },
        locationAccess: {
          city: wizardForm.address,
          siteAccess: wizardForm.siteAccess || wizardForm.partnerInstructions || '',
        },
        attachmentIds: wizardAttachments.map(a => a.id).filter(Boolean),
        expectedResponseDate: expDateStr,
      };

      const res = await api.post('/partner-requests', payload);
      if (res.success) {
        showToast(language === 'NL' 
          ? `Prijsaanvraag succesvol verzonden naar ${selectedPartner.companyName || 'partner'}!` 
          : `Partner price request sent to ${selectedPartner.companyName || 'partner'}!`);
        setPartnerWizardLead(null);
        fetchLeads();
      } else {
        showToast(res.error?.message || 'Failed to send partner request.');
      }
    } catch {
      showToast(language === 'NL' ? 'Fout bij verzenden van prijsaanvraag.' : 'Network error while sending price request.');
    } finally {
      setIsSaving(false);
    }
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
    if (leads.length === 0) return showToast('No leads to export.');

    const sep = ';';
    const headers = ['ID', 'Naam', 'Telefoon', 'Email', 'Product Type', 'Gewenste Maat', 'Bron', 'Status', 'Laatste Contact', 'Verloren Reden'];
    const csvRows = leads.map(l => [
      l.leadNumber || l.id, l.name, l.phone || '', l.email || '', l.productType, l.size || '',
      l.source, l.status, l.lastContactDate || '', l.lostReason || ''
    ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(sep));

    const CRLF = '\r\n';
    const BOM = '\uFEFF';
    const csvString = BOM + [headers.join(sep), ...csvRows].join(CRLF);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    showToast('CSV Exported Successfully! Open in Excel.');
  };

  const handleCSVImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target.result;
        const { leads: parsedLeads, errors } = parseAndNormalizeLeadsCSV(text);

        if (!parsedLeads || parsedLeads.length === 0) {
          showToast(language === 'NL' ? 'Geen geldige leads gevonden in CSV.' : 'No valid leads found in CSV file.');
          return;
        }

        // Send via dedicated atomic bulk-import endpoint
        let importedCount = 0;
        let skippedCount = 0;
        const bulkRes = await api.post('/leads/bulk-import', { leads: parsedLeads });

        if (bulkRes && bulkRes.success && bulkRes.data) {
          importedCount = bulkRes.data.importedCount || 0;
          skippedCount = bulkRes.data.skippedCount || 0;
        } else {
          // Fallback to sequential creation if needed
          for (const item of parsedLeads) {
            const res = await api.post('/leads', item);
            if (res && res.success) {
              importedCount++;
            } else {
              skippedCount++;
            }
          }
        }

        if (importedCount > 0) {
          showToast(
            language === 'NL'
              ? `✅ ${importedCount} leads succesvol geïmporteerd!${skippedCount > 0 ? ` (${skippedCount} overgeslagen)` : ''}`
              : `✅ ${importedCount} leads imported successfully!${skippedCount > 0 ? ` (${skippedCount} skipped)` : ''}`
          );
          fetchLeads();
        } else {
          showToast(
            language === 'NL'
              ? 'Import mislukt: controleer het CSV-bestandformaat.'
              : 'Import failed: please check your CSV data format.'
          );
        }
      } catch (err) {
        console.error('CSV Import error:', err);
        showToast(language === 'NL' ? 'Fout bij verwerken van CSV.' : 'Error processing CSV file.');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
    setCsvDropdownOpen(false);
  };

  // Filter & Sort Logic
  const processedLeads = [...leads]
    .filter(lead => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.phone && lead.phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (lead.leadNumber && lead.leadNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const normalizedStatusFilter = statusFilter.toLowerCase().replace(/[\s-]+/g, '_');
      const matchesStatus = statusFilter === 'All' ||
        (lead.status && lead.status.toLowerCase() === statusFilter.toLowerCase()) ||
        (lead.backendStatus && lead.backendStatus.toLowerCase() === normalizedStatusFilter) ||
        (statusFilter === 'New' && (lead.backendStatus === 'new' || lead.status === 'Nieuw')) ||
        (statusFilter === 'In conversation' && (lead.backendStatus === 'in_conversation' || lead.status === 'In gesprek' || lead.status === 'In Conversation')) ||
        (statusFilter === 'Quote Sent' && (lead.backendStatus === 'quote_sent' || lead.status === 'Offerte verstuurd' || lead.status === 'Quote Sent')) ||
        (statusFilter === 'Won' && (lead.backendStatus === 'won' || lead.status === 'Gewonnen' || lead.status === 'Won')) ||
        (statusFilter === 'Lost' && (lead.backendStatus === 'lost' || lead.status === 'Verloren' || lead.status === 'Lost'));

      const fProduct = productTypeFilter.toLowerCase().trim();
      const ptLower = (lead.productType || '').toLowerCase().trim();
      const bptLower = (lead.backendProductType || '').toLowerCase().trim();

      const matchesProduct = productTypeFilter === 'All' ||
        ptLower === fProduct ||
        bptLower === fProduct ||
        (fProduct.includes('keuken') && (ptLower.includes('keuken') || bptLower === 'outdoor_kitchen')) ||
        (fProduct.includes('kitchen') && (ptLower.includes('kitchen') || bptLower === 'outdoor_kitchen')) ||
        (fProduct.includes('verblijf') && (ptLower.includes('verblijf') || bptLower === 'garden_room')) ||
        (fProduct.includes('garden') && (ptLower.includes('garden') || bptLower === 'garden_room')) ||
        (fProduct.includes('poolhouse') && (ptLower.includes('poolhouse') || bptLower === 'garden_room')) ||
        (fProduct.includes('overkapping') && (ptLower.includes('overkapping') || bptLower === 'canopy')) ||
        (fProduct.includes('canopy') && (ptLower.includes('canopy') || bptLower === 'canopy')) ||
        (fProduct.includes('pergola') && (ptLower.includes('pergola') || bptLower === 'canopy')) ||
        (fProduct.includes('kliko') && (ptLower.includes('kliko') || bptLower === 'bin_storage')) ||
        (fProduct.includes('snijplank') && (ptLower.includes('snijplank') || bptLower === 'bin_storage')) ||
        (fProduct.length > 2 && (ptLower.includes(fProduct) || fProduct.includes(ptLower)));

      const matchesSource = sourceFilter === 'All' || lead.source === sourceFilter;
      const matchesAssignee = assigneeFilter === 'All' || (lead.assignedTo || 'Tim') === assigneeFilter;

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
      // Rule 3: Prioritize action items ("Wie is aan zet") — what WE must do is on top
      const getActionPriority = (lead) => {
        const step = Number(lead.workflowStep || 1);
        if (lead.status === 'Verloren' || lead.backendStatus === 'lost') return 0;
        if (lead.status === 'Gewonnen') return 10;
        if (step === 1) return 100; // Nieuw — Intake call needed by us
        if (step === 4) return 90;  // Offerte in concept — We must build & send quote
        if (step === 2 || step === 3) return 80; // In behandeling — Technical spec / partner cost needed
        if (step === 5) return 50;  // Offerte verstuurd — Waiting for customer acceptance
        return 20;
      };

      const prioA = getActionPriority(a);
      const prioB = getActionPriority(b);
      if (prioA !== prioB) return prioB - prioA;

      if (sortBy === 'newest') return new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0);
      if (sortBy === 'oldest') return new Date(a.date || a.createdAt || 0) - new Date(b.date || b.createdAt || 0);
      if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'name-desc') return (b.name || '').localeCompare(a.name || '');
      return 0;
    });

  const getProductTypeLabel = (type) => tValue(type, language);

  const getStatusLabel = (st) => {
    if (language === 'EN') {
      switch (st) {
        case 'Nieuw': case 'new': return 'New';
        case 'In gesprek': case 'in_conversation': return 'In Conversation';
        case 'Prijsaanvraag': case 'price_requested': return 'Price Requested';
        case 'Prijs ontvangen': case 'price_received': return 'Price Received';
        case 'Offerte verstuurd': case 'quote_sent': return 'Quote Sent';
        case 'Gewonnen': case 'won': return 'Won';
        case 'Verloren': case 'lost': return 'Lost';
        default: return tValue(st, language);
      }
    }
    return tValue(st, language);
  };

  const columns = [
    {
      header: language === 'EN' ? 'Customer Name' : 'Klantnaam',
      accessor: 'name',
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-dark">{row.name}</span>
          {row.leadNumber && (
            <span className="inline-flex items-center gap-1 text-[9.5px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded w-max">
              📄 #{row.leadNumber}
            </span>
          )}
        </div>
      )
    },
    {
      header: (
        <button onClick={() => setShowFilterPanel(prev => !prev)} className="flex items-center gap-1.5 font-bold hover:text-primary transition-colors text-left focus:outline-none cursor-pointer" title={language === 'NL' ? 'Filteren op producttype' : 'Filter by Product Type'}>
          <span>{language === 'NL' ? 'Producttype' : 'Product Type'}</span>
          <Filter className={`w-3 h-3 ${productTypeFilter !== 'All' ? 'text-primary fill-primary' : 'text-dark/40'}`} />
        </button>
      ),
      accessor: 'productType',
      render: (row) => {
        const type = row.productType || row.category || 'Buitenkeukens';
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
        const st = (row.backendStatus || row.status || '').toLowerCase();
        if (st === 'new' || st === 'nieuw') variant = 'info';
        else if (st === 'won' || st === 'gewonnen') variant = 'success';
        else if (st === 'lost' || st === 'verloren') variant = 'danger';
        else if (st === 'quote_sent' || st === 'offerte verstuurd') variant = 'primary';
        else variant = 'warning';

        return (
          <div className="inline-flex items-center">
            <Badge variant={variant}>{getStatusLabel(row.status)}</Badge>
          </div>
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
        const owner = (row.assignedTo === 'Bram' || (typeof row.assignedTo === 'string' && row.assignedTo.includes('Bram') && !row.assignedTo.includes('Tim'))) ? 'Bram' : 'Tim';
        return (
          <button
            onClick={() => handleToggleAssignee(row.id)}
            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cream text-primary border border-primary/20 hover:bg-primary/10 transition-colors cursor-pointer"
            title={language === 'NL' ? 'Klik om te wisselen tussen Tim & Bram' : 'Click to toggle assignee'}
          >
            <span className="w-3.5 h-3.5 rounded-full bg-primary text-white text-[9px] flex items-center justify-center font-bold">
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
            title={isRedFlag ? (language === 'NL' ? 'Klik om direct 1e opvolging te sturen' : 'Click to send 1st follow-up') : ''}
          >
            {isRedFlag && <AlertTriangle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />}
            <span>
              {diffDays === 0
                ? (language === 'NL' ? 'Vandaag' : 'Today')
                : (language === 'NL'
                    ? `${diffDays} ${diffDays === 1 ? 'dag' : 'dagen'} geleden`
                    : `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`)}
            </span>
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

      {/* Error state alert */}
      {error && (
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-body">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
          <Button size="sm" variant="outline" icon={RotateCcw} onClick={fetchLeads}>
            {language === 'EN' ? 'Retry' : 'Opnieuw proberen'}
          </Button>
        </div>
      )}

      {/* WORKFLOW TRACKER VIEW (Full Page Replace) */}
      {activeWorkflowLead ? (
        <WorkflowTracker
          lead={activeWorkflowLead}
          leadsList={leads}
          onClose={() => {
            setActiveWorkflowLead(null);
            fetchLeads();
          }}
          onOpenPartnerWizard={(targetLead) => {
            const target = targetLead || activeWorkflowLead;
            handleOpenPartnerWizard(target);
          }}
          onUpdateStatus={async (id, newStep) => {
            try {
              const res = await api.patch(`/leads/${id}/step`, { workflowStep: newStep });
              if (res.success) {
                setLeads(prev => prev.map(l => l.id === id ? {
                  ...l,
                  workflowStep: newStep,
                  status: newStep >= 6 ? (language === 'EN' ? 'Won' : 'Gewonnen') : l.status,
                  backendStatus: res.data?.status || l.backendStatus,
                } : l));
                showToast(newStep >= 6
                  ? (language === 'EN' ? 'Lead successfully converted to Project!' : 'Lead succesvol omgezet naar Project!')
                  : `Workflow updated to Step ${newStep}!`);
              } else {
                showToast(res.error?.message || 'Failed to update step.');
              }
            } catch {
              showToast('Failed to update workflow step.');
            }
          }}
        />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 className="text-2xl font-heading font-bold text-primary">{language === 'NL' ? 'Leadbeheer' : 'Leads Management'}</h2>
            <div className="flex gap-2 items-center">
              {/* Combined CSV Dropdown */}
              <div className="relative" ref={csvDropdownRef}>
                <button
                  onClick={() => setCsvDropdownOpen(!csvDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold font-body border border-[#D6CFC2] rounded-xl bg-white text-dark/70 hover:bg-[#F8F7F4] hover:border-primary/30 transition-all duration-200 shadow-sm cursor-pointer"
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
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-medium font-body text-dark/70 hover:bg-[#F8F7F4] hover:text-primary transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-primary" />
                        {language === 'NL' ? 'Exporteren als CSV' : 'Export as CSV'}
                      </button>
                      <div className="border-t border-[#D6CFC2]/50" />
                      <button
                        onClick={() => csvFileInputRef.current?.click()}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-medium font-body text-dark/70 hover:bg-[#F8F7F4] hover:text-primary transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-primary" />
                        {language === 'NL' ? 'Importeren vanuit CSV' : 'Import from CSV'}
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
              <Button icon={Plus} onClick={handleOpenAddModal}>{language === 'EN' ? 'New Lead' : 'Nieuwe lead'}</Button>
            </div>
          </div>

      <Card>
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/40" />
              <input
                type="text"
                placeholder={language === 'NL' ? 'Zoek op naam, telefoon of #LEAD...' : 'Search by name, phone, or #LEAD...'}
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
              {language === 'NL' ? 'Filters' : 'Filters'}
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                icon={RotateCcw}
                onClick={handleResetFilters}
                className="text-xs text-dark/65"
              >
                {language === 'NL' ? 'Herstellen' : 'Reset'}
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
                  <label className="block text-xs font-semibold text-dark/60 mb-1.5 font-body uppercase tracking-wider">{language === 'NL' ? 'Status' : 'Status'}</label>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs font-body focus:outline-none text-[#4A4A43]"
                  >
                    <option value="All">{language === 'NL' ? 'Alle Statussen' : 'All Statuses'}</option>
                    <option value="New">{language === 'NL' ? 'Nieuw' : 'New'}</option>
                    <option value="In conversation">{language === 'NL' ? 'In gesprek' : 'In Discussion'}</option>
                    <option value="Quote Sent">{language === 'NL' ? 'Offerte verstuurd' : 'Quote Sent'}</option>
                    <option value="Won">{language === 'NL' ? 'Gewonnen' : 'Won'}</option>
                    <option value="Lost">{language === 'NL' ? 'Verloren' : 'Lost'}</option>
                  </select>
                </div>

                {/* Product Type Filter */}
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-dark/60 mb-1.5 font-body uppercase tracking-wider">{language === 'NL' ? 'Producttype' : 'Product Type'}</label>
                  <select
                    value={productTypeFilter}
                    onChange={e => setProductTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs font-body focus:outline-none text-[#4A4A43]"
                  >
                    <option value="All">{language === 'NL' ? 'Alle Producten' : 'All Products'}</option>
                    {dynamicCategoriesList.map((cat) => (
                      <option key={cat.id || cat.name} value={cat.name.toLowerCase()}>
                        {(cat.icon ? `${cat.icon} ` : '') + cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Source Filter */}
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-dark/60 mb-1.5 font-body uppercase tracking-wider">{language === 'NL' ? 'Bron / Campagne' : 'Source / Campaign'}</label>
                  <select
                    value={sourceFilter}
                    onChange={e => setSourceFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs font-body focus:outline-none text-[#4A4A43]"
                  >
                    <option value="All">{language === 'NL' ? 'Alle Bronnen' : 'All Sources'}</option>
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
                    <option value="All">{language === 'NL' ? 'Alle Eigenaren' : 'All Assignees'}</option>
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
                    <option value="All">{language === 'NL' ? 'Alle Contactdata' : 'All Contact Dates'}</option>
                    <option value="RedFlag">{language === 'NL' ? '⚠️ Vereist opvolging (3+ dagen)' : '⚠️ Needs Follow-up (3+ days)'}</option>
                    <option value="Recent">{language === 'NL' ? '🟢 Recent contact gehad' : '🟢 Contacted Recently'}</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-dark/50">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-body">{language === 'EN' ? 'Loading leads...' : 'Leads laden...'}</p>
          </div>
        ) : (
          <Table
            columns={columns}
            data={processedLeads}
            onRowClick={(row) => setActiveWorkflowLead(row)}
            getRowClassName={() => 'z-1 relative hover:bg-[#EDE8DF]/60'}
            getRowStyle={() => ({ zIndex: 1, position: 'relative' })}
          />
        )}
      </Card>

      {/* LEAD FORM MODAL (PORTALED TO BODY) */}
      {modalOpen && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          <div
            className="fixed inset-0 z-[999999] flex items-start sm:items-center justify-center p-4 pt-10 sm:pt-6 overflow-y-auto"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          >
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
                    <label className="block text-xs font-semibold text-dark/60 mb-1 font-body uppercase tracking-wider">{language === 'EN' ? 'Customer Name' : 'Klantnaam'} *</label>
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
                  {/* LOCATION / CITY FREE-TEXT INPUT */}
                  <div>
                    <label className="block text-xs font-semibold text-dark/60 mb-1 font-body uppercase tracking-wider">
                      {language === 'EN' ? 'Location / Address / City' : 'Locatie / Adres / Plaats'}
                    </label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={e => setForm(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 text-[#4A4A43]"
                      placeholder={language === 'EN' ? 'e.g. Amsterdam, backyard with water view...' : 'bijv. Amsterdam, achtertuin aan het water...'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* PRODUCT TYPE CUSTOM DROPDOWN */}
                  <div className="relative">
                    <label className="block text-xs font-semibold text-dark/60 mb-1 font-body uppercase tracking-wider">
                      {language === 'EN' ? 'Product Type *' : 'Producttype *'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setProductTypeDropdownOpen(!productTypeDropdownOpen)}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs sm:text-sm font-body focus:outline-none text-[#4A4A43] flex items-center justify-between shadow-xs cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <span className={`truncate ${!form.productType ? 'text-dark/40 font-normal italic' : 'text-[#4A4A43] font-medium'}`}>
                        {form.productType ? (
                          language === 'EN' ? (tValue(form.productType, 'EN') || form.productType) : form.productType
                        ) : (
                          language === 'EN' ? 'Select Category' : 'Selecteer Categorie'
                        )}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-dark/40 transition-transform ${productTypeDropdownOpen ? 'rotate-180 text-primary' : ''}`} />
                    </button>
                    {productTypeDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setProductTypeDropdownOpen(false)} />
                        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg shadow-xl max-h-56 overflow-y-auto divide-y divide-[#EDE8DF]">
                          {/* Default "Select Category" placeholder option */}
                          <div
                            onClick={() => {
                              setForm(prev => ({ ...prev, productType: '' }));
                              setProductTypeDropdownOpen(false);
                            }}
                            className={`px-3 py-2 text-xs cursor-pointer hover:bg-primary/10 transition-colors italic text-dark/50 ${!form.productType ? 'bg-primary/10 font-semibold' : ''}`}
                          >
                            {language === 'EN' ? '-- Select Category --' : '-- Selecteer Categorie --'}
                          </div>
                          {dynamicCategoriesList.map((cat, idx) => {
                            const isSelected = form.productType === cat.name;
                            const displayName = language === 'EN' ? (tValue(cat.name, 'EN') || cat.name) : cat.name;
                            return (
                              <div
                                key={cat.id || idx}
                                onClick={() => {
                                  setForm(prev => ({ ...prev, productType: cat.name }));
                                  setProductTypeDropdownOpen(false);
                                }}
                                className={`px-3 py-2.5 text-xs cursor-pointer hover:bg-primary/10 transition-colors flex items-center justify-between ${
                                  isSelected ? 'bg-primary/15 font-bold text-primary' : 'text-dark'
                                }`}
                              >
                                <div>
                                  <div className="font-semibold">{cat.icon ? `${cat.icon} ` : ''}{displayName}</div>
                                  {cat.description && (
                                    <div className="text-[11px] text-dark/50 font-normal mt-0.5">{cat.description}</div>
                                  )}
                                </div>
                                {isSelected && <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0 ml-2" />}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  {/* DESIRED DIMENSIONS FREE-TEXT INPUT */}
                  <div>
                    <label className="block text-xs font-semibold text-dark/60 mb-1 font-body uppercase tracking-wider">
                      {language === 'EN' ? 'Desired Dimensions (Free Text)' : 'Gewenste Afmetingen (Vrije Tekst)'}
                    </label>
                    <input
                      type="text"
                      value={form.size}
                      onChange={e => setForm(prev => ({ ...prev, size: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 text-[#4A4A43]"
                      placeholder={language === 'EN' ? 'e.g. 450 x 300 x 260 cm, or L-shape with canopy' : 'bijv. 450 × 300 × 260 cm, of L-vorm met overstek'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* SOURCE / CAMPAIGN CUSTOM DROPDOWN */}
                  <div className="relative">
                    <label className="block text-xs font-semibold text-dark/60 mb-1 font-body uppercase tracking-wider">{language === 'EN' ? 'Source / Campaign' : 'Bron / Campagne'}</label>
                    <button
                      type="button"
                      onClick={() => setSourceDropdownOpen(!sourceDropdownOpen)}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs sm:text-sm font-body focus:outline-none text-[#4A4A43] flex items-center justify-between shadow-xs cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <span className={`truncate ${!form.source ? 'text-dark/40 font-normal italic' : 'text-[#4A4A43] font-medium'}`}>
                        {!form.source ? (
                          language === 'EN' ? 'Select Source' : 'Selecteer Bron'
                        ) : form.source === 'Direct' ? (
                          language === 'EN' ? 'Direct / Phone' : 'Direct / Telefonisch'
                        ) : form.source === 'Referral' ? (
                          language === 'EN' ? 'Referral' : 'Referral / Aanbeveling'
                        ) : form.source === 'Facebook' ? (
                          'Facebook / Instagram'
                        ) : form.source === 'Website' ? (
                          language === 'EN' ? 'Website Contact Form' : 'Website Contactformulier'
                        ) : form.source === 'Email' ? (
                          language === 'EN' ? 'Email Campaign' : 'E-mail Campagne'
                        ) : form.source === 'Beurs' ? (
                          language === 'EN' ? 'Trade Fair / Event' : 'Beurs / Event'
                        ) : form.source === 'Anders' ? (
                          language === 'EN' ? 'Other' : 'Anders'
                        ) : (
                          form.source
                        )}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-dark/40 transition-transform ${sourceDropdownOpen ? 'rotate-180 text-primary' : ''}`} />
                    </button>
                    {sourceDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setSourceDropdownOpen(false)} />
                        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg shadow-xl max-h-56 overflow-y-auto divide-y divide-[#EDE8DF]">
                          {/* Option to clear/reset */}
                          <div
                            onClick={() => {
                              setForm(prev => ({ ...prev, source: '' }));
                              setSourceDropdownOpen(false);
                            }}
                            className={`px-3 py-2 text-xs cursor-pointer hover:bg-primary/10 transition-colors italic text-dark/50 ${!form.source ? 'bg-primary/10 font-semibold' : ''}`}
                          >
                            {language === 'EN' ? '-- Select Source --' : '-- Selecteer Bron --'}
                          </div>
                          {[
                            { val: 'Google Ads', label: 'Google Ads' },
                            { val: 'Facebook', label: 'Facebook / Instagram' },
                            { val: 'Direct', label: language === 'EN' ? 'Direct / Phone' : 'Direct / Telefonisch' },
                            { val: 'Referral', label: language === 'EN' ? 'Referral' : 'Referral / Aanbeveling' },
                            { val: 'Website', label: language === 'EN' ? 'Website Contact Form' : 'Website Contactformulier' },
                            { val: 'Email', label: language === 'EN' ? 'Email Campaign' : 'E-mail Campagne' },
                            { val: 'Beurs', label: language === 'EN' ? 'Trade Fair / Event' : 'Beurs / Event' },
                            { val: 'Anders', label: language === 'EN' ? 'Other' : 'Anders' }
                          ].map((src, idx) => {
                            const isSelected = form.source === src.val;
                            return (
                              <div
                                key={idx}
                                onClick={() => {
                                  setForm(prev => ({ ...prev, source: src.val }));
                                  setSourceDropdownOpen(false);
                                }}
                                className={`px-3 py-2 text-xs cursor-pointer hover:bg-primary/10 transition-colors flex items-center justify-between ${
                                  isSelected ? 'bg-primary/15 font-bold text-primary' : 'text-dark'
                                }`}
                              >
                                <span>{src.label}</span>
                                {isSelected && <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0 ml-2" />}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  {/* STATUS DERIVED FROM WORKFLOW — Brief 2.1 */}
                  <div className="relative">
                    <label className="block text-xs font-semibold text-dark/60 mb-1 font-body uppercase tracking-wider">{language === 'EN' ? 'Status (Workflow Derived)' : 'Status (Uit Workflow)'}</label>
                    <div className="py-1 px-3 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs font-body text-[#4A4A43] flex items-center justify-between shadow-xs">
                      <span className="font-semibold text-primary">{form.status || 'Nieuw'}</span>
                      <span className="text-[10px] text-dark/40 italic">{language === 'NL' ? 'Stap gebaseerd' : 'Step derived'}</span>
                    </div>
                  </div>
                </div>

                {/* ASSIGNEE SELECTOR (Tim / Bram) */}
                <div>
                  <label className="block text-xs font-semibold text-dark/60 mb-1.5 font-body uppercase tracking-wider">
                    {language === 'EN' ? 'Assignee / Lead Owner' : 'Toegewezen aan (Eigenaar)'}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, assignedTo: 'Tim' }))}
                      className={`flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                        form.assignedTo === 'Tim'
                          ? 'bg-primary text-white border-primary shadow-sm ring-2 ring-primary/20'
                          : 'bg-[#F8F7F4] text-[#4A4A43] border-[#D6CFC2] hover:bg-primary/5'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${form.assignedTo === 'Tim' ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                        T
                      </span>
                      <span>Tim</span>
                      {form.assignedTo === 'Tim' && <CheckCircle className="w-3.5 h-3.5 ml-auto text-white/90" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, assignedTo: 'Bram' }))}
                      className={`flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                        form.assignedTo === 'Bram'
                          ? 'bg-primary text-white border-primary shadow-sm ring-2 ring-primary/20'
                          : 'bg-[#F8F7F4] text-[#4A4A43] border-[#D6CFC2] hover:bg-primary/5'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${form.assignedTo === 'Bram' ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                        B
                      </span>
                      <span>Bram</span>
                      {form.assignedTo === 'Bram' && <CheckCircle className="w-3.5 h-3.5 ml-auto text-white/90" />}
                    </button>
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
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (language === 'EN' ? 'Save Lead' : 'Lead Opslaan')}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}

      {/* LOST REASON MODAL (PORTALED TO BODY) */}
      {lostReasonModalOpen && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          <div
            className="fixed inset-0 z-[999999] flex items-center justify-center p-4 overflow-y-auto"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          >
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
                  if (!lostReasonText.trim()) return showToast('Please enter a reason.');
                  if (pendingFormSubmit) {
                    if (pendingFormSubmit.id) {
                      handleDirectStatusChange(pendingFormSubmit.id, pendingFormSubmit.status, lostReasonText);
                      setLostReasonModalOpen(false);
                      setPendingFormSubmit(null);
                    } else {
                      executeSubmit(pendingFormSubmit, lostReasonText);
                    }
                  }
                }}>
                  Confirm Loss
                </Button>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}

      {/* 3-DAY RED WARNING ALERT MODAL (PORTALED TO BODY) */}
      {redAlertModalLead && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          <div
            className="fixed inset-0 z-[999999] flex items-center justify-center p-4 overflow-y-auto"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          >
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
        </AnimatePresence>,
        document.body
      )}
      </>
      )}

      {/* SIMPLIFIED PARTNER PRICE REQUEST MODAL (PORTALED TO BODY) */}
      {partnerWizardLead && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          <div
            className="fixed inset-0 z-[999999] flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          >
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
                      {language === 'EN' ? 'Partner Dispatch' : 'Prijsaanvraag'}
                    </span>
                    <h3 className="text-lg font-heading font-bold text-primary">
                      {language === 'EN' ? 'Send Partner Price Request' : 'Prijsaanvraag Verzenden naar Vakman'}
                    </h3>
                  </div>
                  <p className="text-xs text-dark/60 font-body mt-1">
                    {language === 'EN'
                      ? `Inquiry for ${partnerWizardLead.name} (${partnerWizardLead.location || 'NL'})`
                      : `Aanvraag voor ${partnerWizardLead.name} (${partnerWizardLead.location || 'Nederland'})`}
                  </p>
                </div>
                <button onClick={() => setPartnerWizardLead(null)} className="p-1 text-dark/40 hover:text-dark rounded-lg hover:bg-dark/5 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content: Streamlined 2-Column Layout */}
              <div className="space-y-4 text-xs font-body">
                {/* 1. Client & Specifications Card */}
                <div className="p-4 bg-[#F8F7F4] border border-[#D6CFC2] rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-[#D6CFC2]/60 pb-2">
                    <span className="font-bold text-primary text-xs uppercase tracking-wider">
                      {language === 'EN' ? '1. Lead Details & Specifications' : '1. Klant & Specificaties (Uit Lead)'}
                    </span>
                    <span className="text-[11px] text-dark/50 font-mono">
                      {partnerWizardLead.email || partnerWizardLead.phone || ''}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Category */}
                    <div>
                      <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">
                        {language === 'EN' ? 'Product Category' : 'Product Categorie'}
                      </label>
                      <select
                        value={wizardForm.category}
                        onChange={e => setWizardForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-bold text-primary"
                      >
                        {getActiveCategories().length === 0 ? (
                          <option value="">{language === 'EN' ? '-- No categories configured in Settings --' : '-- Geen categorieën geconfigureerd in Instellingen --'}</option>
                        ) : (
                          <>
                            <option value="">{language === 'EN' ? '-- Select category --' : '-- Selecteer categorie --'}</option>
                            {getActiveCategories().map(c => (
                              <option key={c.id || c.name} value={c.name}>{c.name}</option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>

                    {/* Dimensions Free Text */}
                    <div>
                      <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">
                        {language === 'EN' ? 'Desired Dimensions' : 'Gewenste Afmetingen'}
                      </label>
                      <input
                        type="text"
                        value={wizardForm.dimensionsText || ''}
                        onChange={e => setWizardForm(prev => ({ ...prev, dimensionsText: e.target.value }))}
                        placeholder="bijv. 300 × 80 cm"
                        className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-mono font-bold text-primary"
                      />
                    </div>

                    {/* Wood Type */}
                    <div>
                      <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">
                        {language === 'EN' ? 'Wood Type (Dynamic)' : 'Houtsoort (Dynamisch)'}
                      </label>
                      <select
                        value={wizardForm.woodType}
                        onChange={e => setWizardForm(prev => ({ ...prev, woodType: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-bold text-primary"
                      >
                        {getActiveWoodTypes().length === 0 ? (
                          <option value="">{language === 'EN' ? '-- No wood types configured in Settings --' : '-- Geen houtsoorten geconfigureerd in Instellingen --'}</option>
                        ) : (
                          <>
                            <option value="">{language === 'EN' ? '-- Select wood type --' : '-- Selecteer houtsoort --'}</option>
                            {getActiveWoodTypes().map(w => (
                              <option key={w.id || w.name} value={w.name}>{w.name} {w.lifespan ? `(${w.lifespan})` : ''}</option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>

                    {/* Countertop */}
                    <div>
                      <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">
                        {language === 'EN' ? 'Countertop Material' : 'Werkblad / Materiaal'}
                      </label>
                      <select
                        value={wizardForm.countertop}
                        onChange={e => setWizardForm(prev => ({ ...prev, countertop: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-bold text-primary"
                      >
                        {getActiveMaterials().length === 0 ? (
                          <option value="">{language === 'EN' ? '-- No materials configured in Settings --' : '-- Geen materialen geconfigureerd in Instellingen --'}</option>
                        ) : (
                          <>
                            <option value="">{language === 'EN' ? '-- Select material --' : '-- Selecteer materiaal --'}</option>
                            {getActiveMaterials().map(m => (
                              <option key={m.id || m.name} value={m.name}>{m.name}</option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Clean Notes (No fake BBQ!) */}
                  <div>
                    <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">
                      {language === 'EN' ? 'Specific Client Wishes & Notes' : 'Klantwensen & Technische Notities'}
                    </label>
                    <textarea
                      value={wizardForm.materialNotes || ''}
                      onChange={e => setWizardForm(prev => ({ ...prev, materialNotes: e.target.value }))}
                      placeholder={language === 'EN' ? 'Enter any specific customer requirements or appliances...' : 'Voer eventuele specifieke klantwensen, inbouwapparaten of details in...'}
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs resize-none"
                    />
                  </div>
                </div>

                {/* 2. Partner Assignment & Deadline Card */}
                <div className="p-4 bg-white border border-[#D6CFC2] rounded-xl space-y-3">
                  <span className="font-bold text-primary text-xs uppercase tracking-wider block border-b border-[#D6CFC2]/60 pb-2">
                    {language === 'EN' ? '2. Craftsman Assignment & Deadline' : '2. Vakman Toewijzing & Deadline'}
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Partner Selector */}
                    <div>
                      <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">
                        {language === 'EN' ? 'Select Craftsman Partner' : 'Selecteer Vakman / Partner'}
                      </label>
                      <select
                        value={wizardForm.partnerId || (partnersList[0]?.id || '')}
                        onChange={e => {
                          const p = partnersList.find(item => item.id === e.target.value);
                          setWizardForm(prev => ({
                            ...prev,
                            partnerId: e.target.value,
                            craftsmanPartner: p ? (p.companyName || p.contactName) : ''
                          }));
                        }}
                        className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs font-bold text-primary"
                      >
                        {partnersList.length > 0 ? (
                          partnersList.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.companyName || p.contactName} ({p.city || 'NL'})
                            </option>
                          ))
                        ) : (
                          <option value="">CraftWood Veluwe (Standaard)</option>
                        )}
                      </select>
                    </div>

                    {/* Deadline */}
                    <div>
                      <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">
                        {language === 'EN' ? 'Response Deadline' : 'Uiterste Reactietermijn'}
                      </label>
                      <select
                        value={wizardForm.deadlineDays || '7'}
                        onChange={e => setWizardForm(prev => ({ ...prev, deadlineDays: e.target.value }))}
                        className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs font-bold text-primary"
                      >
                        <option value="3">3 dagen (Spoed)</option>
                        <option value="5">5 werkdagen</option>
                        <option value="7">7 dagen (Standaard)</option>
                        <option value="14">14 dagen</option>
                      </select>
                    </div>
                  </div>

                  {/* Optional Instructions */}
                  <div>
                    <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">
                      {language === 'EN' ? 'Instructions for Partner (Optional)' : 'Instructies voor de Vakman (Optioneel)'}
                    </label>
                    <input
                      type="text"
                      value={wizardForm.partnerInstructions || ''}
                      onChange={e => setWizardForm(prev => ({ ...prev, partnerInstructions: e.target.value }))}
                      placeholder={language === 'EN' ? 'e.g. Please quote delivery to backyard with side gate access' : 'bijv. Levering achtertuin via brede poort meenemen in offerte'}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs"
                    />
                  </div>
                </div>

                {/* 3. Responsible Person & Blueprints Upload Card */}
                <div className="p-4 bg-white border border-[#D6CFC2] rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-[#D6CFC2]/60 pb-2">
                    <span className="font-bold text-primary text-xs uppercase tracking-wider">
                      📎 {language === 'EN' ? '3. Responsible Person & Blueprints' : '3. Verantwoordelijke & Bijlagen'}
                    </span>
                    <label className="cursor-pointer text-[11px] font-bold text-primary hover:underline flex items-center gap-1 bg-[#F8F7F4] px-2.5 py-1 rounded-lg border border-[#D6CFC2] transition-colors">
                      <Paperclip className="w-3.5 h-3.5 text-primary" />
                      <span>{language === 'EN' ? '+ Upload Drawings / PDF' : '+ Upload Tekening / PDF'}</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf,.dwg"
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          for (const f of files) {
                            try {
                              const upRes = await api.post('/documents', {
                                fileName: f.name,
                                documentType: 'drawing',
                                category: 'Blueprints',
                                leadId: partnerWizardLead.id,
                                isPublicForPartner: true
                              });
                              if (upRes.success && upRes.data) {
                                setWizardAttachments(prev => [...prev, upRes.data]);
                              }
                            } catch (err) {}
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Responsible Person Selection */}
                  <div>
                    <label className="block text-[10px] font-bold text-dark/60 uppercase mb-1">
                      {language === 'EN' ? 'Responsible Contact Person (Tim / Bram)' : 'Verantwoordelijke Contactpersoon (Tim / Bram)'}
                    </label>
                    <select
                      value={wizardForm.responsiblePerson || partnerWizardLead.assignedTo || 'Tim & Bram'}
                      onChange={e => setWizardForm(prev => ({ ...prev, responsiblePerson: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs font-bold text-primary"
                    >
                      <option value="Tim & Bram">Tim & Bram</option>
                      <option value="Tim">Tim</option>
                      <option value="Bram">Bram</option>
                    </select>
                  </div>

                  {/* Attached Files List */}
                  {wizardAttachments.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {wizardAttachments.map(att => (
                        <span key={att.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs font-mono text-dark">
                          📄 {att.fileName || att.name}
                          <button
                            type="button"
                            onClick={() => setWizardAttachments(prev => prev.filter(a => a.id !== att.id))}
                            className="text-red-500 hover:text-red-700 ml-1 font-bold cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-dark/50 italic">
                      {language === 'EN' ? 'No drawings, PDFs or customer photos attached yet.' : 'Nog geen tekeningen, PDF\'s of klantfoto\'s bijgevoegd.'}
                    </p>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end items-center gap-2 pt-3 border-t border-[#D6CFC2]">
                <Button variant="outline" onClick={() => setPartnerWizardLead(null)}>
                  {language === 'EN' ? 'Cancel' : 'Annuleren'}
                </Button>
                <Button onClick={handleSendPartnerPriceRequest} disabled={isSaving} className="bg-primary text-cream flex items-center gap-2">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>{language === 'EN' ? 'Send Price Request' : 'Prijsaanvraag Verzenden'}</span>
                </Button>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
}
