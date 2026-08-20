import React, { useState } from 'react';
import { 
  Check, Calendar, Clock, MessageSquare, Download, Sparkles, AlertCircle, FileText, CheckCircle2 
} from 'lucide-react';
import { downloadDirectPdfFile } from '../../utils/pdfGenerator';

/**
 * GardenRoomPlanningView Component (1-to-1 implementation of Client Mockup PDF Garden Rooms Page 9)
 * 
 * Features:
 * - Top Header Tag Bar (Custom Garden Room — project 2026-021, Updates 3, WhatsApp us)
 * - Page Title & Subtitle
 * - Card 1: Build Timeline Header Box (DE BOUW VAN JOUW BUITENVERBLIJF, Week 41 & 42 · 5-16 Oct 2026, Tentative badge)
 * - Card 2: Site Survey Proposal Card (Ons voorstel voor de schouw, soft sage green Date box bg-[#EAF0E8] border-[#BACBB7], rich warm brown approve button bg-[#9B7A38], input field & secondary button)
 * - Bottom Grid:
 *   - Left 2/3 Column: Week-by-Week Timeline (6 stages: 33-34, 35, 39, 40, 41-42, +3mnd)
 *   - Right 1/3 Column:
 *     1. Prep Checklist (5 interactive checkboxes)
 *     2. Neighbour Letter Card (Burenbrief download PDF button)
 *     3. How Build Works Card (4 ground rules)
 */
export default function GardenRoomPlanningView({ project = null }) {
  const [feedbackToast, setFeedbackToast] = useState('');
  const [schouwApproved, setSchouwApproved] = useState(false);
  const [customDateNote, setCustomDateNote] = useState('');
  
  // Interactive Prep Checklist state
  const [checklist, setChecklist] = useState({
    access: true, // Toegang achtertuin min 1.20m
    clearSite: false, // Bouwplek leeg ±15m²
    power: false, // Stroompunt max 25m
    parking: false, // Parkeerplek bus & aanhanger
    neighbours: false // Buren geïnformeerd
  });

  const projectCode = project?.id || '2026-021';

  const toggleCheck = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
    setFeedbackToast('Preparation checklist updated!');
    setTimeout(() => setFeedbackToast(''), 3000);
  };

  const handleApproveSchouw = () => {
    setSchouwApproved(true);
    setFeedbackToast('Site survey appointment approved for Thursday 27 August 2026!');
    setTimeout(() => setFeedbackToast(''), 4000);
  };

  const handleRequestOtherDate = () => {
    if (!customDateNote.trim()) {
      setFeedbackToast('Please enter your preferred date/time first.');
      setTimeout(() => setFeedbackToast(''), 3000);
      return;
    }
    setFeedbackToast('Alternative date request submitted! We will contact you shortly.');
    setCustomDateNote('');
    setTimeout(() => setFeedbackToast(''), 4000);
  };

  const handleDownloadNeighbourLetter = () => {
    downloadDirectPdfFile('neighbour-letter');
    setFeedbackToast('Neighbour Notification Letter downloaded successfully!');
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

      {/* 1. TOP HEADER TAG BAR (1-to-1 Client Mockup) */}
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
          Planning & build
        </h1>
        <p className="text-xs sm:text-sm text-dark/70 font-medium">
          This is how your project progresses, week by week. If anything changes, you'll hear it right away — even if it's bad news.
        </p>
      </div>

      {/* 3. CARD 1: BUILD TIMELINE HEADER BOX */}
      <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-5 sm:p-6 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <span className="text-[10px] sm:text-[11px] uppercase font-mono font-bold tracking-wider text-accent">
            THE BUILD OF YOUR GARDEN ROOM
          </span>
          <span className="bg-[#FDF8EE] text-[#9E7B3B] border border-[#E8D4B0] px-3 py-1 rounded-full text-[11px] font-mono font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#9E7B3B]" />
            <span>Tentative — definitive after site survey</span>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-primary">
              Week 41 & 42 · 5 to 16 October 2026
            </h2>
            <p className="text-xs sm:text-sm text-dark/70 leading-relaxed font-medium">
              7 weeks to go. The specialist builds in about two weeks; delivery is at the end of week 42.
            </p>
          </div>

          <p className="text-[11px] text-dark/60 sm:text-right max-w-xs italic font-medium">
            Once the schedule is definitive, you will receive a calendar invitation per phase.
          </p>
        </div>
      </div>

      {/* 4. CARD 2: SITE SURVEY PROPOSAL CARD (Ons voorstel voor de schouw 1-to-1) */}
      <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-5 sm:p-6 rounded-2xl shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-[#D6CFC2]/60 pb-3">
          <h3 className="text-base sm:text-lg font-heading font-bold text-primary">
            Our proposal for the site survey
          </h3>
          <span className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full border transition-all ${
            schouwApproved 
              ? 'bg-[#E5F0E3] text-[#2D5A27] border-green-300' 
              : 'bg-[#FDF8EE] text-[#9E7B3B] border-[#E8D4B0]'
          }`}>
            {schouwApproved ? '✓ Site survey confirmed' : '• Awaiting your approval'}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-dark/70 leading-relaxed font-medium">
          Our specialist verifies measurements, ground condition, and garden access. Takes about 45 minutes; afterwards we finalize the entire schedule.
        </p>

        {/* Soft Sage-Green Date Highlight Box (1-to-1 Client Mockup) */}
        <div className="bg-[#EAF0E8] border border-[#BACBB7] p-4.5 rounded-2xl space-y-1.5 max-w-lg shadow-2xs">
          <div className="text-base sm:text-lg font-heading font-bold text-primary">
            Thursday 27 August 2026
          </div>
          <div className="text-xs sm:text-[13px] text-dark/80 font-medium leading-relaxed">
            around 10:00 · please have someone at home and back garden accessible
          </div>
        </div>

        {/* Action Button Row (Rich Warm Brown Button bg-[#9B7A38] 1-to-1) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleApproveSchouw}
            disabled={schouwApproved}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-2 ${
              schouwApproved
                ? 'bg-green-700 text-white cursor-default'
                : 'bg-[#9B7A38] text-white hover:bg-[#8A6B2F]'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{schouwApproved ? 'Approved & Scheduled' : 'Approve — schedule site survey'}</span>
          </button>

          <span className="text-[11px] sm:text-xs text-dark/60 italic font-medium">
            Modifications can be made free of charge up to 2 days in advance.
          </span>
        </div>

        {/* Custom Date Input Prompt */}
        <div className="pt-3 border-t border-[#D6CFC2]/60 space-y-2">
          <p className="text-xs sm:text-xs text-dark/70 font-medium">
            Does this day not suit you? Let us know when it works for you.
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5 max-w-xl">
            <input
              type="text"
              value={customDateNote}
              onChange={(e) => setCustomDateNote(e.target.value)}
              placeholder="For example: Friday works better, or after 16:00"
              className="flex-1 bg-white border border-[#D6CFC2] px-4 py-2.5 rounded-xl text-xs text-dark focus:outline-none focus:border-primary shadow-2xs placeholder:text-dark/40 font-medium"
            />
            <button
              type="button"
              onClick={handleRequestOtherDate}
              className="px-4 py-2.5 bg-[#FAF8F5] text-dark/80 border border-[#D6CFC2] text-xs font-bold rounded-xl hover:bg-gray-50 transition-all cursor-pointer shadow-2xs flex-shrink-0"
            >
              Request another day
            </button>
          </div>
        </div>
      </div>

      {/* 5. BOTTOM GRID: LEFT 2/3 COLUMN VS RIGHT 1/3 COLUMN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* LEFT COLUMN: WEEK BY WEEK TIMELINE (2 Columns wide) */}
        <div className="md:col-span-2 bg-[#FAF8F5] border border-[#D8D2C5] p-5 sm:p-6 rounded-2xl shadow-xs space-y-5">
          <h3 className="text-base sm:text-lg font-heading font-bold text-primary border-b border-[#D6CFC2]/60 pb-3">
            Week by week
          </h3>

          <div className="space-y-4">
            {/* Stage 1: 33-34 AUG (Completed) */}
            <div className="flex items-start gap-4 p-3.5 rounded-xl bg-white border border-[#D6CFC2] shadow-2xs">
              <div className="w-16 h-14 bg-[#E5E9E1] border border-[#C8D2C2] rounded-xl flex flex-col items-center justify-center text-center flex-shrink-0">
                <span className="text-xs font-heading font-bold text-primary">33–34</span>
                <span className="text-[9px] font-mono font-bold text-dark/50 uppercase">AUG</span>
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex justify-between items-center flex-wrap gap-1">
                  <h4 className="font-heading font-bold text-primary text-sm sm:text-base">
                    Design & working drawing
                  </h4>
                  <span className="bg-[#E5F0E3] text-[#2D5A27] text-[10px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                    <Check className="w-3 h-3 text-[#2D5A27]" />
                    <span>Completed</span>
                  </span>
                </div>
                <p className="text-xs sm:text-[13px] text-dark/70 leading-relaxed font-medium">
                  Render version 2 and working drawing are available in your portal.
                </p>
              </div>
            </div>

            {/* Stage 2: 35 24-28 AUG (Awaiting Approval) */}
            <div className="flex items-start gap-4 p-3.5 rounded-xl bg-white border-2 border-[#9B7A38]/50 shadow-xs">
              <div className="w-16 h-14 bg-[#9B7A38] text-cream rounded-xl flex flex-col items-center justify-center text-center flex-shrink-0">
                <span className="text-xs font-heading font-bold">35</span>
                <span className="text-[9px] font-mono font-bold text-cream/80 uppercase">24-28 AUG</span>
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex justify-between items-center flex-wrap gap-1">
                  <h4 className="font-heading font-bold text-primary text-sm sm:text-base">
                    On-site survey
                  </h4>
                  <span className="bg-[#FDF8EE] text-[#9E7B3B] border border-[#E8D4B0] text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                    • Proposal awaiting approval
                  </span>
                </div>
                <p className="text-xs sm:text-[13px] text-dark/70 leading-relaxed font-medium">
                  Verify measurements, ground condition, and access. Schedule finalized afterwards.
                </p>
              </div>
            </div>

            {/* Stage 3: 39 21-25 SEP (Tentative) */}
            <div className="flex items-start gap-4 p-3.5 rounded-xl bg-white border border-[#D6CFC2] shadow-2xs">
              <div className="w-16 h-14 bg-[#EDE9E3] border border-[#D8D2C5] rounded-xl flex flex-col items-center justify-center text-center flex-shrink-0">
                <span className="text-xs font-heading font-bold text-primary">39</span>
                <span className="text-[9px] font-mono font-bold text-dark/50 uppercase">21-25 SEP</span>
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex justify-between items-center flex-wrap gap-1">
                  <h4 className="font-heading font-bold text-primary text-sm sm:text-base">
                    Groundwork & preparation
                  </h4>
                  <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-amber-200">
                    ⚙ Tentative
                  </span>
                </div>
                <p className="text-xs sm:text-[13px] text-dark/70 leading-relaxed font-medium">
                  Groundwork and concrete pad footings. One day work; garden remains usable.
                </p>
              </div>
            </div>

            {/* Stage 4: 40 28 SEP-2 OCT (Tentative) */}
            <div className="flex items-start gap-4 p-3.5 rounded-xl bg-white border border-[#D6CFC2] shadow-2xs">
              <div className="w-16 h-14 bg-[#EDE9E3] border border-[#D8D2C5] rounded-xl flex flex-col items-center justify-center text-center flex-shrink-0">
                <span className="text-xs font-heading font-bold text-primary">40</span>
                <span className="text-[9px] font-mono font-bold text-dark/50 uppercase">28 SEP–2 OCT</span>
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex justify-between items-center flex-wrap gap-1">
                  <h4 className="font-heading font-bold text-primary text-sm sm:text-base">
                    Materials delivered
                  </h4>
                  <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-amber-200">
                    ⚙ Tentative
                  </span>
                </div>
                <p className="text-xs sm:text-[13px] text-dark/70 leading-relaxed font-medium">
                  Douglas package and roofing delivered — ± 15 m² storage space required.
                </p>
              </div>
            </div>

            {/* Stage 5: 41-42 5-16 OCT (Tentative - Build) */}
            <div className="flex items-start gap-4 p-3.5 rounded-xl bg-white border border-[#D6CFC2] shadow-2xs">
              <div className="w-16 h-14 bg-[#EDE9E3] border border-[#D8D2C5] rounded-xl flex flex-col items-center justify-center text-center flex-shrink-0">
                <span className="text-xs font-heading font-bold text-primary">41–42</span>
                <span className="text-[9px] font-mono font-bold text-dark/50 uppercase">5-16 OCT</span>
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex justify-between items-center flex-wrap gap-1">
                  <h4 className="font-heading font-bold text-primary text-sm sm:text-base">
                    The build
                  </h4>
                  <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-amber-200">
                    ⚙ Tentative
                  </span>
                </div>
                <p className="text-xs sm:text-[13px] text-dark/70 leading-relaxed font-medium">
                  Structure, roof, sliding door, electrical & floor. Final handover at end of week 42 with you.
                </p>
              </div>
            </div>

            {/* Stage 6: +3 mnd JAN (Upcoming) */}
            <div className="flex items-start gap-4 p-3.5 rounded-xl bg-white border border-[#D6CFC2] shadow-2xs">
              <div className="w-16 h-14 bg-[#EDE9E3] border border-[#D8D2C5] rounded-xl flex flex-col items-center justify-center text-center flex-shrink-0">
                <span className="text-xs font-heading font-bold text-primary">+3 mnd</span>
                <span className="text-[9px] font-mono font-bold text-dark/50 uppercase">JAN</span>
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex justify-between items-center flex-wrap gap-1">
                  <h4 className="font-heading font-bold text-primary text-sm sm:text-base">
                    3-month checkup
                  </h4>
                  <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                    Upcoming
                  </span>
                </div>
                <p className="text-xs sm:text-[13px] text-dark/70 leading-relaxed font-medium">
                  We follow up to ensure everything remains perfect — part of aftercare.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PREP CHECKLIST, NEIGHBOUR LETTER & BUILD RULES (1 Column wide) */}
        <div className="space-y-6">

          {/* 1. PREP CHECKLIST CARD (Zo bereid je de bouwweek voor) */}
          <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-5 rounded-2xl shadow-xs space-y-3">
            <h4 className="font-heading font-bold text-primary text-sm sm:text-base border-b border-[#D6CFC2]/60 pb-2">
              Preparing for build week
            </h4>

            <p className="text-[11px] sm:text-xs text-dark/70 leading-relaxed font-medium">
              Check off completed items — so we know as well. Detailed guide in documents.
            </p>

            <div className="space-y-2.5 pt-1 text-xs sm:text-[13px] text-dark/80">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checklist.access}
                  onChange={() => toggleCheck('access')}
                  className="mt-0.5 rounded text-primary focus:ring-primary w-4 h-4 border-[#D6CFC2] cursor-pointer"
                />
                <span className={checklist.access ? 'line-through text-dark/50' : 'font-medium'}>
                  Garden access at least 1.20 m wide
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checklist.clearSite}
                  onChange={() => toggleCheck('clearSite')}
                  className="mt-0.5 rounded text-primary focus:ring-primary w-4 h-4 border-[#D6CFC2] cursor-pointer"
                />
                <span className={checklist.clearSite ? 'line-through text-dark/50' : 'font-medium'}>
                  Build site cleared & accessible (± 15 m² extra space)
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checklist.power}
                  onChange={() => toggleCheck('power')}
                  className="mt-0.5 rounded text-primary focus:ring-primary w-4 h-4 border-[#D6CFC2] cursor-pointer"
                />
                <span className={checklist.power ? 'line-through text-dark/50' : 'font-medium'}>
                  Power outlet available within max 25 m
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checklist.parking}
                  onChange={() => toggleCheck('parking')}
                  className="mt-0.5 rounded text-primary focus:ring-primary w-4 h-4 border-[#D6CFC2] cursor-pointer"
                />
                <span className={checklist.parking ? 'line-through text-dark/50' : 'font-medium'}>
                  Parking space for van & trailer nearby
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checklist.neighbours}
                  onChange={() => toggleCheck('neighbours')}
                  className="mt-0.5 rounded text-primary focus:ring-primary w-4 h-4 border-[#D6CFC2] cursor-pointer"
                />
                <span className={checklist.neighbours ? 'line-through text-dark/50' : 'font-medium'}>
                  Neighbours notified about build week
                </span>
              </label>
            </div>
          </div>

          {/* 2. NEIGHBOUR LETTER CARD (ATTENT VOOR DE BUREN) */}
          <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-5 rounded-2xl shadow-xs space-y-3">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-accent block">
              COURTESY FOR NEIGHBOURS
            </span>

            <h4 className="font-heading font-bold text-primary text-sm sm:text-base">
              Ready-to-use neighbour letter
            </h4>

            <p className="text-[11px] sm:text-xs text-dark/70 leading-relaxed font-medium">
              Two weeks of construction generates some noise. We prepared a friendly notice letter to share with your neighbours — pre-filled with build dates.
            </p>

            <button
              type="button"
              onClick={handleDownloadNeighbourLetter}
              className="w-full px-4 py-2.5 bg-white text-dark/80 border border-[#D6CFC2] text-xs font-bold rounded-xl hover:bg-gray-50 transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-primary" />
              <span>Download neighbour letter (PDF)</span>
            </button>
          </div>

          {/* 3. HOW BUILD WORKS CARD (Zo verloopt de bouw) */}
          <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-5 rounded-2xl shadow-xs space-y-3">
            <h4 className="font-heading font-bold text-primary text-sm sm:text-base border-b border-[#D6CFC2]/60 pb-2">
              How the build works
            </h4>

            <ol className="space-y-2.5 text-xs sm:text-[13px] text-dark/80 font-medium">
              <li className="flex items-start gap-2.5">
                <span className="font-bold text-primary font-mono text-xs w-4 flex-shrink-0">1</span>
                <span>Specialist works on weekdays between 7:30 and 16:30.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-bold text-primary font-mono text-xs w-4 flex-shrink-0">2</span>
                <span>No need to stay home — only required at start and final handover.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-bold text-primary font-mono text-xs w-4 flex-shrink-0">3</span>
                <span>Every workday ends with a tidied-up garden.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-bold text-primary font-mono text-xs w-4 flex-shrink-0">4</span>
                <span>Questions during construction? Contact Tim & Bram anytime, evenings included.</span>
              </li>
            </ol>
          </div>

        </div>
      </div>
    </div>
  );
}
