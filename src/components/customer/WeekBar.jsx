import React, { useState } from 'react';
import WeekCard from './WeekCard';
import { Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

  // 1-to-1 Client Mockup 9-Week Schedule Data
  const mockupSchedule = [
    { weekNumber: 34, subline: 'this week', phase: 'DESIGN', status: 'completed', dateRange: '17 – 23 Aug', descriptionEN: 'Design phase completed. 3D renders version 2 approved.', phaseNameEN: 'Design' },
    { weekNumber: 35, subline: '24-28 Aug', phase: 'SITE SURVEY', status: 'now', dateRange: '24 – 28 Aug', descriptionEN: 'Site survey on location with craftsman. Measuring dimensions and access route.', phaseNameEN: 'Site Survey' },
    { weekNumber: 36, subline: '—', phase: '—', status: 'planned', dateRange: '31 Aug – 04 Sep', descriptionEN: 'Scheduled buffer week before workshop preparation.', phaseNameEN: 'Buffer Week' },
    { weekNumber: 37, subline: '—', phase: '—', status: 'planned', dateRange: '07 – 11 Sep', descriptionEN: 'Scheduled buffer week before timber ordering.', phaseNameEN: 'Buffer Week' },
    { weekNumber: 38, subline: '—', phase: '—', status: 'planned', dateRange: '14 – 18 Sep', descriptionEN: 'Finalizing technical specifications before workshop cutting.', phaseNameEN: 'Buffer Week' },
    { weekNumber: 39, subline: '21-25 Sep', phase: 'PREPARATION', status: 'prep', dateRange: '21 – 25 Sep', descriptionEN: 'Preparation in workshop: ordering Douglas timber and EPDM roof system.', phaseNameEN: 'Preparation' },
    { weekNumber: 40, subline: '28 Sep-2 Oct', phase: 'MATERIALS', status: 'materials', dateRange: '28 Sep – 02 Oct', descriptionEN: 'Cutting and oiling timber trusses in the workshop.', phaseNameEN: 'Materials' },
    { weekNumber: 41, subline: '5-9 Oct', phase: 'THE BUILD', status: 'build', dateRange: '05 – 09 Oct', descriptionEN: 'On-site construction week 1: installing main structure and roof.', phaseNameEN: 'The Build (Week 1)' },
    { weekNumber: 42, subline: '12-16 Oct', phase: 'BUILD & DELIVERY', status: 'build', dateRange: '12 – 16 Oct', descriptionEN: 'On-site construction week 2: glass wall assembly and final handover.', phaseNameEN: 'Build & Delivery' },
  ];

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
    phaseNameNL: selectedWeekRaw.phaseNameEN || selectedWeekRaw.phase,
    descriptionNL: selectedWeekRaw.descriptionEN || selectedWeekRaw.desc
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
          Your planning in weeks
        </h3>
        <p className="text-xs text-dark/70">
          At a glance: what happens when. The entire schedule is finalized after the site survey.
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
                  {w.subline || w.dateRange || '—'}
                </span>

                {/* Line 3: Phase Label */}
                <span className="text-[9px] font-bold uppercase font-mono tracking-tighter leading-tight mt-0.5 truncate max-w-[82px]">
                  {w.phase || w.phaseNameEN || '—'}
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
          <span>completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#B4823A]" />
          <span>now</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E4EBE0] border border-[#C5D4BF]" />
          <span>preparation</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EAE4D9] border border-[#D6CDBC]" />
          <span>materials</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3A4B35]" />
          <span>build</span>
        </div>
      </div>

      {/* 4. Selected Week Detail Card */}
      <div className="pt-2">
        <WeekCard weekData={selectedWeek} />
      </div>
    </div>
  );
}
