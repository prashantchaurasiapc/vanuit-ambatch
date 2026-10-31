import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Paperclip, Send, Check, Image as ImageIcon, FileText } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../api/apiClient';

export default function ProjectChatDrawer({
  isOpen,
  onClose,
  projectCode = '2026-014',
  projectId = null,
  clientName = 'Sander',
  partnerName = 'Sven',
  onShowToast
}) {
  const { language } = useLanguage();
  const isEn = language !== 'NL';

  const activeProjectId = projectId || projectCode || 'PRJ-2026-001';

  // Active channel: 'klant' | 'partner'
  const [activeChannel, setActiveChannel] = useState('klant');

  // Input state per channel
  const [inputKlantMsg, setInputKlantMsg] = useState('');
  const [inputPartnerMsg, setInputPartnerMsg] = useState('');

  // Unread badge counts
  const [klantUnread, setKlantUnread] = useState(2);
  const [partnerUnread, setPartnerUnread] = useState(1);
  const [partnerConversationId, setPartnerConversationId] = useState(null);
  const [customerConversationId, setCustomerConversationId] = useState(null);

  // Hidden file input ref for paperclip attachment
  const fileInputRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Customer channel messages stream (Shared with Workspace Messages Tab)
  const defaultKlant = [
    {
      id: 1,
      sender: 'Sander de Vries',
      initials: 'SV',
      role: 'klant',
      text: 'Great look. Question: can the sink be moved a bit more to the left?',
      time: 'today 09:40'
    },
    {
      id: 2,
      sender: 'Tim',
      initials: 'T',
      role: 'admin',
      text: "Still possible, the slab has not been cut out yet. I'll have it shifted 15 cm to the left and send you a photo of the marking this afternoon. Cost: zero.",
      time: 'Tim · 09:48 · ✓ read'
    }
  ];

  const defaultPartner = [
    {
      id: 1,
      sender: 'Sven Hoek',
      initials: 'SH',
      role: 'partner',
      text: 'Slab is ready for cutting. Any changes before I begin?',
      time: 'today 09:52'
    },
    {
      id: 2,
      sender: 'Tim',
      initials: 'T',
      role: 'admin',
      text: 'Yes — sink 15 cm to the left compared to drawing v2 (customer request). Work order updated. Will you send a photo of the marking before cutting?',
      time: 'Tim · 09:55 · ✓ read'
    },
    {
      id: 3,
      sender: 'Sven Hoek',
      initials: 'SH',
      role: 'partner',
      text: 'Great, on it. 📷 follows around 14:00.',
      time: 'today 09:57'
    }
  ];

  const [klantMessages, setKlantMessages] = useState(defaultKlant);
  const [partnerMessages, setPartnerMessages] = useState(defaultPartner);

  const saveDrawerStore = (kMsgs, pMsgs) => {
    setKlantMessages(kMsgs);
    setPartnerMessages(pMsgs);
    try {
      localStorage.setItem(`va_partner_chat_${activeProjectId}`, JSON.stringify(pMsgs));
      localStorage.setItem(`va_customer_chat_${activeProjectId}`, JSON.stringify(kMsgs));
    } catch (err) {}
  };

  // Load Partner & Customer Messages from backend and synchronized store
  useEffect(() => {
    let isMounted = true;
    try {
      const storedPartner = localStorage.getItem(`va_partner_chat_${activeProjectId}`);
      if (storedPartner) {
        setPartnerMessages(JSON.parse(storedPartner));
      } else {
        localStorage.setItem(`va_partner_chat_${activeProjectId}`, JSON.stringify(defaultPartner));
      }

      const storedCust = localStorage.getItem(`va_customer_chat_${activeProjectId}`);
      if (storedCust) {
        setKlantMessages(JSON.parse(storedCust));
      } else {
        localStorage.setItem(`va_customer_chat_${activeProjectId}`, JSON.stringify(defaultKlant));
      }
    } catch (err) {}

    // Load from backend if available
    api.get(`/conversations/project/${activeProjectId}`)
      .then(res => {
        if (!isMounted || !res.success || !res.data) return;
        
        // 1. Partner Channel
        const partCh = res.data.partnerChannel;
        if (partCh?.id) {
          setPartnerConversationId(partCh.id);
          api.get(`/conversations/${partCh.id}/messages`).then(msgRes => {
            if (!isMounted || !msgRes.success || !Array.isArray(msgRes.data)) return;
            if (msgRes.data.length > 0) {
              const mapped = msgRes.data.map(m => ({
                id: m.id,
                sender: m.senderName,
                initials: m.senderInitials || 'VA',
                role: m.senderRole || (m.senderName?.includes('Tim') ? 'admin' : 'partner'),
                text: m.content,
                time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }));
              setPartnerMessages(mapped);
              try {
                localStorage.setItem(`va_partner_chat_${activeProjectId}`, JSON.stringify(mapped));
              } catch (e) {}
            }
          }).catch(() => {});
        }

        // 2. Customer Channel
        const custCh = res.data.customerChannel;
        if (custCh?.id) {
          setCustomerConversationId(custCh.id);
          api.get(`/conversations/${custCh.id}/messages`).then(msgRes => {
            if (!isMounted || !msgRes.success || !Array.isArray(msgRes.data)) return;
            if (msgRes.data.length > 0) {
              const mappedCust = msgRes.data.map(m => ({
                id: m.id,
                sender: m.senderName,
                senderName: m.senderName,
                initials: m.senderInitials || (m.senderRole === 'customer' ? 'SV' : 'T'),
                role: m.senderRole || (m.senderName?.includes('Tim') ? 'admin' : 'klant'),
                type: m.senderRole === 'customer' ? 'outgoing' : 'incoming',
                text: m.content,
                time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }));
              setKlantMessages(mappedCust);
              try {
                localStorage.setItem(`va_customer_chat_${activeProjectId}`, JSON.stringify(mappedCust));
              } catch (e) {}
            }
          }).catch(() => {});
        }
      })
      .catch(() => {});

    // Listen for live messages from Partner Portal & Customer Portal in realtime
    const handleLiveMessage = (e) => {
      const detail = e.detail;
      if (!detail) return;
      if (detail.projectId === activeProjectId || !detail.projectId) {
        if (detail.message) {
          if (detail.channel === 'customer' || detail.message.role === 'customer' || detail.message.role === 'klant') {
            setKlantMessages(prev => {
              if (prev.some(m => m.id === detail.message.id)) return prev;
              return [...prev, detail.message];
            });
            if (activeChannel !== 'klant' || !isOpen) {
              setKlantUnread(prev => prev + 1);
            }
          } else {
            setPartnerMessages(prev => {
              if (prev.some(m => m.id === detail.message.id)) return prev;
              return [...prev, detail.message];
            });
            if (activeChannel !== 'partner' || !isOpen) {
              setPartnerUnread(prev => prev + 1);
            }
          }
        }
      }
    };

    const handleStorageUpdate = (e) => {
      if (e.key === `va_partner_chat_${activeProjectId}`) {
        try {
          if (e.newValue) {
            setPartnerMessages(JSON.parse(e.newValue));
          }
        } catch (err) {}
      }
      if (e.key === `va_customer_chat_${activeProjectId}`) {
        try {
          if (e.newValue) {
            setKlantMessages(JSON.parse(e.newValue));
          }
        } catch (err) {}
      }
    };

    window.addEventListener('app_chat_message', handleLiveMessage);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('app_chat_message', handleLiveMessage);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [activeProjectId, isOpen, activeChannel]);

  // Auto-scroll to bottom when active channel or messages change
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen, activeChannel, klantMessages.length, partnerMessages.length]);

  const handleSendKlant = async (e) => {
    if (e) e.preventDefault();
    if (!inputKlantMsg.trim()) return;

    const text = inputKlantMsg.trim();
    setInputKlantMsg('');

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'Tim (Admin)',
      senderName: 'Tim (Admin)',
      initials: 'T',
      role: 'admin',
      type: 'incoming',
      text: text,
      time: `Tim · ${timeNow} · ✓ sent`,
      createdAt: new Date().toISOString()
    };

    const nextKlant = [...klantMessages, newMsg];
    setKlantMessages(nextKlant);

    try {
      localStorage.setItem(`va_customer_chat_${activeProjectId}`, JSON.stringify(nextKlant));
    } catch (err) {}

    window.dispatchEvent(new CustomEvent('app_chat_message', { detail: { projectId: activeProjectId, channel: 'customer', message: newMsg } }));
    window.dispatchEvent(new Event('app_data_changed'));

    try {
      if (customerConversationId) {
        await api.post(`/conversations/${customerConversationId}/messages`, { content: text });
      } else {
        const convRes = await api.get(`/conversations/project/${activeProjectId}`);
        const cId = convRes.data?.customerChannel?.id;
        if (cId) {
          setCustomerConversationId(cId);
          await api.post(`/conversations/${cId}/messages`, { content: text });
        }
      }
    } catch (err) {
      console.warn('Backend customer message sync note:', err);
    }

    if (onShowToast) {
      onShowToast(isEn ? '✓ Message sent to customer (visible in customer portal + WhatsApp)' : '✓ Bericht verzonden naar klant (zichtbaar in klantportaal + WhatsApp)');
    }
  };

  const handleSendPartner = async (e) => {
    if (e) e.preventDefault();
    if (!inputPartnerMsg.trim()) return;

    const text = inputPartnerMsg.trim();
    setInputPartnerMsg('');

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'Tim (Admin)',
      initials: 'T',
      role: 'admin',
      text: text,
      textEN: text,
      textNL: text,
      time: `Tim · ${timeNow} · ✓ sent`,
      timeEN: `Tim · ${timeNow} · ✓ sent`,
      timeNL: `Tim · ${timeNow} · ✓ verzonden`,
      createdAt: new Date().toISOString()
    };

    const nextPart = [...partnerMessages, newMsg];
    saveDrawerStore(klantMessages, nextPart);

    // Save to shared localStorage so partner portal receives it immediately
    try {
      localStorage.setItem(`va_partner_chat_${activeProjectId}`, JSON.stringify(nextPart));
    } catch (err) {}

    // Dispatch global events for real-time reactivity
    window.dispatchEvent(new CustomEvent('app_chat_message', { detail: { projectId: activeProjectId, message: newMsg } }));
    window.dispatchEvent(new Event('app_data_changed'));

    // Post to backend database
    try {
      if (partnerConversationId) {
        await api.post(`/conversations/${partnerConversationId}/messages`, { content: text });
      } else {
        const convRes = await api.get(`/conversations/project/${activeProjectId}`);
        const cId = convRes.data?.partnerChannel?.id;
        if (cId) {
          setPartnerConversationId(cId);
          await api.post(`/conversations/${cId}/messages`, { content: text });
        }
      }
    } catch (err) {
      console.warn('Backend message sync note:', err);
    }

    if (onShowToast) {
      onShowToast(isEn ? '✓ Message sent to partner (Never visible to customer!)' : '✓ Bericht verzonden naar partner (Nooit zichtbaar voor klant!)');
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
                    {isEn ? 'Project Chat' : 'Projectchat'} · {projectCode}
                  </h2>
                  <p className="text-[11px] text-[#736B5E] font-medium leading-tight mt-0.5">
                    {isEn 
                      ? 'Available on every tab — same threads as Messages tab and Inbox.' 
                      : 'Beschikbaar op elk tabblad — zelfde threads als de Berichten-tab en de Inbox.'}
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
                  <span>{isEn ? 'Customer' : 'Klant'} · {clientName}</span>
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
                  <span>{isEn ? 'Partner' : 'Partner'} · {partnerName}</span>
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
                  <strong className="font-bold text-[#1E561E]">{isEn ? 'Channel: Customer' : 'Kanaal: klant'}</strong>{' '}
                  <span className="text-[#2D4A2D]">
                    {isEn 
                      ? '— this conversation is visible in customer portal and mirrors to WhatsApp/email.' 
                      : '— dit gesprek is zichtbaar in het klantportaal en spiegelt naar WhatsApp/mail.'}
                  </span>
                </div>
              ) : (
                <div className="bg-[#F7EBD9] border border-[#EAD3B9] rounded-xl p-3 text-xs leading-snug">
                  <strong className="font-bold text-[#9E5507]">{isEn ? 'Channel: Partner' : 'Kanaal: partner'}</strong>{' '}
                  <span className="text-[#693902]">
                    {isEn ? '— visible only to the partner, with WhatsApp mirror. ' : '— alleen zichtbaar voor de partner, met WhatsApp-spiegel. '}
                    <strong className="font-bold text-[#8C2703]">{isEn ? 'Never to customer.' : 'Nooit voor de klant.'}</strong>
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
                      activeChannel === 'klant' 
                        ? (isEn ? 'Message to customer...' : 'Bericht aan de klant...') 
                        : (isEn ? 'Message to partner...' : 'Bericht aan de partner...')
                    }
                    className="w-full text-xs font-semibold text-[#1C1C1A] placeholder-[#8A8478] focus:outline-none bg-transparent py-1"
                  />

                  <button
                    type="button"
                    onClick={handlePaperclipClick}
                    className="p-1.5 text-[#736B5E] hover:text-[#1C1C1A] cursor-pointer rounded-lg hover:bg-[#FAF8F5] transition-colors"
                    title={isEn ? "Attach file" : "Bijlage toevoegen"}
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
                  <span>{isEn ? 'Send' : 'Versturen'}</span>
                </button>
              </form>

              {/* SUBTEXT FOOTER NOTE */}
              <p className="text-[11px] text-[#736B5E] font-medium leading-tight text-center pt-0.5">
                {isEn 
                  ? 'Color and label switch with the channel — selecting the wrong channel is visually impossible.' 
                  : 'Kleur en label wisselen mee met het kanaal — verkeerd kanaal kiezen kan visueel niet ongemerkt.'}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null;
}
