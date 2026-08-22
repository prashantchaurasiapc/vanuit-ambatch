import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Paperclip, Send, Check, Image as ImageIcon, FileText } from 'lucide-react';

export default function ProjectChatDrawer({
  isOpen,
  onClose,
  projectCode = '2026-014',
  clientName = 'Sander',
  partnerName = 'Sven',
  onShowToast
}) {
  // Active channel: 'klant' | 'partner'
  const [activeChannel, setActiveChannel] = useState('klant');

  // Input state per channel
  const [inputKlantMsg, setInputKlantMsg] = useState('');
  const [inputPartnerMsg, setInputPartnerMsg] = useState('');

  // Unread badge counts
  const [klantUnread, setKlantUnread] = useState(2);
  const [partnerUnread, setPartnerUnread] = useState(1);

  // Hidden file input ref for paperclip attachment
  const fileInputRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Customer channel messages stream (Strictly isolated - Screenshot 2)
  const [klantMessages, setKlantMessages] = useState([
    {
      id: 101,
      sender: 'Sander de Vries',
      initials: 'SV',
      role: 'klant',
      text: "Hoi Tim, de foto's zien er top uit!",
      time: 'vandaag 09:38'
    },
    {
      id: 102,
      sender: 'Sander de Vries',
      initials: 'SV',
      role: 'klant',
      text: 'Mooi man. Vraag: kan de wasbak nog iets meer naar links?',
      time: 'vandaag 09:40'
    },
    {
      id: 103,
      sender: 'Tim',
      initials: 'T',
      role: 'admin',
      text: 'Kan nog, het blad is nog niet uitgezaagd. Ik laat hem 15 cm naar links schuiven en stuur je vanmiddag een foto van de aftekening. Kosten: niets.',
      time: 'Tim · 09:48 · ✓ gelezen'
    }
  ]);

  // Partner channel messages stream (Strictly isolated - Screenshot 3)
  const [partnerMessages, setPartnerMessages] = useState([
    {
      id: 201,
      sender: 'Sven Hoek',
      initials: 'SH',
      role: 'partner',
      text: 'Blad ligt klaar voor het uitzagen. Nog wijzigingen voor ik begin?',
      time: 'vandaag 09:52'
    },
    {
      id: 202,
      sender: 'Tim',
      initials: 'T',
      role: 'admin',
      text: 'Ja — wasbak 15 cm naar links t.o.v. tekening v2 (klantverzoek). Werkbon is bijgewerkt. Stuur je een foto van de aftekening voor je zaagt?',
      time: 'Tim · 09:55 · ✓ gelezen'
    },
    {
      id: 203,
      sender: 'Sven Hoek',
      initials: 'SH',
      role: 'partner',
      text: 'Top, doe ik. 📷 volgt rond 14:00.',
      time: 'vandaag 09:57'
    }
  ]);

  // Auto-scroll to bottom when active channel or messages change
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen, activeChannel, klantMessages.length, partnerMessages.length]);

  const handleSendKlant = (e) => {
    if (e) e.preventDefault();
    if (!inputKlantMsg.trim()) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: Date.now(),
      sender: 'Tim',
      initials: 'T',
      role: 'admin',
      text: inputKlantMsg.trim(),
      time: `Tim · ${timeNow} · ✓ verzonden`
    };

    setKlantMessages((prev) => [...prev, newMsg]);
    setInputKlantMsg('');
    if (onShowToast) {
      onShowToast('✓ Bericht verzonden naar klant (zichtbaar in klantportaal + WhatsApp)');
    }
  };

  const handleSendPartner = (e) => {
    if (e) e.preventDefault();
    if (!inputPartnerMsg.trim()) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: Date.now(),
      sender: 'Tim',
      initials: 'T',
      role: 'admin',
      text: inputPartnerMsg.trim(),
      time: `Tim · ${timeNow} · ✓ verzonden`
    };

    setPartnerMessages((prev) => [...prev, newMsg]);
    setInputPartnerMsg('');
    if (onShowToast) {
      onShowToast('✓ Bericht verzonden naar partner (Nooit zichtbaar voor de klant!)');
    }
  };

  const handlePaperclipClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isImage = file.type.startsWith('image/');

    const attachmentMsg = {
      id: Date.now(),
      sender: 'Tim',
      initials: 'T',
      role: 'admin',
      text: isImage ? `📷 Bijlage: ${file.name}` : `📄 Document: ${file.name}`,
      isAttachment: true,
      fileName: file.name,
      time: `Tim · ${timeNow} · ✓ verzonden`
    };

    if (activeChannel === 'klant') {
      setKlantMessages((prev) => [...prev, attachmentMsg]);
      if (onShowToast) onShowToast(`✓ Bijlage "${file.name}" verzonden naar klant!`);
    } else {
      setPartnerMessages((prev) => [...prev, attachmentMsg]);
      if (onShowToast) onShowToast(`✓ Bijlage "${file.name}" verzonden naar partner!`);
    }

    // Reset file input
    e.target.value = '';
  };

  const content = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999999] overflow-hidden pointer-events-auto">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/45 backdrop-blur-xs cursor-pointer"
          />

          {/* Sliding Drawer Container - Full Height Top-to-Bottom Over TopBar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
            className="fixed top-0 right-0 bottom-0 h-screen w-[420px] max-w-full bg-[#FAF8F5] shadow-2xl flex flex-col font-sans border-l border-[#D6CFC2] z-[1000000]"
          >
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            {/* 1. TOP HEADER SECTION (With clean spacing above topbar) */}
            <div className="pt-5 pb-4 px-4 sm:px-5 border-b border-[#E6E1D7] bg-[#FAF8F5] space-y-3 flex-shrink-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-serif font-bold text-[#1C1C1A] tracking-tight">
                    Projectchat · {projectCode}
                  </h2>
                  <p className="text-[11px] text-[#736B5E] font-medium leading-tight mt-0.5">
                    Beschikbaar op elk tabblad — zelfde threads als de Berichten-tab en de Inbox.
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-[#736B5E] hover:text-[#1C1C1A] hover:bg-[#EDE8DF] transition-colors cursor-pointer"
                  aria-label="Close project chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 2. TWO CHANNEL TABS SELECTOR PILL */}
              <div className="bg-[#EDE8DF] p-1 rounded-2xl flex items-center gap-1 border border-[#D6CFC2]/60">
                {/* Klant Channel Tab */}
                <button
                  onClick={() => {
                    setActiveChannel('klant');
                    setKlantUnread(0);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeChannel === 'klant'
                      ? 'bg-white text-[#1C1C1A] shadow-xs'
                      : 'text-[#615C52] hover:text-[#1C1C1A]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />
                  <span>Klant · {clientName}</span>
                  {klantUnread > 0 && (
                    <span className="ml-0.5 text-[10px] font-mono font-extrabold text-[#1E561E] bg-[#E3EFE3] px-1.5 py-0.2 rounded-full">
                      {klantUnread}
                    </span>
                  )}
                </button>

                {/* Partner Channel Tab */}
                <button
                  onClick={() => {
                    setActiveChannel('partner');
                    setPartnerUnread(0);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeChannel === 'partner'
                      ? 'bg-white text-[#1C1C1A] shadow-xs'
                      : 'text-[#615C52] hover:text-[#1C1C1A]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#B47B36]" />
                  <span>Partner · {partnerName}</span>
                  {partnerUnread > 0 && (
                    <span className="ml-0.5 text-[10px] font-mono font-extrabold text-[#9E5507] bg-[#FDF2E3] px-1.5 py-0.2 rounded-full">
                      {partnerUnread}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* 3. CHANNEL ALERT BAR */}
            <div className="px-4 py-2.5 flex-shrink-0">
              {activeChannel === 'klant' ? (
                <div className="bg-[#E8F2E6] border border-[#C6E1C4] rounded-xl p-3 text-xs leading-snug">
                  <strong className="font-bold text-[#1E561E]">Kanaal: klant</strong>{' '}
                  <span className="text-[#2D4A2D]">
                    — dit gesprek is zichtbaar in het klantportaal en spiegelt naar WhatsApp/mail.
                  </span>
                </div>
              ) : (
                <div className="bg-[#F7EBD9] border border-[#EAD3B9] rounded-xl p-3 text-xs leading-snug">
                  <strong className="font-bold text-[#9E5507]">Kanaal: partner</strong>{' '}
                  <span className="text-[#693902]">
                    — alleen zichtbaar voor de partner, met WhatsApp-spiegel.{' '}
                    <strong className="font-bold text-[#8C2703]">Nooit voor de klant.</strong>
                  </span>
                </div>
              )}
            </div>

            {/* 4. MESSAGES STREAM AREA */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-[#FAF8F5]">
              {activeChannel === 'klant' ? (
                /* KLANT MESSAGES STREAM */
                klantMessages.map((msg) => {
                  const isAdmin = msg.role === 'admin';
                  return (
                    <div key={msg.id} className="space-y-1">
                      <div className={`flex items-start gap-2.5 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                        {!isAdmin && (
                          <div className="w-8 h-8 rounded-full bg-[#7A6E5D] text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs font-mono">
                            {msg.initials}
                          </div>
                        )}

                        <div
                          className={`p-3.5 rounded-2xl max-w-[82%] text-xs font-medium leading-relaxed ${
                            isAdmin
                              ? 'bg-[#283523] text-white rounded-tr-xs shadow-2xs'
                              : 'bg-[#EDE8DF] border border-[#E2DCD1] text-[#2E2B25] rounded-tl-xs'
                          }`}
                        >
                          {msg.isAttachment ? (
                            <div className="flex items-center gap-2">
                              <ImageIcon className="w-4 h-4 text-emerald-300" />
                              <span className="underline font-semibold">{msg.text}</span>
                            </div>
                          ) : (
                            msg.text
                          )}
                        </div>

                        {isAdmin && (
                          <div className="w-8 h-8 rounded-full bg-[#7A6E5D] text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs font-mono">
                            {msg.initials}
                          </div>
                        )}
                      </div>

                      <div className={`text-[10px] text-[#736B5E] font-medium px-10 ${isAdmin ? 'text-right' : 'text-left'}`}>
                        {msg.time}
                      </div>
                    </div>
                  );
                })
              ) : (
                /* PARTNER MESSAGES STREAM */
                partnerMessages.map((msg) => {
                  const isAdmin = msg.role === 'admin';
                  return (
                    <div key={msg.id} className="space-y-1">
                      <div className={`flex items-start gap-2.5 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                        {!isAdmin && (
                          <div className="w-8 h-8 rounded-full bg-[#5E574B] text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs font-mono">
                            {msg.initials}
                          </div>
                        )}

                        <div
                          className={`p-3.5 rounded-2xl max-w-[82%] text-xs font-medium leading-relaxed ${
                            isAdmin
                              ? 'bg-[#283523] text-white rounded-tr-xs shadow-2xs'
                              : 'bg-[#EDE8DF] border border-[#E2DCD1] text-[#2E2B25] rounded-tl-xs'
                          }`}
                        >
                          {msg.isAttachment ? (
                            <div className="flex items-center gap-2">
                              <ImageIcon className="w-4 h-4 text-amber-300" />
                              <span className="underline font-semibold">{msg.text}</span>
                            </div>
                          ) : (
                            msg.text
                          )}
                        </div>

                        {isAdmin && (
                          <div className="w-8 h-8 rounded-full bg-[#7A6E5D] text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs font-mono">
                            {msg.initials}
                          </div>
                        )}
                      </div>

                      <div className={`text-[10px] text-[#736B5E] font-medium px-10 ${isAdmin ? 'text-right' : 'text-left'}`}>
                        {msg.time}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* 5. INPUT & DYNAMIC SEND BUTTON AREA */}
            <div className="border-t border-[#E6E1D7] bg-[#FAF8F5] p-3 sm:p-4 space-y-2 flex-shrink-0">
              <form
                onSubmit={activeChannel === 'klant' ? handleSendKlant : handleSendPartner}
                className="flex items-center gap-2"
              >
                <div className="flex-1 bg-white border border-[#D6CFC2] rounded-2xl px-3.5 py-1.5 flex items-center gap-2 shadow-2xs focus-within:ring-2 focus-within:ring-[#283523]/20">
                  <input
                    type="text"
                    value={activeChannel === 'klant' ? inputKlantMsg : inputPartnerMsg}
                    onChange={(e) =>
                      activeChannel === 'klant'
                        ? setInputKlantMsg(e.target.value)
                        : setInputPartnerMsg(e.target.value)
                    }
                    placeholder={
                      activeChannel === 'klant' ? 'Bericht aan de klant...' : 'Bericht aan de partner...'
                    }
                    className="w-full text-xs font-semibold text-[#1C1C1A] placeholder-[#8A8478] focus:outline-none bg-transparent py-1"
                  />

                  <button
                    type="button"
                    onClick={handlePaperclipClick}
                    className="p-1.5 text-[#736B5E] hover:text-[#1C1C1A] cursor-pointer rounded-lg hover:bg-[#FAF8F5] transition-colors"
                    title="Bijlage toevoegen"
                  >
                    <Paperclip className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* DYNAMIC SEND BUTTON */}
                <button
                  type="submit"
                  className={`px-4 py-2.5 text-white font-bold rounded-2xl text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5 ${
                    activeChannel === 'klant'
                      ? 'bg-[#283523] hover:bg-[#1E291B]'
                      : 'bg-[#B47B36] hover:bg-[#966327]'
                  }`}
                >
                  <span>Versturen</span>
                </button>
              </form>

              {/* SUBTEXT FOOTER NOTE */}
              <p className="text-[11px] text-[#736B5E] font-medium leading-tight text-center pt-0.5">
                Kleur en label wisselen mee met het kanaal — verkeerd kanaal kiezen kan visueel niet ongemerkt.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null;
}
