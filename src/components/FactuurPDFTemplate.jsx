import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import api from '../api/apiClient';

export default function FactuurPDFTemplate({ invoice, companyDetails }) {
  // Extract Company Details dynamically from backend Settings API or prop
  const [loadedCompanyInfo, setLoadedCompanyInfo] = useState(companyDetails || null);

  useEffect(() => {
    if (companyDetails) {
      setLoadedCompanyInfo(companyDetails);
      return;
    }
    const loadComp = () => {
      api.get('/settings/company').then(res => {
        if (res.success && res.data) {
          setLoadedCompanyInfo(res.data);
        }
      }).catch(() => {});
    };
    loadComp();
    window.addEventListener('app_data_changed', loadComp);
    return () => window.removeEventListener('app_data_changed', loadComp);
  }, [companyDetails]);

  const companyInfo = loadedCompanyInfo || companyDetails || {};

  const compName = companyInfo.companyName || companyInfo.name || 'Vanuit Ambacht';
  const compAddress = companyInfo.address || 'Koningshof 33, 3451 LM Vleuten';
  const compEmail = companyInfo.email || 'info@vanuitambacht.nl';
  const compPhone = companyInfo.phone || '06 82 00 80 25';
  const compKvk = companyInfo.kvkNumber ? `KVK ${companyInfo.kvkNumber}` : companyInfo.kvk || 'KVK 93097429';
  const compVat = companyInfo.btwNumber ? `BTW ${companyInfo.btwNumber}` : companyInfo.vatNumber || 'BTW NL866264863B01';
  const compIban = companyInfo.iban || 'NL27 ABNA 0132 2698 56';
  const compWebsite = companyInfo.website || 'vanuitambacht.nl';

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
      className="bg-white text-[#2B3028] p-8 sm:p-10 max-w-[794px] mx-auto rounded-none space-y-4 select-text print:p-8 print:m-0 print:max-w-none print:w-full print:bg-white relative overflow-hidden"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* Ensure Google Fonts are explicitly available */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
        .factuur-heading {
          font-family: 'Cormorant Garamond', 'Playfair Display', Georgia, serif !important;
          color: #3E4E36 !important;
          font-weight: 600 !important;
          letter-spacing: -0.01em;
        }
      `}</style>

      {/* Background Watermark - VA Monogram SVG matching client Factuur */}
      <svg
        viewBox="0 0 320 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'absolute',
          bottom: '8%',
          right: '3%',
          width: '50%',
          height: 'auto',
          opacity: 0.04,
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0
        }}
      >
        <path d="M10 30 L90 370 L170 30" stroke="#3E4E36" strokeWidth="22" strokeLinecap="square" strokeLinejoin="miter" fill="none" />
        <path d="M100 30 L180 370 L260 30" stroke="#3E4E36" strokeWidth="22" strokeLinecap="square" strokeLinejoin="miter" fill="none" />
        <line x1="120" y1="220" x2="240" y2="220" stroke="#3E4E36" strokeWidth="18" strokeLinecap="square" />
      </svg>
      
      {/* 1. HEADER LOGO & FACTUUR PILL BADGE */}
      <div className="flex justify-between items-center pt-1 relative z-10">
        <div className="flex items-center gap-3">
          <img src="/pdf_logo_dark.png" alt="Vanuit Ambacht" className="h-9 w-auto object-contain" />
        </div>
        <span className="px-4 py-1 rounded-full border border-[#8A7966] text-[#8A7966] text-[10px] font-semibold uppercase tracking-[0.25em] bg-transparent">
          FACTUUR
        </span>
      </div>

      {/* 2. SUBHEADER / GREETING */}
      <div className="space-y-1 pt-1 relative z-10">
        <p className="text-[10px] font-semibold text-[#8A7966] uppercase tracking-[0.2em]">FACTUUR {invId}</p>
        <h1 
          className="factuur-heading text-3xl sm:text-[34px] leading-tight" 
        >
          Bedankt voor je vertrouwen, {firstName}.
        </h1>
      </div>

      {/* 3. 4-COLUMN SUMMARY METADATA CARD */}
      <div className="grid grid-cols-4 gap-3 p-4 bg-[#F5F2EB] rounded-xl border border-[#E5E0D5] relative z-10">
        <div>
          <p className="text-[9px] font-semibold uppercase text-[#8A7966] tracking-[0.18em]">FACTUURNUMMER</p>
          <p className="font-medium text-[#2B3028] text-xs sm:text-[13px] mt-1">{invId}</p>
        </div>
        <div>
          <p className="text-[9px] font-semibold uppercase text-[#8A7966] tracking-[0.18em]">FACTUURDATUM</p>
          <p className="font-medium text-[#2B3028] text-xs sm:text-[13px] mt-1">{invoiceDate}</p>
        </div>
        <div>
          <p className="text-[9px] font-semibold uppercase text-[#8A7966] tracking-[0.18em]">VERVALDATUM</p>
          <p className="font-medium text-[#2B3028] text-xs sm:text-[13px] mt-1">{dueDate}</p>
        </div>
        <div>
          <p className="text-[9px] font-semibold uppercase text-[#8A7966] tracking-[0.18em]">REFERENTIE</p>
          <p className="font-medium text-[#2B3028] text-xs sm:text-[13px] mt-1">{quoteRef}</p>
        </div>
      </div>

      {/* 4. ADDRESSES 2-COLUMN SECTION */}
      <div className="grid grid-cols-2 gap-8 text-[11px] pt-1 relative z-10">
        <div className="space-y-1">
          <p className="text-[9.5px] font-semibold uppercase text-[#8A7966] tracking-[0.18em]">FACTUUR AAN</p>
          <p className="font-semibold text-[#2B3028] text-xs sm:text-[13px] pt-0.5">{customerName}</p>
          <p className="text-[#4A5043]">{addressLine1}</p>
          <p className="text-[#4A5043]">{addressLine2}</p>
          <p className="text-[#8A7966] text-[10.5px] font-medium pt-0.5">{phone}</p>
        </div>

        <div className="space-y-1">
          <p className="text-[9.5px] font-semibold uppercase text-[#8A7966] tracking-[0.18em]">FACTUUR VAN</p>
          <p className="font-semibold text-[#2B3028] text-xs sm:text-[13px] pt-0.5">{compName}</p>
          <p className="text-[#4A5043]">{compAddress}</p>
          <p className="text-[#8A7966] text-[10.5px] font-medium pt-0.5">{compKvk} &nbsp;·&nbsp; {compVat}</p>
          <p className="text-[#8A7966] text-[10.5px] font-medium">{compEmail} &nbsp;·&nbsp; {compPhone}</p>
        </div>
      </div>

      {/* 5. LINE ITEMS TABLE */}
      <div className="pt-1 relative z-10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-[1.5px] border-[#2C3928] text-[9.5px] uppercase text-[#8A7966] font-semibold tracking-[0.2em]">
              <th className="pt-2 pb-2.5 pr-4 font-semibold">OMSCHRIJVING</th>
              <th className="pt-2 pb-2.5 px-3 text-center w-20 font-semibold">AANTAL</th>
              <th className="pt-2 pb-2.5 pl-4 text-right w-36 font-semibold">BEDRAG</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E3D8] border-b border-[#E8E3D8]">
            {items.map((item, idx) => {
              const isIncluded = (typeof item.price === 'string' && (item.price.toLowerCase().includes('inbegrepen') || item.price.toLowerCase().includes('inclusief') || item.price.toLowerCase().includes('incl'))) || item.price === 0;
              let formattedPrice = item.price;
              if (!isIncluded) {
                if (typeof item.price === 'number') {
                  formattedPrice = formatDutchCurrency(item.price);
                } else if (typeof item.price === 'string' && !item.price.trim().startsWith('€')) {
                  const num = parseFloat(item.price.replace(/[^\d.-]/g, ''));
                  formattedPrice = isNaN(num) ? item.price : formatDutchCurrency(num);
                }
              }

              return (
                <tr key={idx} className="align-top">
                  <td className="py-3.5 pr-4 space-y-1">
                    <p className="font-bold text-[#22271F] text-[12.5px] leading-snug">{item.description}</p>
                    {item.subtext && <p className="text-[10px] sm:text-[10.5px] text-[#6B7266] font-normal leading-[1.45]">{item.subtext}</p>}
                  </td>
                  <td className="py-3.5 px-3 text-center font-medium text-[12.5px] text-[#22271F]">{item.quantity || 1}</td>
                  <td className={`py-3.5 pl-4 text-right whitespace-nowrap text-[12.5px] ${isIncluded ? 'text-[#2E3E28] font-semibold' : 'text-[#22271F] font-bold'}`}>
                    {formattedPrice}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 6. BOTTOM SPLIT SECTION — 7/5 PROPORTIONAL SPLIT FOR COMPACT GREEN BOX */}
      <div className="grid grid-cols-12 gap-5 pt-2 items-start relative z-10">
        
        {/* LEFT BOX: BETAALINFORMATIE (col-span-7) */}
        <div className="col-span-7 bg-[#F6F3EC] p-5 rounded-2xl border border-[#E6E0D4] space-y-2">
          <p className="text-[9px] font-semibold uppercase text-[#8A7966] tracking-[0.2em]">BETAALINFORMATIE</p>
          <p className="text-[11px] text-[#656C5F] font-normal">Maak het totaalbedrag binnen 14 dagen over op:</p>
          <p className="font-bold text-[#475C40] text-[15px] tracking-wide pt-0.5">{compIban}</p>
          <p className="text-[11px] text-[#656C5F] font-normal">ten name van <strong className="text-[#475C40] font-semibold">{compName}</strong></p>
          
          <div className="inline-block bg-[#EAE5DB] text-[#555C4E] px-3.5 py-1.5 rounded-lg text-[10.5px] font-normal border border-[#DCD5C6] mt-1.5">
            o.v.v. factuurnummer <span className="font-semibold text-[#475C40]">{invId}</span>
          </div>
        </div>

        {/* RIGHT BOX: TOTALS CARD & REMINDER BAR (col-span-5 — COMPACT GREEN BOX) */}
        <div className="col-span-5 space-y-2.5">
          <div className="bg-[#354530] text-[#FDFBF7] p-5 rounded-2xl shadow-sm space-y-2">
            <div className="flex justify-between items-center text-[11px] text-[#C4CBBF] font-normal">
              <span>Totaal excl. btw</span>
              <span className="font-medium text-[#F2F5EF]">{formatDutchCurrency(totalExcl)}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-[#C4CBBF] font-normal">
              <span>Btw 21%</span>
              <span className="font-medium text-[#F2F5EF]">{formatDutchCurrency(vat21)}</span>
            </div>

            <div className="border-t border-[#4E5E48] my-2"></div>

            <div className="flex justify-between items-baseline gap-2 pt-0.5">
              <span className="text-xs text-[#E0E7DC] font-medium">Te betalen</span>
              <span 
                className="text-2xl text-white whitespace-nowrap"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600 }}
              >
                {formatDutchCurrency(totalIncl)}
              </span>
            </div>
            <p className="text-[9.5px] text-[#9EAA98] font-normal text-right">Betaaltermijn: 14 dagen</p>
          </div>

          <div className="bg-[#EFECE5] py-2.5 px-3 rounded-xl border border-[#E2DDD4] text-center text-[11px] text-[#5A6253] font-normal flex items-center justify-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#8A7966] shrink-0" />
            <span>Graag betalen vóór <strong className="font-semibold text-[#22271F]">{dueDate}</strong></span>
          </div>
        </div>
      </div>

      {/* 7. PERSONAL NOTE BOX */}
      <div className="bg-[#F8F6F0] py-3.5 px-5 rounded-xl border-l-[3.5px] border-l-[#354530] space-y-1 relative z-10">
        <p className="italic text-[13.5px] sm:text-[14px] font-normal text-[#384232] leading-snug" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
          {invoice?.productType?.toLowerCase()?.includes('garden') || invoice?.productType?.toLowerCase()?.includes('buitenverblijf') || invoice?.productType?.toLowerCase()?.includes('veranda')
            ? 'Veel plezier van je nieuwe buitenverblijf. Vragen of iets nodig? Je weet ons te vinden.'
            : 'Veel plezier van je buitenkeuken. Vragen of iets nodig? Je weet ons te vinden.'}
        </p>
        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#8A7966] pt-0.5">
          TIM & BRAM · {compName.toUpperCase()}
        </p>
      </div>

      {/* 8. FOOTER */}
      <div className="pt-3 border-t border-[#EAE5DA] flex justify-between items-center text-[9.5px] text-[#7A8073] font-normal relative z-10">
        <span className="font-semibold text-[#22271F] tracking-[0.18em]">{compName.toUpperCase()}</span>
        <span className="text-[#8A7966]">{compAddress} · {compEmail} · {compWebsite || compPhone}</span>
      </div>
    </div>
  );
}
