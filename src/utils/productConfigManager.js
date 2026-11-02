// Centralized Dynamic Configuration Manager for Vanuit Ambacht
// Allows administrators to configure Categories, Wood Types, Materials/Countertops, and Options
// dynamically through Settings without developer intervention, with fallback to Dutch standards.

const STORAGE_KEY = 'va_product_configuration_v1';

export const DEFAULT_PRODUCT_CONFIG = {
  categories: [
    { id: 'buitenkeukens', key: 'buitenkeuken', name: 'Buitenkeukens', nameEn: 'Outdoor Kitchens', icon: '🍳', description: 'Exclusieve handgemaakte buitenkeukens op maat van massief hout.', status: 'Actief', displayOrder: 1 },
    { id: 'buitenverblijven', key: 'buitenverblijf', name: 'Buitenverblijven', nameEn: 'Garden Buildings', icon: '🏡', description: 'Duurzame luxe houten tuinkamers en buitenverblijven.', status: 'Actief', displayOrder: 2 },
    { id: 'overkappingen', key: 'overkapping', name: 'Overkappingen', nameEn: 'Canopies', icon: '☂️', description: 'Vrijstaande of aangebouwde houten veranda\'s en overkappingen.', status: 'Actief', displayOrder: 3 },
    { id: 'snijplanken', key: 'snijplanken', name: 'Snijplanken & Accessoires', nameEn: 'Cutting Boards', icon: '🔪', description: 'Kopshouten en langshouten snijplanken van premium hout.', status: 'Actief', displayOrder: 4 },
    { id: 'poolhouses', key: 'poolhouse', name: 'Poolhouses', nameEn: 'Poolhouses', icon: '🏊', description: 'Luxe poolhouse bijgebouwen met berging of kleedruimte.', status: 'Actief', displayOrder: 5 }
  ],
  woodTypes: [
    {
      id: 'thermo_frake',
      name: 'Thermo Fraké',
      nameEn: 'Thermo Fraké Wood',
      lifespan: '20 tot 25 jaar',
      lifespanEn: '20 to 25 years',
      description: 'Thermisch veredeld Fraké: vormstabiel, noestvrij, met een warme goudbruine tint en prachtige vlamtekening.',
      descriptionEn: 'Thermally modified Fraké: dimensionally stable, knot-free, warm golden brown tone.',
      infoboxTitle: 'Over Thermo Fraké',
      status: 'Actief',
      displayOrder: 1
    },
    {
      id: 'eikenhout',
      name: 'Eikenhout',
      nameEn: 'Oak Wood',
      lifespan: '20 tot 25 jaar',
      lifespanEn: '20 to 25 years',
      description: 'Klassiek Europees eiken met een robuuste uitstraling en karakteristieke noesten en spiegels.',
      descriptionEn: 'Classic European oak with a robust aesthetic, distinctive grain and knots.',
      infoboxTitle: 'Over Eikenhout',
      status: 'Actief',
      displayOrder: 2
    },
    {
      id: 'douglas',
      name: 'Douglas',
      nameEn: 'Douglas Timber',
      lifespan: '10 tot 15 jaar',
      lifespanEn: '10 to 15 years',
      description: 'Warmroze en taai naaldhout. Ideaal voor beschutte buitenopstellingen en veranda\'s.',
      descriptionEn: 'Warm pinkish durable softwood. Ideal for sheltered setups and canopies.',
      infoboxTitle: 'Over Douglas',
      status: 'Actief',
      displayOrder: 3
    },
    {
      id: 'massief_teak',
      name: 'Massief Teak',
      nameEn: 'Solid Teak Wood',
      lifespan: '25+ jaar',
      lifespanEn: '25+ years',
      description: 'Het koningshout voor buiten: rijk aan natuurlijke oliën, extreem weerbestendig en vergrijst schitterend.',
      descriptionEn: 'The premier timber for outdoors: rich in natural oils, extremely weather-resistant.',
      infoboxTitle: 'Over Massief Teak',
      status: 'Actief',
      displayOrder: 4
    },
    {
      id: 'barnwood',
      name: 'Barnwood',
      nameEn: 'Barnwood Timber',
      lifespan: '20 tot 25 jaar',
      lifespanEn: '20 to 25 years',
      description: 'Authentiek doorleefd hout afkomstig van oude alpenboerderijen. Elk meubel heeft een unieke geschiedenis.',
      descriptionEn: 'Authentic reclaimed timber from historic alpine barns. Every piece is unique.',
      infoboxTitle: 'Over Barnwood',
      status: 'Actief',
      displayOrder: 5
    },
    {
      id: 'padouk',
      name: 'Padouk',
      nameEn: 'Padouk',
      lifespan: '20 tot 25 jaar',
      lifespanEn: '20 to 25 years',
      description: 'Uitzonderlijk stabiel tropisch hardhout. Start koraalrood en vergrijst gelijkmatig naar zilvergrijs.',
      descriptionEn: 'Exceptionally stable hardwood. Starts coral-red, weathers to warm silver-grey.',
      infoboxTitle: 'Over Padouk',
      status: 'Actief',
      displayOrder: 6
    }
  ],
  materials: [
    {
      id: 'beton_cire',
      name: 'Zwart Polijst Beton Ciré (8cm)',
      nameEn: 'Black Polished Concrete Cire (8cm)',
      description: 'Naadloos watervast microcement met een moderne industriële look.',
      status: 'Actief',
      displayOrder: 1
    },
    {
      id: 'belgisch_hardsteen',
      name: 'Belgisch Hardsteen',
      nameEn: 'Belgian Hardstone Granite',
      description: 'Klassiek natuursteen met subtiele fossielen, gezoet voor buitengebruik.',
      status: 'Actief',
      displayOrder: 2
    },
    {
      id: 'massief_hout_top',
      name: 'Massief Houten Bovenblad',
      nameEn: 'Solid Wooden Top with Ceramic Stones',
      description: 'Houten werkblad met keramische stenen en 2-componenten olieafwerking.',
      status: 'Actief',
      displayOrder: 3
    },
    {
      id: 'rvs_top',
      name: 'RVS Geborsteld Werkblad',
      nameEn: 'Stainless Steel Top',
      description: 'Hygiënisch, hittebestendig en bestand tegen alle weersinvloeden.',
      status: 'Actief',
      displayOrder: 4
    },
    {
      id: 'keramiek',
      name: 'Keramisch Werkblad',
      nameEn: 'Ceramic Countertop',
      description: 'Volledig kras-, vlek- en hittebestendig composiet keramiek.',
      status: 'Actief',
      displayOrder: 5
    }
  ],
  options: [
    {
      id: 'bbq_kamado',
      name: 'Kamado BBQ Inbouw (Uitsparing)',
      nameEn: 'Kamado BBQ Cutout',
      category: 'Koken',
      description: 'Op maat gemaakte hittebestendige uitsparing voor Big Green Egg, Kamado Joe of The Bastard.',
      status: 'Actief',
      displayOrder: 1
    },
    {
      id: 'rvs_spoelbak',
      name: 'RVS Spoelbak & Zwarte Mengkraan',
      nameEn: 'Stainless Steel Sink & Mixer Tap',
      category: 'Water',
      description: 'Inclusief watervaste aansluitset en sifon voor tuinslangaansluiting.',
      status: 'Actief',
      displayOrder: 2
    },
    {
      id: 'buiten_koelkast',
      name: 'Outdoor RVS Koelkast (80L)',
      nameEn: 'Outdoor Stainless Fridge (80L)',
      category: 'Koelen',
      description: 'Geïntegreerde compressor koelkast bestand tegen buitentemperaturen.',
      status: 'Actief',
      displayOrder: 3
    },
    {
      id: 'led_verlichting',
      name: 'Geïntegreerde LED Verlichting',
      nameEn: 'Integrated LED Lighting',
      category: 'Elektra',
      description: 'Warmwit waterdicht LED-profiel onder het werkblad of overstek.',
      status: 'Actief',
      displayOrder: 4
    },
    {
      id: 'zwenkwielen',
      name: 'Zwaarlast Zwenkwielen Set',
      nameEn: 'Heavy Duty Caster Wheels Set',
      category: 'Mobiel',
      description: '4x dubbel geremde industriële wielen voor flexibele plaatsing op het terras.',
      status: 'Actief',
      displayOrder: 5
    }
  ]
};

// Safely load configuration from localStorage or initialize with defaults
export function getProductConfig() {
  if (typeof window === 'undefined') return DEFAULT_PRODUCT_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCT_CONFIG));
      return DEFAULT_PRODUCT_CONFIG;
    }
    const parsed = JSON.parse(raw);
    return {
      categories: Array.isArray(parsed.categories) && parsed.categories.length > 0 ? parsed.categories : DEFAULT_PRODUCT_CONFIG.categories,
      woodTypes: Array.isArray(parsed.woodTypes) && parsed.woodTypes.length > 0 ? parsed.woodTypes : DEFAULT_PRODUCT_CONFIG.woodTypes,
      materials: Array.isArray(parsed.materials) && parsed.materials.length > 0 ? parsed.materials : DEFAULT_PRODUCT_CONFIG.materials,
      options: Array.isArray(parsed.options) && parsed.options.length > 0 ? parsed.options : DEFAULT_PRODUCT_CONFIG.options
    };
  } catch (err) {
    console.warn('Failed to parse product configuration, using defaults:', err);
    return DEFAULT_PRODUCT_CONFIG;
  }
}

// Persist updated configuration and notify other listeners
export function saveProductConfig(newConfig) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    window.dispatchEvent(new CustomEvent('app_product_config_changed', { detail: newConfig }));
    window.dispatchEvent(new Event('app_data_changed'));
  } catch (err) {
    console.error('Failed to save product configuration:', err);
  }
}

// Get Active Categories
export function getActiveCategories() {
  const config = getProductConfig();
  return (config.categories || []).filter(c => c.status !== 'Inactief');
}

// Get Active Wood Types
export function getActiveWoodTypes() {
  const config = getProductConfig();
  return (config.woodTypes || []).filter(w => w.status !== 'Inactief');
}

// Get Active Materials
export function getActiveMaterials() {
  const config = getProductConfig();
  return (config.materials || []).filter(m => m.status !== 'Inactief');
}

// Get Active Options
export function getActiveOptions() {
  const config = getProductConfig();
  return (config.options || []).filter(o => o.status !== 'Inactief');
}

// Helper to convert dynamic wood types to WOOD_LIBRARY format expected by QuoteEditor & PDF
export function getWoodLibraryForSchema(language = 'NL') {
  const woodTypes = getActiveWoodTypes();
  return woodTypes.map(w => ({
    id: w.id,
    name: w.name,
    lifespan: language === 'EN' ? (w.lifespanEn || w.lifespan) : w.lifespan,
    infoboxTitle: language === 'EN' ? `About ${w.nameEn || w.name}` : `Over ${w.name}`,
    infoboxText: language === 'EN' ? (w.descriptionEn || w.description) : w.description
  }));
}

