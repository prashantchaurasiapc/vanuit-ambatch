// Central Pure Translation Utility Helper
// Maps hardcoded database/mockData strings to 100% Pure English and Pure Dutch

const DICTIONARY = {
  // Statuses
  'Nieuw': { EN: 'New', NL: 'Nieuw' },
  'New': { EN: 'New', NL: 'Nieuw' },
  'In gesprek': { EN: 'In Discussion', NL: 'In gesprek' },
  'In Conversation': { EN: 'In Discussion', NL: 'In gesprek' },
  'In Discussion': { EN: 'In Discussion', NL: 'In gesprek' },
  'Bericht verstuurd': { EN: 'Message Sent', NL: 'Bericht verstuurd' },
  'Message Sent': { EN: 'Message Sent', NL: 'Bericht verstuurd' },
  'Offerte verstuurd': { EN: 'Quote Sent', NL: 'Offerte verstuurd' },
  'Quote Sent': { EN: 'Quote Sent', NL: 'Offerte verstuurd' },
  'Offerte akkoord': { EN: 'Quote Accepted', NL: 'Offerte akkoord' },
  'Quote Accepted': { EN: 'Quote Accepted', NL: 'Offerte akkoord' },
  'Gewonnen': { EN: 'Won', NL: 'Gewonnen' },
  'Won': { EN: 'Won', NL: 'Gewonnen' },
  'Verloren': { EN: 'Lost', NL: 'Verloren' },
  'Lost': { EN: 'Lost', NL: 'Verloren' },
  'Actief': { EN: 'Active', NL: 'Actief' },
  'Active': { EN: 'Active', NL: 'Actief' },
  'Inactief': { EN: 'Inactive', NL: 'Inactief' },
  'Inactive': { EN: 'Inactive', NL: 'Inactief' },
  'In uitvoering': { EN: 'In Progress', NL: 'In uitvoering' },
  'In Progress': { EN: 'In Progress', NL: 'In uitvoering' },
  'Afgerond': { EN: 'Completed', NL: 'Afgerond' },
  'Completed': { EN: 'Completed', NL: 'Afgerond' },
  'Concept': { EN: 'Draft', NL: 'Concept' },
  'Draft': { EN: 'Draft', NL: 'Concept' },
  'Geaccepteerd': { EN: 'Accepted', NL: 'Geaccepteerd' },
  'Accepted': { EN: 'Accepted', NL: 'Geaccepteerd' },
  'Betaald': { EN: 'Paid', NL: 'Betaald' },
  'Paid': { EN: 'Paid', NL: 'Betaald' },
  'Openstaand': { EN: 'Outstanding', NL: 'Openstaand' },
  'Outstanding': { EN: 'Outstanding', NL: 'Openstaand' },
  'Verlopen': { EN: 'Expired', NL: 'Verlopen' },
  'Expired': { EN: 'Expired', NL: 'Verlopen' },

  // Workload
  'Beschikbaar': { EN: 'Available', NL: 'Beschikbaar' },
  'Available': { EN: 'Available', NL: 'Beschikbaar' },
  'Druk': { EN: 'Busy', NL: 'Druk' },
  'Busy': { EN: 'Busy', NL: 'Druk' },
  'Volgeboekt': { EN: 'Fully Booked', NL: 'Volgeboekt' },
  'Fully Booked': { EN: 'Fully Booked', NL: 'Volgeboekt' },

  // Product Categories
  'buitenkeuken': { EN: 'Outdoor Kitchen', NL: 'Buitenkeuken' },
  'Buitenkeuken': { EN: 'Outdoor Kitchen', NL: 'Buitenkeuken' },
  'Buitenkeukens': { EN: 'Outdoor Kitchens', NL: 'Buitenkeukens' },
  'Outdoor Kitchen': { EN: 'Outdoor Kitchen', NL: 'Buitenkeuken' },
  'Outdoor Kitchens': { EN: 'Outdoor Kitchens', NL: 'Buitenkeukens' },
  'overkapping': { EN: 'Canopy', NL: 'Overkapping' },
  'Overkapping': { EN: 'Canopy', NL: 'Overkapping' },
  'Overkappingen': { EN: 'Canopies', NL: 'Overkappingen' },
  'Canopy': { EN: 'Canopy', NL: 'Overkapping' },
  'Canopies': { EN: 'Canopies', NL: 'Overkappingen' },
  'poolhouse': { EN: 'Poolhouse', NL: 'Poolhouse' },
  'Poolhouse': { EN: 'Poolhouse', NL: 'Poolhouse' },
  'kliko': { EN: 'Bin Storage', NL: 'Kliko-ombouw' },
  'Kliko-ombouw': { EN: 'Bin Storage', NL: 'Kliko-ombouw' },
  'Bin Storage': { EN: 'Bin Storage', NL: 'Kliko-ombouw' },
  'buitenverblijf': { EN: 'Garden Room', NL: 'Buitenverblijf' },
  'Buitenverblijf': { EN: 'Garden Room', NL: 'Buitenverblijf' },
  'Buitenverblijven': { EN: 'Garden Rooms', NL: 'Buitenverblijven' },
  'Outdoor Living': { EN: 'Outdoor Kitchen', NL: 'Buitenkeuken' },
  'Garden Room': { EN: 'Garden Room', NL: 'Buitenverblijf' },
  'Garden Rooms': { EN: 'Garden Rooms', NL: 'Buitenverblijven' },
  'terras': { EN: 'Terrace & Decking', NL: 'Terrassen' },
  'Terrassen': { EN: 'Terrace & Decking', NL: 'Terrassen' },
  'Terraces': { EN: 'Terrace & Decking', NL: 'Terrassen' },
  'Snijplanken': { EN: 'Cutting Boards', NL: 'Snijplanken' },
  'Cutting Boards': { EN: 'Cutting Boards', NL: 'Snijplanken' },

  // Task Types
  'Locatiebezoek': { EN: 'Site Visit', NL: 'Locatiebezoek' },
  'Site Visit': { EN: 'Site Visit', NL: 'Locatiebezoek' },
  'Levering': { EN: 'Delivery', NL: 'Levering' },
  'Delivery': { EN: 'Delivery', NL: 'Levering' },
  'Montage': { EN: 'Assembly / Installation', NL: 'Montage' },
  'Assembly': { EN: 'Assembly / Installation', NL: 'Montage' },
  'Inspectie': { EN: 'Inspection', NL: 'Inspectie' },
  'Inspection': { EN: 'Inspection', NL: 'Inspectie' },

  // Lead Sources
  'Google Ads': { EN: 'Google Ads', NL: 'Google Ads' },
  'Facebook': { EN: 'Facebook', NL: 'Facebook' },
  'Meta Ads': { EN: 'Meta Ads', NL: 'Meta Ads' },
  'Direct': { EN: 'Direct', NL: 'Direct' },
  'Referral': { EN: 'Referral', NL: 'Referral' }
};

export function tValue(value, language = 'EN') {
  if (!value) return '';
  const strVal = String(value).trim();
  if (DICTIONARY[strVal]) {
    return DICTIONARY[strVal][language] || DICTIONARY[strVal].EN || strVal;
  }
  return strVal;
}

// ============================================================================
// COMPREHENSIVE BIDIRECTIONAL LOCALIZATION HELPERS (EN <-> NL)
// ============================================================================

const norm = (str) =>
  String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

// 1. Wood Types
export function getDisplayWoodType(wood, language = 'EN') {
  if (!wood) return language === 'EN' ? 'Thermo Fraké' : 'Thermo Fraké';
  const n = norm(wood);
  const lang = String(language).toUpperCase();

  if (n === 'douglas geschaafd' || n === 'planed douglas' || n === 'douglas planed') {
    return lang === 'NL' ? 'Douglas geschaafd' : 'Planed Douglas';
  }
  if (n === 'douglas onbehandeld' || n === 'untreated douglas') {
    return lang === 'NL' ? 'Douglas onbehandeld' : 'Untreated Douglas';
  }
  if (n === 'douglas') {
    return 'Douglas';
  }
  if (n === 'thermo frake') {
    return 'Thermo Fraké';
  }
  if (n === 'padouk') {
    return 'Padouk';
  }
  if (n === 'eiken' || n === 'eikenhout' || n === 'oak') {
    return lang === 'NL' ? 'Eikenhout' : 'Oak';
  }
  if (n === 'accoya') {
    return 'Accoya';
  }
  if (n === 'overig hout' || n === 'custom wood' || n === 'maatwerk hout' || n === 'wood type' || n === 'houtsoort') {
    return lang === 'NL' ? 'Maatwerk Hout' : 'Custom Wood';
  }
  return wood;
}

// 2. Options Title (Cutout / Roof / Sliding glass)
export function getDisplayOptionsTitle(val, language = 'EN') {
  if (!val) return language === 'EN' ? 'Big Green Egg Large' : 'Big Green Egg Large';
  const n = norm(val);
  const lang = String(language).toUpperCase();

  if (n === 'glazen schuifwand & epdm' || n === 'glass sliding wall & epdm') {
    return lang === 'NL' ? 'Glazen schuifwand & EPDM' : 'Glass sliding wall & EPDM';
  }
  if (n === 'plat dak met epdm' || n === 'flat roof with epdm') {
    return lang === 'NL' ? 'Plat dak met EPDM' : 'Flat roof with EPDM';
  }
  if (
    n === 'plat dak met epdm & aluminium daktrim' ||
    n === 'flat roof with epdm & aluminum roof trim'
  ) {
    return lang === 'NL'
      ? 'Plat dak met EPDM & aluminium daktrim'
      : 'Flat roof with EPDM & aluminum roof trim';
  }
  if (
    n === 'zadeldak met dakpannen' ||
    n === 'zadeldak met keramische pannen' ||
    n === 'gabled roof with ceramic tiles'
  ) {
    return lang === 'NL' ? 'Zadeldak met dakpannen' : 'Gabled roof with ceramic tiles';
  }
  if (
    n === 'kapschuur model' ||
    n === 'kapschuur model (asymmetrisch dak)' ||
    n === 'barn model (asymmetric roof)'
  ) {
    return lang === 'NL' ? 'Kapschuur model' : 'Barn model (asymmetric roof)';
  }
  if (n === 'lessenaarsdak met epdm' || n === 'pent roof with epdm') {
    return lang === 'NL' ? 'Lessenaarsdak met EPDM' : 'Pent roof with EPDM';
  }
  if (
    n === 'glazen dakconstructie' ||
    n === 'glazen overkapping / veranda dak' ||
    n === 'glass canopy / veranda roof'
  ) {
    return lang === 'NL' ? 'Glazen overkapping / veranda dak' : 'Glass canopy / veranda roof';
  }
  if (n === 'standaard werkblad' || n === 'standard worktop') {
    return lang === 'NL' ? 'Standaard werkblad' : 'Standard worktop';
  }
  if (n === 'geen extra opties' || n === 'no extra options') {
    return lang === 'NL' ? 'Geen extra opties' : 'No extra options';
  }
  if (n === 'big green egg large' || n === 'big green egg' || n === 'kamado joe' || n === 'bastard' || n === 'the bastard') {
    return val;
  }
  return val;
}

// 3. Options Subtext (Walls / Floor / Foundation / Cutout position)
export function getDisplayOptionsSubtext(val, language = 'EN') {
  if (!val) return language === 'EN' ? 'Large, right of center' : 'Large, rechts van het midden';
  const n = norm(val);
  const lang = String(language).toUpperCase();

  if (n === '4-rail gehard veiligheidsglas' || n === '4-track tempered safety glass') {
    return lang === 'NL' ? '4-rail gehard veiligheidsglas' : '4-track tempered safety glass';
  }
  if (
    n === 'glazen schuifwanden (4-rail)' ||
    n === 'glazen schuifwanden (4-rail gehard glas)' ||
    n === 'glazen schuifwand (4-rail gehard glas)' ||
    n === 'glazen schuifwand 4-rail' ||
    n === 'glass sliding walls (4-track)' ||
    n === 'glass sliding walls (4-track tempered glass)' ||
    n === 'glass sliding wall 4-track'
  ) {
    return lang === 'NL' ? 'Glazen schuifwanden (4-rail)' : 'Glass sliding walls (4-track)';
  }
  if (
    n === 'glazen schuifwanden (5-rail)' ||
    n === 'glazen schuifwanden (5-rail gehard glas)' ||
    n === 'glass sliding walls (5-track)' ||
    n === 'glass sliding walls (5-track tempered glass)'
  ) {
    return lang === 'NL' ? 'Glazen schuifwanden (5-rail)' : 'Glass sliding walls (5-track)';
  }
  if (
    n === 'zweeds rabat zwarte wanden' ||
    n === 'zweeds rabat zwarte achter- en zijwanden' ||
    n === 'swedish rebate black back & side walls' ||
    n === 'swedish rebate black walls'
  ) {
    return lang === 'NL' ? 'Zweeds rabat zwarte achter- en zijwanden' : 'Swedish rebate black back & side walls';
  }
  if (
    n === 'gesloten houten wanden' ||
    n === 'volledig gesloten houten wanden' ||
    n === 'fully closed wooden walls' ||
    n === 'closed timber walls'
  ) {
    return lang === 'NL' ? 'Volledig gesloten houten wanden' : 'Fully closed wooden walls';
  }
  if (
    n === 'open constructie (geen wanden)' ||
    n === 'open overkapping (geen wanden)' ||
    n === 'open canopy (no walls)'
  ) {
    return lang === 'NL' ? 'Open overkapping (geen wanden)' : 'Open canopy (no walls)';
  }
  if (
    n === 'geen vloer (op terras)' ||
    n === 'geen vloer (plaatsing op bestaande verharding)' ||
    n === 'no floor (on terrace)' ||
    n === 'no floor (placement on existing pavement)'
  ) {
    return lang === 'NL' ? 'Geen vloer (op terras)' : 'No floor (placement on existing pavement)';
  }
  if (
    n === 'douglas vlonderterras' ||
    n === 'douglas vlonderterras (28mm geschaafd)' ||
    n === 'douglas decking (28mm planed)'
  ) {
    return lang === 'NL' ? 'Douglas vlonderterras (28mm geschaafd)' : 'Douglas decking (28mm planed)';
  }
  if (
    n === 'hardhouten vlonder' ||
    n === 'hardhouten terras (bangkirai)' ||
    n === 'hardwood decking (bangkirai)'
  ) {
    return lang === 'NL' ? 'Hardhouten terras (Bangkirai)' : 'Hardwood decking (Bangkirai)';
  }
  if (n === 'keramische buitentegels' || n === 'ceramic outdoor tiles') {
    return lang === 'NL' ? 'Keramische buitentegels' : 'Ceramic outdoor tiles';
  }
  if (
    n === 'betonpoeren met stelplaat' ||
    n === 'betonpoeren antraciet met verstelbare rvs stelplaat' ||
    n === 'concrete piers with leveling plate' ||
    n === 'concrete piers anthracite with adjustable stainless steel plate' ||
    n === 'concrete piers' ||
    n === 'betonpoeren'
  ) {
    return lang === 'NL' ? 'Betonpoeren met stelplaat' : 'Concrete piers with leveling plate';
  }
  if (
    n === 'schroeffundering' ||
    n === 'schroeffundatie (zonder graafwerk)' ||
    n === 'screw foundation (without excavation)'
  ) {
    return lang === 'NL' ? 'Schroeffundering' : 'Screw foundation (without excavation)';
  }
  if (
    n === 'gewapende betonvloer' ||
    n === 'volledig gewapende betonplaat vorstrand' ||
    n === 'fully reinforced concrete slab frost edge'
  ) {
    return lang === 'NL' ? 'Gewapende betonvloer' : 'Fully reinforced concrete slab frost edge';
  }
  if (
    n === 'bestaande fundering' ||
    n === 'bestaande fundering / terras' ||
    n === 'existing foundation / terrace'
  ) {
    return lang === 'NL' ? 'Bestaande fundering' : 'Existing foundation / terrace';
  }
  if (
    n === 'inclusief aluminium daktrim & afvoer' ||
    n === 'inclusief aluminium daktrim en hemelwaterafvoer' ||
    n === 'includes aluminum roof trim & drainage' ||
    n === 'includes aluminum roof trim and drainage'
  ) {
    return lang === 'NL' ? 'Inclusief aluminium daktrim & afvoer' : 'Includes aluminum roof trim & drainage';
  }
  if (
    n === '10mm gehard veiligheidsglas met tochtborstels' ||
    n === '10mm gehard veiligheidsglas incl. tochtborstels en aluminium geleideprofielen' ||
    n === '10mm tempered safety glass with draft brushes' ||
    n === '10mm tempered safety glass incl. draft brushes and aluminum guide profiles'
  ) {
    return lang === 'NL'
      ? '10mm gehard veiligheidsglas met tochtborstels'
      : '10mm tempered safety glass with draft brushes';
  }
  if (
    n === 'onderbalken en rvs schroeven' ||
    n === 'sub-beams and stainless steel screws'
  ) {
    return lang === 'NL' ? 'Onderbalken en rvs schroeven' : 'Sub-beams and stainless steel screws';
  }
  if (
    n === 'vorstvrij verankerd incl. snelbeton' ||
    n === 'frost-free anchored incl. fast-setting concrete'
  ) {
    return lang === 'NL' ? 'Vorstvrij verankerd incl. snelbeton' : 'Frost-free anchored incl. fast-setting concrete';
  }
  if (
    n === 'large, rechts van het midden' ||
    n === 'large, right of center'
  ) {
    return lang === 'NL' ? 'Large, rechts van het midden' : 'Large, right of center';
  }
  if (n === 'rechts van het midden' || n === 'right of center') {
    return lang === 'NL' ? 'Rechts van het midden' : 'Right of center';
  }
  if (n === 'links van het midden' || n === 'left of center') {
    return lang === 'NL' ? 'Links van het midden' : 'Left of center';
  }
  if (n === 'centraal geplaatst' || n === 'centrally placed') {
    return lang === 'NL' ? 'Centraal geplaatst' : 'Centrally placed';
  }
  if (n === 'geintegreerde keukenelementen' || n === 'integrated features') {
    return lang === 'NL' ? 'Geïntegreerde keukenelementen' : 'Integrated features';
  }
  if (n === 'ingebouwde koelkast' || n === 'built-in fridge') {
    return lang === 'NL' ? 'Ingebouwde koelkast' : 'Built-in Fridge';
  }
  if (n === 'spoelbak met kraan' || n === 'sink with tap') {
    return lang === 'NL' ? 'Spoelbak met kraan' : 'Sink with Tap';
  }
  if (n === 'koelkast' || n === 'fridge') {
    return lang === 'NL' ? 'Koelkast' : 'Fridge';
  }
  if (n === 'spoelbak' || n === 'sink') {
    return lang === 'NL' ? 'Spoelbak' : 'Sink';
  }
  return val;
}

// 4. Delivery Times
export function getDisplayDeliveryTime(val, language = 'EN') {
  if (!val) return language === 'EN' ? '3 to 5 weeks' : '3 tot 5 weken';
  const n = norm(val);
  const lang = String(language).toUpperCase();

  if (n === '3 tot 5 weken' || n === '3-5 weken' || n === '3 to 5 weeks') {
    return lang === 'NL' ? '3 tot 5 weken' : '3 to 5 weeks';
  }
  if (n === '6 tot 8 weken' || n === '6-8 weken' || n === '6 to 8 weeks') {
    return lang === 'NL' ? '6 tot 8 weken' : '6 to 8 weeks';
  }
  if (n === '8 tot 10 weken' || n === '8-10 weken' || n === '8 to 10 weeks') {
    return lang === 'NL' ? '8 tot 10 weken' : '8 to 10 weeks';
  }
  return val;
}

// 5. Delivery Subtexts
export function getDisplayDeliverySubtext(val, language = 'EN') {
  if (!val) return language === 'EN' ? 'upon drawing approval' : 'na akkoord op tekening';
  const n = norm(val);
  const lang = String(language).toUpperCase();

  if (
    n === 'na akkoord op tekening' ||
    n === 'na technisch akkoord' ||
    n === 'upon drawing approval' ||
    n === 'after technical agreement'
  ) {
    return lang === 'NL' ? 'na akkoord op tekening' : 'upon drawing approval';
  }
  if (n === 'na akkoord op bouwtekening' || n === 'upon blueprint approval') {
    return lang === 'NL' ? 'na akkoord op bouwtekening' : 'upon blueprint approval';
  }
  return val;
}

// 6. Dimensions Units
export function getDisplayDimensionsUnit(val, language = 'EN') {
  if (!val) return language === 'EN' ? 'centimeters' : 'centimeter';
  const n = norm(val);
  const lang = String(language).toUpperCase();

  if (n === 'centimeter' || n === 'centimeters') {
    return lang === 'NL' ? 'centimeter' : 'centimeters';
  }
  if (n === 'centimeter (lxb)' || n === 'centimeters (lxw)') {
    return lang === 'NL' ? 'centimeter (LxB)' : 'centimeters (LxW)';
  }
  if (n === 'meter (lxb)' || n === 'meters (lxw)') {
    return lang === 'NL' ? 'meter (LxB)' : 'meters (LxW)';
  }
  if (n === 'meter' || n === 'meters') {
    return lang === 'NL' ? 'meter' : 'meters';
  }
  return val;
}

// 7. Lifespan
export function getDisplayLifespan(val, language = 'EN') {
  if (!val) return language === 'EN' ? '20 to 25 years' : '20 tot 25 jaar';
  const n = norm(val);
  const lang = String(language).toUpperCase();

  if (n === '10 tot 15 jaar' || n === '10 to 15 years') {
    return lang === 'NL' ? '10 tot 15 jaar' : '10 to 15 years';
  }
  if (n === '15 tot 20 jaar' || n === '15 to 20 years') {
    return lang === 'NL' ? '15 tot 20 jaar' : '15 to 20 years';
  }
  if (n === '20 tot 25 jaar' || n === '20 to 25 years') {
    return lang === 'NL' ? '20 tot 25 jaar' : '20 to 25 years';
  }
  return val;
}

// 8. Cover Titles (Line 1 & Line 2)
export function getDisplayCoverTitle(raw1, raw2, isGardenRoom = false, language = 'EN') {
  const lang = String(language).toUpperCase();
  const n1 = norm(raw1);
  const n2 = norm(raw2);

  let titleLine1 = raw1;
  let titleLine2 = raw2;

  if (lang === 'NL') {
    if (n1 === 'your outdoor kitchen,' || n1 === 'uw buitenkeuken,') {
      titleLine1 = 'Uw buitenkeuken,';
    } else if (n1 === 'your garden room,' || n1 === 'your bespoke garden room,' || n1 === 'uw exclusief buitenverblijf,') {
      titleLine1 = 'Uw exclusief buitenverblijf,';
    } else if (isGardenRoom && !raw1) {
      titleLine1 = 'Uw exclusief buitenverblijf,';
    } else if (!raw1) {
      titleLine1 = 'Uw buitenkeuken,';
    }

    if (n2 === 'custom crafted.' || n2 === 'op maat gemaakt.') {
      titleLine2 = 'op maat gemaakt.';
    } else if (n2 === 'exclusively designed.' || n2 === 'exclusief ontworpen.') {
      titleLine2 = 'exclusief ontworpen.';
    }
  } else {
    // EN
    if (n1 === 'uw buitenkeuken,' || n1 === 'your outdoor kitchen,') {
      titleLine1 = 'Your outdoor kitchen,';
    } else if (n1 === 'uw exclusief buitenverblijf,' || n1 === 'your bespoke garden room,' || n1 === 'your garden room,') {
      titleLine1 = 'Your garden room,';
    } else if (isGardenRoom && !raw1) {
      titleLine1 = 'Your garden room,';
    } else if (!raw1) {
      titleLine1 = 'Your outdoor kitchen,';
    }

    if (n2 === 'op maat gemaakt.' || n2 === 'custom crafted.') {
      titleLine2 = 'custom crafted.';
    } else if (n2 === 'exclusief ontworpen.' || n2 === 'exclusively designed.') {
      titleLine2 = 'exclusively designed.';
    }
  }

  return { titleLine1, titleLine2 };
}

// 9. Cover Subtitle Generator
export function getDisplayCoverSubtitle(wood, dim, opt, language = 'EN') {
  const displayWood = getDisplayWoodType(wood, language);
  const cleanDim = String(dim || '240 × 80').replace(/\s*cm$/i, '').trim();
  const displayOpt = getDisplayOptionsTitle(opt, language);
  return `${displayWood} · ${cleanDim} cm · ${displayOpt}`;
}

// 10. Specification Section Titles
export function getDisplaySpecTitle(title, language = 'EN') {
  if (!title) return '';
  const n = norm(title);
  const lang = String(language).toUpperCase();

  if (n === 'bovenblad' || n === 'worktop') return lang === 'NL' ? 'BOVENBLAD' : 'WORKTOP';
  if (n === 'indeling & opbergruimte' || n === 'layout & storage') return lang === 'NL' ? 'INDELING & OPBERGRUIMTE' : 'LAYOUT & STORAGE';
  if (n === 'afwerking & mobiliteit' || n === 'finish & mobility') return lang === 'NL' ? 'AFWERKING & MOBILITEIT' : 'FINISH & MOBILITY';
  if (n === 'bezorging' || n === 'delivery') return lang === 'NL' ? 'BEZORGING' : 'DELIVERY';
  if (n === 'dakconstructie' || n === 'roof construction') return lang === 'NL' ? 'DAKCONSTRUCTIE' : 'ROOF CONSTRUCTION';
  if (n === 'constructie & wanden' || n === 'construction & walls') return lang === 'NL' ? 'CONSTRUCTIE & WANDEN' : 'CONSTRUCTION & WALLS';
  if (n === 'glaswanden & afwerking' || n === 'glass walls & finish') return lang === 'NL' ? 'GLASWANDEN & AFWERKING' : 'GLASS WALLS & FINISH';
  if (n === 'levering & montage' || n === 'delivery & installation') return lang === 'NL' ? 'LEVERING & MONTAGE' : 'DELIVERY & INSTALLATION';
  if (n === 'nieuwe sectie' || n === 'new section') return lang === 'NL' ? 'NIEUWE SECTIE' : 'NEW SECTION';
  return title;
}

// 11. Specification Line Text
export function getDisplaySpecText(text, language = 'EN') {
  if (!text) return '';
  const n = norm(text);
  const lang = String(language).toUpperCase();

  // Ceramic stones
  if (
    n.includes('keramische stenen in het werkblad') ||
    n.includes('ceramic stones in worktop')
  ) {
    return lang === 'NL'
      ? 'Keramische stenen in het werkblad – hittebestendig en onderhoudsarm'
      : 'Ceramic stones in worktop – heat-resistant and low maintenance';
  }

  // BBQ Cutout
  if (n.startsWith('uitsparing op maat voor') || n.startsWith('custom cutout engineered for')) {
    const brand = text.replace(/^(uitsparing op maat voor|custom cutout engineered for)\s*/i, '');
    return lang === 'NL'
      ? `Uitsparing op maat voor ${brand}`
      : `Custom cutout engineered for ${brand}`;
  }

  // Storage
  if (
    n.includes('twee ruime opbergvakken met deurtjes') ||
    n.includes('two spacious storage compartments')
  ) {
    return lang === 'NL'
      ? 'Twee ruime opbergvakken met deurtjes en soft-close scharnieren'
      : 'Two spacious storage compartments with doors and soft-close hinges';
  }

  // Open shelf
  if (n.includes('open schap voor houtopslag') || n.includes('open shelf for wood storage')) {
    return lang === 'NL' ? 'Open schap voor houtopslag' : 'Open shelf for wood storage';
  }

  // Oil finish
  if (n.includes('olieafwerking in twee lagen') || n.includes('two-layer protective oil finish')) {
    return lang === 'NL' ? 'Olieafwerking in twee lagen (naturel)' : 'Two-layer protective oil finish (natural)';
  }

  // Swivel castors
  if (
    n.includes('verborgen heavy-duty zwenkwielen') ||
    n.includes('hidden heavy-duty swivel castors')
  ) {
    return lang === 'NL'
      ? 'Verborgen heavy-duty zwenkwielen voor eenvoudige verplaatsing'
      : 'Hidden heavy-duty swivel castors for easy mobility';
  }

  // Delivery
  if (
    n.includes('gratis bezorgd op een moment dat jou uitkomt') ||
    n.includes('free delivery scheduled at your convenience')
  ) {
    return lang === 'NL'
      ? 'Gratis bezorgd op een moment dat jou uitkomt'
      : 'Free delivery scheduled at your convenience';
  }
  if (
    n.includes('gratis bezorgd in') ||
    n.includes('free delivery in')
  ) {
    const cityMatch = text.match(/in\s+([a-zA-Z\s]+),/i);
    const city = cityMatch ? cityMatch[1].trim() : 'jouw regio';
    return lang === 'NL'
      ? `Gratis bezorgd in ${city}, op een moment dat jou uitkomt`
      : `Free delivery in ${city}, scheduled at your convenience`;
  }

  // Garden room lines
  if (
    n.includes('plat dak voorzien van hoogwaardige epdm') ||
    n.includes('flat roof equipped with high-grade epdm')
  ) {
    return lang === 'NL'
      ? 'Plat dak voorzien van hoogwaardige EPDM dakbedekking en aluminium daktrim'
      : 'Flat roof equipped with high-grade EPDM roofing and aluminum roof trim';
  }
  if (
    n.includes('zware douglas balklaag') ||
    n.includes('heavy douglas beam layer')
  ) {
    return lang === 'NL'
      ? 'Zware Douglas balklaag (75 × 200 mm) en vellingdelen dakbeschot'
      : 'Heavy Douglas beam layer (75 × 200 mm) and tongue-and-groove roof boarding';
  }
  if (
    n.includes('robuuste staanders van 150') ||
    n.includes('robust 150 x 150 mm planed douglas posts') ||
    n.includes('robust 150 × 150 mm planed douglas posts')
  ) {
    return lang === 'NL'
      ? 'Robuuste staanders van 150 × 150 mm geschaafd Douglas'
      : 'Robust 150 × 150 mm planed Douglas posts';
  }
  if (
    n.includes('zweeds rabat zwarte achter- en zijwanden') ||
    n.includes('swedish rebate black back and side walls')
  ) {
    return lang === 'NL'
      ? 'Zweeds rabat zwarte achter- en zijwanden voor optimale privacy'
      : 'Swedish rebate black back and side walls for optimal privacy';
  }
  if (
    n.includes('luxe 4-rail glazen schuifwandsysteem') ||
    n.includes('luxury 4-track glass sliding wall system')
  ) {
    return lang === 'NL'
      ? 'Luxe 4-rail glazen schuifwandsysteem van 10 mm gehard veiligheidsglas'
      : 'Luxury 4-track glass sliding wall system with 10 mm tempered safety glass';
  }
  if (
    n.includes('betonpoeren met stelplaat voor solide') ||
    n.includes('concrete piers with leveling plate for solid')
  ) {
    return lang === 'NL'
      ? 'Betonpoeren met stelplaat voor solide vorstvrije fundering'
      : 'Concrete piers with leveling plate for solid frost-free foundation';
  }
  if (
    n.includes('prefab voorbereiding in werkplaats') ||
    n.includes('prefab preparation in workshop')
  ) {
    return lang === 'NL'
      ? 'Prefab voorbereiding in werkplaats en vakkundige montage op locatie'
      : 'Prefab preparation in workshop and professional on-site installation';
  }
  if (n === 'nieuwe specificatie regel' || n === 'new specification line') {
    return lang === 'NL' ? 'Nieuwe specificatie regel' : 'New specification line';
  }

  return text;
}

// 12. Infobox Title & Text
export function getDisplayInfoboxTitle(title, language = 'EN', woodName = '') {
  const lang = String(language).toUpperCase();
  const w = woodName ? getDisplayWoodType(woodName, language) : '';
  const n = norm(title);

  if (n === 'over thermo frake' || n === 'about thermo frake') {
    return lang === 'NL' ? 'Over Thermo Fraké' : 'About Thermo Fraké';
  }
  if (
    n === 'over douglas hout' ||
    n === 'over douglas' ||
    n === 'about douglas wood' ||
    n === 'about douglas'
  ) {
    return lang === 'NL' ? 'Over Douglas Hout' : 'About Douglas Wood';
  }
  if (n === 'over padouk' || n === 'about padouk') {
    return lang === 'NL' ? 'Over Padouk' : 'About Padouk';
  }
  if (n === 'over eiken' || n === 'over eikenhout' || n === 'about oak') {
    return lang === 'NL' ? 'Over Eikenhout' : 'About Oak';
  }
  if (w) {
    return lang === 'NL' ? `Over ${w}` : `About ${w}`;
  }
  if (n.startsWith('over ')) {
    const rawW = title.slice(5).trim();
    return lang === 'NL' ? title : `About ${getDisplayWoodType(rawW, 'EN')}`;
  }
  if (n.startsWith('about ')) {
    const rawW = title.slice(6).trim();
    return lang === 'NL' ? `Over ${getDisplayWoodType(rawW, 'NL')}` : title;
  }
  return title || (lang === 'NL' ? 'Over Houtsoort' : 'About Wood Type');
}

export function getDisplayInfoboxText(text, language = 'EN', woodName = '') {
  const lang = String(language).toUpperCase();
  const n = norm(text);
  const wNorm = norm(woodName);

  if (
    wNorm === 'thermo frake' ||
    n.includes('thermisch behandeld frake') ||
    n.includes('thermally treated frake')
  ) {
    return lang === 'NL'
      ? 'Thermisch behandeld Fraké: vormstabiel, duurzaam en met een warme, diepe kleur. Gaat 20 tot 25 jaar mee en veroudert prachtig grijs.'
      : 'Thermally treated Fraké: dimensionally stable, durable, with a warm, deep color. Lasts 20 to 25 years and ages gracefully into silver-grey.';
  }
  if (
    wNorm.includes('douglas') ||
    n.includes('douglas hout is een van de hardste') ||
    n.includes('douglas wood is one of the hardest') ||
    n.includes('douglas hout biedt een warme') ||
    n.includes('douglas wood offers a warm')
  ) {
    return lang === 'NL'
      ? 'Douglas hout is een van de hardste en meest duurzame Europese naaldhoutsoorten. Onbehandeld heeft het een levensduur van 10 tot 15 jaar, behandeld tot meer dan 20 jaar.'
      : 'Douglas wood is one of the hardest and most durable European softwoods. Untreated it has a lifespan of 10 to 15 years, treated more than 20 years.';
  }
  if (
    wNorm === 'padouk' ||
    n.includes('padouk is een van de meest stabiele') ||
    n.includes('padouk is one of the most stable')
  ) {
    return lang === 'NL'
      ? 'Padouk is een van de meest stabiele houtsoorten ter wereld. Koraalrood bij verwerking, snel vergrijzend naar warm zilvergrijs.'
      : 'Padouk is one of the most stable timber species globally. Coral red when processed, rapidly weathering to a warm silver-grey.';
  }
  return text;
}

// 13. Line Items Title & Description
export function getDisplayLineItemTitle(title, language = 'EN') {
  if (!title) return '';
  const lang = String(language).toUpperCase();
  const n = norm(title);

  // Outdoor kitchen
  if (n.startsWith('buitenkeuken ') || n.startsWith('outdoor kitchen ')) {
    const after = title.replace(/^(buitenkeuken|outdoor kitchen)\s*/i, '');
    const prefix = lang === 'NL' ? 'Buitenkeuken' : 'Outdoor Kitchen';
    return `${prefix} ${after}`;
  }

  // Garden Room
  if (
    n.includes('maatwerk buitenverblijf / garden room') ||
    n.includes('custom garden room') ||
    n.includes('tuinkamer')
  ) {
    const dimMatch = title.match(/\d+\s*[×x]\s*\d+\s*cm/i);
    const dimStr = dimMatch ? ` ${dimMatch[0]}` : '';
    return lang === 'NL'
      ? `Maatwerk Buitenverblijf / Garden Room${dimStr}`
      : `Custom Garden Room${dimStr}`;
  }

  // Glass sliding walls
  if (
    n.includes('glazen schuifwandsysteem (4-rail)') ||
    n.includes('glass sliding wall system (4-track)')
  ) {
    return lang === 'NL'
      ? 'Glazen Schuifwandsysteem (4-rail)'
      : 'Glass Sliding Wall System (4-track)';
  }
  if (
    n.includes('glazen schuifwandsysteem (5-rail)') ||
    n.includes('glass sliding wall system (5-track)')
  ) {
    return lang === 'NL'
      ? 'Glazen Schuifwandsysteem (5-rail)'
      : 'Glass Sliding Wall System (5-track)';
  }

  // Delivery & Installation
  if (
    n.includes('levering en vakkundige montage') ||
    n.includes('bezorging en vakkundige montage') ||
    n.includes('delivery and professional installation') ||
    n.includes('delivery & professional on-site placement') ||
    n.includes('bezorging en plaatsing op locatie')
  ) {
    return lang === 'NL'
      ? 'Levering en Vakkundige Montage op locatie'
      : 'Delivery and Professional On-Site Installation';
  }

  // Preset library items
  if (
    n === 'solid teak wood outdoor kitchen cabinet (300x90cm)' ||
    n === 'massief teakhouten buitenkeuken meubel (300x90cm)'
  ) {
    return lang === 'NL'
      ? 'Massief Teakhouten Buitenkeuken Meubel (300x90cm)'
      : 'Solid Teak Wood Outdoor Kitchen Cabinet (300x90cm)';
  }
  if (
    n === 'big green egg large cutout & base support' ||
    n === 'big green egg large uitsparing & onderstel'
  ) {
    return lang === 'NL'
      ? 'Big Green Egg Large Uitsparing & Onderstel'
      : 'Big Green Egg Large Cutout & Base Support';
  }
  if (
    n === 'built-in stainless steel outdoor fridge premium 80l' ||
    n === 'inbouw rvs buitenkoelkast premium 80l'
  ) {
    return lang === 'NL'
      ? 'Inbouw RVS Buitenkoelkast Premium 80L'
      : 'Built-in Stainless Steel Outdoor Fridge Premium 80L';
  }
  if (
    n === 'stainless steel sink & mixer tap built-in kit' ||
    n === 'rvs spoelbak & mengkraan inbouwset'
  ) {
    return lang === 'NL'
      ? 'RVS Spoelbak & Mengkraan Inbouwset'
      : 'Stainless Steel Sink & Mixer Tap Built-in Kit';
  }

  return title;
}

export function getDisplayLineItemDesc(desc, language = 'EN') {
  if (!desc) return '';
  const lang = String(language).toUpperCase();
  const n = norm(desc);

  // Outdoor kitchen
  if (
    n.includes('houten bovenblad met keramische stenen') ||
    n.includes('wooden worktop with ceramic stones')
  ) {
    return lang === 'NL'
      ? 'Houten bovenblad met keramische stenen en uitsparing voor Big Green Egg Large, afgewerkt met twee lagen olie (naturel)'
      : 'Wooden worktop with ceramic stones and cutout for Big Green Egg Large, finished with two layers of natural oil';
  }

  // Garden room
  if (
    n.includes('robuuste douglas staanders') ||
    n.includes('robust douglas posts')
  ) {
    return lang === 'NL'
      ? 'Robuuste Douglas staanders (150x150mm), EPDM dakbedekking met daktrim en zwarte rabatwanden'
      : 'Robust Douglas posts (150x150mm), EPDM roofing with roof trim and black rebate walls';
  }

  // Sliding walls
  if (
    n.includes('10mm gehard veiligheidsglas incl. tochtborstels') ||
    n.includes('10mm tempered safety glass incl. draft brushes')
  ) {
    return lang === 'NL'
      ? '10mm gehard veiligheidsglas incl. tochtborstels en aluminium geleideprofielen'
      : '10mm tempered safety glass incl. draft brushes and aluminum guide profiles';
  }

  // Installation
  if (
    n.includes('inclusief stelpoeren, professionele plaatsing') ||
    n.includes('including concrete piers, professional installation') ||
    n.includes('geleverd en vakkundig opgesteld op uw terras') ||
    n.includes('delivered and professionally set up on your terrace')
  ) {
    return lang === 'NL'
      ? 'Inclusief stelpoeren, professionele plaatsing en waterpas oplevering'
      : 'Including concrete piers, professional installation and level delivery';
  }

  return desc;
}

// 14. Salutation
export function getDisplaySalutation(salutation, firstName = '', language = 'EN') {
  const lang = String(language).toUpperCase();
  const name = firstName || 'Klant';
  if (!salutation) {
    return lang === 'NL' ? `Beste ${name},` : `Dear ${firstName || 'Customer'},`;
  }
  const n = norm(salutation);
  if (n.startsWith('beste ')) {
    const cust = salutation.replace(/^beste\s*/i, '').trim();
    return lang === 'NL' ? `Beste ${cust}` : `Dear ${cust}`;
  }
  if (n.startsWith('dear ')) {
    const cust = salutation.replace(/^dear\s*/i, '').trim();
    return lang === 'NL' ? `Beste ${cust}` : `Dear ${cust}`;
  }
  return salutation;
}

