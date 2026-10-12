import React from 'react';
import { Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * WeekCard Component (Step 4 - Garden Room Extension)
 * 
 * Displays detailed information for a selected construction week block:
 * - Week number
 * - Date range (if available)
 * - Phase name & status
 * - Short description
 */
export default function WeekCard({ weekData = null }) {
  const { language } = useLanguage();
  const isNl = language === 'NL';

  if (!weekData) return null;

  const { weekNumber, phaseNameNL, phaseNameEN, dateRange, status, descriptionNL, descriptionEN } = weekData;

  const phaseName = isNl ? (phaseNameNL || phaseNameEN) : (phaseNameEN || phaseNameNL);
  const description = isNl ? (descriptionNL || descriptionEN) : (descriptionEN || descriptionNL);

  const getStatusBadge = () => {
    switch (status) {
      case 'done':
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-md">
            <CheckCircle2 className="w-3 h-3 text-green-700" /> {isNl ? 'Afgerond' : 'Completed'}
          </span>
        );
      case 'now':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-primary text-cream px-2 py-0.5 rounded-md">
            <Clock className="w-3 h-3 text-accent animate-pulse" /> {isNl ? 'Momenteel actief' : 'Currently Active'}
          </span>
        );
      case 'prep':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
            {isNl ? 'Voorbereiding' : 'Preparation'}
          </span>
        );
      case 'materials':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#EDE8DF] text-primary px-2 py-0.5 rounded-md">
            {isNl ? 'Materialen' : 'Materials'}
          </span>
        );
      case 'build':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-accent/20 text-accent px-2 py-0.5 rounded-md">
            {isNl ? 'De Bouw' : 'The Build'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
            {isNl ? 'Ingepland' : 'Scheduled'}
          </span>
        );
    }
  };


  return (
    <div className="bg-white border border-[#D6CFC2] rounded-xl p-4 shadow-xs space-y-2 font-body transition-all">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 border-b border-[#D6CFC2]/60 pb-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-primary/10 text-primary font-mono font-bold text-xs rounded-lg">
            Week {weekNumber}
          </span>
          <h4 className="font-heading font-bold text-primary text-sm sm:text-base">
            {phaseName || (isNl ? `Bouwfase Week ${weekNumber}` : `Build Phase Week ${weekNumber}`)}
          </h4>
        </div>
        <div>{getStatusBadge()}</div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-dark/70 gap-1 pt-1">
        {dateRange ? (
          <div className="flex items-center gap-1.5 font-mono text-dark/60">
            <Calendar className="w-3.5 h-3.5 text-accent" />
            <span>{dateRange}</span>
          </div>
        ) : null}
        {description ? (
          <p className="text-xs text-dark/80 leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
