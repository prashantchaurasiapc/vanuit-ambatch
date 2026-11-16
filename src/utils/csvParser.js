/**
 * RFC 4180 compliant CSV Parser with Automatic Delimiter Detection
 * & Intelligent Header Mapping for Vanuit Ambacht CRM
 */

// Detect whether CSV uses semicolon, comma, or tab
export function detectDelimiter(headerLine) {
  const clean = headerLine.replace(/^[\uFEFF]/, '');
  const semicolonCount = (clean.match(/;/g) || []).length;
  const commaCount = (clean.match(/,/g) || []).length;
  const tabCount = (clean.match(/\t/g) || []).length;

  if (tabCount > semicolonCount && tabCount > commaCount) return '\t';
  if (semicolonCount >= commaCount) return ';';
  return ',';
}

// Parse CSV text respecting quotes, escaped quotes, and newlines
export function parseCSVLines(text, delimiter) {
  const result = [];
  let row = [];
  let inQuotes = false;
  let currentToken = '';

  const cleanText = text.replace(/^[\uFEFF]/, '');

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentToken += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      row.push(currentToken.trim());
      currentToken = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // handle CRLF
      }
      row.push(currentToken.trim());
      currentToken = '';
      if (row.length > 0 && row.some(col => col.length > 0)) {
        result.push(row);
      }
      row = [];
    } else {
      currentToken += char;
    }
  }

  // Push final row if text didn't end with a newline
  if (currentToken.length > 0 || row.length > 0) {
    row.push(currentToken.trim());
    if (row.length > 0 && row.some(col => col.length > 0)) {
      result.push(row);
    }
  }

  return result;
}

// Normalize column header keys
function normalizeHeaderKey(header) {
  return String(header || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

// Map product text in Dutch or English to backend enum
export function normalizeProductType(val) {
  if (!val) return 'outdoor_kitchen';
  const lower = String(val).toLowerCase();
  if (lower.includes('buitenverblijf') || lower.includes('garden') || lower.includes('tuinkamer') || lower.includes('poolhouse')) {
    return 'garden_room';
  }
  if (lower.includes('overkapping') || lower.includes('canopy') || lower.includes('pergola') || lower.includes('veranda')) {
    return 'canopy';
  }
  if (lower.includes('kliko') || lower.includes('bin') || lower.includes('storage') || lower.includes('snijplank')) {
    return 'bin_storage';
  }
  return 'outdoor_kitchen';
}

// Map status text in Dutch or English to backend enum
export function normalizeLeadStatus(val) {
  if (!val) return 'new';
  const lower = String(val).toLowerCase().replace(/[\s-]+/g, '_');
  if (lower.includes('gesprek') || lower.includes('conversation') || lower.includes('contact')) {
    return 'in_conversation';
  }
  if (lower.includes('prijsaanvraag') || lower.includes('price_requested') || lower.includes('aanvraag')) {
    return 'price_requested';
  }
  if (lower.includes('ontvangen') || lower.includes('price_received') || lower.includes('prijs')) {
    return 'price_received';
  }
  if (lower.includes('offerte') || lower.includes('quote_sent') || lower.includes('verstuurd')) {
    return 'quote_sent';
  }
  if (lower.includes('gewonnen') || lower.includes('won') || lower.includes('order')) {
    return 'won';
  }
  if (lower.includes('verloren') || lower.includes('lost')) {
    return 'lost';
  }
  return 'new';
}

// Clean and sanitize string: removes dashes or placeholder values
function sanitizeString(val) {
  if (!val) return null;
  const trimmed = String(val).trim();
  if (!trimmed || trimmed === '-' || trimmed.toLowerCase() === 'n/a' || trimmed.toLowerCase() === 'null') {
    return null;
  }
  return trimmed;
}

// Main parser function: Converts raw CSV text into array of backend-ready lead objects
export function parseAndNormalizeLeadsCSV(rawText) {
  if (!rawText || !rawText.trim()) {
    return { leads: [], errors: ['CSV file is empty.'] };
  }

  const firstLine = rawText.split(/\r?\n/)[0] || '';
  const delimiter = detectDelimiter(firstLine);
  const rows = parseCSVLines(rawText, delimiter);

  if (rows.length < 2) {
    return { leads: [], errors: ['CSV file contains no data rows.'] };
  }

  const rawHeaders = rows[0];
  const headerMap = {};

  rawHeaders.forEach((h, idx) => {
    const key = normalizeHeaderKey(h);
    if (['naam', 'name', 'fullname', 'volledigenaam', 'klant', 'customer', 'contact'].includes(key)) {
      headerMap.name = idx;
    } else if (['telefoon', 'phone', 'telefoonnummer', 'mobiel', 'gsm', 'tel'].includes(key)) {
      headerMap.phone = idx;
    } else if (['email', 'emailadres', 'mail'].includes(key)) {
      headerMap.email = idx;
    } else if (['product', 'producttype', 'type', 'categorie', 'category'].includes(key)) {
      headerMap.productType = idx;
    } else if (['gewenstemaat', 'maat', 'afmetingen', 'dimensions', 'size'].includes(key)) {
      headerMap.dimensions = idx;
    } else if (['bron', 'source', 'origin', 'kanaal'].includes(key)) {
      headerMap.source = idx;
    } else if (['status', 'fase', 'stage'].includes(key)) {
      headerMap.status = idx;
    } else if (['adres', 'address', 'straat'].includes(key)) {
      headerMap.address = idx;
    } else if (['plaats', 'stad', 'city', 'woonplaats'].includes(key)) {
      headerMap.city = idx;
    } else if (['notities', 'opmerkingen', 'notes', 'opmerking'].includes(key)) {
      headerMap.notes = idx;
    }
  });

  // Fallback if standard headers weren't named: Use exported order [0=ID, 1=Naam, 2=Tel, 3=Email, 4=Product, 5=Maat, 6=Bron, 7=Status]
  if (headerMap.name === undefined) {
    headerMap.name = rows[0].length > 1 ? 1 : 0;
  }
  if (headerMap.phone === undefined && rows[0].length > 2) headerMap.phone = 2;
  if (headerMap.email === undefined && rows[0].length > 3) headerMap.email = 3;
  if (headerMap.productType === undefined && rows[0].length > 4) headerMap.productType = 4;
  if (headerMap.dimensions === undefined && rows[0].length > 5) headerMap.dimensions = 5;
  if (headerMap.source === undefined && rows[0].length > 6) headerMap.source = 6;
  if (headerMap.status === undefined && rows[0].length > 7) headerMap.status = 7;

  const leads = [];
  const errors = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 0 || row.every(c => !c)) continue;

    const rawName = sanitizeString(row[headerMap.name]);
    const rawEmail = sanitizeString(row[headerMap.email]);
    const rawPhone = sanitizeString(row[headerMap.phone]);
    const rawProduct = sanitizeString(row[headerMap.productType]);
    const rawDimensions = sanitizeString(row[headerMap.dimensions]);
    const rawSource = sanitizeString(row[headerMap.source]);
    const rawStatus = sanitizeString(row[headerMap.status]);
    const rawAddress = sanitizeString(row[headerMap.address]);
    const rawCity = sanitizeString(row[headerMap.city]);
    const rawNotes = sanitizeString(row[headerMap.notes]);

    // Validation: skip rows with zero identifying information
    if (!rawName && !rawEmail && !rawPhone) {
      errors.push(`Row ${i + 1}: Skipped empty row`);
      continue;
    }

    // Email sanity check: must include @ to be valid
    const cleanEmail = rawEmail && rawEmail.includes('@') ? rawEmail.toLowerCase().trim() : null;

    leads.push({
      name: rawName || cleanEmail?.split('@')[0] || `Lead (Imported ${i})`,
      phone: rawPhone,
      email: cleanEmail,
      address: rawAddress,
      city: rawCity,
      productType: normalizeProductType(rawProduct),
      dimensionsInquiry: rawDimensions,
      source: rawSource || 'CSV Import',
      status: normalizeLeadStatus(rawStatus),
      notes: rawNotes,
    });
  }

  return {
    leads,
    errors,
    delimiterUsed: delimiter,
    totalRows: rows.length - 1,
  };
}
