import React, { useState, useEffect } from 'react';
import { MessageSquare, Sparkles, Send, Paperclip, ChevronDown, ChevronUp, Check, Phone, Mail, Package } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../api/apiClient';

/**
 * OutdoorKitchenContactView Component (1-to-1 implementation of Client Mockup PDF Outdoor Kitchen Screen 8 & Screenshots 1 & 2)
 */
export default function OutdoorKitchenContactView({ project = null }) {
  const { language } = useLanguage();
  const isNl = language === 'NL';
  const [feedbackToast, setFeedbackToast] = useState('');

  const defaultCustMsgs = [
    {
      id: 1,
      sender: 'SV',
      senderName: 'Sander',
      time: isNl ? 'Vandaag 09:40 · gelezen' : 'Today 09:40 · read',
      text: isNl ? "Prachtige uitstraling. Vraagje: kan de spoelbak iets meer naar links?" : "Great look. Question: can the sink be moved a bit more to the left?",
      type: 'outgoing'
    },
    {
      id: 2,
      sender: 'T&B',
      senderName: 'Tim (Admin)',
      time: isNl ? 'Vandaag 09:48' : 'Today 09:48',
      text: isNl ? "Nog mogelijk, het blad is nog niet uitgezaagd. Ik laat hem 15 cm naar links schuiven en stuur je vanmiddag een foto van de aftekening. Kosten: nul." : "Still possible, the slab has not been cut out yet. I'll have it shifted 15 cm to the left and send you a photo of the marking this afternoon. Cost: zero.",
      type: 'incoming'
    }
  ];

  const [messages, setMessages] = useState(defaultCustMsgs);
  const [activeConvId, setActiveConvId] = useState(null);

  // Load messages from backend conversations API
  useEffect(() => {
    const pid = project?.id;
    if (!pid || pid === '2026-014' || pid === '2026-021') return;

    const loadChat = async () => {
      try {
        const res = await api.get(`/conversations/project/${pid}`);
        const customerChan = res?.data?.customerChannel;
        const convId = customerChan?.id || (res?.data?.id ? res.data.id : null);
        if (convId) {
          setActiveConvId(convId);
          const msgRes = await api.get(`/conversations/${convId}/messages`);
          if (msgRes.success && Array.isArray(msgRes.data) && msgRes.data.length > 0) {
            setMessages(msgRes.data.map(m => ({
              id: m.id,
              sender: m.senderRole === 'customer' ? 'SV' : 'T\u0026B',
              senderName: m.senderName || (m.senderRole === 'customer' ? 'Bjorn' : 'Tim'),
              time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today',
              text: m.content || m.message || m.text,
              type: m.senderRole === 'customer' ? 'outgoing' : 'incoming'
            })));
          }
        }
      } catch (err) {
        try {
          const directRes = await api.get(`/conversations/${pid}/messages`);
          if (directRes.success && Array.isArray(directRes.data) && directRes.data.length > 0) {
            setMessages(directRes.data.map(m => ({
              id: m.id,
              sender: m.senderRole === 'customer' ? 'SV' : 'T\u0026B',
              senderName: m.senderName || (m.senderRole === 'customer' ? 'Bjorn' : 'Tim'),
              time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today',
              text: m.content || m.message || m.text,
              type: m.senderRole === 'customer' ? 'outgoing' : 'incoming'
            })));
          }
        } catch (e2) {}
      }
    };

    loadChat();
  }, [project?.id]);

  const [inputMsg, setInputMsg] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const projectCode = project?.id || '2026-014';

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const messageText = inputMsg.trim();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const optimisticMsg = {
      id: Date.now(),
      sender: 'SV',
      senderName: 'Bjorn',
      time: `Today ${timeNow}`,
      text: messageText,
      type: 'outgoing'
    };

    // Optimistic update
    setMessages(prev => [...prev, optimisticMsg]);
    setInputMsg('');

    // Post to conversations API
    try {
      const targetId = activeConvId || (project?.id && project.id !== '2026-014' && project.id !== '2026-021' ? project.id : null);
      if (targetId) {
        await api.post(`/conversations/${targetId}/messages`, {
          content: messageText
        });
      }
    } catch (err) {
      console.warn('Could not post message:', err);
    }

    setFeedbackToast(isNl ? 'Bericht verstuurd naar Tim & Bram!' : 'Message sent to Tim & Bram!');
    setTimeout(() => setFeedbackToast(''), 3500);
  };

  const handleSampleRequest = () => {
    setFeedbackToast(isNl ? 'Gratis houtstalenpakket aangevraagd! We verzenden het binnen 24 uur.' : 'Free wood sample kit requested! We will ship it within 24h.');
    setTimeout(() => setFeedbackToast(''), 3500);
  };

  const faqItems = [
    {
      question: isNl ? "Hoe lang duurt het tot mijn buitenkeuken geplaatst wordt?" : "How long until my outdoor kitchen is installed?",
      answer: isNl ? "Gemiddeld 4 tot 6 weken na goedkeuring op de werktekening. We houden je continu op de hoogte via foto's en updates in je portaal." : "On average 4 to 6 weeks after approval on the working drawing. We keep you constantly updated via photos and updates in your portal."
    },
    {
      question: isNl ? "Hoe onderhoud ik het hout?" : "How do I maintain the timber?",
      answer: isNl ? "We leveren een complete onderhoudsgids mee. We adviseren het hout 1 tot 2 keer per jaar te behandelen met onze speciale natuurlijke buitenolie." : "We include a complete maintenance guide. We advise treating the wood 1 to 2 times a year with our special natural outdoor oil."
    },
    {
      question: isNl ? "Wat valt er onder de garantie?" : "What is covered under warranty?",
      answer: isNl ? "10 jaar fabrieksgarantie op de constructie, het rvs beslag en de soft-close ladegeleiders." : "10-year factory warranty on the structure, stainless steel hardware, and soft-close drawer runners."
    },
    {
      question: isNl ? "Kan ik nog iets wijzigen?" : "Can I still change something?",
      answer: isNl ? "Zolang de werktekening niet definitief is, kunnen aanpassingen aan indeling of uitsparingen kosteloos worden doorgevoerd." : "As long as the working drawing is not final, adjustments to layout or cutouts can be made free of charge."
    },
    {
      question: isNl ? "Wat als de keuken niet door de doorgang past?" : "What if the kitchen doesn't fit through the passage?",
      answer: isNl ? "Tijdens de inmeting controleren we alle doorgangen en tuinpoorten. Keukens kunnen in modulaire delen geleverd worden als de doorgang krap is." : "During site survey we check all passages and garden gates. Kitchens can be delivered in modular elements if the passage is narrow."
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
          {isNl ? `Buitenkeuken op maat — project ${projectCode}` : `Custom Outdoor Kitchen — project ${projectCode}`}
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
              {isNl ? 'Vaste contactpersonen voor je hele project — van eerste schets tot nazorg.' : 'Dedicated contacts for your entire project — from initial sketch to aftercare.'}
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
              {isNl ? 'Bewuste keuze: geen showroom betekent minder overhead en een scherpere prijs voor jou. Wil je het hout eerst in het echt zien en voelen? We sturen je graag gratis houtstalen op.' : 'Conscious choice: no showroom means lower overhead and a better price for you. Want to see or feel wood in real life? We send free samples.'}
            </p>

            <button
              type="button"
              onClick={handleSampleRequest}
              className="px-4 py-2 bg-[#9B7A38] text-white text-xs font-bold rounded-xl hover:bg-[#8A6B2F] transition-all shadow-xs inline-block"
            >
              {isNl ? 'Stuur mij houtstalen' : 'Send me wood samples'}
            </button>
          </div>

          {/* Sidebar Card 3: WHO BUILDS YOUR KITCHEN */}
          <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-4 rounded-2xl shadow-xs space-y-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-accent block">
              {isNl ? 'WIE BOUWT JOUW KEUKEN' : 'WHO BUILDS YOUR KITCHEN'}
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
              {isNl ? 'Gecertificeerd en al jaren onze vaste maker voor buitenkeukens. Alles geregeld via ons — blijft voor jou overzichtelijk.' : 'Certified, and our dedicated maker for outdoor kitchens for years. Everything arranged via us — stays easy for you.'}
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
