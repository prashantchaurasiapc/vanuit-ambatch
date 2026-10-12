import React, { useState } from 'react';
import { Sparkles, Sun, Moon, Check, MessageSquare, Download, Eye, ChevronRight } from 'lucide-react';
import { downloadDirectPdfFile } from '../../utils/pdfGenerator';
import woodTexture from '../../assets/wood_texture.png';
import { useLanguage } from '../../context/LanguageContext';

/**
 * GardenRoomDesignView Component (1-to-1 implementation of Client Mockup PDF Garden Rooms Page 8)
 */
export default function GardenRoomDesignView({ project = null }) {
  const { language } = useLanguage();
  const isNl = language === 'NL';
  const [activeAngle, setActiveAngle] = useState('front');
  const [isNightMode, setIsNightMode] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState('');

  const projectCode = project?.projectNumber || project?.id || '2026-021';

  const viewAngles = [
    {
      id: 'front',
      name: isNl ? 'Vooraanzicht' : 'Front View',
      badge: isNl ? 'RENDER · VOORAANZICHT · VERSIE 2' : 'RENDER · FRONT VIEW · VERSION 2',
      thumbGradient: 'from-[#8B7355] via-[#A68A64] to-[#6E5A42]',
      nightGradient: 'from-[#1A2218] via-[#2A3528] to-[#121811]',
      spotlight: 'radial-gradient(ellipse at 50% 30%, rgba(255, 210, 150, 0.45) 0%, rgba(255, 180, 100, 0.15) 50%, transparent 80%)'
    },
    {
      id: 'side',
      name: isNl ? 'Zijaanzicht' : 'Side View',
      badge: isNl ? 'RENDER · ZIJAANZICHT · VERSIE 2' : 'RENDER · SIDE VIEW · VERSION 2',
      thumbGradient: 'from-[#7A6448] via-[#947A58] to-[#5C4B36]',
      nightGradient: 'from-[#161D14] via-[#242E22] to-[#0E130D]',
      spotlight: 'radial-gradient(ellipse at 30% 40%, rgba(255, 210, 150, 0.45) 0%, rgba(255, 180, 100, 0.15) 50%, transparent 80%)'
    },
    {
      id: 'interior',
      name: isNl ? 'Interieur Poolhouse' : 'Interior Poolhouse',
      badge: isNl ? 'RENDER · INTERIEUR POOLHOUSE · VERSIE 2' : 'RENDER · INTERIOR POOLHOUSE · VERSION 2',
      thumbGradient: 'from-[#6E5A42] via-[#8B7355] to-[#4E3D2C]',
      nightGradient: 'from-[#1B2019] via-[#2D382B] to-[#141813]',
      spotlight: 'radial-gradient(ellipse at 70% 30%, rgba(255, 220, 170, 0.5) 0%, rgba(255, 190, 110, 0.2) 50%, transparent 80%)'
    },
    {
      id: 'garden',
      name: isNl ? 'Vanuit de tuin' : 'From the Garden',
      badge: isNl ? 'RENDER · VANUIT DE TUIN · VERSIE 2' : 'RENDER · FROM THE GARDEN · VERSION 2',
      thumbGradient: 'from-[#5C4B36] via-[#7A6448] to-[#3E3022]',
      nightGradient: 'from-[#121711] via-[#1F271D] to-[#0A0E0A]',
      spotlight: 'radial-gradient(ellipse at 50% 50%, rgba(255, 210, 150, 0.4) 0%, rgba(255, 180, 100, 0.15) 50%, transparent 80%)'
    }
  ];

  const currentView = viewAngles.find((v) => v.id === activeAngle) || viewAngles[0];

  const handleDownloadSpecs = () => {
    downloadDirectPdfFile('working-drawing');
    setFeedbackToast(isNl ? 'Werktekening Versie 2 (PDF) gedownload!' : 'Downloaded Working Drawing Version 2 (PDF)!');
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

      {/* 1. TOP HEADER TAG BAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-dark/60">
        <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-md font-bold">
          {isNl ? 'Maatwerk Buitenverblijf' : 'Custom Garden Room'} — project {projectCode}
        </span>
        <div className="flex items-center gap-2">
          <span className="bg-cream border border-[#D6CFC2] px-2 py-0.5 rounded-md font-bold text-[11px]">
            {isNl ? '3 Updates' : 'Updates 3'}
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
          {isNl ? 'Ontwerp & renders' : 'Design & renders'}
        </h1>
        <p className="text-xs text-dark/70 font-medium">
          {isNl
            ? "Zo komt jouw buitenverblijf eruit te zien. Bekijk alle hoeken — ook 's avonds."
            : 'This is how your garden room will look. View all angles — and see it at night too.'}
        </p>
      </div>

      {/* 3. INTERACTIVE 3D RENDER VIEWER CONTAINER */}
      <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-3 sm:p-4 rounded-2xl shadow-xs space-y-3">
        {/* Render Viewer Toolbar */}
        <div className="flex flex-wrap justify-between items-center gap-2 pb-1">
          <h3 className="font-heading font-bold text-primary text-sm sm:text-base">
            {isNl ? 'Render viewer' : 'Render viewer'}
          </h3>

          {/* Controls: Date Tag + Day/Night Toggle Switch */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-dark/60 bg-cream px-2.5 py-1 rounded-lg border border-[#D6CFC2] font-bold">
              • {isNl ? 'Versie 2 · 14 augustus' : 'Version 2 · 14 August'}
            </span>

            {/* Day / Night Mode Switcher */}
            <div className="bg-[#EAE6DD] border border-[#D6CFC2] p-0.5 rounded-xl flex items-center gap-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setIsNightMode(false)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  !isNightMode
                    ? 'bg-white text-primary shadow-2xs font-bold'
                    : 'text-dark/60 hover:text-dark'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>{isNl ? 'Dag' : 'Day'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsNightMode(true)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  isNightMode
                    ? 'bg-[#1E251C] text-cream shadow-2xs font-bold'
                    : 'text-dark/60 hover:text-dark'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-amber-300" />
                <span>{isNl ? 'Nacht' : 'Night'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Full-Bleed Render Viewport */}
        <div className="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden border border-[#D6CFC2] shadow-xs transition-all duration-500">
          <div className={`w-full h-full bg-gradient-to-br ${
            isNightMode ? currentView.nightGradient : currentView.thumbGradient
          } relative flex flex-col justify-end p-4 transition-all duration-500`}>
            
            {/* Real Vertical Wood Slat Plank Lines Pattern */}
            <div 
              className="absolute inset-0 pointer-events-none transition-all duration-300" 
              style={{
                opacity: isNightMode ? 0.65 : 0.4,
                mixBlendMode: 'overlay',
                backgroundImage: isNightMode
                  ? 'repeating-linear-gradient(90deg, rgba(255, 230, 190, 0.4) 0px, rgba(255, 230, 190, 0.4) 2px, transparent 2px, transparent 16px)'
                  : 'repeating-linear-gradient(90deg, rgba(0,0,0,0.3) 0px, rgba(0,0,0,0.3) 2px, transparent 2px, transparent 16px)'
              }}
            />

            {/* Warm Night Ambient Spotlight Lighting Effect */}
            {isNightMode && (
              <div 
                className="absolute inset-0 pointer-events-none transition-opacity duration-500" 
                style={{ background: currentView.spotlight }}
              />
            )}

            <div className="absolute inset-0 bg-black/10 pointer-events-none" />

            {/* Active Render Badge */}
            <div className="relative z-10 self-start bg-[#232B20]/85 text-cream px-3 py-1.5 rounded-md text-[10px] font-mono tracking-wider uppercase font-bold backdrop-blur-xs shadow-xs border border-white/10">
              {currentView.badge} {isNightMode ? (isNl ? '· NACHT' : '· NIGHT') : ''}
            </div>
          </div>
        </div>

        {/* 4 Interactive View Thumbnails Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-1">
          {viewAngles.map((angle) => {
            const isSelected = activeAngle === angle.id;
            return (
              <button
                key={angle.id}
                type="button"
                onClick={() => setActiveAngle(angle.id)}
                className={`group rounded-xl border transition-all overflow-hidden cursor-pointer ${
                  isSelected 
                    ? 'border-2 border-primary bg-white shadow-sm ring-2 ring-primary/20' 
                    : 'border-[#D6CFC2] bg-white hover:bg-gray-50'
                }`}
              >
                <div className={`w-full h-16 sm:h-20 bg-gradient-to-br ${
                  isNightMode ? angle.nightGradient : angle.thumbGradient
                } relative border-b border-[#D6CFC2] overflow-hidden`}>
                  <div 
                    className="absolute inset-0 pointer-events-none transition-all duration-300" 
                    style={{
                      opacity: isNightMode ? 0.6 : 0.4,
                      backgroundImage: isNightMode
                        ? 'repeating-linear-gradient(90deg, rgba(255, 230, 190, 0.35) 0px, rgba(255, 230, 190, 0.35) 2px, transparent 2px, transparent 14px)'
                        : 'repeating-linear-gradient(90deg, rgba(0,0,0,0.3) 0px, rgba(0,0,0,0.3) 2px, transparent 2px, transparent 14px)'
                    }}
                  />
                  {isNightMode && (
                    <div 
                      className="absolute inset-0 pointer-events-none" 
                      style={{ background: angle.spotlight }}
                    />
                  )}
                </div>

                <div className="p-2 text-center">
                  <span className={`text-xs font-bold font-body block truncate ${
                    isSelected ? 'text-primary' : 'text-dark/70 group-hover:text-dark'
                  }`}>
                    {angle.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footnote Caption */}
        <p className="text-[11px] text-dark/60 italic pt-1">
          {isNl
            ? 'Impressie op basis van jouw keuzes. Kleur en houtnerf kunnen in werkelijkheid licht afwijken — hout is een natuurproduct.'
            : 'Impression based on your choices. Color and wood grain may vary in reality — wood is natural material.'}
        </p>
      </div>

      {/* 4. MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Material & Finishing Details Card */}
          <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-4 sm:p-5 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-base font-heading font-bold text-primary">
              {isNl ? 'Materiaal & afwerking in detail' : 'Material & finishing in detail'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Material 1: Douglas */}
              <div className="bg-white border border-[#D6CFC2] p-3.5 rounded-xl space-y-2">
                <div className="w-full h-20 bg-[#B09267] rounded-lg border border-[#8F7550] flex items-end p-2 relative overflow-hidden">
                  <div 
                    className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none" 
                    style={{
                      backgroundImage: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.3) 0px, rgba(0,0,0,0.3) 2px, transparent 2px, transparent 14px)'
                    }}
                  />
                  <span className="relative z-10 bg-dark/70 text-cream text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded-xs">
                    DOUGLAS
                  </span>
                </div>
                <h4 className="font-heading font-bold text-primary text-xs">
                  {isNl ? 'Douglas, fijnbezaagd' : 'Douglas, fine-sawn'}
                </h4>
                <p className="text-[11px] text-dark/70 leading-relaxed">
                  {isNl
                    ? 'Warm roodbruin, vergrijst prachtig. Levensduur 10-15 jaar, langer met onderhoud.'
                    : 'Warm reddish brown, grays nicely. Lifespan 10-15 years, longer with maintenance.'}
                </p>
              </div>

              {/* Material 2: EPDM Flat Roof */}
              <div className="bg-white border border-[#D6CFC2] p-3.5 rounded-xl space-y-2">
                <div className="w-full h-20 bg-[#363F47] rounded-lg border border-[#232930] flex items-end p-2">
                  <span className="bg-dark/70 text-cream text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded-xs">
                    {isNl ? 'PLAT DAK' : 'FLAT ROOF'}
                  </span>
                </div>
                <h4 className="font-heading font-bold text-primary text-xs">
                  {isNl ? 'EPDM dak & aluminium trim' : 'EPDM roof & aluminum trim'}
                </h4>
                <p className="text-[11px] text-dark/70 leading-relaxed">
                  {isNl
                    ? 'Onderhoudsarm en 100% waterdicht, strakke antraciet dakrand.'
                    : 'Low maintenance and 100% waterproof, sleek anthracite edge.'}
                </p>
              </div>

              {/* Material 3: Ceramic Tiles */}
              <div className="bg-white border border-[#D6CFC2] p-3.5 rounded-xl space-y-2">
                <div className="w-full h-20 bg-[#9C9488] rounded-lg border border-[#827A6F] flex items-end p-2">
                  <span className="bg-dark/70 text-cream text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded-xs">
                    {isNl ? 'VLOER' : 'FLOOR'}
                  </span>
                </div>
                <h4 className="font-heading font-bold text-primary text-xs">
                  {isNl ? 'Keramische tegels 60×60' : 'Ceramic tiles 60×60'}
                </h4>
                <p className="text-[11px] text-dark/70 leading-relaxed">
                  {isNl
                    ? 'In het poolhouse deel, greige tint — koel in de zomer, makkelijk schoon te houden.'
                    : 'In the poolhouse section, greige color — cool in summer, easy to clean.'}
                </p>
              </div>
            </div>

            {/* Layout Diagram Bar */}
            <div className="pt-3 border-t border-[#D6CFC2]/60 space-y-2">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-accent block">
                {isNl ? 'INDELING · LINKS NAAR RECHTS' : 'LAYOUT · LEFT TO RIGHT'}
              </span>

              <div className="space-y-1.5">
                <div className="flex w-full h-12 rounded-xl overflow-hidden border border-[#D6CFC2] font-mono text-xs font-bold">
                  {/* Left 3m: Enclosed Poolhouse */}
                  <div className="w-[37.5%] bg-[#3E4E36] text-cream flex items-center justify-center p-2 text-center text-[11px]">
                    {isNl ? 'poolhouse dicht 3,00 m' : 'poolhouse enclosed 3.00 m'}
                  </div>
                  {/* Right 5m: Covered Lounge */}
                  <div className="w-[62.5%] bg-white text-primary flex items-center justify-center p-2 text-center text-[11px]">
                    {isNl ? 'lounge overkapt 5,00 m' : 'lounge covered 5.00 m'}
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono text-dark/50 px-1">
                  <span>0 m</span>
                  <span>8.00 m</span>
                </div>
              </div>
            </div>
          </div>

          {/* About Douglas Timber Info Card */}
          <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-4 sm:p-5 rounded-2xl space-y-2 text-xs text-dark/80 shadow-xs">
            <span className="text-[10px] sm:text-[11px] uppercase font-mono font-bold tracking-wider text-accent block">
              {isNl ? 'OVER DOUGLAS HOUT' : 'ABOUT DOUGLAS TIMBER'}
            </span>
            <p className="leading-relaxed text-xs text-dark/70 font-medium">
              {isNl
                ? 'Sterk Europees naaldhout met een warme uitstraling. Onbehandeld kleurt het zilvergrijs; jaarlijks onderhoud behoudt de roodbruine gloed.'
                : 'Strong European softwood with a warm appearance. Untreated it turns silver-gray; an annual maintenance preserves its reddish-brown glow.'}
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">
          
          {/* 2x2 Specs Grid Cards */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="bg-[#EDE9E3] border border-[#D8D2C5] p-4 rounded-2xl space-y-1">
              <span className="text-[10px] sm:text-[11px] uppercase font-mono font-bold text-accent tracking-wider block">
                {isNl ? 'AFMETINGEN' : 'DIMENSIONS'}
              </span>
              <div className="text-base sm:text-lg font-bold text-primary font-heading">8.00 × 4.00</div>
              <div className="text-xs font-medium text-dark/70">{isNl ? 'meter, hoogte 2,60 m' : 'meter, height 2.60 m'}</div>
            </div>

            <div className="bg-[#E3E8DF] border border-[#C8D2C2] p-4 rounded-2xl space-y-1">
              <span className="text-[10px] sm:text-[11px] uppercase font-mono font-bold text-accent tracking-wider block">
                {isNl ? 'HOUTSOORT' : 'TIMBER TYPE'}
              </span>
              <div className="text-base sm:text-lg font-bold text-primary font-heading">Douglas</div>
              <div className="text-xs font-medium text-dark/70">{isNl ? 'fijnbezaagd, behandeld' : 'fine-sawn, treated'}</div>
            </div>

            <div className="bg-[#EDE9E3] border border-[#D8D2C5] p-4 rounded-2xl space-y-1">
              <span className="text-[10px] sm:text-[11px] uppercase font-mono font-bold text-accent tracking-wider block">
                {isNl ? 'DAKTYPE' : 'ROOF'}
              </span>
              <div className="text-base sm:text-lg font-bold text-primary font-heading">{isNl ? 'Plat dak' : 'Flat roof'}</div>
              <div className="text-xs font-medium text-dark/70">{isNl ? 'EPDM · aluminium trim' : 'EPDM · aluminum trim'}</div>
            </div>

            <div className="bg-[#E3E8DF] border border-[#C8D2C2] p-4 rounded-2xl space-y-1">
              <span className="text-[10px] sm:text-[11px] uppercase font-mono font-bold text-accent tracking-wider block">
                {isNl ? 'BOUWDUUR' : 'BUILD TIME'}
              </span>
              <div className="text-base sm:text-lg font-bold text-primary font-heading">{isNl ? '2 weken' : '2 weeks'}</div>
              <div className="text-xs font-medium text-dark/70">{isNl ? 'week 41 & 42 (onder voorbehoud)' : 'week 41 & 42 (tentative)'}</div>
            </div>
          </div>

          {/* Your Selections Card */}
          <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-4 sm:p-5 rounded-2xl shadow-xs space-y-3">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-accent block">
              {isNl ? 'JOUW SELECTIES' : 'YOUR SELECTIONS'}
            </span>

            <ul className="space-y-2 text-xs text-dark/80">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{isNl ? 'Afgesloten poolhouse (3,00 m) met glazen schuifwand aan zuidzijde' : 'Enclosed poolhouse (3.00 m) with sliding glass door on south side'}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{isNl ? 'Overkapte lounge (5,00 m) met open zijdes' : 'Covered lounge (5.00 m) with open sides'}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{isNl ? 'Elektrapakket: 4 spots, wandcontactdoos, schakelaar*' : 'Electrical package: 4 spots, wall socket, switch*'}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{isNl ? 'Keramische vloertegels in het poolhouse deel' : 'Ceramic floor tiles in poolhouse section'}</span>
              </li>
              <li className="flex items-start gap-2 text-dark/50 italic">
                <span className="w-4 h-4 border border-dark/30 rounded-full flex-shrink-0 mt-0.5 inline-block" />
                <span>{isNl ? 'Buitenkeuken in lounge — niet gekozen | prijs weten?' : 'Outdoor kitchen in lounge — not selected | want to know the price?'}</span>
              </li>
            </ul>

            <p className="text-[10px] text-dark/50 italic border-t border-[#D6CFC2]/60 pt-2">
              {isNl ? '* stelpost — definitief na schouw' : '* provisional sum — definitive after site survey'}
            </p>
          </div>

        </div>
      </div>

      {/* 5. DESIGN VERSIONS CARD */}
      <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-4 sm:p-5 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#D6CFC2]/60 pb-3">
          <h3 className="text-base font-heading font-bold text-primary">
            {isNl ? 'Versies van jouw ontwerp' : 'Versions of your design'}
          </h3>
          <span className="text-xs text-dark/60 font-medium">
            {isNl ? 'Bekijk precies wat er per versie is gewijzigd' : 'See exactly what changed per version'}
          </span>
        </div>

        <div className="space-y-3">
          {/* Version 2 (Current) */}
          <div className="bg-white border border-green-300 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-2xs">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <h4 className="font-heading font-bold text-primary text-sm">
                  {isNl ? 'Versie 2' : 'Version 2'}
                </h4>
                <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {isNl ? 'Huidig' : 'Current'}
                </span>
              </div>
              <p className="text-xs text-dark/70 leading-relaxed font-medium">
                {isNl 
                  ? '14 augustus 2026 · schuifpui verplaatst naar zuidzijde, overstek met 40 cm verbreed — naar aanleiding van jouw feedback op middagzon.'
                  : '14 August 2026 · sliding door moved to south side, overhang widened 40 cm — following your feedback on afternoon sun.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadSpecs}
              className="px-3.5 py-1.5 bg-white text-dark/80 border border-[#D6CFC2] text-xs font-bold rounded-lg hover:bg-gray-50 transition-all cursor-pointer flex-shrink-0 shadow-2xs"
            >
              {isNl ? 'Bekijken' : 'View'}
            </button>
          </div>

          {/* Version 1 */}
          <div className="bg-white border border-[#D6CFC2] p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-2xs">
            <div className="space-y-1 max-w-2xl">
              <h4 className="font-heading font-bold text-primary text-sm">
                {isNl ? 'Versie 1' : 'Version 1'}
              </h4>
              <p className="text-xs text-dark/70 leading-relaxed font-medium">
                {isNl ? '6 augustus 2026 · eerste opzet op basis van offerte.' : '6 August 2026 · initial design based on quote.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadSpecs}
              className="px-3.5 py-1.5 bg-white text-dark/80 border border-[#D6CFC2] text-xs font-bold rounded-lg hover:bg-gray-50 transition-all cursor-pointer flex-shrink-0 shadow-2xs"
            >
              {isNl ? 'Bekijken' : 'View'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

