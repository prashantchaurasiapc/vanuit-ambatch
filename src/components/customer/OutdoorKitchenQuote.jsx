import React from 'react';
import Card from '../Card';
import Badge from '../Badge';
import { 
  CheckCircle2, FileText, Download, ArrowRight, Check, CreditCard, 
  MessageSquare, ShieldCheck, HelpCircle, Calendar, Sparkles 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { downloadDirectPdfFile } from '../../utils/pdfGenerator';

/**
 * OutdoorKitchenQuote Component (1-to-1 implementation of Client Mockup Image 1)
 * 
 * Features:
 * - Top Header Bar (Project code, Updates 3 pill, WhatsApp button)
 * - Quote Header (Quote ID OF-2026325, Title, Issue Date, Customer Name, Approval Badge)
 * - "What You Get" (Line items: Main kitchen, Tap & Sink, Delivery Included)
 * - "Included In Your Investment" (5 bullet points)
 * - "Quote Totals" (Subtotal excl. VAT, VAT 21%, Total in dark green box)
 * - "Payment Schedule (50/50)" (50% upon approval, 50% upon delivery)
 * - "Quote Actions" (Follow project, Order confirmation PDF, Go to payments)
 * - "Previous Quote Versions" (Version history card)
 */
export default function OutdoorKitchenQuote({ quote = null, project = null }) {
  const navigate = useNavigate();

  const quoteId = quote?.id || 'OF-2026325';
  const customerName = quote?.customer || project?.customer || 'Sander de Vries';
  const city = project?.city || 'Oisterwijk';
  const createdDate = quote?.date || '21 July 2026';
  const approvalDate = quote?.approvalDate || '11 August 2026 at 20:14';
  const rawName = quote?.project || project?.name || 'Outdoor Kitchen Thermo Fraké · 240 × 80 cm';
  const productName = rawName
    .replace(/Buitenkeuken Thermo Fraké/g, 'Custom Outdoor Kitchen Thermo Fraké')
    .replace(/Buitenkeuken/g, 'Custom Outdoor Kitchen')
    .replace(/Buitenverblijf/g, 'Garden Room');

  const projectCode = project?.id || '2026-014';

  const lineItems = [
    {
      title: 'Outdoor Kitchen Thermo Fraké · 240 × 80 cm',
      description: 'Wooden top with ceramic stone tiles, cutout for Big Green Egg Large, two cabinet modules with drawers, finished with two coats of protective wood oil.',
      price: '€ 3,495.00'
    },
    {
      title: 'Tap & Sink Module',
      description: 'Built-in tap with stainless steel sink, connection to your outdoor water supply.',
      price: '€ 425.00'
    },
    {
      title: `Delivery & Installation ${city}`,
      description: 'Delivery and installation at a convenient time slot, carried out by two specialist craftsmen.',
      isIncluded: true
    }
  ];

  const totalNumeric = 3920.00;
  const subtotal = 3223.67;
  const vat = 680.33;
  const halfAmount = 1960.00;

  return (
    <div className="space-y-5 font-body text-[#4A4A43] max-w-5xl w-full">

      {/* 1. TOP HEADER BANNER (Matching Client Mockup 1-to-1) */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-dark/60">
        <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-md font-bold">
          Custom Outdoor Kitchen — project {projectCode}
        </span>
        <div className="flex items-center gap-2">
          <span className="bg-cream border border-[#D6CFC2] px-2 py-0.5 rounded-md font-bold text-[11px]">
            Updates 3
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

      {/* 2. PAGE TITLE & SUBTITLE */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-primary">
          My quote
        </h1>
        <p className="text-xs text-dark/70 font-medium">
          This is what we agreed upon. Review everything at your convenience. The PDF is also in your documents.
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
              Created on {createdDate} for {customerName}, {city}
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-800 border border-green-300 rounded-full text-xs font-bold shadow-xs">
              <Check className="w-3.5 h-3.5 text-green-700" />
              <span>Quote approved</span>
            </span>
            <span className="text-[10px] font-mono text-dark/50">
              {approvalDate} by {customerName}
            </span>
          </div>
        </div>

        {/* 4. WHAT YOU GET (LINE ITEMS) */}
        <div className="space-y-4 pt-1">
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-accent block">
            WHAT YOU GET
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
                      Included
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
              INCLUDED IN YOUR INVESTMENT
            </span>
            <ul className="space-y-2 text-xs text-dark/80">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Work drawing of your kitchen, viewable in this portal</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Crafted by a certified specialist craftsman from our network</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Free delivery and installation in {city}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Demonstration and initial maintenance check on delivery</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Guarantee on the product and aftercare after delivery</span>
              </li>
            </ul>
          </div>

          {/* Right Column: Quote Totals Card */}
          <div className="bg-[#2A3425] text-cream p-4 sm:p-5 rounded-xl space-y-3 font-body shadow-xs">
            <div className="space-y-1.5 text-xs text-cream/80 border-b border-cream/20 pb-3">
              <div className="flex justify-between items-center">
                <span>Subtotal excl. VAT</span>
                <span className="font-mono font-semibold">€ {subtotal.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-cream/60">
                <span>VAT 21%</span>
                <span className="font-mono">€ {vat.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-1 text-base sm:text-lg font-bold font-heading text-cream">
              <span>Total</span>
              <span className="font-mono text-xl text-cream font-bold">€ {totalNumeric.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* 6. PAYMENT IN TWO STEPS (50/50) */}
        <div className="space-y-3 pt-4 border-t border-[#D6CFC2]">
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-accent block">
            PAY IN TWO STEPS
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Step 1: 50% upon approval */}
            <div className="bg-[#FFFDF9] border border-green-300 rounded-xl p-4 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-bold text-primary text-xs sm:text-sm">
                  50% upon approval
                </h4>
                <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  Paid
                </span>
              </div>
              <div className="text-base font-bold text-primary font-heading">
                € {halfAmount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-dark/70 leading-relaxed">
                Paid on 12 August. The order is dispatched to the specialist craftsman.
              </p>
            </div>

            {/* Step 2: 50% upon delivery */}
            <div className="bg-[#FFFDF9] border border-[#D6CFC2] rounded-xl p-4 space-y-1.5 shadow-2xs">
              <h4 className="font-heading font-bold text-primary text-xs sm:text-sm">
                50% upon delivery
              </h4>
              <div className="text-base font-bold text-primary font-heading">
                € {halfAmount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-dark/70 leading-relaxed">
                You never pay in advance for work that has not started yet.
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
              Follow your project
            </button>

            <button
              type="button"
              onClick={() => downloadDirectPdfFile('quote')}
              className="px-3.5 py-2 bg-white text-dark/80 border border-[#D6CFC2] text-xs font-bold rounded-xl hover:bg-gray-50 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span>Order confirmation (PDF)</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/customer/project?tab=payments')}
              className="px-3.5 py-2 bg-white text-dark/80 border border-[#D6CFC2] text-xs font-bold rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
            >
              Go to payments
            </button>
          </div>

          <p className="text-[11px] text-dark/60 italic pt-1">
            This quote is finalized. Want to make a small change? WhatsApp us — small adjustments are often possible.
          </p>
        </div>
      </div>

      {/* 8. PREVIOUS QUOTE VERSIONS */}
      <div className="bg-white border border-[#D6CFC2] p-4 sm:p-5 rounded-2xl shadow-xs space-y-3">
        <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-dark/50 block">
          PREVIOUS VERSIONS
        </span>

        <div className="flex items-center justify-between bg-[#EDE8DF] border border-[#D6CFC2] p-3 rounded-xl text-xs">
          <div className="space-y-0.5">
            <h5 className="font-bold text-primary font-heading text-xs sm:text-sm">
              Quote OF-2026311 · version 1
            </h5>
            <p className="text-[11px] text-dark/60">
              14 July 2026 — replaced by version 2 (dimensions adjusted to 240 cm)
            </p>
          </div>

          <button
            type="button"
            onClick={() => downloadDirectPdfFile('quote')}
            className="px-3 py-1.5 bg-white text-dark/80 border border-[#D6CFC2] text-[11px] font-bold rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
}
