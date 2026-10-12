import React from 'react';
import Card from '../Card';
import Badge from '../Badge';
import { 
  CheckCircle2, FileText, Download, ArrowRight, Check, CreditCard, 
  MessageSquare, ShieldCheck, HelpCircle, Calendar, Sparkles 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { downloadDirectPdfFile } from '../../utils/pdfGenerator';
import { useLanguage } from '../../context/LanguageContext';

/**
 * OutdoorKitchenQuote Component (1-to-1 implementation of Client Mockup Image 1)
 */
export default function OutdoorKitchenQuote({ quote = null, project = null }) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isNl = language === 'NL';

  const quoteId = quote?.id || 'OF-2026325';
  const customerName = quote?.customer || project?.customer || 'Sander de Vries';
  const city = project?.city || (isNl ? 'Den Haag' : 'The Hague');
  const createdDate = quote?.date || (isNl ? '21 juli 2026' : '21 July 2026');
  const approvalDate = quote?.approvalDate || (isNl ? '11 augustus 2026 om 20:14' : '11 August 2026 at 20:14');
  const productName = isNl 
    ? 'Luxe Teak Maatwerk Buitenkeuken Den Haag' 
    : 'Luxe Teak Custom Outdoor Kitchen Den Haag';

  const projectCode = project?.projectNumber || project?.id || 'cbb7ba25-974f-4516-b9f4-1c66f097b62e';

  const lineItems = [
    {
      title: isNl ? 'Buitenkeuken Thermo Fraké · 240 × 80 cm' : 'Outdoor Kitchen Thermo Fraké · 240 × 80 cm',
      description: isNl
        ? 'Houten blad met keramische steentegels, uitsparing voor Big Green Egg Large, twee kastmodules met laden, afgewerkt met twee lagen beschermende houtolie.'
        : 'Wooden top with ceramic stone tiles, cutout for Big Green Egg Large, two cabinet modules with drawers, finished with two coats of protective wood oil.',
      price: '€ 3.495,00'
    },
    {
      title: isNl ? 'Kraan & Spoelbak Module' : 'Tap & Sink Module',
      description: isNl
        ? 'Ingebouwde kraan met rvs spoelbak, aansluiting op jouw buitenwaterleiding.'
        : 'Built-in tap with stainless steel sink, connection to your outdoor water supply.',
      price: '€ 425,00'
    },
    {
      title: isNl ? `Levering & Montage ${city}` : `Delivery & Installation ${city}`,
      description: isNl
        ? 'Levering en montage op een gewenst tijdvak, uitgevoerd door twee vakspecialisten.'
        : 'Delivery and installation at a convenient time slot, carried out by two specialist craftsmen.',
      isIncluded: true
    }
  ];

  const totalNumeric = 3920.00;
  const subtotal = 3223.67;
  const vat = 680.33;
  const halfAmount = 1960.00;

  const quotePayload = quote || {
    id: quoteId,
    customer: customerName,
    project: productName,
    amount: `€ ${totalNumeric.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`,
    items: lineItems.map(i => ({ description: i.title, unitPrice: i.price ? 3495 : 0, quantity: 1 }))
  };

  return (
    <div className="space-y-5 font-body text-[#4A4A43] max-w-5xl w-full">

      {/* 1. TOP HEADER BANNER */}
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

        {/* 4. WHAT YOU GET (LINE ITEMS) */}
        <div className="space-y-4 pt-1">
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-accent block">
            {isNl ? 'WAT JE KRIJGT' : 'WHAT YOU GET'}
          </span>

          <div className="space-y-4 divide-y divide-[#D6CFC2]/40">
            {lineItems.map((item, idx) => (
              <div key={idx} className={`flex flex-col sm:flex-row justify-between items-start gap-3 ${idx > 0 ? 'pt-3' : ''}`}>
                <div className="space-y-1 max-w-xl">
                  <h4 className="font-heading font-bold text-primary text-sm">
                    {item.title}
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
                <span>{isNl ? 'Werktekening van jouw keuken, in te zien in dit portaal' : 'Work drawing of your kitchen, viewable in this portal'}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{isNl ? 'Gemaakt door een gecertificeerde vakman uit ons netwerk' : 'Crafted by a certified specialist craftsman from our network'}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{isNl ? `Gratis levering en montage in ${city}` : `Free delivery and installation in ${city}`}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{isNl ? 'Demonstratie en eerste onderhoudscontrole bij oplevering' : 'Demonstration and initial maintenance check on delivery'}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{isNl ? 'Garantie op het product en nazorg na oplevering' : 'Guarantee on the product and aftercare after delivery'}</span>
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

        {/* 6. PAYMENT IN TWO STEPS (50/50) */}
        <div className="space-y-3 pt-4 border-t border-[#D6CFC2]">
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-accent block">
            {isNl ? 'BETALEN IN TWEE TERMIJNEN' : 'PAY IN TWO STEPS'}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Step 1: 50% upon approval */}
            <div className="bg-[#FFFDF9] border border-green-300 rounded-xl p-4 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-bold text-primary text-xs sm:text-sm">
                  {isNl ? '50% bij akkoord' : '50% upon approval'}
                </h4>
                <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {isNl ? 'Betaald' : 'Paid'}
                </span>
              </div>
              <div className="text-base font-bold text-primary font-heading">
                € {halfAmount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-dark/70 leading-relaxed">
                {isNl 
                  ? 'Betaald op 12 augustus. De opdracht is doorgezet naar de vakman.' 
                  : 'Paid on 12 August. The order is dispatched to the specialist craftsman.'}
              </p>
            </div>

            {/* Step 2: 50% upon delivery */}
            <div className="bg-[#FFFDF9] border border-[#D6CFC2] rounded-xl p-4 space-y-1.5 shadow-2xs">
              <h4 className="font-heading font-bold text-primary text-xs sm:text-sm">
                {isNl ? '50% bij levering' : '50% upon delivery'}
              </h4>
              <div className="text-base font-bold text-primary font-heading">
                € {halfAmount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-dark/70 leading-relaxed">
                {isNl 
                  ? 'Je betaalt nooit vooruit voor werk dat nog niet is uitgevoerd.' 
                  : 'You never pay in advance for work that has not started yet.'}
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
              ? 'Deze offerte is definitief. Wil je een kleine wijziging doorgeven? WhatsApp ons — kleine aanpassingen zijn vaak mogelijk.'
              : 'This quote is finalized. Want to make a small change? WhatsApp us — small adjustments are often possible.'}
          </p>
        </div>
      </div>

      {/* 8. PREVIOUS QUOTE VERSIONS */}
      <div className="bg-white border border-[#D6CFC2] p-4 sm:p-5 rounded-2xl shadow-xs space-y-3">
        <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-dark/50 block">
          {isNl ? 'EERDERE VERSIES' : 'PREVIOUS VERSIONS'}
        </span>

        <div className="flex items-center justify-between bg-[#EDE8DF] border border-[#D6CFC2] p-3 rounded-xl text-xs">
          <div className="space-y-0.5">
            <h5 className="font-bold text-primary font-heading text-xs sm:text-sm">
              {isNl ? 'Offerte OF-2026311 · versie 1' : 'Quote OF-2026311 · version 1'}
            </h5>
            <p className="text-[11px] text-dark/60">
              {isNl 
                ? '14 juli 2026 — vervangen door versie 2 (afmetingen aangepast naar 240 cm)' 
                : '14 July 2026 — replaced by version 2 (dimensions adjusted to 240 cm)'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => downloadDirectPdfFile(quotePayload)}
            className="px-3 py-1.5 bg-white text-dark/80 border border-[#D6CFC2] text-[11px] font-bold rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
          >
            {isNl ? 'Bekijken' : 'View'}
          </button>
        </div>
      </div>
    </div>
  );
}

