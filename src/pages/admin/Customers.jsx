import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import { useLanguage } from '../../context/LanguageContext';
import {
  Users, UserCheck, Briefcase, DollarSign, Search, Filter,
  Mail, Phone, MapPin, Calendar, FileText, ChevronRight, ChevronDown, X, Sparkles, Plus, Download, ArrowUpRight, Loader2, AlertCircle, RotateCcw
} from 'lucide-react';
import BookkeepingHeader from '../../components/admin/BookkeepingHeader';
import api from '../../api/apiClient';

export default function Customers() {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);

  // Loading / error state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [addCustomerModalOpen, setAddCustomerModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Dropdown open states
  const [productInterestDropdownOpen, setProductInterestDropdownOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const [newCustomerForm, setNewCustomerForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    streetAddress: '',
    productInterest: 'Outdoor Kitchen',
    notes: '',
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // ─── Normalise backend customer record to UI shape ───────────────────────
  const normalise = (c) => ({
    id: c.id,
    name: [c.firstName, c.lastName].filter(Boolean).join(' ') || c.companyName || 'Unknown',
    email: c.email || '',
    phone: c.phone || '',
    address: [c.streetAddress, c.city].filter(Boolean).join(', ') || c.city || '',
    city: c.city || '',
    productInterest: c.notes || 'Bespoke Outdoor Kitchen',
    totalSpend: c.totalRevenue != null ? `€ ${Number(c.totalRevenue).toLocaleString('nl-NL')}` : '€ 0',
    numericSpend: Number(c.totalRevenue) || 0,
    totalProjects: c.totalProjects || 0,
    activeProjects: c.activeProjects || 0,
    status: c.isActive !== false ? 'Active' : 'Completed',
    convertedDate: c.createdAt ? c.createdAt.split('T')[0] : '',
    linkedQuote: c.latestQuoteNumber || '—',
    linkedProject: c.latestProjectNumber || '—',
    _raw: c,
  });

  // ─── Fetch customers from backend ────────────────────────────────────────
  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (searchTerm) params.append('search', searchTerm);
      const res = await api.get(`/customers?${params}`);
      if (res.success) {
        setCustomers((res.data?.customers || res.data?.items || res.data || []).map(normalise));
      } else {
        setError(res.error?.message || 'Failed to load customers.');
      }
    } catch {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // ─── Create customer ─────────────────────────────────────────────────────
  const handleAddCustomerSubmit = async (e) => {
    e.preventDefault();
    if (!newCustomerForm.firstName.trim() || !newCustomerForm.email.trim()) {
      return showToast('Please enter customer first name and email address.');
    }
    if (!newCustomerForm.city.trim()) {
      return showToast('Please select a city / location.');
    }
    setIsSaving(true);
    try {
      const payload = {
        firstName: newCustomerForm.firstName.trim(),
        lastName: newCustomerForm.lastName.trim() || '',
        email: newCustomerForm.email.trim().toLowerCase(),
        phone: newCustomerForm.phone.trim() || '+31 6 00000000',
        city: newCustomerForm.city.trim(),
        streetAddress: newCustomerForm.streetAddress.trim() || null,
        notes: newCustomerForm.productInterest || null,
      };
      const res = await api.post('/customers', payload);
      if (res.success) {
        showToast(
          language === 'EN'
            ? `Customer "${payload.firstName} ${payload.lastName}".trim() created!`
            : `Klant "${payload.firstName} ${payload.lastName}".trim() aangemaakt!`
        );
        setNewCustomerForm({ firstName: '', lastName: '', email: '', phone: '', city: '', streetAddress: '', productInterest: 'Outdoor Kitchen', notes: '' });
        setAddCustomerModalOpen(false);
        fetchCustomers();
      } else {
        showToast(res.error?.message || 'Failed to create customer.');
      }
    } catch {
      showToast('Unable to reach the server.');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Filtered list (client-side status filter; search handled server-side) ─
  const filteredCustomers = customers.filter((cust) => {
    if (statusFilter === 'All') return true;
    return cust.status === statusFilter;
  });

  // ─── Stat cards ───────────────────────────────────────────────────────────
  const totalCustomersCount = customers.length;
  const activeProjectsCount = customers.reduce((acc, c) => acc + (c.activeProjects || 0), 0);
  const totalRevenue = customers.reduce((acc, c) => acc + c.numericSpend, 0);

  // ─── Table columns ────────────────────────────────────────────────────────
  const columns = [
    {
      header: language === 'EN' ? 'CUSTOMER / CLIENT' : 'KLANT / CLIENT',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm border border-primary/20 flex-shrink-0">
            {row.name ? row.name.split(' ').map(n => n[0]).join('') : 'C'}
          </div>
          <div>
            <p className="font-bold text-dark text-xs sm:text-sm hover:text-primary transition-colors cursor-pointer" onClick={() => setSelectedCustomer(row)}>
              {row.name}
            </p>
            <p className="text-[11px] text-dark/50 font-mono">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      header: language === 'EN' ? 'CONTACT & LOCATION' : 'CONTACT & LOCATIE',
      accessor: 'phone',
      render: (row) => (
        <div className="text-xs space-y-0.5">
          <p className="font-medium text-dark flex items-center gap-1">
            <Phone className="w-3 h-3 text-primary/70" /> {row.phone || '—'}
          </p>
          <p className="text-dark/50 flex items-center gap-1 truncate max-w-[200px]">
            <MapPin className="w-3 h-3 text-primary/70" /> {row.city || row.address || '—'}
          </p>
        </div>
      )
    },
    {
      header: language === 'EN' ? 'PRODUCT INTEREST' : 'PRODUCT INTERESSE',
      accessor: 'productInterest',
      render: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-dark block truncate max-w-[220px]">
            {row.productInterest || 'Bespoke Outdoor Kitchen'}
          </span>
          <span className="text-[10px] text-dark/50 font-mono">
            Quote: {row.linkedQuote}
          </span>
        </div>
      )
    },
    {
      header: language === 'EN' ? 'CONTRACT VALUE' : 'CONTRACT WAARDE',
      accessor: 'totalSpend',
      render: (row) => (
        <div>
          <span className="font-bold text-primary text-xs sm:text-sm block">
            {row.totalSpend}
          </span>
          <span className="text-[10px] text-dark/50 font-mono">
            {row.convertedDate ? `Converted: ${row.convertedDate}` : 'Active Client'}
          </span>
        </div>
      )
    },
    {
      header: 'STATUS',
      accessor: 'status',
      render: (row) => (
        <Badge variant={row.status === 'Active' ? 'success' : 'neutral'}>
          {row.status === 'Active' ? (language === 'EN' ? 'Active Client' : 'Actieve Klant') : (language === 'EN' ? 'Closed' : 'Afgerond')}
        </Badge>
      )
    },
    {
      header: 'ACTIONS',
      accessor: 'id',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedCustomer(row)}
            className="py-1 px-2.5 text-[11px] font-bold border-primary/30 text-primary hover:bg-primary/10"
          >
            {language === 'EN' ? 'View Details' : 'Details Bekijken'}
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 font-body relative">
      <BookkeepingHeader activeTab="customers" />

      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 80 }}
            className="fixed top-20 right-4 z-[9999] flex items-center gap-2 bg-primary text-cream px-4 py-3 rounded-xl shadow-lg border border-[#D6CFC2]/20 text-xs"
          >
            <Sparkles className="w-4 h-4 text-green-400" /> {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-primary">
              {language === 'EN' ? 'Customers Directory' : 'Klanten Overzicht'}
            </h1>
            <Badge variant="neutral" className="bg-primary/10 text-primary border-primary/20">
              {customers.length} {language === 'EN' ? 'Clients' : 'Klanten'}
            </Badge>
          </div>
          <p className="text-dark/60 text-xs sm:text-sm mt-1">
            {language === 'EN'
              ? 'Directory of active customers manually created or automatically converted from Leads upon invoice creation.'
              : 'Overzicht van actieve klanten, handmatig aangemaakt of automatisch omgezet vanuit Leads bij facturatie.'}
          </p>
        </div>
        <Button icon={Plus} onClick={() => setAddCustomerModalOpen(true)}>
          {language === 'EN' ? '+ Add New Customer' : '+ Nieuwe Klant Toevoegen'}
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card noPadding className="p-3 sm:p-4 border-l-4 border-l-primary shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-dark/50 uppercase tracking-wider">
                {language === 'EN' ? 'TOTAL CUSTOMERS' : 'TOTAAL KLANTEN'}
              </p>
              <h3 className="text-xl sm:text-2xl font-heading font-bold text-primary mt-0.5">
                {isLoading ? '—' : totalCustomersCount}
              </h3>
              <p className="text-[10px] text-green-700 font-semibold mt-0.5 flex items-center gap-0.5">
                <Sparkles className="w-3 h-3" /> {language === 'NL' ? 'Automatisch gesynchroniseerd' : 'Auto-synced from backend'}
              </p>
            </div>
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </Card>

        <Card noPadding className="p-3 sm:p-4 border-l-4 border-l-indigo-600 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-dark/50 uppercase tracking-wider">
                {language === 'EN' ? 'ACTIVE PROJECTS' : 'ACTIEVE PROJECTEN'}
              </p>
              <h3 className="text-xl sm:text-2xl font-heading font-bold text-indigo-900 mt-0.5">
                {isLoading ? '—' : activeProjectsCount}
              </h3>
              <p className="text-[10px] text-dark/50 mt-0.5">
                {language === 'NL' ? 'Beheerd via Projectenpaneel' : 'Managed via Projects Panel'}
              </p>
            </div>
            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-700">
              <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </Card>

        <Card noPadding className="p-3 sm:p-4 border-l-4 border-l-emerald-600 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-dark/50 uppercase tracking-wider">
                {language === 'EN' ? 'TOTAL CLIENT REVENUE' : 'TOTAAL OMZET KLANTEN'}
              </p>
              <h3 className="text-xl sm:text-2xl font-heading font-bold text-emerald-900 mt-0.5">
                {isLoading ? '—' : `€ ${totalRevenue.toLocaleString('nl-NL')}`}
              </h3>
              <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                {language === 'NL' ? 'Gecombineerde totale waarde' : 'Combined lifetime value'}
              </p>
            </div>
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-700">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card noPadding className="p-3 bg-white border border-[#D6CFC2] shadow-2xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-dark/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'EN' ? 'Search customers by name, email, city...' : 'Zoek klanten op naam, email, stad...'}
              className="w-full pl-9 pr-3 py-1.5 bg-[#EDE8DF]/50 border border-[#D6CFC2] rounded-lg text-xs font-body text-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dark/40 hover:text-dark">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Filter className="w-4 h-4 text-dark/50" />
            <span className="text-xs text-dark/60 font-semibold">Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#D6CFC2] rounded-lg text-xs font-body text-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="All">{language === 'EN' ? 'All Statuses' : 'Alle Statussen'}</option>
              <option value="Active">{language === 'EN' ? 'Active Clients' : 'Actieve Klanten'}</option>
              <option value="Completed">{language === 'EN' ? 'Closed' : 'Afgerond'}</option>
            </select>
            <button onClick={fetchCustomers} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors" title="Refresh">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </Card>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          <button onClick={fetchCustomers} className="ml-auto font-bold underline">Retry</button>
        </div>
      )}

      {/* Table */}
      <Card noPadding className="border border-[#D6CFC2] overflow-hidden shadow-card">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-dark/50 text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            {language === 'EN' ? 'Loading customers...' : 'Klanten laden...'}
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredCustomers}
            emptyMessage={language === 'EN' ? 'No customers found.' : 'Geen klanten gevonden.'}
          />
        )}
      </Card>

      {/* Customer Detail Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-cream border border-[#D6CFC2] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto font-body"
            >
              <div className="p-4 sm:p-5 bg-primary text-cream flex items-center justify-between border-b border-primary/20 rounded-t-2xl sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cream/20 text-cream font-heading font-bold flex items-center justify-center text-base border border-cream/30">
                    {selectedCustomer.name ? selectedCustomer.name.split(' ').map(n => n[0]).join('') : 'C'}
                  </div>
                  <div>
                    <h3 className="text-lg font-heading font-bold text-cream">{selectedCustomer.name}</h3>
                    <p className="text-xs text-cream/70 font-mono">ID: {selectedCustomer.id}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCustomer(null)} className="p-1 text-cream/70 hover:text-cream rounded-lg hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-5 text-xs text-dark">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-white rounded-xl border border-[#D6CFC2]">
                  <div>
                    <span className="text-[10px] text-dark/50 font-bold uppercase block">STATUS</span>
                    <Badge variant={selectedCustomer.status === 'Active' ? 'success' : 'neutral'} className="mt-0.5">
                      {selectedCustomer.status || 'Active'}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-[10px] text-dark/50 font-bold uppercase block">TOTAL CONTRACT</span>
                    <span className="font-bold text-primary text-sm block mt-0.5">{selectedCustomer.totalSpend}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-dark/50 font-bold uppercase block">ACTIVE PROJECTS</span>
                    <span className="font-bold text-dark block mt-0.5">{selectedCustomer.activeProjects} Project</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-dark/50 font-bold uppercase block">CONVERTED DATE</span>
                    <span className="font-mono text-dark/70 block mt-0.5">{selectedCustomer.convertedDate || '—'}</span>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-[#D6CFC2] space-y-3">
                  <h4 className="font-heading font-bold text-primary text-sm border-b border-[#D6CFC2]/60 pb-2">
                    {language === 'EN' ? 'Contact Details' : 'Contactgegevens'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2.5">
                      <Mail className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] text-dark/50 font-bold uppercase block">EMAIL ADDRESS</span>
                        <a href={`mailto:${selectedCustomer.email}`} className="font-semibold text-primary hover:underline">
                          {selectedCustomer.email}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Phone className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] text-dark/50 font-bold uppercase block">PHONE NUMBER</span>
                        <a href={`tel:${selectedCustomer.phone}`} className="font-semibold text-primary hover:underline">
                          {selectedCustomer.phone}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 sm:col-span-2">
                      <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] text-dark/50 font-bold uppercase block">INSTALLATION ADDRESS</span>
                        <span className="font-medium text-dark">{selectedCustomer.address || '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-[#D6CFC2] space-y-3">
                  <h4 className="font-heading font-bold text-primary text-sm border-b border-[#D6CFC2]/60 pb-2">
                    {language === 'EN' ? 'Purchased Product & System Links' : 'Aangeschaft Product & Systeemlinks'}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-[#EDE8DF]/50 p-2.5 rounded-lg border border-[#D6CFC2]/60">
                      <div>
                        <span className="text-[10px] text-dark/50 uppercase font-bold block">Product Specification</span>
                        <span className="font-bold text-dark">{selectedCustomer.productInterest}</span>
                      </div>
                      <span className="font-mono font-bold text-primary">{selectedCustomer.totalSpend}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="p-2.5 bg-[#EDE8DF]/30 rounded-lg border border-[#D6CFC2]/40">
                        <span className="text-[10px] text-dark/50 uppercase font-bold block">Linked Quotation</span>
                        <span className="font-mono font-bold text-primary text-xs">{selectedCustomer.linkedQuote}</span>
                      </div>
                      <div className="p-2.5 bg-[#EDE8DF]/30 rounded-lg border border-[#D6CFC2]/40">
                        <span className="text-[10px] text-dark/50 uppercase font-bold block">Linked Live Project</span>
                        <span className="font-mono font-bold text-indigo-700 text-xs">{selectedCustomer.linkedProject}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#EDE8DF]/60 border-t border-[#D6CFC2] flex justify-end gap-2 rounded-b-2xl">
                <Button variant="outline" size="sm" onClick={() => setSelectedCustomer(null)}>
                  {language === 'EN' ? 'Close' : 'Sluiten'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD NEW CUSTOMER MODAL */}
      <AnimatePresence>
        {addCustomerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={() => setAddCustomerModalOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-4 text-xs font-body">
              <div className="flex items-center justify-between border-b border-[#D6CFC2] pb-3">
                <h3 className="text-lg font-heading font-bold text-primary">{language === 'EN' ? 'Add New Customer' : 'Nieuwe Klant Toevoegen'}</h3>
                <button onClick={() => setAddCustomerModalOpen(false)} className="p-1 text-dark/40 hover:text-dark"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleAddCustomerSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">{language === 'EN' ? 'First Name *' : 'Voornaam *'}</label>
                    <input type="text" required value={newCustomerForm.firstName} onChange={e => setNewCustomerForm(p => ({ ...p, firstName: e.target.value }))} className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-bold text-dark" placeholder="e.g. Peter" />
                  </div>
                  <div>
                    <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">{language === 'EN' ? 'Last Name *' : 'Achternaam *'}</label>
                    <input type="text" required value={newCustomerForm.lastName} onChange={e => setNewCustomerForm(p => ({ ...p, lastName: e.target.value }))} className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-bold text-dark" placeholder="e.g. van der Berg" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">{language === 'EN' ? 'Email Address *' : 'E-mailadres *'}</label>
                    <input type="email" required value={newCustomerForm.email} onChange={e => setNewCustomerForm(p => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs" placeholder="peter@example.com" />
                  </div>
                  <div>
                    <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">{language === 'EN' ? 'Phone Number *' : 'Telefoonnummer *'}</label>
                    <input type="text" required value={newCustomerForm.phone} onChange={e => setNewCustomerForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs" placeholder="+31 6 12345678" />
                  </div>
                </div>

                {/* City Dropdown */}
                <div className="relative">
                  <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">{language === 'EN' ? 'City / Location *' : 'Stad / Locatie *'}</label>
                  <button type="button" onClick={() => setCityDropdownOpen(!cityDropdownOpen)} className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-body focus:outline-none text-[#4A4A43] flex items-center justify-between shadow-xs">
                    <span className="truncate">{newCustomerForm.city || (language === 'EN' ? '— Select City —' : '— Selecteer Stad —')}</span>
                    <ChevronDown className={`w-4 h-4 text-dark/40 transition-transform ${cityDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {cityDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setCityDropdownOpen(false)} />
                      <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-[#D6CFC2] rounded-lg shadow-xl max-h-48 overflow-y-auto divide-y divide-[#EDE8DF]">
                        {['Amsterdam', 'Rotterdam', 'Den Haag', 'Utrecht', 'Eindhoven', 'Haarlem', 'Groningen', 'Breda', 'Tilburg', 'Almere', 'Nijmegen', 'Arnhem', 'Apeldoorn', 'Zwolle', 'Maastricht', 'Delft', 'Leiden', 'Dordrecht'].map((city, idx) => (
                          <div key={idx} onClick={() => { setNewCustomerForm(p => ({ ...p, city })); setCityDropdownOpen(false); }}
                            className={`px-3 py-2 text-xs cursor-pointer hover:bg-primary/10 transition-colors ${newCustomerForm.city === city ? 'bg-primary/15 font-bold text-primary' : 'text-dark'}`}>
                            {city}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">{language === 'EN' ? 'Street Address' : 'Straatnaam & Huisnummer'}</label>
                  <input type="text" value={newCustomerForm.streetAddress} onChange={e => setNewCustomerForm(p => ({ ...p, streetAddress: e.target.value }))} className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs" placeholder="e.g. Keizersgracht 142" />
                </div>

                {/* Product Interest Dropdown */}
                <div className="relative">
                  <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">{language === 'EN' ? 'Product Interest' : 'Product Interesse'}</label>
                  <button type="button" onClick={() => setProductInterestDropdownOpen(!productInterestDropdownOpen)} className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-body focus:outline-none text-[#4A4A43] flex items-center justify-between shadow-xs">
                    <span className="truncate">{newCustomerForm.productInterest || 'Outdoor Kitchen'}</span>
                    <ChevronDown className={`w-4 h-4 text-dark/40 transition-transform ${productInterestDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {productInterestDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setProductInterestDropdownOpen(false)} />
                      <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-[#D6CFC2] rounded-lg shadow-xl max-h-48 overflow-y-auto divide-y divide-[#EDE8DF]">
                        {['Outdoor Kitchen', 'Garden Room', 'Canopy / Pergola', 'Poolhouse', 'Bin Storage', 'Custom Project'].map((pi, idx) => (
                          <div key={idx} onClick={() => { setNewCustomerForm(p => ({ ...p, productInterest: pi })); setProductInterestDropdownOpen(false); }}
                            className={`px-3 py-2 text-xs cursor-pointer hover:bg-primary/10 transition-colors ${newCustomerForm.productInterest === pi ? 'bg-primary/15 font-bold text-primary' : 'text-dark'}`}>
                            {pi}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#D6CFC2]">
                  <Button type="button" variant="outline" onClick={() => setAddCustomerModalOpen(false)}>{t('common.cancel')}</Button>
                  <Button type="submit" disabled={isSaving} className="flex items-center gap-2">
                    {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {language === 'EN' ? 'Save Customer' : 'Klant Opslaan'}
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
