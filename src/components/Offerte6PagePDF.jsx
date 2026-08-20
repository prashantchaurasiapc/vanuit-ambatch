import React from 'react';
import { Wrench, MessageSquare, ShieldCheck, DollarSign } from 'lucide-react';
import projectImg from '../assets/outdoor_project_card.png';
import heroImg from '/dasbordes images.png';
import { calculateTotals, calculateInstalments } from '../utils/quoteSchema';
import { useLanguage } from '../context/LanguageContext';

export default function Offerte6PagePDF({ quote, activePage = null, highlightField = null }) {
  let language = 'NL';
  try {
    const langCtx = useLanguage();
    if (langCtx && langCtx.language) language = langCtx.language;
  } catch (e) {
    language = 'NL';
  }
  // Extract dynamic customer & header properties
  const custObj = typeof quote?.customer === 'object' ? quote.customer : null;
  const customerName = custObj?.name || quote?.customer || quote?.customerName || 'Bjorn Valk';
  const firstName = custObj?.firstName || (customerName ? customerName.trim().split(' ')[0] : 'Bjorn');
  const city = custObj?.city || quote?.deliveryLocation || quote?.city || 'Dongen';
  const quoteId = quote?.id || 'OF-2026331';
  const quoteDate = quote?.date || new Date().toISOString().split('T')[0];
  const validUntil = quote?.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Cover properties
  const cover = quote?.cover || {};
  const titleLine1 = cover.titleLine1 || 'Uw buitenkeuken,';
  const titleLine2 = cover.titleLine2 || 'op maat gemaakt.';
  
  const config = quote?.configuration || {};
  const woodType = config.woodType || quote?.woodType || 'Thermo Fraké';
  const dimensions = config.dimensions || quote?.dimensions || '240 × 80';
  const cleanDimensions = String(dimensions).replace(/\s*cm$/i, '').trim();

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
    cover.photos?.[0] || '/outdoor_project_card.png',
    cover.photos?.[1] || '/dasbordes images.png',
    cover.photos?.[2] || '/outdoor_project_card.png'
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
  const instalmentsConfig = quote?.investment?.instalments || { count: 2, percentages: [50, 50] };
  const instalmentCards = calculateInstalments(totalIncl, instalmentsConfig.count, instalmentsConfig.percentages);

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
            { text: isFreeDelivery
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
  const formatEuro = (num) => `€ ${Math.round(num).toLocaleString('nl-NL')},00`;
  const formatDecEuro = (num) => `€ ${num.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="offerte-pdf-container space-y-8 print:space-y-0 text-dark font-body select-text">

      {/* ========================================================= */}
      {/* PAGE 1 OF 6: COVER PAGE */}
      {(!activePage || activePage === 'all' || Number(activePage) === 1) && (
      <div className="offerte-pdf-page bg-[#33422C] text-[#FDFBF7] p-6 sm:p-8 space-y-4 relative rounded-xl shadow-2xl print:rounded-none print:shadow-none h-[1050px] flex flex-col justify-between overflow-hidden">
        
        {/* Background Watermark Double V/A Monogram */}
        <svg className="absolute right-0 top-16 h-[75%] w-[65%] opacity-[0.06] pointer-events-none text-white stroke-current" viewBox="0 0 200 400" fill="none">
          <path d="M30 30 L95 360 L160 30" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M85 30 L150 360 L215 30" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>

        <div className="space-y-6 relative z-10">
          {/* Header Bar */}
          <div className="relative flex justify-center items-center pt-2 pb-2">
            <img src="/pdf_logo.png" alt="Vanuit Ambacht Logo" className="h-12 sm:h-14 object-contain mx-auto" />
            <div className="absolute right-0 top-3">
              <span className="text-xs font-mono font-bold border border-[#6B7B61] text-[#E5DFD5] bg-[#45543D]/40 px-4 py-1.5 rounded-full shadow-xs uppercase tracking-wider">
                {language === 'EN' ? 'PROPOSAL' : 'OFFERTE'}
              </span>
            </div>
          </div>

          {/* Subtitle & Main Title */}
          <div className="space-y-3 pt-12 sm:pt-16">
            <div className="space-y-1.5">
              <div className="text-xs font-mono text-[#D6CFC2] tracking-wider uppercase block font-semibold">
                {language === 'EN' ? 'CUSTOM PROPOSAL' : 'VOORSTEL OP MAAT'} &nbsp;·&nbsp; <span className="text-[#D97706] font-bold">{quoteId}</span>
              </div>
              <div className="w-16 h-[2px] bg-[#8A7966]"></div>
            </div>

            <h2 className={`text-4xl sm:text-5xl text-[#FDFBF7] leading-[1.12] pt-2 font-normal transition-all duration-300 ${highlightField === 'title' ? 'bg-amber-300/80 text-dark px-2 rounded ring-2 ring-amber-400' : ''}`} style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 400 }}>
              {titleLine1}<br />
              <span className="italic" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 400 }}>{titleLine2}</span>
            </h2>

            <p className={`text-xs sm:text-sm font-mono pt-3 transition-all duration-300 ${highlightField === 'wood' || highlightField === 'title' ? 'bg-amber-300/80 text-dark px-2 py-0.5 rounded ring-2 ring-amber-400 font-extrabold' : ''}`}>
              <span className="text-[#D97706] font-bold">{subtitleText}</span>
            </p>
          </div>
        </div>

        {/* Customer & Quote Metadata */}
        <div className="space-y-4 relative z-10">
          <div className="pt-4 border-t border-[#4E5E45]/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className={`transition-all duration-300 p-1 rounded ${highlightField === 'customer' ? 'bg-amber-300/80 text-dark ring-2 ring-amber-400' : ''}`}>
              <span className="text-[10px] text-[#A19888] uppercase block tracking-wider font-bold">{language === 'EN' ? 'PREPARED FOR' : 'OPGESTELD VOOR'}</span>
              <span className="font-bold text-[#D97706] text-xs sm:text-sm block mt-0.5">{customerName}</span>
            </div>
            <div className={`transition-all duration-300 p-1 rounded ${highlightField === 'date' ? 'bg-amber-300/80 text-dark ring-2 ring-amber-400' : ''}`}>
              <span className="text-[10px] text-[#A19888] uppercase block tracking-wider font-bold">{language === 'EN' ? 'PROPOSAL NUMBER' : 'OFFERTENUMMER'}</span>
              <span className="font-bold text-[#D97706] text-xs sm:text-sm block mt-0.5">{quoteId}</span>
            </div>
            <div className={`transition-all duration-300 p-1 rounded ${highlightField === 'date' ? 'bg-amber-300/80 text-dark ring-2 ring-amber-400' : ''}`}>
              <span className="text-[10px] text-[#A19888] uppercase block tracking-wider font-bold">{language === 'EN' ? 'DATE' : 'DATUM'}</span>
              <span className="font-bold text-[#D97706] text-xs sm:text-sm block mt-0.5">{quoteDate}</span>
            </div>
            <div className={`transition-all duration-300 p-1 rounded ${highlightField === 'date' ? 'bg-amber-300/80 text-dark ring-2 ring-amber-400' : ''}`}>
              <span className="text-[10px] text-[#A19888] uppercase block tracking-wider font-bold">{language === 'EN' ? 'VALID UNTIL' : 'GELDIG T/M'}</span>
              <span className="font-bold text-[#D97706] text-xs sm:text-sm block mt-0.5">{validUntil}</span>
            </div>
          </div>

          {/* 3 Photo Strip */}
          <div className="grid grid-cols-3 gap-[2px] -mx-6 sm:-mx-10 mt-4 mb-2">
            {coverPhotos.map((pImg, idx) => (
              <div
                key={idx}
                className="h-36 sm:h-44 w-full overflow-hidden bg-[#2D3A27] flex-shrink-0"
              >
                <img
                  src={pImg || (idx === 1 ? '/dasbordes images.png' : '/outdoor_project_card.png')}
                  alt={`Cover Photo ${idx + 1}`}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = idx === 1 ? '/dasbordes images.png' : '/outdoor_project_card.png';
                  }}
                  className="h-full w-full object-cover object-center"
                />
              </div>
            ))}
          </div>

          {/* Footer Bar */}
          <div className="flex justify-between items-center text-[10px] font-mono text-[#D6CFC2] pt-1 pb-1">
            <span className="font-bold tracking-wider">VANUITAMBACHT.NL</span>
            <span>AMBACHT &nbsp;·&nbsp; KWALITEIT &nbsp;·&nbsp; PERSOONLIJK</span>
          </div>
        </div>
      </div>
      )}

      {/* PAGE 2 OF 6: PERSOONLIJK WOORD */}
      {(!activePage || activePage === 'all' || Number(activePage) === 2) && (
      <div className="offerte-pdf-page bg-[#FDFBF7] text-dark p-6 sm:p-8 space-y-4 rounded-xl shadow-xl print:rounded-none print:shadow-none h-[1050px] flex flex-col justify-between border border-[#C4BEB3]">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-[#C4BEB3]/70 pb-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <img src="/pdf_logo_dark.png" alt="Vanuit Ambacht" className="h-7 sm:h-8 object-contain" />
            </div>
            <div className="text-[11px] font-mono font-semibold text-right leading-tight tracking-wider">
              <div className="text-[#8A8275]">OFFERTE <span className="text-[#D97706] font-bold">{quoteId}</span></div>
              <div className="text-[#D97706] font-bold">{customerName.toUpperCase()} &nbsp;·&nbsp; {city.toUpperCase()}</div>
            </div>
          </div>

          {/* Section 01: Persoonlijk Woord */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-accent font-bold uppercase tracking-wider block">
              01 · {language === 'EN' ? 'PERSONAL LETTER' : 'PERSOONLIJK WOORD'}
            </span>
            <div className="grid grid-cols-3 gap-5 items-start">
              <div className="col-span-2 space-y-2.5 text-xs leading-relaxed text-dark/80">
                <h3 className="text-2xl sm:text-3xl font-serif text-primary" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                  {quote?.letterAndProcess?.salutation || (language === 'EN' ? `Dear ${firstName},` : `Beste ${firstName},`)}
                </h3>
                {(quote?.letterAndProcess?.letterParagraphs || [
                  language === 'EN' ? 'Thank you very much for your inquiry and pleasant consultation. We are delighted to present this personalized proposal for your custom outdoor kitchen.' : 'Hartelijk dank voor je aanvraag en het prettige gesprek. Met veel plezier presenteren wij deze persoonlijke offerte voor jouw maatwerk buitenkeuken.',
                  language === 'EN' ? 'At Vanuit Ambacht, we believe in sustainable materials, artisan craftsmanship, and meticulous attention to detail. We handcraft all our outdoor kitchens in our workshop.' : 'Bij Vanuit Ambacht geloven we in duurzame materialen, ambachtelijke afwerking en oog voor detail. Wij maken al onze buitenkeukens met de hand in onze werkplaats.',
                  language === 'EN' ? 'In this document, you will find a comprehensive overview of your chosen configuration, including specifications, front-view diagram, and transparent investment.' : 'In dit document vind je het volledige overzicht van jouw gekozen configuratie, inclusief specificaties, vooraanzicht tekening en transparante investering.',
                  language === 'EN' ? 'Should you have any questions or wish to make adjustments, we are delighted to assist you!' : 'Heb je vragen of wens je nog aanpassingen? Wij denken graag met je mee!'
                ]).map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
                <div className="pt-1">
                  <p className="font-serif font-bold text-primary text-base italic" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Tim & Bram</p>
                  <p className="text-[10px] text-accent font-bold font-mono tracking-widest uppercase">
                    {language === 'EN' ? 'FOUNDERS VANUIT AMBACHT' : 'OPRICHTERS VANUIT AMBACHT'}
                  </p>
                </div>
              </div>

              {/* Founders Card */}
              <div className="col-span-1 bg-[#F4EFE6] rounded-2xl overflow-hidden border border-[#E2DDD3] shadow-xs text-left">
                <img src="/extracted_pdf_img_17.jpg" alt="Tim & Bram" className="h-36 w-full object-cover" />
                <div className="p-3">
                  <p className="text-[10px] text-dark/75 leading-relaxed font-body">
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
            <span className="text-[10px] font-mono text-accent font-bold uppercase tracking-wider block">
              02 · {language === 'EN' ? 'WHY VANUIT AMBACHT' : 'WAAROM VANUIT AMBACHT'}
            </span>
            <h4 className="text-xl sm:text-2xl font-serif text-primary font-normal" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              {language === 'EN' ? 'What you can count on' : 'Waar je op kunt rekenen'}
            </h4>

            <div className="grid grid-cols-2 gap-3">
              {(quote?.letterAndProcess?.uspCards || [
                { title: language === 'EN' ? 'SPECIALIST CRAFTSMEN' : 'VAKSPECIALISTEN', desc: language === 'EN' ? 'Handcrafted by certified specialist craftsmen from our nationwide network. True craftsmanship, from foundation to finish.' : 'De bouw ligt altijd bij gecertificeerde vakspecialisten uit ons landelijke netwerk. Vakwerk, van fundering tot afwerking.' },
                { title: language === 'EN' ? 'SINGLE POINT OF CONTACT' : 'ÉÉN AANSPREEKPUNT', desc: language === 'EN' ? 'Direct communication with Tim or Bram via WhatsApp, email, or phone. Short lines, quick responses.' : 'Je schakelt rechtstreeks met Tim of Bram, via WhatsApp, mail of telefoon. Korte lijnen, snelle antwoorden.' },
                { title: language === 'EN' ? 'WARRANTY & AFTERCARE' : 'GARANTIE ÉN NAZORG', desc: language === 'EN' ? 'Warranty on structure and full aftercare upon delivery. Even after installation, we remain your point of contact.' : 'Garantie op de constructie en nazorg na oplevering. Ook als het verblijf er staat, blijven wij je aanspreekpunt.' },
                { title: language === 'EN' ? 'ONLINE EXCELLENCE' : 'BEWUST ONLINE', desc: language === 'EN' ? 'Operating without a physical showroom is a conscious choice. You pay for craftsmanship and premium timber, not overhead.' : 'Geen showroom is een bewuste keuze. Zo betaal je voor vakwerk en materiaal, niet voor overhead.' }
              ]).map((card, idx) => (
                <div key={idx} className="p-4 bg-[#F6F4EE] rounded-2xl border border-[#E3DDD3] space-y-2">
                  <div className="w-8 h-8 rounded-full bg-[#33422C] text-[#FDFBF7] flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-3.5 h-3.5 text-[#FDFBF7]" />
                  </div>
                  <div className="space-y-0.5">
                    <h5 className="font-bold text-[#33422C] text-xs uppercase font-mono">{card.title}</h5>
                    <p className="text-[11px] text-dark/75 leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t border-[#C4BEB3]/70 pt-3 text-[10px] font-mono text-dark/60">
          <span className="font-bold uppercase tracking-widest text-[#33422C]">VANUIT AMBACHT</span>
          <span>Offerte <strong className="text-[#D97706]">{quoteId}</strong></span>
          <span className="font-bold">2 / 6</span>
        </div>
      </div>
      )}

      {/* PAGE 3 OF 6: UW CONFIGURATIE */}
      {(!activePage || activePage === 'all' || Number(activePage) === 3) && (
      <div className="offerte-pdf-page bg-[#FDFBF7] text-dark p-6 sm:p-8 space-y-4 rounded-xl shadow-xl print:rounded-none print:shadow-none h-[1050px] flex flex-col justify-between border border-[#C4BEB3]">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-[#C4BEB3]/70 pb-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <img src="/pdf_logo_dark.png" alt="Vanuit Ambacht" className="h-7 sm:h-8 object-contain" />
            </div>
            <div className="text-[11px] font-mono font-semibold text-right leading-tight tracking-wider">
              <div className="text-[#8A8275]">OFFERTE <span className="text-[#D97706] font-bold">{quoteId}</span></div>
              <div className="text-[#D97706] font-bold">{customerName.toUpperCase()} &nbsp;·&nbsp; {city.toUpperCase()}</div>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono text-accent font-bold uppercase tracking-wider block">
              {language === 'EN' ? '03 · YOUR CONFIGURATION' : '03 · UW CONFIGURATIE'}
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif text-primary font-normal" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              {language === 'EN' ? 'Your outdoor kitchen at a glance' : 'Jouw buitenkeuken in één oogopslag'}
            </h3>
          </div>

          {/* 4 Green Stat Tiles */}
          <div className="grid grid-cols-4 gap-2.5">
            <div className="bg-[#35442E] p-3.5 rounded-2xl text-center space-y-1 shadow-sm border border-[#43543A]">
              <span className="text-[9px] uppercase font-mono tracking-widest text-[#D97706] block font-bold">
                {language === 'EN' ? 'DIMENSIONS' : 'AFMETING'}
              </span>
              <p className="text-lg sm:text-xl font-serif text-[#D97706] leading-tight font-normal" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{cleanDimensions}</p>
              <span className="text-[9px] text-[#E5DFD5] block font-body pt-0.5">centimeter</span>
            </div>

            <div className="bg-[#35442E] p-3.5 rounded-2xl text-center space-y-1 shadow-sm border border-[#43543A]">
              <span className="text-[9px] uppercase font-mono tracking-widest text-[#D97706] block font-bold">
                {language === 'EN' ? 'WOOD TYPE' : 'HOUTSOORT'}
              </span>
              <p className="text-lg sm:text-xl font-serif text-[#D97706] leading-tight font-normal" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{woodType}</p>
              <span className="text-[9px] text-[#E5DFD5] block font-body pt-0.5">{woodLifespan}</span>
            </div>

            <div className="bg-[#35442E] p-3.5 rounded-2xl text-center space-y-1 shadow-sm border border-[#43543A]">
              <span className="text-[9px] uppercase font-mono tracking-widest text-[#D97706] block font-bold">
                {tile3Title}
              </span>
              <p className="text-lg sm:text-xl font-serif text-[#D97706] leading-tight font-normal truncate" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{tile3Value}</p>
              <span className="text-[9px] text-[#E5DFD5] block font-body pt-0.5">
                {tile3Subtext}
              </span>
            </div>

            <div className="bg-[#35442E] p-3.5 rounded-2xl text-center space-y-1 shadow-sm border border-[#43543A]">
              <span className="text-[9px] uppercase font-mono tracking-widest text-[#D97706] block font-bold">
                {language === 'EN' ? 'DELIVERY TIME' : 'LEVERTIJD'}
              </span>
              <p className="text-lg sm:text-xl font-serif text-[#D97706] leading-tight font-normal" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{deliveryTime}</p>
              <span className="text-[9px] text-[#E5DFD5] block font-body pt-0.5">
                {config.deliverySubtext || (language === 'EN' ? 'upon drawing approval' : 'na akkoord op tekening')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 items-start">
            {/* Dynamic Specifications */}
            <div className="space-y-3.5 text-xs font-body">
              {specifications.map((sec, sIdx) => (
                <div key={sec.id || sIdx}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[#D97706] font-mono text-[10px] uppercase tracking-wider whitespace-nowrap">{sec.title}</span>
                    <div className="flex-1 h-[1px] bg-[#E2DDD3]"></div>
                  </div>
                  <ul className="space-y-1 text-dark/80 text-[11px]">
                    {(sec.lines || []).map((l, lIdx) => (
                      <li key={lIdx} className="flex items-start gap-2">
                        <span className="text-[#33422C] font-bold">✓</span> {l.text}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Photo & Diagram */}
            <div className="space-y-3">
              <div className={`relative rounded-2xl overflow-hidden border border-[#D6CFC2] shadow-xs bg-[#F4EFE6] flex items-center justify-center p-1.5 transition-all ${
                diagram.show ? 'h-44 sm:h-48' : 'h-64 sm:h-72'
              }`}>
                <img
                  src={config.configPhoto || projectImg}
                  alt="Configuration"
                  onError={(e) => { e.target.onerror = null; e.target.src = projectImg; }}
                  className="max-h-full max-w-full object-contain rounded-xl"
                />
              </div>

              {/* Front-View Diagram output */}
              {diagram.show && (
                <div className="p-3 bg-[#F4EFE6] rounded-2xl border border-[#E2DDD3] text-center space-y-2 shadow-xs">
                  <span className="text-[9px] font-mono uppercase font-bold text-accent tracking-widest block">
                    {language === 'EN' ? `FRONT VIEW DIAGRAM (${diagram.totalWidth} CM)` : `VOORAANZEICHT TEKENING (${diagram.totalWidth} CM)`}
                  </span>
                  
                  <div className="flex items-center justify-center gap-1 font-mono text-[9px]">
                    {diagram.segments.map((seg, sIdx) => {
                      const isDark = seg.type === 'CUTOUT' || seg.type === 'FRIDGE' || seg.type === 'SINK';
                      return (
                        <div
                          key={sIdx}
                          style={{ flex: Math.max(1, Number(seg.width) || 50) }}
                          className={`py-2 px-1 rounded-xl font-bold shadow-xs border ${
                            isDark ? 'bg-[#33422C] text-[#FDFBF7] border-[#33422C]' : 'bg-white text-dark border-[#D6CFC2]'
                          }`}
                        >
                          <span className="truncate block max-w-full">{seg.label || 'kastje'}</span>
                          <span className="text-[8px] opacity-70 block">{seg.width} cm</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-[9px] font-mono text-dark/60 border-t border-[#D6CFC2]/60 pt-1 flex justify-between px-2">
                    <span>0 cm</span>
                    <span className="font-bold text-primary">{diagram.totalWidth} cm</span>
                  </div>
                </div>
              )}

              {/* Wood Infobox */}
              {infobox.show && (
                <div className="p-3.5 bg-[#35442E] text-[#FDFBF7] rounded-2xl space-y-1 shadow-sm border border-[#43543A]">
                  <h4 className="text-sm font-serif text-[#D97706] font-normal" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{infobox.title}</h4>
                  <p className="text-[11px] text-[#E5DFD5] leading-relaxed font-body">
                    {infobox.text}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t border-[#C4BEB3]/70 pt-3 text-[10px] font-mono text-dark/60">
          <span className="font-bold uppercase tracking-widest text-[#33422C]">VANUIT AMBACHT</span>
          <span>Offerte <strong className="text-[#D97706]">{quoteId}</strong></span>
          <span className="font-bold">3 / 6</span>
        </div>
      </div>
      )}

      {/* PAGE 4 OF 6: INVESTERING */}
      {(!activePage || activePage === 'all' || Number(activePage) === 4) && (
      <div className="offerte-pdf-page bg-[#FDFBF7] text-dark p-6 sm:p-8 space-y-4 rounded-xl shadow-xl print:rounded-none print:shadow-none h-[1050px] flex flex-col justify-between border border-[#C4BEB3]">
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-[#C4BEB3]/70 pb-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <img src="/pdf_logo_dark.png" alt="Vanuit Ambacht" className="h-7 sm:h-8 object-contain" />
            </div>
            <div className="text-[11px] font-mono font-semibold text-right leading-tight tracking-wider">
              <div className="text-[#8A8275]">OFFERTE <span className="text-[#D97706] font-bold">{quoteId}</span></div>
              <div className="text-[#D97706] font-bold">{customerName.toUpperCase()} &nbsp;·&nbsp; {city.toUpperCase()}</div>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono text-accent font-bold uppercase tracking-wider block">04 · INVESTERING</span>
            <h3 className="text-2xl sm:text-3xl font-serif text-primary font-normal" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Heldere prijs, alles inbegrepen</h3>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-y border-[#33422C] text-[10px] font-mono uppercase tracking-widest text-[#33422C] font-bold">
                  <th className="py-2.5 px-1">OMSCHRIJVING</th>
                  <th className="py-2.5 px-3 text-center">AANTAL</th>
                  <th className="py-2.5 px-1 text-right">BEDRAG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DDD3] text-xs">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3.5 px-1">
                      <p className="font-bold text-[#D97706] text-xs sm:text-sm">{item.title || item.description}</p>
                      {item.description && item.title && <p className="text-[11px] text-[#D97706]/90 mt-0.5 leading-relaxed">{item.description}</p>}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-dark/80">{item.quantity || 1}</td>
                    <td className="py-3.5 px-1 text-right font-mono font-bold text-[#D97706] text-sm whitespace-nowrap">
                      {item.isIncluded || Number(item.priceInclVat || item.unitPrice || 0) === 0
                        ? <span className="font-bold text-[#D97706]">Inbegrepen</span>
                        : formatEuro(Number(item.priceInclVat || item.unitPrice || 0) * Number(item.quantity || 1))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Included Checklist + Totals Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            <div className="p-5 sm:p-6 bg-[#F4EFE6] rounded-2xl border border-[#E2DDD3] space-y-3.5 shadow-xs">
              <p className="font-mono text-[10px] uppercase font-bold text-accent tracking-widest">INBEGREPEN BIJ JOUW INVESTERING</p>
              <ul className="space-y-2 text-xs text-dark/80 font-body">
                {(quote?.investment?.checklist || [
                  'Volledig maatwerk, met de hand gemaakt',
                  'Digitale tekening ter bevestiging vóór productie',
                  finishTreatment,
                  isFreeDelivery ? `Gratis bezorging in ${city}` : `Bezorging in ${city}`,
                  'Garantie op het product én nazorg na levering'
                ]).map((cLine, cIdx) => (
                  <li key={cIdx} className="flex items-center gap-2.5">
                    <span className="text-[#33422C] font-bold">✓</span> {cLine.replace('{city}', city).replace('{finish}', finishTreatment)}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <div className="p-6 bg-[#35442E] text-[#FDFBF7] rounded-2xl space-y-4 shadow-sm border border-[#43543A]">
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-[#E5DFD5]">
                    <span>Totaal excl. btw</span>
                    <span className="text-[#D97706] font-bold">{formatDecEuro(totalExcl)}</span>
                  </div>
                  <div className="flex justify-between text-[#E5DFD5]">
                    <span>Btw 21%</span>
                    <span className="text-[#D97706] font-bold">{formatDecEuro(vatAmount)}</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-3 border-t border-[#4E5E45]">
                    <span className="text-sm font-bold text-[#FDFBF7]">Totaal incl. btw</span>
                    <span className="text-2xl sm:text-3xl text-[#D97706] font-serif font-bold">{formatEuro(totalIncl)}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#EAE5DC] text-primary text-[11px] font-body rounded-xl font-medium flex items-center justify-center gap-2 border border-[#E2DDD3]">
                <span>Deze offerte is geldig tot en met <strong className="text-[#D97706]">{validUntil}</strong></span>
              </div>
            </div>
          </div>

          {/* Payment Instalments */}
          <div className="pt-2 space-y-2.5">
            <p className="font-mono text-[10px] uppercase font-bold text-accent tracking-widest">
              BETALING IN {instalmentCards.length === 3 ? 'DRIE' : 'TWEE'} TERMIJNEN
            </p>
            <div className={`grid grid-cols-1 ${instalmentCards.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3 font-body`}>
              {instalmentCards.map((inst, idx) => (
                <div key={idx} className="p-4 bg-white rounded-2xl border border-[#E3DDD3] space-y-1 shadow-2xs">
                  <div className="flex justify-between items-baseline">
                    <span className="text-3xl sm:text-4xl font-serif text-[#D97706]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{inst.percentage}%</span>
                    <div className="text-right">
                      <p className="font-bold text-[#D97706] text-xs">{inst.label}</p>
                      <p className="text-xs font-bold font-mono text-[#D97706]">{formatEuro(inst.amount)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t border-[#C4BEB3]/70 pt-3 text-[10px] font-mono text-dark/60">
          <span className="font-bold uppercase tracking-widest text-[#33422C]">VANUIT AMBACHT</span>
          <span>Offerte <strong className="text-[#D97706]">{quoteId}</strong></span>
          <span className="font-bold">4 / 6</span>
        </div>
      </div>
      )}

      {/* PAGE 5 OF 6: AKKOORD & SIGNATURES */}
      {(!activePage || activePage === 'all' || Number(activePage) === 5) && (
      <div className="offerte-pdf-page bg-[#FDFBF7] text-dark p-6 sm:p-8 space-y-4 rounded-xl shadow-xl print:rounded-none print:shadow-none h-[1050px] flex flex-col justify-between border border-[#C4BEB3]">
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-[#C4BEB3]/70 pb-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <img src="/pdf_logo_dark.png" alt="Vanuit Ambacht" className="h-7 sm:h-8 object-contain" />
            </div>
            <div className="text-[11px] font-mono font-semibold text-right leading-tight tracking-wider">
              <div className="text-[#8A8275]">OFFERTE <span className="text-[#D97706] font-bold">{quoteId}</span></div>
              <div className="text-[#D97706] font-bold">{customerName.toUpperCase()} &nbsp;·&nbsp; {city.toUpperCase()}</div>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono text-accent font-bold uppercase tracking-wider block">05 · AKKOORD</span>
            <h3 className="text-2xl font-serif font-bold text-primary" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Zullen we hem gaan maken?</h3>
          </div>

          <div className="p-6 sm:p-7 bg-[#35442E] text-[#FDFBF7] rounded-2xl space-y-4 shadow-sm border border-[#43543A] relative overflow-hidden">
            <div className="relative z-10 space-y-1.5">
              <h4 className="text-xl font-serif text-[#FDFBF7] font-normal" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Akkoord geven kan in één minuut</h4>
              <p className="text-xs text-[#E5DFD5] leading-relaxed max-w-xl">
                Stuur een korte bevestiging per WhatsApp of mail, of onderteken hieronder. Daarna ontvang je het definitieve ontwerp met technische tekening ter bevestiging en gaan we voor je aan de slag.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-2 font-mono text-xs relative z-10">
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
              <span className="text-[10px] font-mono uppercase font-bold text-accent tracking-widest block">VOOR AKKOORD · OPDRACHTGEVER</span>
              <div className="pt-2 space-y-4 font-body">
                <div className="relative pb-1 border-b-2 border-[#33422C]">
                  <span className="font-serif italic text-[#D97706] text-xl font-medium block h-7" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{customerName}</span>
                  <span className="text-[10px] font-mono text-dark/60 block mt-1">Naam</span>
                </div>
                <div className="pb-1 border-b-2 border-[#33422C]">
                  <span className="block h-6"></span>
                  <span className="text-[10px] font-mono text-dark/60 block mt-1">Datum</span>
                </div>
                <div className="pb-1 border-b-2 border-[#33422C]">
                  <span className="block h-6"></span>
                  <span className="text-[10px] font-mono text-dark/60 block mt-1">Handtekening</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[#F4EFE6] rounded-2xl border border-[#E2DDD3] space-y-4 shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-accent tracking-widest block">NAMENS VANUIT AMBACHT</span>
              <div className="pt-2 space-y-4 font-body">
                <div className="relative pb-1 border-b-2 border-[#33422C]">
                  <span className="font-serif italic text-[#33422C] text-xl font-medium block h-7" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Tim & Bram</span>
                  <span className="text-[10px] font-mono text-dark/60 block mt-1">Naam</span>
                </div>
                <div className="pb-1 border-b-2 border-[#33422C]">
                  <span className="block h-6"></span>
                  <span className="text-[10px] font-mono text-dark/60 block mt-1">Datum</span>
                </div>
                <div className="pb-1 border-b-2 border-[#33422C]">
                  <span className="block h-6"></span>
                  <span className="text-[10px] font-mono text-dark/60 block mt-1">Handtekening</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t-2 border-[#33422C] grid grid-cols-3 gap-4 text-[10px] font-mono text-dark/80">
            <div>
              <span className="font-bold uppercase text-[#33422C] block mb-1 tracking-wider">ADRES</span>
              {quote?.company?.name || 'Vanuit Ambacht'}<br />
              {quote?.company?.address || 'Industrieweg 14, Dongen'}
            </div>
            <div>
              <span className="font-bold uppercase text-[#33422C] block mb-1 tracking-wider">CONTACT</span>
              {quote?.company?.phone || '06 82 00 80 25'}<br />
              {quote?.company?.email || 'info@vanuitambacht.nl'}<br />
              vanuitambacht.nl
            </div>
            <div>
              <span className="font-bold uppercase text-[#33422C] block mb-1 tracking-wider">GEGEVENS</span>
              {quote?.company?.kvk || 'KVK 93067429'}<br />
              {quote?.company?.vat || 'BTW NL866264863B01'}<br />
              {quote?.company?.iban || 'IBAN NL27 ABNA 0132 2698 56'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t border-[#C4BEB3]/70 pt-3 text-[10px] font-mono text-dark/60">
          <span className="font-bold uppercase tracking-widest text-[#33422C]">VANUIT AMBACHT</span>
          <span>Offerte <strong className="text-[#D97706]">{quoteId}</strong></span>
          <span className="font-bold">5 / 6</span>
        </div>
      </div>
      )}

      {/* PAGE 6 OF 6: VAN AKKOORD TOT ACHTERTUIN */}
      {(!activePage || activePage === 'all' || Number(activePage) === 6) && (
      <div className="offerte-pdf-page bg-[#FDFBF7] text-dark p-6 sm:p-8 space-y-4 rounded-xl shadow-xl print:rounded-none print:shadow-none h-[1050px] flex flex-col justify-between border border-[#C4BEB3]">
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-[#C4BEB3]/70 pb-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <img src="/pdf_logo_dark.png" alt="Vanuit Ambacht" className="h-7 sm:h-8 object-contain" />
            </div>
            <div className="text-[11px] font-mono font-semibold text-right leading-tight tracking-wider">
              <div className="text-[#8A8275]">OFFERTE <span className="text-[#D97706] font-bold">{quoteId}</span></div>
              <div className="text-[#D97706] font-bold">{customerName.toUpperCase()} &nbsp;·&nbsp; {city.toUpperCase()}</div>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono text-accent font-bold uppercase tracking-wider block">06 · VAN AKKOORD TOT ACHTERTUIN</span>
            <h3 className="text-2xl sm:text-3xl font-serif text-primary font-normal" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Zo werkt het in vijf stappen</h3>
          </div>

          {/* 5 Vertical Process Steps */}
          <div className="relative pt-2 pl-2">
            <div className="absolute left-[23px] top-6 bottom-8 w-[2px] bg-[#C4BEB3]"></div>
            <div className="space-y-6 relative z-10">
              {[
                { step: '1', title: 'Akkoord op de offerte', desc: 'Bevestig eenvoudig per mail of WhatsApp, of onderteken de akkoordpagina. Vanaf dat moment nemen wij alles uit handen.' },
                { step: '2', title: 'Digitale tekening ter bevestiging', desc: 'Je ontvangt het definitieve ontwerp met technische tekening ter bevestiging. Zo weet je precies wat er gebouwd wordt vóór de bouw start.' },
                { step: '3', title: 'Productie door onze vakspecialist', badge: deliveryTime.toUpperCase(), desc: 'Jouw keuken wordt met de hand gemaakt door een gecertificeerde vakspecialist. Tussentijds houden we je op de hoogte.' },
                { step: '4', title: `Bezorging in ${city}`, badge: isFreeDelivery ? 'GRATIS' : null, desc: `We leveren de keuken op een moment dat jou uitkomt in ${city}. Dankzij de zes zwenkwielen staat hij direct op de juiste plek.` },
                { step: '5', title: 'Garantie & nazorg', desc: 'We leveren pas op als alles naar wens is. Ook daarna blijven wij je vaste aanspreekpunt, met garantie op de constructie.' }
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-[#33422C] text-[#FDFBF7] font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-xs border-2 border-[#FDFBF7]">
                    {s.step}
                  </div>
                  <div className="space-y-0.5 pt-1">
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-[#33422C] text-sm sm:text-base font-body">{s.title}</p>
                      {s.badge && (
                        <span className="bg-[#EAE5DC] text-[#D97706] text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-[#E2DDD3]">
                          {s.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-dark/75 leading-relaxed font-body max-w-2xl">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 sm:p-6 bg-[#F4EFE6] border border-[#E2DDD3] rounded-2xl flex items-stretch gap-4 shadow-xs">
            <div className="w-1 bg-[#33422C] rounded-full flex-shrink-0"></div>
            <div className="space-y-1.5">
              <p className="text-base sm:text-xl font-serif italic text-[#33422C] leading-snug" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                “Geen massa. Geen standaardoplossing.<br />
                Gewoon goed gemaakt. Voor jou.”
              </p>
              <p className="text-[10px] font-mono text-accent font-bold tracking-widest uppercase">
                TIM & BRAM · VANUIT AMBACHT
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t border-[#C4BEB3]/70 pt-3 text-[10px] font-mono text-dark/60">
          <span className="font-bold uppercase tracking-widest text-[#33422C]">VANUIT AMBACHT</span>
          <span>Offerte <strong className="text-[#D97706]">{quoteId}</strong></span>
          <span className="font-bold">6 / 6</span>
        </div>
      </div>
      )}

    </div>
  );
}
