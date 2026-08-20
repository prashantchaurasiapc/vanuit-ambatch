import React, { useState } from 'react';
import { MessageSquare, Sparkles, Smartphone, Check, ChevronRight, Calendar, ArrowRight, FileText } from 'lucide-react';
import timberSlatRender from '../../assets/wood_texture.png';

/**
 * OutdoorKitchenMobileView Component (1-to-1 exact implementation of Client Mockup PDF Outdoor Kitchen Screen 10 / Page 21)
 * 
 * Sleek 1px Thin Frame (Zero Thick Dark Bezel):
 * - Clean 1px border (border border-[#2B3827]/30 rounded-2xl shadow-sm)
 * - Proportional max-width (max-w-[250px] sm:max-w-[270px])
 * - Top Tag: Custom Outdoor Kitchen — project 2026-014
 * - Page Title & Subtitle: Mobile View
 * - 3 Side-by-Side Interactive Phone Device Mockups (Overview, Quote, Delivery Proposal)
 * - Bottom Status Legend Pill Badges (Action from you, Completed/paid, Our turn, New since last visit)
 */
export default function OutdoorKitchenMobileView({ project = null }) {
  const [feedbackToast, setFeedbackToast] = useState('');

  const projectCode = project?.id && project.id !== 'PRJ-853' ? project.id : '2026-014';

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
          Custom Outdoor Kitchen — project {projectCode}
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
          Same content, different priority: actions at the top, sticky approval and payment buttons at the bottom.
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

              {/* Action Card */}
              <div className="bg-[#FFFBF2] border border-[#E8D4B0] p-2 rounded-lg space-y-1.5 shadow-2xs">
                <span className="bg-[#B8860B] text-white text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full inline-block">
                  • 1 action from you
                </span>

                <div className="space-y-1">
                  <h5 className="font-heading font-bold text-primary text-[10px]">
                    Leveringsvoorstel goedkeuren
                  </h5>
                  <p className="text-[9px] text-dark/60 font-mono">di 15 sep · 13:00 - 16:00</p>
                  <button
                    type="button"
                    onClick={() => setFeedbackToast('Opened Delivery Proposal on Mobile')}
                    className="w-full py-1 bg-[#B69661] text-white font-bold rounded text-[9px] hover:bg-[#A38250] transition-all shadow-xs"
                  >
                    Voorstel bekijken
                  </button>
                </div>
              </div>

              {/* Status Card */}
              <div className="bg-white border border-[#D8D2C5] p-2 rounded-lg space-y-1 shadow-2xs">
                <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-accent block">
                  STATUS
                </span>
                <h5 className="font-heading font-bold text-primary text-[10px]">
                  In de werkplaats
                </h5>
                <p className="text-[9px] text-dark/60 font-mono">Stap 4 van 6 · levering week 38</p>

                {/* Workshop Photo Thumbnail */}
                <div className="h-16 w-full rounded-md overflow-hidden bg-[#B69661] border border-[#A4824D]/40 flex items-end p-1.5"
                     style={{ backgroundImage: `repeating-linear-gradient(90deg, #B69661, #B69661 8px, #A58450 8px, #A58450 10px)` }}>
                  <span className="bg-black/70 text-white font-mono text-[7px] font-bold px-1.5 py-0.5 rounded">
                    17 AUG
                  </span>
                </div>

                <span className="font-heading font-bold text-[10px] text-primary block">
                  Frame gemonteerd
                </span>
              </div>
            </div>

            {/* Bottom Mobile Tab Bar */}
            <div className="bg-[#2B3827] text-white p-1.5 flex justify-around items-center text-[8px] font-mono font-bold">
              <span className="text-amber-300 underline">Overzicht</span>
              <span className="opacity-70">Offerte</span>
              <span className="opacity-70">Planning</span>
              <span className="opacity-70">Foto's</span>
              <span className="opacity-70">Contact</span>
            </div>
          </div>
        </div>

        {/* PHONE MOCKUP 2: MOBILE QUOTE */}
        <div className="bg-[#FAF8F5] border border-[#2B3827]/30 rounded-2xl shadow-sm overflow-hidden max-w-[260px] sm:max-w-[270px] mx-auto w-full flex flex-col justify-between min-h-[440px]">
          {/* Sleek App Top Header */}
          <div className="bg-[#2B3827] px-3 py-2 flex items-center justify-between text-white border-b border-white/10">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="font-heading font-bold tracking-wider text-[10px] uppercase">MIJN OFFERTE</span>
            </div>
            <span className="text-[8px] font-mono text-amber-300 bg-black/30 px-1.5 py-0.5 rounded font-bold">AGREED</span>
          </div>

          {/* Phone Screen Body Content */}
          <div className="p-2.5 space-y-2 text-dark text-[11px] flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="bg-[#E5F0E3] text-[#2D5A27] border border-[#2D5A27]/20 p-1.5 rounded text-[9px] font-medium flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>Akkoord gegeven · 11 aug 2026 door Sander</span>
              </div>

              {/* Itemized Quote Card */}
              <div className="bg-white border border-[#D8D2C5] p-2 rounded-lg space-y-1.5 shadow-2xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-heading font-bold text-primary text-[10px]">
                      Buitenkeuken Thermo Fraké
                    </h5>
                    <p className="text-[8.5px] text-dark/60">240 × 80 cm · Big Green Egg Large</p>
                  </div>
                  <span className="font-bold font-mono text-[10px]">€ 3.495,00</span>
                </div>

                <div className="flex justify-between items-start pt-1 border-t border-[#D6CFC2]/50">
                  <div>
                    <h5 className="font-heading font-bold text-primary text-[10px]">
                      Kraan & wasbak
                    </h5>
                  </div>
                  <span className="font-bold font-mono text-[10px]">€ 425,00</span>
                </div>
              </div>

              {/* Dark Green Total Box */}
              <div className="bg-[#2B3827] text-white p-2.5 rounded-lg space-y-0.5 shadow-xs">
                <div className="flex justify-between items-center text-[9px] font-mono text-white/80">
                  <span>Totaal incl. btw</span>
                </div>
                <div className="text-sm font-bold font-mono text-amber-300">
                  € 3.920,00
                </div>
                <p className="text-[8px] text-white/70">50% betaald · 50% bij levering</p>
              </div>

              {/* Action Buttons Row */}
              <div className="flex gap-1 pt-0.5">
                <button
                  type="button"
                  onClick={() => setFeedbackToast('Tracking Project on Mobile')}
                  className="flex-1 py-1 bg-[#2B3827] text-white font-bold rounded text-[9px] text-center shadow-xs"
                >
                  Volg je project
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackToast('Downloaded Quote PDF on Mobile')}
                  className="py-1 px-2.5 bg-white text-dark/80 border border-[#D6CFC2] font-bold rounded text-[9px] text-center shadow-2xs"
                >
                  pdf
                </button>
              </div>
            </div>

            {/* Bottom Mobile Tab Bar */}
            <div className="bg-[#2B3827] text-white p-1.5 flex justify-around items-center text-[8px] font-mono font-bold">
              <span className="opacity-70">Overzicht</span>
              <span className="text-amber-300 underline">Offerte</span>
              <span className="opacity-70">Planning</span>
              <span className="opacity-70">Foto's</span>
              <span className="opacity-70">Contact</span>
            </div>
          </div>
        </div>

        {/* PHONE MOCKUP 3: MOBILE DELIVERY PROPOSAL */}
        <div className="bg-[#FAF8F5] border border-[#2B3827]/30 rounded-2xl shadow-sm overflow-hidden max-w-[260px] sm:max-w-[270px] mx-auto w-full flex flex-col justify-between min-h-[440px]">
          {/* Sleek App Top Header */}
          <div className="bg-[#2B3827] px-3 py-2 flex items-center justify-between text-white border-b border-white/10">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="font-heading font-bold tracking-wider text-[10px] uppercase">LEVERING</span>
            </div>
            <span className="text-[8px] font-mono text-amber-300 bg-black/30 px-1.5 py-0.5 rounded font-bold">PROPOSAL</span>
          </div>

          {/* Phone Screen Body Content */}
          <div className="p-2.5 space-y-2 text-dark text-[11px] flex-1 flex flex-col justify-between">
            <div className="space-y-1.5">
              <h4 className="font-heading font-bold text-primary text-[11px]">
                Ons voorstel
              </h4>
              <p className="text-[9px] text-dark/60 font-mono">Wacht op jouw akkoord</p>

              {/* Delivery Date Card */}
              <div className="bg-white border border-[#D8D2C5] p-2.5 rounded-lg space-y-1.5 shadow-2xs">
                <h5 className="font-heading font-bold text-primary text-[10px]">
                  Dinsdag 15 september
                </h5>
                <p className="text-[8.5px] text-dark/70 font-mono">
                  tussen 13:00 en 16:00 ± 1 uur, inclusief uitleg
                </p>

                <button
                  type="button"
                  onClick={() => setFeedbackToast('Agreed Delivery Day on Mobile')}
                  className="w-full py-1 bg-[#B69661] text-white font-bold rounded text-[9px] text-center shadow-xs"
                >
                  Akkoord — plan deze dag in
                </button>

                <button
                  type="button"
                  onClick={() => setFeedbackToast('Requested Another Delivery Day on Mobile')}
                  className="w-full py-1 bg-white text-dark/70 border border-[#D6CFC2] font-bold rounded text-[9px] text-center shadow-2xs"
                >
                  Andere dag aanvragen
                </button>
              </div>

              <p className="text-[8.5px] text-dark/50 italic leading-snug">
                Na akkoord: agenda-uitnodiging. Wijzigen kan kosteloos tot 3 dagen vooraf.
              </p>
            </div>

            {/* Bottom Mobile Tab Bar */}
            <div className="bg-[#2B3827] text-white p-1.5 flex justify-around items-center text-[8px] font-mono font-bold">
              <span className="opacity-70">Overzicht</span>
              <span className="opacity-70">Offerte</span>
              <span className="text-amber-300 underline">Planning</span>
              <span className="opacity-70">Foto's</span>
              <span className="opacity-70">Contact</span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. BOTTOM STATUS LEGEND PILL BADGES */}
      <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-3 rounded-2xl shadow-xs space-y-1.5 pt-2.5">
        <h4 className="font-heading font-bold text-primary text-[11px]">
          Legenda statussen
        </h4>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3.5 text-[9.5px] sm:text-[10px] font-medium text-dark/80">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B8860B] inline-block shadow-2xs" />
            <span>Actie van jou (brons/oranje)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2D5A27] inline-block shadow-2xs" />
            <span>Afgerond / betaald (groen)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D6CFC2] border border-[#A8A092] inline-block shadow-2xs" />
            <span>Wij zijn aan zet / nog niet beschikbaar (zand)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2B4B68] inline-block shadow-2xs" />
            <span>Nieuw sinds je vorige bezoek (blauw)</span>
          </div>
        </div>
      </div>

      {/* FOOTNOTE CAPTION */}
      <p className="text-[11px] text-dark/60 italic text-center pt-0.5">
        Mobile designs: overview, quote reference and delivery proposal in phone view.
      </p>
    </div>
  );
}
