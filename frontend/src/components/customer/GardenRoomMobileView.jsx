import React, { useState } from 'react';
import { MessageSquare, Sparkles, Smartphone, Check, ChevronRight, Calendar, ArrowRight, Eye } from 'lucide-react';
import timberSlatRender from '../../assets/wood_texture.png';

/**
 * GardenRoomMobileView Component (1-to-1 exact implementation of Client Mockup PDF Garden Rooms Screen 10 / Page 15)
 * 
 * Sleek 1px Thin Frame (Zero Thick Dark Bezel):
 * - Clean 1px border (border border-[#2B3827]/30 rounded-2xl shadow-sm)
 * - Proportional max-width (max-w-[250px] sm:max-w-[270px])
 * - Top Tag: Custom Garden Room — project 2026-021
 * - Page Title & Subtitle: Mobile View
 * - 3 Side-by-Side Interactive Phone Device Mockups (Overview, Render Viewer, Week Schedule)
 */
export default function GardenRoomMobileView({ project = null }) {
  const [feedbackToast, setFeedbackToast] = useState('');

  const projectCode = project?.id && project.id !== 'PRJ-853' ? project.id : '2026-021';

  return (
    <div className="space-y-3.5 font-body text-[#4A4A43] w-full">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed top-20 right-4 z-[9999] flex items-center gap-2 bg-primary text-cream px-3.5 py-2.5 rounded-xl shadow-xl border border-primary/20 text-xs font-medium">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* 1. TOP HEADER TAG BAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-dark/60">
        <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-md font-bold text-[11px]">
          Custom Garden Room — project {projectCode}
        </span>
        <div className="flex items-center gap-2">
          <span className="bg-cream border border-[#D6CFC2] px-2 py-0.5 rounded-md font-bold text-[10px]">
            Updates 3
          </span>
          <a
            href="https://wa.me/31682008025"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary text-cream px-2.5 py-0.5 rounded-xl text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1 shadow-xs"
          >
            <MessageSquare className="w-3 h-3 text-accent" />
            <span>WhatsApp us</span>
          </a>
        </div>
      </div>

      {/* 2. PAGE TITLE & SUBTITLE */}
      <div className="space-y-0.5">
        <h1 className="text-lg sm:text-xl font-heading font-bold text-primary flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-primary" />
          <span>Mobile View</span>
        </h1>
        <p className="text-[11px] sm:text-xs text-dark/70 font-medium">
          Same content, different priority: actions at the top, full-width renders with swipe, week bar compact.
        </p>
      </div>

      {/* 3. THREE SLEEK 1PX THIN PHONE DEVICE MOCKUP FRAMES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1 items-start justify-center">
        
        {/* PHONE MOCKUP 1: MOBILE OVERVIEW */}
        <div className="bg-[#FAF8F5] border border-[#2B3827]/30 rounded-2xl shadow-sm overflow-hidden max-w-[260px] sm:max-w-[270px] mx-auto w-full flex flex-col justify-between min-h-[440px]">
          {/* Sleek App Top Header */}
          <div className="bg-[#2B3827] px-3 py-2 flex items-center justify-between text-white border-b border-white/10">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="font-heading font-bold tracking-wider text-[10px] uppercase">VANUIT AMBACHT</span>
            </div>
            <span className="text-[8px] font-mono text-amber-300 bg-black/30 px-1.5 py-0.5 rounded font-bold">ONLINE</span>
          </div>

          {/* Phone Screen Body Content */}
          <div className="p-2.5 space-y-2 text-dark text-[11px] flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              {/* Greeting */}
              <h4 className="font-heading font-bold text-primary text-xs">
                Hoi Sander
              </h4>

              {/* Actions Block (Bronze/Orange Action Card) */}
              <div className="bg-[#FFFBF2] border border-[#E8D4B0] p-2 rounded-lg space-y-2 shadow-2xs">
                <span className="bg-[#B8860B] text-white text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full inline-block">
                  • 2 actions from you
                </span>

                {/* Action 1 */}
                <div className="space-y-1 border-b border-[#E8D4B0]/60 pb-1.5">
                  <h5 className="font-heading font-bold text-primary text-[10px]">
                    Schouwvoorstel goedkeuren
                  </h5>
                  <p className="text-[9px] text-dark/60 font-mono">do 27 aug · rond 10:00</p>
                  <button
                    type="button"
                    onClick={() => setFeedbackToast('Opened Survey Proposal on Mobile')}
                    className="w-full py-1 bg-[#B69661] text-white font-bold rounded text-[9px] hover:bg-[#A38250] transition-all shadow-xs"
                  >
                    Voorstel bekijken
                  </button>
                </div>

                {/* Action 2 */}
                <div className="space-y-1 pt-0.5">
                  <h5 className="font-heading font-bold text-primary text-[10px]">
                    Render versie 2 bekijken
                  </h5>
                  <p className="text-[9px] text-dark/60">schuifpui verplaatst</p>
                  <button
                    type="button"
                    onClick={() => setFeedbackToast('Opened Render Version 2 on Mobile')}
                    className="w-full py-1 bg-[#B69661] text-white font-bold rounded text-[9px] hover:bg-[#A38250] transition-all shadow-xs"
                  >
                    Render bekijken
                  </button>
                </div>
              </div>

              {/* Build Week Block */}
              <div className="bg-white border border-[#D8D2C5] p-2 rounded-lg space-y-1.5 shadow-2xs">
                <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-accent block">
                  BOUWWEEK
                </span>
                <h5 className="font-heading font-bold text-primary text-[10px]">
                  Week 41 & 42
                </h5>
                <p className="text-[9px] text-dark/60 font-mono">○ Voorlopig — definitief na de schouw</p>

                {/* Render Thumbnail */}
                <div className="h-16 w-full rounded-md overflow-hidden bg-[#B69661] border border-[#A4824D]/40 flex items-end p-1.5"
                     style={{ backgroundImage: `repeating-linear-gradient(90deg, #B69661, #B69661 8px, #A58450 8px, #A58450 10px)` }}>
                  <span className="bg-black/70 text-white font-mono text-[7px] font-bold px-1 py-0.5 rounded">
                    RENDER V2
                  </span>
                </div>

                <span className="font-heading font-bold text-[10px] text-primary block">
                  Jouw buitenverblijf
                </span>
              </div>
            </div>

            {/* Bottom Mobile Tab Bar */}
            <div className="bg-[#2B3827] text-white p-1.5 flex justify-around items-center text-[8px] font-mono font-bold">
              <span className="text-amber-300 underline">Overzicht</span>
              <span className="opacity-70">Renders</span>
              <span className="opacity-70">Planning</span>
              <span className="opacity-70">Updates</span>
              <span className="opacity-70">Contact</span>
            </div>
          </div>
        </div>

        {/* PHONE MOCKUP 2: MOBILE RENDER VIEWER */}
        <div className="bg-[#FAF8F5] border border-[#2B3827]/30 rounded-2xl shadow-sm overflow-hidden max-w-[260px] sm:max-w-[270px] mx-auto w-full flex flex-col justify-between min-h-[440px]">
          {/* Sleek App Top Header */}
          <div className="bg-[#2B3827] px-3 py-2 flex items-center justify-between text-white border-b border-white/10">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="font-heading font-bold tracking-wider text-[10px] uppercase">RENDERS</span>
            </div>
            <span className="text-[8px] font-mono text-amber-300 bg-black/30 px-1.5 py-0.5 rounded font-bold">SWIPE</span>
          </div>

          {/* Phone Screen Body Content */}
          <div className="p-2.5 space-y-2 text-dark text-[11px] flex-1 flex flex-col justify-between">
            <div className="space-y-1.5">
              <h4 className="font-heading font-bold text-primary text-[11px]">
                Jouw ontwerp
              </h4>
              <p className="text-[9px] text-dark/60 font-mono">Versie 2 · swipe voor alle aanzichten</p>

              {/* Full-width Timber Render Image */}
              <div className="h-24 w-full rounded-md overflow-hidden bg-[#B69661] border border-[#A4824D]/40 flex items-end p-1.5 shadow-inner"
                   style={{ backgroundImage: `repeating-linear-gradient(90deg, #B69661, #B69661 10px, #A58450 10px, #A58450 12px)` }}>
                <span className="bg-black/70 text-white font-mono text-[7px] font-bold px-1.5 py-0.5 rounded uppercase">
                  VOORAANICHT
                </span>
              </div>

              {/* 3 Thumbnails Grid */}
              <div className="grid grid-cols-3 gap-1 pt-0.5">
                <div className="h-10 bg-[#B69661] rounded border border-[#A4824D]/40" />
                <div className="h-10 bg-[#A58450] rounded border border-[#8E6F3E]/40" />
                <div className="h-10 bg-[#C2A36C] rounded border border-[#A88C56]/40" />
              </div>

              {/* What's New Card */}
              <div className="bg-white border border-[#D8D2C5] p-2 rounded-lg space-y-0.5 shadow-2xs">
                <h5 className="font-heading font-bold text-primary text-[10px]">
                  Wat is er nieuw in versie 2?
                </h5>
                <p className="text-[9px] text-dark/70">Schuifpui op zuid · overstek +40 cm</p>
              </div>

              {/* Action Buttons Row */}
              <div className="flex gap-1 pt-0.5">
                <button
                  type="button"
                  onClick={() => setFeedbackToast('Viewing All Mobile Views')}
                  className="flex-1 py-1 bg-[#2B3827] text-white font-bold rounded text-[9px] text-center shadow-xs"
                >
                  Alle aanzichten
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackToast('Leave Mobile Comment')}
                  className="flex-1 py-1 bg-white text-dark/80 border border-[#D6CFC2] font-bold rounded text-[9px] text-center shadow-2xs"
                >
                  Opmerking
                </button>
              </div>
            </div>

            {/* Bottom Mobile Tab Bar */}
            <div className="bg-[#2B3827] text-white p-1.5 flex justify-around items-center text-[8px] font-mono font-bold">
              <span className="opacity-70">Overzicht</span>
              <span className="text-amber-300 underline">Renders</span>
              <span className="opacity-70">Planning</span>
              <span className="opacity-70">Updates</span>
              <span className="opacity-70">Contact</span>
            </div>
          </div>
        </div>

        {/* PHONE MOCKUP 3: MOBILE WEEK SCHEDULE */}
        <div className="bg-[#FAF8F5] border border-[#2B3827]/30 rounded-2xl shadow-sm overflow-hidden max-w-[260px] sm:max-w-[270px] mx-auto w-full flex flex-col justify-between min-h-[440px]">
          {/* Sleek App Top Header */}
          <div className="bg-[#2B3827] px-3 py-2 flex items-center justify-between text-white border-b border-white/10">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="font-heading font-bold tracking-wider text-[10px] uppercase">PLANNING</span>
            </div>
            <span className="text-[8px] font-mono text-amber-300 bg-black/30 px-1.5 py-0.5 rounded font-bold">WEEK BY WEEK</span>
          </div>

          {/* Phone Screen Body Content */}
          <div className="p-2.5 space-y-2 text-dark text-[11px] flex-1 flex flex-col justify-between">
            <div className="space-y-1.5">
              <h4 className="font-heading font-bold text-primary text-[11px]">
                Week voor week
              </h4>
              <p className="text-[9px] text-dark/60 font-mono">◇ Voorlopig — definitief na de schouw</p>

              {/* Active Action Week Card */}
              <div className="bg-[#FFFBF2] border border-[#E8D4B0] p-2 rounded-lg space-y-1.5 shadow-2xs">
                <div className="space-y-0.5">
                  <h5 className="font-heading font-bold text-primary text-[10px]">
                    Wk 35 · Schouw
                  </h5>
                  <p className="text-[9px] text-dark/70 font-mono">do 27 aug · wacht op jouw akkoord</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFeedbackToast('Agreed Schedule on Mobile')}
                  className="w-full py-1 bg-[#B69661] text-white font-bold rounded text-[9px] text-center shadow-xs"
                >
                  Akkoord — plan in
                </button>
              </div>

              {/* Timeline Week Cards */}
              <div className="bg-white border border-[#D8D2C5] p-1.5 rounded space-y-0.5 shadow-2xs">
                <h6 className="font-heading font-bold text-primary text-[10px]">
                  Wk 39 · Voorbereiding
                </h6>
                <p className="text-[8.5px] text-dark/60">grondwerk & poeren</p>
              </div>

              <div className="bg-white border border-[#D8D2C5] p-1.5 rounded space-y-0.5 shadow-2xs">
                <h6 className="font-heading font-bold text-primary text-[10px]">
                  Wk 40 · Materialen
                </h6>
                <p className="text-[8.5px] text-dark/60">levering Douglas pakket</p>
              </div>

              <div className="bg-[#2B3827] text-white p-2 rounded space-y-0.5 shadow-xs">
                <h6 className="font-heading font-bold text-amber-300 text-[10px]">
                  Wk 41-42 · De bouw
                </h6>
                <p className="text-[8.5px] text-white/80">oplevering eind wk 42</p>
              </div>
            </div>

            {/* Bottom Mobile Tab Bar */}
            <div className="bg-[#2B3827] text-white p-1.5 flex justify-around items-center text-[8px] font-mono font-bold">
              <span className="opacity-70">Overzicht</span>
              <span className="opacity-70">Renders</span>
              <span className="text-amber-300 underline">Planning</span>
              <span className="opacity-70">Updates</span>
              <span className="opacity-70">Contact</span>
            </div>
          </div>
        </div>

      </div>

      {/* FOOTNOTE CAPTION */}
      <p className="text-[11px] text-dark/60 italic text-center pt-1">
        Mobile designs: overview, render viewer and week schedule in phone view.
      </p>
    </div>
  );
}
