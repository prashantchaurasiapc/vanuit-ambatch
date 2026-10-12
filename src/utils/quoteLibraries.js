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
  const norm = (str) => String(str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const match = WOOD_LIBRARY.find(w => norm(w.name) === norm(woodName));
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

// Default Template Configurations per Product Type (Language-Aware)
export const PRODUCT_TYPE_DEFAULTS_NL = {
  'Outdoor kitchen': {
    titleLine1: 'Uw buitenkeuken,',
    titleLine2: 'op maat gemaakt.',
    letterParagraphs: [
      'Hartelijk dank voor je aanvraag en het prettige gesprek. Met veel plezier presenteren wij deze persoonlijke offerte voor jouw maatwerk buitenkeuken.',
      'Bij Vanuit Ambacht geloven we in duurzame materialen, ambachtelijke afwerking en oog voor detail. Wij maken al onze buitenkeukens met de hand in onze werkplaats.',
      'In dit document vind je het volledige overzicht van jouw gekozen configuratie, inclusief specificaties, vooraanzicht tekening en transparante investering.',
      'Heb je vragen of wens je nog aanpassingen? Wij denken graag met je mee!'
    ],
    checklist: [
      'Volledig maatwerk, vervaardigd door een gecertificeerd meubelmaker',
      'Digitale CAD-tekening vooraf ter goedkeuring',
      '{finish}',
      'Gratis bezorging in {city}',
      'Volledige garantie en nazorg na oplevering'
    ],
    processSteps: [
      { stepNumber: 1, title: 'Akkoord op offerte', badgeText: '', isGratisBadge: false },
      { stepNumber: 2, title: 'Bevestiging technische tekening', badgeText: '', isGratisBadge: false },
      { stepNumber: 3, title: 'Ambachtelijke productie werkplaats', badgeText: '{deliveryTime}', isGratisBadge: false },
      { stepNumber: 4, title: 'Bezorging & montage in {city}', badgeText: 'GRATIS', isGratisBadge: true },
      { stepNumber: 5, title: 'Garantie & nazorg', badgeText: '', isGratisBadge: false }
    ],
    configuration: {
      dimensions: '240 × 80',
      dimensionsUnit: 'centimeter',
      woodType: 'Thermo Fraké',
      woodLifespan: '20 tot 25 jaar',
      optionsTitle: 'Big Green Egg Large',
      optionsSubtext: 'Large, rechts van het midden',
      deliveryTime: '3 tot 5 weken',
      deliverySubtext: 'na akkoord op tekening',
      options: {
        bbqCutout: { enabled: true, type: 'Big Green Egg' },
        fridge: { enabled: false },
        sink: { enabled: false }
      },
      infobox: {
        show: true,
        title: 'Over Thermo Fraké',
        text: 'Thermisch behandeld Fraké: vormstabiel, duurzaam en met een warme, diepe kleur. Gaat 20 tot 25 jaar mee en veroudert prachtig grijs.'
      },
      specifications: [
        {
          id: 'sec-1',
          title: 'BOVENBLAD',
          lines: [
            { id: 'l1', text: 'Keramische stenen in het werkblad – hittebestendig en onderhoudsarm' },
            { id: 'l2', text: 'Uitsparing op maat voor Big Green Egg Large' }
          ]
        },
        {
          id: 'sec-2',
          title: 'INDELING & OPBERGRUIMTE',
          lines: [
            { id: 'l3', text: 'Twee ruime opbergvakken met deurtjes en soft-close scharnieren' },
            { id: 'l4', text: 'Open schap voor houtopslag' }
          ]
        },
        {
          id: 'sec-3',
          title: 'AFWERKING & MOBILITEIT',
          lines: [
            { id: 'l5', text: 'Olieafwerking in twee lagen (naturel)' },
            { id: 'l6', text: 'Verborgen heavy-duty zwenkwielen voor eenvoudige verplaatsing' }
          ]
        },
        {
          id: 'sec-4',
          title: 'BEZORGING',
          lines: [
            { id: 'l7', text: 'Gratis bezorgd op een moment dat jou uitkomt' }
          ]
        }
      ]
    },
    lineItems: [
      {
        id: 'ok-1',
        title: 'Buitenkeuken Thermo Fraké · 240 × 80 cm',
        description: 'Houten bovenblad met keramische stenen en uitsparing voor Big Green Egg Large, afgewerkt met twee lagen olie (naturel)',
        priceInclVat: 3495,
        vatRate: 21,
        isIncluded: false,
        quantity: 1
      },
      {
        id: 'ok-2',
        title: 'Bezorging en Plaatsing op locatie',
        description: 'Geleverd en vakkundig opgesteld op uw terras',
        priceInclVat: 0,
        vatRate: 21,
        isIncluded: true,
        quantity: 1
      }
    ]
  },
  'Garden room': {
    titleLine1: 'Uw exclusief buitenverblijf,',
    titleLine2: 'exclusief ontworpen.',
    letterParagraphs: [
      'Hartelijk dank voor je aanvraag voor een exclusief maatwerk buitenverblijf.',
      'Onze buitenverblijven worden met de hand gebouwd van hoogwaardige houtsoorten en materialen.',
      'In deze offerte vind je de exacte specificaties, afmetingen en investering voor jouw tuinkamer.',
      'Aarzel niet om contact op te nemen voor aanvullende wensen of aanpassingen.'
    ],
    checklist: [
      'Volledig maatwerk houtconstructie',
      'Bouwkundige tekening vooraf ter goedkeuring',
      'Hoogwaardige EPDM dakbedekking',
      'Gratis bezorging & montage in {city}',
      '10 jaar garantie op de houtconstructie'
    ],
    processSteps: [
      { stepNumber: 1, title: 'Akkoord op offerte', badgeText: '', isGratisBadge: false },
      { stepNumber: 2, title: 'Bouwtekening & vergunningscheck', badgeText: '', isGratisBadge: false },
      { stepNumber: 3, title: 'Prefab productie in werkplaats', badgeText: '{deliveryTime}', isGratisBadge: false },
      { stepNumber: 4, title: 'Bezorging & montage in {city}', badgeText: 'GRATIS', isGratisBadge: true },
      { stepNumber: 5, title: 'Oplevering & garantie', badgeText: '', isGratisBadge: false }
    ],
    configuration: {
      dimensions: '600 × 350',
      dimensionsUnit: 'centimeter (LxB)',
      woodType: 'Douglas geschaafd',
      woodLifespan: '15 tot 20 jaar',
      optionsTitle: 'Glazen schuifwand & EPDM',
      optionsSubtext: '4-rail gehard veiligheidsglas',
      deliveryTime: '6 tot 8 weken',
      deliverySubtext: 'na akkoord op bouwtekening',
      roofType: 'Plat dak met EPDM',
      roofSubtext: 'Inclusief aluminium daktrim & afvoer',
      wallType: 'Glazen schuifwanden (4-rail)',
      floorType: 'Geen vloer (op terras)',
      foundationType: 'Betonpoeren met stelplaat',
      infobox: {
        show: true,
        title: 'Over Douglas Hout',
        text: 'Douglas hout is een van de hardste en meest duurzame Europese naaldhoutsoorten. Onbehandeld heeft het een levensduur van 10 tot 15 jaar, behandeld tot meer dan 20 jaar.'
      },
      specifications: [
        {
          id: 'sec-1',
          title: 'DAKCONSTRUCTIE',
          lines: [
            { id: 'l1', text: 'Plat dak voorzien van hoogwaardige EPDM dakbedekking en aluminium daktrim' },
            { id: 'l2', text: 'Zware Douglas balklaag (75 × 200 mm) en vellingdelen dakbeschot' }
          ]
        },
        {
          id: 'sec-2',
          title: 'CONSTRUCTIE & WANDEN',
          lines: [
            { id: 'l3', text: 'Robuuste staanders van 150 × 150 mm geschaafd Douglas' },
            { id: 'l4', text: 'Zweeds rabat zwarte achter- en zijwanden voor optimale privacy' }
          ]
        },
        {
          id: 'sec-3',
          title: 'GLASWANDEN & AFWERKING',
          lines: [
            { id: 'l5', text: 'Luxe 4-rail glazen schuifwandsysteem van 10 mm gehard veiligheidsglas' },
            { id: 'l6', text: 'Betonpoeren met stelplaat voor solide vorstvrije fundering' }
          ]
        },
        {
          id: 'sec-4',
          title: 'LEVERING & MONTAGE',
          lines: [
            { id: 'l7', text: 'Prefab voorbereiding in werkplaats en vakkundige montage op locatie' }
          ]
        }
      ]
    },
    lineItems: [
      {
        id: 'gr-1',
        title: 'Maatwerk Buitenverblijf / Garden Room 600 × 350 cm',
        description: 'Robuuste Douglas staanders (150x150mm), EPDM dakbedekking met daktrim en zwarte rabatwanden',
        priceInclVat: 8950,
        vatRate: 21,
        isIncluded: false,
        quantity: 1
      },
      {
        id: 'gr-2',
        title: 'Glazen Schuifwandsysteem (4-rail)',
        description: '10mm gehard veiligheidsglas incl. tochtborstels en aluminium geleideprofielen',
        priceInclVat: 1950,
        vatRate: 21,
        isIncluded: false,
        quantity: 1
      },
      {
        id: 'gr-3',
        title: 'Levering en Vakkundige Montage op locatie',
        description: 'Inclusief stelpoeren, professionele plaatsing en waterpas oplevering',
        priceInclVat: 0,
        vatRate: 21,
        isIncluded: true,
        quantity: 1
      }
    ]
  },
  'Veranda': {
    titleLine1: 'Uw houten veranda,',
    titleLine2: 'perfect afgewerkt.',
    letterParagraphs: [
      'Bijgaand ontvangt u het maatwerk voorstel voor uw houten veranda.',
      'Duurzaam gebouwd om in alle seizoenen van uw tuin te kunnen genieten.',
      'Alle materialen en investeringsdetails staan vermeld op de volgende pagina’s.',
      'Wij zien uit naar een prettige samenwerking.'
    ],
    checklist: [
      'Robuuste houtconstructie & veilige verankering',
      'Gedetailleerde werktekening ter goedkeuring',
      '{finish}',
      'Gratis bezorging in {city}',
      'Garantie op constructie en dak'
    ],
    processSteps: [
      { stepNumber: 1, title: 'Akkoord op offerte', badgeText: '', isGratisBadge: false },
      { stepNumber: 2, title: 'Technische tekening controle', badgeText: '', isGratisBadge: false },
      { stepNumber: 3, title: 'Houtbewerking & voorbereiding', badgeText: '{deliveryTime}', isGratisBadge: false },
      { stepNumber: 4, title: 'Bezorging & montage in {city}', badgeText: 'GRATIS', isGratisBadge: true },
      { stepNumber: 5, title: 'Garantie & nazorg', badgeText: '', isGratisBadge: false }
    ]
  },
  'Poolhouse': {
    titleLine1: 'Uw luxe poolhouse,',
    titleLine2: 'ambachtelijk gerealiseerd.',
    letterParagraphs: [
      'Met trots presenteren wij het ontwerp en voorstel voor uw maatwerk poolhouse.',
      'Gecombineerd met berging, kleedruimte en overdekt terras.',
      'In deze offerte vindt u alle specificaties en opleveringsplanning.',
      'Vragen? Wij staan direct tot uw dienst.'
    ],
    checklist: [
      'Exclusief ontwerp met geïntegreerde berging',
      'Digitale CAD constructietekening',
      '{finish}',
      'Gratis bezorging in {city}',
      'Volledige nazorg en service'
    ],
    processSteps: [
      { stepNumber: 1, title: 'Akkoord op offerte', badgeText: '', isGratisBadge: false },
      { stepNumber: 2, title: 'Goedkeuring CAD-tekening', badgeText: '', isGratisBadge: false },
      { stepNumber: 3, title: 'Ambachtelijke werkplaatsproductie', badgeText: '{deliveryTime}', isGratisBadge: false },
      { stepNumber: 4, title: 'Bezorging & montage in {city}', badgeText: 'GRATIS', isGratisBadge: true },
      { stepNumber: 5, title: 'Oplevering & garantie', badgeText: '', isGratisBadge: false }
    ]
  }
};

export const PRODUCT_TYPE_DEFAULTS_EN = {
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
    ],
    configuration: {
      dimensions: '240 × 80',
      dimensionsUnit: 'centimeters',
      woodType: 'Thermo Fraké',
      woodLifespan: '20 to 25 years',
      optionsTitle: 'Big Green Egg Large',
      optionsSubtext: 'Large, right of center',
      deliveryTime: '3 to 5 weeks',
      deliverySubtext: 'upon drawing approval',
      options: {
        bbqCutout: { enabled: true, type: 'Big Green Egg' },
        fridge: { enabled: false },
        sink: { enabled: false }
      },
      infobox: {
        show: true,
        title: 'About Thermo Fraké',
        text: 'Thermally treated Fraké: dimensionally stable, durable, with a warm, deep color. Lasts 20 to 25 years and ages gracefully into silver-grey.'
      },
      specifications: [
        {
          id: 'sec-1',
          title: 'WORKTOP',
          lines: [
            { id: 'l1', text: 'Ceramic stones in worktop – heat-resistant and low maintenance' },
            { id: 'l2', text: 'Custom cutout engineered for Big Green Egg Large' }
          ]
        },
        {
          id: 'sec-2',
          title: 'LAYOUT & STORAGE',
          lines: [
            { id: 'l3', text: 'Two spacious storage compartments with doors and soft-close hinges' },
            { id: 'l4', text: 'Open shelf for wood storage' }
          ]
        },
        {
          id: 'sec-3',
          title: 'FINISH & MOBILITY',
          lines: [
            { id: 'l5', text: 'Two-layer protective oil finish (natural)' },
            { id: 'l6', text: 'Hidden heavy-duty swivel castors for easy mobility' }
          ]
        },
        {
          id: 'sec-4',
          title: 'DELIVERY',
          lines: [
            { id: 'l7', text: 'Free delivery scheduled at your convenience' }
          ]
        }
      ]
    },
    lineItems: [
      {
        id: 'ok-1',
        title: 'Outdoor Kitchen Thermo Fraké · 240 × 80 cm',
        description: 'Wooden worktop with ceramic stones and cutout for Big Green Egg Large, finished with two layers of natural oil',
        priceInclVat: 3495,
        vatRate: 21,
        isIncluded: false,
        quantity: 1
      },
      {
        id: 'ok-2',
        title: 'Delivery and Placement on Location',
        description: 'Delivered and professionally set up on your terrace',
        priceInclVat: 0,
        vatRate: 21,
        isIncluded: true,
        quantity: 1
      }
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
      'High-grade EPDM roof covering',
      'Free delivery & assembly in {city}',
      '10-year warranty on timber structure'
    ],
    processSteps: [
      { stepNumber: 1, title: 'Proposal Approval', badgeText: '', isGratisBadge: false },
      { stepNumber: 2, title: 'Blueprint & Permit Check', badgeText: '', isGratisBadge: false },
      { stepNumber: 3, title: 'Prefab Production in Workshop', badgeText: '{deliveryTime}', isGratisBadge: false },
      { stepNumber: 4, title: 'Assembly in {city}', badgeText: 'FREE', isGratisBadge: true },
      { stepNumber: 5, title: 'Completion & Warranty', badgeText: '', isGratisBadge: false }
    ],
    configuration: {
      dimensions: '600 × 350',
      dimensionsUnit: 'centimeters (LxW)',
      woodType: 'Planed Douglas',
      woodLifespan: '15 to 20 years',
      optionsTitle: 'Glass sliding wall & EPDM',
      optionsSubtext: '4-track tempered safety glass',
      deliveryTime: '6 to 8 weeks',
      deliverySubtext: 'upon blueprint approval',
      roofType: 'Flat roof with EPDM',
      roofSubtext: 'Includes aluminum roof trim & drainage',
      wallType: 'Glass sliding walls (4-track)',
      floorType: 'No floor (on terrace)',
      foundationType: 'Concrete piers with leveling plate',
      infobox: {
        show: true,
        title: 'About Douglas Wood',
        text: 'Douglas wood is one of the hardest and most durable European softwoods. Untreated it has a lifespan of 10 to 15 years, treated more than 20 years.'
      },
      specifications: [
        {
          id: 'sec-1',
          title: 'ROOF CONSTRUCTION',
          lines: [
            { id: 'l1', text: 'Flat roof equipped with high-grade EPDM roofing and aluminum roof trim' },
            { id: 'l2', text: 'Heavy Douglas beam layer (75 × 200 mm) and tongue-and-groove roof boarding' }
          ]
        },
        {
          id: 'sec-2',
          title: 'CONSTRUCTION & WALLS',
          lines: [
            { id: 'l3', text: 'Robust 150 × 150 mm planed Douglas posts' },
            { id: 'l4', text: 'Swedish rebate black back and side walls for optimal privacy' }
          ]
        },
        {
          id: 'sec-3',
          title: 'GLASS WALLS & FINISH',
          lines: [
            { id: 'l5', text: 'Luxury 4-track glass sliding wall system with 10 mm tempered safety glass' },
            { id: 'l6', text: 'Concrete piers with leveling plate for solid frost-free foundation' }
          ]
        },
        {
          id: 'sec-4',
          title: 'DELIVERY & INSTALLATION',
          lines: [
            { id: 'l7', text: 'Prefab preparation in workshop and professional on-site installation' }
          ]
        }
      ]
    },
    lineItems: [
      {
        id: 'gr-1',
        title: 'Custom Garden Room 600 × 350 cm',
        description: 'Robust Douglas posts (150x150mm), EPDM roofing with roof trim and black rebate walls',
        priceInclVat: 8950,
        vatRate: 21,
        isIncluded: false,
        quantity: 1
      },
      {
        id: 'gr-2',
        title: 'Glass Sliding Wall System (4-track)',
        description: '10mm tempered safety glass incl. draft brushes and aluminum guide profiles',
        priceInclVat: 1950,
        vatRate: 21,
        isIncluded: false,
        quantity: 1
      },
      {
        id: 'gr-3',
        title: 'Delivery and Professional Installation on Location',
        description: 'Including concrete piers, professional installation and level delivery',
        priceInclVat: 0,
        vatRate: 21,
        isIncluded: true,
        quantity: 1
      }
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

// Default export uses English or Dutch based on helper
export function getProductTypeDefaults(productType, language = 'NL') {
  const lang = String(language).toUpperCase();
  const dict = lang === 'EN' ? PRODUCT_TYPE_DEFAULTS_EN : PRODUCT_TYPE_DEFAULTS_NL;
  return dict[productType] || dict['Outdoor kitchen'];
}

// Backwards compatibility default export
export const PRODUCT_TYPE_DEFAULTS = PRODUCT_TYPE_DEFAULTS_NL;

