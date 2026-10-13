import { WOOD_LIBRARY, PRESET_PRODUCT_LIBRARY, PRODUCT_TYPE_DEFAULTS, getProductTypeDefaults } from './quoteLibraries.js';
const defaultCoverPhotos = ['/cover_img1.png', '/cover_img2.png', '/cover_img3.png'];

export function createDefaultQuote(customerData = null, existingQuote = null, lang = null) {
  const today = new Date().toISOString().split('T')[0];
  const validUntilDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const activeLang = lang || existingQuote?.language || (typeof window !== 'undefined' ? window.localStorage.getItem('app_language') : null) || 'EN';

  // customer can be a string OR an object {name, city, ...} from QuoteEditor
  const existingCustomer = existingQuote?.customer;
  const existingCustomerName = existingCustomer
    ? (typeof existingCustomer === 'object' ? existingCustomer.name : existingCustomer)
    : null;
  const custName = customerData?.name || existingCustomerName || '';
  const firstName = (typeof custName === 'string' ? custName : '').split(' ')[0] || '';
  const city = customerData?.city || customerData?.location || existingQuote?.deliveryLocation || existingQuote?.city || (typeof existingCustomer === 'object' ? existingCustomer.city : null) || '';
  const email = customerData?.email || customerData?.customerEmail || (typeof existingCustomer === 'object' ? existingCustomer.email : null) || (firstName ? `${firstName.toLowerCase()}@gmail.com` : '');
  const phone = customerData?.phone || customerData?.customerPhone || (typeof existingCustomer === 'object' ? existingCustomer.phone : null) || '';
  const address = customerData?.address || (typeof existingCustomer === 'object' ? existingCustomer.address : null) || '';

  const woodName = existingQuote?.configuration?.woodType || existingQuote?.woodType || customerData?.woodType || customerData?.material || 'Thermo Fraké';
  const defaultWood = WOOD_LIBRARY.find(w => w.name.toLowerCase() === woodName.toLowerCase()) || WOOD_LIBRARY[0];
  const defaultProductType = existingQuote?.productType || customerData?.productType || 'Outdoor kitchen';
  const productDefaults = getProductTypeDefaults(defaultProductType, activeLang);

  const dimensions = existingQuote?.configuration?.dimensions || existingQuote?.dimensions || customerData?.dimensions || customerData?.size || '';
  const cleanDimensions = String(dimensions).replace(/\s*cm$/i, '').trim();
  const cutoutName = existingQuote?.configuration?.optionsTitle || existingQuote?.cutout || customerData?.cutout || (activeLang === 'EN' ? 'Big Green Egg Large' : 'Big Green Egg Large');
  const deliveryTime = existingQuote?.configuration?.deliveryTime || existingQuote?.deliveryTime || customerData?.deliveryTime || (activeLang === 'EN' ? '3 to 5 weeks' : '3 tot 5 weken');

  let targetPrice = 0;
  if (existingQuote?.calculatedPrice && Number(existingQuote.calculatedPrice) > 0) {
    targetPrice = Number(existingQuote.calculatedPrice);
  } else if (existingQuote?.totalInclVat && Number(existingQuote.totalInclVat) > 0) {
    targetPrice = Number(existingQuote.totalInclVat);
  } else if (typeof existingQuote?.amount === 'number' && existingQuote.amount > 0) {
    targetPrice = existingQuote.amount;
  } else if (typeof existingQuote?.amount === 'string') {
    const parsed = Number(existingQuote.amount.replace(/[^0-9.,]/g, '').replace(',', '.'));
    if (parsed > 0) targetPrice = parsed;
  }

  const initialLineItems = existingQuote?.investment?.lineItems || existingQuote?.items || (
    productDefaults.lineItems || [
      {
        id: 'item-1',
        title: `${defaultProductType} ${woodName} · ${cleanDimensions} cm`,
        description: activeLang === 'EN'
          ? `Wooden worktop with ceramic stones, custom cutout for ${cutoutName}, finished with natural oil`
          : `Houten bovenblad met keramische stenen, uitsparing voor ${cutoutName}, afgewerkt met twee lagen olie (naturel)`,
        quantity: 1,
        priceInclVat: targetPrice,
        vatRate: existingQuote?.vatRate || 21,
        isIncluded: false
      },
      {
        id: 'item-2',
        title: activeLang === 'EN' ? `Delivery ${city}` : `Bezorging ${city}`,
        description: activeLang === 'EN'
          ? `Free delivery in ${city}, scheduled at your convenience`
          : `Gratis bezorgd in ${city}, op een moment dat jou uitkomt`,
        quantity: 1,
        priceInclVat: 0,
        vatRate: existingQuote?.vatRate || 21,
        isIncluded: true
      }
    ]
  );

  const baseQuote = existingQuote && typeof existingQuote === 'object' ? existingQuote : {};

  return {
    ...baseQuote,
    id: existingQuote?.id || `OF-${new Date().getFullYear()}331`,
    language: activeLang,
    date: existingQuote?.date || today,
    validUntil: existingQuote?.validUntil || validUntilDate,
    status: existingQuote?.status || 'Draft', // Draft | Sent | Approved | Expired

    customer: existingQuote?.customer && typeof existingQuote.customer === 'object' ? existingQuote.customer : {
      id: customerData?.id || 'CUST-101',
      name: custName,
      firstName: firstName,
      address: address,
      city: city,
      phone: phone,
      email: email
    },

    productType: defaultProductType,

    cover: {
      titleLine1: existingQuote?.cover?.titleLine1 || productDefaults.titleLine1,
      titleLine2: existingQuote?.cover?.titleLine2 || productDefaults.titleLine2,
      subtitleOverrideEnabled: Boolean(existingQuote?.cover?.subtitleOverrideEnabled),
      customSubtitle: existingQuote?.cover?.customSubtitle || '',
      photos: (Array.isArray(existingQuote?.cover?.photos) && existingQuote.cover.photos.length === 3 && existingQuote.cover.photos.every(p => typeof p === 'string' && p.trim().length > 3))
        ? existingQuote.cover.photos
        : ['/cover_img1.png', '/cover_img2.png', '/cover_img3.png']
    },

    configuration: {
      dimensions: cleanDimensions,
      dimensionsUnit: existingQuote?.configuration?.dimensionsUnit || productDefaults.configuration?.dimensionsUnit || (activeLang === 'EN' ? 'centimeters' : 'centimeter'),
      woodType: woodName,
      woodLifespan: existingQuote?.configuration?.woodLifespan || productDefaults.configuration?.woodLifespan || (activeLang === 'EN' ? (defaultWood.name === 'Douglas' ? '10 to 15 years' : '20 to 25 years') : (defaultWood.name === 'Douglas' ? '10 tot 15 jaar' : '20 tot 25 jaar')),
      optionsTitle: cutoutName,
      optionsSubtext: existingQuote?.configuration?.optionsSubtext || productDefaults.configuration?.optionsSubtext || (activeLang === 'EN' ? 'Large, right of center' : 'Large, rechts van het midden'),
      deliveryTime: deliveryTime,
      deliverySubtext: existingQuote?.configuration?.deliverySubtext || productDefaults.configuration?.deliverySubtext || (activeLang === 'EN' ? 'upon drawing approval' : 'na akkoord op tekening'),

      options: existingQuote?.configuration?.options || {
        bbqCutout: {
          enabled: true,
          type: cutoutName.includes('Egg') ? 'Big Green Egg' : cutoutName.includes('Kamado') ? 'Kamado Joe' : 'Custom Barbecue',
          size: 'Large',
          position: 'right of center'
        },
        fridge: {
          enabled: false
        },
        sink: {
          enabled: false
        }
      },

      specifications: existingQuote?.configuration?.specifications || productDefaults.configuration?.specifications || [
        {
          id: 'sec-1',
          title: activeLang === 'NL' ? 'BOVENBLAD' : 'WORKTOP',
          lines: [
            { id: 'l-1', text: activeLang === 'NL' ? 'Keramische stenen in het werkblad – hittebestendig en onderhoudsarm' : 'Ceramic stones in worktop – heat-resistant and low maintenance', isOption: false },
            { id: 'l-2', text: activeLang === 'NL' ? 'Uitsparing op maat voor Big Green Egg Large' : 'Custom cutout engineered for Big Green Egg Large', isOption: true }
          ]
        },
        {
          id: 'sec-2',
          title: activeLang === 'NL' ? 'INDELING & OPBERGRUIMTE' : 'LAYOUT & STORAGE',
          lines: [
            { id: 'l-3', text: activeLang === 'NL' ? 'Twee ruime opbergvakken met deurtjes en soft-close scharnieren' : 'Two spacious storage compartments with doors and soft-close hinges', isOption: false },
            { id: 'l-4', text: activeLang === 'NL' ? 'Open schap voor houtopslag' : 'Open shelf for wood storage', isOption: false }
          ]
        },
        {
          id: 'sec-3',
          title: activeLang === 'NL' ? 'AFWERKING & MOBILITEIT' : 'FINISH & MOBILITY',
          lines: [
            { id: 'l-5', text: activeLang === 'NL' ? 'Olieafwerking in twee lagen (naturel)' : 'Two-layer protective oil finish (natural)', isOption: false },
            { id: 'l-6', text: activeLang === 'NL' ? 'Verborgen heavy-duty zwenkwielen voor eenvoudige verplaatsing' : 'Hidden heavy-duty swivel castors for easy mobility', isOption: false }
          ]
        },
        {
          id: 'sec-4',
          title: activeLang === 'NL' ? 'BEZORGING' : 'DELIVERY',
          lines: [
            { id: 'l-7', text: activeLang === 'NL' ? `Gratis bezorgd in ${city}, op een moment dat jou uitkomt` : `Free delivery in ${city}, scheduled at your convenience`, isOption: false }
          ]
        }
      ],

      configPhoto: existingQuote?.configuration?.configPhoto || '/cover_img1.png',

      diagram: existingQuote?.configuration?.diagram || {
        show: true,
        totalWidth: 240,
        segments: [
          { id: 'seg-1', type: 'CABINET', label: activeLang === 'EN' ? 'cabinet' : 'kastje', width: 60 },
          { id: 'seg-2', type: 'CABINET', label: activeLang === 'EN' ? 'cabinet' : 'kastje', width: 60 },
          { id: 'seg-3', type: 'CUTOUT', label: 'Big Green Egg', width: 70 },
          { id: 'seg-4', type: 'CABINET', label: activeLang === 'EN' ? 'cabinet' : 'kastje', width: 50 }
        ]
      },

      infobox: existingQuote?.configuration?.infobox || {
        show: true,
        title: activeLang === 'EN' ? `About ${woodName}` : `Over ${woodName}`,
        text: activeLang === 'EN'
          ? (woodName === 'Thermo Fraké'
              ? 'Thermally treated Fraké: dimensionally stable, durable, with a warm, deep color. Lasts 20 to 25 years and ages gracefully into silver-grey.'
              : woodName === 'Padouk'
              ? 'Padouk is one of the most stable timber species globally. Coral red when processed, rapidly weathering to a warm silver-grey.'
              : 'Douglas wood offers a warm and authentic aesthetic, ideal for sheltered outdoor installations.')
          : (woodName === 'Thermo Fraké'
              ? 'Thermisch behandeld Fraké: vormstabiel, duurzaam en met een warme, diepe kleur. Gaat 20 tot 25 jaar mee en veroudert prachtig grijs.'
              : woodName === 'Padouk'
              ? 'Padouk is een van de meest stabiele houtsoorten ter wereld. Koraalrood bij verwerking, snel vergrijzend naar warm zilvergrijs.'
              : 'Douglas hout biedt een warme en authentieke uitstraling, idealiter geschikt voor beschutte buitenopstellingen.')
      },
      ...(existingQuote?.configuration || {})
    },

    investment: {
      sectionTitle: existingQuote?.investment?.sectionTitle || (activeLang === 'EN' ? '04 · INVESTMENT' : '04 · INVESTERING'),
      title: existingQuote?.investment?.title || (activeLang === 'EN' ? 'Your investment overview' : 'Uw investering in één overzicht'),
      lineItems: initialLineItems,
      finishTreatment: existingQuote?.investment?.finishTreatment !== undefined ? existingQuote.investment.finishTreatment : (activeLang === 'EN' ? 'Two-layer protective oil finish (natural)' : 'Olieafwerking in twee lagen (naturel)'),
      checklistTitle: existingQuote?.investment?.checklistTitle || (activeLang === 'EN' ? 'INCLUDED WITH YOUR INVESTMENT' : 'INBEGREPEN BIJ JOUW INVESTERING'),
      checklist: existingQuote?.investment?.checklist || (activeLang === 'EN' ? [
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
      ]),
      stelpostDisclaimer: existingQuote?.investment?.stelpostDisclaimer || (activeLang === 'EN'
        ? '* Provisional sum: this amount is an estimate. Final settlement is based on actual costs, always coordinated beforehand.'
        : '* Stelpost: dit bedrag is een zorgvuldige inschatting. We rekenen af op basis van de werkelijke kosten, altijd in overleg vooraf.'),
      vatDisclaimer: existingQuote?.investment?.vatDisclaimer || (activeLang === 'EN' ? 'All amounts include VAT' : 'Alle bedragen inclusief btw'),
      validityText: existingQuote?.investment?.validityText || (activeLang === 'EN' ? 'This proposal is valid until {date}' : 'Deze offerte is geldig tot en met {date}'),
      validityNote: existingQuote?.investment?.validityNote || (activeLang === 'EN' ? `This proposal is valid until ${validUntilDate}` : `Deze offerte is geldig tot en met ${validUntilDate}`),
      ...(existingQuote?.investment || {}),
      instalments: {
        count: existingQuote?.investment?.instalments?.count || 2,
        percentages: existingQuote?.investment?.instalments?.percentages || [50, 50],
        labels: existingQuote?.investment?.instalments?.labels || (
          activeLang === 'EN'
            ? ((existingQuote?.investment?.instalments?.count || 2) === 3
                ? ['Upon approval', 'At start of build', 'Upon handover']
                : ['Upon approval', 'Upon handover'])
            : ((existingQuote?.investment?.instalments?.count || 2) === 3
                ? ['Bij akkoord', 'Bij start bouw', 'Bij levering']
                : ['Bij akkoord', 'Bij levering'])
        ),
        subtexts: existingQuote?.investment?.instalments?.subtexts || (
          activeLang === 'EN'
            ? ((existingQuote?.investment?.instalments?.count || 2) === 3
                ? ['Upon agreement on the technical drawing.', 'Shortly before construction start date.', 'Only once everything is completed to your liking.']
                : ['Upon agreement on the technical drawing.', 'Only once everything is completed to your liking.'])
            : ((existingQuote?.investment?.instalments?.count || 2) === 3
                ? ['Na akkoord op de technische tekening.', 'Vlak vóór de startdatum op locatie.', 'Pas als alles naar wens is opgeleverd.']
                : ['Na akkoord op de technische tekening.', 'Pas als alles naar wens is opgeleverd.'])
        )
      }
    },

    letterAndProcess: {
      salutation: existingQuote?.letterAndProcess?.salutation || (activeLang === 'EN' ? `Dear ${firstName || 'Client'},` : `Beste ${firstName || 'Klant'},`),
      letterParagraphs: existingQuote?.letterAndProcess?.letterParagraphs || [...productDefaults.letterParagraphs],
      signoffName: existingQuote?.letterAndProcess?.signoffName || 'Tim & Bram',
      signoffRole: existingQuote?.letterAndProcess?.signoffRole || (activeLang === 'EN' ? 'Founders Vanuit Ambacht' : 'Oprichters Vanuit Ambacht'),
      uspCards: existingQuote?.letterAndProcess?.uspCards || (activeLang === 'EN' ? [
        { id: 1, title: 'Certified craft specialists', desc: 'Construction is handled exclusively by certified craft specialists from our nationwide network. True craftsmanship from foundation to finish.' },
        { id: 2, title: 'One dedicated contact', desc: 'You communicate directly with Tim or Bram, via WhatsApp, email or phone. Direct lines, swift answers.' },
        { id: 3, title: 'Warranty & aftercare', desc: 'Construction warranty and comprehensive aftercare after completion. Even after installation is complete, we remain your point of contact.' },
        { id: 4, title: 'Fair pricing, consciously online', desc: 'No expensive showroom is a conscious choice. You pay for craftsmanship and premium materials, not corporate overhead.' }
      ] : [
        { id: 1, title: 'Gecertificeerde vakmensen', desc: 'De bouw ligt altijd bij gecertificeerde vakspecialisten uit ons landelijke netwerk. Vakwerk, van fundering tot afwerking.' },
        { id: 2, title: 'Eén vast aanspreekpunt', desc: 'Je schakelt rechtstreeks met Tim of Bram, via WhatsApp, mail of telefoon. Korte lijnen, snelle antwoorden.' },
        { id: 3, title: 'Garantie én nazorg', desc: 'Garantie op de constructie en nazorg na oplevering. Ook als het verblijf er staat, blijven wij je aanspreekpunt.' },
        { id: 4, title: 'Eerlijke prijs, bewust online', desc: 'Geen showroom is een bewuste keuze. Zo betaal je voor vakwerk en materiaal, niet voor overhead.' }
      ]),
      processSteps: existingQuote?.letterAndProcess?.processSteps || (activeLang === 'EN' ? [
        { step: '1', title: 'Proposal approval', desc: 'Confirm easily via email or WhatsApp, or sign the approval page. From that moment on, we take care of everything.', badge: '' },
        { step: '2', title: 'Design & technical drawing', desc: 'You will receive the final design and technical drawings for sign-off. That way you know exactly what will be built before construction starts.', badge: '' },
        { step: '3', title: 'On-site survey', desc: 'Our craft specialist visits your location to check subsoil, accessibility, and utility hookups. Next, we schedule the construction date.', badge: '' },
        { step: '4', title: 'Construction & installation', desc: 'Your bespoke outdoor living space is built on-site by a certified craft specialist. We keep you closely updated throughout.', badge: '2 TO 3 WEEKS' },
        { step: '5', title: 'Handover, warranty & aftercare', desc: 'We only consider it completed once everything is to your exact liking. Even after handover, we remain your point of contact with warranty on construction.', badge: '' }
      ] : [
        { step: '1', title: 'Akkoord op de offerte', desc: 'Bevestig eenvoudig per mail of WhatsApp, of onderteken de akkoordpagina. Vanaf dat moment nemen wij alles uit handen.', badge: '' },
        { step: '2', title: 'Ontwerp en technische tekening', desc: 'Je ontvangt het definitieve ontwerp met technische tekening ter bevestiging. Zo weet je precies wat er gebouwd wordt vóór de bouw start.', badge: '' },
        { step: '3', title: 'Schouw op locatie', desc: 'Onze vakspecialist komt langs om de ondergrond, bereikbaarheid en aansluitingen te controleren. Daarna plannen we de bouwdatum in.', badge: '' },
        { step: '4', title: 'De bouw', desc: 'Jouw buitenverblijf wordt op locatie gebouwd door een gecertificeerde vakspecialist. Tussentijds houden we je op de hoogte.', badge: '2 TOT 3 WEKEN' },
        { step: '5', title: 'Oplevering, garantie & nazorg', desc: 'We leveren pas op als alles naar wens is. Ook daarna blijven wij je vaste aanspreekpunt, met garantie op de constructie.', badge: '' }
      ]),
      approvalTitle: existingQuote?.letterAndProcess?.approvalTitle || (activeLang === 'EN' ? 'Shall we build this for you?' : 'Zullen we hem gaan maken?'),
      approvalSubheading: existingQuote?.letterAndProcess?.approvalSubheading || (activeLang === 'EN' ? 'Giving approval takes only one minute' : 'Akkoord geven kan in één minuut'),
      approvalText: existingQuote?.letterAndProcess?.approvalText || (activeLang === 'EN'
        ? 'Send a quick confirmation via WhatsApp or email, or sign below. You will then receive the final design with technical drawings for confirmation, and we will get right to work.'
        : 'Stuur een korte bevestiging per WhatsApp of mail, of onderteken hieronder. Daarna ontvang je het definitieve ontwerp met technische tekening ter bevestiging en gaan we voor je aan de slag.'),
      closingQuote: existingQuote?.letterAndProcess?.closingQuote || (activeLang === 'EN' ? '“No mass production. No cookie-cutter solutions.\nPure craftsmanship. Handcrafted for you.”' : '“Geen massa. Geen standaardoplossing.\nGewoon goed gemaakt. Voor jou.”'),
      closingAuthor: existingQuote?.letterAndProcess?.closingAuthor || 'TIM & BRAM · VANUIT AMBACHT',
      ...(existingQuote?.letterAndProcess || {})
    },

    company: existingQuote?.company || {
      name: 'Vanuit Ambacht',
      address: 'Industrieweg 14, Dongen',
      kvk: 'KVK 84729102',
      vat: 'BTW NL863492817B01',
      iban: 'NL91 ABNA 0412 8892 10',
      email: 'info@vanuitambacht.nl',
      phone: '+31 6 12345678'
    }
  };
}

export function calculateTotals(lineItems = []) {
  let subtotalExclVat = 0;
  let vatAmount = 0;
  let totalInclVat = 0;

  lineItems.forEach(item => {
    if (item.isIncluded) return;
    const qty = Number(item.quantity) || 1;
    const priceIncl = Number(item.priceInclVat) || 0;
    const rate = Number(item.vatRate) || 21;

    const lineTotalIncl = qty * priceIncl;
    const lineTotalExcl = lineTotalIncl / (1 + rate / 100);
    const lineVat = lineTotalIncl - lineTotalExcl;

    totalInclVat += lineTotalIncl;
    subtotalExclVat += lineTotalExcl;
    vatAmount += lineVat;
  });

  return {
    subtotalExclVat: Math.round(subtotalExclVat * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100,
    totalInclVat: Math.round(totalInclVat * 100) / 100
  };
}

export function calculateInstalments(totalInclVat, count = 2, percentages = [50, 50], customLabels = null) {
  if (!percentages || percentages.length === 0) return [];
  const validCount = Math.min(3, Math.max(2, count));
  const validP = percentages.slice(0, validCount);

  let accumulated = 0;
  const result = validP.map((pct, idx) => {
    const defaultLabel = idx === 0 ? 'Bij akkoord' : (validCount === 3 && idx === 1 ? 'Bij start bouw' : 'Bij levering');
    const label = (Array.isArray(customLabels) && customLabels[idx]) ? customLabels[idx] : defaultLabel;
    if (idx === validP.length - 1) {
      // Last instalment gets exact remainder
      const remainder = Math.round((totalInclVat - accumulated) * 100) / 100;
      return {
        step: idx + 1,
        percentage: pct,
        label: label,
        amount: remainder
      };
    }
    const amt = Math.round((totalInclVat * (pct / 100)) * 100) / 100;
    accumulated += amt;
    return {
      step: idx + 1,
      percentage: pct,
      label: label,
      amount: amt
    };
  });

  return result;
}

export function validateQuoteForSend(quote) {
  const errors = [];
  const warnings = [];

  if (!quote.customer?.name?.trim()) errors.push('Customer name is required');
  if (!quote.customer?.city?.trim()) errors.push('Customer city is required');
  if (!quote.customer?.email?.trim()) {
    warnings.push('Customer email is missing (Approval link cannot be sent via email)');
    errors.push('Customer email is required before sending');
  }

  if (!quote.investment?.lineItems || quote.investment.lineItems.length === 0) {
    errors.push('At least 1 line item is required');
  }

  const pSum = (quote.investment?.instalments?.percentages || []).reduce((a, b) => a + Number(b), 0);
  if (pSum !== 100) {
    errors.push(`Payment instalments must sum up to exactly 100% (currently ${pSum}%)`);
  }

  // Diagram check
  if (quote.configuration?.diagram?.show) {
    const totalW = Number(quote.configuration.diagram.totalWidth) || 0;
    const segSum = (quote.configuration.diagram.segments || []).reduce((a, s) => a + (Number(s.width) || 0), 0);
    if (totalW > 0 && segSum !== totalW) {
      warnings.push(`Diagram segment sum (${segSum} cm) does not match kitchen total width (${totalW} cm)`);
    }
  }

  // Specifications line count limit check
  let totalSpecLines = 0;
  (quote.configuration?.specifications || []).forEach(s => {
    totalSpecLines += (s.lines || []).length;
  });
  if (totalSpecLines > 12) {
    warnings.push(`Specification has ${totalSpecLines} lines (recommended max: 12 lines)`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
