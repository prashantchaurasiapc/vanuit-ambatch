import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import {
  Plus, Search, Edit2, Trash2, X, CheckCircle, MapPin, Wrench,
  Briefcase, FileText, Phone, Mail, MessageCircle, ChevronRight, User,
  Clock, Loader2, AlertCircle, RotateCcw, Star, Eye, EyeOff,
  Key, Copy, Check, Sparkles, Archive, RefreshCw, ShieldAlert, Undo2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../api/apiClient';
import { migratePipelineCandidates } from '../../utils/pipelineMigration';

// ─── Workload enum mapping ─────────────────────────────────────────────────
const WORKLOAD_TO_API = {
  'Beschikbaar': 'available',
  'Available': 'available',
  'Druk': 'busy',
  'Busy': 'busy',
  'Volgeboekt': 'fully_booked',
  'Fully booked': 'fully_booked',
  'Fully Booked': 'fully_booked',
  'Inactief': 'inactive',
  'Inactive': 'inactive',
};

const API_TO_WORKLOAD_NL = {
  'available': 'Beschikbaar',
  'busy': 'Druk',
  'fully_booked': 'Volgeboekt',
  'inactive': 'Inactief',
};

export default function Partners() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('Active');
  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State
  const [toastMsg, setToastMsg] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [detailModalPartner, setDetailModalPartner] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Pipeline (Backend-connected candidates state)
  const [candidates, setCandidates] = useState([]);
  const [isCandidatesLoading, setIsCandidatesLoading] = useState(false);
  const [candidateModalOpen, setCandidateModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [isSavingCandidate, setIsSavingCandidate] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [candidateForm, setCandidateForm] = useState({
    name: '',
    companyName: '',
    phone: '',
    email: '',
    region: 'Noord-Holland',
    stage: 'interested',
    productTypes: 'Buitenkeukens, Kliko-ombouw',
    kvkNumber: '',
    btwNumber: '',
    notes: '',
  });

  // Convert Candidate Modal State
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [candidateToConvert, setCandidateToConvert] = useState(null);
  const [convertForm, setConvertForm] = useState({
    password: '',
    companyName: '',
    kvkNumber: '',
    btwNumber: '',
    productTypes: '',
    workloadStatus: 'available',
  });
  const [showConvertPassword, setShowConvertPassword] = useState(false);
  const [copiedCredentials, setCopiedCredentials] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  // Form
  const [form, setForm] = useState({
    contactPerson: '',
    companyName: '',
    email: '',
    phone: '',
    region: 'Noord-Holland',
    productTypes: 'Buitenkeukens, Kliko-ombouw',
    workloadStatus: 'available',
    kvkNumber: '',
    btwNumber: '',
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // ─── Normalise backend partner record ────────────────────────────────────
  const normalise = (p) => ({
    id: p.id,
    name: p.contactPerson || p.companyName || 'Unknown',
    company: p.companyName || '',
    email: p.email || '',
    phone: p.phone || '',
    region: p.region || 'Nederland',
    productTypes: Array.isArray(p.productTypes) ? p.productTypes : (p.specialties || []),
    workload: API_TO_WORKLOAD_NL[p.workloadStatus] || 'Beschikbaar',
    workloadStatus: p.workloadStatus || 'available',
    status: p.isActive ? 'Active' : 'Inactive',
    rating: p.rating || '5.00',
    kvk: p.kvkNumber || '',
    btw: p.btwNumber || '',
    notes: p.notes || '',
    invoices: p.recentInvoices || [],
    _raw: p,
  });

  // ─── Fetch partners ───────────────────────────────────────────────────────
  const fetchPartners = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (searchQuery) params.append('search', searchQuery);
      const res = await api.get(`/partners?${params}`);
      if (res.success) {
        setPartners((res.data?.partners || res.data?.items || res.data || []).map(normalise));
      } else {
        setError(res.error?.message || 'Failed to load partners.');
      }
    } catch {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  // ─── Add / Edit partner ───────────────────────────────────────────────────
  const handleOpenAddModal = () => {
    setSelectedPartner(null);
    setForm({
      contactPerson: '',
      companyName: '',
      email: '',
      phone: '',
      region: 'Noord-Holland',
      productTypes: 'Buitenkeukens, Kliko-ombouw',
      workloadStatus: 'available',
      kvkNumber: '',
      btwNumber: '',
      password: '',
    });
    setShowPasswordModal(false);
    setModalOpen(true);
  };

  const handleOpenEditModal = (partner) => {
    setSelectedPartner(partner);
    setForm({
      contactPerson: partner.name,
      companyName: partner.company,
      email: partner.email,
      phone: partner.phone,
      region: partner.region || 'Noord-Holland',
      productTypes: Array.isArray(partner.productTypes) ? partner.productTypes.join(', ') : 'Buitenkeukens',
      workloadStatus: partner.workloadStatus || 'available',
      kvkNumber: partner.kvk || '',
      btwNumber: partner.btw || '',
      password: '',
    });
    setShowPasswordModal(false);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.contactPerson.trim() || !form.email.trim()) {
      showToast(language === 'NL' ? 'Vul een geldige naam en e-mail in.' : 'Please enter a valid name and email.');
      return;
    }
    if (!selectedPartner && !form.password?.trim()) {
      showToast(language === 'NL' ? 'Vul een wachtwoord in voor de partner.' : 'Please enter a password for the partner.');
      return;
    }
    setIsSaving(true);
    try {
      const typesArr = form.productTypes.split(',').map(s => s.trim()).filter(Boolean);
      const payload = {
        contactPerson: form.contactPerson.trim(),
        companyName: form.companyName.trim() || form.contactPerson.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || '+31 6 00000000',
        region: form.region.trim() || 'Nederland',
        productTypes: typesArr,
        workloadStatus: form.workloadStatus,
        kvkNumber: form.kvkNumber.trim() || null,
        btwNumber: form.btwNumber.trim() || null,
        isActive: true,
      };

      if (form.password?.trim()) {
        payload.password = form.password.trim();
      }

      let res;
      if (selectedPartner) {
        res = await api.patch(`/partners/${selectedPartner.id}`, payload);
      } else {
        // Step 1: Create the partner login account via /settings/users (creates user and auto-creates single partner profile with linked userId)
        const userRes = await api.post('/settings/users', {
          fullName: form.contactPerson.trim(),
          email: form.email.trim().toLowerCase(),
          role: 'partner',
          password: form.password.trim(),
          phone: form.phone.trim() || undefined,
        });

        if (userRes?.success) {
          // Step 2: Fetch the auto-created partner record and apply company name, region, kvk, btw, product types
          const listRes = await api.get(`/partners?search=${encodeURIComponent(form.email.trim().toLowerCase())}`);
          const partnersList = listRes.data?.partners || listRes.data?.items || listRes.data || [];
          const createdPartner = partnersList.find(
            p => (p.email || '').toLowerCase() === form.email.trim().toLowerCase()
          );

          if (createdPartner?.id) {
            res = await api.patch(`/partners/${createdPartner.id}`, payload);
          } else {
            res = userRes;
          }
        } else {
          res = userRes;
        }
      }

      if (res.success) {
        showToast(
          selectedPartner
            ? (language === 'EN' ? `Partner "${form.contactPerson}" updated!` : `Partner "${form.contactPerson}" geüpdatet!`)
            : (language === 'EN' ? `Partner "${form.contactPerson}" added!` : `Partner "${form.contactPerson}" toegevoegd!`)
        );
        setModalOpen(false);
        fetchPartners();
      } else {
        showToast(res.error?.message || 'Failed to save partner.');
      }
    } catch {
      showToast('Unable to reach the server.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePartner = async (id, name) => {
    if (!window.confirm(language === 'EN' ? `Delete partner "${name}"?` : `Partner "${name}" verwijderen?`)) return;
    try {
      const res = await api.delete(`/partners/${id}`);
      if (res.success) {
        showToast(`Partner "${name}" verwijderd.`);
        fetchPartners();
      } else {
        showToast(res.error?.message || 'Failed to delete partner.');
      }
    } catch {
      showToast('Unable to reach the server.');
    }
  };

  const handleUpdateWorkload = async (partnerId, newWorkloadStatus) => {
    try {
      const res = await api.patch(`/partners/${partnerId}/workload`, { workloadStatus: newWorkloadStatus });
      if (res.success) {
        showToast(language === 'EN' ? 'Workload updated!' : 'Werkdruk bijgewerkt!');
        fetchPartners();
      }
    } catch {
      showToast('Failed to update workload.');
    }
  };

  // ─── Fetch partner candidates ─────────────────────────────────────────────
  const fetchCandidates = useCallback(async () => {
    setIsCandidatesLoading(true);
    try {
      const res = await api.get('/partner-candidates');
      if (res?.success) {
        const list = res.data?.candidates || res.data || [];
        setCandidates(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      console.error('Failed to load partner candidates:', err);
    } finally {
      setIsCandidatesLoading(false);
    }
  }, []);

  // ─── Safe LocalStorage Candidate Migration ────────────────────────────────
  const handleRunMigration = useCallback(async () => {
    const rawStored = typeof window !== 'undefined' ? localStorage.getItem('app_pipeline_candidates') : null;
    if (!rawStored) return;

    setIsMigrating(true);
    try {
      const report = await migratePipelineCandidates();
      setMigrationStatus(report);

      if (report.status === 'success') {
        showToast(
          language === 'NL'
            ? `Lokale kandidaten veilig gesynchroniseerd (${report.migratedCount} nieuw, ${report.duplicateCount} reeds aanwezig)!`
            : `Local candidates safely synced (${report.migratedCount} new, ${report.duplicateCount} already existed)!`
        );
        fetchCandidates();
      } else if (report.status === 'partial') {
        showToast(
          language === 'NL'
            ? `Gedeeltelijke migratie: ${report.migratedCount} gemigreerd, ${report.remainingCount} bewaard voor retry.`
            : `Partial migration: ${report.migratedCount} migrated, ${report.remainingCount} retained for retry.`
        );
        fetchCandidates();
      } else if (report.status === 'offline') {
        showToast(
          language === 'NL'
            ? 'Netwerk offline. Lokale kandidaten zijn veilig bewaard en niet overschreven.'
            : 'Network offline. Local candidates safely preserved and not overwritten.'
        );
      } else if (report.status === 'failed') {
        showToast(
          language === 'NL'
            ? 'Migratie mislukt door server/netwerkfout. Lokale gegevens zijn veilig bewaard.'
            : 'Migration failed due to server/network error. Local data safely preserved.'
        );
      }
    } catch (err) {
      console.error('[Pipeline] Migration error:', err);
      setMigrationStatus({
        status: 'failed',
        error: err?.message || 'Unexpected migration error',
        remainingCount: 'all',
      });
    } finally {
      setIsMigrating(false);
    }
  }, [fetchCandidates, language]);

  useEffect(() => {
    const rawStored = typeof window !== 'undefined' ? localStorage.getItem('app_pipeline_candidates') : null;
    if (rawStored) {
      handleRunMigration();
    }
  }, [handleRunMigration]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // ─── Pipeline Candidate Handlers (Backend API) ───────────────────────────
  const handleAdvanceCandidateStage = async (candidate) => {
    const progression = {
      interested: 'in_discussion',
      in_discussion: 'trial_project',
      trial_project: 'active',
    };
    const nextStage = progression[candidate.stage];
    if (!nextStage) return;

    try {
      const res = await api.patch(`/partner-candidates/${candidate.id}/stage`, { stage: nextStage });
      if (res?.success) {
        showToast(
          language === 'NL'
            ? 'Kandidaat doorgeschoven naar volgende fase!'
            : 'Candidate advanced to next stage!'
        );
        fetchCandidates();
      } else {
        showToast(res?.error?.message || 'Failed to update stage');
      }
    } catch {
      showToast('Failed to update stage');
    }
  };

  const handleRejectCandidate = async (candidate) => {
    if (!window.confirm(
      language === 'NL'
        ? `Weet je zeker dat je kandidaat "${candidate.name}" wilt verplaatsen naar Afgewezen?`
        : `Are you sure you want to move candidate "${candidate.name}" to Rejected?`
    )) return;

    try {
      const res = await api.patch(`/partner-candidates/${candidate.id}/stage`, { stage: 'rejected' });
      if (res?.success) {
        showToast(language === 'NL' ? 'Kandidaat verplaatst naar Afgewezen.' : 'Candidate moved to Rejected.');
        fetchCandidates();
      } else {
        showToast(res?.error?.message || 'Failed to update stage');
      }
    } catch {
      showToast('Failed to update candidate stage');
    }
  };

  const handleReopenCandidate = async (candidate) => {
    try {
      const res = await api.patch(`/partner-candidates/${candidate.id}/stage`, { stage: 'interested' });
      if (res?.success) {
        showToast(language === 'NL' ? 'Kandidaat heropend naar Geïnteresseerd.' : 'Candidate reopened to Interested.');
        fetchCandidates();
      } else {
        showToast(res?.error?.message || 'Failed to reopen candidate');
      }
    } catch {
      showToast('Failed to reopen candidate');
    }
  };

  const handleOpenAddCandidateModal = () => {
    setEditingCandidate(null);
    setCandidateForm({
      name: '',
      companyName: '',
      phone: '',
      email: '',
      region: 'Noord-Holland',
      stage: 'interested',
      productTypes: 'Buitenkeukens, Kliko-ombouw',
      kvkNumber: '',
      btwNumber: '',
      notes: '',
    });
    setCandidateModalOpen(true);
  };

  const handleOpenEditCandidateModal = (cand) => {
    setEditingCandidate(cand);
    setCandidateForm({
      name: cand.name || '',
      companyName: cand.companyName || '',
      phone: cand.phone || '',
      email: cand.email || '',
      region: cand.region || 'Noord-Holland',
      stage: cand.stage || 'interested',
      productTypes: Array.isArray(cand.productTypes)
        ? cand.productTypes.join(', ')
        : (cand.productTypes || 'Buitenkeukens, Kliko-ombouw'),
      kvkNumber: cand.kvkNumber || '',
      btwNumber: cand.btwNumber || '',
      notes: cand.notes || '',
    });
    setCandidateModalOpen(true);
  };

  const handleSaveCandidate = async (e) => {
    e.preventDefault();
    if (!candidateForm.name.trim() || !candidateForm.email.trim() || !candidateForm.phone.trim()) {
      showToast(language === 'NL' ? 'Naam, e-mail en telefoon zijn verplicht.' : 'Name, email, and phone are required.');
      return;
    }

    setIsSavingCandidate(true);
    try {
      const types = candidateForm.productTypes
        ? candidateForm.productTypes.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const payload = {
        name: candidateForm.name.trim(),
        companyName: candidateForm.companyName.trim() || candidateForm.name.trim(),
        email: candidateForm.email.trim().toLowerCase(),
        phone: candidateForm.phone.trim(),
        region: candidateForm.region.trim() || 'Nederland',
        stage: candidateForm.stage,
        notes: candidateForm.notes.trim() || undefined,
        productTypes: types,
        kvkNumber: candidateForm.kvkNumber.trim() || undefined,
        btwNumber: candidateForm.btwNumber.trim() || undefined,
      };

      let res;
      if (editingCandidate) {
        res = await api.patch(`/partner-candidates/${editingCandidate.id}`, payload);
      } else {
        res = await api.post('/partner-candidates', payload);
      }

      if (res?.success) {
        showToast(
          editingCandidate
            ? (language === 'NL' ? 'Kandidaat bijgewerkt!' : 'Candidate updated!')
            : (language === 'NL' ? 'Kandidaat toegevoegd aan pijplijn!' : 'Candidate added to pipeline!')
        );
        setCandidateModalOpen(false);
        fetchCandidates();
      } else {
        showToast(res?.error?.message || 'Failed to save candidate.');
      }
    } catch {
      showToast('Unable to reach the server.');
    } finally {
      setIsSavingCandidate(false);
    }
  };

  const handleDeleteCandidate = async (candId, candName) => {
    if (!window.confirm(language === 'NL' ? `Kandidaat "${candName}" definitief verwijderen?` : `Permanently delete candidate "${candName}"?`)) return;
    try {
      const res = await api.delete(`/partner-candidates/${candId}`);
      if (res?.success) {
        showToast(language === 'NL' ? `Kandidaat "${candName}" verwijderd.` : `Candidate "${candName}" deleted.`);
        fetchCandidates();
      } else {
        showToast(res?.error?.message || 'Failed to delete candidate.');
      }
    } catch {
      showToast('Unable to reach the server.');
    }
  };

  // ─── Candidate to Partner Conversion ─────────────────────────────────────
  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let rand = '';
    for (let i = 0; i < 8; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `Ambacht@${rand}!`;
  };

  const handleOpenConvertModal = (candidate) => {
    setCandidateToConvert(candidate);
    const types = Array.isArray(candidate.productTypes)
      ? candidate.productTypes.join(', ')
      : (candidate.productTypes || 'Buitenkeukens, Kliko-ombouw');

    setConvertForm({
      password: generateSecurePassword(),
      companyName: candidate.companyName || candidate.name,
      kvkNumber: candidate.kvkNumber || '',
      btwNumber: candidate.btwNumber || '',
      productTypes: types,
      workloadStatus: 'available',
    });
    setShowConvertPassword(false);
    setCopiedCredentials(false);
    setConvertModalOpen(true);
  };

  const handleCopyCredentials = async () => {
    const origin = window.location.origin;
    const text = `Vanuit Ambacht - Partner Login Credentials\n` +
      `Portal: ${origin}/login\n` +
      `Email: ${candidateToConvert?.email}\n` +
      `Password: ${convertForm.password}`;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedCredentials(true);
      setTimeout(() => setCopiedCredentials(false), 2500);
      showToast(language === 'NL' ? 'Inloggegevens gekopieerd naar klembord!' : 'Credentials copied to clipboard!');
    } catch {
      showToast('Failed to copy credentials.');
    }
  };

  const handleConfirmConversion = async (e) => {
    e.preventDefault();
    if (!convertForm.password || convertForm.password.length < 6) {
      showToast(language === 'NL' ? 'Wachtwoord moet minimaal 6 tekens bevatten.' : 'Password must be at least 6 characters.');
      return;
    }

    setIsConverting(true);
    try {
      const types = convertForm.productTypes
        ? convertForm.productTypes.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const res = await api.post(`/partner-candidates/${candidateToConvert.id}/convert`, {
        password: convertForm.password.trim(),
        companyName: convertForm.companyName.trim() || undefined,
        kvkNumber: convertForm.kvkNumber.trim() || undefined,
        btwNumber: convertForm.btwNumber.trim() || undefined,
        productTypes: types,
        workloadStatus: convertForm.workloadStatus,
      });

      if (res?.success) {
        showToast(
          language === 'NL'
            ? `Kandidaat succesvol omgezet naar officiële partner! Account aangemaakt.`
            : `Candidate successfully converted to official partner! User account created.`
        );
        setConvertModalOpen(false);
        fetchCandidates();
        fetchPartners();
      } else {
        showToast(res?.error?.message || 'Conversion failed.');
      }
    } catch {
      showToast('Failed to convert candidate to partner.');
    } finally {
      setIsConverting(false);
    }
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const translateProductType = (type) => {
    if (language !== 'EN' || !type) return type;
    const lower = type.toLowerCase();
    if (lower.includes('buitenkeuk')) return 'Outdoor Kitchens';
    if (lower.includes('overkapping')) return 'Canopies';
    if (lower.includes('kliko')) return 'Bin Storage';
    if (lower.includes('stalen frame')) return 'Steel Frames';
    if (lower.includes('buitenverblijf')) return 'Outdoor Living';
    if (lower.includes('poolhouse')) return 'Poolhouse';
    return type;
  };

  const getWorkloadBadge = (workload) => {
    switch (workload) {
      case 'Beschikbaar': case 'Available':
        return <Badge variant="success" className="whitespace-nowrap flex-shrink-0">{language === 'EN' ? '🟢 Available' : '🟢 Beschikbaar'}</Badge>;
      case 'Druk': case 'Busy':
        return <Badge variant="warning" className="whitespace-nowrap flex-shrink-0">{language === 'EN' ? '🟡 Busy' : '🟡 Druk'}</Badge>;
      case 'Volgeboekt': case 'Fully booked':
        return <Badge variant="danger" className="whitespace-nowrap flex-shrink-0">{language === 'EN' ? '🔴 Fully booked' : '🔴 Volgeboekt'}</Badge>;
      default:
        return <Badge variant="default" className="whitespace-nowrap flex-shrink-0">{language === 'EN' ? 'Inactive' : 'Inactief'}</Badge>;
    }
  };

  const filteredPartners = partners.filter(partner => {
    const matchesSearch =
      (partner.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (partner.company || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (partner.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (partner.region || '').toLowerCase().includes(searchQuery.toLowerCase());
    const isActive = partner.status === 'Active';
    const matchesStatus = statusFilter === 'All' || (statusFilter === 'Active' ? isActive : !isActive);
    return matchesSearch && matchesStatus;
  });

  // ─── Table columns ────────────────────────────────────────────────────────
  const columns = [
    {
      header: t('partners.partnerCompany') || 'Partner / Company',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
            {row.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <button onClick={() => setDetailModalPartner(row)} className="font-semibold text-primary hover:underline leading-tight text-left text-xs">
              {row.name}
            </button>
            <p className="text-[10px] text-dark/50">{row.company}</p>
          </div>
        </div>
      )
    },
    { header: t('partners.regionLocation') || 'Region / Location', accessor: 'region' },
    {
      header: t('partners.productSpecialism') || 'Product Specialism',
      render: (row) => (
        <div className="flex flex-wrap items-center gap-1 max-w-full">
          {Array.isArray(row.productTypes) && row.productTypes.map((type, i) => (
            <span key={i} className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md whitespace-nowrap">
              {translateProductType(type)}
            </span>
          ))}
        </div>
      )
    },
    {
      header: t('partners.workloadIndicator') || 'Workload',
      render: (row) => (
        <select
          value={row.workloadStatus}
          onChange={(e) => handleUpdateWorkload(row.id, e.target.value)}
          className="text-[10px] font-bold bg-transparent border border-[#D6CFC2] rounded-lg px-2 py-1 cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          <option value="available">{language === 'EN' ? '🟢 Available' : '🟢 Beschikbaar'}</option>
          <option value="busy">{language === 'EN' ? '🟡 Busy' : '🟡 Druk'}</option>
          <option value="fully_booked">{language === 'EN' ? '🔴 Fully Booked' : '🔴 Volgeboekt'}</option>
          <option value="inactive">{language === 'EN' ? 'Inactive' : 'Inactief'}</option>
        </select>
      )
    },
    {
      header: t('common.status') || 'Status',
      render: (row) => (
        <Badge variant={row.status === 'Active' ? 'success' : 'default'}>
          {language === 'EN' ? (row.status === 'Active' ? 'Active' : 'Inactive') : (row.status === 'Active' ? 'Actief' : 'Inactief')}
        </Badge>
      )
    },
    {
      header: t('common.actions') || 'Actions',
      render: (row) => (
        <div className="flex gap-1.5 whitespace-nowrap">
          <Button variant="ghost" size="sm" onClick={() => setDetailModalPartner(row)} className="text-primary hover:bg-[#D6CFC2]/40" title="View Profile">
            <User className="w-3.5 h-3.5 mr-1" /> {language === 'EN' ? 'Profile' : 'Profiel'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(row)} className="text-dark/70 hover:bg-[#D6CFC2]/40">
            <Edit2 className="w-3.5 h-3.5 mr-1" /> {t('common.edit') || 'Edit'}
          </Button>
          <Button variant="custom" size="sm" onClick={() => handleDeletePartner(row.id, row.name)} className="text-red-600 bg-red-50 hover:bg-red-100 border border-red-200">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 relative font-body text-[#4A4A43]">
      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 80 }}
            className="fixed top-20 right-4 z-[9999] flex items-center gap-2 bg-primary text-cream px-4 py-3 rounded-xl shadow-lg text-xs">
            <CheckCircle className="w-4 h-4 text-green-400" /> {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-primary">Partners Module</h2>
          <p className="text-dark/60 text-sm">
            {language === 'EN' ? 'Manage active craftspeople and the recruitment pipeline for new partners.' : 'Beheer actieve ambachtelijke vakmannen en de sollicitatiepijplijn voor nieuwe partners.'}
          </p>
        </div>
        <Button size="sm" icon={Plus} onClick={handleOpenAddModal} className="py-1.5 px-3 text-xs font-bold whitespace-nowrap">
          {language === 'EN' ? 'Add New Partner' : 'Nieuwe Partner'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#D6CFC2] pb-2 overflow-x-auto">
        {[
          { id: 'Active', icon: Briefcase, label: language === 'EN' ? 'Active Partners List' : 'Actieve Partners Lijst' },
          { id: 'Pipeline', icon: Clock, label: language === 'EN' ? 'Prospective Partner Pipeline (Kanban)' : 'Potentiële Partner Pijplijn (Kanban)' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-body transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-primary text-cream shadow-sm' : 'bg-white/80 text-dark/70 hover:bg-[#EDE8DF]'}`}>
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          <button onClick={fetchPartners} className="ml-auto font-bold underline">Retry</button>
        </div>
      )}

      {/* ── TAB 1: ACTIVE PARTNERS ── */}
      {activeTab === 'Active' && (
        <div className="space-y-6">
          {/* Top 3 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {filteredPartners.slice(0, 3).map(partner => (
              <Card key={partner.id} noPadding className="p-3.5 hover:shadow-md transition-all border-l-4 border-l-primary flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-heading font-bold text-xs flex-shrink-0">
                        {partner.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-heading font-bold text-dark text-sm truncate leading-tight">{partner.name}</h3>
                        <p className="text-[10px] text-dark/50 font-mono truncate">{partner.company || partner.region}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">{getWorkloadBadge(partner.workload)}</div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-dark/60 pt-1">
                    <span className="flex items-center gap-1 font-medium"><MapPin className="w-3 h-3 text-accent flex-shrink-0" /> {partner.region}</span>
                    <span className="font-bold text-primary flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {partner.rating}</span>
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-[#D6CFC2]/50 flex justify-between items-center">
                  <span className="text-[10px] font-mono text-dark/40">{partner.id?.slice(0, 8)}…</span>
                  <button onClick={() => setDetailModalPartner(partner)} className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
                    {language === 'EN' ? 'View Profile →' : 'Bekijk Profiel →'}
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {/* Table */}
          <Card>
            <div className="mb-6 flex flex-col sm:flex-row justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/40" />
                <input type="text" placeholder={t('partners.searchPlaceholder') || 'Search by partner name, region or specialty...'}
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#EDE8DF]/30 border border-[#D6CFC2] rounded-lg text-sm focus:outline-none" />
              </div>
              <div className="flex gap-2 items-center">
                {['All', 'Active', 'Inactive'].map(st => (
                  <button key={st} onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${statusFilter === st ? 'bg-primary text-cream border-primary' : 'bg-[#EDE8DF]/30 text-dark/70 border-[#D6CFC2]'}`}>
                    {st === 'All' ? (t('common.all') || 'All') : st === 'Active' ? (t('common.active') || 'Active') : (t('common.inactive') || 'Inactive')}
                  </button>
                ))}
                <button onClick={fetchPartners} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors" title="Refresh">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-dark/50 text-sm">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                {language === 'EN' ? 'Loading partners...' : 'Partners laden...'}
              </div>
            ) : (
              <Table columns={columns} data={filteredPartners}
                emptyMessage={language === 'EN' ? 'No partners found.' : 'Geen partners gevonden.'} />
            )}
          </Card>
        </div>
      )}

      {/* ── TAB 2: PIPELINE KANBAN (Backend-Connected) ── */}
      {activeTab === 'Pipeline' && (
        <div className="space-y-4 font-body">
          <div className="bg-[#EDE8DF]/50 p-4 rounded-xl border border-[#D6CFC2] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-primary text-sm">
                  {language === 'EN' ? 'Prospective Partner Recruitment Pipeline' : 'Potentiële Partner Wervingspijplijn'}
                </h3>
                <span className="text-[10px] font-bold bg-white text-primary px-2 py-0.5 rounded-full border border-[#D6CFC2]">
                  {candidates.length} {language === 'EN' ? 'Total' : 'Totaal'}
                </span>
              </div>
              <p className="text-dark/60 mt-0.5">
                {language === 'EN'
                  ? 'Track candidate recruitment across 5 stages and atomically convert approved craftspeople into official partners.'
                  : 'Beheer kandidaat-werving over 5 fasen en zet goedgekeurde vakmannen atomair om naar officiële partners.'}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={fetchCandidates}
                className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1 font-bold text-xs px-2.5"
                title={language === 'EN' ? 'Refresh candidates' : 'Kandidaten vernieuwen'}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCandidatesLoading ? 'animate-spin' : ''}`} />
                {language === 'EN' ? 'Refresh' : 'Vernieuwen'}
              </button>
              <Button size="sm" icon={Plus} onClick={handleOpenAddCandidateModal} className="py-1 px-2.5 text-xs font-bold">
                {language === 'EN' ? 'Add Candidate' : 'Kandidaat Toevoegen'}
              </Button>
            </div>
          </div>

          {/* ── LocalStorage Migration Status Banner ── */}
          {migrationStatus && migrationStatus.status !== 'none' && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                migrationStatus.status === 'success'
                  ? 'bg-green-50 border-green-200 text-green-900'
                  : migrationStatus.status === 'partial'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : migrationStatus.status === 'offline'
                  ? 'bg-orange-50 border-orange-200 text-orange-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                {migrationStatus.status === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                ) : migrationStatus.status === 'partial' ? (
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                ) : migrationStatus.status === 'offline' ? (
                  <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold font-heading">
                    {migrationStatus.status === 'success' && (language === 'EN' ? 'Migration Successful' : 'Migratie Succesvol')}
                    {migrationStatus.status === 'partial' && (language === 'EN' ? 'Partial Migration Completed' : 'Gedeeltelijke Migratie Voltooid')}
                    {migrationStatus.status === 'offline' && (language === 'EN' ? 'Network Offline — Local Data Preserved' : 'Netwerk Offline — Lokale Gegevens Veilig Bewaard')}
                    {migrationStatus.status === 'failed' && (language === 'EN' ? 'Migration Interrupted — Local Data Preserved' : 'Migratie Onderbroken — Lokale Gegevens Veilig')}
                  </div>
                  <div className="text-[11px] opacity-90 mt-0.5">
                    {migrationStatus.status === 'success' && (
                      language === 'EN'
                        ? `All local candidates migrated to PostgreSQL (${migrationStatus.migratedCount} new, ${migrationStatus.duplicateCount} existing). Backup: ${migrationStatus.backupKey}`
                        : `Alle lokale kandidaten gesynchroniseerd met de database (${migrationStatus.migratedCount} nieuw, ${migrationStatus.duplicateCount} bestaand). Veilige backup: ${migrationStatus.backupKey}`
                    )}
                    {migrationStatus.status === 'partial' && (
                      language === 'EN'
                        ? `${migrationStatus.migratedCount} migrated, ${migrationStatus.duplicateCount || 0} already in DB. ${migrationStatus.remainingCount} candidate(s) retained locally for safe retry. Backup: ${migrationStatus.backupKey}`
                        : `${migrationStatus.migratedCount} gemigreerd, ${migrationStatus.duplicateCount || 0} reeds in DB. ${migrationStatus.remainingCount} kandidaat/kandidaten bewaard in browser voor retry. Backup: ${migrationStatus.backupKey}`
                    )}
                    {migrationStatus.status === 'offline' && (
                      language === 'EN'
                        ? `${migrationStatus.remainingCount || migrationStatus.totalCount} candidate(s) preserved in localStorage. No data lost. Reconnect and click retry.`
                        : `${migrationStatus.remainingCount || migrationStatus.totalCount} kandidaat/kandidaten bewaard in localStorage. Geen data verloren. Herstel verbinding en klik retry.`
                    )}
                    {migrationStatus.status === 'failed' && (
                      language === 'EN'
                        ? `A server or network error prevented full migration. ${migrationStatus.remainingCount} candidate(s) remain in local storage. Backup: ${migrationStatus.backupKey || 'created'}`
                        : `Een server- of netwerkfout verhinderde volledige migratie. ${migrationStatus.remainingCount} kandidaat/kandidaten bewaard in browser. Backup: ${migrationStatus.backupKey || 'aangemaakt'}`
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                {migrationStatus.status !== 'success' && (
                  <button
                    onClick={handleRunMigration}
                    disabled={isMigrating}
                    className="px-3 py-1.5 rounded-lg bg-primary text-cream hover:bg-primary/90 text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isMigrating ? 'animate-spin' : ''}`} />
                    {language === 'EN' ? 'Retry Migration' : 'Opnieuw Proberen'}
                  </button>
                )}
                <button
                  onClick={() => setMigrationStatus(null)}
                  className="p-1 rounded-md text-dark/40 hover:text-dark transition-colors"
                  title={language === 'EN' ? 'Dismiss' : 'Sluiten'}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Pending unmigrated local candidates notice */}
          {!migrationStatus && typeof window !== 'undefined' && Boolean(localStorage.getItem('app_pipeline_candidates')) && (
            <div className="p-3.5 rounded-xl border bg-amber-50 border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <div>
                  <span className="font-bold">
                    {language === 'EN' ? 'Pending Local Candidates Found' : 'Niet-gemigreerde Lokale Kandidaten Gevonden'}
                  </span>
                  <p className="text-[11px] opacity-90 mt-0.5">
                    {language === 'EN'
                      ? 'Local candidate data found in this browser. Synchronize safely to PostgreSQL.'
                      : 'Lokale kandidaatgegevens gevonden in deze browser. Synchroniseer veilig naar PostgreSQL.'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRunMigration}
                disabled={isMigrating}
                className="px-3 py-1.5 rounded-lg bg-primary text-cream hover:bg-primary/90 text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isMigrating ? 'animate-spin' : ''}`} />
                {language === 'EN' ? 'Migrate Now' : 'Nu Migreren'}
              </button>
            </div>
          )}

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3.5 items-start">
            {[
              {
                id: 'interested',
                title: language === 'EN' ? '🟡 1. Interested' : '🟡 1. Geïnteresseerd',
                color: 'border-amber-300 bg-amber-50/40',
                badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
              },
              {
                id: 'in_discussion',
                title: language === 'EN' ? '🔵 2. In Discussion' : '🔵 2. In Gesprek',
                color: 'border-blue-300 bg-blue-50/40',
                badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
              },
              {
                id: 'trial_project',
                title: language === 'EN' ? '🟣 3. Trial Project' : '🟣 3. Proefproject',
                color: 'border-purple-300 bg-purple-50/40',
                badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
                note: language === 'EN'
                  ? 'Evaluation Stage: Live customer projects are NOT assigned during trial.'
                  : 'Beoordelingsfase: Echte klantprojecten worden NIET toegekend tijdens proef.',
              },
              {
                id: 'active',
                title: language === 'EN' ? '🟢 4. Active Partner' : '🟢 4. Actief Partner',
                color: 'border-green-300 bg-green-50/40',
                badgeBg: 'bg-green-100 text-green-800 border-green-200',
              },
              {
                id: 'rejected',
                title: language === 'EN' ? '⚪ 5. Rejected / Archived' : '⚪ 5. Afgewezen / Archief',
                color: 'border-neutral-300 bg-neutral-100/50',
                badgeBg: 'bg-neutral-200 text-neutral-700 border-neutral-300',
              },
            ].map(col => {
              const stageCandidates = candidates.filter(c => c.stage === col.id);
              return (
                <div key={col.id} className={`p-2.5 rounded-xl border-2 ${col.color} space-y-2.5 min-w-0 flex flex-col`}>
                  <div className="flex justify-between items-center pb-2 border-b border-[#D6CFC2]/60">
                    <h4 className="font-heading font-bold text-xs text-primary truncate" title={col.title}>
                      {col.title}
                    </h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${col.badgeBg}`}>
                      {stageCandidates.length}
                    </span>
                  </div>

                  {col.note && (
                    <div className="bg-purple-100/70 border border-purple-200 text-purple-900 rounded-lg p-2 text-[10px] leading-tight flex items-start gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 text-purple-600 mt-0.5" />
                      <span>{col.note}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    {stageCandidates.map(cand => {
                      const isConverted = Boolean(cand.convertedPartnerId);
                      return (
                        <Card key={cand.id} noPadding className="p-3 bg-white space-y-2 border border-[#D6CFC2] shadow-xs text-xs rounded-xl relative group hover:shadow-md transition-all">
                          {/* Card Header */}
                          <div className="flex justify-between items-start gap-1">
                            <div className="min-w-0 pr-1">
                              <h5 className="font-bold text-dark text-xs truncate leading-tight" title={cand.name}>
                                {cand.name}
                              </h5>
                              <p className="text-[10px] text-primary font-bold truncate">
                                {cand.companyName || cand.name}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <span className="text-[9px] font-mono font-bold bg-[#EDE8DF] text-primary px-1.5 py-0.5 rounded-md truncate max-w-[80px]">
                                {cand.region || 'Nederland'}
                              </span>
                              <button
                                onClick={() => handleOpenEditCandidateModal(cand)}
                                className="p-1 text-dark/40 hover:text-dark transition-colors"
                                title={language === 'EN' ? 'Edit Candidate' : 'Kandidaat Bewerken'}
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              {!isConverted && (
                                <button
                                  onClick={() => handleDeleteCandidate(cand.id, cand.name)}
                                  className="p-1 text-red-400 hover:text-red-700 transition-colors"
                                  title={language === 'EN' ? 'Delete Candidate' : 'Kandidaat Verwijderen'}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Contact Info */}
                          <div className="text-[10px] text-dark/70 space-y-0.5 pt-1 border-t border-[#D6CFC2]/40 font-body">
                            <a href={`tel:${cand.phone}`} className="flex items-center gap-1 truncate hover:text-primary transition-colors">
                              <Phone className="w-3 h-3 text-primary flex-shrink-0" /> {cand.phone}
                            </a>
                            <a href={`mailto:${cand.email}`} className="flex items-center gap-1 truncate hover:text-primary transition-colors">
                              <Mail className="w-3 h-3 text-primary flex-shrink-0" /> {cand.email}
                            </a>
                          </div>

                          {/* Specialties */}
                          {cand.productTypes && cand.productTypes.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {cand.productTypes.slice(0, 2).map((pt, i) => (
                                <span key={i} className="text-[9px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded truncate max-w-full">
                                  {translateProductType(pt)}
                                </span>
                              ))}
                              {cand.productTypes.length > 2 && (
                                <span className="text-[9px] font-semibold bg-neutral-100 text-dark/50 px-1 py-0.5 rounded">
                                  +{cand.productTypes.length - 2}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Notes */}
                          {cand.notes && (
                            <div className="bg-[#F8F7F4] p-1.5 rounded-md border border-[#D6CFC2]/50 text-[10px] italic text-dark/70 line-clamp-2">
                              "{cand.notes}"
                            </div>
                          )}

                          {/* Converted Indicator */}
                          {isConverted && (
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-2 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1 font-bold text-[10px]">
                                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                                  {language === 'EN' ? 'Official Partner' : 'Officiële Partner'}
                                </span>
                                <button
                                  onClick={() => {
                                    setActiveTab('Active');
                                    setSearchQuery(cand.email);
                                  }}
                                  className="text-[9px] font-bold text-emerald-700 underline hover:text-emerald-900"
                                >
                                  {language === 'EN' ? 'View Profile →' : 'Bekijk Profiel →'}
                                </button>
                              </div>
                              <p className="text-[9px] text-emerald-700/80 font-mono">
                                {cand.convertedAt ? new Date(cand.convertedAt).toLocaleDateString() : 'Active'}
                              </p>
                            </div>
                          )}

                          {/* Action Buttons based on stage */}
                          {col.id === 'active' && !isConverted && (
                            <div className="space-y-1 pt-1 border-t border-[#D6CFC2]/40">
                              <button
                                onClick={() => handleOpenConvertModal(cand)}
                                className="w-full py-1.5 bg-gradient-to-r from-emerald-600 to-primary text-white hover:opacity-95 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                                {language === 'EN' ? 'Convert to Official Partner' : 'Omzetten naar Officiële Partner'}
                              </button>
                              <button
                                onClick={() => handleRejectCandidate(cand)}
                                className="w-full py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-[10px] font-semibold transition-all flex items-center justify-center gap-1"
                              >
                                <Archive className="w-3 h-3 text-neutral-500" />
                                {language === 'EN' ? 'Reject / Archive' : 'Afwijzen / Archiveren'}
                              </button>
                            </div>
                          )}

                          {['interested', 'in_discussion', 'trial_project'].includes(col.id) && (
                            <div className="space-y-1 pt-1 border-t border-[#D6CFC2]/40">
                              <button
                                onClick={() => handleAdvanceCandidateStage(cand)}
                                className="w-full py-1.5 bg-primary text-cream hover:bg-primary/90 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 shadow-xs"
                              >
                                {language === 'EN' ? 'Next Stage' : 'Volgende Fase'} <ChevronRight className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleRejectCandidate(cand)}
                                className="w-full py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-[10px] font-semibold transition-all flex items-center justify-center gap-1"
                              >
                                <Archive className="w-3 h-3 text-neutral-500" />
                                {language === 'EN' ? 'Reject' : 'Afwijzen'}
                              </button>
                            </div>
                          )}

                          {col.id === 'rejected' && (
                            <div className="pt-1 border-t border-[#D6CFC2]/40">
                              <button
                                onClick={() => handleReopenCandidate(cand)}
                                className="w-full py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1"
                              >
                                <Undo2 className="w-3 h-3 text-amber-700" />
                                {language === 'EN' ? 'Reopen Candidate' : 'Heropenen'}
                              </button>
                            </div>
                          )}
                        </Card>
                      );
                    })}

                    {stageCandidates.length === 0 && (
                      <div className="text-center py-6 text-[10px] text-dark/40 italic bg-white/50 rounded-xl border border-dashed border-[#D6CFC2]">
                        {language === 'EN' ? 'No candidates in this stage.' : 'Geen kandidaten in deze fase.'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── PARTNER DETAIL MODAL ── */}
      <AnimatePresence>
        {detailModalPartner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-dark/70 backdrop-blur-xs" onClick={() => setDetailModalPartner(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-4 max-h-[90vh] overflow-y-auto text-xs">

              {/* Profile Header */}
              <div className="flex justify-between items-start border-b border-[#D6CFC2] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-primary text-cream flex items-center justify-center font-heading font-bold text-xl">
                    {detailModalPartner.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-heading font-bold text-primary">{detailModalPartner.name}</h3>
                      {getWorkloadBadge(detailModalPartner.workload)}
                    </div>
                    <p className="text-xs font-bold text-accent">{detailModalPartner.company} — <span className="font-mono text-dark/60">{detailModalPartner.kvk || (language === 'NL' ? 'KVK-Geregistreerd' : 'CoC Registered')}</span></p>
                    <p className="text-[11px] text-dark/60 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {detailModalPartner.region}</p>
                    <p className="text-[11px] text-amber-600 flex items-center gap-0.5 mt-0.5"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {detailModalPartner.rating} / 5.00</p>
                  </div>
                </div>
                <button onClick={() => setDetailModalPartner(null)} className="p-1 text-dark/40 hover:text-dark"><X className="w-5 h-5" /></button>
              </div>

              {/* Contact actions */}
              <div className="flex gap-2 flex-wrap">
                <a href={`https://wa.me/${(detailModalPartner.phone || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg font-bold text-[11px]">
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </a>
                <a href={`tel:${detailModalPartner.phone}`} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-[11px]">
                  <Phone className="w-3.5 h-3.5" /> {language === 'NL' ? 'Bellen' : 'Call'} ({detailModalPartner.phone})
                </a>
                <a href={`mailto:${detailModalPartner.email}`} className="flex items-center gap-1 px-3 py-1.5 bg-[#3E4E36] text-white rounded-lg font-bold text-[11px]">
                  <Mail className="w-3.5 h-3.5" /> {language === 'NL' ? 'E-mail' : 'Email'} ({detailModalPartner.email})
                </a>
              </div>

              {/* Product Types */}
              <div className="space-y-2 pt-2 border-t border-[#D6CFC2]">
                <h4 className="font-heading font-bold text-primary text-sm flex items-center gap-2">
                  <Wrench className="w-4 h-4" /> {language === 'NL' ? 'Product Specialismen' : 'Product Specialties'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(detailModalPartner.productTypes || []).map((t, i) => (
                    <span key={i} className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">{translateProductType(t)}</span>
                  ))}
                </div>
              </div>

              {/* Internal Notes */}
              <div className="space-y-2 pt-2 border-t border-[#D6CFC2]">
                <h4 className="font-heading font-bold text-primary text-sm">{language === 'NL' ? 'Interne Notities' : 'Internal Notes'}</h4>
                <div className="p-3 bg-white rounded-xl border border-[#D6CFC2]/60 text-dark/80 italic">
                  "{detailModalPartner.notes || (language === 'NL' ? 'Geen specifieke interne notities.' : 'No specific internal notes.')}"
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => setDetailModalPartner(null)}>{language === 'NL' ? 'Sluiten' : 'Close'}</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CREATE / EDIT PARTNER MODAL ── */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-4">
              <div className="flex items-center justify-between border-b border-cream-dark/60 pb-3">
                <h3 className="text-lg font-heading font-bold text-primary">
                  {selectedPartner ? (language === 'NL' ? 'Partner Bewerken' : 'Edit Partner') : (language === 'NL' ? 'Nieuwe Partner Toevoegen' : 'Add New Partner')}
                </h3>
                <button onClick={() => setModalOpen(false)} className="p-1 text-dark/40 hover:text-dark"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-dark/60 mb-1 uppercase">{language === 'NL' ? 'Naam Vakman *' : 'Craftsman Name *'}</label>
                  <input type="text" required value={form.contactPerson} onChange={e => setForm(p => ({ ...p, contactPerson: e.target.value }))} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg" placeholder="e.g. Sven Hoek" />
                </div>
                <div>
                  <label className="block font-semibold text-dark/60 mb-1 uppercase">{language === 'NL' ? 'Bedrijfsnaam *' : 'Company Name *'}</label>
                  <input type="text" required value={form.companyName} onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg" placeholder="e.g. Hoek Bouw BV" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-dark/60 mb-1 uppercase">{language === 'NL' ? 'E-mail *' : 'Email *'}</label>
                    <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg" />
                  </div>
                  <div>
                    <label className="block font-semibold text-dark/60 mb-1 uppercase">{language === 'NL' ? 'Telefoon *' : 'Phone *'}</label>
                    <input type="text" required value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg" />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-dark/60 mb-1 uppercase">
                    {language === 'NL' 
                      ? (selectedPartner ? 'Wachtwoord (Optioneel)' : 'Wachtwoord *') 
                      : (selectedPartner ? 'Password (Optional)' : 'Password *')}
                  </label>
                  <div className="relative">
                    <input 
                      type={showPasswordModal ? "text" : "password"} 
                      required={!selectedPartner} 
                      value={form.password || ''} 
                      onChange={e => setForm(p => ({ ...p, password: e.target.value }))} 
                      className="w-full pl-3 pr-10 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs font-mono" 
                      placeholder={selectedPartner ? (language === 'NL' ? 'Leeg laten om huidig te behouden' : 'Leave blank to keep current') : '••••••••'} 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordModal(!showPasswordModal)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dark/40 hover:text-dark p-1"
                      title={showPasswordModal ? "Hide Password" : "Show Password"}
                    >
                      {showPasswordModal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-dark/60 mb-1 uppercase">{language === 'NL' ? 'Regio / Provincie' : 'Region / Province'}</label>
                    <input type="text" value={form.region} onChange={e => setForm(p => ({ ...p, region: e.target.value }))} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg" placeholder="e.g. Noord-Holland" />
                  </div>
                  <div>
                    <label className="block font-semibold text-dark/60 mb-1 uppercase">{language === 'NL' ? 'Werkdruk' : 'Workload'}</label>
                    <select value={form.workloadStatus} onChange={e => setForm(p => ({ ...p, workloadStatus: e.target.value }))} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg font-bold">
                      <option value="available">{language === 'NL' ? '🟢 Beschikbaar' : '🟢 Available'}</option>
                      <option value="busy">{language === 'NL' ? '🟡 Druk (Busy)' : '🟡 Busy'}</option>
                      <option value="fully_booked">{language === 'NL' ? '🔴 Volgeboekt' : '🔴 Fully Booked'}</option>
                      <option value="inactive">{language === 'NL' ? 'Inactief' : 'Inactive'}</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-dark/60 mb-1 uppercase">KVK Nummer</label>
                    <input type="text" value={form.kvkNumber} onChange={e => setForm(p => ({ ...p, kvkNumber: e.target.value }))} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg" placeholder="88776655" />
                  </div>
                  <div>
                    <label className="block font-semibold text-dark/60 mb-1 uppercase">BTW Nummer</label>
                    <input type="text" value={form.btwNumber} onChange={e => setForm(p => ({ ...p, btwNumber: e.target.value }))} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg" placeholder="NL88776655B01" />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-dark/60 mb-1 uppercase">{language === 'NL' ? 'Product Specialismen (komma gescheiden)' : 'Product Specialties (comma separated)'}</label>
                  <input type="text" value={form.productTypes} onChange={e => setForm(p => ({ ...p, productTypes: e.target.value }))} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg" placeholder="Buitenkeukens, Kliko-ombouw" />
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-cream-dark/60">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>{t('common.cancel')}</Button>
                  <Button type="submit" disabled={isSaving} className="flex items-center gap-2">
                    {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {language === 'NL' ? 'Opslaan' : 'Save'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* ── CONVERT CANDIDATE TO OFFICIAL PARTNER MODAL ── */}
      <AnimatePresence>
        {convertModalOpen && candidateToConvert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
              onClick={() => setConvertModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-cream-dark/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-heading font-bold text-primary">
                      {language === 'EN' ? 'Convert Candidate to Official Partner' : 'Kandidaat Omzetten naar Officiële Partner'}
                    </h3>
                    <p className="text-[11px] text-dark/60">
                      {candidateToConvert.name} ({candidateToConvert.email})
                    </p>
                  </div>
                </div>
                <button onClick={() => setConvertModalOpen(false)} className="p-1 text-dark/40 hover:text-dark">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Informational banner */}
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-3 text-xs leading-relaxed space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  {language === 'EN' ? 'Atomic Conversion Notice' : 'Atomair Conversie Proces'}
                </p>
                <p className="text-[11px] text-emerald-800/90">
                  {language === 'EN'
                    ? 'This creates a login account in the Users table and an official Partner record in a single database transaction. All candidate data and audit linkage will be preserved.'
                    : 'Dit maakt een inlogaccount aan in de Users-tabel en een officieel Partner-record binnen één databasetransactie. Alle kandidaatgegevens en auditkoppelingen blijven behouden.'}
                </p>
              </div>

              <form onSubmit={handleConfirmConversion} className="space-y-3.5 text-xs">
                {/* Pre-filled readonly info */}
                <div className="grid grid-cols-2 gap-3 bg-[#F8F7F4] p-3 rounded-xl border border-[#D6CFC2]/70">
                  <div>
                    <span className="block text-[10px] font-semibold text-dark/50 uppercase">
                      {language === 'EN' ? 'Craftsman Name' : 'Naam Vakman'}
                    </span>
                    <span className="font-bold text-dark text-xs">{candidateToConvert.name}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-semibold text-dark/50 uppercase">
                      {language === 'EN' ? 'Login Email' : 'Inlog E-mail'}
                    </span>
                    <span className="font-mono text-xs text-primary font-bold">{candidateToConvert.email}</span>
                  </div>
                </div>

                {/* Company Name */}
                <div>
                  <label className="block font-semibold text-dark/60 mb-1 uppercase">
                    {language === 'EN' ? 'Official Company Name *' : 'Officiële Bedrijfsnaam *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={convertForm.companyName}
                    onChange={e => setConvertForm(p => ({ ...p, companyName: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg"
                    placeholder="e.g. De Boer Maatwerk BV"
                  />
                </div>

                {/* Password field with generation and copy feature */}
                <div className="bg-white p-3.5 rounded-xl border-2 border-emerald-300/70 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-primary uppercase text-[11px] flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-emerald-600" />
                      {language === 'EN' ? 'Partner Login Password *' : 'Partner Inlogwachtwoord *'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setConvertForm(p => ({ ...p, password: generateSecurePassword() }))}
                      className="text-[10px] font-bold text-accent hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      {language === 'EN' ? 'Generate New' : 'Nieuw Genereren'}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showConvertPassword ? 'text' : 'password'}
                      required
                      value={convertForm.password}
                      onChange={e => setConvertForm(p => ({ ...p, password: e.target.value }))}
                      className="w-full pl-3 pr-10 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs font-mono font-bold tracking-wider"
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConvertPassword(!showConvertPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dark/40 hover:text-dark p-1"
                    >
                      {showConvertPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Copy Credentials button */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-dark/50">
                      {language === 'EN' ? 'Copy login details for the partner:' : 'Kopieer inloggegevens voor de partner:'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCredentials}
                      className="px-2.5 py-1 bg-[#EDE8DF] hover:bg-[#D6CFC2] text-dark font-bold rounded-lg text-[10px] flex items-center gap-1 transition-all border border-[#D6CFC2]"
                    >
                      {copiedCredentials ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">{language === 'EN' ? 'Copied!' : 'Gekopieerd!'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-dark/60" />
                          <span>{language === 'EN' ? 'Copy Credentials' : 'Kopieer Gegevens'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Workload and Region */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-dark/60 mb-1 uppercase">
                      {language === 'EN' ? 'Initial Workload Status' : 'Initiële Werkdruk'}
                    </label>
                    <select
                      value={convertForm.workloadStatus}
                      onChange={e => setConvertForm(p => ({ ...p, workloadStatus: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg font-bold"
                    >
                      <option value="available">{language === 'NL' ? '🟢 Beschikbaar' : '🟢 Available'}</option>
                      <option value="busy">{language === 'NL' ? '🟡 Druk' : '🟡 Busy'}</option>
                      <option value="fully_booked">{language === 'NL' ? '🔴 Volgeboekt' : '🔴 Fully Booked'}</option>
                      <option value="inactive">{language === 'NL' ? 'Inactief' : 'Inactive'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-dark/60 mb-1 uppercase">
                      {language === 'EN' ? 'Product Specialties' : 'Product Specialismen'}
                    </label>
                    <input
                      type="text"
                      value={convertForm.productTypes}
                      onChange={e => setConvertForm(p => ({ ...p, productTypes: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg"
                      placeholder="Buitenkeukens, Kliko-ombouw"
                    />
                  </div>
                </div>

                {/* KVK & BTW */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-dark/60 mb-1 uppercase">KVK Nummer</label>
                    <input
                      type="text"
                      value={convertForm.kvkNumber}
                      onChange={e => setConvertForm(p => ({ ...p, kvkNumber: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg"
                      placeholder="88776655"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-dark/60 mb-1 uppercase">BTW Nummer</label>
                    <input
                      type="text"
                      value={convertForm.btwNumber}
                      onChange={e => setConvertForm(p => ({ ...p, btwNumber: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg"
                      placeholder="NL88776655B01"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2 pt-3 border-t border-cream-dark/60">
                  <Button type="button" variant="outline" onClick={() => setConvertModalOpen(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isConverting}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-2"
                  >
                    {isConverting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    {language === 'EN' ? 'Confirm & Convert Partner' : 'Bevestigen & Partner Aanmaken'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── ADD / EDIT PIPELINE CANDIDATE MODAL ── */}
      <AnimatePresence>
        {candidateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
              onClick={() => setCandidateModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-cream-dark/60 pb-3">
                <h3 className="text-lg font-heading font-bold text-primary">
                  {editingCandidate
                    ? (language === 'EN' ? 'Edit Candidate Details' : 'Kandidaat Gegevens Bewerken')
                    : (language === 'EN' ? 'Add Candidate to Pipeline' : 'Kandidaat Toevoegen aan Pijplijn')}
                </h3>
                <button onClick={() => setCandidateModalOpen(false)} className="p-1 text-dark/40 hover:text-dark">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCandidate} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-dark/60 mb-1 uppercase">
                    {language === 'EN' ? 'Candidate Name *' : 'Naam Kandidaat *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={candidateForm.name}
                    onChange={e => setCandidateForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg"
                    placeholder="e.g. Frank de Boer"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-dark/60 mb-1 uppercase">
                    {language === 'EN' ? 'Company Name' : 'Bedrijfsnaam'}
                  </label>
                  <input
                    type="text"
                    value={candidateForm.companyName}
                    onChange={e => setCandidateForm(p => ({ ...p, companyName: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg"
                    placeholder="e.g. De Boer Keukens"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-dark/60 mb-1 uppercase">
                      {language === 'EN' ? 'Phone *' : 'Telefoon *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={candidateForm.phone}
                      onChange={e => setCandidateForm(p => ({ ...p, phone: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg"
                      placeholder="+31 6 12345678"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-dark/60 mb-1 uppercase">Email *</label>
                    <input
                      type="email"
                      required
                      value={candidateForm.email}
                      onChange={e => setCandidateForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg"
                      placeholder="candidate@example.nl"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-dark/60 mb-1 uppercase">
                      {language === 'EN' ? 'Region' : 'Regio'}
                    </label>
                    <input
                      type="text"
                      value={candidateForm.region}
                      onChange={e => setCandidateForm(p => ({ ...p, region: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg"
                      placeholder="e.g. Utrecht"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-dark/60 mb-1 uppercase">
                      {language === 'EN' ? 'Stage' : 'Fase'}
                    </label>
                    <select
                      value={candidateForm.stage}
                      onChange={e => setCandidateForm(p => ({ ...p, stage: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg font-bold"
                    >
                      <option value="interested">🟡 1. Interested (Geïnteresseerd)</option>
                      <option value="in_discussion">🔵 2. In Discussion (In gesprek)</option>
                      <option value="trial_project">🟣 3. Trial Project (Proefproject)</option>
                      <option value="active">🟢 4. Active Partner (Actief)</option>
                      <option value="rejected">⚪ 5. Rejected (Afgewezen)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-dark/60 mb-1 uppercase">
                    {language === 'EN' ? 'Specialties / Product Types' : 'Specialismen / Producten'}
                  </label>
                  <input
                    type="text"
                    value={candidateForm.productTypes}
                    onChange={e => setCandidateForm(p => ({ ...p, productTypes: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg"
                    placeholder="Buitenkeukens, Kliko-ombouw"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-dark/60 mb-1 uppercase">KVK Nummer</label>
                    <input
                      type="text"
                      value={candidateForm.kvkNumber}
                      onChange={e => setCandidateForm(p => ({ ...p, kvkNumber: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg"
                      placeholder="88776655"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-dark/60 mb-1 uppercase">BTW Nummer</label>
                    <input
                      type="text"
                      value={candidateForm.btwNumber}
                      onChange={e => setCandidateForm(p => ({ ...p, btwNumber: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg"
                      placeholder="NL88776655B01"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-dark/60 mb-1 uppercase">
                    {language === 'EN' ? 'Notes' : 'Notities'}
                  </label>
                  <textarea
                    rows={2}
                    value={candidateForm.notes}
                    onChange={e => setCandidateForm(p => ({ ...p, notes: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg"
                    placeholder="e.g. First contact made..."
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-cream-dark/60">
                  <Button type="button" variant="outline" onClick={() => setCandidateModalOpen(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" disabled={isSavingCandidate} className="flex items-center gap-2">
                    {isSavingCandidate && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {editingCandidate ? (language === 'EN' ? 'Save Changes' : 'Wijzigingen Opslaan') : (language === 'EN' ? 'Add Candidate' : 'Toevoegen')}
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
