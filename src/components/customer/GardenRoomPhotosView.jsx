import React, { useState } from 'react';
import { MessageSquare, Sparkles, Camera, Image, Check, Heart, X } from 'lucide-react';


/**
 * GardenRoomPhotosView Component (1-to-1 implementation of Client Mockup PDF Garden Rooms Page 10 & Screenshot 1)
 * 
 * Features:
 * - Top Header Tag Bar (Custom Garden Room — project 2026-021, Updates 3, WhatsApp us)
 * - Page Title & Subtitle
 * - Section 1: WEEK 34 · DESIGN (Message box from Tim & Bram with New badge + Render Version 2 preview card)
 * - Section 2: UPCOMING MILESTONES (3 grey thumbnail cards: Week 39, Week 41, Week 42)
 * - Section 3: Instagram Consent Banner (Mag jouw buitenverblijf op onze Instagram?)
 */
export default function GardenRoomPhotosView({ project = null }) {
  const [feedbackToast, setFeedbackToast] = useState('');
  const [instagramChoice, setInstagramChoice] = useState(null); // 'yes' | 'no'

  const projectCode = project?.id || '2026-021';

  const handleInstagramConsent = (choice) => {
    setInstagramChoice(choice);
    if (choice === 'yes') {
      setFeedbackToast('Thank you! We will reach out for your best photo when your garden room is completed.');
    } else {
      setFeedbackToast('Understood! We respect your privacy.');
    }
    setTimeout(() => setFeedbackToast(''), 4000);
  };

  return (
    <div className="space-y-6 font-body text-[#4A4A43] max-w-5xl w-full mx-auto">
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
          Custom Garden Room — project {projectCode}
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
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-primary">
          Photos & updates
        </h1>
        <p className="text-xs sm:text-sm text-dark/70 font-medium">
          Follow the construction of your garden room — from ground breaking to handover. We send a message with every update.
        </p>
      </div>

      {/* 3. SECTION 1: WEEK 34 · DESIGN (1-to-1 Screenshot 1) */}
      <div className="space-y-3 pt-1">
        <span className="text-[10px] sm:text-[11px] uppercase font-mono font-bold tracking-wider text-accent block">
          WEEK 34 · DESIGN
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          
          {/* Left Message Box (2 Columns wide) */}
          <div className="md:col-span-2 bg-[#FAF8F5] border border-[#D8D2C5] p-5 sm:p-6 rounded-2xl shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-cream flex items-center justify-center font-bold text-xs font-mono shadow-2xs">
                  T&B
                </div>
                <div>
                  <h4 className="font-heading font-bold text-primary text-sm sm:text-base">
                    Update from Tim
                  </h4>
                  <p className="text-[11px] font-mono text-dark/60 font-medium">
                    14 August 2026
                  </p>
                </div>
              </div>

              <span className="bg-[#D7E3EC] text-[#2B4B68] text-[11px] font-mono font-bold px-3 py-1 rounded-full border border-[#B8D0E0]">
                • New
              </span>
            </div>

            <p className="text-xs sm:text-sm text-dark/80 leading-relaxed italic font-medium bg-white/60 p-4 rounded-xl border border-[#D6CFC2]/60">
              "Render version 2 is ready. We moved the sliding door to the south side — with the afternoon sun that will be the best spot. Next step is the site survey; the proposal is in your portal."
            </p>
          </div>

          {/* Right Render Preview Card (1 Column wide) */}
          <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-4 rounded-2xl shadow-xs space-y-3 flex flex-col">
            <div className="relative rounded-xl overflow-hidden h-36 bg-[#B89B72] border border-[#D6CFC2] shadow-inner flex-shrink-0">
              {/* Vertical Timber Plank Texture */}
              <div 
                className="absolute inset-0"
                style={{
                  backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 11px, rgba(0,0,0,0.18) 11px, rgba(0,0,0,0.18) 12px)',
                  backgroundColor: '#B89B72'
                }}
              />

              {/* Render Badge Overlay */}
              <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-md tracking-wider">
                RENDER · VERSION 2
              </div>
            </div>

            <div className="space-y-1 flex-1 flex flex-col justify-end">
              <h4 className="font-heading font-bold text-primary text-sm">
                Design completed
              </h4>
              <p className="text-xs text-dark/70 font-medium">
                All views are available under Design & renders.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 4. SECTION 2: UPCOMING MILESTONES (NOG TE KOMEN 1-to-1 Screenshot 1) */}
      <div className="space-y-3 pt-2">
        <span className="text-[10px] sm:text-[11px] uppercase font-mono font-bold tracking-wider text-accent block">
          UPCOMING MILESTONES
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Milestone 1: Week 39 */}
          <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-4 rounded-2xl shadow-xs space-y-3">
            <div className="h-32 bg-[#C8C2B8] rounded-xl flex items-end justify-start p-3 shadow-inner relative overflow-hidden">
              <span className="bg-black/40 text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                WEEK 39
              </span>
            </div>
            <h4 className="font-heading font-bold text-primary text-sm">
              Preparation & foundation
            </h4>
          </div>

          {/* Milestone 2: Week 41 */}
          <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-4 rounded-2xl shadow-xs space-y-3">
            <div className="h-32 bg-[#C8C2B8] rounded-xl flex items-end justify-start p-3 shadow-inner relative overflow-hidden">
              <span className="bg-black/40 text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                WEEK 41
              </span>
            </div>
            <h4 className="font-heading font-bold text-primary text-sm">
              Structure erected
            </h4>
          </div>

          {/* Milestone 3: Week 42 */}
          <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-4 rounded-2xl shadow-xs space-y-3">
            <div className="h-32 bg-[#C8C2B8] rounded-xl flex items-end justify-start p-3 shadow-inner relative overflow-hidden">
              <span className="bg-black/40 text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                WEEK 42
              </span>
            </div>
            <h4 className="font-heading font-bold text-primary text-sm">
              Delivery & handover
            </h4>
          </div>

        </div>
      </div>

      {/* 5. SECTION 3: INSTAGRAM CONSENT BANNER (1-to-1 Screenshot 1) */}
      <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-5 sm:p-6 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <h3 className="text-base sm:text-lg font-heading font-bold text-primary">
              May we share your garden room on our Instagram?
            </h3>
            <p className="text-xs sm:text-xs text-dark/70 leading-relaxed font-medium">
              Later, when it's built: send us your best photo. We never post anything without your permission, and your address or name will never be included.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => handleInstagramConsent('yes')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-2 ${
                instagramChoice === 'yes'
                  ? 'bg-green-700 text-white'
                  : 'bg-[#2B3827] text-white hover:bg-[#1F291C]'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-pink-300" />

              <span>Great, hold me to it</span>
            </button>

            <button
              type="button"
              onClick={() => handleInstagramConsent('no')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                instagramChoice === 'no'
                  ? 'bg-gray-200 text-dark/60'
                  : 'bg-white text-dark/80 border border-[#D6CFC2] hover:bg-gray-50'
              }`}
            >
              <span>Rather not</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
