import React, { useState } from 'react';
import WeekCard from './WeekCard';
import { Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

/**
 * WeekBar Component (1-to-1 implementation of Client Mockup Image 2)
 * 
 * Displays project construction timeline as horizontal week blocks.
 * Layout:
 * 1. Title & Subtitle: "Your planning in weeks" / "At a glance: what happens when. The entire schedule is finalized after the site survey."
 * 2. 9 Horizontal Week Cards (Week 34 to 42) with 3 lines of copy inside each card.
 * 3. Color Legend Bar below week blocks (completed, now, preparation, materials, build).
 * 4. Active Week Detail Card.
 */
export default function WeekBar({ weekSchedule = [] }) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isNl = language === 'NL';

  // 1-to-1 Client Mockup 9-Week Schedule Data
  const mockupSchedule = [
    { 
      weekNumber: 34, 
      subline: isNl ? 'deze week' : 'this week', 
      phase: isNl ? 'ONTWERP' : 'DESIGN', 
      status: 'completed', 
      dateRange: isNl ? '17 – 23 aug' : '17 – 23 Aug', 
      description: isNl ? 'Ontwerpfase afgerond. 3D-renders versie 2 goedgekeurd.' : 'Design phase completed. 3D renders version 2 approved.', 
      phaseName: isNl ? 'Ontwerp' : 'Design' 
    },
    { 
      weekNumber: 35, 
      subline: isNl ? '24-28 aug' : '24-28 Aug', 
      phase: isNl ? 'INMETING' : 'SITE SURVEY', 
      status: 'now', 
      dateRange: isNl ? '24 – 28 aug' : '24 – 28 Aug', 
      description: isNl ? 'Inmeting op locatie met vakman. Afmetingen en toegangsroute opnemen.' : 'Site survey on location with craftsman. Measuring dimensions and access route.', 
      phaseName: isNl ? 'Inmeting' : 'Site Survey' 
    },
    { 
      weekNumber: 36, 
      subline: '—', 
      phase: '—', 
      status: 'planned', 
      dateRange: isNl ? '31 aug – 04 sep' : '31 Aug – 04 Sep', 
      description: isNl ? 'Geplande bufferweek vóór werkplaatsvoorbereiding.' : 'Scheduled buffer week before workshop preparation.', 
      phaseName: isNl ? 'Bufferweek' : 'Buffer Week' 
    },
    { 
      weekNumber: 37, 
      subline: '—', 
      phase: '—', 
      status: 'planned', 
      dateRange: isNl ? '07 – 11 sep' : '07 – 11 Sep', 
      description: isNl ? 'Geplande bufferweek vóór houtbestelling.' : 'Scheduled buffer week before timber ordering.', 
      phaseName: isNl ? 'Bufferweek' : 'Buffer Week' 
    },
    { 
      weekNumber: 38, 
      subline: '—', 
      phase: '—', 
      status: 'planned', 
      dateRange: isNl ? '14 – 18 sep' : '14 – 18 Sep', 
      description: isNl ? 'Definitieve technische specificaties afronden vóór machinaal zagen.' : 'Finalizing technical specifications before workshop cutting.', 
      phaseName: isNl ? 'Bufferweek' : 'Buffer Week' 
    },
    { 
      weekNumber: 39, 
      subline: isNl ? '21-25 sep' : '21-25 Sep', 
      phase: isNl ? 'VOORBEREIDING' : 'PREPARATION', 
      status: 'prep', 
      dateRange: isNl ? '21 – 25 sep' : '21 – 25 Sep', 
      description: isNl ? 'Voorbereiding in werkplaats: Douglas hout en EPDM daksysteem bestellen.' : 'Preparation in workshop: ordering Douglas timber and EPDM roof system.', 
      phaseName: isNl ? 'Voorbereiding' : 'Preparation' 
    },
    { 
      weekNumber: 40, 
      subline: isNl ? '28 sep-2 okt' : '28 Sep-2 Oct', 
      phase: isNl ? 'MATERIALEN' : 'MATERIALS', 
      status: 'materials', 
      dateRange: isNl ? '28 sep – 02 okt' : '28 Sep – 02 Oct', 
      description: isNl ? 'Zagen en oliën van houten spanten in de werkplaats.' : 'Cutting and oiling timber trusses in the workshop.', 
      phaseName: isNl ? 'Materialen' : 'Materials' 
    },
    { 
      weekNumber: 41, 
      subline: isNl ? '5-9 okt' : '5-9 Oct', 
      phase: isNl ? 'DE BOUW' : 'THE BUILD', 
      status: 'build', 
      dateRange: isNl ? '05 – 09 okt' : '05 – 09 Oct', 
      description: isNl ? 'Bouw op locatie week 1: hoofdconstructie en dak monteren.' : 'On-site construction week 1: installing main structure and roof.', 
      phaseName: isNl ? 'De Bouw (Week 1)' : 'The Build (Week 1)' 
    },
    { 
      weekNumber: 42, 
      subline: isNl ? '12-16 okt' : '12-16 Oct', 
      phase: isNl ? 'BOUW & OPLEVERING' : 'BUILD & DELIVERY', 
      status: 'build', 
      dateRange: isNl ? '12 – 16 okt' : '12 – 16 Oct', 
      description: isNl ? 'Bouw op locatie week 2: glazen wandmontage en definitieve oplevering.' : 'On-site construction week 2: glass wall assembly and final handover.', 
      phaseName: isNl ? 'Bouw & Oplevering' : 'Build & Delivery' 
    },
  ];

  const localizePhase = (phase) => {
    if (!phase || phase === '—') return '—';
    if (!isNl) return phase;
    const upper = phase.toUpperCase();
    if (upper === 'DESIGN') return 'ONTWERP';
    if (upper === 'SITE SURVEY') return 'INMETING';
    if (upper === 'PREPARATION') return 'VOORBEREIDING';
    if (upper === 'MATERIALS') return 'MATERIALEN';
    if (upper === 'THE BUILD') return 'DE BOUW';
    if (upper === 'BUILD & DELIVERY') return 'BOUW & OPLEVERING';
    if (upper === 'DELIVERY') return 'OPLEVERING';
    return phase;
  };

  const localizeSubline = (subline) => {
    if (!subline) return '—';
    if (isNl && subline.toLowerCase() === 'this week') return 'deze week';
    return subline;
  };

  const scheduleToRender = Array.isArray(weekSchedule) && weekSchedule.length >= 7
    ? weekSchedule
    : mockupSchedule;

  const [selectedWeekIndex, setSelectedWeekIndex] = useState(() => {
    const activeIdx = scheduleToRender.findIndex(w => w.status === 'now');
    return activeIdx >= 0 ? activeIdx : 1;
  });

  const selectedWeekRaw = scheduleToRender[selectedWeekIndex] || scheduleToRender[0];
  const selectedWeek = {
    ...selectedWeekRaw,
    phaseNameNL: isNl 
      ? (selectedWeekRaw.phaseNameNL || selectedWeekRaw.phaseName || localizePhase(selectedWeekRaw.phaseNameEN || selectedWeekRaw.phase))
      : (selectedWeekRaw.phaseNameEN || selectedWeekRaw.phaseName || selectedWeekRaw.phase),
    descriptionNL: isNl
      ? (selectedWeekRaw.descriptionNL || selectedWeekRaw.description || selectedWeekRaw.descriptionEN || selectedWeekRaw.desc)
      : (selectedWeekRaw.descriptionEN || selectedWeekRaw.description || selectedWeekRaw.descriptionNL || selectedWeekRaw.desc)
  };

  const getBlockStyle = (status, isSelected) => {
    const base = 'transition-all duration-200 cursor-pointer flex flex-col items-center justify-center p-2 rounded-xl text-center min-w-[85px] sm:min-w-[92px] h-[78px] border shadow-2xs ';
    
    let colorClass = '';
    switch (status) {
      case 'completed':
        colorClass = 'bg-[#E9EFE4] border-[#C8D6C0] text-[#3A5231]';
        break;
      case 'now':
        colorClass = 'bg-[#B4823A] border-[#A27330] text-white font-bold shadow-xs';
        break;
      case 'prep':
        colorClass = 'bg-[#E4EBE0] border-[#C5D4BF] text-[#34482B]';
        break;
      case 'materials':
        colorClass = 'bg-[#EAE4D9] border-[#D6CDBC] text-[#4A4235]';
        break;
      case 'build':
        colorClass = 'bg-[#3A4B35] border-[#2A3726] text-white font-bold';
        break;
      default:
        colorClass = 'bg-[#EAE7E1] border-[#D8D3C8] text-dark/40';
        break;
    }

    if (isSelected) {
      return base + colorClass + ' ring-2 ring-primary/40 scale-[1.03] shadow-md';
    }
    return base + colorClass + ' hover:opacity-90';
  };

  return (
    <div className="bg-white border border-[#D6CFC2] p-4 sm:p-5 rounded-2xl shadow-xs space-y-4 font-body">
      {/* 1. Title & Subtitle */}
      <div className="space-y-0.5 border-b border-[#D6CFC2]/60 pb-3">
        <h3 className="text-base sm:text-lg font-heading font-bold text-primary">
          {isNl ? 'Uw planning in weken' : 'Your planning in weeks'}
        </h3>
        <p className="text-xs text-dark/70">
          {isNl 
            ? 'In één oogopslag: wat gebeurt er wanneer. De volledige planning wordt definitief na de inmeting.'
            : 'At a glance: what happens when. The entire schedule is finalized after the site survey.'}
        </p>
      </div>

      {/* 2. Horizontal Scrollable 9 Week Blocks */}
      <div className="relative w-full overflow-hidden">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin max-w-full">
          {scheduleToRender.map((w, idx) => {
            const isSelected = idx === selectedWeekIndex;
            return (
              <button
                key={w.weekNumber || idx}
                type="button"
                onClick={() => setSelectedWeekIndex(idx)}
                className={getBlockStyle(w.status, isSelected)}
              >
                {/* Line 1: Week Number */}
                <span className="text-base sm:text-lg font-heading font-bold leading-none">
                  {w.weekNumber}
                </span>

                {/* Line 2: Subline / Date Range */}
                <span className="text-[9px] font-mono leading-tight mt-1 opacity-90 truncate max-w-[80px]">
                  {localizeSubline(w.subline || w.dateRange || '—')}
                </span>

                {/* Line 3: Phase Label */}
                <span className="text-[9px] font-bold uppercase font-mono tracking-tighter leading-tight mt-0.5 truncate max-w-[82px]">
                  {localizePhase(w.phase || w.phaseName || w.phaseNameEN || '—')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Color Legend Bar (Matching Client Mockup 1-to-1) */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-mono text-dark/70 pt-1 border-t border-[#D6CFC2]/60">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E9EFE4] border border-[#C8D6C0]" />
          <span>{isNl ? 'afgerond' : 'completed'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#B4823A]" />
          <span>{isNl ? 'nu' : 'now'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E4EBE0] border border-[#C5D4BF]" />
          <span>{isNl ? 'voorbereiding' : 'preparation'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EAE4D9] border border-[#D6CDBC]" />
          <span>{isNl ? 'materialen' : 'materials'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3A4B35]" />
          <span>{isNl ? 'bouw' : 'build'}</span>
        </div>
      </div>

      {/* 4. Selected Week Detail Card */}
      <div className="pt-2">
        <WeekCard weekData={selectedWeek} />
      </div>
    </div>
  );
}
