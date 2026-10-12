import React, { useState, useEffect } from 'react';
import { 
  Check, Calendar, Clock, MessageSquare, Download, Sparkles, AlertCircle, FileText, CheckCircle2 
} from 'lucide-react';
import { downloadDirectPdfFile } from '../../utils/pdfGenerator';
import api from '../../api/apiClient';
import { useLanguage } from '../../context/LanguageContext';

/**
 * GardenRoomPlanningView Component (1-to-1 implementation of Client Mockup PDF Garden Rooms Page 9)
 */
export default function GardenRoomPlanningView({ project = null }) {
  const { language } = useLanguage();
  const isNl = language === 'NL';
  const [feedbackToast, setFeedbackToast] = useState('');
  const [schouwApproved, setSchouwApproved] = useState(() => {
    return project?.technicalSpecs?.schouw?.status === 'confirmed' || false;
  });
  const [isApproving, setIsApproving] = useState(false);
  const [customDateNote, setCustomDateNote] = useState('');
  
  // Interactive Prep Checklist state
  const [checklist, setChecklist] = useState({
    access: true, // Toegang achtertuin min 1.20m
    clearSite: false, // Bouwplek leeg ±15m²
    power: false, // Stroompunt max 25m
    parking: false, // Parkeerplek bus & aanhanger
    neighbours: false // Buren geïnformeerd
  });

  useEffect(() => {
    if (project?.technicalSpecs?.schouw?.status === 'confirmed') {
      setSchouwApproved(true);
    }
  }, [project?.technicalSpecs?.schouw?.status]);

  useEffect(() => {
    const remoteList = project?.technicalSpecs?.customerChecklist;
    if (remoteList && typeof remoteList === 'object') {
      setChecklist(prev => ({ ...prev, ...remoteList }));
    }
  }, [project?.technicalSpecs]);

  const projectCode = project?.projectNumber || project?.id || '';

  const toggleCheck = async (key) => {
    const nextVal = !checklist[key];
    setChecklist(prev => ({ ...prev, [key]: nextVal }));
    const pid = project?.id;
    if (pid) {
      try {
        await api.patch(`/customer/projects/${pid}/checklist/${key}`, { completed: nextVal });
      } catch (err) {
        console.warn('Checklist update error:', err);
      }
    }
    setFeedbackToast(isNl ? 'Voorbereidingschecklist bijgewerkt!' : 'Preparation checklist updated!');
    setTimeout(() => setFeedbackToast(''), 3000);
  };

  const handleApproveSchouw = async () => {
    setIsApproving(true);
    setSchouwApproved(true);
    const pid = project?.id;
    if (pid) {
      try {
        const surveyDate = project?.technicalSpecs?.schouw?.surveyDate || new Date().toISOString().split('T')[0];
        const timeSlot = project?.technicalSpecs?.schouw?.timeSlot || '09:00 - 11:00';
        await api.post(`/customer/projects/${pid}/schouw/confirm`, {
          surveyDate,
          timeSlot
        });
        window.dispatchEvent(new Event('app_data_changed'));
      } catch (e) {
        console.warn('API schouw confirm:', e);
      }
    }
    setFeedbackToast(isNl ? 'Schouwafspraak goedgekeurd & ingepland!' : 'Site survey appointment approved!');
    setIsApproving(false);
    setTimeout(() => setFeedbackToast(''), 4000);
  };

  const handleRequestOtherDate = async () => {
    if (!customDateNote.trim()) {
      setFeedbackToast(isNl ? 'Vul eerst jouw gewenste datum of tijdvak in.' : 'Please enter your preferred date/time first.');
      setTimeout(() => setFeedbackToast(''), 3000);
      return;
    }
    const pid = project?.id;
    if (pid) {
      try {
        await api.post(`/conversations/${pid}/messages`, {
          content: `Preferred site survey date request: ${customDateNote.trim()}`
        });
      } catch (e) {}
    }
    setFeedbackToast(isNl ? 'Verzoek voor andere datum ingediend! We nemen snel contact op.' : 'Alternative date request submitted! We will contact you shortly.');
    setCustomDateNote('');
    setTimeout(() => setFeedbackToast(''), 4000);
  };

  const handleDownloadNeighbourLetter = () => {
    downloadDirectPdfFile('neighbour-letter');
    setFeedbackToast(isNl ? 'Buren notificatiebrief gedownload!' : 'Neighbour Notification Letter downloaded successfully!');
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
          {isNl ? 'Maatwerk Buitenverblijf' : 'Custom Garden Room'} — project {projectCode || 'PRJ-2026-002'}
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
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-primary">
          {isNl ? 'Planning & bouw' : 'Planning & build'}
        </h1>
        <p className="text-xs sm:text-sm text-dark/70 font-medium">
          {isNl
            ? "Zo verloopt jouw project, week voor week. Als er iets verandert, hoor je het direct — ook bij eventuele vertragingen."
            : "This is how your project progresses, week by week. If anything changes, you'll hear it right away — even if it's bad news."}
        </p>
      </div>

      {/* 3. CARD 1: BUILD TIMELINE HEADER BOX */}
      <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-5 sm:p-6 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <span className="text-[10px] sm:text-[11px] uppercase font-mono font-bold tracking-wider text-accent">
            {isNl ? 'DE BOUW VAN JOUW BUITENVERBLIJF' : 'THE BUILD OF YOUR GARDEN ROOM'}
          </span>
          <span className="bg-[#FDF8EE] text-[#9E7B3B] border border-[#E8D4B0] px-3 py-1 rounded-full text-[11px] font-mono font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#9E7B3B]" />
            <span>{isNl ? 'Voorlopig — definitief na schouw' : 'Tentative — definitive after site survey'}</span>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-primary">
              Week 41 & 42 · 5 {isNl ? 't/m' : 'to'} 16 {isNl ? 'oktober' : 'October'} 2026
            </h2>
            <p className="text-xs sm:text-sm text-dark/70 leading-relaxed font-medium">
              {isNl 
                ? 'Nog 7 weken te gaan. De vakman bouwt in circa twee weken; oplevering is aan het einde van week 42.'
                : '7 weeks to go. The specialist builds in about two weeks; delivery is at the end of week 42.'}
            </p>
          </div>

          <p className="text-[11px] text-dark/60 sm:text-right max-w-xs italic font-medium">
            {isNl 
              ? 'Zodra de planning definitief is, ontvang je per fase een agenda-uitnodiging.'
              : 'Once the schedule is definitive, you will receive a calendar invitation per phase.'}
          </p>
        </div>
      </div>

      {/* 4. CARD 2: SITE SURVEY PROPOSAL CARD (Ons voorstel voor de schouw 1-to-1) */}
      <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-5 sm:p-6 rounded-2xl shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-[#D6CFC2]/60 pb-3">
          <h3 className="text-base sm:text-lg font-heading font-bold text-primary">
            {isNl ? 'Ons voorstel voor de schouw' : 'Our proposal for the site survey'}
          </h3>
          <span className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full border transition-all ${
            schouwApproved 
              ? 'bg-[#E5F0E3] text-[#2D5A27] border-green-300' 
              : 'bg-[#FDF8EE] text-[#9E7B3B] border-[#E8D4B0]'
          }`}>
            {schouwApproved 
              ? (isNl ? '✓ Schouwdatum bevestigd' : '✓ Site survey confirmed') 
              : (isNl ? '• Wacht op jouw akkoord' : '• Awaiting your approval')}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-dark/70 leading-relaxed font-medium">
          {isNl 
            ? 'Onze specialist controleert de maten, ondergrond en doorgang. Duurt circa 45 minuten; daarna maken we de planning definitief.'
            : 'Our specialist verifies measurements, ground condition, and garden access. Takes about 45 minutes; afterwards we finalize the entire schedule.'}
        </p>

        {/* Soft Sage-Green Date Highlight Box (1-to-1 Client Mockup) */}
        <div className="bg-[#EAF0E8] border border-[#BACBB7] p-4.5 rounded-2xl space-y-1.5 max-w-lg shadow-2xs">
          <div className="text-base sm:text-lg font-heading font-bold text-primary">
            {isNl ? 'Donderdag 27 augustus 2026' : 'Thursday 27 August 2026'}
          </div>
          <div className="text-xs sm:text-[13px] text-dark/80 font-medium leading-relaxed">
            {isNl 
              ? 'rond 10:00 · graag iemand thuis en achtertuin toegankelijk'
              : 'around 10:00 · please have someone at home and back garden accessible'}
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
            <span>
              {schouwApproved 
                ? (isNl ? 'Goedgekeurd & Ingepland' : 'Approved & Scheduled') 
                : (isNl ? 'Akkoord — plan de schouw in' : 'Approve — schedule site survey')}
            </span>
          </button>

          <span className="text-[11px] sm:text-xs text-dark/60 italic font-medium">
            {isNl 
              ? 'Aanpassingen kunnen kosteloos tot 2 dagen van tevoren worden doorgegeven.'
              : 'Modifications can be made free of charge up to 2 days in advance.'}
          </span>
        </div>

        {/* Custom Date Input Prompt */}
        <div className="pt-3 border-t border-[#D6CFC2]/60 space-y-2">
          <p className="text-xs sm:text-xs text-dark/70 font-medium">
            {isNl 
              ? 'Komt deze dag niet uit? Laat ons weten wanneer het wel schikt.'
              : 'Does this day not suit you? Let us know when it works for you.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5 max-w-xl">
            <input
              type="text"
              value={customDateNote}
              onChange={(e) => setCustomDateNote(e.target.value)}
              placeholder={isNl ? 'Bijvoorbeeld: Vrijdag komt beter uit, of na 16:00' : 'For example: Friday works better, or after 16:00'}
              className="flex-1 bg-white border border-[#D6CFC2] px-4 py-2.5 rounded-xl text-xs text-dark focus:outline-none focus:border-primary shadow-2xs placeholder:text-dark/40 font-medium"
            />
            <button
              type="button"
              onClick={handleRequestOtherDate}
              className="px-4 py-2.5 bg-[#FAF8F5] text-dark/80 border border-[#D6CFC2] text-xs font-bold rounded-xl hover:bg-gray-50 transition-all cursor-pointer shadow-2xs flex-shrink-0"
            >
              {isNl ? 'Andere dag aanvragen' : 'Request another day'}
            </button>
          </div>
        </div>
      </div>

      {/* 5. BOTTOM GRID: LEFT 2/3 COLUMN VS RIGHT 1/3 COLUMN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* LEFT COLUMN: WEEK BY WEEK TIMELINE (2 Columns wide) */}
        <div className="md:col-span-2 bg-[#FAF8F5] border border-[#D8D2C5] p-5 sm:p-6 rounded-2xl shadow-xs space-y-5">
          <h3 className="text-base sm:text-lg font-heading font-bold text-primary border-b border-[#D6CFC2]/60 pb-3">
            {isNl ? 'Week voor week' : 'Week by week'}
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
                    {isNl ? 'Ontwerp & werktekening' : 'Design & working drawing'}
                  </h4>
                  <span className="bg-[#E5F0E3] text-[#2D5A27] text-[10px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                    <Check className="w-3 h-3 text-[#2D5A27]" />
                    <span>{isNl ? 'Voltooid' : 'Completed'}</span>
                  </span>
                </div>
                <p className="text-xs sm:text-[13px] text-dark/70 leading-relaxed font-medium">
                  {isNl 
                    ? 'Render versie 2 en werktekening zijn beschikbaar in jouw portaal.'
                    : 'Render version 2 and working drawing are available in your portal.'}
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
                    {isNl ? 'Schouw op locatie' : 'On-site survey'}
                  </h4>
                  <span className="bg-[#FDF8EE] text-[#9E7B3B] border border-[#E8D4B0] text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                    {isNl ? '• Voorstel wacht op akkoord' : '• Proposal awaiting approval'}
                  </span>
                </div>
                <p className="text-xs sm:text-[13px] text-dark/70 leading-relaxed font-medium">
                  {isNl 
                    ? 'Inmeten, controle ondergrond en doorgang. Planning daarna definitief.'
                    : 'Verify measurements, ground condition, and access. Schedule finalized afterwards.'}
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
                    {isNl ? 'Grondwerk & voorbereiding' : 'Groundwork & preparation'}
                  </h4>
                  <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-amber-200">
                    {isNl ? '⚙ Voorlopig' : '⚙ Tentative'}
                  </span>
                </div>
                <p className="text-xs sm:text-[13px] text-dark/70 leading-relaxed font-medium">
                  {isNl 
                    ? 'Grondwerk en betonpoeren. Één dag werk; tuin blijft bruikbaar.'
                    : 'Groundwork and concrete pad footings. One day work; garden remains usable.'}
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
                    {isNl ? 'Materialen geleverd' : 'Materials delivered'}
                  </h4>
                  <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-amber-200">
                    {isNl ? '⚙ Voorlopig' : '⚙ Tentative'}
                  </span>
                </div>
                <p className="text-xs sm:text-[13px] text-dark/70 leading-relaxed font-medium">
                  {isNl 
                    ? 'Douglas houtpakket en dakbedekking geleverd — ± 15 m² opslagruimte benodigd.'
                    : 'Douglas package and roofing delivered — ± 15 m² storage space required.'}
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
                    {isNl ? 'De bouw' : 'The build'}
                  </h4>
                  <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-amber-200">
                    {isNl ? '⚙ Voorlopig' : '⚙ Tentative'}
                  </span>
                </div>
                <p className="text-xs sm:text-[13px] text-dark/70 leading-relaxed font-medium">
                  {isNl 
                    ? 'Constructie, dak, glazen schuifwand, elektra & vloer. Oplevering einde week 42 met jou.'
                    : 'Structure, roof, sliding door, electrical & floor. Final handover at end of week 42 with you.'}
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
                    {isNl ? 'Controle na 3 maanden' : '3-month checkup'}
                  </h4>
                  <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                    {isNl ? 'Binnenkort' : 'Upcoming'}
                  </span>
                </div>
                <p className="text-xs sm:text-[13px] text-dark/70 leading-relaxed font-medium">
                  {isNl 
                    ? 'We nemen contact op om te controleren of alles perfect blijft — onderdeel van nazorg.'
                    : 'We follow up to ensure everything remains perfect — part of aftercare.'}
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
              {isNl ? 'Voorbereiding op de bouwweek' : 'Preparing for build week'}
            </h4>

            <p className="text-[11px] sm:text-xs text-dark/70 leading-relaxed font-medium">
              {isNl 
                ? 'Vink af wat gereed is — dan weten wij het ook. Uitgebreide gids bij documenten.'
                : 'Check off completed items — so we know as well. Detailed guide in documents.'}
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
                  {isNl ? 'Toegang achtertuin minimaal 1,20 m breed' : 'Garden access at least 1.20 m wide'}
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
                  {isNl ? 'Bouwplek leeg & bereikbaar (± 15 m² extra ruimte)' : 'Build site cleared & accessible (± 15 m² extra space)'}
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
                  {isNl ? 'Stroompunt aanwezig binnen max 25 m' : 'Power outlet available within max 25 m'}
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
                  {isNl ? 'Parkeerplek voor bus & aanhanger dichtbij' : 'Parking space for van & trailer nearby'}
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
                  {isNl ? 'Buren geïnformeerd over de bouwweek' : 'Neighbours notified about build week'}
                </span>
              </label>
            </div>
          </div>

          {/* 2. NEIGHBOUR LETTER CARD (ATTENT VOOR DE BUREN) */}
          <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-5 rounded-2xl shadow-xs space-y-3">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-accent block">
              {isNl ? 'ATTENT VOOR DE BUREN' : 'COURTESY FOR NEIGHBOURS'}
            </span>

            <h4 className="font-heading font-bold text-primary text-sm sm:text-base">
              {isNl ? 'Kant-en-klare buren brief' : 'Ready-to-use neighbour letter'}
            </h4>

            <p className="text-[11px] sm:text-xs text-dark/70 leading-relaxed font-medium">
              {isNl 
                ? 'Twee weken bouwen geeft wat geluid. We hebben een vriendelijke brief klaargezet om met je buren te delen — vooraf ingevuld met bouwdata.'
                : 'Two weeks of construction generates some noise. We prepared a friendly notice letter to share with your neighbours — pre-filled with build dates.'}
            </p>

            <button
              type="button"
              onClick={handleDownloadNeighbourLetter}
              className="w-full px-4 py-2.5 bg-white text-dark/80 border border-[#D6CFC2] text-xs font-bold rounded-xl hover:bg-gray-50 transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-primary" />
              <span>{isNl ? 'Download buren brief (PDF)' : 'Download neighbour letter (PDF)'}</span>
            </button>
          </div>

          {/* 3. HOW BUILD WORKS CARD (Zo verloopt de bouw) */}
          <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-5 rounded-2xl shadow-xs space-y-3">
            <h4 className="font-heading font-bold text-primary text-sm sm:text-base border-b border-[#D6CFC2]/60 pb-2">
              {isNl ? 'Zo verloopt de bouw' : 'How the build works'}
            </h4>

            <ol className="space-y-2.5 text-xs sm:text-[13px] text-dark/80 font-medium">
              <li className="flex items-start gap-2.5">
                <span className="font-bold text-primary font-mono text-xs w-4 flex-shrink-0">1</span>
                <span>
                  {isNl ? 'Vakman werkt op werkdagen tussen 7:30 en 16:30.' : 'Specialist works on weekdays between 7:30 and 16:30.'}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-bold text-primary font-mono text-xs w-4 flex-shrink-0">2</span>
                <span>
                  {isNl ? 'Niet nodig om thuis te blijven — alleen bij start en eindoplevering.' : 'No need to stay home — only required at start and final handover.'}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-bold text-primary font-mono text-xs w-4 flex-shrink-0">3</span>
                <span>
                  {isNl ? 'Elke werkdag eindigt met een opgeruimde tuin.' : 'Every workday ends with a tidied-up garden.'}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-bold text-primary font-mono text-xs w-4 flex-shrink-0">4</span>
                <span>
                  {isNl ? 'Vragen tijdens de bouw? Tim & Bram zijn altijd bereikbaar, ook in de avond.' : 'Questions during construction? Contact Tim & Bram anytime, evenings included.'}
                </span>
              </li>
            </ol>
          </div>

        </div>
      </div>
    </div>
  );
}
