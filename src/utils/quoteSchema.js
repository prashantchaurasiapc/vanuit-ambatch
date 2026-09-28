import { WOOD_LIBRARY, PRESET_PRODUCT_LIBRARY, PRODUCT_TYPE_DEFAULTS } from './quoteLibraries.js';
const projectImg = '/outdoor_project_card.png';
const heroImg = '/dasbordes images.png';

export function createDefaultQuote(customerData = null, existingQuote = null) {
  const today = new Date().toISOString().split('T')[0];
  const validUntilDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // customer can be a string OR an object {name, city, ...} from QuoteEditor
  const existingCustomer = existingQuote?.customer;
  const existingCustomerName = existingCustomer
    ? (typeof existingCustomer === 'object' ? existingCustomer.name : existingCustomer)
    : null;
  const custName = customerData?.name || existingCustomerName || 'Bjorn Valk';
  const firstName = (typeof custName === 'string' ? custName : '').split(' ')[0] || 'Bjorn';
  const city = customerData?.city || customerData?.location || existingQuote?.deliveryLocation || existingQuote?.city || (typeof existingCustomer === 'object' ? existingCustomer.city : null) || 'Dongen';
  const email = customerData?.email || customerData?.customerEmail || (typeof existingCustomer === 'object' ? existingCustomer.email : null) || `${firstName.toLowerCase()}@gmail.com`;
  const phone = customerData?.phone || customerData?.customerPhone || (typeof existingCustomer === 'object' ? existingCustomer.phone : null) || '+31 6 12345678';
  const address = customerData?.address || (typeof existingCustomer === 'object' ? existingCustomer.address : null) || 'Keizersgracht 420';

  const woodName = existingQuote?.configuration?.woodType || existingQuote?.woodType || customerData?.woodType || customerData?.material || 'Thermo Fraké';
  const defaultWood = WOOD_LIBRARY.find(w => w.name.toLowerCase() === woodName.toLowerCase()) || WOOD_LIBRARY[0];
  const defaultProductType = existingQuote?.productType || customerData?.productType || 'Outdoor kitchen';
  const productDefaults = PRODUCT_TYPE_DEFAULTS[defaultProductType] || PRODUCT_TYPE_DEFAULTS['Outdoor kitchen'];

  const dimensions = existingQuote?.configuration?.dimensions || existingQuote?.dimensions || customerData?.dimensions || customerData?.size || '240 × 80';
  const cleanDimensions = String(dimensions).replace(/\s*cm$/i, '').trim();
  const cutoutName = existingQuote?.configuration?.optionsTitle || existingQuote?.cutout || customerData?.cutout || 'Big Green Egg Large';
  const deliveryTime = existingQuote?.configuration?.deliveryTime || existingQuote?.deliveryTime || customerData?.deliveryTime || '3 to 5 weeks';

  let targetPrice = 3495;
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

  const initialLineItems = existingQuote?.investment?.lineItems || existingQuote?.items || [
    {
      id: 'item-1',
      title: `${defaultProductType} ${woodName} · ${cleanDimensions} cm`,
      description: `Wooden worktop with ceramic stones, custom cutout for ${cutoutName}, finished with natural oil`,
      quantity: 1,
      priceInclVat: targetPrice,
      vatRate: existingQuote?.vatRate || 21,
      isIncluded: false
    },
    {
      id: 'item-2',
      title: `Delivery ${city}`,
      description: `Free delivery in ${city}, scheduled at your convenience`,
      quantity: 1,
      priceInclVat: 0,
      vatRate: existingQuote?.vatRate || 21,
      isIncluded: true
    }
  ];

  const baseQuote = existingQuote && typeof existingQuote === 'object' ? existingQuote : {};

  return {
    ...baseQuote,
    id: existingQuote?.id || `OF-${new Date().getFullYear()}331`,
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

    cover: existingQuote?.cover || {
      titleLine1: productDefaults.titleLine1,
      titleLine2: productDefaults.titleLine2,
      subtitleOverrideEnabled: false,
      customSubtitle: '',
      photos: [
        projectImg,
        heroImg,
        projectImg
      ]
    },

    configuration: {
      dimensions: cleanDimensions,
      dimensionsUnit: existingQuote?.configuration?.dimensionsUnit || 'centimeter',
      woodType: woodName,
      woodLifespan: existingQuote?.configuration?.woodLifespan || defaultWood.lifespan || '20 tot 25 jaar',
      optionsTitle: cutoutName,
      optionsSubtext: existingQuote?.configuration?.optionsSubtext || 'Large, rechts van het midden',
      deliveryTime: deliveryTime,
      deliverySubtext: existingQuote?.configuration?.deliverySubtext || 'na akkoord op tekening',

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

      specifications: existingQuote?.configuration?.specifications || [
        {
          id: 'sec-1',
          title: 'WORKTOP',
          lines: [
            { id: 'l-1', text: 'Ceramic stones in worktop – heat-resistant and low maintenance', isOption: false },
            { id: 'l-2', text: 'Custom cutout engineered for Big Green Egg Large', isOption: true }
          ]
        },
        {
          id: 'sec-2',
          title: 'LAYOUT & STORAGE',
          lines: [
            { id: 'l-3', text: 'Two spacious storage compartments with doors and soft-close hinges', isOption: false },
            { id: 'l-4', text: 'Open shelf for wood storage', isOption: false }
          ]
        },
        {
          id: 'sec-3',
          title: 'FINISH & MOBILITY',
          lines: [
            { id: 'l-5', text: 'Two-layer protective oil finish (naturel)', isOption: false },
            { id: 'l-6', text: 'Hidden heavy-duty swivel castors for easy mobility', isOption: false }
          ]
        },
        {
          id: 'sec-4',
          title: 'DELIVERY',
          lines: [
            { id: 'l-7', text: `Free delivery in ${city}, scheduled at your convenience`, isOption: false }
          ]
        }
      ],

      configPhoto: existingQuote?.configuration?.configPhoto || projectImg,

      diagram: existingQuote?.configuration?.diagram || {
        show: true,
        totalWidth: 240,
        segments: [
          { id: 'seg-1', type: 'CABINET', label: 'cabinet', width: 60 },
          { id: 'seg-2', type: 'CABINET', label: 'cabinet', width: 60 },
          { id: 'seg-3', type: 'CUTOUT', label: 'Big Green Egg', width: 70 },
          { id: 'seg-4', type: 'CABINET', label: 'cabinet', width: 50 }
        ]
      },

      infobox: existingQuote?.configuration?.infobox || {
        show: true,
        title: defaultWood.infoboxTitle,
        text: defaultWood.infoboxText
      },
      ...(existingQuote?.configuration || {})
    },

    investment: {
      sectionTitle: existingQuote?.investment?.sectionTitle || '04 · INVESTERING',
      title: existingQuote?.investment?.title || 'Heldere prijs, alles inbegrepen',
      lineItems: initialLineItems,
      finishTreatment: existingQuote?.investment?.finishTreatment !== undefined ? existingQuote.investment.finishTreatment : 'Olieafwerking in twee lagen (naturel)',
      checklistTitle: existingQuote?.investment?.checklistTitle || 'INBEGREPEN BIJ JOUW INVESTERING',
      checklist: existingQuote?.investment?.checklist || [
        'Volledig maatwerk, gebouwd door een gecertificeerde vakspecialist',
        'Digitale tekening vooraf ter goedkeuring',
        'Olieafwerking in twee lagen (naturel)',
        `Gratis bezorging in ${city}`,
        'Garantie en nazorg na levering'
      ],
      validityNote: existingQuote?.investment?.validityNote || `Deze offerte is geldig tot en met ${validUntilDate}`,
      ...(existingQuote?.investment || {}),
      instalments: {
        count: existingQuote?.investment?.instalments?.count || 2,
        percentages: existingQuote?.investment?.instalments?.percentages || [50, 50],
        labels: existingQuote?.investment?.instalments?.labels || (
          (existingQuote?.investment?.instalments?.count || 2) === 3
            ? ['Bij akkoord', 'Bij start bouw', 'Bij levering']
            : ['Bij akkoord', 'Bij levering']
        )
      }
    },

    letterAndProcess: {
      salutation: existingQuote?.letterAndProcess?.salutation || `Beste ${firstName},`,
      letterParagraphs: existingQuote?.letterAndProcess?.letterParagraphs || [...productDefaults.letterParagraphs],
      signoffName: existingQuote?.letterAndProcess?.signoffName || 'Tim & Bram',
      signoffRole: existingQuote?.letterAndProcess?.signoffRole || 'Oprichters Vanuit Ambacht',
      uspCards: existingQuote?.letterAndProcess?.uspCards || [
        { id: 1, title: 'VAKSPECIALISTEN', desc: 'Met de hand gebouwd in onze eigen werkplaats met oog voor detail.' },
        { id: 2, title: 'ÉÉN AANSPREEKPUNT', desc: 'Direct contact met Tim & Bram vanaf ontwerp tot bezorging.' },
        { id: 3, title: 'GARANTIE & NAZORG', desc: 'Productgarantie en persoonlijke nazorg bij u aan huis.' },
        { id: 4, title: 'BEWUST ONLINE', desc: 'Geen dure showroom, maar de scherpste prijs voor topkwaliteit.' }
      ],
      processSteps: existingQuote?.letterAndProcess?.processSteps || [
        { step: '1', title: 'Akkoord op de offerte', desc: 'Bevestig eenvoudig per mail of WhatsApp, of onderteken de akkoordpagina. Vanaf dat moment nemen wij alles uit handen.', badge: '' },
        { step: '2', title: 'Digitale tekening ter bevestiging', desc: 'Je ontvangt het definitieve ontwerp met technische tekening ter bevestiging. Zo weet je precies wat er gebouwd wordt vóór de bouw start.', badge: '' },
        { step: '3', title: 'Productie door onze vakspecialist', desc: 'Jouw keuken wordt met de hand gemaakt door een gecertificeerde vakspecialist. Tussentijds houden we je op de hoogte.', badge: deliveryTime.toUpperCase() },
        { step: '4', title: `Bezorging in ${city}`, desc: `We leveren de keuken op een moment dat jou uitkomt in ${city}. Dankzij de zes zwenkwielen staat hij direct op de juiste plek.`, badge: 'GRATIS' },
        { step: '5', title: 'Garantie & nazorg', desc: 'We leveren pas op als alles naar wens is. Ook daarna blijven wij je vaste aanspreekpunt, met garantie op de constructie.', badge: '' }
      ],
      approvalTitle: existingQuote?.letterAndProcess?.approvalTitle || 'Zullen we hem gaan maken?',
      approvalSubheading: existingQuote?.letterAndProcess?.approvalSubheading || 'Akkoord geven kan in één minuut',
      approvalText: existingQuote?.letterAndProcess?.approvalText || 'Stuur een korte bevestiging per WhatsApp of mail, of onderteken hieronder. Daarna ontvang je het definitieve ontwerp met technische tekening ter bevestiging en gaan we voor je aan de slag.',
      closingQuote: existingQuote?.letterAndProcess?.closingQuote || '“Geen massa. Geen standaardoplossing.\nGewoon goed gemaakt. Voor jou.”',
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
