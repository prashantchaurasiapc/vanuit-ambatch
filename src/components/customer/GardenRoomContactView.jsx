import React, { useState, useEffect } from 'react';
import { MessageSquare, Sparkles, Send, Paperclip, ChevronDown, ChevronUp, Check, Phone, Mail, Package } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../api/apiClient';

/**
 * GardenRoomContactView Component (1-to-1 implementation of Client Mockup PDF Garden Rooms Screen 8 & Screenshots 1 & 2)
 */
export default function GardenRoomContactView({ project = null }) {
  const { language } = useLanguage();
  const isNl = language === 'NL';
  const [feedbackToast, setFeedbackToast] = useState('');
  
  const defaultGardenMsgs = [
    {
      id: 1,
      sender: 'T&B',
      senderName: 'Bram (Admin)',
      time: isNl ? 'Gisteren 16:40' : 'Yesterday 16:40',
      text: isNl ? "Hoi Sander, render versie 2 staat in je portaal — schuifpui op het zuiden en het bredere overstek zijn verwerkt. Kijk even of dit hem is." : "Hi Sander, render version 2 is in your portal — sliding doors on the south side and the wider overhang are included. Take a look to see if this is it.",
      type: 'incoming'
    },
    {
      id: 2,
      sender: 'SV',
      senderName: 'Sander',
      time: isNl ? 'Gisteren 19:12 · gelezen' : 'Yesterday 19:12 · read',
      text: isNl ? "Ziet er heel strak uit! Eén vraag: kan de tegelvloer in het poolhouse iets donkerder?" : "Looks great! One question: can the flooring in the poolhouse be slightly darker?",
      type: 'outgoing'
    },
    {
      id: 3,
      sender: 'T&B',
      senderName: 'Bram (Admin)',
      time: isNl ? 'Gisteren 19:30' : 'Yesterday 19:30',
      text: isNl ? "Zeker — de 60x60 tegels zijn er ook in antraciet. Zelfde prijs. Ik zet twee voorbeelden in de volgende render zodat je visueel kunt kiezen." : "Certainly — the 60x60 tiles are also available in anthracite. Same price. I will put two examples in the next render so you can choose visually.",
      type: 'incoming'
    },
    {
      id: 4,
      sender: 'SV',
      senderName: 'Sander',
      time: isNl ? 'Vandaag 08:55 · gelezen' : 'Today 08:55 · read',
      text: isNl ? "Top. En de schouw op donderdag: mijn vrouw is dan thuis, is dat akkoord?" : "Perfect. And the site survey on Thursday: my wife will be home then, is that okay?",
      type: 'outgoing'
    },
    {
      id: 5,
      sender: 'T&B',
      senderName: 'Bram (Admin)',
      time: isNl ? 'Vandaag 09:02' : 'Today 09:02',
      text: isNl ? "Helemaal prima — als iemand de achtertuin open kan doen is het goed. Keur het voorstel even goed onder Planning & Bouw, dan staat hij vast." : "Totally fine — as long as someone can unlock the backyard it will be good. Please approve the proposal under Planning & Build so it's confirmed.",
      type: 'incoming'
    }
  ];

  const [messages, setMessages] = useState(defaultGardenMsgs);
  const [activeConvId, setActiveConvId] = useState(null);

  const activeChatProjectId = project?.id || project?.projectNumber || 'PRJ-2026-002';

  // Load messages from backend conversations API & synchronized local storage
  useEffect(() => {
    let isMounted = true;
    try {
      const stored = localStorage.getItem(`va_customer_chat_${activeChatProjectId}`);
      if (stored) {
        setMessages(JSON.parse(stored));
      } else {
        localStorage.setItem(`va_customer_chat_${activeChatProjectId}`, JSON.stringify(defaultGardenMsgs));
      }
    } catch (e) {}

    const loadChat = async () => {
      try {
        const res = await api.get(`/conversations/project/${activeChatProjectId}`);
        const customerChan = res?.data?.customerChannel;
        const convId = customerChan?.id || (res?.data?.id ? res.data.id : null);
        if (convId && isMounted) {
          setActiveConvId(convId);
          const msgRes = await api.get(`/conversations/${convId}/messages`);
          if (msgRes.success && Array.isArray(msgRes.data) && msgRes.data.length > 0 && isMounted) {
            const mapped = msgRes.data.map(m => ({
              id: m.id,
              sender: m.senderRole === 'customer' ? 'SV' : 'T&B',
              senderName: m.senderName || (m.senderRole === 'customer' ? 'Bjorn' : 'Bram'),
              time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today',
              text: m.content || m.message || m.text,
              type: m.senderRole === 'customer' ? 'outgoing' : 'incoming',
              role: m.senderRole || 'customer'
            }));
            setMessages(mapped);
            try {
              localStorage.setItem(`va_customer_chat_${activeChatProjectId}`, JSON.stringify(mapped));
            } catch (err) {}
          }
        }
      } catch (err) {
        try {
          const directRes = await api.get(`/conversations/${activeChatProjectId}/messages`);
          if (directRes.success && Array.isArray(directRes.data) && directRes.data.length > 0 && isMounted) {
            const mapped = directRes.data.map(m => ({
              id: m.id,
              sender: m.senderRole === 'customer' ? 'SV' : 'T&B',
              senderName: m.senderName || (m.senderRole === 'customer' ? 'Bjorn' : 'Bram'),
              time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today',
              text: m.content || m.message || m.text,
              type: m.senderRole === 'customer' ? 'outgoing' : 'incoming',
              role: m.senderRole || 'customer'
            }));
            setMessages(mapped);
            try {
              localStorage.setItem(`va_customer_chat_${activeChatProjectId}`, JSON.stringify(mapped));
            } catch (err) {}
          }
        } catch (e2) {}
      }
    };

    loadChat();

    // Real-time listener for incoming messages from Admin (Customer Channel)
    const handleIncomingChatMessage = (e) => {
      const detail = e.detail;
      if (!detail) return;
      if (detail.projectId === activeChatProjectId || !detail.projectId) {
        if (detail.message) {
          setMessages(prev => {
            if (prev.some(m => m.id === detail.message.id)) return prev;
            return [...prev, {
              ...detail.message,
              type: detail.message.role === 'admin' ? 'incoming' : 'outgoing'
            }];
          });
        }
      }
    };

    const handleStorageUpdate = (e) => {
      if (e.key === `va_customer_chat_${activeChatProjectId}`) {
        try {
          if (e.newValue) {
            setMessages(JSON.parse(e.newValue));
          }
        } catch (err) {}
      }
    };

    window.addEventListener('app_chat_message', handleIncomingChatMessage);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('app_chat_message', handleIncomingChatMessage);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [activeChatProjectId]);

  const [inputMsg, setInputMsg] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const projectCode = project?.id || '2026-021';

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const messageText = inputMsg.trim();
    setInputMsg('');

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const optimisticMsg = {
      id: `msg-${Date.now()}`,
      sender: 'SV',
      senderName: project?.customerName || project?.customer || 'Sander',
      time: isNl ? `Vandaag ${timeNow}` : `Today ${timeNow}`,
      text: messageText,
      type: 'outgoing',
      role: 'customer',
      createdAt: new Date().toISOString()
    };

    const nextMessages = [...messages, optimisticMsg];
    setMessages(nextMessages);

    // Save to shared localStorage so Admin receives it immediately
    try {
      localStorage.setItem(`va_customer_chat_${activeChatProjectId}`, JSON.stringify(nextMessages));
    } catch (err) {}

    // Dispatch global events for real-time reactivity in Admin ProjectChatDrawer
    window.dispatchEvent(new CustomEvent('app_chat_message', { detail: { projectId: activeChatProjectId, channel: 'customer', message: optimisticMsg } }));
    window.dispatchEvent(new Event('app_data_changed'));

    // Post to conversations API
    try {
      const targetId = activeConvId;
      if (targetId) {
        await api.post(`/conversations/${targetId}/messages`, {
          content: messageText
        });
      } else {
        const convRes = await api.get(`/conversations/project/${activeChatProjectId}`);
        const cId = convRes?.data?.customerChannel?.id;
        if (cId) {
          setActiveConvId(cId);
          await api.post(`/conversations/${cId}/messages`, { content: messageText });
        }
      }
    } catch (err) {
      console.warn('Could not post message:', err);
    }

    setFeedbackToast(isNl ? 'Bericht verstuurd naar Tim & Bram!' : 'Message sent to Tim & Bram!');
    setTimeout(() => setFeedbackToast(''), 3500);
  };

  const handleSampleRequest = () => {
    setFeedbackToast(isNl ? 'Gratis Douglas houtstalenpakket aangevraagd! Verzending binnen 24 uur.' : 'Free Douglas timber sample kit requested! Shipping within 24h.');
    setTimeout(() => setFeedbackToast(''), 3500);
  };

  const faqItems = [
    {
      question: isNl ? "Heb ik een vergunning nodig?" : "Do I need a permit?",
      answer: isNl ? "Voor jouw specifieke buitenverblijf is vergunningsvrij bouwen vastgesteld. De officiële vergunningscheck kun je downloaden onder Documenten." : "Permit-free construction has been established for your specific garden room. You can download the official permit check under Documents."
    },
    {
      question: isNl ? "Hoe lang duurt de bouw?" : "How long does construction take?",
      answer: isNl ? "De totale montagetijd in jouw tuin is 5 tot 10 werkdagen. In de werkplaats bereiden we alles tot op de millimeter voor." : "The total assembly time in your garden is 5 to 10 working days. In our workshop we prepare everything down to the millimeter."
    },
    {
      question: isNl ? "Moet ik thuisblijven tijdens de bouw?" : "Do I need to stay home during construction?",
      answer: isNl ? "Alleen de eerste dag voor afstemming en bij de oplevering aan het eind. Tussendoor kunnen onze meestertimmerlieden zelfstandig doorwerken." : "Only on the first day for alignment and at handover at the end. In between, our master carpenters keep construction on track independently."
    },
    {
      question: isNl ? "Hoe onderhoud ik Douglas hout?" : "How do I maintain Douglas timber?",
      answer: isNl ? "Douglas hout vergrijst natuurlijk onder invloed van zon en regen. Met onze speciale UV-beschermende olie behoud je de warme natuurlijke houtkleur." : "Douglas wood ages naturally under sun and rain. With our special UV-protective oil you preserve its warm natural color."
    },
    {
      question: isNl ? "Kan ik nog iets wijzigen?" : "Can I still change something?",
      answer: isNl ? "Tot de definitieve werktekening is goedgekeurd kun je kosteloos aanpassingen doorgeven. Zodra de prefabricage start in de werkplaats kan dit niet meer." : "Until the final working drawing is approved, you can request changes for free. Once pre-fabrication starts in the workshop, changes are no longer possible."
    }
  ];

  return (
    <div className="space-y-4 font-body text-[#4A4A43] w-full">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed top-20 right-4 z-[9999] flex items-center gap-2 bg-primary text-cream px-4 py-3 rounded-xl shadow-xl border border-primary/20 text-xs font-medium">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* 1. TOP HEADER TAG BAR (1-to-1 Client Mockup Screenshot 1) */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-dark/60">
        <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-md font-bold">
          {isNl ? `Buitenverblijf op maat — project ${projectCode}` : `Custom Garden Room — project ${projectCode}`}
        </span>
        <div className="flex items-center gap-2">
          <span className="bg-cream border border-[#D6CFC2] px-2 py-0.5 rounded-md font-bold text-[11px]">
            Updates 3
          </span>
          <a
            href="https://wa.me/31682008025"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary text-cream px-3 py-1 rounded-xl text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1 shadow-xs"
          >
            <MessageSquare className="w-3.5 h-3.5 text-accent" />
            <span>{isNl ? 'WhatsApp ons' : 'WhatsApp us'}</span>
          </a>
        </div>
      </div>

      {/* 2. PAGE TITLE & SUBTITLE */}
      <div className="space-y-0.5">
        <h1 className="text-xl sm:text-2xl font-heading font-bold text-primary">
          {isNl ? 'Berichten & Contact' : 'Messages & Contact'}
        </h1>
        <p className="text-xs text-dark/70 font-medium">
          {isNl ? 'Je appt niet met een bedrijf. Je appt met ons. Meestal binnen 2 uur antwoord, ook in het weekend en \'s avonds.' : 'You are not texting a company. You are texting us. Usually answered within 2 hours, also in the evenings.'}
        </p>
      </div>

      {/* 3. TWO-COLUMN MAIN CONTENT (1-to-1 Screenshot 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left Column: Chat Thread Card (2 Columns wide) */}
        <div className="lg:col-span-2 bg-[#FAF8F5] border border-[#D8D2C5] p-4 sm:p-4.5 rounded-2xl shadow-xs space-y-3 flex flex-col justify-between">
          
          {/* Chat Header */}
          <div className="flex justify-between items-center pb-2 border-b border-[#D6CFC2]/60">
            <h3 className="font-heading font-bold text-primary text-sm sm:text-base">
              {isNl ? 'Je gesprek met Tim & Bram' : 'Your conversation with Tim & Bram'}
            </h3>
            <span className="bg-[#E5F0E3] text-[#2D5A27] font-mono text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
              <Check className="w-3 h-3 text-[#2D5A27]" />
              <span>{isNl ? 'Alles gelezen' : 'All read'}</span>
            </span>
          </div>

          {/* Messages Thread List */}
          <div className="space-y-3 py-1 max-h-[420px] overflow-y-auto pr-1">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-2 ${msg.type === 'outgoing' ? 'justify-end' : 'justify-start'}`}>
                {msg.type === 'incoming' && (
                  <div className="w-7 h-7 rounded-full bg-[#2B3827] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    {msg.sender}
                  </div>
                )}

                <div className={`max-w-[85%] space-y-0.5 ${msg.type === 'outgoing' ? 'text-right' : 'text-left'}`}>
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed font-medium shadow-2xs ${
                    msg.type === 'outgoing' 
                      ? 'bg-[#2B3827] text-white rounded-tr-none' 
                      : 'bg-[#EAE6DD] text-dark rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>

                  <span className="text-[10px] font-mono text-dark/50 px-1 block">
                    {msg.senderName} · {msg.time}
                  </span>
                </div>

                {msg.type === 'outgoing' && (
                  <div className="w-7 h-7 rounded-full bg-[#5C4A38] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    {msg.sender}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSendMessage} className="pt-2 border-t border-[#D6CFC2]/60 flex items-center gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder={isNl ? "Typ je bericht..." : "Type your message..."}
              className="flex-1 bg-white border border-[#D6CFC2] px-3.5 py-2 rounded-xl text-xs font-medium focus:outline-none focus:border-primary text-dark"
            />

            <button
              type="button"
              onClick={() => {
                setFeedbackToast(isNl ? 'Foto-upload gereed! Selecteer een bestand.' : 'Photo upload ready! Select a file.');
                setTimeout(() => setFeedbackToast(''), 3000);
              }}
              className="px-3 py-2 bg-white border border-[#D6CFC2] text-dark/80 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1 cursor-pointer flex-shrink-0"
            >
              <Paperclip className="w-3.5 h-3.5 text-accent" />
              <span>{isNl ? 'Foto' : 'Photo'}</span>
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-[#2B3827] text-white text-xs font-bold rounded-xl hover:bg-[#1F291C] transition-all cursor-pointer flex-shrink-0 shadow-xs"
            >
              {isNl ? 'Versturen' : 'Send'}
            </button>
          </form>

        </div>

        {/* Right Column: 3 Sidebar Cards (1 Column wide) */}
        <div className="space-y-3">
          
          {/* Sidebar Card 1: DIRECT CONTACT */}
          <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-4 rounded-2xl shadow-xs space-y-2.5">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-accent block">
              {isNl ? 'DIRECT CONTACT' : 'DIRECT CONTACT'}
            </span>
            <h4 className="font-heading font-bold text-primary text-sm">
              Tim & Bram
            </h4>
            <p className="text-xs text-dark/70 leading-relaxed font-medium">
              {isNl ? 'Vaste contactpersonen voor je hele project — van eerste schets tot nazorg en bouwweek.' : 'Dedicated contacts for your entire project — from initial sketch to aftercare, including build week.'}
            </p>

            <div className="space-y-1.5 pt-1">
              <a
                href="https://wa.me/31682008025"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 bg-[#2B3827] text-white text-xs font-bold rounded-xl text-center block hover:bg-[#1F291C] transition-all shadow-xs"
              >
                {isNl ? 'WhatsApp ons' : 'WhatsApp us'}
              </a>

              <a
                href="tel:0682008025"
                className="w-full py-2 bg-white text-dark/80 border border-[#D6CFC2] text-xs font-bold rounded-xl text-center block hover:bg-gray-50 transition-all shadow-2xs"
              >
                {isNl ? 'Bel 06 82 00 80 25' : 'Call 06 82 00 80 25'}
              </a>

              <a
                href="mailto:info@vanuitambacht.nl"
                className="w-full py-2 bg-white text-dark/80 border border-[#D6CFC2] text-xs font-bold rounded-xl text-center block hover:bg-gray-50 transition-all shadow-2xs"
              >
                info@vanuitambacht.nl
              </a>
            </div>
          </div>

          {/* Sidebar Card 2: WE WORK WITHOUT SHOWROOM */}
          <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-4 rounded-2xl shadow-xs space-y-2.5">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-accent block">
              {isNl ? 'WIJ WERKEN ZONDER SHOWROOM' : 'WE WORK WITHOUT SHOWROOM'}
            </span>
            <p className="text-xs text-dark/70 leading-relaxed font-medium">
              {isNl ? 'Bewuste keuze: geen showroom betekent minder overhead en een scherpere prijs voor jou. Wil je het Douglas hout eerst in het echt zien en voelen? We sturen je graag gratis houtstalen op.' : 'Conscious choice: no showroom means lower overhead and a better price for you. Want to see or feel Douglas timber in real life? We send free samples.'}
            </p>

            <button
              type="button"
              onClick={handleSampleRequest}
              className="px-4 py-2 bg-[#9B7A38] text-white text-xs font-bold rounded-xl hover:bg-[#8A6B2F] transition-all shadow-xs inline-block"
            >
              {isNl ? 'Stuur mij houtstalen' : 'Send me wood samples'}
            </button>
          </div>

          {/* Sidebar Card 3: WHO BUILDS YOUR GARDEN ROOM */}
          <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-4 rounded-2xl shadow-xs space-y-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-accent block">
              {isNl ? 'WIE BOUWT JOUW BUITENVERBLIJF' : 'WHO BUILDS YOUR GARDEN ROOM'}
            </span>

            <div className="flex items-center gap-2 pt-0.5">
              <div className="w-6 h-6 rounded-full bg-[#5C4A38] text-white flex items-center justify-center text-[9px] font-bold">
                VS
              </div>
              <h5 className="font-heading font-bold text-primary text-xs">
                {isNl ? 'Een vakman uit ons netwerk' : 'A craftsman from our network'}
              </h5>
            </div>

            <p className="text-xs text-dark/70 leading-relaxed font-medium">
              {isNl ? 'Gecertificeerd en gespecialiseerd in houtbouw. Alles geregeld via ons — ook tijdens de bouwweek.' : 'Certified and specialized in timber construction. Everything arranged via us — including during build week.'}
            </p>
          </div>

        </div>

      </div>

      {/* 4. SECTION 2: FAQ ACCORDION (1-to-1 Screenshot 2) */}
      <div className="space-y-2 pt-2">
        <h3 className="font-heading font-bold text-primary text-base sm:text-lg">
          {isNl ? 'Veelgestelde vragen' : 'Frequently Asked Questions'}
        </h3>

        <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-4 rounded-2xl shadow-xs divide-y divide-[#D6CFC2]/60 space-y-2">
          {faqItems.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;

            return (
              <div key={idx} className="pt-2 first:pt-0">
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full flex justify-between items-center text-left gap-3 py-1 cursor-pointer group"
                >
                  <span className="font-heading font-bold text-xs sm:text-sm text-primary group-hover:text-accent transition-colors">
                    {faq.question}
                  </span>
                  <span className="text-dark/40 font-mono text-sm font-bold flex-shrink-0">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {isOpen && (
                  <p className="text-xs text-dark/70 leading-relaxed font-medium pt-1 pb-2 border-t border-[#D6CFC2]/30 mt-1">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
