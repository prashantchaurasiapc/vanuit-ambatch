import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, MessageCircle, ExternalLink, Calendar, 
  Send, FileText, Camera, Shield, Check, Clock, ChevronRight,
  X, Phone, MessageSquare, Download, AlertCircle, Info, Lock, User, Wrench, Plus, Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProjectChatDrawer from '../../components/common/ProjectChatDrawer';

export default function GardenRoomProjects() {
  const navigate = useNavigate();

  // State matching Screenshot 2 (Garden Room Project Detail: PROJECT 2026-021)
  const [activeStep, setActiveStep] = useState('Schouw');
  const [activeTab, setActiveTab] = useState('Weekplanning & schouw');
  const [toastMsg, setToastMsg] = useState('');

  // Editable fields for Weekplanning & Schouw
  const [schouwDag, setSchouwDag] = useState('donderdag 27 augustus');
  const [schouwTijd, setSchouwTijd] = useState('rond 10:00');
  const [schouwUitvoerende, setSchouwUitvoerende] = useState('Partner (Timmerwerken Zuid)');

  // Weekplanning rows
  const [planningRows, setPlanningRows] = useState([
    { id: 1, fase: 'Voorbereiding (grondwerk)', week: '39', status: 'Voorlopig', note: 'partner: 1 dag' },
    { id: 2, fase: 'Materialen geleverd', week: '40', status: 'Voorlopig', note: '± 15 m² opslag bij klant' },
    { id: 3, fase: 'De bouw', week: '41-42', status: 'Voorlopig', note: 'oplevering eind wk 42' }
  ]);

  // Render versions state matching Screenshot 2 exactly
  const [renderVersions, setRenderVersions] = useState([
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
    { id: 1, sender: 'Sander de Vries', role: 'klant', text: 'Hoi Tim, is de schouwdatum van donderdag 27 augustus rond 10:00 uur akkoord?', time: '11:00' },
    { id: 2, sender: 'Tim (Admin)', role: 'admin', text: 'Ja zeker Sander! Onze partner Lars (Timmerwerken Zuid) komt dan langs.', time: '11:15' }
  ]);
  const [inputChatMsg, setInputChatMsg] = useState('');
  const [customerPortalModal, setCustomerPortalModal] = useState(false);
  const [previewRenderModal, setPreviewRenderModal] = useState(null);
  const [newProjectModal, setNewProjectModal] = useState(false);
  const [newProjectClient, setNewProjectClient] = useState('');
  const [newProjectType, setNewProjectType] = useState('Buitenverblijf');
  const [newProjectBudget, setNewProjectBudget] = useState('€ 37.950,00');
  const [phaseModal, setPhaseModal] = useState(false);
  const [selectedNewPhase, setSelectedNewPhase] = useState('Schouw');

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

  const stepsList = [
    { name: 'Akkoord & ontwerp', key: 'Akkoord & ontwerp' },
    { name: 'Schouw', key: 'Schouw' },
    { name: 'Voorbereiding', key: 'Voorbereiding' },
    { name: 'Materialen', key: 'Materialen' },
    { name: 'De bouw', key: 'De bouw' },
    { name: 'Oplevering', key: 'Oplevering' },
    { name: 'Nazorg', key: 'Nazorg' }
  ];

  // Shared Right Rail Cards matching Screenshot 2 100% exact
  const renderRightRail = () => (
    <div className="space-y-6">
      
      {/* CARD 1: LIVE — WAT ZIET DE KLANT NU */}
      <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-5 shadow-2xs space-y-3">
        <span className="text-[10px] font-mono font-bold text-dark/50 uppercase tracking-wider block">
          LIVE · WAT ZIET DE KLANT NU
        </span>

        <div className="bg-white border border-dashed border-[#D6CFC2] rounded-2xl p-4 space-y-2.5 shadow-2xs">
          <div>
            <h4 className="font-serif font-bold text-xs text-[#33422C]">
              Hoi Sander
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-dark/80 font-sans mt-0.5">
              <strong className="font-bold text-[#2A2925]">Schouw</strong>
              <span className="text-dark/40 font-normal">·</span>
              <span className="text-dark/70 font-medium">bouwweek 41-42</span>
              <span className="px-2 py-0.5 bg-[#FDF8EE] border border-dashed border-[#E5C9A3] text-[#B86B14] rounded-md text-[9px] font-mono font-bold">
                ◯ voorlopig
              </span>
            </div>
          </div>

          <div className="px-3 py-1 bg-[#FDF2E3] border border-[#F6DCB8] text-[#B86B14] rounded-xl text-[10px] font-bold inline-block">
            • 2 acties: schouwvoorstel · render v2
          </div>
        </div>
      </div>

      {/* CARD 2: PARTNER — TIMMERWERKEN ZUID */}
      <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-5 shadow-2xs space-y-3">
        <span className="text-[10px] font-mono font-bold text-dark/50 uppercase tracking-wider block">
          PARTNER · TIMMERWERKEN ZUID
        </span>

        <div className="space-y-1.5">
          <h4 className="font-sans text-xs sm:text-sm font-bold text-[#2A2925] flex items-center gap-1 flex-wrap">
            <span className="font-bold text-[#2A2925]">Opdracht bevestigd</span>
            <span className="text-dark/40 font-normal">·</span>
            <span className="text-dark/70 font-medium">partnerbedrag € 24.900</span>
          </h4>
          <span className="px-2 py-0.5 bg-[#EAE7DF] text-[#55554E] rounded-md text-[9px] font-bold font-mono inline-block">
            INTERN
          </span>
          <p className="text-[11px] text-dark/50 font-body pt-0.5">
            Wacht op: definitieve planning na schouw · werkbon v1
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
            onClick={() => showToast('Trello bord geopend!')}
            className="px-3.5 py-1.5 bg-white hover:bg-[#FAF8F5] text-dark/80 border border-[#D6CFC2] rounded-xl text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
          >
            Trello
          </button>
        </div>
      </div>

      {/* CARD 3: TAKEN VOOR ONS */}
      <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-5 shadow-2xs space-y-3">
        <span className="text-[10px] font-mono font-bold text-dark/50 uppercase tracking-wider block">
          TAKEN VOOR ONS
        </span>

        <div className="space-y-2.5 text-[11px] font-body">
          <div className="flex items-start gap-3 border-b border-[#E6E1D7]/60 pb-2">
            <span className="font-mono text-[11px] text-dark/40 font-semibold whitespace-nowrap">21 aug</span>
            <span className="text-xs font-bold text-[#2A2925] font-sans">Herinnering schouwvoorstel (automatisch)</span>
          </div>
          <div className="flex items-start gap-3 border-b border-[#E6E1D7]/60 pb-2">
            <span className="font-mono text-[11px] text-dark/40 font-semibold whitespace-nowrap">na schouw</span>
            <span className="text-xs font-bold text-[#2A2925] font-sans">Stelpost elektrapakket definitief maken</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-mono text-[11px] text-dark/40 font-semibold whitespace-nowrap">na schouw</span>
            <span className="text-xs font-bold text-[#2A2925] font-sans">Planning definitief maken + hout bestellen</span>
          </div>
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
            className="fixed top-5 right-5 z-[9999] bg-[#33422C] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-medium"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP PORTAL BREADCRUMB BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pb-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#33422C] font-serif text-sm">Projectenbeheer</span>
          <span className="text-dark/40">·</span>
          <span className="text-dark/60 font-mono text-[11px]">adminportaal</span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              navigate('/admin/projects/inbox-messages');
              showToast('Projectberichten geopend...');
            }}
            className="px-3 py-1 bg-white border border-[#D6CFC2] text-dark/70 rounded-xl font-bold text-xs shadow-2xs hover:bg-[#FAF8F5] cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <span>Inbox</span>
            <strong className="text-[#33422C] bg-[#E3EFE3] px-1.5 py-0.2 rounded font-mono text-[11px]">4</strong>
          </button>

          <button 
            onClick={() => {
              setActiveTab('Weekplanning & schouw');
              showToast('Gefilterd: 3 taken wachten op ons (schouwvoorstel, render v2)');
            }}
            className="px-3 py-1 bg-[#FDF2E3] text-[#B86B14] border border-[#F6DCB8] rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer hover:bg-[#FCEAD0] transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>3 taken wachten op ons</span>
          </button>

          <button 
            onClick={() => setNewProjectModal(true)}
            className="px-4 py-1.5 bg-[#33422C] hover:bg-[#283523] text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs transition-all flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nieuw project</span>
          </button>
        </div>
      </div>

      {/* MAIN HEADER SECTION matching Screenshot 2 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        <div>
          <span className="text-[11px] font-mono font-bold text-dark/50 uppercase tracking-widest block">
            PROJECT 2026-021 — BUITENVERBLIJF
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#33422C] mt-0.5">
            Sander de Vries — Overkapping met poolhouse
          </h1>
          <p className="text-xs sm:text-sm text-dark/70 font-body mt-1">
            Oisterwijk · offerte OF-2026418 · akkoord 3 aug · € 37.950,00 incl. btw · 40/40/20
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setCustomerPortalModal(true)}
            className="px-4 py-2.5 bg-white hover:bg-[#FAF8F5] text-[#33422C] border border-[#D6CFC2] rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Klantportaal bekijken als klant</span>
          </button>

          <button
            onClick={() => {
              setSelectedNewPhase(activeStep);
              setPhaseModal(true);
            }}
            className="px-5 py-2.5 bg-[#33422C] hover:bg-[#283523] text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            Fase bijwerken
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
          {[
            'Weekplanning & schouw',
            'Renders',
            'Betalingen (3 termijnen)'
          ].map((tabName) => {
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
      {activeTab === 'Weekplanning & schouw' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: 7 COLUMNS */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* CARD 1: Weekplanning */}
            <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-[#33422C]">
                  Weekplanning
                </h3>
                <div className="flex items-center gap-2 text-[10px] font-bold font-mono">
                  <span className="px-2.5 py-0.5 bg-[#E3EFE3] text-[#2D6A2D] rounded-md">
                    → KLANT
                  </span>
                  <span className="px-2.5 py-0.5 bg-[#FDF2E3] text-[#B86B14] rounded-md">
                    → PARTNER
                  </span>
                </div>
              </div>

              <p className="text-xs text-dark/60 font-body leading-relaxed">
                Per fase een weeknummer + status. Zolang "voorlopig": overal de gestippelde badge aan klantzijde. Eén knop maakt álles definitief (vereist: schouw afgerond) → klant krijgt één notificatie + .ics per fase, partner krijgt de bouwweken in de werkbon.
              </p>

              {/* Table of Planning Phases */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#D6CFC2] text-[10px] font-mono uppercase text-dark/50 tracking-wider">
                      <th className="pb-2 font-bold">FASE</th>
                      <th className="pb-2 font-bold w-24">WEEK</th>
                      <th className="pb-2 font-bold w-28">STATUS</th>
                      <th className="pb-2 font-bold">NOTE</th>
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
                  Planning definitief maken
                </button>
                <span className="text-[11px] text-dark/50 font-body">
                  Vergrendeld tot de schouw is afgerond.
                </span>
              </div>
            </div>

            {/* CARD 2: Schouwvoorstel */}
            <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-[#33422C]">
                  Schouwvoorstel
                </h3>
                <div className="flex items-center gap-2 text-[10px] font-bold font-mono">
                  <span className="px-2.5 py-0.5 bg-[#E3EFE3] text-[#2D6A2D] rounded-md">
                    → KLANT
                  </span>
                  <span className="px-2.5 py-0.5 bg-[#FDF2E3] text-[#B86B14] rounded-md">
                    → PARTNER
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-dark/60 uppercase tracking-wider mb-1">
                    DAG
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
                    TIJD
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
                    UITVOERENDE
                  </label>
                  <select
                    value={schouwUitvoerende}
                    onChange={(e) => setSchouwUitvoerende(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs font-body font-bold text-[#4A4A43] cursor-pointer"
                  >
                    <option value="Partner (Timmerwerken Zuid)">Partner (Timmerwer...</option>
                    <option value="Eigen team (Tim & Bram)">Eigen team (Tim & Bram)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-[#FDF8EE] border border-[#F6DCB8] text-[#B86B14] rounded-xl text-xs font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>• Wacht op akkoord klant · herinnering gepland 21 aug</span>
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
      {activeTab === 'Renders' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: 7 COLUMNS */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* CARD: Renderversies */}
            <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-[#33422C]">
                  Renderversies
                </h3>
                <span className="px-2.5 py-0.5 bg-[#E3EFE3] text-[#2D6A2D] rounded-md font-mono text-[10px] font-bold">
                  → KLANT
                </span>
              </div>

              <p className="text-xs text-dark/60 font-body leading-relaxed">
                Upload per versie: aanzichten (label per beeld), optioneel avondrender, en een <strong className="font-bold text-dark/90">verplichte wijzigingsregel</strong> — die tekst komt letterlijk in het klantportaal en in de notificatie.
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
                        Versie 2 · actueel
                      </h4>
                      <p className="text-xs text-dark/70 font-body leading-relaxed">
                        4 aanzichten + avond · "Schuifpui naar zuidzijde, overstek +40 cm — n.a.v. jouw opmerking over de middagzon."
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
                        Versie 1
                      </h4>
                      <p className="text-xs text-dark/60 font-body">
                        6 aug · blijft bekijkbaar voor de klant (gedimd)
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setPreviewRenderModal({ version: 'Versie 1' })}
                    className="px-4 py-2 bg-white hover:bg-[#FAF8F5] text-dark/80 border border-[#D6CFC2] rounded-xl text-xs font-bold transition-all shadow-2xs flex-shrink-0 cursor-pointer"
                  >
                    Bekijken
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
                  <span>Nieuwe versie uploaden</span>
                </button>
                <span className="text-xs text-dark/60 font-body">
                  Zonder wijzigingsregel kan er niet gepubliceerd worden.
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

      {/* BETALINGEN TAB */}
      {activeTab === 'Betalingen (3 termijnen)' && (
        <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-6 shadow-2xs space-y-4">
          <h3 className="font-serif font-bold text-base text-[#33422C]">Betalingsschema (40% / 40% / 20%)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-white border border-[#D6CFC2] rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-dark/50 uppercase">Termijn 1 (40%)</span>
              <p className="font-bold text-emerald-800">€ 15.180,00 — Betaald (3 aug)</p>
            </div>
            <div className="p-4 bg-white border border-[#D6CFC2] rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-dark/50 uppercase">Termijn 2 (40%)</span>
              <p className="font-bold text-amber-800">€ 15.180,00 — Voor aanvang bouw</p>
            </div>
            <div className="p-4 bg-white border border-[#D6CFC2] rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-dark/50 uppercase">Termijn 3 (20%)</span>
              <p className="font-bold text-dark/70">€ 7.590,00 — Bij oplevering</p>
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
        <span>💬 Projectchat</span>
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
                  Nieuwe Renderversie Uploaden
                </h3>
                <button onClick={() => setUploadModalOpen(false)} className="text-dark/40 hover:text-dark cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUploadNewRenderVersion} className="space-y-4 text-xs font-body">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-dark/60 uppercase mb-1">
                    Verplichte Wijzigingsregel *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newVersionNotes}
                    onChange={(e) => setNewVersionNotes(e.target.value)}
                    placeholder='b.v. "Schuifpui naar zuidzijde, overstek +40 cm — n.a.v. jouw opmerking..."'
                    className="w-full p-3 bg-[#FAF8F5] border border-[#D6CFC2] rounded-xl text-xs text-dark focus:ring-2 focus:ring-[#33422C]/20"
                  />
                  <p className="text-[10px] text-dark/50 mt-1 italic">
                    Deze tekst komt letterlijk in het klantportaal en in de notificatie per e-mail.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#D6CFC2]">
                  <button
                    type="button"
                    onClick={() => setUploadModalOpen(false)}
                    className="px-4 py-2 bg-white border border-[#D6CFC2] text-dark/70 rounded-xl text-xs font-bold"
                  >
                    Annuleren
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#33422C] text-white rounded-xl text-xs font-bold"
                  >
                    Publiceren naar Klant
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

      {/* KLANTPORTAAL READ-ONLY PREVIEW MODAL */}
      <AnimatePresence>
        {customerPortalModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-[#D6CFC2]"
            >
              <div className="flex items-center justify-between border-b border-[#D6CFC2] pb-3">
                <h3 className="font-serif font-bold text-base text-[#33422C]">
                  Live Klantenportaal Leesmodus — Sander de Vries
                </h3>
                <button onClick={() => setCustomerPortalModal(false)} className="text-dark/40 hover:text-dark cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-[#F4F1EA] p-5 rounded-xl space-y-4">
                <div className="bg-white p-4 rounded-xl border border-[#D6CFC2] space-y-3">
                  <h4 className="font-serif font-bold text-sm text-[#33422C]">
                    Hoi Sander
                  </h4>
                  <p className="text-xs font-bold text-dark/80">
                    Schouw · bouwweek 41-42 ◯ voorlopig
                  </p>
                  <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E6E1D7] text-xs">
                    <span className="font-bold text-[#33422C] block">SCHOUWVOORSTEL:</span>
                    <p className="text-dark/80 italic">donderdag 27 augustus rond 10:00</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setCustomerPortalModal(false)}
                  className="px-4 py-2 bg-[#33422C] text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Sluiten
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                  Nieuw Buitenverblijf Project Aanmaken
                </h3>
                <button onClick={() => setNewProjectModal(false)} className="text-dark/40 hover:text-dark cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateNewProject} className="space-y-4 text-xs font-body">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-dark/60 uppercase mb-1">
                    Klantnaam *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="b.v. Sander de Vries"
                    value={newProjectClient}
                    onChange={(e) => setNewProjectClient(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D6CFC2] rounded-xl text-xs text-dark focus:ring-2 focus:ring-[#33422C]/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-dark/60 uppercase mb-1">
                      Project Type
                    </label>
                    <select
                      value={newProjectType}
                      onChange={(e) => setNewProjectType(e.target.value)}
                      className="w-full p-2.5 bg-[#FAF8F5] border border-[#D6CFC2] rounded-xl text-xs text-dark focus:ring-2 focus:ring-[#33422C]/20 cursor-pointer"
                    >
                      <option value="Buitenverblijf">Buitenverblijf</option>
                      <option value="Overkapping met poolhouse">Overkapping met poolhouse</option>
                      <option value="Buitenkeuken">Buitenkeuken</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold text-dark/60 uppercase mb-1">
                      Budget / Offertebedrag
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
                    Annuleren
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#33422C] text-white rounded-xl text-xs font-bold hover:bg-[#283523] cursor-pointer"
                  >
                    Project Aanmaken
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
                  Projectfase Bijwerken
                </h3>
                <button onClick={() => setPhaseModal(false)} className="text-dark/40 hover:text-dark cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmPhaseUpdate} className="space-y-4 text-xs font-body">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-dark/60 uppercase mb-1.5">
                    Huidige Fase
                  </label>
                  <div className="px-3 py-2 bg-[#F4F1EA] rounded-xl text-xs font-bold text-[#33422C]">
                    {activeStep}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-dark/60 uppercase mb-1.5">
                    Selecteer Nieuwe Fase *
                  </label>
                  <select
                    value={selectedNewPhase}
                    onChange={(e) => setSelectedNewPhase(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D6CFC2] rounded-xl text-xs font-bold text-dark focus:ring-2 focus:ring-[#33422C]/20 cursor-pointer"
                  >
                    {stepsList.map((st) => (
                      <option key={st.key} value={st.key}>
                        {st.name} {st.key === activeStep ? '(Huidig)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E6E1D7] text-[11px] text-dark/70 space-y-1">
                  <p className="font-semibold text-[#33422C]">Automatische acties bij faseovergang:</p>
                  <p>• Notificatie wordt direct verzonden naar klantportaal en partner.</p>
                  <p>• Voortgangsbalk wordt gesynchroniseerd in beide portalen.</p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#D6CFC2]">
                  <button
                    type="button"
                    onClick={() => setPhaseModal(false)}
                    className="px-4 py-2 bg-white border border-[#D6CFC2] text-dark/70 rounded-xl text-xs font-bold hover:bg-[#FAF8F5] cursor-pointer"
                  >
                    Annuleren
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#33422C] text-white rounded-xl text-xs font-bold hover:bg-[#283523] cursor-pointer"
                  >
                    Fase Bevestigen
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
