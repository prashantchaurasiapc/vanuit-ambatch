import React, { useState } from 'react';
import { MessageSquare, Sparkles, Check, Download, ShieldCheck, Star, ExternalLink, Calendar, RefreshCw } from 'lucide-react';
import { downloadDirectPdfFile } from '../../utils/pdfGenerator';
import { useLanguage } from '../../context/LanguageContext';

/**
 * GardenRoomHandoverView Component (1-to-1 exact implementation of Client Mockup PDF Garden Rooms Page 14)
 * 
 * 100% Responsive & Zero Button Overflow:
 * - Full-width responsive button pills (w-full truncate text-center)
 * - Responsive grid breakpoints (sm:grid-cols-2 lg:grid-cols-3 / xl:grid-cols-4)
 * - Warm vertical timber slat banner pattern (bg-[#B69661] matching PDF Page 14 1-to-1)
 * - Section 1: Handover Approval Grid (Is everything correct? [2 cols] + Warranty & Aftercare soft greige card bg-[#EAE6DD] [1 col])
 * - Section 2: Seasonal Maintenance Calendar (4 seasonal sub-cards in bg-[#F5F2EC] + reminder checkbox)
 * - Section 3: Bottom 3 Cards Grid (3-Month Checkup + Google Review/Instagram + Complete Your Outdoor Living cross-sell)
 */
export default function GardenRoomHandoverView({ project = null }) {
  const { language } = useLanguage();
  const isNl = language === 'NL';

  const [feedbackToast, setFeedbackToast] = useState('');
  const [checklist, setChecklist] = useState({
    drawing: true,
    roof: true,
    slidingDoors: true,
    gardenClean: true
  });

  const [confirmed, setConfirmed] = useState(false);
  const [seasonalReminder, setSeasonalReminder] = useState(true);

  const projectCode = project?.projectNumber || project?.id || 'PRJ-2026-021';

  const toggleCheck = (key) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleConfirmHandover = () => {
    setConfirmed(true);
    setFeedbackToast(
      isNl
        ? 'Oplevering bevestigd! Eindfactuur & garantiecertificaat zijn geactiveerd.'
        : 'Handover confirmed! Final invoice & warranty certificate activated.'
    );
    setTimeout(() => setFeedbackToast(''), 4000);
  };

  const handleDownloadWarranty = () => {
    downloadDirectPdfFile('warranty-certificate-garden-room');
    setFeedbackToast(
      isNl ? 'Garantiecertificaat (PDF) gedownload!' : 'Downloaded Warranty Certificate (PDF)!'
    );
    setTimeout(() => setFeedbackToast(''), 3500);
  };

  return (
    <div className="space-y-3 sm:space-y-3.5 font-body text-[#4A4A43] w-full overflow-x-hidden">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed top-20 right-4 z-[9999] flex items-center gap-2 bg-primary text-cream px-3.5 py-2.5 rounded-xl shadow-xl border border-primary/20 text-xs font-medium">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* 1. TOP HEADER TAG BAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-dark/60">
        <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-md font-bold text-[11px]">
          {isNl ? 'Maatwerk Buitenverblijf' : 'Custom Garden Room'} — project {projectCode}
        </span>
        <div className="flex items-center gap-2">
          <span className="bg-cream border border-[#D6CFC2] px-2 py-0.5 rounded-md font-bold text-[10px]">
            {isNl ? '3 Updates' : 'Updates 3'}
          </span>
          <a
            href="https://wa.me/31682008025"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary text-cream px-2.5 py-0.5 rounded-xl text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1 shadow-xs"
          >
            <MessageSquare className="w-3 h-3 text-accent" />
            <span>{isNl ? 'WhatsApp ons' : 'WhatsApp us'}</span>
          </a>
        </div>
      </div>

      {/* 2. PAGE TITLE & SUBTITLE */}
      <div className="space-y-0.5">
        <h1 className="text-lg sm:text-xl font-heading font-bold text-primary">
          {isNl ? 'Oplevering & Nazorg' : 'Handover & Aftercare'}
        </h1>
        <p className="text-[11px] sm:text-xs text-dark/70 font-medium">
          {isNl
            ? 'Opgeleverd op 16 oktober 2026. Veel plezier met je buitenverblijf — en we blijven bereikbaar.'
            : 'Handed over on 16 October 2026. Enjoy your garden room — and we remain reachable.'}
        </p>
      </div>

      {/* 3. PHOTO BANNER CARD (Compact Sleek Height) */}
      <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-2 rounded-2xl shadow-xs relative overflow-hidden">
        <div className="relative h-32 sm:h-36 w-full rounded-xl overflow-hidden bg-[#B69661] border border-[#A4824D]/40 flex items-end p-3 shadow-inner"
             style={{
               backgroundImage: `repeating-linear-gradient(90deg, #B69661, #B69661 14px, #A58450 14px, #A58450 16px, #C2A36C 16px, #C2A36C 28px)`
             }}>
          <div className="bg-[#4E3D2C]/85 backdrop-blur-xs text-white font-mono text-[9px] sm:text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
            {isNl ? 'JOUW BUITENVERBLIJF · 16 OKTOBER 2026' : 'YOUR GARDEN ROOM · 16 OCTOBER 2026'}
          </div>
        </div>
      </div>

      {/* 4. SECTION 1: HANDOVER APPROVAL & WARRANTY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-stretch">
        
        {/* Left Card: Is Everything Correct? (2 Columns wide on lg) */}
        <div className="lg:col-span-2 bg-[#FAF8F5] border border-[#D8D2C5] p-3.5 sm:p-4 rounded-2xl shadow-xs space-y-2.5 flex flex-col justify-between">
          <div className="space-y-1.5">
            <h3 className="font-heading font-bold text-primary text-sm sm:text-base">
              {isNl ? 'Klopt alles naar wens?' : 'Is everything correct?'}
            </h3>
            <p className="text-[11px] sm:text-xs text-dark/70 leading-relaxed font-medium">
              {isNl
                ? 'We hebben samen de oplevering nagelopen. Bevestig hieronder — daarna volgt de slottermijn (20%). Merk je later toch iets op? Nazorg blijft altijd mogelijk.'
                : 'We went through the handover together. Confirm below — after that the final term (20%) follows. Notice something later? Aftercare is always available.'}
            </p>

            {/* Checkbox List */}
            <div className="space-y-1.5 pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-[11px] sm:text-xs font-medium text-dark/80 hover:text-primary">
                <input
                  type="checkbox"
                  checked={checklist.drawing}
                  onChange={() => toggleCheck('drawing')}
                  className="w-3.5 h-3.5 rounded text-primary border-[#D6CFC2] focus:ring-primary accent-[#2B3827]"
                />
                <span className="truncate">{isNl ? 'Gebouwd conform werktekening en render' : 'Built according to drawing and render'}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-[11px] sm:text-xs font-medium text-dark/80 hover:text-primary">
                <input
                  type="checkbox"
                  checked={checklist.roof}
                  onChange={() => toggleCheck('roof')}
                  className="w-3.5 h-3.5 rounded text-primary border-[#D6CFC2] focus:ring-primary accent-[#2B3827]"
                />
                <span className="truncate">{isNl ? 'Dak, boeidelen en hemelwaterafvoer gecontroleerd' : 'Roof, gutters and drainage inspected'}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-[11px] sm:text-xs font-medium text-dark/80 hover:text-primary">
                <input
                  type="checkbox"
                  checked={checklist.slidingDoors}
                  onChange={() => toggleCheck('slidingDoors')}
                  className="w-3.5 h-3.5 rounded text-primary border-[#D6CFC2] focus:ring-primary accent-[#2B3827]"
                />
                <span className="truncate">{isNl ? 'Schuifwanden, elektra en verlichting functioneren' : 'Sliding doors, electrics and lighting working'}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-[11px] sm:text-xs font-medium text-dark/80 hover:text-primary">
                <input
                  type="checkbox"
                  checked={checklist.gardenClean}
                  onChange={() => toggleCheck('gardenClean')}
                  className="w-3.5 h-3.5 rounded text-primary border-[#D6CFC2] focus:ring-primary accent-[#2B3827]"
                />
                <span className="truncate">{isNl ? 'Tuin en bouwplaats netjes en schoon achtergelaten' : 'Garden and build site left clean and tidy'}</span>
              </label>
            </div>
          </div>

          <div className="pt-1.5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleConfirmHandover}
              disabled={confirmed}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs ${
                confirmed
                  ? 'bg-[#E5F0E3] text-[#2D5A27] border border-[#2D5A27]/30'
                  : 'bg-[#2B3827] text-white hover:bg-[#1F291C]'
              }`}
            >
              {confirmed 
                ? (isNl ? '✓ Bevestigd & Opgeleverd' : '✓ Confirmed & Handed Over')
                : (isNl ? 'Alles klopt — bevestigen' : 'Everything correct — confirm')}
            </button>

            <button
              type="button"
              onClick={() => {
                setFeedbackToast(
                  isNl
                    ? 'Nazorgticket aangemaakt. Tim & Bram nemen binnen 24 uur contact met je op.'
                    : 'Aftercare ticket created. Tim & Bram will contact you within 24h.'
                );
                setTimeout(() => setFeedbackToast(''), 3500);
              }}
              className="px-3.5 py-1.5 bg-white text-dark/70 border border-[#D6CFC2] text-xs font-bold rounded-xl hover:bg-gray-50 transition-all cursor-pointer shadow-2xs"
            >
              {isNl ? 'Er klopt iets niet' : 'Something is not right'}
            </button>
          </div>
        </div>

        {/* Right Card: Warranty & Aftercare (Soft Greige bg-[#EAE6DD]) */}
        <div className="lg:col-span-1 bg-[#EAE6DD] border border-[#C8C2B4] p-3.5 sm:p-4 rounded-2xl shadow-xs space-y-2 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-[#70624F] block">
              {isNl ? 'GARANTIE & NAZORG' : 'WARRANTY & AFTERCARE'}
            </span>
            <p className="text-[11px] sm:text-xs text-dark/70 leading-relaxed font-medium">
              {isNl
                ? 'Garantie op constructie en dak, plus nazorg na oplevering. En over drie maanden nemen we contact op voor de 3-maandencheck.'
                : 'Warranty on structure and roof, plus aftercare post handover. And in three months we will contact you for the 3-month checkup.'}
            </p>
          </div>

          <div className="space-y-1.5 pt-1">
            <button
              type="button"
              onClick={handleDownloadWarranty}
              className="w-full py-1.5 px-2 bg-white text-dark/80 border border-[#C8C2B4] text-[11px] font-bold rounded-xl hover:bg-gray-50 transition-all cursor-pointer shadow-2xs text-center block font-medium truncate"
            >
              {isNl ? 'Download garantiecertificaat' : 'Download warranty certificate'}
            </button>

            <button
              type="button"
              onClick={() => {
                setFeedbackToast(
                  isNl ? 'Nazorgaanvraag verzonden naar Tim & Bram!' : 'Aftercare request sent to Tim & Bram!'
                );
                setTimeout(() => setFeedbackToast(''), 3500);
              }}
              className="w-full py-1.5 px-2 bg-white text-dark/80 border border-[#C8C2B4] text-[11px] font-bold rounded-xl hover:bg-gray-50 transition-all cursor-pointer shadow-2xs text-center block font-medium truncate"
            >
              {isNl ? 'Nazorg aanvragen' : 'Request aftercare'}
            </button>
          </div>
        </div>

      </div>

      {/* 5. SECTION 2: SEASONAL MAINTENANCE CALENDAR */}
      <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-3.5 sm:p-4 rounded-2xl shadow-xs space-y-2.5">
        <div className="space-y-0.5">
          <h3 className="font-heading font-bold text-primary text-xs sm:text-sm">
            {isNl ? 'Onderhoudskalender' : 'Maintenance Calendar'}
          </h3>
          <p className="text-[11px] text-dark/70 font-medium">
            {isNl
              ? 'Weinig moeite, groot plezier. Elk seizoen sturen we een korte herinnering — als je dat wilt.'
              : 'Little effort, great results. We send a short reminder every season — if you wish.'}
          </p>
        </div>

        {/* 4 Seasonal Sub-Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 pt-0.5">
          
          {/* Spring */}
          <div className="bg-[#F5F2EC] border border-[#D6CFC2] p-3 rounded-xl space-y-1 shadow-2xs">
            <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-[#70624F] block">
              {isNl ? 'LENTE' : 'SPRING'}
            </span>
            <h5 className="font-heading font-bold text-primary text-xs">
              {isNl ? 'Hout behandelen' : 'Treat timber'}
            </h5>
            <p className="text-[10px] sm:text-[11px] text-dark/70 leading-relaxed font-medium">
              {isNl
                ? 'Douglas hout reinigen en één laag beits of olie aanbrengen. Half dagje werk.'
                : 'Clean the Douglas wood and apply one coat of stain or oil. Half a day\'s work.'}
            </p>
          </div>

          {/* Summer */}
          <div className="bg-[#F5F2EC] border border-[#D6CFC2] p-3 rounded-xl space-y-1 shadow-2xs">
            <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-[#70624F] block">
              {isNl ? 'ZOMER' : 'SUMMER'}
            </span>
            <h5 className="font-heading font-bold text-primary text-xs">
              {isNl ? 'Niets — genieten' : 'Nothing — enjoy'}
            </h5>
            <p className="text-[10px] sm:text-[11px] text-dark/70 leading-relaxed font-medium">
              {isNl
                ? 'Hooguit de rails van de schuifdeuren schoonvegen.'
                : 'At most sweep the sliding door tracks clean.'}
            </p>
          </div>

          {/* Autumn */}
          <div className="bg-[#F5F2EC] border border-[#D6CFC2] p-3 rounded-xl space-y-1 shadow-2xs">
            <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-[#70624F] block">
              {isNl ? 'HERFST' : 'AUTUMN'}
            </span>
            <h5 className="font-heading font-bold text-primary text-xs">
              {isNl ? 'Dak & afvoer vrij' : 'Roof & drain clear'}
            </h5>
            <p className="text-[10px] sm:text-[11px] text-dark/70 leading-relaxed font-medium">
              {isNl
                ? 'Bladeren van het EPDM-dak en afvoerputje halen. Kwartiertje.'
                : 'Clear leaves from the EPDM roof and drain outlet. 15 minutes.'}
            </p>
          </div>

          {/* Winter */}
          <div className="bg-[#F5F2EC] border border-[#D6CFC2] p-3 rounded-xl space-y-1 shadow-2xs">
            <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-[#70624F] block">
              {isNl ? 'WINTER' : 'WINTER'}
            </span>
            <h5 className="font-heading font-bold text-primary text-xs">
              {isNl ? 'Niets nodig' : 'Nothing needed'}
            </h5>
            <p className="text-[10px] sm:text-[11px] text-dark/70 leading-relaxed font-medium">
              {isNl
                ? 'Douglas en EPDM kunnen prima tegen vorst.'
                : 'Douglas and EPDM withstand frost easily.'}
            </p>
          </div>

        </div>

        {/* Reminder Checkbox */}
        <div className="pt-1">
          <label className="flex items-center gap-1.5 cursor-pointer text-[10px] sm:text-[11px] font-medium text-dark/80 hover:text-primary">
            <input
              type="checkbox"
              checked={seasonalReminder}
              onChange={(e) => setSeasonalReminder(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-primary border-[#D6CFC2] focus:ring-primary accent-[#2B3827]"
            />
            <span>{isNl ? 'Stuur mij per seizoen een onderhoudsherinnering' : 'Send me a seasonal maintenance reminder'}</span>
          </label>
        </div>
      </div>

      {/* 6. SECTION 3: BOTTOM 3 CARDS GRID (Responsive sm:grid-cols-2 lg:grid-cols-3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        
        {/* Card 1: The 3-month check */}
        <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-3.5 sm:p-4 rounded-2xl shadow-xs space-y-2 flex flex-col justify-between">
          <div className="space-y-1">
            <h4 className="font-heading font-bold text-primary text-xs sm:text-sm">
              {isNl ? 'De 3-maandencheck' : 'The 3-month check'}
            </h4>
            <p className="text-[11px] text-dark/70 leading-relaxed font-medium">
              {isNl
                ? 'In januari nemen we contact op: zit alles nog strak, werkt elektra, ben je tevreden? Kleine puntjes direct verholpen.'
                : 'In January we get in touch: is everything still tight, electrics working, are you satisfied? Small points fixed immediately.'}
            </p>
          </div>

          <div className="pt-0.5">
            <span className="bg-[#EAE6DD] text-[#70624F] font-mono text-[9px] font-bold px-2 py-0.5 rounded-md inline-block">
              {isNl ? 'Ingepland · Januari 2027' : 'Scheduled · January 2027'}
            </span>
          </div>
        </div>

        {/* Card 2: Would you like to help us? */}
        <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-3.5 sm:p-4 rounded-2xl shadow-xs space-y-2 flex flex-col justify-between">
          <div className="space-y-1">
            <h4 className="font-heading font-bold text-primary text-xs sm:text-sm">
              {isNl ? 'Wil je ons helpen?' : 'Would you like to help us?'}
            </h4>
            <p className="text-[11px] text-dark/70 leading-relaxed font-medium">
              {isNl
                ? 'Mond-tot-mondreclame is alles voor ons. Een korte review helpt de volgende klant enorm — en ons nog meer.'
                : 'Word-of-mouth is everything to us. A short review helps the next customer enormously — and us even more.'}
            </p>
          </div>

          <div className="space-y-1.5 pt-1 w-full">
            <a
              href="https://google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-1.5 px-2 bg-[#2B3827] text-white text-[11px] font-bold rounded-xl text-center block hover:bg-[#1F291C] transition-all shadow-xs truncate"
            >
              {isNl ? 'Laat een review achter op Google' : 'Leave review on Google'}
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-1.5 px-2 bg-white text-dark/80 border border-[#D6CFC2] text-[11px] font-bold rounded-xl hover:bg-gray-50 transition-all shadow-2xs text-center block truncate font-medium"
            >
              {isNl ? 'Deel een foto op Instagram' : 'Share photo on Instagram'}
            </a>
          </div>
        </div>

        {/* Card 3: Complete your outdoor living? */}
        <div className="bg-[#FAF8F5] border border-[#D8D2C5] p-3.5 sm:p-4 rounded-2xl shadow-xs space-y-2 flex flex-col justify-between items-start">
          <div className="space-y-1">
            <h4 className="font-heading font-bold text-primary text-xs sm:text-sm">
              {isNl ? 'Buitenleven compleet maken?' : 'Complete your outdoor living?'}
            </h4>
            <p className="text-[11px] text-dark/70 leading-relaxed font-medium">
              {isNl
                ? 'Veel klanten combineren hun buitenverblijf met een buitenkeuken onder de overkapping. Terugkerende klant? We rekenen een scherpe prijs.'
                : 'Many customers combine their garden room with an outdoor kitchen under the canopy. Returning customer? We offer sharp pricing.'}
            </p>
          </div>

          <div className="pt-1 w-full">
            <button
              type="button"
              onClick={() => {
                setFeedbackToast(
                  isNl
                    ? 'Prijsindicatie aangevraagd! We nemen contact op met een passend voorstel.'
                    : 'Price indication requested! We will reach out with a custom proposal.'
                );
                setTimeout(() => setFeedbackToast(''), 4000);
              }}
              className="w-full py-1.5 px-2 bg-white text-dark/80 border border-[#D6CFC2] text-[11px] font-bold rounded-xl hover:bg-gray-50 transition-all cursor-pointer shadow-2xs text-center block truncate font-medium"
            >
              {isNl ? 'Vrijblijvende prijsindicatie' : 'Request price indication'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
