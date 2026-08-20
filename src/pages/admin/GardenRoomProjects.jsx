import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, MessageCircle, ExternalLink, Calendar, 
  Send, FileText, Camera, Shield, Check, Clock, ChevronRight,
  X, Phone, MessageSquare, Download, AlertCircle, Info, User, Wrench, Building
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GardenRoomProjects() {
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState('In de werkplaats');
  const [activeTab, setActiveTab] = useState('Status & teksten');
  const [subToggle, setSubToggle] = useState('Berichten');
  const [toastMsg, setToastMsg] = useState('');

  const [watErNuGebeurt, setWatErNuGebeurt] = useState(
    'De gebintconstructie van Eikenhout is verzaagd en de glazen schuifwanden zijn op maat besteld. Deze week worden de staanders voorgemonteerd.'
  );

  const [watErHiernaKomt, setWatErHiernaKomt] = useState(
    'Fundering controle op locatie (27 augustus). Daarna montage op locatie in week 39.'
  );

  const [leverweek, setLeverweek] = useState('Week 39 - 21 t/m 25 september');
  const [leverStatus, setLeverStatus] = useState('Op schema');
  const [interneNotities, setInterneNotities] = useState(
    'Schouwafspraak ingepland op 27 augustus. Klant wenst extra geacht geïsoleerd PIR 80mm dak.'
  );

  const [lastUpdated, setLastUpdated] = useState('vandaag 09:15 door Tim');

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'Sander de Vries', role: 'klant', text: 'Hoi Tim, is de schouwafspraak voor donderdag 27 augustus bevestigd?', time: '11:00' },
    { id: 2, sender: 'Tim (Admin)', role: 'admin', text: 'Ja zeker Sander! Onze inmeter komt om 10:00 uur bij je langs.', time: '11:15' }
  ]);
  const [inputChatMsg, setInputChatMsg] = useState('');
  const [customerPortalModal, setCustomerPortalModal] = useState(false);

  const [logbook, setLogbook] = useState([
    { id: 1, date: 'vandaag 11:15', text: 'Schouwafspraak per mail bevestigd — Tim' },
    { id: 2, date: 'vandaag 09:15', text: 'Statustekst bijgewerkt — Tim' },
    { id: 3, date: '18 aug', text: 'Glaswand bestelling geplaatst bij leverancier — Bram' },
    { id: 4, date: '16 aug', text: 'Werkbon v2 Eiken Buitenverblijf goedgekeurd — partner' }
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
    <div className="min-h-screen bg-[#F4F1EA] text-[#4A4A43] font-body p-3 sm:p-6 space-y-5 relative">
      
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

      {/* TOP HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono font-bold text-dark/50 uppercase tracking-widest block">
            PROJECT 2026-021 — BUITENVERBLIJF
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#33422C] mt-0.5">
            Sander de Vries — Luxe Eiken Buitenverblijf 600x400 cm
          </h1>
          <p className="text-xs text-dark/70 font-body mt-1">
            Oisterwijk · offerte OF-2026388 · akkoord 14 aug · € 18.500,00 incl. btw
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setCustomerPortalModal(true)}
            className="px-3.5 py-2 bg-white hover:bg-[#FAF8F5] text-[#33422C] border border-[#D6CFC2] rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Klantportaal bekijken als klant</span>
          </button>

          <button
            onClick={() => showToast('Fase bijgewerkt naar de volgende stap!')}
            className="px-4 py-2 bg-[#33422C] hover:bg-[#283523] text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            Fase bijwerken
          </button>
        </div>
      </div>

      {/* STEPPER BAR CARD */}
      <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {stepsList.map((step) => {
              const isActive = activeStep === step.key;
              return (
                <button
                  key={step.key}
                  onClick={() => setActiveStep(step.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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

          <div className="flex items-center gap-2 text-[10px] font-bold font-mono">
            <span className="px-2.5 py-1 bg-[#E3EFE3] text-[#2D6A2D] rounded-lg border border-[#C5E1C5]">
              → KLANT
            </span>
            <span className="px-2.5 py-1 bg-[#FDF2E3] text-[#B86B14] rounded-lg border border-[#F6DCB8]">
              → PARTNER
            </span>
          </div>
        </div>

        <p className="text-[11px] text-dark/60 font-body leading-relaxed border-t border-[#E6E1D7]/60 pt-2.5">
          Fase wijzigen stuurt automatisch één notificatie naar de klant en werkt de fasebalk in beide portalen bij. Terugzetten kan alleen met een reden (komt in het logboek).
        </p>
      </div>

      {/* PRIMARY TABS BAR */}
      <div className="space-y-3">
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
                className={`pb-2.5 text-xs transition-all whitespace-nowrap cursor-pointer focus:outline-none relative ${
                  isActive 
                    ? 'text-[#33422C] font-extrabold font-body' 
                    : 'text-[#736B5E] hover:text-[#33422C] font-medium font-body'
                }`}
              >
                {tabName}
                {isActive && (
                  <motion.div 
                    layoutId="activeTabIndicatorGR" 
                    className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#9B7C47]" 
                  />
                )}
              </button>
            );
          })}
        </div>

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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              
              <div className="lg:col-span-7 space-y-5">
                <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-sm text-[#33422C]">
                      Statusteksten op het klantoverzicht
                    </h3>
                    <span className="px-2.5 py-0.5 bg-[#E3EFE3] text-[#2D6A2D] rounded-md font-mono text-[10px] font-bold">
                      → KLANT
                    </span>
                  </div>

                  <p className="text-[11px] text-dark/60 font-body leading-relaxed">
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

                <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-sm text-[#33422C]">
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
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-sm text-[#33422C]">
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
                    className="w-full p-3 bg-white border border-[#D6CFC2] rounded-xl text-xs font-body text-[#4A4A43]"
                  />
                </div>
              </div>

              <div className="lg:col-span-5 space-y-5">
                <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
                  <span className="text-[10px] font-mono font-bold text-dark/50 uppercase tracking-wider block">
                    LIVE — WAT ZIET DE KLANT NU
                  </span>
                  <div className="bg-white border border-[#E6E1D7] rounded-xl p-4 space-y-3 shadow-2xs">
                    <h4 className="font-serif font-bold text-xs text-[#33422C]">Hoi Sander</h4>
                    <div className="text-[11px] font-bold text-dark/80">In de werkplaats · levering week 39</div>
                    <div className="w-full bg-[#EDE8DF] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#5A5038] h-full rounded-full w-[55%]" />
                    </div>
                    <div className="px-2.5 py-1 bg-[#FDF2E3] border border-[#F6DCB8] text-[#B86B14] rounded-lg text-[10px] font-bold inline-block">
                      • 1 actie open: schouwdatum bevestigen
                    </div>
                  </div>
                </div>

                <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
                  <span className="text-[10px] font-mono font-bold text-dark/50 uppercase tracking-wider block">
                    PARTNER — TIMMERWERKEN ZUID
                  </span>
                  <h4 className="font-serif font-bold text-sm text-[#33422C]">Lars Jansen</h4>
                  <p className="text-[11px] text-dark/60">Werkbon v2 · eiken gebint verzaagd</p>
                </div>

                <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
                  <span className="text-[10px] font-mono font-bold text-dark/50 uppercase tracking-wider block">
                    LOGBOEK (ALLES MET WIE/WANNEER)
                  </span>
                  <div className="space-y-2 text-[11px]">
                    {logbook.map((log) => (
                      <div key={log.id} className="flex items-start gap-2 border-b border-[#E6E1D7]/40 pb-2 last:border-none">
                        <span className="font-mono text-[10px] text-dark/50 whitespace-nowrap min-w-[70px]">{log.date}</span>
                        <span className="text-dark/80">{log.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {subToggle === 'Partner' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="lg:col-span-8 space-y-5">
                <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E6E1D7] pb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-[#B86B14] uppercase tracking-wider block">
                        PARTNER TOEWIJZING & WERKBON
                      </span>
                      <h3 className="font-serif font-bold text-base text-[#33422C] mt-0.5">
                        Timmerwerken Zuid — Lars Jansen
                      </h3>
                    </div>
                    <span className="px-3 py-1 bg-[#E3EFE3] text-[#2D6A2D] rounded-full text-xs font-bold">
                      ✔ In productie
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-body">
                    <div className="p-3.5 bg-white border border-[#D6CFC2] rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-dark/50 uppercase">Agreed Build Price (Partner)</span>
                      <p className="text-sm font-bold text-[#33422C]">€ 14.200,00 ex. btw</p>
                    </div>

                    <div className="p-3.5 bg-white border border-[#D6CFC2] rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-dark/50 uppercase">Target Delivery Week</span>
                      <p className="text-sm font-bold text-[#33422C]">Week 39 (Di 22 September)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-5">
                <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-5 shadow-2xs space-y-3 text-xs">
                  <h4 className="font-serif font-bold text-sm text-[#33422C]">Partner Details</h4>
                  <p className="text-dark/70"><strong>Lars Jansen</strong> (Timmerwerken Zuid)</p>
                  <p className="text-dark/70">Telefoon: +31 6 98765432</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* FLOATING PROJECTCHAT WIDGET */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-[#33422C] hover:bg-[#283523] text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 cursor-pointer font-medium text-xs border border-white/20 transition-all transform hover:scale-105"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>💬 Projectchat</span>
        <span className="px-1.5 py-0.2 bg-amber-500 text-white font-mono text-[10px] font-bold rounded-full">
          2
        </span>
      </button>

      {/* CHAT DRAWER */}
      <AnimatePresence>
        {chatOpen && (
          <div className="fixed inset-0 z-[9999] flex justify-end bg-black/40 backdrop-blur-xs">
            <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col font-body text-xs">
              <div className="p-4 bg-[#33422C] text-white flex items-center justify-between">
                <span className="font-bold">Projectchat — Sander de Vries</span>
                <button onClick={() => setChatOpen(false)} className="text-white/60 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-[#F4F1EA]">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.role === 'admin' ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-dark/50 mb-0.5">{msg.sender} · {msg.time}</span>
                    <div className={`p-3 rounded-2xl max-w-[85%] ${msg.role === 'admin' ? 'bg-[#33422C] text-white' : 'bg-white text-dark border'}`}>{msg.text}</div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendChat} className="p-3 border-t bg-white flex gap-2">
                <input type="text" placeholder="Typ een bericht..." value={inputChatMsg} onChange={e => setInputChatMsg(e.target.value)} className="flex-1 px-3 py-2 bg-[#F4F1EA] border rounded-xl text-xs" />
                <button type="submit" className="px-3.5 py-2 bg-[#33422C] text-white font-bold rounded-xl text-xs"><Send className="w-3.5 h-3.5" /></button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
