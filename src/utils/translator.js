// Central Pure Translation Utility Helper
// Maps hardcoded database/mockData strings to 100% Pure English and Pure Dutch

const DICTIONARY = {
  // Statuses
  'Nieuw': { EN: 'New', NL: 'Nieuw' },
  'New': { EN: 'New', NL: 'Nieuw' },
  'In gesprek': { EN: 'In Conversation', NL: 'In gesprek' },
  'In Conversation': { EN: 'In Conversation', NL: 'In gesprek' },
  'Bericht verstuurd': { EN: 'Message Sent', NL: 'Bericht verstuurd' },
  'Message Sent': { EN: 'Message Sent', NL: 'Bericht verstuurd' },
  'Offerte verstuurd': { EN: 'Quote Sent', NL: 'Offerte verstuurd' },
  'Quote Sent': { EN: 'Quote Sent', NL: 'Offerte verstuurd' },
  'Gewonnen': { EN: 'Won', NL: 'Gewonnen' },
  'Won': { EN: 'Won', NL: 'Gewonnen' },
  'Verloren': { EN: 'Lost', NL: 'Verloren' },
  'Lost': { EN: 'Lost', NL: 'Verloren' },
  'Actief': { EN: 'Active', NL: 'Actief' },
  'Active': { EN: 'Active', NL: 'Actief' },
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

  // Product Categories
  'buitenkeuken': { EN: 'Outdoor Kitchen', NL: 'Buitenkeuken' },
  'Buitenkeuken': { EN: 'Outdoor Kitchen', NL: 'Buitenkeuken' },
  'Outdoor Kitchen': { EN: 'Outdoor Kitchen', NL: 'Buitenkeuken' },
  'overkapping': { EN: 'Canopy', NL: 'Overkapping' },
  'Overkapping': { EN: 'Canopy', NL: 'Overkapping' },
  'Canopy': { EN: 'Canopy', NL: 'Overkapping' },
  'poolhouse': { EN: 'Poolhouse', NL: 'Poolhouse' },
  'Poolhouse': { EN: 'Poolhouse', NL: 'Poolhouse' },
  'kliko': { EN: 'Bin Storage', NL: 'Kliko-ombouw' },
  'Kliko-ombouw': { EN: 'Bin Storage', NL: 'Kliko-ombouw' },
  'Bin Storage': { EN: 'Bin Storage', NL: 'Kliko-ombouw' },
  'buitenverblijf': { EN: 'Outdoor Living', NL: 'Buitenverblijf' },
  'Buitenverblijf': { EN: 'Outdoor Living', NL: 'Buitenverblijf' },
  'Outdoor Living': { EN: 'Outdoor Living', NL: 'Buitenverblijf' },
  'terras': { EN: 'Terrace & Decking', NL: 'Terrassen' },
  'Terrassen': { EN: 'Terrace & Decking', NL: 'Terrassen' },

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
