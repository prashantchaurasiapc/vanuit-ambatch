import React, { useState } from 'react';
import { MessageSquare, Sparkles, Send, Paperclip, ChevronDown, ChevronUp, Check, Phone, Mail, Package } from 'lucide-react';

/**
 * OutdoorKitchenContactView Component (1-to-1 implementation of Client Mockup PDF Outdoor Kitchen Screen 8 & Screenshots 1 & 2)
 * 
 * Clean English Translation & Compact Left-Aligned Layout:
 * - All text translated into English
 * - Top Header Tag Bar (Custom Outdoor Kitchen — project 2026-014, Updates 3, WhatsApp us)
 * - Page Title & Subtitle (Messages & Contact)
 * - Two-Column Layout (Chat Thread Card + 3 Sidebar Cards)
 * - FAQ Accordion Section (Frequently Asked Questions with 5 expandable items)
 */
export default function OutdoorKitchenContactView({ project = null }) {
  const [feedbackToast, setFeedbackToast] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'T&B',
      senderName: 'Tim',
      time: 'today 09:12',
      text: "Hi Sander, the frame is assembled! I just put a few photos in your portal. This week we continue with the worktop.",
      type: 'incoming'
    },
    {
      id: 2,
      sender: 'SV',
      senderName: 'Sander',
      time: 'Today 09:40 · read',
      text: "Awesome. Question: can the sink be moved a bit further to the left?",
      type: 'outgoing'
    },
    {
      id: 3,
      sender: 'T&B',
      senderName: 'Tim',
      time: 'today 09:48',
      text: "Still possible, the worktop is not cut out yet. I will shift it 15 cm to the left and send you a photo of the marking this afternoon. Cost: zero.",
      type: 'incoming'
    },
    {
      id: 4,
      sender: 'SV',
      senderName: 'Sander',
      time: 'Today 10:02 · read',
      text: "Great, let's do that. And can delivery also take place on a Saturday?",
      type: 'outgoing'
    },
    {
      id: 5,
      sender: 'T&B',
      senderName: 'Tim',
      time: 'today 10:05',
      text: "In principle we schedule on weekdays. You will find our proposal under Planning & Delivery — if it doesn't fit, click \"Request another day\" and we will see what is possible.",
      type: 'incoming'
    }
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const projectCode = project?.id || '2026-014';

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'SV',
      senderName: 'Sander',
      time: 'Just now',
      text: inputMsg.trim(),
      type: 'outgoing'
    };

    setMessages([...messages, newMsg]);
    setInputMsg('');
    setFeedbackToast('Message sent to Tim & Bram!');
    setTimeout(() => setFeedbackToast(''), 3500);
  };

  const handleSampleRequest = () => {
    setFeedbackToast('Free wood sample kit requested! We will ship it within 24h.');
    setTimeout(() => setFeedbackToast(''), 3500);
  };

  const faqItems = [
    {
      question: "How long until my outdoor kitchen is installed?",
      answer: "On average 4 to 6 weeks after approval on the working drawing. We keep you constantly updated via photos and updates in your portal."
    },
    {
      question: "How do I maintain the timber?",
      answer: "We include a complete maintenance guide. We advise treating the wood 1 to 2 times a year with our special natural outdoor oil."
    },
    {
      question: "What is covered under warranty?",
      answer: "10-year factory warranty on the structure, stainless steel hardware, and soft-close drawer runners."
    },
    {
      question: "Can I still change something?",
      answer: "As long as the working drawing is not final, adjustments to layout or cutouts can be made free of charge."
    },
    {
      question: "What if the kitchen doesn't fit through the passage?",
      answer: "During site survey we check all passages and garden gates. Kitchens can be delivered in modular elements if the passage is narrow."
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
          Custom Outdoor Kitchen — project {projectCode}
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
            <span>WhatsApp us</span>
          </a>
        </div>
      </div>

      {/* 2. PAGE TITLE & SUBTITLE */}
      <div className="space-y-0.5">
        <h1 className="text-xl sm:text-2xl font-heading font-bold text-primary">
          Messages & Contact
        </h1>
        <p className="text-xs text-dark/70 font-medium">
          You are not texting a company. You are texting us. Usually answered within 2 hours, also in the evenings.
        </p>
      </div>

      {/* 3. TWO-COLUMN MAIN CONTENT (1-to-1 Screenshot 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left Column: Chat Thread Card (2 Columns wide) */}
        <div className="lg:col-span-2 bg-[#FAF8F5] border border-[#D8D2C5] p-4 sm:p-4.5 rounded-2xl shadow-xs space-y-3 flex flex-col justify-between">
          
          {/* Chat Header */}
          <div className="flex justify-between items-center pb-2 border-b border-[#D6CFC2]/60">
            <h3 className="font-heading font-bold text-primary text-sm sm:text-base">
              Your conversation with Tim & Bram
            </h3>
            <span className="bg-[#E5F0E3] text-[#2D5A27] font-mono text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
              <Check className="w-3 h-3 text-[#2D5A27]" />
              <span>All read</span>
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
              placeholder="Type your message..."
              className="flex-1 bg-white border border-[#D6CFC2] px-3.5 py-2 rounded-xl text-xs font-medium focus:outline-none focus:border-primary text-dark"
            />

            <button
              type="button"
              onClick={() => {
                setFeedbackToast('Photo upload ready! Select a file.');
                setTimeout(() => setFeedbackToast(''), 3000);
              }}
              className="px-3 py-2 bg-white border border-[#D6CFC2] text-dark/80 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1 cursor-pointer flex-shrink-0"
            >
              <Paperclip className="w-3.5 h-3.5 text-accent" />
              <span>Photo</span>
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-[#2B3827] text-white text-xs font-bold rounded-xl hover:bg-[#1F291C] transition-all cursor-pointer flex-shrink-0 shadow-xs"
            >
              Send
            </button>
          </form>

        </div>

        {/* Right Column: 3 Sidebar Cards (1 Column wide) */}
        <div className="space-y-3">
          
          {/* Sidebar Card 1: DIRECT CONTACT */}
          <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-4 rounded-2xl shadow-xs space-y-2.5">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-accent block">
              DIRECT CONTACT
            </span>
            <h4 className="font-heading font-bold text-primary text-sm">
              Tim & Bram
            </h4>
            <p className="text-xs text-dark/70 leading-relaxed font-medium">
              Dedicated contacts for your entire project — from initial sketch to aftercare.
            </p>

            <div className="space-y-1.5 pt-1">
              <a
                href="https://wa.me/31682008025"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 bg-[#2B3827] text-white text-xs font-bold rounded-xl text-center block hover:bg-[#1F291C] transition-all shadow-xs"
              >
                WhatsApp us
              </a>

              <a
                href="tel:0682008025"
                className="w-full py-2 bg-white text-dark/80 border border-[#D6CFC2] text-xs font-bold rounded-xl text-center block hover:bg-gray-50 transition-all shadow-2xs"
              >
                Call 06 82 00 80 25
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
              WE WORK WITHOUT SHOWROOM
            </span>
            <p className="text-xs text-dark/70 leading-relaxed font-medium">
              Conscious choice: no showroom means lower overhead and a better price for you. Want to see or feel wood in real life? We send free samples.
            </p>

            <button
              type="button"
              onClick={handleSampleRequest}
              className="px-4 py-2 bg-[#9B7A38] text-white text-xs font-bold rounded-xl hover:bg-[#8A6B2F] transition-all shadow-xs inline-block"
            >
              Send me wood samples
            </button>
          </div>

          {/* Sidebar Card 3: WHO BUILDS YOUR KITCHEN */}
          <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-4 rounded-2xl shadow-xs space-y-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-accent block">
              WHO BUILDS YOUR KITCHEN
            </span>

            <div className="flex items-center gap-2 pt-0.5">
              <div className="w-6 h-6 rounded-full bg-[#5C4A38] text-white flex items-center justify-center text-[9px] font-bold">
                VS
              </div>
              <h5 className="font-heading font-bold text-primary text-xs">
                A craftsman from our network
              </h5>
            </div>

            <p className="text-xs text-dark/70 leading-relaxed font-medium">
              Certified, and our dedicated maker for outdoor kitchens for years. Everything arranged via us — stays easy for you.
            </p>
          </div>

        </div>

      </div>

      {/* 4. SECTION 2: FAQ ACCORDION (1-to-1 Screenshot 2) */}
      <div className="space-y-2 pt-2">
        <h3 className="font-heading font-bold text-primary text-base sm:text-lg">
          Frequently Asked Questions
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
