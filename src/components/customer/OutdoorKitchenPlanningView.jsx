import React, { useState } from 'react';
import { 
  Check, Calendar, Clock, MessageSquare, Sparkles, AlertCircle, Wrench, Truck, CheckCircle2 
} from 'lucide-react';

/**
 * OutdoorKitchenPlanningView Component (1-to-1 implementation of Client Mockup PDF Outdoor Kitchen Screen 4 & Screenshot 1)
 * 
 * Meticulous 1-to-1 visual parity:
 * - Top Header Tag Bar (Custom Outdoor Kitchen — project 2026-014, Updates 3, WhatsApp us)
 * - Page Title & Subtitle
 * - Card 1: Expected Delivery Header Box (VERWACHTE LEVERING, Week 38 · 14-18 Sept 2026, soft green pill bg-[#E5F0E3] text-[#2D5A27])
 * - Card 2: Delivery Proposal Card (Ons voorstel voor de levering, soft sage green Date box bg-[#EAF0E8] border-[#BACBB7], rich warm brown approve button bg-[#9B7A38], input field & secondary button)
 * - Bottom Grid:
 *   - Left 2/3 Column: Detailed Project Timeline (10 steps with expanded active workshop detail box "In de werkplaats")
 *   - Right 1/3 Column:
 *     1. How Delivery Works Card (4 delivery steps)
 *     2. How You Can Help Us Checklist (4 interactive delivery prep checkboxes)
 */
export default function OutdoorKitchenPlanningView({ project = null }) {
  const [feedbackToast, setFeedbackToast] = useState('');
  const [deliveryApproved, setDeliveryApproved] = useState(false);
  const [customDateNote, setCustomDateNote] = useState('');
  
  // Interactive Prep Checklist state
  const [checklist, setChecklist] = useState({
    passage: true, // Vrije doorgang min 90 cm
    flatGround: true, // Vlakke, stevige ondergrond
    someonePresent: false, // Iemand aanwezig
    parking: false // Parkeergelegenheid bus
  });

  const projectCode = project?.id || '2026-014';

  const toggleCheck = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
    setFeedbackToast('Delivery prep checklist updated!');
    setTimeout(() => setFeedbackToast(''), 3000);
  };

  const handleApproveDelivery = () => {
    setDeliveryApproved(true);
    setFeedbackToast('Delivery appointment approved for Tuesday 15 September 2026!');
    setTimeout(() => setFeedbackToast(''), 4000);
  };

  const handleRequestOtherDate = () => {
    if (!customDateNote.trim()) {
      setFeedbackToast('Please enter your preferred delivery date/time first.');
      setTimeout(() => setFeedbackToast(''), 3000);
      return;
    }
    setFeedbackToast('Alternative delivery date request submitted! We will contact you shortly.');
    setCustomDateNote('');
    setTimeout(() => setFeedbackToast(''), 4000);
  };

  const timelineSteps = [
    {
      title: 'Inquiry received',
      date: '14 July 2026 · via Instagram',
      status: 'completed'
    },
    {
      title: 'Price indication sent',
      date: '15 July 2026 · via WhatsApp',
      status: 'completed'
    },
    {
      title: 'Quote sent',
      date: '21 July 2026 · OF-2026325',
      status: 'completed'
    },
    {
      title: 'Approval & order confirmed',
      date: '11 August 2026 · order dispatched to specialist craftsman',
      status: 'completed'
    },
    {
      title: 'Working drawing shared',
      date: '12 August 2026 · version 2, for review',
      status: 'completed'
    },
    {
      title: 'Materials received',
      date: '14 August 2026 · Thermo Fraké timber and ceramic stones',
      status: 'completed'
    },
    {
      title: 'In the workshop',
      date: 'Started 17 August 2026',
      status: 'active',
      activeBoxText: 'Frame and cabinet modules are assembled. This week: finishing the worktop and sawing out the Big Green Egg cutout. Afterwards the entire kitchen receives a natural oil treatment as agreed.'
    },
    {
      title: 'Final quality inspection by Tim & Bram',
      date: 'Around 10 September 2026',
      status: 'pending'
    },
    {
      title: 'Delivery & installation',
      date: 'Week 38 · 14 to 18 September 2026',
      status: 'pending'
    },
    {
      title: 'Aftercare & warranty',
      date: 'From completion · warranty & maintenance support',
      status: 'pending'
    }
  ];

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
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-primary">
          Planning & delivery
        </h1>
        <p className="text-xs sm:text-sm text-dark/70 font-medium">
          This is how your project progresses. If anything changes, you'll hear it right away from us — even if it's bad news.
        </p>
      </div>

      {/* 3. CARD 1: EXPECTED DELIVERY HEADER BOX (Matching Screenshot 1) */}
      <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-5 sm:p-6 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <span className="text-[10px] sm:text-[11px] uppercase font-mono font-bold tracking-wider text-accent">
            EXPECTED DELIVERY
          </span>
          {/* Soft Green Pill matching Screenshot 1 */}
          <span className="bg-[#E5F0E3] text-[#2D5A27] px-3 py-1 rounded-full text-[11px] font-mono font-bold flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-[#2D5A27]" />
            <span>On schedule</span>
          </span>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-primary">
            Week 38 · 14 to 18 September 2026
          </h2>
          <p className="text-xs sm:text-sm text-dark/70 leading-relaxed font-medium">
            We make a proposal for day and time slot — approval takes just one click.
          </p>
        </div>
      </div>

      {/* 4. CARD 2: DELIVERY PROPOSAL CARD (Ons voorstel voor de levering 1-to-1 Screenshot 1) */}
      <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-5 sm:p-6 rounded-2xl shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-[#D6CFC2]/60 pb-3">
          <h3 className="text-base sm:text-lg font-heading font-bold text-primary">
            Our proposal for delivery
          </h3>
          {/* Soft Amber Pill matching Screenshot 1 */}
          <span className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full border transition-all ${
            deliveryApproved 
              ? 'bg-[#E5F0E3] text-[#2D5A27] border-green-300' 
              : 'bg-[#FDF8EE] text-[#9E7B3B] border-[#E8D4B0]'
          }`}>
            {deliveryApproved ? '✓ Delivery date confirmed' : '• Awaiting your approval'}
          </span>
        </div>

        {/* Soft Sage-Green Date Highlight Box (1-to-1 Client Mockup Screenshot 1) */}
        <div className="bg-[#EAF0E8] border border-[#BACBB7] p-4.5 rounded-2xl space-y-1.5 max-w-lg shadow-2xs">
          <div className="text-base sm:text-lg font-heading font-bold text-primary">
            Tuesday 15 September 2026
          </div>
          <div className="text-xs sm:text-[13px] text-dark/80 font-medium leading-relaxed">
            between 13:00 and 16:00 · two of us will come and we will take about an hour, including explanation
          </div>
        </div>

        {/* Action Button Row (Rich Warm Brown Button bg-[#9B7A38] 1-to-1) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleApproveDelivery}
            disabled={deliveryApproved}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-2 ${
              deliveryApproved
                ? 'bg-green-700 text-white cursor-default'
                : 'bg-[#9B7A38] text-white hover:bg-[#8A6B2F]'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{deliveryApproved ? 'Approved & Confirmed' : 'Approve — schedule this day'}</span>
          </button>

          <span className="text-[11px] sm:text-xs text-dark/60 italic font-medium">
            Modifications can be made free of charge up to 3 days in advance.
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
              placeholder="For example: Thursday works better, or morning only"
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

        {/* LEFT COLUMN: DETAILED PROJECT TIMELINE (2 Columns wide) */}
        <div className="md:col-span-2 bg-[#FAF8F5] border border-[#D8D2C5] p-5 sm:p-6 rounded-2xl shadow-xs space-y-5">
          <h3 className="text-base sm:text-lg font-heading font-bold text-primary border-b border-[#D6CFC2]/60 pb-3">
            Timeline of your project
          </h3>

          <div className="space-y-4 relative pl-1">
            {timelineSteps.map((step, index) => {
              const isCompleted = step.status === 'completed';
              const isActive = step.status === 'active';

              return (
                <div key={index} className="flex gap-4 relative">
                  {/* Vertical Connector Line */}
                  {index < timelineSteps.length - 1 && (
                    <div className={`w-0.5 absolute left-3.5 top-6 bottom-0 -mb-4 ${
                      isCompleted ? 'bg-primary/60' : isActive ? 'bg-[#9B7A38]' : 'bg-gray-200'
                    }`} />
                  )}

                  {/* Circle Icon Indicator */}
                  <div className="relative z-10 flex-shrink-0">
                    {isCompleted && (
                      <div className="w-7 h-7 rounded-full bg-primary text-cream flex items-center justify-center shadow-2xs">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                    {isActive && (
                      <div className="w-7 h-7 rounded-full bg-[#9B7A38] text-cream flex items-center justify-center shadow-xs ring-4 ring-[#9B7A38]/20">
                        <Wrench className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {!isCompleted && !isActive && (
                      <div className="w-7 h-7 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center" />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 pb-2 space-y-1">
                    <div className="flex justify-between items-start flex-wrap gap-1">
                      <h4 className={`font-heading font-bold text-sm sm:text-base ${
                        isActive ? 'text-primary' : 'text-primary'
                      }`}>
                        {step.title}
                      </h4>
                    </div>

                    <p className="text-[11px] sm:text-xs font-mono text-dark/60 font-medium">
                      {step.date}
                    </p>

                    {/* Active Workshop Expanded Box (In de werkplaats 1-to-1) */}
                    {isActive && step.activeBoxText && (
                      <div className="mt-2.5 p-4 bg-[#EAE6DD] border border-[#C8C2B4] rounded-xl text-xs sm:text-[13px] text-dark/85 leading-relaxed space-y-1 shadow-2xs font-medium">
                        <p>{step.activeBoxText}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: HOW DELIVERY WORKS & PREP CHECKLIST (1 Column wide) */}
        <div className="space-y-6">

          {/* 1. HOW DELIVERY WORKS CARD (Zo verloopt de levering) */}
          <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-5 rounded-2xl shadow-xs space-y-3">
            <h4 className="font-heading font-bold text-primary text-sm sm:text-base border-b border-[#D6CFC2]/60 pb-2">
              How delivery works
            </h4>

            <ol className="space-y-3 text-xs sm:text-[13px] text-dark/80 font-medium">
              <li className="flex items-start gap-2.5">
                <span className="font-bold text-primary font-mono text-xs w-4 flex-shrink-0">1</span>
                <span>Two of us will arrive and deliver directly to the exact location where your kitchen will stand.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-bold text-primary font-mono text-xs w-4 flex-shrink-0">2</span>
                <span>We level the kitchen precisely and inspect all drawers and soft-close hinges.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-bold text-primary font-mono text-xs w-4 flex-shrink-0">3</span>
                <span>You receive detailed instructions on usage, care, and initial timber maintenance.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-bold text-primary font-mono text-xs w-4 flex-shrink-0">4</span>
                <span>Together we complete the handover checklist. Finished in about an hour.</span>
              </li>
            </ol>
          </div>

          {/* 2. PREP CHECKLIST CARD (Zo help je ons) */}
          <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-5 rounded-2xl shadow-xs space-y-3">
            <h4 className="font-heading font-bold text-primary text-sm sm:text-base border-b border-[#D6CFC2]/60 pb-2">
              How you can help us
            </h4>

            <p className="text-[11px] sm:text-xs text-dark/70 leading-relaxed font-medium">
              Check off completed items — so we know as well.
            </p>

            <div className="space-y-2.5 pt-1 text-xs sm:text-[13px] text-dark/80">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checklist.passage}
                  onChange={() => toggleCheck('passage')}
                  className="mt-0.5 rounded text-primary focus:ring-primary w-4 h-4 border-[#D6CFC2] cursor-pointer"
                />
                <span className={checklist.passage ? 'line-through text-dark/50' : 'font-medium'}>
                  Clear garden access pathway at least 90 cm wide
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checklist.flatGround}
                  onChange={() => toggleCheck('flatGround')}
                  className="mt-0.5 rounded text-primary focus:ring-primary w-4 h-4 border-[#D6CFC2] cursor-pointer"
                />
                <span className={checklist.flatGround ? 'line-through text-dark/50' : 'font-medium'}>
                  Flat, solid ground surface at final installation spot
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checklist.someonePresent}
                  onChange={() => toggleCheck('someonePresent')}
                  className="mt-0.5 rounded text-primary focus:ring-primary w-4 h-4 border-[#D6CFC2] cursor-pointer"
                />
                <span className={checklist.someonePresent ? 'line-through text-dark/50' : 'font-medium'}>
                  Someone present during the delivery time slot
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
                  Parking space for delivery van nearby
                </span>
              </label>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
