import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { 
  Search, TrendingUp, DollarSign, PieChart, Percent, ArrowUpRight, CheckCircle2, 
  Plus, Edit2, Trash2, X, AlertTriangle, CheckCircle, Calculator, Sliders 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { mockProfitLossData as defaultPLs } from '../../utils/mockData';

export default function ProfitLoss() {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [projectPLs, setProjectPLs] = useState([]);
  const [toastMsg, setToastMsg] = useState('');

  // P&L Configuration State (Configurable from Settings)
  const [plConfig, setPlConfig] = useState({
    targetMargin: 30,
    warningMargin: 15,
    monthlyOverhead: 2500
  });

  // Modal State for Add & Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPL, setEditingPL] = useState(null);
  const [form, setForm] = useState({
    projectId: '',
    projectName: '',
    customer: '',
    category: 'Outdoor Kitchens',
    revenue: '',
    partnerCost: '',
    materialCost: '',
    otherCost: ''
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Load P&L Configuration & Records from LocalStorage
  const loadPLData = () => {
    try {
      const savedConfig = localStorage.getItem('app_pl_config_v1') || localStorage.getItem('app_pl_settings');
      if (savedConfig) {
        setPlConfig(JSON.parse(savedConfig));
      }

      const savedPLs = localStorage.getItem('app_profit_loss_v3') || localStorage.getItem('app_profit_loss_v2');
      if (savedPLs) {
        const parsed = JSON.parse(savedPLs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProjectPLs(parsed);
          return;
        }
      }
    } catch (e) {}

    setProjectPLs(defaultPLs);
    localStorage.setItem('app_profit_loss_v3', JSON.stringify(defaultPLs));
    localStorage.setItem('app_profit_loss_v2', JSON.stringify(defaultPLs));
  };

  useEffect(() => {
    loadPLData();
    window.addEventListener('app_data_changed', loadPLData);
    return () => window.removeEventListener('app_data_changed', loadPLData);
  }, []);

  // Filtered P&L Data
  const processedPLs = [...projectPLs].filter(p => {
    const matchesSearch = 
      p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Live Dynamic Financial Calculations
  const totalRevenue = projectPLs.reduce((acc, p) => acc + (parseFloat(p.revenue) || 0), 0);
  const totalPartnerCosts = projectPLs.reduce((acc, p) => acc + (parseFloat(p.partnerCost) || 0), 0);
  const totalMaterialCosts = projectPLs.reduce((acc, p) => acc + (parseFloat(p.materialCost) || 0), 0);
  const totalOtherCosts = projectPLs.reduce((acc, p) => acc + (parseFloat(p.otherCost) || 0), 0);
  
  const totalCosts = totalPartnerCosts + totalMaterialCosts + totalOtherCosts;
  const totalGrossProfit = totalRevenue - totalCosts;
  const netProfitAfterOverhead = totalGrossProfit - (parseFloat(plConfig.monthlyOverhead) || 0);
  const averageMargin = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;

  // Modal Handlers
  const handleOpenCreateModal = () => {
    setEditingPL(null);
    setForm({
      projectId: `PRJ-${Date.now().toString().slice(-3)}`,
      projectName: '',
      customer: '',
      category: 'Outdoor Kitchens',
      revenue: '',
      partnerCost: '',
      materialCost: '',
      otherCost: '0'
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (row) => {
    setEditingPL(row);
    setForm({
      projectId: row.projectId || `PRJ-${Date.now().toString().slice(-3)}`,
      projectName: row.projectName || '',
      customer: row.customer || '',
      category: row.category || 'Outdoor Kitchens',
      revenue: row.revenue || 0,
      partnerCost: row.partnerCost || 0,
      materialCost: row.materialCost || 0,
      otherCost: row.otherCost || 0
    });
    setModalOpen(true);
  };

  const handleDeleteRecord = (recordId) => {
    const updated = projectPLs.filter(p => p.projectId !== recordId);
    setProjectPLs(updated);
    localStorage.setItem('app_profit_loss_v3', JSON.stringify(updated));
    localStorage.setItem('app_profit_loss_v2', JSON.stringify(updated));
    window.dispatchEvent(new Event('app_data_changed'));
    showToast(language === 'EN' ? 'P&L entry deleted.' : 'Winst & Verlies record verwijderd.');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!form.projectName.trim() || !form.customer.trim()) {
      return showToast('Vul alstublieft alle verplichte velden in.');
    }

    const rev = parseFloat(form.revenue) || 0;
    const pCost = parseFloat(form.partnerCost) || 0;
    const mCost = parseFloat(form.materialCost) || 0;
    const oCost = parseFloat(form.otherCost) || 0;

    const recordPayload = {
      projectId: form.projectId,
      projectName: form.projectName.trim(),
      customer: form.customer.trim(),
      category: form.category,
      revenue: rev,
      partnerCost: pCost,
      materialCost: mCost,
      otherCost: oCost
    };

    let updatedList = [];
    if (editingPL) {
      updatedList = projectPLs.map(p => p.projectId === editingPL.projectId ? recordPayload : p);
    } else {
      updatedList = [recordPayload, ...projectPLs];
    }

    setProjectPLs(updatedList);
    localStorage.setItem('app_profit_loss_v3', JSON.stringify(updatedList));
    localStorage.setItem('app_profit_loss_v2', JSON.stringify(updatedList));
    window.dispatchEvent(new Event('app_data_changed'));

    const calcCosts = pCost + mCost + oCost;
    const calcProfit = rev - calcCosts;
    const calcMargin = rev > 0 ? ((calcProfit / rev) * 100).toFixed(1) : '0';

    showToast(
      language === 'EN'
        ? `P&L updated! Calculated Profit: €${calcProfit.toLocaleString()} (${calcMargin}% Margin)`
        : `Winst & Verlies berekend! Brutowinst: €${calcProfit.toLocaleString()} (${calcMargin}% Marge)`
    );
    setModalOpen(false);
  };

  // Translations
  const translateProjectName = (name) => {
    if (language !== 'EN' || !name) return name;
    return name
      .replace(/Luxe Teak Buitenkeuken 4m/g, 'Luxury Teak Outdoor Kitchen 4m')
      .replace(/Kliko Ombouw Triple Antraciet/g, 'Triple Bin Storage Anthracite')
      .replace(/Eiken Houten Overkapping 6x4m/g, 'Oak Wooden Canopy 6x4m')
      .replace(/Tuinterras De Luxe/g, 'Luxury Terrace Decking')
      .replace(/Buitenkeuken/g, 'Outdoor Kitchen')
      .replace(/Kliko Ombouw/g, 'Bin Storage')
      .replace(/Overkapping/g, 'Canopy');
  };

  // Live Modal Preview Calculations
  const liveRev = parseFloat(form.revenue) || 0;
  const liveCosts = (parseFloat(form.partnerCost) || 0) + (parseFloat(form.materialCost) || 0) + (parseFloat(form.otherCost) || 0);
  const liveProfit = liveRev - liveCosts;
  const liveMargin = liveRev > 0 ? ((liveProfit / liveRev) * 100).toFixed(1) : '0.0';

  const columns = [
    { 
      header: language === 'EN' ? 'PROJECT / CLIENT' : 'Project / Klant',
      style: { minWidth: '220px' },
      render: (row) => (
        <div>
          <p className="font-bold text-dark text-xs sm:text-sm">{translateProjectName(row.projectName)}</p>
          <p className="text-[11px] text-dark/50 font-mono flex items-center gap-1 mt-0.5">
            <span className="font-semibold text-primary">{row.customer}</span> • ID: {row.projectId}
          </p>
        </div>
      )
    },
    { 
      header: language === 'EN' ? 'CATEGORY' : 'Categorie',
      render: (row) => (
        <span className="text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg">
          {row.category}
        </span>
      )
    },
    { 
      header: language === 'EN' ? 'REVENUE' : 'Omzet (Revenue)', 
      render: (row) => <span className="font-mono font-bold text-dark text-xs sm:text-sm">€ {(parseFloat(row.revenue) || 0).toLocaleString()}</span> 
    },
    { 
      header: language === 'EN' ? 'TOTAL COSTS' : 'Totale Kosten', 
      render: (row) => {
        const costSum = (parseFloat(row.partnerCost) || 0) + (parseFloat(row.materialCost) || 0) + (parseFloat(row.otherCost) || 0);
        return (
          <div>
            <span className="font-mono text-rose-700 font-bold text-xs sm:text-sm block">€ {costSum.toLocaleString()}</span>
            <span className="text-[9px] text-dark/40 font-mono">Partner: €{row.partnerCost || 0} • Mat: €{row.materialCost || 0}</span>
          </div>
        );
      }
    },
    { 
      header: language === 'EN' ? 'GROSS PROFIT' : 'Brutowinst (Profit)', 
      render: (row) => {
        const rev = parseFloat(row.revenue) || 0;
        const costSum = (parseFloat(row.partnerCost) || 0) + (parseFloat(row.materialCost) || 0) + (parseFloat(row.otherCost) || 0);
        const profit = rev - costSum;
        const isLoss = profit < 0;
        return (
          <span className={`font-mono font-bold text-xs sm:text-sm ${isLoss ? 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200' : 'text-emerald-700'}`}>
            {isLoss ? '- € ' + Math.abs(profit).toLocaleString() : '€ ' + profit.toLocaleString()}
          </span>
        );
      }
    },
    { 
      header: language === 'EN' ? 'PROFIT MARGIN %' : 'Winstmarge %', 
      render: (row) => {
        const rev = parseFloat(row.revenue) || 0;
        const costSum = (parseFloat(row.partnerCost) || 0) + (parseFloat(row.materialCost) || 0) + (parseFloat(row.otherCost) || 0);
        const profit = rev - costSum;
        const margin = rev > 0 ? parseFloat(((profit / rev) * 100).toFixed(1)) : 0;
        
        const targetM = plConfig.targetMargin || 30;
        const warnM = plConfig.warningMargin || 15;

        let variant = 'success';
        if (margin < warnM || profit < 0) variant = 'danger';
        else if (margin < targetM) variant = 'warning';

        return (
          <Badge variant={variant}>
            {margin}% {language === 'EN' ? 'Margin' : 'Marge'}
          </Badge>
        );
      }
    },
    {
      header: language === 'EN' ? 'ACTIONS' : 'Acties',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleOpenEditModal(row)}
            className="p-1.5 text-dark/50 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
            title={language === 'EN' ? 'Edit P&L Amounts' : 'Bewerk P&L Bedragen'}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteRecord(row.projectId)}
            className="p-1.5 text-dark/50 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title={language === 'EN' ? 'Delete Record' : 'Verwijder Record'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-[#4A4A43] space-y-6 font-body">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 80 }} className="fixed top-20 right-4 z-[9999] flex items-center gap-2 bg-primary text-cream px-4 py-3 rounded-xl shadow-lg text-xs">
            <CheckCircle className="w-4 h-4 text-green-400" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-primary flex items-center gap-2">
            {language === 'EN' ? 'Profit & Loss Analysis' : 'Winst & Verlies (Profit & Loss)'}
            <span className="text-[10px] bg-primary/15 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Live Calculated</span>
          </h2>
          <p className="text-dark/60 text-sm">
            {language === 'EN' 
              ? 'Real-time financial overview and profit margin breakdown per project.' 
              : 'Financieel overzicht en automatische winstmarge berekening per project.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button icon={Plus} onClick={handleOpenCreateModal} className="py-2 px-3 text-xs font-bold">
            {language === 'EN' ? '+ Add P&L Record' : '+ Winst & Verlies Toevoegen'}
          </Button>
        </div>
      </div>

      {/* Overview Stat Cards — Ultra-Attractive Dynamic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl shadow-sm flex items-center justify-between border-l-4 border-l-primary">
          <div className="space-y-1 min-w-0">
            <p className="text-[11px] font-bold text-dark/50 uppercase tracking-wider truncate">
              {language === 'EN' ? 'Total Revenue' : 'Totale Omzet (Revenue)'}
            </p>
            <p className="text-xl sm:text-2xl font-heading font-bold text-primary truncate">€ {totalRevenue.toLocaleString()}</p>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="w-3 h-3" /> {projectPLs.length} {language === 'EN' ? 'Active Projects' : 'Actieve Projecten'}
            </span>
          </div>
          <div className="p-3 bg-primary/10 rounded-xl text-primary flex-shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl shadow-sm flex items-center justify-between border-l-4 border-l-rose-600">
          <div className="space-y-1 min-w-0">
            <p className="text-[11px] font-bold text-dark/50 uppercase tracking-wider truncate">
              {language === 'EN' ? 'Total Project Costs' : 'Totale Kosten (Costs)'}
            </p>
            <p className="text-xl sm:text-2xl font-heading font-bold text-rose-700 truncate">€ {totalCosts.toLocaleString()}</p>
            <span className="inline-flex items-center text-[10px] font-semibold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full">
              Partner + Materials
            </span>
          </div>
          <div className="p-3 bg-rose-600/10 rounded-xl text-rose-600 flex-shrink-0">
            <PieChart className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl shadow-sm flex items-center justify-between border-l-4 border-l-emerald-600">
          <div className="space-y-1 min-w-0">
            <p className="text-[11px] font-bold text-dark/50 uppercase tracking-wider truncate">
              {language === 'EN' ? 'Total Gross Profit' : 'Brutowinst (Gross Profit)'}
            </p>
            <p className="text-xl sm:text-2xl font-heading font-bold text-emerald-800 truncate">€ {totalGrossProfit.toLocaleString()}</p>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" /> Net: €{netProfitAfterOverhead.toLocaleString()}
            </span>
          </div>
          <div className="p-3 bg-emerald-600/10 rounded-xl text-emerald-700 flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl shadow-sm flex items-center justify-between border-l-4 border-l-amber-600">
          <div className="space-y-1 min-w-0">
            <p className="text-[11px] font-bold text-dark/50 uppercase tracking-wider truncate">
              {language === 'EN' ? 'Average Margin %' : 'Gemiddelde Marge'}
            </p>
            <p className="text-xl sm:text-2xl font-heading font-bold text-amber-800 truncate">{averageMargin.toFixed(1)}%</p>
            <span className="inline-flex items-center text-[10px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
              Target: {plConfig.targetMargin || 30}% (Settings)
            </span>
          </div>
          <div className="p-3 bg-amber-600/10 rounded-xl text-amber-800 flex-shrink-0">
            <Percent className="w-6 h-6" />
          </div>
        </div>
      </div>

      <Card>
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/40" />
            <input
              type="text"
              placeholder={language === 'EN' ? 'Search project, category or customer...' : 'Zoek project, categorie of klant...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#EDE8DF]/30 border border-[#D6CFC2] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-[#4A4A43]"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {['All', 'Outdoor Kitchens', 'Canopies', 'Bin Storage', 'Terraces'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'bg-primary text-cream border-primary shadow-xs'
                    : 'bg-[#F8F7F4] text-dark/70 border-[#D6CFC2] hover:bg-[#EDE8DF]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <Table columns={columns} data={processedPLs} />
      </Card>

      {/* ADD / EDIT P&L RECORD MODAL WITH LIVE CALCULATION PREVIEW */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-4 text-xs font-body max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#D6CFC2] pb-3">
                <h3 className="text-lg font-heading font-bold text-primary flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-accent" />
                  {editingPL 
                    ? (language === 'EN' ? 'Edit P&L Amounts' : 'Winst & Verlies Bedragen Bewerken')
                    : (language === 'EN' ? 'Add New P&L Entry' : 'Nieuw Winst & Verlies Record')}
                </h3>
                <button onClick={() => setModalOpen(false)} className="p-1 text-dark/40 hover:text-dark"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">{language === 'EN' ? 'Project Name *' : 'Projectnaam *'}</label>
                    <input
                      type="text"
                      required
                      value={form.projectName}
                      onChange={e => setForm(prev => ({ ...prev, projectName: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg font-bold text-dark text-xs"
                      placeholder="e.g. Luxury Teak Kitchen 4m"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">{language === 'EN' ? 'Customer Name *' : 'Klantnaam *'}</label>
                    <input
                      type="text"
                      required
                      value={form.customer}
                      onChange={e => setForm(prev => ({ ...prev, customer: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs"
                      placeholder="e.g. John Miller"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-dark/60 mb-1 uppercase tracking-wider">{language === 'EN' ? 'Product Category' : 'Product Categorie'}</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-lg text-xs font-semibold text-primary"
                  >
                    <option value="Outdoor Kitchens">Outdoor Kitchens</option>
                    <option value="Canopies">Canopies</option>
                    <option value="Bin Storage">Bin Storage</option>
                    <option value="Poolhouse">Poolhouse</option>
                    <option value="Terraces">Terraces</option>
                    {(() => {
                      try {
                        const dynCats = JSON.parse(localStorage.getItem('app_dynamic_categories') || '[]');
                        return dynCats
                          .filter(c => !['outdoor kitchens','canopies','bin storage','poolhouse','terraces'].includes((c.name||'').toLowerCase()))
                          .map(c => <option key={c.id} value={c.name}>{c.name}</option>);
                      } catch(e) { return null; }
                    })()}
                  </select>
                </div>

                {/* FINANCIAL AMOUNTS CONFIGURATION */}
                <div className="p-3 bg-white rounded-xl border border-[#D6CFC2] space-y-3">
                  <h4 className="font-bold text-primary uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-700" /> {language === 'EN' ? 'Revenue & Cost Values' : 'Omzet & Kosten Bedragen'}
                  </h4>

                  <div>
                    <label className="block font-semibold text-dark/60 mb-1 uppercase text-[10px]">{language === 'EN' ? 'Total Project Revenue (€) *' : 'Totale Project Omzet (€) *'}</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="any"
                      value={form.revenue}
                      onChange={e => setForm(prev => ({ ...prev, revenue: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg font-bold text-primary text-sm"
                      placeholder="11300"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block font-semibold text-dark/60 mb-1 uppercase text-[10px]">{language === 'EN' ? 'Partner Cost (€)' : 'Vakman Koste (€)'}</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={form.partnerCost}
                        onChange={e => setForm(prev => ({ ...prev, partnerCost: e.target.value }))}
                        className="w-full px-3 py-1.5 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs"
                        placeholder="3200"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-dark/60 mb-1 uppercase text-[10px]">{language === 'EN' ? 'Material Cost (€)' : 'Materiaal Koste (€)'}</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={form.materialCost}
                        onChange={e => setForm(prev => ({ ...prev, materialCost: e.target.value }))}
                        className="w-full px-3 py-1.5 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs"
                        placeholder="1650"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-dark/60 mb-1 uppercase text-[10px]">{language === 'EN' ? 'Other Cost (€)' : 'Overige (€)'}</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={form.otherCost}
                        onChange={e => setForm(prev => ({ ...prev, otherCost: e.target.value }))}
                        className="w-full px-3 py-1.5 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-xs"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* REAL-TIME DYNAMIC CALCULATION PREVIEW */}
                <div className="p-3.5 bg-primary/10 rounded-xl border border-primary/20 space-y-2">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                    ⚡ {language === 'EN' ? 'Live Dynamic Calculation Preview' : 'Live Automatische Berekening'}
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                    <div>
                      <span className="text-[9px] text-dark/60 uppercase block">Total Costs</span>
                      <span className="font-bold text-rose-700">€ {liveCosts.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-dark/60 uppercase block">Gross Profit</span>
                      <span className={`font-bold ${liveProfit >= 0 ? 'text-emerald-800' : 'text-rose-600'}`}>
                        {liveProfit >= 0 ? '€ ' + liveProfit.toLocaleString() : '- € ' + Math.abs(liveProfit).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-dark/60 uppercase block">Profit Margin</span>
                      <span className="font-bold text-primary">{liveMargin}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#D6CFC2]">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>{t('common.cancel')}</Button>
                  <Button type="submit">{language === 'EN' ? 'Save P&L Entry' : 'P&L Opslaan'}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
