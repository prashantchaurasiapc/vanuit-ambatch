import React from 'react';
import { Calendar } from 'lucide-react';

export default function FactuurPDFTemplate({ invoice }) {
  // Dynamic Props Extraction with Fallbacks
  const invId = invoice?.id || invoice?.invoiceNumber || 'F-2026-108';
  const customerName = invoice?.customer || invoice?.customerName || 'Bjorn Valk';
  const firstName = invoice?.firstName || (customerName ? customerName.trim().split(' ')[0] : 'Bjorn');
  
  const addressLine1 = invoice?.address || 'Dangeheuvel 3';
  const addressLine2 = invoice?.zipCity || '5101 WE Dongen';
  const phone = invoice?.phone || '+31 6 53962542';
  
  // Date Formatter: converts ISO '2026-09-28' or raw dates to clean Dutch format
  const formatDutchDate = (rawDate) => {
    if (!rawDate) return '1 augustus 2026';
    if (typeof rawDate === 'string' && rawDate.includes('augustus') || rawDate.includes('september') || rawDate.includes('oktober')) {
      return rawDate;
    }
    try {
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return String(rawDate);
      return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return String(rawDate);
    }
  };

  const invoiceDate = formatDutchDate(invoice?.date || invoice?.invoiceDate || '2026-08-01');
  const dueDate = formatDutchDate(invoice?.dueDate || invoice?.vervaldatum || '2026-09-28');
  const quoteRef = invoice?.quoteRef || invoice?.reference || 'Offerte OF-2026325';

  // Amount Calculations
  const numericAmount = typeof invoice?.amount === 'number'
    ? invoice.amount
    : parseFloat(String(invoice?.amount || '3495').replace(/[^\d.-]/g, '').replace(',', '.')) || 3495;

  const totalIncl = numericAmount;
  const totalExcl = Math.round((totalIncl / 1.21) * 100) / 100;
  const vat21 = Math.round((totalIncl - totalExcl) * 100) / 100;

  const formatDutchCurrency = (num) => {
    const val = Number(num) || 0;
    return '€ ' + val.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Line items
  const items = (invoice?.items && invoice.items.length > 0)
    ? invoice.items
    : [
        {
          description: 'Buitenkeuken Thermo Fraké - 240 × 80 cm',
          subtext: 'Houten bovenblad met keramische stenen en uitsparing voor Big Green Egg Large · drie kastjes met twee inlegplanken · zes zwenkwielen · afgewerkt met twee lagen olie (naturel). Conform offerte-OF-2026325.',
          quantity: 1,
          price: formatDutchCurrency(totalIncl)
        },
        {
          description: `Bezorging ${invoice?.customer ? invoice.customer.split(' ')[0] : 'Dongen'}`,
          subtext: 'Geleverd op locatie.',
          quantity: 1,
          price: 'Inbegrepen'
        }
      ];

  return (
    <div 
      id="printable-factuur" 
      className="bg-white text-[#2B3028] font-body p-6 max-w-4xl mx-auto rounded-2xl shadow-xl border border-[#D6CFC2] space-y-4 select-text print:shadow-none print:border-none print:p-6 print:m-0 print:max-w-none print:w-full print:bg-white"
    >
      
      {/* 1. HEADER LOGO & FACTUUR PILL BADGE */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="/pdf_logo_dark.png" alt="Vanuit Ambacht" className="h-9 w-auto object-contain" />
        </div>
        <span className="px-4 py-1.5 rounded-full border border-[#33422C] text-[#33422C] text-xs font-bold uppercase tracking-widest bg-[#F5F2EB]">
          FACTUUR
        </span>
      </div>

      {/* 2. SUBHEADER / GREETING */}
      <div className="space-y-0.5 pt-1">
        <p className="text-[10px] font-bold text-[#4A5043] uppercase tracking-widest">FACTUUR {invId}</p>
        <h1 className="text-2xl font-heading font-bold text-[#33422C]">
          Bedankt voor je vertrouwen, {firstName}.
        </h1>
      </div>

      {/* 3. 4-COLUMN SUMMARY METADATA CARD */}
      <div className="grid grid-cols-4 gap-3 p-3.5 bg-[#F5F2EB] rounded-xl border border-[#E5E0D5]">
        <div>
          <p className="text-[9px] font-bold uppercase text-[#4A5043] tracking-wider">FACTUURNUMMER</p>
          <p className="font-bold text-[#2B3028] text-xs mt-0.5">{invId}</p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase text-[#4A5043] tracking-wider">FACTUURDATUM</p>
          <p className="font-bold text-[#2B3028] text-xs mt-0.5">{invoiceDate}</p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase text-[#4A5043] tracking-wider">VERVALDATUM</p>
          <p className="font-bold text-[#2B3028] text-xs mt-0.5">{dueDate}</p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase text-[#4A5043] tracking-wider">REFERENTIE</p>
          <p className="font-bold text-[#2B3028] text-xs mt-0.5">{quoteRef}</p>
        </div>
      </div>

      {/* 4. ADDRESSES 2-COLUMN SECTION */}
      <div className="grid grid-cols-2 gap-6 text-[11px]">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase text-[#4A5043] tracking-widest">FACTUUR AAN</p>
          <p className="font-bold text-[#2B3028] text-xs">{customerName}</p>
          <p className="text-[#33382F] font-medium">{addressLine1}</p>
          <p className="text-[#33382F] font-medium">{addressLine2}</p>
          <p className="text-[#4A5043] font-mono text-[10px] font-bold">{phone}</p>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase text-[#4A5043] tracking-widest">FACTUUR VAN</p>
          <p className="font-bold text-[#2B3028] text-xs">Vanuit Ambacht</p>
          <p className="text-[#33382F] font-medium">Koningshof 33, 3451 LM Vleuten</p>
          <p className="text-[#4A5043] font-mono text-[10px] font-bold">KVK 93097429 · BTW NL866264863B01</p>
          <p className="text-[#4A5043] font-mono text-[10px] font-bold">info@vanuitambacht.nl · 06 82 00 80 25</p>
        </div>
      </div>

      {/* 5. LINE ITEMS TABLE */}
      <div className="pt-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-t-2 border-[#33422C] text-[10px] uppercase text-[#4A5043] font-bold tracking-widest">
              <th className="py-2.5 pr-4">OMSCHRIJVING</th>
              <th className="py-2.5 px-3 text-center w-20">AANTAL</th>
              <th className="py-2.5 pl-4 text-right w-36">BEDRAG</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E0D5]">
            {items.map((item, idx) => (
              <tr key={idx} className="align-top">
                <td className="py-3 pr-4 space-y-1">
                  <p className="font-bold text-[#2B3028] text-xs leading-snug">{item.description}</p>
                  {item.subtext && <p className="text-[10.5px] text-[#4A5043] leading-normal">{item.subtext}</p>}
                </td>
                <td className="py-3 px-3 text-center font-mono font-bold text-xs text-[#2B3028]">{item.quantity || 1}</td>
                <td className="py-3 pl-4 text-right font-mono font-bold text-[#2B3028] text-xs whitespace-nowrap">
                  {typeof item.price === 'number' ? formatDutchCurrency(item.price) : item.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 6. BOTTOM SPLIT SECTION — STRICT SIDE-BY-SIDE (grid-cols-2) */}
      <div className="grid grid-cols-2 gap-5 pt-2 items-start">
        
        {/* LEFT BOX: BETAALINFORMATIE */}
        <div className="bg-[#F5F2EB] p-4 rounded-xl border border-[#E5E0D5] space-y-2">
          <p className="text-[10px] font-bold uppercase text-[#4A5043] tracking-widest">BETAALINFORMATIE</p>
          <p className="text-[11px] text-[#33382F]">Maak het totaalbedrag binnen 14 dagen over op:</p>
          <p className="font-mono font-bold text-[#2B3028] text-base tracking-wide">NL27 ABNA 0132 2698 56</p>
          <p className="text-[11px] text-[#33382F]">ten name van <strong className="text-[#2B3028] font-bold">Vanuit Ambacht</strong></p>
          
          <div className="inline-block bg-[#E8E3D8] text-[#33422C] px-3.5 py-1 rounded-md text-[11px] font-mono font-bold border border-[#D6CFC2] mt-1">
            o.v.v. factuurnummer {invId}
          </div>
        </div>

        {/* RIGHT BOX: TOTALS CARD & REMINDER BAR */}
        <div className="space-y-2.5">
          <div className="bg-[#33422C] text-[#FDFBF7] p-4 rounded-xl shadow-md space-y-2.5 font-body">
            <div className="flex justify-between items-center text-xs text-cream/90 font-mono">
              <span>Totaal excl. btw</span>
              <span className="font-bold">{formatDutchCurrency(totalExcl)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-cream/90 font-mono">
              <span>Btw 21%</span>
              <span className="font-bold">{formatDutchCurrency(vat21)}</span>
            </div>

            <div className="h-px bg-white/25"></div>

            <div className="flex justify-between items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider">Te betalen</span>
              <span className="font-heading font-bold text-xl sm:text-2xl text-cream whitespace-nowrap">
                {formatDutchCurrency(totalIncl)}
              </span>
            </div>
            <p className="text-[10px] text-cream/70 font-mono text-right">Betalingstermijn 14 dagen</p>
          </div>

          <div className="bg-[#F5F2EB] p-2.5 rounded-lg border border-[#E5E0D5] text-center text-[11px] font-bold text-[#33422C] flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-800 flex-shrink-0" />
            <span>Graag betalen vóór {dueDate}</span>
          </div>
        </div>
      </div>

      {/* 7. PERSONAL NOTE BOX */}
      <div className="bg-[#F5F2EB] p-3.5 rounded-lg border-l-4 border-l-[#33422C] space-y-1">
        <p className="font-heading italic text-xs font-semibold text-[#33422C]">
          Veel plezier van je buitenkeuken. Vragen of iets nodig? Je weet ons te vinden.
        </p>
        <p className="text-[9.5px] font-bold uppercase tracking-wider text-[#4A5043] font-mono">
          TIM & BRAM · VANUIT AMBACHT
        </p>
      </div>

      {/* 8. FOOTER */}
      <div className="pt-3 border-t border-[#E5E0D5] flex justify-between items-center text-[10px] text-[#4A5043] font-mono font-semibold">
        <span className="font-bold text-[#2B3028]">VANUIT AMBACHT</span>
        <span>Koningshof 33, 3451 LM Vleuten · info@vanuitambacht.nl · vanuitambacht.nl</span>
        <span>1/1</span>
      </div>
    </div>
  );
}
