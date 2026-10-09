import React, { useState, useEffect, useContext } from 'react';
import { Wrench, MessageSquare, ShieldCheck, DollarSign, Calendar, Pencil, Clock } from 'lucide-react';
import projectImg from '../assets/outdoor_project_card.png';
import { calculateTotals, calculateInstalments } from '../utils/quoteSchema';
import { LanguageContext } from '../context/LanguageContext';
import api from '../api/apiClient';

export default function Offerte6PagePDF({ quote, activePage = null, highlightField = null, companyDetails = null, language: propLanguage = null }) {
  // Safely read language context if rendered inside LanguageProvider
  const langCtx = useContext(LanguageContext);

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

  // Language resolution: prop -> quote.language -> langCtx -> localStorage -> 'EN' default
  let currentLang = propLanguage || quote?.language || langCtx?.language;
  if (!currentLang) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        currentLang = window.localStorage.getItem('app_language');
      }
    } catch (e) {}
  }
  const language = (currentLang === 'NL' || currentLang === 'nl') ? 'NL' : 'EN';

  // Extract dynamic customer & header properties
  const custObj = typeof quote?.customer === 'object' ? quote.customer : null;
  const customerName = custObj?.name || quote?.customer || quote?.customerName || (language === 'EN' ? 'Bjorn Valk' : 'Bjorn Valk');
  const firstName = custObj?.firstName || (customerName ? customerName.trim().split(' ')[0] : 'Bjorn');
  const city = custObj?.city || quote?.deliveryLocation || quote?.city || 'Dongen';
  const quoteId = quote?.id || 'OF-2026331';
  const quoteDate = quote?.date || new Date().toISOString().split('T')[0];
  const validUntil = quote?.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Category Family Detection (Outdoor Kitchen vs Garden Room / Veranda / Poolhouse)
  const productTypeLower = String(quote?.productType || quote?.category || quote?.projectCategory || quote?.project || '').toLowerCase();
  const isGardenRoom =
    productTypeLower.includes('garden room') ||
    productTypeLower.includes('buitenverblijf') ||
    productTypeLower.includes('veranda') ||
    productTypeLower.includes('poolhouse');

  // Cover properties
  const cover = quote?.cover || {};
  const defaultTitle1 = isGardenRoom
    ? (language === 'EN' ? 'Your bespoke garden room,' : 'Uw exclusief buitenverblijf,')
    : (language === 'EN' ? 'Your outdoor kitchen,' : 'Uw buitenkeuken,');
  const defaultTitle2 = language === 'EN' ? 'custom crafted.' : 'op maat gemaakt.';

  const rawTitle1 = cover.titleLine1 || defaultTitle1;
  const rawTitle2 = cover.titleLine2 || defaultTitle2;

  const titleLine1 = language === 'EN' && (rawTitle1 === 'Uw buitenkeuken,' || rawTitle1 === 'Uw exclusief buitenverblijf,')
    ? (isGardenRoom ? 'Your bespoke garden room,' : 'Your outdoor kitchen,')
    : (language === 'NL' && (rawTitle1 === 'Your outdoor kitchen,' || rawTitle1 === 'Your bespoke garden room,')
        ? (isGardenRoom ? 'Uw exclusief buitenverblijf,' : 'Uw buitenkeuken,')
        : rawTitle1);

  const titleLine2 = language === 'EN' && rawTitle2 === 'op maat gemaakt.'
    ? 'custom crafted.'
    : (language === 'NL' && rawTitle2 === 'custom crafted.'
        ? 'op maat gemaakt.'
        : rawTitle2);

  const config = quote?.configuration || {};
  const woodType = config.woodType || quote?.woodType || 'Thermo Fraké';
  const dimensions = config.dimensions || quote?.dimensions || '240 × 80';
  const cleanDimensions = String(dimensions).replace(/\s*cm$/i, '').trim();


  const categoryTitle = productTypeLower.includes('poolhouse')
    ? (language === 'EN' ? 'exclusive poolhouse' : 'exclusieve poolhouse')
    : productTypeLower.includes('veranda')
      ? (language === 'EN' ? 'luxury veranda' : 'luxe veranda')
      : productTypeLower.includes('garden room') || productTypeLower.includes('buitenverblijf')
        ? (language === 'EN' ? 'garden room' : 'buitenverblijf')
        : (language === 'EN' ? 'outdoor kitchen' : 'buitenkeuken');

  const optionsTitle = config.optionsTitle || quote?.optionsTitle || 'Big Green Egg Large';
  const deliveryTime = config.deliveryTime || quote?.deliveryTime || (language === 'EN' ? '5 to 10 weeks' : '3 tot 5 weken');
  const woodLifespan = config.woodLifespan || (language === 'EN' ? '20 to 25 years' : '20 tot 25 jaar');

  const optionsObj = config.options || {};
  const bbqEnabled = optionsObj.bbqCutout?.enabled !== false;
  const bbqType = optionsObj.bbqCutout?.type || optionsTitle;
  const fridgeEnabled = optionsObj.fridge?.enabled || false;
  const sinkEnabled = optionsObj.sink?.enabled || false;

  let tile3Title = language === 'EN' ? 'CUTOUT' : 'UITSPARING';
  let tile3Value = bbqType;
  let tile3Subtext = language === 'EN' ? 'Large, right of center' : 'Large, rechts van het midden';
  let coverOptionStr = bbqType;

  if (!bbqEnabled) {
    const enabledList = [];
    const coverList = [];
    if (fridgeEnabled) {
      enabledList.push(language === 'EN' ? 'Built-in Fridge' : 'Ingebouwde koelkast');
      coverList.push(language === 'EN' ? 'Fridge' : 'Koelkast');
    }
    if (sinkEnabled) {
      enabledList.push(language === 'EN' ? 'Sink with Tap' : 'Spoelbak met kraan');
      coverList.push(language === 'EN' ? 'Sink' : 'Spoelbak');
    }

    tile3Title = language === 'EN' ? 'OPTIONS' : 'OPTIES';
    if (enabledList.length > 0) {
      tile3Value = enabledList.join(', ');
      tile3Subtext = language === 'EN' ? 'Integrated features' : 'Geïntegreerde keukenelementen';
      coverOptionStr = coverList.join(' & ');
    } else {
      tile3Value = language === 'EN' ? 'No extra options' : 'Geen extra opties';
      tile3Subtext = language === 'EN' ? 'Standard worktop' : 'Standaard werkblad';
      coverOptionStr = language === 'EN' ? 'Standard worktop' : 'Standaard werkblad';
    }
  }

  const subtitleText = cover.subtitleOverrideEnabled && cover.customSubtitle
    ? cover.customSubtitle
    : `${woodType} · ${cleanDimensions} cm · ${coverOptionStr}`;

  const coverPhotos = [
    (cover.photos?.[0] && String(cover.photos[0]).trim().length > 3) ? cover.photos[0] : '/cover_img1.png',
    (cover.photos?.[1] && String(cover.photos[1]).trim().length > 3) ? cover.photos[1] : '/cover_img2.png',
    (cover.photos?.[2] && String(cover.photos[2]).trim().length > 3) ? cover.photos[2] : '/cover_img3.png'
  ];

  // Dynamic Line Items & Calculations
  const rawItems = (quote?.investment?.lineItems || quote?.items || []);
  const items = rawItems.length > 0 ? rawItems : [
    {
      description: `Outdoor Kitchen ${woodType} · ${cleanDimensions} cm`,
      subtext: `Wooden worktop with ceramic stones and cutout for ${optionsTitle}`,
      quantity: 1,
      priceInclVat: 0,
      vatRate: 21,
      isIncluded: false
    },
    {
      description: `Delivery ${city}`,
      subtext: `Free delivery in ${city}, scheduled at your convenience`,
      quantity: 1,
      priceInclVat: 0,
      vatRate: 21,
      isIncluded: true
    }
  ];

  // Calculate delivery price and GRATIS logic
  const deliveryItem = items.find(i => (i.title || i.description || '').toLowerCase().includes('bezorging') || (i.title || i.description || '').toLowerCase().includes('delivery'));
  const deliveryPrice = deliveryItem ? Number(deliveryItem.priceInclVat || deliveryItem.unitPrice || 0) : 0;
  const isFreeDelivery = deliveryPrice === 0 && (deliveryItem ? deliveryItem.isIncluded !== false : true);

  const totals = calculateTotals(items);
  const totalIncl = totals.totalInclVat ?? 0;
  const totalExcl = totals.subtotalExclVat ?? 0;
  const vatAmount = totals.vatAmount ?? 0;

  // Instalments Calculation
  const instalmentsConfig = quote?.investment?.instalments || { count: 2, percentages: [50, 50], labels: ['Bij akkoord', 'Bij levering'] };
  const instalmentCards = calculateInstalments(totalIncl, instalmentsConfig.count, instalmentsConfig.percentages, instalmentsConfig.labels);

  const finishTreatment = quote?.investment?.finishTreatment || (language === 'EN' ? 'Two-layer protective oil finish (natural)' : 'Olieafwerking in twee lagen (naturel)');

  // Specifications Dynamic Sections
  const specifications = (config.specifications && config.specifications.length > 0)
    ? config.specifications
    : [
      {
        id: 'sec-1',
        title: language === 'EN' ? 'WORKTOP' : 'BOVENBLAD',
        lines: [
          { text: language === 'EN' ? 'Ceramic stones in worktop – heat-resistant and low maintenance' : 'Keramische stenen in het werkblad – hittebestendig en onderhoudsarm' },
          { text: language === 'EN' ? `Custom cutout engineered for ${optionsTitle}` : `Uitsparing op maat voor ${optionsTitle}` }
        ]
      },
      {
        id: 'sec-2',
        title: language === 'EN' ? 'LAYOUT & STORAGE' : 'INDELING & OPBERGRUIMTE',
        lines: [
          { text: language === 'EN' ? 'Two spacious storage compartments with doors and soft-close hinges' : 'Twee ruime opbergvakken met deurtjes en soft-close scharnieren' },
          { text: language === 'EN' ? 'Open shelf for wood storage' : 'Open schap voor houtopslag' }
        ]
      },
      {
        id: 'sec-3',
        title: language === 'EN' ? 'FINISH & MOBILITY' : 'AFWERKING & MOBILITEIT',
        lines: [
          { text: finishTreatment },
          { text: language === 'EN' ? 'Hidden heavy-duty swivel castors for easy mobility' : 'Verborgen heavy-duty zwenkwielen voor eenvoudige verplaatsing' }
        ]
      },
      {
        id: 'sec-4',
        title: language === 'EN' ? 'DELIVERY' : 'BEZORGING',
        lines: [
          {
            text: isFreeDelivery
              ? (language === 'EN' ? `Free delivery in ${city}, scheduled at your convenience` : `Gratis bezorgd in ${city}, op een moment dat jou uitkomt`)
              : (language === 'EN' ? `Delivery in ${city}` : `Bezorging in ${city}`)
          }
        ]
      }
    ];

  // Diagram Config
  const diagram = config.diagram || {
    show: true,
    totalWidth: 240,
    segments: [
      { type: 'CABINET', label: language === 'EN' ? 'cabinet' : 'kastje', width: 60 },
      { type: 'CABINET', label: language === 'EN' ? 'cabinet' : 'kastje', width: 60 },
      { type: 'CUTOUT', label: 'Big Green Egg', width: 70 },
      { type: 'CABINET', label: language === 'EN' ? 'cabinet' : 'kastje', width: 50 }
    ]
  };

  // Infobox Config
  const infobox = config.infobox || {
    show: true,
    title: language === 'EN' ? `About ${woodType}` : `Over ${woodType}`,
    text: language === 'EN'
      ? `Thermally treated Fraké: dimensionally stable, durable, with a warm, deep color. Lasts 20 to 25 years and ages gracefully into a beautiful silver-grey.`
      : `Thermisch behandeld Fraké: vormstabiel, duurzaam en met een warme, diepe kleur. Gaat 20 tot 25 jaar mee en veroudert prachtig grijs.`
  };

  // Format Helpers
  const formatEuro = (num) => `€\u00A0${Number(num || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatDecEuro = (num) => `€\u00A0${Number(num || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatDutchDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const months = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="offerte-pdf-container space-y-8 print:space-y-0 text-dark font-body select-text">

      {/* ========================================================= */}
      {/* PAGE 1 OF 6: COVER PAGE */}
      {(!activePage || activePage === 'all' || Number(activePage) === 1) && (
        <div className="offerte-pdf-page bg-[#33422C] text-[#FDFBF7] p-6 sm:p-8 space-y-4 relative rounded-xl shadow-2xl print:rounded-none print:shadow-none h-[1050px] flex flex-col justify-between overflow-hidden">

        {/* Background Watermark - Authentic VA Monogram matching client PDF */}
        <img
          src="/va_watermark.png"
          alt=""
          className="absolute right-[-2%] top-[22%] w-[58%] max-w-[460px] opacity-[0.065] pointer-events-none select-none"
        />

        <div className="space-y-6 relative z-10">
          {/* Header Bar */}
          <div className="relative flex justify-center items-center pt-2 pb-2">
            <img src="/pdf_logo.png" alt="Vanuit Ambacht Logo" className="h-10 sm:h-12 w-auto object-contain mx-auto" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <span className="text-xs font-bold border border-[#6B7B61] text-[#E5DFD5] bg-[#45543D]/40 px-4 py-1.5 rounded-full shadow-xs uppercase tracking-wider" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {language === 'EN' ? 'PROPOSAL' : 'OFFERTE'}
              </span>
            </div>
          </div>

            {/* Subtitle & Main Title */}
            <div className="space-y-3 pt-12 sm:pt-16">
              <div className="space-y-1.5">
                <div className="text-xs tracking-[0.14em] uppercase block font-semibold text-[#D6CFC2]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {language === 'EN' ? 'CUSTOM PROPOSAL' : 'VOORSTEL OP MAAT'} &nbsp;·&nbsp; {quoteId}
                </div>
                <div className="w-16 h-[2px] bg-[#8A7966]"></div>
              </div>

              <h2 className={`text-4xl sm:text-5xl text-[#FDFBF7] leading-[1.15] pt-2 font-normal transition-all duration-300 ${highlightField === 'title' ? 'bg-amber-300/80 text-dark px-2 rounded ring-2 ring-amber-400' : ''}`} style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 400 }}>
                {titleLine1}<br />
                <span className="italic" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 400 }}>{titleLine2}</span>
              </h2>

              <p className={`text-xs sm:text-sm pt-3 transition-all duration-300 ${highlightField === 'wood' || highlightField === 'title' ? 'bg-amber-300/80 text-dark px-2 py-0.5 rounded ring-2 ring-amber-400 font-extrabold' : ''}`} style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {cover.subtitleOverrideEnabled && cover.customSubtitle ? (
                  <span className="text-[#D6CFC2] font-normal">{cover.customSubtitle}</span>
                ) : (
                  <>
                    <span className="text-[#D6CFC2] font-normal">{woodType}</span>
                    <span className="text-[#D6CFC2] mx-2">·</span>
                    <span className="text-[#D6CFC2] font-normal">{cleanDimensions} {language === 'EN' ? 'cm' : 'cm'}</span>
                    <span className="text-[#D6CFC2] mx-2">·</span>
                    <span className="text-[#D6CFC2] font-normal">{coverOptionStr}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Customer & Quote Metadata */}
          <div className="space-y-4 relative z-10" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            <div className="pt-4 border-t border-[#4E5E45]/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className={`transition-all duration-300 p-1 rounded ${highlightField === 'customer' ? 'bg-amber-300/80 text-dark ring-2 ring-amber-400' : ''}`}>
                <span className="text-[10px] text-[#A7AC9B] uppercase block tracking-[0.16em] font-medium">{language === 'EN' ? 'PREPARED FOR' : 'OPGESTELD VOOR'}</span>
                <span className="font-medium text-[#FDFBF7] text-xs sm:text-sm block mt-1 tracking-wide">{customerName}</span>
              </div>
              <div className={`transition-all duration-300 p-1 rounded ${highlightField === 'date' ? 'bg-amber-300/80 text-dark ring-2 ring-amber-400' : ''}`}>
                <span className="text-[10px] text-[#A7AC9B] uppercase block tracking-[0.16em] font-medium">{language === 'EN' ? 'PROPOSAL NUMBER' : 'OFFERTENUMMER'}</span>
                <span className="font-medium text-[#FDFBF7] text-xs sm:text-sm block mt-1 tracking-wide">{quoteId}</span>
              </div>
              <div className={`transition-all duration-300 p-1 rounded ${highlightField === 'date' ? 'bg-amber-300/80 text-dark ring-2 ring-amber-400' : ''}`}>
                <span className="text-[10px] text-[#A7AC9B] uppercase block tracking-[0.16em] font-medium">{language === 'EN' ? 'DATE' : 'DATUM'}</span>
                <span className="font-medium text-[#FDFBF7] text-xs sm:text-sm block mt-1 tracking-wide">{quoteDate}</span>
              </div>
              <div className={`transition-all duration-300 p-1 rounded ${highlightField === 'date' ? 'bg-amber-300/80 text-dark ring-2 ring-amber-400' : ''}`}>
                <span className="text-[10px] text-[#A7AC9B] uppercase block tracking-[0.16em] font-medium">{language === 'EN' ? 'VALID UNTIL' : 'GELDIG T/M'}</span>
                <span className="font-medium text-[#FDFBF7] text-xs sm:text-sm block mt-1 tracking-wide">{validUntil}</span>
              </div>
            </div>

            {/* 3 Photo Strip */}
            <div className="grid grid-cols-3 gap-1.5 h-36 sm:h-44 w-full -mx-6 sm:-mx-10 mt-4 mb-2">
              {coverPhotos.map((pImg, idx) => (
                <div
                  key={idx}
                  className="relative h-full w-full rounded-xl overflow-hidden bg-[#2D3A27] shadow-xs"
                >
                  <img
                    src={pImg || (idx === 0 ? '/cover_img1.png' : idx === 1 ? '/cover_img2.png' : '/cover_img3.png')}
                    alt={`Cover Photo ${idx + 1}`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = idx === 0 ? '/cover_img1.png' : idx === 1 ? '/cover_img2.png' : '/cover_img3.png';
                    }}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                  />
                </div>
              ))}
            </div>

            {quote?.isDraft && (
              <div className="bg-amber-600/90 text-white text-center py-1.5 px-3 text-[10px] font-semibold tracking-widest uppercase rounded-lg shadow-xs" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {language === 'EN' ? '⚠ INTERNAL DRAFT PROPOSAL — NOT YET SENT TO CLIENT' : '⚠ CONCEPT OFFERTE — NOG NIET VERZONDEN NAAR KLANT'}
              </div>
            )}

            {/* Footer Bar */}
            <div className="flex justify-between items-center text-[10px] text-[#A7AC9B] tracking-[0.16em] pt-1 pb-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <span className="font-medium">VANUITAMBACHT.NL</span>
              <span className="font-normal">{language === 'EN' ? 'CRAFTSMANSHIP · QUALITY · PERSONAL' : 'AMBACHT · KWALITEIT · PERSOONLIJK'}</span>
            </div>
          </div>
        </div>
      )}

      {/* PAGE 2 OF 6: PERSOONLIJK WOORD */}
      {(!activePage || activePage === 'all' || Number(activePage) === 2) && (
        <div className="offerte-pdf-page bg-[#FDFBF7] text-dark p-6 sm:p-8 space-y-4 rounded-xl shadow-xl print:rounded-none print:shadow-none h-[1050px] flex flex-col justify-between border border-[#C4BEB3]">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-[#C4BEB3]/70 pb-3 text-xs">
              <div className="flex items-center gap-2">
                <img src="/pdf_logo_dark.png" alt="Vanuit Ambacht" className="h-7 sm:h-8 object-contain" />
              </div>
              <div className="text-[11px] font-medium text-right leading-tight tracking-[0.14em] uppercase" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                <div className="text-[#8A8275]">{language === 'EN' ? 'PROPOSAL' : 'OFFERTE'} <span className="text-[#3E4E36] font-bold">{quoteId}</span></div>
                <div className="text-[#4A4A43] font-bold">{customerName.toUpperCase()} &nbsp;·&nbsp; {city.toUpperCase()}</div>
              </div>
            </div>

            {/* Section 01: Persoonlijk Woord */}
            <div className="space-y-3">
              <span className="text-[10px] text-[#8A8275] font-semibold uppercase tracking-[0.16em] block" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                01 &nbsp;·&nbsp; {language === 'EN' ? 'PERSONAL NOTE' : 'PERSOONLIJK WOORD'}
              </span>
              <div className="grid grid-cols-3 gap-5 items-start">
                <div className="col-span-2 space-y-3 text-[13px] leading-[1.65] text-[#4A4A43]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  <h3 className="text-2xl sm:text-3xl font-normal text-[#33422C]" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 400 }}>
                    {language === 'EN' ? 'Dear' : 'Beste'} <span className="text-[#3E4E36] capitalize font-semibold">{firstName}</span>,
                  </h3>
                  {(quote?.letterAndProcess?.letterParagraphs && quote.letterAndProcess.letterParagraphs.length > 0 && !quote.letterAndProcess.letterParagraphs[0].includes('Hartelijk dank voor je aanvraag')
                    ? quote.letterAndProcess.letterParagraphs
                    : [
                        language === 'EN'
                          ? 'Thank you very much for your inquiry and pleasant consultation. We are delighted to present this personalized proposal for your custom outdoor project.'
                          : 'Hartelijk dank voor je aanvraag en het prettige gesprek. Met veel plezier presenteren wij deze persoonlijke offerte voor jouw maatwerk buitenkeuken.',
                        language === 'EN'
                          ? 'At Vanuit Ambacht, we believe in sustainable materials, artisan craftsmanship, and meticulous attention to detail. We handcraft all our builds in our workshop.'
                          : 'Bij Vanuit Ambacht geloven we in duurzame materialen, ambachtelijke afwerking en oog voor detail. Wij maken al onze buitenkeukens met de hand in onze werkplaats.',
                        language === 'EN'
                          ? 'In this document, you will find a comprehensive overview of your chosen configuration, including specifications, technical drawings, and transparent investment breakdown.'
                          : 'In dit document vind je het volledige overzicht van jouw gekozen configuratie, inclusief specificaties, vooraanzicht tekening en transparante investering.',
                        language === 'EN'
                          ? 'Should you have any questions or wish to make adjustments, we are delighted to assist you!'
                          : 'Heb je vragen of wens je nog aanpassingen? Wij denken graag met je mee!'
                      ]
                  ).map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                  <div className="pt-2">
                    <p className="text-base text-primary font-normal italic" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      {quote?.letterAndProcess?.signoffName || 'Tim & Bram'}
                    </p>
                    <p className="text-[10px] text-[#8A8275] font-semibold tracking-[0.16em] uppercase" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                      {quote?.letterAndProcess?.signoffRole ? quote.letterAndProcess.signoffRole.toUpperCase() : (language === 'EN' ? 'FOUNDERS VANUIT AMBACHT' : 'OPRICHTERS VANUIT AMBACHT')}
                    </p>
                  </div>
                </div>

                {/* Founders Card */}
                <div className="col-span-1 bg-[#F4EFE6] rounded-2xl overflow-hidden border border-[#E2DDD3] shadow-xs text-left">
                  <img src="/extracted_pdf_img_17.jpg" alt="Tim & Bram" className="h-36 w-full object-cover" />
                  <div className="p-3">
                    <p className="text-[11.5px] text-[#4A4A43] leading-relaxed" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                      {language === 'EN'
                        ? 'Tim & Bram, your dedicated point of contact from first sketch to aftercare.'
                        : 'Tim & Bram, jouw vaste aanspreekpunt van eerste schets tot nazorg.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 02: Waarom Vanuit Ambacht */}
            <div className="pt-3 border-t border-[#C4BEB3] space-y-3">
              <span className="text-[10px] text-[#8A8275] font-semibold uppercase tracking-[0.16em] block" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                02 &nbsp;·&nbsp; {language === 'EN' ? 'WHY VANUIT AMBACHT' : 'WAAROM VANUIT AMBACHT'}
              </span>
              <h4 className="text-2xl sm:text-3xl text-[#33422C] tracking-tight font-normal" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 400 }}>
                {language === 'EN' ? 'What you can count on' : 'Waar je op kunt rekenen'}
              </h4>

              {(() => {
                const defaultCards = [
                  {
                    icon: Wrench,
                    title: language === 'EN' ? 'Certified craft specialists' : 'Gecertificeerde vakmensen',
                    desc: language === 'EN'
                      ? 'Construction is handled exclusively by certified craft specialists from our nationwide network. True craftsmanship from foundation to finish.'
                      : 'De bouw ligt altijd bij gecertificeerde vakspecialisten uit ons landelijke netwerk. Vakwerk, van fundering tot afwerking.'
                  },
                  {
                    icon: MessageSquare,
                    title: language === 'EN' ? 'One dedicated contact' : 'Eén vast aanspreekpunt',
                    desc: language === 'EN'
                      ? 'You communicate directly with Tim or Bram via WhatsApp, email or phone. Direct lines, swift answers.'
                      : 'Je schakelt rechtstreeks met Tim of Bram, via WhatsApp, mail of telefoon. Korte lijnen, snelle antwoorden.'
                  },
                  {
                    icon: ShieldCheck,
                    title: language === 'EN' ? 'Warranty & aftercare' : 'Garantie én nazorg',
                    desc: language === 'EN'
                      ? 'Construction warranty and comprehensive aftercare after completion. Even after installation is complete, we remain your point of contact.'
                      : 'Garantie op de constructie en nazorg na oplevering. Ook als het verblijf er staat, blijven wij je aanspreekpunt.'
                  },
                  {
                    icon: DollarSign,
                    title: language === 'EN' ? 'Fair pricing, consciously online' : 'Eerlijke prijs, bewust online',
                    desc: language === 'EN'
                      ? 'No expensive showroom is a conscious choice. You pay for craftsmanship and premium materials, not corporate overhead.'
                      : 'Geen showroom is een bewuste keuze. Zo betaal je voor vakwerk en materiaal, niet voor overhead.'
                  }
                ];

                const icons = [Wrench, MessageSquare, ShieldCheck, DollarSign];
                const rawCards = quote?.letterAndProcess?.uspCards;

                const cardsToRender = defaultCards.map((def, idx) => {
                  const raw = rawCards?.[idx];
                  if (!raw) return def;
                  const isStandardDutch = ['Gecertificeerde vakmensen', 'Eén vast aanspreekpunt', 'Garantie én nazorg', 'Eerlijke prijs, bewust online', 'VAKSPECIALISTEN', 'ÉÉN AANSPREEKPUNT', 'GARANTIE & NAZORG', 'BEWUST ONLINE'].includes(raw.title);
                  if (language === 'EN' && isStandardDutch) return def;
                  return {
                    icon: icons[idx] || Wrench,
                    title: raw.title || def.title,
                    desc: raw.desc || def.desc
                  };
                });

                return (
                  <div className="grid grid-cols-2 gap-3">
                    {cardsToRender.map((card, idx) => {
                      const IconComp = card.icon;
                      return (
                        <div key={idx} className="p-4 bg-[#F6F4EE] rounded-2xl border border-[#E3DDD3] space-y-2">
                          <div className="w-8 h-8 rounded-full bg-[#33422C] text-[#FDFBF7] flex items-center justify-center flex-shrink-0">
                            <IconComp className="w-4 h-4 text-[#FDFBF7]" />
                          </div>
                          <div className="space-y-0.5">
                            <h5 className="font-semibold text-[#33422C] text-[13px] tracking-normal" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                              {card.title}
                            </h5>
                            <p className="text-[11.5px] text-[#4A4A43] leading-[1.6]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                              {card.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center border-t border-[#C4BEB3]/70 pt-3 text-[10px] text-dark/60" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            <span className="font-bold uppercase tracking-widest text-[#33422C]">VANUIT AMBACHT</span>
            <span>{language === 'EN' ? 'Proposal' : 'Offerte'} <strong className="text-[#3E4E36]">{quoteId}</strong></span>
            <span className="font-bold">2 / 6</span>
          </div>
        </div>
      )}

      {/* PAGE 3 OF 6: UW CONFIGURATIE */}
      {(!activePage || activePage === 'all' || Number(activePage) === 3) && (
        <div className="offerte-pdf-page bg-[#FDFBF7] text-dark p-6 sm:p-8 space-y-4 rounded-xl shadow-xl print:rounded-none print:shadow-none h-[1050px] flex flex-col justify-between border border-[#C4BEB3]">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-[#C4BEB3]/70 pb-3 text-xs">
              <div className="flex items-center gap-2">
                <img src="/pdf_logo_dark.png" alt="Vanuit Ambacht" className="h-7 sm:h-8 object-contain" />
              </div>
              <div className="text-[11px] font-medium text-right leading-tight tracking-[0.14em] uppercase" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                <div className="text-[#8A8275]">{language === 'EN' ? 'PROPOSAL' : 'OFFERTE'} <span className="text-[#3E4E36] font-bold">{quoteId}</span></div>
                <div className="text-[#4A4A43] font-bold">{customerName.toUpperCase()} &nbsp;·&nbsp; {city.toUpperCase()}</div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-[#8A8275] font-semibold uppercase tracking-[0.16em] block" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {language === 'EN' ? '03 · YOUR CONFIGURATION' : '03 · UW CONFIGURATIE'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif text-[#3E4E36] font-normal" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {isGardenRoom
                  ? (language === 'EN' ? 'Your garden room at a glance' : 'Jouw buitenverblijf in één oogopslag')
                  : (language === 'EN' ? 'Your outdoor kitchen at a glance' : 'Jouw buitenkeuken in één oogopslag')}
              </h3>
            </div>

            {/* 4 Green Stat Tiles */}
            <div className="grid grid-cols-4 gap-2.5">
              <div className="bg-[#35442E] p-3.5 rounded-2xl text-center space-y-1 shadow-sm border border-[#43543A]">
                <span className="text-[9px] uppercase tracking-widest text-[#D6CFC2] block font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {language === 'EN' ? 'DIMENSIONS' : 'AFMETING'}
                </span>
                <p className="text-lg sm:text-xl font-serif text-[#FDFBF7] leading-tight font-normal" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{cleanDimensions}</p>
                <span className="text-[9px] text-[#E5DFD5] block font-body pt-0.5">{config.dimensionsUnit || (language === 'EN' ? 'centimeters' : 'centimeter')}</span>
              </div>

              <div className="bg-[#35442E] p-3.5 rounded-2xl text-center space-y-1 shadow-sm border border-[#43543A]">
                <span className="text-[9px] uppercase tracking-widest text-[#D6CFC2] block font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {language === 'EN' ? 'WOOD TYPE' : 'HOUTSOORT'}
                </span>
                <p className="text-lg sm:text-xl font-serif text-[#FDFBF7] leading-tight font-normal" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{woodType}</p>
                <span className="text-[9px] text-[#E5DFD5] block font-body pt-0.5">{config.woodLifespan || woodLifespan}</span>
              </div>

              <div className="bg-[#35442E] p-3.5 rounded-2xl text-center space-y-1 shadow-sm border border-[#43543A]">
                <span className="text-[9px] uppercase tracking-widest text-[#D6CFC2] block font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {tile3Title}
                </span>
                <p className="text-lg sm:text-xl font-serif text-[#FDFBF7] leading-tight font-normal truncate" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{tile3Value}</p>
                <span className="text-[9px] text-[#E5DFD5] block font-body pt-0.5">
                  {config.optionsSubtext || tile3Subtext}
                </span>
              </div>

              <div className="bg-[#35442E] p-3.5 rounded-2xl text-center space-y-1 shadow-sm border border-[#43543A]">
                <span className="text-[9px] uppercase tracking-widest text-[#D6CFC2] block font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {language === 'EN' ? 'DELIVERY TIME' : 'LEVERTIJD'}
                </span>
                <p className="text-lg sm:text-xl font-serif text-[#FDFBF7] leading-tight font-normal" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{deliveryTime}</p>
                <span className="text-[9px] text-[#E5DFD5] block font-body pt-0.5">
                  {config.deliverySubtext || (language === 'EN' ? 'upon drawing approval' : 'na akkoord op tekening')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5 items-start">
              {/* Dynamic Specifications */}
              <div className="space-y-3.5 text-xs font-body">
                {specifications.map((sec, sIdx) => {
                  const displaySecTitle = language === 'EN'
                    ? (sec.title === 'BOVENBLAD' ? 'WORKTOP'
                      : sec.title === 'INDELING & OPBERGRUIMTE' ? 'LAYOUT & STORAGE'
                      : sec.title === 'AFWERKING & MOBILITEIT' ? 'FINISH & MOBILITY'
                      : sec.title === 'BEZORGING' ? 'DELIVERY'
                      : sec.title)
                    : sec.title;

                  return (
                    <div key={sec.id || sIdx}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-bold text-[#3E4E36] text-[11px] uppercase tracking-[0.14em] whitespace-nowrap" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                          {displaySecTitle}
                        </span>
                        <div className="flex-1 h-[1px] bg-[#E2DDD3]"></div>
                      </div>
                      <ul className="space-y-1.5 text-[#4A4A43] font-medium text-[11.5px] leading-relaxed" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        {(sec.lines || []).map((l, lIdx) => (
                          <li key={lIdx} className="flex items-start gap-2">
                            <span className="text-[#33422C] font-bold flex-shrink-0">✓</span>
                            <span>{l.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              {/* Photo & Diagram */}
              <div className="space-y-3">
                <div className={`relative rounded-2xl overflow-hidden border border-[#D6CFC2] shadow-xs bg-[#F4EFE6] flex items-center justify-center p-1.5 transition-all ${diagram.show ? 'h-44 sm:h-48' : 'h-64 sm:h-72'
                  }`}>
                  <img
                    src={config.configPhoto || projectImg}
                    alt="Configuration"
                    onError={(e) => { e.target.onerror = null; e.target.src = projectImg; }}
                    className="w-full h-full object-cover object-center rounded-xl"
                  />
                </div>

                {/* Floor-Plan Top-View Diagram for Garden Room / Veranda / Poolhouse */}
                {isGardenRoom ? (
                  <div className="p-3 bg-[#F4EFE6] rounded-2xl border border-[#E2DDD3] space-y-2 shadow-xs font-body">
                    <span className="text-[10px] uppercase font-bold text-[#8A8275] tracking-[0.14em] block text-center" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                      {language === 'EN' ? 'FLOOR PLAN LAYOUT' : 'INDELING PLATTEGROND'}
                    </span>

                    {/* Exact Client 2-Compartment Floorplan Card */}
                    <div className="h-28 flex gap-2">
                      {/* Left: Poolhouse / Closed Timber Section */}
                      <div className="w-[42%] bg-[#33422C] text-[#FDFBF7] rounded-xl p-2.5 flex flex-col justify-center items-center text-center">
                        <span className="text-xs font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>poolhouse</span>
                        <span className="text-[10.5px] text-[#D6CFC2] mt-0.5" style={{ fontFamily: "'Montserrat', sans-serif" }}>{language === 'EN' ? 'enclosed · 3.00 m' : 'dicht · 3,00 m'}</span>
                      </div>

                      {/* Right: Lounge / Overkapt Section */}
                      <div className="flex-1 bg-white border border-[#D6CFC2] text-[#3E4E36] rounded-xl p-2.5 flex flex-col justify-center items-center text-center">
                        <span className="text-xs font-semibold" style={{ fontFamily: "'Montserrat', sans-serif" }}>lounge</span>
                        <span className="text-[10.5px] text-[#4A4A43] font-medium mt-0.5" style={{ fontFamily: "'Montserrat', sans-serif" }}>{language === 'EN' ? 'canopy · 5.00 m' : 'overkapt · 5,00 m'}</span>
                      </div>
                    </div>

                    {/* Dimension Bar */}
                    <div className="flex items-center justify-between text-[11px] text-[#4A4A43] font-bold px-1 pt-0.5" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                      <span>0</span>
                      <div className="flex-1 mx-2.5 flex items-center">
                        <div className="w-[1.5px] h-3 bg-[#70624F]"></div>
                        <div className="flex-1 h-[1.5px] bg-[#D6CFC2]"></div>
                        <div className="w-[1.5px] h-3 bg-[#70624F]"></div>
                      </div>
                      <span>8,00 m</span>
                    </div>
                  </div>
                ) : diagram.show && (
                  <div className="p-3 bg-[#F4EFE6] rounded-2xl border border-[#E2DDD3] text-center space-y-2 shadow-xs">
                    <span className="text-[9px] uppercase font-bold text-[#8A8275] tracking-[0.14em] block" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                      {language === 'EN' ? `FRONT VIEW DIAGRAM (${diagram.totalWidth} CM)` : `VOORAANZICHT TEKENING (${diagram.totalWidth} CM)`}
                    </span>

                    <div className="flex items-center justify-center gap-1 text-[9px]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                      {diagram.segments.map((seg, sIdx) => {
                        const isDark = seg.type === 'CUTOUT' || seg.type === 'FRIDGE' || seg.type === 'SINK';
                        const segLabel = seg.label === 'kastje' && language === 'EN' ? 'cabinet' : (seg.label || (language === 'EN' ? 'cabinet' : 'kastje'));
                        return (
                          <div
                            key={sIdx}
                            style={{ flex: Math.max(1, Number(seg.width) || 50) }}
                            className={`py-2 px-1 rounded-xl font-bold shadow-xs border ${isDark ? 'bg-[#33422C] text-[#FDFBF7] border-[#33422C]' : 'bg-white text-dark border-[#D6CFC2]'
                              }`}
                          >
                            <span className="truncate block max-w-full">{segLabel}</span>
                            <span className="text-[8px] opacity-70 block">{seg.width} cm</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-[9px] text-[#4A4A43] border-t border-[#D6CFC2]/60 pt-1 flex justify-between px-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                      <span className="font-bold text-[#4A4A43]">0 cm</span>
                      <span className="font-bold text-[#4A4A43]">{diagram.totalWidth} cm</span>
                    </div>
                  </div>
                )}

                {/* Wood Infobox */}
                {infobox.show && (
                  <div className="p-3.5 bg-[#35442E] text-[#FDFBF7] rounded-2xl space-y-1 shadow-sm border border-[#43543A]">
                    <h4 className="text-sm font-normal text-[#FDFBF7]" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 400 }}>{infobox.title}</h4>
                    <p className="text-[11px] text-[#E5DFD5] leading-relaxed" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                      {infobox.text}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center border-t border-[#C4BEB3]/70 pt-3 text-[10px] text-dark/60" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            <span className="font-bold uppercase tracking-widest text-[#33422C]">VANUIT AMBACHT</span>
            <span>{language === 'EN' ? 'Proposal' : 'Offerte'} <strong className="text-[#3E4E36]">{quoteId}</strong></span>
            <span className="font-bold">3 / 6</span>
          </div>
        </div>
      )}

      {/* PAGE 4 OF 6: INVESTERING */}
      {(!activePage || activePage === 'all' || Number(activePage) === 4) && (
        <div className="offerte-pdf-page bg-[#FDFBF7] text-dark p-6 sm:p-8 space-y-4 rounded-xl shadow-xl print:rounded-none print:shadow-none h-[1050px] flex flex-col justify-between border border-[#C4BEB3]">
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-[#C4BEB3]/70 pb-3 text-xs">
              <div className="flex items-center gap-2">
                <img src="/pdf_logo_dark.png" alt="Vanuit Ambacht" className="h-7 sm:h-8 object-contain" />
              </div>
              <div className="text-[11px] font-medium text-right leading-tight tracking-[0.14em] uppercase" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                <div className="text-[#8A8275]">{language === 'EN' ? 'PROPOSAL' : 'OFFERTE'} <span className="text-[#3E4E36] font-bold">{quoteId}</span></div>
                <div className="text-[#4A4A43] font-bold">{customerName.toUpperCase()} &nbsp;·&nbsp; {city.toUpperCase()}</div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-[#8A8275] font-semibold uppercase tracking-[0.16em] block" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                04 &nbsp;·&nbsp; {language === 'EN' ? 'INVESTMENT' : 'INVESTERING'}
              </span>
              <h3 className="text-2xl sm:text-3xl text-[#33422C] font-normal" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 400 }}>
                {language === 'EN' ? 'Your investment overview' : (quote?.investment?.title && quote.investment.title !== 'Heldere prijs, alles inbegrepen' ? quote.investment.title : 'Uw investering in één overzicht')}
              </h3>
            </div>

            {/* Line Items Table */}
            <div className="space-y-1.5">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-y border-[#33422C] text-[10px] uppercase tracking-[0.14em] text-[#33422C] font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    <th className="py-2.5 px-1">{language === 'EN' ? 'DESCRIPTION' : 'OMSCHRIJVING'}</th>
                    <th className="py-2.5 px-3 text-center">{language === 'EN' ? 'QUANTITY' : 'AANTAL'}</th>
                    <th className="py-2.5 px-1 text-right">{language === 'EN' ? 'AMOUNT' : 'BEDRAG'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2DDD3] text-xs">
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-1">
                        <p className="font-bold text-[#3E4E36] text-xs sm:text-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                          {item.title || item.description}
                        </p>
                        {item.description && item.title && (
                          <p className="text-[11px] text-[#4A4A43] mt-0.5 leading-relaxed font-normal" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                            {item.description}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-[#33422C]" style={{ fontFamily: "'Montserrat', sans-serif" }}>{item.quantity || 1}</td>
                      <td className="py-3 px-1 text-right font-bold text-[#2E2E29] text-sm whitespace-nowrap" style={{ fontFamily: "'Montserrat', sans-serif", fontVariantNumeric: 'tabular-nums' }}>
                        {item.isIncluded || Number(item.priceInclVat || item.unitPrice || 0) === 0
                          ? <span className="font-bold text-[#3E4E36]">{language === 'EN' ? 'Included' : 'Inbegrepen'}</span>
                          : formatDecEuro(Number(item.priceInclVat || item.unitPrice || 0) * Number(item.quantity || 1))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-b border-[#E2DDD3] pb-2 mb-3">
                <p className="text-[10px] text-[#70624F]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {language === 'EN'
                    ? '* Provisional sum: this amount is an estimate. Final settlement is based on actual costs, always coordinated beforehand.'
                    : (quote?.investment?.stelpostDisclaimer || '* Stelpost: dit bedrag is een zorgvuldige inschatting. We rekenen af op basis van de werkelijke kosten, altijd in overleg vooraf.')}
                </p>
              </div>
            </div>

            {/* Included Checklist + Totals Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              <div className="p-5 sm:p-6 bg-[#F4EFE6] rounded-2xl border border-[#E2DDD3] space-y-3.5 shadow-xs">
                <p className="text-[10px] uppercase font-bold text-[#8A8275] tracking-[0.14em]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {language === 'EN' ? 'INCLUDED WITH YOUR INVESTMENT' : (quote?.investment?.checklistTitle || 'INBEGREPEN BIJ JOUW INVESTERING')}
                </p>
                <ul className="space-y-2 text-xs text-[#4A4A43] font-body" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {(
                    quote?.investment?.checklist && quote.investment.checklist.length > 0 && !quote.investment.checklist[0].includes('Volledig maatwerk, gebouwd door') && !quote.investment.checklist[0].includes('Ontwerp en technische tekening')
                      ? quote.investment.checklist
                      : (language === 'EN' ? [
                          'Architectural design and technical drawings prior to build',
                          'On-site survey prior to construction start',
                          'Construction by a certified craft specialist',
                          'Transport, assembly, and job site cleanup',
                          'Structural warranty and aftercare following completion'
                        ] : [
                          'Ontwerp en technische tekening vóór de bouw',
                          'Schouw op locatie vóór de start van de bouw',
                          'Bouw door een gecertificeerde vakspecialist',
                          'Transport, montage en opruimen van de bouwplaats',
                          'Garantie op de constructie én nazorg na oplevering'
                        ])
                  ).map((cLine, cIdx) => (
                    <li key={cIdx} className="flex items-start gap-2.5">
                      <span className="text-[#33422C] font-bold flex-shrink-0 mt-0.5">✓</span>
                      <span className="leading-relaxed">{typeof cLine === 'string' ? cLine.replace('{city}', city).replace('{finish}', finishTreatment) : (cLine?.text || '')}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <div className="p-6 bg-[#35442E] text-[#FDFBF7] rounded-2xl space-y-3 shadow-sm border border-[#43543A]">
                  <div className="space-y-2 text-xs" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    <div className="flex justify-between text-[#E5DFD5]">
                      <span>{language === 'EN' ? 'Total excl. VAT' : 'Totaal excl. btw'}</span>
                      <span className="text-[#FDFBF7] font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>{formatDecEuro(totalExcl)}</span>
                    </div>
                    <div className="flex justify-between text-[#E5DFD5]">
                      <span>{language === 'EN' ? 'VAT 21%' : 'Btw 21%'}</span>
                      <span className="text-[#FDFBF7] font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>{formatDecEuro(vatAmount)}</span>
                    </div>
                    <div className="flex justify-between items-baseline pt-3 border-t border-[#4E5E45]">
                      <span className="text-sm font-semibold text-[#FDFBF7]">{language === 'EN' ? 'Total incl. VAT' : 'Totaal incl. btw'}</span>
                      <span className="text-2xl sm:text-3xl text-[#FDFBF7] font-serif font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontVariantNumeric: 'tabular-nums' }}>{formatDecEuro(totalIncl)}</span>
                    </div>
                    <p className="text-[10px] text-[#D6CFC2] italic text-right block pt-0.5">
                      {quote?.investment?.vatDisclaimer || (language === 'EN' ? 'All amounts include VAT' : 'Alle bedragen inclusief btw')}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-[#EDE8DF] text-[#4A4A43] text-xs rounded-xl flex items-center gap-2.5 border border-[#E2DDD3]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  <Calendar className="w-4 h-4 text-[#8A8275] flex-shrink-0" />
                  <span>
                    {quote?.investment?.validityText ? (
                      quote.investment.validityText.includes('{date}') ? (
                        <>
                          {quote.investment.validityText.split('{date}')[0]}
                          <strong className="text-[#3E4E36] font-bold">{formatDutchDate(validUntil)}</strong>
                          {quote.investment.validityText.split('{date}')[1] || ''}
                        </>
                      ) : (
                        quote.investment.validityText
                      )
                    ) : (
                      <>{language === 'EN' ? 'This proposal is valid until ' : 'Deze offerte is geldig tot en met '}<strong className="text-[#3E4E36] font-bold">{formatDutchDate(validUntil)}</strong></>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Instalments */}
            <div className="pt-2 space-y-2.5">
              <p className="text-[10px] uppercase font-bold text-[#8A8275] tracking-[0.14em]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {language === 'EN'
                  ? `PAYMENT IN ${instalmentCards.length === 3 ? 'THREE' : 'TWO'} INSTALMENTS`
                  : `BETALING IN ${instalmentCards.length === 3 ? 'DRIE' : 'TWEE'} TERMIJNEN`}
              </p>
              <div className={`grid grid-cols-1 ${instalmentCards.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3`}>
                {instalmentCards.map((inst, idx) => {
                  const customSubtext = (quote?.investment?.instalments?.subtexts && quote.investment.instalments.subtexts[idx]) || null;
                  const defaultSubtext = customSubtext || (language === 'EN'
                    ? (instalmentCards.length === 3
                        ? (idx === 0 ? 'Upon technical drawing approval.' : idx === 1 ? 'Just before starting on-site work.' : 'Only once delivered to your complete satisfaction.')
                        : (idx === 0 ? 'Upon technical drawing approval.' : 'Only once delivered to your complete satisfaction.'))
                    : (instalmentCards.length === 3
                        ? (idx === 0 ? 'Na akkoord op de technische tekening.' : idx === 1 ? 'Vlak vóór de startdatum op locatie.' : 'Pas als alles naar wens is opgeleverd.')
                        : (idx === 0 ? 'Na akkoord op de technische tekening.' : 'Pas als alles naar wens is opgeleverd.')));

                  const instLabel = language === 'EN'
                    ? (inst.label === 'Bij akkoord' ? 'Upon acceptance' : inst.label === 'Bij start bouw' ? 'Prior to build start' : inst.label === 'Bij levering' ? 'Upon delivery' : inst.label)
                    : inst.label;

                  return (
                    <div key={idx} className="p-4 bg-white rounded-2xl border border-[#E3DDD3] flex items-center justify-between shadow-2xs">
                      <span className="text-3xl sm:text-4xl text-[#3E4E36] font-normal" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                        {inst.percentage}%
                      </span>
                      <div className="text-right space-y-0.5">
                        <p className="font-bold text-[#3E4E36] text-xs" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                          {instLabel}
                        </p>
                        <p className="text-xs font-bold text-[#2E2E29]" style={{ fontFamily: "'Montserrat', sans-serif", fontVariantNumeric: 'tabular-nums' }}>
                          {formatDecEuro(inst.amount)}
                        </p>
                        <p className="text-[10px] text-[#70624F] font-medium leading-tight pt-0.5" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                          {defaultSubtext}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center border-t border-[#C4BEB3]/70 pt-3 text-[10px] text-dark/60" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            <span className="font-bold uppercase tracking-widest text-[#33422C]">VANUIT AMBACHT</span>
            <span>{language === 'EN' ? 'Proposal' : 'Offerte'} <strong className="text-[#3E4E36]">{quoteId}</strong></span>
            <span className="font-bold">4 / 6</span>
          </div>
        </div>
      )}

      {/* PAGE 5 OF 6: AKKOORD & SIGNATURES */}
      {(!activePage || activePage === 'all' || Number(activePage) === 5) && (
        <div className="offerte-pdf-page bg-[#FDFBF7] text-dark p-6 sm:p-8 space-y-4 rounded-xl shadow-xl print:rounded-none print:shadow-none h-[1050px] flex flex-col justify-between border border-[#C4BEB3]">
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-[#C4BEB3]/70 pb-3 text-xs">
              <div className="flex items-center gap-2">
                <img src="/pdf_logo_dark.png" alt="Vanuit Ambacht" className="h-7 sm:h-8 object-contain" />
              </div>
              <div className="text-[11px] font-medium text-right leading-tight tracking-[0.14em] uppercase" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                <div className="text-[#8A8275]">{language === 'EN' ? 'PROPOSAL' : 'OFFERTE'} <span className="text-[#3E4E36] font-bold">{quoteId}</span></div>
                <div className="text-[#4A4A43] font-bold">{customerName.toUpperCase()} &nbsp;·&nbsp; {city.toUpperCase()}</div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-[#8A8275] font-semibold uppercase tracking-[0.16em] block" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                05 &nbsp;·&nbsp; {language === 'EN' ? 'APPROVAL' : 'AKKOORD'}
              </span>
              <h3 className="text-2xl font-serif font-bold text-[#33422C]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {language === 'EN' ? 'Shall we craft this for you?' : (quote?.letterAndProcess?.approvalTitle || 'Zullen we hem gaan maken?')}
              </h3>
            </div>

            <div className="p-6 sm:p-7 bg-[#35442E] text-[#FDFBF7] rounded-2xl space-y-4 shadow-sm border border-[#43543A] relative overflow-hidden">
              <div className="relative z-10 space-y-1.5">
                <h4 className="text-xl font-serif text-[#FDFBF7] font-normal" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {language === 'EN' ? 'Approving takes just one minute' : (quote?.letterAndProcess?.approvalSubheading || 'Akkoord geven kan in één minuut')}
                </h4>
                <p className="text-xs text-[#E5DFD5] leading-relaxed max-w-xl" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {language === 'EN'
                    ? 'Send a quick confirmation via WhatsApp or email, or sign below. You will then receive the final design with technical drawings for confirmation, and we will get right to work.'
                    : (quote?.letterAndProcess?.approvalText || 'Stuur een korte bevestiging per WhatsApp of mail, of onderteken hieronder. Daarna ontvang je het definitieve ontwerp met technische tekening ter bevestiging en gaan we voor je aan de slag.')}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2 text-xs relative z-10" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                <a href="https://wa.me/31682008025" target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-[#EAE5DC] text-[#33422C] font-bold rounded-xl shadow-2xs hover:bg-white transition-colors inline-flex items-center gap-2 border border-[#E2DDD3]">
                  💬 WhatsApp · 06 82 00 80 25
                </a>
                <a href="mailto:info@vanuitambacht.nl" className="px-5 py-2.5 bg-[#3E4E36]/80 text-[#FDFBF7] font-bold rounded-xl transition-colors inline-flex items-center gap-2 border border-[#52664A] hover:bg-[#3E4E36]">
                  ✉️ info@vanuitambacht.nl
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="p-6 bg-[#F4EFE6] rounded-2xl border border-[#E2DDD3] space-y-4 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#3E4E36] tracking-widest block" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {language === 'EN' ? 'APPROVED BY · CLIENT' : 'VOOR AKKOORD · OPDRACHTGEVER'}
                </span>
                <div className="pt-2 space-y-4 font-body">
                  <div className="relative pb-1 border-b-2 border-[#33422C]">
                    <span className="font-serif italic text-[#33422C] text-xl font-medium block h-7" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{customerName}</span>
                    <span className="text-[10px] text-dark/60 block mt-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>{language === 'EN' ? 'Name' : 'Naam'}</span>
                  </div>
                  <div className="pb-1 border-b-2 border-[#33422C]">
                    <span className="block h-6"></span>
                    <span className="text-[10px] text-dark/60 block mt-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>{language === 'EN' ? 'Date' : 'Datum'}</span>
                  </div>
                  <div className="pb-1 border-b-2 border-[#33422C]">
                    <span className="block h-6"></span>
                    <span className="text-[10px] text-dark/60 block mt-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>{language === 'EN' ? 'Signature' : 'Handtekening'}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-[#F4EFE6] rounded-2xl border border-[#E2DDD3] space-y-4 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#3E4E36] tracking-widest block" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {language === 'EN' ? 'ON BEHALF OF VANUIT AMBACHT' : 'NAMENS VANUIT AMBACHT'}
                </span>
                <div className="pt-2 space-y-4 font-body">
                  <div className="relative pb-1 border-b-2 border-[#33422C]">
                    <span className="font-serif italic text-[#33422C] text-xl font-medium block h-7" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      {quote?.letterAndProcess?.signoffName || 'Tim & Bram'}
                    </span>
                    <span className="text-[10px] text-dark/60 block mt-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>{language === 'EN' ? 'Name' : 'Naam'} · {quote?.letterAndProcess?.signoffRole || (language === 'EN' ? 'Vanuit Ambacht' : 'Vanuit Ambacht')}</span>
                  </div>
                  <div className="pb-1 border-b-2 border-[#33422C]">
                    <span className="block h-6"></span>
                    <span className="text-[10px] text-dark/60 block mt-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>{language === 'EN' ? 'Date' : 'Datum'}</span>
                  </div>
                  <div className="pb-1 border-b-2 border-[#33422C]">
                    <span className="block h-6"></span>
                    <span className="text-[10px] text-dark/60 block mt-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>{language === 'EN' ? 'Signature' : 'Handtekening'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* If approved, show official approval audit badge on Page 5 */}
            {(() => {
              const isApproved =
                quote?.status === 'Akkoord' ||
                quote?.status === 'Accepted' ||
                quote?.status === 'Approved' ||
                quote?.status === 'Geaccepteerd' ||
                Boolean(quote?.signerName || quote?.approvedAt);

              const signerName = quote?.signerName || customerName;
              const approvedAtDate = quote?.approvedAt || (quote?.date ? `${quote.date} (${language === 'EN' ? 'Digital' : 'Digitaal'})` : '04-08-2026 17:10');

              if (!isApproved) return null;
              return (
                <div className="p-3 bg-[#3E4E36]/10 border border-[#3E4E36] rounded-xl flex items-center justify-between text-xs text-[#3E4E36] shadow-xs" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#3E4E36]" />
                    <span>{language === 'EN' ? 'Officially Digitally Accepted' : 'Officiëel Digitaal Geaccepteerd'} · <strong className="text-dark">{signerName}</strong> ({approvedAtDate})</span>
                  </div>
                  <span className="text-[10px] font-bold bg-[#3E4E36] text-[#FDFBF7] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {language === 'EN' ? 'Legally Binding' : 'Rechtsgeldig'}
                  </span>
                </div>
              );
            })()}

            {/* Authentic Terms & Conditions disclaimer matching client template */}
            <p className="text-[10px] text-[#70624F] leading-relaxed pt-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              {language === 'EN'
                ? `Our general terms and conditions apply to this proposal and to all agreements entered into with Vanuit Ambacht. You can find these on vanuitambacht.nl or receive them upon request. This proposal is valid until ${formatDutchDate(validUntil)}.`
                : `Op deze offerte en op alle overeenkomsten die je met Vanuit Ambacht aangaat, zijn onze algemene voorwaarden van toepassing. Deze vind je op vanuitambacht.nl of ontvang je op aanvraag. Deze offerte is geldig tot en met ${formatDutchDate(validUntil)}.`}
            </p>

            <div className="pt-3 border-t-2 border-[#33422C] grid grid-cols-3 gap-4 text-[10px] text-[#4A4A43]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <div>
                <span className="font-bold uppercase text-[#33422C] block mb-1 tracking-wider">{language === 'EN' ? 'ADDRESS' : 'ADRES'}</span>
                {quote?.company?.name || compName}<br />
                {quote?.company?.address || compAddress}
              </div>
              <div>
                <span className="font-bold uppercase text-[#33422C] block mb-1 tracking-wider">{language === 'EN' ? 'CONTACT' : 'CONTACT'}</span>
                {quote?.company?.phone || compPhone}<br />
                {quote?.company?.email || compEmail}<br />
                {quote?.company?.website || compWebsite}
              </div>
              <div>
                <span className="font-bold uppercase text-[#33422C] block mb-1 tracking-wider">{language === 'EN' ? 'COMPANY DETAILS' : 'GEGEVENS'}</span>
                {quote?.company?.kvk || compKvk}<br />
                {quote?.company?.vat || compVat}<br />
                {quote?.company?.iban || compIban}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center border-t border-[#C4BEB3]/70 pt-3 text-[10px] text-dark/60" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            <span className="font-bold uppercase tracking-widest text-[#33422C]">VANUIT AMBACHT</span>
            <span>{language === 'EN' ? 'Proposal' : 'Offerte'} <strong className="text-[#3E4E36]">{quoteId}</strong></span>
            <span className="font-bold">5 / 6</span>
          </div>
        </div>
      )}

      {/* PAGE 6 OF 6: VAN AKKOORD TOT ACHTERTUIN */}
      {(!activePage || activePage === 'all' || Number(activePage) === 6) && (
        <div className="offerte-pdf-page bg-[#FDFBF7] text-dark p-6 sm:p-8 space-y-4 rounded-xl shadow-xl print:rounded-none print:shadow-none h-[1050px] flex flex-col justify-between border border-[#C4BEB3]">
          <div className="space-y-5">
            <div className="flex justify-between items-center border-b border-[#C4BEB3]/70 pb-3 text-xs">
              <div className="flex items-center gap-2">
                <img src="/pdf_logo_dark.png" alt="Vanuit Ambacht" className="h-7 sm:h-8 object-contain" />
              </div>
              <div className="text-[11px] font-medium text-right leading-tight tracking-[0.14em] uppercase" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                <div className="text-[#8A8275]">{language === 'EN' ? 'PROPOSAL' : 'OFFERTE'} <span className="text-[#3E4E36] font-bold">{quoteId}</span></div>
                <div className="text-[#4A4A43] font-bold">{customerName.toUpperCase()} &nbsp;·&nbsp; {city.toUpperCase()}</div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#8A8275] tracking-[0.16em] uppercase block" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                06 &nbsp;·&nbsp; {language === 'EN' ? 'FROM APPROVAL TO BACKYARD' : 'VAN AKKOORD TOT ACHTERTUIN'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif text-[#33422C] font-normal" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {language === 'EN' ? 'How it works in five simple steps' : (quote?.letterAndProcess?.processTitle || 'Zo werkt het in vijf stappen')}
              </h3>
            </div>

            {/* 5 Vertical Process Steps */}
            <div className="relative pt-2 pl-2">
              <div className="absolute left-[25px] top-4 bottom-6 w-[2px] bg-[#D8D2C7]"></div>
              <div className="space-y-4 relative z-10">
                {(() => {
                  const defaultClientSteps = language === 'EN' ? [
                    { step: '1', title: 'Proposal approval', desc: 'Confirm easily via email or WhatsApp, or sign the approval page. From that moment on, we take care of everything.', badge: null },
                    { step: '2', title: 'Design & technical drawing', desc: 'You will receive the final design and technical drawings for sign-off. That way you know exactly what will be built before construction starts.', badge: null },
                    { step: '3', title: 'On-site survey', desc: 'Our craft specialist visits your location to check subsoil, accessibility, and utility hookups. Next, we schedule the construction date.', badge: null },
                    { step: '4', title: 'Construction & installation', badge: '2 TO 3 WEEKS', desc: 'Your bespoke outdoor living space is built on-site by a certified craft specialist. We keep you closely updated throughout.' },
                    { step: '5', title: 'Handover, warranty & aftercare', desc: 'We only consider it completed once everything is to your exact liking. Even after handover, we remain your point of contact with warranty on construction.', badge: null }
                  ] : [
                    { step: '1', title: 'Akkoord op de offerte', desc: 'Bevestig eenvoudig per mail of WhatsApp, of onderteken de akkoordpagina. Vanaf dat moment nemen wij alles uit handen.', badge: null },
                    { step: '2', title: 'Ontwerp en technische tekening', desc: 'Je ontvangt het definitieve ontwerp met technische tekening ter bevestiging. Zo weet je precies wat er gebouwd wordt vóór de bouw start.', badge: null },
                    { step: '3', title: 'Schouw op locatie', desc: 'Onze vakspecialist komt langs om de ondergrond, bereikbaarheid en aansluitingen te controleren. Daarna plannen we de bouwdatum in.', badge: null },
                    { step: '4', title: 'De bouw', badge: '2 TOT 3 WEKEN', desc: 'Jouw buitenverblijf wordt op locatie gebouwd door een gecertificeerde vakspecialist. Tussentijds houden we je op de hoogte.' },
                    { step: '5', title: 'Oplevering, garantie & nazorg', desc: 'We leveren pas op als alles naar wens is. Ook daarna blijven wij je vaste aanspreekpunt, met garantie op de constructie.', badge: null }
                  ];

                  const rawSteps = quote?.letterAndProcess?.processSteps || defaultClientSteps;
                  return rawSteps.map((s, sIdx) => {
                    let stepNum = s.step || s.stepNumber || String(sIdx + 1);
                    let title = s.title || defaultClientSteps[sIdx]?.title;
                    let desc = s.desc || defaultClientSteps[sIdx]?.desc;
                    let badge = s.badge;

                    if (language === 'EN') {
                      title = defaultClientSteps[sIdx]?.title || title;
                      desc = defaultClientSteps[sIdx]?.desc || desc;
                      if (badge === '2 TOT 3 WEKEN') badge = '2 TO 3 WEEKS';
                    } else {
                      if (sIdx === 1 && (title === 'Digitale tekening ter bevestiging' || !title)) {
                        title = 'Ontwerp en technische tekening';
                        desc = 'Je ontvangt het definitieve ontwerp met technische tekening ter bevestiging. Zo weet je precies wat er gebouwd wordt vóór de bouw start.';
                      } else if (sIdx === 2 && (title === 'Productie door onze vakspecialist' || !title)) {
                        title = 'Schouw op locatie';
                        desc = 'Onze vakspecialist komt langs om de ondergrond, bereikbaarheid en aansluitingen te controleren. Daarna plannen we de bouwdatum in.';
                        badge = null;
                      } else if (sIdx === 3 && (title?.toLowerCase().includes('bezorging') || title === 'De bouw' || !title)) {
                        title = 'De bouw';
                        desc = 'Jouw buitenverblijf wordt op locatie gebouwd door een gecertificeerde vakspecialist. Tussentijds houden we je op de hoogte.';
                        badge = badge || '2 TOT 3 WEKEN';
                      } else if (sIdx === 4 && (title === 'Garantie & nazorg' || !title)) {
                        title = 'Oplevering, garantie & nazorg';
                        desc = 'We leveren pas op als alles naar wens is. Ook daarna blijven wij je vaste aanspreekpunt, met garantie op de constructie.';
                      }
                    }

                    return (
                      <div key={stepNum} className="flex items-start gap-4">
                        <div
                          className="w-9 h-9 rounded-full bg-[#33422C] text-[#FDFBF7] font-semibold text-sm flex items-center justify-center flex-shrink-0 shadow-xs border-2 border-[#FDFBF7]"
                          style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                          {stepNum}
                        </div>
                        <div className="space-y-1 pt-0.5">
                          <div className="flex items-center gap-2.5">
                            <span className="font-bold text-[#33422C] text-sm sm:text-[15px]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                              {title}
                            </span>
                            {badge && (
                              <span
                                className="bg-[#3E4E36]/15 text-[#3E4E36] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                                style={{ fontFamily: "'Montserrat', sans-serif" }}
                              >
                                {badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#5A554E] leading-relaxed max-w-2xl" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                            {desc}
                          </p>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Quote Callout Box */}
            <div className="p-6 bg-[#F8F5EE] border border-[#EAE5DC] rounded-xl flex items-stretch gap-4 shadow-2xs">
              <div className="w-[3px] bg-[#33422C] rounded-full flex-shrink-0"></div>
              <div className="space-y-2">
                <p className="text-base sm:text-lg font-serif italic text-[#33422C] leading-snug whitespace-pre-line" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {language === 'EN'
                    ? '“No mass production. No standard solutions.\nSimply crafted with excellence. For you.”'
                    : (quote?.letterAndProcess?.closingQuote || '“Geen massa. Geen standaardoplossing.\nGewoon goed gemaakt. Voor jou.”')}
                </p>
                <p className="text-[11px] font-semibold text-[#8A8275] tracking-[0.16em] uppercase" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {quote?.letterAndProcess?.closingAuthor || `TIM & BRAM · ${compName.toUpperCase()}`}
                </p>
              </div>
            </div>

            {/* Bottom 2 Service Guarantee Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white/70 border border-[#EAE5DC] rounded-xl space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-[#33422C] font-bold text-xs sm:text-[13px]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  <Pencil className="w-3.5 h-3.5 text-[#33422C] flex-shrink-0" />
                  <span>{language === 'EN' ? 'Changes prior to construction' : 'Wijzigingen vóór de bouw'}</span>
                </div>
                <p className="text-[11px] text-[#5A554E] leading-relaxed" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {language === 'EN'
                    ? 'Want to make adjustments? Up until technical drawing sign-off, changes are incorporated free of charge into an updated proposal.'
                    : 'Wil je nog iets aanpassen? Tot het akkoord op de tekening verwerken we wijzigingen kosteloos in een bijgewerkte offerte.'}
                </p>
              </div>

              <div className="p-4 bg-white/70 border border-[#EAE5DC] rounded-xl space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-[#33422C] font-bold text-xs sm:text-[13px]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  <Clock className="w-3.5 h-3.5 text-[#33422C] flex-shrink-0" />
                  <span>{language === 'EN' ? 'Additional and deducted work' : 'Meerwerk en minderwerk'}</span>
                </div>
                <p className="text-[11px] text-[#5A554E] leading-relaxed" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {language === 'EN'
                    ? 'Any adjustments after approval are always agreed with you first, including crystal clear pricing. Zero surprises afterwards.'
                    : 'Aanpassingen na akkoord stemmen we altijd eerst met je af, inclusief een heldere prijsopgave. Geen verrassingen achteraf.'}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center border-t border-[#C4BEB3]/70 pt-3 text-[10px] text-dark/60" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            <span className="font-bold uppercase tracking-widest text-[#33422C]">{compName.toUpperCase()}</span>
            <span>{language === 'EN' ? 'Proposal' : 'Offerte'} <strong className="text-[#3E4E36]">{quoteId}</strong></span>
            <span className="font-bold">6 / 6</span>
          </div>
        </div>
      )}

    </div>
  );
}
