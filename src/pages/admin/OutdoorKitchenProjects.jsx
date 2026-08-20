import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, MessageCircle, ExternalLink, Calendar, 
  Send, FileText, Camera, Shield, Check, Clock, ChevronRight,
  X, Phone, MessageSquare, Download, AlertCircle, Info, User, Wrench, Building
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OutdoorKitchenProjects() {
  const navigate = useNavigate();

  // State matching Screenshot 2 & sub-tab toggles
  const [activeStep, setActiveStep] = useState('In de werkplaats');
  const [activeTab, setActiveTab] = useState('Status & teksten');
  const [subToggle, setSubToggle] = useState('Berichten');
  const [toastMsg, setToastMsg] = useState('');

  // Editable fields with exact text from Screenshot 2
  const [watErNuGebeurt, setWatErNuGebeurt] = useState(
    'Het frame van Thermo Fraké staat en de kastjes zijn gemonteerd. Deze week wordt het bovenblad afgewerkt en de uitsparing voor je Big Green Egg uitgezaagd.'
  );

  const [watErHiernaKomt, setWatErHiernaKomt] = useState(
    'Eindcontrole door Tim & Bram (rond 10 september). Daarna bellen we je voor een tijdvak voor de levering.'
  );

  const [leverweek, setLeverweek] = useState('Week 38 - 14 t/m 18 september');
  const [leverStatus, setLeverStatus] = useState('Op schema');
  const [interneNotities, setInterneNotities] = useState(
    'Klant twijfelde over wasbak-positie — 15 cm naar links verplaatst (zie berichten 17/8). Partij hout mooi egaal.'
  );

  const [lastUpdated, setLastUpdated] = useState('vandaag 09:05 door Bram');

  // Modals & Chat Drawer State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'Sander de Vries', role: 'klant', text: 'Hoi Tim, is de uitsparing voor de Big Green Egg al ingezaagd?', time: '09:30' },
    { id: 2, sender: 'Tim (Admin)', role: 'admin', text: 'Ja zeker Sander! Het werkblad is gisteren strak uitgesneden en gepolijst.', time: '09:45' },
    { id: 3, sender: 'Sander de Vries', role: 'klant', text: 'Super dankjewel! Wanneer verwachten jullie de levering precies?', time: '10:05' }
  ]);
  const [inputChatMsg, setInputChatMsg] = useState('');
  const [customerPortalModal, setCustomerPortalModal] = useState(false);

  // Logbook entries matching Screenshot 2
  const [logbook, setLogbook] = useState([
    { id: 1, date: 'vandaag 10:05', text: 'Bericht aan klant beantwoord (wasbak 15 cm naar links) — Tim' },
    { id: 2, date: 'vandaag 09:05', text: 'Statustekst bijgewerkt — Bram' },
    { id: 3, date: '17 aug', text: '2 foto\'s gepubliceerd (bron: partner) — Bram' },
    { id: 4, date: '15 aug', text: 'Leveringsvoorstel di 15 sep verstuurd — Tim' },
    { id: 5, date: '14 aug', text: 'Fase → In de werkplaats · klant genotificeerd — systeem' }
  ]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleOpslaanEnPubliceren = (e) => {
    e.preventDefault();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastUpdated(`vandaag ${timeNow} door Admin`);
    
    const newLog = {
      id: Date.now(),
      date: `vandaag ${timeNow}`,
      text: 'Statustekst bijgewerkt & gepubliceerd naar klantportaal — Admin'
    };
    setLogbook([newLog, ...logbook]);
    showToast('✓ Statusteksten opgeslagen en direct gepubliceerd naar het klantoverzicht!');
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
    { name: 'In de werkplaats', key: 'In de werkplaats' },
    { name: 'Klaar voor levering', key: 'Klaar voor levering' },
    { name: 'Geleverd', key: 'Geleverd' },
    { name: 'Nazorg', key: 'Nazorg' }
  ];

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

      {/* TOP PORTAL BREADCRUMB BAR matching Screenshot 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-b border-[#D6CFC2]/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#33422C] font-serif text-sm">Projectenbeheer</span>
          <span className="text-dark/40">·</span>
          <span className="text-dark/60 font-mono text-[11px]">adminportaal</span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/admin/projects/inbox-messages')}
            className="px-3 py-1 bg-white border border-[#D6CFC2] text-dark/70 rounded-xl font-bold text-xs shadow-2xs hover:bg-[#FAF8F5] cursor-pointer"
          >
            Inbox <strong className="text-[#33422C]">4</strong>
          </button>
          <span className="px-3 py-1 bg-[#FDF2E3] text-[#B86B14] border border-[#F6DCB8] rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            3 taken wachten op ons
          </span>
          <button 
            onClick={() => showToast('Nieuw project formulier geopend')}
            className="px-4 py-1.5 bg-[#33422C] hover:bg-[#283523] text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs transition-all"
          >
            + Nieuw project
          </button>
        </div>
      </div>

      {/* TOP HEADER SECTION matching Screenshot 2 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono font-bold text-dark/50 uppercase tracking-widest block">
            PROJECT 2026-014 — BUITENKEUKEN
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#33422C] mt-0.5">
            Sander de Vries — Thermo Fraké 240 cm
          </h1>
          <p className="text-xs sm:text-sm text-dark/70 font-body mt-1">
            Oisterwijk · offerte OF-2026325 · akkoord 11 aug · € 3.920,00 incl. btw
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
            onClick={() => showToast('Fase bijgewerkt naar de volgende stap!')}
            className="px-5 py-2.5 bg-[#33422C] hover:bg-[#283523] text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            Fase bijwerken
          </button>
        </div>
      </div>

      {/* STEPPER BAR CARD matching Screenshot 2 */}
      <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Phase Stepper Pills */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {stepsList.map((step) => {
              const isActive = activeStep === step.key;
              return (
                <button
                  key={step.key}
                  onClick={() => setActiveStep(step.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-[#5A5038] text-white shadow-xs' 
                      : 'bg-[#EDE8DF]/60 text-dark/70 hover:bg-[#EDE8DF]'
                  }`}
                >
                  {step.name}
                </button>
              );
            })}
          </div>

          {/* Right Badges */}
          <div className="flex items-center gap-2 text-[10px] font-bold font-mono">
            <span className="px-2.5 py-1 bg-[#E3EFE3] text-[#2D6A2D] rounded-lg border border-[#C5E1C5]">
              → KLANT
            </span>
            <span className="px-2.5 py-1 bg-[#FDF2E3] text-[#B86B14] rounded-lg border border-[#F6DCB8]">
              → PARTNER
            </span>
          </div>
        </div>

        <p className="text-xs text-dark/60 font-body leading-relaxed border-t border-[#E6E1D7]/60 pt-2.5">
          Fase wijzigen stuurt automatisch één notificatie naar de klant en werkt de fasebalk in beide portalen bij. Terugzetten kan alleen met een reden (komt in het logboek).
        </p>
      </div>

      {/* PRIMARY TABS BAR */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-8 border-b border-[#D6CFC2]/70 pb-0.5 overflow-x-auto no-scrollbar">
          {[
            'Status & teksten',
            'Klantacties',
            'Levering',
            'Media & documenten',
            'Betalingen'
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
                    layoutId="activeTabIndicator" 
                    className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#9B7C47]" 
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Sub-toggle row under active tab */}
        {activeTab === 'Status & teksten' && (
          <div className="flex items-center gap-6 text-xs pt-0.5 border-b border-[#D6CFC2]/50 pb-2">
            <button 
              onClick={() => setSubToggle('Berichten')}
              className={`font-body transition-colors cursor-pointer text-xs focus:outline-none ${
                subToggle === 'Berichten' 
                  ? 'text-[#33422C] font-bold underline underline-offset-4 decoration-[#9B7C47]' 
                  : 'text-[#857C70] hover:text-[#33422C] font-medium'
              }`}
            >
              Berichten
            </button>
            <button 
              onClick={() => setSubToggle('Partner')}
              className={`font-body transition-colors cursor-pointer text-xs focus:outline-none ${
                subToggle === 'Partner' 
                  ? 'text-[#33422C] font-bold underline underline-offset-4 decoration-[#9B7C47]' 
                  : 'text-[#857C70] hover:text-[#33422C] font-medium'
              }`}
            >
              Partner
            </button>
          </div>
        )}
      </div>

      {/* TAB CONTENT: STATUS & TEKSTEN */}
      {activeTab === 'Status & teksten' && (
        <>
          {subToggle === 'Berichten' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: 7 COLUMNS */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* CARD 1: Statusteksten op het klantoverzicht */}
                <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-base text-[#33422C]">
                      Statusteksten op het klantoverzicht
                    </h3>
                    <span className="px-2.5 py-0.5 bg-[#E3EFE3] text-[#2D6A2D] rounded-md font-mono text-[10px] font-bold">
                      → KLANT
                    </span>
                  </div>

                  <p className="text-xs text-dark/60 font-body leading-relaxed">
                    Deze twee velden vullen de statuskaart van de klant. Kort en concreet, alsof je het zelf appt. Verplicht bij elke faseovergang; tussentijds bijwerken mag altijd.
                  </p>

                  <form onSubmit={handleOpslaanEnPubliceren} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-dark/60 uppercase tracking-wider mb-1.5">
                        WAT ER NU GEBEURT
                      </label>
                      <textarea
                        rows={3}
                        value={watErNuGebeurt}
                        onChange={(e) => setWatErNuGebeurt(e.target.value)}
                        className="w-full p-3 bg-white border border-[#D6CFC2] rounded-xl text-xs font-body text-[#4A4A43] focus:outline-none focus:ring-2 focus:ring-[#33422C]/20 leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-dark/60 uppercase tracking-wider mb-1.5">
                        WAT ER HIERNA KOMT
                      </label>
                      <textarea
                        rows={2}
                        value={watErHiernaKomt}
                        onChange={(e) => setWatErHiernaKomt(e.target.value)}
                        className="w-full p-3 bg-white border border-[#D6CFC2] rounded-xl text-xs font-body text-[#4A4A43] focus:outline-none focus:ring-2 focus:ring-[#33422C]/20 leading-relaxed"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#33422C] hover:bg-[#283523] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer self-start"
                      >
                        Opslaan & publiceren
                      </button>

                      <span className="text-[10px] text-dark/50 font-body">
                        Laatst bijgewerkt: {lastUpdated}
                      </span>
                    </div>
                  </form>
                </div>

                {/* CARD 2: Verwachte levering */}
                <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-base text-[#33422C]">
                      Verwachte levering
                    </h3>
                    <span className="px-2.5 py-0.5 bg-[#E3EFE3] text-[#2D6A2D] rounded-md font-mono text-[10px] font-bold">
                      → KLANT
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-dark/60 uppercase tracking-wider mb-1.5">
                        LEVERWEEK
                      </label>
                      <select
                        value={leverweek}
                        onChange={(e) => setLeverweek(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs font-body text-[#4A4A43] focus:outline-none focus:ring-2 focus:ring-[#33422C]/20 cursor-pointer"
                      >
                        <option value="Week 38 - 14 t/m 18 september">Week 38 - 14 t/m 18 september</option>
                        <option value="Week 39 - 21 t/m 25 september">Week 39 - 21 t/m 25 september</option>
                        <option value="Week 40 - 28 sep t/m 2 oktober">Week 40 - 28 sep t/m 2 oktober</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-dark/60 uppercase tracking-wider mb-1.5">
                        STATUS
                      </label>
                      <select
                        value={leverStatus}
                        onChange={(e) => setLeverStatus(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs font-body text-[#4A4A43] focus:outline-none focus:ring-2 focus:ring-[#33422C]/20 cursor-pointer"
                      >
                        <option value="Op schema">Op schema</option>
                        <option value="Vertraagd">Vertraagd</option>
                        <option value="Gereed voor levering">Gereed voor levering</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1 border-t border-[#E6E1D7]/60">
                    <p className="text-xs text-dark/60 font-body leading-relaxed">
                      Bij "Vertraagd" zijn reden + nieuwe week verplicht; de klant krijgt automatisch de vertragingsmelding in de vaste toon. De leverweek voedt óók de partnerplanning.
                    </p>
                    <span className="px-2 py-0.5 bg-[#FDF2E3] text-[#B86B14] rounded-md font-mono text-[9px] font-bold inline-block">
                      → PARTNER
                    </span>
                  </div>
                </div>

                {/* CARD 3: Interne notities */}
                <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-base text-[#33422C]">
                      Interne notities
                    </h3>
                    <span className="px-2.5 py-0.5 bg-[#EAE7DF] text-[#55554E] rounded-md font-mono text-[10px] font-bold">
                      INTERN
                    </span>
                  </div>

                  <textarea
                    rows={2}
                    value={interneNotities}
                    onChange={(e) => setInterneNotities(e.target.value)}
                    className="w-full p-3 bg-white border border-[#D6CFC2] rounded-xl text-xs font-body text-[#4A4A43] focus:outline-none focus:ring-2 focus:ring-[#33422C]/20 leading-relaxed"
                  />

                  <p className="text-[10px] text-dark/50 italic font-body">
                    Nooit zichtbaar voor klant of partner.
                  </p>
                </div>

              </div>

              {/* RIGHT COLUMN: 5 COLUMNS */}
              <div className="lg:col-span-5 space-y-6">
                
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
                        <strong className="font-bold text-[#2A2925]">In de werkplaats</strong>
                        <span className="text-dark/40 font-normal">·</span>
                        <span className="text-dark/70 font-medium">levering week 38</span>
                      </div>
                    </div>

                    <div className="w-full bg-[#EDE8DF] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#5A5038] h-full rounded-full w-[65%]" />
                    </div>

                    <div className="px-3 py-1 bg-[#FDF2E3] border border-[#F6DCB8] text-[#B86B14] rounded-xl text-[10px] font-bold inline-block">
                      • 1 actie open: leveringsvoorstel
                    </div>
                  </div>

                  <p className="text-[10px] text-dark/50 font-body leading-relaxed">
                    Ververst bij elke wijziging hier. Knop "bekijken als klant" opent het echte portaal in leesmodus.
                  </p>
                </div>

                {/* CARD 2: PARTNER — HOEK BOUW */}
                <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-5 shadow-2xs space-y-3">
                  <span className="text-[10px] font-mono font-bold text-dark/50 uppercase tracking-wider block">
                    PARTNER · HOEK BOUW
                  </span>

                  <div className="space-y-1.5">
                    <h4 className="font-sans text-xs sm:text-sm font-bold text-[#2A2925] flex items-center gap-1 flex-wrap">
                      <span className="font-bold text-[#2A2925]">Sven Hoek</span>
                      <span className="text-dark/40 font-normal">·</span>
                      <span className="px-2 py-0.5 bg-[#E3EFE3] text-[#2D6A2D] rounded-md text-[10px] font-bold">✔ In productie</span>
                    </h4>
                    <p className="text-[11px] text-dark/60 font-body">
                      Werkbon v3 · laatste foto 17 aug · levering di 15 sep
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href="https://wa.me/31612345678"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 bg-white hover:bg-[#FAF8F5] text-dark/80 border border-[#D6CFC2] rounded-xl text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      WhatsApp partner
                    </a>
                    <button
                      onClick={() => setSubToggle('Partner')}
                      className="px-3.5 py-1.5 bg-white hover:bg-[#FAF8F5] text-dark/80 border border-[#D6CFC2] rounded-xl text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      Trello
                    </button>
                  </div>
                </div>

                {/* CARD 3: LOGBOEK */}
                <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-5 shadow-2xs space-y-3">
                  <span className="text-[10px] font-mono font-bold text-dark/50 uppercase tracking-wider block">
                    LOGBOEK (ALLES MET WIE/WANNEER)
                  </span>

                  <div className="space-y-2.5 text-[11px] font-body">
                    {logbook.map((log) => (
                      <div key={log.id} className="flex items-start gap-2 border-b border-[#E6E1D7]/40 pb-2 last:border-none">
                        <span className="font-mono text-[10px] text-dark/50 whitespace-nowrap min-w-[70px]">
                          {log.date}
                        </span>
                        <span className="text-dark/80 leading-snug">
                          {log.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {subToggle === 'Partner' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E6E1D7] pb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-[#B86B14] uppercase tracking-wider block">
                        PARTNER TOEWIJZING & WERKBON
                      </span>
                      <h3 className="font-serif font-bold text-lg text-[#33422C] mt-0.5">
                        Hoek Bouw — Sven Hoek
                      </h3>
                    </div>
                    <span className="px-3 py-1 bg-[#E3EFE3] text-[#2D6A2D] rounded-full text-xs font-bold">
                      ✔ In productie (Op schema)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-body">
                    <div className="p-4 bg-white border border-[#D6CFC2] rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-dark/50 uppercase">Agreed Build Price (Partner)</span>
                      <p className="text-base font-bold text-[#33422C]">€ 2.800,00 ex. btw</p>
                    </div>

                    <div className="p-4 bg-white border border-[#D6CFC2] rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-dark/50 uppercase">Target Delivery Week</span>
                      <p className="text-base font-bold text-[#33422C]">Week 38 (Di 15 September)</p>
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-[#D6CFC2] rounded-xl space-y-3 text-xs">
                    <h4 className="font-bold text-[#33422C] flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-[#9B7C47]" />
                      <span>Werkbon Details & Specificaties</span>
                    </h4>
                    <ul className="space-y-1.5 text-dark/80 list-disc list-inside">
                      <li>Buitenkeuken opstelling: Thermo Fraké 240 cm met uitsparing Big Green Egg</li>
                      <li>Inclusief RVS scharnieren & magneetsluitingen</li>
                      <li>Kastdeurtjes met blinde montage (v3 werkbon goedgekeurd)</li>
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <a
                        href="https://wa.me/31612345678"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                      >
                        <MessageCircle className="w-4 h-4" /> WhatsApp Sven Hoek
                      </a>
                      <a
                        href="mailto:sven@hoekbouw.nl"
                        className="px-4 py-2 bg-white border border-[#D6CFC2] text-[#33422C] hover:bg-[#FAF8F5] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                      >
                        Email Partner
                      </a>
                    </div>
                    <button
                      onClick={() => showToast('Werkbon v3 PDF gedownload!')}
                      className="px-4 py-2 bg-[#33422C] hover:bg-[#283523] text-white rounded-xl text-xs font-bold"
                    >
                      Download Werkbon PDF
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-6 shadow-2xs space-y-3 text-xs">
                  <h4 className="font-serif font-bold text-sm text-[#33422C]">Partner Contact Info</h4>
                  <div className="space-y-2 text-dark/70">
                    <p><strong>Bedrijf:</strong> Hoek Bouw V.O.F.</p>
                    <p><strong>Contactpersoon:</strong> Sven Hoek</p>
                    <p><strong>Telefoon:</strong> +31 6 12345678</p>
                    <p><strong>Locatie:</strong> Werkplaats Tilburg</p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </>
      )}

      {/* OTHER TABS SIMULATION */}
      {activeTab === 'Klantacties' && (
        <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-6 shadow-2xs space-y-4">
          <h3 className="font-serif font-bold text-base text-[#33422C]">Klantacties & Goedkeuringen</h3>
          <div className="p-4 bg-white border border-[#D6CFC2] rounded-xl space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#33422C]">Offerte OF-2026325 Status:</span>
              <span className="px-2.5 py-0.5 bg-[#E3EFE3] text-[#2D6A2D] rounded font-bold font-mono">Geaccepteerd op 11 aug</span>
            </div>
            <p className="text-dark/70">Klant heeft akkoord gegeven op de Thermo Fraké 240 cm opstelling inclusief Big Green Egg inbouw.</p>
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

      {/* PROJECT CHAT DRAWER MODAL */}
      <AnimatePresence>
        {chatOpen && (
          <div className="fixed inset-0 z-[9999] flex justify-end bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col font-body text-xs"
            >
              <div className="p-4 bg-[#33422C] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold">Projectchat — Sander de Vries</span>
                </div>
                <button onClick={() => setChatOpen(false)} className="text-white/60 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-[#F4F1EA]">
                {chatMessages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex flex-col ${msg.role === 'admin' ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-dark/50 mb-0.5">{msg.sender} · {msg.time}</span>
                    <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                      msg.role === 'admin' 
                        ? 'bg-[#33422C] text-white rounded-tr-xs' 
                        : 'bg-white border border-[#D6CFC2] text-[#4A4A43] rounded-tl-xs'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendChat} className="p-3 border-t border-[#D6CFC2] bg-white flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Typ een bericht..."
                  value={inputChatMsg}
                  onChange={(e) => setInputChatMsg(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#F4F1EA] border border-[#D6CFC2] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#33422C]/20"
                />
                <button 
                  type="submit"
                  className="px-3.5 py-2 bg-[#33422C] text-white font-bold rounded-xl text-xs hover:bg-[#283523] cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                    In de werkplaats · levering week 38
                  </p>
                  
                  <div className="w-full bg-[#EDE8DF] h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#5A5038] h-full rounded-full w-[65%]" />
                  </div>

                  <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E6E1D7] space-y-2 text-xs">
                    <span className="font-bold text-[#33422C] block">WAT ER NU GEBEURT:</span>
                    <p className="text-dark/80 italic">{watErNuGebeurt}</p>
                    <span className="font-bold text-[#33422C] block pt-1">WAT ER HIERNA KOMT:</span>
                    <p className="text-dark/80 italic">{watErHiernaKomt}</p>
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

    </div>
  );
}
