import React, { useState } from 'react';
import { MessageSquare, Sparkles, Check, Download, Eye } from 'lucide-react';
import { downloadDirectPdfFile } from '../../utils/pdfGenerator';
import timberSlatRender from '../../assets/wood_texture.png';

/**
 * OutdoorKitchenDesignView Component (1-to-1 implementation of Client Mockup PDF Outdoor Kitchen Screen 8 / Page 19)
 * 
 * Clean Balanced Layout & Zero Empty Gaps:
 * - Top Tag Bar (Custom Outdoor Kitchen — project 2026-014, Updates 3, WhatsApp us)
 * - Render viewer banner card (Warm timber slat texture matching Page 19 1-to-1)
 * - Main content 2-column grid:
 *   - Left Column: Your Choices Card (Worktop, Storage, Water & Cooling) + About Thermo Fraké Card
 *   - Right Column: 2x2 Specs Grid Cards (AFMETINGEN, HOUTSOORT, UITSPARING, LEVERTIJD) + Working Drawing Card
 */
export default function OutdoorKitchenDesignView({ project = null }) {
  const [feedbackToast, setFeedbackToast] = useState('');

  const projectCode = project?.id && project.id !== 'PRJ-853' ? project.id : '2026-014';

  const handleDownloadDrawing = () => {
    downloadDirectPdfFile('working-drawing');
    setFeedbackToast('Downloaded Working Drawing Version 2 (PDF)!');
    setTimeout(() => setFeedbackToast(''), 3500);
  };

  return (
    <div className="space-y-4 font-body text-[#4A4A43] w-full">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed top-20 right-4 z-[9999] flex items-center gap-2 bg-primary text-cream px-4 py-3 rounded-xl shadow-xl border border-primary/20 text-xs font-medium">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* 1. TOP HEADER TAG BAR (1-to-1 Client Mockup PDF Page 19) */}
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
          Design & renders
        </h1>
        <p className="text-xs text-dark/70 font-medium">
          This is how your outdoor kitchen will look. View all details and materials.
        </p>
      </div>

      {/* 3. PHOTO BANNER CARD */}
      <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-3 sm:p-4 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-wrap justify-between items-center gap-2 pb-1">
          <h3 className="font-heading font-bold text-primary text-sm sm:text-base">
            Render viewer
          </h3>
          <span className="text-[11px] font-mono text-dark/60 bg-cream px-2.5 py-1 rounded-lg border border-[#D6CFC2] font-bold">
            • Version 2 · 14 August
          </span>
        </div>

        <div className="relative h-48 sm:h-64 w-full rounded-xl overflow-hidden bg-[#B69661] border border-[#A4824D]/40 flex items-end p-4 shadow-inner"
             style={{
               backgroundImage: `repeating-linear-gradient(90deg, #B69661, #B69661 14px, #A58450 14px, #A58450 16px, #C2A36C 16px, #C2A36C 28px)`
             }}>
          <div className="bg-[#4E3D2C]/85 backdrop-blur-xs text-white font-mono text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider shadow-sm">
            RENDER · FRONT VIEW · VERSION 2
          </div>
        </div>

        <p className="text-[11px] text-dark/60 italic">
          Impression based on your choices. Color and wood grain may vary in reality — wood is natural material.
        </p>
      </div>

      {/* 4. MAIN CONTENT GRID (Balanced Left vs Right Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        
        {/* LEFT COLUMN (2 Columns wide) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Your Choices Card */}
          <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-4 sm:p-5 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-base font-heading font-bold text-primary border-b border-[#D6CFC2]/60 pb-2">
              Your choices
            </h3>

            <div className="space-y-4 text-xs text-dark/80 font-medium">
              {/* Section 1: Worktop */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-accent block">
                  WORKTOP
                </span>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>Wooden worktop with ceramic stone inlay</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>Thermally treated Thermo Fraké wood — minimal movement</span>
                  </li>
                </ul>
              </div>

              {/* Section 2: Storage */}
              <div className="space-y-2 pt-2 border-t border-[#D6CFC2]/50">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-accent block">
                  STORAGE
                </span>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>Two soft-close drawers under worktop</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>One open compartment for wood or accessories</span>
                  </li>
                </ul>
              </div>

              {/* Section 3: Water & Cooling */}
              <div className="space-y-2 pt-2 border-t border-[#D6CFC2]/50">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-accent block">
                  WATER & COOLING
                </span>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>Tap & sink with connection to outdoor water supply</span>
                  </li>
                  <li className="flex items-start gap-2 text-dark/50 italic">
                    <span className="w-4 h-4 border border-dark/30 rounded-full flex-shrink-0 mt-0.5 inline-block" />
                    <span>Refrigerator — not selected | want to know the price?</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* About Thermo Fraké Info Card (Placed here in left column for exact vertical balance!) */}
          <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-4 sm:p-5 rounded-2xl space-y-2 text-xs text-dark/80 shadow-xs">
            <span className="text-[10px] sm:text-[11px] uppercase font-mono font-bold tracking-wider text-accent block">
              ABOUT THERMO FRAKÉ
            </span>
            <p className="leading-relaxed text-xs text-dark/70 font-medium">
              Thermally modified timber: heat treatment ensures minimal shrinkage and movement, without chemicals. Grays evenly and lasts 20 to 25 years.
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN (1 Column wide) */}
        <div className="space-y-4">
          
          {/* 2x2 Specs Grid Cards */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="bg-[#EDE9E3] border border-[#D8D2C5] p-3.5 sm:p-4 rounded-2xl space-y-1">
              <span className="text-[10px] sm:text-[11px] uppercase font-mono font-bold text-accent tracking-wider block">DIMENSIONS</span>
              <div className="text-base sm:text-lg font-bold text-primary font-heading">2.80 × 0.75</div>
              <div className="text-xs font-medium text-dark/70">meter, height 0.92 m</div>
            </div>

            <div className="bg-[#E3E8DF] border border-[#C8D2C2] p-3.5 sm:p-4 rounded-2xl space-y-1">
              <span className="text-[10px] sm:text-[11px] uppercase font-mono font-bold text-accent tracking-wider block">TIMBER TYPE</span>
              <div className="text-base sm:text-lg font-bold text-primary font-heading">Thermo Fraké</div>
              <div className="text-xs font-medium text-dark/70">lifespan 20 to 25 yrs</div>
            </div>

            <div className="bg-[#EDE9E3] border border-[#D8D2C5] p-3.5 sm:p-4 rounded-2xl space-y-1">
              <span className="text-[10px] sm:text-[11px] uppercase font-mono font-bold text-accent tracking-wider block">CUTOUT</span>
              <div className="text-base sm:text-lg font-bold text-primary font-heading">Big Green Egg</div>
              <div className="text-xs font-medium text-dark/70">Large, right of center</div>
            </div>

            <div className="bg-[#E3E8DF] border border-[#C8D2C2] p-3.5 sm:p-4 rounded-2xl space-y-1">
              <span className="text-[10px] sm:text-[11px] uppercase font-mono font-bold text-accent tracking-wider block">DELIVERY TIME</span>
              <div className="text-base sm:text-lg font-bold text-primary font-heading">3 to 5 weeks</div>
              <div className="text-xs font-medium text-dark/70">after your approval</div>
            </div>
          </div>

          {/* Working Drawing Card */}
          <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-4 rounded-2xl shadow-xs space-y-3">
            <div className="flex justify-between items-center border-b border-[#D6CFC2]/60 pb-2">
              <h4 className="font-heading font-bold text-primary text-sm">
                Working drawing
              </h4>
              <span className="bg-[#D7E3EC] text-[#2B4B68] text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">
                • New
              </span>
            </div>

            {/* Blueprint Drawing Preview Box */}
            <div className="w-full h-28 bg-[#5A6472] rounded-xl border border-[#485260] relative overflow-hidden flex flex-col justify-end p-3 shadow-inner">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="relative z-10 bg-[#232B20]/90 text-cream px-2 py-0.5 rounded-md text-[9px] font-mono tracking-wider uppercase font-bold self-start backdrop-blur-xs border border-white/10">
                DRAWING · VERSION 2
              </div>
            </div>

            <p className="text-[11px] text-dark/70 leading-relaxed font-medium">
              Shared on 12 August 2026. Contains all measurements, layout, and cutout placement — for review, so you know exactly what is being built.
            </p>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleDownloadDrawing}
                className="flex-1 px-3 py-1.5 bg-white text-dark/80 border border-[#D6CFC2] text-xs font-bold rounded-xl hover:bg-gray-50 transition-all cursor-pointer text-center shadow-2xs"
              >
                View drawing
              </button>

              <button
                type="button"
                onClick={handleDownloadDrawing}
                className="flex-1 px-3 py-1.5 bg-white text-dark/80 border border-[#D6CFC2] text-xs font-bold rounded-xl hover:bg-gray-50 transition-all cursor-pointer text-center shadow-2xs"
              >
                Download
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
