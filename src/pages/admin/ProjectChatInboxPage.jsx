import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Paperclip, Send, ChevronDown, CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProjectChatInboxPage() {
  const navigate = useNavigate();

  // Active filter tab
  const [activeFilter, setActiveFilter] = useState('Alles (4)');

  // Selected conversation state
  const [selectedChatId, setSelectedChatId] = useState(1);

  // Quick reply text suggestions
  const [showQuickReplyMenu, setShowQuickReplyMenu] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const [inputMessage, setInputMessage] = useState('');

  // Conversation list matching Screenshot 2
  const conversations = [
    {
      id: 1,
      name: 'Sander de Vries',
      type: 'KLANT',
      projectCode: '2026-014',
      projectName: 'Buitenkeuken Thermo Fraké',
      preview: '"kan de wasbak nog iets meer naar links?"',
      time: '09:40',
      unreadCount: 2,
      projectPath: '/admin/projects/outdoor-kitchens',
      messages: [
        { id: 101, sender: 'Sander de Vries', avatar: 'SV', isKlant: true, time: 'vandaag 09:38', text: "Hoi Tim, de foto's zien er top uit!" },
        { id: 102, sender: 'Sander de Vries', avatar: 'SV', isKlant: true, time: 'vandaag 09:40', text: "Mooi man. Vraag: kan de wasbak nog iets meer naar links?" },
        { id: 103, sender: 'Tim', avatar: 'T', isKlant: false, time: 'Tim · 09:48 · ✓ gelezen', text: "Kan nog, het blad is nog niet uitgezaagd. Ik laat hem 15 cm naar links schuiven en stuur je vanmiddag een foto van de aftekening. Kosten: niets." }
      ]
    },
    {
      id: 2,
      name: 'Sven · Hoek Bouw',
      type: 'PARTNER',
      projectCode: '2026-014',
      projectName: 'Buitenkeuken Thermo Fraké',
      preview: '"Blad ligt klaar voor het uitzagen..."',
      time: '09:52',
      unreadCount: 1,
      projectPath: '/admin/projects/outdoor-kitchens',
      messages: [
        { id: 201, sender: 'Sven · Hoek Bouw', avatar: 'SH', isKlant: true, time: 'vandaag 09:52', text: "Hoi Tim, blad ligt klaar voor het uitzagen. Ik wacht op definitieve maat van de wasbak." }
      ]
    },
    {
      id: 3,
      name: 'Timmerwerken Zuid',
      type: 'PARTNER',
      projectCode: '2026-021',
      projectName: 'Buitenverblijf Oisterwijk',
      preview: '"Schouw donderdag: lukt 10:00 zeker."',
      time: 'gisteren',
      unreadCount: 1,
      projectPath: '/admin/projects/garden-rooms',
      messages: [
        { id: 301, sender: 'Lars (Timmerwerken Zuid)', avatar: 'TZ', isKlant: true, time: 'gisteren 16:30', text: "Hoi Tim, schouw donderdag: lukt 10:00 zeker. Ik ben er rond 09:55." }
      ]
    },
    {
      id: 4,
      name: 'John Miller',
      type: 'KLANT',
      projectCode: '2026-019',
      projectName: 'Buitenkeuken Douglas',
      preview: '"Helemaal goed, tot vrijdag!" · ✓ afgehandeld',
      time: 'gisteren',
      unreadCount: 0,
      projectPath: '/admin/projects/outdoor-kitchens',
      messages: [
        { id: 401, sender: 'John Miller', avatar: 'JM', isKlant: true, time: 'gisteren 11:20', text: "Helemaal goed, tot vrijdag!" }
      ]
    }
  ];

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const selectedChat = conversations.find(c => c.id === selectedChatId) || conversations[0];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: Date.now(),
      sender: 'Tim',
      avatar: 'T',
      isKlant: false,
      time: `Tim · ${timeNow} · ✓ verzonden`,
      text: inputMessage.trim()
    };

    selectedChat.messages.push(newMsg);
    setInputMessage('');
    showToast('Bericht verzonden!');
  };

  const handleApplyQuickReply = (text) => {
    setInputMessage(text);
    setShowQuickReplyMenu(false);
  };

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
          <button
            onClick={() => navigate('/admin/projects')}
            className="p-1.5 px-2.5 bg-[#33422C] hover:bg-[#253120] text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center cursor-pointer mr-1"
            title="Terug naar Projecten Overzicht"
          >
            ←
          </button>
          <span className="font-bold text-[#33422C] font-serif text-sm">Project Management</span>
          <span className="text-dark/40">·</span>
          <span className="text-[#555046] font-mono text-[11px]">admin portal</span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/admin/projects/inbox-messages')}
            className="px-3 py-1 bg-white border border-[#33422C] text-[#33422C] rounded-xl font-bold text-xs shadow-2xs hover:bg-[#FAF8F5] cursor-pointer"
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

      {/* PAGE TITLE & SUBTITLE matching Screenshot 2 */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#33422C]">
          Inbox
        </h1>
        <p className="text-xs sm:text-sm text-dark/60 font-body">
          4 ongelezen · klant- en partnergesprekken, nieuwste bovenaan.
        </p>
      </div>

      {/* FILTER PILLS ROW matching Screenshot 2 */}
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
        {[
          'Alles (4)',
          'Klanten (2)',
          'Partners (2)',
          'Wacht op antwoord van ons'
        ].map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive 
                  ? 'bg-[#33422C] text-white shadow-xs' 
                  : 'bg-white text-dark/70 border border-[#D6CFC2] hover:bg-[#FAF8F5]'
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* MAIN TWO-COLUMN GRID matching Screenshot 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: CONVERSATIONS LIST (5 COLUMNS) */}
        <div className="lg:col-span-5 bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-2.5">
          {conversations.map((chat) => {
            const isSelected = selectedChatId === chat.id;
            return (
              <div
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                  isSelected 
                    ? 'bg-[#EAF3EA] border-[#CBE0CB] shadow-2xs' 
                    : 'bg-white border-[#E6E1D7] hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#2A2925] text-sm font-sans">
                      {chat.name}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md font-mono text-[9px] font-bold ${
                      chat.type === 'KLANT' 
                        ? 'bg-[#E3EFE3] text-[#2D6A2D]' 
                        : 'bg-[#FDF2E3] text-[#B86B14]'
                    }`}>
                      {chat.type}
                    </span>
                  </div>

                  {chat.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#82B382] text-white font-mono text-[10px] font-bold flex items-center justify-center">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>

                <p className="text-xs text-dark/70 font-body leading-snug">
                  <span className="font-mono text-[11px] text-dark/50 font-bold mr-1">{chat.projectCode}</span>
                  {chat.preview}
                </p>
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: ACTIVE CHAT DETAIL (7 COLUMNS) matching Screenshot 2 */}
        <div className="lg:col-span-7 bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          
          {/* HEADER OF ACTIVE CHAT */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E1D7] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-sans font-bold text-base text-[#2A2925]">
                  {selectedChat.name}
                </h3>
                <span className={`px-2 py-0.5 rounded-md font-mono text-[9px] font-bold ${
                  selectedChat.type === 'KLANT' 
                    ? 'bg-[#E3EFE3] text-[#2D6A2D]' 
                    : 'bg-[#FDF2E3] text-[#B86B14]'
                }`}>
                  {selectedChat.type}
                </span>
              </div>
              <p className="text-xs text-dark/60 font-body mt-0.5">
                Project {selectedChat.projectCode} · {selectedChat.projectName}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(selectedChat.projectPath)}
                className="px-3.5 py-1.5 bg-white hover:bg-[#FAF8F5] text-dark/80 border border-[#D6CFC2] rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
              >
                <span>Open project</span>
              </button>
              <button
                onClick={() => showToast('Bellen gestart met ' + selectedChat.name)}
                className="px-3.5 py-1.5 bg-white hover:bg-[#FAF8F5] text-dark/80 border border-[#D6CFC2] rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                Bel
              </button>
            </div>
          </div>

          {/* CHAT MESSAGES DISPLAY */}
          <div className="space-y-4 py-2 max-h-[380px] overflow-y-auto pr-1">
            {selectedChat.messages.map((msg) => (
              <div key={msg.id} className="space-y-1">
                <div className={`flex items-start gap-2.5 ${!msg.isKlant ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar Circle */}
                  <div className={`w-7 h-7 rounded-full font-bold text-[10px] flex items-center justify-center flex-shrink-0 text-white font-mono ${
                    msg.isKlant ? 'bg-[#6B655B]' : 'bg-[#5C5138]'
                  }`}>
                    {msg.avatar}
                  </div>

                  {/* Bubble */}
                  <div className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                    msg.isKlant 
                      ? 'bg-[#EDE8DF] text-[#2A2925] rounded-tl-xs' 
                      : 'bg-[#33422C] text-white rounded-tr-xs shadow-xs'
                  }`}>
                    {msg.text}
                  </div>
                </div>

                <div className={`text-[10px] text-dark/50 px-10 ${!msg.isKlant ? 'text-right' : 'text-left'}`}>
                  {msg.time}
                </div>
              </div>
            ))}
          </div>

          {/* INPUT FORM BAR matching Screenshot 2 */}
          <form onSubmit={handleSendMessage} className="space-y-2 pt-2">
            <div className="bg-white border border-[#D6CFC2] rounded-2xl p-2 flex flex-wrap sm:flex-nowrap items-center gap-2 shadow-2xs">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Antwoord aan ${selectedChat.name.split(' ')[0]}...`}
                className="flex-1 min-w-[120px] px-3 py-1.5 text-xs text-dark font-body focus:outline-none placeholder:text-dark/40"
              />

              <button
                type="button"
                onClick={() => showToast('Bestand toevoegen geopend')}
                className="p-2 text-dark/50 hover:text-dark/80 cursor-pointer rounded-lg"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowQuickReplyMenu(!showQuickReplyMenu)}
                  className="px-2 sm:px-3 py-1.5 bg-white border border-[#D6CFC2] hover:bg-[#FAF8F5] text-dark/80 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span className="hidden sm:inline">Snel antwoord</span>
                  <span className="sm:hidden">Snel</span>
                  <ChevronDown className="w-3.5 h-3.5 text-dark/50" />
                </button>

                {showQuickReplyMenu && (
                  <div className="absolute right-0 bottom-full mb-2 w-64 bg-white border border-[#D6CFC2] rounded-xl shadow-xl p-2 z-50 text-xs space-y-1">
                    <button
                      type="button"
                      onClick={() => handleApplyQuickReply('Prijsindicatie: het maatwerk is berekend op basis van de ingevoerde opties.')}
                      className="w-full text-left p-2 hover:bg-[#FAF8F5] rounded-lg text-dark/80 font-body"
                    >
                      prijsindicatie-uitleg
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyQuickReply('Wij werken uitsluitend op afspraak in de werkplaats/showroom.')}
                      className="w-full text-left p-2 hover:bg-[#FAF8F5] rounded-lg text-dark/80 font-body"
                    >
                      geen-showroom-antwoord
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyQuickReply('De verwachte leverweek staat op schema zoals aangegeven.')}
                      className="w-full text-left p-2 hover:bg-[#FAF8F5] rounded-lg text-dark/80 font-body"
                    >
                      leverweek-uitleg
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyQuickReply('We zoeken het uit en komen er vandaag op terug.')}
                      className="w-full text-left p-2 hover:bg-[#FAF8F5] rounded-lg text-dark/80 font-body font-bold text-[#33422C]"
                    >
                      "we zoeken het uit..."
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="px-3 sm:px-4 py-2 bg-[#33422C] hover:bg-[#283523] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                Versturen
              </button>
            </div>

            {/* QUICK REPLIES FOOTER NOTE matching Screenshot 2 */}
            <p className="text-[11px] text-dark/50 font-body leading-relaxed pt-1">
              Snelle antwoorden: prijsindicatie-uitleg · geen-showroom-antwoord · leverweek-uitleg · "we zoeken het uit en komen er vandaag op terug". Beheerbaar bij Instellingen.
            </p>
          </form>

        </div>

      </div>

    </div>
  );
}
