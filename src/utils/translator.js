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
  'Outdoor Living': { EN: 'Garden Room', NL: 'Buitenverblijf' },
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
