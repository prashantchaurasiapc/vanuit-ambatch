import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, MessageCircle, ExternalLink, Calendar, 
  Send, FileText, Camera, Shield, Check, Clock, ChevronRight,
  X, Phone, MessageSquare, Download, AlertCircle, Info, Lock, User, Wrench, Plus, Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import ProjectChatDrawer from '../../components/common/ProjectChatDrawer';

export default function GardenRoomProjects({ onBackToOverview }) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isEn = language !== 'NL';

  // State matching Screenshot 2 (Garden Room Project Detail: PROJECT 2026-021)
  const [activeStep, setActiveStep] = useState(isEn ? 'Survey (Schouw)' : 'Schouw');
  const [activeTab, setActiveTab] = useState(isEn ? 'Week Planning & Survey' : 'Weekplanning & schouw');
  const [toastMsg, setToastMsg] = useState('');

  // Editable fields for Weekplanning & Schouw
  const [schouwDag, setSchouwDag] = useState(isEn ? 'Thursday August 27' : 'donderdag 27 augustus');
  const [schouwTijd, setSchouwTijd] = useState(isEn ? 'around 10:00 AM' : 'rond 10:00');
  const [schouwUitvoerende, setSchouwUitvoerende] = useState('Partner (Timmerwerken Zuid)');

  // Weekplanning rows
  const [planningRows, setPlanningRows] = useState(isEn ? [
    { id: 1, fase: 'Site Preparation (Groundwork)', week: '39', status: 'Provisional', note: 'Partner: 1 day' },
    { id: 2, fase: 'Materials Delivered', week: '40', status: 'Provisional', note: '± 15 m² storage at customer site' },
    { id: 3, fase: 'Construction & Assembly', week: '41-42', status: 'Provisional', note: 'Completion end of week 42' }
  ] : [
    { id: 1, fase: 'Voorbereiding (grondwerk)', week: '39', status: 'Voorlopig', note: 'partner: 1 dag' },
    { id: 2, fase: 'Materialen geleverd', week: '40', status: 'Voorlopig', note: '± 15 m² opslag bij klant' },
    { id: 3, fase: 'De bouw', week: '41-42', status: 'Voorlopig', note: 'oplevering eind wk 42' }
  ]);

  // Render versions state matching Screenshot 2 exactly
  const [renderVersions, setRenderVersions] = useState(isEn ? [
    {
      id: 2,
      version: 'Version 2 · current',
      isLive: true,
      description: '4 perspectives + evening render · "Sliding glass doors to south side, roof overhang +40 cm based on afternoon sun."',
      date: 'Today 14:20',
      woodColor: '#A68252'
    },
    {
      id: 1,
      version: 'Version 1',
      isLive: false,
      description: 'Aug 6 · remains inspectable for customer (dimmed)',
      date: 'Aug 6',
      woodColor: '#D4C5B0'
    }
  ] : [
    {
      id: 2,
      version: 'Versie 2 · actueel',
      isLive: true,
      description: '4 aanzichten + avond · "Schuifpui naar zuidzijde, overstek +40 cm — n.a.v. jouw opmerking over de middagzon."',
      date: 'vandaag 14:20',
      woodColor: '#A68252'
    },
    {
      id: 1,
      version: 'Versie 1',
      isLive: false,
      description: '6 aug · blijft bekijkbaar voor de klant (gedimd)',
      date: '6 aug',
      woodColor: '#D4C5B0'
    }
  ]);

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newVersionNotes, setNewVersionNotes] = useState('');

  // Modals & Chat Drawer State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'Sander de Vries', role: 'klant', text: isEn ? 'Hi Tim, is the site inspection date Thursday Aug 27 around 10:00 AM confirmed?' : 'Hoi Tim, is de schouwdatum van donderdag 27 augustus rond 10:00 uur akkoord?', time: '11:00' },
    { id: 2, sender: 'Tim (Admin)', role: 'admin', text: isEn ? 'Yes absolutely Sander! Our partner Lars (Timmerwerken Zuid) will be visiting.' : 'Ja zeker Sander! Onze partner Lars (Timmerwerken Zuid) komt dan langs.', time: '11:15' }
  ]);
  const [inputChatMsg, setInputChatMsg] = useState('');
  const [previewRenderModal, setPreviewRenderModal] = useState(null);
  const [newProjectModal, setNewProjectModal] = useState(false);
  const [newProjectClient, setNewProjectClient] = useState('');
  const [newProjectType, setNewProjectType] = useState(isEn ? 'Garden Room' : 'Buitenverblijf');
  const [newProjectBudget, setNewProjectBudget] = useState('€ 37,950.00');
  const [phaseModal, setPhaseModal] = useState(false);
  const [selectedNewPhase, setSelectedNewPhase] = useState(isEn ? 'Survey (Schouw)' : 'Schouw');

  const [handoverConfirmed, setHandoverConfirmed] = useState(false);
  const [invoice20Generated, setInvoice20Generated] = useState(false);

  // Logbook entries
  const [logbook, setLogbook] = useState(isEn ? [
    { id: 1, date: 'Today 11:15', text: 'Site inspection proposal sent (Aug 27) — Tim' },
    { id: 2, date: 'Aug 21', text: 'Render Version 2 published to Customer Portal — Bram' },
    { id: 3, date: 'Aug 03', text: 'Quote OF-2026418 signed (€ 37,950.00) · 40% deposit received — System' }
  ] : [
    { id: 1, date: 'Vandaag 11:15', text: 'Schouwvoorstel verzonden (27 aug) — Tim' },
    { id: 2, date: '21 aug', text: 'Renderversie 2 gepubliceerd naar klantportaal — Bram' },
    { id: 3, date: '03 aug', text: 'Offerte OF-2026418 getekend (€ 37.950,00) · 40% aanbetaling voldaan — Systeem' }
  ]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleConfirmPhaseUpdate = (e) => {
    e.preventDefault();
    setActiveStep(selectedNewPhase);
    setPhaseModal(false);
    showToast(`✓ Projectfase succesvol bijgewerkt naar: "${selectedNewPhase}"`);
  };

  const handleCreateNewProject = (e) => {
    e.preventDefault();
    if (!newProjectClient.trim()) return;
    setNewProjectModal(false);
    showToast(`✓ Nieuw project voor "${newProjectClient}" succesvol aangemaakt!`);
  };

  const handleDefinitiefMaken = () => {
    showToast('⚠️ Planning is vergrendeld tot de schouw is afgerond op 27 augustus.');
  };

  const handleUploadNewRenderVersion = (e) => {
    e.preventDefault();
    if (!newVersionNotes.trim()) {
      showToast('⚠️ Zonder wijzigingsregel kan er niet gepubliceerd worden.');
      return;
    }

    const nextId = renderVersions.length + 1;
    const newVer = {
      id: nextId,
      version: `Versie ${nextId} · actueel`,
      isLive: true,
      description: `4 aanzichten + avond · "${newVersionNotes.trim()}"`,
      date: 'vandaag',
      woodColor: '#5C5138'
    };

    const updatedList = renderVersions.map(v => ({ ...v, isLive: false, version: v.version.replace(' · actueel', '') }));
    setRenderVersions([newVer, ...updatedList]);
    setNewVersionNotes('');
    setUploadModalOpen(false);
    showToast('✓ Nieuwe renderversie gepubliceerd naar klantportaal!');
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!inputChatMsg.trim()) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: Date.now(),
      sender: 'Tim (Admin)',
      role: 'admin',
      text: inputChatMsg.trim(),
      time: timeNow
    };

    setChatMessages([...chatMessages, newMsg]);
    setInputChatMsg('');
    showToast('Bericht verzonden naar klant!');
  };

  const stepsList = isEn ? [
    { name: 'Agreement & Design', key: 'Agreement & Design' },
    { name: 'Survey (Schouw)', key: 'Survey (Schouw)' },
    { name: 'Preparation', key: 'Preparation' },
    { name: 'Materials', key: 'Materials' },
    { name: 'Construction', key: 'Construction' },
    { name: 'Handover', key: 'Handover' },
    { name: 'Aftercare', key: 'Aftercare' }
  ] : [
    { name: 'Akkoord & ontwerp', key: 'Akkoord & ontwerp' },
    { name: 'Schouw', key: 'Schouw' },
    { name: 'Voorbereiding', key: 'Voorbereiding' },
    { name: 'Materialen', key: 'Materialen' },
    { name: 'De bouw', key: 'De bouw' },
    { name: 'Oplevering', key: 'Oplevering' },
    { name: 'Nazorg', key: 'Nazorg' }
  ];

  const allTabsList = isEn ? [
    'Week Planning & Survey',
    '3D Renders',
    'Payments (40/40/20 Scheme)'
  ] : [
    'Weekplanning & schouw',
    'Renders',
    'Betalingen (3 termijnen)'
  ];

  // Shared Right Rail Cards matching Screenshot 2 100% exact
  const renderRightRail = () => (
    <div className="space-y-6">
      
      {/* CARD 1: LIVE — WHAT THE CUSTOMER SEES NOW */}
      <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-5 shadow-2xs space-y-3">
        <span className="text-[10px] font-mono font-bold text-dark/50 uppercase tracking-wider block">
          {isEn ? 'LIVE · WHAT THE CUSTOMER SEES NOW' : 'LIVE · WAT ZIET DE KLANT NU'}
        </span>

        <div className="bg-white border border-dashed border-[#D6CFC2] rounded-2xl p-4 space-y-2.5 shadow-2xs">
          <div>
            <h4 className="font-serif font-bold text-xs text-[#33422C]">
              {isEn ? 'Hi Sander' : 'Hoi Sander'}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-dark/80 font-sans mt-0.5">
              <strong className="font-bold text-[#2A2925]">{activeStep}</strong>
              <span className="text-dark/40 font-normal">·</span>
              <span className="text-dark/70 font-medium">{isEn ? 'Build week 41-42' : 'bouwweek 41-42'}</span>
              <span className="px-2 py-0.5 bg-[#FDF8EE] border border-dashed border-[#E5C9A3] text-[#B86B14] rounded-md text-[9px] font-mono font-bold">
                ◯ {isEn ? 'provisional' : 'voorlopig'}
              </span>
            </div>
          </div>

          <div className="px-3 py-1 bg-[#FDF2E3] border border-[#F6DCB8] text-[#B86B14] rounded-xl text-[10px] font-bold inline-block">
            {isEn ? '• 2 actions: site inspection proposal · render v2' : '• 2 acties: schouwvoorstel · render v2'}
          </div>
        </div>
      </div>

      {/* CARD 2: PARTNER — TIMMERWERKEN ZUID */}
      <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-5 shadow-2xs space-y-3">
        <span className="text-[10px] font-mono font-bold text-dark/50 uppercase tracking-wider block">
          {isEn ? 'PARTNER · TIMMERWERKEN ZUID' : 'PARTNER · TIMMERWERKEN ZUID'}
        </span>

        <div className="space-y-1.5">
          <h4 className="font-sans text-xs sm:text-sm font-bold text-[#2A2925] flex items-center gap-1 flex-wrap">
            <span className="font-bold text-[#2A2925]">{isEn ? 'Assignment Confirmed' : 'Opdracht bevestigd'}</span>
            <span className="text-dark/40 font-normal">·</span>
            <span className="text-dark/70 font-medium">{isEn ? 'partner payout € 24,900' : 'partnerbedrag € 24.900'}</span>
          </h4>
          <span className="px-2 py-0.5 bg-[#EAE7DF] text-[#55554E] rounded-md text-[9px] font-bold font-mono inline-block">
            {isEn ? 'INTERNAL ONLY' : 'INTERN'}
          </span>
          <p className="text-[11px] text-dark/50 font-body pt-0.5">
            {isEn ? 'Awaiting: final schedule after survey · work order v1' : 'Wacht op: definitieve planning na schouw · werkbon v1'}
          </p>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <a
            href="https://wa.me/31698765432"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 bg-white hover:bg-[#FAF8F5] text-dark/80 border border-[#D6CFC2] rounded-xl text-[11px] font-bold transition-all shadow-2xs"
          >
            WhatsApp partner
          </a>
          <button
            onClick={() => showToast(isEn ? 'Trello board opened!' : 'Trello bord geopend!')}
            className="px-3.5 py-1.5 bg-white hover:bg-[#FAF8F5] text-dark/80 border border-[#D6CFC2] rounded-xl text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
          >
            Trello
          </button>
        </div>
      </div>

      {/* CARD 3: LOGBOOK (ALL WITH WHO/WHEN) */}
      <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-5 shadow-2xs space-y-3">
        <span className="text-[10px] font-mono font-bold text-dark/50 uppercase tracking-wider block">
          {isEn ? 'LOGBOOK (ALL WITH WHO/WHEN)' : 'LOGBOEK (ALLES MET WIE/WANNEER)'}
        </span>

        <div className="space-y-2.5 text-[11px] font-body">
          {logbook.map((log) => (
            <div key={log.id} className="flex items-start gap-3 border-b border-[#E6E1D7]/60 pb-2">
              <span className="font-mono text-[11px] text-dark/40 font-semibold whitespace-nowrap">{log.date}</span>
              <span className="text-xs font-bold text-[#2A2925] font-sans">{log.text}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );

  return (
    <div className="-m-3 sm:-m-4 lg:-m-6 p-4 sm:p-6 lg:p-8 min-h-full bg-[#F4F1EA] text-[#4A4A43] font-body space-y-6 relative w-auto">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-[99999] bg-[#33422C] text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-white/10"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP PORTAL BREADCRUMB BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pb-1">
        <div className="flex items-center gap-2">
          {onBackToOverview ? (
            <button
              onClick={onBackToOverview}
              className="p-1.5 px-2.5 bg-[#33422C] hover:bg-[#253120] text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center cursor-pointer mr-1"
              title={isEn ? "Back to Projects Overview" : "Terug naar Projecten Overzicht"}
            >
              ←
            </button>
          ) : (
            <button
              onClick={() => navigate('/admin/projects')}
              className="p-1.5 px-2.5 bg-[#33422C] hover:bg-[#253120] text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center cursor-pointer mr-1"
              title={isEn ? "Back to Projects Overview" : "Terug naar Projecten Overzicht"}
            >
              ←
            </button>
          )}
          <span className="font-bold text-[#33422C] font-serif text-sm">
            {isEn ? 'Project Management' : 'Projectenbeheer'}
          </span>
          <span className="text-dark/40">·</span>
          <span className="text-dark/60 font-mono text-[11px]">
            {isEn ? 'admin portal' : 'adminportaal'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              navigate('/admin/projects/inbox-messages');
              showToast(isEn ? 'Project messages opened...' : 'Projectberichten geopend...');
            }}
            className="px-2.5 py-1 bg-white border border-[#D6CFC2] text-dark/70 rounded-xl font-bold text-[11px] shadow-2xs hover:bg-[#FAF8F5] cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <span>Inbox</span>
            <strong className="text-[#33422C] bg-[#E3EFE3] px-1.5 py-0.2 rounded font-mono text-[11px]">4</strong>
          </button>

          <button 
            onClick={() => {
              setActiveTab(isEn ? 'Week Planning & Survey' : 'Weekplanning & schouw');
              showToast(isEn ? 'Filtered: 3 tasks waiting for us' : 'Gefilterd: 3 taken wachten op ons');
            }}
            className="px-2.5 py-1 bg-[#FDF2E3] text-[#B86B14] border border-[#F6DCB8] rounded-xl font-bold text-[11px] flex items-center gap-1.5 shadow-2xs cursor-pointer hover:bg-[#FCEAD0] transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>{isEn ? '3 tasks waiting for us' : '3 taken wachten op ons'}</span>
          </button>

          <button 
            onClick={() => setNewProjectModal(true)}
            className="px-3 py-1 bg-[#33422C] hover:bg-[#283523] text-white rounded-xl font-bold text-[11px] cursor-pointer shadow-xs transition-all flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isEn ? 'New Project' : 'Nieuw project'}</span>
          </button>
        </div>
      </div>

      {/* MAIN HEADER SECTION matching Screenshot 2 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        <div>
          <span className="text-[11px] font-mono font-bold text-dark/50 uppercase tracking-widest block">
            {isEn ? 'PROJECT 2026-021 — GARDEN ROOM & CANOPY' : 'PROJECT 2026-021 — BUITENVERBLIJF'}
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#33422C] mt-0.5">
            Sander de Vries — Overkapping met poolhouse
          </h1>
          <p className="text-xs sm:text-sm text-dark/70 font-body mt-1">
            {isEn ? 'Oisterwijk · Quote OF-2026418 · Approved Aug 3 · € 37,950.00 incl. VAT · 40/40/20' : 'Oisterwijk · offerte OF-2026418 · akkoord 3 aug · € 37.950,00 incl. btw · 40/40/20'}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => {
              const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const newLog = {
                id: Date.now(),
                date: `Today ${timeNow}`,
                text: 'Customer Portal session opened (Bekijk als klant) — Admin'
              };
              setLogbook(prev => [newLog, ...prev]);
              showToast(isEn ? '✓ Opening Customer Portal in read-only preview mode (Session Logged)...' : '✓ Klantportaal geopend in leesmodus (Sessie gelogd)...');
              window.open('/customer/project', '_blank');
            }}
            className="px-4 py-2.5 bg-white hover:bg-[#FAF8F5] text-[#33422C] border border-[#D6CFC2] rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            title="Bekijk als klant (Live Read-Only Customer Portal)"
          >
            <span>{isEn ? '👁️ View Customer Portal' : '👁️ Klantportaal bekijken als klant'}</span>
          </button>

          <button
            onClick={() => {
              setSelectedNewPhase(activeStep);
              setPhaseModal(true);
            }}
            className="px-5 py-2.5 bg-[#33422C] hover:bg-[#283523] text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            {isEn ? 'Update Phase' : 'Fase bijwerken'}
          </button>
        </div>
      </div>

      {/* STEPPER BAR CARD matching Screenshot 2 (7 Steps) */}
      <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {stepsList.map((step) => {
            const isActive = activeStep === step.key;
            return (
              <button
                key={step.key}
                onClick={() => setActiveStep(step.key)}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive 
                    ? 'bg-[#5C5138] text-white shadow-xs' 
                    : 'bg-[#EDE8DF]/70 text-dark/70 hover:bg-[#EDE8DF]'
                }`}
              >
                {step.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* PRIMARY TABS BAR matching Screenshot 2 */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-8 border-b border-[#D6CFC2]/70 pb-0.5 overflow-x-auto no-scrollbar">
          {allTabsList.map((tabName) => {
            const isActive = activeTab === tabName;
            return (
              <button
                key={tabName}
                onClick={() => setActiveTab(tabName)}
                className={`pb-2.5 text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer focus:outline-none relative ${
                  isActive 
                    ? 'text-[#33422C] font-extrabold font-body' 
                    : 'text-[#736B5E] hover:text-[#33422C] font-medium font-body'
                }`}
              >
                {tabName}
                {isActive && (
                  <motion.div 
                    layoutId="activeTabIndicatorGR2" 
                    className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#9B7C47]" 
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT: WEEKPLANNING & SCHOUW */}
      {activeTab === (isEn ? 'Week Planning & Survey' : 'Weekplanning & schouw') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: 7 COLUMNS */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* CARD 1: Weekplanning */}
            <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-[#33422C]">
                  {isEn ? 'Week Planning' : 'Weekplanning'}
                </h3>
                <div className="flex items-center gap-2 text-[10px] font-bold font-mono">
                  <span className="px-2.5 py-0.5 bg-[#E3EFE3] text-[#2D6A2D] rounded-md">
                    {isEn ? '→ CUSTOMER' : '→ KLANT'}
                  </span>
                  <span className="px-2.5 py-0.5 bg-[#FDF2E3] text-[#B86B14] rounded-md">
                    {isEn ? '→ PARTNER' : '→ PARTNER'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-dark/60 font-body leading-relaxed">
                {isEn 
                  ? 'A week number + status per phase. As long as "provisional": dotted badge shown to customer. One button finalizes everything (requires completed survey) → customer receives one notification + .ics calendar file, partner gets build weeks in work order.' 
                  : 'Per fase een weeknummer + status. Zolang "voorlopig": overal de gestippelde badge aan klantzijde. Eén knop maakt álles definitief (vereist: schouw afgerond) → klant krijgt één notificatie + .ics per fase, partner krijgt de bouwweken in de werkbon.'}
              </p>

              {/* Table of Planning Phases */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#D6CFC2] text-[10px] font-mono uppercase text-dark/50 tracking-wider">
                      <th className="pb-2 font-bold">{isEn ? 'PHASE' : 'FASE'}</th>
                      <th className="pb-2 font-bold w-24">{isEn ? 'WEEK' : 'WEEK'}</th>
                      <th className="pb-2 font-bold w-28">{isEn ? 'STATUS' : 'STATUS'}</th>
                      <th className="pb-2 font-bold">{isEn ? 'NOTE' : 'NOTE'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E1D7]">
                    {planningRows.map((row) => (
                      <tr key={row.id} className="text-dark/80 font-body">
                        <td className="py-3 font-bold text-[#33422C]">{row.fase}</td>
                        <td className="py-3">
                          <input
                            type="text"
                            value={row.week}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPlanningRows(planningRows.map(r => r.id === row.id ? { ...r, week: val } : r));
                            }}
                            className="w-16 px-2 py-1 bg-white border border-[#D6CFC2] rounded-lg font-bold text-center text-xs focus:ring-2 focus:ring-[#33422C]/20"
                          />
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-1 bg-[#FDF8EE] border border-dashed border-[#E5C9A3] text-[#B86B14] rounded-lg text-[10px] font-bold font-mono">
                            ◯ {row.status}
                          </span>
                        </td>
                        <td className="py-3 text-[11px] text-dark/60 italic">{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom Action Area */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-3 border-t border-[#E6E1D7]">
                <button
                  type="button"
                  onClick={handleDefinitiefMaken}
                  className="px-4 py-2 bg-[#33422C] hover:bg-[#283523] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer self-start"
                >
                  {isEn ? 'Make Schedule Final' : 'Planning definitief maken'}
                </button>
                <span className="text-[11px] text-dark/50 font-body">
                  {isEn ? 'Locked until site inspection survey is completed.' : 'Vergrendeld tot de schouw is afgerond.'}
                </span>
              </div>
            </div>

            {/* CARD 2: Schouwvoorstel */}
            <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-[#33422C]">
                  {isEn ? 'Site Inspection Proposal' : 'Schouwvoorstel'}
                </h3>
                <div className="flex items-center gap-2 text-[10px] font-bold font-mono">
                  <span className="px-2.5 py-0.5 bg-[#E3EFE3] text-[#2D6A2D] rounded-md">
                    {isEn ? '→ CUSTOMER' : '→ KLANT'}
                  </span>
                  <span className="px-2.5 py-0.5 bg-[#FDF2E3] text-[#B86B14] rounded-md">
                    {isEn ? '→ PARTNER' : '→ PARTNER'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-dark/60 uppercase tracking-wider mb-1">
                    {isEn ? 'DAY' : 'DAG'}
                  </label>
                  <input
                    type="text"
                    value={schouwDag}
                    onChange={(e) => setSchouwDag(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs font-body font-bold text-[#4A4A43]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-dark/60 uppercase tracking-wider mb-1">
                    {isEn ? 'TIME' : 'TIJD'}
                  </label>
                  <input
                    type="text"
                    value={schouwTijd}
                    onChange={(e) => setSchouwTijd(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs font-body font-bold text-[#4A4A43]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-dark/60 uppercase tracking-wider mb-1">
                    {isEn ? 'EXECUTOR' : 'UITVOERENDE'}
                  </label>
                  <select
                    value={schouwUitvoerende}
                    onChange={(e) => setSchouwUitvoerende(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs font-body font-bold text-[#4A4A43] cursor-pointer"
                  >
                    <option value="Partner (Timmerwerken Zuid)">Partner (Timmerwer...</option>
                    <option value="Eigen team (Tim & Bram)">{isEn ? 'Own team (Tim & Bram)' : 'Eigen team (Tim & Bram)'}</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-[#FDF8EE] border border-[#F6DCB8] text-[#B86B14] rounded-xl text-xs font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>• {isEn ? 'Awaiting customer agreement · reminder scheduled Aug 21' : 'Wacht op akkoord klant · herinnering gepland 21 aug'}</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: 5 COLUMNS (RIGHT RAIL matching Screenshot 2) */}
          <div className="lg:col-span-5">
            {renderRightRail()}
          </div>

        </div>
      )}

      {/* TAB CONTENT: RENDERS (100% Exact 1-to-1 Match with Screenshot 2) */}
      {activeTab === (isEn ? '3D Renders' : 'Renders') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: 7 COLUMNS */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* CARD: Renderversies */}
            <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-[#33422C]">
                  {isEn ? '3D Render Versions' : 'Renderversies'}
                </h3>
                <span className="px-2.5 py-0.5 bg-[#E3EFE3] text-[#2D6A2D] rounded-md font-mono text-[10px] font-bold">
                  {isEn ? '→ CUSTOMER' : '→ KLANT'}
                </span>
              </div>

              <p className="text-xs text-dark/60 font-body leading-relaxed">
                {isEn 
                  ? 'Upload per version: perspectives (label per image), optional evening render, and a mandatory revision note — that text appears literally in the customer portal and email notification.' 
                  : 'Upload per versie: aanzichten (label per beeld), optioneel avondrender, en een verplichte wijzigingsregel — die tekst komt letterlijk in het klantportaal en in de notificatie.'}
              </p>

              {/* Version Render List matching Screenshot 2 exactly */}
              <div className="space-y-4">
                
                {/* VERSIE 2 · ACTUEEL */}
                <div className="flex items-start justify-between gap-4 border-b border-[#E6E1D7] pb-5">
                  <div className="flex items-start gap-4 min-w-0">
                    {/* Wood Vertical Slats Thumbnail matching Screenshot 2 */}
                    <div className="w-24 h-20 rounded-xl overflow-hidden shadow-2xs border border-[#D6CFC2] flex-shrink-0 bg-[#A68252] relative flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 100 80" preserveAspectRatio="none">
                        <line x1="16" y1="0" x2="16" y2="80" stroke="#8C6A3C" strokeWidth="2" />
                        <line x1="32" y1="0" x2="32" y2="80" stroke="#8C6A3C" strokeWidth="2" />
                        <line x1="48" y1="0" x2="48" y2="80" stroke="#8C6A3C" strokeWidth="2" />
                        <line x1="64" y1="0" x2="64" y2="80" stroke="#8C6A3C" strokeWidth="2" />
                        <line x1="80" y1="0" x2="80" y2="80" stroke="#8C6A3C" strokeWidth="2" />
                      </svg>
                    </div>

                    <div className="space-y-1 min-w-0 pt-0.5">
                      <h4 className="font-bold text-[#2A2925] text-base font-sans tracking-tight">
                        {renderVersions[0]?.version || (isEn ? 'Version 2 · current' : 'Versie 2 · actueel')}
                      </h4>
                      <p className="text-xs text-dark/70 font-body leading-relaxed">
                        {renderVersions[0]?.description}
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 bg-[#E3EFE3] text-[#2D6A2D] rounded-full text-xs font-bold font-sans flex items-center gap-1 flex-shrink-0">
                    ✓ Live
                  </span>
                </div>

                {/* VERSIE 1 */}
                <div className="flex items-start justify-between gap-4 pt-1 pb-1">
                  <div className="flex items-start gap-4 min-w-0">
                    {/* Light Wood Slats Thumbnail matching Screenshot 2 */}
                    <div className="w-24 h-20 rounded-xl overflow-hidden shadow-2xs border border-[#D6CFC2] flex-shrink-0 bg-[#D8CBBA] relative flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 100 80" preserveAspectRatio="none">
                        <line x1="16" y1="0" x2="16" y2="80" stroke="#BFB09D" strokeWidth="2" />
                        <line x1="32" y1="0" x2="32" y2="80" stroke="#BFB09D" strokeWidth="2" />
                        <line x1="48" y1="0" x2="48" y2="80" stroke="#BFB09D" strokeWidth="2" />
                        <line x1="64" y1="0" x2="64" y2="80" stroke="#BFB09D" strokeWidth="2" />
                        <line x1="80" y1="0" x2="80" y2="80" stroke="#BFB09D" strokeWidth="2" />
                      </svg>
                    </div>

                    <div className="space-y-1 min-w-0 pt-0.5">
                      <h4 className="font-bold text-[#2A2925] text-base font-sans tracking-tight">
                        {isEn ? 'Version 1' : 'Versie 1'}
                      </h4>
                      <p className="text-xs text-dark/60 font-body">
                        {isEn ? 'Aug 6 · remains inspectable for customer (dimmed)' : '6 aug · blijft bekijkbaar voor de klant (gedimd)'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setPreviewRenderModal({ version: isEn ? 'Version 1' : 'Versie 1' })}
                    className="px-4 py-2 bg-white hover:bg-[#FAF8F5] text-dark/80 border border-[#D6CFC2] rounded-xl text-xs font-bold transition-all shadow-2xs flex-shrink-0 cursor-pointer"
                  >
                    {isEn ? 'View' : 'Bekijken'}
                  </button>
                </div>

              </div>

              {/* Bottom Upload Button & Subtext matching Screenshot 2 */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-3 border-t border-[#E6E1D7]">
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="px-5 py-2.5 bg-[#33422C] hover:bg-[#283523] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 self-start"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isEn ? 'Upload New Version' : 'Nieuwe versie uploaden'}</span>
                </button>
                <span className="text-xs text-dark/60 font-body">
                  {isEn ? 'Cannot publish without mandatory revision note.' : 'Zonder wijzigingsregel kan er niet gepubliceerd worden.'}
                </span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: 5 COLUMNS (RIGHT RAIL matching Screenshot 2) */}
          <div className="lg:col-span-5">
            {renderRightRail()}
          </div>

        </div>
      )}

      {/* BETALINGEN TAB (Chapter 10 Acceptance Test: Handover Gate & Bookkeeping Mirror) */}
      {activeTab === (isEn ? 'Payments (40/40/20 Scheme)' : 'Betalingen (3 termijnen)') && (
        <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6E1D7] pb-3">
            <div>
              <h3 className="font-serif font-bold text-base text-[#33422C]">
                {isEn ? 'Payment Schedule (40% / 40% / 20% Scheme)' : 'Betalingsschema (40% / 40% / 20%)'}
              </h3>
              <p className="text-xs text-dark/60 mt-0.5">
                {isEn ? 'Total project price: € 37,950.00 incl. VAT · Source: Bookkeeping (Read-Only Mirror)' : 'Totaal projectbedrag: € 37.950,00 incl. btw · Bron: Boekhouding (Alleen-lezen)'}
              </p>
            </div>
            <span className="px-2.5 py-1 bg-[#E3EFE3] text-[#2D6A2D] rounded-md font-mono text-[10px] font-bold">
              {isEn ? '→ READ-ONLY BOOKKEEPING MIRROR' : '→ ALLEEN-LEZEN BOEKHOUDING'}
            </span>
          </div>

          {/* 3 INSTALLMENTS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Installment 1 */}
            <div className="p-4 bg-white border border-[#D6CFC2] rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-dark/50 uppercase">
                {isEn ? 'Installment 1 (40% Deposit)' : 'Termijn 1 (40% Aanbetaling)'}
              </span>
              <p className="font-bold text-emerald-800 text-sm">
                € 15,180.00 — {isEn ? '✓ Paid (Aug 3)' : '✓ Betaald (3 aug)'}
              </p>
              <div className="text-[11px] text-dark/60 flex items-center gap-1">
                <span>📅 {isEn ? 'Sent: Aug 3, 2026 · Reconciled' : 'Verzonden: 3 aug 2026 · Afgestemd'}</span>
              </div>
            </div>

            {/* Installment 2 */}
            <div className="p-4 bg-white border border-[#D6CFC2] rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-dark/50 uppercase">
                {isEn ? 'Installment 2 (40% Start Construction)' : 'Termijn 2 (40% Start Bouw)'}
              </span>
              <p className="font-bold text-emerald-800 text-sm">
                € 15,180.00 — {isEn ? '✓ Paid (Aug 18)' : '✓ Betaald (18 aug)'}
              </p>
              <div className="text-[11px] text-dark/60 flex items-center gap-1">
                <span>📅 {isEn ? 'Sent: Aug 18, 2026 · Reconciled' : 'Verzonden: 18 aug 2026 · Afgestemd'}</span>
              </div>
            </div>

            {/* Installment 3 (Gated by Handover) */}
            <div className={`p-4 rounded-xl space-y-2 border transition-all ${
              invoice20Generated
                ? 'bg-emerald-50/50 border-emerald-300'
                : handoverConfirmed
                  ? 'bg-white border-amber-300'
                  : 'bg-[#FAF8F5] border-[#D6CFC2]'
            }`}>
              <span className="text-[10px] font-bold text-dark/50 uppercase">
                {isEn ? 'Installment 3 (20% Final Handover)' : 'Termijn 3 (20% Oplevering)'}
              </span>
              <p className={`font-bold text-sm ${invoice20Generated ? 'text-emerald-800' : 'text-[#33422C]'}`}>
                € 7,590.00 {invoice20Generated ? '— ✓ Invoiced (#INV-2026-089)' : handoverConfirmed ? '— 🔓 Ready to Invoice' : '— 🔒 Locked'}
              </p>
              <div className={`p-1.5 rounded-lg text-[10px] font-bold ${
                invoice20Generated
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                  : handoverConfirmed
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-[#FDF8EE] text-[#B86B14] border border-[#F6DCB8]'
              }`}>
                {invoice20Generated
                  ? '✓ 20% Invoice Generated & Sent to Bookkeeping'
                  : handoverConfirmed
                    ? '🔓 Handover Confirmed — Invoice Creation Permitted'
                    : '🔒 Locked: Customer handover confirmation required first'}
              </div>
            </div>
          </div>

          {/* CHAPTER 10 ACCEPTANCE GATE: HANDOVER SIGN-OFF & 20% INVOICE CONTROLS */}
          <div className="p-5 bg-white border border-[#D6CFC2] rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E1D7] pb-3">
              <div>
                <h4 className="font-bold text-sm text-[#1C1C1A]">
                  {isEn ? 'Garden Room Handover Gate (Acceptance Rule #10)' : 'Opleverpoort Buitenverblijf (Acceptatieregel #10)'}
                </h4>
                <p className="text-xs text-[#555046]">
                  {isEn 
                    ? 'The 20% final invoice can ONLY be created after the customer provides handover confirmation.'
                    : 'De 20% slotfactuur mag PAS worden aangemaakt na opleverbevestiging van de klant.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold font-mono ${
                  handoverConfirmed
                    ? 'bg-[#E3EFE3] text-[#1E561E] border border-[#C5E1C5]'
                    : 'bg-[#FDF2E3] text-[#9E5507] border border-[#F6DCB8]'
                }`}>
                  {handoverConfirmed ? '✓ Handover Confirmed' : '⚠️ Handover Pending'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={handoverConfirmed}
                  onChange={(e) => {
                    const next = e.target.checked;
                    setHandoverConfirmed(next);
                    if (next) {
                      const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const newLog = {
                        id: Date.now(),
                        date: `Today ${timeNow}`,
                        text: 'Customer confirmed handover inspection (Oplevering) — Sander de Vries'
                      };
                      setLogbook([newLog, ...logbook]);
                      showToast('✓ Handover confirmed by customer! 20% invoice creation is now UNLOCKED.');
                    } else {
                      setInvoice20Generated(false);
                      showToast('Handover status reset to pending.');
                    }
                  }}
                  className="w-5 h-5 rounded text-[#283523] focus:ring-[#283523] border-[#D6CFC2] cursor-pointer"
                />
                <span className="text-xs font-semibold text-[#1C1C1A]">
                  {isEn 
                    ? 'Customer Handover Sign-off Received (Sander de Vries signed delivery inspection checklist)'
                    : 'Opleverbevestiging klant ontvangen (Sander de Vries heeft oplevering goedgekeurd)'}
                </span>
              </label>

              <div>
                {!invoice20Generated ? (
                  <button
                    type="button"
                    disabled={!handoverConfirmed}
                    onClick={() => {
                      if (!handoverConfirmed) return;
                      setInvoice20Generated(true);
                      const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const newLog = {
                        id: Date.now(),
                        date: `Today ${timeNow}`,
                        text: '20% Final Invoice #INV-2026-089 created (€ 7,590.00) & mirrored in bookkeeping — System'
                      };
                      setLogbook([newLog, ...logbook]);
                      showToast('✓ 20% Final Invoice (€ 7,590.00) created & pushed to Bookkeeping!');
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      handoverConfirmed
                        ? 'bg-[#283523] hover:bg-[#1E291B] text-white shadow-md cursor-pointer'
                        : 'bg-[#EDE8DF] text-[#8C867A] border border-[#D6CFC2] cursor-not-allowed'
                    }`}
                  >
                    <span>{handoverConfirmed ? '⚡' : '🔒'}</span>
                    <span>{isEn ? 'Create 20% Final Invoice (€ 7,590.00)' : '20% Slotfactuur Aanmaken (€ 7.590,00)'}</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-300">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>{isEn ? 'Invoice #INV-2026-089 Active in Bookkeeping' : 'Factuur #INV-2026-089 Actief in Boekhouding'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* READ-ONLY BOOKKEEPING RECONCILIATION NOTICE */}
          <div className="p-4 bg-[#EDE8DF]/60 rounded-xl border border-[#D6CFC2] text-xs text-[#4F4B44] flex items-start gap-3">
            <span className="text-base mt-0.5">ℹ️</span>
            <div className="space-y-1">
              <p className="font-bold text-[#1C1C1A]">
                {isEn ? 'Automated Bookkeeping Mirror Rule (Acceptance Criteria #10):' : 'Automatische Boekhouding Mirror Regel (Acceptatieregel #10):'}
              </p>
              <p className="leading-relaxed">
                {isEn
                  ? 'Payment statuses are read-only mirrors of bank feeds. The portal never allows manual "Paid" overrides without verified bank transaction reconciliation.'
                  : 'Betalingsstatussen zijn alleen-lezen spiegels van bankafschriften. Het portaal staat nooit handmatige "Betaald"-wijzigingen toe zonder geverifieerde bankafstemming.'}
              </p>
            </div>
          </div>

        </div>
      )}

      {/* FLOATING PROJECTCHAT WIDGET BUTTON matching Screenshot 2 */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-[#33422C] hover:bg-[#283523] text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 cursor-pointer font-medium text-xs border border-white/20 transition-all transform hover:scale-105"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>💬 {isEn ? 'Project Chat' : 'Projectchat'}</span>
        <span className="px-1.5 py-0.2 bg-amber-500 text-white font-mono text-[10px] font-bold rounded-full">
          3
        </span>
      </button>

      {/* UPLOAD NIEUWE RENDERVERSIE MODAL */}
      <AnimatePresence>
        {uploadModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-[#D6CFC2]"
            >
              <div className="flex items-center justify-between border-b border-[#D6CFC2] pb-3">
                <h3 className="font-serif font-bold text-base text-[#33422C]">
                  {isEn ? 'Upload New 3D Render Version' : 'Nieuwe Renderversie Uploaden'}
                </h3>
                <button onClick={() => setUploadModalOpen(false)} className="text-dark/40 hover:text-dark cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUploadNewRenderVersion} className="space-y-4 text-xs font-body">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-dark/60 uppercase mb-1">
                    {isEn ? 'Mandatory Revision Note *' : 'Verplichte Wijzigingsregel *'}
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newVersionNotes}
                    onChange={(e) => setNewVersionNotes(e.target.value)}
                    placeholder={isEn ? 'e.g. "Sliding glass doors to south side, roof overhang +40 cm based on afternoon sun."' : 'b.v. "Schuifpui naar zuidzijde, overstek +40 cm — n.a.v. jouw opmerking..."'}
                    className="w-full p-3 bg-[#FAF8F5] border border-[#D6CFC2] rounded-xl text-xs text-dark focus:ring-2 focus:ring-[#33422C]/20"
                  />
                  <p className="text-[10px] text-dark/50 mt-1 italic">
                    {isEn ? 'This text appears literally in the customer portal and in the email notification.' : 'Deze tekst komt letterlijk in het klantportaal en in de notificatie per e-mail.'}
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#D6CFC2]">
                  <button
                    type="button"
                    onClick={() => setUploadModalOpen(false)}
                    className="px-4 py-2 bg-white border border-[#D6CFC2] text-dark/70 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    {isEn ? 'Cancel' : 'Annuleren'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#33422C] text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    {isEn ? 'Publish to Customer' : 'Publiceren naar Klant'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PROJECT CHAT DRAWER MODAL */}
      <ProjectChatDrawer
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        projectCode="2026-021"
        clientName="Sander"
        partnerName="Lars"
        onShowToast={showToast}
      />

      {/* NEW PROJECT MODAL */}
      <AnimatePresence>
        {newProjectModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-[#D6CFC2]"
            >
              <div className="flex items-center justify-between border-b border-[#D6CFC2] pb-3">
                <h3 className="font-serif font-bold text-base text-[#33422C]">
                  {isEn ? 'Create New Garden Room Project' : 'Nieuw Buitenverblijf Project Aanmaken'}
                </h3>
                <button onClick={() => setNewProjectModal(false)} className="text-dark/40 hover:text-dark cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateNewProject} className="space-y-4 text-xs font-body">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-dark/60 uppercase mb-1">
                    {isEn ? 'Customer Name *' : 'Klantnaam *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isEn ? "e.g. Sander de Vries" : "b.v. Sander de Vries"}
                    value={newProjectClient}
                    onChange={(e) => setNewProjectClient(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D6CFC2] rounded-xl text-xs text-dark focus:ring-2 focus:ring-[#33422C]/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-dark/60 uppercase mb-1">
                      {isEn ? 'Project Type' : 'Project Type'}
                    </label>
                    <select
                      value={newProjectType}
                      onChange={(e) => setNewProjectType(e.target.value)}
                      className="w-full p-2.5 bg-[#FAF8F5] border border-[#D6CFC2] rounded-xl text-xs text-dark focus:ring-2 focus:ring-[#33422C]/20 cursor-pointer"
                    >
                      <option value="Garden Room">{isEn ? 'Garden Room' : 'Buitenverblijf'}</option>
                      <option value="Canopy with Poolhouse">{isEn ? 'Canopy with Poolhouse' : 'Overkapping met poolhouse'}</option>
                      <option value="Outdoor Kitchen">{isEn ? 'Outdoor Kitchen' : 'Buitenkeuken'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold text-dark/60 uppercase mb-1">
                      {isEn ? 'Budget / Quote Amount' : 'Budget / Offertebedrag'}
                    </label>
                    <input
                      type="text"
                      value={newProjectBudget}
                      onChange={(e) => setNewProjectBudget(e.target.value)}
                      className="w-full p-2.5 bg-[#FAF8F5] border border-[#D6CFC2] rounded-xl text-xs text-dark focus:ring-2 focus:ring-[#33422C]/20"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#D6CFC2]">
                  <button
                    type="button"
                    onClick={() => setNewProjectModal(false)}
                    className="px-4 py-2 bg-white border border-[#D6CFC2] text-dark/70 rounded-xl text-xs font-bold hover:bg-[#FAF8F5] cursor-pointer"
                  >
                    {isEn ? 'Cancel' : 'Annuleren'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#33422C] text-white rounded-xl text-xs font-bold hover:bg-[#283523] cursor-pointer"
                  >
                    {isEn ? 'Create Project' : 'Project Aanmaken'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PHASE UPDATE MODAL */}
      <AnimatePresence>
        {phaseModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#D6CFC2]"
            >
              <div className="flex items-center justify-between border-b border-[#D6CFC2] pb-3">
                <h3 className="font-serif font-bold text-base text-[#33422C]">
                  {isEn ? 'Update Project Phase' : 'Projectfase Bijwerken'}
                </h3>
                <button onClick={() => setPhaseModal(false)} className="text-dark/40 hover:text-dark cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmPhaseUpdate} className="space-y-4 text-xs font-body">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-dark/60 uppercase mb-1.5">
                    {isEn ? 'Current Phase' : 'Huidige Fase'}
                  </label>
                  <div className="px-3 py-2 bg-[#F4F1EA] rounded-xl text-xs font-bold text-[#33422C]">
                    {activeStep}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-dark/60 uppercase mb-1.5">
                    {isEn ? 'Select New Phase *' : 'Selecteer Nieuwe Fase *'}
                  </label>
                  <select
                    value={selectedNewPhase}
                    onChange={(e) => setSelectedNewPhase(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D6CFC2] rounded-xl text-xs font-bold text-dark focus:ring-2 focus:ring-[#33422C]/20 cursor-pointer"
                  >
                    {stepsList.map((st) => (
                      <option key={st.key} value={st.key}>
                        {st.name} {st.key === activeStep ? (isEn ? '(Current)' : '(Huidig)') : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E6E1D7] text-[11px] text-dark/70 space-y-1">
                  <p className="font-semibold text-[#33422C]">{isEn ? 'Automated actions on phase change:' : 'Automatische acties bij faseovergang:'}</p>
                  <p>• {isEn ? 'Notification sent immediately to customer and partner portal.' : 'Notificatie wordt direct verzonden naar klantportaal en partner.'}</p>
                  <p>• {isEn ? 'Progress timeline synchronizes in real time across portals.' : 'Voortgangsbalk wordt gesynchroniseerd in beide portalen.'}</p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#D6CFC2]">
                  <button
                    type="button"
                    onClick={() => setPhaseModal(false)}
                    className="px-4 py-2 bg-white border border-[#D6CFC2] text-dark/70 rounded-xl text-xs font-bold hover:bg-[#FAF8F5] cursor-pointer"
                  >
                    {isEn ? 'Cancel' : 'Annuleren'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#33422C] text-white rounded-xl text-xs font-bold hover:bg-[#283523] cursor-pointer"
                  >
                    {isEn ? 'Confirm Phase' : 'Fase Bevestigen'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
