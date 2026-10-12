import React from 'react';
import Card from '../Card';
import Badge from '../Badge';
import { 
  CheckCircle2, Clock, Calendar, FileText, Camera, Phone, 
  MessageSquare, ArrowRight, Check, AlertCircle, Receipt, Folder
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

/**
 * OutdoorKitchenOverview Component (Step 4 - Overview UI Implementation)
 * 
 * 1-to-1 implementation of the client's Outdoor Kitchen Overview design (Mockup 1).
 * Features:
 * 1. Project Header Banner
 * 2. 6-Stage Progress Timeline (Request -> Quote -> Approval & Design -> In Workshop -> Delivery -> Aftercare)
 * 3. Current Phase Status Box ("Where your project stands")
 * 4. Customer Action Section ("What we still need from you")
 * 5. Latest Workshop Photo Update Card
 * 6. 3 Side Summary Cards (Delivery, Payment, Documents)
 * 7. Vertical Activity Log ("Your timeline")
 * 8. Fixed Contact Person Card (Tim & Bram with WhatsApp/Call)
 */
export default function OutdoorKitchenOverview({ project = null }) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isNl = language === 'NL';

  // Fallback mock data matching client brief 1-to-1 if project fields missing
  const custName = project?.customer || 'Sander';
  const firstName = custName.split(' ')[0];
  const projectName = project?.name || (isNl ? 'Luxe Teak Buitenkeuken Den Haag' : 'Outdoor Kitchen Thermo Fraké - 240 x 80 cm');
  const projectSub = project?.subtext || (isNl ? 'met uitsparing voor jouw Big Green Egg Large' : 'with cutout for your Big Green Egg Large');
  const targetDelivery = project?.expectedDelivery || (isNl ? '15 november 2026' : '15 November 2026');
  const projectCode = project?.projectNumber || project?.id || '2026-014';

  // 6-Stage Timeline Configuration
  const stages = [
    { key: 'request', label: isNl ? 'Aanvraag' : 'Request', status: 'completed' },
    { key: 'quote', label: isNl ? 'Offerte' : 'Quote', status: 'completed' },
    { key: 'design', label: isNl ? 'Akkoord & ontwerp' : 'Approval & design', status: 'completed' },
    { key: 'workshop', label: isNl ? 'In de werkplaats' : 'In the workshop', status: 'current' },
    { key: 'delivery', label: isNl ? 'Levering' : 'Delivery', status: 'upcoming' },
    { key: 'aftercare', label: isNl ? 'Nazorg' : 'Aftercare', status: 'upcoming' },
  ];

  return (
    <div className="space-y-5 font-body text-[#4A4A43] max-w-5xl w-full">

      {/* 1. PROJECT HEADER GREETING */}
      <div className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-dark/60">
          <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-md font-bold">
            {isNl ? 'Maatwerk Buitenkeuken' : 'Custom Outdoor Kitchen'} — project {projectCode}
          </span>
          <div className="flex items-center gap-2">
            <span className="bg-cream border border-[#D6CFC2] px-2 py-0.5 rounded-md font-bold text-[11px]">
              {isNl ? '3 Updates' : 'Updates 3'}
            </span>
            <a
              href="https://wa.me/31682008025"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-cream px-3 py-1 rounded-xl text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1"
            >
              <MessageSquare className="w-3.5 h-3.5 text-accent" />
              <span>{isNl ? 'WhatsApp ons' : 'WhatsApp us'}</span>
            </a>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-primary pt-1">
          {isNl ? 'Hallo' : 'Hi'} {firstName}
        </h1>
        <p className="text-xs text-dark/70 font-medium">
          {projectName} — {projectSub}
        </p>
      </div>

      {/* 2. 6-STAGE PROGRESS TIMELINE & CURRENT PHASE BOX */}
      <div className="bg-[#EDE8DF] border border-[#C4BEB3] p-4 sm:p-6 rounded-2xl shadow-xs space-y-5">
        {/* Progress Bar Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#D6CFC2] pb-3">
          <span className="text-[11px] uppercase font-mono font-bold tracking-wider text-accent">
            {isNl ? 'STATUS VAN JOUW PROJECT' : 'WHERE YOUR PROJECT STANDS'}
          </span>
          <div className="text-xs font-mono font-bold text-primary">
            {isNl ? 'Verwachte levering:' : 'Target Delivery:'}{' '}
            <span className="text-dark font-normal">{targetDelivery}</span>
          </div>
        </div>

        {/* 6-Stage Timeline Track */}
        <div className="relative pt-2 pb-4">
          <div className="grid grid-cols-6 gap-1 relative z-10 text-center">
            {stages.map((stg, idx) => {
              const isCompleted = stg.status === 'completed';
              const isCurrent = stg.status === 'current';

              return (
                <div key={stg.key} className="flex flex-col items-center space-y-1.5 group">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? 'bg-primary text-cream shadow-xs'
                        : isCurrent
                        ? 'bg-primary text-cream ring-4 ring-primary/20 scale-110 font-bold'
                        : 'bg-white border border-[#D6CFC2] text-dark/40'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 text-cream" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs leading-tight font-medium ${
                      isCurrent
                        ? 'text-primary font-bold font-heading'
                        : isCompleted
                        ? 'text-dark/80 font-semibold'
                        : 'text-dark/40'
                    }`}
                  >
                    {stg.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Connecting Line Track */}
          <div className="absolute top-[22px] left-[8%] right-[8%] h-0.5 bg-[#D6CFC2] -z-0">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: '60%' }} />
          </div>
        </div>

        {/* Active Phase Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#D6CFC2]">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold text-accent">
              {isNl ? 'WAT ER NU GEBEURT' : 'WHAT IS HAPPENING NOW'}
            </span>
            <p className="text-xs text-dark/90 leading-relaxed font-medium">
              {isNl
                ? 'Het massieve Thermo Fraké frame is gemonteerd en de kastmodules zijn geplaatst. Deze week wordt het werkblad afgewerkt en de uitsparing voor jouw Big Green Egg met de hand vervaardigd.'
                : 'The solid Thermo Fraké frame is assembled and cabinet modules are mounted. This week the worktop is being finished and the cutout for your Big Green Egg is being crafted.'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold text-accent">
              {isNl ? 'WAT HIERNA VOLGT' : 'WHAT COMES NEXT'}
            </span>
            <p className="text-xs text-dark/90 leading-relaxed font-medium">
              {isNl
                ? 'Definitieve kwaliteitscontrole door Tim & Bram (rond 10 september). Daarna nemen we contact op om een passend bezorgmoment met je af te stemmen.'
                : 'Final quality check by Tim & Bram (around 10 September). After that, we will call you to confirm a convenient delivery time slot.'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. CUSTOMER ACTION SECTION */}
      {(() => {
        const defaultActs = [
          {
            id: 1,
            status: 'Open',
            title: isNl ? 'Levervoorstel goedkeuren' : 'Approve delivery proposal',
            subtitle: isNl 
              ? 'Ons voorstel: Dinsdag 15 september, tussen 13:00 en 16:00. Schikt dit voor jou? Klik hieronder om te bevestigen of een ander moment aan te vragen.'
              : 'We propose: Tuesday 15 September, between 13:00 and 16:00. Does this work for you? Click below to confirm or request a different time.',
            actionType: 'proposal'
          }
        ];
        
        // Use default actions (loaded from project data via parent component)
        const acts = defaultActs;
        const openActs = acts.filter(a => a.status === 'Open');

        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-primary text-sm sm:text-base">
                {isNl ? 'Wat we nog van jou nodig hebben' : 'What we still need from you'}
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                openActs.length > 0
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-green-100 text-green-900 border border-green-300'
              }`}>
                {openActs.length}{' '}
                {isNl 
                  ? (openActs.length === 1 ? 'actie voor jou' : 'acties voor jou')
                  : (openActs.length === 1 ? 'action for you' : 'actions for you')}
              </span>
            </div>

            {/* Dynamic Open Action Cards */}
            {openActs.map((action, idx) => (
              <div key={action.id} className="bg-[#FFFDF9] border border-amber-300 rounded-xl p-4 shadow-xs space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="space-y-1 flex-1">
                    <h4 className="font-heading font-bold text-primary text-xs sm:text-sm">
                      {action.title}
                    </h4>
                    <p className="text-xs text-dark/80">
                      {action.subtitle}
                    </p>
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigate('/customer/project?tab=planning')}
                        className="px-4 py-2 bg-primary text-cream text-xs font-bold rounded-xl hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
                      >
                        {isNl ? 'Voorstel bekijken & akkoord geven' : 'View Proposal & Confirm'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Information Box: No action required if empty */}
            {openActs.length === 0 && (
              <div className="bg-green-50/70 border border-green-200 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-green-900">
                <CheckCircle2 className="w-4 h-4 text-green-700 flex-shrink-0" />
                <span>
                  <strong className="font-bold">
                    {isNl ? 'Geen verdere actie vereist op dit moment.' : 'No further action needed right now.'}
                  </strong>{' '}
                  {isNl
                    ? 'Alle voorbereidingen zijn bevestigd. We bouwen met zorg aan jouw buitenkeuken in de werkplaats!'
                    : 'All checklist items are confirmed. We are crafting your kitchen in the workshop!'}
                </span>
              </div>
            )}
          </div>
        );
      })()}

      {/* 4. MAIN CONTENT GRID (Workshop Photo & Side Summary Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left Column (2 cols): Latest Workshop Photo Update */}
        <div className="md:col-span-2 space-y-3">
          <Card title={isNl ? 'Laatste update uit de werkplaats' : 'Latest update from the workshop'} icon={Camera}>
            <div className="space-y-3 font-body">
              {/* Photo Preview Container */}
              <div className="relative w-full aspect-[16/9] bg-[#2A3425] rounded-xl overflow-hidden shadow-xs border border-[#D6CFC2] group">
                <img
                  src="/outdoor_project_card.png"
                  alt="Workshop Photo Update"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute top-2 right-2 bg-primary text-cream text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                  {isNl ? 'Nieuw' : 'New'}
                </div>
                <div className="absolute bottom-2 left-2 bg-dark/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-1 rounded-md">
                  {isNl ? 'FOTO — 17 AUGUSTUS 2026' : 'PHOTO — 17 AUGUST 2026'}
                </div>
              </div>

              {/* Photo Caption & Action */}
              <div className="space-y-2">
                <h4 className="font-heading font-bold text-primary text-sm">
                  {isNl ? 'Frame gemonteerd & geschuurd' : 'Frame assembled & sanded'}
                </h4>
                <p className="text-xs text-dark/80 leading-relaxed">
                  {isNl 
                    ? 'Het massieve Thermo Fraké houten frame is op maat gezaagd en samengesteld. Prachtig om te zien hoe egaal deze houtpartij uitvalt.'
                    : 'The solid Thermo Fraké timber frame is cut to size and assembled. Great to see how even this wood batch turned out.'}
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => navigate('/customer/photos')}
                    className="px-3.5 py-1.5 bg-white text-primary border border-primary/40 hover:bg-primary/5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{isNl ? "Bekijk alle werkplaatsfoto's" : 'View all workshop photos'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (1 col): 3 Side Summary Cards */}
        <div className="space-y-3">
          {/* Summary Box 1: Delivery */}
          <div className="bg-white border border-[#D6CFC2] rounded-xl p-4 shadow-xs space-y-1.5">
            <span className="text-[10px] uppercase font-mono font-bold text-dark/50">
              {isNl ? 'LEVERING' : 'DELIVERY'}
            </span>
            <div className="text-sm font-bold text-primary font-heading">
              {isNl ? 'Di 15 sep' : 'Tue 15 Sep'}
            </div>
            <div className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
              <Clock className="w-3 h-3 text-amber-700" />{' '}
              {isNl ? 'Voorstel — wacht op jouw akkoord' : 'Proposal — waiting for your approval'}
            </div>
          </div>

          {/* Summary Box 2: Payment */}
          <div className="bg-white border border-[#D6CFC2] rounded-xl p-4 shadow-xs space-y-1.5">
            <span className="text-[10px] uppercase font-mono font-bold text-dark/50">
              {isNl ? 'BETALING' : 'PAYMENT'}
            </span>
            <div className="text-sm font-bold text-primary font-heading">
              € 1.960,00
            </div>
            <p className="text-[11px] text-dark/70 leading-tight">
              {isNl 
                ? '1e termijn voldaan op 12 augustus. 2e termijn verschuldigd bij levering.'
                : '1st instalment paid on 12 August. 2nd instalment due upon delivery.'}
            </p>
          </div>

          {/* Summary Box 3: Documents */}
          <div className="bg-white border border-[#D6CFC2] rounded-xl p-4 shadow-xs space-y-1.5">
            <span className="text-[10px] uppercase font-mono font-bold text-dark/50">
              {isNl ? 'DOCUMENTEN' : 'DOCUMENTS'}
            </span>
            <div className="text-sm font-bold text-primary font-heading flex items-center justify-between">
              <span>{isNl ? '6 bestanden' : '6 files'}</span>
              <Folder className="w-4 h-4 text-primary opacity-60" />
            </div>
            <button
              type="button"
              onClick={() => navigate('/customer/documents')}
              className="text-[11px] text-primary font-bold underline hover:text-primary/80 transition-colors"
            >
              {isNl ? '• 1 nieuwe termijnfactuur' : '• 1 new invoice in term'}
            </button>
          </div>
        </div>
      </div>

      {/* 5. VERTICAL PROJECT TIMELINE */}
      <Card title={isNl ? 'Jouw tijdlijn' : 'Your timeline'} icon={Calendar}>
        <div className="space-y-4 font-body p-1">
          {/* Item 1 */}
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3" />
            </div>
            <div className="space-y-0.5">
              <div className="font-bold text-primary text-xs sm:text-sm">
                {isNl ? 'Offerte geaccepteerd' : 'Quote accepted'}
              </div>
              <div className="text-[11px] text-dark/50 font-mono">
                {isNl ? '11 augustus 2026 — digitaal goedgekeurd om 20:14' : '11 August 2026 — digitally approved at 20:14'}
              </div>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3" />
            </div>
            <div className="space-y-0.5">
              <div className="font-bold text-primary text-xs sm:text-sm">
                {isNl ? 'Werktekening gedeeld' : 'Work drawing shared'}
              </div>
              <div className="text-[11px] text-dark/50 font-mono">
                {isNl ? '12 augustus 2026 — versie 2 beschikbaar ter controle' : '12 August 2026 — version 2 available for review'}
              </div>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-primary text-cream flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-[10px]">
              •
            </div>
            <div className="space-y-1">
              <div className="font-bold text-primary text-xs sm:text-sm">
                {isNl ? 'In de werkplaats' : 'In the workshop'}
              </div>
              <div className="text-[11px] text-dark/50 font-mono">
                {isNl ? 'Gestart 17 augustus 2026' : 'Started 17 August 2026'}
              </div>
              <div className="p-3 bg-[#EDE8DF] border border-[#D6CFC2] rounded-xl text-xs text-dark/80 leading-relaxed max-w-lg">
                {isNl
                  ? 'Jouw buitenkeuken wordt momenteel met de hand gebouwd door ons vakteam. Alles verloopt via Tim & Bram — wel zo overzichtelijk.'
                  : 'Your outdoor kitchen is currently being crafted by our specialist team. Everything is managed via Tim & Bram — keeping it easy for you.'}
              </div>
            </div>
          </div>

          {/* Item 4 */}
          <div className="flex items-start gap-3 opacity-60">
            <div className="w-5 h-5 rounded-full bg-gray-200 border border-gray-400 text-gray-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px]">
              ○
            </div>
            <div className="space-y-0.5">
              <div className="font-bold text-dark text-xs sm:text-sm">
                {isNl ? 'Eindcontrole' : 'Final quality check'}
              </div>
              <div className="text-[11px] text-dark/50 font-mono">
                {isNl ? 'Rond 10 september 2026' : 'Around 10 September 2026'}
              </div>
            </div>
          </div>

          {/* Item 5 */}
          <div className="flex items-start gap-3 opacity-60">
            <div className="w-5 h-5 rounded-full bg-gray-200 border border-gray-400 text-gray-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px]">
              ○
            </div>
            <div className="space-y-0.5">
              <div className="font-bold text-dark text-xs sm:text-sm">
                {isNl ? 'Levering & montage' : 'Delivery & installation'}
              </div>
              <div className="text-[11px] text-dark/50 font-mono">
                {isNl ? 'Week 38: 14 - 18 september 2026' : 'Week 38: 14 - 18 September 2026'}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate('/customer/project?tab=planning')}
              className="px-3.5 py-1.5 bg-white text-dark/80 border border-[#D6CFC2] text-xs font-bold rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
            >
              {isNl ? 'Bekijk planning & leveringsdetails →' : 'View schedule & delivery details →'}
            </button>
          </div>
        </div>
      </Card>

      {/* 6. FIXED DEDICATED CONTACT PERSON CARD */}
      <div className="bg-[#EDE8DF] border border-[#C4BEB3] p-4 sm:p-5 rounded-2xl shadow-xs space-y-3 font-body">
        <span className="text-[10px] uppercase font-mono font-bold text-accent tracking-wider">
          {isNl ? 'JOUW VASTE CONTACTPERSOON' : 'YOUR DEDICATED CONTACT PERSON'}
        </span>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h4 className="text-base font-bold font-heading text-primary">
              Tim & Bram
            </h4>
            <p className="text-xs text-dark/70 max-w-md mt-0.5">
              {isNl 
                ? "Tijdens de bouw regelen wij alles voor je — met onze vakspecialisten blijven wij jouw directe aanspreekpunt. We reageren binnen 2 uur, ook 's avonds."
                : "During the build, we manage everything for you — our specialist crafts, we remain your direct contact point. We reply within 2 hours, also in the evening."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="https://wa.me/31682008025"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-primary text-cream font-bold text-xs rounded-xl shadow-xs hover:bg-primary/90 transition-all flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-accent" />
              <span>{isNl ? 'WhatsApp ons' : 'WhatsApp us'}</span>
            </a>

            <a
              href="tel:0682008025"
              className="px-3 py-2 bg-white text-dark/80 border border-[#D6CFC2] font-bold text-xs rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-primary" />
              <span>{isNl ? 'Bel 06 82 00 80 25' : 'Call 06 82 00 80 25'}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

