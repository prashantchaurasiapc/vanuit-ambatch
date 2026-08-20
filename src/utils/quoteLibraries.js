// Wood Library presets per Reference B
export const WOOD_LIBRARY = [
  {
    id: 'thermo_frake',
    name: 'Thermo Fraké',
    lifespan: '20 to 25 years',
    infoboxTitle: 'About Thermo Fraké',
    infoboxText: 'Thermally treated Fraké: dimensionally stable, durable, with a warm, deep color. Lasts 20 to 25 years and ages gracefully into silver-grey.'
  },
  {
    id: 'padouk',
    name: 'Padouk',
    lifespan: '20 to 25 years',
    infoboxTitle: 'About Padouk',
    infoboxText: 'Padouk is one of the most stable timber species globally. Coral red when processed, rapidly weathering to a warm silver-grey.'
  },
  {
    id: 'douglas',
    name: 'Douglas',
    lifespan: '10 to 15 years',
    infoboxTitle: 'About Douglas',
    infoboxText: 'Douglas wood offers a warm and authentic aesthetic, ideal for sheltered outdoor installations.'
  }
];

export function getWoodTypeDefaults(woodName, language = 'NL') {
  const match = WOOD_LIBRARY.find(w => w.name.toLowerCase() === (woodName || '').toLowerCase());
  if (match) {
    return {
      name: match.name,
      lifespan: language === 'EN' ? match.lifespan : (match.name === 'Douglas' ? '10 tot 15 jaar' : '20 tot 25 jaar'),
      infoboxTitle: language === 'EN' ? match.infoboxTitle : `Over ${match.name}`,
      infoboxText: language === 'EN' ? match.infoboxText : (
        match.name === 'Thermo Fraké'
          ? 'Thermisch behandeld Fraké: vormstabiel, duurzaam en met een warme, diepe kleur. Gaat 20 tot 25 jaar mee en veroudert prachtig grijs.'
          : match.name === 'Padouk'
          ? 'Padouk is een van de meest stabiele houtsoorten ter wereld. Koraalrood bij verwerking, snel vergrijzend naar warm zilvergrijs.'
          : 'Douglas hout biedt een warme en authentieke uitstraling, idealiter geschikt voor beschutte buitenopstellingen.'
      )
    };
  }
  return {
    name: woodName || 'Overig hout',
    lifespan: '15 tot 20 jaar',
    infoboxTitle: `Over ${woodName || 'Houtsoort'}`,
    infoboxText: `${woodName || 'Deze houtsoort'} is duurzaam en vormstabiel, geschikt voor hoogwaardige buitenkeukens.`
  };
}

// Product Library items per Reference B
export const PRESET_PRODUCT_LIBRARY = [
  {
    id: 'lib-1',
    title: 'Outdoor Kitchen Thermo Fraké',
    description: 'Thermo Fraké outdoor kitchen 240 x 80 cm, finished with two layers of protective oil',
    priceInclVat: 3495,
    vatRate: 21,
    isIncluded: false
  },
  {
    id: 'lib-2',
    title: 'Solid Teak Wood Outdoor Kitchen Cabinet (300x90cm)',
    description: 'Solid teakwood frame with stainless steel hinges and soft-close drawers',
    priceInclVat: 4200,
    vatRate: 21,
    isIncluded: false
  },
  {
    id: 'lib-3',
    title: 'Big Green Egg Large Cutout & Base Support',
    description: 'Custom cutout engineered for Big Green Egg Large with heat-resistant sublayer',
    priceInclVat: 450,
    vatRate: 21,
    isIncluded: false
  },
  {
    id: 'lib-4',
    title: 'Built-in Stainless Steel Outdoor Fridge Premium 80L',
    description: 'Integrated stainless steel outdoor refrigerator, suitable for all seasons',
    priceInclVat: 890,
    vatRate: 21,
    isIncluded: false
  },
  {
    id: 'lib-5',
    title: 'Stainless Steel Sink & Mixer Tap Built-in Kit',
    description: 'Under-mount stainless steel sink with luxury black mixer tap',
    priceInclVat: 390,
    vatRate: 21,
    isIncluded: false
  },
  {
    id: 'lib-6',
    title: 'Delivery & Professional On-site Placement',
    description: 'Personal delivery and placement in your backyard',
    priceInclVat: 0,
    vatRate: 21,
    isIncluded: true
  }
];

// Default Template Configurations per Product Type
export const PRODUCT_TYPE_DEFAULTS = {
  'Outdoor kitchen': {
    titleLine1: 'Your outdoor kitchen,',
    titleLine2: 'custom crafted.',
    letterParagraphs: [
      'Thank you very much for your inquiry and pleasant consultation. We are delighted to present this personalized proposal for your custom outdoor kitchen.',
      'At Vanuit Ambacht, we believe in sustainable materials, artisan craftsmanship, and meticulous attention to detail. We handcraft all our outdoor kitchens in our workshop.',
      'In this document, you will find a comprehensive overview of your chosen configuration, including specifications, front-view diagram, and transparent investment.',
      'Should you have any questions or wish to make adjustments, we are delighted to assist you!'
    ],
    checklist: [
      'Fully custom build, crafted by a certified specialist craftsman',
      'Digital CAD drawing prior to approval',
      '{finish}',
      'Free delivery in {city}',
      'Full warranty and aftercare upon delivery'
    ],
    processSteps: [
      { stepNumber: 1, title: 'Proposal Approval', badgeText: '', isGratisBadge: false },
      { stepNumber: 2, title: 'Digital Drawing Confirmation', badgeText: '', isGratisBadge: false },
      { stepNumber: 3, title: 'Craftsman Production', badgeText: '{deliveryTime}', isGratisBadge: false },
      { stepNumber: 4, title: 'Delivery & Installation in {city}', badgeText: 'FREE', isGratisBadge: true },
      { stepNumber: 5, title: 'Warranty & Service', badgeText: '', isGratisBadge: false }
    ]
  },
  'Garden room': {
    titleLine1: 'Your garden room,',
    titleLine2: 'exclusively designed.',
    letterParagraphs: [
      'Thank you very much for your inquiry regarding a custom garden room.',
      'Our garden rooms are handcrafted from the finest quality timber species.',
      'Review the exact dimensions, sliding glass doors, and investment details in this overview.',
      'Please feel free to contact us for any questions or custom adjustments.'
    ],
    checklist: [
      'Fully custom timber construction',
      'Architectural blueprint beforehand',
      '{finish}',
      'Free delivery & assembly in {city}',
      '10-year warranty on timber structure'
    ],
    processSteps: [
      { stepNumber: 1, title: 'Proposal Approval', badgeText: '', isGratisBadge: false },
      { stepNumber: 2, title: 'Blueprint & Permit Check', badgeText: '', isGratisBadge: false },
      { stepNumber: 3, title: 'Prefab Production in Workshop', badgeText: '{deliveryTime}', isGratisBadge: false },
      { stepNumber: 4, title: 'Assembly in {city}', badgeText: 'FREE', isGratisBadge: true },
      { stepNumber: 5, title: 'Completion & Warranty', badgeText: '', isGratisBadge: false }
    ]
  },
  'Veranda': {
    titleLine1: 'Your wooden veranda,',
    titleLine2: 'perfectly finished.',
    letterParagraphs: [
      'Please find enclosed the custom proposal for your wooden veranda.',
      'Built sustainably to enjoy your garden across all seasons.',
      'All materials and investment specifications are detailed on the following pages.',
      'We look forward to a successful collaboration.'
    ],
    checklist: [
      'Robust timber trusses & anchoring',
      'Detailed blueprint for approval',
      '{finish}',
      'Delivery in {city}',
      'Warranty on structure & roofing'
    ],
    processSteps: [
      { stepNumber: 1, title: 'Proposal Approval', badgeText: '', isGratisBadge: false },
      { stepNumber: 2, title: 'Technical Drawing Verification', badgeText: '', isGratisBadge: false },
      { stepNumber: 3, title: 'Woodworking & Preparation', badgeText: '{deliveryTime}', isGratisBadge: false },
      { stepNumber: 4, title: 'Delivery & Assembly in {city}', badgeText: 'FREE', isGratisBadge: true },
      { stepNumber: 5, title: 'Warranty & Aftercare', badgeText: '', isGratisBadge: false }
    ]
  },
  'Poolhouse': {
    titleLine1: 'Your luxury poolhouse,',
    titleLine2: 'handcrafted to perfection.',
    letterParagraphs: [
      'We proudly present the design and proposal for your custom poolhouse.',
      'Combined with storage room, changing area, and covered patio.',
      'In this proposal, you will find all specifications and delivery schedule.',
      'Questions? We are directly at your service.'
    ],
    checklist: [
      'Exclusive design with integrated storage',
      'Digital CAD construction drawing',
      '{finish}',
      'Free delivery in {city}',
      'Full aftercare and service'
    ],
    processSteps: [
      { stepNumber: 1, title: 'Proposal Approval', badgeText: '', isGratisBadge: false },
      { stepNumber: 2, title: 'CAD Drawing Approval', badgeText: '', isGratisBadge: false },
      { stepNumber: 3, title: 'Artisan Workshop Production', badgeText: '{deliveryTime}', isGratisBadge: false },
      { stepNumber: 4, title: 'Delivery in {city}', badgeText: 'FREE', isGratisBadge: true },
      { stepNumber: 5, title: 'Completion & Warranty', badgeText: '', isGratisBadge: false }
    ]
  }
};
