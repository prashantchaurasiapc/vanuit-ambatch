import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Paperclip, Send, ChevronDown, CheckCircle, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/apiClient';
import { useLanguage } from '../../context/LanguageContext';

export default function ProjectChatInboxPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isEn = language !== 'NL';

  // Active filter tab
  const [activeFilter, setActiveFilter] = useState('all');

  // Backend state
  const [conversations, setConversations] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  // Quick reply & toast
  const [showQuickReplyMenu, setShowQuickReplyMenu] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [inputMessage, setInputMessage] = useState('');

  const messagesEndRef = useRef(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // 1. Fetch conversations from backend
  const loadConversations = async () => {
    try {
      setLoadingConvs(true);
      const res = await api.get('/conversations');
      if (res.success && Array.isArray(res.data)) {
        setConversations(res.data);
        if (res.data.length > 0 && !selectedChatId) {
          setSelectedChatId(res.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoadingConvs(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // 2. Fetch messages when selected chat changes
  const loadMessages = async (chatId) => {
    if (!chatId) return;
    try {
      setLoadingMessages(true);
      const res = await api.get(`/conversations/${chatId}/messages`);
      if (res.success && Array.isArray(res.data)) {
        setMessages(res.data);
      }
      // Mark read
      await api.patch(`/conversations/${chatId}/read`);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (selectedChatId) {
      loadMessages(selectedChatId);
    }
  }, [selectedChatId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Selected chat details
  const selectedChat = conversations.find(c => c.id === selectedChatId) || conversations[0] || null;

  // Filter conversations
  const filteredConversations = conversations.filter(chat => {
    if (activeFilter === 'customers' || activeFilter === 'Klanten') return chat.channelType === 'customer';
    if (activeFilter === 'partners' || activeFilter === 'Partners') return chat.channelType === 'partner';
    if (activeFilter === 'waiting' || activeFilter === 'Wacht op antwoord van ons') return (chat.unreadCount || 0) > 0;
    return true;
  });

  // Handle send message to backend
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedChatId) return;

    try {
      setSending(true);
      const res = await api.post(`/conversations/${selectedChatId}/messages`, {
        content: inputMessage.trim()
      });

      if (res.success) {
        setInputMessage('');
        await loadMessages(selectedChatId);
        await loadConversations();
        showToast('Bericht verzonden!');
      } else {
        showToast(res.error?.message || 'Verzenden mislukt');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      showToast('Fout bij versturen');
    } finally {
      setSending(false);
    }
  };

  const handleApplyQuickReply = (text) => {
    setInputMessage(text);
    setShowQuickReplyMenu(false);
  };

  const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-b border-[#D6CFC2]/60 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/projects')}
            className="p-1.5 px-2.5 bg-[#33422C] hover:bg-[#253120] text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center cursor-pointer mr-1"
            title="Terug naar Projecten Overzicht"
          >
            ←
          </button>
          <span className="font-bold text-[#33422C] font-serif text-sm">
            {isEn ? 'Project Management' : 'Projectenbeheer'}
          </span>
          <span className="text-dark/40">·</span>
          <span className="text-[#555046] font-mono text-[11px]">
            {isEn ? 'admin portal' : 'adminportaal'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/admin/projects/inbox-messages')}
            className="px-3 py-1 bg-white border border-[#33422C] text-[#33422C] rounded-xl font-bold text-xs shadow-2xs hover:bg-[#FAF8F5] cursor-pointer"
          >
            Inbox <strong className="text-[#33422C]">{conversations.length}</strong>
          </button>
          <span className="px-3 py-1 bg-[#FDF2E3] text-[#B86B14] border border-[#F6DCB8] rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            {totalUnread} {isEn ? 'unread' : 'ongelezen'}
          </span>
          <button 
            onClick={() => navigate('/admin/projects')}
            className="px-4 py-1.5 bg-[#33422C] hover:bg-[#283523] text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs transition-all"
          >
            {isEn ? '+ New project' : '+ Nieuw project'}
          </button>
        </div>
      </div>

      {/* PAGE TITLE & SUBTITLE */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#33422C]">
          Inbox
        </h1>
        <p className="text-xs sm:text-sm text-dark/60 font-body">
          {conversations.length} {isEn ? 'active channels · customer and partner conversations connected to the database.' : 'actieve kanalen · klant- en partnergesprekken gekoppeld aan de database.'}
        </p>
      </div>

      {/* FILTER PILLS ROW */}
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
        {[
          { key: 'all', label: isEn ? `All (${conversations.length})` : `Alles (${conversations.length})` },
          { key: 'customers', label: isEn ? `Customers (${conversations.filter(c => c.channelType === 'customer').length})` : `Klanten (${conversations.filter(c => c.channelType === 'customer').length})` },
          { key: 'partners', label: isEn ? `Partners (${conversations.filter(c => c.channelType === 'partner').length})` : `Partners (${conversations.filter(c => c.channelType === 'partner').length})` },
          { key: 'waiting', label: isEn ? 'Awaiting response from us' : 'Wacht op antwoord van ons' }
        ].map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive 
                  ? 'bg-[#33422C] text-white shadow-xs' 
                  : 'bg-white text-dark/70 border border-[#D6CFC2] hover:bg-[#FAF8F5]'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* MAIN TWO-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: CONVERSATIONS LIST (5 COLUMNS) */}
        <div className="lg:col-span-5 bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-2.5">
          {loadingConvs ? (
            <div className="py-12 flex flex-col items-center justify-center text-xs text-dark/50 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-[#33422C]" />
              {isEn ? 'Loading conversations...' : 'Gesprekken laden...'}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="py-12 text-center text-xs text-dark/40">
              {isEn ? 'No conversations found.' : 'Geen gesprekken gevonden.'}
            </div>
          ) : (
            filteredConversations.map((chat) => {
              const isSelected = selectedChatId === chat.id;
              const counterpartyName = chat.counterparty?.name || chat.title || (isEn ? 'Conversation' : 'Gesprek');
              const isKlant = chat.channelType === 'customer';
              const typeLabel = isKlant ? (isEn ? 'CUSTOMER' : 'KLANT') : (isEn ? 'PARTNER' : 'PARTNER');
              const projectCode = chat.project?.projectNumber || chat.conversationNumber;
              const lastText = chat.lastMessage?.content || (isEn ? 'No messages yet' : 'Nog geen berichten');

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
                        {counterpartyName}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md font-mono text-[9px] font-bold ${
                        isKlant 
                          ? 'bg-[#E3EFE3] text-[#2D6A2D]' 
                          : 'bg-[#FDF2E3] text-[#B86B14]'
                      }`}>
                        {typeLabel}
                      </span>
                    </div>

                    {(chat.unreadCount || 0) > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#82B382] text-white font-mono text-[10px] font-bold flex items-center justify-center">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-dark/70 font-body leading-snug line-clamp-2">
                    <span className="font-mono text-[11px] text-dark/50 font-bold mr-1">{projectCode}</span>
                    "{lastText}"
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT COLUMN: ACTIVE CHAT DETAIL (7 COLUMNS) */}
        <div className="lg:col-span-7 bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          
          {selectedChat ? (
            <>
              {/* HEADER OF ACTIVE CHAT */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E1D7] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-sans font-bold text-base text-[#2A2925]">
                      {selectedChat.counterparty?.name || selectedChat.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-md font-mono text-[9px] font-bold ${
                      selectedChat.channelType === 'customer' 
                        ? 'bg-[#E3EFE3] text-[#2D6A2D]' 
                        : 'bg-[#FDF2E3] text-[#B86B14]'
                    }`}>
                      {selectedChat.channelType === 'customer' ? (isEn ? 'CUSTOMER' : 'KLANT') : (isEn ? 'PARTNER' : 'PARTNER')}
                    </span>
                  </div>
                  <p className="text-xs text-dark/60 font-body mt-0.5">
                    {selectedChat.project 
                      ? `Project ${selectedChat.project.projectNumber} · ${selectedChat.project.name || selectedChat.title}`
                      : selectedChat.title}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/admin/projects')}
                    className="px-3.5 py-1.5 bg-white hover:bg-[#FAF8F5] text-dark/80 border border-[#D6CFC2] rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                  >
                    <span>{isEn ? 'Open project' : 'Open project'}</span>
                  </button>
                  <button
                    onClick={() => showToast(isEn ? `Calling initiated with ${selectedChat.counterparty?.name || 'contact'}` : `Bellen gestart met ${selectedChat.counterparty?.name || 'relatie'}`)}
                    className="px-3.5 py-1.5 bg-white hover:bg-[#FAF8F5] text-dark/80 border border-[#D6CFC2] rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    {isEn ? 'Call' : 'Bel'}
                  </button>
                </div>
              </div>

              {/* CHAT MESSAGES DISPLAY */}
              <div className="space-y-4 py-2 min-h-[220px] max-h-[380px] overflow-y-auto pr-1">
                {loadingMessages ? (
                  <div className="py-12 flex flex-col items-center justify-center text-xs text-dark/50 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-[#33422C]" />
                    {isEn ? 'Loading messages...' : 'Berichten laden...'}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-12 text-center text-xs text-dark/40">
                    {isEn ? 'No messages in this channel yet. Type below to send a message.' : 'Nog geen berichten in dit kanaal. Typ hieronder om een bericht te sturen.'}
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isAdmin = msg.senderRole === 'admin';
                    const timeFormatted = msg.createdAt 
                      ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '';

                    return (
                      <div key={msg.id} className="space-y-1">
                        <div className={`flex items-start gap-2.5 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                          {/* Avatar Circle */}
                          <div className={`w-7 h-7 rounded-full font-bold text-[10px] flex items-center justify-center flex-shrink-0 text-white font-mono ${
                            isAdmin ? 'bg-[#33422C]' : 'bg-[#6B655B]'
                          }`}>
                            {msg.senderInitials || (isAdmin ? 'T' : 'KL')}
                          </div>

                          {/* Bubble */}
                          <div className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                            isAdmin 
                              ? 'bg-[#33422C] text-white rounded-tr-xs shadow-xs' 
                              : 'bg-[#EDE8DF] text-[#2A2925] rounded-tl-xs'
                          }`}>
                            {msg.content}
                          </div>
                        </div>

                        <div className={`text-[10px] text-dark/50 px-10 ${isAdmin ? 'text-right' : 'text-left'}`}>
                          {msg.senderName} · {timeFormatted}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* INPUT FORM BAR */}
              <form onSubmit={handleSendMessage} className="space-y-2 pt-2">
                <div className="bg-white border border-[#D6CFC2] rounded-2xl p-2 flex flex-wrap sm:flex-nowrap items-center gap-2 shadow-2xs">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={isEn ? `Reply to ${(selectedChat.counterparty?.name || 'conversation').split(' ')[0]}...` : `Antwoord aan ${(selectedChat.counterparty?.name || 'gesprek').split(' ')[0]}...`}
                    className="flex-1 min-w-[120px] px-3 py-1.5 text-xs text-dark font-body focus:outline-none placeholder:text-dark/40"
                  />

                  <button
                    type="button"
                    onClick={() => showToast(isEn ? 'Attach file' : 'Bestand bijvoegen')}
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
                      <span className="hidden sm:inline">{isEn ? 'Quick reply' : 'Snel antwoord'}</span>
                      <span className="sm:hidden">{isEn ? 'Quick' : 'Snel'}</span>
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
                    disabled={sending}
                    className="px-3 sm:px-4 py-2 bg-[#33422C] hover:bg-[#283523] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
                  >
                    {sending ? (isEn ? 'Sending...' : 'Versturen...') : (isEn ? 'Send' : 'Versturen')}
                  </button>
                </div>

                <p className="text-[11px] text-dark/50 font-body leading-relaxed pt-1">
                  Snelle antwoorden: prijsindicatie-uitleg · geen-showroom-antwoord · leverweek-uitleg · "we zoeken het uit en komen er vandaag op terug".
                </p>
              </form>
            </>
          ) : (
            <div className="py-20 text-center text-xs text-dark/50">
              Selecteer een gesprek om berichten te bekijken.
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
