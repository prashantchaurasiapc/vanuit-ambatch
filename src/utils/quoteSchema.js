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

  const defaultWood = WOOD_LIBRARY[0]; // Thermo Fraké
  const defaultProductType = 'Outdoor kitchen';
  const productDefaults = PRODUCT_TYPE_DEFAULTS[defaultProductType];

  const initialLineItems = existingQuote?.items || [
    {
      id: 'item-1',
      title: `Outdoor Kitchen ${defaultWood.name}`,
      description: `Wooden worktop with ceramic stones, custom cutout for Big Green Egg Large, finished with natural oil`,
      quantity: 1,
      priceInclVat: 3495,
      vatRate: 21,
      isIncluded: false
    },
    {
      id: 'item-2',
      title: `Delivery ${city}`,
      description: `Free delivery in ${city}, scheduled at your convenience`,
      quantity: 1,
      priceInclVat: 0,
      vatRate: 21,
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

    productType: existingQuote?.productType || defaultProductType,

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

    configuration: existingQuote?.configuration || {
      dimensions: '240 × 80',
      woodType: defaultWood.name,
      woodLifespan: defaultWood.lifespan,
      optionsTitle: 'Big Green Egg Large',
      deliveryTime: '3 to 5 weeks',

      options: {
        bbqCutout: {
          enabled: true,
          type: 'Big Green Egg',
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

      specifications: [
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
            { id: 'l-5', text: 'Two-layer protective oil finish (natural)', isOption: false },
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

      configPhoto: projectImg,

      diagram: {
        show: true,
        totalWidth: 240,
        segments: [
          { id: 'seg-1', type: 'CABINET', label: 'cabinet', width: 60 },
          { id: 'seg-2', type: 'CABINET', label: 'cabinet', width: 60 },
          { id: 'seg-3', type: 'CUTOUT', label: 'Big Green Egg', width: 70 },
          { id: 'seg-4', type: 'CABINET', label: 'cabinet', width: 50 }
        ]
      },

      infobox: {
        show: true,
        title: defaultWood.infoboxTitle,
        text: defaultWood.infoboxText
      }
    },

    investment: existingQuote?.investment || {
      lineItems: initialLineItems,
      finishTreatment: 'Olieafwerking in twee lagen (naturel)',
      checklist: [
        'Volledig maatwerk, gebouwd door een gecertificeerde vakspecialist',
        'Digitale tekening vooraf ter goedkeuring',
        'Olieafwerking in twee lagen (naturel)',
        `Gratis bezorging in ${city}`,
        'Garantie en nazorg na levering'
      ],
      instalments: {
        count: 2,
        percentages: [50, 50]
      }
    },

    letterAndProcess: existingQuote?.letterAndProcess || {
      salutation: `Beste ${firstName},`,
      letterParagraphs: [...productDefaults.letterParagraphs],
      uspCards: [
        { id: 1, title: 'VAKSPECIALISTEN', desc: 'Met de hand gebouwd in onze eigen werkplaats met oog voor detail.' },
        { id: 2, title: 'ÉÉN AANSPREEKPUNT', desc: 'Direct contact met Tim & Bram vanaf ontwerp tot bezorging.' },
        { id: 3, title: 'GARANTIE & NAZORG', desc: 'Productgarantie en persoonlijke nazorg bij u aan huis.' },
        { id: 4, title: 'BEWUST ONLINE', desc: 'Geen dure showroom, maar de scherpste prijs voor topkwaliteit.' }
      ],
      processSteps: [...productDefaults.processSteps]
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

export function calculateInstalments(totalInclVat, count = 2, percentages = [50, 50]) {
  if (!percentages || percentages.length === 0) return [];
  const validCount = Math.min(3, Math.max(2, count));
  const validP = percentages.slice(0, validCount);

  let accumulated = 0;
  const result = validP.map((pct, idx) => {
    if (idx === validP.length - 1) {
      // Last instalment gets exact remainder
      const remainder = Math.round((totalInclVat - accumulated) * 100) / 100;
      return {
        step: idx + 1,
        percentage: pct,
        label: idx === 0 ? 'Bij akkoord (50%)' : idx === 1 ? 'Bij levering' : 'Na montage',
        amount: remainder
      };
    }
    const amt = Math.round((totalInclVat * (pct / 100)) * 100) / 100;
    accumulated += amt;
    return {
      step: idx + 1,
      percentage: pct,
      label: idx === 0 ? 'Bij akkoord' : 'Bij levering',
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
