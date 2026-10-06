import React from 'react';
import Card from '../Card';
import ProvDefBadge from './ProvDefBadge';
import WeekBar from './WeekBar';
import { 
  CheckCircle2, Clock, Calendar, FileText, Camera, Phone, 
  MessageSquare, ArrowRight, Check, ImageIcon, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * GardenRoomOverview Component (Step 4 - Overview UI Implementation)
 * 
 * 1-to-1 implementation of the client's Garden Room Family Overview design (Mockups 1 & 2).
 * Features:
 * 1. Project Header Banner (Build Week 41 & 42)
 * 2. 7-Stage Progress Timeline (Approval & Design -> Site Survey -> Prep -> Materials -> Build -> Delivery -> Aftercare)
 * 3. Provisional / Definitive Schedule Status Badge
 * 4. Current Phase Status Box ("Where your project stands")
 * 5. Customer Action Section ("What we still need from you" - Site survey approval & Render version 2)
 * 6. Main 3D Render Preview Card ("Your garden room")
 * 7. 3 Side Summary Cards (Site Survey Date, Build Week, Payment)
 * 8. Horizontal WeekBar Timeline ("Your planning in weeks")
 * 9. Fixed Contact Person Card (Tim & Bram with WhatsApp/Call)
 */
export default function GardenRoomOverview({ project = null }) {
  const navigate = useNavigate();

  const custName = project?.customer || 'Sander';
  const firstName = custName.split(' ')[0];
  const projectName = project?.name || 'Canopy with poolhouse - Douglas - 8.00 x 4.00 m - Oisterwijk';
  const buildWeeks = project?.buildWeeks || 'Week 41 & 42';
  const projectCode = project?.id || '2026-021';
  const scheduleStatus = project?.scheduleStatus || 'provisional';

  // 7-Stage Timeline Configuration
  const stages = [
    { key: 'design', label: 'Approval & design', status: 'completed' },
    { key: 'survey', label: 'Site survey', status: 'current' },
    { key: 'prep', label: 'Preparation', status: 'upcoming' },
    { key: 'materials', label: 'Materials', status: 'upcoming' },
    { key: 'build', label: 'The build', status: 'upcoming' },
    { key: 'delivery', label: 'Delivery', status: 'upcoming' },
    { key: 'aftercare', label: 'Aftercare', status: 'upcoming' },
  ];

  return (
    <div className="space-y-5 font-body text-[#4A4A43] max-w-5xl w-full">

      {/* 1. PROJECT HEADER GREETING */}
      <div className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-dark/60">
          <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-md font-bold">
            Custom Garden Room — project {projectCode}
          </span>
          <div className="flex items-center gap-2">
            <span className="bg-cream border border-[#D6CFC2] px-2 py-0.5 rounded-md font-bold text-[11px]">
              Updates 2
            </span>
            <a
              href="https://wa.me/31682008025"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-cream px-3 py-1 rounded-xl text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1"
            >
              <MessageSquare className="w-3.5 h-3.5 text-accent" />
              <span>WhatsApp us</span>
            </a>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-primary pt-1">
          Hi {firstName}
        </h1>
        <p className="text-xs text-dark/70 font-medium">
          {projectName}
        </p>
      </div>

      {/* 2. 7-STAGE PROGRESS TIMELINE & PROVISIONAL BADGE */}
      <div className="bg-[#EDE8DF] border border-[#C4BEB3] p-4 sm:p-6 rounded-2xl shadow-xs space-y-5">
        {/* Progress Bar Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#D6CFC2] pb-3">
          <div>
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-accent block">
              WHERE YOUR PROJECT STANDS
            </span>
            <h3 className="font-heading font-bold text-primary text-sm sm:text-base">
              Site survey on location
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-primary">BUILD WEEK:</span>
            <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
              {buildWeeks}
            </span>
            <ProvDefBadge scheduleStatus={scheduleStatus} />
          </div>
        </div>

        {/* 7-Stage Timeline Track */}
        <div className="relative pt-2 pb-4">
          <div className="grid grid-cols-7 gap-1 relative z-10 text-center">
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
                    className={`text-[9px] sm:text-xs leading-tight font-medium ${
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
          <div className="absolute top-[22px] left-[7%] right-[7%] h-0.5 bg-[#D6CFC2] -z-0">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: '22%' }} />
          </div>
        </div>

        {/* Active Phase Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#D6CFC2]">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold text-accent">WHAT IS HAPPENING NOW</span>
            <p className="text-xs text-dark/90 leading-relaxed font-medium">
              Our craftsman will visit you for the site survey: measure dimensions, inspect underground & access route. After that, we finalize the complete schedule.
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold text-accent">WHAT COMES NEXT</span>
            <p className="text-xs text-dark/90 leading-relaxed font-medium">
              After the site survey, we confirm the weekly build schedule and order the Douglas timber. You don't need to do anything for this.
            </p>
          </div>
        </div>
      </div>

      {/* 3. CUSTOMER ACTION SECTION (Site Survey Proposal & Render Review) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-primary text-sm sm:text-base">
            What we still need from you
          </h3>
          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
            2 actions for you
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Action Card 1: Approve Site Survey Proposal */}
          <div className="bg-[#FFFDF9] border border-amber-300 rounded-xl p-4 shadow-xs space-y-2.5 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold">
                  1
                </div>
                <h4 className="font-heading font-bold text-primary text-xs sm:text-sm">
                  Approve proposal for site survey
                </h4>
              </div>
              <p className="text-xs text-dark/80 leading-relaxed">
                We propose: <strong className="text-primary font-bold">Thursday 27 August, around 10:00</strong>. The survey takes approx 45 minutes; you only need to grant garden access.
              </p>
            </div>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => navigate('/customer/project?tab=planning')}
                className="px-3.5 py-1.5 bg-[#9E7B3B] text-white text-xs font-bold rounded-xl hover:bg-[#8C662B] transition-all cursor-pointer shadow-xs"
              >
                View Proposal & Confirm
              </button>
            </div>
          </div>

          {/* Action Card 2: View Render Version 2 */}
          <div className="bg-[#FFFDF9] border border-amber-300 rounded-xl p-4 shadow-xs space-y-2.5 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold">
                  2
                </div>
                <h4 className="font-heading font-bold text-primary text-xs sm:text-sm">
                  View render version 2
                </h4>
              </div>
              <p className="text-xs text-dark/80 leading-relaxed">
                We moved the sliding door to the south side and extended the overhang by 40 cm as discussed. Check if this is what you intended.
              </p>
            </div>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => navigate('/customer/project?tab=design')}
                className="px-3.5 py-1.5 bg-[#9E7B3B] text-white text-xs font-bold rounded-xl hover:bg-[#8C662B] transition-all cursor-pointer shadow-xs"
              >
                View Render V2
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 4. MAIN CONTENT GRID (Main Render Card & 3 Side Summary Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left Column (2 cols): Main 3D Render Preview Card */}
        <div className="md:col-span-2 space-y-3">
          <Card title="Your garden room" icon={ImageIcon}>
            <div className="space-y-3 font-body">
              {/* Main Render Image Container */}
              <div className="relative w-full aspect-[16/9] bg-[#2A3425] rounded-xl overflow-hidden shadow-xs border border-[#D6CFC2] group">
                <img
                  src="/outdoor_living_login.png"
                  alt="3D Render Preview"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute top-2 right-2 bg-primary text-cream text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                  Render version 2
                </div>
                <div className="absolute bottom-2 left-2 bg-dark/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-1 rounded-md">
                  RENDER — FRONT VIEW — VERSION 2
                </div>
              </div>

              {/* Render Description & Action */}
              <div className="space-y-2">
                <p className="text-xs text-dark/80 leading-relaxed">
                  Canopy with enclosed Douglas poolhouse, flat roof with wide roof trim, sliding glass doors on south side. This will land in your garden.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => navigate('/customer/project?tab=design')}
                    className="px-3.5 py-1.5 bg-white text-primary border border-primary/40 hover:bg-primary/5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>View all renders & 3D views</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (1 col): 3 Side Summary Cards */}
        <div className="space-y-3">
          {/* Summary Box 1: Site Survey Date */}
          <div className="bg-white border border-[#D6CFC2] rounded-xl p-4 shadow-xs space-y-1.5">
            <span className="text-[10px] uppercase font-mono font-bold text-dark/50">SITE SURVEY</span>
            <div className="text-sm font-bold text-primary font-heading">
              Thu 27 Aug
            </div>
            <div className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
              <Clock className="w-3 h-3 text-amber-700" /> Proposal — waiting for your approval
            </div>
          </div>

          {/* Summary Box 2: Build Week */}
          <div className="bg-white border border-[#D6CFC2] rounded-xl p-4 shadow-xs space-y-1.5">
            <span className="text-[10px] uppercase font-mono font-bold text-dark/50">BUILD WEEK</span>
            <div className="text-sm font-bold text-primary font-heading">
              Wk 41–42
            </div>
            <div className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-900 border border-dashed border-amber-300 px-2 py-0.5 rounded-md">
              <Clock className="w-3 h-3 text-amber-700" /> Provisional
            </div>
          </div>

          {/* Summary Box 3: Payment */}
          <div className="bg-white border border-[#D6CFC2] rounded-xl p-4 shadow-xs space-y-1.5">
            <span className="text-[10px] uppercase font-mono font-bold text-dark/50">PAYMENT</span>
            <div className="text-sm font-bold text-primary font-heading">
              € 15,180.00
            </div>
            <p className="text-[11px] text-dark/70 leading-tight">
              1st instalment (40%) paid. Next instalment (40%): at start of build.
            </p>
          </div>
        </div>
      </div>

      {/* 5. HORIZONTAL WEEKBAR TIMELINE SECTION */}
      <div className="space-y-2">
        <WeekBar weekSchedule={project?.weekSchedule} />
        <div className="pt-1 text-right">
          <button
            type="button"
            onClick={() => navigate('/customer/project?tab=planning')}
            className="px-3.5 py-1.5 bg-white text-dark/80 border border-[#D6CFC2] text-xs font-bold rounded-xl hover:bg-gray-50 transition-all cursor-pointer inline-flex items-center gap-1"
          >
            <span>View full schedule & build details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 6. FIXED DEDICATED CONTACT PERSON CARD */}
      <div className="bg-[#EDE8DF] border border-[#C4BEB3] p-4 sm:p-5 rounded-2xl shadow-xs space-y-3 font-body">
        <span className="text-[10px] uppercase font-mono font-bold text-accent tracking-wider">
          YOUR DEDICATED CONTACT PERSON
        </span>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h4 className="text-base font-bold font-heading text-primary">
              Tim & Bram
            </h4>
            <p className="text-xs text-dark/70 max-w-md mt-0.5">
              Also during the build, we manage everything for you — the craftsman builds, we remain your direct contact point. We reply within 2 hours, also in the evening.
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
              <span>WhatsApp us</span>
            </a>

            <a
              href="tel:0682008025"
              className="px-3 py-2 bg-white text-dark/80 border border-[#D6CFC2] font-bold text-xs rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-primary" />
              <span>Call 06 82 00 80 25</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
