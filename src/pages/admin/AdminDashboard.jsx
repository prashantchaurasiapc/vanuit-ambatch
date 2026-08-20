import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { Users, Briefcase, FileText, TrendingUp, Plus, ArrowUpRight, X, CheckCircle, AlertTriangle, Calendar, ListTodo, ArrowRight, Clock, CreditCard, Banknote, Bell, DollarSign, Percent, Sparkles, CheckCircle2, Award, Filter, Layers } from 'lucide-react';
import { 
  mockRecentActivities, mockProjects, mockQuotes, mockLeads,
  mockFollowUps, mockDeliveries, mockTasks, mockWarnings, mockFunnelData, mockFinancials
} from '../../utils/mockData';
import { useLanguage } from '../../context/LanguageContext';
import heroBg from '/dasbordes images.png';

const StatCard = ({ label, value, icon: Icon, trend, color, bgColor, borderClass }) => (
  <Card className={`cursor-pointer border-l-[4px] ${borderClass} transition-all duration-300`} noPadding={true}>
    <div className="flex items-center justify-between p-4">
      <div className="space-y-0.5">
        <p className="text-[10px] text-dark/45 font-body font-bold uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-heading font-bold text-dark">{value}</p>
        {trend && (
          <p className="text-[10px] text-green-700 flex items-center gap-0.5 font-body font-semibold">
            <ArrowUpRight className="w-2.5 h-2.5 text-green-700" strokeWidth={3} />
            {trend}
          </p>
        )}
      </div>
      <div className={`p-2 rounded-xl ${bgColor} flex-shrink-0`}>
        <Icon className={`w-4 h-4 ${color}`} strokeWidth={2} />
      </div>
    </div>
  </Card>
);

export default function AdminDashboard() {
  const { t, language, tStatus } = useLanguage();
  const navigate = useNavigate();
  const [toastMsg, setToastMsg] = useState('');
  const [partnerNotifs, setPartnerNotifs] = useState([]);
  
  // Module 1.2: Date Range Filter & Dynamic KPI Analytics State
  const [dateRange, setDateRange] = useState('30days'); // '7days' | '30days' | 'currentMonth' | '3months' | '6months' | '12months' | 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Dashboard Stats State
  const [totalLeads, setTotalLeads] = useState(0);
  const [activeQuotes, setActiveQuotes] = useState(0);
  const [latestQuotes, setLatestQuotes] = useState([]);

  const [leadsList, setLeadsList] = useState([]);
  const [customerSelect, setCustomerSelect] = useState('Other');
  const [projectSelect, setProjectSelect] = useState('Bespoke Outdoor Kitchen');

  const refreshDashboard = () => {
    // Leads
    const savedLeads = localStorage.getItem('app_leads_v5') || localStorage.getItem('app_leads_v2') || localStorage.getItem('app_leads');
    let tempLeadsList = [];
    if (savedLeads) {
      try {
        const parsed = JSON.parse(savedLeads);
        if (Array.isArray(parsed) && parsed.length > 0) tempLeadsList = parsed;
        else tempLeadsList = mockLeads;
      } catch (e) { tempLeadsList = mockLeads; }
    } else {
      tempLeadsList = mockLeads;
      localStorage.setItem('app_leads_v5', JSON.stringify(mockLeads));
      localStorage.setItem('app_leads_v2', JSON.stringify(mockLeads));
      localStorage.setItem('app_leads', JSON.stringify(mockLeads));
    }
    setTotalLeads(tempLeadsList.length);
    setLeadsList(tempLeadsList);

    // Quotes
    const savedQuotes = localStorage.getItem('app_quotes_v2') || localStorage.getItem('app_quotes');
    let quotesList = [];
    if (savedQuotes) {
      try {
        const parsed = JSON.parse(savedQuotes);
        if (Array.isArray(parsed) && parsed.length > 0) quotesList = parsed;
        else quotesList = mockQuotes;
      } catch(e) { quotesList = mockQuotes; }
    } else {
      quotesList = mockQuotes;
      localStorage.setItem('app_quotes_v2', JSON.stringify(mockQuotes));
      localStorage.setItem('app_quotes', JSON.stringify(mockQuotes));
    }
    setActiveQuotes(quotesList.length);
    setLatestQuotes(quotesList);

    // Tasks for Open Tasks widget
    const savedTasks = localStorage.getItem('app_tasks');
    if (savedTasks) {
      try { setDashboardTasks(JSON.parse(savedTasks)); } catch(e){}
    } else {
      setDashboardTasks(mockTasks);
      localStorage.setItem('app_tasks', JSON.stringify(mockTasks));
    }

    // Partner Photo Upload Notifications
    try {
      const savedNotifs = JSON.parse(localStorage.getItem('app_admin_notifications') || '[]');
      setPartnerNotifs(savedNotifs.filter(n => n.unread !== false));
    } catch(e) {}
  };

  useEffect(() => {
    refreshDashboard();
    window.addEventListener('app_data_changed', refreshDashboard);
    return () => window.removeEventListener('app_data_changed', refreshDashboard);
  }, []);

  const [dashboardTasks, setDashboardTasks] = useState([
    { id: 'TSK-101', title: 'Bellen met Pieter Bakker voor offerte akkoord (P-2002)', completed: false, priority: 'High' },
    { id: 'TSK-102', title: 'Factuur versturen naar Kees Janssen voor oplevering', completed: false, priority: 'Medium' },
    { id: 'TSK-103', title: 'Beoordeel sollicitatie nieuwe vakman Sander Koster', completed: true, priority: 'Low' }
  ]);

  const handleToggleDashboardTask = (taskId) => {
    const updated = dashboardTasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    setDashboardTasks(updated);
    localStorage.setItem('app_tasks', JSON.stringify(updated));
    showToast("Taak status bijgewerkt!");
  };

  // Modals visibility state
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  // Lead Form state
  const [leadForm, setLeadForm] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    status: 'New'
  });

  // Quote Form state
  const [quoteForm, setQuoteForm] = useState({
    customer: '',
    project: '',
    amount: '',
    status: 'Draft'
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleLeadSubmit = (e) => {
    e.preventDefault();
    
    const savedLeads = localStorage.getItem('app_leads_v5') || localStorage.getItem('app_leads_v2') || localStorage.getItem('app_leads');
    const leadsList = savedLeads ? JSON.parse(savedLeads) : [];
    
    const newLead = {
      id: `L-${leadsList.length + 1001}`,
      name: leadForm.name,
      company: leadForm.company || '-',
      phone: leadForm.phone || '-',
      email: leadForm.email,
      productType: 'buitenkeuken',
      size: '3x4m',
      source: 'Direct',
      status: leadForm.status === 'New' ? 'Nieuw' : (leadForm.status || 'Nieuw'),
      assignedTo: 'Admin',
      date: new Date().toISOString().split('T')[0],
      lastContactDate: new Date().toISOString().split('T')[0],
      workflowStep: 1
    };
    
    const updatedLeads = [newLead, ...leadsList];
    localStorage.setItem('app_leads_v5', JSON.stringify(updatedLeads));
    localStorage.setItem('app_leads_v2', JSON.stringify(updatedLeads));
    localStorage.setItem('app_leads', JSON.stringify(updatedLeads));
    window.dispatchEvent(new Event('app_data_changed'));
    
    showToast(language === 'NL' ? `Lead voor "${leadForm.name}" succesvol aangemaakt!` : `Lead for "${leadForm.name}" created successfully!`);
    setLeadForm({ name: '', company: '', phone: '', email: '', status: 'New' });
    setLeadModalOpen(false);
    refreshDashboard();
  };

  const handleOpenQuoteModal = () => {
    const defaultCust = leadsList[0]?.name || 'Other';
    setQuoteForm({ customer: defaultCust === 'Other' ? '' : defaultCust, project: 'Bespoke Outdoor Kitchen', amount: '', status: 'Draft' });
    setCustomerSelect(defaultCust);
    setProjectSelect('Bespoke Outdoor Kitchen');
    setQuoteModalOpen(true);
  };

  const handleQuoteSubmit = (e) => {
    e.preventDefault();
    
    const savedQuotes = localStorage.getItem('app_quotes');
    const quotesList = savedQuotes ? JSON.parse(savedQuotes) : defaultQuotes;
    
    const finalCustomer = customerSelect === 'Other' ? quoteForm.customer : customerSelect;
    const finalProject = projectSelect === 'Other' ? quoteForm.project : projectSelect;

    if (!finalCustomer.trim() || !finalProject.trim()) {
      showToast("Please provide valid Customer and Project details.");
      return;
    }

    const newQuote = {
      id: `Q-${quotesList.length + 4001}`,
      customer: finalCustomer,
      project: finalProject,
      amount: `€ ${parseFloat(quoteForm.amount).toLocaleString()}`,
      status: quoteForm.status,
      date: new Date().toISOString().split('T')[0]
    };
    
    const updatedQuotes = [newQuote, ...quotesList];
    localStorage.setItem('app_quotes', JSON.stringify(updatedQuotes));
    
    showToast(language === 'NL' ? `Offerte voor "${finalCustomer}" succesvol aangemaakt!` : `Quote for "${finalCustomer}" created successfully!`);
    setQuoteForm({ customer: '', project: '', amount: '', status: 'Draft' });
    setQuoteModalOpen(false);
  };

  return (
    <div className="space-y-6 relative font-body">
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

      {/* Hero Banner Box — Increased Height + Buttons Shifted to Top Right */}
      <div className="relative rounded-2xl overflow-hidden w-full h-56 sm:h-64 md:h-72 lg:h-[300px] shadow-sm border border-[#C4BEB3]/40">
        <img src={heroBg} alt="Vanuit Ambacht" className="w-full h-full object-cover object-[center_35%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/65 to-transparent pointer-events-none"></div>
        
        {/* Left Title & Subtitle */}
        <div className="absolute top-4 left-4 sm:top-5 sm:left-6 md:top-6 md:left-8 max-w-md sm:max-w-lg z-20">
          <p className="text-white/60 text-[10px] sm:text-xs font-body font-semibold tracking-widest uppercase mb-0.5">Vanuit Ambacht</p>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-extrabold text-white tracking-tight drop-shadow-xs">{t('dashboard.adminTitle')}</h2>
          <p className="text-white/75 text-xs sm:text-sm font-body mt-1 drop-shadow-xs">{t('dashboard.adminOverview')}</p>
        </div>

        {/* Right Top Action Buttons — Compact & Sleek Sizing */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-5 md:right-6 flex flex-wrap gap-1.5 sm:gap-2 z-10 max-w-[55%] sm:max-w-none justify-end">
          <Button 
            variant="custom" 
            icon={Plus} 
            className="bg-cream text-primary hover:bg-cream/90 shadow-xs border border-primary/10 text-[10px] sm:text-[11px] font-semibold py-1 px-2 sm:px-2.5 rounded-md leading-tight" 
            size="sm"
            onClick={() => setLeadModalOpen(true)}
          >
            <span className="hidden xs:inline">{t('leads.addNewLead')}</span>
            <span className="xs:hidden">+ Lead</span>
          </Button>
          <Button 
            variant="custom" 
            icon={Plus} 
            className="bg-white/15 text-white border border-white/30 hover:bg-white/25 text-[10px] sm:text-[11px] font-semibold py-1 px-2 sm:px-2.5 rounded-md backdrop-blur-xs leading-tight" 
            size="sm"
            onClick={handleOpenQuoteModal}
          >
            <span className="hidden xs:inline">{t('common.createQuote')}</span>
            <span className="xs:hidden">+ Quote</span>
          </Button>
        </div>
      </div>

      {/* PARTNER PHOTO UPLOAD REALTIME NOTIFICATION BANNER */}
      {partnerNotifs.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg flex-shrink-0 animate-bounce">
              📸
            </div>
            <div>
              <p className="text-xs font-bold text-amber-950 font-heading">
                {language === 'EN' ? `New Partner Build Photos Received (${partnerNotifs.length})` : `Nieuwe Voortgangsfoto's Ontvangen van Vakman (${partnerNotifs.length})`}
              </p>
              <p className="text-[11px] text-amber-900/80 font-body">
                {partnerNotifs[0].message}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                navigate('/admin/photos', { state: { projectId: partnerNotifs[0].projectId } });
              }}
              className="px-3.5 py-1.5 bg-primary text-cream rounded-xl text-xs font-bold shadow-xs hover:bg-primary/90 transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>{language === 'EN' ? 'View Photos →' : 'Bekijk Foto\'s →'}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* MODULE 1.2: DATE RANGE FILTER BAR & 7 KPI ANALYTICS CARDS GRID */}
      <div className="space-y-4">
        {/* Date Range Selector Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#D6CFC2]/60 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-heading font-bold text-dark">
                {language === 'NL' ? 'Prestaties & Analytische Cijfers' : 'Performance & Analytics KPIs'}
              </h3>
              <p className="text-[11px] font-body text-dark/50">
                {language === 'NL' ? 'Prestatie-overzicht op basis van geselecteerde tijdsperiode' : 'Performance summary based on selected time frame'}
              </p>
            </div>
          </div>

          {/* Date Selector Dropdown & Custom Range Inputs */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-[#F8F7F4] hover:bg-cream/40 text-dark text-xs font-body font-semibold px-3 py-2 pr-8 rounded-xl border border-[#D6CFC2]/80 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                <option value="7days">{language === 'NL' ? 'Laatste 7 dagen' : 'Last 7 days'}</option>
                <option value="30days">{language === 'NL' ? 'Laatste 30 dagen' : 'Last 30 days'}</option>
                <option value="currentMonth">{language === 'NL' ? 'Deze maand' : 'Current month'}</option>
                <option value="3months">{language === 'NL' ? 'Laatste 3 maanden' : 'Last 3 months'}</option>
                <option value="6months">{language === 'NL' ? 'Laatste 6 maanden' : 'Last 6 months'}</option>
                <option value="12months">{language === 'NL' ? 'Laatste 12 maanden' : 'Last 12 months'}</option>
                <option value="custom">{language === 'NL' ? 'Aangepaste datum' : 'Custom date range'}</option>
              </select>
              <Calendar className="w-3.5 h-3.5 text-dark/40 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {dateRange === 'custom' && (
              <div className="flex items-center gap-1.5 bg-[#F8F7F4] p-1 rounded-xl border border-[#D6CFC2]/80 text-xs">
                <input 
                  type="date" 
                  value={customStartDate} 
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-white text-dark text-[11px] px-2 py-1 rounded-lg border border-[#D6CFC2]/50 focus:outline-none"
                />
                <span className="text-dark/40 text-[10px]">t/m</span>
                <input 
                  type="date" 
                  value={customEndDate} 
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-white text-dark text-[11px] px-2 py-1 rounded-lg border border-[#D6CFC2]/50 focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* 7 KPI Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {/* Card 1: Total Leads */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#D6CFC2]/50 shadow-xs hover:shadow-card transition-all space-y-1 border-l-4 border-l-primary">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-body font-bold text-dark/45 uppercase tracking-wider">{language === 'NL' ? 'Totaal Leads' : 'Total Leads'}</span>
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-xl font-heading font-extrabold text-dark">{dateRange === '7days' ? '28' : dateRange === '3months' ? '340' : '122'}</p>
            <p className="text-[10px] font-body text-emerald-700 font-semibold flex items-center gap-0.5">
              <ArrowUpRight className="w-2.5 h-2.5" /> {language === 'NL' ? '+14% vs vorig' : '+14% vs previous'}
            </p>
          </div>

          {/* Card 2: Cost Per Lead */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#D6CFC2]/50 shadow-xs hover:shadow-card transition-all space-y-1 border-l-4 border-l-amber-600">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-body font-bold text-dark/45 uppercase tracking-wider">{language === 'NL' ? 'Kosten / Lead' : 'Cost / Lead'}</span>
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-xl font-heading font-extrabold text-dark">€ 14,60</p>
            <p className="text-[10px] font-body text-dark/50 truncate">{language === 'NL' ? 'gem. per lead' : 'avg per lead'}</p>
          </div>

          {/* Card 3: Quotations Sent */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#D6CFC2]/50 shadow-xs hover:shadow-card transition-all space-y-1 border-l-4 border-l-blue-600">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-body font-bold text-dark/45 uppercase tracking-wider">{language === 'NL' ? 'Offertes' : 'Quotes Sent'}</span>
              <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                <FileText className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-xl font-heading font-extrabold text-dark">{dateRange === '7days' ? '6' : '22'}</p>
            <p className="text-[10px] font-body text-dark/50 truncate">{language === 'NL' ? 'uitgebracht' : 'issued'}</p>
          </div>

          {/* Card 4: Quotation % */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#D6CFC2]/50 shadow-xs hover:shadow-card transition-all space-y-1 border-l-4 border-l-indigo-600">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-body font-bold text-dark/45 uppercase tracking-wider">{language === 'NL' ? 'Offerte %' : 'Quote %'}</span>
              <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                <Percent className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-xl font-heading font-extrabold text-dark">18%</p>
            <p className="text-[10px] font-body text-dark/50 truncate">{language === 'NL' ? 'van totaal leads' : 'of total leads'}</p>
          </div>

          {/* Card 5: Confirmed Orders (Won) */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#D6CFC2]/50 shadow-xs hover:shadow-card transition-all space-y-1 border-l-4 border-l-emerald-600">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-body font-bold text-dark/45 uppercase tracking-wider">{language === 'NL' ? 'Opdrachten' : 'Orders Won'}</span>
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-xl font-heading font-extrabold text-dark">7</p>
            <p className="text-[10px] font-body text-emerald-700 font-semibold truncate">{language === 'NL' ? 'geaccepteerd' : 'accepted'}</p>
          </div>

          {/* Card 6: Conversion Rate % */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#D6CFC2]/50 shadow-xs hover:shadow-card transition-all space-y-1 border-l-4 border-l-purple-600">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-body font-bold text-dark/45 uppercase tracking-wider">{language === 'NL' ? 'Conversie' : 'Conversion'}</span>
              <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                <Award className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-xl font-heading font-extrabold text-dark">29%</p>
            <p className="text-[10px] font-body text-dark/50 truncate">{language === 'NL' ? 'lead → order' : 'lead → order'}</p>
          </div>

          {/* Card 7: Active Meta Ads */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#D6CFC2]/50 shadow-xs hover:shadow-card transition-all space-y-1 border-l-4 border-l-pink-600 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-body font-bold text-dark/45 uppercase tracking-wider">Meta Ads</span>
              <div className="p-1.5 rounded-lg bg-pink-100 text-pink-700">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-xl font-heading font-extrabold text-dark">4 <span className="text-xs font-body font-normal text-emerald-600">{language === 'NL' ? 'Actief' : 'Active'}</span></p>
            <p className="text-[10px] font-body text-dark/50 truncate">Meta Suite Sync</p>
          </div>
        </div>
      </div>

      {/* NEW DASHBOARD LAYOUT: 5 BLOCKS AS PER CLIENT REQUIREMENTS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN (2/3 width on large screens) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* 1. TOP TODAY / THIS WEEK BLOCK */}
          <Card title={language === 'NL' ? 'Vandaag & Deze Week' : 'Today & This Week'} icon={Calendar}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Follow-ups */}
              <div className="bg-[#F8F7F4] rounded-xl p-4 border border-[#D6CFC2]/50">
                <h4 className="text-xs font-bold font-body text-dark/70 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Users className="w-3 h-3" /> {language === 'NL' ? 'Opvolging Vereist' : 'Follow-ups Due'}
                </h4>
                <div className="space-y-2">
                  {(mockFollowUps && mockFollowUps.length > 0 ? mockFollowUps : [
                    { id: 'FOL-101', name: 'Sophie Bakken', type: language === 'NL' ? 'Offerte Q-4002 nabellen' : 'Follow up on Quote Q-4002', due: language === 'NL' ? 'Vandaag' : 'Today' },
                    { id: 'FOL-102', name: 'Mark de Boer', type: language === 'NL' ? 'Opties overkapping bespreken' : 'Discuss canopy options', due: language === 'NL' ? 'Morgen' : 'Tomorrow' }
                  ]).map(item => (
                    <div key={item.id} className="flex justify-between items-center gap-2 bg-white p-2.5 rounded-lg border border-[#D6CFC2]/30 shadow-sm min-w-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-dark truncate">{item.name}</p>
                        <p className="text-[10px] text-dark/50 truncate">{item.type}</p>
                      </div>
                      <Badge variant="warning" className="whitespace-nowrap flex-shrink-0 text-[10px]">{item.due}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deliveries */}
              <div className="bg-[#F8F7F4] rounded-xl p-4 border border-[#D6CFC2]/50">
                <h4 className="text-xs font-bold font-body text-dark/70 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Briefcase className="w-3 h-3" /> {language === 'NL' ? 'Leveringen Deze Week' : 'Deliveries This Week'}
                </h4>
                <div className="space-y-2">
                  {(mockDeliveries && mockDeliveries.length > 0 ? mockDeliveries : [
                    { id: 'DEL-101', project: language === 'NL' ? 'Luxe Teak Buitenkeuken 4m' : 'Luxury Teak Outdoor Kitchen 4m', customer: 'Jan de Vries', date: language === 'NL' ? 'Vr 14 Aug' : 'Fri 14 Aug', partner: 'CraftWood Veluwe' },
                    { id: 'DEL-102', project: language === 'NL' ? 'Kliko Ombouw Triple Antraciet' : 'Triple Bin Storage Anthracite', customer: 'Sophie Bakken', date: language === 'NL' ? 'Wo 19 Aug' : 'Wed 19 Aug', partner: 'StaalWerk Brabant' }
                  ]).map(item => (
                    <div key={item.id} className="flex flex-col bg-white p-2.5 rounded-lg border border-[#D6CFC2]/30 shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs font-bold text-dark truncate mr-2">{item.project}</p>
                        <span className="text-[10px] font-bold text-primary">{item.date}</span>
                      </div>
                      <p className="text-[10px] text-dark/50">{item.customer}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasks */}
              <div className="bg-[#F8F7F4] rounded-xl p-4 border border-[#D6CFC2]/50 sm:col-span-2 md:col-span-1">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold font-body text-dark/70 uppercase tracking-wider flex items-center gap-2">
                    <ListTodo className="w-3.5 h-3.5 text-primary" /> {language === 'NL' ? 'Openstaande Taken' : 'Open Tasks'}
                  </h4>
                  <a href="/admin/tasks" className="text-[10px] font-bold text-accent hover:underline">{language === 'NL' ? 'Bekijk Alles →' : 'View All →'}</a>
                </div>
                <div className="space-y-2">
                  {dashboardTasks.slice(0, 4).map(item => {
                    let displayTitle = item.title || item.task;
                    if (language === 'EN') {
                      if (displayTitle?.includes('Inmeten buitenkeuken')) displayTitle = 'Measure outdoor kitchen at John Miller';
                      else if (displayTitle?.includes('Kleurstalen opsturen')) displayTitle = 'Send color samples to Sophia Taylor';
                      else if (displayTitle?.includes('Offerte Q-4003 nabellen')) displayTitle = 'Follow up on quote Q-4003 (Mark Davis)';
                    }
                    return (
                    <div 
                      key={item.id} 
                      onClick={() => handleToggleDashboardTask(item.id)}
                      className={`flex items-start gap-2 p-2.5 rounded-lg border shadow-xs cursor-pointer transition-colors ${
                        item.completed ? 'bg-gray-50 border-gray-200 text-dark/40' : 'bg-white border-[#D6CFC2]/50 hover:border-primary/40'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.completed || false}
                        onChange={() => {}} // handled by div click
                        className="w-3.5 h-3.5 accent-primary mt-0.5 cursor-pointer flex-shrink-0"
                      />
                      <p className={`text-[11px] font-medium leading-tight ${item.completed ? 'line-through' : 'text-dark'}`}>
                        {displayTitle}
                      </p>
                    </div>
                  )})}
                </div>
              </div>
            </div>
          </Card>

          {/* 2. CONVERSION FUNNEL WIDGET */}
          <Card title={language === 'NL' ? 'Conversietrechter (Deze Maand)' : 'Conversion Funnel (This Month)'} icon={TrendingUp}>
            <div className="flex flex-col gap-4 py-2">
              {[
                { label: language === 'NL' ? 'Leads deze maand' : 'Leads this month', data: mockFunnelData.leads, barClass: 'bg-primary opacity-20', width: '100%' },
                { label: language === 'NL' ? 'In gesprek' : 'In Discussion', data: mockFunnelData.inGesprek, barClass: 'bg-primary opacity-40', width: `${mockFunnelData.inGesprek.percentage}%` },
                { label: language === 'NL' ? 'Offerte verstuurd' : 'Quote Sent', data: mockFunnelData.offerte, barClass: 'bg-primary opacity-70', width: `${mockFunnelData.offerte.percentage}%` },
                { label: language === 'NL' ? 'Gewonnen (Project)' : 'Won (Project)', data: mockFunnelData.gewonnen, barClass: 'bg-primary opacity-100', width: `${mockFunnelData.gewonnen.percentage}%` }
              ].map((step, idx) => (
                <div key={idx} className="flex flex-col gap-1.5 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-dark/70 font-body uppercase tracking-wider">{step.label}</p>
                      {step.data.percentage && (
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">
                          {step.data.percentage}%
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-heading font-extrabold text-dark">{step.data.count}</p>
                  </div>
                  <div className="w-full h-3 bg-[#F8F7F4] rounded-full relative flex items-center border border-[#D6CFC2]/40 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: step.width }}
                      transition={{ duration: 1, ease: "easeOut", delay: idx * 0.2 }}
                      className={`h-full ${step.barClass} rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>

        {/* RIGHT COLUMN (1/3 width on large screens) */}
        <div className="space-y-6">
          
          {/* 3. FINANCIAL SNAPSHOT */}
          <Card title={language === 'NL' ? 'Financieel Overzicht' : 'Financial Snapshot'} icon={Banknote}>
            <div className="space-y-3">
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                <p className="text-[10px] font-bold text-dark/50 uppercase tracking-wider mb-1">{language === 'NL' ? 'Omzet Deze Maand' : 'Revenue This Month'}</p>
                <p className="text-3xl font-heading font-extrabold text-primary">{mockFinancials.monthlyRevenue}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-[9px] font-bold text-red-800/60 uppercase tracking-wider mb-1">{language === 'NL' ? 'Openstaand' : 'Outstanding'}</p>
                  <p className="text-lg font-heading font-bold text-red-900">{mockFinancials.outstandingInvoices}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-[9px] font-bold text-green-800/60 uppercase tracking-wider mb-1">{language === 'NL' ? 'Verwacht' : 'Expected'}</p>
                  <p className="text-lg font-heading font-bold text-green-900">{mockFinancials.expectedRevenue}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* 4. WARNINGS BLOCK */}
          <Card title={language === 'NL' ? 'Actie Vereist' : 'Action Required'} icon={AlertTriangle} className="border-l-4 border-l-red-500">
            <div className="space-y-3">
              {mockWarnings.map(warning => (
                <div key={warning.id} className="flex gap-3 p-3 bg-red-50/50 rounded-xl border border-red-100 items-start">
                  <div className="mt-0.5 p-1.5 bg-red-100 rounded-lg text-red-600">
                    <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-red-900 leading-none mb-1">{warning.type}</p>
                    <p className="text-[10px] text-dark font-medium">{warning.customer}</p>
                    <p className="text-[10px] text-red-700/70">{warning.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 5. RECENT ACTIVITY FEED */}
          <Card title={language === 'NL' ? 'Recente Activiteit' : 'Recent Activity'} icon={Bell}>
            <div className="space-y-5">
              {mockRecentActivities.map((a, i) => (
                <div key={a.id} className="relative pl-5">
                  <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-accent"></div>
                  {i < mockRecentActivities.length - 1 && (
                    <div className="absolute left-[3px] top-4 bottom-[-16px] w-px bg-cream-dark/60"></div>
                  )}
                  <p className="text-xs text-dark font-body leading-snug">
                    {a.textKey ? t(a.textKey, a.params) : (a.text || (language === 'NL' && a.id === 1 ? 'Nieuwe lead ontvangen - Emma Wilson (Poolhouse 8x4m)' : a.title ? `${a.title} - ${a.detail}` : ''))}
                  </p>
                  <span className="text-[10px] text-dark/35 font-body mt-0.5 block">{a.timeKey ? t(a.timeKey) : a.time}</span>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>

      {/* NEW LEAD MODAL */}
      <AnimatePresence>
        {leadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
              onClick={() => setLeadModalOpen(false)}
            />
            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-cream-dark/60 pb-3">
                <h3 className="text-lg font-heading font-bold text-primary">{t('leads.modalAddTitle')}</h3>
                <button onClick={() => setLeadModalOpen(false)} className="p-1 rounded-lg text-dark/40 hover:bg-cream-dark/20 hover:text-dark transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-dark/60 mb-1 font-body uppercase tracking-wider">{t('leads.customerName')}</label>
                  <input
                    type="text"
                    required
                    value={leadForm.name}
                    onChange={e => setLeadForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 text-[#4A4A43]"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark/60 mb-1 font-body uppercase tracking-wider">{t('common.company')}</label>
                  <input
                    type="text"
                    required
                    value={leadForm.company}
                    onChange={e => setLeadForm(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 text-[#4A4A43]"
                    placeholder="e.g. Outdoors BV"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-dark/60 mb-1 font-body uppercase tracking-wider">{t('common.phone')}</label>
                    <input
                      type="text"
                      value={leadForm.phone}
                      onChange={e => setLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 text-[#4A4A43]"
                      placeholder="+31 6 123..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-dark/60 mb-1 font-body uppercase tracking-wider">{t('common.email')}</label>
                    <input
                      type="email"
                      required
                      value={leadForm.email}
                      onChange={e => setLeadForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 text-[#4A4A43]"
                      placeholder="john@outdoors.nl"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark/60 mb-1 font-body uppercase tracking-wider">{t('common.status')}</label>
                  <select
                    value={leadForm.status}
                    onChange={e => setLeadForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 text-[#4A4A43]"
                  >
                    <option value="New">{t('statuses.New')}</option>
                    <option value="Contacted">{t('statuses.Contacted')}</option>
                    <option value="Qualified">{t('statuses.Qualified')}</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-cream-dark/60">
                  <Button type="button" variant="outline" onClick={() => setLeadModalOpen(false)}>{t('common.cancel')}</Button>
                  <Button type="submit">{t('leads.addNewLead')}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NEW QUOTE MODAL */}
      <AnimatePresence>
        {quoteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
              onClick={() => setQuoteModalOpen(false)}
            />
            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-cream-dark/60 pb-3">
                <h3 className="text-lg font-heading font-bold text-primary">{t('quotes.modalAddTitle')}</h3>
                <button onClick={() => setQuoteModalOpen(false)} className="p-1 rounded-lg text-dark/40 hover:bg-cream-dark/20 hover:text-dark transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleQuoteSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-dark/60 mb-1 font-body uppercase tracking-wider">{t('quotes.customerName')}</label>
                  <select
                    value={customerSelect}
                    onChange={e => {
                      const val = e.target.value;
                      setCustomerSelect(val);
                      if (val !== 'Other') {
                        setQuoteForm(prev => ({ ...prev, customer: val }));
                      } else {
                        setQuoteForm(prev => ({ ...prev, customer: '' }));
                      }
                    }}
                    className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 text-[#4A4A43] mb-2"
                  >
                    {leadsList.map((lead, idx) => (
                      <option key={idx} value={lead.name}>{lead.name} (Lead)</option>
                    ))}
                    <option value="Other">{language === 'NL' ? 'Nieuw / Aangepaste Klant...' : 'New / Custom Customer...'}</option>
                  </select>
                  
                  {customerSelect === 'Other' && (
                    <motion.input
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      type="text"
                      required
                      value={quoteForm.customer}
                      onChange={e => setQuoteForm(prev => ({ ...prev, customer: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 text-[#4A4A43]"
                      placeholder={language === 'NL' ? 'Typ klantnaam...' : 'Type new customer name...'}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dark/60 mb-1 font-body uppercase tracking-wider">{t('quotes.projectType')}</label>
                  <select
                    value={projectSelect}
                    onChange={e => {
                      const val = e.target.value;
                      setProjectSelect(val);
                      if (val !== 'Other') {
                        setQuoteForm(prev => ({ ...prev, project: val }));
                      } else {
                        setQuoteForm(prev => ({ ...prev, project: '' }));
                      }
                    }}
                    className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 text-[#4A4A43] mb-2"
                  >
                    <option value="Bespoke Outdoor Kitchen">{language === 'NL' ? 'Exclusieve Buitenkeuken' : 'Bespoke Outdoor Kitchen'}</option>
                    <option value="Bespoke Hiko Surround">{language === 'NL' ? 'Exclusieve Kliko-ombouw' : 'Bespoke Hiko Surround'}</option>
                    <option value="Wood Pergola">{language === 'NL' ? 'Houten Pergola' : 'Wood Pergola'}</option>
                    <option value="Garden Decking">{language === 'NL' ? 'Tuinterras' : 'Garden Decking'}</option>
                    <option value="Other">{language === 'NL' ? 'Anders (Aangepast)...' : 'Other (Custom Type)...'}</option>
                  </select>
                  
                  {projectSelect === 'Other' && (
                    <motion.input
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      type="text"
                      required
                      value={quoteForm.project}
                      onChange={e => setQuoteForm(prev => ({ ...prev, project: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 text-[#4A4A43]"
                      placeholder={language === 'NL' ? 'Typ projecttype...' : 'Type custom project type...'}
                    />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-dark/60 mb-1 font-body uppercase tracking-wider">{t('quotes.amountLabel')}</label>
                    <input
                      type="number"
                      required
                      value={quoteForm.amount}
                      onChange={e => setQuoteForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 text-[#4A4A43]"
                      placeholder="e.g. 4500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-dark/60 mb-1 font-body uppercase tracking-wider">{t('common.status')}</label>
                    <select
                      value={quoteForm.status}
                      onChange={e => setQuoteForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 text-[#4A4A43]"
                    >
                      <option value="Draft">{t('statuses.Draft')}</option>
                      <option value="Accepted">{t('statuses.Accepted')}</option>
                      <option value="Paid">{t('statuses.Paid')}</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-cream-dark/60">
                  <Button type="button" variant="outline" onClick={() => setQuoteModalOpen(false)}>{t('common.cancel')}</Button>
                  <Button type="submit">{t('quotes.addNewQuote')}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
