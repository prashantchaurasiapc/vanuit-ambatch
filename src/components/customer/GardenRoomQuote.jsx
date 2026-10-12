import React from 'react';
import Card from '../Card';
import Badge from '../Badge';
import { 
  CheckCircle2, FileText, Download, ArrowRight, Check, CreditCard, 
  MessageSquare, ShieldCheck, HelpCircle, Calendar, Sparkles, AlertCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { downloadDirectPdfFile } from '../../utils/pdfGenerator';
import { useLanguage } from '../../context/LanguageContext';

/**
 * GardenRoomQuote Component (1-to-1 implementation of Client Mockup Image 2)
 */
export default function GardenRoomQuote({ quote = null, project = null }) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isNl = language === 'NL';

  const quoteId = quote?.id || 'OF-2026418';
  const customerName = quote?.customer || project?.customer || 'Sander de Vries';
  const city = project?.city || (isNl ? 'Den Haag' : 'The Hague');
  const createdDate = quote?.date || (isNl ? '1 augustus 2026' : '1 August 2026');
  const approvalDate = quote?.approvalDate || (isNl ? '3 augustus 2026 om 19:32' : '3 August 2026 at 19:32');
  const rawName = quote?.project || project?.name || (isNl ? 'Overkapping met poolhouse · Douglas · 8,00 × 4,00 m' : 'Canopy with poolhouse · Douglas · 8.00 × 4.00 m');
  const productName = isNl
    ? 'Maatwerk Buitenverblijf & Poolhouse Douglas'
    : 'Custom Garden Room Canopy & Poolhouse Douglas';

  const projectCode = project?.projectNumber || project?.id || '2026-021';

  const lineItems = [
    {
      title: isNl ? 'Buitenverblijf Douglas · 8,00 × 4,00 m' : 'Garden Room Douglas · 8.00 × 4.00 m',
      description: isNl
        ? 'Overkapping met afgesloten poolhouse (3,00 m), plat dak met EPDM en aluminium daktrim, glazen schuifwanden aan de zuidzijde, betonpoer fundering.'
        : 'Canopy with enclosed poolhouse (3.00 m), flat roof with EPDM and aluminum roof trim, sliding glass doors on south side, concrete pier foundation.',
      price: '€ 36.500,00'
    },
    {
      title: isNl ? 'Elektrapakket *' : 'Electrical Package *',
      description: isNl
        ? 'Vier inbouwspots in het overkapte deel, dubbele wandcontactdoos en schakelaar in het poolhouse.*'
        : 'Four spotlights in the covered section, double wall socket and switch in the poolhouse.*',
      price: '€ 1.450,00',
      isProvisional: true
    },
    {
      title: isNl ? `Transport & Montage ${city}` : `Transport & Installation ${city}`,
      description: isNl
        ? 'Materiaalaanvoer, vakkundige bouw en oplevering door onze specialistische vakman.'
        : 'Material supply, build and handover by our specialist craftsman.',
      isIncluded: true
    }
  ];

  const totalNumeric = 37950.00;
  const subtotal = 31363.64;
  const vat = 6586.36;
  const step40Amount = 15180.00;
  const step20Amount = 7590.00;

  const quotePayload = quote || {
    id: quoteId,
    customer: customerName,
    project: productName,
    amount: `€ ${totalNumeric.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`,
    items: lineItems.map(i => ({ description: i.title, unitPrice: i.price ? 36500 : 0, quantity: 1 }))
  };

  return (
    <div className="space-y-5 font-body text-[#4A4A43] max-w-5xl w-full">

      {/* 1. TOP HEADER BANNER */}
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
            className="bg-primary text-cream px-3 py-1 rounded-xl text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1"
          >
            <MessageSquare className="w-3.5 h-3.5 text-accent" />
            <span>{isNl ? 'WhatsApp ons' : 'WhatsApp us'}</span>
          </a>
        </div>
      </div>

      {/* 2. PAGE TITLE & SUBTITLE */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-primary">
          {isNl ? 'Mijn offerte' : 'My quote'}
        </h1>
        <p className="text-xs text-dark/70 font-medium">
          {isNl
            ? 'Dit is wat we hebben afgesproken. Bekijk alles op je gemak. De PDF staat ook in je documenten.'
            : 'This is what we agreed upon. Review everything at your convenience. The PDF is also in your documents.'}
        </p>
      </div>

      {/* 3. QUOTE HEADER CARD */}
      <div className="bg-white border border-[#D6CFC2] p-5 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#D6CFC2]/60 pb-4">
          <div>
            <div className="text-xs font-mono font-bold text-accent">{quoteId}</div>
            <h2 className="text-lg sm:text-xl font-heading font-bold text-primary mt-0.5">
              {productName}
            </h2>
            <p className="text-xs text-dark/60 mt-0.5">
              {isNl ? 'Aangemaakt op' : 'Created on'} {createdDate} {isNl ? 'voor' : 'for'} {customerName}, {city}
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-800 border border-green-300 rounded-full text-xs font-bold shadow-xs">
              <Check className="w-3.5 h-3.5 text-green-700" />
              <span>{isNl ? 'Offerte goedgekeurd' : 'Quote approved'}</span>
            </span>
            <span className="text-[10px] font-mono text-dark/50">
              {approvalDate} {isNl ? 'door' : 'by'} {customerName}
            </span>
          </div>
        </div>

        {/* 4. WHAT YOU GET (LINE ITEMS & PROVISIONAL SUM) */}
        <div className="space-y-4 pt-1">
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-accent block">
            {isNl ? 'WAT JE KRIJGT' : 'WHAT YOU GET'}
          </span>

          <div className="space-y-4 divide-y divide-[#D6CFC2]/40">
            {lineItems.map((item, idx) => (
              <div key={idx} className={`flex flex-col sm:flex-row justify-between items-start gap-3 ${idx > 0 ? 'pt-3' : ''}`}>
                <div className="space-y-1 max-w-xl">
                  <h4 className="font-heading font-bold text-primary text-sm flex items-center gap-1.5">
                    <span>{item.title}</span>
                  </h4>
                  <p className="text-xs text-dark/80 leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>

                <div className="sm:text-right flex-shrink-0 pt-0.5">
                  {item.isIncluded ? (
                    <span className="inline-block px-2.5 py-0.5 bg-[#EDE8DF] text-primary border border-[#D6CFC2] text-[11px] font-bold rounded-md">
                      {isNl ? 'Inbegrepen' : 'Included'}
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-primary font-heading">
                      {item.price}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Provisional Sum Explanation Note */}
          <div className="pt-1 text-xs text-amber-900/80 leading-relaxed flex items-start gap-1.5 italic font-medium">
            <AlertCircle className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
            <span>
              <strong className="font-bold font-mono text-amber-950">
                {isNl ? '* Stelpost:' : '* Provisional sum:'}
              </strong>{' '}
              {isNl
                ? 'Dit bedrag is een zorgvuldige inschatting; het definitieve bedrag is afhankelijk van de situatie op locatie en wordt tijdens de schouw afgestemd.'
                : 'This amount is a careful estimate; the definitive amount depends on the situation on location and will be confirmed during the site survey.'}
            </span>
          </div>
        </div>

        {/* 5. INCLUDED IN YOUR INVESTMENT & QUOTE TOTALS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-[#D6CFC2]">
          {/* Left Column: Included Benefits List */}
          <div className="space-y-2.5">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-accent block">
              {isNl ? 'INBEGREPEN IN JOUW INVESTERING' : 'INCLUDED IN YOUR INVESTMENT'}
            </span>
            <ul className="space-y-2 text-xs text-dark/80">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{isNl ? 'Werktekening en 3D renders van jouw ontwerp, in te zien in dit portaal' : 'Work drawing and 3D renders of your design, viewable in this portal'}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{isNl ? 'Schouw op locatie voorafgaand aan de start van de bouw' : 'Site survey on location before construction starts'}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{isNl ? 'Realisatie door een gecertificeerde vakman uit ons netwerk' : 'Construction by a certified specialist craftsman from our network'}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{isNl ? `Transport, montage en oplevering in ${city}` : `Transport, installation and handover in ${city}`}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{isNl ? 'Garantie op de houtconstructie en nazorg na oplevering' : 'Guarantee on timber structure and aftercare after delivery'}</span>
              </li>
            </ul>
          </div>

          {/* Right Column: Quote Totals Card */}
          <div className="bg-[#2A3425] text-cream p-4 sm:p-5 rounded-xl space-y-3 font-body shadow-xs">
            <div className="space-y-1.5 text-xs text-cream/80 border-b border-cream/20 pb-3">
              <div className="flex justify-between items-center">
                <span>{isNl ? 'Subtotaal excl. btw' : 'Subtotal excl. VAT'}</span>
                <span className="font-mono font-semibold">€ {subtotal.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-cream/60">
                <span>{isNl ? 'Btw 21%' : 'VAT 21%'}</span>
                <span className="font-mono">€ {vat.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-1 text-base sm:text-lg font-bold font-heading text-cream">
              <span>{isNl ? 'Totaal' : 'Total'}</span>
              <span className="font-mono text-xl text-cream font-bold">€ {totalNumeric.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* 6. PAYMENT IN THREE STEPS (40/40/20) */}
        <div className="space-y-3 pt-4 border-t border-[#D6CFC2]">
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-accent block">
            {isNl ? 'BETALEN IN DRIE TERMIJNEN' : 'PAY IN THREE STEPS'}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Step 1: 40% upon approval */}
            <div className="bg-[#FFFDF9] border border-green-300 rounded-xl p-3.5 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-bold text-primary text-xs">
                  {isNl ? '40% bij akkoord' : '40% upon approval'}
                </h4>
                <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {isNl ? 'Betaald' : 'Paid'}
                </span>
              </div>
              <div className="text-base font-bold text-primary font-heading">
                € {step40Amount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-dark/70 leading-relaxed">
                {isNl
                  ? 'Betaald op 4 augustus. Hiermee is de opdracht definitief en hout gereserveerd.'
                  : 'Paid on 4 August. Hereby the order is dispatched and wood reserved.'}
              </p>
            </div>

            {/* Step 2: 40% at start of build */}
            <div className="bg-[#FFFDF9] border border-[#D6CFC2] rounded-xl p-3.5 space-y-1.5 shadow-2xs">
              <h4 className="font-heading font-bold text-primary text-xs">
                {isNl ? '40% bij start van de bouw' : '40% at start of build'}
              </h4>
              <div className="text-base font-bold text-primary font-heading">
                € {step40Amount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-dark/70 leading-relaxed">
                {isNl
                  ? 'Factuur volgt bij aanvang van de geplande bouwweek.'
                  : 'Invoice follows at the start of the build week.'}
              </p>
            </div>

            {/* Step 3: 20% upon handover */}
            <div className="bg-[#FFFDF9] border border-[#D6CFC2] rounded-xl p-3.5 space-y-1.5 shadow-2xs">
              <h4 className="font-heading font-bold text-primary text-xs">
                {isNl ? '20% bij oplevering' : '20% upon handover'}
              </h4>
              <div className="text-base font-bold text-primary font-heading">
                € {step20Amount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-dark/70 leading-relaxed">
                {isNl
                  ? 'Pas wanneer alles volledig staat en je 100% tevreden bent.'
                  : 'Only when everything is built and you are satisfied.'}
              </p>
            </div>
          </div>
        </div>

        {/* 7. QUOTE ACTIONS */}
        <div className="pt-4 border-t border-[#D6CFC2] space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/customer/project')}
              className="px-4 py-2 bg-primary text-cream text-xs font-bold rounded-xl hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
            >
              {isNl ? 'Volg jouw project' : 'Follow your project'}
            </button>

            <button
              type="button"
              onClick={() => downloadDirectPdfFile(quotePayload)}
              className="px-3.5 py-2 bg-white text-dark/80 border border-[#D6CFC2] text-xs font-bold rounded-xl hover:bg-gray-50 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span>{isNl ? 'Opdrachtbevestiging (PDF)' : 'Order confirmation (PDF)'}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/customer/project?tab=payments')}
              className="px-3.5 py-2 bg-white text-dark/80 border border-[#D6CFC2] text-xs font-bold rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
            >
              {isNl ? 'Naar betalingen' : 'Go to payments'}
            </button>
          </div>

          <p className="text-[11px] text-dark/60 italic pt-1">
            {isNl
              ? 'Deze offerte is definitief. Wil je iets aanpassen? WhatsApp ons — voor de bouwweek is er vaak nog veel mogelijk.'
              : 'This quote is finalized. Want to make a change? WhatsApp us — before the build week a lot is often still possible.'}
          </p>
        </div>
      </div>
    </div>
  );
}

