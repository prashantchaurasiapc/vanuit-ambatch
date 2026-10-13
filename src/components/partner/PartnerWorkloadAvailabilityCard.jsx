import React, { useState, useEffect } from 'react';
import Button from '../Button';
import Badge from '../Badge';
import { Check, Calendar, Activity, CheckCircle2, Clock, AlertTriangle, ShieldAlert, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../api/apiClient';

function getUpcomingWeeks(count = 14) {
  const weeks = [];
  const today = new Date();
  
  for (let i = 0; i < count; i++) {
    const d = new Date(today.getTime() + i * 7 * 24 * 60 * 60 * 1000);
    
    // ISO week number calculation
    const target = new Date(d.valueOf());
    const dayNr = (d.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    const weekNum = 1 + Math.ceil((firstThursday - target) / 604800000);
    
    // Start of week (Monday)
    const mon = new Date(d);
    mon.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    // End of week (Sunday)
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);

    const monthNamesNL = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
    const monthNamesEN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    weeks.push({
      weekNum,
      year: mon.getFullYear(),
      isCurrent: i === 0,
      rangeNL: `${mon.getDate()} ${monthNamesNL[mon.getMonth()]} - ${sun.getDate()} ${monthNamesNL[sun.getMonth()]}`,
      rangeEN: `${mon.getDate()} ${monthNamesEN[mon.getMonth()]} - ${sun.getDate()} ${monthNamesEN[sun.getMonth()]}`,
    });
  }
  return weeks;
}

export default function PartnerWorkloadAvailabilityCard({ onWorkloadChange, onClose }) {
  const { language } = useLanguage();
  const isNL = language === 'NL';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [workloadStatus, setWorkloadStatus] = useState(() => {
    try {
      const draft = sessionStorage.getItem('partner_workload_draft');
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.workloadStatus) return parsed.workloadStatus;
      }
    } catch {}
    return 'available';
  });

  const [selectedWeeks, setSelectedWeeks] = useState(() => {
    try {
      const draft = sessionStorage.getItem('partner_workload_draft');
      if (draft) {
        const parsed = JSON.parse(draft);
        if (Array.isArray(parsed.selectedWeeks)) return parsed.selectedWeeks;
      }
    } catch {}
    return [];
  });

  const upcomingWeeks = getUpcomingWeeks(14);

  // Load current availability from backend if not drafting
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const res = await api.get('/partner/workload');
        if (isMounted && res.success && res.data) {
          const draft = sessionStorage.getItem('partner_workload_draft');
          if (!draft) {
            setWorkloadStatus(res.data.workloadStatus || 'available');
            setSelectedWeeks(Array.isArray(res.data.availableWeeks) ? res.data.availableWeeks : []);
          }
        }
      } catch (err) {
        console.warn('Could not load partner workload directly, falling back:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  // Sync draft state to sessionStorage so page refresh retains work
  useEffect(() => {
    if (!loading) {
      try {
        sessionStorage.setItem('partner_workload_draft', JSON.stringify({ workloadStatus, selectedWeeks }));
      } catch {}
    }
  }, [workloadStatus, selectedWeeks, loading]);

  const toggleWeek = (weekNum) => {
    setSelectedWeeks(prev => {
      if (prev.includes(weekNum)) {
        return prev.filter(w => w !== weekNum);
      } else {
        return [...prev, weekNum].sort((a, b) => a - b);
      }
    });
    setSuccessMsg('');
  };

  const handleSelectNext4Weeks = () => {
    const next4 = upcomingWeeks.slice(0, 4).map(w => w.weekNum);
    setSelectedWeeks(Array.from(new Set([...selectedWeeks, ...next4])).sort((a, b) => a - b));
    setSuccessMsg('');
  };

  const handleSelectAll = () => {
    const all = upcomingWeeks.map(w => w.weekNum);
    setSelectedWeeks(all);
    setSuccessMsg('');
  };

  const handleClearWeeks = () => {
    setSelectedWeeks([]);
    setSuccessMsg('');
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.patch('/partner/workload', {
        workloadStatus,
        availableWeeks: selectedWeeks,
      });

      if (res.success) {
        try { sessionStorage.removeItem('partner_workload_draft'); } catch {}
        setSuccessMsg(isNL 
          ? 'Beschikbaarheid en werkdruk succesvol opgeslagen!' 
          : 'Workload and available weeks saved successfully!'
        );
        if (onWorkloadChange) {
          onWorkloadChange(res.data);
        }
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(res.error?.message || (isNL ? 'Opslaan mislukt' : 'Failed to save'));
      }
    } catch (err) {
      console.error('Failed to update partner availability:', err);
      setErrorMsg(isNL ? 'Er is een fout opgetreden bij het opslaan' : 'An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const statusOptions = [
    {
      id: 'available',
      labelNL: 'Beschikbaar',
      labelEN: 'Available',
      descNL: 'Open voor nieuwe projecten',
      descEN: 'Open for new projects',
      color: 'border-emerald-500 bg-emerald-50/80 text-emerald-900',
      activeRing: 'ring-2 ring-emerald-600 shadow-xs',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
    },
    {
      id: 'busy',
      labelNL: 'Druk',
      labelEN: 'Busy',
      descNL: 'Beperkte capaciteit',
      descEN: 'Limited capacity',
      color: 'border-amber-500 bg-amber-50/80 text-amber-900',
      activeRing: 'ring-2 ring-amber-600 shadow-xs',
      icon: Clock,
      iconColor: 'text-amber-600',
    },
    {
      id: 'fully_booked',
      labelNL: 'Volgeboekt',
      labelEN: 'Fully Booked',
      descNL: 'Geen ruimte beschikbaar',
      descEN: 'No current capacity',
      color: 'border-rose-500 bg-rose-50/80 text-rose-900',
      activeRing: 'ring-2 ring-rose-600 shadow-xs',
      icon: AlertTriangle,
      iconColor: 'text-rose-600',
    },
    {
      id: 'inactive',
      labelNL: 'Inactief',
      labelEN: 'Inactive',
      descNL: 'Tijdelijk gepauzeerd',
      descEN: 'Temporarily inactive',
      color: 'border-stone-400 bg-stone-100 text-stone-800',
      activeRing: 'ring-2 ring-stone-500 shadow-xs',
      icon: ShieldAlert,
      iconColor: 'text-stone-500',
    },
  ];

  const currentBadgeVariant = workloadStatus === 'available' 
    ? 'success' 
    : workloadStatus === 'busy' 
      ? 'warning' 
      : 'danger';

  return (
    <div className="bg-[#FAF8F5] rounded-2xl shadow-2xl border border-[#C4BEB3]/80 overflow-hidden flex flex-col h-full max-h-[90vh] sm:max-h-[85vh] w-full text-dark">
      {/* Header Banner - Sticky Top */}
      <div className="p-3.5 sm:p-5 border-b border-[#E3DEC3] bg-gradient-to-r from-[#F5F2EB] to-[#ECE7DE] shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-heading font-bold text-sm sm:text-base md:text-lg text-primary leading-tight">
                  {isNL ? 'Mijn Werkdruk & Beschikbaarheid' : 'My Workload & Availability'}
                </h3>
                <Badge variant={currentBadgeVariant}>
                  {statusOptions.find(s => s.id === workloadStatus)?.[isNL ? 'labelNL' : 'labelEN']}
                </Badge>
              </div>
              <p className="text-[11px] sm:text-xs text-dark/60 font-body mt-0.5 line-clamp-1 sm:line-clamp-none">
                {isNL 
                  ? 'Geef aan wanneer u nieuwe projecten kunt aannemen zodat de beheerder u direct kan inplannen.'
                  : 'Specify when you can accept new projects so admins can schedule work accurately.'}
              </p>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/15 text-dark/70 hover:text-dark flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Feedback alerts */}
        {successMsg && (
          <div className="mt-2.5 p-2 sm:p-2.5 rounded-lg bg-emerald-100/90 border border-emerald-300 text-emerald-800 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="truncate">{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mt-2.5 p-2 sm:p-2.5 rounded-lg bg-rose-100/90 border border-rose-300 text-rose-800 text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span className="truncate">{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Scrollable Content Body */}
      <div className="p-3.5 sm:p-5 md:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1 min-h-0 overscroll-contain">
        {/* Step 1: Workload Status selection */}
        <div>
          <label className="block text-[11px] sm:text-xs font-heading font-bold text-dark/80 uppercase tracking-wider mb-2">
            {isNL ? '1. Actuele Werkdruk Status' : '1. Current Workload Status'}
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
            {statusOptions.map((opt) => {
              const IconComp = opt.icon;
              const isSelected = workloadStatus === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => { setWorkloadStatus(opt.id); setSuccessMsg(''); }}
                  className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between cursor-pointer ${
                    isSelected 
                      ? `${opt.color} ${opt.activeRing}` 
                      : 'border-[#D6CFC2]/70 bg-white/70 hover:bg-white text-dark/70 hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-heading font-bold flex items-center gap-1.5 truncate">
                      <IconComp className={`w-3.5 h-3.5 shrink-0 ${opt.iconColor}`} />
                      <span className="truncate">{isNL ? opt.labelNL : opt.labelEN}</span>
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
                  </div>
                  <p className="text-[10px] sm:text-[11px] opacity-75 font-body leading-snug line-clamp-1 sm:line-clamp-none">
                    {isNL ? opt.descNL : opt.descEN}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Available Calendar Weeks */}
        <div className="pt-3 sm:pt-4 border-t border-[#EAE5D9]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 sm:mb-3">
            <div>
              <label className="block text-[11px] sm:text-xs font-heading font-bold text-dark/80 uppercase tracking-wider">
                {isNL ? '2. Weken waarin u nieuwe projecten kunt aannemen' : '2. Weeks When You Can Accept New Projects'}
              </label>
              <p className="text-[10px] sm:text-[11px] text-dark/50 font-body mt-0.5">
                {isNL 
                  ? 'Klik op een kalenderweek om deze aan of uit te zetten. Geselecteerde weken worden getoond aan de beheerder.' 
                  : 'Click a week to toggle availability. Selected weeks indicate open project capacity to the admin.'}
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-center">
              <button
                type="button"
                onClick={handleSelectNext4Weeks}
                className="px-2.5 py-1 text-[10px] sm:text-[11px] font-medium bg-[#EFECE6] hover:bg-[#E3DEC3] text-dark/80 rounded-md transition-colors cursor-pointer"
              >
                {isNL ? '+ Komende 4 Weken' : '+ Next 4 Weeks'}
              </button>
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-2.5 py-1 text-[10px] sm:text-[11px] font-medium bg-[#EFECE6] hover:bg-[#E3DEC3] text-dark/80 rounded-md transition-colors cursor-pointer"
              >
                {isNL ? 'Alles Selecteren' : 'Select All'}
              </button>
              <button
                type="button"
                onClick={handleClearWeeks}
                className="px-2.5 py-1 text-[10px] sm:text-[11px] font-medium text-dark/50 hover:text-dark hover:bg-[#EFECE6] rounded-md transition-colors cursor-pointer"
              >
                {isNL ? 'Wissen' : 'Clear'}
              </button>
            </div>
          </div>

          {/* Week chips grid - fully responsive from 2 to 7 cols */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 sm:gap-2 pt-1">
            {upcomingWeeks.map((w) => {
              const isSelected = selectedWeeks.includes(w.weekNum);
              return (
                <button
                  key={`${w.year}-${w.weekNum}`}
                  type="button"
                  onClick={() => toggleWeek(w.weekNum)}
                  className={`p-2 rounded-xl border text-center transition-all duration-150 flex flex-col items-center justify-center relative cursor-pointer min-h-[54px] sm:min-h-[58px] ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-xs ring-1 ring-primary/40 font-semibold'
                      : 'bg-white/90 hover:bg-white border-[#D6CFC2] text-dark hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center gap-1 font-heading font-bold text-xs">
                    {isSelected && <Check className="w-3 h-3 text-emerald-300" />}
                    <span>Week {w.weekNum}</span>
                  </div>
                  <span className={`text-[10px] font-body mt-0.5 truncate w-full ${
                    isSelected ? 'text-white/80' : 'text-dark/50'
                  }`}>
                    {isNL ? w.rangeNL : w.rangeEN}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Weeks Summary & Action Footer - Sticky Bottom */}
      <div className="border-t border-[#EAE5D9] bg-[#F5F2EB] p-3 sm:p-4 px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-dark/70 gap-2.5 sm:gap-3 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
          <span className="font-semibold text-dark/80 whitespace-nowrap">
            {isNL ? 'Geselecteerde capaciteit:' : 'Selected capacity:'}
          </span>
          {selectedWeeks.length === 0 ? (
            <span className="text-amber-700 font-medium">
              {isNL ? 'Geen weken geselecteerd (geen nieuwe projecten aannemen)' : 'No weeks selected (not accepting new projects)'}
            </span>
          ) : (
            <span className="text-primary font-bold truncate">
              {selectedWeeks.length} {isNL ? 'weken beschikbaar' : 'weeks available'} 
              <span className="text-dark/50 font-normal ml-1 hidden md:inline">
                ({selectedWeeks.map(w => `Wk ${w}`).join(', ')})
              </span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {onClose && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClose}
              className="text-xs px-3 sm:px-3.5 py-1.5 border-[#C4BEB3] text-dark/70 hover:text-dark hover:bg-black/5"
            >
              {isNL ? 'Annuleren' : 'Close'}
            </Button>
          )}
          <Button 
            size="sm" 
            onClick={handleSave} 
            disabled={saving || loading}
            className="bg-primary hover:bg-primary-dark text-white font-semibold text-xs px-3.5 sm:px-4 py-1.5 shadow-xs"
          >
            {saving ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                {isNL ? 'Opslaan...' : 'Saving...'}
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                {isNL ? 'Wijzigingen Opslaan' : 'Save Changes'}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
